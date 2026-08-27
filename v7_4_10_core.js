(function(){
'use strict';
if(window.__TAREFAS_7410_CORE__)return;
window.__TAREFAS_7410_CORE__=true;
const VERSION='7.4.10';
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
const getUser=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};
const client=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}};
let adminProfileId=null,hasAdmin=false,adminChecked=false,currentState=null,ensureQueued=false;

function css(){
 if(document.getElementById('v7410Css'))return;
 const s=document.createElement('style');s.id='v7410Css';s.textContent=`
 #v7410SiteSidebarItem .v6-nav-item{width:100%}
 .v7410-site-dot{width:7px;height:7px;border-radius:50%;margin-left:auto;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.12)}
 #v7410SiteSidebarItem[data-state="off"] .v7410-site-dot{background:#ef4444}
 #v7410SiteSidebarItem[data-state="pending"] .v7410-site-dot{background:#f59e0b}
 #v748SiteTopButton,#v748AdminSiteBadge,#v748SiteMobileButton,#v749SiteSidebarItem,#v748SiteSidebarItem{display:none!important}
 #v7410Modal{position:fixed;inset:0;z-index:2147483646;background:#0009;display:grid;place-items:center;padding:18px;font-family:Arial,sans-serif}
 #v7410Modal[hidden]{display:none!important}#v7410Modal .card{width:min(560px,100%);background:#0f172a;color:#e5e7eb;border:1px solid #334155;border-radius:18px;padding:18px;box-shadow:0 25px 70px #000b}
 #v7410Modal h3{margin:0 0 5px;color:#fff;font-size:20px}#v7410Modal .sub{font-size:11px;color:#94a3b8;margin-bottom:14px}#v7410Modal .status{padding:11px;border:1px solid #334155;border-radius:10px;background:#111827;margin-bottom:12px;font-size:12px;line-height:1.5}
 #v7410Modal .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}#v7410Modal button{border:1px solid #475569;background:#111827;color:#e5e7eb;border-radius:10px;padding:11px;font-weight:800;cursor:pointer}#v7410Modal button.danger{border-color:#ef4444;color:#fecaca}#v7410Modal button.warn{border-color:#f59e0b;color:#fde68a}#v7410Modal button.good{border-color:#22c55e;color:#bbf7d0}#v7410Modal .close{width:100%;margin-top:9px}
 @media(max-width:520px){#v7410Modal .grid{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}

async function resolveAdmin(force=false){
 if(adminChecked&&!force)return hasAdmin;
 const u=getUser(),c=client();adminProfileId=null;hasAdmin=false;
 if(!u?.id||!c){adminChecked=true;return false}
 try{
  const q=await c.from('usuario_perfis').select('id,secao,ativo').eq('usuario_id',Number(u.id)).eq('ativo',true).order('principal',{ascending:false}).order('id');
  if(q.error)throw q.error;
  for(const p of q.data||[]){
   if(norm(p.secao)!=='admin')continue;
   const r=await c.rpc('v7_1_admin_total',{p_usuario_id:Number(u.id),p_perfil_id:Number(p.id)});
   if(!r.error&&r.data===true){adminProfileId=Number(p.id);hasAdmin=true;break}
  }
 }catch(e){console.warn('V7.4.10 admin:',e?.message||e)}
 adminChecked=true;return hasAdmin;
}

function host(){return document.querySelector('.sidebar .menu-items,.sidebar ul')}
function dashboardItem(h){return [...h.children].find(li=>{const href=li.querySelector('[data-url],a')?.getAttribute('data-url')||li.querySelector('a')?.getAttribute('href')||'';return li.dataset.v6Nav==='dashboard'||norm(li.textContent).includes('dashboard')||href.includes('dashboard.html')})||h.firstElementChild}
function icon(){return '<span class="v6-nav-icon"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7v5l3 2"/><path d="M16 3h5v5"/><path d="m21 3-6 6"/></svg></span>'}
function stateName(){return currentState?.acao_pendente?'pending':currentState?.modo==='desligado'?'off':'online'}
function syncState(){const li=document.getElementById('v7410SiteSidebarItem');if(li)li.dataset.state=stateName()}

function ensureSiteItem(){
 if(!hasAdmin)return false;
 const h=host();if(!h)return false;
 let li=document.getElementById('v7410SiteSidebarItem');
 if(li&&li.parentElement===h){syncState();return true}
 if(li)li.remove();
 li=document.createElement('li');li.id='v7410SiteSidebarItem';li.dataset.v6Nav='site';
 li.innerHTML=`<button type="button" class="v6-nav-item" title="Abrir Painel SITE">${icon()}<span class="v6-nav-label">Painel SITE</span><span class="v7410-site-dot"></span></button>`;
 li.querySelector('button').addEventListener('click',openPanel);
 const d=dashboardItem(h);if(d?.nextSibling)h.insertBefore(li,d.nextSibling);else h.appendChild(li);
 syncState();return true;
}
function queueEnsure(){if(ensureQueued||!hasAdmin)return;ensureQueued=true;queueMicrotask(()=>{ensureQueued=false;if(!document.getElementById('v7410SiteSidebarItem')||document.getElementById('v7410SiteSidebarItem')?.parentElement!==host())ensureSiteItem()})}

async function loadState(){const c=client();if(!c)return null;const r=await c.rpc('v7_4_9_estado_site');if(r.error)throw r.error;currentState=Array.isArray(r.data)?r.data[0]:r.data;syncState();return currentState}
function renderModal(){let m=document.getElementById('v7410Modal');if(!m){m=document.createElement('div');m.id='v7410Modal';document.body.appendChild(m)}const pending=currentState?.acao_pendente?`${esc(currentState.acao_pendente)} — ação pendente`:'Nenhuma ação pendente';m.innerHTML=`<div class="card"><h3>Painel SITE · V${VERSION}</h3><div class="sub">Controle administrativo global do TAREFAS.</div><div class="status"><b>Status:</b> ${currentState?.modo==='desligado'?'DESLIGADO / MANUTENÇÃO':'ONLINE'}<br><b>Ação:</b> ${pending}</div><div class="grid"><button class="danger" data-act="exit_users">EXIT USERS</button><button class="danger" data-act="desligar">Desligar site</button><button class="warn" data-act="reiniciar">Reiniciar site</button><button class="good" data-act="iniciar">Iniciar site</button>${currentState?.acao_pendente?'<button data-act="cancelar">Cancelar ação</button>':''}</div><button class="close" data-close>Fechar</button></div>`;m.hidden=false;m.querySelector('[data-close]').onclick=()=>m.hidden=true;m.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>act(b.dataset.act))}
async function openPanel(){if(!await resolveAdmin(true))return alert('Painel SITE disponível somente para contas com perfil Admin ativo.');try{await loadState()}catch(e){return alert('Não foi possível consultar o estado do SITE: '+(e?.message||e))}renderModal()}
async function act(action){const u=getUser(),c=client();if(!u?.id||!c||!adminProfileId)return alert('Não foi possível validar o perfil Admin.');const msg=action==='exit_users'?'Encerrar as sessões dos usuários comuns em 30 segundos?':action==='desligar'?'Desligar o site em 30 segundos?':action==='reiniciar'?'Reiniciar o site em 30 segundos?':action==='iniciar'?'Iniciar o site agora?':'Cancelar a ação pendente?';if(!confirm(msg))return;const r=await c.rpc('v7_4_9_controle_site',{p_acao:action,p_usuario_id:Number(u.id),p_perfil_id:Number(adminProfileId)});if(r.error)return alert(r.error.message||'Falha ao alterar o SITE.');currentState=Array.isArray(r.data)?r.data[0]:r.data;renderModal();syncState()}

function stampVersion(){
 document.documentElement.dataset.tarefasVersion=VERSION;
 document.querySelectorAll('.v65-version-badge').forEach(b=>{b.textContent='● TAREFAS v'+VERSION;b.title='Sobre a versão '+VERSION});
 document.querySelectorAll('.v65-mobile-version').forEach(v=>v.textContent='v'+VERSION);
 [...document.querySelectorAll('small,span,strong,b')].forEach(el=>{if(/^v?7\.4\.9(?:\.\d+)?$/i.test((el.textContent||'').trim()))el.textContent=(el.textContent.trim().toLowerCase().startsWith('v')?'v':'')+VERSION});
}

async function init(){
 css();stampVersion();
 await resolveAdmin();
 if(hasAdmin)ensureSiteItem();
 loadState().catch(()=>{});
 const obs=new MutationObserver(()=>{queueEnsure();stampVersion()});
 obs.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('focus',()=>{queueEnsure();loadState().catch(()=>{})});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){queueEnsure();loadState().catch(()=>{})}});
 setInterval(()=>loadState().catch(()=>{}),15000);
}
window.SitePanel7410={open:openPanel,refresh:loadState,ensure:ensureSiteItem,version:VERSION};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
