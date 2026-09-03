(function(){
'use strict';
if(window.__TAREFAS_V771_SITE_LIGHT__)return;
window.__TAREFAS_V771_SITE_LIGHT__=true;
const POLL_MS=30000;
const KEY_RESTART='tarefas_v7412_restart_seen',KEY_EXIT='tarefas_v7412_exit_seen';
let state=null,isAdmin=false,lastLoad=0,timer=null;
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function user(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function row(d){return Array.isArray(d)?(d[0]||null):(d||null)}
async function detectAdmin(){
 const c=client(),u=user();if(!c||!u?.id)return false;
 try{const r=await c.rpc('v7_4_12_admin_context',{p_usuario_id:Number(u.id)}),d=row(r.data);if(!r.error)isAdmin=!!d?.is_admin}catch(_){}
 return isAdmin;
}
function warning(){
 let el=document.getElementById('v771SiteLightWarning');
 if(!state?.acao_pendente){el?.remove();return}
 if(!el){el=document.createElement('div');el.id='v771SiteLightWarning';el.style.cssText='position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:2147483600;max-width:min(760px,calc(100vw - 24px));padding:10px 14px;border-radius:11px;background:#7f1d1d;color:#fff;border:1px solid #ef4444;box-shadow:0 12px 30px #0007;font:800 12px/1.35 Arial,sans-serif;text-align:center';document.body.appendChild(el)}
 el.textContent='Ação administrativa do SITE em andamento. Salve seu trabalho.';
}
function maintenance(){
 let el=document.getElementById('v771SiteLightMaintenance'),on=state?.modo==='desligado'&&!isAdmin;
 if(!on){el?.remove();return}
 if(!el){el=document.createElement('div');el.id='v771SiteLightMaintenance';el.style.cssText='position:fixed;inset:0;z-index:2147483640;background:#050b16;color:#e5e7eb;display:grid;place-items:center;padding:24px;font-family:Arial,sans-serif';el.innerHTML='<div style="width:min(560px,100%);text-align:center;border:1px solid #334155;border-radius:20px;background:#0f172a;padding:30px"><h1>🔧 Sistema em manutenção</h1><p>O TAREFAS está temporariamente indisponível para atualização.</p></div>';document.body.appendChild(el)}
}
function clearSession(){
 try{const u=user();localStorage.removeItem('usuarioLogado');localStorage.removeItem('sessao26_ultima_atividade');if(u?.id)localStorage.removeItem('perfilAtivo26Pel:'+u.id)}catch(_){}
}
async function restart(token){
 try{if('caches'in window){const names=await caches.keys();await Promise.all(names.map(n=>caches.delete(n)))}if(navigator.serviceWorker?.getRegistrations){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister().catch(()=>false)))}}catch(_){}
 const u=new URL(location.href);u.searchParams.set('v771r',String(token||Date.now()));location.replace(u.toString());
}
function tokens(){
 if(!state)return;
 const rt=Number(state.restart_token||0),et=Number(state.exit_token||0),seenR=Number(localStorage.getItem(KEY_RESTART)||0),seenE=Number(localStorage.getItem(KEY_EXIT)||0);
 if(et>seenE){localStorage.setItem(KEY_EXIT,String(et));if(!isAdmin){clearSession();location.replace('index.html?exit_users='+Date.now());return}}
 if(rt>seenR){localStorage.setItem(KEY_RESTART,String(rt));restart(rt)}
}
function render(){warning();maintenance();tokens()}
async function load(force=false){
 const now=Date.now();if(!force&&now-lastLoad<10000)return state;lastLoad=now;
 const c=client();if(!c)return null;
 try{const r=await c.rpc('v7_4_12_estado_site');if(!r.error){state=row(r.data);render()}}catch(_){}
 return state;
}
async function init(){
 await detectAdmin();await load(true);timer=setInterval(()=>load(false),POLL_MS);
 window.addEventListener('focus',()=>load(false));document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(false)});
}
window.SiteLight771={refresh:()=>load(true),version:'7.7.1'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();