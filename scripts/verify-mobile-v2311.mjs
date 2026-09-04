import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist');
const errors=[];
async function text(r){return readFile(path.join(root,r),'utf8')}
async function exists(r){try{await access(path.join(root,r));return true}catch{return false}}
function req(s,m,ctx){if(!s.includes(m))errors.push(`${ctx}: marcador ausente: ${m}`)}
function forbid(s,m,ctx){if(s.includes(m))errors.push(`${ctx}: conteúdo proibido encontrado: ${m}`)}

const required=[
 'mobile-bootstrap.js','mobile-preload.js','mobile-updates-v181.js',
 'aditamento_v74.js','pessoal.html','v7_5_1_version.js',
 'orcamentarios.html','orcamentarios-loader-v241.js','orcamentarios_relatorio_light.js',
 'pedidos_v6.js','movimentacoes_v6.js','guias_v6.js','passagem_carga_v6.js','v7_7_0_material_carga.js'
];
for(const r of required)if(!await exists(r))errors.push(`arquivo ausente: ${r}`);

if(await exists('mobile-bootstrap.js')){
 const s=await text('mobile-bootstrap.js');req(s,"const APP_VERSION = '2.3.11'",'mobile-bootstrap');req(s,'const APP_BUILD = 241','mobile-bootstrap');
}
if(await exists('mobile-preload.js')){
 const s=await text('mobile-preload.js');req(s,"tarefasAppVersion = '2.3.11'",'mobile-preload');req(s,"tarefasAppBuild = '241'",'mobile-preload');
}

if(await exists('aditamento_v74.js')){
 const s=await text('aditamento_v74.js');
 for(const m of ['ADITAMENTO_ODT','buildAditamentoOdt','name="aditamentoFormato"','Gerar ODT','generateOdt','ADITAMENTO AO BOLETIM INTERNO'])req(s,m,'aditamento');
 for(const m of ['ESCALA DE SERVIÇO','ESCALA DE MISSÃO','TAREFAS_SCALE_EXPORT_V772','v772ScaleBtn'])forbid(s,m,'aditamento');
}
if(await exists('pessoal.html')){
 const s=await text('pessoal.html');
 for(const m of ['__BLOCK_V772_SCALE_CACHE__','Gerar aditamento','aditamento_v74.js?v=2.3.11-b241'])req(s,m,'pessoal.html');
 forbid(s,'Gerar aditamento PDF','pessoal.html');
}
if(await exists('v7_5_1_version.js'))forbid(await text('v7_5_1_version.js'),'v7_7_2_scale_export.js','v7_5_1_version.js');
if(await exists('v7_7_2_scale_export.js'))errors.push('v7_7_2_scale_export.js ainda está empacotado');

const heavyModules=[
 'guias_v6.js','pedidos_v6.js','movimentacoes_v6.js','material_carga_v6.js','v7_7_0_material_carga.js','passagem_carga_v6.js',
 'lavanderia_v211.js','lavanderia_financeiro_v212.js','lavanderia_pagamento_v767.js','lavanderia_documento_v762.js'
];
if(await exists('orcamentarios.html')){
 const s=await text('orcamentarios.html');
 req(s,'orcamentarios-loader-v241.js?v=2.3.11-b241','orcamentarios.html');
 req(s,'sistema_comum.js?v=2.3.11-b241','orcamentarios.html');
 for(const f of heavyModules){
   const rx=new RegExp(`<script\\s+src=["'][^"']*${f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[^"']*["']`,'i');
   if(rx.test(s))errors.push(`orcamentarios.html ainda carrega módulo pesado estaticamente: ${f}`);
 }
}
if(await exists('orcamentarios-loader-v241.js')){
 const s=await text('orcamentarios-loader-v241.js');
 for(const m of ['__TAREFAS_ORC_LOADER_V241__',"relatorio:['orcamentarios_relatorio_light.js']","guias:['guias_v6.js']","baixas:['pedidos_v6.js']","movimentacao:['movimentacoes_v6.js']","material_carga:['material_carga_v6.js','v7_7_0_material_carga.js']","passagem_carga:['passagem_carga_v6.js']","lavanderia:['lavanderia_v211.js'"])req(s,m,'orcamentarios-loader-v241.js');
}
if(await exists('orcamentarios_relatorio_light.js')){
 const s=await text('orcamentarios_relatorio_light.js');req(s,'__TAREFAS_ORC_REPORT_LIGHT__','relatório leve');forbid(s,"from('pedido_orcamentario_itens')",'relatório leve');forbid(s,"from('movimentacao_material_itens')",'relatório leve');
}

if(await exists('pedidos_v6.js')){
 const s=await text('pedidos_v6.js');
 forbid(s,'.limit(10000)','pedidos_v6.js');
 req(s,'.limit(300)','pedidos_v6.js');
 req(s,".eq('pedido_id',selected.id)",'pedidos_v6.js');
 req(s,"Promise.resolve({data:[],error:null})",'pedidos_v6.js');
}
if(await exists('movimentacoes_v6.js')){
 const s=await text('movimentacoes_v6.js');
 forbid(s,'.limit(10000)','movimentacoes_v6.js');
 req(s,'.limit(300)','movimentacoes_v6.js');
 req(s,".eq('movimentacao_id',selected.id)",'movimentacoes_v6.js');
 req(s,"Promise.resolve({data:[],error:null})",'movimentacoes_v6.js');
}
if(await exists('guias_v6.js')){
 const s=await text('guias_v6.js');req(s,'.limit(300)','guias_v6.js');forbid(s,'.limit(1000)','guias_v6.js');
}
if(await exists('passagem_carga_v6.js')){
 const s=await text('passagem_carga_v6.js');req(s,'.limit(250)','passagem_carga_v6.js');forbid(s,'.limit(500)','passagem_carga_v6.js');
}
if(await exists('v7_7_0_material_carga.js')){
 const s=await text('v7_7_0_material_carga.js');
 forbid(s,'observe(document.body','v7_7_0_material_carga.js');
 forbid(s,'setInterval(refresh,60000)','v7_7_0_material_carga.js');
 req(s,"$('materialCargaModule')",'v7_7_0_material_carga.js');
 req(s,'300000','v7_7_0_material_carga.js');
 req(s,'!document.hidden','v7_7_0_material_carga.js');
}

for(const r of ['aditamento_v74.js','v7_5_1_version.js','orcamentarios-loader-v241.js','orcamentarios_relatorio_light.js','pedidos_v6.js','movimentacoes_v6.js','guias_v6.js','passagem_carga_v6.js','v7_7_0_material_carga.js']){
 if(!await exists(r))continue;
 const x=spawnSync(process.execPath,['--check',path.join(root,r)],{encoding:'utf8'});
 if(x.status!==0)errors.push(`${r}: JavaScript inválido: ${x.stderr.trim()}`);
}

if(errors.length){for(const e of errors)console.error('ERRO: '+e);process.exit(1)}
console.log('OK: 2.3.11 build 241 — aditamento oficial PDF/ODT e Orçamentários isolado por módulo, sem cargas de 10 mil itens.');
