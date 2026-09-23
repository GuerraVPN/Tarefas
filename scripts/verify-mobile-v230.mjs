import { access, readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','configuracoes.html','central.html','orcamentarios.html','pessoal.html','missao.html','games.html','menu.html','minhas_tarefas.html','mobile-bootstrap.js','mobile-preload.js','mobile-login-v17.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','mobile-ai-v230.js','v7_5_1_version.js','v7_8_0_about.js','v7_7_0_material_carga.js','v7_7_2_scale_export.js'];
async function exists(r){try{await access(path.join(root,r));return true}catch{return false}}async function text(r){return readFile(path.join(root,r),'utf8')}
for(const r of required)if(!await exists(r))errors.push(`arquivo ausente: ${r}`);
console.log('CONFERÊNCIA 1/4 — versão oficial e Base Web');
const markers={
'mobile-bootstrap.js':["const APP_VERSION = '2.3.0'",'const APP_BUILD = 230',"const WEB_VERSION = '7.8.0'"],
'mobile-preload.js':["tarefasAppVersion = '2.3.0'","tarefasAppBuild = '230'"],
'mobile-v12.js':['2.3.0 • WEB 7.8.0'],
'mobile-updates-v181.js':["const APP_VERSION = '2.3.0'",'const APP_BUILD = 230',"const APP_CHANNEL = 'official'"],
'v7_5_1_version.js':['__TAREFAS_V780_VERSION__',"const VERSION='7.8.0'"],
'v7_8_0_about.js':['__TAREFAS_V780_ABOUT__','Assistente IA chega ao TAREFAS']};
for(const[r,ms]of Object.entries(markers))if(await exists(r)){const s=await text(r);for(const m of ms)if(!s.includes(m))errors.push(`${r}: marcador ausente: ${m}`)}
console.log('CONFERÊNCIA 2/4 — Assistente IA');
if(await exists('mobile-ai-v230.js')){const s=await text('mobile-ai-v230.js');for(const m of ['__TAREFAS_ANDROID_230_AI__','/functions/v1/tarefas-ai',"'X-Tarefas-Session':session",'OFICIAL 2.3.0 · somente leitura','rate_limited','body.ai230-open .bn-fab{display:none!important}'])if(!s.includes(m))errors.push(`mobile-ai-v230.js: recurso ausente: ${m}`);for(const f of ['GEMINI_API_KEY','OPENAI_API_KEY','sk-proj-'])if(s.includes(f))errors.push(`mobile-ai-v230.js: segredo proibido: ${f}`)}
console.log('CONFERÊNCIA 3/4 — HTML e JavaScript');
const entries=await readdir(root),html=entries.filter(n=>n.endsWith('.html'));
for(const r of html){const h=await text(r);for(const a of ['mobile-preload.js','mobile-bootstrap.js','native-mobile.js','mobile-updates-v181.js','mobile-ai-v230.js'])if(!h.includes(a))errors.push(`${r}: injeção ausente: ${a}`);if(h.includes('mobile-ai-v228.js'))errors.push(`${r}: cliente beta antigo ainda referenciado`)}
for(const r of entries.filter(n=>n.endsWith('.js'))){const x=spawnSync(process.execPath,['--check',path.join(root,r)],{encoding:'utf8'});if(x.status!==0)errors.push(`${r}: JavaScript inválido: ${x.stderr.trim()}`)}
console.log('CONFERÊNCIA 4/4 — regressões principais');
if(await exists('v7_7_0_material_carga.js')){const s=await text('v7_7_0_material_carga.js');for(const m of ["days=type==='deposito'?30:90",'detectProcessCompletion','bindProcessWatcher','moduloCargaAtivo()'])if(!s.includes(m))errors.push(`Material Carga: regra ausente: ${m}`)}
if(await exists('v7_7_2_scale_export.js')){const s=await text('v7_7_2_scale_export.js');for(const m of ['application/vnd.oasis.opendocument.text','function odtBlob','function pdfBlob'])if(!s.includes(m))errors.push(`Exportação: recurso ausente: ${m}`)}
let total=0;for(const r of entries){const i=await stat(path.join(root,r));if(i.isFile())total+=i.size}if(html.length<17)errors.push(`HTML insuficientes: ${html.length}`);if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.3.0 build 230 OFICIAL / WEB 7.8.0: ${html.length} telas, ${total} bytes.`);if(errors.length){for(const e of errors)console.error('ERRO: '+e);process.exit(1)}console.log('OK: 4/4 conferências concluídas.');
