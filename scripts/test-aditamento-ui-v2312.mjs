import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { jsPDF } from 'jspdf';

let src=await readFile(path.resolve(process.argv[2]||'dist/aditamento_v74.js'),'utf8');
// Para isolar o clique/bind do restante da UI dinâmica, fixa um dia válido no teste.
src=src.replace(/function selectedDays\(\)\{[\s\S]*?\n\}/,`function selectedDays(){return [{date:'2026-09-05',includeStandby:false}]}`);
src=src.replace(/function updateLabels\(\)\{[^\n]*\}/,`function updateLabels(){}`);

const listeners=new Map(),saved=[];
const makeButton=id=>({id,dataset:{},disabled:false,textContent:'',style:{},addEventListener(type,fn){listeners.set(id+':'+type,fn)}});
const open=makeButton('generateAddendum'),add=makeButton('aditamentoAddDia'),go=makeButton('aditamentoGerar'),cancel=makeButton('aditamentoCancelar'),close=makeButton('aditamentoClose');
const status={textContent:'',style:{}};
const modal={classList:{toggle(){}},addEventListener(type,fn){listeners.set('aditamentoModal:'+type,fn)}};
const ids={generateAddendum:open,aditamentoAddDia:add,aditamentoGerar:go,aditamentoCancelar:cancel,aditamentoClose:close,aditamentoModal:modal,aditamentoStatus:status};
let format='pdf';
function query(){const q={select(){return q},in(){return q},order(){return q},gte(){return q},lte(){return q},eq(){return q},then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}};return q}
const generic=()=>({style:{},dataset:{},classList:{toggle(){},add(){},remove(){}},appendChild(){},remove(){},addEventListener(){},querySelector(){return null},querySelectorAll(){return[]}});
const document={
  readyState:'complete',body:generic(),head:generic(),
  getElementById:id=>ids[id]||null,
  querySelector(sel){if(sel==='input[name="aditamentoFormato"]:checked')return{value:format};return null},
  querySelectorAll(){return[]},createElement(){return generic()},addEventListener(){}
};
const sandbox={console,document,TextEncoder,Uint8Array,Uint32Array,Blob,Map,Set,Date,URL,setTimeout,clearTimeout,
  fetch:async()=>({ok:false}),alert:m=>{throw new Error('alert inesperado: '+m)},supabaseClient:{from(){return query()}},jspdf:{jsPDF},
  TarefasNative:{isNative:true,files:{saveBlob:async(blob,filename)=>{saved.push({blob,filename});return{ok:true,saved:true,path:'Downloads/TAREFAS/'+filename}}}}
};
sandbox.window=sandbox;
vm.createContext(sandbox);vm.runInContext(src,sandbox,{filename:'aditamento_v74.js'});
const handler=listeners.get('aditamentoGerar:click');
if(typeof handler!=='function')throw new Error('Botão aditamentoGerar não recebeu handler de click.');
format='pdf';await handler({preventDefault(){}});
format='odt';await handler({preventDefault(){}});
if(saved.length!==2)throw new Error(`Clique deveria salvar 2 arquivos; salvou ${saved.length}.`);
if(!saved.some(x=>x.filename.endsWith('.pdf')))throw new Error('Clique em PDF não salvou PDF.');
if(!saved.some(x=>x.filename.endsWith('.odt')))throw new Error('Clique em ODT não salvou ODT.');
console.log('OK: clique real do botão do Aditamento aciona PDF e ODT e chega ao bridge nativo.');
