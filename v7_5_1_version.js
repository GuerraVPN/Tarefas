(function(){
'use strict';
if(window.__TAREFAS_V754_VERSION__)return;
window.__TAREFAS_V754_VERSION__=true;
const VERSION='7.5.4',BADGE='● TAREFAS v'+VERSION;
let busy=false;
function addPatch(){
 if(window.__TAREFAS_V754_PATCH__||document.querySelector('script[src*="v7_5_4_patch.js"]'))return;
 const s=document.createElement('script');s.src='v7_5_4_patch.js?v=7.5.4';s.defer=true;document.head.appendChild(s);
}
function ensureLabels(){
 const page=(location.pathname.split('/').pop()||'').toLowerCase();
 if(page!=='pessoal.html'||window.__TAREFAS_V752_SERVICE_LABELS__)return;
 if(document.querySelector('script[src*="v7_5_2_service_labels.js"]'))return;
 const s=document.createElement('script');s.src='v7_5_2_service_labels.js?v=7.5.4';s.defer=true;document.head.appendChild(s);
}
function apply(){
 if(busy)return;busy=true;
 try{
  document.documentElement.dataset.tarefasVersion=VERSION;
  document.querySelectorAll('.v65-version-badge').forEach(b=>{if(b.textContent!==BADGE)b.textContent=BADGE;b.title='Sobre a versão '+VERSION});
  document.querySelectorAll('.v65-mobile-version').forEach(v=>{const t='v'+VERSION;if(v.textContent!==t)v.textContent=t});
  const siteTitle=document.querySelector('#v7412Modal h3');if(siteTitle)siteTitle.textContent='Painel SITE · V'+VERSION;
  ensureLabels();addPatch();
 }finally{busy=false}
}
function watch(){apply();const obs=new MutationObserver(()=>queueMicrotask(apply));obs.observe(document.body,{subtree:true,childList:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
window.addEventListener('focus',apply);setInterval(apply,5000);
})();