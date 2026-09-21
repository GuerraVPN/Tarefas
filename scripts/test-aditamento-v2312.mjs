import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { jsPDF } from 'jspdf';

const file=path.resolve(process.argv[2]||'dist/aditamento_v74.js');
let src=await readFile(file,'utf8');
if(!src.includes('__ADITAMENTO_NATIVE_SAVE_V242__'))throw new Error('Aditamento 242 sem bridge nativo.');
src=src.replace(/\n\}\)\(\);\s*$/,`\nwindow.__ADIT_TEST_V242__={generatePdf,generateOdt,buildAditamentoOdt};\n})();`);

const saved=[];
const button={disabled:false,textContent:'Gerar PDF',dataset:{},style:{},addEventListener(){}};
const status={textContent:'',style:{},parentElement:null};
const modal={classList:{toggle(){}},querySelector(){return null},querySelectorAll(){return []}};
const dayRow={querySelector(sel){
  if(sel==='[data-aditamento-date]')return{value:'2026-09-05'};
  if(sel==='[data-aditamento-standby]')return{checked:false};
  return null;
}};
const generic=()=>({style:{},dataset:{},classList:{toggle(){},add(){},remove(){}},appendChild(){},remove(){},addEventListener(){},querySelector(){return null},querySelectorAll(){return []},setAttribute(){}});
const byId={aditamentoGerar:button,aditamentoStatus:status,aditamentoModal:modal};
const document={
  readyState:'loading',body:generic(),head:generic(),
  addEventListener(){},getElementById(id){return byId[id]||null},
  querySelectorAll(sel){if(sel==='[data-aditamento-dia]')return[dayRow];return[]},
  querySelector(sel){if(sel==='input[name="aditamentoFormato"]:checked')return{value:'pdf'};return null},
  createElement(){return generic()}
};
function builder(){
  const q={select(){return q},in(){return q},order(){return q},gte(){return q},lte(){return q},eq(){return q},single(){return q},then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}};
  return q;
}
const sandbox={
  console,document,TextEncoder,Uint8Array,Uint32Array,Blob,Map,Set,Date,URL,
  setTimeout,clearTimeout,FileReader:globalThis.FileReader,
  fetch:async()=>({ok:false}),alert:msg=>{throw new Error('alert inesperado: '+msg)},
  supabaseClient:{from(){return builder()}},
  jspdf:{jsPDF},
  TarefasNative:{isNative:true,files:{saveBlob:async(blob,filename)=>{saved.push({blob,filename});return{ok:true,saved:true,path:'Downloads/TAREFAS/'+filename}}}}
};
sandbox.window=sandbox;
vm.createContext(sandbox);
vm.runInContext(src,sandbox,{filename:'aditamento_v74.js'});

await sandbox.__ADIT_TEST_V242__.generatePdf();
await sandbox.__ADIT_TEST_V242__.generateOdt();
if(saved.length!==2)throw new Error(`Esperava 2 arquivos salvos; recebeu ${saved.length}.`);
const pdf=saved.find(x=>x.filename.endsWith('.pdf')),odt=saved.find(x=>x.filename.endsWith('.odt'));
if(!pdf)throw new Error('PDF não chegou ao bridge nativo.');
if(!odt)throw new Error('ODT não chegou ao bridge nativo.');
if(pdf.blob.size<500)throw new Error('PDF gerado vazio/pequeno demais.');
if(odt.blob.size<500)throw new Error('ODT gerado vazio/pequeno demais.');
if(!String(pdf.blob.type).includes('pdf'))throw new Error('MIME do PDF inválido: '+pdf.blob.type);
if(!String(odt.blob.type).includes('opendocument'))throw new Error('MIME do ODT inválido: '+odt.blob.type);
console.log(`OK: execução real do Aditamento 2.3.12 — ${pdf.filename} (${pdf.blob.size} bytes) e ${odt.filename} (${odt.blob.size} bytes).`);
