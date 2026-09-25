(function(){
'use strict';
if(window.__TAREFAS_WEB_795_FORNECIMENTO__)return;
window.__TAREFAS_WEB_795_FORNECIMENTO__=true;
const VERSION='7.9.5';
const typeLabel=v=>v==='transferencia'?'Transferência':v==='remessa'?'Remessa':v==='fornecimento'?'Fornecimento':'Recolhimento';
window.typeLabel=typeLabel;
function add(id){
 const s=document.getElementById(id);
 if(!s||[...s.options].some(o=>o.value==='fornecimento'))return;
 const ref=[...s.options].find(o=>o.value==='recolhimento');
 const o=document.createElement('option');o.value='fornecimento';o.textContent='Fornecimento';
 ref?s.insertBefore(o,ref):s.appendChild(o);
}
function apply(){
 add('gTipo');add('tipoFilter');
 document.documentElement.dataset.tarefasVersion=VERSION;
 document.querySelectorAll('.v65-version-badge').forEach(b=>{b.textContent='● TAREFAS v'+VERSION;b.title='Sobre a versão '+VERSION});
 document.querySelectorAll('.v65-mobile-version').forEach(v=>v.textContent='v'+VERSION);
 const games=document.getElementById('gamesVersionLabel');
 if(games)games.textContent='WEB '+VERSION+' · 26º PEL PE MEC';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();