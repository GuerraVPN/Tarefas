import { access, readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
const errors = [];
const required = [
  'index.html','dashboard.html','about.html','configuracoes.html','central.html','orcamentarios.html',
  'pessoal.html','missao.html','games.html','menu.html','minhas_tarefas.html','mobile-bootstrap.js',
  'mobile-preload.js','mobile-login-v17.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js',
  'mobile-ai-v228.js','v7_5_1_version.js','v7_7_0_material_carga.js','v7_7_2_scale_export.js',
  'v7_7_2_site_patch.js','v7_6_5_webfix.js','v6_2_mobile.js','v6_5_patch.js','v7_4_12_site.js','v7_4_12_global.js'
];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);

console.log('CONFERÊNCIA 1/3 — Integridade e versão 2.2.8 / Web 7.7.2');
const markers={
 'mobile-bootstrap.js':["const APP_VERSION = '2.2.8'",'const APP_BUILD = 228',"const WEB_VERSION = '7.7.2'"],
 'mobile-preload.js':["tarefasAppVersion = '2.2.8'","tarefasAppBuild = '228'"],
 'mobile-v12.js':['2.2.8 • WEB 7.7.2'],
 'mobile-updates-v181.js':["const APP_VERSION = '2.2.8'",'const APP_BUILD = 228',"const APP_CHANNEL = 'beta'"],
 'mobile-login-v17.js':['v7_7_1_autenticar_usuario','session_token'],
 'native-mobile.js':['2.2.8','tarefas:update-download-progress'],
 'v7_5_1_version.js':['__TAREFAS_V772_VERSION__',"const VERSION='7.7.2'"],
 'v7_7_2_site_patch.js':['__TAREFAS_V772_SITE_PATCH__',"const VERSION='7.7.2'"],
 'v7_7_2_scale_export.js':['__TAREFAS_V772_SCALE_EXPORT__','application/vnd.oasis.opendocument.text','TarefasNative?.files?.saveBlob'],
 'index.html':['v7_7_1_autenticar_usuario','mobile-login-v17.js','mobile-ai-v228.js']
};
for(const [rel,expected] of Object.entries(markers))if(await exists(rel)){const source=await text(rel);for(const marker of expected)if(!source.includes(marker))errors.push(`${rel}: marcador ausente: ${marker}`)}
const entries=await readdir(root),htmlFiles=entries.filter(n=>n.endsWith('.html'));
for(const rel of htmlFiles){
  const html=await text(rel);
  for(const asset of ['mobile-preload.js','mobile.css','mobile-bootstrap.js','native-mobile.js','mobile-updates-v181.js','mobile-ai-v228.js'])if(!html.includes(asset))errors.push(`${rel}: injeção ausente: ${asset}`);
  if(html.includes('mobile-ai-v227.js'))errors.push(`${rel}: cliente antigo da IA ainda referenciado`);
  if(html.includes('?v=2.2.7'))errors.push(`${rel}: cache da beta anterior no APK`);
}
if(await exists('mobile-ai-v227.js'))errors.push('cliente antigo mobile-ai-v227.js não deveria estar no pacote 2.2.8');
for(const rel of entries.filter(n=>n.endsWith('.js'))){const r=spawnSync(process.execPath,['--check',path.join(root,rel)],{encoding:'utf8'});if(r.status!==0)errors.push(`${rel}: JavaScript inválido: ${r.stderr.trim()}`)}

console.log('CONFERÊNCIA 2/3 — IA visível, painel livre e erros do provedor diferenciados');
if(await exists('mobile-ai-v228.js')){
  const s=await text('mobile-ai-v228.js');
  for(const marker of [
    '__TAREFAS_ANDROID_228_AI__','tarefasPushSession17','/functions/v1/tarefas-ai',
    "'X-Tarefas-Session': session",'BETA 2.2.8 · somente leitura',
    "page() === 'index.html'",'.bn-panel.open .bn-close','MAX_LOCAL_MESSAGES = 20',
    'bottom:calc(150px + env(safe-area-inset-bottom,0px))','z-index:10025',
    'z-index:10050','body.ai228-open .bn-fab{display:none!important}',
    'bottom:calc(82px + env(safe-area-inset-bottom,0px))',
    "document.body.classList.toggle('ai228-open', value)",
    "code === 'provider_auth'","code === 'provider_unavailable'","code === 'provider_network'"
  ]) if(!s.includes(marker)) errors.push(`mobile-ai-v228.js: recurso ausente: ${marker}`);
  for(const forbidden of ['GEMINI_API_KEY','OPENAI_API_KEY','sk-proj-']) if(s.includes(forbidden)) errors.push(`mobile-ai-v228.js: segredo/referência proibida no cliente: ${forbidden}`);
}
const perf={
 'v6_2_mobile.js':['__TAREFAS_V228_LIGHT_LOADER__',"['games.html','about.html','orcamentarios.html']"],
 'v6_5_patch.js':['window.__TAREFAS_NATIVE_APP__?60000:30000','if(window.__TAREFAS_NATIVE_APP__)return;'],
 'v7_4_12_site.js':['window.__TAREFAS_NATIVE_APP__?30000:5000'],
 'v7_4_12_global.js':['window.__TAREFAS_NATIVE_APP__?120000:30000',"if(!window.__TAREFAS_NATIVE_APP__)renderAdminOnline()"],
 'v7_5_1_version.js':['if(window.__TAREFAS_NATIVE_APP__)return;','window.__TAREFAS_NATIVE_APP__?30000:5000']
};
for(const [rel,expected] of Object.entries(perf))if(await exists(rel)){const source=await text(rel);for(const marker of expected)if(!source.includes(marker))errors.push(`${rel}: desempenho ausente: ${marker}`)}

console.log('CONFERÊNCIA 3/3 — Regressões de Material Carga e exportação preservadas');
if(await exists('v7_7_0_material_carga.js')){const source=await text('v7_7_0_material_carga.js');for(const marker of ["days=type==='deposito'?30:90","p_motivo_atualizacao:hasPending?'pos_processo':'periodica'",'detectProcessCompletion','bindProcessWatcher','moduloCargaAtivo()','setInterval(()=>{if(moduloCargaAtivo())refresh(true)},300000)'])if(!source.includes(marker))errors.push(`v7_7_0_material_carga.js: regra ausente: ${marker}`)}
if(await exists('v7_7_2_scale_export.js')){const s=await text('v7_7_2_scale_export.js');for(const marker of ["const service=page==='pessoal.html'", "mission=page==='missao.html'", 'function odtBlob', 'function pdfBlob'])if(!s.includes(marker))errors.push(`v7_7_2_scale_export.js: recurso ausente: ${marker}`)}
let total=0;for(const rel of entries){const info=await stat(path.join(root,rel));if(info.isFile())total+=info.size}
if(htmlFiles.length<17)errors.push(`HTML esperados pelo menos 17, encontrados ${htmlFiles.length}`);
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.2.8 build 228 BETA / WEB 7.7.2: ${htmlFiles.length} telas, ${total} bytes.`);
if(errors.length){for(const e of errors)console.error('ERRO: '+e);process.exit(1)}
console.log('OK: 3/3 conferências concluídas; IA corrigida e regressões validadas.');
