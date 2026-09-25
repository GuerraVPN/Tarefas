(function(){
'use strict';
if(window.__TAREFAS_WEB_794__)return;
window.__TAREFAS_WEB_794__=true;
const VERSION='7.9.4';
function apply(){
  const flow=document.querySelector('#movDetail .pedido-subhead span:first-child');
  if(flow)flow.textContent='Como anda o processo';
  document.querySelectorAll('#movList .pedido-card .pedido-status.info').forEach(el=>{
    if(el.textContent.trim()==='Movimentação')el.textContent='Como anda o processo';
  });
  document.querySelectorAll('#movDetail .pedido-status.info').forEach(el=>{
    if(el.textContent.trim()==='Movimentação')el.textContent='Como anda o processo';
  });
  document.querySelectorAll('.v65-version-badge').forEach(b=>{
    const t='● TAREFAS v'+VERSION;if(b.textContent!==t)b.textContent=t;
    b.title='Sobre a versão '+VERSION;
  });
  document.querySelectorAll('.v65-mobile-version').forEach(v=>{
    const t='v'+VERSION;if(v.textContent!==t)v.textContent=t;
  });
  const games=document.getElementById('gamesVersionLabel');
  if(games)games.textContent='WEB '+VERSION+' · 26º PEL PE MEC';
}
function init(){
  apply();
  const obs=new MutationObserver(()=>apply());
  obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  setTimeout(()=>obs.disconnect(),15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();