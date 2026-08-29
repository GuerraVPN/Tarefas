import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
const errors = [];
const warnings = [];
const required = [
  'index.html','dashboard.html','menu.html','minhas_tarefas.html','calendario.html','pessoal.html',
  'missao.html','ferias_dispensas.html','central.html','usuarios.html','relatorios.html','orcamentarios.html',
  'historico_auditoria.html','configuracoes.html','help.html','about.html',
  'v7_5_3_patch.js','v7_5_1_version.js','v7_5_1_about.js',
  'mobile-preload.js','mobile-bootstrap.js','mobile-v12.js','mobile-login-v17.js','mobile.css','mobile-v18.css','mobile-v181.css','mobile-updates-v181.js','mobile-dashboard-v184.js','native-mobile.js'
];

async function exists(rel){ try{ await access(path.join(root, rel)); return true; }catch{return false;} }
async function text(rel){ return readFile(path.join(root,rel),'utf8'); }

for(const rel of required) if(!await exists(rel)) errors.push(`arquivo ausente: ${rel}`);

for(const rel of (await readdir(root)).filter(x=>x.endsWith('.html'))){
  const html=await text(rel);
  for(const needle of ['mobile-preload.js','mobile.css','mobile-v18.css','mobile-v181.css','mobile-bootstrap.js','native-mobile.js','mobile-updates-v181.js','mobile-dashboard-v184.js']){
    if(!html.includes(needle)) errors.push(`${rel}: injeção ausente: ${needle}`);
  }
  if(rel==='index.html'&&!html.includes('mobile-login-v17.js')) errors.push('index.html: login seguro de push ausente');
}

if(await exists('mobile-preload.js')){
  const s=await text('mobile-preload.js');
  if(!s.includes('__TAREFAS_NATIVE_APP__')) errors.push('mobile-preload.js: flag nativa ausente');
  if(!s.includes("tarefasAppVersion = '1.8.5'")) errors.push('mobile-preload.js: versão 1.8.5 não encontrada');
  if(!s.includes("tarefasAppBuild = '185'")) errors.push('mobile-preload.js: build 185 não encontrado');
  if(!s.includes('v1_7_emitir_sessao_push')) errors.push('mobile-preload.js: compatibilidade da sessão push ausente');
}

if(await exists('mobile-bootstrap.js')){
  const s=await text('mobile-bootstrap.js');
  if(/new\s+MutationObserver/.test(s)) errors.push('mobile-bootstrap.js: MutationObserver global não permitido');
  if(!s.includes("const APP_VERSION = '1.8.5'")) errors.push('mobile-bootstrap.js: APP_VERSION incorreta');
  if(!s.includes('const APP_BUILD = 185')) errors.push('mobile-bootstrap.js: APP_BUILD 185 ausente');
  if(!s.includes("['Desrelacionamento / Baixa','orcamentarios.html?modulo=baixas'")) errors.push('mobile-bootstrap.js: Desrelacionamento não está direto no menu');
  if(s.includes("'#orcamentarios'")) errors.push('mobile-bootstrap.js: submenu Orçamentários legado ainda existe');
  if(!s.includes('Sobre o app')) errors.push('mobile-bootstrap.js: About do app ausente');
}

if(await exists('mobile-updates-v181.js')){
  const s=await text('mobile-updates-v181.js');
  for(const needle of ['1.8.5','APP_BUILD = 185',"APP_CHANNEL = 'beta'",'v1_8_get_beta_updates','v1_8_set_beta_updates','v1_8_latest_app_version','v1_8_app_version_history','Receber versões beta','Baixar e instalar atualização','channel:version.channel','autoInstall:true']){
    if(!s.includes(needle)) errors.push(`mobile-updates-v181.js: recurso ausente: ${needle}`);
  }
  if(/new\s+MutationObserver/.test(s)) errors.push('mobile-updates-v181.js: MutationObserver não permitido');
}

if(await exists('mobile-dashboard-v184.js')){
  const s=await text('mobile-dashboard-v184.js');
  for(const needle of ['Próximo serviço','PREV.','TSV','Escala Preta','Escala Vermelha','escala_integrantes','escala_servicos','pessoal_ferias','rodizio_usuario_id','rodizio_pessoa_externa_id','tarefas_v743_period','pessoal.html']){
    if(!s.includes(needle)) errors.push(`mobile-dashboard-v184.js: recurso ausente: ${needle}`);
  }
  if(/new\s+MutationObserver/.test(s)) errors.push('mobile-dashboard-v184.js: MutationObserver não permitido');
}

