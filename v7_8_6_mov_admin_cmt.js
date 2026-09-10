(function(){
'use strict';
if(window.__TAREFAS_V786_MOV_ADMIN_CMT__)return;
window.__TAREFAS_V786_MOV_ADMIN_CMT__=true;
const $=id=>document.getElementById(id);
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
let admin=false,observer=null;
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
async function resolveAdmin(){
 let base=null;try{base=JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){}
 if(!base?.id)return false;
 if(norm(base.secao)==='admin')return true;
 const c=client();
 if(window.Perfis26&&c){
  try{const p=await Perfis26.carregar(c,base);if(norm(p?.usuario?.secao)==='admin')return true}catch(_){}
 }
 if(c&&base.perfil_id){
  try{const r=await c.from('usuario_perfis').select('id,usuario_id,secao,ativo').eq('id',Number(base.perfil_id)).maybeSingle();
   if(!r.error&&r.data&&r.data.ativo!==false&&String(r.data.usuario_id)===String(base.id)&&norm(r.data.secao)==='admin')return true;
  }catch(_){}
 }
 return false;
}
function currentStage(){return norm($('movActionHint')?.textContent||$('mdStatus')?.textContent||'')}
function sync(){
 if(!admin)return;
 const box=$('movActionButtons');if(!box)return;
 const stage=currentStage();
 if(stage.includes('aguardando aprovacao do cmt')){
  if(!box.querySelector('[data-mov-action="aprovar_cmt"]')){
   box.innerHTML='<button class="orc-btn primary" data-mov-action="aprovar_cmt">✓ Registrar aprovação do Cmt (Admin)</button>';
  }
 }else if(stage.includes('aguardando assinatura do cmt')){
  if(!box.querySelector('[data-mov-action="assinar_cmt"]')){
   box.innerHTML='<button class="orc-btn primary" data-mov-action="assinar_cmt">✍️ Assinatura do Cmt · Encaminhar à Base (Admin)</button>';
  }
 }
}
function observe(){
 const box=$('movActionButtons');if(!box){setTimeout(observe,250);return}
 observer?.disconnect();observer=new MutationObserver(()=>queueMicrotask(sync));observer.observe(box,{childList:true,subtree:true});
 document.addEventListener('click',e=>{if(e.target.closest('[data-mov-id],[data-mov-action]'))setTimeout(sync,120)},true);
 sync();
}
async function start(){admin=await resolveAdmin();if(admin)observe()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();