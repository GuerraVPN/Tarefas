(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='missao.html')return;
const $=id=>document.getElementById(id);
function user(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function readyText(v){return v==='pelotao'?'Prontos no pelotão':v==='local'?'Prontos no local':'Não definido'}
function timeText(v){return v?String(v).slice(0,5):'-'}
async function activeUser(){
  let u=user(),c=client();if(!u||!c)return u;
  try{if(window.Perfis26){const st=await Perfis26.carregar(c,u);if(st?.usuario)u=st.usuario}}catch(_){}
  return u;
}
async function hydrate(id){
  const c=client();if(!c)return;
  if(!id){if($('missionTime'))$('missionTime').value='';if($('missionReadyAt'))$('missionReadyAt').value='';return}
  const r=await c.from('missoes_escala').select('id,horario,pronto_em').eq('id',Number(id)).maybeSingle();
  if(r.error)return console.warn('V7.4.7 missão:',r.error.message);
  if($('missionTime'))$('missionTime').value=r.data?.horario?String(r.data.horario).slice(0,5):'';
  if($('missionReadyAt'))$('missionReadyAt').value=r.data?.pronto_em||'';
}
async function decorate(id){
  const c=client(),host=$('missionDetail');if(!c||!host||!id)return;
  const r=await c.from('missoes_escala').select('horario,pronto_em').eq('id',Number(id)).maybeSingle();if(r.error||!r.data)return;
  let box=host.querySelector('[data-v747-mission-meta]');if(!box){box=document.createElement('div');box.dataset.v747MissionMeta='1';box.className='v7-note';box.style.marginBottom='8px';host.insertBefore(box,host.firstChild)}
  box.innerHTML='<b>Horário:</b> '+timeText(r.data.horario)+' &nbsp;·&nbsp; <b>Apresentação:</b> '+readyText(r.data.pronto_em);
}
async function save(e){
  e.preventDefault();e.stopImmediatePropagation();
  const c=client(),u=await activeUser();if(!c||!u?.id)return alert('Sessão ou conexão indisponível.');
  const horario=$('missionTime')?.value||'',pronto=$('missionReadyAt')?.value||'';
  if(!horario)return alert('Informe o horário da missão.');
  if(!['local','pelotao'].includes(pronto))return alert('Escolha se os militares estarão prontos no local ou no pelotão.');
  const payload={
    p_missao_id:Number($('missionId')?.value)||null,
    p_titulo:$('missionTitle')?.value.trim()||'',
    p_data_inicio:$('missionStart')?.value||null,
    p_data_fim:$('missionEnd')?.value||null,
    p_horario:horario,p_pronto_em:pronto,
    p_local:$('missionPlace')?.value.trim()||null,
    p_descricao:$('missionDescription')?.value.trim()||null,
    p_dispensas_por_pessoa:Number($('missionDispensas')?.value)||0,
    p_qtd_sargentos:Number($('missionQtySgt')?.value)||0,
    p_qtd_cabos:Number($('missionQtyCb')?.value)||0,
    p_qtd_soldados:Number($('missionQtySd')?.value)||0,
    p_usuario_id:Number(u.id),p_perfil_id:u.perfil_id?Number(u.perfil_id):null
  };
  const btn=$('missionForm')?.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent='Salvando...'}
  try{
    const r=await c.rpc('v7_4_7_salvar_missao',payload);if(r.error)throw r.error;
    $('missionModal')?.classList.remove('open');
    const url=new URL(location.href);url.searchParams.set('_v747',Date.now());location.replace(url.toString());
  }catch(err){alert(err?.message||'Não foi possível salvar a missão.');if(btn){btn.disabled=false;btn.textContent='Salvar missão'}}
}
function bind(){
  const form=$('missionForm');if(!form||form.dataset.v747Bound==='1')return;form.dataset.v747Bound='1';
  form.addEventListener('submit',save,true);
  document.addEventListener('click',e=>{
    const n=e.target.closest('#newMission'),edit=e.target.closest('[data-edit]'),card=e.target.closest('[data-mission]');
    if(n)setTimeout(()=>hydrate(null),0);
    if(edit)setTimeout(()=>hydrate($('missionId')?.value),0);
    if(card)setTimeout(()=>decorate(card.dataset.mission),50);
  });
  const modal=$('missionModal');if(modal){new MutationObserver(()=>{if(modal.classList.contains('open'))hydrate($('missionId')?.value)}).observe(modal,{attributes:true,attributeFilter:['class']})}
  const list=$('missionList');if(list){new MutationObserver(()=>{const active=list.querySelector('[data-mission].active');if(active)decorate(active.dataset.mission)}).observe(list,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();