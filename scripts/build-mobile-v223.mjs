import { readFile, writeFile, readdir, copyFile, access, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const dist=path.join(root,'dist');
const overlay=path.join(root,'.web770');
const web770Files=[
  'about.html','orcamentarios.html','v4_ui.js','v6_2_mobile.js','v6_5_patch.js',
  'v7_5_1_version.js','v7_5_1_about.js','v7_6_5_webfix.js','v7_6_8_theme_fix.js',
  'v7_6_9_profile_required.js','v7_7_0_material_carga.js','notificacoes.js','central.js'
];

// O workflow coloca os arquivos Web 7.7.0 na raiz. Preserva o overlay e restaura
// temporariamente a base 2.2.2 para que a cadeia histórica de patches rode intacta.
await rm(overlay,{recursive:true,force:true});await mkdir(overlay,{recursive:true});
for(const rel of web770Files){
  const src=path.join(root,rel);
  try{await access(src);await copyFile(src,path.join(overlay,rel))}catch{throw new Error(`Fonte Web 7.7.0 ausente: ${rel}`)}
}
const changed=execFileSync('git',['diff','--name-only','origin/app/android-v222-prep','origin/main','--'],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean);
for(const rel of changed){
  if(rel.includes('/')||!/[.](?:html|js|css)$/i.test(rel))continue;
  try{
    const old=execFileSync('git',['show',`origin/app/android-v222-prep:${rel}`]);
    await writeFile(path.join(root,rel),old);
  }catch{}
}

await import('./build-mobile-v222.mjs');

async function patch(rel,replacements){
  const file=path.join(dist,rel);
  let text=await readFile(file,'utf8');
  for(const [from,to] of replacements){
    if(!text.includes(from)) throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);
    text=text.split(from).join(to);
  }
  await writeFile(file,text,'utf8');
}
async function exists(p){try{await access(p);return true}catch{return false}}

for(const rel of web770Files){
  const src=path.join(overlay,rel);
  if(!await exists(src))throw new Error(`Overlay Web 7.7.0 ausente: ${rel}`);
  await copyFile(src,path.join(dist,rel));
}

const mobileCss=['mobile.css','mobile-v12.css','mobile-v16.css','mobile-v18.css','mobile-v181.css'];
const mobileJs=['mobile-bootstrap.js','mobile-v12.js','native-mobile.js','mobile-updates-v181.js','mobile-dashboard-v184.js','mobile-users-inline-v189.js','bloco_notas.js','mobile-notes-v191.js','mobile-v196.js'];
for(const rel of ['about.html','orcamentarios.html']){
  const file=path.join(dist,rel);let html=await readFile(file,'utf8');
  if(!html.includes('mobile-preload.js'))html=html.replace(/<head>/i,'<head>\n  <script src="mobile-preload.js"></script>');
  for(const css of mobileCss)if(!html.includes(css))html=html.replace(/<\/head>/i,`  <link rel="stylesheet" href="${css}">\n</head>`);
  if(!html.includes('manifest.webmanifest'))html=html.replace(/<\/head>/i,'  <link rel="manifest" href="manifest.webmanifest">\n  <meta name="theme-color" content="#05090b">\n</head>');
  for(const js of mobileJs)if(!html.includes(js))html=html.replace(/<\/body>/i,`  <script src="${js}"></script>\n</body>`);
  await writeFile(file,html,'utf8');
}

await patch('mobile-bootstrap.js',[
  ["const APP_VERSION = '2.2.2';","const APP_VERSION = '2.2.3';"],
  ['const APP_BUILD = 222;','const APP_BUILD = 223;'],
  ["const WEB_VERSION = '7.6.11';","const WEB_VERSION = '7.7.0';"]
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.2.2'","tarefasAppVersion = '2.2.3'"],
  ["tarefasAppBuild = '222'","tarefasAppBuild = '223'"]
]);
await patch('mobile-v12.js',[["2.2.2 • WEB 7.6.11","2.2.3 • WEB 7.7.0"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.2.2';","const APP_VERSION = '2.2.3';"],
  ["const APP_BUILD = 222;","const APP_BUILD = 223;"]
]);
await patch('native-mobile.js',[["2.2.2","2.2.3"]]);

const htmlFiles=(await readdir(dist)).filter(f=>f.toLowerCase().endsWith('.html'));
for(const rel of htmlFiles){
  const file=path.join(dist,rel);
  let html=await readFile(file,'utf8');
  html=html.replaceAll('?v=7.7.0-aboutfix','?v=2.2.3');
  html=html.replaceAll('?v=7.7.0','?v=2.2.3');
  html=html.replaceAll('?v=2.2.2','?v=2.2.3');
  await writeFile(file,html,'utf8');
}

console.log(`TAREFAS Android 2.2.3 build 223 BETA: base estável 2.2.2 + overlay Web 7.7.0 em ${htmlFiles.length} telas.`);
