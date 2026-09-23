import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';

const src=await readFile(path.resolve(process.argv[2]||'dist/v7_7_0_material_carga.js'),'utf8');
for(const marker of ['__TAREFAS_MATERIAL_CARGA_EVENT_DRIVEN_V242__','__TAREFAS_MATERIAL_CARGA_SERIAL_V243__','async function waitBase()'])if(!src.includes(marker))throw new Error('Patch 243 ausente: '+marker);
const calls=[];
function query(table){
  const state={table,select:null,filters:[],orders:[]};calls.push(state);
  const q={select(v){state.select=v;return q},eq(k,v){state.filters.push([k,v]);return q},order(k,o){state.orders.push([k,o]);return q},then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}};
  return q;
}
const generic=()=>({dataset:{},style:{},hidden:false,parentNode:{insertBefore(){}},classList:{contains(){return false},add(){},remove(){},toggle(){}},appendChild(){},prepend(){},insertBefore(){},addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},set textContent(v){this._text=v},get textContent(){return this._text||''},innerHTML:''});
const ids={materialCargaModule:generic()};
const domReady=[];
const sandbox={
  console,Date,Map,Set,Promise,URL,CSS:{escape:v=>String(v)},
  __TAREFAS_MATERIAL_CARGA_BASE_READY__:true,
  location:{pathname:'/orcamentarios.html',href:'orcamentarios.html?modulo=material_carga',reload(){}},
  localStorage:{getItem:k=>k==='usuarioLogado'?JSON.stringify({id:3,perfil_id:1,secao:'Fiscalização',posicao:'Chefe'}):null},
  sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
  supabaseClient:{from:query},Perfis26:null,alert(){},confirm(){return false},
  setTimeout(fn){if(typeof fn==='function')queueMicrotask(fn);return 1},clearTimeout(){},queueMicrotask,
  setInterval(){throw new Error('setInterval não pode ser usado no Material Carga 2.3.13')},
  MutationObserver:class{constructor(){throw new Error('MutationObserver não pode ser criado no Material Carga 2.3.13')}},
  document:{readyState:'loading',hidden:false,documentElement:{dataset:{}},head:generic(),getElementById:id=>ids[id]||null,createElement(){return generic()},querySelector(sel){if(sel==='[data-carga-tipo].active')return{dataset:{cargaTipo:'dependencia'}};return null},querySelectorAll(){return[]},addEventListener(name,fn){if(name==='DOMContentLoaded')domReady.push(fn)}}
};
sandbox.window=sandbox;
vm.createContext(sandbox);vm.runInContext(src,sandbox,{filename:'v7_7_0_material_carga.js'});
if(domReady.length!==1)throw new Error('start do complemento Material Carga não foi registrado.');
await domReady[0]();
const docs=calls.find(c=>c.table==='orc_documentos_carga');
const pend=calls.find(c=>c.table==='orc_carga_pendencias');
const users=calls.find(c=>c.table==='usuarios');
if(!docs||!pend||!users)throw new Error('Consultas essenciais do complemento não foram executadas.');
if(!docs.filters.some(([k,v])=>k==='tipo_referencia'&&v==='dependencia'))throw new Error('Documentos não filtrados por tipo.');
if(!pend.filters.some(([k,v])=>k==='status'&&v==='pendente'))throw new Error('Pendências não filtradas por status.');
if(docs.select==='*'||pend.select==='*')throw new Error('Complemento ainda usa select * nas consultas principais.');
console.log('OK: Material Carga 2.3.13 aguardou a base, iniciou sem loop e executou consultas filtradas.');