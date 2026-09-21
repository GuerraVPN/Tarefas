import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','configuracoes.html','orcamentarios.html','pessoal.html','pessoal_v7.js','games.html','games.css','games.js','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','v4_tema.js','v4_tema.css','v7_6_8_theme_fix.js','v7_5_1_version.js','v7_5_1_about.js'];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);
const checks={
 'mobile-bootstrap.js':["const APP_VERSION = '2.1.6'",'const APP_BUILD = 216',"const WEB_VERSION = '7.6.8'"],
 'mobile-preload.js':["tarefasAppVersion = '2.1.6'","tarefasAppBuild = '216'"],
 'mobile-v12.js':['2.1.6 • WEB 7.6.8'],
 'mobile-updates-v181.js':['2.1.6','APP_BUILD = 216',"APP_CHANNEL = 'beta'"],
 'native-mobile.js':['2.1.6'],
 'configuracoes.html':['v4_tema.js?v=2.1.6','v7_6_8_theme_fix.js?v=2.1.6'],
 'v7_6_8_theme_fix.js':['__TAREFAS_V768_THEME_FIX__','data-theme-choice','saveDb(theme)','--v4-bg','MutationObserver'],
 'v7_5_1_version.js':["VERSION='7.6.8'",'v7_6_8_theme_fix.js'],
 'v7_5_1_about.js':["const VERSION='7.6.8';",'Troca de tema corrigida no site e aplicativo']
};
for(const [rel,markers] of Object.entries(checks))if(await exists(rel)){const s=await text(rel);for(const marker of markers)if(!s.includes(marker))errors.push(`${rel}: ${marker}`)}
let total=0;for(const rel of await readdir(root)){try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size}catch{}}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.1.6 build 216 BETA / WEB 7.6.8: ${root}`);console.log(`Tamanho raiz: ${total} bytes`);if(errors.length){for(const e of errors)console.error('ERRO:',e);process.exit(1)}console.log('OK: 2.1.6 beta validada com troca imediata e persistente dos temas.');
