import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','configuracoes.html','orcamentarios.html','pessoal.html','games.html','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','v7_6_8_theme_fix.js','mobile-profile-required-v217.js'];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);
const checks={
 'mobile-bootstrap.js':["const APP_VERSION = '2.1.7'",'const APP_BUILD = 217',"const WEB_VERSION = '7.6.8'"],
 'mobile-preload.js':["tarefasAppVersion = '2.1.7'","tarefasAppBuild = '217'"],
 'mobile-v12.js':['2.1.7 • WEB 7.6.8'],
 'mobile-updates-v181.js':['2.1.7','APP_BUILD = 217',"APP_CHANNEL = 'beta'"],
 'native-mobile.js':['2.1.7'],
 'configuracoes.html':['mobile-profile-required-v217.js?v=2.1.7'],
 'dashboard.html':['mobile-profile-required-v217.js?v=2.1.7'],
 'index.html':['mobile-profile-required-v217.js?v=2.1.7'],
 'mobile-profile-required-v217.js':['__TAREFAS_PROFILE_REQUIRED_V217__','Atualização cadastral obrigatória','validCpf','validPhone','validEmail',"from('usuarios').update",'Salvar dados e continuar','cadastro_obrigatorio=1']
};
for(const [rel,markers] of Object.entries(checks))if(await exists(rel)){const s=await text(rel);for(const marker of markers)if(!s.includes(marker))errors.push(`${rel}: ${marker}`)}
if(await exists('mobile-profile-required-v217.js')){
 const s=await text('mobile-profile-required-v217.js');
 if(!s.includes("Number(u?.id)===1"))errors.push('gate: Admin não está explicitamente preservado');
 if(!s.includes("/^0{9}\\d{2}$/"))errors.push('gate: CPF padrão não está identificado');
}
let htmlCount=0;for(const rel of await readdir(root)){if(!rel.toLowerCase().endsWith('.html'))continue;htmlCount++;const s=await text(rel);if(!s.includes('mobile-profile-required-v217.js?v=2.1.7'))errors.push(`${rel}: gate obrigatório não injetado`)}
if(htmlCount<10)errors.push(`poucas telas HTML verificadas: ${htmlCount}`);
let total=0;for(const rel of await readdir(root)){try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size}catch{}}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.1.7 build 217 BETA / WEB 7.6.8: ${root}`);console.log(`HTML protegidos: ${htmlCount}`);console.log(`Tamanho raiz: ${total} bytes`);if(errors.length){for(const e of errors)console.error('ERRO:',e);process.exit(1)}console.log('OK: beta 2.1.7 validada com CPF, telefone e e-mail obrigatórios.');
