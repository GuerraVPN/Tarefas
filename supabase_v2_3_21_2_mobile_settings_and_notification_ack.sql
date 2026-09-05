-- TAREFAS Android 2.3.21.2 / build 259
-- Configuracoes do proprio usuario sem reabrir SELECT da tabela usuarios
-- e confirmacao segura da notificacao ao tocar no push.

create or replace function public.v2_3_21_2_get_my_settings(p_session_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id bigint;
  v_result jsonb;
  v_hash text;
begin
  if coalesce(length(trim(p_session_token)),0) < 32 then return null; end if;
  v_hash := encode(extensions.digest(trim(p_session_token),'sha256'),'hex');
  select s.usuario_id into v_usuario_id
  from private.push_sessions s
  where s.session_hash=v_hash and s.expira_em>now();
  if v_usuario_id is null then return null; end if;

  update private.push_sessions set ultimo_uso_em=now() where session_hash=v_hash;

  select jsonb_build_object(
    'id',u.id,
    'nome_completo',u.nome_completo,
    'nome_guerra',u.nome_guerra,
    'cpf',u.cpf,
    'patente',u.patente,
    'secao',u.secao,
    'posicao',u.posicao,
    'telefone',u.telefone,
    'email',u.email,
    'avatar',u.avatar,
    'preferencias',u.preferencias,
    'ativo',u.ativo
  ) into v_result
  from public.usuarios u
  where u.id=v_usuario_id and coalesce(u.ativo,true)=true;

  return v_result;
end;
$$;

revoke all on function public.v2_3_21_2_get_my_settings(text) from public;
grant execute on function public.v2_3_21_2_get_my_settings(text) to anon, authenticated;

create or replace function public.v2_3_21_2_update_my_settings(p_session_token text, p_changes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id bigint;
  v_hash text;
  v_cpf text;
  v_result jsonb;
begin
  if coalesce(length(trim(p_session_token)),0) < 32 then raise exception 'Sessao invalida.'; end if;
  v_hash := encode(extensions.digest(trim(p_session_token),'sha256'),'hex');
  select s.usuario_id into v_usuario_id
  from private.push_sessions s
  where s.session_hash=v_hash and s.expira_em>now();
  if v_usuario_id is null then raise exception 'Sessao expirada. Faca login novamente.'; end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'object' then raise exception 'Alteracoes invalidas.'; end if;

  if p_changes ? 'cpf' then
    v_cpf := regexp_replace(coalesce(p_changes->>'cpf',''),'[^0-9]','','g');
    if length(v_cpf) <> 11 then raise exception 'O CPF de login precisa ter exatamente 11 digitos.'; end if;
    if exists(
      select 1 from public.usuarios u
      where u.id<>v_usuario_id
        and regexp_replace(coalesce(u.cpf,''),'[^0-9]','','g')=v_cpf
    ) then raise exception 'Este CPF ja esta cadastrado em outra conta.'; end if;
  end if;

  update public.usuarios u set
    nome_completo = case when p_changes ? 'nome_completo' then nullif(btrim(p_changes->>'nome_completo'),'') else u.nome_completo end,
    nome_guerra = case when p_changes ? 'nome_guerra' then nullif(btrim(p_changes->>'nome_guerra'),'') else u.nome_guerra end,
    cpf = case when p_changes ? 'cpf' then v_cpf else u.cpf end,
    patente = case when p_changes ? 'patente' then nullif(btrim(p_changes->>'patente'),'') else u.patente end,
    telefone = case when p_changes ? 'telefone' then nullif(btrim(p_changes->>'telefone'),'') else u.telefone end,
    email = case when p_changes ? 'email' then nullif(btrim(p_changes->>'email'),'') else u.email end,
    avatar = case when p_changes ? 'avatar' then nullif(p_changes->>'avatar','') else u.avatar end,
    preferencias = case when p_changes ? 'preferencias' and jsonb_typeof(p_changes->'preferencias')='object' then p_changes->'preferencias' else u.preferencias end,
    atualizado_em = now()
  where u.id=v_usuario_id and coalesce(u.ativo,true)=true;

  update private.push_sessions set ultimo_uso_em=now() where session_hash=v_hash;

  select jsonb_build_object(
    'id',u.id,
    'nome_completo',u.nome_completo,
    'nome_guerra',u.nome_guerra,
    'cpf',u.cpf,
    'patente',u.patente,
    'secao',u.secao,
    'posicao',u.posicao,
    'telefone',u.telefone,
    'email',u.email,
    'avatar',u.avatar,
    'preferencias',u.preferencias,
    'ativo',u.ativo
  ) into v_result
  from public.usuarios u where u.id=v_usuario_id;
  return v_result;
end;
$$;

revoke all on function public.v2_3_21_2_update_my_settings(text,jsonb) from public;
grant execute on function public.v2_3_21_2_update_my_settings(text,jsonb) to anon, authenticated;

create or replace function public.v2_3_21_2_mark_notification_read(p_session_token text, p_notification_id bigint)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id bigint;
  v_hash text;
  v_ok boolean := false;
begin
  if coalesce(length(trim(p_session_token)),0) < 32 or p_notification_id is null then return false; end if;
  v_hash := encode(extensions.digest(trim(p_session_token),'sha256'),'hex');
  select s.usuario_id into v_usuario_id
  from private.push_sessions s
  where s.session_hash=v_hash and s.expira_em>now();
  if v_usuario_id is null then return false; end if;

  update public.notificacoes n
  set lida=true, lida_em=coalesce(n.lida_em,now())
  where n.id=p_notification_id and n.usuario_id=v_usuario_id::text
  returning true into v_ok;

  update private.push_sessions set ultimo_uso_em=now() where session_hash=v_hash;
  return coalesce(v_ok,false);
end;
$$;

revoke all on function public.v2_3_21_2_mark_notification_read(text,bigint) from public;
grant execute on function public.v2_3_21_2_mark_notification_read(text,bigint) to anon, authenticated;

-- Workflow da Alpha 2.3.21.2 registrado; alteração sem efeito funcional para disparar o CI do build 259.
