-- TAREFAS WEB 7.6.3
-- Protege o militar até o dia de adaptação após as férias.
-- Ex.: férias terminam na sexta -> sábado, domingo e segunda (ADP) ficam bloqueados;
-- a Escala Vermelha mantém o militar na fila e o coloca no próximo fim de semana elegível.

create or replace function public.v7_6_3_data_adaptacao(p_data_fim date)
returns date
language sql
immutable
as $$
  select case extract(dow from p_data_fim)::int
    when 5 then p_data_fim + 3
    when 6 then p_data_fim + 2
    when 0 then p_data_fim + 1
    else p_data_fim + 1
  end;
$$;

create or replace function public.v7_6_3_validar_ferias_servico()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_fim date;
  v_adaptacao date;
begin
  if new.data_servico is null then return new; end if;
  if new.usuario_id is null and new.pessoa_externa_id is null then return new; end if;

  select f.data_fim, public.v7_6_3_data_adaptacao(f.data_fim)
    into v_fim, v_adaptacao
  from public.pessoal_ferias f
  where (
      (new.usuario_id is not null and f.usuario_id = new.usuario_id)
      or
      (new.pessoa_externa_id is not null and f.pessoa_externa_id = new.pessoa_externa_id)
    )
    and new.data_servico between f.data_inicio and public.v7_6_3_data_adaptacao(f.data_fim)
  order by f.data_inicio desc
  limit 1;

  if v_adaptacao is not null then
    raise exception 'Serviço indisponível: férias e período de adaptação protegem o militar até %.', to_char(v_adaptacao,'DD/MM/YYYY');
  end if;

  return new;
end;
$$;

drop trigger if exists trg_v7_6_3_ferias_servico on public.escala_servicos;
create trigger trg_v7_6_3_ferias_servico
before insert or update of usuario_id,pessoa_externa_id,data_servico
on public.escala_servicos
for each row execute function public.v7_6_3_validar_ferias_servico();

comment on function public.v7_6_3_data_adaptacao(date) is
'TAREFAS 7.6.3: primeiro dia útil de adaptação após férias, pulando sábado e domingo.';

comment on function public.v7_6_3_validar_ferias_servico() is
'TAREFAS 7.6.3: impede confirmar serviço durante férias, no fim de semana entre o fim das férias e a ADP, e na própria ADP.';
