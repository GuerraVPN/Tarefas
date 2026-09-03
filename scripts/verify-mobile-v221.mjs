import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','configuracoes.html','central.html','orcamentarios.html','pessoal.html','games.html','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','notificacoes.js','central.js','v7_6_8_theme_fix.js','v7_6_9_profile_required.js','v7_5_1_version.js','v7_5_1_about.js'];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);
const checks={
 'mobile-bootstrap.js':["const APP_VERSION = '2.2.1'",'const APP_BUILD = 221',"const WEB_VERSION = '7.6.10'"],
 'mobile-preload.js':["tarefasAppVersion = '2.2.1'","tarefasAppBuild = '221'"],
 'mobile-v12.js':['2.2.1 • WEB 7.6.10'],
 'mobile-updates-v181.js':['2.2.1','APP_BUILD = 221',"APP_CHANNEL = 'beta'"],
 'native-mobile.js':['2.2.1','removeDeliveredNotifications','getDeliveredNotifications','TAREFAS NOTIF'],
 'notificacoes.js':['app_update_reminder','__TAREFAS_NATIVE_APP__'],
 'central.js':['app_update_reminder','__TAREFAS_NATIVE_APP__'],
 'v7_6_9_profile_required.js':['__TAREFAS_PROFILE_REQUIRED_V769__','Atualização cadastral obrigatória',"from('usuarios').update"],
 'v7_5_1_version.js':["VERSION='7.6.10'"],
 'v7_5_1_about.js':["const VERSION='7.6.10';",'Atualizações do Android exclusivas do aplicativo']
};
for(const [rel,markers] of Object.entries(checks))if(await exists(rel)){const s=await text(rel);for(const marker of markers)if(!s.includes(marker))errors.push(`${rel}: ${marker}`)}
const htmls=(await readdir(root)).filter(f=>f.toLowerCase().endsWith('.html'));
if(htmls.length!==17)errors.push(`HTML esperados 17, encontrados ${htmls.length}`);
for(const rel of htmls){
 const s=await text(rel);
 if(!s.includes('v7_6_9_profile_required.js?v=2.2.1'))errors.push(`${rel}: sem cadastro obrigatório 7.6.9 / cache 2.2.1`);
 if(s.includes('mobile-profile-required-v217.js'))errors.push(`${rel}: patch beta 2.1.7 ainda carregado`);
}
let total=0;for(const rel of await readdir(root)){try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size}catch{}}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.2.1 build 221 BETA / WEB 7.6.10: ${root}`);
console.log(`HTML protegidos: ${htmls.length}`);
console.log(`Tamanho raiz: ${total} bytes`);
if(errors.length){for(const e of errors)console.error('ERRO:',e);process.exit(1)}
console.log('OK: 2.2.1 beta validada com Web 7.6.10, cadastro obrigatório e descarte de notificações ao toque.');
