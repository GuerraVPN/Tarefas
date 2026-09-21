import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';

const src=await readFile(path.resolve(process.argv[2]||'dist/orcamentarios-loader-v243.js'),'utf8');
if(!src.includes('__TAREFAS_ORC_LOADER_V243__'))throw new Error('Loader 243 ausente.');

const moduleIds={relatorio:'reportModule',guias:'guiasModule',baixas:'pedidosModule',distribuicao:'pedidosModule',pedido:'pedidosModule',movimentacao:'movimentacaoModule',material_carga:'materialCargaModule',passagem_carga:'passagemCargaModule',lavanderia:'lavanderiaModule'};
async function run(search){
 const appended=[],scripts=[];
 const ids=[...new Set(Object.values(moduleIds))];
 const nodes=Object.fromEntries(ids.map(id=>[id,{id,hidden:false}]));
 nodes.orcPageTitle={textContent:''};nodes.orcPageSubtitle={textContent:''};
 const buttons=['guias','baixas','distribuicao','movimentacao','material_carga','passagem_carga','lavanderia'].map(mod=>({dataset:{orcModule:mod},classList:{toggle(){}}}));
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
 const files=appended.map(x=>new URL(x.src,'https://app.local/').pathname.split('/').pop());
 return{files,nodes,dataset:document.documentElement.dataset,active:sandbox.__TAREFAS_ORC_ACTIVE_MODULE__};
}

const cases=[
 {search:'',mod:'relatorio',files:['orcamentarios_relatorio_light.js']},
 {search:'?modulo=guias',mod:'guias',files:['guias_v6.js']},
 {search:'?modulo=baixas',mod:'baixas',files:['pedidos_v6.js']},
 {search:'?modulo=distribuicao',mod:'distribuicao',files:['pedidos_v6.js']},
 {search:'?pedido=7',mod:'pedido',files:['pedidos_v6.js']},
 {search:'?modulo=movimentacao',mod:'movimentacao',files:['movimentacoes_v6.js']},
 {search:'?movimentacao=11',mod:'movimentacao',files:['movimentacoes_v6.js']},
 {search:'?modulo=material_carga',mod:'material_carga',files:['material_carga_v6.js','v7_7_0_material_carga.js']},
 {search:'?modulo=passagem_carga',mod:'passagem_carga',files:['passagem_carga_v6.js']},
 {search:'?passagem=2',mod:'passagem_carga',files:['passagem_carga_v6.js']},
 {search:'?modulo=lavanderia',mod:'lavanderia',files:['lavanderia_v211.js','lavanderia_financeiro_v212.js','lavanderia_pagamento_v767.js','lavanderia_documento_v762.js']}
];

for(const c of cases){
 const r=await run(c.search);
 if(r.active!==c.mod)throw new Error(`${c.search||'relatorio'}: ativo ${r.active}, esperado ${c.mod}`);
 if(JSON.stringify(r.files)!==JSON.stringify(c.files))throw new Error(`${c.mod}: scripts ${r.files.join(',')}, esperado ${c.files.join(',')}`);
 const activeId=moduleIds[c.mod];
 if(r.nodes[activeId]?.hidden)throw new Error(`${c.mod}: módulo ativo ficou oculto.`);
 for(const id of new Set(Object.values(moduleIds)))if(id!==activeId&&!r.nodes[id].hidden)throw new Error(`${c.mod}: ${id} deveria estar oculto.`);
 if(r.dataset.orc243Loaded!==c.mod)throw new Error(`${c.mod}: marcador de carregamento não foi aplicado.`);
}

console.log(`OK: loader 243 validou ${cases.length} rotas do Orçamentários, carregando somente os scripts do módulo ativo.`);