(function(){
'use strict';
const VERSION='7.5';
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
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
setInterval(apply,750);
})();