(function(){
'use strict';
let observer=null,busy=false,timer=null,lastRange='',holidayMap=new Map(),channel=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function css(){
 if(document.getElementById('v72HolidayCss'))return;
 const s=document.createElement('style');s.id='v72HolidayCss';s.textContent=`
 .day-cell.v72-holiday:not(.other-month){background:color-mix(in srgb,#ef4444 7%,var(--v4-surface))}
 .day-cell.v72-holiday.selected{background:var(--v4-accent-soft)}
 .v72-holiday-label{font-size:9px;line-height:1.15;color:#dc2626;font-weight:800;margin:-2px 0 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .v72-selected-holiday{margin:-10px 0 14px;padding:7px 9px;border:1px solid #fecaca;border-radius:7px;background:#fff1f2;color:#991b1b;font-size:10px;font-weight:700}
 `;document.head.appendChild(s);
}
function cells(){return [...document.querySelectorAll('#calendarGrid .day-cell[data-date]')]}
function visibleRange(){
 const a=cells().map(x=>x.dataset.date).filter(Boolean).sort();return a.length?{ini:a[0],fim:a[a.length-1],key:a[0]+'|'+a[a.length-1]}:null;
}
async function loadHolidays(){
 const r=visibleRange();if(!r||typeof supabaseClient==='undefined')return;
 if(r.key!==lastRange){
  const q=await supabaseClient.from('escala_feriados').select('data,nome').gte('data',r.ini).lte('data',r.fim).order('data');
  if(q.error)return console.warn('V7.2 feriados:',q.error.message);
  holidayMap=new Map((q.data||[]).map(x=>[x.data,x]));lastRange=r.key;
 }
 decorate();
}
function decorate(){
 if(busy)return;busy=true;if(observer)observer.disconnect();
 try{
  cells().forEach(cell=>{
   cell.querySelectorAll('.v72-holiday-label').forEach(x=>x.remove());
   const h=holidayMap.get(cell.dataset.date);
   cell.classList.toggle('v72-holiday',!!h);
   if(h){
    const label=document.createElement('div');label.className='v72-holiday-label';label.textContent=h.nome;label.title=h.nome;
    const num=cell.querySelector('.day-number');if(num)num.insertAdjacentElement('afterend',label);else cell.prepend(label);
   }
  });
  const selected=document.querySelector('#calendarGrid .day-cell.selected[data-date]')?.dataset.date;
  let box=document.getElementById('v72SelectedHoliday');
  const h=holidayMap.get(selected);
  if(h){
   if(!box){box=document.createElement('div');box.id='v72SelectedHoliday';box.className='v72-selected-holiday';document.getElementById('selectedDateLabel')?.insertAdjacentElement('afterend',box)}
   box.textContent='Feriado: '+h.nome;
  }else box?.remove();
 }finally{
  busy=false;if(observer)observer.observe(document.getElementById('calendarGrid'),{childList:true,subtree:true});
 }
}
function schedule(){
 clearTimeout(timer);timer=setTimeout(async()=>{lastRange='';await loadHolidays()},80);
}
function init(){
 css();const grid=document.getElementById('calendarGrid');if(!grid)return;
 observer=new MutationObserver(schedule);observer.observe(grid,{childList:true,subtree:true});
 loadHolidays();
 try{
  channel=supabaseClient.channel('v72-calendar-holidays').on('postgres_changes',{event:'*',schema:'public',table:'escala_feriados'},schedule).subscribe();
 }catch(_){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();