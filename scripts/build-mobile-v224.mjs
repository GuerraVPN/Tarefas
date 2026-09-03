import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const dist = path.join(root, 'dist');
const allowed = new Set(['.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.json', '.webmanifest']);
const excluded = new Set(['dist', 'android', 'node_modules', '.git', '.github', 'scripts', 'app', 'app-assets']);
const mobileAssets = [
  'manifest.webmanifest', 'service-worker.js', 'mobile-bootstrap.js', 'mobile-preload.js',
  'mobile-login-v17.js', 'mobile.css', 'mobile-v12.css', 'mobile-v16.css', 'mobile-v18.css',
  'mobile-v181.css', 'mobile-v12.js', 'mobile-updates-v181.js', 'mobile-dashboard-v184.js',
  'mobile-users-inline-v189.js', 'mobile-notes-v191.js', 'mobile-v196.js'
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  if (entry.isDirectory()) {
    if (entry.name === 'assets') await cp(path.join(root, entry.name), path.join(dist, entry.name), { recursive: true });
    continue;
  }
  if (allowed.has(path.extname(entry.name).toLowerCase())) {
    await cp(path.join(root, entry.name), path.join(dist, entry.name));
  }
}
for (const rel of mobileAssets) await cp(path.join(root, 'app', rel), path.join(dist, rel));

async function patch(rel, replacements) {
  const file = path.join(dist, rel);
  let source = await readFile(file, 'utf8');
  for (const [from, to] of replacements) {
    if (!source.includes(from)) throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);
    source = source.split(from).join(to);
  }
  await writeFile(file, source, 'utf8');
}

await patch('mobile-bootstrap.js', [
  ["const APP_VERSION = '1.8.0';", "const APP_VERSION = '2.2.5';"],
  ['const APP_BUILD = 180;', 'const APP_BUILD = 225;'],
  ["const WEB_VERSION = '7.5.2';", "const WEB_VERSION = '7.7.1';"]
]);
await patch('mobile-preload.js', [
  ["tarefasAppVersion = '1.8.0'", "tarefasAppVersion = '2.2.5'"],
  ["tarefasAppBuild = '180'", "tarefasAppBuild = '225'"]
]);
await patch('mobile-v12.js', [['1.8.0 • WEB 7.5.2', '2.2.5 • WEB 7.7.1']]);
await patch('mobile-updates-v181.js', [
  ["const APP_VERSION = '1.8.9';", "const APP_VERSION = '2.2.5';"],
  ['const APP_BUILD = 189;', 'const APP_BUILD = 225;']
]);
await patch('v7_5_4_patch.js', [[
  "function usersInline(){\n if(page()!=='usuarios.html')return;",
  "function usersInline(){\n if(page()!=='usuarios.html'||native())return;"
]]);

/* Beta 2.2.5: corta o loader legado pesado nas três telas onde a regressão é mais visível. */
await patch('v6_2_mobile.js', [[
  "/* V7 loader — V7.5.1 */\n(function(){\n  function add",
  "/* V7 loader — V7.5.1 */\n(function(){\n  const pageName=(location.pathname.split('/').pop()||'').toLowerCase();\n  if(window.__TAREFAS_NATIVE_APP__&&['games.html','about.html','orcamentarios.html'].includes(pageName)){window.__TAREFAS_V225_LIGHT_LOADER__=true;return;}\n  function add"
]]);

/* Presença continua funcionando no app, mas sem observer global nem fan-out realtime. */
await patch('v6_5_patch.js', [
  ['const HEARTBEAT_MS=30000;', 'const HEARTBEAT_MS=window.__TAREFAS_NATIVE_APP__?60000:30000;'],
  ['refreshTimer=setInterval(refreshPresence,30000);', 'refreshTimer=setInterval(refreshPresence,window.__TAREFAS_NATIVE_APP__?60000:30000);'],
  ["  try{\n    presenceChannel=c.channel('v65-presenca-'+String(me.id))", "  if(!window.__TAREFAS_NATIVE_APP__)try{\n    presenceChannel=c.channel('v65-presenca-'+String(me.id))"],
  ['function observe(){\n  const mo=new MutationObserver(()=>{', 'function observe(){\n  if(window.__TAREFAS_NATIVE_APP__)return;\n  const mo=new MutationObserver(()=>{']
]);

/* Painel SITE: mantém segurança/estado, reduzindo polling de 5 s para 30 s no Android. */
await patch('v7_4_12_site.js', [['const POLL_MS=5000;', 'const POLL_MS=window.__TAREFAS_NATIVE_APP__?30000:5000;']]);

