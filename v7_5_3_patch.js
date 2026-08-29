(function(){
'use strict';
if(window.__TAREFAS_V753_PATCH__)return;
window.__TAREFAS_V753_PATCH__=true;
const VERSION='7.5.3';
const PERIOD_KEY='tarefas_v743_period';
const page=(location.pathname.split('/').pop()||'').toLowerCase();

function pad(n){return String(n).padStart(2,'0')}
function iso(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function parseIso(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3]):new Date()}
function readPeriod(){
 let x=null;try{x=JSON.parse(localStorage.getItem(PERIOD_KEY)||'null')}catch(_){}
 return{mode:['day','week','month'].includes(x?.mode)?x.mode:'day',anchor:/^\d{4}-\d{2}-\d{2}$/.test(x?.anchor||'')?x.anchor:iso(new Date())};
}
function writePeriod(st){localStorage.setItem(PERIOD_KEY,JSON.stringify(st))}
function hardReload(){const u=new URL(location.href);u.searchParams.set('_v753',String(Date.now()));location.replace(u.href)}
function shiftPeriod(dir){
 const st=readPeriod(),d=parseIso(st.anchor);
 if(st.mode==='day')d.setDate(d.getDate()+dir);
 else if(st.mode==='week')d.setDate(d.getDate()+7*dir);
 else d.setMonth(d.getMonth()+dir,1);
 writePeriod({mode:st.mode,anchor:iso(d)});hardReload();
}
function shiftLegacyMonth(dir){
 const st=readPeriod(),d=parseIso(st.anchor);d.setMonth(d.getMonth()+dir,1);
 writePeriod({mode:'month',anchor:iso(d)});hardReload();
}
function todayPeriod(){const st=readPeriod();writePeriod({mode:st.mode,anchor:iso(new Date())});hardReload()}
function wireServicePeriod(){
 if(page!=='pessoal.html')return;
 document.addEventListener('click',e=>{
   const modern=e.target.closest('[data-v743-shift]');
   if(modern){e.preventDefault();e.stopImmediatePropagation();shiftPeriod(Number(modern.dataset.v743Shift)||0);return}
   const id=e.target.closest('button')?.id;
   if(id==='prevMonth'||id==='nextMonth'){e.preventDefault();e.stopImmediatePropagation();shiftLegacyMonth(id==='prevMonth'?-1:1);return}
   if(id==='todayMonth'){e.preventDefault();e.stopImmediatePropagation();todayPeriod()}
 },true);
}

function logged(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
const GROUPS={sargento:'Sargentos',motorista:'Motoristas',patrulheiro:'Patrulheiros',permanencia:'Permanência',canil:'Permanência/Canil'};
let serviceRows=[],lastRange='',loading=false,observer=null,channel=null,applying=false;

function calendarRange(){
 const cells=[...document.querySelectorAll('#calendarGrid .day-cell[data-date]')];
 const dates=cells.map(x=>x.dataset.date).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort();
 return dates.length?{ini:dates[0],fim:dates[dates.length-1]}:null;
}
async function loadCalendarServices(force=false){
 if(page!=='calendario.html')return;
 const c=client(),u=logged(),rg=calendarRange();if(!c||!u?.id||!rg||loading)return;
 const sig=`${rg.ini}|${rg.fim}|${u.id}`;if(!force&&sig===lastRange)return applyCalendarServices();
 loading=true;
 try{
   const r=await c.from('escala_servicos')
    .select('id,grupo,data_servico,usuario_id,marcacao,observacao')
    .eq('usuario_id',Number(u.id))
    .gte('data_servico',rg.ini).lte('data_servico',rg.fim)
    .order('data_servico').order('grupo').order('id');
   if(!r.error){serviceRows=r.data||[];lastRange=sig}
 }catch(_){}finally{loading=false;applyCalendarServices()}
}
function ensureCalendarCss(){
 if(document.getElementById('v753CalendarCss'))return;
 const s=document.createElement('style');s.id='v753CalendarCss';s.textContent=`
 .day-service-v753{display:flex;gap:7px;align-items:flex-start;font-size:11px;line-height:1.25;margin-bottom:7px;min-width:0;font-weight:800;color:var(--v4-text,#111827)}
 .day-service-v753 .v753-service-dot{width:8px;height:8px;border-radius:2px;flex:0 0 8px;margin-top:2px;background:var(--v4-accent,#eab308)}
 .v753-service-title{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
 .v753-service-card{border:1px solid var(--line,var(--v4-border));border-left:4px solid var(--v4-accent,#eab308);border-radius:9px;padding:14px;margin-bottom:12px;cursor:pointer;background:var(--v4-surface,#fff)}
 .v753-service-card b{display:block;font-size:14px;margin-bottom:5px}.v753-service-card small{display:block;color:var(--v4-muted,#6b7280);line-height:1.4}
 .v753-service-badge{display:inline-flex;margin-top:8px;border-radius:5px;padding:5px 9px;background:var(--v4-accent-soft,#fff4c9);font-size:10px;font-weight:900}
 `;document.head.appendChild(s);
}
function ensureLegend(){
 const legend=document.querySelector('.legend');if(!legend||legend.querySelector('[data-v753-service-legend]'))return;
 const el=document.createElement('div');el.className='legend-item';el.dataset.v753ServiceLegend='1';el.innerHTML='<span class="v753-service-dot" style="width:12px;height:12px;border-radius:2px;background:var(--v4-accent,#eab308)"></span>Serviço';
 legend.insertBefore(el,legend.querySelector('.legend-spacer'));
}
function serviceLabel(s){return `${s.marcacao||'SV'} · ${GROUPS[s.grupo]||s.grupo||'Serviço'}`}
function applyCalendarServices(){
 if(page!=='calendario.html'||applying)return;applying=true;
 try{
   ensureCalendarCss();ensureLegend();
   document.querySelectorAll('[data-v753-service-item],[data-v753-service-card]').forEach(x=>x.remove());
   for(const s of serviceRows){
     const cell=document.querySelector(`#calendarGrid .day-cell[data-date="${CSS.escape(String(s.data_servico))}"]`);if(!cell)continue;
     const item=document.createElement('div');item.className='day-service-v753';item.dataset.v753ServiceItem=String(s.id);item.title='Abrir Escala de serviço';
     item.innerHTML=`<span class="v753-service-dot"></span><span class="v753-service-title">${esc(serviceLabel(s))}</span>`;
     item.addEventListener('click',e=>{e.stopPropagation();location.href='pessoal.html'});cell.appendChild(item);
   }
   const selected=document.querySelector('#calendarGrid .day-cell.selected[data-date]')?.dataset.date;
   const list=document.getElementById('dayTasksList');
   if(selected&&list){
     const day=serviceRows.filter(x=>x.data_servico===selected);
     day.forEach(s=>{const card=document.createElement('div');card.className='v753-service-card';card.dataset.v753ServiceCard=String(s.id);card.innerHTML=`<b>🛡️ ${esc(GROUPS[s.grupo]||'Serviço')}</b><small>Serviço confirmado na escala.</small>${s.observacao?`<small>${esc(s.observacao)}</small>`:''}<span class="v753-service-badge">${esc(s.marcacao||'SV')}</span>`;card.onclick=()=>location.href='pessoal.html';list.appendChild(card)});
   }
 }finally{applying=false}
}
function watchCalendar(){
 if(page!=='calendario.html')return;
 ensureCalendarCss();
 let timer=null;
 observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{loadCalendarServices();applyCalendarServices()},80)});
 const root=document.getElementById('calendarGrid')?.parentElement||document.body;observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-date']});
 loadCalendarServices(true);
 try{const c=client();if(c){channel=c.channel('v753-calendario-servicos').on('postgres_changes',{event:'*',schema:'public',table:'escala_servicos'},()=>loadCalendarServices(true)).subscribe()}}catch(_){}
 window.addEventListener('focus',()=>loadCalendarServices(true));
}

function init(){document.documentElement.dataset.tarefasVersion=VERSION;wireServicePeriod();watchCalendar()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
