(function(){
'use strict';
if(window.__TAREFAS_WEB_794__)return;
window.__TAREFAS_WEB_794__=true;
const VERSION='7.9.4';
let scheduled=false;
function setText(el,text){
  if(el && el.textContent.trim()!==text){el.textContent=text;return true}
  return false;
}
function apply(){
  setText(document.getElementById('movFlowHint'),'Como anda o processo');
  document.querySelectorAll('#movList .pedido-card .pedido-status.info,#movDetail .pedido-status.info').forEach(el=>{
    if(el.textContent.trim()==='Movimentação')el.textContent='Como anda o processo';
  });
  document.querySelectorAll('.v65-version-badge').forEach(b=>{
    const t='● TAREFAS v'+VERSION;
    if(b.textContent!==t)b.textContent=t;
    b.title='Sobre a versão '+VERSION;
  });
  document.querySelectorAll('.v65-mobile-version').forEach(v=>{
    const t='v'+VERSION;
    if(v.textContent!==t)v.textContent=t;
  });
  const games=document.getElementById('gamesVersionLabel');
  if(games)games.textContent='WEB '+VERSION+' · 26º PEL PE MEC';
}
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;apply()});
}
function init(){
  apply();
  const obs=new MutationObserver(muts=>{
    if(muts.some(m=>m.type==='childList'))schedule();
  });
  obs.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();