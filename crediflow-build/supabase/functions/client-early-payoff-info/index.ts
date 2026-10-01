import { createClient } from '@supabase/supabase-js';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
});
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const TZ = 'America/Sao_Paulo';
const DAY_MS = 86400000;

const dateKey = (value: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
};
const daysBetween = (start: string, end: string) => Math.max(0, Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS));

const calculatePayoff = (loan: any, items: any[]) => {
  const totalAmount = Math.max(0, Number(loan.total_amount || 0));
  let amountPaid = 0;
  let totalFees = 0;
  let feePaid = 0;

  for (const it of items) {
    const amountDue = Math.max(0, Number(it.amount_due || 0));
    const recordedPaid = Math.max(0, Number(it.amount_paid || 0));
    const effectivePaid = it.status === 'paid' ? Math.max(recordedPaid, amountDue) : recordedPaid;
    amountPaid += effectivePaid;

    const feePart = Math.max(0, Number(it.fee_amount || 0));
    totalFees += feePart;
    feePaid += Math.min(effectivePaid, feePart);
  }

  const remainingContractualBalance = Math.max(0, totalAmount - amountPaid);
  const feeDue = Math.max(0, totalFees - feePaid);
  const payoffAmount = round(remainingContractualBalance + feeDue);

  const startAt = loan.disbursed_at || loan.approved_at || loan.created_at;
  const startDate = startAt ? dateKey(new Date(startAt)) : dateKey(new Date());
  const payoffDate = dateKey(new Date());
  const elapsedDays = daysBetween(startDate, payoffDate);

  return {
    payoffAmount,
    remainingContractualBalance: round(remainingContractualBalance),
    totalAmount: round(totalAmount),
    amountPaid: round(amountPaid),
    feeDue: round(feeDue),
    elapsedDays,
    payoffDate,
    startDate,
  };
};

Deno.serve(async (req) => {
  if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const service = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json({ error: 'unauthorized' }, 401);
  const { data: userData } = await service.auth.getUser(token);
  const user = userData.user;
  if (!user || user.app_metadata?.role !== 'client') return json({ error: 'forbidden' }, 403);

  const requestUrl = new URL(req.url);
  const loanId = String(requestUrl.searchParams.get('loanId') || '').trim();
  if (!loanId) return json({ error: 'loan_id_required' }, 400);

  const { data: loan, error: loanError } = await service.from('loans')
    .select('id,user_id,principal,total_amount,interest_amount,monthly_interest_rate,status,first_due_date,settlement_amount,settlement_type,closed_at,disbursed_at,approved_at,created_at')
    .eq('id', loanId).eq('user_id', user.id).maybeSingle();
  if (loanError || !loan) return json({ error: 'loan_not_found' }, 404);

  const { data: installments } = await service.from('installments')
    .select('id,installment_number,due_date,principal_amount,interest_amount,fee_amount,amount_due,amount_paid,status')
    .eq('loan_id', loanId).order('installment_number', { ascending: true });

  const { data: paymentSettings } = await service.from('payment_settings')
    .select('pix_key_type,pix_key_value,pix_receiver_name,pix_receiver_city')
    .eq('id', true).maybeSingle();

  const { data: latestRequest } = await service.from('early_payment_requests')
    .select('id,status,payoff_amount,payment_type,review_note,proof_filename,submitted_at,reviewed_at')
    .eq('loan_id', loanId).eq('user_id', user.id)
    .order('submitted_at', { ascending: false }).limit(1).maybeSingle();

  const calc = calculatePayoff(loan, installments ?? []);
  const eligible = ['active', 'late'].includes(String(loan.status));

  return json({
    ok: true,
    loan: {
      id: loan.id,
      status: loan.status,
      principal: Number(loan.principal || 0),
      totalAmount: Number(loan.total_amount || 0),
      firstDueDate: loan.first_due_date,
      settlementAmount: loan.settlement_amount == null ? null : Number(loan.settlement_amount),
      settlementType: loan.settlement_type,
      closedAt: loan.closed_at,
    },
    eligible,
    payoffAmount: calc.payoffAmount,
    payoffRule: 'contractual_remaining_balance',
    payoffBreakdown: calc,
    pix: paymentSettings ? {
      keyType: paymentSettings.pix_key_type,
      keyValue: paymentSettings.pix_key_value,
      receiverName: paymentSettings.pix_receiver_name,
      receiverCity: paymentSettings.pix_receiver_city,
    } : null,
    latestRequest: latestRequest ? {
      id: latestRequest.id,
      status: latestRequest.status,
      payoffAmount: Number(latestRequest.payoff_amount || 0),
      paymentType: latestRequest.payment_type || 'full',
      reviewNote: latestRequest.review_note,
      proofFilename: latestRequest.proof_filename,
      submittedAt: latestRequest.submitted_at,
      reviewedAt: latestRequest.reviewed_at,
    } : null,
  });
});
