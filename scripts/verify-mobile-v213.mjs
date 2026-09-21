import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','orcamentarios.html','lavanderia_v211.js','lavanderia_financeiro_v212.js','lavanderia_layout_v212.js','lavanderia_documento_v762.js','games.html','games.css','games.js','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','mobile-v196.js','pessoal_v7.js','ferias_dispensas_v721.js','aditamento_v74.js','v7_5_1_version.js','v7_5_1_about.js','v7_6_0_patch.js'];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);
const checks={
 'mobile-bootstrap.js':["const APP_VERSION = '2.1.3'",'const APP_BUILD = 213',"const WEB_VERSION = '7.6.2'",'Lavagem de Forro de Cama'],
 'mobile-preload.js':["tarefasAppVersion = '2.1.3'","tarefasAppBuild = '213'"],
 'mobile-v12.js':['2.1.3 • WEB 7.6.2'],
 'mobile-updates-v181.js':['2.1.3','APP_BUILD = 213',"APP_CHANNEL = 'beta'"],
 'native-mobile.js':['2.1.3','tarefas:update-download-progress'],
 'orcamentarios.html':['lavanderia_v211.js?v=2.1.3','lavanderia_financeiro_v212.js?v=2.1.3','lavanderia_layout_v212.js?v=2.1.3','lavanderia_documento_v762.js?v=2.1.3'],
 'lavanderia_v211.js':['Lavagem de Forro de Cama','ORÇAMENTÁRIO · BETA 2.1.3','v2_1_1_lavanderia_conferir_recebimento','Débitos Cia Com'],
 'lavanderia_financeiro_v212.js':['SALDO DISPONÍVEL','Movimentações do saldo'],
 'lavanderia_layout_v212.js':['max-height:calc(100dvh','position:sticky'],
 'lavanderia_documento_v762.js':['application/vnd.oasis.opendocument.text','Forro de Cama para Lavar','Quem mandou lavar','Quem recebeu','TarefasNative?.files?.saveBlob'],
 'games.html':['games.css?v=2.1.3','games.js?v=2.1.3'],
 'games.js':['APP 2.1.3','WEB 7.6.2'],
 'mobile-v196.js':['Alterar tarefa','v1_9_6_send_message'],
 'pessoal_v7.js':['function adaptationDate','adaptationDate(v.data_fim)===date'],
 'ferias_dispensas_v721.js':['function adaptationDate','br(adaptationDate(v.data_fim))'],
 'aditamento_v74.js':['function adaptationDate','adaptationDate(v.data_fim)===date'],
 'v7_5_1_version.js':["VERSION='7.6.2'",'v7_6_0_patch.js'],
 'v7_5_1_about.js':["const VERSION='7.6.2';","Arquivo ODT da Lavagem de Forro de Cama"]
};
for(const [rel,markers] of Object.entries(checks))if(await exists(rel)){const s=await text(rel);for(const marker of markers)if(!s.includes(marker))errors.push(`${rel}: ${marker}`)}
let total=0;for(const rel of await readdir(root)){try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size}catch{}}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.1.3 build 213 BETA / WEB 7.6.2: ${root}`);console.log(`Tamanho raiz: ${total} bytes`);if(errors.length){for(const e of errors)console.error('ERRO:',e);process.exit(1)}console.log('OK: 2.1.3 beta validada com geração ODT da Lavagem e Base Web 7.6.2.');
