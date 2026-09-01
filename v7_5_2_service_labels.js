(function(){
'use strict';
if(window.__TAREFAS_V752_SERVICE_LABELS__)return;
window.__TAREFAS_V752_SERVICE_LABELS__=true;
const page=(location.pathname.split('/').pop()||'').toLowerCase();
if(page!=='pessoal.html')return;
const $=id=>document.getElementById(id);
let lastRange='',rows=[],loading=false;
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function escSel(v){return window.CSS?.escape?CSS.escape(String(v)):String(v).replace(/"/g,'\\"')}
function keyCell(group,date,userId,externalId){
 const who=userId?`[data-user="${escSel(userId)}"]`:`[data-external="${escSel(externalId)}"]`;
 return document.querySelector(`#scaleBoard td[data-group="${escSel(group)}"][data-date="${escSel(date)}"]${who}`);
}
function visibleRange(){
 const cells=[...document.querySelectorAll('#scaleBoard td[data-date]')];
 if(!cells.length)return null;
 const dates=cells.map(x=>x.dataset.date).filter(Boolean).sort();
 return{ini:dates[0],fim:dates[dates.length-1]};
}
async function load(){
 const c=client(),rg=visibleRange();if(!c||!rg||loading)return;
 const sig=rg.ini+'|'+rg.fim;if(sig===lastRange&&rows.length)return apply();
 loading=true;
 try{
   const r=await c.from('escala_servicos').select('id,grupo,data_servico,usuario_id,pessoa_externa_id,rodizio_usuario_id,rodizio_pessoa_externa_id,marcacao,observacao')
     .gte('data_servico',rg.ini).lte('data_servico',rg.fim)
     .or('rodizio_usuario_id.not.is.null,rodizio_pessoa_externa_id.not.is.null');
   if(!r.error){rows=r.data||[];lastRange=sig;apply()}
 }catch(_){}finally{loading=false}
}
function apply(){
 document.querySelectorAll('#scaleBoard td[data-v752-label]').forEach(td=>{
   td.removeAttribute('data-v752-label');td.removeAttribute('data-v752-service-id');td.removeAttribute('data-v752-original');
 });
 for(const s of rows){
   const executor=keyCell(s.grupo,s.data_servico,s.usuario_id,s.pessoa_externa_id);
   const original=keyCell(s.grupo,s.data_servico,s.rodizio_usuario_id,s.rodizio_pessoa_externa_id);
   if(executor){
     executor.textContent='TS';executor.classList.add('service');executor.classList.remove('predicted','folga-count');
     executor.dataset.v752Label='TS';executor.dataset.v752ServiceId=String(s.id);
     executor.title='TS · Tirando serviço por substituição';
   }
   if(original){
     original.textContent='SV';original.classList.add('service');original.classList.remove('predicted','folga-count');
     original.dataset.v752Label='SV';original.dataset.v752Original='1';original.dataset.v752ServiceId=String(s.id);
     original.title='SV · Militar originalmente escalado; rodízio e folgas permanecem com ele';
   }
 }
}
function wire(){
 const board=$('scaleBoard');if(!board||board.dataset.v752Wired==='1')return;
 board.dataset.v752Wired='1';
 board.addEventListener('click',e=>{
   const td=e.target.closest('td[data-v752-original="1"]');if(!td)return;
   const s=rows.find(x=>String(x.id)===String(td.dataset.v752ServiceId));if(!s)return;
   const executor=keyCell(s.grupo,s.data_servico,s.usuario_id,s.pessoa_externa_id);if(!executor||executor===td)return;
   e.preventDefault();e.stopImmediatePropagation();executor.click();
 },true);
}
function tick(){wire();load();apply()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick);else tick();
setInterval(tick,1200);
window.addEventListener('focus',()=>{lastRange='';load()});
})();