(()=>{
'use strict';
if(window.__TAREFAS_ORC_LOADER_V242__)return;
window.__TAREFAS_ORC_LOADER_V242__=true;
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
const files=map[mod]||map.relatorio;
window.__TAREFAS_ORC_ACTIVE_MODULE__=mod;
function load(src){return new Promise((resolve,reject)=>{if(document.querySelector(`script[data-orc242-src="${src}"]`))return resolve();const s=document.createElement('script');s.src=`${src}?v=2.3.12-b242`;s.defer=true;s.async=false;s.dataset.orc242Src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Falha ao carregar '+src));document.body.appendChild(s)})}
(async()=>{try{for(const f of files)await load(f);document.documentElement.dataset.orc242Loaded=mod}catch(e){console.error('[ORC 242 loader]',e);const el=document.getElementById('rRecentList')||document.getElementById('guiaList')||document.getElementById('pedidoList')||document.getElementById('movList')||document.getElementById('cargaRefList')||document.getElementById('passagemList');if(el)el.innerHTML='<div class="orc-empty">Falha ao abrir este módulo. Atualize a tela e tente novamente.</div>'}})();
})();
