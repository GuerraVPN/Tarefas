(function(){
'use strict';
if(window.__TAREFAS_V770_MATERIAL_CARGA_COMPAT__)return;
window.__TAREFAS_V770_MATERIAL_CARGA_COMPAT__=true;
function add(src,attr,flag){
 if(window[flag]||document.querySelector(`script[${attr}]`))return;
 const s=document.createElement('script');
 s.src=src;s.defer=true;s.setAttribute(attr,'1');document.head.appendChild(s);
}
function load(){
 add('v7_8_3_material_carga_fix.js?v=7.8.6-carga4','data-v783-carga-safe','__TAREFAS_V783_MATERIAL_CARGA_SAFE__');
 add('v7_8_4_guia_deposito_alert.js?v=7.8.6-guia-deposito3','data-v784-guia-deposito-alert','__TAREFAS_V784_GUIA_DEPOSITO_ALERT__');
 add('v7_8_5_material_carga_upload_fix.js?v=7.8.6-conferente2','data-v785-material-upload','__TAREFAS_V785_MATERIAL_UPLOAD__');
 add('v7_8_6_mov_admin_cmt.js?v=7.8.6-admin-cmt1','data-v786-mov-admin-cmt','__TAREFAS_V786_MOV_ADMIN_CMT__');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();