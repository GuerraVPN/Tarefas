import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v210.mjs');

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
  ["const APP_VERSION = '2.1.0';","const APP_VERSION = '2.1.1';"],
  ['const APP_BUILD = 210;','const APP_BUILD = 211;'],
  ["['Passagem de Carga','orcamentarios.html?modulo=passagem_carga','Passagens e detentores'],","['Passagem de Carga','orcamentarios.html?modulo=passagem_carga','Passagens e detentores'],\n      ['Lavagem de Forro de Cama','orcamentarios.html?modulo=lavanderia','Cálculo, Fiscalização, envio e recebimento'],"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.1.0'","tarefasAppVersion = '2.1.1'"],
  ["tarefasAppBuild = '210'","tarefasAppBuild = '211'"]
]);
await patch('mobile-v12.js',[["2.1.0 • WEB 7.6.0","2.1.1 • WEB 7.6.0"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.1.0';","const APP_VERSION = '2.1.1';"],
  ["const APP_BUILD = 210;","const APP_BUILD = 211;"],
  ["const APP_CHANNEL = 'official';","const APP_CHANNEL = 'beta';"]
]);
await patch('native-mobile.js',[["2.1.0","2.1.1"]]);
await patch('games.html',[["games.css?v=2.1.0","games.css?v=2.1.1"],["games.js?v=2.1.0","games.js?v=2.1.1"]]);
await patch('games.js',[["'APP 2.1.0':'WEB 7.6.0'","'APP 2.1.1':'WEB 7.6.0'"]]);
await patch('games.css',[["Android 2.1.0 oficial — enquadramento e rolagem dos Jogos","Android 2.1.1 beta — Lavagem de Forro de Cama e correções anteriores"]]);

const orcFile=path.join(dist,'orcamentarios.html');
let orc=await readFile(orcFile,'utf8');
if(!orc.includes('lavanderia_v211.js')){
  if(!orc.includes('</body>')) throw new Error('orcamentarios.html: </body> não encontrado');
  orc=orc.replace('</body>','  <script src="lavanderia_v211.js?v=2.1.1"></script>\n</body>');
  await writeFile(orcFile,orc,'utf8');
}

console.log('TAREFAS Android 2.1.1 build 211 BETA: Lavagem de Forro de Cama no Orçamentário, Base Web 7.6.0.');
