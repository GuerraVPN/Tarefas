(function(){
'use strict';
if(window.__TAREFAS_V756_VERSION__)return;
window.__TAREFAS_V756_VERSION__=true;
const VERSION='7.5.6',BADGE='● TAREFAS v'+VERSION;
let busy=false;
function addScript(src,flag){if(window[flag]||document.querySelector(`script[src*="${src}"]`))return;const s=document.createElement('script');s.src=`${src}?v=${VERSION}`;s.defer=true;document.head.appendChild(s)}
function addPatches(){addScript('v7_5_4_patch.js','__TAREFAS_V754_PATCH__');addScript('v7_5_5_patch.js','__TAREFAS_V755_PATCH__');addScript('v7_5_6_patch.js','__TAREFAS_V756_PATCH__')}
function ensureLabels(){const page=(location.pathname.split('/').pop()||'').toLowerCase();if(page!=='pessoal.html'||window.__TAREFAS_V752_SERVICE_LABELS__)return;if(document.querySelector('script[src*="v7_5_2_service_labels.js"]'))return;const s=document.createElement('script');s.src='v7_5_2_service_labels.js?v='+VERSION;s.defer=true;document.head.appendChild(s)}
function apply(){if(busy)return;busy=true;try{document.documentElement.dataset.tarefasVersion=VERSION;document.querySelectorAll('.v65-version-badge').forEach(b=>{if(b.textContent!==BADGE)b.textContent=BADGE;b.title='Sobre a versão '+VERSION});document.querySelectorAll('.v65-mobile-version').forEach(v=>{const t='v'+VERSION;if(v.textContent!==t)v.textContent=t});const siteTitle=document.querySelector('#v7412Modal h3');if(siteTitle&&siteTitle.textContent!=='Painel SITE · V'+VERSION)siteTitle.textContent='Painel SITE · V'+VERSION;ensureLabels();addPatches()}finally{busy=false}}
function watch(){apply();const obs=new MutationObserver(()=>queueMicrotask(apply));obs.observe(document.body,{subtree:true,childList:true,characterData:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();window.addEventListener('focus',apply);setInterval(apply,5000);
})();