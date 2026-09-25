(function(){
'use strict';
if(window.__TAREFAS_WEB_797_USUARIOS_NAV__)return;
window.__TAREFAS_WEB_797_USUARIOS_NAV__=true;
const VERSION='7.9.7';
const SHEETS=[
  ['Motorista','https://docs.google.com/spreadsheets/d/1T_BM9KY0NLwVhlifetQ6W6AdetujQjx--zOZHa27eQs/edit?usp=drivesdk'],
  ['Patrulheiro','https://docs.google.com/spreadsheets/d/1_LlfIHx4EuSHkC9BOR2VorvXoaiMyLa028wU6C0dQLs/edit?usp=drivesdk'],
  ['Permanência','https://docs.google.com/spreadsheets/d/13eEei_JdGjAdVo371BGfPS59QdYySe9lJ47DLjWb_x0/edit?usp=drivesdk']
];
const page=()=>String(location.pathname.split('/').pop()||'dashboard.html').toLowerCase();
const people=()=>'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
const arrow=()=>'<svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg>';
const scaleIcon=()=>'<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/></svg>';
const extIcon=()=>'<svg viewBox="0 0 24 24"><path d="M14 5h5v5"/><path d="M19 5 11 13"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';

function css(){
 if(document.getElementById('v797UsersNavCss'))return;
 const s=document.createElement('style');s.id='v797UsersNavCss';
 s.textContent='.v797-user-personal{display:block!important;padding:0!important;overflow:visible!important}.v797-user-sub{display:grid;gap:2px;padding:3px 5px 8px 28px}.v797-scale-toggle,.v797-link{display:flex;align-items:center;gap:9px;width:100%;box-sizing:border-box;border:0;background:transparent;color:var(--v4-sidebar-text,#d9dee7);text-decoration:none;border-radius:7px;padding:8px;text-align:left;font:inherit;font-size:9px;font-weight:700;cursor:pointer}.v797-scale-toggle:hover,.v797-link:hover,.v797-link.active{background:var(--v4-sidebar-hover,#26344a);color:var(--v4-gold,#e0b44c)}.v797-scale-icon,.v797-ext{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 16px}.v797-scale-icon svg,.v797-ext svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.v797-arrow{margin-left:auto;width:16px;height:16px}.v797-arrow svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8}.v797-scale-sub{display:grid;gap:1px;padding:1px 0 5px 25px}.v797-scale-sub a{display:flex;align-items:center;justify-content:space-between;color:var(--v4-sidebar-text,#d9dee7);text-decoration:none;border-radius:7px;padding:7px 8px;font-size:9px}.v797-scale-sub a:hover{background:var(--v4-sidebar-hover,#26344a);color:var(--v4-gold,#e0b44c)}@media(max-width:900px){.v797-user-sub{padding:4px 7px 9px 30px!important}.v797-scale-toggle,.v797-link{min-height:42px;padding:10px 11px!important;font-size:11px!important}.v797-scale-sub{padding:2px 0 7px 24px!important}.v797-scale-sub a{min-height:42px;padding:10px 11px!important;font-size:11px!important}}';
 document.head.appendChild(s);
}
function build(parent){
 const links=SHEETS.map(x=>'<a href="'+x[1]+'" target="_blank" rel="noopener noreferrer external"><span>'+x[0]+'</span><span class="v797-ext">'+extIcon()+'</span></a>').join('');
 parent.innerHTML='<a class="v6-orc-main" href="pessoal.html" data-v797-main><span class="v6-nav-icon">'+people()+'</span><span class="v6-nav-label">Pessoal</span><span class="v6-orc-arrow">'+arrow()+'</span></a><div class="v797-user-sub"><div><button type="button" class="v797-scale-toggle"><span class="v797-scale-icon">'+scaleIcon()+'</span><span>Escala</span><span class="v797-arrow">'+arrow()+'</span></button><div class="v797-scale-sub">'+links+'</div></div><a class="v797-link" data-v797-farias href="ferias_dispensas.html">Férias / Dispensas</a><a class="v797-link" data-v797-users href="usuarios.html">Usuários</a></div>';
}
function wire(parent){
 if(parent.dataset.v797Wired==='1')return;
 const main=parent.querySelector('[data-v797-main]');
 const toggle=parent.querySelector('.v797-scale-toggle');
 const sub=parent.querySelector('.v797-scale-sub');
 if(toggle)toggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const open=sub.style.display!=='grid';sub.style.display=open?'grid':'none'});
 if(main&&window.matchMedia('(max-width:900px)').matches)main.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();parent.classList.toggle('v62-subopen')});
 parent.dataset.v797Wired='1';
}
function findParent(){
 const list=document.querySelector('.sidebar ul,.sidebar .menu-items');
 if(!list)return null;
 let p=list.querySelector('.v797-user-personal');
 if(p)return p;
 const legacy=list.querySelector('.v7-pessoal-parent');
 if(legacy){
   legacy.classList.add('v797-user-personal');build(legacy);legacy.dataset.v797Wired='';wire(legacy);return legacy;
 }
 const user=[...list.children].find(li=>String(li.textContent||'').trim().toLowerCase()==='👥 usuários'||String(li.textContent||'').trim().toLowerCase()==='usuários');
 if(!user)return null;
 p=document.createElement('li');p.className='v797-user-personal';user.replaceWith(p);build(p);wire(p);return p;
}
function apply(){
 css();
 const p=findParent();
 if(p){
   p.querySelector('[data-v797-farias]')?.classList.toggle('active',page()==='ferias_dispensas.html');
   p.querySelector('[data-v797-users]')?.classList.toggle('active',page()==='usuarios.html');
   p.classList.toggle('active',['usuarios.html','ferias_dispensas.html','pessoal.html'].includes(page()));
 }
 document.documentElement.dataset.tarefasVersion=VERSION;
 document.querySelectorAll('.v65-version-badge').forEach(b=>{b.textContent='● TAREFAS v'+VERSION;b.title='Sobre a versão '+VERSION});
 document.querySelectorAll('.v65-mobile-version').forEach(v=>v.textContent='v'+VERSION);
 const g=document.getElementById('gamesVersionLabel');if(g)g.textContent='WEB '+VERSION+' · 26º PEL PE MEC';
}
function init(){apply();const obs=new MutationObserver(()=>apply());obs.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();