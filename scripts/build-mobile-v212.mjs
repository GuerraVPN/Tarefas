import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v211.mjs');

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
  ["const APP_VERSION = '2.1.1';","const APP_VERSION = '2.1.2';"],
  ['const APP_BUILD = 211;','const APP_BUILD = 212;'],
  ["const WEB_VERSION = '7.6.0';","const WEB_VERSION = '7.6.1';"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.1.1'","tarefasAppVersion = '2.1.2'"],
  ["tarefasAppBuild = '211'","tarefasAppBuild = '212'"]
]);
await patch('mobile-v12.js',[["2.1.1 • WEB 7.6.0","2.1.2 • WEB 7.6.1"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.1.1';","const APP_VERSION = '2.1.2';"],
  ["const APP_BUILD = 211;","const APP_BUILD = 212;"]
]);
await patch('native-mobile.js',[["2.1.1","2.1.2"]]);
await patch('games.html',[["games.css?v=2.1.1","games.css?v=2.1.2"],["games.js?v=2.1.1","games.js?v=2.1.2"]]);
await patch('games.js',[["'APP 2.1.1':'WEB 7.6.0'","'APP 2.1.2':'WEB 7.6.1'"]]);
await patch('games.css',[["Android 2.1.1 beta — Lavagem de Forro de Cama e correções anteriores","Android 2.1.2 beta — enquadramento da Lavagem e Base Web 7.6.1"]]);
await patch('lavanderia_v211.js',[["ORÇAMENTÁRIO · BETA 2.1.1","ORÇAMENTÁRIO · BETA 2.1.2"]]);

const orcFile=path.join(dist,'orcamentarios.html');
let orc=await readFile(orcFile,'utf8');
orc=orc.replace('lavanderia_v211.js?v=2.1.1','lavanderia_v211.js?v=2.1.2');
if(!orc.includes('lavanderia_financeiro_v212.js'))orc=orc.replace('</body>','  <script src="lavanderia_financeiro_v212.js?v=2.1.2"></script>\n</body>');
if(!orc.includes('lavanderia_layout_v212.js'))orc=orc.replace('</body>','  <script src="lavanderia_layout_v212.js?v=2.1.2"></script>\n</body>');
await writeFile(orcFile,orc,'utf8');

console.log('TAREFAS Android 2.1.2 build 212 BETA: Base Web 7.6.1, saldo PE e modal da lavanderia enquadrado no Android.');
