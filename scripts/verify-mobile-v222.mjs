import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','configuracoes.html','central.html','orcamentarios.html','pessoal.html','games.html','menu.html','minhas_tarefas.html','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','notificacoes.js','central.js','v7_6_8_theme_fix.js','v7_6_9_profile_required.js','v7_5_1_version.js','v7_5_1_about.js'];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);
const checks={
 'mobile-bootstrap.js':["const APP_VERSION = '2.2.2'",'const APP_BUILD = 222',"const WEB_VERSION = '7.6.11'"],
 'mobile-preload.js':["tarefasAppVersion = '2.2.2'","tarefasAppBuild = '222'"],
 'mobile-v12.js':['2.2.2 • WEB 7.6.11'],
 'mobile-updates-v181.js':['2.2.2','APP_BUILD = 222',"APP_CHANNEL = 'beta'"],
 'native-mobile.js':['2.2.2','removeDeliveredNotifications','getDeliveredNotifications','TAREFAS NOTIF'],
 'notificacoes.js':['app_update_reminder','__TAREFAS_NATIVE_APP__'],
 'central.js':['app_update_reminder','__TAREFAS_NATIVE_APP__'],
 'v7_6_9_profile_required.js':['__TAREFAS_PROFILE_REQUIRED_V769__','Atualização cadastral obrigatória',"from('usuarios').update"],
 'v7_5_1_version.js':["VERSION='7.6.11'"],
 'v7_5_1_about.js':["const VERSION='7.6.11';",'Notificações sem avisar o próprio autor'],
 'menu.html':['atualizado_por:Number(usuarioLogado.id)','atualizado_por_perfil_id'],
 'minhas_tarefas.html':['atualizado_por:Number(usuarioLogado.id)','atualizado_por_perfil_id']
};
for(const [rel,markers] of Object.entries(checks))if(await exists(rel)){const s=await text(rel);for(const marker of markers)if(!s.includes(marker))errors.push(`${rel}: ${marker}`)}
const htmls=(await readdir(root)).filter(f=>f.toLowerCase().endsWith('.html'));
if(htmls.length!==17)errors.push(`HTML esperados 17, encontrados ${htmls.length}`);
for(const rel of htmls){
 const s=await text(rel);
 if(!s.includes('v7_6_9_profile_required.js?v=2.2.2'))errors.push(`${rel}: sem cadastro obrigatório 7.6.9 / cache 2.2.2`);
 if(s.includes('mobile-profile-required-v217.js'))errors.push(`${rel}: patch beta 2.1.7 ainda carregado`);
}
for(const rel of ['menu.html','minhas_tarefas.html']){
 const s=await text(rel);
 const needle=".from('tarefas').update({";
 const actor=".from('tarefas').update({atualizado_por:Number(usuarioLogado.id),atualizado_por_perfil_id:usuarioPerfilAtual?.perfil_id?Number(usuarioPerfilAtual.perfil_id):null,";
 if(s.replaceAll(actor,'').includes(needle))errors.push(`${rel}: existe update direto de tarefa sem autor`);
}
let total=0;for(const rel of await readdir(root)){try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size}catch{}}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.2.2 build 222 BETA / WEB 7.6.11: ${root}`);
console.log(`HTML protegidos: ${htmls.length}`);
console.log(`Tamanho raiz: ${total} bytes`);
if(errors.length){for(const e of errors)console.error('ERRO:',e);process.exit(1)}
console.log('OK: 2.2.2 beta validada com Web 7.6.11, cadastro obrigatório, descarte ao toque e sem auto-notificações do autor.');
