(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const fmtDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-';
const fmtTime=v=>v?new Date(v).toLocaleString('pt-BR'):'-';

let baseUser=null,user=null,profileState=null,isFiscal=false;
let guides=[],selected=null,attachments=[],history=[],usersMap=new Map();
let category='sem_assinatura',fiscalQueue=false,currentAttachment=null;

const STATUS_LABEL={
 aguardando_recebimento_guia:'Aguardando recebimento da guia',
 aguardando_inclusao_siscofis:'Aguardando inclusão no Siscofis',
 incluindo_guia:'Incluindo guia',
 aguardando_encaminhar_cmt:'Aguardando encaminhar ao Cmt',
 aguardando_assinatura:'Aguardando assinatura',
 assinada:'Assinada',
 aguardando_inclusao_carga:'Aguardando inclusão em carga',
 aguardando_assinatura_almoxarifado:'Aguardando assinatura do almoxarifado',
 aguardando_assinatura_cmt:'Aguardando assinatura do Cmt',
 aguardando_assinatura_om:'Aguardando assinatura da OM',
 aguardando_material_sair_carga:'Aguardando material sair da carga',
 pronto:'Pronto'
};
const FISCAL_LABEL={
 aguardando_fiscalizacao:'Aguardando Fiscalização',
 em_analise_fiscalizacao:'Em análise na Fiscalização',
 devolvida_fiscalizacao:'Devolvida para correção',
 aprovada_fiscalizacao:'Aprovada pela Fiscalização'
};
const REGULAR_FLOW=[
 'aguardando_recebimento_guia','aguardando_inclusao_siscofis','incluindo_guia',
 'aguardando_encaminhar_cmt','aguardando_assinatura','assinada',
 'aguardando_inclusao_carga','pronto'
];
const RECOLHIMENTO_FLOW=[
 'aguardando_assinatura_almoxarifado','aguardando_assinatura_cmt',
 'aguardando_assinatura_om','aguardando_material_sair_carga','pronto'
];

function toast(msg){
 const el=$('orcToast');el.textContent=msg;el.classList.add('show');
 clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2600);
}
function initialStatus(tipo){return tipo==='recolhimento'?'aguardando_assinatura_almoxarifado':'aguardando_recebimento_guia'}
function catOf(g){
 if(g.status==='pronto')return'pronto';
 if(g.tipo==='recolhimento'){
   if(g.status==='aguardando_material_sair_carga')return'assinada';
   return'sem_assinatura';
 }
 if(g.status==='assinada')return'assinada';
 if(g.status==='aguardando_inclusao_carga')return'aguardando_carga';
 return'sem_assinatura';
}
function fiscalClass(v){
 return v==='aguardando_fiscalizacao'?'fiscal-wait':
        v==='em_analise_fiscalizacao'?'fiscal-analysis':
        v==='devolvida_fiscalizacao'?'fiscal-return':'fiscal-ok';
}
function typeLabel(v){return v==='transferencia'?'Transferência':v==='remessa'?'Remessa':'Recolhimento'}
function userName(id){
 const x=usersMap.get(String(id));
 return x?[x.patente,x.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`;
}
function canCreator(g){return g&&String(g.criado_por)===String(user?.id)}
function canUpdate(g){return canCreator(g)||isFiscal}

async function initUser(){
 baseUser=JSON.parse(localStorage.getItem('usuarioLogado')||'null');
 if(!baseUser?.id){location.replace('index.html');return false}
 if(window.Perfis26){
   profileState=await Perfis26.carregar(supabaseClient,baseUser);
   user=profileState.usuario;
 }else user=baseUser;
 isFiscal=(norm(user.secao)==='fiscalizacao'&&['chefe','auxiliar'].includes(norm(user.posicao)));
 $('btnFiscalQueue').classList.toggle('show',isFiscal);
 $('fiscalBanner').classList.toggle('show',isFiscal);
 return true;
}
async function loadUsers(){
 const r=await supabaseClient.from('usuarios').select('id,nome_guerra,patente,secao,posicao');
 if(!r.error)(r.data||[]).forEach(x=>usersMap.set(String(x.id),x));
}
async function loadGuides(){
 const r=await supabaseClient.from('guias_orcamentarias').select('*').order('data_guia',{ascending:false}).order('id',{ascending:false}).limit(1000);
 if(r.error)throw r.error;
 guides=r.data||[];
 updateCounts();renderList();
 const q=new URLSearchParams(location.search).get('guia');
 if(q){
   const g=guides.find(x=>String(x.id)===String(q));
   if(g)await selectGuide(g.id);
 }
}
function updateCounts(){
 const count=c=>guides.filter(g=>catOf(g)===c).length;
 $('cSem').textContent=count('sem_assinatura');
 $('cAss').textContent=count('assinada');
 $('cCarga').textContent=count('aguardando_carga');
 $('cPronto').textContent=count('pronto');
 $('fiscalCount').textContent=guides.filter(g=>['aguardando_fiscalizacao','em_analise_fiscalizacao'].includes(g.situacao_fiscalizacao)).length;
}
function filteredGuides(){
 const q=norm($('searchGuia').value),tipo=$('tipoFilter').value,date=$('dateFilter').value;
 let arr=guides.slice();
 if(fiscalQueue&&isFiscal)arr=arr.filter(g=>['aguardando_fiscalizacao','em_analise_fiscalizacao'].includes(g.situacao_fiscalizacao));
 else arr=arr.filter(g=>catOf(g)===category);
 if(tipo)arr=arr.filter(g=>g.tipo===tipo);
 if(date)arr=arr.filter(g=>g.data_guia===date);
 if(q)arr=arr.filter(g=>norm(`${g.numero} ${g.om_origem} ${g.om_destino} ${g.assunto} ${typeLabel(g.tipo)}`).includes(q));
 return arr;
}
function renderList(){
 const arr=filteredGuides();$('listInfo').textContent=`${arr.length} guia(s)`;
 if(!arr.length){$('guiaList').innerHTML='<div class="orc-empty">Nenhuma guia neste filtro.</div>';return}
 const groups=new Map();
 arr.forEach(g=>{const k=g.data_guia||'sem-data';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(g)});
 let h='';
 for(const [date,items] of groups){
   h+=`<div class="orc-date">${date==='sem-data'?'Sem data':fmtDate(date)} (${items.length})</div>`;
   h+=items.map(g=>`<article class="orc-card ${selected&&String(selected.id)===String(g.id)?'active':''}" data-guide="${g.id}">
     <div class="orc-card-top"><strong>Guia ${esc(g.numero)} · ${esc(typeLabel(g.tipo))}</strong><span class="orc-badge ${fiscalClass(g.situacao_fiscalizacao)}">${esc(FISCAL_LABEL[g.situacao_fiscalizacao]||g.situacao_fiscalizacao)}</span></div>
     <p>${esc(g.om_origem)} → ${esc(g.om_destino)}<br>${esc(STATUS_LABEL[g.status]||g.status)}</p>
   </article>`).join('');
 }
 $('guiaList').innerHTML=h;
}
async function loadAttachments(id){
 const r=await supabaseClient.from('guia_anexos').select('*').eq('guia_id',id).order('versao',{ascending:false});
 if(r.error)throw r.error;attachments=r.data||[];currentAttachment=attachments[0]||null;
}
async function loadHistory(id){
 const r=await supabaseClient.from('guia_tramitacoes').select('*').eq('guia_id',id).order('criado_em',{ascending:false}).order('id',{ascending:false});
 if(r.error)throw r.error;history=r.data||[];
}
async function selectGuide(id){
 const g=guides.find(x=>String(x.id)===String(id));if(!g)return;
 selected=g;renderList();
 await Promise.all([loadAttachments(g.id),loadHistory(g.id)]);
 renderDetail();
}
function renderPreview(){
 const box=$('previewBox'),a=currentAttachment;
 if(!a){box.innerHTML='<div class="orc-empty">Nenhum documento anexado.</div>';$('versionInfo').textContent='';return}
 const zoom=parseInt($('previewZoom').value)||100;
 if((a.arquivo_mime||'').startsWith('image/')){
   box.innerHTML=`<img src="${esc(a.arquivo_url)}" alt="${esc(a.arquivo_nome)}" style="width:${zoom}%">`;
 }else{
   const sep=a.arquivo_url.includes('#')?'&':'#';
   box.innerHTML=`<iframe src="${esc(a.arquivo_url)}${sep}zoom=${zoom}" title="Visualização da guia"></iframe>`;
 }
 $('versionInfo').textContent=`Versão ${a.versao} · ${a.arquivo_nome} · ${Math.max(1,Math.round((a.arquivo_tamanho||0)/1024))} KB · ${fmtTime(a.criado_em)}`;
}
function renderHistory(){
 $('historyCount').textContent=`${history.length} evento(s)`;
 if(!history.length){$('historyList').innerHTML='<div class="orc-empty">Sem histórico ainda.</div>';return}
 $('historyList').innerHTML=history.map(h=>`<div class="orc-hitem">
   <strong>${esc(eventLabel(h.evento))}</strong>
   ${h.mensagem?`<p>${esc(h.mensagem)}</p>`:''}
   ${h.status_anterior||h.status_novo?`<p>${esc(STATUS_LABEL[h.status_anterior]||h.status_anterior||'-')} → ${esc(STATUS_LABEL[h.status_novo]||h.status_novo||'-')}</p>`:''}
   <small>${esc(userName(h.usuario_id))} · ${fmtTime(h.criado_em)}</small>
 </div>`).join('');
}
function eventLabel(e){
 return ({
   despachada_fiscalizacao:'Despachada para Fiscalização',
   ciencia_fiscalizacao:'Fiscalização tomou ciência',
   devolvida_fiscalizacao:'Fiscalização devolveu a guia',
   aprovada_fiscalizacao:'Fiscalização aprovou a guia',
   reenviada_fiscalizacao:'Guia corrigida e reenviada',
   status_alterado:'Andamento atualizado',
   atualizacao:'Atualização registrada',
   arquivo_adicionado:'Nova versão do documento'
 }[e]||e);
}
function renderFlow(){
 const flow=selected.tipo==='recolhimento'?RECOLHIMENTO_FLOW:REGULAR_FLOW;
 $('flowStatus').innerHTML=flow.map(s=>`<option value="${s}" ${s===selected.status?'selected':''}>${esc(STATUS_LABEL[s])}</option>`).join('');
}
function renderFiscalActions(){
 const panel=$('fiscalActions'),buttons=$('fiscalButtons'),decision=$('fiscalDecisionBox');
 panel.hidden=!isFiscal;decision.hidden=true;buttons.innerHTML='';
 if(!isFiscal)return;
 const s=selected.situacao_fiscalizacao;
 if(s==='aguardando_fiscalizacao'){
   $('fiscalActionHint').textContent='Aguardando ciência';
   buttons.innerHTML='<button class="orc-btn info" id="takeScience">✓ Tomar ciência da guia</button>';
   $('takeScience').onclick=()=>fiscalAction('ciencia');
 }else if(s==='em_analise_fiscalizacao'){
   $('fiscalActionHint').textContent='Em análise';
   decision.hidden=false;
 }else if(s==='devolvida_fiscalizacao'){
   $('fiscalActionHint').textContent='Aguardando correção do remetente';
   buttons.innerHTML='<span class="orc-note returned">A guia foi devolvida. Aguarde o remetente reenviar uma nova versão.</span>';
 }else{
   $('fiscalActionHint').textContent='Aprovada';
   buttons.innerHTML='<span class="orc-note">Fiscalização concluída. O fluxo administrativo pode seguir.</span>';
 }
}
function renderDetail(){
 $('detailEmpty').hidden=true;$('detailWrap').hidden=false;
 $('dNumero').textContent=`Guia ${selected.numero}`;
 $('dTipo').textContent=`${typeLabel(selected.tipo)} · criada por ${userName(selected.criado_por)}`;
 $('dData').textContent=fmtDate(selected.data_guia);$('dOrigem').textContent=selected.om_origem;$('dDestino').textContent=selected.om_destino;$('dAssunto').textContent=selected.assunto;
 $('dStatus').textContent=STATUS_LABEL[selected.status]||selected.status;
 $('dFiscal').textContent=FISCAL_LABEL[selected.situacao_fiscalizacao]||selected.situacao_fiscalizacao;
 $('dFiscal').className=`orc-badge ${fiscalClass(selected.situacao_fiscalizacao)}`;
 $('returnNotice').hidden=selected.situacao_fiscalizacao!=='devolvida_fiscalizacao';
 $('returnNotice').textContent=selected.situacao_fiscalizacao==='devolvida_fiscalizacao'?`⚠️ Devolvida pela Fiscalização: ${selected.observacao_fiscalizacao||'Sem motivo informado.'}`:'';
 $('resendBox').hidden=!(selected.situacao_fiscalizacao==='devolvida_fiscalizacao'&&canCreator(selected));
 $('flowBox').hidden=!(isFiscal&&selected.situacao_fiscalizacao==='aprovada_fiscalizacao');
 $('btnAddUpdate').disabled=!canUpdate(selected);
 renderPreview();renderHistory();renderFiscalActions();renderFlow();
}
function safeName(v){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_')}
async function uploadFile(file,guideId,version){
 if(!file)throw new Error('Selecione o arquivo da guia.');
 if(file.size>15*1024*1024)throw new Error('O arquivo ultrapassa 15 MB.');
 const allowed=['application/pdf','image/jpeg','image/png','image/webp'];
 if(!allowed.includes(file.type))throw new Error('Formato não permitido. Use PDF, JPG, PNG ou WEBP.');
 const path=`guias/${guideId}/${Date.now()}_v${version}_${safeName(file.name)}`;
 const up=await supabaseClient.storage.from('guias-orcamentarias').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
 if(up.error)throw up.error;
 const pub=supabaseClient.storage.from('guias-orcamentarias').getPublicUrl(path);
 return {path,url:pub.data.publicUrl};
}
async function createGuide(e){
 e.preventDefault();
 const btn=$('saveGuide'),file=$('gFile').files[0],tipo=$('gTipo').value;
 if(!file)return alert('Anexe a guia em PDF ou imagem.');
 btn.disabled=true;btn.textContent='Cadastrando...';
 let guide=null;
 try{
   const payload={
     numero:$('gNumero').value.trim(),
     data_guia:$('gData').value,
     om_origem:$('gOrigem').value.trim(),
     om_destino:$('gDestino').value.trim(),
     assunto:$('gAssunto').value.trim(),
     tipo,
     status:initialStatus(tipo),
     situacao_fiscalizacao:'aguardando_fiscalizacao',
     criado_por:String(user.id),
     criado_por_perfil_id:user.perfil_id?Number(user.perfil_id):null
   };
   const ins=await supabaseClient.from('guias_orcamentarias').insert([payload]).select('*').single();
   if(ins.error)throw ins.error;guide=ins.data;
   const f=await uploadFile(file,guide.id,1);
   const ai=await supabaseClient.from('guia_anexos').insert([{
     guia_id:guide.id,versao:1,arquivo_nome:file.name,arquivo_path:f.path,arquivo_url:f.url,
     arquivo_mime:file.type,arquivo_tamanho:file.size,enviado_por:String(user.id),
     enviado_por_perfil_id:user.perfil_id?Number(user.perfil_id):null,observacao:'Documento cadastrado com a guia.'
   }]).select('*').single();
   if(ai.error)throw ai.error;
   await supabaseClient.from('guia_tramitacoes').insert([{
     guia_id:guide.id,evento:'arquivo_adicionado',mensagem:'Versão inicial da guia anexada.',
     usuario_id:String(user.id),perfil_id:user.perfil_id?Number(user.perfil_id):null,anexo_id:ai.data.id
   }]);
   const rpc=await supabaseClient.rpc('v5_despachar_guia_fiscalizacao',{
     p_guia_id:guide.id,p_usuario_id:String(user.id),p_perfil_id:user.perfil_id?Number(user.perfil_id):null
   });
   if(rpc.error)throw rpc.error;
   $('newGuideBg').classList.remove('open');$('newGuideForm').reset();$('uploadArea').classList.remove('selected');$('fileName').textContent='';
   toast('Guia cadastrada e despachada para a Fiscalização.');
   await loadGuides();await selectGuide(guide.id);
 }catch(err){
   console.error(err);alert('Erro ao cadastrar a guia: '+err.message);
 }finally{btn.disabled=false;btn.textContent='Cadastrar e despachar'}
}
async function fiscalAction(action){
 if(!selected)return;
 const msg=$('fiscalDecisionText').value.trim();
 if(action==='devolver'&&!msg)return alert('Informe o motivo da devolução.');
 const r=await supabaseClient.rpc('v5_acao_fiscalizacao_guia',{
   p_guia_id:selected.id,p_acao:action,p_usuario_id:String(user.id),
   p_perfil_id:user.perfil_id?Number(user.perfil_id):null,p_mensagem:msg||null
 });
 if(r.error)return alert(r.error.message);
 $('fiscalDecisionText').value='';
 toast(action==='ciencia'?'Ciência registrada.':action==='devolver'?'Guia devolvida ao remetente.':'Guia aprovada pela Fiscalização.');
 await loadGuides();await selectGuide(selected.id);
}
async function resend(){
 if(!selected||!canCreator(selected))return;
 const file=$('resendFile').files[0],note=$('resendNote').value.trim();
 if(!file)return alert('Anexe a nova versão corrigida da guia.');
 if(!note)return alert('Descreva o que foi corrigido antes de reenviar.');
 const btn=$('btnResend');btn.disabled=true;
 try{
   const version=(attachments[0]?.versao||0)+1,f=await uploadFile(file,selected.id,version);
   const ai=await supabaseClient.from('guia_anexos').insert([{
     guia_id:selected.id,versao:version,arquivo_nome:file.name,arquivo_path:f.path,arquivo_url:f.url,
     arquivo_mime:file.type,arquivo_tamanho:file.size,enviado_por:String(user.id),
     enviado_por_perfil_id:user.perfil_id?Number(user.perfil_id):null,observacao:note
   }]).select('*').single();
   if(ai.error)throw ai.error;
   await supabaseClient.from('guia_tramitacoes').insert([{
     guia_id:selected.id,evento:'arquivo_adicionado',mensagem:`Nova versão ${version} anexada: ${note}`,
     usuario_id:String(user.id),perfil_id:user.perfil_id?Number(user.perfil_id):null,anexo_id:ai.data.id
   }]);
   const rpc=await supabaseClient.rpc('v5_reenviar_guia_fiscalizacao',{
     p_guia_id:selected.id,p_usuario_id:String(user.id),p_perfil_id:user.perfil_id?Number(user.perfil_id):null,
     p_mensagem:note,p_anexo_id:ai.data.id
   });
   if(rpc.error)throw rpc.error;
   $('resendFile').value='';$('resendNote').value='';toast('Nova versão enviada à Fiscalização.');
   await loadGuides();await selectGuide(selected.id);
 }catch(err){alert('Erro ao reenviar: '+err.message)}finally{btn.disabled=false}
}
async function saveFlow(){
 if(!selected||!isFiscal)return;
 const r=await supabaseClient.rpc('v5_atualizar_status_guia',{
   p_guia_id:selected.id,p_status:$('flowStatus').value,p_usuario_id:String(user.id),
   p_perfil_id:user.perfil_id?Number(user.perfil_id):null,p_mensagem:$('flowNote').value.trim()||null
 });
 if(r.error)return alert(r.error.message);
 $('flowNote').value='';toast('Andamento atualizado.');
 await loadGuides();await selectGuide(selected.id);
}
async function addUpdate(){
 if(!selected)return;
 const text=$('generalUpdate').value.trim();if(!text)return alert('Digite a atualização.');
 const r=await supabaseClient.rpc('v5_adicionar_atualizacao_guia',{
   p_guia_id:selected.id,p_usuario_id:String(user.id),p_perfil_id:user.perfil_id?Number(user.perfil_id):null,p_mensagem:text
 });
 if(r.error)return alert(r.error.message);
 $('generalUpdate').value='';toast('Atualização registrada.');await loadHistory(selected.id);renderHistory();
}
function bind(){
 $('btnNovaGuia').onclick=()=>{$('newGuideBg').classList.add('open');$('gData').value=new Date().toISOString().slice(0,10)};
 $('closeGuide').onclick=$('cancelGuide').onclick=()=>$('newGuideBg').classList.remove('open');
 $('newGuideBg').onclick=e=>{if(e.target===$('newGuideBg'))$('newGuideBg').classList.remove('open')};
 $('newGuideForm').onsubmit=createGuide;
 $('gFile').onchange=()=>{const f=$('gFile').files[0];$('fileName').textContent=f?f.name:'';$('uploadArea').classList.toggle('selected',!!f)};
 $('categoryTabs').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;category=b.dataset.cat;fiscalQueue=false;$('btnFiscalQueue').classList.remove('active');document.querySelectorAll('.orc-tab').forEach(x=>x.classList.toggle('active',x===b));renderList()};
 $('btnFiscalQueue').onclick=()=>{if(!isFiscal)return;fiscalQueue=!fiscalQueue;$('btnFiscalQueue').classList.toggle('active',fiscalQueue);if(fiscalQueue)document.querySelectorAll('.orc-tab').forEach(x=>x.classList.remove('active'));else document.querySelector(`[data-cat="${category}"]`)?.classList.add('active');renderList()};
 ['searchGuia','tipoFilter','dateFilter'].forEach(id=>$(id).addEventListener(id==='searchGuia'?'input':'change',renderList));
 $('guiaList').onclick=e=>{const card=e.target.closest('[data-guide]');if(card)selectGuide(card.dataset.guide)};
 $('previewZoom').onchange=renderPreview;
 $('btnOpenFile').onclick=()=>{if(currentAttachment)window.open(currentAttachment.arquivo_url,'_blank','noopener')};
 $('btnDownloadFile').onclick=()=>{if(!currentAttachment)return;const a=document.createElement('a');a.href=currentAttachment.arquivo_url;a.download=currentAttachment.arquivo_nome||'guia';a.target='_blank';a.click()};
 $('btnReturnFiscal').onclick=()=>fiscalAction('devolver');
 $('btnApproveFiscal').onclick=()=>fiscalAction('aprovar');
 $('btnResend').onclick=resend;
 $('btnSaveFlow').onclick=saveFlow;
 $('btnAddUpdate').onclick=addUpdate;
}
async function start(){
 try{
   if(!await initUser())return;
   bind();await loadUsers();await loadGuides();
 }catch(err){console.error(err);$('guiaList').innerHTML=`<div class="orc-empty">Erro ao abrir Orçamentários:<br>${esc(err.message)}</div>`}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();