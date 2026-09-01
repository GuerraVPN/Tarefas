-- TAREFAS WEB 7.5.9
-- 1) Previsão nunca é serviço confirmado.
-- 2) Impede serviço com apenas 24h de folga: datas de serviço da mesma pessoa
--    precisam ficar separadas por pelo menos 3 dias corridos.
-- 3) Permite ao militar ativo na escala operar o próprio serviço, sem liberar
--    a administração de integrantes/feriados para todos.

create or replace function public.v7_5_9_pode_operar_escala(
  p_usuario_id bigint,
  p_perfil_id bigint
) returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select
    public.v7_2_pode_gerenciar_pessoal(p_usuario_id,p_perfil_id)
    or (
      exists(
        select 1 from public.usuario_perfis p
        where p.id=p_perfil_id and p.usuario_id=p_usuario_id and p.ativo=true
      )
      and exists(
        select 1 from public.escala_integrantes i
        where i.usuario_id=p_usuario_id and i.ativo=true
      )
    );
$$;

create or replace function public.v7_5_9_validar_intervalo_servico()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_data date;
begin
  if new.data_servico is null then return new; end if;
  if new.usuario_id is null and new.pessoa_externa_id is null then return new; end if;

  select s.data_servico into v_data
  from public.escala_servicos s
  where s.id<>coalesce(new.id,0)
    and (
      (new.usuario_id is not null and s.usuario_id=new.usuario_id)
      or
      (new.pessoa_externa_id is not null and s.pessoa_externa_id=new.pessoa_externa_id)
    )
    and abs(s.data_servico-new.data_servico)<=2
  order by abs(s.data_servico-new.data_servico),s.data_servico
  limit 1;

  if v_data is not null then
    raise exception 'Intervalo insuficiente: já existe serviço confirmado em %. Após um serviço de 24h, deixe pelo menos 48h completas de folga antes do próximo serviço.',to_char(v_data,'DD/MM/YYYY');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_v7_5_9_intervalo_servico on public.escala_servicos;
create trigger trg_v7_5_9_intervalo_servico
before insert or update of usuario_id,pessoa_externa_id,data_servico
on public.escala_servicos
for each row execute function public.v7_5_9_validar_intervalo_servico();

create or replace function public.v7_5_9_definir_meu_servico(
  p_grupo text,
  p_data_servico date,
  p_marcacao text,
  p_observacao text,
  p_usuario_id bigint,
  p_perfil_id bigint
) returns bigint
language plpgsql
security definer
set search_path=public
as $$
declare
  v_id bigint;
  v_criado boolean:=false;
  v_nome text;
begin
  if not public.v7_5_9_pode_operar_escala(p_usuario_id,p_perfil_id) then
    raise exception 'Seu perfil não possui permissão para operar esta escala.';
  end if;
  if p_grupo not in ('sargento','motorista','patrulheiro','permanencia','canil') then
    raise exception 'Escala inválida.';
  end if;
  if p_data_servico is null then raise exception 'Informe a data do serviço.'; end if;
  if not exists(select 1 from public.escala_integrantes i where i.grupo=p_grupo and i.usuario_id=p_usuario_id and i.ativo=true) then
    raise exception 'Você não está ativo nesta escala.';
  end if;
  if exists(
    select 1 from public.pessoal_ferias f
    where f.usuario_id=p_usuario_id
      and (p_data_servico between f.data_inicio and f.data_fim or p_data_servico=f.data_fim+1)
  ) then
    raise exception 'Serviço indisponível por férias ou dia de adaptação.';
  end if;

  update public.escala_servicos
  set marcacao=left(coalesce(nullif(trim(p_marcacao),''),'SV'),8),
      observacao=nullif(trim(coalesce(p_observacao,'')),''),
      folgas_geradas=0,
      atualizado_por=p_usuario_id,
      atualizado_por_perfil_id=p_perfil_id,
      atualizado_em=now()
  where grupo=p_grupo and usuario_id=p_usuario_id and data_servico=p_data_servico
  returning id into v_id;

  if v_id is null then
    insert into public.escala_servicos(
      grupo,usuario_id,data_servico,marcacao,folgas_geradas,observacao,
      criado_por,criado_por_perfil_id,atualizado_por,atualizado_por_perfil_id
    ) values(
      p_grupo,p_usuario_id,p_data_servico,left(coalesce(nullif(trim(p_marcacao),''),'SV'),8),0,
      nullif(trim(coalesce(p_observacao,'')),''),p_usuario_id,p_perfil_id,p_usuario_id,p_perfil_id
    ) returning id into v_id;
    v_criado:=true;
  end if;

  select trim(concat_ws(' ',patente,nome_guerra)) into v_nome from public.usuarios where id=p_usuario_id;
  if v_criado then
    insert into public.escala_avisos(servico_id,tipo,usuario_id) values(v_id,'agendado',p_usuario_id) on conflict do nothing;
    insert into public.notificacoes(usuario_id,tipo,titulo,mensagem,referencia_tipo,referencia_id,urgente,destino_url)
    values(p_usuario_id::text,'sistema','Serviço confirmado','Seu serviço de '||to_char(p_data_servico,'DD/MM/YYYY')||' foi confirmado.','escala_servico',v_id::text,false,'pessoal.html');
  end if;
  insert into public.escala_alteracoes(modulo,referencia_id,acao,detalhes,usuario_id,perfil_id)
  values('servico',v_id,case when v_criado then 'Serviço confirmado pelo militar' else 'Serviço alterado pelo militar' end,
    'Militar: '||coalesce(v_nome,'-')||' · Data: '||to_char(p_data_servico,'DD/MM/YYYY'),p_usuario_id,p_perfil_id);
  return v_id;
