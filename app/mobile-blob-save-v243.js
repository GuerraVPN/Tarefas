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
function beginSave(a){
  const p=saveBlobAnchor(a);
  window.__TAREFAS_LAST_BLOB_SAVE_PROMISE__=p;
  p.catch(err=>console.error('[TAREFAS 243] Falha no Salvar como de blob:',err));
  return p;
}

// FileSaver/jsPDF pode disparar um MouseEvent em vez de chamar anchor.click().
// Este listener é registrado antes do bridge antigo e assume apenas downloads blob:.
document.addEventListener('click',event=>{
  const a=event.target instanceof Element?event.target.closest('a[download]'):null;
  if(!isBlobDownload(a))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  beginSave(a);
},true);

// Cobre também bibliotecas que usam HTMLAnchorElement.click() diretamente.
const previousClick=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){
  if(isBlobDownload(this)){beginSave(this);return;}
  return previousClick.call(this);
};
})();
