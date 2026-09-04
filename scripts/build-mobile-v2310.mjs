import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v239-post.mjs')).href+'?v=2310');
const dist=path.join(root,'dist');

async function rep(rel,from,to,{required=true}={}){
  const p=path.join(dist,rel);let s=await readFile(p,'utf8');
  if(required&&!s.includes(from))throw new Error(`${rel}: trecho não encontrado: ${from}`);
  s=s.split(from).join(to);await writeFile(p,s,'utf8');
}

// Garante que a 2.3.10 leve exatamente os dois hotfixes do Orçamentários,
// sem depender do snapshot antigo usado pela 2.3.9.
await copyFile(path.join(root,'sistema_comum.js'),path.join(dist,'sistema_comum.js'));
await copyFile(path.join(root,'orcamentarios_relatorio_light.js'),path.join(dist,'orcamentarios_relatorio_light.js'));

for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.9','2.3.10');
  await writeFile(p,s,'utf8');
}
await rep('mobile-bootstrap.js','const APP_BUILD = 239;','const APP_BUILD = 240;');
await rep('mobile-preload.js',"tarefasAppBuild = '239'","tarefasAppBuild = '240'");
await rep('mobile-updates-v181.js','const APP_BUILD = 239;','const APP_BUILD = 240;');
await rep('mobile-schema-v239.js','build:239','build:240',{required:false});

// Cache-bust explícito: a tela Orçamentários não pode reutilizar sistema_comum.js antigo.
await rep('orcamentarios.html','sistema_comum.js?v=6.0','sistema_comum.js?v=7.8.2-orcfix2-2310',{required:false});

// Defesa extra: mesmo que um snapshot antigo tente reintroduzir o exporter,
// a build 240 não o empacota nem carrega.
try{
  const p=path.join(dist,'v7_5_1_version.js');let s=await readFile(p,'utf8');
  s=s.replaceAll("addScript('v7_7_2_scale_export.js','__TAREFAS_V772_SCALE_EXPORT__');",'')
     .replaceAll('addScript("v7_7_2_scale_export.js","__TAREFAS_V772_SCALE_EXPORT__");','');
  await writeFile(p,s,'utf8');
}catch(_){}

console.log('TAREFAS Android 2.3.10 build 240 BETA: Orçamentários leve, Gerar escala removido e Aditamento PDF/ODT.');
