import { readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v216.mjs');

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
  ["const APP_VERSION = '2.1.6';","const APP_VERSION = '2.1.7';"],
  ['const APP_BUILD = 216;','const APP_BUILD = 217;']
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.1.6'","tarefasAppVersion = '2.1.7'"],
  ["tarefasAppBuild = '216'","tarefasAppBuild = '217'"]
]);
await patch('mobile-v12.js',[["2.1.6 • WEB 7.6.8","2.1.7 • WEB 7.6.8"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.1.6';","const APP_VERSION = '2.1.7';"],
  ["const APP_BUILD = 216;","const APP_BUILD = 217;"]
]);
await patch('native-mobile.js',[["2.1.6","2.1.7"]]);

await copyFile(path.join(process.cwd(),'mobile-profile-required-v217.js'),path.join(dist,'mobile-profile-required-v217.js'));

const htmlFiles=(await readdir(dist)).filter(f=>f.toLowerCase().endsWith('.html'));
for(const rel of htmlFiles){
  const file=path.join(dist,rel);
  let html=await readFile(file,'utf8');
  html=html.replaceAll('v4_tema.js?v=2.1.6','v4_tema.js?v=2.1.7');
  html=html.replaceAll('v6_2_mobile.js?v=2.1.6','v6_2_mobile.js?v=2.1.7');
  html=html.replaceAll('v7_6_8_theme_fix.js?v=2.1.6','v7_6_8_theme_fix.js?v=2.1.7');
  if(!html.includes('mobile-profile-required-v217.js')){
    html=html.replace(/<\/body>/i,'  <script src="mobile-profile-required-v217.js?v=2.1.7"></script>\n</body>');
  }
  await writeFile(file,html,'utf8');
}

console.log(`TAREFAS Android 2.1.7 build 217 BETA: cadastro obrigatório injetado em ${htmlFiles.length} telas; Base Web 7.6.8.`);
