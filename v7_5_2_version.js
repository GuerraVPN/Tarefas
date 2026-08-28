(function(){
'use strict';
if(window.__TAREFAS_V752_VERSION__)return;
window.__TAREFAS_V752_VERSION__=true;
const VERSION='7.5.2',BADGE='● TAREFAS v'+VERSION;
let busy=false;
function ensureLabels(){
 const page=(location.pathname.split('/').pop()||'').toLowerCase();
 if(page!=='pessoal.html'||window.__TAREFAS_V752_SERVICE_LABELS__)return;
 if(document.querySelector('script[src*="v7_5_2_service_labels.js"]'))return;
 const s=document.createElement('script');s.src='v7_5_2_service_labels.js?v=7.5.2';s.defer=true;document.head.appendChild(s);
}
function apply(){
 if(busy)return;busy=true;
 try{
  if(document.documentElement.dataset.tarefasVersion!==VERSION)document.documentElement.dataset.tarefasVersion=VERSION;
  document.querySelectorAll('.v65-version-badge').forEach(b=>{if(b.textContent!==BADGE)b.textContent=BADGE;const title='Sobre a versão '+VERSION;if(b.title!==title)b.title=title});
  document.querySelectorAll('.v65-mobile-version').forEach(v=>{const t='v'+VERSION;if(v.textContent!==t)v.textContent=t});
  const siteTitle=document.querySelector('#v7412Modal h3');
  const title='Painel SITE · V'+VERSION;
  if(siteTitle&&siteTitle.textContent!==title)siteTitle.textContent=title;
  ensureLabels();
 }finally{busy=false}
}
function watch(){
 apply();
 // Mantém compatibilidade com o site, mas só altera conteúdo quando realmente mudou.
 const obs=new MutationObserver(()=>queueMicrotask(apply));
 obs.observe(document.body,{subtree:true,childList:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
window.addEventListener('focus',apply);setInterval(apply,5000);
})();