(function(){
'use strict';
if(window.__TAREFAS_V754_PATCH__)return;
window.__TAREFAS_V754_PATCH__=true;
const VERSION='7.5.4';
const page=()=>((location.pathname.split('/').pop()||'dashboard.html').toLowerCase());
const native=()=>!!window.__TAREFAS_NATIVE_APP__;
const user=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};
const prefKey=()=>`tarefas_v754_site_app_updates_${user()?.id||'anon'}`;
function siteUpdatesEnabled(){const v=localStorage.getItem(prefKey());return v===null?true:v==='1'}
function setSiteUpdatesEnabled(v){localStorage.setItem(prefKey(),v?'1':'0');window.dispatchEvent(new CustomEvent('tarefas:v754-site-update-pref',{detail:{enabled:!!v}}));}

function injectCss(){
 if(document.getElementById('tarefasV754Css'))return;
 const s=document.createElement('style');s.id='tarefasV754Css';s.textContent=`
 html.v754-scale-page,html.v754-scale-page body{max-width:100%;overflow-x:hidden}
 @media(max-width:900px){
  html.v754-scale-page body{width:100%!important}
  html.v754-scale-page .main,html.v754-scale-page .main-content,html.v754-scale-page .content,html.v754-scale-page main{min-width:0!important;max-width:100%!important;width:100%!important;overflow-x:hidden!important}
  html.v754-scale-page .panel,html.v754-scale-page .card,html.v754-scale-page section{min-width:0;max-width:100%}
  html.v754-scale-page #scaleBoard,html.v754-scale-page .scale-board,html.v754-scale-page .board,html.v754-scale-page .table-wrap,html.v754-scale-page .table-responsive{display:block!important;max-width:100%!important;width:100%!important;overflow-x:auto!important;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
  html.v754-scale-page #scaleBoard table,html.v754-scale-page .scale-board table,html.v754-scale-page table.scale-table,html.v754-scale-page table.mission-table{width:max-content!important;min-width:100%!important;max-width:none!important;table-layout:auto!important}
  html.v754-scale-page #scaleBoard th:first-child,html.v754-scale-page #scaleBoard td:first-child,html.v754-scale-page .scale-board th:first-child,html.v754-scale-page .scale-board td:first-child{position:sticky;left:0;z-index:4;min-width:170px;max-width:210px;background:var(--v4-surface,#0b1117);box-shadow:1px 0 0 var(--v4-border,#243044)}
  html.v754-scale-page .content{padding-left:12px!important;padding-right:12px!important}
  #modalNovaTarefa{z-index:2147483000!important;padding:10px!important;align-items:flex-start!important;overflow:auto!important}
  #modalNovaTarefa .modal-content{z-index:2147483001!important;width:min(620px,calc(100vw - 20px))!important;max-width:calc(100vw - 20px)!important;max-height:calc(100dvh - 100px)!important;margin:8px auto 92px!important;overflow:auto!important;overscroll-behavior:contain}
  body.v754-task-modal-open .tm-bottom-nav,body.v754-task-modal-open .tm-mobile-nav{z-index:900!important}
  body.v754-users-inline .layout{display:block!important}
  body.v754-users-inline .right-stack.v754-inline-detail{display:block!important;margin:0 10px 16px!important;padding:0!important;grid-template-columns:none!important}
  body.v754-users-inline .right-stack.v754-inline-detail>.panel{margin-top:8px!important}
 }
 .v754-setting-card{background:var(--v4-surface,#fff);border:1px solid var(--v4-border,#d1d5db);border-radius:12px;padding:18px;margin-top:18px;color:var(--v4-text,#111827)}
 .v754-setting-card h3{font-size:16px;margin:0 0 8px}.v754-setting-card p{font-size:12px;color:var(--v4-muted,#6b7280);line-height:1.5;margin:0 0 14px}
 .v754-switch-row{display:flex;align-items:center;justify-content:space-between;gap:16px}.v754-switch-row label{font-weight:700;font-size:13px}.v754-switch-row input{width:20px;height:20px;accent-color:#22c55e}
 .v754-logout{width:100%;border:1px solid #7f1d1d;background:#2a1010;color:#fecaca;border-radius:10px;padding:12px 14px;font-weight:800;cursor:pointer;margin-top:10px}
 `;document.head.appendChild(s);
}

function markScalePage(){
 const p=page();document.documentElement.classList.toggle('v754-scale-page',p==='pessoal.html'||p==='missao.html');
}

function replaceTSV(){
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const nodes=[];let n;while((n=walker.nextNode())){if(/\bTSV\b/.test(n.nodeValue||''))nodes.push(n)}
 for(const t of nodes)t.nodeValue=t.nodeValue.replace(/\bTSV\b/g,'TS');
 document.querySelectorAll('[title*="TSV"]').forEach(el=>el.title=el.title.replace(/\bTSV\b/g,'TS'));
 document.querySelectorAll('[data-v752-label="TSV"]').forEach(el=>{el.dataset.v752Label='TS';if(el.textContent.trim()==='TSV')el.textContent='TS'});
}

function taskModalLayer(){
 if(page()!=='menu.html')return;
 const modal=document.getElementById('modalNovaTarefa');if(!modal)return;
 const open=getComputedStyle(modal).display!=='none'&&modal.style.display!=='none';
 document.body.classList.toggle('v754-task-modal-open',open);
}

let usersHome=null,usersNext=null;
function restoreUsersStack(){
 const stack=document.querySelector('.right-stack.v754-inline-detail');if(!stack||!usersHome)return;
 stack.classList.remove('v754-inline-detail');
 if(usersNext&&usersNext.parentNode===usersHome)usersHome.insertBefore(stack,usersNext);else usersHome.appendChild(stack);
 document.body.classList.remove('v754-users-inline');
}
function usersInline(){
 if(page()!=='usuarios.html')return;
 const stack=document.querySelector('.right-stack');if(!stack)return;
 if(!usersHome){usersHome=stack.parentNode;usersNext=stack.nextSibling}
 if(window.innerWidth>900){restoreUsersStack();return}
 if(document.body.dataset.v754UsersWired==='1')return;
 document.body.dataset.v754UsersWired='1';
 document.addEventListener('click',e=>{
  const btn=e.target.closest?.('.user-row .icon-btn');if(!btn)return;
  const row=btn.closest('.user-row');if(!row)return;
  setTimeout(()=>{
   const current=document.querySelector('.right-stack');if(!current)return;
   row.insertAdjacentElement('afterend',current);current.classList.add('v754-inline-detail');document.body.classList.add('v754-users-inline');
   requestAnimationFrame(()=>current.scrollIntoView({block:'nearest',behavior:'smooth'}));
  },40);
 },true);
 window.addEventListener('resize',()=>{if(window.innerWidth>900)restoreUsersStack()});
}

function notificationCards(){
 const tags=[...document.querySelectorAll('body *')].filter(el=>el.children.length===0&&String(el.textContent||'').trim()==='app_update');
 return tags.map(tag=>tag.closest('[data-notificacao-id],.notification-item,.notificacao-item,.notif-item,article,li,.card')||tag.parentElement?.parentElement).filter(Boolean);
}
function filterSiteAppUpdates(){
 if(native())return;
 for(const card of notificationCards()){card.style.display='none';card.dataset.v754AppUpdate='hidden'}
 document.getElementById('v754SiteAppUpdates')?.remove();
}
function injectSiteUpdateSetting(){
 if(native())return;
 document.getElementById('v754SiteAppUpdates')?.remove();
}

function injectAppLogout(){
 if(!native()||page()!=='configuracoes.html'||document.getElementById('v754AppLogout'))return;
 const host=document.querySelector('.content')||document.querySelector('main')||document.body;
 const card=document.createElement('section');card.id='v754AppLogout';card.className='v754-setting-card';card.innerHTML='<h3>Conta</h3><p>Encerra sua sessão neste aparelho e volta para a tela de login.</p><button class="v754-logout" type="button">Sair da conta</button>';
 host.appendChild(card);
 card.querySelector('button').addEventListener('click',async()=>{
  if(!confirm('Deseja sair da sua conta neste aparelho?'))return;
  try{await window.TarefasNative?.notifications?.unregisterPush?.()}catch(_){}
  for(const k of ['usuarioLogado','tarefasPushSession17','tarefasPushReady17'])localStorage.removeItem(k);
  sessionStorage.removeItem('tarefasPushPassword17');location.href='index.html';
 });
}

let scheduled=false;
function apply(){
 scheduled=false;injectCss();markScalePage();replaceTSV();taskModalLayer();usersInline();injectSiteUpdateSetting();injectAppLogout();filterSiteAppUpdates();document.documentElement.dataset.tarefasVersion=VERSION;
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}
function init(){apply();const obs=new MutationObserver(schedule);obs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']});setInterval(schedule,2500);window.addEventListener('focus',schedule);window.addEventListener('tarefas:v754-site-update-pref',schedule)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();