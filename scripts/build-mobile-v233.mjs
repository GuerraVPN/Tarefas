import { copyFile, readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v232.mjs')).href+'?v=233');
const dist=path.join(root,'dist');
async function replaceRequired(rel,replacements){const file=path.join(dist,rel);let source=await readFile(file,'utf8');for(const[from,to]of replacements){if(!source.includes(from))throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);source=source.split(from).join(to)}await writeFile(file,source,'utf8')}
for(const name of await readdir(dist)){if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;const file=path.join(dist,name);let source=await readFile(file,'utf8');source=source.replaceAll('2.3.2','2.3.3');await writeFile(file,source,'utf8')}
await replaceRequired('mobile-bootstrap.js',[["const APP_BUILD = 232;","const APP_BUILD = 233;"]]);
await replaceRequired('mobile-preload.js',[["tarefasAppBuild = '232'","tarefasAppBuild = '233'"]]);
await replaceRequired('mobile-updates-v181.js',[["const APP_BUILD = 232;","const APP_BUILD = 233;"]]);
await copyFile(path.join(root,'app','mobile-chat-files-v233.js'),path.join(dist,'mobile-chat-files-v233.js'));
const usersFile=path.join(dist,'usuarios.html');let usersHtml=await readFile(usersFile,'utf8');
usersHtml=usersHtml.replaceAll('mobile-chat-files-v232.js','mobile-chat-files-v233.js');
if(!usersHtml.includes('mobile-chat-files-v233.js'))usersHtml=usersHtml.replace(/<\/body>/i,'  <script src="mobile-chat-files-v233.js?v=2.3.3"></script>\n</body>');
await writeFile(usersFile,usersHtml,'utf8');
try{await unlink(path.join(dist,'mobile-chat-files-v232.js'))}catch{}
const chat=await readFile(path.join(dist,'mobile-chat-files-v233.js'),'utf8');
for(const marker of ['__TAREFAS_ANDROID_233_CHAT_FILES__','mcf233-overlay','tarefas-chat-files','AbortController','X-Tarefas-Session','X-Tarefas-Profile','FormData','MAX_FILES=4'])if(!chat.includes(marker))throw new Error(`mobile-chat-files-v233.js: recurso ausente: ${marker}`);
if(!usersHtml.includes('mobile-chat-files-v233.js')||usersHtml.includes('mobile-chat-files-v232.js'))throw new Error('usuarios.html: patch do chat 2.3.3 incorreto');
console.log('TAREFAS Android 2.3.3 build 233 BETA / Web base 7.8.2: correção de abertura das mensagens.');
