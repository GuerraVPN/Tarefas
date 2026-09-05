-- TAREFAS Android 2.3.21 — canal alpha opcional para Admin e Moderador.
-- As funções públicas recebem o token opaco do login do aplicativo, validam
-- a sessão pelo hash e nunca aceitam usuario_id/perfil_id enviados pelo cliente.

begin;

alter table private.app_update_preferences
  add column if not exists receive_alpha boolean not null default false;

comment on column private.app_update_preferences.receive_alpha is
  'Recebe versões alpha; só tem efeito para usuários Admin ou moderadores ativos.';

alter table public.app_versions
  drop constraint if exists app_versions_channel_check;

alter table public.app_versions
  add constraint app_versions_channel_check
  check (channel = any (array['official'::text, 'beta'::text, 'alpha'::text]));

alter table public.app_versions
  drop constraint if exists app_versions_alpha_version_check;

alter table public.app_versions
  add constraint app_versions_alpha_version_check
  check (channel <> 'alpha' or version_name ~ '^\d+\.\d+\.\d+\.\d+$');

create or replace function private.v2_3_21_alpha_eligible(p_usuario_id bigint)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $function$
  select exists (
    select 1
      from public.usuarios u
     where u.id = p_usuario_id
       and u.ativo is distinct from false
  ) and (
    exists (
      select 1
        from public.usuario_perfis p
       where p.usuario_id = p_usuario_id
         and p.ativo = true
         and lower(btrim(p.secao)) = 'admin'
    )
    or exists (
      select 1
        from public.suporte_moderadores m
       where m.usuario_id = p_usuario_id::text
         and m.ativo = true
    )
  );
$function$;

revoke all on function private.v2_3_21_alpha_eligible(bigint) from public, anon, authenticated;

create or replace function public.v2_3_21_alpha_context(p_session_token text)
returns table(eligible boolean, receive_alpha boolean)
language plpgsql
stable
security definer
set search_path = 'public', 'private', 'extensions'
as $function$
declare
  v_user bigint;
  v_hash text;
  v_eligible boolean := false;
  v_receive boolean := false;
begin
  if coalesce(length(trim(p_session_token)), 0) < 32 then
    return query select false, false;
    return;
  end if;

  v_hash := encode(digest(p_session_token, 'sha256'), 'hex');
  select s.usuario_id
    into v_user
    from private.push_sessions s
   where s.session_hash = v_hash
     and s.expira_em > now();

  if v_user is null then
    return query select false, false;
    return;
  end if;

  v_eligible := private.v2_3_21_alpha_eligible(v_user);
  if v_eligible then
    select coalesce(p.receive_alpha, false)
      into v_receive
      from private.app_update_preferences p
     where p.usuario_id = v_user;
  end if;

  return query select v_eligible, coalesce(v_receive, false);
end;
$function$;

create or replace function public.v2_3_21_set_alpha_updates(
  p_session_token text,
  p_receive_alpha boolean
)
returns boolean
language plpgsql
security definer
set search_path = 'public', 'private', 'extensions'
as $function$
declare
  v_user bigint;
  v_hash text;
begin
  if coalesce(length(trim(p_session_token)), 0) < 32 then return false; end if;

  v_hash := encode(digest(p_session_token, 'sha256'), 'hex');
  select s.usuario_id
    into v_user
    from private.push_sessions s
   where s.session_hash = v_hash
     and s.expira_em > now();

  if v_user is null then return false; end if;
  if not private.v2_3_21_alpha_eligible(v_user) then return false; end if;

  insert into private.app_update_preferences(usuario_id, receive_alpha, updated_at)
  values (v_user, coalesce(p_receive_alpha, false), now())
  on conflict(usuario_id) do update
    set receive_alpha = excluded.receive_alpha,
        updated_at = now();

  update private.push_sessions
     set ultimo_uso_em = now()
   where session_hash = v_hash;

  return true;
end;
$function$;

revoke all on function public.v2_3_21_alpha_context(text) from public;
revoke all on function public.v2_3_21_set_alpha_updates(text, boolean) from public;
grant execute on function public.v2_3_21_alpha_context(text) to anon, authenticated, service_role;
grant execute on function public.v2_3_21_set_alpha_updates(text, boolean) to anon, authenticated, service_role;

