import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
const errors = [];
const warnings = [];
const required = [
  'index.html','dashboard.html','menu.html','minhas_tarefas.html','calendario.html','pessoal.html',
  'mobile-preload.js','mobile-bootstrap.js','mobile-v12.js','mobile-login-v17.js','mobile.css','native-mobile.js'
];

async function exists(rel){
  try{ await access(path.join(root, rel)); return true; }catch{return false;}
}
async function text(rel){return readFile(path.join(root,rel),'utf8');}

for(const rel of required){if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);}

for(const rel of (await readdir(root)).filter(x=>x.endsWith('.html'))){
  const html=await text(rel);
  for(const needle of ['mobile-preload.js','mobile.css','mobile-bootstrap.js','native-mobile.js']){
    if(!html.includes(needle))errors.push(`${rel}: injeção ausente: ${needle}`);
  }
  if(rel==='index.html'&&!html.includes('mobile-login-v17.js'))errors.push('index.html: login seguro de push V1.7 ausente');
}

if(await exists('mobile-preload.js')){
  const s=await text('mobile-preload.js');
  if(!s.includes('__TAREFAS_NATIVE_APP__'))errors.push('mobile-preload.js: flag nativa ausente');
  if(!s.includes("tarefasAppVersion = '1.7'"))errors.push('mobile-preload.js: versão 1.7 não encontrada');
}
if(await exists('mobile-bootstrap.js')){
  const s=await text('mobile-bootstrap.js');
  if(/new\s+MutationObserver/.test(s))errors.push('mobile-bootstrap.js: MutationObserver global não permitido');
}
if(await exists('mobile-v12.js')){
  const s=await text('mobile-v12.js');
  if(/new\s+MutationObserver/.test(s))errors.push('mobile-v12.js: observer recursivo ainda presente');
  if(!s.includes('V1.7 • WEB 7.5.2'))errors.push('mobile-v12.js: versão visual V1.7 incorreta');
}
if(await exists('mobile-login-v17.js')){
  const s=await text('mobile-login-v17.js');
  if(!s.includes('v1_7_emitir_sessao_push'))errors.push('mobile-login-v17.js: emissão de sessão push ausente');
  if(!s.includes('tarefasPushSession17'))errors.push('mobile-login-v17.js: chave de sessão push ausente');
}
if(await exists('native-mobile.js')){
  const s=await text('native-mobile.js');
  if(!s.includes('tarefasPushReady17'))errors.push('native-mobile.js: registro remoto V1.7 ausente');
  if(!s.includes('v1_7_registrar_push_device'))errors.push('native-mobile.js: RPC de registro FCM ausente');
  if(!s.includes('pushNotificationActionPerformed'))errors.push('native-mobile.js: abertura por toque no push ausente');
}
if(await exists('v6_2_mobile.js')){
  const s=await text('v6_2_mobile.js');
  if(s.includes('setInterval(()=>{if(install())clearInterval(timer)},0)'))errors.push('v6_2_mobile.js: polling de 0 ms ainda presente');
  if(!s.includes('if(window.__TAREFAS_NATIVE_APP__)return;'))errors.push('v6_2_mobile.js: chrome legado não é bloqueado no APK');
}
for(const rel of ['v7_5_1_version.js','v7_5_2_version.js']){
  if(!await exists(rel)){warnings.push(`${rel}: não encontrado`);continue;}
  const s=await text(rel);
  if(/if\(siteTitle\)siteTitle\.textContent=/.test(s))errors.push(`${rel}: escrita recursiva de siteTitle ainda presente`);
}

const jsFiles=(await readdir(root)).filter(x=>x.endsWith('.js'));
for(const rel of jsFiles){
  const s=await text(rel);
  if(/setInterval\([^\n]{0,180},\s*0\s*\)/.test(s))warnings.push(`${rel}: possível setInterval de 0 ms`);
}

let total=0;
for(const rel of await readdir(root)){
  try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size;}catch{}
}
if(total<100000)errors.push('bundle parece pequeno demais');

console.log(`VERIFY V1.7: ${root}`);
console.log(`Arquivos raiz: ${(await readdir(root)).length}`);
console.log(`Tamanho raiz (arquivos): ${total} bytes`);
for(const w of warnings)console.warn('WARN:',w);
if(errors.length){
  for(const e of errors)console.error('ERRO:',e);
  process.exit(1);
}
console.log('OK: bundle V1.7 passou na verificação preventiva de estabilidade e push.');
