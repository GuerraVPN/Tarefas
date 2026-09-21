(()=>{
'use strict';
const VERSION='7.9.1',MARK='__TAREFAS_SITE_791__',POLL_IDLE=10000,POLL_PENDING=2000;
if(window[MARK])return;window[MARK]=true;

/* Desativa controladores legados concorrentes. */
window.__TAREFAS_7412_SITE__=true;
window.__TAREFAS_V771_SITE_LIGHT__=true;
window.__TAREFAS_SITE_CONTROL_748__=true;
window.__TAREFAS_749_CORE__=true;
window.__TAREFAS_7410_CORE__=true;
window.__TAREFAS_7411_CORE__=true;

const KEY_EXIT='tarefas_site_791_exit_seen';
const KEY_RESTART='tarefas_site_791_restart_seen';
const KEY_LAST_ACTION='tarefas_site_791_last_action';
const $=id=>document.getElementById(id);
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let current=null,isAdmin=false,adminProfileId=null,serverOffset=0,timer=null,countdown=null,lastAdminAt=0,loading=false;

function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function user(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function row(d){return Array.isArray(d)?(d[0]||null):(d||null)}
function page(){return (location.pathname.split('/').pop()||'index.html').toLowerCase()}
function isSpecialPage(){return ['reiniciar.html','desligado.html'].includes(page())}
function nowServer(){return Date.now()+serverOffset}
function secondsLeft(){const end=Date.parse(current?.executa_em||'');return Number.isFinite(end)?Math.max(0,Math.ceil((end-nowServer())/1000)):0}
function actionLabel(a){return a==='exit_users'?'EXIT USERS':a==='desligar'?'Desligamento do SITE':a==='reiniciar'?'Reinício do SITE':a==='iniciar'?'Inicialização do SITE':String(a||'Ação administrativa')}
function destinationFor(a){return a==='reiniciar'?'reiniciar.html':a==='desligar'?'desligado.html':'index.html'}

async function rpcFallback(names,args={}){
 const c=client();if(!c)throw new Error('Supabase indisponível.');
 let last=null;
 for(const name of names){
  try{
   const r=await c.rpc(name,args);
   if(!r.error)return {name,data:r.data};
   last=r.error;
   const msg=String(r.error?.message||'');
   if(!/does not exist|Could not find|function .* does not exist|schema cache/i.test(msg))break;
  }catch(e){last=e}
 }
 throw last||new Error('RPC indisponível.');
}
async function resolveAdmin(force=false){
 const u=user(),c=client(),now=Date.now();
 if(!force&&now-lastAdminAt<30000)return isAdmin;
 lastAdminAt=now;isAdmin=false;adminProfileId=null;
 if(!u?.id||!c)return false;
 try{
  const r=await rpcFallback(['v7_4_12_admin_context'],{p_usuario_id:Number(u.id)}),d=row(r.data);
  if(d){isAdmin=!!d.is_admin;adminProfileId=d.admin_profile_id==null?null:Number(d.admin_profile_id);if(isAdmin)return true}
 }catch(_){}
 try{
  const q=await c.from('usuario_perfis').select('id,secao,principal,ativo').eq('usuario_id',Number(u.id)).eq('ativo',true).order('principal',{ascending:false}).order('id');
  if(!q.error){const p=(q.data||[]).find(x=>norm(x.secao)==='admin');if(p){isAdmin=true;adminProfileId=Number(p.id)}}
 }catch(_){}
 return isAdmin;
}
async function loadState(){
 if(loading)return current;loading=true;
 try{
  const r=await rpcFallback(['v7_4_12_estado_site','v7_4_9_estado_site','v7_4_7_estado_site']);
  current=row(r.data);
  const server=Date.parse(current?.servidor_em||'');if(Number.isFinite(server))serverOffset=server-Date.now();
  renderState();
  return current;
 }finally{loading=false;schedulePoll()}
}
async function control(action){
 const u=user();if(!u?.id||!adminProfileId)throw new Error('Perfil Admin não identificado.');
 const args={p_acao:action,p_usuario_id:Number(u.id),p_perfil_id:Number(adminProfileId)};
 const r=await rpcFallback(['v7_4_12_controle_site','v7_4_9_controle_site','v7_4_7_controle_site'],args);
 return row(r.data);
}

function injectCss(){
 if($('site791Css'))return;
 const s=document.createElement('style');s.id='site791Css';s.textContent=`
 #site791Warning{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:2147483600;max-width:min(820px,calc(100vw - 22px));padding:11px 15px;border-radius:12px;background:#7f1d1d;color:#fff;border:1px solid #ef4444;box-shadow:0 14px 34px #0008;font:800 12px/1.4 Arial,sans-serif;text-align:center}
 #site791Warning.admin{background:#78350f;border-color:#f59e0b}
 #site791Modal{position:fixed;inset:0;z-index:2147483646;background:#000a;display:grid;place-items:center;padding:18px;font-family:Arial,sans-serif}
 #site791Modal[hidden]{display:none!important}#site791Modal .card{width:min(600px,100%);background:#0f172a;color:#e5e7eb;border:1px solid #334155;border-radius:18px;padding:18px;box-shadow:0 25px 70px #000b}
 #site791Modal h3{margin:0 0 5px;color:#fff;font-size:20px}#site791Modal .sub{font-size:11px;color:#94a3b8;margin-bottom:14px}
 #site791Modal .status{padding:11px;border:1px solid #334155;border-radius:10px;background:#111827;margin-bottom:12px;font-size:12px;line-height:1.55}
 #site791Modal .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}#site791Modal button{border:1px solid #475569;background:#111827;color:#e5e7eb;border-radius:10px;padding:11px;font-weight:800;cursor:pointer}
 #site791Modal button.danger{border-color:#ef4444;color:#fecaca}#site791Modal button.warn{border-color:#f59e0b;color:#fde68a}#site791Modal button.good{border-color:#22c55e;color:#bbf7d0}#site791Modal .close{width:100%;margin-top:9px}
 #site791Menu .site-dot{width:7px;height:7px;border-radius:50%;margin-left:auto;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.14)}#site791Menu[data-state="pending"] .site-dot{background:#f59e0b}#site791Menu[data-state="off"] .site-dot{background:#ef4444}
 @media(max-width:520px){#site791Modal .grid{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}
function host(){return document.querySelector('.sidebar .menu-items,.sidebar ul')}
function ensureMenu(){
 document.querySelectorAll('#v7412SiteSidebarItem,#v749SiteSidebarItem,#v748SiteSidebarItem,#v7410SiteSidebarItem,#v7411SiteSidebarItem').forEach(x=>x.remove());
 let li=$('site791Menu');
 if(!isAdmin){li?.remove();return}
 const h=host();if(!h)return;
 if(!li){li=document.createElement('li');li.id='site791Menu';li.dataset.v6Nav='site';li.innerHTML='<button type="button" class="v6-nav-item" title="Abrir Painel SITE"><span class="v6-nav-icon">⚙</span><span class="v6-nav-label">Painel SITE</span><span class="site-dot"></span></button>';li.querySelector('button').onclick=openPanel}
 if(li.parentElement!==h){const d=[...h.children].find(x=>/dashboard/i.test(x.textContent||''));if(d?.nextSibling)h.insertBefore(li,d.nextSibling);else h.appendChild(li)}
 li.dataset.state=current?.acao_pendente?'pending':current?.modo==='desligado'?'off':'online';
}
function renderWarning(){
 let el=$('site791Warning');
 if(!current?.acao_pendente){el?.remove();if(countdown){clearInterval(countdown);countdown=null}return}
 if(!el){el=document.createElement('div');el.id='site791Warning';document.body.appendChild(el)}
 el.classList.toggle('admin',isAdmin);
 const tick=()=>{
  if(!current?.acao_pendente){el?.remove();return}
  const sec=secondsLeft();
  el.innerHTML=isAdmin
   ?'⚠ '+esc(actionLabel(current.acao_pendente))+' programado para <b>'+sec+'s</b>. Usuários comuns serão redirecionados; perfis Admin permanecem com acesso.'
   :'⚠ '+esc(actionLabel(current.acao_pendente))+' em <b>'+sec+'s</b>. Salve seu trabalho agora.';
  if(sec<=0){clearInterval(countdown);countdown=null;executeClientAction(current.acao_pendente)}
 };
 tick();if(!countdown)countdown=setInterval(tick,500);
}
function clearSession(){
 try{
  const u=user();localStorage.removeItem('usuarioLogado');localStorage.removeItem('sessao26_ultima_atividade');localStorage.removeItem('tarefasPushSession17');
  if(u?.id)localStorage.removeItem('perfilAtivo26Pel:'+u.id);
 }catch(_){}
}
function rememberToken(key,value){try{localStorage.setItem(key,String(value||Date.now()))}catch(_){}}
function executeClientAction(action){
 if(isAdmin)return;
 if(action==='reiniciar'){const done=Number(localStorage.getItem('tarefas_site_791_restart_completed_at')||0);if(done&&Date.now()-done<60000)return}
 if(action==='exit_users'){clearSession();location.replace('index.html?site_action=exit_users&t='+Date.now());return}
 if(action==='reiniciar'){rememberToken(KEY_RESTART,current?.restart_token);location.replace('reiniciar.html?site_action=reiniciar&t='+Date.now());return}
 if(action==='desligar'){location.replace('desligado.html?site_action=desligar&t='+Date.now());return}
}
function processTokens(){
 if(!current||isAdmin)return;
 const exit=Number(current.exit_token||0),restart=Number(current.restart_token||0);
 const seenE=Number(localStorage.getItem(KEY_EXIT)||0),seenR=Number(localStorage.getItem(KEY_RESTART)||0);
 if(exit>seenE){rememberToken(KEY_EXIT,exit);clearSession();location.replace('index.html?site_action=exit_users&t='+Date.now());return}
 if(current.modo==='desligado'&&page()!=='desligado.html'){location.replace('desligado.html?site_action=desligar&t='+Date.now());return}
 if(restart>seenR){rememberToken(KEY_RESTART,restart);if(page()!=='reiniciar.html')location.replace('reiniciar.html?site_action=reiniciar&t='+Date.now())}
}
function renderState(){injectCss();ensureMenu();renderWarning();processTokens();renderPanelIfOpen()}

async function notifyOne(uid,title,message,dest,ref){
 try{
  if(typeof window.registrarNotificacao==='function'){
   const r=await window.registrarNotificacao(uid,'sistema',title,message,'site_control',ref,null,true,dest);
   if(r?.error)throw r.error;return true;
  }
  const c=client();if(!c)return false;
  const r=await c.from('notificacoes').insert([{usuario_id:Number(uid),tipo:'sistema',titulo:title,mensagem:message,referencia_tipo:'site_control',referencia_id:Number(ref),urgente:true,destino_url:dest}]);
  if(r.error)throw r.error;return true;
 }catch(_){return false}
}
async function broadcastAction(action){
 if(!['exit_users','desligar','reiniciar'].includes(action))return {sent:0,failed:0};
 const c=client();if(!c)return {sent:0,failed:0};
 const [uq,pq]=await Promise.all([
  c.from('usuarios').select('id,ativo').eq('ativo',true),
  c.from('usuario_perfis').select('usuario_id,secao,ativo').eq('ativo',true)
 ]);
 if(uq.error)return {sent:0,failed:0};
 const admins=new Set((pq.data||[]).filter(x=>norm(x.secao)==='admin').map(x=>String(x.usuario_id)));
 const ids=(uq.data||[]).map(x=>String(x.id)).filter(id=>!admins.has(id));
 const ref=Date.now();
 const title=action==='exit_users'?'⚠ Sessão será encerrada':action==='desligar'?'⚠ TAREFAS será desligado':'⚠ TAREFAS será reiniciado';
 const message=action==='exit_users'?'O administrador solicitou EXIT USERS. Sua sessão será encerrada em 30 segundos. Salve seu trabalho.':action==='desligar'?'O administrador desligará o TAREFAS em 30 segundos. Salve seu trabalho.':'O administrador reiniciará o TAREFAS em 30 segundos. Salve seu trabalho.';
 const dest=destinationFor(action);let sent=0,failed=0;
 for(const id of ids){(await notifyOne(id,title,message,dest,ref))?sent++:failed++}
 return {sent,failed};
}

function panelHtml(){
 const pending=current?.acao_pendente?esc(actionLabel(current.acao_pendente))+' — '+secondsLeft()+'s':'Nenhuma ação pendente';
 return '<div class="card"><h3>Painel SITE · V'+VERSION+'</h3><div class="sub">Controle administrativo global do TAREFAS. Perfis Admin não são expulsos nem bloqueados pelas ações abaixo.</div><div class="status"><b>Status:</b> '+(current?.modo==='desligado'?'DESLIGADO / MANUTENÇÃO':'ONLINE')+'<br><b>Ação:</b> '+pending+'<br><b>Destino:</b> Reinício → reiniciar.html · Desligar → desligado.html · EXIT USERS → Login</div><div class="grid"><button class="danger" data-act="exit_users">EXIT USERS</button><button class="danger" data-act="desligar">Desligar site</button><button class="warn" data-act="reiniciar">Reiniciar site</button><button class="good" data-act="iniciar">Iniciar site</button>'+(current?.acao_pendente?'<button data-act="cancelar">Cancelar ação</button>':'')+'</div><button class="close" data-close>Fechar</button></div>';
}
function renderPanelIfOpen(){const m=$('site791Modal');if(!m||m.hidden)return;renderPanel()}
function renderPanel(){
 const m=$('site791Modal');if(!m)return;m.innerHTML=panelHtml();
 m.querySelector('[data-close]').onclick=()=>m.hidden=true;
 m.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>requestAction(b.dataset.act));
}
async function openPanel(){
 await resolveAdmin(true);ensureMenu();
 if(!isAdmin||!adminProfileId)return alert('Painel SITE disponível somente para contas com perfil Admin ativo.');
 try{await loadState()}catch(e){return alert('Não foi possível consultar o estado do SITE: '+(e?.message||e))}
 let m=$('site791Modal');if(!m){m=document.createElement('div');m.id='site791Modal';document.body.appendChild(m)}m.hidden=false;renderPanel();
}
async function requestAction(action){
 await resolveAdmin(true);
 if(!isAdmin||!adminProfileId)return alert('Não foi possível validar o perfil Admin.');
 const msg=action==='exit_users'?'Enviar aviso e encerrar todos os usuários comuns em 30 segundos?':action==='desligar'?'Enviar aviso e desligar o SITE para usuários comuns em 30 segundos?':action==='reiniciar'?'Enviar aviso e reiniciar o SITE para usuários comuns em 30 segundos?':action==='iniciar'?'Iniciar o SITE agora e liberar os usuários?':'Cancelar a ação pendente?';
 if(!confirm(msg))return;
 try{
  const next=await control(action);if(next)current=next;
  localStorage.setItem(KEY_LAST_ACTION,JSON.stringify({action,at:Date.now(),by:user()?.id||null}));
  renderState();
  if(['exit_users','desligar','reiniciar'].includes(action)){
   const result=await broadcastAction(action);
   alert('Ação programada. Aviso global iniciado para usuários comuns.'+(result.sent||result.failed?'\nNotificações: '+result.sent+' enviadas'+(result.failed?' · '+result.failed+' não confirmadas':''):''));
  }else if(action==='iniciar')alert('SITE iniciado. Usuários comuns serão liberados.');
  else alert('Ação pendente cancelada.');
 }catch(e){
  alert('Falha ao executar a ação do Painel SITE: '+(e?.message||e)+'\n\nA 7.9.1 tentou as RPCs 7.4.12, 7.4.9 e 7.4.7.');
 }
 renderPanelIfOpen();
}
function schedulePoll(){
 if(timer)clearTimeout(timer);
 const ms=current?.acao_pendente?POLL_PENDING:POLL_IDLE;
 timer=setTimeout(()=>loadState().catch(()=>schedulePoll()),ms);
}
async function init(){
 if(isSpecialPage())return;
 injectCss();await resolveAdmin(true);ensureMenu();
 try{await loadState()}catch(e){console.warn('[SITE 7.9.1]',e?.message||e);schedulePoll()}
 window.addEventListener('focus',()=>resolveAdmin(true).then(()=>loadState().catch(()=>{})));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)resolveAdmin(true).then(()=>loadState().catch(()=>{}))});
 const h=host();if(h){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;ensureMenu()})}).observe(h,{childList:true,subtree:true})}
}
window.SitePanel791=Object.freeze({version:VERSION,open:openPanel,refresh:()=>loadState(),state:()=>current,isAdmin:()=>isAdmin,action:requestAction});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();