import { createClient } from '@supabase/supabase-js';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const service = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json({ error: 'unauthorized' }, 401);

  const { data: userData } = await service.auth.getUser(token);
  const user = userData.user;
  if (!user || user.app_metadata?.role !== 'client') return json({ error: 'forbidden' }, 403);

  const body = await req.json().catch(() => null) as any;
  const loanId = String(body?.loanId ?? '').trim();
  const amount = Number(body?.amount ?? 0);

  if (!loanId) return json({ error: 'loan_id_required' }, 400);
  if (!Number.isFinite(amount) || amount <= 0) {
    return json({ error: 'partial_payment_amount_invalid' }, 400);
  }

  const { data, error } = await service.rpc('register_partial_payment', {
    p_loan_id: loanId,
    p_user_id: user.id,
    p_amount: Math.round(amount * 100) / 100,
  });

  if (error) {
    const message = String(error.message || 'partial_payment_failed');
    const status =
      message.includes('loan_not_found') ? 404 :
      message.includes('partial_payment_amount_invalid') ? 400 :
      message.includes('not_payment_eligible') ||
      message.includes('already_paid') ||
      message.includes('amount_is_full_payoff') ? 409 : 409;
    return json({ error: message }, status);
  }

  return json(data ?? { ok: true });
});
