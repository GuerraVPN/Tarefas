-- TAREFAS Web 7.6.11 / Android 2.2.2
-- Regra: ações identificadas não geram notificação para o próprio autor.

alter table public.tarefas
  add column if not exists atualizado_por bigint,
  add column if not exists atualizado_por_perfil_id bigint;

create or replace function public.v7_6_11_mark_notification_actor()
returns trigger
language plpgsql
set search_path to 'public'
as $$
declare
  v_row jsonb;
  v_actor text;
begin
  v_row := case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;

  v_actor := nullif(trim(coalesce(
    v_row->>'atualizado_por',
    v_row->>'registrado_por',
    v_row->>'atribuido_por',
    case when tg_table_name in ('guia_tramitacoes','lavanderia_historico','escala_alteracoes') then v_row->>'usuario_id' end
  )), '');

  if v_actor is not null then
    perform set_config('tarefas.notification_actor_user_id', v_actor, true);
  end if;

  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.v7_6_11_suppress_self_notification()
returns trigger
language plpgsql
set search_path to 'public'
as $$
declare
  v_actor text;
begin
  v_actor := nullif(trim(current_setting('tarefas.notification_actor_user_id', true)), '');
  if v_actor is not null and trim(coalesce(new.usuario_id,'')) = v_actor then
    return null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_v7_6_11_no_self_notification on public.notificacoes;
create trigger trg_v7_6_11_no_self_notification
before insert on public.notificacoes
for each row execute function public.v7_6_11_suppress_self_notification();

drop trigger if exists trg_v7_6_11_actor_tarefas on public.tarefas;
create trigger trg_v7_6_11_actor_tarefas
before update on public.tarefas
for each row execute function public.v7_6_11_mark_notification_actor();

drop trigger if exists trg_v7_6_11_actor_tarefa_responsaveis on public.tarefa_responsaveis;
create trigger trg_v7_6_11_actor_tarefa_responsaveis
before insert or update on public.tarefa_responsaveis
for each row execute function public.v7_6_11_mark_notification_actor();

drop trigger if exists trg_v7_6_11_actor_escala_servicos on public.escala_servicos;
create trigger trg_v7_6_11_actor_escala_servicos
before insert or update on public.escala_servicos
for each row execute function public.v7_6_11_mark_notification_actor();

drop trigger if exists trg_v7_6_11_actor_escala_integrantes on public.escala_integrantes;
create trigger trg_v7_6_11_actor_escala_integrantes
before insert or update on public.escala_integrantes
for each row execute function public.v7_6_11_mark_notification_actor();

drop trigger if exists trg_v7_6_11_actor_pessoal_ferias on public.pessoal_ferias;
create trigger trg_v7_6_11_actor_pessoal_ferias
before insert or update on public.pessoal_ferias
for each row execute function public.v7_6_11_mark_notification_actor();

drop trigger if exists trg_v7_6_11_actor_pessoal_dispensa_usos on public.pessoal_dispensa_usos;
create trigger trg_v7_6_11_actor_pessoal_dispensa_usos
before insert on public.pessoal_dispensa_usos
for each row execute function public.v7_6_11_mark_notification_actor();

drop trigger if exists trg_v7_6_11_actor_guia_tramitacoes on public.guia_tramitacoes;
create trigger trg_v7_6_11_actor_guia_tramitacoes
before insert on public.guia_tramitacoes
for each row execute function public.v7_6_11_mark_notification_actor();

drop trigger if exists trg_v7_6_11_actor_lavanderia_historico on public.lavanderia_historico;
create trigger trg_v7_6_11_actor_lavanderia_historico
before insert on public.lavanderia_historico
for each row execute function public.v7_6_11_mark_notification_actor();

drop trigger if exists trg_v7_6_11_actor_escala_alteracoes on public.escala_alteracoes;
create trigger trg_v7_6_11_actor_escala_alteracoes
before insert on public.escala_alteracoes
for each row execute function public.v7_6_11_mark_notification_actor();

create or replace function public.alterar_secao_tarefa_por_perfil_26pel(
  p_tarefa_id bigint,
  p_nova_secao text,
  p_usuario_id bigint,
  p_perfil_id bigint
)
returns void
language plpgsql
set search_path to 'public'
as $$
begin
  if nullif(btrim(p_nova_secao),'') is null then
    raise exception 'A nova seção não pode ficar vazia.';
  end if;

  if not public.perfil_pode_alterar_secao_tarefa_26pel(
    p_tarefa_id,p_usuario_id,p_perfil_id
  ) then
    raise exception 'Este perfil não possui permissão para alterar a seção desta tarefa.';
  end if;

  update public.tarefas
     set secao = btrim(p_nova_secao),
         atualizado_por = p_usuario_id,
         atualizado_por_perfil_id = p_perfil_id
   where id = p_tarefa_id;

  if not found then raise exception 'Tarefa não encontrada: %',p_tarefa_id; end if;
end;
$$;
