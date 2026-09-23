import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v220.mjs');

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
  ["const APP_VERSION = '2.2.0';","const APP_VERSION = '2.2.1';"],
  ['const APP_BUILD = 220;','const APP_BUILD = 221;'],
  ["const WEB_VERSION = '7.6.9';","const WEB_VERSION = '7.6.10';"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.2.0'","tarefasAppVersion = '2.2.1'"],
  ["tarefasAppBuild = '220'","tarefasAppBuild = '221'"]
]);
await patch('mobile-v12.js',[["2.2.0 • WEB 7.6.9","2.2.1 • WEB 7.6.10"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.2.0';","const APP_VERSION = '2.2.1';"],
  ["const APP_BUILD = 220;","const APP_BUILD = 221;"],
  ["const APP_CHANNEL = 'official';","const APP_CHANNEL = 'beta';"]
]);
await patch('native-mobile.js',[["2.2.0","2.2.1"]]);

const htmlFiles=(await readdir(dist)).filter(f=>f.toLowerCase().endsWith('.html'));
for(const rel of htmlFiles){
  const file=path.join(dist,rel);
  let html=await readFile(file,'utf8');
  html=html.replaceAll('?v=7.6.10','?v=2.2.1');
  html=html.replaceAll('?v=2.2.0','?v=2.2.1');
  await writeFile(file,html,'utf8');
}

console.log(`TAREFAS Android 2.2.1 build 221 BETA: Web 7.6.10, lembrete diário de atualização e descarte da notificação ao toque em ${htmlFiles.length} telas.`);
