(()=>{
'use strict';
if(window.__TAREFAS_BLOB_SAVE_PICKER_V243__)return;
window.__TAREFAS_BLOB_SAVE_PICKER_V243__=true;

function isBlobDownload(a){
  return !!(a&&a.hasAttribute&&a.hasAttribute('download')&&String(a.href||'').startsWith('blob:'));
}
async function saveBlobAnchor(a){
  const href=String(a.href||'');
  const name=String(a.download||'arquivo').trim()||'arquivo';
  const response=await fetch(href);
  if(!response.ok)throw new Error(`Falha ao ler o arquivo gerado (${response.status}).`);
  const blob=await response.blob();
  const saver=window.TarefasNative?.files?.saveBlob;
  if(typeof saver!=='function')throw new Error('Seletor nativo de arquivos indisponível.');
  return saver(blob,name);
}

const previousClick=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){
  if(isBlobDownload(this)){
    saveBlobAnchor(this).catch(err=>{
      console.error('[TAREFAS 243] Falha no Salvar como de blob:',err);
      try{previousClick.call(this)}catch(_){}
    });
    return;
  }
  return previousClick.call(this);
};
})();
