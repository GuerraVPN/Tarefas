alter table public.early_payment_requests
  add column if not exists payment_type text not null default 'full'
  check (payment_type in ('full','partial'));

create or replace function public.confirm_early_payment(
  p_request_id uuid,
  p_admin_id uuid,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  req public.early_payment_requests%rowtype;
  ln public.loans%rowtype;
  item record;
  amount_left numeric := 0;
  applied numeric := 0;
  paid_total numeric := 0;
  remaining numeric := 0;
  total_paid numeric := 0;
  now_ts timestamptz := now();
  new_status text;
begin
  select * into req from public.early_payment_requests where id=p_request_id for update;
  if req.id is null then raise exception 'early_payment_request_not_found'; end if;
  if req.status <> 'pending' then raise exception 'early_payment_request_not_pending'; end if;

  select * into ln from public.loans where id=req.loan_id for update;
  if ln.id is null then raise exception 'loan_not_found'; end if;
  if ln.status not in ('active','late') then raise exception 'loan_not_payoff_eligible'; end if;

  if coalesce(req.payment_type,'full')='partial' then
    amount_left := round(req.payoff_amount,2);
    if amount_left <= 0 then raise exception 'partial_payment_amount_invalid'; end if;

    select coalesce(sum(greatest(amount_due-amount_paid,0)),0)
      into remaining from public.installments where loan_id=req.loan_id;
    remaining := round(remaining,2);

    if amount_left >= remaining then
      raise exception 'partial_request_cannot_be_full_payoff';
    end if;

    for item in
      select id, amount_due, amount_paid
        from public.installments
       where loan_id=req.loan_id
         and greatest(amount_due-amount_paid,0)>0
       order by due_date asc, installment_number asc
       for update
    loop
      exit when amount_left<=0;
      applied := least(amount_left, greatest(item.amount_due-item.amount_paid,0));
      if applied>0 then
        update public.installments
           set amount_paid=round(amount_paid+applied,2),
               status=case when round(amount_paid+applied,2)>=amount_due then 'paid' else status end,
               paid_at=case when round(amount_paid+applied,2)>=amount_due then now_ts else paid_at end
         where id=item.id;

        insert into public.ledger_entries(
          user_id,loan_id,installment_id,direction,entry_type,amount,status,
          external_reference,recorded_by
        ) values (
          req.user_id,req.loan_id,item.id,'inflow','installment_payment',
          round(applied,2),'confirmed','early-partial-'||req.id::text,p_admin_id
        );

        paid_total:=round(paid_total+applied,2);
        amount_left:=round(amount_left-applied,2);
      end if;
    end loop;

    select coalesce(sum(greatest(amount_due-amount_paid,0)),0),
           coalesce(sum(amount_paid),0)
      into remaining,total_paid
      from public.installments
     where loan_id=req.loan_id;
    remaining:=round(remaining,2);

    new_status:=case when remaining<=0 then 'paid' else ln.status end;

    update public.loans
       set status=new_status,
           closed_at=case when new_status='paid' then now_ts else closed_at end,
           settlement_amount=round(coalesce(settlement_amount,0)+paid_total,2),
           settlement_type='partial_pix',
           updated_at=now_ts
     where id=req.loan_id;

    update public.early_payment_requests
       set status='approved',review_note=nullif(trim(coalesce(p_note,'')),''),
           reviewed_at=now_ts,reviewed_by=p_admin_id,updated_at=now_ts
     where id=req.id;

    return jsonb_build_object(
      'ok',true,'loanId',req.loan_id,'requestId',req.id,'status','approved',
      'paymentType','partial','paidAmount',paid_total,'remainingAmount',remaining,
      'loanStatus',new_status
    );
  end if;

  update public.installments
     set amount_paid=case when due_date<=current_date then amount_due else greatest(principal_amount,0) end,
         amount_due=case when due_date<=current_date then amount_due else greatest(principal_amount,0) end,
         interest_amount=case when due_date<=current_date then interest_amount else 0 end,
         fee_amount=case when due_date<=current_date then fee_amount else 0 end,
         status='paid',paid_at=now_ts
   where loan_id=req.loan_id and status<>'paid';

  update public.loans
     set status='paid',closed_at=now_ts,updated_at=now_ts,
         settlement_amount=req.payoff_amount,settlement_type='early_pix'
   where id=req.loan_id;

  update public.early_payment_requests
     set status='approved',review_note=nullif(trim(coalesce(p_note,'')),''),
         reviewed_at=now_ts,reviewed_by=p_admin_id,updated_at=now_ts
   where id=req.id;

  return jsonb_build_object(
    'ok',true,'loanId',req.loan_id,'requestId',req.id,'status','approved',
    'paymentType','full','payoffAmount',req.payoff_amount,'closedAt',now_ts
  );
end;
$function$;
