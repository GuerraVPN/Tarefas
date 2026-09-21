import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v213.mjs');

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
  ["const APP_VERSION = '2.1.3';","const APP_VERSION = '2.1.4';"],
  ['const APP_BUILD = 213;','const APP_BUILD = 214;'],
  ["const WEB_VERSION = '7.6.2';","const WEB_VERSION = '7.6.3';"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.1.3'","tarefasAppVersion = '2.1.4'"],
  ["tarefasAppBuild = '213'","tarefasAppBuild = '214'"]
]);
await patch('mobile-v12.js',[["2.1.3 • WEB 7.6.2","2.1.4 • WEB 7.6.3"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.1.3';","const APP_VERSION = '2.1.4';"],
  ["const APP_BUILD = 213;","const APP_BUILD = 214;"]
]);
await patch('native-mobile.js',[["2.1.3","2.1.4"]]);
await patch('games.html',[["games.css?v=2.1.3","games.css?v=2.1.4"],["games.js?v=2.1.3","games.js?v=2.1.4"]]);
await patch('games.js',[["'APP 2.1.3':'WEB 7.6.2'","'APP 2.1.4':'WEB 7.6.3'"]]);
await patch('lavanderia_v211.js',[["ORÇAMENTÁRIO · BETA 2.1.3","ORÇAMENTÁRIO · BETA 2.1.4"]]);

const orcFile=path.join(dist,'orcamentarios.html');
let orc=await readFile(orcFile,'utf8');
for(const script of ['lavanderia_v211.js','lavanderia_financeiro_v212.js','lavanderia_layout_v212.js','lavanderia_documento_v762.js']){
  orc=orc.replace(`${script}?v=2.1.3`,`${script}?v=2.1.4`);
  orc=orc.replace(`${script}?v=7.6.3`,`${script}?v=2.1.4`);
}
await writeFile(orcFile,orc,'utf8');

console.log('TAREFAS Android 2.1.4 build 214 BETA: Base Web 7.6.3, férias protegidas até ADP e ODT da Lavagem.');
