-- TAREFAS Android 2.3.21.5 / build 262
-- Corrige criação de tarefas pela IA para perfis Auxiliar sem elevar privilégios.
-- A autorização continua sendo feita pelo perfil ativo; aqui tratamos apenas integridade/encadeamento do INSERT.

create or replace function public.v2_3_21_5_prepare_task_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.codigo is null or btrim(new.codigo) = '' then
    new.codigo := '#' || (1000 + floor(random() * 9000))::int::text;
  end if;

  if new.responsavel is null then
    new.responsavel := '[]';
  end if;

  if new.prioridade is null or btrim(new.prioridade) = '' then
    new.prioridade := 'Média';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_v2_3_21_5_prepare_task_insert on public.tarefas;
create trigger trg_v2_3_21_5_prepare_task_insert
before insert on public.tarefas
for each row execute function public.v2_3_21_5_prepare_task_insert();

create or replace function public.v2_3_21_5_resolve_task_for_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids bigint[];
begin
  if new.tarefa_id is not null then
    return new;
  end if;

  if new.atribuido_por is null or new.atribuido_por_perfil_id is null then
    raise exception using errcode = '23502', message = 'tarefa_id ausente e não há ator/perfil suficiente para resolver a tarefa recém-criada';
  end if;

  select coalesce(array_agg(x.id order by x.id desc), '{}'::bigint[])
    into v_ids
    from (
      select t.id
        from public.tarefas t
       where t.criado_por = new.atribuido_por
         and t.criado_por_perfil_id = new.atribuido_por_perfil_id
         and t.criado_em >= now() - interval '30 seconds'
         and not exists (
           select 1
             from public.tarefa_responsaveis tr
            where tr.tarefa_id = t.id
         )
       order by t.id desc
       limit 2
    ) x;

  if cardinality(v_ids) = 1 then
    new.tarefa_id := v_ids[1];
    return new;
  end if;

  if cardinality(v_ids) = 0 then
    raise exception using errcode = '23502', message = 'não foi encontrada tarefa recém-criada para resolver tarefa_id do responsável';
  end if;

  raise exception using errcode = 'P0001', message = 'há mais de uma tarefa recém-criada possível; vínculo não realizado para evitar associação incorreta';
end;
$$;

revoke all on function public.v2_3_21_5_resolve_task_for_assignment() from public;
grant execute on function public.v2_3_21_5_resolve_task_for_assignment() to anon, authenticated, service_role;

drop trigger if exists trg_00_v2_3_21_5_resolve_task_for_assignment on public.tarefa_responsaveis;
create trigger trg_00_v2_3_21_5_resolve_task_for_assignment
before insert on public.tarefa_responsaveis
for each row execute function public.v2_3_21_5_resolve_task_for_assignment();
