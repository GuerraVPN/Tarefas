(function(){
'use strict';
if(window.__TAREFAS_V75_SERVICE_EDITOR__)return;
window.__TAREFAS_V75_SERVICE_EDITOR__=true;

const $=id=>document.getElementById(id);
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function logged(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function profileId(){
 const u=logged();
 if(u?.perfil_id)return Number(u.perfil_id);
 try{
   const k='perfilAtivo26Pel:'+String(u?.id||'');
   const v=Number(localStorage.getItem(k)||0);
   return v||null;
 }catch(_){return null}
}

function injectCss(){
 if($('v75ServiceCss'))return;
 const s=document.createElement('style');
 s.id='v75ServiceCss';
 s.textContent=`
 .v75-service-mode{font-size:10px;color:var(--v4-muted);margin-top:4px;line-height:1.4}
 #v75DeleteService{border-color:#ef4444!important;color:#fecaca!important;background:rgba(127,29,29,.22)!important}
 #serviceModal.v75-editing .v7-modal{box-shadow:0 0 0 1px rgba(59,130,246,.35),0 18px 60px rgba(0,0,0,.28)}
 #scaleBoard td.service.manage{position:relative}
 #scaleBoard td.service.manage:after{content:'✎';position:absolute;right:3px;top:2px;font-size:8px;opacity:.7}
 `;
 document.head.appendChild(s);
}
function getSubmit(){return $('serviceForm')?.querySelector('button[type="submit"]')||null}
function ensureHint(){
 const head=$('serviceModal')?.querySelector('.v7-modal-head');if(!head)return null;
 let hint=$('v75ServiceHint');
 if(!hint){
   hint=document.createElement('div');hint.id='v75ServiceHint';hint.className='v75-service-mode';
   head.querySelector('h3')?.insertAdjacentElement('afterend',hint);
 }
 return hint;
}
function ensureDeleteButton(){
 const actions=$('serviceForm')?.querySelector('.v7-modal-actions');if(!actions)return null;
 let b=$('v75DeleteService');
 if(!b){
   b=document.createElement('button');b.type='button';b.id='v75DeleteService';
   b.className='v7-btn danger';b.textContent='Excluir serviço';b.onclick=deleteService;
   const cancel=actions.querySelector('[data-close="serviceModal"]');
   if(cancel)actions.insertBefore(b,cancel);else actions.appendChild(b);
 }
 return b;
}
function editing(){return !!$('removeService')&&!$('removeService').hidden}
function syncModal(){
 const modal=$('serviceModal');if(!modal)return;
 const isEdit=editing();
 modal.classList.toggle('v75-editing',isEdit);
 const submit=getSubmit();if(submit)submit.textContent=isEdit?'Salvar alterações':'Confirmar serviço';
 const hint=ensureHint();
 if(hint)hint.textContent=isEdit
   ?'Editando serviço confirmado. Marcação e observação podem ser alteradas; Excluir serviço remove o lançamento e recalcula o rodízio.'
   :'Novo lançamento de serviço.';
 const del=ensureDeleteButton();if(del)del.hidden=!isEdit;
 if($('removeService'))$('removeService').textContent='Substituir militar';
}
function currentIdentity(){
 return{
   grupo:$('serviceGroup')?.value||'',
   data:$('serviceDate')?.value||'',
   usuario_id:Number($('serviceUserId')?.value)||null,
   pessoa_externa_id:Number($('serviceExternalId')?.value)||null,
   nome:$('serviceUser')?.value||'militar'
 };
}
function matchingCell(id){
 const q=`#scaleBoard td[data-group="${CSS.escape(id.grupo)}"][data-date="${CSS.escape(id.data)}"]`+
   (id.usuario_id?`[data-user="${id.usuario_id}"]`:`[data-external="${id.pessoa_externa_id}"]`);
 return document.querySelector(q);
}
async function deleteService(){
 const c=client(),u=logged(),id=currentIdentity();
 if(!c||!u?.id)return alert('Conexão com o servidor indisponível.');
 const pid=profileId();
 if(!pid)return alert('Não foi possível identificar o perfil ativo. Atualize a página e tente novamente.');
 if(!id.grupo||!id.data||(!id.usuario_id&&!id.pessoa_externa_id))return alert('Não foi possível identificar o serviço.');

 const dataBr=new Date(id.data+'T12:00:00').toLocaleDateString('pt-BR');
 if(!confirm(`Excluir definitivamente o serviço de ${id.nome} em ${dataBr}?\n\nA exclusão será registrada no histórico e a projeção será recalculada.`))return;

 const b=$('v75DeleteService');if(b){b.disabled=true;b.textContent='Excluindo...'}
 try{
   const r=await c.rpc('v7_5_excluir_servico',{
     p_grupo:id.grupo,
     p_usuario_alvo_id:id.usuario_id,
     p_pessoa_externa_id:id.pessoa_externa_id,
     p_data_servico:id.data,
     p_usuario_id:Number(u.id),
     p_perfil_id:pid
   });
   if(r.error)throw r.error;
   $('serviceModal')?.classList.remove('open');

   setTimeout(()=>{
     const td=matchingCell(id);
     if(td?.classList.contains('service'))location.reload();
   },2200);
 }catch(e){
   alert(e?.message||'Não foi possível excluir o serviço.');
 }finally{
   if(b){b.disabled=false;b.textContent='Excluir serviço'}
 }
}
function markEditableCells(){
 document.querySelectorAll('#scaleBoard td.service.manage').forEach(td=>{
   if(!td.dataset.v75Tip){
     td.dataset.v75Tip='1';
     td.title=(td.title?td.title+' · ':'')+'Clique para editar, substituir ou excluir';
   }
 });
}
function init(){
 injectCss();syncModal();markEditableCells();
 const m=$('serviceModal');
 if(m){
   const obs=new MutationObserver(()=>syncModal());
   obs.observe(m,{attributes:true,attributeFilter:['class']});
 }
 setInterval(markEditableCells,2000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();