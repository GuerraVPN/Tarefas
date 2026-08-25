(function(){
'use strict';
const VERSION='7.3';
const $=id=>document.getElementById(id);
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
let busy=false,timer=null,onlineTimer=null,adminActive=false;

function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function logged(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function page(){return (location.pathname.split('/').pop()||'dashboard.html').toLowerCase()}
function injectCss(){
  if($('v7GlobalCss'))return;
  const s=document.createElement('style');s.id='v7GlobalCss';s.textContent=`
  .v7-pessoal-parent{display:block!important;padding:0!important;overflow:visible!important}
  .v7-pessoal-sub{display:none;padding:2px 5px 7px 28px}
  .v7-pessoal-parent:hover .v7-pessoal-sub,.v7-pessoal-parent:focus-within .v7-pessoal-sub,.v7-pessoal-parent.v62-subopen .v7-pessoal-sub{display:grid;gap:2px}
  .v7-pessoal-parent:hover .v6-orc-arrow,.v7-pessoal-parent:focus-within .v6-orc-arrow,.v7-pessoal-parent.v62-subopen .v6-orc-arrow{transform:rotate(180deg)}
  .v7-pessoal-sub a{display:block;text-decoration:none;border:0;background:transparent;color:var(--v4-sidebar-text);border-radius:7px;padding:7px 8px;text-align:left;font-size:9px;cursor:pointer}
  .v7-pessoal-sub a:hover,.v7-pessoal-sub a.active{background:var(--v4-sidebar-hover);color:var(--v4-gold)}
  .v71-admin-online{height:34px;display:inline-flex;align-items:center;gap:7px;border:1px solid var(--v4-border);background:var(--v4-surface);color:var(--v4-text-2);border-radius:9px;padding:0 10px;font-size:9px;font-weight:800;cursor:pointer;white-space:nowrap}
  .v71-admin-online:hover{background:var(--v4-surface-2)}
  .v71-admin-online i{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px color-mix(in srgb,#22c55e 18%,transparent)}
  @media(max-width:900px){
    .v7-pessoal-parent:hover .v7-pessoal-sub{display:none}
    .v7-pessoal-parent.v62-subopen .v7-pessoal-sub{display:grid}
    .v7-pessoal-parent>.v6-orc-main{min-height:48px;padding:12px 11px!important;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .v7-pessoal-parent>.v6-orc-main .v6-orc-arrow{width:24px;height:24px;pointer-events:none}
    .v7-pessoal-sub{padding:4px 7px 9px 30px!important}
    .v7-pessoal-sub a{min-height:42px;display:flex!important;align-items:center;padding:10px 11px!important;font-size:11px!important;touch-action:manipulation}
  }
  `;document.head.appendChild(s);
}
function arrow(){return '<svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg>'}
function people(){return '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'}

function pessoalNav(){
  const list=document.querySelector('.sidebar ul');if(!list)return;
  let parent=list.querySelector('.v7-pessoal-parent');
  const old=list.querySelector('[data-v6-nav="usuarios"]');

  if(!parent && old){
    parent=document.createElement('li');
    parent.className='v6-orc-parent v7-pessoal-parent';
    parent.dataset.v7Nav='pessoal';
    old.replaceWith(parent);
  }
  if(!parent)return;

  const p=page();
  const active=p==='pessoal.html'||p==='missao.html'||p==='ferias_dispensas.html'||p==='usuarios.html';
  parent.classList.toggle('active',active);
  // No celular, ao abrir a sidebar dentro de uma página de Pessoal,
  // mantém o grupo expandido para acesso imediato às opções internas.
  if(window.matchMedia('(max-width: 900px)').matches && active){
    parent.classList.add('v62-subopen');
  }

  if(!parent.querySelector('[data-v7-main]')){
    parent.innerHTML=`<a class="v6-orc-main" data-v7-main href="pessoal.html">
      <span class="v6-nav-icon">${people()}</span>
      <span class="v6-nav-label">Pessoal</span>
      <span class="v6-orc-arrow">${arrow()}</span>
    </a>
    <div class="v7-pessoal-sub">
      <a data-v7-link="escala" href="pessoal.html">Escala de serviço</a>
      <a data-v7-link="missao" href="missao.html">Escala de missão</a>
      <a data-v7-link="afastamentos" href="ferias_dispensas.html">Férias / Dispensas</a>
      <a data-v7-link="usuarios" href="usuarios.html">Usuários</a>
    </div>`;
  }

  const escala=parent.querySelector('[data-v7-link="escala"]');
  const missao=parent.querySelector('[data-v7-link="missao"]');
  const afastamentos=parent.querySelector('[data-v7-link="afastamentos"]');
  const usuarios=parent.querySelector('[data-v7-link="usuarios"]');
  escala?.classList.toggle('active',p==='pessoal.html');
  missao?.classList.toggle('active',p==='missao.html');
  afastamentos?.classList.toggle('active',p==='ferias_dispensas.html');
  usuarios?.classList.toggle('active',p==='usuarios.html');

  // Desktop: Pessoal continua sendo um link normal.
  // Android/mobile: tocar em QUALQUER ponto da linha Pessoal apenas
  // abre/fecha o submenu. A navegação acontece somente nas opções internas.
  if(parent.dataset.v724Wired!=='1'){
    const main=parent.querySelector('[data-v7-main]');
    if(main){
      main.setAttribute('aria-haspopup','true');
      main.setAttribute('aria-controls','v7PessoalSubmenu');
      const sub=parent.querySelector('.v7-pessoal-sub');
      if(sub)sub.id='v7PessoalSubmenu';
      const syncExpanded=()=>main.setAttribute('aria-expanded',parent.classList.contains('v62-subopen')?'true':'false');
      syncExpanded();
      main.addEventListener('click',function(e){
        if(!window.matchMedia('(max-width: 900px)').matches)return;
        e.preventDefault();
        // Impede que a rotina genérica do menu mobile interprete este toque
        // como navegação e feche a sidebar imediatamente.
        e.stopPropagation();
        parent.classList.toggle('v62-subopen');
        syncExpanded();
      });
      main.addEventListener('keydown',function(e){
        if(!window.matchMedia('(max-width: 900px)').matches)return;
        if(e.key!=='Enter'&&e.key!==' ')return;
        e.preventDefault();
        e.stopPropagation();
        parent.classList.toggle('v62-subopen');
        syncExpanded();
      });
    }
    parent.dataset.v724Wired='1';
  }
}

function version(){
  document.querySelectorAll('.v65-version-badge').forEach(b=>{
    const txt='● TAREFAS v'+VERSION;
    if(b.textContent!==txt)b.textContent=txt;
    if(b.title!=='Sobre a versão '+VERSION)b.title='Sobre a versão '+VERSION;
  });
  document.querySelectorAll('.v65-mobile-version').forEach(v=>{
    const txt='v'+VERSION;
    if(v.textContent!==txt)v.textContent=txt;
  });
}

function usersTitle(){
  if(page()!=='usuarios.html')return;
  const h=document.querySelector('.page-head h2');
  if(h && !h.textContent.includes('Pessoal'))h.textContent='Pessoal · Usuários';
  const bc=document.querySelector('.breadcrumb');
  if(bc)bc.textContent='Pessoal › Usuários';
}

async function detectAdmin(){
  const c=client(),u=logged();
  if(!c||!u?.id){adminActive=false;return false}
  const local=norm(u.secao)==='admin';
  if(local){adminActive=true;return true}
  try{
    if(!u.perfil_id){adminActive=false;return false}
    const r=await c.from('usuario_perfis').select('secao').eq('id',Number(u.perfil_id)).eq('usuario_id',Number(u.id)).eq('ativo',true).maybeSingle();
    adminActive=!r.error&&norm(r.data?.secao)==='admin';
    return adminActive;
  }catch(_){adminActive=false;return false}
}
function onlineHost(){
  return document.getElementById('v3UserZone')||document.querySelector('.header-actions,.topbar-right,.v7-top>div:last-child');
}
async function renderAdminOnline(){
  const c=client();
  if(!c)return;
  if(!adminActive)await detectAdmin();
  let badge=document.getElementById('v71AdminOnline');
  if(!adminActive){badge?.remove();return}

  const since=new Date(Date.now()-120000).toISOString();
  try{
    const r=await c.from('usuarios_presenca').select('usuario_id').gte('ultima_atividade',since);
    if(r.error)return;
    const count=new Set((r.data||[]).map(x=>String(x.usuario_id))).size;
    const host=onlineHost();if(!host)return;
    if(!badge){
      badge=document.createElement('button');
      badge.type='button';badge.id='v71AdminOnline';badge.className='v71-admin-online';
      badge.title='Ver usuários online';
      badge.onclick=()=>location.href='usuarios.html';
      host.insertBefore(badge,host.firstChild);
    }
    const txt=`${count} online${count===1?'':'s'}`;
    if(badge.dataset.count!==String(count)){
      badge.innerHTML=`<i></i><span>${txt}</span>`;
      badge.dataset.count=String(count);
    }
  }catch(_){}
}

async function serviceNotices(){
  const c=client(),u=logged();if(!c||!u?.id)return;
  try{
    const r=await c.rpc('v7_processar_avisos_escala',{p_usuario_id:Number(u.id)});
    if(!r.error && Number(r.data||0)>0){
      await window.Notificacoes26?.atualizarContadores?.();
      window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));
    }
  }catch(_){}
}
let observer=null;
function refresh(){
  if(busy)return;
  busy=true;
  if(observer)observer.disconnect();
  try{
    pessoalNav();
    version();
    usersTitle();
  }finally{
    busy=false;
    if(observer)observer.observe(document.documentElement,{childList:true,subtree:true});
  }
}
function init(){
  injectCss();
  observer=new MutationObserver(()=>refresh());
  refresh();
  detectAdmin().then(renderAdminOnline);
  serviceNotices();
  timer=setInterval(serviceNotices,10*60*1000);
  onlineTimer=setInterval(renderAdminOnline,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){serviceNotices();renderAdminOnline()}});
  window.addEventListener('focus',()=>{serviceNotices();renderAdminOnline()});
  window.addEventListener('v65:presenca',renderAdminOnline);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(refresh,700);
  setTimeout(refresh,1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();