(function(){
'use strict';
if(window.__TAREFAS_WEB_794__)return;
window.__TAREFAS_WEB_794__=true;
const VERSION='7.9.4';
function apply(){
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
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();