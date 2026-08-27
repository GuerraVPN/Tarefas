-- TAREFAS V7.4.12
-- Objetivo: uma fonte única para localizar o perfil Admin da conta, mantendo
-- validação explícita de usuario_id + perfil_id nas ações administrativas.

create or replace function public.v7_4_12_admin_context(p_usuario_id bigint)
returns table(is_admin boolean, admin_profile_id bigint)
language sql
stable
security definer
set search_path = public
as $$
  with adm as (
    select up.id
      from public.usuario_perfis up
     where up.usuario_id = p_usuario_id
       and up.ativo = true
       and lower(trim(up.secao)) = 'admin'
     order by up.principal desc nulls last, up.id
     limit 1
  )
  select exists(select 1 from adm),
         (select id from adm);
$$;

create or replace function public.v7_4_12_estado_site()
returns table(
  modo text,
  acao_pendente text,
  executa_em timestamptz,
  restart_token bigint,
  exit_token bigint,
  aviso text,
  servidor_em timestamptz
)
language sql
security definer
set search_path = public
as $$
  select * from public.v7_4_9_estado_site();
$$;

create or replace function public.v7_4_12_controle_site(
  p_acao text,
  p_usuario_id bigint,
  p_perfil_id bigint
)
returns table(
  modo text,
  acao_pendente text,
  executa_em timestamptz,
  restart_token bigint,
  exit_token bigint,
  aviso text,
  servidor_em timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists(
    select 1
      from public.usuario_perfis up
     where up.id = p_perfil_id
       and up.usuario_id = p_usuario_id
       and up.ativo = true
       and lower(trim(up.secao)) = 'admin'
  ) then
    raise exception 'Ação disponível somente para perfil Admin ativo da própria conta.';
  end if;

  return query
  select *
    from public.v7_4_9_controle_site(
      p_acao       => p_acao,
      p_usuario_id => p_usuario_id,
      p_perfil_id  => p_perfil_id
    );
end;
$$;

grant execute on function public.v7_4_12_admin_context(bigint) to anon, authenticated;
grant execute on function public.v7_4_12_estado_site() to anon, authenticated;
grant execute on function public.v7_4_12_controle_site(text,bigint,bigint) to anon, authenticated;
