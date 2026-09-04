import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const src=await readFile(path.resolve(process.argv[2]||'dist/mobile-blob-save-v243.js'),'utf8');
const listeners=new Map(),saved=[];
class Element{
  constructor(){this.parentElement=null}
  closest(sel){return sel==='a[download]'&&this instanceof HTMLAnchorElement&&this.hasAttribute('download')?this:null}
}
class HTMLAnchorElement extends Element{
  constructor(){super();this.href='';this.download=''}
  hasAttribute(name){return name==='download'&&this.download!==undefined}
  click(){this._nativeClicked=true}
}
const document={addEventListener(type,fn,capture){listeners.set(type+':'+String(!!capture),fn)}};
const sandbox={console,document,Element,HTMLAnchorElement,Blob,URL,setTimeout,clearTimeout,
  fetch:async href=>({ok:String(href).startsWith('blob:'),status:200,blob:async()=>new Blob(['pdf-data'],{type:'application/pdf'})}),
  TarefasNative:{files:{saveBlob:async(blob,filename)=>{saved.push({blob,filename});return{ok:true,saved:true,path:'content://picker/'+filename}}}}
};
sandbox.window=sandbox;
vm.createContext(sandbox);vm.runInContext(src,sandbox,{filename:'mobile-blob-save-v243.js'});

const a1=new HTMLAnchorElement();a1.href='blob:pdf-1';a1.download='Aditamento.pdf';
a1.click();
await sandbox.__TAREFAS_LAST_BLOB_SAVE_PROMISE__;
if(saved.length!==1||saved[0].filename!=='Aditamento.pdf')throw new Error('anchor.click() blob não chegou ao Salvar como.');

const a2=new HTMLAnchorElement();a2.href='blob:pdf-2';a2.download='Outro.pdf';
let prevented=false,stopped=false;
const handler=listeners.get('click:true');if(typeof handler!=='function')throw new Error('Listener capture de blob não foi registrado.');
handler({target:a2,preventDefault(){prevented=true},stopImmediatePropagation(){stopped=true}});
await sandbox.__TAREFAS_LAST_BLOB_SAVE_PROMISE__;
if(!prevented||!stopped)throw new Error('Evento blob não foi bloqueado antes do downloader antigo.');
if(saved.length!==2||saved[1].filename!=='Outro.pdf')throw new Error('MouseEvent blob do FileSaver não chegou ao Salvar como.');
console.log('OK: downloads blob: por click() e MouseEvent chegam ao seletor nativo antes do downloader antigo.');
