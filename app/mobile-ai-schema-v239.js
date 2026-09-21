(()=>{
'use strict';
const MARK='__TAREFAS_ANDROID_239_AI_SCHEMA_HINTS__';
if(window[MARK])return;window[MARK]=true;
const nativeFetch=window.fetch.bind(window);
const SCHEMA=`[SCHEMA TAREFAS 2.3.9 — use SOMENTE estes nomes canônicos quando consultar estes módulos]
pedidos_orcamentarios: id, numero, data_pedido, tipo, categoria, dependencia_origem, deposito_origem, dependencia_destino, motivo, observacoes, status, retorno_motivo, valor_total, criado_por, criado_por_perfil_id, secao_criador, posicao_criador, legado_baixa_id, criado_em, atualizado_em, pronto_em. Desrelacionamento usa tipo=desrelacionamento_baixa. NÃO use codigo/descricao/data_criacao em consultas novas.
guias_orcamentarias: id, numero, data_guia, om_origem, om_destino, assunto, tipo, status, situacao_fiscalizacao, criado_por, criado_por_perfil_id, fiscal_responsavel_usuario_id, fiscal_responsavel_perfil_id, observacao_fiscalizacao, despachada_fiscalizacao_em, ciencia_fiscalizacao_em, aprovada_fiscalizacao_em, devolvida_fiscalizacao_em, pronto_em, criado_em, atualizado_em, deposito_destino, etapa_orcamentaria. Guia NÃO possui valor financeiro próprio. NÃO use numero_guia/valor em consultas novas.
orc_depositos: id, nome, ordem, ativo, criado_em, atualizado_em.
orc_passagens_carga: id, dependencia, data_passagem, detentor_anterior_usuario_id, detentor_anterior_perfil_id, novo_detentor_usuario_id, novo_detentor_perfil_id, status, observacoes, criado_por, criado_por_perfil_id, criado_em, atualizado_em, concluido_em. NÃO use detentor_origem.
Se o usuário pedir orçamento, pedidos, guias, depósitos, desrelacionamentos ou passagens/transferências de carga, prefira estes campos e não invente colunas.]`;
function target(input){const u=typeof input==='string'?input:String(input?.url||'');return /\/functions\/v1\/tarefas-ai(?:-files)?(?:\?|$)/.test(u)}
window.fetch=async function(input,init){
  try{
    if(target(input)&&init?.method?.toUpperCase()==='POST'&&typeof init.body==='string'){
      const body=JSON.parse(init.body);
      if(body&&typeof body.prompt==='string'&&!body.confirm_action&&!body.cancel_action&&!body.prompt.includes('[SCHEMA TAREFAS 2.3.9')){
        body.prompt=(SCHEMA+'\n\nPEDIDO DO USUÁRIO:\n'+body.prompt).slice(0,4000);
        init={...init,body:JSON.stringify(body)};
      }
    }
  }catch(e){console.warn('[TAREFAS 2.3.9 AI SCHEMA]',e)}
  return nativeFetch(input,init);
};
})();
