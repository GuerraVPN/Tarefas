import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v231.mjs')).href+'?v=232');
const dist=path.join(root,'dist');
async function replaceRequired(rel,replacements){const file=path.join(dist,rel);let source=await readFile(file,'utf8');for(const[from,to]of replacements){if(!source.includes(from))throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);source=source.split(from).join(to)}await writeFile(file,source,'utf8')}
for(const name of await readdir(dist)){if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;const file=path.join(dist,name);let source=await readFile(file,'utf8');source=source.replaceAll('2.3.1','2.3.2').replaceAll('7.8.1','7.8.2');await writeFile(file,source,'utf8')}
await replaceRequired('mobile-bootstrap.js',[["const APP_BUILD = 231;","const APP_BUILD = 232;"]]);
await replaceRequired('mobile-preload.js',[["tarefasAppBuild = '231'","tarefasAppBuild = '232'"]]);
await replaceRequired('mobile-updates-v181.js',[["const APP_BUILD = 231;","const APP_BUILD = 232;"],["const APP_CHANNEL = 'official';","const APP_CHANNEL = 'beta';"]]);
await replaceRequired('v7_5_1_version.js',[['__TAREFAS_V781_VERSION__','__TAREFAS_V782_VERSION__']]);

// Recursos exclusivos do APK nesta beta.
await copyFile(path.join(root,'app','mobile-chat-files-v232.js'),path.join(dist,'mobile-chat-files-v232.js'));
const usersFile=path.join(dist,'usuarios.html');let usersHtml=await readFile(usersFile,'utf8');
if(!usersHtml.includes('mobile-chat-files-v232.js'))usersHtml=usersHtml.replace(/<\/body>/i,'  <script src="mobile-chat-files-v232.js?v=2.3.2"></script>\n</body>');
await writeFile(usersFile,usersHtml,'utf8');

const ai=await readFile(path.join(dist,'mobile-ai-v230.js'),'utf8');
for(const marker of ['__TAREFAS_ANDROID_232_AI__','X-Tarefas-Profile','confirm_action','cancel_action','pending_action','leitura + ações + anexos','tarefas-ai-files','data-file-input'])if(!ai.includes(marker))throw new Error(`mobile-ai-v230.js: recurso IA ausente: ${marker}`);
const chat=await readFile(path.join(dist,'mobile-chat-files-v232.js'),'utf8');
for(const marker of ['__TAREFAS_ANDROID_232_CHAT_FILES__','tarefas-chat-files','X-Tarefas-Session','X-Tarefas-Profile','FormData','MAX_FILES=4'])if(!chat.includes(marker))throw new Error(`mobile-chat-files-v232.js: recurso ausente: ${marker}`);
if(!usersHtml.includes('mobile-chat-files-v232.js'))throw new Error('usuarios.html: patch de anexos do chat não injetado');
console.log('TAREFAS Android 2.3.2 build 232 BETA / Web base 7.8.2: IA e chat normal com anexos.');
