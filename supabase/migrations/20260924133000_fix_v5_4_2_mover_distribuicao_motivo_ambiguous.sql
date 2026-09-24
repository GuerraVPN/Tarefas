-- TAREFAS: corrige ambiguidade da variável motivo na aprovação da Distribuição.
-- A função tinha uma variável PL/pgSQL chamada motivo e a tabela pedidos_orcamentarios
-- também possui a coluna motivo. O UPDATE final podia falhar com "column reference motivo is ambiguous".

create or replace function public.v5_4_2_mover_distribuicao(
  p_pedido_id bigint,p_acao text,p_usuario_id text,p_perfil_id bigint,p_mensagem text default null
) returns void language plpgsql as $function$
declare
  p public.pedidos_orcamentarios%rowtype;
  novo text; ev text; v_motivo text;
begin
  select * into p from public.pedidos_orcamentarios where id=p_pedido_id for update;
  if not found then raise exception 'Pedido não encontrado.'; end if;
  if p.tipo<>'distribuicao' then raise exception 'Este pedido não é de Distribuição.'; end if;
  if p_acao='aprovar_fiscal' then
    if not public.v5_4_2_eh_fiscalizacao(p_usuario_id,p_perfil_id) then raise exception 'Somente Chefe/Auxiliar da Fiscalização pode aprovar.'; end if;
    if p.status<>'encaminhado_fiscal' then raise exception 'A Distribuição não está aguardando Fiscalização.'; end if;
    novo:='aguardando_diex'; ev:='distribuicao_aprovada_fiscal'; v_motivo:=null;
  elsif p_acao='retornar_fiscal' then
    if not public.v5_4_2_eh_fiscalizacao(p_usuario_id,p_perfil_id) then raise exception 'Somente Chefe/Auxiliar da Fiscalização pode retornar.'; end if;
    if p.status<>'encaminhado_fiscal' then raise exception 'A Distribuição não está aguardando Fiscalização.'; end if;
    if nullif(trim(coalesce(p_mensagem,'')),'') is null then raise exception 'Informe o motivo do retorno.'; end if;
    novo:='retornado_fiscal'; ev:='distribuicao_retornada_fiscal'; v_motivo:=trim(p_mensagem);
  elsif p_acao='reenviar_fiscal' then
    if not public.v5_4_2_pode_operar(p_usuario_id,p_perfil_id,p.criado_por) then raise exception 'Somente o criador ou Admin pode reenviar.'; end if;
    if p.status<>'retornado_fiscal' then raise exception 'A Distribuição não está retornada pela Fiscalização.'; end if;
    novo:='encaminhado_fiscal'; ev:='distribuicao_reenviada_fiscal'; v_motivo:=null;
  elsif p_acao='diex_pronto' then
    if not public.v5_4_2_pode_operar(p_usuario_id,p_perfil_id,p.criado_por) then raise exception 'Somente o criador ou Admin pode registrar o DIEx.'; end if;
    if p.status<>'aguardando_diex' then raise exception 'A Distribuição não está aguardando DIEx.'; end if;
    novo:='encaminhado_base'; ev:='distribuicao_encaminhada_base'; v_motivo:=null;
  elsif p_acao='pronto' then
    if not public.v5_4_2_pode_operar(p_usuario_id,p_perfil_id,p.criado_por) then raise exception 'Somente o criador ou Admin pode concluir.'; end if;
    if p.status<>'encaminhado_base' then raise exception 'A Distribuição precisa estar encaminhada à Base.'; end if;
    novo:='pronto'; ev:='distribuicao_concluida'; v_motivo:=null;
  else
    raise exception 'Ação inválida para Distribuição.';
  end if;
  update public.pedidos_orcamentarios set status=novo,retorno_motivo=v_motivo where id=p_pedido_id;
  insert into public.pedido_orcamentario_tramitacoes(pedido_id,evento,mensagem,status_anterior,status_novo,usuario_id,perfil_id)
  values(p_pedido_id,ev,p_mensagem,p.status,novo,p_usuario_id,p_perfil_id);
end;
$function$;
