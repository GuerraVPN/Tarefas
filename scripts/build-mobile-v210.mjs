import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v201.mjs');

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

await patch('mobile-bootstrap.js',[["const APP_VERSION = '2.0.1';","const APP_VERSION = '2.1.0';"],['const APP_BUILD = 201;','const APP_BUILD = 210;']]);
await patch('mobile-preload.js',[["tarefasAppVersion = '2.0.1'","tarefasAppVersion = '2.1.0'"],["tarefasAppBuild = '201'","tarefasAppBuild = '210'"]]);
await patch('mobile-v12.js',[["2.0.1 • WEB 7.6.0","2.1.0 • WEB 7.6.0"]]);
await patch('mobile-updates-v181.js',[["const APP_VERSION = '2.0.1';","const APP_VERSION = '2.1.0';"],["const APP_BUILD = 201;","const APP_BUILD = 210;"],["const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'official';"]]);
await patch('native-mobile.js',[["2.0.1","2.1.0"]]);
await patch('games.html',[["games.css?v=2.0.1","games.css?v=2.1.0"],["games.js?v=2.0.1","games.js?v=2.1.0"]]);
await patch('games.js',[["'APP 2.0.1':'WEB 7.6.0'","'APP 2.1.0':'WEB 7.6.0'"]]);
await patch('games.css',[["Android 2.0.1 beta — enquadramento e rolagem dos Jogos","Android 2.1.0 oficial — enquadramento e rolagem dos Jogos"]]);

console.log('TAREFAS Android 2.1.0 build 210 OFICIAL: correção aprovada da 2.0.1 promovida, Base Web 7.6.0.');
