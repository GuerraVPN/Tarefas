(function(){
'use strict';
if(window.__TAREFAS_CAL_REMINDERS_V772__) return;
window.__TAREFAS_CAL_REMINDERS_V772__=true;

const KEY='tarefas_calendar_reminders_v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const logged=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};
const userKey=()=>String(logged()?.id||logged()?.cpf||'anon');

function read(){
  try{
    const all=JSON.parse(localStorage.getItem(KEY)||'{}');
    const rows=Array.isArray(all[userKey()])?all[userKey()]:[];
    return rows.filter(x=>x&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&x.title);
  }catch(_){return []}
}
function write(rows){
  let all={};
  try{all=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){}
  all[userKey()]=rows;
  localStorage.setItem(KEY,JSON.stringify(all));
}
function selectedDate(){
  return document.querySelector('#calendarGrid .day-cell.selected[data-date]')?.dataset.date||'';
}
function fmtDate(s){
  const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return s||'';
  return new Date(+m[1],+m[2]-1,+m[3]).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
}
function ensureCss(){
 if(document.getElementById('v772ReminderCss'))return;
 const s=document.createElement('style');s.id='v772ReminderCss';s.textContent=`
 .v772-reminder-btn{width:100%;margin:0 0 14px;border:1px dashed #169447;background:var(--v4-surface);color:#15803d;border-radius:9px;padding:10px 12px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
 .v772-reminder-btn:hover{background:var(--v4-accent-soft)}
 .v772-reminder-item{display:flex;gap:9px;align-items:flex-start;border:1px solid var(--line,var(--v4-border));border-left:4px solid #8b5cf6;border-radius:9px;padding:10px;margin-bottom:9px;background:var(--v4-surface)}
 .v772-reminder-dot{width:8px;height:8px;border-radius:50%;background:#8b5cf6;flex:0 0 8px;margin-top:5px}
 .v772-reminder-main{min-width:0;flex:1}.v772-reminder-title{font-size:13px;font-weight:800;line-height:1.3}.v772-reminder-note{font-size:11px;color:var(--v4-muted);margin-top:4px;white-space:pre-wrap}
 .v772-reminder-time{font-size:10px;color:#7c3aed;margin-top:5px;font-weight:800}
 .v772-reminder-actions{display:flex;gap:4px}.v772-reminder-actions button{border:0;background:transparent;color:var(--v4-muted);cursor:pointer;padding:3px}
 .day-reminder-v772{display:flex;gap:5px;align-items:center;font-size:10px;line-height:1.2;margin-bottom:5px;color:#7c3aed;font-weight:800;min-width:0}
 .day-reminder-v772 i{font-size:9px}.v772-reminder-title-cell{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .v772-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.52);display:none;align-items:center;justify-content:center;z-index:2000;padding:18px}
 .v772-modal-bg.show{display:flex}.v772-modal{width:min(480px,100%);background:var(--v4-surface,#fff);border:1px solid var(--v4-border);border-radius:12px;padding:20px;box-shadow:0 18px 60px rgba(0,0,0,.2)}
 .v772-modal h3{margin:0 0 4px;font-size:19px}.v772-modal-sub{font-size:12px;color:var(--v4-muted);margin-bottom:16px}
 .v772-field{margin-bottom:12px}.v772-field label{display:block;font-size:11px;font-weight:800;color:var(--v4-text-2);margin-bottom:5px}
 .v772-field input,.v772-field textarea{width:100%;border:1px solid var(--v4-border-strong);background:var(--v4-surface);color:var(--v4-text);border-radius:8px;padding:10px;outline:none}
 .v772-field textarea{min-height:80px;resize:vertical}.v772-field input:focus,.v772-field textarea:focus{border-color:#169447;box-shadow:0 0 0 2px rgba(22,148,71,.08)}
 .v772-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.v772-modal-actions button{border:0;border-radius:8px;padding:9px 14px;cursor:pointer;font-weight:800}
 .v772-cancel{background:var(--v4-surface-3);color:var(--v4-text-2)}.v772-save{background:#169447;color:#fff}
 `;document.head.appendChild(s);
}
function ensureUi(){
 const label=document.getElementById('selectedDateLabel'), list=document.getElementById('dayTasksList');
 if(!label||!list)return;
 if(!document.getElementById('v772AddReminder')){
   const b=document.createElement('button');b.id='v772AddReminder';b.className='v772-reminder-btn';b.type='button';
   b.innerHTML='<i class="fa-regular fa-bell"></i> Adicionar lembrete nesta data';
   label.insertAdjacentElement('afterend',b);
   b.addEventListener('click',()=>openModal(selectedDate()));
 }
 if(!document.getElementById('v772ReminderList')){
   const box=document.createElement('div');box.id='v772ReminderList';box.dataset.v772ReminderList='1';
   list.insertAdjacentElement('beforebegin',box);
 }
 render();
}
function render(){
 const date=selectedDate(), rows=read().filter(x=>x.date===date);
 const box=document.getElementById('v772ReminderList');
 if(box)box.innerHTML=rows.length
   ? '<div style="font-size:12px;font-weight:800;margin:0 0 8px;color:var(--v4-text-2)">🔔 Lembretes</div>'+rows.map(r=>`
     <div class="v772-reminder-item" data-id="${esc(r.id)}">
       <span class="v772-reminder-dot"></span><div class="v772-reminder-main">
         <div class="v772-reminder-title">${esc(r.title)}</div>
         ${r.time?'<div class="v772-reminder-time">🕐 '+esc(r.time)+'</div>':''}
         ${r.note?'<div class="v772-reminder-note">'+esc(r.note)+'</div>':''}
       </div>
       <div class="v772-reminder-actions"><button type="button" data-edit="${esc(r.id)}" title="Editar">✎</button><button type="button" data-del="${esc(r.id)}" title="Excluir">×</button></div>
     </div>`).join('')
   : '';
 box?.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openModal(date,b.dataset.edit)));
 box?.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>removeReminder(b.dataset.del)));
 decorateCells();
}
function decorateCells(){
 document.querySelectorAll('#calendarGrid .day-cell[data-date]').forEach(cell=>{
   cell.querySelectorAll('.day-reminder-v772').forEach(x=>x.remove());
   const date=cell.dataset.date, rows=read().filter(x=>x.date===date);
   rows.slice(0,2).forEach(r=>{
     const el=document.createElement('div');el.className='day-reminder-v772';el.title=r.title;
     el.innerHTML='<i class="fa-regular fa-bell"></i><span class="v772-reminder-title-cell">'+esc(r.title)+'</span>';
     cell.appendChild(el);
   });
   if(rows.length>2){
     const more=document.createElement('div');more.className='day-reminder-v772';more.textContent='+'+(rows.length-2)+' lembrete(s)';
     cell.appendChild(more);
   }
 });
}
function openModal(date,id){
 if(!date)return;
 let existing=id?read().find(x=>x.id===id):null;
 let modal=document.getElementById('v772ReminderModal');
 if(!modal){
   modal=document.createElement('div');modal.id='v772ReminderModal';modal.className='v772-modal-bg';
   modal.innerHTML=`<div class="v772-modal" role="dialog" aria-modal="true">
    <h3 id="v772ReminderHeading">🔔 Novo lembrete</h3><div class="v772-modal-sub" id="v772ReminderDate"></div>
    <form id="v772ReminderForm">
      <div class="v772-field"><label for="v772Title">Lembrete</label><input id="v772Title" maxlength="120" required placeholder="Ex.: Renovar documento"></div>
      <div class="v772-field"><label for="v772Time">Horário (opcional)</label><input id="v772Time" type="time"></div>
      <div class="v772-field"><label for="v772Note">Observação (opcional)</label><textarea id="v772Note" maxlength="500" placeholder="Detalhes do lembrete..."></textarea></div>
      <div class="v772-modal-actions"><button type="button" class="v772-cancel" id="v772Cancel">Cancelar</button><button class="v772-save" type="submit">Salvar lembrete</button></div>
    </form></div>`;
   document.body.appendChild(modal);
   modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
   modal.querySelector('#v772Cancel').addEventListener('click',closeModal);
   modal.querySelector('#v772ReminderForm').addEventListener('submit',e=>{
     e.preventDefault();
     const rows=read(), id0=modal.dataset.editId||'';
     const obj={id:id0||('r_'+Date.now()+'_'+Math.random().toString(36).slice(2,8)),date:modal.dataset.date,title:document.getElementById('v772Title').value.trim(),time:document.getElementById('v772Time').value,note:document.getElementById('v772Note').value.trim(),updatedAt:new Date().toISOString()};
     if(!obj.title)return;
     const idx=rows.findIndex(x=>x.id===obj.id);
     if(idx>=0)rows[idx]=obj;else rows.push(obj);
     write(rows);closeModal();render();
   });
   modal.querySelector('#v772ReminderDate').textContent=fmtDate(date);
 }
 modal.dataset.date=date;modal.dataset.editId=existing?.id||'';
 modal.querySelector('#v772ReminderHeading').textContent=existing?'✎ Editar lembrete':'🔔 Novo lembrete';
 modal.querySelector('#v772ReminderDate').textContent=fmtDate(date);
 modal.querySelector('#v772Title').value=existing?.title||'';
 modal.querySelector('#v772Time').value=existing?.time||'';
 modal.querySelector('#v772Note').value=existing?.note||'';
 modal.classList.add('show');setTimeout(()=>modal.querySelector('#v772Title').focus(),30);
}
function closeModal(){document.getElementById('v772ReminderModal')?.classList.remove('show')}
function removeReminder(id){
 if(!confirm('Excluir este lembrete?'))return;
 write(read().filter(x=>x.id!==id));render();
}
function watch(){
 if((location.pathname.split('/').pop()||'').toLowerCase()!=='calendario.html')return;
 ensureCss();ensureUi();
 const grid=document.getElementById('calendarGrid');
 if(grid){
   let last='';
   const tick=()=>{const sig=(selectedDate()||'')+'|'+grid.children.length;if(sig!==last){last=sig;ensureUi();}else{decorateCells()}};
   new MutationObserver(()=>setTimeout(tick,30)).observe(grid,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-date']});
   grid.addEventListener('click',()=>setTimeout(()=>{ensureUi();render()},20),true);
 }
 window.addEventListener('storage',render);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();