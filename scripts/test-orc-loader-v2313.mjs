import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';

const src=await readFile(path.resolve(process.argv[2]||'dist/orcamentarios-loader-v243.js'),'utf8');
if(!src.includes('__TAREFAS_ORC_LOADER_V243__'))throw new Error('Loader 243 ausente.');

async function run(search){
 const appended=[],scripts=[];
 const ids=['reportModule','guiasModule','pedidosModule','movimentacaoModule','materialCargaModule','passagemCargaModule','lavanderiaModule'];
 const nodes=Object.fromEntries(ids.map(id=>[id,{id,hidden:false}]));
 nodes.orcPageTitle={textContent:''};nodes.orcPageSubtitle={textContent:''};
 const buttons=['guias','baixas','distribuicao','movimentacao','material_carga','passagem_carga'].map(mod=>({dataset:{orcModule:mod},classList:{toggle(){}}}));
 const document={
   documentElement:{dataset:{}},scripts,
   getElementById:id=>nodes[id]||null,
   querySelectorAll(sel){return sel==='[data-orc-module]'?buttons:[]},
   createElement(tag){if(tag!=='script')return{};return{src:'',async:true,dataset:{},onload:null,onerror:null}},
   body:{appendChild(el){appended.push(el);scripts.push(el);queueMicrotask(()=>el.onload?.())}}
 };
 const sandbox={console,document,URL,URLSearchParams,queueMicrotask,location:{pathname:'/orcamentarios.html',search},setTimeout,clearTimeout};sandbox.window=sandbox;
 vm.createContext(sandbox);vm.runInContext(src,sandbox,{filename:'orcamentarios-loader-v243.js'});
 await new Promise(r=>setTimeout(r,0));
 return{appended,nodes,dataset:document.documentElement.dataset,active:sandbox.__TAREFAS_ORC_ACTIVE_MODULE__};
}

const mat=await run('?modulo=material_carga');
const matFiles=mat.appended.map(x=>new URL(x.src,'https://app.local/').pathname.split('/').pop());
if(mat.active!=='material_carga')throw new Error('Material Carga não foi definido como módulo ativo.');
if(JSON.stringify(matFiles)!==JSON.stringify(['material_carga_v6.js','v7_7_0_material_carga.js']))throw new Error('Material Carga carregou scripts errados: '+matFiles.join(','));
if(mat.nodes.materialCargaModule.hidden)throw new Error('Material Carga ficou oculto.');
for(const id of ['reportModule','guiasModule','pedidosModule','movimentacaoModule','passagemCargaModule','lavanderiaModule'])if(!mat.nodes[id].hidden)throw new Error(id+' deveria estar oculto no Material Carga.');

const rel=await run('');
const relFiles=rel.appended.map(x=>new URL(x.src,'https://app.local/').pathname.split('/').pop());
if(rel.active!=='relatorio')throw new Error('Relatório não foi definido como padrão.');
if(JSON.stringify(relFiles)!==JSON.stringify(['orcamentarios_relatorio_light.js']))throw new Error('Relatório carregou mais de um script: '+relFiles.join(','));
if(rel.nodes.reportModule.hidden)throw new Error('Relatório ficou oculto.');

const guias=await run('?modulo=guias');
const guiaFiles=guias.appended.map(x=>new URL(x.src,'https://app.local/').pathname.split('/').pop());
if(JSON.stringify(guiaFiles)!==JSON.stringify(['guias_v6.js']))throw new Error('Guias carregou scripts errados: '+guiaFiles.join(','));
if(guias.nodes.guiasModule.hidden)throw new Error('Guias ficou oculto.');

console.log('OK: loader 243 carrega somente o módulo ativo — Relatório 1 script, Guias 1 script, Material Carga 2 scripts.');