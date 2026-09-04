import { access, readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','configuracoes.html','central.html','orcamentarios.html','pessoal.html','missao.html','games.html','menu.html','minhas_tarefas.html','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','mobile-ai-v230.js','perfis.js','v7_5_1_version.js'];
async function exists(r){try{await access(path.join(root,r));return true}catch{return false}}
async function text(r){return readFile(path.join(root,r),'utf8')}
for(const r of required)if(!await exists(r))errors.push(`arquivo ausente: ${r}`);
const markers={
'mobile-bootstrap.js':["const APP_VERSION = '2.3.1'",'const APP_BUILD = 231',"const WEB_VERSION = '7.8.1'"],
'mobile-preload.js':["tarefasAppVersion = '2.3.1'","tarefasAppBuild = '231'"],
'mobile-v12.js':['2.3.1 • WEB 7.8.1'],
'mobile-updates-v181.js':["const APP_VERSION = '2.3.1'",'const APP_BUILD = 231',"const APP_CHANNEL = 'official'"],
'v7_5_1_version.js':['__TAREFAS_V781_VERSION__',"const VERSION='7.8.1'"],
'perfis.js':['tarefasPushSession17','X-Tarefas-Session','X-Tarefas-Profile','__tarefasSecuritySessionBridge']};
for(const[r,ms]of Object.entries(markers))if(await exists(r)){const s=await text(r);for(const m of ms)if(!s.includes(m))errors.push(`${r}: marcador ausente: ${m}`)}
for(const r of (await readdir(root)).filter(n=>n.endsWith('.js'))){const x=spawnSync(process.execPath,['--check',path.join(root,r)],{encoding:'utf8'});if(x.status!==0)errors.push(`${r}: JavaScript inválido: ${x.stderr.trim()}`)}
let total=0;for(const r of await readdir(root)){const i=await stat(path.join(root,r));if(i.isFile())total+=i.size}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.3.1 build 231 / WEB 7.8.1: ${total} bytes.`);
if(errors.length){for(const e of errors)console.error('ERRO: '+e);process.exit(1)}
console.log('OK: versão, sessão RLS e sintaxe validadas.');