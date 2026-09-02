import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v212.mjs');

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
  ["const APP_VERSION = '2.1.2';","const APP_VERSION = '2.1.3';"],
  ['const APP_BUILD = 212;','const APP_BUILD = 213;'],
  ["const WEB_VERSION = '7.6.1';","const WEB_VERSION = '7.6.2';"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.1.2'","tarefasAppVersion = '2.1.3'"],
  ["tarefasAppBuild = '212'","tarefasAppBuild = '213'"]
]);
await patch('mobile-v12.js',[["2.1.2 • WEB 7.6.1","2.1.3 • WEB 7.6.2"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.1.2';","const APP_VERSION = '2.1.3';"],
  ["const APP_BUILD = 212;","const APP_BUILD = 213;"]
]);
await patch('native-mobile.js',[["2.1.2","2.1.3"]]);
await patch('games.html',[["games.css?v=2.1.2","games.css?v=2.1.3"],["games.js?v=2.1.2","games.js?v=2.1.3"]]);
await patch('games.js',[["'APP 2.1.2':'WEB 7.6.1'","'APP 2.1.3':'WEB 7.6.2'"]]);
await patch('games.css',[["Android 2.1.2 beta — enquadramento da Lavagem e Base Web 7.6.1","Android 2.1.3 beta — ODT da Lavagem e Base Web 7.6.2"]]);
await patch('lavanderia_v211.js',[["ORÇAMENTÁRIO · BETA 2.1.2","ORÇAMENTÁRIO · BETA 2.1.3"]]);

const orcFile=path.join(dist,'orcamentarios.html');
let orc=await readFile(orcFile,'utf8');
orc=orc.replace('lavanderia_v211.js?v=2.1.2','lavanderia_v211.js?v=2.1.3');
orc=orc.replace('lavanderia_financeiro_v212.js?v=2.1.2','lavanderia_financeiro_v212.js?v=2.1.3');
orc=orc.replace('lavanderia_layout_v212.js?v=2.1.2','lavanderia_layout_v212.js?v=2.1.3');
if(!orc.includes('lavanderia_documento_v762.js'))orc=orc.replace('</body>','  <script src="lavanderia_documento_v762.js?v=2.1.3"></script>\n</body>');
await writeFile(orcFile,orc,'utf8');

console.log('TAREFAS Android 2.1.3 build 213 BETA: arquivo ODT da Lavagem corrigido e Base Web 7.6.2.');
