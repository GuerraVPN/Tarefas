(function(){
'use strict';
let state={freq:'semanal',dias:new Set(),touchedDay:false};
const NAMES={1:'segunda',2:'terça',3:'quarta',4:'quinta',5:'sexta',6:'sábado',7:'domingo'};
function $(id){return document.getElementById(id)}
function isoToday(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
function isoDow(dateStr){const d=new Date(dateStr+'T12:00:00');const w=d.getDay();return w===0?7:w}
function fmtDate(s){if(!s)return'';const [y,m,d]=s.split('-');return `${d}/${m}/${y}`}
function plural(n,a,b){return n===1?a:b}
function visible(id,on){const e=$(id);if(e)e.classList.toggle('v4-rec-hidden',!on)}
function syncFreq(){document.querySelectorAll('[data-v4-freq]').forEach(b=>b.classList.toggle('active',b.dataset.v4Freq===state.freq));visible('v4Weekly',state.freq==='semanal');visible('v4Monthly',state.freq==='mensal');visible('v4Annual',state.freq==='anual');summary()}
function syncDays(){document.querySelectorAll('[data-v4-day]').forEach(b=>b.classList.toggle('active',state.dias.has(Number(b.dataset.v4Day))));summary()}
function resetForm(){
  state={freq:'semanal',dias:new Set(),touchedDay:false};
  const today=isoToday();if($('v4RecEnabled'))$('v4RecEnabled').checked=false;if($('v4RecCard'))$('v4RecCard').classList.remove('enabled');
  if($('v4RecInterval'))$('v4RecInterval').value='1';if($('v4RecStart'))$('v4RecStart').value=today;
  if($('v4RecEndModeNone'))$('v4RecEndModeNone').checked=true;if($('v4RecEnd')){$('v4RecEnd').value='';$('v4RecEnd').disabled=true}
  if($('v4RecMonthDay'))$('v4RecMonthDay').value=String(Number(today.slice(8,10)));
  state.dias.add(isoDow(today));syncFreq();syncDays();summary();
}
function getConfig(){
  if(!$('v4RecEnabled')?.checked)return null;
  const inicio=$('v4RecStart').value;if(!inicio)throw new Error('Informe a data de início da recorrência.');
  const intervalo=Math.max(1,Number($('v4RecInterval').value)||1);
  const fim=$('v4RecEndModeDate')?.checked?$('v4RecEnd').value:null;
  if(fim&&fim<inicio)throw new Error('A data final da recorrência não pode ser anterior ao início.');
  let dias=[...state.dias].sort((a,b)=>a-b);if(state.freq==='semanal'&&!dias.length)throw new Error('Selecione pelo menos um dia da semana.');
  const diaMes=state.freq==='mensal'?Math.max(1,Math.min(31,Number($('v4RecMonthDay').value)||Number(inicio.slice(8,10)))):null;
  return {frequencia:state.freq,intervalo,dias_semana:dias,data_inicio:inicio,data_fim:fim||null,dia_mes:diaMes};
}
function matches(cfg,date){
  const start=new Date(cfg.data_inicio+'T12:00:00'),d=new Date(date+'T12:00:00');if(d<start)return false;
  const days=Math.round((d-start)/86400000);
  if(cfg.frequencia==='diaria')return days%cfg.intervalo===0;
  if(cfg.frequencia==='semanal'){
    const sm=new Date(start);sm.setDate(sm.getDate()-(isoDow(cfg.data_inicio)-1));const dm=new Date(d);dm.setDate(dm.getDate()-(isoDow(date)-1));const weeks=Math.round((dm-sm)/(7*86400000));return weeks>=0&&weeks%cfg.intervalo===0&&cfg.dias_semana.includes(isoDow(date));
  }
  if(cfg.frequencia==='mensal'){
    const months=(d.getFullYear()-start.getFullYear())*12+d.getMonth()-start.getMonth();const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return months>=0&&months%cfg.intervalo===0&&d.getDate()===Math.min(cfg.dia_mes,last);
  }
  const years=d.getFullYear()-start.getFullYear(),month=start.getMonth(),last=new Date(d.getFullYear(),month+1,0).getDate();return years>=0&&years%cfg.intervalo===0&&d.getMonth()===month&&d.getDate()===Math.min(start.getDate(),last);
}
function nextLocal(cfg){let d=new Date();d.setHours(12,0,0,0);const s=new Date(cfg.data_inicio+'T12:00:00');if(d<s)d=s;for(let i=0;i<3660;i++){const iso=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);if(matches(cfg,iso)){if(!cfg.data_fim||iso<=cfg.data_fim)return iso;return null}d.setDate(d.getDate()+1)}return null}
function summary(){const box=$('v4RecSummary');if(!box)return;if(!$('v4RecEnabled')?.checked){box.innerHTML='Ative <b>Tarefa recorrente</b> para configurar a repetição.';return}let cfg;try{cfg=getConfig()}catch(e){box.textContent=e.message;return}let txt='';const n=cfg.intervalo;
  if(cfg.frequencia==='diaria')txt=`A tarefa será gerada a cada <b>${n} ${plural(n,'dia','dias')}</b>`;
  if(cfg.frequencia==='semanal')txt=`A tarefa será gerada a cada <b>${n} ${plural(n,'semana','semanas')}</b>, em <b>${cfg.dias_semana.map(d=>NAMES[d]).join(', ')}</b>`;
  if(cfg.frequencia==='mensal')txt=`A tarefa será gerada no <b>dia ${cfg.dia_mes}</b>, a cada <b>${n} ${plural(n,'mês','meses')}</b>`;
  if(cfg.frequencia==='anual')txt=`A tarefa será gerada <b>anualmente</b>, a cada ${n} ${plural(n,'ano','anos')}, na data de início`;
  txt+=`, a partir de <b>${fmtDate(cfg.data_inicio)}</b>`;if(cfg.data_fim)txt+=`, até <b>${fmtDate(cfg.data_fim)}</b>`;else txt+=', <b>sem data final</b>';
  const next=nextLocal(cfg);if(next)txt+=`.<br>Próxima execução prevista: <b>${fmtDate(next)}</b>.`;box.innerHTML=txt;
}
function initForm(){if(!$('v4RecCard'))return;resetForm();$('v4RecEnabled').addEventListener('change',()=>{$('v4RecCard').classList.toggle('enabled',$('v4RecEnabled').checked);summary()});document.querySelectorAll('[data-v4-freq]').forEach(b=>b.addEventListener('click',()=>{state.freq=b.dataset.v4Freq;syncFreq()}));document.querySelectorAll('[data-v4-day]').forEach(b=>b.addEventListener('click',()=>{const d=Number(b.dataset.v4Day);state.dias.has(d)?state.dias.delete(d):state.dias.add(d);state.touchedDay=true;syncDays()}));
  $('v4RecStart').addEventListener('change',()=>{if(!state.touchedDay&&$('v4RecStart').value){state.dias=new Set([isoDow($('v4RecStart').value)]);syncDays()}if($('v4RecMonthDay')&&$('v4RecStart').value)$('v4RecMonthDay').value=String(Number($('v4RecStart').value.slice(8,10)));summary()});
  ['v4RecInterval','v4RecMonthDay','v4RecEnd'].forEach(id=>$(id)?.addEventListener('input',summary));$('v4RecEndModeNone').addEventListener('change',()=>{$('v4RecEnd').disabled=true;summary()});$('v4RecEndModeDate').addEventListener('change',()=>{$('v4RecEnd').disabled=false;if(!$('v4RecEnd').value)$('v4RecEnd').value=$('v4RecStart').value;summary()});
}
async function criarRegra(client,taskId,cfg,userId,profileId){if(!cfg)return null;const r=await client.rpc('criar_recorrencia_v4',{p_tarefa_modelo_id:Number(taskId),p_frequencia:cfg.frequencia,p_intervalo:Number(cfg.intervalo),p_dias_semana:cfg.dias_semana,p_data_inicio:cfg.data_inicio,p_data_fim:cfg.data_fim,p_dia_mes:cfg.dia_mes,p_criado_por:Number(userId),p_criado_por_perfil_id:profileId?Number(profileId):null});if(r.error)throw r.error;return r.data}
async function processar(force=false){let c;try{c=typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){c=null}if(!c)return 0;const k='v4_recorrencias_ultimo_processamento',now=Date.now(),last=Number(localStorage.getItem(k)||0);if(!force&&now-last<60000)return 0;localStorage.setItem(k,String(now));try{const r=await c.rpc('processar_recorrencias_v4',{p_limite:100});if(r.error)throw r.error;if(Number(r.data)>0){window.dispatchEvent(new CustomEvent('v4:recorrencias-geradas',{detail:{quantidade:Number(r.data)}}));if(!force)setTimeout(()=>location.reload(),180)}return Number(r.data)||0}catch(e){console.warn('Recorrências V4:',e?.message||e);return 0}}
window.RecorrenciasV4={initForm,resetForm,getConfig,criarRegra,processar,summary};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{initForm();processar(false)});else{initForm();processar(false)}
})();