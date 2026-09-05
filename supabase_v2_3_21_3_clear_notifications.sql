-- TAREFAS Android 2.3.21.3 / build 260
-- Marca todas as notificacoes pendentes do proprio usuario como lidas.

create or replace function public.v2_3_21_3_mark_all_notifications_read(p_session_token text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id bigint;
  v_hash text;
  v_count integer := 0;
begin
  if coalesce(length(trim(p_session_token)),0) < 32 then
    return 0;
  end if;

  v_hash := encode(extensions.digest(trim(p_session_token),'sha256'),'hex');

  select s.usuario_id into v_usuario_id
  from private.push_sessions s
  where s.session_hash=v_hash
    and s.expira_em>now();

  if v_usuario_id is null then
    return 0;
  end if;

  update public.notificacoes n
  set lida=true,
      lida_em=coalesce(n.lida_em,now())
  where n.usuario_id=v_usuario_id::text
    and coalesce(n.lida,false)=false;

  get diagnostics v_count = row_count;

  update private.push_sessions
  set ultimo_uso_em=now()
  where session_hash=v_hash;

  return v_count;
end;
$$;

revoke all on function public.v2_3_21_3_mark_all_notifications_read(text) from public;
grant execute on function public.v2_3_21_3_mark_all_notifications_read(text) to anon, authenticated;
