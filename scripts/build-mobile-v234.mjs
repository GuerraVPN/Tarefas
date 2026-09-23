import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v233.mjs')).href+'?v=234');
const dist=path.join(root,'dist');
async function replaceRequired(rel,replacements){const file=path.join(dist,rel);let source=await readFile(file,'utf8');for(const[from,to]of replacements){if(!source.includes(from))throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);source=source.split(from).join(to)}await writeFile(file,source,'utf8')}
for(const name of await readdir(dist)){if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;const file=path.join(dist,name);let source=await readFile(file,'utf8');source=source.replaceAll('2.3.3','2.3.4');await writeFile(file,source,'utf8')}
await replaceRequired('mobile-bootstrap.js',[["const APP_BUILD = 233;","const APP_BUILD = 234;"]]);
await replaceRequired('mobile-preload.js',[["tarefasAppBuild = '233'","tarefasAppBuild = '234'"]]);
await replaceRequired('mobile-updates-v181.js',[["const APP_BUILD = 233;","const APP_BUILD = 234;"]]);
await copyFile(path.join(root,'app','mobile-chat-fix-v234.js'),path.join(dist,'mobile-chat-fix-v234.js'));
for(const rel of ['usuarios.html','central.html']){
  const file=path.join(dist,rel);let html=await readFile(file,'utf8');
  if(!html.includes('mobile-chat-fix-v234.js'))html=html.replace(/<\/body>/i,'  <script src="mobile-chat-fix-v234.js?v=2.3.4"></script>\n</body>');
  await writeFile(file,html,'utf8');
}
const patch=await readFile(path.join(dist,'mobile-chat-fix-v234.js'),'utf8');
for(const marker of ['__TAREFAS_ANDROID_234_CHAT_FIX__','2147483000','100dvh','data-conv','data-user','usuarios.html?chat='])if(!patch.includes(marker))throw new Error(`mobile-chat-fix-v234.js: recurso ausente: ${marker}`);
console.log('TAREFAS Android 2.3.4 build 234 BETA / Web base 7.8.2: compositor visível e Central integrada ao chat novo.');
