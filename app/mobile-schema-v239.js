(()=>{
'use strict';
const MARK='__TAREFAS_ANDROID_239_SCHEMA_CHECK__';
if(window[MARK])return;window[MARK]=true;
const KEY='tarefasSchema239';
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
async function check(){
  const c=client();if(!c)return;
  try{
    const [versions,deposits,passes,orders]=await Promise.all([
      c.from('app_versions').select('id,version,version_name,build').limit(1),
      c.from('orc_depositos').select('id,atualizado_em').limit(1),
      c.from('orc_passagens_carga').select('id,detentor_anterior_usuario_id,novo_detentor_usuario_id,atualizado_em').limit(1),
      c.from('pedidos_orcamentarios').select('id,numero,tipo,status,atualizado_em').limit(1)
    ]);
    const errors=[versions,deposits,passes,orders].map(x=>x.error).filter(Boolean);
    const detail={version:'2.3.9',build:239,checked_at:new Date().toISOString(),ok:errors.length===0,errors:errors.map(e=>String(e.message||e.code||'schema_error')).slice(0,4)};
    localStorage.setItem(KEY,JSON.stringify(detail));
    window.dispatchEvent(new CustomEvent('tarefas:schema-check',{detail}));
    if(errors.length)console.warn('[TAREFAS 2.3.9 SCHEMA]',detail);
  }catch(e){
    const detail={version:'2.3.9',build:239,checked_at:new Date().toISOString(),ok:false,errors:[String(e?.message||e||'schema_check_failed')]};
    try{localStorage.setItem(KEY,JSON.stringify(detail))}catch(_){}
    console.warn('[TAREFAS 2.3.9 SCHEMA]',detail);
  }
}
function boot(){setTimeout(check,350)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
