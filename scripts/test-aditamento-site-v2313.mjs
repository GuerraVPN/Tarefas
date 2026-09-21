import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { jsPDF } from 'jspdf';

const file=path.resolve(process.argv[2]||'dist/aditamento_v74.js');
let src=await readFile(file,'utf8');
if(!src.includes('__ADITAMENTO_SITE_PDF_FLOW_V243__'))throw new Error('Aditamento 243 não está usando o fluxo PDF do site.');
src=src.replace(/\n\}\)\(\);\s*$/,`\nwindow.__ADIT_TEST_V243__={generatePdf,generateOdt};\n})();`);

const sitePdf=[],nativeSaved=[];
jsPDF.API.save=function(filename){const blob=this.output('blob');sitePdf.push({filename,blob});return this};

const button={disabled:false,textContent:'Gerar arquivo',dataset:{},style:{},addEventListener(){}};
const status={textContent:'',style:{},parentElement:null};
const modal={classList:{toggle(){}},querySelector(){return null},querySelectorAll(){return []}};
const dayRow={querySelector(sel){if(sel==='[data-aditamento-date]')return{value:'2026-09-05'};if(sel==='[data-aditamento-standby]')return{checked:false};return null}};
const generic=()=>({style:{},dataset:{},classList:{toggle(){},add(){},remove(){}},appendChild(){},remove(){},addEventListener(){},querySelector(){return null},querySelectorAll(){return []},setAttribute(){}});
const byId={aditamentoGerar:button,aditamentoStatus:status,aditamentoModal:modal};
const document={readyState:'loading',body:generic(),head:generic(),addEventListener(){},getElementById(id){return byId[id]||null},querySelectorAll(sel){if(sel==='[data-aditamento-dia]')return[dayRow];return[]},querySelector(sel){if(sel==='input[name="aditamentoFormato"]:checked')return{value:'pdf'};return null},createElement(){return generic()}};
function builder(){const q={select(){return q},in(){return q},order(){return q},gte(){return q},lte(){return q},eq(){return q},single(){return q},then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}};return q}
const sandbox={console,document,TextEncoder,Uint8Array,Uint32Array,Blob,Map,Set,Date,URL,setTimeout,clearTimeout,FileReader:globalThis.FileReader,fetch:async()=>({ok:false}),alert:msg=>{throw new Error('alert inesperado: '+msg)},supabaseClient:{from(){return builder()}},jspdf:{jsPDF},TarefasNative:{isNative:true,files:{saveBlob:async(blob,filename)=>{nativeSaved.push({blob,filename});return{ok:true,saved:true,path:'content://picker/'+filename}}}}};
sandbox.window=sandbox;
vm.createContext(sandbox);vm.runInContext(src,sandbox,{filename:'aditamento_v74.js'});

await sandbox.__ADIT_TEST_V243__.generatePdf();
await sandbox.__ADIT_TEST_V243__.generateOdt();
if(sitePdf.length!==1)throw new Error(`PDF deveria usar doc.save do site uma vez; usou ${sitePdf.length}.`);
if(!sitePdf[0].filename.endsWith('.pdf'))throw new Error('Fluxo do site não gerou arquivo PDF.');
if(sitePdf[0].blob.size<500)throw new Error('PDF do fluxo do site está vazio/pequeno demais.');
const odt=nativeSaved.find(x=>x.filename.endsWith('.odt'));
if(!odt)throw new Error('ODT não chegou ao seletor nativo.');
if(odt.blob.size<500)throw new Error('ODT está vazio/pequeno demais.');
console.log(`OK: PDF usa o mesmo doc.save do site (${sitePdf[0].blob.size} bytes) e ODT chega ao seletor nativo (${odt.blob.size} bytes).`);
