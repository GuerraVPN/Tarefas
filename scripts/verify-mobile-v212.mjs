import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','orcamentarios.html','lavanderia_v211.js','lavanderia_financeiro_v212.js','games.html','games.css','games.js','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','mobile-v196.js','v7_5_1_version.js','v7_6_0_patch.js'];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);
const checks={
 'mobile-bootstrap.js':["const APP_VERSION = '2.1.2'",'const APP_BUILD = 212',"const WEB_VERSION = '7.6.0'",'Lavagem de Forro de Cama'],
 'mobile-preload.js':["tarefasAppVersion = '2.1.2'","tarefasAppBuild = '212'"],
 'mobile-v12.js':['2.1.2 • WEB 7.6.0'],
 'mobile-updates-v181.js':['2.1.2','APP_BUILD = 212',"APP_CHANNEL = 'beta'"],
 'native-mobile.js':['2.1.2','tarefas:update-download-progress'],
 'orcamentarios.html':['lavanderia_v211.js?v=2.1.1','lavanderia_financeiro_v212.js?v=2.1.2'],
 'lavanderia_v211.js':['Lavagem de Forro de Cama','v2_1_1_lavanderia_conferir_recebimento','Débitos Cia Com'],
 'lavanderia_financeiro_v212.js':['lavanderia_financeiro_pe_resumo','lavanderia_financeiro_pe','CRÉDITO / SALDO INFORMADO DO PE','GASTO EM LAVAGENS','SALDO DISPONÍVEL','Movimentações do saldo'],
 'games.html':['games.css?v=2.1.2','games.js?v=2.1.2'],
 'games.js':['APP 2.1.2','WEB 7.6.0'],
 'mobile-v196.js':['Alterar tarefa','v1_9_6_send_message'],
 'v7_5_1_version.js':["VERSION='7.6.0'",'v7_6_0_patch.js']
};
for(const [rel,markers] of Object.entries(checks))if(await exists(rel)){const s=await text(rel);for(const marker of markers)if(!s.includes(marker))errors.push(`${rel}: ${marker}`)}
let total=0;for(const rel of await readdir(root)){try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size}catch{}}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.1.2 build 212 BETA / WEB 7.6.0: ${root}`);console.log(`Tamanho raiz: ${total} bytes`);if(errors.length){for(const e of errors)console.error('ERRO:',e);process.exit(1)}console.log('OK: 2.1.2 beta validada com saldo PE, débito automático das lavagens e histórico financeiro.');
