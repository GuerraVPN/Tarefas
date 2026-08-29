import { cp, mkdir, readdir, readFile, rm, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const dist = path.join(root, 'dist');
const allowed = new Set(['.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.json', '.webmanifest']);
const excluded = new Set(['dist', 'android', 'node_modules', '.git', '.github', 'scripts']);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  const src = path.join(root, entry.name), dst = path.join(dist, entry.name);
  if (entry.isDirectory()) { if (entry.name === 'assets') await cp(src, dst, { recursive: true }); continue; }
  if (allowed.has(path.extname(entry.name).toLowerCase())) await cp(src, dst);
}
await mkdir(path.join(dist, 'assets', 'icons'), { recursive: true });
for (const size of [192, 512]) { try { await cp(path.join(root,'app-assets',`icon-${size}.png`),path.join(dist,'assets','icons',`icon-${size}.png`)); } catch (_) {} }
for (const file of ['manifest.webmanifest','service-worker.js','mobile-bootstrap.js','mobile-preload.js','mobile-login-v17.js','mobile.css','mobile-v12.css','mobile-v16.css','mobile-v18.css','mobile-v181.css','mobile-v12.js','mobile-updates-v181.js','mobile-dashboard-v184.js','mobile-users-inline-v189.js']) {
  await cp(path.join(root,'app',file),path.join(dist,file));
}
async function patch(rel,replacements){const file=path.join(dist,rel);let text=await readFile(file,'utf8');for(const [from,to] of replacements)text=text.split(from).join(to);await writeFile(file,text,'utf8')}
await patch('mobile-bootstrap.js',[["const APP_VERSION = '1.8.0';","const APP_VERSION = '1.9.0';"],['const APP_BUILD = 180;','const APP_BUILD = 190;']]);
await patch('mobile-preload.js',[["tarefasAppVersion = '1.8.0'","tarefasAppVersion = '1.9.0'"],["tarefasAppBuild = '180'","tarefasAppBuild = '190'"]]);
await patch('mobile-v12.js',[['1.8.0 • WEB 7.5.2','1.9.0 • WEB 7.5.5']]);
await patch('mobile-updates-v181.js',[["const APP_VERSION = '1.8.9';","const APP_VERSION = '1.9.0';"],["const APP_BUILD = 189;","const APP_BUILD = 190;"],["const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'official';"]]);
await patch('v7_5_4_patch.js',[["function usersInline(){if(page()!=='usuarios.html')return;","function usersInline(){if(page()!=='usuarios.html'||native())return;"]]);
const nativeOut=path.join(dist,'native-mobile.js');
await build({entryPoints:[path.join(root,'app','native-mobile-entry.js')],outfile:nativeOut,bundle:true,minify:true,format:'iife',platform:'browser',target:['es2020'],charset:'utf8'});
await patch('native-mobile.js',[["1.8.8","1.9.0"]]);
await appendFile(nativeOut,"\n;globalThis.__TAREFAS_DOWNLOADS_PATH__='Downloads/TAREFAS';\n",'utf8');
const htmlFiles=(await readdir(dist)).filter(name=>name.endsWith('.html'));
for(const name of htmlFiles){
 const file=path.join(dist,name);let html=await readFile(file,'utf8');
 if(!html.includes('mobile-preload.js'))html=html.replace(/<head>/i,'<head>\n  <script src="mobile-preload.js"></script>');
 for(const css of ['mobile.css','mobile-v12.css','mobile-v16.css','mobile-v18.css','mobile-v181.css'])if(!html.includes(css))html=html.replace(/<\/head>/i,`  <link rel="stylesheet" href="${css}">\n</head>`);
 if(!html.includes('manifest.webmanifest'))html=html.replace(/<\/head>/i,'  <link rel="manifest" href="manifest.webmanifest">\n  <meta name="theme-color" content="#05090b">\n</head>');
 if(name==='index.html'&&!html.includes('mobile-login-v17.js'))html=html.replace(/<\/body>/i,'  <script src="mobile-login-v17.js"></script>\n</body>');
 for(const js of ['mobile-bootstrap.js','mobile-v12.js','native-mobile.js','mobile-updates-v181.js','mobile-dashboard-v184.js','mobile-users-inline-v189.js'])if(!html.includes(js))html=html.replace(/<\/body>/i,`  <script src="${js}"></script>\n</body>`);
 await writeFile(file,html,'utf8');
}
console.log(`TAREFAS Android 1.9.0 build 190 OFICIAL: ${htmlFiles.length} páginas preparadas sobre Web 7.5.5 com a série 1.8.x consolidada`);
