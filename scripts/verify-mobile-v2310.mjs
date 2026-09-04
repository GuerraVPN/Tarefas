import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist');
const errors=[];
async function text(r){return readFile(path.join(root,r),'utf8')}
async function exists(r){try{await access(path.join(root,r));return true}catch{return false}}

for(const r of ['mobile-bootstrap.js','mobile-preload.js','mobile-updates-v181.js','aditamento_v74.js','sistema_comum.js','orcamentarios_relatorio_light.js','orcamentarios.html']){
  if(!await exists(r))errors.push(`arquivo ausente: ${r}`);
}
if(await exists('mobile-bootstrap.js')){const s=await text('mobile-bootstrap.js');if(!s.includes("const APP_VERSION = '2.3.10'"))errors.push('mobile-bootstrap: versão 2.3.10 ausente');if(!s.includes('const APP_BUILD = 240'))errors.push('mobile-bootstrap: build 240 ausente')}
if(await exists('mobile-preload.js')){const s=await text('mobile-preload.js');if(!s.includes("tarefasAppVersion = '2.3.10'"))errors.push('mobile-preload: versão 2.3.10 ausente');if(!s.includes("tarefasAppBuild = '240'"))errors.push('mobile-preload: build 240 ausente')}
if(await exists('aditamento_v74.js')){const s=await text('aditamento_v74.js');for(const m of ['ADITAMENTO_ODT','buildAditamentoOdt','name="aditamentoFormato"','Gerar ODT','generateOdt'])if(!s.includes(m))errors.push(`aditamento: marcador ODT ausente: ${m}`)}
if(await exists('sistema_comum.js')){const s=await text('sistema_comum.js');for(const m of ['__TAREFAS_ORC_LAZY_GATE__',"modulo==='relatorio'",'orcamentarios_relatorio_light.js?v=7.8.2-orcfix2-2310'])if(!s.includes(m))errors.push(`sistema_comum: lazy-load ausente: ${m}`)}
if(await exists('orcamentarios_relatorio_light.js')){const s=await text('orcamentarios_relatorio_light.js');if(!s.includes('__TAREFAS_ORC_REPORT_LIGHT__'))errors.push('relatório leve: marcador ausente');if(s.includes("from('pedido_orcamentario_itens')"))errors.push('relatório leve não pode carregar itens dos pedidos')}
if(await exists('orcamentarios.html')){const s=await text('orcamentarios.html');if(!s.includes('sistema_comum.js?v=7.8.2-orcfix2-2310'))errors.push('orcamentarios.html sem cache-bust do sistema_comum')}
if(await exists('v7_5_1_version.js')){const s=await text('v7_5_1_version.js');if(s.includes('v7_7_2_scale_export.js'))errors.push('v7_5_1_version ainda carrega Gerar escala')}
if(await exists('v7_7_2_scale_export.js'))errors.push('v7_7_2_scale_export.js ainda empacotado');

for(const r of ['aditamento_v74.js','sistema_comum.js','orcamentarios_relatorio_light.js','v7_5_1_version.js'])if(await exists(r)){
  const x=spawnSync(process.execPath,['--check',path.join(root,r)],{encoding:'utf8'});
  if(x.status!==0)errors.push(`${r}: JavaScript inválido: ${x.stderr.trim()}`);
}
if(errors.length){for(const e of errors)console.error('ERRO: '+e);process.exit(1)}
console.log('OK: 2.3.10 build 240 sem Gerar escala, com Aditamento PDF/ODT e Orçamentários lazy-load/relatório leve.');
