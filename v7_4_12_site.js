(function(){
'use strict';
if(window.__TAREFAS_7412_SITE__)return;
window.__TAREFAS_7412_SITE__=true;

/* Impede que os controles legados concorrentes inicializem depois deste arquivo. */
window.__TAREFAS_SITE_CONTROL_748__=true;
window.__TAREFAS_749_CORE__=true;
window.__TAREFAS_7410_CORE__=true;
window.__TAREFAS_7411_CORE__=true;

const VERSION='7.4.12';
const POLL_MS=5000;
const KEY_RESTART='tarefas_v7412_restart_seen';
const KEY_EXIT='tarefas_v7412_exit_seen';

let user=null;
let isAdmin=false;
let adminProfileId=null;
let state=null;
let serverOffset=0;
let pollTimer=null;
let countdownTimer=null;
let lastAdminCheck=0;

const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function getUser(){
  try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}
}
function client(){
  try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}
}
function row(data){return Array.isArray(data)?(data[0]||null):(data||null)}

function injectCss(){
  if($('v7412Css'))return;
  const s=document.createElement('style');
  s.id='v7412Css';
  s.textContent=`
  #v748SiteTopButton,#v748AdminSiteBadge,#v748SiteMobileButton,#v749SiteSidebarItem,#v748SiteSidebarItem,#v7410SiteSidebarItem,#v7411SiteSidebarItem{display:none!important}
  #v7412SiteSidebarItem .v6-nav-item{width:100%}
  .v7412-site-dot{width:7px;height:7px;border-radius:50%;margin-left:auto;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.12)}
  #v7412SiteSidebarItem[data-state="off"] .v7412-site-dot{background:#ef4444}
  #v7412SiteSidebarItem[data-state="pending"] .v7412-site-dot{background:#f59e0b}
  #v7412Warning{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:2147483600;max-width:min(760px,calc(100vw - 24px));padding:10px 14px;border-radius:11px;background:#7f1d1d;color:#fff;border:1px solid #ef4444;box-shadow:0 12px 30px #0007;font:800 12px/1.35 Arial,sans-serif;text-align:center}
  #v7412Maintenance{position:fixed;inset:0;z-index:2147483640;background:#050b16;color:#e5e7eb;display:grid;place-items:center;padding:24px;font-family:Arial,sans-serif}
  #v7412Maintenance .box{width:min(560px,100%);text-align:center;border:1px solid #334155;border-radius:20px;background:#0f172a;padding:30px;box-shadow:0 30px 70px #0009}
  #v7412Maintenance h1{margin:0 0 10px;color:#fff;font-size:28px}#v7412Maintenance p{color:#94a3b8;line-height:1.55}
  #v7412Modal{position:fixed;inset:0;z-index:2147483646;background:#0009;display:grid;place-items:center;padding:18px;font-family:Arial,sans-serif}
  #v7412Modal[hidden]{display:none!important}
  #v7412Modal .card{width:min(560px,100%);background:#0f172a;color:#e5e7eb;border:1px solid #334155;border-radius:18px;padding:18px;box-shadow:0 25px 70px #000b}
  #v7412Modal h3{margin:0 0 5px;color:#fff;font-size:20px}
  #v7412Modal .sub{font-size:11px;color:#94a3b8;margin-bottom:14px}
  #v7412Modal .status{padding:11px;border:1px solid #334155;border-radius:10px;background:#111827;margin-bottom:12px;font-size:12px;line-height:1.5}
  #v7412Modal .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  #v7412Modal button{border:1px solid #475569;background:#111827;color:#e5e7eb;border-radius:10px;padding:11px;font-weight:800;cursor:pointer}
  #v7412Modal button.danger{border-color:#ef4444;color:#fecaca}
  #v7412Modal button.warn{border-color:#f59e0b;color:#fde68a}
  #v7412Modal button.good{border-color:#22c55e;color:#bbf7d0}
  #v7412Modal .close{width:100%;margin-top:9px}
  @media(max-width:520px){#v7412Modal .grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(s);
}

async function resolveAdmin(force=false){
  const now=Date.now();
  if(!force && now-lastAdminCheck<30000)return isAdmin;
  lastAdminCheck=now;
  user=getUser(); isAdmin=false; adminProfileId=null;
  const c=client();
  if(!c||!user?.id)return false;

  /* Fonte única: RPC da V7.4.12 devolve o perfil Admin efetivamente autorizado. */
  try{
    const r=await c.rpc('v7_4_12_admin_context',{p_usuario_id:Number(user.id)});
    if(!r.error){
      const d=row(r.data);
      isAdmin=!!d?.is_admin;
      adminProfileId=d?.admin_profile_id==null?null:Number(d.admin_profile_id);
      return isAdmin;
    }
  }catch(_){}

  /* Fallback somente para visibilidade, caso o SQL ainda não tenha sido aplicado. */
  try{
    const q=await c.from('usuario_perfis')
      .select('id,secao,ativo,principal')
      .eq('usuario_id',Number(user.id))
      .eq('ativo',true)
      .order('principal',{ascending:false})
      .order('id');
    if(!q.error){
      const p=(q.data||[]).find(x=>String(x.secao||'').trim().toLowerCase()==='admin');
      if(p){isAdmin=true;adminProfileId=Number(p.id)}
    }
  }catch(_){}
  return isAdmin;
}

function host(){return document.querySelector('.sidebar .menu-items,.sidebar ul')}
function dashboardItem(h){
  if(!h)return null;
  return [...h.children].find(li=>{
    const btn=li.querySelector('[data-url]');
    const href=btn?.getAttribute('data-url')||li.querySelector('a')?.getAttribute('href')||'';
    return li.dataset.v6Nav==='dashboard'||/dashboard/i.test(li.textContent||'')||href.includes('dashboard.html');
  })||h.firstElementChild;
}
function icon(){return '<span class="v6-nav-icon"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7v5l3 2"/><path d="M16 3h5v5"/><path d="m21 3-6 6"/></svg></span>'}
function stateName(){return state?.acao_pendente?'pending':state?.modo==='desligado'?'off':'online'}
function syncState(){const li=$('v7412SiteSidebarItem');if(li)li.dataset.state=stateName()}

function ensureMenu(){
  const old=['v749SiteSidebarItem','v748SiteSidebarItem','v7410SiteSidebarItem','v7411SiteSidebarItem'];
  old.forEach(id=>$(id)?.remove());
  if(!isAdmin){$('v7412SiteSidebarItem')?.remove();return}
  const h=host(); if(!h)return;
  let li=$('v7412SiteSidebarItem');
  if(li&&li.parentElement===h){syncState();return}
  li?.remove();
  li=document.createElement('li');
  li.id='v7412SiteSidebarItem';
  li.dataset.v6Nav='site';
  li.innerHTML=`<button type="button" class="v6-nav-item" title="Abrir Painel SITE">${icon()}<span class="v6-nav-label">Painel SITE</span><span class="v7412-site-dot"></span></button>`;
  li.querySelector('button').onclick=openPanel;
  const d=dashboardItem(h);
  if(d?.nextSibling)h.insertBefore(li,d.nextSibling);else h.appendChild(li);
  syncState();
}

function stampVersion(){
  document.documentElement.dataset.tarefasVersion=VERSION;
  document.querySelectorAll('.v65-version-badge').forEach(b=>{
    const t='● TAREFAS v'+VERSION;
    if(b.textContent!==t)b.textContent=t;
    b.title='Sobre a versão '+VERSION;
  });
  document.querySelectorAll('.v65-mobile-version').forEach(v=>{
    const t='v'+VERSION;
    if(v.textContent!==t)v.textContent=t;
  });
}

async function loadState(){
  const c=client(); if(!c)return null;
  const r=await c.rpc('v7_4_12_estado_site');
  if(r.error)throw r.error;
  state=row(r.data);
  if(state?.servidor_em)serverOffset=Date.parse(state.servidor_em)-Date.now();
  syncState();
  renderGlobalState();
  return state;
}

function warningHtml(){
  if(!state?.acao_pendente)return '';
  const end=Date.parse(state.executa_em||'');
  const secs=Number.isFinite(end)?Math.max(0,Math.ceil((end-(Date.now()+serverOffset))/1000)):0;
  const label=state.acao_pendente==='exit_users'?'EXIT USERS':state.acao_pendente==='desligar'?'Desligamento do site':'Reinício do site';
  return `${label}: ação programada para <b>${secs}s</b>. Salve seu trabalho.`;
}
function renderWarning(){
  let el=$('v7412Warning');
  if(!state?.acao_pendente){
    el?.remove();
    if(countdownTimer){clearInterval(countdownTimer);countdownTimer=null}
    return;
  }
  if(!el){el=document.createElement('div');el.id='v7412Warning';document.body.appendChild(el)}
  const tick=()=>{const e=$('v7412Warning');if(e)e.innerHTML=warningHtml()};
  tick();
  if(!countdownTimer)countdownTimer=setInterval(tick,500);
}
function showMaintenance(on){
  let el=$('v7412Maintenance');
  if(on){
    if(!el){
      el=document.createElement('div');el.id='v7412Maintenance';
      el.innerHTML='<div class="box"><h1>🔧 Sistema em manutenção</h1><p>O TAREFAS está temporariamente indisponível para atualização.</p><p><b>Aguarde a liberação do administrador.</b></p></div>';
      document.body.appendChild(el);
    }
  }else el?.remove();
}

function clearSession(){
  try{
    const u=getUser();
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('sessao26_ultima_atividade');
    if(u?.id)localStorage.removeItem('perfilAtivo26Pel:'+u.id);
  }catch(_){}
}
async function restartClient(token){
  try{
    if('caches' in window){
      const names=await caches.keys();
      await Promise.all(names.map(n=>caches.delete(n)));
    }
    if(navigator.serviceWorker?.getRegistrations){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister().catch(()=>false)));
    }
  }catch(_){}
  const u=new URL(location.href);
  u.searchParams.set('v7412r',String(token||Date.now()));
  location.replace(u.toString());
}
function handleTokens(){
  if(!state)return;
  const rt=Number(state.restart_token||0), et=Number(state.exit_token||0);
  const seenR=Number(localStorage.getItem(KEY_RESTART)||0);
  const seenE=Number(localStorage.getItem(KEY_EXIT)||0);

  if(et>seenE){
    localStorage.setItem(KEY_EXIT,String(et));
    if(!isAdmin){
      clearSession();
      location.replace('index.html?exit_users='+Date.now());
      return;
    }
  }
  if(rt>seenR){
    localStorage.setItem(KEY_RESTART,String(rt));
    restartClient(rt);
  }
}
function renderGlobalState(){
  renderWarning();
  showMaintenance(state?.modo==='desligado'&&!isAdmin);
  handleTokens();
}

function renderModal(){
  let m=$('v7412Modal');
  if(!m){m=document.createElement('div');m.id='v7412Modal';document.body.appendChild(m)}
  const pending=state?.acao_pendente?`${esc(state.acao_pendente)} — ação pendente`:'Nenhuma ação pendente';
  m.innerHTML=`<div class="card">
    <h3>Painel SITE · V${VERSION}</h3>
    <div class="sub">Controle administrativo global do TAREFAS.</div>
    <div class="status"><b>Status:</b> ${state?.modo==='desligado'?'DESLIGADO / MANUTENÇÃO':'ONLINE'}<br><b>Ação:</b> ${pending}</div>
    <div class="grid">
      <button class="danger" data-act="exit_users">EXIT USERS</button>
      <button class="danger" data-act="desligar">Desligar site</button>
      <button class="warn" data-act="reiniciar">Reiniciar site</button>
      <button class="good" data-act="iniciar">Iniciar site</button>
      ${state?.acao_pendente?'<button data-act="cancelar">Cancelar ação</button>':''}
    </div>
    <button class="close" data-close>Fechar</button>
  </div>`;
  m.hidden=false;
  m.querySelector('[data-close]').onclick=()=>m.hidden=true;
  m.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>act(b.dataset.act));
}

async function openPanel(){
  await resolveAdmin(true);
  ensureMenu();
  if(!isAdmin||!adminProfileId)return alert('Painel SITE disponível somente para contas com perfil Admin ativo.');
  try{await loadState()}catch(e){return alert('Não foi possível consultar o estado do SITE: '+(e?.message||e))}
  renderModal();
}

async function act(action){
  await resolveAdmin(true);
  if(!isAdmin||!adminProfileId)return alert('Não foi possível validar o perfil Admin.');
  const msg=action==='exit_users'?'Encerrar as sessões dos usuários comuns em 30 segundos?':
    action==='desligar'?'Desligar o site em 30 segundos?':
    action==='reiniciar'?'Reiniciar o site em 30 segundos?':
    action==='iniciar'?'Iniciar o site agora?':'Cancelar a ação pendente?';
  if(!confirm(msg))return;
  const c=client();if(!c)return alert('Conexão com o servidor indisponível.');
  const r=await c.rpc('v7_4_12_controle_site',{p_acao:action,p_usuario_id:Number(user.id),p_perfil_id:Number(adminProfileId)});
  if(r.error)return alert(r.error.message||'Falha ao alterar o SITE.');
  state=row(r.data)||state;
  renderGlobalState();syncState();renderModal();
}

async function init(){
  injectCss();stampVersion();
  await resolveAdmin(true);
  ensureMenu();
  try{await loadState()}catch(_){}
  setTimeout(stampVersion,800);
  setTimeout(stampVersion,2200);

  /* Sem MutationObserver global. Só confere existência do item, sem consultas. */
  setInterval(()=>{ensureMenu();stampVersion()},2500);

  pollTimer=setInterval(()=>loadState().catch(()=>{}),POLL_MS);
  window.addEventListener('focus',()=>{resolveAdmin(true).then(()=>{ensureMenu();loadState().catch(()=>{})})});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)resolveAdmin(true).then(()=>{ensureMenu();loadState().catch(()=>{})})});
}
window.SitePanel7412={open:openPanel,refresh:loadState,ensure:ensureMenu,version:VERSION};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();