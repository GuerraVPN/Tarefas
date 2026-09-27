CREATE OR REPLACE FUNCTION public.register_partial_payment(
  p_loan_id uuid,
  p_user_id uuid,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ln public.loans%rowtype;
  item record;
  amount_left numeric := round(coalesce(p_amount,0), 2);
  before_balance numeric := 0;
  after_balance numeric := 0;
  applied numeric := 0;
  paid_total numeric := 0;
  final_status text;
  total_recorded numeric := 0;
BEGIN
  IF amount_left <= 0 THEN RAISE EXCEPTION 'partial_payment_amount_invalid'; END IF;

  SELECT * INTO ln
    FROM public.loans
   WHERE id = p_loan_id AND user_id = p_user_id
   FOR UPDATE;

  IF ln.id IS NULL THEN RAISE EXCEPTION 'loan_not_found'; END IF;
  IF ln.status NOT IN ('active','late') THEN RAISE EXCEPTION 'loan_not_payment_eligible'; END IF;

  SELECT COALESCE(SUM(GREATEST(amount_due - amount_paid, 0)), 0)
    INTO before_balance
    FROM public.installments
   WHERE loan_id = p_loan_id;

  before_balance := round(before_balance, 2);
  IF before_balance <= 0 THEN RAISE EXCEPTION 'loan_already_paid'; END IF;
  IF amount_left >= before_balance THEN
    RAISE EXCEPTION 'amount_is_full_payoff_use_early_payoff';
  END IF;

  FOR item IN
    SELECT id, amount_due, amount_paid, status
      FROM public.installments
     WHERE loan_id = p_loan_id
       AND GREATEST(amount_due - amount_paid, 0) > 0
     ORDER BY due_date ASC, installment_number ASC
     FOR UPDATE
  LOOP
    EXIT WHEN amount_left <= 0;
    applied := LEAST(amount_left, GREATEST(item.amount_due - item.amount_paid, 0));

    IF applied > 0 THEN
      UPDATE public.installments
         SET amount_paid = round(amount_paid + applied, 2),
             status = CASE
               WHEN round(amount_paid + applied, 2) >= amount_due THEN 'paid'
               ELSE status
             END,
             paid_at = CASE
               WHEN round(amount_paid + applied, 2) >= amount_due THEN now()
               ELSE paid_at
             END
       WHERE id = item.id;

      INSERT INTO public.ledger_entries(
        user_id, loan_id, installment_id, direction, entry_type, amount,
        status, external_reference, recorded_by
      )
      VALUES (
        p_user_id, p_loan_id, item.id, 'inflow', 'installment_payment',
        round(applied, 2), 'confirmed',
        'partial-payment-' || p_loan_id::text || '-' || gen_random_uuid()::text,
        p_user_id
      );

      paid_total := round(paid_total + applied, 2);
      amount_left := round(amount_left - applied, 2);
    END IF;
  END LOOP;

  SELECT COALESCE(SUM(GREATEST(amount_due - amount_paid, 0)), 0),
         COALESCE(SUM(amount_paid), 0)
    INTO after_balance, total_recorded
    FROM public.installments
   WHERE loan_id = p_loan_id;

  after_balance := round(after_balance, 2);
  total_recorded := round(total_recorded, 2);

  IF after_balance <= 0 THEN
    final_status := 'paid';
    UPDATE public.loans
       SET status = 'paid',
           closed_at = COALESCE(closed_at, now()),
           settlement_amount = total_recorded,
           settlement_type = 'installments_paid',
           updated_at = now()
     WHERE id = p_loan_id;
  ELSE
    final_status := ln.status;
    UPDATE public.loans SET updated_at = now() WHERE id = p_loan_id;
  END IF;

  INSERT INTO public.audit_log(actor_user_id, action, entity_type, entity_id, details)
  VALUES (
    p_user_id, 'partial_payment_recorded', 'loan', p_loan_id,
    jsonb_build_object(
      'amount', paid_total,
      'balance_before', before_balance,
      'balance_after', after_balance,
      'loan_status', final_status
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'loanId', p_loan_id,
    'recordedAmount', paid_total,
    'balanceBefore', before_balance,
    'remainingAmount', after_balance,
    'loanStatus', final_status
  );
END;
$function$;
