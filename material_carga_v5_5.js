(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const dt=v=>v?new Date(v).toLocaleString('pt-BR'):'-';

let user=null,isFiscal=false;
let tipo='dependencia',refs=[],docs=[],selectedRef=null,currentDoc=null;

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function safeName(v){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_')}
function toast(msg){const e=$('orcToast');if(!e)return;e.textContent=msg;e.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>e.classList.remove('show'),2500)}
async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);user=p.usuario}catch(_){user=base}}else user=base;
 isFiscal=norm(user.secao)==='fiscalizacao'&&['chefe','auxiliar'].includes(norm(user.posicao));
 return true;
}
async function loadRefs(){
 const table=tipo==='dependencia'?'orc_dependencias':'orc_depositos';
 const r=await supabaseClient.from(table).select('nome').eq('ativo',true).order('ordem');
 if(r.error)throw r.error;refs=(r.data||[]).map(x=>x.nome);
}
async function loadDocs(){
 const r=await supabaseClient.from('orc_documentos_carga').select('*').eq('tipo_referencia',tipo).order('referencia').order('versao',{ascending:false});
 if(r.error)throw r.error;docs=r.data||[];
}
function latest(ref){return docs.find(x=>x.referencia===ref)||null}
function renderList(){
 $('cargaListTitle').textContent=tipo==='dependencia'?'Dependências':'Depósitos';
 $('cargaListInfo').textContent=`${refs.length} registro(s)`;
 $('cargaRefList').innerHTML=refs.map(r=>{
   const d=latest(r);
   return `<article class="pedido-card ${selectedRef===r?'active':''}" data-carga-ref="${esc(r)}">
     <div class="pedido-card-top"><strong>${esc(r)}</strong><span class="pedido-status ${d?'ok':'wait'}">${d?'v'+d.versao:'Sem documento'}</span></div>
     <p>${d?`Atualizado em ${dt(d.criado_em)}`:'Aguardando primeiro documento.'}</p>
   </article>`;
 }).join('')||'<div class="orc-empty">Nenhum registro.</div>';
}
function versions(ref){return docs.filter(x=>x.referencia===ref)}
function selectRef(ref){
 selectedRef=ref;currentDoc=latest(ref);renderList();renderDetail();
}
function renderDetail(){
 $('cargaDetailEmpty').hidden=true;$('cargaDetail').hidden=false;
 $('cargaTitle').textContent=selectedRef;
 $('cargaSubtitle').textContent=tipo==='dependencia'?'Material Carga da dependência':'Documento do depósito';
 $('cargaVersionBadge').textContent=currentDoc?`Versão ${currentDoc.versao}`:'Sem documento';
 $('cargaVersionBadge').className=`pedido-status ${currentDoc?'ok':'wait'}`;
 $('cargaFileInfo').textContent=currentDoc?`${currentDoc.arquivo_nome}${currentDoc.observacao?' · '+currentDoc.observacao:''}`:'Nenhum documento cadastrado.';
 $('cargaFileDate').textContent=currentDoc?dt(currentDoc.criado_em):'';
 $('btnCargaOpen').disabled=!currentDoc;$('btnCargaDownload').disabled=!currentDoc;
 $('cargaFiscalUpdate').hidden=!isFiscal;
 const vs=versions(selectedRef);
 $('cargaHistoryCount').textContent=`${vs.length} versão(ões)`;
 $('cargaHistoryList').innerHTML=vs.length?vs.map(d=>`<div class="pedido-hitem">
   <strong>Versão ${d.versao} · ${esc(d.arquivo_nome)}</strong>
   ${d.observacao?`<p>${esc(d.observacao)}</p>`:''}
   <small>${dt(d.criado_em)}</small>
 </div>`).join(''):'<div class="orc-empty">Sem versões anteriores.</div>';
}
async function upload(){
 if(!selectedRef||!isFiscal)return;
 const file=$('cargaNewFile').files[0];if(!file)return alert('Selecione o documento atualizado.');
 if(file.size>30*1024*1024)return alert('O arquivo ultrapassa 30 MB.');
 const path=`${tipo}/${safeName(selectedRef)}/${Date.now()}_${safeName(file.name)}`;
 let uploaded=false;
 try{
   const up=await supabaseClient.storage.from('material-carga-depositos').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});
   if(up.error)throw up.error;uploaded=true;
   const pub=supabaseClient.storage.from('material-carga-depositos').getPublicUrl(path);
   const r=await supabaseClient.rpc('v5_5_registrar_documento_carga',{
     p_tipo_referencia:tipo,p_referencia:selectedRef,p_arquivo_nome:file.name,
     p_arquivo_path:path,p_arquivo_url:pub.data.publicUrl,p_arquivo_mime:file.type||null,
     p_arquivo_tamanho:file.size,p_usuario_id:String(user.id),p_perfil_id:profileId(),
     p_observacao:$('cargaNote').value.trim()||null
   });
   if(r.error)throw r.error;
   $('cargaNewFile').value='';$('cargaNote').value='';toast('Documento atualizado pela Fiscalização.');
   await loadDocs();currentDoc=latest(selectedRef);renderList();renderDetail();
 }catch(err){
   if(uploaded)try{await supabaseClient.storage.from('material-carga-depositos').remove([path])}catch(_){}
   alert('Erro ao atualizar documento: '+err.message);
 }
}
function switchToCarga(){
 document.querySelectorAll('[data-orc-module]').forEach(b=>b.classList.toggle('active',b.dataset.orcModule==='material_carga'));
 if($('reportModule'))$('reportModule').hidden=true;
 $('guiasModule').hidden=true;$('pedidosModule').hidden=true;$('movimentacaoModule').hidden=true;$('materialCargaModule').hidden=false;
 $('orcPageTitle').textContent='Orçamentários · Material Carga / Depósito';
 $('orcPageSubtitle').textContent='Consulta para todos; atualização dos documentos somente pela Fiscalização.';
 renderList();
}
async function changeType(t){
 tipo=t;selectedRef=null;currentDoc=null;
 document.querySelectorAll('[data-carga-tipo]').forEach(b=>b.classList.toggle('active',b.dataset.cargaTipo===tipo));
 $('cargaDetail').hidden=true;$('cargaDetailEmpty').hidden=false;
 await Promise.all([loadRefs(),loadDocs()]);renderList();
}
function bind(){
 $('orcModuleNav').addEventListener('click',e=>{const b=e.target.closest('[data-orc-module="material_carga"]');if(b)switchToCarga()});
 $('cargaTabs').onclick=e=>{const b=e.target.closest('[data-carga-tipo]');if(b)changeType(b.dataset.cargaTipo)};
 $('cargaRefList').onclick=e=>{const c=e.target.closest('[data-carga-ref]');if(c)selectRef(c.dataset.cargaRef)};
 $('btnCargaOpen').onclick=()=>{if(currentDoc)window.open(currentDoc.arquivo_url,'_blank','noopener')};
 $('btnCargaDownload').onclick=()=>{if(currentDoc){const a=document.createElement('a');a.href=currentDoc.arquivo_url;a.download=currentDoc.arquivo_nome;a.target='_blank';a.click()}};
 $('btnCargaUpdate').onclick=upload;
}
async function start(){
 if(!await initUser())return;bind();await Promise.all([loadRefs(),loadDocs()]);
 const p=new URLSearchParams(location.search);
 if(p.get('modulo')==='material_carga')switchToCarga();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();