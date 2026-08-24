(function(){
'use strict';
const VERSION='7.0';
const $=id=>document.getElementById(id);
let busy=false,timer=null;

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
  .v7-pessoal-sub button{border:0;background:transparent;color:var(--v4-sidebar-text);border-radius:7px;padding:7px 8px;text-align:left;font-size:9px;cursor:pointer}
  .v7-pessoal-sub button:hover,.v7-pessoal-sub button.active{background:var(--v4-sidebar-hover);color:var(--v4-gold)}
  @media(max-width:900px){.v7-pessoal-parent:hover .v7-pessoal-sub{display:none}.v7-pessoal-parent.v62-subopen .v7-pessoal-sub{display:grid}}
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
  const active=p==='pessoal.html'||p==='usuarios.html';
  parent.classList.toggle('active',active);
  parent.innerHTML=`<button class="v6-orc-main" data-v7-main>
    <span class="v6-nav-icon">${people()}</span>
    <span class="v6-nav-label">Pessoal</span>
    <span class="v6-orc-arrow">${arrow()}</span>
  </button>
  <div class="v7-pessoal-sub">
    <button data-v7-link="escala" class="${p==='pessoal.html'?'active':''}">Escala de serviço</button>
    <button data-v7-link="usuarios" class="${p==='usuarios.html'?'active':''}">Usuários</button>
  </div>`;

  parent.querySelector('[data-v7-main]').onclick=function(e){
    e.preventDefault();
    if(window.matchMedia('(max-width: 900px)').matches){
      parent.classList.toggle('v62-subopen');
    }else{
      location.href='pessoal.html';
    }
  };
  parent.querySelector('[data-v7-link="escala"]').onclick=e=>{e.stopPropagation();location.href='pessoal.html'};
  parent.querySelector('[data-v7-link="usuarios"]').onclick=e=>{e.stopPropagation();location.href='usuarios.html'};
}

function version(){
  document.querySelectorAll('.v65-version-badge').forEach(b=>{
    b.innerHTML='● TAREFAS v'+VERSION;b.title='Sobre a versão 7.0';
  });
  document.querySelectorAll('.v65-mobile-version').forEach(v=>v.textContent='v'+VERSION);
}

function usersTitle(){
  if(page()!=='usuarios.html')return;
  const h=document.querySelector('.page-head h2');
  if(h && !h.textContent.includes('Pessoal'))h.textContent='Pessoal · Usuários';
  const bc=document.querySelector('.breadcrumb');
  if(bc)bc.textContent='Pessoal › Usuários';
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
function refresh(){
  if(busy)return;busy=true;
  try{pessoalNav();version();usersTitle()}finally{busy=false}
}
function init(){
  injectCss();refresh();serviceNotices();
  timer=setInterval(serviceNotices,10*60*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)serviceNotices()});
  window.addEventListener('focus',serviceNotices);
  new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(refresh,700);setTimeout(refresh,1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();