/* Global/Admin: menos varreduras e nenhuma consulta extra a cada evento de presença no Android. */
await patch('v7_4_12_global.js', [
  ['uiTimer=setInterval(refreshUi,3000);serviceTimer=setInterval(serviceNotices,10*60*1000);onlineTimer=setInterval(renderAdminOnline,30000);', 'uiTimer=setInterval(refreshUi,window.__TAREFAS_NATIVE_APP__?15000:3000);serviceTimer=setInterval(serviceNotices,10*60*1000);onlineTimer=setInterval(renderAdminOnline,window.__TAREFAS_NATIVE_APP__?120000:30000);'],
  ["window.addEventListener('v65:presenca',renderAdminOnline);", "window.addEventListener('v65:presenca',()=>{if(!window.__TAREFAS_NATIVE_APP__)renderAdminOnline()});"]
]);

/* Controlador de versão e webfix não observam todo o DOM no app. */
await patch('v7_5_1_version.js', [
  ['function watch(){apply();const obs=new MutationObserver(()=>queueMicrotask(apply));obs.observe(document.body,{subtree:true,childList:true,characterData:true});}', 'function watch(){apply();if(window.__TAREFAS_NATIVE_APP__)return;const obs=new MutationObserver(()=>queueMicrotask(apply));obs.observe(document.body,{subtree:true,childList:true,characterData:true});}'],
  ["window.addEventListener('focus',apply);setInterval(apply,5000);", "window.addEventListener('focus',apply);setInterval(apply,window.__TAREFAS_NATIVE_APP__?30000:5000);"]
]);
await patch('v7_6_5_webfix.js', [
  ["const label=document.getElementById('gamesVersionLabel');if(label)label.textContent='WEB '+VERSION+' · 26º PEL PE MEC';", "const label=document.getElementById('gamesVersionLabel');if(label){const text='WEB '+VERSION+' · 26º PEL PE MEC';if(label.textContent!==text)label.textContent=text;}"],
  ['function start(){sync();const obs=new MutationObserver(()=>queueMicrotask(sync));obs.observe(document.body,{subtree:true,childList:true})}', 'function start(){sync();if(window.__TAREFAS_NATIVE_APP__)return;const obs=new MutationObserver(()=>queueMicrotask(sync));obs.observe(document.body,{subtree:true,childList:true})}']
]);

