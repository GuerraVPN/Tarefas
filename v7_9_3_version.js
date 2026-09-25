(function(){
'use strict';
if(window.__TAREFAS_V793_VERSION__)return;
window.__TAREFAS_V793_VERSION__=true;
const VERSION='7.9.3',BADGE='● TAREFAS v'+VERSION;
function apply(){
  document.documentElement.dataset.tarefasVersion=VERSION;
  document.querySelectorAll('.v65-version-badge').forEach(b=>{
    if(b.textContent!==BADGE)b.textContent=BADGE;
    b.title='Sobre a versão '+VERSION;
  });
  document.querySelectorAll('.v65-mobile-version').forEach(v=>{
    const t='v'+VERSION;
    if(v.textContent!==t)v.textContent=t;
  });
  const games=document.getElementById('gamesVersionLabel');
  if(games)games.textContent='WEB '+VERSION+' · 26º PEL PE MEC';
  const siteTitle=document.querySelector('#site791Modal h3,#v7412Modal h3');
  if(siteTitle)siteTitle.textContent='Painel SITE · V'+VERSION;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.addEventListener('focus',apply);
window.addEventListener('pageshow',apply);
})();