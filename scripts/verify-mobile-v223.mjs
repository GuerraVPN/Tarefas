import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','configuracoes.html','central.html','orcamentarios.html','pessoal.html','games.html','menu.html','minhas_tarefas.html','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','notificacoes.js','central.js','v7_6_8_theme_fix.js','v7_6_9_profile_required.js','v7_5_1_version.js','v7_5_1_about.js','v7_7_0_material_carga.js','v4_ui.js'];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);
const checks={
 'mobile-bootstrap.js':["const APP_VERSION = '2.2.3'",'const APP_BUILD = 223',"const WEB_VERSION = '7.7.0'"],
 'mobile-preload.js':["tarefasAppVersion = '2.2.3'","tarefasAppBuild = '223'"],
 'mobile-v12.js':['2.2.3 • WEB 7.7.0'],
 'mobile-updates-v181.js':['2.2.3','APP_BUILD = 223',"APP_CHANNEL = 'beta'"],
 'native-mobile.js':['2.2.3','removeDeliveredNotifications','getDeliveredNotifications','TAREFAS NOTIF'],
 'v7_6_9_profile_required.js':['__TAREFAS_PROFILE_REQUIRED_V769__','Atualização cadastral obrigatória'],
 'v7_5_1_version.js':["VERSION='7.7.0'"],
 'v7_5_1_about.js':["const VERSION='7.7.0';",'Material Carga sempre atualizado'],
 'v7_7_0_material_carga.js':['cargaConferidoPor','v7_7_0_registrar_documento_carga','orc_carga_pendencias'],
 'orcamentarios.html':['v7_7_0_material_carga.js?v=2.2.3'],
 'about.html':['v7_5_1_about.js?v=2.2.3','<b>7.7.0</b>'],
 'v4_ui.js':["navItem('about','About','about.html'"],
 'menu.html':['atualizado_por:Number(usuarioLogado.id)','atualizado_por_perfil_id'],
 'minhas_tarefas.html':['atualizado_por:Number(usuarioLogado.id)','atualizado_por_perfil_id']
};
for(const [rel,markers] of Object.entries(checks))if(await exists(rel)){const s=await text(rel);for(const marker of markers)if(!s.includes(marker))errors.push(`${rel}: marcador ausente: ${marker}`)}
const htmls=(await readdir(root)).filter(f=>f.toLowerCase().endsWith('.html'));
if(htmls.length<17)errors.push(`HTML esperados pelo menos 17, encontrados ${htmls.length}`);
for(const rel of htmls){
 const s=await text(rel);
 if(!s.includes('v7_6_9_profile_required.js?v=2.2.3'))errors.push(`${rel}: sem cadastro obrigatório / cache 2.2.3`);
 if(s.includes('mobile-profile-required-v217.js'))errors.push(`${rel}: patch beta 2.1.7 ainda carregado`);
}
let total=0;for(const rel of await readdir(root)){try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size}catch{}}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.2.3 build 223 BETA / WEB 7.7.0: ${root}`);
console.log(`HTML protegidos: ${htmls.length}`);
console.log(`Tamanho raiz: ${total} bytes`);
if(errors.length){for(const e of errors)console.error('ERRO:',e);process.exit(1)}
console.log('OK: 2.2.3 beta validada com Web 7.7.0, Material Carga, Quem conferiu e About corrigido.');
