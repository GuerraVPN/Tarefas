(function(){
'use strict';
if(window.__TAREFAS_WEB_793_NAV__)return;
window.__TAREFAS_WEB_793_NAV__=true;

const VERSION='7.9.3';
const SHEETS=[
  {key:'motorista',label:'Motorista',url:'https://docs.google.com/spreadsheets/d/1T_BM9KY0NLwVhlifetQ6W6AdetujQjx--zOZHa27eQs/edit?usp=drivesdk'},
  {key:'patrulheiro',label:'Patrulheiro',url:'https://docs.google.com/spreadsheets/d/1_LlfIHx4EuSHkC9BOR2VorvXoaiMyLa028wU6C0dQLs/edit?usp=drivesdk'},
  {key:'permanencia',label:'Permanência',url:'https://docs.google.com/spreadsheets/d/13eEei_JdGjAdVo371BGfPS59QdYySe9lJ47DLjWb_x0/edit?usp=drivesdk'}
];

const page=()=>String(location.pathname.split('/').pop()||'dashboard.html').toLowerCase();
const $=id=>document.getElementById(id);

function people(){return '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'}
function arrow(){return '<svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg>'}
function scaleIcon(){return '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/></svg>'}
function externalIcon(){return '<svg viewBox="0 0 24 24"><path d="M14 5h5v5"/><path d="M19 5 11 13"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>'}

function injectCss(){
  if($('v793NavCss'))return;
  const s=document.createElement('style');
  s.id='v793NavCss';
  s.textContent=[
    '.v7-pessoal-parent{display:block!important;padding:0!important;overflow:visible!important}',
    '.v7-pessoal-sub{display:none;padding:3px 5px 8px 28px}',
    '.v7-pessoal-parent:hover .v7-pessoal-sub,.v7-pessoal-parent:focus-within .v7-pessoal-sub,.v7-pessoal-parent.v62-subopen .v7-pessoal-sub{display:grid;gap:2px}',
    '.v7-pessoal-parent:hover .v6-orc-arrow,.v7-pessoal-parent:focus-within .v6-orc-arrow,.v7-pessoal-parent.v62-subopen .v6-orc-arrow{transform:rotate(180deg)}',
    '.v793-scale-parent{display:block}',
    '.v793-scale-toggle{width:100%;display:flex;align-items:center;gap:9px;border:0;background:transparent;color:var(--v4-sidebar-text,#d9dee7);border-radius:7px;padding:8px;text-align:left;font:inherit;font-size:9px;font-weight:700;cursor:pointer}',
    '.v793-scale-toggle:hover,.v793-scale-toggle[aria-expanded="true"]{background:var(--v4-sidebar-hover,#26344a);color:var(--v4-gold,#e0b44c)}',
    '.v793-scale-icon,.v793-external{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 16px}',
    '.v793-scale-icon svg,.v793-external svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    '.v793-scale-arrow{margin-left:auto;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;transition:transform .16s ease}',
    '.v793-scale-arrow svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    '.v793-scale-toggle[aria-expanded="true"] .v793-scale-arrow{transform:rotate(180deg)}',
    '.v793-scale-sub{display:none;padding:1px 0 5px 25px}',
    '.v793-scale-parent:hover .v793-scale-sub,.v793-scale-parent:focus-within .v793-scale-sub,.v793-scale-parent.v793-open .v793-scale-sub{display:grid;gap:1px}',
    '.v793-scale-sub a{display:flex;align-items:center;justify-content:space-between;gap:8px;text-decoration:none;border:0;background:transparent;color:var(--v4-sidebar-text,#d9dee7);border-radius:7px;padding:7px 8px;text-align:left;font-size:9px;cursor:pointer}',
    '.v793-scale-sub a:hover{background:var(--v4-sidebar-hover,#26344a);color:var(--v4-gold,#e0b44c)}',
    '.v793-scale-sub a .v793-ext-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.v793-simple-link{display:block;text-decoration:none;border:0;background:transparent;color:var(--v4-sidebar-text,#d9dee7);border-radius:7px;padding:8px;text-align:left;font-size:9px;cursor:pointer}',
    '.v793-simple-link:hover,.v793-simple-link.active{background:var(--v4-sidebar-hover,#26344a);color:var(--v4-gold,#e0b44c)}',
    '@media(max-width:900px){.v7-pessoal-parent:hover .v7-pessoal-sub{display:none}.v7-pessoal-parent.v62-subopen .v7-pessoal-sub{display:grid}.v7-pessoal-parent>.v6-orc-main{min-height:48px;padding:12px 11px!important;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.v7-pessoal-parent>.v6-orc-main .v6-orc-arrow{width:24px;height:24px;pointer-events:none}.v7-pessoal-sub{padding:4px 7px 9px 30px!important}.v793-scale-toggle,.v793-simple-link{min-height:42px;padding:10px 11px!important;font-size:11px!important;touch-action:manipulation}.v793-scale-sub{padding:2px 0 7px 24px!important}.v793-scale-sub a{min-height:42px;padding:10px 11px!important;font-size:11px!important;touch-action:manipulation}}'
  ].join('\n');
  document.head.appendChild(s);
}

function scaleExpanded(parent){
  return parent?.classList.contains('v793-open')||parent?.querySelector('.v793-scale-toggle[aria-expanded="true"]')!=null;
}

function build(parent){
  const oldExpanded=scaleExpanded(parent);
  const sheetLinks=SHEETS.map(x=>'<a href="'+x.url+'" target="_blank" rel="noopener noreferrer external" data-v793-sheet="'+x.key+'" title="Abrir escala de '+x.label.toLowerCase()+' no Google Sheets"><span class="v793-ext-label">'+x.label+'</span><span class="v793-external">'+externalIcon()+'</span></a>').join('');
  parent.innerHTML=
    '<a class="v6-orc-main" data-v7-main href="pessoal.html">'+
      '<span class="v6-nav-icon">'+people()+'</span>'+
      '<span class="v6-nav-label">Pessoal</span>'+
      '<span class="v6-orc-arrow">'+arrow()+'</span>'+
    '</a>'+
    '<div class="v7-pessoal-sub" id="v793PessoalSub">'+
      '<div class="v793-scale-parent'+(oldExpanded?' v793-open':'')+'">'+
        '<button class="v793-scale-toggle" type="button" data-v793-scale-toggle aria-expanded="'+(oldExpanded?'true':'false')+'" aria-controls="v793ScaleSub">'+
          '<span class="v793-scale-icon">'+scaleIcon()+'</span><span>Escala</span><span class="v793-scale-arrow">'+arrow()+'</span>'+
        '</button>'+
        '<div class="v793-scale-sub" id="v793ScaleSub">'+sheetLinks+'</div>'+
      '</div>'+
      '<a class="v793-simple-link" data-v793-link="afastamentos" href="ferias_dispensas.html">Férias / Dispensas</a>'+
      '<a class="v793-simple-link" data-v793-link="usuarios" href="usuarios.html">Usuários</a>'+
    '</div>';
}

function sync(parent){
  const p=page();
  parent.classList.toggle('active',['pessoal.html','ferias_dispensas.html','usuarios.html'].includes(p));
  parent.querySelector('[data-v793-link="afastamentos"]')?.classList.toggle('active',p==='ferias_dispensas.html');
  parent.querySelector('[data-v793-link="usuarios"]')?.classList.toggle('active',p==='usuarios.html');
  const main=parent.querySelector('[data-v7-main]');
  if(main)main.setAttribute('aria-expanded',parent.classList.contains('v62-subopen')?'true':'false');
}

function wire(parent){
  if(parent.dataset.v793Wired==='1')return;
  const main=parent.querySelector('[data-v7-main]');
  const toggle=parent.querySelector('[data-v793-scale-toggle]');
  if(main){
    main.setAttribute('aria-haspopup','true');
    main.setAttribute('aria-controls','v793PessoalSub');
    main.addEventListener('click',e=>{
      if(!window.matchMedia('(max-width: 900px)').matches)return;
      e.preventDefault();e.stopPropagation();
      parent.classList.toggle('v62-subopen');
      sync(parent);
    });
    main.addEventListener('keydown',e=>{
      if(!window.matchMedia('(max-width: 900px)').matches)return;
      if(e.key!=='Enter'&&e.key!==' ')return;
      e.preventDefault();e.stopPropagation();
      parent.classList.toggle('v62-subopen');
      sync(parent);
    });
  }
  if(toggle){
    toggle.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      const scale=parent.querySelector('.v793-scale-parent');
      const open=!scale?.classList.contains('v793-open');
      scale?.classList.toggle('v793-open',open);
      toggle.setAttribute('aria-expanded',open?'true':'false');
    });
  }
  parent.dataset.v793Wired='1';
}

