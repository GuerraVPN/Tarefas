(function(){
'use strict';
if(window.__TAREFAS_7412_GLOBAL__)return;
window.__TAREFAS_7412_GLOBAL__=true;
const VERSION='7.4.12';
const $=id=>document.getElementById(id);
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
let adminActive=false,serviceTimer=null,onlineTimer=null,uiTimer=null;

function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function logged(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function page(){return (location.pathname.split('/').pop()||'dashboard.html').toLowerCase()}

function injectCss(){
  if($('v7412GlobalCss'))return;
  const s=document.createElement('style');s.id='v7412GlobalCss';s.textContent=`
  .v7-pessoal-parent{display:block!important;padding:0!important;overflow:visible!important}
  .v7-pessoal-sub{display:none;padding:2px 5px 7px 28px}
  .v7-pessoal-parent:hover .v7-pessoal-sub,.v7-pessoal-parent:focus-within .v7-pessoal-sub,.v7-pessoal-parent.v62-subopen .v7-pessoal-sub{display:grid;gap:2px}
  .v7-pessoal-parent:hover .v6-orc-arrow,.v7-pessoal-parent:focus-within .v6-orc-arrow,.v7-pessoal-parent.v62-subopen .v6-orc-arrow{transform:rotate(180deg)}
  .v7-pessoal-sub a{display:block;text-decoration:none;border:0;background:transparent;color:var(--v4-sidebar-text);border-radius:7px;padding:7px 8px;text-align:left;font-size:9px;cursor:pointer}
  .v7-pessoal-sub a:hover,.v7-pessoal-sub a.active{background:var(--v4-sidebar-hover);color:var(--v4-gold)}
  .v7412-admin-online{height:34px;display:inline-flex;align-items:center;gap:7px;border:1px solid var(--v4-border);background:var(--v4-surface);color:var(--v4-text-2);border-radius:9px;padding:0 10px;font-size:9px;font-weight:800;cursor:pointer;white-space:nowrap}
  .v7412-admin-online i{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px rgba(34,197,94,.18)}
  @media(max-width:900px){
    .v7-pessoal-parent:hover .v7-pessoal-sub{display:none}
    .v7-pessoal-parent.v62-subopen .v7-pessoal-sub{display:grid}
    .v7-pessoal-parent>.v6-orc-main{min-height:48px;padding:12px 11px!important;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .v7-pessoal-sub{padding:4px 7px 9px 30px!important}
    .v7-pessoal-sub a{min-height:42px;display:flex!important;align-items:center;padding:10px 11px!important;font-size:11px!important}
  }`;
  document.head.appendChild(s);
}
function arrow(){return '<svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg>'}
function people(){return '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'}

function pessoalNav(){
  const list=document.querySelector('.sidebar ul');if(!list)return;
  let parent=list.querySelector('.v7-pessoal-parent');
  const old=list.querySelector('[data-v6-nav="usuarios"]');
  if(!parent&&old){
    parent=document.createElement('li');parent.className='v6-orc-parent v7-pessoal-parent';parent.dataset.v7Nav='pessoal';old.replaceWith(parent);
  }
  if(!parent)return;
  const p=page(),active=['pessoal.html','missao.html','ferias_dispensas.html','usuarios.html'].includes(p);
  parent.classList.toggle('active',active);
  if(window.matchMedia('(max-width: 900px)').matches&&active)parent.classList.add('v62-subopen');
  if(!parent.querySelector('[data-v7-main]')){
    parent.innerHTML=`<a class="v6-orc-main" data-v7-main href="pessoal.html"><span class="v6-nav-icon">${people()}</span><span class="v6-nav-label">Pessoal</span><span class="v6-orc-arrow">${arrow()}</span></a><div class="v7-pessoal-sub" id="v7412PessoalSub"><a data-v7-link="escala" href="pessoal.html">Escala de serviço</a><a data-v7-link="missao" href="missao.html">Escala de missão</a><a data-v7-link="afastamentos" href="ferias_dispensas.html">Férias / Dispensas</a><a data-v7-link="usuarios" href="usuarios.html">Usuários</a></div>`;
  }
  const map={escala:'pessoal.html',missao:'missao.html',afastamentos:'ferias_dispensas.html',usuarios:'usuarios.html'};
  Object.entries(map).forEach(([k,v])=>parent.querySelector(`[data-v7-link="${k}"]`)?.classList.toggle('active',p===v));
  if(parent.dataset.v7412Wired!=='1'){
    const main=parent.querySelector('[data-v7-main]');
    if(main){
      main.setAttribute('aria-haspopup','true');main.setAttribute('aria-controls','v7412PessoalSub');
      const sync=()=>main.setAttribute('aria-expanded',parent.classList.contains('v62-subopen')?'true':'false');
      main.addEventListener('click',e=>{if(!window.matchMedia('(max-width: 900px)').matches)return;e.preventDefault();e.stopPropagation();parent.classList.toggle('v62-subopen');sync()});
      sync();
    }
    parent.dataset.v7412Wired='1';
  }
}
function stampVersion(){
  document.documentElement.dataset.tarefasVersion=VERSION;
  document.querySelectorAll('.v65-version-badge').forEach(b=>{const t='● TAREFAS v'+VERSION;if(b.textContent!==t)b.textContent=t;b.title='Sobre a versão '+VERSION});
  document.querySelectorAll('.v65-mobile-version').forEach(v=>{const t='v'+VERSION;if(v.textContent!==t)v.textContent=t});
}
function usersTitle(){
  if(page()!=='usuarios.html')return;
  const h=document.querySelector('.page-head h2');if(h&&!h.textContent.includes('Pessoal'))h.textContent='Pessoal · Usuários';
  const bc=document.querySelector('.breadcrumb');if(bc)bc.textContent='Pessoal › Usuários';
}
async function detectAdmin(){
  const c=client(),u=logged();adminActive=false;if(!c||!u?.id)return false;
  try{const r=await c.rpc('v7_4_12_admin_context',{p_usuario_id:Number(u.id)});const d=Array.isArray(r.data)?r.data[0]:r.data;if(!r.error){adminActive=!!d?.is_admin;return adminActive}}catch(_){}
  try{const r=await c.from('usuario_perfis').select('secao').eq('usuario_id',Number(u.id)).eq('ativo',true);adminActive=!r.error&&(r.data||[]).some(x=>norm(x.secao)==='admin')}catch(_){}
  return adminActive;
}
function onlineHost(){return document.getElementById('v3UserZone')||document.querySelector('.header-actions,.topbar-right,.v7-top>div:last-child')}
async function renderAdminOnline(){
  const c=client();if(!c)return;await detectAdmin();let badge=$('v7412AdminOnline');if(!adminActive){badge?.remove();return}
  const since=new Date(Date.now()-120000).toISOString();
  try{const r=await c.from('usuarios_presenca').select('usuario_id').gte('ultima_atividade',since);if(r.error)return;const count=new Set((r.data||[]).map(x=>String(x.usuario_id))).size,host=onlineHost();if(!host)return;if(!badge){badge=document.createElement('button');badge.type='button';badge.id='v7412AdminOnline';badge.className='v7412-admin-online';badge.title='Ver usuários online';badge.onclick=()=>location.href='usuarios.html';host.insertBefore(badge,host.firstChild)}if(badge.dataset.count!==String(count)){badge.innerHTML=`<i></i><span>${count} online${count===1?'':'s'}</span>`;badge.dataset.count=String(count)}}catch(_){}
}
async function serviceNotices(){
  const c=client(),u=logged();if(!c||!u?.id)return;
  try{const r=await c.rpc('v7_processar_avisos_escala',{p_usuario_id:Number(u.id)});if(!r.error&&Number(r.data||0)>0){await window.Notificacoes26?.atualizarContadores?.();window.dispatchEvent(new CustomEvent('v6:notificacoes:update'))}}catch(_){}
}
function refreshUi(){injectCss();pessoalNav();stampVersion();usersTitle()}
function init(){
  refreshUi();renderAdminOnline();serviceNotices();
  uiTimer=setInterval(refreshUi,3000);serviceTimer=setInterval(serviceNotices,10*60*1000);onlineTimer=setInterval(renderAdminOnline,30000);
  window.addEventListener('focus',()=>{refreshUi();renderAdminOnline();serviceNotices()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshUi();renderAdminOnline();serviceNotices()}});
  window.addEventListener('v65:presenca',renderAdminOnline);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();