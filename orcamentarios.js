(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const fmtDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-';
const fmtTime=v=>v?new Date(v).toLocaleString('pt-BR'):'-';

let baseUser=null,user=null,profileState=null,isFiscal=false,isCommander=false,isAdmin=false;
let guides=[],selected=null,attachments=[],history=[],usersMap=new Map();
let category='fiscalizacao',fiscalQueue=false,currentAttachment=null;
let espelhoAttachment=null,tremAttachment=null;
let orcDepositos=['Almox','AlmoxVirtual','Depósito do Canil','Suprimento de Viaturas'];

async function loadGuideDepositos(){
 try{
   const r=await supabaseClient.from('orc_depositos').select('nome').eq('ativo',true).order('ordem');
   if(!r.error&&r.data?.length)orcDepositos=r.data.map(x=>x.nome);
 }catch(_){}
 const sel=$('gDepositoDestino');
 if(sel)sel.innerHTML='<option value="">Selecione o depósito...</option>'+orcDepositos.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
}
function syncGuideDepositField(){
 const tipo=$('gTipo')?.value;
 const show=tipo==='transferencia'||tipo==='remessa';
 const wrap=$('gDepositoDestinoWrap'),sel=$('gDepositoDestino');
 if(wrap)wrap.hidden=!show;
 if(sel){
   sel.required=show;
   if(!show)sel.value='';
 }
}

const STATUS_LABEL={
 aguardando_recebimento_guia:'Aguardando recebimento da guia',
 aguardando_inclusao_siscofis:'Aguardando inclusão no Siscofis',
 incluindo_guia:'Incluindo guia',
 aguardando_encaminhar_cmt:'Aguardando encaminhar ao Cmt',
 aguardando_assinatura:'Aguardando assinatura do Cmt',
 assinada:'Assinada',
 aguardando_inclusao_carga:'Aguardando inclusão em carga',
 aguardando_assinatura_almoxarifado:'Aguardando assinatura do almoxarifado',
 aguardando_assinatura_cmt:'Aguardando assinatura do Cmt',
 aguardando_assinatura_om:'Aguardando assinatura da OM',
 aguardando_material_sair_carga:'Aguardando material sair da carga',
 pronto:'Pronto'
};
const FISCAL_LABEL={
 aguardando_fiscalizacao:'Despachada para Fiscalização',
 em_analise_fiscalizacao:'Despachada para Fiscalização',
 devolvida_fiscalizacao:'Retornada pela Fiscalização',
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
 const e=g.etapa_orcamentaria||(
   g.situacao_fiscalizacao==='aprovada_fiscalizacao'?'aguardando_inclusao_carga':
   g.situacao_fiscalizacao==='devolvida_fiscalizacao'?'fiscalizacao':'fiscalizacao'
 );
 if(e==='pronto')return'pronto';
 if(e==='aguardando_inclusao_carga')return'aguardando_carga';
 return'fiscalizacao';
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
function canManageGuide(g){return !!(g&&(canCreator(g)||isAdmin))}
function canUpdate(g){return canCreator(g)||isFiscal}

async function initUser(){
 baseUser=JSON.parse(localStorage.getItem('usuarioLogado')||'null');
 if(!baseUser?.id){location.replace('index.html');return false}
 if(window.Perfis26){
   profileState=await Perfis26.carregar(supabaseClient,baseUser);
   user=profileState.usuario;
 }else user=baseUser;
 isFiscal=(norm(user.secao)==='fiscalizacao'&&['chefe','auxiliar'].includes(norm(user.posicao)));
 isCommander=(norm(user.secao)==='comandante');
 isAdmin=(norm(user.secao)==='admin');
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
 if($('cFiscal'))$('cFiscal').textContent=count('fiscalizacao');
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
 if(r.error)throw r.error;
 attachments=r.data||[];
 const main=attachments.filter(a=>(a.tipo_documento||'guia')==='guia');
 currentAttachment=main[0]||null;
 espelhoAttachment=attachments.find(a=>a.tipo_documento==='espelho')||null;
 tremAttachment=attachments.find(a=>a.tipo_documento==='trem')||null;
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
   arquivo_adicionado:'Nova versão do documento',
   arquivo_assinado_cmt:'Guia assinada pelo Comandante',
   guia_editada:'Guia editada',
   espelho_anexado:'Espelho anexado/atualizado',
   trem_anexado:'TREM anexado/atualizado',
   guia_etapa_pronto:'Guia concluída na etapa orçamentária'
 }[e]||e);
}
function guideStage(g){
 return g?.etapa_orcamentaria||(
   g?.situacao_fiscalizacao==='aprovada_fiscalizacao'?'aguardando_inclusao_carga':
   g?.situacao_fiscalizacao==='devolvida_fiscalizacao'?'retornado_fiscalizacao':'despachado_fiscalizacao'
 );
}
function renderGuideSimpleFlow(){
 const stage=guideStage(selected);
 const rank={despachado_fiscalizacao:1,retornado_fiscalizacao:1,aguardando_inclusao_carga:2,pronto:3}[stage]??0;
 const labels=['Despachado para Fiscalização','Aprovado / Retorno','Aguardando inclusão em carga','Pronto'];
 $('guideStageText').textContent=({
   despachado_fiscalizacao:'Despachado para Fiscalização',
   retornado_fiscalizacao:'Retornado pela Fiscalização',
   aguardando_inclusao_carga:'Aguardando inclusão em carga',
   pronto:'Pronto'
 }[stage]||stage);
 $('guideSimpleSteps').innerHTML=labels.map((t,i)=>`<div class="pedido-step ${i<rank||stage==='pronto'?'done':''} ${i===rank?'current':''}">${esc(t)}</div>`).join('');
}
function renderFiscalDocs(){
 const box=$('fiscalDocsBox');
 const approved=selected?.situacao_fiscalizacao==='aprovada_fiscalizacao';
 box.hidden=!approved;
 if(!approved)return;

 const setDoc=(kind,a)=>{
   const suffix=kind==='espelho'?'Espelho':'Trem';
   const label=kind==='espelho'?'Espelho':'TREM';
   const info=$(kind+'Info'),open=$('btnOpen'+suffix),down=$('btnDownload'+suffix);
   info.textContent=a?`${a.arquivo_nome} · versão ${a.versao} · ${fmtTime(a.criado_em)}`:`Nenhum ${label} anexado.`;
   open.disabled=!a;down.disabled=!a;
 };
 setDoc('espelho',espelhoAttachment);
 setDoc('trem',tremAttachment);
 $('espelhoFiscalUpload').hidden=!isFiscal;
 $('tremFiscalUpload').hidden=!isFiscal;
 $('guideCompleteBox').hidden=!(isFiscal&&guideStage(selected)==='aguardando_inclusao_carga');
}
async function uploadFiscalGuideDoc(kind){
 if(!selected||!isFiscal||selected.situacao_fiscalizacao!=='aprovada_fiscalizacao')return;
 const input=$(kind+'File'),file=input.files[0];
 if(!file)return alert(`Selecione o arquivo do ${kind==='espelho'?'Espelho':'TREM'}.`);
 let uploadedPath=null;
 try{
   const version=(attachments[0]?.versao||0)+1;
   const f=await uploadFile(file,selected.id,version);
   uploadedPath=f.path;
   const rpc=await supabaseClient.rpc('v5_5_registrar_documento_guia',{
     p_guia_id:selected.id,p_tipo_documento:kind,
     p_arquivo_nome:file.name,p_arquivo_path:f.path,p_arquivo_url:f.url,
     p_arquivo_mime:file.type,p_arquivo_tamanho:file.size,
     p_usuario_id:String(user.id),p_perfil_id:user.perfil_id?Number(user.perfil_id):null,
     p_observacao:null
   });
   if(rpc.error)throw rpc.error;
   input.value='';
   toast(`${kind==='espelho'?'Espelho':'TREM'} anexado/atualizado.`);
   await loadAttachments(selected.id);await loadHistory(selected.id);
   renderPreview();renderFiscalDocs();renderHistory();
 }catch(err){
   if(uploadedPath)try{await supabaseClient.storage.from('guias-orcamentarias').remove([uploadedPath])}catch(_){}
   alert('Erro ao anexar documento: '+err.message);
 }
}
async function completeGuideStage(){
 if(!selected||!isFiscal)return;
 const r=await supabaseClient.rpc('v5_5_concluir_guia',{
   p_guia_id:selected.id,p_usuario_id:String(user.id),
   p_perfil_id:user.perfil_id?Number(user.perfil_id):null,
   p_mensagem:$('guideCompleteNote').value.trim()||null
 });
 if(r.error)return alert(r.error.message);
 $('guideCompleteNote').value='';toast('Guia marcada como Pronto.');
 const id=selected.id;await loadGuides();await selectGuide(id);
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

 if(['aguardando_fiscalizacao','em_analise_fiscalizacao'].includes(s)){
   $('fiscalActionHint').textContent='Aguardando decisão';
   decision.hidden=false;
 }else if(s==='devolvida_fiscalizacao'){
   $('fiscalActionHint').textContent='Aguardando correção do remetente';
   buttons.innerHTML='<span class="orc-note returned">A guia foi retornada. Aguarde o remetente reenviar uma nova versão.</span>';
 }else{
   $('fiscalActionHint').textContent='Aprovada';
   buttons.innerHTML='<span class="orc-note">Guia aprovada. Espelho e TREM podem ser anexados pela Fiscalização.</span>';
 }
}
function commanderCanSign(g){
 return !!(g&&isCommander&&(
   (g.tipo==='recolhimento'&&g.status==='aguardando_assinatura_cmt')||
   (g.tipo!=='recolhimento'&&g.status==='aguardando_assinatura')
 ));
}
function renderCommanderSignature(){
 const box=$('cmtSignatureBox');
 if(!box)return;
 const can=commanderCanSign(selected);
 box.hidden=!can;
 if(!can)return;
 $('cmtSignatureHint').textContent=selected.tipo==='recolhimento'
   ?'Recolhimento · assinatura do Cmt'
   :'Transferência/Remessa · assinatura do Cmt';
}
async function commanderReplaceSignedFile(){
 if(!selected||!commanderCanSign(selected))return;
 const file=$('cmtSignedFile').files[0];
 if(!file)return alert('Selecione a guia já assinada pelo Cmt.');
 if(!currentAttachment)return alert('A guia atual não possui arquivo para ser substituído.');

 const btn=$('btnCmtReplace');
 btn.disabled=true;
 btn.textContent='Enviando versão assinada...';

 let inserted=null,uploadedPath=null;
 try{
   const version=(attachments[0]?.versao||0)+1;
   const f=await uploadFile(file,selected.id,version);
   uploadedPath=f.path;

   const ai=await supabaseClient.from('guia_anexos').insert([{
     guia_id:selected.id,
     versao:version,
     arquivo_nome:file.name,
     arquivo_path:f.path,
     arquivo_url:f.url,
     arquivo_mime:file.type,
     arquivo_tamanho:file.size,
     enviado_por:String(user.id),
     enviado_por_perfil_id:user.perfil_id?Number(user.perfil_id):null,
     observacao:$('cmtSignedNote').value.trim()||'Versão assinada pelo Comandante.'
   }]).select('*').single();

   if(ai.error)throw ai.error;
   inserted=ai.data;

   const rpc=await supabaseClient.rpc('v5_2_1_assinar_guia_cmt',{
     p_guia_id:selected.id,
     p_anexo_id:inserted.id,
     p_usuario_id:String(user.id),
     p_perfil_id:user.perfil_id?Number(user.perfil_id):null,
     p_mensagem:$('cmtSignedNote').value.trim()||null
   });
   if(rpc.error)throw rpc.error;

   $('cmtSignedFile').value='';
   $('cmtSignedNote').value='';
   toast('Guia assinada substituída com sucesso.');
   const id=selected.id;
   await loadGuides();
   await selectGuide(id);

 }catch(err){
   console.error(err);

   // Se a RPC rejeitar a assinatura, evita deixar a versão inválida como oficial.
   if(inserted?.id){
     await supabaseClient.from('guia_anexos').delete().eq('id',inserted.id);
   }
   if(uploadedPath){
     await supabaseClient.storage.from('guias-orcamentarias').remove([uploadedPath]);
   }

   alert('Erro ao substituir pela guia assinada: '+err.message);
 }finally{
   btn.disabled=false;
   btn.textContent='✓ Substituir pela guia assinada';
 }
}

