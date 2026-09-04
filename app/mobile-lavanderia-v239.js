(()=>{
'use strict';
const MARK='__TAREFAS_ANDROID_239_LAV_CIA_DEDUPE__';
if(window[MARK])return;window[MARK]=true;
function apply(){
  const pending=document.getElementById('lavDebtPending');
  const summary=document.querySelector('#lavDebtsView .lav-debt-summary');
  if(pending){
    const card=pending.closest('.lav-debt-card');
    if(card)card.remove();
  }
  if(summary){
    summary.style.gridTemplateColumns='1fr';
    summary.dataset.v239CiaDedupe='1';
  }
  const count=document.getElementById('lavDebtCount');
  if(count){
    const label=count.closest('.lav-debt-card')?.querySelector('small');
    if(label)label.textContent='REGISTROS DE DÉBITO';
  }
}
function boot(){apply();const obs=new MutationObserver(()=>apply());obs.observe(document.body,{subtree:true,childList:true});document.addEventListener('click',e=>{if(e.target.closest('[data-orc-module="lavanderia"],[data-lav-tab="debitos"]'))setTimeout(apply,40)});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
