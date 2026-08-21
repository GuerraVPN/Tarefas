-- =====================================================================
-- V5.4.1 — Nº DE PATRIMÔNIO
--
-- Obrigatório em:
-- 1. Desrelacionamento / Baixa de material PERMANENTE.
-- 2. Movimentação de Material.
--
-- Não é exigido em:
-- - Uso Duradouro
-- - Consumo
-- - Distribuição
-- =====================================================================

begin;

alter table public.pedido_orcamentario_itens
  add column if not exists patrimonio text null;

alter table public.movimentacao_material_itens
  add column if not exists patrimonio text null;

create index if not exists idx_pedido_orc_item_patrimonio
  on public.pedido_orcamentario_itens(patrimonio)
  where patrimonio is not null;

create index if not exists idx_mov_material_item_patrimonio
  on public.movimentacao_material_itens(patrimonio)
  where patrimonio is not null;

-- ---------------------------------------------------------------------
-- Validação dos itens de PEDIDOS.
-- Permanente exige patrimônio.
-- As demais categorias/tipos não exigem.
-- ---------------------------------------------------------------------
create or replace function public.v5_4_1_validar_patrimonio_pedido()
returns trigger
language plpgsql
as $$
declare
  p_tipo text;
  p_categoria text;
begin
  select p.tipo,p.categoria
    into p_tipo,p_categoria
    from public.pedidos_orcamentarios p
   where p.id=new.pedido_id;

  if p_tipo='desrelacionamento_baixa'
     and p_categoria='permanente'
     and nullif(trim(coalesce(new.patrimonio,'')),'') is null then
    raise exception 'Informe o Nº de Patrimônio do material permanente.';
  end if;

  if not (
    p_tipo='desrelacionamento_baixa'
    and p_categoria='permanente'
  ) then
    new.patrimonio := null;
  else
    new.patrimonio := trim(new.patrimonio);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_v5_4_1_patrimonio_pedido
  on public.pedido_orcamentario_itens;

create trigger trg_v5_4_1_patrimonio_pedido
before insert or update
on public.pedido_orcamentario_itens
for each row execute function public.v5_4_1_validar_patrimonio_pedido();

-- ---------------------------------------------------------------------
-- Toda Movimentação de Material exige patrimônio.
-- ---------------------------------------------------------------------
create or replace function public.v5_4_1_validar_patrimonio_movimentacao()
returns trigger
language plpgsql
as $$
begin
  if nullif(trim(coalesce(new.patrimonio,'')),'') is null then
    raise exception 'Informe o Nº de Patrimônio do material movimentado.';
  end if;

  new.patrimonio := trim(new.patrimonio);
  return new;
end;
$$;

drop trigger if exists trg_v5_4_1_patrimonio_movimentacao
  on public.movimentacao_material_itens;

create trigger trg_v5_4_1_patrimonio_movimentacao
before insert or update
on public.movimentacao_material_itens
for each row execute function public.v5_4_1_validar_patrimonio_movimentacao();

-- ---------------------------------------------------------------------
-- Atualiza a RPC de edição de PEDIDO para aceitar patrimônio.
-- ---------------------------------------------------------------------
create or replace function public.v5_4_editar_pedido(
  p_pedido_id bigint,
  p_usuario_id text,
  p_perfil_id bigint,
  p_numero text,
  p_data_pedido date,
  p_dependencia_origem text,
  p_deposito_origem text,
  p_dependencia_destino text,
  p_motivo text,
  p_observacoes text,
  p_itens jsonb
)
returns void
language plpgsql
as $$
declare
  p public.pedidos_orcamentarios%rowtype;
  x jsonb;
  q numeric;
  vu numeric;
  patr text;