end;
$$;

create or replace function public.v7_5_9_transferir_meu_servico(
  p_modo text,
  p_grupo text,
  p_data_servico date,
  p_destino_usuario_id bigint,
  p_destino_pessoa_externa_id bigint,
  p_observacao text,
  p_usuario_id bigint,
  p_perfil_id bigint
) returns bigint
language plpgsql
security definer
set search_path=public
as $$
declare
  r public.escala_servicos%rowtype;
  v_origem text;
  v_destino text;
  v_acao text;
begin
  if p_modo not in ('troca','substituicao') then raise exception 'Modo inválido.'; end if;
  if not public.v7_5_9_pode_operar_escala(p_usuario_id,p_perfil_id) then raise exception 'Seu perfil não possui permissão para operar esta escala.'; end if;
  if (p_destino_usuario_id is null)=(p_destino_pessoa_externa_id is null) then raise exception 'Destino inválido.'; end if;

  select * into r from public.escala_servicos s
  where s.grupo=p_grupo and s.data_servico=p_data_servico and s.usuario_id=p_usuario_id
  for update;
  if not found then raise exception 'Seu serviço confirmado não foi encontrado nesta data.'; end if;

  if p_destino_usuario_id is not null then
    if p_destino_usuario_id=p_usuario_id then raise exception 'Escolha outro militar.'; end if;
    if not exists(select 1 from public.escala_integrantes i where i.grupo=p_grupo and i.usuario_id=p_destino_usuario_id and i.ativo=true) then
      raise exception 'O militar escolhido não está ativo nesta escala.';
    end if;
    if exists(
      select 1 from public.pessoal_ferias f where f.usuario_id=p_destino_usuario_id
      and (p_data_servico between f.data_inicio and f.data_fim or p_data_servico=f.data_fim+1)
    ) then raise exception 'O militar escolhido está de férias ou em adaptação nesta data.'; end if;
    select trim(concat_ws(' ',patente,nome_guerra)) into v_destino from public.usuarios where id=p_destino_usuario_id;
  else
    if not exists(select 1 from public.escala_integrantes i where i.grupo=p_grupo and i.pessoa_externa_id=p_destino_pessoa_externa_id and i.ativo=true) then
      raise exception 'O nome escolhido não está ativo nesta escala.';
    end if;
    if exists(
      select 1 from public.pessoal_ferias f where f.pessoa_externa_id=p_destino_pessoa_externa_id
      and (p_data_servico between f.data_inicio and f.data_fim or p_data_servico=f.data_fim+1)
    ) then raise exception 'O nome escolhido está de férias ou em adaptação nesta data.'; end if;
    select trim(concat_ws(' ',patente,nome)) into v_destino from public.pessoal_nomes_externos where id=p_destino_pessoa_externa_id;
  end if;

  select trim(concat_ws(' ',patente,nome_guerra)) into v_origem from public.usuarios where id=p_usuario_id;
  update public.escala_servicos
  set usuario_id=p_destino_usuario_id,
      pessoa_externa_id=p_destino_pessoa_externa_id,
      observacao=case when nullif(trim(coalesce(p_observacao,'')),'') is null then observacao else concat_ws(E'\n',nullif(observacao,''),case when p_modo='troca' then 'Troca: ' else 'Substituição: ' end||trim(p_observacao)) end,
      atualizado_por=p_usuario_id,atualizado_por_perfil_id=p_perfil_id,atualizado_em=now()
  where id=r.id;

  delete from public.escala_avisos where servico_id=r.id;
  if p_destino_usuario_id is not null then
    insert into public.escala_avisos(servico_id,tipo,usuario_id) values(r.id,'agendado',p_destino_usuario_id) on conflict do nothing;
    insert into public.notificacoes(usuario_id,tipo,titulo,mensagem,referencia_tipo,referencia_id,urgente,destino_url)
    values(p_destino_usuario_id::text,'sistema','Serviço recebido','Você assumiu o serviço de '||to_char(p_data_servico,'DD/MM/YYYY')||'.','escala_servico',r.id::text,false,'pessoal.html');
  end if;
  insert into public.notificacoes(usuario_id,tipo,titulo,mensagem,referencia_tipo,referencia_id,urgente,destino_url)
  values(p_usuario_id::text,'sistema','Serviço transferido','Seu serviço de '||to_char(p_data_servico,'DD/MM/YYYY')||' foi transferido para '||coalesce(v_destino,'outro militar')||'.','escala_servico',r.id::text,false,'pessoal.html');
  v_acao:=case when p_modo='troca' then 'Troca de serviço pelo militar' else 'Tirada/substituição de serviço pelo militar' end;
  insert into public.escala_alteracoes(modulo,referencia_id,acao,detalhes,usuario_id,perfil_id)
  values('servico',r.id,v_acao,'Saiu: '||coalesce(v_origem,'-')||' · Entrou: '||coalesce(v_destino,'-')||' · Data: '||to_char(p_data_servico,'DD/MM/YYYY'),p_usuario_id,p_perfil_id);
  return r.id;
end;
$$;