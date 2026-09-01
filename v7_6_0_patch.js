(function(){
'use strict';
if(window.__TAREFAS_V760_PATCH__)return;
window.__TAREFAS_V760_PATCH__=true;
const VERSION='7.6.0';
const page=()=>((location.pathname.split('/').pop()||'menu.html').toLowerCase());
function addStyle(){if(document.getElementById('v760GamesStyle'))return;const s=document.createElement('style');s.id='v760GamesStyle';s.textContent=`.v760-games-nav{cursor:pointer}.v760-games-nav.active{background:var(--v4-surface-3,#1f2937);color:var(--v4-text,#fff)}.tm-web-back{display:inline-flex;align-items:center;gap:7px;margin:0 4px 10px;padding:8px 11px;border:1px solid #315c4c;border-radius:11px;background:#0d211a;color:#bfe8d4!important;text-decoration:none;font-size:11px;font-weight:850}.tm-web-back:hover{border-color:#38e69f;color:#fff!important}.tarefas-native-app .tm-web-back{display:none!important}`;document.head.appendChild(s)}
function navItem(list){if(list.querySelector('[data-v760-games]'))return;const li=document.createElement('li');li.dataset.v760Games='1';li.className='v760-games-nav'+(page()==='games.html'?' active':'');li.textContent='🎮 Jogos';li.title='Abrir Jogos';li.onclick=()=>{location.href='games.html'};const items=[...list.children];const config=items.find(x=>(x.textContent||'').toLowerCase().includes('configura'));if(config)list.insertBefore(li,config);else list.appendChild(li)}
function addNav(){document.querySelectorAll('ul.menu-items,ul.nav').forEach(navItem)}
function addDashboardShortcut(){if(page()!=='dashboard.html')return;if(document.querySelector('[data-v760-games-shortcut]'))return;const candidates=[...document.querySelectorAll('a,button,.shortcut,.quick-card,.dash-card')];const anchor=candidates.find(x=>(x.textContent||'').includes('Calendário'));if(!anchor||!anchor.parentElement)return;const card=document.createElement(anchor.tagName==='A'?'a':'button');card.dataset.v760GamesShortcut='1';if(card.tagName==='A')card.href='games.html';else{card.type='button';card.onclick=()=>location.href='games.html'}card.className=anchor.className;card.innerHTML='<span aria-hidden="true">🎮</span><strong>Jogos</strong><small>Ranking público</small>';anchor.parentElement.appendChild(card)}
function apply(){addStyle();addNav();addDashboardShortcut();document.documentElement.dataset.tarefasVersion=VERSION}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.addEventListener('focus',apply);
})();