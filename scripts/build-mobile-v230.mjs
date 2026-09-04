import { copyFile, readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v228.mjs')).href+'?v=230');
const dist=path.join(root,'dist');

async function replaceRequired(rel,replacements){const file=path.join(dist,rel);let source=await readFile(file,'utf8');for(const[from,to]of replacements){if(!source.includes(from))throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);source=source.split(from).join(to)}await writeFile(file,source,'utf8')}

// Consolidação oficial: Android 2.3.0 sobre a Base Web 7.8.0.
for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const file=path.join(dist,name);let source=await readFile(file,'utf8');
  source=source.replaceAll('2.2.8','2.3.0').replaceAll('7.7.2','7.8.0');
  await writeFile(file,source,'utf8');
}
await replaceRequired('mobile-bootstrap.js',[['const APP_BUILD = 228;','const APP_BUILD = 230;']]);
await replaceRequired('mobile-preload.js',[["tarefasAppBuild = '228'","tarefasAppBuild = '230'"]]);
await replaceRequired('mobile-updates-v181.js',[["const APP_BUILD = 228;","const APP_BUILD = 230;"],["const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'official';"]]);
await replaceRequired('v6_2_mobile.js',[['__TAREFAS_V228_LIGHT_LOADER__','__TAREFAS_V230_LIGHT_LOADER__']]);

// Cliente oficial do Assistente IA.
await copyFile(path.join(root,'app','mobile-ai-v230.js'),path.join(dist,'mobile-ai-v230.js'));
const htmlFiles=(await readdir(dist)).filter(name=>name.endsWith('.html'));
for(const name of htmlFiles){
  const file=path.join(dist,name);let html=await readFile(file,'utf8');
  html=html.replaceAll('mobile-ai-v228.js','mobile-ai-v230.js');
  if(!html.includes('mobile-ai-v230.js'))html=html.replace(/<\/body>/i,'  <script src="mobile-ai-v230.js"></script>\n</body>');
  html=html.replaceAll('?v=2.2.8','?v=2.3.0');
  await writeFile(file,html,'utf8');
}
await unlink(path.join(dist,'mobile-ai-v228.js')).catch(()=>{});

const ai=await readFile(path.join(dist,'mobile-ai-v230.js'),'utf8');
for(const marker of ['__TAREFAS_ANDROID_230_AI__','tarefasPushSession17','/functions/v1/tarefas-ai','OFICIAL 2.3.0 · somente leitura','rate_limited'])if(!ai.includes(marker))throw new Error(`mobile-ai-v230.js: marcador ausente: ${marker}`);
const version=await readFile(path.join(dist,'v7_5_1_version.js'),'utf8');
for(const marker of ['__TAREFAS_V780_VERSION__',"const VERSION='7.8.0'"])if(!version.includes(marker))throw new Error(`v7_5_1_version.js: marcador ausente: ${marker}`);

console.log(`TAREFAS Android 2.3.0 build 230 OFICIAL: Assistente IA em ${htmlFiles.length} telas, Base Web 7.8.0.`);
