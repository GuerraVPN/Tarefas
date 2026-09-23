import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','configuracoes.html','orcamentarios.html','pessoal.html','games.html','games.css','games.js','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','v4_tema.js','v4_tema.css','v7_6_8_theme_fix.js','v7_6_9_profile_required.js','v7_5_1_version.js','v7_5_1_about.js'];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);
const checks={
 'mobile-bootstrap.js':["const APP_VERSION = '2.2.0'",'const APP_BUILD = 220',"const WEB_VERSION = '7.6.9'"],
 'mobile-preload.js':["tarefasAppVersion = '2.2.0'","tarefasAppBuild = '220'"],
 'mobile-v12.js':['2.2.0 • WEB 7.6.9'],
 'mobile-updates-v181.js':['2.2.0','APP_BUILD = 220',"APP_CHANNEL = 'official'"],
 'native-mobile.js':['2.2.0'],
 'v7_6_9_profile_required.js':['__TAREFAS_PROFILE_REQUIRED_V769__','Atualização cadastral obrigatória',"from('usuarios').update",'WEB 7.6.9'],
 'v7_5_1_version.js':["VERSION='7.6.9'"],
 'v7_5_1_about.js':["const VERSION='7.6.9';",'Atualização cadastral obrigatória']
};
for(const [rel,markers] of Object.entries(checks))if(await exists(rel)){const s=await text(rel);for(const marker of markers)if(!s.includes(marker))errors.push(`${rel}: ${marker}`)}
const htmls=(await readdir(root)).filter(f=>f.toLowerCase().endsWith('.html'));
if(htmls.length!==17)errors.push(`HTML esperados 17, encontrados ${htmls.length}`);
for(const rel of htmls){const s=await text(rel);if(!s.includes('v7_6_9_profile_required.js?v=2.2.0'))errors.push(`${rel}: sem cadastro obrigatório 7.6.9`);if(s.includes('mobile-profile-required-v217.js'))errors.push(`${rel}: patch beta 2.1.7 ainda carregado`)}
let total=0;for(const rel of await readdir(root)){try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size}catch{}}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.2.0 build 220 OFICIAL / WEB 7.6.9: ${root}`);console.log(`HTML protegidos: ${htmls.length}`);console.log(`Tamanho raiz: ${total} bytes`);if(errors.length){for(const e of errors)console.error('ERRO:',e);process.exit(1)}console.log('OK: 2.2.0 oficial validada com Web 7.6.9 e cadastro obrigatório.');