if(await exists('mobile-v181.css')){
  const s=await text('mobile-v181.css');
  for(const needle of ['#tmAppUpdates','.tm-update-card','.tm-update-history','.tm-switch','.tm-update-channel.beta']) if(!s.includes(needle)) errors.push(`mobile-v181.css: estilo ausente: ${needle}`);
}

if(await exists('mobile-v18.css')){
  const s=await text('mobile-v18.css');
  if(!s.includes('#tmDrawer .tm-drawer-item')) errors.push('mobile-v18.css: correção do drawer ausente');
  if(!s.includes('.tm-about-page')) errors.push('mobile-v18.css: layout About ausente');
  if(!s.includes('.tm-v18-tabs')) errors.push('mobile-v18.css: tabs universais ausentes');
}

if(await exists('mobile-v12.js')){
  const s=await text('mobile-v12.js');
  if(/new\s+MutationObserver/.test(s)) errors.push('mobile-v12.js: observer recursivo ainda presente');
  if(!s.includes('1.8.5 • WEB 7.5.3')) errors.push('mobile-v12.js: versão visual 1.8.5 / Web 7.5.3 incorreta');
}

if(await exists('mobile-login-v17.js')){
  const s=await text('mobile-login-v17.js');
  if(!s.includes('v1_7_emitir_sessao_push')) errors.push('mobile-login-v17.js: emissão de sessão push ausente');
  if(!s.includes('tarefasPushSession17')) errors.push('mobile-login-v17.js: chave de sessão push ausente');
}

if(await exists('native-mobile.js')){
  const s=await text('native-mobile.js');
  for(const needle of ['tarefasPushReady17','v1_7_registrar_push_device','pushNotificationActionPerformed','localNotificationActionPerformed','1.8.5','tarefas:file-saved','tarefas:file-imported','downloadFile','about.html?update=','Atualização','Beta','Oficial','openFile','application/vnd.android.package-archive','activeUpdateDownloads','reusedExisting','reuseExisting','stat']){
    if(!s.includes(needle)) errors.push(`native-mobile.js: recurso 1.8.5 ausente: ${needle}`);
  }
}

if(await exists('v7_5_3_patch.js')){
  const s=await text('v7_5_3_patch.js');
  for(const needle of ['data-v743-shift','prevMonth','nextMonth','escala_servicos','calendario.html','day-service-v753']) if(!s.includes(needle)) errors.push(`v7_5_3_patch.js: correção web ausente: ${needle}`);
}

if(await exists('v7_5_1_version.js')){
  const s=await text('v7_5_1_version.js');
  if(!s.includes("VERSION='7.5.3'")) errors.push('v7_5_1_version.js: versão Web 7.5.3 ausente');
  if(!s.includes('v7_5_3_patch.js')) errors.push('v7_5_1_version.js: loader do patch V7.5.3 ausente');
  if(/if\(siteTitle\)siteTitle\.textContent=/.test(s)) errors.push('v7_5_1_version.js: escrita recursiva de siteTitle não permitida');
}

if(await exists('v6_2_mobile.js')){
  const s=await text('v6_2_mobile.js');
  if(s.includes('setInterval(()=>{if(install())clearInterval(timer)},0)')) errors.push('v6_2_mobile.js: polling de 0 ms ainda presente');
  if(!s.includes('if(window.__TAREFAS_NATIVE_APP__)return;')) errors.push('v6_2_mobile.js: chrome legado não é bloqueado no APK');
}

const jsFiles=(await readdir(root)).filter(x=>x.endsWith('.js'));
for(const rel of jsFiles){
  const s=await text(rel);
  if(/setInterval\([^\n]{0,180},\s*0\s*\)/.test(s)) warnings.push(`${rel}: possível setInterval de 0 ms`);
}

let total=0;
for(const rel of await readdir(root)){
  try{ const st=await stat(path.join(root,rel)); if(st.isFile()) total+=st.size; }catch{}
}
if(total<100000) errors.push('bundle parece pequeno demais');

console.log(`VERIFY 1.8.5 build 185 BETA / WEB 7.5.3: ${root}`);
console.log(`Arquivos raiz: ${(await readdir(root)).length}`);
console.log(`Tamanho raiz (arquivos): ${total} bytes`);
for(const w of warnings) console.warn('WARN:',w);
if(errors.length){ for(const e of errors) console.error('ERRO:',e); process.exit(1); }
console.log('OK: bundle 1.8.5 passou na verificação preventiva, incluindo pasta por canal, reuso do APK e abertura automática do instalador.');
