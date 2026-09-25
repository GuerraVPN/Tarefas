(function(){
'use strict';
if(window.__TAREFAS_WEB_796_USUARIOS__)return;
window.__TAREFAS_WEB_796_USUARIOS__=true;
const VERSION='7.9.6';

function fix(){
  const link=document.querySelector('.v7-pessoal-parent [data-v793-link="usuarios"]');
  if(!link)return false;

  link.style.pointerEvents='auto';
  link.style.position='relative';
  link.style.zIndex='20';
  link.setAttribute('role','link');
  link.setAttribute('aria-label','Abrir Usuários');

  if(link.dataset.v796Wired==='1')return true;
  link.addEventListener('pointerdown',e=>{
    e.stopPropagation();
  },true);
  link.addEventListener('click',e=>{
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    window.location.assign('usuarios.html');
  },true);
  link.dataset.v796Wired='1';
  return true;
}

function stamp(){
  document.documentElement.dataset.tarefasVersion=VERSION;
  document.querySelectorAll('.v65-version-badge').forEach(b=>{
    b.textContent='● TAREFAS v'+VERSION;
    b.title='Sobre a versão '+VERSION;
  });
  document.querySelectorAll('.v65-mobile-version').forEach(v=>v.textContent='v'+VERSION);
  const g=document.getElementById('gamesVersionLabel');
  if(g)g.textContent='WEB '+VERSION+' · 26º PEL PE MEC';
}

function init(){
  stamp();
  if(fix())return;
  let n=0;
  const timer=setInterval(()=>{
    stamp();
    if(fix()||++n>100)clearInterval(timer);
  },100);
  const side=document.querySelector('.sidebar');
  if(side){
    new MutationObserver(()=>{stamp();fix()}).observe(side,{childList:true,subtree:true});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();