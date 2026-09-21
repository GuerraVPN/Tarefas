import { access, readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','central.html','usuarios.html','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','mobile-ai-v230.js','mobile-chat-files-v233.js','mobile-chat-fix-v234.js','mobile-chat-fit-v235.js','mobile-chat-fit-v236.js'];
async function exists(r){try{await access(path.join(root,r));return true}catch{return false}}async function text(r){return readFile(path.join(root,r),'utf8')}
for(const r of required)if(!await exists(r))errors.push(`arquivo ausente: ${r}`);
const markers={
'mobile-bootstrap.js':["const APP_VERSION = '2.3.6'",'const APP_BUILD = 236',"const WEB_VERSION = '7.8.2'",'tm-bottom-nav','tm-app-header'],
'mobile-preload.js':["tarefasAppVersion = '2.3.6'","tarefasAppBuild = '236'"],
'mobile-v12.js':['2.3.6 • WEB 7.8.2'],
'mobile-updates-v181.js':["const APP_VERSION = '2.3.6'",'const APP_BUILD = 236',"const APP_CHANNEL = 'beta'"],
'mobile-chat-fit-v236.js':['__TAREFAS_ANDROID_236_CHAT_REAL_AUTOFIT__','.tm-app-header','.tm-bottom-nav','visualViewport','ResizeObserver','--mcf236-top','--mcf236-bottom','dataset.fitTop','2147483400'],
'usuarios.html':['mobile-chat-files-v233.js','mobile-chat-fix-v234.js','mobile-chat-fit-v235.js','mobile-chat-fit-v236.js'],
'central.html':['mobile-chat-fix-v234.js','mobile-chat-fit-v235.js','mobile-chat-fit-v236.js'],
'mobile-ai-v230.js':['tarefas-ai-files','confirm_action']};
for(const[r,ms]of Object.entries(markers))if(await exists(r)){const s=await text(r);for(const m of ms)if(!s.includes(m))errors.push(`${r}: marcador ausente: ${m}`);for(const secret of ['GEMINI_API_KEY','OPENAI_API_KEY','SUPABASE_SERVICE_ROLE_KEY','sk-proj-'])if(s.includes(secret))errors.push(`${r}: segredo proibido: ${secret}`)}
for(const r of (await readdir(root)).filter(n=>n.endsWith('.js'))){const x=spawnSync(process.execPath,['--check',path.join(root,r)],{encoding:'utf8'});if(x.status!==0)errors.push(`${r}: JavaScript inválido: ${x.stderr.trim()}`)}
let total=0;for(const r of await readdir(root)){const i=await stat(path.join(root,r));if(i.isFile())total+=i.size}if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.3.6 build 236 BETA / WEB BASE 7.8.2: ${total} bytes.`);if(errors.length){for(const e of errors)console.error('ERRO: '+e);process.exit(1)}console.log('OK: chat usa geometria real de .tm-app-header/.tm-bottom-nav e visualViewport para teclado.');