function findOrCreateParent(){
  const list=document.querySelector('.sidebar ul,.sidebar .menu-items');
  if(!list)return null;
  let parent=list.querySelector('.v7-pessoal-parent');
  const old=list.querySelector('[data-v6-nav="usuarios"]');
  if(!parent&&old){
    parent=document.createElement('li');
    parent.className='v6-orc-parent v7-pessoal-parent';
    parent.dataset.v7Nav='pessoal';
    old.replaceWith(parent);
  }
  return parent;
}

function render(){
  injectCss();
  const parent=findOrCreateParent();
  if(!parent)return false;
  if(parent.dataset.v793Nav!=='1'||!parent.querySelector('[data-v793-scale-toggle]')){
    build(parent);
    parent.dataset.v793Nav='1';
    parent.dataset.v793Wired='';
    wire(parent);
  }else{
    sync(parent);
  }
  sync(parent);
  document.documentElement.dataset.tarefasVersion=VERSION;
  document.querySelectorAll('.v65-version-badge').forEach(b=>{
    const t='● TAREFAS v'+VERSION;
    if(b.textContent!==t)b.textContent=t;
    b.title='Sobre a versão '+VERSION;
  });
  document.querySelectorAll('.v65-mobile-version').forEach(v=>{
    const t='v'+VERSION;if(v.textContent!==t)v.textContent=t;
  });
  const games=document.getElementById('gamesVersionLabel');
  if(games)games.textContent='WEB '+VERSION+' · 26º PEL PE MEC';
  return true;
}

function init(){
  if(render())return;
  const bodyObs=new MutationObserver(()=>{
    if(render())bodyObs.disconnect();
  });
  bodyObs.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();