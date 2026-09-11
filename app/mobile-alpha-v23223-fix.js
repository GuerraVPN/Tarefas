(()=>{
'use strict';
const VERSION='2.3.22.3',BUILD=266,MARK='__TAREFAS_ALPHA_NAV_V266__';
if(globalThis[MARK])return;globalThis[MARK]=true;
const page=()=>((location.pathname.split('/').pop()||'dashboard.html').toLowerCase());
const tabs=[
  ['notificacoes','🔔','Notificações','Avisos e atualizações'],
  ['mensagens','✉️','Mensagens','Conversas entre usuários'],
  ['downloads','📥','Downloads','Arquivos salvos no aparelho'],
  ['favoritos','⭐','Favoritos','Atalhos pessoais'],
  ['ferramentas','🧰','Ferramentas','Filtros, sincronização e diagnóstico']
];
const valid=new Set(tabs.map(x=>x[0]));
const requested=()=>{const v=new URLSearchParams(location.search).get('tab');return valid.has(v)?v:'notificacoes'};
function css(){if(document.getElementById('a23223-nav-style'))return;const s=document.createElement('style');s.id='a23223-nav-style';s.textContent=`
.tm-alpha-main-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:9px 12px;background:var(--v4-surface,#fff);border-bottom:1px solid var(--v4-border,#e5e7eb);position:sticky;top:calc(58px + env(safe-area-inset-top,0px));z-index:80}.tm-alpha-main-tabs::-webkit-scrollbar{display:none}.tm-alpha-main-tab{flex:0 0 auto;border:1px solid var(--v4-border,#d7dce3);background:var(--v4-surface,#fff);color:inherit;border-radius:10px;padding:8px 11px;font-size:11px;font-weight:800}.tm-alpha-main-tab.active{background:var(--v4-text,#111827);color:var(--v4-surface,#fff);border-color:var(--v4-text,#111827)}
.tm-alpha-main-tab span{margin-right:5px}.a23223-section .heading{margin-top:4px}.a23223-section #a23221-central-tabs{display:none!important}.a23223-section #a23221-central-aux{min-height:calc(100dvh - 215px)!important}.a23223-section-downloads .grid,.a23223-section-favoritos .grid,.a23223-section-ferramentas .grid{display:none!important}.a23223-section-downloads #a23221-central-aux,.a23223-section-favoritos #a23221-central-aux,.a23223-section-ferramentas #a23221-central-aux{display:flex!important}.a23223-section-mensagens .grid,.a23223-section-notificacoes .grid{display:grid}.a23223-section .a23221-central-aux{border-radius:13px!important}
@media(max-width:720px){.tm-alpha-main-tabs{top:calc(56px + env(safe-area-inset-top,0px));padding:8px 10px}.tm-alpha-main-tab{padding:8px 10px}.a23223-section #a23221-central-aux{min-height:calc(100dvh - 205px)!important}}
`;document.head.appendChild(s)}
function installMainTabs(tab){let nav=document.getElementById('tmAlphaMainTabs');if(!nav){nav=document.createElement('nav');nav.id='tmAlphaMainTabs';nav.className='tm-alpha-main-tabs';nav.setAttribute('aria-label','Seções do aplicativo');nav.innerHTML=tabs.map(([key,icon,label])=>`<button class="tm-alpha-main-tab" data-main-tab="${key}"><span>${icon}</span>${label}</button>`).join('');const header=document.querySelector('.tm-app-header');const pageRoot=document.querySelector('.page');if(header)header.after(nav);else if(pageRoot)pageRoot.before(nav);else document.body.prepend(nav);nav.addEventListener('click',e=>{const b=e.target.closest('[data-main-tab]');if(!b)return;location.href=`central.html?tab=${encodeURIComponent(b.dataset.mainTab)}`})}nav.querySelectorAll('[data-main-tab]').forEach(b=>b.classList.toggle('active',b.dataset.mainTab===tab))}
function updateHeading(tab){const meta=Object.fromEntries(tabs.map(x=>[x[0],x]));const [,icon,label,desc]=meta[tab]||meta.notificacoes;const h=document.querySelector('.page .heading h2'),p=document.querySelector('.page .heading p'),newMsg=document.getElementById('newMsg');if(h)h.textContent=`${icon} ${label}`;if(p)p.textContent=desc;if(newMsg)newMsg.hidden=tab!=='mensagens';document.title=`${label} - TAREFAS ${VERSION} Alpha`}
function activateLegacyView(tab){const oldTabs=document.getElementById('a23221-central-tabs');const oldButton=oldTabs?.querySelector(`[data-tab="${tab}"]`);if(oldButton)oldButton.click();setTimeout(()=>{document.getElementById('a23221-central-tabs')?.remove();const aux=document.getElementById('a23221-central-aux');if(['downloads','favoritos','ferramentas'].includes(tab)&&aux&&!aux.innerHTML.trim()&&oldButton){oldButton.click();setTimeout(()=>document.getElementById('a23221-central-tabs')?.remove(),0)}},0)}
function addDrawerShortcuts(){const body=document.querySelector('#tmDrawer .tm-sheet-body');if(!body||body.querySelector('[data-alpha-quick]'))return;const group=document.createElement('div');group.className='tm-drawer-group';group.dataset.alphaQuick='1';group.innerHTML=`<h3>Acesso rápido</h3>${tabs.map(([key,icon,label,desc])=>`<button class="tm-drawer-item" data-alpha-href="central.html?tab=${key}"><span><strong>${icon} ${label}</strong><small>${desc}</small></span></button>`).join('')}`;group.querySelectorAll('[data-alpha-href]').forEach(b=>b.onclick=()=>location.href=b.dataset.alphaHref);body.appendChild(group)}
function apply(){css();if(page()!=='central.html')return;const tab=requested();document.body.classList.add('a23223-section',`a23223-section-${tab}`);installMainTabs(tab);updateHeading(tab);activateLegacyView(tab);setTimeout(()=>{installMainTabs(tab);updateHeading(tab);activateLegacyView(tab)},250)}
const obs=new MutationObserver(()=>addDrawerShortcuts());obs.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
globalThis.TarefasAlpha23223={version:VERSION,build:BUILD,open:tab=>{if(valid.has(tab))location.href=`central.html?tab=${tab}`}};
})();
