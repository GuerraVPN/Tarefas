(function(){
'use strict';

const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const dateBR=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-';
const dateTimeBR=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);

const DEP_FALLBACK=['1ª Seção','3ª Seção','4ª Seção','SALC','Garagem','Reserva de Armamento','Reserva de Materiais','Canil'];
const DEPOT_FALLBACK=['Almox','AlmoxVirtual','Depósito do Canil','Suprimento de Viaturas'];

const STATUS={
 pedido:'Pedido',
 aguardando_aprovacao:'Aguardando aprovação',
 retornado:'Retornado',
 aprovado:'Aprovado',
 encaminhado_base:'Encaminhado à Base Administrativa',
 retornado_base:'Retornado pela Base Administrativa',
 aprovado_base:'Aprovado pela Base Administrativa',
 pronto:'Pronto'
};
const CAT={permanente:'Permanente',uso_duradouro:'Uso Duradouro',consumo:'Consumo'};

let baseUser=null,user=null;
let moduleMode='baixas';
let category='permanente';
let pedidos=[],allItems=[],selected=null,selectedItems=[],history=[];
let dependencias=DEP_FALLBACK.slice(),depositos=DEPOT_FALLBACK.slice();
let usersMap=new Map();

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function statusClass(s){
 if(['retornado','retornado_base'].includes(s))return'return';
 if(['aguardando_aprovacao','encaminhado_base'].includes(s))return'wait';
 if(['aprovado','aprovado_base','pronto'].includes(s))return'ok';
 return'info';
}
function toast(msg){
 const el=$('orcToast');if(!el)return;
 el.textContent=msg;el.classList.add('show');
 clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2500);
}
function userName(id){
 const u=usersMap.get(String(id));
 return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`;
}
async function initUser(){
 baseUser=JSON.parse(localStorage.getItem('usuarioLogado')||'null');
 if(!baseUser?.id)return false;
 if(window.Perfis26){
   try{const p=await Perfis26.carregar(supabaseClient,baseUser);user=p.usuario}catch(_){user=baseUser}
 }else user=baseUser;
 return true;
}
async function loadRefs(){
 try{
   const [d1,d2]=await Promise.all([
     supabaseClient.from('orc_dependencias').select('nome').eq('ativo',true).order('ordem'),
     supabaseClient.from('orc_depositos').select('nome').eq('ativo',true).order('ordem')
   ]);
   if(!d1.error&&d1.data?.length)dependencias=d1.data.map(x=>x.nome);
   if(!d2.error&&d2.data?.length)depositos=d2.data.map(x=>x.nome);
 }catch(_){}
 fillSelect('pDependenciaOrigem',dependencias);
 fillSelect('pDependenciaDestino',dependencias);
 fillSelect('pDepositoOrigem',depositos);
}
function fillSelect(id,values){
 const el=$(id);if(!el)return;
 el.innerHTML='<option value="">Selecione...</option>'+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
}
async function loadUsers(){
 const r=await supabaseClient.from('usuarios').select('id,patente,nome_guerra');
 if(!r.error)(r.data||[]).forEach(x=>usersMap.set(String(x.id),x));
}
async function loadPedidos(){
 const [p,i]=await Promise.all([
   supabaseClient.from('pedidos_orcamentarios').select('*').order('data_pedido',{ascending:false}).order('id',{ascending:false}).limit(1000),
   supabaseClient.from('pedido_orcamentario_itens').select('*').order('id',{ascending:true}).limit(10000)
 ]);
 if(p.error){
   $('pedidoList').innerHTML=`<div class="orc-empty">Erro ao carregar pedidos:<br>${esc(p.error.message)}</div>`;
   return;
 }
 pedidos=p.data||[];
 allItems=i.error?[]:(i.data||[]);
 updateCounts();renderList();
 const params=new URLSearchParams(location.search);
 const id=params.get('pedido');
 if(id){
   const found=pedidos.find(x=>String(x.id)===String(id));
   if(found)await selectPedido(found.id);
 }
}
function itemsFor(id){return allItems.filter(i=>String(i.pedido_id)===String(id))}
function updateCounts(){
 $('pCountPermanente').textContent=pedidos.filter(x=>x.tipo==='desrelacionamento_baixa'&&x.categoria==='permanente').length;
 $('pCountDuradouro').textContent=pedidos.filter(x=>x.tipo==='desrelacionamento_baixa'&&x.categoria==='uso_duradouro').length;
 $('pCountConsumo').textContent=pedidos.filter(x=>x.tipo==='desrelacionamento_baixa'&&x.categoria==='consumo').length;
}
function switchModule(mode){
 moduleMode=mode;
 const guides=mode==='guias';
 $('guiasModule').hidden=!guides;
 $('pedidosModule').hidden=guides;
 document.querySelectorAll('[data-orc-module]').forEach(b=>b.classList.toggle('active',b.dataset.orcModule===mode));
 if(guides){
   $('orcPageTitle').textContent='Orçamentários · Guias';
   $('orcPageSubtitle').textContent='Cadastro, Fiscalização, devolução, reenvio e andamento das guias.';
   return;
 }
 const distribution=mode==='distribuicao';
 $('pedidoTabs').style.display=distribution?'none':'flex';
 $('pedidoStatusFilter').style.display=distribution?'none':'block';
 $('pedidoListTitle').textContent=distribution?'Pedidos de Distribuição por data':'Pedidos por data';
 $('orcPageTitle').textContent=distribution?'Orçamentários · Distribuição':'Orçamentários · Desrelacionamento / Baixa';
 $('orcPageSubtitle').textContent=distribution
   ?'Pedidos com depósito de origem, dependência de destino, materiais e atualizações.'
   :'Permanente/Uso Duradouro por dependência de origem e Consumo por depósito de origem.';
 renderList();
}
function filtered(){
 if(moduleMode==='guias')return[];
 let arr=pedidos.filter(x=>moduleMode==='distribuicao'?x.tipo==='distribuicao':x.tipo==='desrelacionamento_baixa'&&x.categoria===category);
 const q=norm($('pedidoSearch').value),status=$('pedidoStatusFilter').value,date=$('pedidoDateFilter').value;
 if(moduleMode!=='distribuicao'&&status)arr=arr.filter(x=>x.status===status);
 if(date)arr=arr.filter(x=>x.data_pedido===date);
 if(q){
   arr=arr.filter(x=>{
     const its=itemsFor(x.id).map(i=>`${i.nome} ${i.numero_ficha}`).join(' ');
     return norm(`${x.numero} ${x.dependencia_origem||''} ${x.deposito_origem||''} ${x.dependencia_destino||''} ${x.motivo||''} ${its}`).includes(q);
   });
 }
 return arr;
}
function renderList(){
 if(moduleMode==='guias')return;
 const arr=filtered();
 $('pedidoListInfo').textContent=`${arr.length} pedido(s)`;
 if(!arr.length){
   $('pedidoList').innerHTML='<div class="orc-empty">Nenhum pedido neste filtro.</div>';
   return;
 }
 const groups=new Map();
 arr.forEach(p=>{const k=p.data_pedido||'sem-data';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p)});
 let h='';
 for(const [d,list] of groups){
   h+=`<div class="orc-date">${d==='sem-data'?'Sem data':dateBR(d)} (${list.length})</div>`;
   h+=list.map(p=>{
     const local=p.tipo==='distribuicao'
       ?`${p.deposito_origem||'-'} → ${p.dependencia_destino||'-'}`
       :(p.categoria==='consumo'?p.deposito_origem:p.dependencia_origem)||'-';
     const count=itemsFor(p.id).length;
     return `<article class="pedido-card ${selected&&String(selected.id)===String(p.id)?'active':''}" data-pedido-id="${p.id}">
       <div class="pedido-card-top"><strong>Pedido nº ${esc(p.numero)}</strong><span class="pedido-status ${statusClass(p.status)}">${esc(STATUS[p.status]||p.status)}</span></div>
       <p>${esc(local)} · ${count} material(is)<br>Total: ${esc(money(p.valor_total))}</p>
     </article>`;
   }).join('');
 }
 $('pedidoList').innerHTML=h;
}
async function loadHistory(id){
 const r=await supabaseClient.from('pedido_orcamentario_tramitacoes').select('*').eq('pedido_id',id).order('criado_em',{ascending:false}).order('id',{ascending:false});
 if(r.error)throw r.error;history=r.data||[];
}
async function selectPedido(id){
 selected=pedidos.find(x=>String(x.id)===String(id));if(!selected)return;
 selectedItems=itemsFor(selected.id);
 await loadHistory(selected.id);
 renderList();renderDetail();
}
function renderDetail(){
 $('pedidoDetailEmpty').hidden=true;$('pedidoDetail').hidden=false;
 $('pdTitle').textContent=`Pedido nº ${selected.numero}`;
 $('pdSubtitle').textContent=`Criado por ${userName(selected.criado_por)} · ${dateTimeBR(selected.criado_em)}`;
 $('pdStatus').textContent=STATUS[selected.status]||selected.status;
 $('pdStatus').className=`pedido-status ${statusClass(selected.status)}`;
 $('pdData').textContent=dateBR(selected.data_pedido);
 $('pdCategoriaWrap').hidden=selected.tipo==='distribuicao';
 $('pdCategoria').textContent=CAT[selected.categoria]||'-';
 $('pdTotal').textContent=money(selected.valor_total);
 $('pdDependenciaOrigemWrap').hidden=!selected.dependencia_origem;
 $('pdDepositoOrigemWrap').hidden=!selected.deposito_origem;
 $('pdDependenciaDestinoWrap').hidden=!selected.dependencia_destino;
 $('pdDependenciaOrigem').textContent=selected.dependencia_origem||'-';
 $('pdDepositoOrigem').textContent=selected.deposito_origem||'-';
 $('pdDependenciaDestino').textContent=selected.dependencia_destino||'-';
 $('pdMotivo').textContent=selected.motivo||'-';
 $('pdObservacoes').textContent=selected.observacoes||'-';
 const ret=['retornado','retornado_base'].includes(selected.status);
 $('pedidoReturnNotice').hidden=!ret;
 $('pedidoReturnNotice').textContent=ret?`⚠️ Motivo do retorno: ${selected.retorno_motivo||'Não informado.'}`:'';
 renderItems();renderFlow();renderActions();renderHistory();
}
function renderItems(){
 $('pdItemsCount').textContent=`${selectedItems.length} item(ns)`;
 $('pdItemsBody').innerHTML=selectedItems.length?selectedItems.map(i=>`<tr>
   <td>${esc(i.nome)}</td><td>${esc(i.numero_ficha)}</td>
   <td class="num">${esc(i.quantidade)}</td><td class="num">${esc(money(i.valor_unitario))}</td>
   <td class="num"><b>${esc(money(i.valor_total))}</b></td>
 </tr>`).join(''):'<tr><td colspan="5">Nenhum material.</td></tr>';
 $('pdItemsTotal').textContent=money(selected.valor_total);
}
function flowSteps(p){
 if(p.tipo==='distribuicao')return[['pedido','Pedido']];
 if(p.categoria==='consumo')return[['pedido','Pedido'],['aguardando_aprovacao','Aprovação / Retorno'],['aprovado','Aprovado'],['pronto','Pronto']];
 return [['pedido','Pedido'],['aguardando_aprovacao','Aprovação / Retorno'],['aprovado','Aprovado'],['encaminhado_base','Base Administrativa'],['aprovado_base','Aprovação / Retorno da Base'],['pronto','Pronto']];
}
function rank(p){
 if(p.tipo==='distribuicao')return 0;
 return p.categoria==='consumo'
  ?({pedido:0,aguardando_aprovacao:1,retornado:1,aprovado:2,pronto:3}[p.status]??0)
  :({pedido:0,aguardando_aprovacao:1,retornado:1,aprovado:2,encaminhado_base:3,retornado_base:3,aprovado_base:4,pronto:5}[p.status]??0);
}
function renderFlow(){
 const dist=selected.tipo==='distribuicao';
 $('pedidoFlowHint').textContent=dist?'Etapas da Distribuição serão definidas depois.':'';
 const r=rank(selected);
 $('pedidoSteps').innerHTML=flowSteps(selected).map((s,i)=>`<div class="pedido-step ${i<r||selected.status==='pronto'?'done':''} ${i===r?'current':''}">${esc(s[1])}</div>`).join('');
 $('pedidoActionsBox').hidden=dist;
}
function btn(label,action,cls=''){return `<button class="orc-btn ${cls}" data-pedido-action="${action}">${label}</button>`}
function renderActions(){
 if(selected.tipo==='distribuicao')return;
 let h='',hint='',s=selected.status,c=selected.categoria;
 if(s==='pedido'){hint='Pedido aberto';h=btn('Encaminhar para aprovação','encaminhar_aprovacao','primary')}
 else if(s==='aguardando_aprovacao'){hint='Aguardando decisão';h=btn('↩ Retornar','retornar','danger')+btn('✓ Aprovar','aprovar','primary')}
 else if(s==='retornado'){hint='Retornado para correção';h=btn('Reenviar para aprovação','encaminhar_aprovacao','primary')}
 else if(s==='aprovado'){
   if(c==='consumo'){hint='Aprovado';h=btn('✓ Marcar como Pronto','pronto','primary')}
   else{hint='Aprovado';h=btn('Encaminhar à Base Administrativa','encaminhar_base','primary')}
 }
 else if(s==='encaminhado_base'){hint='Aguardando decisão da Base';h=btn('↩ Retorno da Base','retornar_base','danger')+btn('✓ Aprovação da Base','aprovar_base','primary')}
 else if(s==='retornado_base'){hint='Retornado pela Base';h=btn('Reencaminhar à Base','reenviar_base','primary')}
 else if(s==='aprovado_base'){hint='Aprovado pela Base';h=btn('✓ Marcar como Pronto','pronto','primary')}
 else{hint='Concluído';h='<span class="pedido-status ok">✓ Pronto</span>'}
 $('pedidoActionHint').textContent=hint;$('pedidoActionButtons').innerHTML=h;
}
function eventLabel(e){
 return ({
  pedido_criado:'Pedido cadastrado',pedido_encaminhado_aprovacao:'Encaminhado para aprovação',
  pedido_reenviado:'Pedido corrigido e reenviado',pedido_aprovado:'Pedido aprovado',
  pedido_retornado:'Pedido retornado',encaminhado_base:'Encaminhado à Base Administrativa',
  aprovado_base:'Aprovado pela Base Administrativa',retornado_base:'Retornado pela Base Administrativa',
  reenviado_base:'Reencaminhado à Base Administrativa',pedido_concluido:'Pedido concluído',
  atualizacao:'Atualização'
 }[e]||e);
}
function renderHistory(){
 $('pedidoHistoryCount').textContent=`${history.length} evento(s)`;
 $('pedidoHistory').innerHTML=history.length?history.map(h=>`<div class="pedido-hitem">
   <strong>${esc(eventLabel(h.evento))}</strong>
   ${h.mensagem?`<p>${esc(h.mensagem)}</p>`:''}
   ${h.status_anterior||h.status_novo?`<p>${esc(STATUS[h.status_anterior]||h.status_anterior||'-')} → ${esc(STATUS[h.status_novo]||h.status_novo||'-')}</p>`:''}
   <small>${esc(userName(h.usuario_id))} · ${dateTimeBR(h.criado_em)}</small>
 </div>`).join(''):'<div class="orc-empty">Sem histórico ainda.</div>';
}
function syncPedidoLocation(){
 const dist=moduleMode==='distribuicao',cat=$('pCategoria').value;
 $('pCategoriaWrap').hidden=dist;
 $('pDependenciaOrigemWrap').hidden=dist||cat==='consumo';
 $('pDepositoOrigemWrap').hidden=!dist&&cat!=='consumo';
 $('pDependenciaDestinoWrap').hidden=!dist;
 $('pDependenciaOrigem').required=!dist&&cat!=='consumo';
 $('pDepositoOrigem').required=dist||cat==='consumo';
 $('pDependenciaDestino').required=dist;
 if(dist){
   $('pedidoLocationRule').textContent='Distribuição: selecione o depósito de origem e a dependência de destino.';
   $('pMotivoLabel').textContent='Finalidade da distribuição *';
 }else if(cat==='consumo'){
   $('pedidoLocationRule').textContent='Baixa de material de Consumo: selecione o depósito de origem.';
   $('pMotivoLabel').textContent='Motivo da baixa *';
 }else{
   $('pedidoLocationRule').textContent='Desrelacionamento de material Permanente/Uso Duradouro: selecione a dependência de origem.';
   $('pMotivoLabel').textContent='Motivo do desrelacionamento *';
 }
}
function addEditorRow(values={}){
 const row=document.createElement('div');row.className='pedido-item-row';
 row.innerHTML=`<input class="pi-name" required placeholder="Nome do material" value="${esc(values.nome||'')}">
 <input class="pi-ficha" required placeholder="Nº da ficha" value="${esc(values.numero_ficha||'')}">
 <input class="pi-qtd" type="number" min="0.001" step="0.001" required value="${values.quantidade||1}">
 <input class="pi-unit" type="number" min="0" step="0.01" required value="${values.valor_unitario??0}">
 <div class="pedido-item-total">${money((values.quantidade||1)*(values.valor_unitario||0))}</div>
 <button type="button" class="pedido-remove" title="Remover">×</button>`;
 $('pedidoItemsEditor').appendChild(row);
 row.querySelector('.pedido-remove').onclick=()=>{if(document.querySelectorAll('.pedido-item-row').length<=1)return alert('O pedido precisa ter pelo menos um material.');row.remove();calcEditorTotal()};
 row.querySelectorAll('input').forEach(i=>i.addEventListener('input',calcEditorTotal));
 calcEditorTotal();
}
function calcEditorTotal(){
 let total=0;
 document.querySelectorAll('.pedido-item-row').forEach(r=>{
   const q=Number(r.querySelector('.pi-qtd').value)||0,u=Number(r.querySelector('.pi-unit').value)||0,v=q*u;
   r.querySelector('.pedido-item-total').textContent=money(v);total+=v;
 });
 $('pedidoEditorTotal').textContent=money(total);
}
function openNewPedido(){
 $('newPedidoForm').reset();$('pedidoItemsEditor').innerHTML='';
 $('pData').value=new Date().toISOString().slice(0,10);
 $('pCategoria').value=category;addEditorRow();syncPedidoLocation();
 $('newPedidoTitle').textContent=moduleMode==='distribuicao'?'Novo pedido de Distribuição':'Novo pedido de Desrelacionamento / Baixa';
 $('newPedidoBg').classList.add('open');
}
function readEditorItems(){
 return [...document.querySelectorAll('.pedido-item-row')].map(r=>({
   nome:r.querySelector('.pi-name').value.trim(),
   numero_ficha:r.querySelector('.pi-ficha').value.trim(),
   quantidade:Number(r.querySelector('.pi-qtd').value),
   valor_unitario:Number(r.querySelector('.pi-unit').value)
 }));
}
async function createPedido(e){
 e.preventDefault();
 const dist=moduleMode==='distribuicao',cat=dist?null:$('pCategoria').value;
 const items=readEditorItems();
 if(!items.length)return alert('Adicione pelo menos um material.');
 if(items.some(i=>!i.nome||!i.numero_ficha||!(i.quantidade>0)||i.valor_unitario<0))return alert('Confira nome, número da ficha, quantidade e valor unitário dos materiais.');
 if(!dist&&cat!=='consumo'&&!$('pDependenciaOrigem').value)return alert('Selecione a dependência de origem.');
 if((dist||cat==='consumo')&&!$('pDepositoOrigem').value)return alert('Selecione o depósito de origem.');
 if(dist&&!$('pDependenciaDestino').value)return alert('Selecione a dependência de destino.');
 const btn=$('savePedido');btn.disabled=true;btn.textContent='Cadastrando...';
 let created=null;
 try{
   const payload={
     numero:$('pNumero').value.trim(),data_pedido:$('pData').value,
     tipo:dist?'distribuicao':'desrelacionamento_baixa',categoria:cat,
     dependencia_origem:!dist&&cat!=='consumo' ? $('pDependenciaOrigem').value:null,
     deposito_origem:dist||cat==='consumo' ? $('pDepositoOrigem').value:null,
     dependencia_destino:dist ? $('pDependenciaDestino').value:null,
     motivo:$('pMotivo').value.trim(),observacoes:$('pObservacoes').value.trim()||null,
     status:'pedido',criado_por:String(user.id),criado_por_perfil_id:profileId(),
     secao_criador:user.secao||null,posicao_criador:user.posicao||null
   };
   const p=await supabaseClient.from('pedidos_orcamentarios').insert([payload]).select('*').single();
   if(p.error)throw p.error;created=p.data;
   const rows=items.map(i=>({...i,pedido_id:created.id}));
   const ins=await supabaseClient.from('pedido_orcamentario_itens').insert(rows);
   if(ins.error)throw ins.error;
   await supabaseClient.from('pedido_orcamentario_tramitacoes').insert([{
     pedido_id:created.id,evento:'pedido_criado',
     mensagem:dist?'Pedido de distribuição cadastrado.':'Pedido de desrelacionamento / baixa cadastrado.',
     status_novo:'pedido',usuario_id:String(user.id),perfil_id:profileId()
   }]);
   $('newPedidoBg').classList.remove('open');toast('Pedido cadastrado com os materiais.');
   await loadPedidos();await selectPedido(created.id);
 }catch(err){
   if(created?.id)await supabaseClient.from('pedidos_orcamentarios').delete().eq('id',created.id);
   alert('Erro ao cadastrar o pedido: '+err.message);
 }finally{btn.disabled=false;btn.textContent='Cadastrar pedido'}
}
async function move(action){
 if(!selected)return;
 const note=$('pedidoActionNote').value.trim();
 if(['retornar','retornar_base'].includes(action)&&!note)return alert('Informe o motivo do retorno.');
 const r=await supabaseClient.rpc('v5_3_mover_pedido',{
   p_pedido_id:selected.id,p_acao:action,p_usuario_id:String(user.id),p_perfil_id:profileId(),p_mensagem:note||null
 });
 if(r.error)return alert(r.error.message);
 $('pedidoActionNote').value='';toast('Andamento atualizado.');
 const id=selected.id;await loadPedidos();await selectPedido(id);
}
async function addUpdate(){
 if(!selected)return;
 const text=$('pedidoUpdateText').value.trim();if(!text)return alert('Digite a atualização.');
 const r=await supabaseClient.rpc('v5_3_adicionar_atualizacao_pedido',{
   p_pedido_id:selected.id,p_usuario_id:String(user.id),p_perfil_id:profileId(),p_mensagem:text
 });
 if(r.error)return alert(r.error.message);
 $('pedidoUpdateText').value='';toast('Atualização registrada.');await loadHistory(selected.id);renderHistory();
}
function bind(){
 $('orcModuleNav').addEventListener('click',e=>{
   const b=e.target.closest('[data-orc-module]');if(b)switchModule(b.dataset.orcModule);
 });
 $('pedidoTabs').onclick=e=>{
   const b=e.target.closest('[data-pedido-cat]');if(!b)return;
   category=b.dataset.pedidoCat;document.querySelectorAll('[data-pedido-cat]').forEach(x=>x.classList.toggle('active',x===b));renderList();
 };
 ['pedidoSearch','pedidoStatusFilter','pedidoDateFilter'].forEach(id=>$(id).addEventListener(id==='pedidoSearch'?'input':'change',renderList));
 $('pedidoList').onclick=e=>{const c=e.target.closest('[data-pedido-id]');if(c)selectPedido(c.dataset.pedidoId)};
 $('btnNovoPedido').onclick=openNewPedido;
 $('closePedido').onclick=$('cancelPedido').onclick=()=>$('newPedidoBg').classList.remove('open');
 $('newPedidoBg').onclick=e=>{if(e.target===$('newPedidoBg'))$('newPedidoBg').classList.remove('open')};
 $('pCategoria').onchange=syncPedidoLocation;
 $('btnAddPedidoItem').onclick=()=>addEditorRow();
 $('newPedidoForm').onsubmit=createPedido;
 $('pedidoActionButtons').onclick=e=>{const b=e.target.closest('[data-pedido-action]');if(b)move(b.dataset.pedidoAction)};
 $('btnPedidoUpdate').onclick=addUpdate;
}
async function start(){
 if(!await initUser())return;
 bind();await Promise.all([loadRefs(),loadUsers(),loadPedidos()]);
 const params=new URLSearchParams(location.search);
 if(params.get('modulo')==='distribuicao')switchModule('distribuicao');
 else if(params.get('modulo')==='baixas'||params.get('pedido'))switchModule('baixas');
 else switchModule('guias');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();