(function(){
'use strict';
if(window.__TAREFAS_SITE_MENU_FIX_748__)return;
window.__TAREFAS_SITE_MENU_FIX_748__=true;

const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const getUser=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};
const client=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}};

function injectStyle(){
  if(document.getElementById('v748SiteMenuFixCss'))return;
  const s=document.createElement('style');
  s.id='v748SiteMenuFixCss';
  s.textContent=`
    .v748-site-menu-item .v6-nav-item{font:inherit}
    .v748-site-menu-item .v748-site-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.12);margin-left:auto;flex:0 0 7px}
    .v748-site-menu-item[data-state="off"] .v748-site-dot{background:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.12)}
    .v748-site-menu-item[data-state="pending"] .v748-site-dot{background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.12)}
    body.v748-sidebar-site-ready #v748AdminSiteBadge{display:none!important}
  `;
  document.head.appendChild(s);
}

async function isAdminUser(){
  const u=getUser();
  if(!u?.id)return false;
  const c=client();
  if(!c)return norm(u.secao)==='admin';
  try{
    const q=await c.from('usuario_perfis').select('id,secao,ativo').eq('usuario_id',Number(u.id)).eq('ativo',true);
    if(q.error)throw q.error;
    const admins=(q.data||[]).filter(p=>norm(p.secao)==='admin');
    for(const p of admins){
      const r=await c.rpc('v7_1_admin_total',{p_usuario_id:Number(u.id),p_perfil_id:Number(p.id)});
      if(!r.error&&r.data===true)return true;
    }
    return false;
  }catch(_){
    return norm(u.secao)==='admin';
  }
}

function menuHost(){return document.querySelector('.sidebar .menu-items,.sidebar ul');}
function dashboardItem(host){
  return [...host.children].find(li=>{
    const t=norm(li.textContent);
    const href=li.querySelector('a')?.getAttribute('href')||'';
    return t.includes('dashboard')||href.includes('dashboard.html');
  })||host.firstElementChild;
}

function icon(){return '<span class="v6-nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7v5l3 2"/><path d="M16 3h5v5"/><path d="m21 3-6 6"/></svg></span>';}

function ensureItem(){
  const host=menuHost();
  if(!host)return false;
  let li=document.getElementById('v748SiteSidebarItem');
  if(!li){
    li=document.createElement('li');
    li.id='v748SiteSidebarItem';
    li.className='v748-site-menu-item';
    li.innerHTML=`<button type="button" class="v6-nav-item" id="v748SiteSidebarButton" title="Abrir controle do site">${icon()}<span class="v6-nav-label">Painel SITE</span><span class="v748-site-dot" aria-hidden="true"></span></button>`;
    const dash=dashboardItem(host);
    if(dash?.nextSibling)host.insertBefore(li,dash.nextSibling);else host.appendChild(li);
    li.querySelector('button').addEventListener('click',async()=>{
      try{await window.SiteControl26?.refreshAdmin?.();window.SiteControl26?.openPanel?.()}catch(_){}
      setTimeout(()=>{if(!document.getElementById('v748SiteModal'))alert('Não foi possível abrir o Painel SITE. Atualize a página e tente novamente.')},250);
    });
  }
  document.body.classList.add('v748-sidebar-site-ready');
  return true;
}

function syncState(){
  const li=document.getElementById('v748SiteSidebarItem');
  if(!li)return;
  const top=document.getElementById('v748SiteTopButton');
  const badge=document.getElementById('v748AdminSiteBadge');
  const state=top?.dataset?.state||(badge?.classList.contains('pending')?'pending':badge?.classList.contains('online')?'online':'off');
  li.dataset.state=state||'online';
}

async function init(){
  injectStyle();
  if(!await isAdminUser())return;
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(ensureItem()||tries>40)clearInterval(timer);
  },100);
  const obs=new MutationObserver(()=>{ensureItem();syncState()});
  obs.observe(document.body,{childList:true,subtree:true});
  setInterval(syncState,3000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
