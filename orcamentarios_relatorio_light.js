(function(){
'use strict';
if(window.__TAREFAS_ORC_REPORT_LIGHT__)return;
window.__TAREFAS_ORC_REPORT_LIGHT__=true;
const page=(location.pathname.split('/').pop()||'').toLowerCase();
if(page!=='orcamentarios.html')return;
const params=new URLSearchParams(location.search);
if(params.get('modulo')||params.get('pedido')||params.get('movimentacao')||params.get('passagem'))return;

const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
const dt=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
const STATUS={
 pedido:'Pedido',aguardando_aprovacao:'Aguardando aprovação',retornado:'Retornado',aprovado:'Aprovado',
 encaminhado_base:'Encaminhado à Base Administrativa',retornado_base:'Retornado pela Base Administrativa',
 aprovado_base:'Aprovado pela Base Administrativa',pronto:'Pronto',encaminhado_fiscal:'Encaminhado ao Fiscal',
 retornado_fiscal:'Retornado pela Fiscalização',aguardando_diex:'Aguardando DIEx do material'
};
const MOV_STATUS={
 encaminhado_fiscal:'Encaminhado ao Fiscal',retornado_fiscal:'Retornado pela Fiscalização',
 aguardando_aprovacao_detentor:'Aguardando aprovação do detentor',aguardando_aprovacao_cmt:'Aguardando aprovação do Cmt',
 aguardando_assinatura_detentor:'Aguardando assinatura do detentor',aguardando_assinatura_cmt:'Aguardando assinatura do Cmt',
 encaminhado_base:'Encaminhado à Base',pronto:'Pronto'
};
function dataOf(result){return result?.status==='fulfilled'&&!result.value?.error?(result.value?.data||[]):[]}
function setText(id,value){const el=$(id);if(el)el.textContent=String(value)}
function ensureReportView(){
 ['guiasModule','pedidosModule','movimentacaoModule','materialCargaModule','passagemCargaModule','lavanderiaModule'].forEach(id=>{const el=$(id);if(el)el.hidden=true});
 const report=$('reportModule');if(report)report.hidden=false;
 setText('orcPageTitle','Orçamentários · Relatório');
 setText('orcPageSubtitle','Visão geral das guias, baixas, distribuições e movimentações.');
}
async function start(){
 ensureReportView();
 const recent=$('rRecentList');if(recent)recent.innerHTML='<div class="orc-empty">Carregando relatório...</div>';
 if(typeof supabaseClient==='undefined'){
   if(recent)recent.innerHTML='<div class="orc-empty">Banco de dados indisponível.</div>';
   return;
 }
 try{
   const results=await Promise.allSettled([
     supabaseClient.from('pedidos_orcamentarios').select('id,numero,tipo,status,valor_total,atualizado_em').order('atualizado_em',{ascending:false}).limit(1000),
     supabaseClient.from('guias_orcamentarias').select('id,numero,status,situacao_fiscalizacao,etapa_orcamentaria,atualizado_em').order('atualizado_em',{ascending:false}).limit(1000),
     supabaseClient.from('movimentacoes_material').select('id,numero,status,valor_total,dependencia_origem,dependencia_destino,atualizado_em').order('atualizado_em',{ascending:false}).limit(1000),
     supabaseClient.from('orc_documentos_carga').select('tipo_referencia,referencia,versao').limit(1000),
     supabaseClient.from('orc_passagens_carga').select('id,status,dependencia').limit(500),
     supabaseClient.from('orc_detentores_carga').select('dependencia').limit(100)
   ]);
   const pedidos=dataOf(results[0]),guias=dataOf(results[1]),movs=dataOf(results[2]);
   const docs=dataOf(results[3]),passagens=dataOf(results[4]),detentores=dataOf(results[5]);
   const baixas=pedidos.filter(x=>x.tipo==='desrelacionamento_baixa');
   const dist=pedidos.filter(x=>x.tipo==='distribuicao');
   const sum=a=>a.reduce((s,x)=>s+(Number(x.valor_total)||0),0);

   setText('rGuiasTotal',guias.length);
   setText('rGuiasFiscal',guias.filter(x=>['aguardando_fiscalizacao','em_analise_fiscalizacao'].includes(x.situacao_fiscalizacao)).length);
   setText('rGuiasPronto',guias.filter(x=>x.etapa_orcamentaria==='pronto').length);
   setText('rBaixasTotal',baixas.length);
   setText('rBaixasAndamento',baixas.filter(x=>x.status!=='pronto').length);
   setText('rBaixasPronto',baixas.filter(x=>x.status==='pronto').length);
   setText('rBaixasValor',money(sum(baixas)));
   setText('rDistribTotal',dist.length);
   setText('rDistribFiscal',dist.filter(x=>x.status==='encaminhado_fiscal').length);
   setText('rDistribPronto',dist.filter(x=>x.status==='pronto').length);
   setText('rDistribValor',money(sum(dist)));
   setText('rMovTotal',movs.length);
   setText('rMovFiscal',movs.filter(x=>x.status==='encaminhado_fiscal').length);
   setText('rMovPronto',movs.filter(x=>x.status==='pronto').length);
   setText('rMovValor',money(sum(movs)));
   const cargaKeys=new Set(docs.map(x=>`${x.tipo_referencia}|${x.referencia}`));
   setText('rCargaDocs',cargaKeys.size);
   setText('rCargaPendentes',Math.max(0,14-cargaKeys.size));
   setText('rPassagens',passagens.length);
   setText('rPassagensAndamento',passagens.filter(x=>x.status==='em_andamento').length);
   setText('rDetentores',detentores.length);
   setText('rFiscalTotal',
     guias.filter(x=>['aguardando_fiscalizacao','em_analise_fiscalizacao'].includes(x.situacao_fiscalizacao)).length+
     dist.filter(x=>x.status==='encaminhado_fiscal').length+
     movs.filter(x=>x.status==='encaminhado_fiscal').length
   );

   const rows=[
     ...guias.map(x=>({tipo:'Guia',nome:`Guia ${x.numero}`,estado:STATUS[x.status]||x.status,data:x.atualizado_em})),
     ...baixas.map(x=>({tipo:'Baixa / Desrelacionamento',nome:`Pedido nº ${x.numero}`,estado:STATUS[x.status]||x.status,data:x.atualizado_em})),
     ...dist.map(x=>({tipo:'Distribuição',nome:`Pedido nº ${x.numero}`,estado:STATUS[x.status]||x.status,data:x.atualizado_em})),
     ...movs.map(x=>({tipo:'Movimentação',nome:x.numero,estado:MOV_STATUS[x.status]||x.status,data:x.atualizado_em}))
   ].sort((a,b)=>new Date(b.data||0)-new Date(a.data||0)).slice(0,12);
   if(recent)recent.innerHTML=rows.length?rows.map(x=>`<div class="orc-report-row"><span>${esc(x.tipo)}</span><b>${esc(x.nome)} · ${esc(x.estado||'-')}</b><time>${esc(dt(x.data))}</time></div>`).join(''):'<div class="orc-empty">Ainda não há registros no Orçamentários.</div>';
   setText('reportUpdated','Atualizado em '+new Date().toLocaleString('pt-BR'));
 }catch(err){
   console.error('Relatório Orçamentário leve:',err);
   if(recent)recent.innerHTML=`<div class="orc-empty">Não foi possível montar o relatório:<br>${esc(err?.message||err)}</div>`;
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
