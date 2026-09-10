(function(){
'use strict';
if(window.__TAREFAS_V785_MATERIAL_UPLOAD__)return;
window.__TAREFAS_V785_MATERIAL_UPLOAD__=true;
const $=id=>document.getElementById(id);
const safe=v=>String(v??'arquivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_');
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function user(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function tipo(){return document.querySelector('[data-carga-tipo].active')?.dataset.cargaTipo||'dependencia'}
function referencia(){const v=$('cargaTitle')?.textContent?.trim();return v&&v!=='-'?v:null}
let busy=false;
async function onClick(e){
 const btn=e.target.closest('#btnCargaUpdate');if(!btn)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(busy)return;
 const c=client(),u=user(),ref=referencia(),t=tipo(),file=$('cargaNewFile')?.files?.[0];
 const sel=$('cargaConferidoPor');
 if(!c)return alert('Banco de dados indisponível.');
 if(!u?.id)return alert('Sessão do usuário não encontrada. Entre novamente no TAREFAS.');
 if(!ref)return alert('Selecione a dependência ou depósito.');
 if(!file)return alert('Selecione o documento atualizado.');
 if(file.size>30*1024*1024)return alert('O arquivo ultrapassa 30 MB.');
 if(!sel)return alert('O campo “Quem conferiu” ainda não carregou. Atualize a página e tente novamente.');
 const checker=sel.value;
 if(!checker)return alert('Selecione quem conferiu a relação.');
 const path=`${t}/${safe(ref)}/${Date.now()}_${safe(file.name)}`;
 let uploaded=false;busy=true;btn.disabled=true;
 try{
  const pend=await c.from('orc_carga_pendencias').select('id').eq('tipo_referencia',t).eq('referencia',ref).eq('status','pendente').limit(1);
  const motivo=!pend.error&&pend.data?.length?'pos_processo':'periodica';
  const up=await c.storage.from('material-carga-depositos').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});
  if(up.error)throw up.error;uploaded=true;
  const pub=c.storage.from('material-carga-depositos').getPublicUrl(path);
  const r=await c.rpc('v7_7_0_registrar_documento_carga',{
   p_tipo_referencia:t,p_referencia:ref,p_arquivo_nome:file.name,p_arquivo_path:path,
   p_arquivo_url:pub.data.publicUrl,p_arquivo_mime:file.type||null,p_arquivo_tamanho:file.size,
   p_usuario_id:String(u.id),p_perfil_id:u.perfil_id?Number(u.perfil_id):null,
   p_conferido_por:String(checker),p_observacao:$('cargaNote')?.value?.trim()||null,
   p_motivo_atualizacao:motivo
  });
  if(r.error)throw r.error;
  $('cargaNewFile').value='';if($('cargaNote'))$('cargaNote').value='';
  alert('Documento atualizado e conferência registrada com sucesso.');
  if(window.MaterialCarga783?.reload)await window.MaterialCarga783.reload();else location.reload();
 }catch(err){
  if(uploaded)try{await c.storage.from('material-carga-depositos').remove([path])}catch(_){}
  alert('Erro ao atualizar documento: '+(err?.message||err));
 }finally{busy=false;btn.disabled=false}
}
document.addEventListener('click',onClick,true);
})();