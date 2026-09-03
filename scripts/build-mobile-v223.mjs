import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v222.mjs');

const dist=path.join(process.cwd(),'dist');
async function patch(rel,replacements){
  const file=path.join(dist,rel);
  let text=await readFile(file,'utf8');
  for(const [from,to] of replacements){
    if(!text.includes(from)) throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);
    text=text.split(from).join(to);
  }
  await writeFile(file,text,'utf8');
}

await patch('mobile-bootstrap.js',[
  ["const APP_VERSION = '2.2.2';","const APP_VERSION = '2.2.3';"],
  ['const APP_BUILD = 222;','const APP_BUILD = 223;'],
  ["const WEB_VERSION = '7.6.11';","const WEB_VERSION = '7.7.0';"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.2.2'","tarefasAppVersion = '2.2.3'"],
  ["tarefasAppBuild = '222'","tarefasAppBuild = '223'"]
]);
await patch('mobile-v12.js',[["2.2.2 • WEB 7.6.11","2.2.3 • WEB 7.7.0"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.2.2';","const APP_VERSION = '2.2.3';"],
  ["const APP_BUILD = 222;","const APP_BUILD = 223;"]
]);
await patch('native-mobile.js',[["2.2.2","2.2.3"]]);

const htmlFiles=(await readdir(dist)).filter(f=>f.toLowerCase().endsWith('.html'));
for(const rel of htmlFiles){
  const file=path.join(dist,rel);
  let html=await readFile(file,'utf8');
  html=html.replaceAll('?v=7.7.0-aboutfix','?v=2.2.3');
  html=html.replaceAll('?v=7.7.0','?v=2.2.3');
  html=html.replaceAll('?v=2.2.2','?v=2.2.3');
  await writeFile(file,html,'utf8');
}

console.log(`TAREFAS Android 2.2.3 build 223 BETA: Web 7.7.0, Material Carga, conferência obrigatória e About corrigido em ${htmlFiles.length} telas.`);
