import { access, readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','central.html','usuarios.html','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','mobile-ai-v230.js','mobile-ai-tools-v237.js','mobile-ai-auto-file-v238.js','mobile-chat-files-v233.js','mobile-chat-fix-v234.js','mobile-chat-fit-v235.js','mobile-chat-fit-v236.js','missao_v74.js'];
async function exists(r){try{await access(path.join(root,r));return true}catch{return false}}
async function text(r){return readFile(path.join(root,r),'utf8')}
for(const r of required)if(!await exists(r))errors.push(`arquivo ausente: ${r}`);
const markers={
'mobile-bootstrap.js':["const APP_VERSION = '2.3.8'",'const APP_BUILD = 238',"const WEB_VERSION = '7.8.2'"],
'mobile-preload.js':["tarefasAppVersion = '2.3.8'","tarefasAppBuild = '238'"],
'mobile-v12.js':['2.3.8 • WEB 7.8.2'],
'mobile-updates-v181.js':["const APP_VERSION = '2.3.8'",'const APP_BUILD = 238',"const APP_CHANNEL = 'beta'"],
'mobile-ai-tools-v237.js':['__TAREFAS_ANDROID_237_AI_TOOLS__','📋 Copiar','📄 Arquivo','docxBlob','odtBlob','pdfBlob'],
'mobile-ai-auto-file-v238.js':['__TAREFAS_ANDROID_238_AI_AUTO_FILE__','requestedFormat','isFileRequest','Pedido de arquivo detectado','BETA 2.3.8'],
'missao_v74.js':['__TAREFAS_ANDROID_237_MISSION_DEDUPE__'],
'mobile-chat-fit-v236.js':['__TAREFAS_ANDROID_236_CHAT_REAL_AUTOFIT__','.tm-app-header','.tm-bottom-nav','visualViewport']};
for(const[r,ms]of Object.entries(markers))if(await exists(r)){const s=await text(r);for(const m of ms)if(!s.includes(m))errors.push(`${r}: marcador ausente: ${m}`);for(const secret of ['GEMINI_API_KEY','OPENAI_API_KEY','SUPABASE_SERVICE_ROLE_KEY','sk-proj-'])if(s.includes(secret))errors.push(`${r}: segredo proibido: ${secret}`)}
for(const name of ['central.html','usuarios.html','missao.html','minhas_tarefas.html'])if(await exists(name)){const s=await text(name);if(!s.includes('mobile-ai-auto-file-v238.js'))errors.push(`${name}: auto arquivo 2.3.8 não injetado`)}
for(const r of (await readdir(root)).filter(n=>n.endsWith('.js'))){const x=spawnSync(process.execPath,['--check',path.join(root,r)],{encoding:'utf8'});if(x.status!==0)errors.push(`${r}: JavaScript inválido: ${x.stderr.trim()}`)}
let total=0;for(const r of await readdir(root)){const i=await stat(path.join(root,r));if(i.isFile())total+=i.size}if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.3.8 build 238 BETA / WEB BASE 7.8.2: ${total} bytes.`);if(errors.length){for(const e of errors)console.error('ERRO: '+e);process.exit(1)}console.log('OK: IA gera automaticamente PDF/DOCX/ODT/TXT/MD/CSV/JSON/HTML quando o usuário pede um arquivo.');