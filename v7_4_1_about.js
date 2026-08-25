(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
function init(){
 const release={v:'7.4.1',title:'Filtros, PDF e ordem das escalas',current:true,items:['Escala de Serviço e Escala de Missão com visualização Hoje, Amanhã, Esta semana, Mês e Ano.','Geração de PDF por tabelas selecionadas.','Ordem automática ao adicionar militar às escalas.','Setas para subir ou descer militares no rodízio.']};
 try{
  if(typeof versions!=='undefined'&&Array.isArray(versions)){
   versions.forEach(x=>{if(x&&x.current)x.current=false});
   if(!versions.some(x=>x.v==='7.4.1'))versions.unshift(release);else Object.assign(versions.find(x=>x.v==='7.4.1'),release);
   const sel=document.getElementById('versionSelect');
   if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value='7.4.1';if(typeof sel.onchange==='function')sel.onchange()}
  }
 }catch(e){console.warn('V7.4.1 About:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));
 if(meta)meta.querySelector('b').textContent='7.4.1';
 const c=document.getElementById('versionCard');
 if(c&&!c.textContent.includes('7.4.1'))c.innerHTML='<h3>Versão 7.4.1 <span class="tag">ATUAL</span></h3><p><b>Filtros, PDF e ordem das escalas</b></p><ul><li>Hoje, Amanhã, Esta semana, Mês e Ano.</li><li>PDF por tabelas selecionadas.</li><li>Ordem automática ao adicionar militar.</li><li>Setas para subir/descer no rodízio.</li></ul>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
