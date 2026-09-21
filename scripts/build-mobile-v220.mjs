import { readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile-v217.mjs');

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
  ["const APP_VERSION = '2.1.7';","const APP_VERSION = '2.2.0';"],
  ['const APP_BUILD = 217;','const APP_BUILD = 220;'],
  ["const WEB_VERSION = '7.6.8';","const WEB_VERSION = '7.6.9';"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.1.7'","tarefasAppVersion = '2.2.0'"],
  ["tarefasAppBuild = '217'","tarefasAppBuild = '220'"]
]);
await patch('mobile-v12.js',[["2.1.7 • WEB 7.6.8","2.2.0 • WEB 7.6.9"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.1.7';","const APP_VERSION = '2.2.0';"],
  ["const APP_BUILD = 217;","const APP_BUILD = 220;"],
  ["const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'official';"]
]);
await patch('native-mobile.js',[["2.1.7","2.2.0"]]);

await copyFile(path.join(process.cwd(),'v7_6_9_profile_required.js'),path.join(dist,'v7_6_9_profile_required.js'));

const htmlFiles=(await readdir(dist)).filter(f=>f.toLowerCase().endsWith('.html'));
for(const rel of htmlFiles){
  const file=path.join(dist,rel);
  let html=await readFile(file,'utf8');
  html=html.replace(/\s*<script src="mobile-profile-required-v217\.js\?v=2\.1\.7"><\/script>\s*/g,'\n');
  html=html.replaceAll('v4_tema.js?v=7.6.9','v4_tema.js?v=2.2.0');
  html=html.replaceAll('v6_2_mobile.js?v=7.6.9','v6_2_mobile.js?v=2.2.0');
  html=html.replaceAll('v7_6_8_theme_fix.js?v=7.6.9','v7_6_8_theme_fix.js?v=2.2.0');
  html=html.replaceAll('v7_6_9_profile_required.js?v=7.6.9','v7_6_9_profile_required.js?v=2.2.0');
  if(!html.includes('v7_6_9_profile_required.js')){
    html=html.replace(/<\/body>/i,'  <script src="v7_6_9_profile_required.js?v=2.2.0"></script>\n</body>');
  }
  await writeFile(file,html,'utf8');
}

console.log(`TAREFAS Android 2.2.0 build 220 OFICIAL: Web 7.6.9 com cadastro obrigatório em ${htmlFiles.length} telas.`);
