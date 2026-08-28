-- TAREFAS V7.5
-- Edição: já é suportada pelas RPCs atuais v7_2_3_definir_servico /
-- v7_4_2_definir_servico_canil, que fazem UPDATE e auditam "Serviço alterado".
-- Esta migration acrescenta EXCLUSÃO segura e auditada.

create or replace function public.v7_5_excluir_servico(
  p_grupo text,
  p_usuario_alvo_id bigint,
  p_pessoa_externa_id bigint,
  p_data_servico date,
  p_usuario_id bigint,
  p_perfil_id bigint
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_nome text;
  v_grupo_nome text;
  v_marcacao text;
  v_observacao text;
  v_qtd integer;
begin
  if not public.v7_2_pode_gerenciar_pessoal(p_usuario_id,p_perfil_id) then
    raise exception 'Somente a 1ª Seção ou Admin pode alterar a escala.';
  end if;
  if p_grupo not in ('sargento','motorista','patrulheiro','permanencia','canil') then raise exception 'Escala inválida.'; end if;
  if p_data_servico is null then raise exception 'Informe a data do serviço.'; end if;
  if (p_usuario_alvo_id is null)=(p_pessoa_externa_id is null) then raise exception 'Informe exatamente uma pessoa.'; end if;
  select count(*) into v_qtd from public.escala_servicos s where s.grupo=p_grupo and s.data_servico=p_data_servico and ((p_usuario_alvo_id is not null and s.usuario_id=p_usuario_alvo_id) or (p_pessoa_externa_id is not null and s.pessoa_externa_id=p_pessoa_externa_id));
  if v_qtd=0 then raise exception 'Serviço não encontrado ou já excluído.'; elsif v_qtd>1 then raise exception 'Foram encontrados serviços duplicados para esta pessoa/data. Corrija a duplicidade antes de excluir.'; end if;
  select s.id,s.marcacao,s.observacao into v_id,v_marcacao,v_observacao from public.escala_servicos s where s.grupo=p_grupo and s.data_servico=p_data_servico and ((p_usuario_alvo_id is not null and s.usuario_id=p_usuario_alvo_id) or (p_pessoa_externa_id is not null and s.pessoa_externa_id=p_pessoa_externa_id)) for update;
  v_grupo_nome:=case p_grupo when 'sargento' then 'Sargentos' when 'motorista' then 'Motoristas' when 'patrulheiro' then 'Patrulheiros' when 'permanencia' then 'Permanência' when 'canil' then 'Permanência/Canil' end;
  if p_usuario_alvo_id is not null then select trim(concat_ws(' ',u.patente,u.nome_guerra)) into v_nome from public.usuarios u where u.id=p_usuario_alvo_id; else select trim(concat_ws(' ',e.patente,e.nome)) into v_nome from public.pessoal_nomes_externos e where e.id=p_pessoa_externa_id; end if;
  delete from public.escala_servicos where id=v_id;
  insert into public.escala_alteracoes(modulo,referencia_id,acao,detalhes,usuario_id,perfil_id) values('servico',v_id,'Serviço excluído','Militar: '||coalesce(v_nome,'-')||' · Escala: '||v_grupo_nome||' · Data: '||to_char(p_data_servico,'DD/MM/YYYY')||' · Marcação: '||coalesce(v_marcacao,'SV')||case when nullif(trim(coalesce(v_observacao,'')),'') is null then '' else ' · Obs. anterior: '||trim(v_observacao) end,p_usuario_id,p_perfil_id);
  if p_usuario_alvo_id is not null then insert into public.notificacoes(usuario_id,tipo,titulo,mensagem,referencia_tipo,referencia_id,urgente,destino_url) values(p_usuario_alvo_id::text,'sistema','Serviço cancelado','Seu serviço de '||v_grupo_nome||' em '||to_char(p_data_servico,'DD/MM/YYYY')||' foi cancelado.','escala_servico_excluido',v_id::text,false,'pessoal.html'); end if;
  return v_id;
end;
$$;

grant execute on function public.v7_5_excluir_servico(text,bigint,bigint,date,bigint,bigint) to anon, authenticated;