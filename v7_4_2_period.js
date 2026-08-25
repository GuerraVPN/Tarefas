(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const svc=page==='pessoal.html',mis=page==='missao.html';
if(!svc&&!mis)return;
let mode='month';
function css(){if($('#v742PeriodCss'))return;const s=document.createElement('style');s.id='v742PeriodCss';s.textContent=`
.v742-periods{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.v742-periods .v7-btn.active{background:var(--v4-accent);border-color:var(--v4-accent);color:#fff}
@media(max-width:700px){.v742-periods{display:grid;grid-template-columns:1fr 1fr;width:100%}.v742-periods .v7-btn{width:100%}}
`;document.head.appendChild(s)}
function today(){const d=new Date();d.setHours(0,0,0,0);return d}
function mon(d){const x=new Date(d),n=(x.getDay()+6)%7;x.setDate(x.getDate()-n);x.setHours(0,0,0,0);return x}
function same(a,b){return a&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function monthYear(){const t=(document.getElementById('monthLabel')?.textContent||'').toLowerCase(),ms=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],m=ms.findIndex(x=>t.includes(x)),y=Number((t.match(/20\d{2}/)||[])[0])||today().getFullYear();return{m:m>=0?m:today().getMonth(),y}}
function dates(table){const {m,y}=monthYear();return [...table.querySelectorAll('thead th')].slice(1).map(th=>{const n=Number(th.querySelector('b')?.textContent||th.textContent.match(/\b\d{1,2}\b/)?.[0]);return n?new Date(y,m,n):null})}
function board(){return svc?$('#scaleBoard'):$('#missionScaleBoard')}
function apply(next){mode=next;$$('.v742-periods [data-v742-mode]').forEach(b=>b.classList.toggle('active',b.dataset.v742Mode===next));const base=today(),ws=mon(base),we=new Date(ws);we.setDate(we.getDate()+6);const tom=today();tom.setDate(tom.getDate()+1);$$((svc?'#scaleBoard ':'#missionScaleBoard ')+'.v7-table').forEach(t=>{const ds=dates(t),rows=[...t.rows];ds.forEach((d,i)=>{let show=true;if(next==='today')show=same(d,today());else if(next==='tomorrow')show=same(d,tom);else if(next==='week')show=!!d&&d>=ws&&d<=we;for(const r of rows)if(r.cells[i+1])r.cells[i+1].style.display=show?'':'none'})});document.documentElement.dataset.v742Period=next;window.dispatchEvent(new CustomEvent('v742:period',{detail:{mode:next}}))}
function init(){css();$('#v741Periods')?.remove();$('#v741Annual')?.remove();const a=$('.v7-head .v7-actions');if(!a||$('#v742Periods'))return;const d=document.createElement('div');d.id='v742Periods';d.className='v742-periods';d.innerHTML='<button class="v7-btn" data-v742-mode="today">Hoje</button><button class="v7-btn" data-v742-mode="tomorrow">Amanhã</button><button class="v7-btn" data-v742-mode="week">Esta semana</button><button class="v7-btn active" data-v742-mode="month">Mês</button>';d.onclick=e=>{const b=e.target.closest('[data-v742-mode]');if(b)apply(b.dataset.v742Mode)};a.insertBefore(d,a.firstChild);new MutationObserver(()=>{if(mode!=='month')apply(mode)}).observe(board()||document.body,{childList:true,subtree:true});apply('month')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
