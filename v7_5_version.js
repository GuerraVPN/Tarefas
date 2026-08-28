(function(){
'use strict';
if(window.__TAREFAS_V751_VERSION__)return;
window.__TAREFAS_V751_VERSION__=true;
const VERSION='7.5.1';
const badgeText='● TAREFAS v'+VERSION;
let busy=false;
function apply(){if(busy)return;busy=true;try{document.documentElement.dataset.tarefasVersion=VERSION;document.querySelectorAll('.v65-version-badge').forEach(b=>{if(b.textContent!==badgeText)b.textContent=badgeText;b.title='Sobre a versão '+VERSION;});document.querySelectorAll('.v65-mobile-version').forEach(v=>{const t='v'+VERSION;if(v.textContent!==t)v.textContent=t;});const siteTitle=document.querySelector('#v7412Modal h3');if(siteTitle&&siteTitle.textContent!==`Painel SITE · V${VERSION}`)siteTitle.textContent=`Painel SITE · V${VERSION}`;}finally{busy=false}}
function watch(){apply();const obs=new MutationObserver(()=>queueMicrotask(apply));obs.observe(document.body,{subtree:true,childList:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();window.addEventListener('focus',apply);setInterval(apply,5000);
})();