/* Material Carga: preserva 30/90 dias, pós-processo e conferências; consulta somente com a área ativa. */
await patch('v7_7_0_material_carga.js', [
  ["const DAY=86400000;\nconst $=id=>document.getElementById(id);", "const DAY=86400000;\nconst NATIVE=!!window.__TAREFAS_NATIVE_APP__;\nconst $=id=>document.getElementById(id);"],
  ["function profileId(){return user?.perfil_id?Number(user.perfil_id):null}\nfunction tipoAtual()", "function profileId(){return user?.perfil_id?Number(user.perfil_id):null}\nfunction moduloCargaAtivo(){\n if(!NATIVE)return true;\n const q=new URLSearchParams(location.search).get('modulo');if(q==='material_carga')return true;\n if(document.querySelector('[data-orc-module=\"material_carga\"].active,[data-orc-link=\"material_carga\"].active'))return true;\n const list=$('cargaRefList');const host=list?.closest('[id$=\"Module\"]');return !!host&&!host.hidden;\n}\nfunction tipoAtual()"],
  ['async function refresh(){if(refreshBusy)return;refreshBusy=true;try{await loadData();renderAll()}finally{refreshBusy=false}}', 'async function refresh(force=false){if(refreshBusy||(!force&&!moduloCargaAtivo()))return;refreshBusy=true;try{await loadData();renderAll()}finally{refreshBusy=false}}'],
  [" injectCss();if(!await initUser())return;await refresh();bindProcessWatcher();await restoreFocus();renderAll();\n const obs=new MutationObserver(()=>queueMicrotask(renderAll));obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});\n document.querySelectorAll('[data-carga-tipo]').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,120)));\n setInterval(refresh,60000);", " injectCss();if(!await initUser())return;bindProcessWatcher();\n if(moduloCargaAtivo()){await refresh(true);await restoreFocus();renderAll();}\n const scope=$('cargaRefList')?.parentElement?.parentElement||$('cargaDetail')?.parentElement;\n if(scope){const obs=new MutationObserver(()=>{if(moduloCargaAtivo())queueMicrotask(renderAll)});obs.observe(scope,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});}\n document.querySelectorAll('[data-carga-tipo]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>refresh(true),120)));\n document.addEventListener('click',e=>{if(e.target.closest('[data-orc-module=\"material_carga\"],[data-orc-link=\"material_carga\"]'))setTimeout(()=>refresh(true),150)},true);\n setInterval(()=>{if(moduloCargaAtivo())refresh(true)},300000);"
]);

let nativeSource = await readFile(path.join(root, 'app', 'native-mobile-entry.js'), 'utf8');
nativeSource = nativeSource.replace("const APP_VERSION = '1.8.8';", "const APP_VERSION = '2.2.5';");
const nativeNeedle = "const target=await Filesystem.getUri({directory:Directory.Documents,path:targetPath});await FileTransfer.downloadFile({url:href,path:target.uri,progress:false});let installer={opened:false,error:null};if(options?.autoInstall!==false)installer=await openApkInstaller(target.uri);";
const nativeProgress = `const target=await Filesystem.getUri({directory:Directory.Documents,path:targetPath});
 let progressHandle=null,lastBytes=0,lastTotal=0,lastAt=Date.now();
 const emitProgress=detail=>window.dispatchEvent(new CustomEvent('tarefas:update-download-progress',{detail:{url:href,filename:name,...detail}}));
 emitProgress({state:'starting',bytes:0,contentLength:0,lengthComputable:false,percent:0,speedBps:0});
 try{progressHandle=await FileTransfer.addListener('progress',progress=>{if(progress?.type!=='download'||String(progress?.url||'')!==href)return;const now=Date.now(),bytes=Math.max(0,Number(progress?.bytes||0)),contentLength=Math.max(0,Number(progress?.contentLength||0)),elapsed=Math.max((now-lastAt)/1000,.001),speedBps=Math.max(0,(bytes-lastBytes)/elapsed),lengthComputable=progress?.lengthComputable!==false&&contentLength>0,percent=lengthComputable?Math.max(0,Math.min(100,bytes/contentLength*100)):0;lastAt=now;lastBytes=bytes;if(contentLength>0)lastTotal=contentLength;emitProgress({state:'downloading',bytes,contentLength,lengthComputable,percent,speedBps})})}catch(err){console.warn('[TAREFAS UPDATE] Progresso nativo indisponível:',err)}
 try{await FileTransfer.downloadFile({url:href,path:target.uri,progress:true});emitProgress({state:'downloaded',bytes:lastTotal||lastBytes,contentLength:lastTotal||lastBytes,lengthComputable:(lastTotal||lastBytes)>0,percent:100,speedBps:0})}finally{if(progressHandle)await progressHandle.remove().catch(()=>{})}
 let installer={opened:false,error:null};if(options?.autoInstall!==false)installer=await openApkInstaller(target.uri);`;
if (!nativeSource.includes(nativeNeedle)) throw new Error('native-mobile-entry.js: ponto do FileTransfer não encontrado');
nativeSource = nativeSource.replace(nativeNeedle, nativeProgress);
const nativeOut = path.join(dist, 'native-mobile.js');
await build({
  stdin: { contents: nativeSource, resolveDir: path.join(root, 'app'), sourcefile: 'native-mobile-entry.js' },
  outfile: nativeOut,
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  charset: 'utf8'
});
await writeFile(nativeOut, `${await readFile(nativeOut, 'utf8')}\n;globalThis.__TAREFAS_DOWNLOADS_PATH__='Downloads/TAREFAS';\n`, 'utf8');

const mobileCss = ['mobile.css', 'mobile-v12.css', 'mobile-v16.css', 'mobile-v18.css', 'mobile-v181.css'];
const mobileJs = ['mobile-bootstrap.js', 'mobile-v12.js', 'native-mobile.js', 'mobile-updates-v181.js', 'mobile-dashboard-v184.js', 'mobile-users-inline-v189.js', 'bloco_notas.js', 'mobile-notes-v191.js', 'mobile-v196.js'];
const htmlFiles = (await readdir(dist)).filter(name => name.endsWith('.html'));
for (const name of htmlFiles) {
  const file = path.join(dist, name);
  let html = await readFile(file, 'utf8');
  if (!html.includes('mobile-preload.js')) html = html.replace(/<head>/i, '<head>\n  <script src="mobile-preload.js"></script>');
  for (const css of mobileCss) if (!html.includes(css)) html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${css}">\n</head>`);
  if (!html.includes('manifest.webmanifest')) html = html.replace(/<\/head>/i, '  <link rel="manifest" href="manifest.webmanifest">\n  <meta name="theme-color" content="#05090b">\n</head>');
  if (name === 'index.html' && !html.includes('mobile-login-v17.js')) html = html.replace(/<\/body>/i, '  <script src="mobile-login-v17.js"></script>\n</body>');
  for (const js of mobileJs) if (!html.includes(js)) html = html.replace(/<\/body>/i, `  <script src="${js}"></script>\n</body>`);
  html = html.replaceAll('?v=7.7.1', '?v=2.2.5').replaceAll('?v=2.2.4', '?v=2.2.5').replaceAll('?v=2.2.3', '?v=2.2.5');
  await writeFile(file, html, 'utf8');
}

console.log(`TAREFAS Android 2.2.5 build 225 BETA: Web 7.7.1 em ${htmlFiles.length} telas.`);
