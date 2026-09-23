import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v230.mjs')).href+'?v=231');
const dist=path.join(root,'dist');

async function replaceRequired(rel,replacements){
  const file=path.join(dist,rel);let source=await readFile(file,'utf8');
  for(const[from,to]of replacements){if(!source.includes(from))throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);source=source.split(from).join(to)}
  await writeFile(file,source,'utf8');
}

for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const file=path.join(dist,name);let source=await readFile(file,'utf8');
  source=source.replaceAll('2.3.0','2.3.1').replaceAll('7.8.0','7.8.1');
  await writeFile(file,source,'utf8');
}
await replaceRequired('mobile-bootstrap.js',[["const APP_BUILD = 230;","const APP_BUILD = 231;"]]);
await replaceRequired('mobile-preload.js',[["tarefasAppBuild = '230'","tarefasAppBuild = '231'"]]);
await replaceRequired('mobile-updates-v181.js',[["const APP_BUILD = 230;","const APP_BUILD = 231;"]]);
await replaceRequired('v7_5_1_version.js',[['__TAREFAS_V780_VERSION__','__TAREFAS_V781_VERSION__']]);

const perfis=await readFile(path.join(dist,'perfis.js'),'utf8');
for(const marker of ['tarefasPushSession17','X-Tarefas-Session','X-Tarefas-Profile','__tarefasSecuritySessionBridge'])if(!perfis.includes(marker))throw new Error(`perfis.js: ponte RLS ausente: ${marker}`);
const version=await readFile(path.join(dist,'v7_5_1_version.js'),'utf8');
for(const marker of ['__TAREFAS_V781_VERSION__',"const VERSION='7.8.1'"])if(!version.includes(marker))throw new Error(`v7_5_1_version.js: marcador ausente: ${marker}`);
console.log('TAREFAS Android 2.3.1 build 231 / Web 7.8.1: hotfix de sessão RLS preparado.');