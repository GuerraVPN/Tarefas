(()=>{
'use strict';
if(window.__TAREFAS_ORC_LOADER_V243__)return;
window.__TAREFAS_ORC_LOADER_V243__=true;
if((location.pathname.split('/').pop()||'').toLowerCase()!=='orcamentarios.html')return;

const p=new URLSearchParams(location.search);
let mod=p.get('modulo')||'relatorio';
if(p.get('movimentacao'))mod='movimentacao';
else if(p.get('passagem'))mod='passagem_carga';
else if(p.get('guia'))mod='guias';
else if(p.get('pedido')&&!p.get('modulo'))mod='pedido';

const map={
 relatorio:['orcamentarios_relatorio_light.js'],
 guias:['guias_v6.js'],
 baixas:['pedidos_v6.js'],
 distribuicao:['pedidos_v6.js'],
 pedido:['pedidos_v6.js'],
 movimentacao:['movimentacoes_v6.js'],
 material_carga:['material_carga_v6.js','v7_7_0_material_carga.js'],
 passagem_carga:['passagem_carga_v6.js'],
 lavanderia:['lavanderia_v211.js','lavanderia_financeiro_v212.js','lavanderia_pagamento_v767.js','lavanderia_documento_v762.js']
};
if(!map[mod])mod='relatorio';
window.__TAREFAS_ORC_ACTIVE_MODULE__=mod;

const moduleIds={
 relatorio:'reportModule',guias:'guiasModule',baixas:'pedidosModule',distribuicao:'pedidosModule',pedido:'pedidosModule',
 movimentacao:'movimentacaoModule',material_carga:'materialCargaModule',passagem_carga:'passagemCargaModule',lavanderia:'lavanderiaModule'
};
const titles={
 relatorio:['Orçamentários · Relatório','Visão geral das guias, baixas, distribuições e movimentações.'],
 guias:['Orçamentários · Guias','Guias, fiscalização, documentos e andamento.'],
 baixas:['Orçamentários · Desrelacionamento / Baixa','Pedidos de baixa e desrelacionamento de material.'],
 distribuicao:['Orçamentários · Distribuição','Distribuição de material entre depósitos e dependências.'],
 pedido:['Orçamentários · Pedido','Detalhes do pedido orçamentário.'],
 movimentacao:['Orçamentários · Movimentação','Movimentação de material entre dependências.'],
 material_carga:['Orçamentários · Material Carga / Depósito','Relações de carga, depósitos, detentores e conferências.'],
 passagem_carga:['Orçamentários · Passagem de Carga','Histórico e troca formal de detentores.'],
 lavanderia:['Orçamentários · Lavanderia','Controle de lavanderia e documentos relacionados.']
};

function applyView(){
 const active=moduleIds[mod];
 for(const id of new Set(Object.values(moduleIds))){const el=document.getElementById(id);if(el)el.hidden=id!==active}
 const [title,sub]=titles[mod]||titles.relatorio;
 const t=document.getElementById('orcPageTitle'),s=document.getElementById('orcPageSubtitle');if(t)t.textContent=title;if(s)s.textContent=sub;
 document.querySelectorAll('[data-orc-module]').forEach(b=>b.classList.toggle('active',b.dataset.orcModule===mod));
}
function alreadyLoaded(src){return [...document.scripts].some(s=>{try{return new URL(s.src,location.href).pathname.split('/').pop()===src}catch{return false}})}
function load(src){return new Promise((resolve,reject)=>{
 if(alreadyLoaded(src))return resolve();
 const s=document.createElement('script');s.src=`${src}?v=2.3.13-b243`;s.async=false;s.dataset.orc243Src=src;
 s.onload=resolve;s.onerror=()=>reject(new Error('Falha ao carregar '+src));document.body.appendChild(s);
})}
function errorTarget(){return document.getElementById('rRecentList')||document.getElementById('guiaList')||document.getElementById('pedidoList')||document.getElementById('movList')||document.getElementById('cargaRefList')||document.getElementById('passagemList')}

(async()=>{
 applyView();
 try{
  for(const f of map[mod])await load(f);
  applyView();
  document.documentElement.dataset.orc243Loaded=mod;
 }catch(e){
  console.error('[ORC 243 loader]',e);const el=errorTarget();if(el)el.innerHTML='<div class="orc-empty">Falha ao abrir este módulo. Atualize a tela e tente novamente.</div>';
 }
})();
})();