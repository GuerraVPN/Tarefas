(function(){
'use strict';
if(window.__TAREFAS_V770_MATERIAL_CARGA_COMPAT__)return;
window.__TAREFAS_V770_MATERIAL_CARGA_COMPAT__=true;
function load(){
 if(window.__TAREFAS_V783_MATERIAL_CARGA_SAFE__||document.querySelector('script[data-v783-carga-safe]'))return;
 const s=document.createElement('script');
 s.src='v7_8_3_material_carga_fix.js?v=7.8.3-carga-loop1';
 s.defer=true;s.dataset.v783CargaSafe='1';document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();