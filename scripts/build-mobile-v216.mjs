import { readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v215.mjs');

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
  ["const APP_VERSION = '2.1.5';","const APP_VERSION = '2.1.6';"],
  ['const APP_BUILD = 215;','const APP_BUILD = 216;'],
  ["const WEB_VERSION = '7.6.4';","const WEB_VERSION = '7.6.8';"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.1.5'","tarefasAppVersion = '2.1.6'"],
  ["tarefasAppBuild = '215'","tarefasAppBuild = '216'"]
]);
await patch('mobile-v12.js',[["2.1.5 • WEB 7.6.4","2.1.6 • WEB 7.6.8"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.1.5';","const APP_VERSION = '2.1.6';"],
  ["const APP_BUILD = 215;","const APP_BUILD = 216;"]
]);
await patch('native-mobile.js',[["2.1.5","2.1.6"]]);

// Mantém a correção de tema dentro do bundle mesmo se o builder anterior não copiar arquivos novos.
await copyFile(path.join(process.cwd(),'v7_6_8_theme_fix.js'),path.join(dist,'v7_6_8_theme_fix.js'));
const configFile=path.join(dist,'configuracoes.html');
let config=await readFile(configFile,'utf8');
config=config.replaceAll('v4_tema.js?v=7.6.8','v4_tema.js?v=2.1.6');
config=config.replaceAll('v6_2_mobile.js?v=7.6.8','v6_2_mobile.js?v=2.1.6');
config=config.replaceAll('v7_6_8_theme_fix.js?v=7.6.8','v7_6_8_theme_fix.js?v=2.1.6');
if(!config.includes('v7_6_8_theme_fix.js'))config=config.replace(/<\/body>/i,'  <script src="v7_6_8_theme_fix.js?v=2.1.6"></script>\n</body>');
await writeFile(configFile,config,'utf8');

console.log('TAREFAS Android 2.1.6 build 216 BETA: Base Web 7.6.8 com troca de temas corrigida no app e no site.');
