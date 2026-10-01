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
  return { payoffAmount, remainingContractualBalance: round(remainingContractualBalance), totalAmount: round(totalAmount), amountPaid: round(amountPaid), feeDue: round(feeDue), elapsedDays, payoffDate, startDate };
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const service = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json({ error: 'unauthorized' }, 401);
  const { data: userData } = await service.auth.getUser(token);
  const user = userData.user;
  if (!user || user.app_metadata?.role !== 'client') return json({ error: 'forbidden' }, 403);

  const body = await req.json().catch(() => null) as any;
  const loanId = String(body?.loanId ?? '').trim();
  const fileName = String(body?.fileName ?? 'comprovante').trim().slice(0, 180);
  const mimeType = String(body?.mimeType ?? '').trim().toLowerCase();
  const base64 = String(body?.base64 ?? '').trim();
  const requestedAmountRaw = body?.amount;
  const requestedAmountNum = requestedAmountRaw == null ? null : Number(requestedAmountRaw);
  const requestedAmount = requestedAmountNum == null || requestedAmountNum <= 0 ? null : requestedAmountNum;
  if (!loanId) return json({ error: 'loan_id_required' }, 400);
  if (!base64) return json({ error: 'proof_required' }, 400);
  if (requestedAmount !== null && (!Number.isFinite(requestedAmount) || requestedAmount <= 0)) return json({ error: 'payment_amount_invalid' }, 400);
  const allowed: Record<string,string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const ext = allowed[mimeType];
  if (!ext) return json({ error: 'unsupported_proof_type' }, 400);

  const { data: loan, error: loanError } = await service.from('loans')
    .select('id,user_id,principal,total_amount,interest_amount,monthly_interest_rate,status,disbursed_at,approved_at,created_at')
    .eq('id', loanId).eq('user_id', user.id).maybeSingle();
  if (loanError || !loan) return json({ error: 'loan_not_found' }, 404);
  if (!['active','late'].includes(String(loan.status))) return json({ error: 'loan_not_payoff_eligible' }, 409);

  const { data: pending } = await service.from('early_payment_requests')
    .select('id').eq('loan_id', loanId).eq('status', 'pending').limit(1).maybeSingle();
  if (pending) return json({ error: 'early_payment_already_pending' }, 409);

  const { data: installments } = await service.from('installments')
    .select('due_date,principal_amount,interest_amount,fee_amount,amount_due,amount_paid,status')
    .eq('loan_id', loanId).order('installment_number', { ascending: true });
  const calc = calculatePayoff(loan, installments ?? []);
  if (calc.payoffAmount <= 0) return json({ error: 'nothing_to_pay' }, 409);
  const paymentAmount = requestedAmount === null ? calc.payoffAmount : round(requestedAmount);
  if (paymentAmount > calc.payoffAmount + 0.01) return json({ error: 'payment_amount_exceeds_payoff', payoffAmount: calc.payoffAmount }, 409);
  const paymentType = paymentAmount + 0.01 >= calc.payoffAmount ? 'full' : 'partial';

  const { data: paymentSettings } = await service.from('payment_settings')
    .select('pix_key_type,pix_key_value').eq('id', true).maybeSingle();
  if (!paymentSettings?.pix_key_value) return json({ error: 'repayment_pix_not_configured' }, 409);

  let bytes: Uint8Array;
  try {
    const binary = atob(base64);
    if (binary.length > 10 * 1024 * 1024) return json({ error: 'proof_too_large' }, 413);
    bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return json({ error: 'invalid_proof_base64' }, 400);
  }
  if (bytes.length === 0) return json({ error: 'proof_required' }, 400);

  const path = `${user.id}/${loanId}/${crypto.randomUUID()}.${ext}`;
  const upload = await service.storage.from('crediflow-payment-proofs').upload(path, bytes, {
    contentType: mimeType,
    upsert: false,
  });
  if (upload.error) return json({ error: 'proof_upload_failed' }, 500);

  const { data: row, error: insertError } = await service.from('early_payment_requests').insert({
    loan_id: loanId,
    user_id: user.id,
    payoff_amount: paymentAmount,
    payment_type: paymentType,
    pix_key_type: paymentSettings.pix_key_type || 'random',
    pix_key_value: paymentSettings.pix_key_value,
    proof_path: path,
    proof_filename: fileName || `comprovante.${ext}`,
    proof_mime_type: mimeType,
    status: 'pending',
  }).select('id,status,submitted_at,payoff_amount,payment_type').single();

  if (insertError || !row) {
    await service.storage.from('crediflow-payment-proofs').remove([path]);
    return json({ error: 'early_payment_request_create_failed' }, 500);
  }

  await service.from('audit_log').insert({
    actor_user_id: user.id,
    action: 'early_payment_proof_submitted',
    entity_type: 'early_payment_request',
    entity_id: row.id,
    details: {
      loan_id: loanId,
      payoff_amount: paymentAmount,
      payment_type: paymentType,
      payoff_rule: 'contractual_remaining_balance',
      elapsed_days: calc.elapsedDays,
      amount_paid: calc.amountPaid,
      remaining_contractual_balance: calc.remainingContractualBalance,
      proof_filename: fileName,
      mime_type: mimeType,
    },
  });

  return json({
    ok: true,
    requestId: row.id,
    status: row.status,
    submittedAt: row.submitted_at,
    payoffAmount: Number(row.payoff_amount),
    paymentType: row.payment_type,
    payoffRule: 'contractual_remaining_balance',
    payoffBreakdown: calc,
  });
});