function renderDetail(){
 $('detailEmpty').hidden=true;$('detailWrap').hidden=false;
 $('dNumero').textContent=`Guia ${selected.numero}`;
 $('dTipo').textContent=`${typeLabel(selected.tipo)} · criada por ${userName(selected.criado_por)}`;
 $('dData').textContent=fmtDate(selected.data_guia);$('dOrigem').textContent=selected.om_origem;$('dDestino').textContent=selected.om_destino;$('dAssunto').textContent=selected.assunto;
 const depWrap=$('dDepositoDestinoWrap');
 if(depWrap)depWrap.hidden=!(selected.tipo==='transferencia'||selected.tipo==='remessa');
 if($('dDepositoDestino'))$('dDepositoDestino').textContent=selected.deposito_destino||'-';
 $('dStatus').textContent=STATUS_LABEL[selected.status]||selected.status;
 $('dFiscal').textContent=FISCAL_LABEL[selected.situacao_fiscalizacao]||selected.situacao_fiscalizacao;
 $('dFiscal').className=`orc-badge ${fiscalClass(selected.situacao_fiscalizacao)}`;
 $('returnNotice').hidden=selected.situacao_fiscalizacao!=='devolvida_fiscalizacao';
 $('returnNotice').textContent=selected.situacao_fiscalizacao==='devolvida_fiscalizacao'?`⚠️ Devolvida pela Fiscalização: ${selected.observacao_fiscalizacao||'Sem motivo informado.'}`:'';
 $('resendBox').hidden=!(selected.situacao_fiscalizacao==='devolvida_fiscalizacao'&&canCreator(selected));
 $('flowBox').hidden=!(isFiscal&&selected.situacao_fiscalizacao==='aprovada_fiscalizacao');
 $('btnAddUpdate').disabled=!canUpdate(selected);
 const canManage=canManageGuide(selected);
 $('btnEditGuide').hidden=!canManage;
 $('btnDeleteGuide').hidden=!canManage;
 renderPreview();renderHistory();renderGuideSimpleFlow();renderFiscalActions();renderFiscalDocs();renderCommanderSignature();renderFlow();
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
 if((tipo==='transferencia'||tipo==='remessa')&&!$('gDepositoDestino').value)return alert('Selecione o depósito de destino.');
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
     deposito_destino:(tipo==='transferencia'||tipo==='remessa')?$('gDepositoDestino').value:null,
     status:initialStatus(tipo),
     situacao_fiscalizacao:'aguardando_fiscalizacao',
     criado_por:String(user.id),
     criado_por_perfil_id:user.perfil_id?Number(user.perfil_id):null
   };
   const ins=await supabaseClient.from('guias_orcamentarias').insert([payload]).select('*').single();
   if(ins.error)throw ins.error;guide=ins.data;
   const f=await uploadFile(file,guide.id,1);
   const ai=await supabaseClient.from('guia_anexos').insert([{
     guia_id:guide.id,versao:1,tipo_documento:'guia',arquivo_nome:file.name,arquivo_path:f.path,arquivo_url:f.url,
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
     guia_id:selected.id,versao:version,tipo_documento:'guia',arquivo_nome:file.name,arquivo_path:f.path,arquivo_url:f.url,
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

function fillEditGuideDepositos(){
 const sel=$('egDeposito');
 if(!sel)return;
 sel.innerHTML='<option value="">Selecione o depósito...</option>'+orcDepositos.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
}
function openEditGuide(){
 if(!selected||!canManageGuide(selected))return;
 fillEditGuideDepositos();
 $('egNumero').value=selected.numero||'';
 $('egData').value=selected.data_guia||'';
 $('egOrigem').value=selected.om_origem||'';
 $('egDestino').value=selected.om_destino||'';
 $('egAssunto').value=selected.assunto||'';
 $('egTipo').value=typeLabel(selected.tipo);
 const needs=selected.tipo==='transferencia'||selected.tipo==='remessa';
 $('egDepositoWrap').hidden=!needs;
 $('egDeposito').required=needs;
 $('egDeposito').value=selected.deposito_destino||'';
 $('editGuideBg').classList.add('open');
}
async function saveEditGuide(e){
 e.preventDefault();
 if(!selected||!canManageGuide(selected))return;
 const needs=selected.tipo==='transferencia'||selected.tipo==='remessa';
 if(needs&&!$('egDeposito').value)return alert('Selecione o depósito de destino.');
 const r=await supabaseClient.rpc('v5_4_editar_guia',{
   p_guia_id:selected.id,
   p_usuario_id:String(user.id),
   p_perfil_id:user.perfil_id?Number(user.perfil_id):null,
   p_numero:$('egNumero').value.trim(),
   p_data_guia:$('egData').value,
   p_om_origem:$('egOrigem').value.trim(),
   p_om_destino:$('egDestino').value.trim(),
   p_assunto:$('egAssunto').value.trim(),
   p_deposito_destino:needs?$('egDeposito').value:null
 });
 if(r.error)return alert('Erro ao editar a guia: '+r.error.message);
 const id=selected.id;
 $('editGuideBg').classList.remove('open');
 toast('Guia atualizada.');
 await loadGuides();await selectGuide(id);
}
async function deleteGuide(){
 if(!selected||!canManageGuide(selected))return;
 if(!confirm(`Excluir a Guia ${selected.numero}? Esta ação remove o registro da lista, mas guarda um snapshot na auditoria de exclusões.`))return;
 const r=await supabaseClient.rpc('v5_4_excluir_guia',{
   p_guia_id:selected.id,
   p_usuario_id:String(user.id),
   p_perfil_id:user.perfil_id?Number(user.perfil_id):null
 });
 if(r.error)return alert('Erro ao excluir a guia: '+r.error.message);
 const paths=Array.isArray(r.data)?r.data:[];
 if(paths.length){
   try{await supabaseClient.storage.from('guias-orcamentarias').remove(paths)}catch(_){}
 }
 selected=null;attachments=[];history=[];currentAttachment=null;
 $('detailWrap').hidden=true;$('detailEmpty').hidden=false;
 toast('Guia excluída.');
 await loadGuides();
}

function bind(){
 $('btnNovaGuia').onclick=()=>{$('newGuideBg').classList.add('open');$('gData').value=new Date().toISOString().slice(0,10)};
 $('btnEditGuide').onclick=openEditGuide;
 $('btnDeleteGuide').onclick=deleteGuide;
 $('closeEditGuide').onclick=$('cancelEditGuide').onclick=()=>$('editGuideBg').classList.remove('open');
 $('editGuideBg').onclick=e=>{if(e.target===$('editGuideBg'))$('editGuideBg').classList.remove('open')};
 $('editGuideForm').onsubmit=saveEditGuide;
 $('closeGuide').onclick=$('cancelGuide').onclick=()=>$('newGuideBg').classList.remove('open');
 $('newGuideBg').onclick=e=>{if(e.target===$('newGuideBg'))$('newGuideBg').classList.remove('open')};
 $('newGuideForm').onsubmit=createGuide;
 $('gFile').onchange=()=>{const f=$('gFile').files[0];$('fileName').textContent=f?f.name:'';$('uploadArea').classList.toggle('selected',!!f)};
 $('gTipo').onchange=syncGuideDepositField;
 $('categoryTabs').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;category=b.dataset.cat;fiscalQueue=false;$('btnFiscalQueue').classList.remove('active');document.querySelectorAll('.orc-tab').forEach(x=>x.classList.toggle('active',x===b));renderList()};
 $('btnFiscalQueue').onclick=()=>{if(!isFiscal)return;fiscalQueue=!fiscalQueue;$('btnFiscalQueue').classList.toggle('active',fiscalQueue);if(fiscalQueue)document.querySelectorAll('.orc-tab').forEach(x=>x.classList.remove('active'));else document.querySelector(`[data-cat="${category}"]`)?.classList.add('active');renderList()};
 ['searchGuia','tipoFilter','dateFilter'].forEach(id=>$(id).addEventListener(id==='searchGuia'?'input':'change',renderList));
 $('guiaList').onclick=e=>{const card=e.target.closest('[data-guide]');if(card)selectGuide(card.dataset.guide)};
 $('previewZoom').onchange=renderPreview;
 $('btnOpenFile').onclick=()=>{if(currentAttachment)window.open(currentAttachment.arquivo_url,'_blank','noopener')};
 $('btnDownloadFile').onclick=()=>{if(!currentAttachment)return;const a=document.createElement('a');a.href=currentAttachment.arquivo_url;a.download=currentAttachment.arquivo_nome||'guia';a.target='_blank';a.click()};
 $('btnCmtDownload').onclick=()=>{
   if(!currentAttachment)return alert('A guia não possui arquivo.');
   const a=document.createElement('a');
   a.href=currentAttachment.arquivo_url;
   a.download=currentAttachment.arquivo_nome||'guia';
   a.target='_blank';
   a.click();
 };
 $('btnCmtOpen').onclick=()=>{
   if(currentAttachment)window.open(currentAttachment.arquivo_url,'_blank','noopener');
 };
 $('btnCmtReplace').onclick=commanderReplaceSignedFile;
 $('btnOpenEspelho').onclick=()=>{if(espelhoAttachment)window.open(espelhoAttachment.arquivo_url,'_blank','noopener')};
 $('btnDownloadEspelho').onclick=()=>{if(espelhoAttachment){const a=document.createElement('a');a.href=espelhoAttachment.arquivo_url;a.download=espelhoAttachment.arquivo_nome;a.target='_blank';a.click()}};
 $('btnOpenTrem').onclick=()=>{if(tremAttachment)window.open(tremAttachment.arquivo_url,'_blank','noopener')};
 $('btnDownloadTrem').onclick=()=>{if(tremAttachment){const a=document.createElement('a');a.href=tremAttachment.arquivo_url;a.download=tremAttachment.arquivo_nome;a.target='_blank';a.click()}};
 $('btnUploadEspelho').onclick=()=>uploadFiscalGuideDoc('espelho');
 $('btnUploadTrem').onclick=()=>uploadFiscalGuideDoc('trem');
 $('btnGuideComplete').onclick=completeGuideStage;
 $('btnReturnFiscal').onclick=()=>fiscalAction('devolver');
 $('btnApproveFiscal').onclick=()=>fiscalAction('aprovar');
 $('btnResend').onclick=resend;
 $('btnSaveFlow').onclick=saveFlow;
 $('btnAddUpdate').onclick=addUpdate;
}
async function start(){
 try{
   if(!await initUser())return;
   bind();await loadGuideDepositos();syncGuideDepositField();await loadUsers();await loadGuides();
 }catch(err){console.error(err);$('guiaList').innerHTML=`<div class="orc-empty">Erro ao abrir Orçamentários:<br>${esc(err.message)}</div>`}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();