begin
  select * into p
  from public.pedidos_orcamentarios
  where id=p_pedido_id
  for update;

  if not found then raise exception 'Pedido não encontrado.'; end if;

  if not public.v5_4_pode_gerenciar(p_usuario_id,p_perfil_id,p.criado_por) then
    raise exception 'Somente o criador do pedido ou um Admin pode editá-lo.';
  end if;

  if nullif(trim(coalesce(p_numero,'')),'') is null
     or p_data_pedido is null
     or nullif(trim(coalesce(p_motivo,'')),'') is null then
    raise exception 'Preencha os dados obrigatórios do pedido.';
  end if;

  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens)=0 then
    raise exception 'O pedido precisa ter pelo menos um material.';
  end if;

  if p.tipo='desrelacionamento_baixa'
     and p.categoria in ('permanente','uso_duradouro') then
    if nullif(trim(coalesce(p_dependencia_origem,'')),'') is null
       or not exists(
         select 1 from public.orc_dependencias d
         where d.ativo=true and d.nome=p_dependencia_origem
       ) then
      raise exception 'Dependência de origem inválida.';
    end if;
    p_deposito_origem := null;
    p_dependencia_destino := null;

  elsif p.tipo='desrelacionamento_baixa' and p.categoria='consumo' then
    if nullif(trim(coalesce(p_deposito_origem,'')),'') is null
       or not exists(
         select 1 from public.orc_depositos d
         where d.ativo=true and d.nome=p_deposito_origem
       ) then
      raise exception 'Depósito de origem inválido.';
    end if;
    p_dependencia_origem := null;
    p_dependencia_destino := null;

  elsif p.tipo='distribuicao' then
    if nullif(trim(coalesce(p_deposito_origem,'')),'') is null
       or not exists(
         select 1 from public.orc_depositos d
         where d.ativo=true and d.nome=p_deposito_origem
       ) then
      raise exception 'Depósito de origem inválido.';
    end if;
    if nullif(trim(coalesce(p_dependencia_destino,'')),'') is null
       or not exists(
         select 1 from public.orc_dependencias d
         where d.ativo=true and d.nome=p_dependencia_destino
       ) then
      raise exception 'Dependência de destino inválida.';
    end if;
    p_dependencia_origem := null;
  end if;

  for x in select * from jsonb_array_elements(p_itens)
  loop
    if nullif(trim(coalesce(x->>'nome','')),'') is null
       or nullif(trim(coalesce(x->>'numero_ficha','')),'') is null then
      raise exception 'Nome e número da ficha são obrigatórios em todos os materiais.';
    end if;

    q := nullif(x->>'quantidade','')::numeric;
    vu := nullif(x->>'valor_unitario','')::numeric;
    patr := nullif(trim(coalesce(x->>'patrimonio','')),'');

    if q is null or q<=0 or vu is null or vu<0 then
      raise exception 'Quantidade/valor unitário inválidos.';
    end if;

    if p.tipo='desrelacionamento_baixa'
       and p.categoria='permanente'
       and patr is null then
      raise exception 'Informe o Nº de Patrimônio de todos os materiais permanentes.';
    end if;
  end loop;

  update public.pedidos_orcamentarios
  set numero=trim(p_numero),
      data_pedido=p_data_pedido,
      dependencia_origem=nullif(trim(coalesce(p_dependencia_origem,'')),''),
      deposito_origem=nullif(trim(coalesce(p_deposito_origem,'')),''),
      dependencia_destino=nullif(trim(coalesce(p_dependencia_destino,'')),''),
      motivo=trim(p_motivo),
      observacoes=nullif(trim(coalesce(p_observacoes,'')),'')
  where id=p_pedido_id;

  delete from public.pedido_orcamentario_itens
  where pedido_id=p_pedido_id;

  for x in select * from jsonb_array_elements(p_itens)
  loop
    insert into public.pedido_orcamentario_itens(
      pedido_id,nome,numero_ficha,patrimonio,quantidade,valor_unitario
    ) values (
      p_pedido_id,
      trim(x->>'nome'),
      trim(x->>'numero_ficha'),
      case
        when p.tipo='desrelacionamento_baixa' and p.categoria='permanente'
          then trim(x->>'patrimonio')
        else null
      end,
      (x->>'quantidade')::numeric,
      (x->>'valor_unitario')::numeric
    );
  end loop;

  insert into public.pedido_orcamentario_tramitacoes(
    pedido_id,evento,mensagem,usuario_id,perfil_id
  ) values (
    p_pedido_id,'pedido_editado',
    'Dados e materiais do pedido foram editados.',
    p_usuario_id,p_perfil_id
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Atualiza a RPC de edição da MOVIMENTAÇÃO para aceitar patrimônio.
-- ---------------------------------------------------------------------
create or replace function public.v5_4_editar_movimentacao(
  p_movimentacao_id bigint,
  p_usuario_id text,
  p_perfil_id bigint,
  p_numero text,
  p_data_movimentacao date,
  p_dependencia_origem text,
  p_dependencia_destino text,
  p_finalidade text,
  p_observacoes text,
  p_itens jsonb
)
returns void
language plpgsql
as $$
declare
  m public.movimentacoes_material%rowtype;
  x jsonb;
begin
  select * into m
  from public.movimentacoes_material
  where id=p_movimentacao_id
  for update;

  if not found then raise exception 'Movimentação não encontrada.'; end if;

  if not public.v5_4_pode_gerenciar(p_usuario_id,p_perfil_id,m.criado_por) then
    raise exception 'Somente o criador da movimentação ou um Admin pode editá-la.';
  end if;

  if nullif(trim(coalesce(p_numero,'')),'') is null
     or p_data_movimentacao is null
     or nullif(trim(coalesce(p_finalidade,'')),'') is null then
    raise exception 'Preencha os campos obrigatórios.';
  end if;

  if p_dependencia_origem=p_dependencia_destino then
    raise exception 'A dependência de origem e destino precisam ser diferentes.';
  end if;

  if not exists(
    select 1 from public.orc_dependencias d
    where d.ativo=true and d.nome=p_dependencia_origem
  ) or not exists(
    select 1 from public.orc_dependencias d
    where d.ativo=true and d.nome=p_dependencia_destino
  ) then
    raise exception 'Dependência de origem/destino inválida.';
  end if;

  if jsonb_typeof(p_itens)<>'array' or jsonb_array_length(p_itens)=0 then
    raise exception 'Informe pelo menos um material.';
  end if;

  for x in select * from jsonb_array_elements(p_itens)
  loop
    if nullif(trim(coalesce(x->>'nome','')),'') is null
       or nullif(trim(coalesce(x->>'numero_ficha','')),'') is null
       or nullif(trim(coalesce(x->>'patrimonio','')),'') is null
       or (x->>'quantidade')::numeric<=0
       or (x->>'valor_unitario')::numeric<0 then
      raise exception 'Confira os dados dos materiais, incluindo o Nº de Patrimônio.';
    end if;
  end loop;

  update public.movimentacoes_material
  set numero=trim(p_numero),
      data_movimentacao=p_data_movimentacao,
      dependencia_origem=p_dependencia_origem,
      dependencia_destino=p_dependencia_destino,
      finalidade=trim(p_finalidade),
      observacoes=nullif(trim(coalesce(p_observacoes,'')),'')
  where id=p_movimentacao_id;

  delete from public.movimentacao_material_itens
  where movimentacao_id=p_movimentacao_id;

  for x in select * from jsonb_array_elements(p_itens)
  loop
    insert into public.movimentacao_material_itens(
      movimentacao_id,nome,numero_ficha,patrimonio,quantidade,valor_unitario
    ) values (
      p_movimentacao_id,
      trim(x->>'nome'),
      trim(x->>'numero_ficha'),
      trim(x->>'patrimonio'),
      (x->>'quantidade')::numeric,
      (x->>'valor_unitario')::numeric
    );
  end loop;

  insert into public.movimentacao_material_tramitacoes(
    movimentacao_id,evento,mensagem,usuario_id,perfil_id
  ) values (
    p_movimentacao_id,'movimentacao_editada',
    'Dados e materiais da movimentação foram editados.',
    p_usuario_id,p_perfil_id
  );
end;
$$;

grant execute on function public.v5_4_editar_pedido(
  bigint,text,bigint,text,date,text,text,text,text,text,jsonb
) to anon,authenticated;

grant execute on function public.v5_4_editar_movimentacao(
  bigint,text,bigint,text,date,text,text,text,text,jsonb
) to anon,authenticated;

commit;

-- Conferência
select
  i.id,i.pedido_id,i.nome,i.numero_ficha,i.patrimonio
from public.pedido_orcamentario_itens i
where i.patrimonio is not null
order by i.id desc
limit 30;

select
  i.id,i.movimentacao_id,i.nome,i.numero_ficha,i.patrimonio
from public.movimentacao_material_itens i
order by i.id desc
limit 30;
