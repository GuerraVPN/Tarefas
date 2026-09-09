(function(){
'use strict';
if(window.__TAREFAS_MATERIAL_CARGA_V782__)return;
window.__TAREFAS_MATERIAL_CARGA_V782__=true;

const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const dt=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
const dateBR=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-';

let user=null,isFiscal=false,bound=false,started=false;
let tipo='dependencia',refs=[],docs=[],detentores=[],users=new Map(),profiles=new Map(),selectedRef=null,currentDoc=null;

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function safeName(v){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_')}
function toast(msg){const e=$('orcToast');if(!e)return;e.textContent=msg;e.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>e.classList.remove('show'),2500)}
function uname(id){const u=users.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):id?`Usuário ${id}`:'Não definido'}
function timeout(promise,ms,label){return Promise.race([Promise.resolve(promise),new Promise((_,rej)=>setTimeout(()=>rej(new Error(`${label} demorou mais de ${Math.round(ms/1000)}s.`)),ms))])}
function showLoading(text='Carregando Material Carga / Depósitos...'){const list=$('cargaRefList');if(list)list.innerHTML=`<div class="orc-empty">${esc(text)}</div>`}
function showError(err){const msg=err?.message||String(err||'Falha desconhecida');const list=$('cargaRefList');if(list)list.innerHTML=`<div class="orc-empty">Erro ao carregar Material Carga:<br>${esc(msg)}<br><button type="button" class="orc-btn" id="btnCargaRetry" style="margin-top:9px">Tentar novamente</button></div>`;const b=$('btnCargaRetry');if(b)b.onclick=()=>reloadEssential()}

async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 user=base;
 if(window.Perfis26){try{const p=await timeout(Perfis26.carregar(supabaseClient,base),4000,'Carregamento do perfil');user=p?.usuario||base}catch(_){user=base}}
 isFiscal=norm(user?.secao)==='fiscalizacao'&&['chefe','auxiliar'].includes(norm(user?.posicao));
 return true;
}
async function loadRefs(){
 const table=tipo==='dependencia'?'orc_dependencias':'orc_depositos';
 const r=await timeout(supabaseClient.from(table).select('nome').eq('ativo',true).order('ordem'),8000,'Consulta de dependências/depósitos');
 if(r.error)throw r.error;refs=(r.data||[]).map(x=>x.nome);
}
async function loadDocs(){
 const r=await timeout(supabaseClient.from('orc_documentos_carga').select('*').eq('tipo_referencia',tipo).order('referencia').order('versao',{ascending:false}),8000,'Consulta de documentos');
 if(r.error)throw r.error;docs=r.data||[];
}
async function loadDetentores(){
 const queries=[
  timeout(supabaseClient.from('orc_detentores_carga').select('*').order('dependencia'),6000,'Detentores'),
  timeout(supabaseClient.from('usuarios').select('id,patente,nome_guerra'),6000,'Usuários'),
  timeout(supabaseClient.from('usuario_perfis').select('id,secao,posicao'),6000,'Perfis')
 ];
 const [d,u,p]=await Promise.allSettled(queries);
 detentores=d.status==='fulfilled'&&!d.value.error?(d.value.data||[]):[];
 users=new Map((u.status==='fulfilled'&&!u.value.error?(u.value.data||[]):[]).map(x=>[String(x.id),x]));
 profiles=new Map((p.status==='fulfilled'&&!p.value.error?(p.value.data||[]):[]).map(x=>[String(x.id),x]));
 if($('cargaRefList'))renderList();
 if(selectedRef&&$('cargaDetail')&&!$('cargaDetail').hidden)renderDetail();
}
function latest(ref){return docs.find(x=>x.referencia===ref)||null}
function detentor(ref){return detentores.find(x=>x.dependencia===ref)||null}
function renderList(){
 if(!$('cargaRefList'))return;
 if($('cargaListTitle'))$('cargaListTitle').textContent=tipo==='dependencia'?'Dependências':'Depósitos';
 if($('cargaListInfo'))$('cargaListInfo').textContent=`${refs.length} registro(s)`;
 $('cargaRefList').innerHTML=refs.map(r=>{
   const d=latest(r),h=tipo==='dependencia'?detentor(r):null;
   return `<article class="pedido-card ${selectedRef===r?'active':''}" data-carga-ref="${esc(r)}">
     <div class="pedido-card-top"><strong>${esc(r)}</strong><span class="pedido-status ${d?'ok':'wait'}">${d?'v'+d.versao:'Sem documento'}</span></div>
     <p>${d?`Atualizado em ${dt(d.criado_em)}`:'Aguardando primeiro documento.'}${h?`<br>Detentor: ${esc(uname(h.usuario_id))}`:''}</p>
   </article>`;
 }).join('')||'<div class="orc-empty">Nenhum registro.</div>';
}
function versions(ref){return docs.filter(x=>x.referencia===ref)}
function selectRef(ref){selectedRef=ref;currentDoc=latest(ref);renderList();renderDetail()}
function renderDetail(){
 if(!$('cargaDetail')||!$('cargaDetailEmpty'))return;
 $('cargaDetailEmpty').hidden=true;$('cargaDetail').hidden=false;
 if($('cargaTitle'))$('cargaTitle').textContent=selectedRef||'-';
 if($('cargaSubtitle'))$('cargaSubtitle').textContent=tipo==='dependencia'?'Material Carga da dependência':'Documento do depósito';
 if($('cargaVersionBadge')){$('cargaVersionBadge').textContent=currentDoc?`Versão ${currentDoc.versao}`:'Sem documento';$('cargaVersionBadge').className=`pedido-status ${currentDoc?'ok':'wait'}`}
 if($('cargaFileInfo'))$('cargaFileInfo').textContent=currentDoc?`${currentDoc.arquivo_nome}${currentDoc.observacao?' · '+currentDoc.observacao:''}`:'Nenhum documento cadastrado.';
 if($('cargaFileDate'))$('cargaFileDate').textContent=currentDoc?dt(currentDoc.criado_em):'';
 if($('btnCargaOpen'))$('btnCargaOpen').disabled=!currentDoc;if($('btnCargaDownload'))$('btnCargaDownload').disabled=!currentDoc;
 if($('cargaFiscalUpdate'))$('cargaFiscalUpdate').hidden=!isFiscal;
 const h=tipo==='dependencia'?detentor(selectedRef):null;
 if($('cargaDetentorPanel'))$('cargaDetentorPanel').hidden=tipo!=='dependencia';
 if(tipo==='dependencia'){
   if($('cargaDetentorNome'))$('cargaDetentorNome').textContent=h?uname(h.usuario_id):'Não definido';
   const pf=h?.perfil_id?profiles.get(String(h.perfil_id)):null;
   if($('cargaDetentorPerfil'))$('cargaDetentorPerfil').textContent=pf?[pf.secao,pf.posicao].filter(Boolean).join(' — '):'';
   if($('cargaDetentorDesde'))$('cargaDetentorDesde').textContent=h?.desde?`Desde ${dateBR(h.desde)}`:'Sem detentor cadastrado';
 }
 const vs=versions(selectedRef);
 if($('cargaHistoryCount'))$('cargaHistoryCount').textContent=`${vs.length} versão(ões)`;
 if($('cargaHistoryList'))$('cargaHistoryList').innerHTML=vs.length?vs.map(d=>`<div class="pedido-hitem"><strong>Versão ${d.versao} · ${esc(d.arquivo_nome)}</strong>${d.observacao?`<p>${esc(d.observacao)}</p>`:''}<small>${dt(d.criado_em)}</small></div>`).join(''):'<div class="orc-empty">Sem versões anteriores.</div>';
}
async function upload(){
 if(!selectedRef||!isFiscal)return;
 const file=$('cargaNewFile')?.files?.[0];if(!file)return alert('Selecione o documento atualizado.');
 if(file.size>30*1024*1024)return alert('O arquivo ultrapassa 30 MB.');
 const path=`${tipo}/${safeName(selectedRef)}/${Date.now()}_${safeName(file.name)}`;let uploaded=false;
 try{
   const up=await timeout(supabaseClient.storage.from('material-carga-depositos').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined}),15000,'Envio do documento');
   if(up.error)throw up.error;uploaded=true;
   const pub=supabaseClient.storage.from('material-carga-depositos').getPublicUrl(path);
   const r=await timeout(supabaseClient.rpc('v5_5_registrar_documento_carga',{p_tipo_referencia:tipo,p_referencia:selectedRef,p_arquivo_nome:file.name,p_arquivo_path:path,p_arquivo_url:pub.data.publicUrl,p_arquivo_mime:file.type||null,p_arquivo_tamanho:file.size,p_usuario_id:String(user.id),p_perfil_id:profileId(),p_observacao:$('cargaNote')?.value.trim()||null}),12000,'Registro do documento');
   if(r.error)throw r.error;
   if($('cargaNewFile'))$('cargaNewFile').value='';if($('cargaNote'))$('cargaNote').value='';toast('Documento atualizado pela Fiscalização.');
   await loadDocs();currentDoc=latest(selectedRef);renderList();renderDetail();
 }catch(err){
   if(uploaded)try{await supabaseClient.storage.from('material-carga-depositos').remove([path])}catch(_){}
   alert('Erro ao atualizar documento: '+(err?.message||err));
 }
}
function switchToCarga(){
 document.querySelectorAll('[data-orc-module]').forEach(b=>b.classList.toggle('active',b.dataset.orcModule==='material_carga'));
 ['reportModule','guiasModule','pedidosModule','movimentacaoModule','passagemCargaModule','lavanderiaModule'].forEach(id=>{const e=$(id);if(e)e.hidden=true});
 if($('materialCargaModule'))$('materialCargaModule').hidden=false;
 if($('orcPageTitle'))$('orcPageTitle').textContent='Orçamentários · Material Carga / Depósito';
 if($('orcPageSubtitle'))$('orcPageSubtitle').textContent='Detentor atual, consulta para todos e atualização de documentos somente pela Fiscalização.';
 renderList();
}
async function reloadEssential(){
 showLoading();
 try{await Promise.all([loadRefs(),loadDocs()]);renderList();if(selectedRef){currentDoc=latest(selectedRef);renderDetail()}}catch(e){showError(e)}
}
async function changeType(t){
 tipo=t;selectedRef=null;currentDoc=null;
 document.querySelectorAll('[data-carga-tipo]').forEach(b=>b.classList.toggle('active',b.dataset.cargaTipo===tipo));
 if($('cargaDetail'))$('cargaDetail').hidden=true;if($('cargaDetailEmpty'))$('cargaDetailEmpty').hidden=false;
 await reloadEssential();
}
function bind(){
 if(bound)return;bound=true;
 $('orcModuleNav')?.addEventListener('click',e=>{const b=e.target.closest('[data-orc-module="material_carga"]');if(b)switchToCarga()});
 if($('cargaTabs'))$('cargaTabs').onclick=e=>{const b=e.target.closest('[data-carga-tipo]');if(b)changeType(b.dataset.cargaTipo)};
 if($('cargaRefList'))$('cargaRefList').onclick=e=>{const c=e.target.closest('[data-carga-ref]');if(c)selectRef(c.dataset.cargaRef)};
 if($('btnCargaOpen'))$('btnCargaOpen').onclick=()=>{if(currentDoc)window.open(currentDoc.arquivo_url,'_blank','noopener')};
 if($('btnCargaDownload'))$('btnCargaDownload').onclick=()=>{if(currentDoc){const a=document.createElement('a');a.href=currentDoc.arquivo_url;a.download=currentDoc.arquivo_nome;a.target='_blank';a.click()}};
 if($('btnCargaUpdate'))$('btnCargaUpdate').onclick=upload;
 if($('btnIrPassagem'))$('btnIrPassagem').onclick=()=>{location.href=`orcamentarios.html?modulo=passagem_carga${selectedRef?'&dependencia='+encodeURIComponent(selectedRef):''}`};
}
async function start(){
 if(started)return;started=true;
 try{
  if(!await initUser()){started=false;return}
  bind();
  const active=new URLSearchParams(location.search).get('modulo')==='material_carga';
  if(active){switchToCarga();showLoading()}
  await Promise.all([loadRefs(),loadDocs()]);
  if(active)switchToCarga();else renderList();
  loadDetentores().catch(()=>{});
 }catch(e){showError(e)}
}
window.MaterialCarga782={start,reload:reloadEssential,activate:switchToCarga};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();