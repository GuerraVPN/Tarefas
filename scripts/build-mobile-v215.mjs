import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v214.mjs');

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
  ["const APP_VERSION = '2.1.4';","const APP_VERSION = '2.1.5';"],
  ['const APP_BUILD = 214;','const APP_BUILD = 215;'],
  ["const WEB_VERSION = '7.6.3';","const WEB_VERSION = '7.6.4';"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.1.4'","tarefasAppVersion = '2.1.5'"],
  ["tarefasAppBuild = '214'","tarefasAppBuild = '215'"]
]);
await patch('mobile-v12.js',[["2.1.4 • WEB 7.6.3","2.1.5 • WEB 7.6.4"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.1.4';","const APP_VERSION = '2.1.5';"],
  ["const APP_BUILD = 214;","const APP_BUILD = 215;"]
]);
await patch('native-mobile.js',[["2.1.4","2.1.5"]]);
await patch('games.html',[["games.css?v=2.1.4","games.css?v=2.1.5"],["games.js?v=2.1.4","games.js?v=2.1.5"]]);
await patch('games.js',[["'APP 2.1.4':'WEB 7.6.3'","'APP 2.1.5':'WEB 7.6.4'"]]);
await patch('lavanderia_v211.js',[["ORÇAMENTÁRIO · BETA 2.1.4","ORÇAMENTÁRIO · BETA 2.1.5"]]);

const orcFile=path.join(dist,'orcamentarios.html');
let orc=await readFile(orcFile,'utf8');
for(const script of ['lavanderia_v211.js','lavanderia_financeiro_v212.js','lavanderia_layout_v212.js','lavanderia_documento_v762.js']){
  orc=orc.replace(`${script}?v=2.1.4`,`${script}?v=2.1.5`);
  orc=orc.replace(`${script}?v=7.6.4`,`${script}?v=2.1.5`);
}
await writeFile(orcFile,orc,'utf8');

const configFile=path.join(dist,'configuracoes.html');
let config=await readFile(configFile,'utf8');
if(!config.includes('configuracoes_senha_v215.js')){
  config=config.replace(/<\/body>/i,'  <script src="configuracoes_senha_v215.js?v=2.1.5"></script>\n</body>');
}
await writeFile(configFile,config,'utf8');

console.log('TAREFAS Android 2.1.5 build 215 BETA: Base Web 7.6.4, ODT/PDF, férias/ADP e alteração de senha nas Configurações.');
