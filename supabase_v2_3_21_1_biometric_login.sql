-- TAREFAS Android 2.3.21.1 — retomada segura da sessão após biometria.
-- A senha nunca é recebida por esta função. O token opaco, guardado cifrado no
-- Android Keystore, é validado pelo hash e pela situação atual do usuário.

begin;

create or replace function public.v2_3_21_1_biometric_resume(p_session_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_usuario public.usuarios%rowtype;
  v_hash text;
begin
  if coalesce(length(trim(p_session_token)), 0) < 32
     or length(p_session_token) > 512 then
    return null;
  end if;

  v_hash := encode(extensions.digest(p_session_token, 'sha256'), 'hex');

  select u.*
    into v_usuario
    from private.push_sessions s
    join public.usuarios u on u.id = s.usuario_id
   where s.session_hash = v_hash
     and s.expira_em > now()
     and coalesce(u.ativo, true) = true
   limit 1;

  if not found then
    return null;
  end if;

  update private.push_sessions
     set ultimo_uso_em = now()
   where session_hash = v_hash;

  return jsonb_build_object(
    'valid', true,
    'usuario', jsonb_build_object(
      'id', v_usuario.id,
      'nome_completo', v_usuario.nome_completo,
      'nome_guerra', v_usuario.nome_guerra,
      'patente', v_usuario.patente,
      'secao', v_usuario.secao,
      'posicao', v_usuario.posicao,
      'cpf', v_usuario.cpf
    )
  );
end;
$function$;

revoke all on function public.v2_3_21_1_biometric_resume(text) from public;
revoke all on function public.v2_3_21_1_biometric_resume(text) from anon, authenticated;
grant execute on function public.v2_3_21_1_biometric_resume(text) to anon, authenticated, service_role;

comment on function public.v2_3_21_1_biometric_resume(text) is
  'Valida o token opaco desbloqueado pela biometria e retorna somente os campos públicos da conta ativa.';

commit;