create or replace function public.v1_8_latest_app_version(p_session_token text default null::text)
returns table(
  version_name text, build integer, channel text, web_version text, title text,
  changelog jsonb, download_url text, mandatory boolean, published_at timestamptz
)
language plpgsql
stable
security definer
set search_path = 'public', 'private', 'extensions'
as $function$
declare
  v_user bigint;
  v_hash text;
  v_beta boolean := false;
  v_alpha boolean := false;
begin
  if coalesce(length(trim(p_session_token)), 0) >= 32 then
    v_hash := encode(digest(p_session_token, 'sha256'), 'hex');
    select s.usuario_id into v_user
      from private.push_sessions s
     where s.session_hash = v_hash and s.expira_em > now();
    if v_user is not null then
      select coalesce(p.receive_beta, false),
             coalesce(p.receive_alpha, false) and private.v2_3_21_alpha_eligible(v_user)
        into v_beta, v_alpha
        from private.app_update_preferences p
       where p.usuario_id = v_user;
      v_beta := coalesce(v_beta, false);
      v_alpha := coalesce(v_alpha, false);
    end if;
  end if;

  return query
    select v.version_name, v.build, v.channel, v.web_version, v.title,
           v.changelog, v.download_url, v.mandatory, v.published_at
      from public.app_versions v
     where v.published = true
       and (
         v.channel = 'official'
         or (v.channel = 'beta' and v_beta)
         or (v.channel = 'alpha' and v_alpha)
       )
     order by v.build desc
     limit 1;
end;
$function$;

create or replace function public.v1_8_app_version_history(p_session_token text default null::text)
returns table(
  version_name text, build integer, channel text, web_version text, title text,
  changelog jsonb, download_url text, mandatory boolean, published_at timestamptz
)
language plpgsql
stable
security definer
set search_path = 'public', 'private', 'extensions'
as $function$
declare
  v_user bigint;
  v_hash text;
  v_beta boolean := false;
  v_alpha boolean := false;
begin
  if coalesce(length(trim(p_session_token)), 0) >= 32 then
    v_hash := encode(digest(p_session_token, 'sha256'), 'hex');
    select s.usuario_id into v_user
      from private.push_sessions s
     where s.session_hash = v_hash and s.expira_em > now();
    if v_user is not null then
      select coalesce(p.receive_beta, false),
             coalesce(p.receive_alpha, false) and private.v2_3_21_alpha_eligible(v_user)
        into v_beta, v_alpha
        from private.app_update_preferences p
       where p.usuario_id = v_user;
      v_beta := coalesce(v_beta, false);
      v_alpha := coalesce(v_alpha, false);
    end if;
  end if;

  return query
    select v.version_name, v.build, v.channel, v.web_version, v.title,
           v.changelog, v.download_url, v.mandatory, v.published_at
      from public.app_versions v
     where v.published = true
       and (
         v.channel = 'official'
         or (v.channel = 'beta' and v_beta)
         or (v.channel = 'alpha' and v_alpha)
       )
     order by v.build desc;
end;
$function$;

create or replace function public.v1_8_notify_app_update()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'private'
as $function$
declare
  v_destination text;
begin
  if new.published = true and (tg_op = 'INSERT' or old.published is distinct from true) then
    v_destination := 'about.html?update=' || new.version_name;

    insert into public.notificacoes(
      id, usuario_id, tipo, titulo, mensagem, referencia_tipo,
      referencia_id, lida, criada_em, perfil_id, urgente, destino_url
    )
    select nextval('public.notificacoes_id_seq'), u.usuario_id::text, 'app_update',
      case
        when new.channel = 'alpha' then 'Alpha ' || new.version_name || ' disponível'
        when new.channel = 'beta' then 'Beta ' || new.version_name || ' disponível'
        else 'Atualização ' || new.version_name || ' disponível'
      end,
      new.title || ' — toque para ver as novidades e baixar.',
      'app_version', new.version_name, false, now(), null, false, v_destination
    from (
      select distinct d.usuario_id
        from private.push_devices d
        left join private.app_update_preferences p on p.usuario_id = d.usuario_id
       where d.ativo = true
         and (
           new.channel = 'official'
           or (new.channel = 'beta' and coalesce(p.receive_beta, false) = true)
           or (
             new.channel = 'alpha'
             and coalesce(p.receive_alpha, false) = true
             and private.v2_3_21_alpha_eligible(d.usuario_id)
           )
         )
    ) u;
  end if;
  return new;
end;
$function$;

commit;
