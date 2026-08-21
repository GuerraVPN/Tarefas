(function(){
'use strict';

const q=id=>document.getElementById(id);
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const D=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-';
const DT=v=>v?new Date(v).toLocaleString('pt-BR'):'-';

const LABEL={
 pedido:'Pedido',
 aguardando_aprovacao:'Aguardando aprovação',
 retornado:'Retornado',
 aprovado:'Aprovado',
 encaminhado_base:'Encaminhado à Base Administrativa',
 retornado_base:'Retornado pela Base Administrativa',
 aprovado_base:'Aprovado pela Base Administrativa',
 pronto:'Pronto'
};
const CAT={
 permanente:'Permanente',
 uso_duradouro:'Uso Duradouro',
 consumo:'Consumo'
};

let baseUser=null,activeUser=null,items=[],selected=null,history=[];
let category='permanente';
let userNames=new Map();

function profileId(){return activeUser?.perfil_id?Number(activeUser.perfil_id):null}
function statusClass(s){
 if(['retornado','retornado_base'].includes(s))return'return';
 if(['aguardando_aprovacao','encaminhado_base'].includes(s))return'wait';
 if(['aprovado','aprovado_base','pronto'].includes(s))return'ok';
 return'info';
}
function toast2(msg){
 const el=q('orcToast');
 if(!el)return;
 el.textContent=msg;el.classList.add('show');
 clearTimeout(toast2._t);
 toast2._t=setTimeout(()=>el.classList.remove('show'),2600);
}
function userName(id){
 const u=userNames.get(String(id));
 return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`;
}
async function initUser(){
 baseUser=JSON.parse(localStorage.getItem('usuarioLogado')||'null');
 if(!baseUser?.id)return false;
 if(window.Perfis26){
   try{
     const p=await Perfis26.carregar(supabaseClient,baseUser);
     activeUser=p.usuario;
   }catch(_){activeUser=baseUser}
 }else activeUser=baseUser;
 return true;
}
async function loadNames(){
 const r=await supabaseClient.from('usuarios').select('id,patente,nome_guerra');
 if(!r.error)(r.data||[]).forEach(x=>userNames.set(String(x.id),x));
}
function switchModule(module){
 const guides=module==='guias';
 q('guiasModule').hidden=!guides;
 q('baixasModule').hidden=guides;
 document.querySelectorAll('[data-orc-module]').forEach(b=>b.classList.toggle('active',b.dataset.orcModule===module));
 q('orcPageTitle').textContent=guides?'Orçamentários · Guias':'Orçamentários · Desrelacionamento / Baixa';
 q('orcPageSubtitle').textContent=guides
   ?'Cadastro, Fiscalização, devolução, reenvio e andamento das guias.'
   :'Pedidos de baixa de material, aprovações, retornos, Base Administrativa e histórico.';
 if(!guides)loadItems();
}
async function loadItems(){
 const r=await supabaseClient.from('baixas_material').select('*').order('data_pedido',{ascending:false}).order('id',{ascending:false}).limit(1000);
 if(r.error){
   q('baixaList').innerHTML=`<div class="orc-empty">Erro ao carregar pedidos:<br>${E(r.error.message)}</div>`;
   return;
 }
 items=r.data||[];
 updateCounts();
 renderList();
 const params=new URLSearchParams(location.search);
 const id=params.get('baixa');
 if(id){
   const found=items.find(x=>String(x.id)===String(id));
   if(found)selectItem(found.id);
 }
}
function updateCounts(){
 q('bCountPermanente').textContent=items.filter(x=>x.categoria==='permanente').length;
 q('bCountDuradouro').textContent=items.filter(x=>x.categoria==='uso_duradouro').length;
 q('bCountConsumo').textContent=items.filter(x=>x.categoria==='consumo').length;
}
function filtered(){
 const search=N(q('baixaSearch').value);
 const sf=q('baixaStatusFilter').value;
 const df=q('baixaDateFilter').value;
 return items.filter(x=>{
   if(x.categoria!==category)return false;
   if(sf&&x.status!==sf)return false;
   if(df&&x.data_pedido!==df)return false;
   if(search&&!N(`${x.material_descricao} ${x.identificacao||''} ${x.motivo} ${x.secao_origem||''}`).includes(search))return false;
   return true;
 });
}
function renderList(){
 const arr=filtered();
 q('baixaListInfo').textContent=`${arr.length} pedido(s)`;
 if(!arr.length){
   q('baixaList').innerHTML='<div class="orc-empty">Nenhum pedido neste filtro.</div>';
   return;
 }
 const groups=new Map();
 arr.forEach(x=>{
   const k=x.data_pedido||'sem-data';
   if(!groups.has(k))groups.set(k,[]);
   groups.get(k).push(x);
 });
 let html='';
 for(const [date,list] of groups){
   html+=`<div class="orc-date">${date==='sem-data'?'Sem data':D(date)} (${list.length})</div>`;
   html+=list.map(x=>`<article class="baixa-card ${selected&&String(selected.id)===String(x.id)?'active':''}" data-baixa-id="${x.id}">
     <div class="baixa-card-top">
       <strong>#${x.id} · ${E(x.material_descricao)}</strong>
       <span class="baixa-status ${statusClass(x.status)}">${E(LABEL[x.status]||x.status)}</span>
     </div>
     <p>${E(CAT[x.categoria])} · ${E(String(x.quantidade))} ${E(x.unidade)}<br>${E(x.secao_origem||'Seção não informada')}</p>
   </article>`).join('');
 }
 q('baixaList').innerHTML=html;
}
async function loadHistory(id){
 const r=await supabaseClient.from('baixa_tramitacoes').select('*').eq('baixa_id',id).order('criado_em',{ascending:false}).order('id',{ascending:false});
 if(r.error)throw r.error;
 history=r.data||[];
}
async function selectItem(id){
 selected=items.find(x=>String(x.id)===String(id));
 if(!selected)return;
 await loadHistory(selected.id);
 renderList();
 renderDetail();
}
function linearSteps(x){
 if(x.categoria==='consumo'){
   return [
     ['pedido','Pedido'],
     ['aguardando_aprovacao','Aprovação / Retorno'],
     ['aprovado','Aprovado'],
     ['pronto','Pronto']
   ];
 }
 return [
   ['pedido','Pedido'],
   ['aguardando_aprovacao','Aprovação / Retorno'],
   ['aprovado','Aprovado'],
   ['encaminhado_base','Base Administrativa'],
   ['aprovado_base','Aprovação / Retorno da Base'],
   ['pronto','Pronto']
 ];
}
function progressRank(x){
 const map=x.categoria==='consumo'
   ?{pedido:0,aguardando_aprovacao:1,retornado:1,aprovado:2,pronto:3}
   :{pedido:0,aguardando_aprovacao:1,retornado:1,aprovado:2,encaminhado_base:3,retornado_base:3,aprovado_base:4,pronto:5};
 return map[x.status]??0;
}
function renderSteps(){
 const steps=linearSteps(selected),rank=progressRank(selected);
 q('baixaSteps').innerHTML=steps.map((s,i)=>{
   const current=i===rank;
   const done=i<rank||selected.status==='pronto';
   return `<div class="baixa-step ${done?'done':''} ${current?'current':''}">${E(s[1])}</div>`;
 }).join('');
}
function renderHistory(){
 q('baixaHistoryCount').textContent=`${history.length} evento(s)`;
 if(!history.length){
   q('baixaHistory').innerHTML='<div class="orc-empty">Sem histórico ainda.</div>';
   return;
 }
 q('baixaHistory').innerHTML=history.map(h=>`<div class="baixa-hitem">
   <strong>${E(eventLabel(h.evento))}</strong>
   ${h.mensagem?`<p>${E(h.mensagem)}</p>`:''}
   ${h.status_anterior||h.status_novo?`<p>${E(LABEL[h.status_anterior]||h.status_anterior||'-')} → ${E(LABEL[h.status_novo]||h.status_novo||'-')}</p>`:''}
   <small>${E(userName(h.usuario_id))} · ${DT(h.criado_em)}</small>
 </div>`).join('');
}
function eventLabel(e){
 return ({
   pedido_criado:'Pedido cadastrado',
   pedido_encaminhado_aprovacao:'Encaminhado para aprovação',
   pedido_reenviado:'Pedido corrigido e reenviado para aprovação',
   pedido_aprovado:'Pedido aprovado',
   pedido_retornado:'Pedido retornado',
   encaminhado_base:'Encaminhado à Base Administrativa',
   aprovado_base:'Aprovado pela Base Administrativa',
   retornado_base:'Retornado pela Base Administrativa',
   reenviado_base:'Reencaminhado à Base Administrativa',
   pedido_concluido:'Pedido concluído',
   atualizacao:'Atualização'
 }[e]||e);
}
function button(label,action,cls=''){
 return `<button class="orc-btn ${cls}" data-baixa-action="${action}">${label}</button>`;
}
function renderActions(){
 const box=q('baixaActionButtons'),hint=q('baixaActionHint');
 const s=selected.status,c=selected.categoria;
 let html='';
 if(s==='pedido'){
   hint.textContent='Pedido aberto';
   html=button('Encaminhar para aprovação','encaminhar_aprovacao','primary');
 }else if(s==='aguardando_aprovacao'){
   hint.textContent='Aguardando decisão';
   html=button('↩ Retornar','retornar','danger')+button('✓ Aprovar','aprovar','primary');
 }else if(s==='retornado'){
   hint.textContent='Retornado para correção';
   html=button('Reenviar para aprovação','encaminhar_aprovacao','primary');
 }else if(s==='aprovado'){
   if(c==='consumo'){
     hint.textContent='Aprovado';
     html=button('✓ Marcar como Pronto','pronto','primary');
   }else{
     hint.textContent='Aprovado';
     html=button('Encaminhar à Base Administrativa','encaminhar_base','primary');
   }
 }else if(s==='encaminhado_base'){
   hint.textContent='Aguardando decisão da Base';
   html=button('↩ Retorno da Base','retornar_base','danger')+button('✓ Aprovação da Base','aprovar_base','primary');
 }else if(s==='retornado_base'){
   hint.textContent='Retornado pela Base';
   html=button('Reencaminhar à Base','reenviar_base','primary');
 }else if(s==='aprovado_base'){
   hint.textContent='Aprovado pela Base';
   html=button('✓ Marcar como Pronto','pronto','primary');
 }else{
   hint.textContent='Concluído';
   html='<span class="baixa-status ok">✓ Pronto</span>';
 }
 box.innerHTML=html;
}
function renderDetail(){
 q('baixaDetailEmpty').hidden=true;
 q('baixaDetail').hidden=false;
 q('bdTitle').textContent=`Pedido #${selected.id} · ${selected.material_descricao}`;
 q('bdSubtitle').textContent=`Criado por ${userName(selected.criado_por)} · ${DT(selected.criado_em)}`;
 q('bdStatus').textContent=LABEL[selected.status]||selected.status;
 q('bdStatus').className=`baixa-status ${statusClass(selected.status)}`;
 q('bdData').textContent=D(selected.data_pedido);
 q('bdCategoria').textContent=CAT[selected.categoria]||selected.categoria;
 q('bdQuantidade').textContent=`${selected.quantidade} ${selected.unidade}`;
 q('bdMaterial').textContent=selected.material_descricao;
 q('bdIdentificacao').textContent=selected.identificacao||'-';
 q('bdSecao').textContent=[selected.secao_origem,selected.posicao_origem].filter(Boolean).join(' — ')||'-';
 q('bdMotivo').textContent=selected.motivo;
 q('bdObservacoes').textContent=selected.observacoes||'-';
 const ret=['retornado','retornado_base'].includes(selected.status);
 q('baixaReturnNotice').hidden=!ret;
 q('baixaReturnNotice').textContent=ret?`⚠️ Motivo do retorno: ${selected.retorno_motivo||'Não informado.'}`:'';
 renderSteps();renderActions();renderHistory();
}
async function createItem(e){
 e.preventDefault();
 const btn=q('saveBaixa');
 btn.disabled=true;btn.textContent='Cadastrando...';
 try{
   const payload={
     categoria:q('bCategoria').value,
     data_pedido:q('bData').value,
     material_descricao:q('bMaterial').value.trim(),
     identificacao:q('bIdentificacao').value.trim()||null,
     quantidade:Number(q('bQuantidade').value),
     unidade:q('bUnidade').value.trim(),
     motivo:q('bMotivo').value.trim(),
     observacoes:q('bObservacoes').value.trim()||null,
     status:'pedido',
     criado_por:String(activeUser.id),
     criado_por_perfil_id:profileId(),
     secao_origem:activeUser.secao||null,
     posicao_origem:activeUser.posicao||null
   };
   const r=await supabaseClient.from('baixas_material').insert([payload]).select('*').single();
   if(r.error)throw r.error;
   await supabaseClient.from('baixa_tramitacoes').insert([{
     baixa_id:r.data.id,evento:'pedido_criado',mensagem:'Pedido de desrelacionamento / baixa cadastrado.',
     status_novo:'pedido',usuario_id:String(activeUser.id),perfil_id:profileId()
   }]);
   q('newBaixaBg').classList.remove('open');
   q('newBaixaForm').reset();
   toast2('Pedido cadastrado.');
   category=r.data.categoria;
   document.querySelectorAll('[data-baixa-cat]').forEach(b=>b.classList.toggle('active',b.dataset.baixaCat===category));
   await loadItems();await selectItem(r.data.id);
 }catch(err){
   alert('Erro ao cadastrar o pedido: '+err.message);
 }finally{
   btn.disabled=false;btn.textContent='Cadastrar pedido';
 }
}
async function move(action){
 if(!selected)return;
 const note=q('baixaActionNote').value.trim();
 if(['retornar','retornar_base'].includes(action)&&!note){
   return alert('Informe o motivo do retorno.');
 }
 const r=await supabaseClient.rpc('v5_2_mover_baixa',{
   p_baixa_id:selected.id,
   p_acao:action,
   p_usuario_id:String(activeUser.id),
   p_perfil_id:profileId(),
   p_mensagem:note||null
 });
 if(r.error)return alert(r.error.message);
 q('baixaActionNote').value='';
 toast2('Andamento atualizado.');
 const id=selected.id;
 await loadItems();await selectItem(id);
}
async function addUpdate(){
 if(!selected)return;
 const text=q('baixaUpdateText').value.trim();
 if(!text)return alert('Digite a atualização.');
 const r=await supabaseClient.rpc('v5_2_adicionar_atualizacao_baixa',{
   p_baixa_id:selected.id,
   p_usuario_id:String(activeUser.id),
   p_perfil_id:profileId(),
   p_mensagem:text
 });
 if(r.error)return alert(r.error.message);
 q('baixaUpdateText').value='';
 toast2('Atualização registrada.');
 await loadHistory(selected.id);renderHistory();
}
function bind(){
 q('orcModuleNav').onclick=e=>{
   const b=e.target.closest('[data-orc-module]');
   if(b)switchModule(b.dataset.orcModule);
 };
 q('baixaTabs').onclick=e=>{
   const b=e.target.closest('[data-baixa-cat]');
   if(!b)return;
   category=b.dataset.baixaCat;
   document.querySelectorAll('[data-baixa-cat]').forEach(x=>x.classList.toggle('active',x===b));
   renderList();
 };
 ['baixaSearch','baixaStatusFilter','baixaDateFilter'].forEach(id=>{
   q(id).addEventListener(id==='baixaSearch'?'input':'change',renderList);
 });
 q('baixaList').onclick=e=>{
   const card=e.target.closest('[data-baixa-id]');
   if(card)selectItem(card.dataset.baixaId);
 };
 q('btnNovaBaixa').onclick=()=>{
   q('bCategoria').value=category;
   q('bData').value=new Date().toISOString().slice(0,10);
   q('newBaixaBg').classList.add('open');
 };
 q('closeBaixa').onclick=q('cancelBaixa').onclick=()=>q('newBaixaBg').classList.remove('open');
 q('newBaixaBg').onclick=e=>{if(e.target===q('newBaixaBg'))q('newBaixaBg').classList.remove('open')};
 q('newBaixaForm').onsubmit=createItem;
 q('baixaActionButtons').onclick=e=>{
   const b=e.target.closest('[data-baixa-action]');
   if(b)move(b.dataset.baixaAction);
 };
 q('btnBaixaUpdate').onclick=addUpdate;
}
async function start(){
 if(!await initUser())return;
 bind();
 await loadNames();
 const params=new URLSearchParams(location.search);
 if(params.get('modulo')==='baixas'||params.get('baixa')){
   switchModule('baixas');
 }else{
   switchModule('guias');
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();