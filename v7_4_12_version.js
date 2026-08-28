(function(){
'use strict';
const VERSION='7.5';
function ensureServiceEditor(){
 const page=(location.pathname.split('/').pop()||'').toLowerCase();
 if(page!=='pessoal.html'||window.__TAREFAS_V75_SERVICE_EDITOR__)return;
 if(document.querySelector('script[src*="v7_5_service_editor.js"]'))return;
 const s=document.createElement('script');s.src='v7_5_service_editor.js?v=7.5';s.defer=true;document.head.appendChild(s);
}
function apply(){
 document.documentElement.dataset.tarefasVersion=VERSION;
 document.querySelectorAll('.v65-version-badge').forEach(b=>{
  const t='● TAREFAS v'+VERSION;
  if(b.textContent!==t)b.textContent=t;
  b.title='Sobre a versão '+VERSION;
 });
 document.querySelectorAll('.v65-mobile-version').forEach(v=>{
  const t='v'+VERSION;if(v.textContent!==t)v.textContent=t;
 });
 ensureServiceEditor();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
setInterval(apply,750);
})();