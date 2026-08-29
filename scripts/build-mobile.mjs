import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const dist = path.join(root, 'dist');
const allowed = new Set(['.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.json', '.webmanifest']);
const excluded = new Set(['dist', 'android', 'node_modules', '.git', '.github', 'scripts']);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const entries = await readdir(root, { withFileTypes: true });
for (const entry of entries) {
  if (excluded.has(entry.name)) continue;
  const src = path.join(root, entry.name);
  const dst = path.join(dist, entry.name);
  if (entry.isDirectory()) {
    if (entry.name === 'assets') await cp(src, dst, { recursive: true });
    continue;
  }
  if (allowed.has(path.extname(entry.name).toLowerCase())) await cp(src, dst);
}

await mkdir(path.join(dist, 'assets', 'icons'), { recursive: true });
for (const size of [192, 512]) {
  const src = path.join(root, 'app-assets', `icon-${size}.png`);
  const dst = path.join(dist, 'assets', 'icons', `icon-${size}.png`);
  try { await cp(src, dst); } catch (_) {}
}

await cp(path.join(root, 'app', 'manifest.webmanifest'), path.join(dist, 'manifest.webmanifest'));
await cp(path.join(root, 'app', 'service-worker.js'), path.join(dist, 'service-worker.js'));
await cp(path.join(root, 'app', 'mobile-bootstrap.js'), path.join(dist, 'mobile-bootstrap.js'));
await cp(path.join(root, 'app', 'mobile-preload.js'), path.join(dist, 'mobile-preload.js'));
await cp(path.join(root, 'app', 'mobile-login-v17.js'), path.join(dist, 'mobile-login-v17.js'));
await cp(path.join(root, 'app', 'mobile.css'), path.join(dist, 'mobile.css'));
await cp(path.join(root, 'app', 'mobile-v12.css'), path.join(dist, 'mobile-v12.css'));
await cp(path.join(root, 'app', 'mobile-v16.css'), path.join(dist, 'mobile-v16.css'));
await cp(path.join(root, 'app', 'mobile-v18.css'), path.join(dist, 'mobile-v18.css'));
await cp(path.join(root, 'app', 'mobile-v181.css'), path.join(dist, 'mobile-v181.css'));
await cp(path.join(root, 'app', 'mobile-v12.js'), path.join(dist, 'mobile-v12.js'));
await cp(path.join(root, 'app', 'mobile-updates-v181.js'), path.join(dist, 'mobile-updates-v181.js'));
await cp(path.join(root, 'app', 'mobile-dashboard-v184.js'), path.join(dist, 'mobile-dashboard-v184.js'));

async function patch(rel, replacements){
  const file=path.join(dist,rel);
  let text=await readFile(file,'utf8');
  for(const [from,to] of replacements) text=text.split(from).join(to);
  await writeFile(file,text,'utf8');
}

// A base visual 1.8.0 continua reaproveitada; a distribuição atual é 1.8.4/184 BETA.
await patch('mobile-bootstrap.js', [
  ["const APP_VERSION = '1.8.0';", "const APP_VERSION = '1.8.4';"],
  ['const APP_BUILD = 180;', 'const APP_BUILD = 184;']
]);
await patch('mobile-preload.js', [
  ["tarefasAppVersion = '1.8.0'", "tarefasAppVersion = '1.8.4'"],
  ["tarefasAppBuild = '180'", "tarefasAppBuild = '184'"]
]);
await patch('mobile-v12.js', [['1.8.0 • WEB 7.5.2','1.8.4 • WEB 7.5.3']]);
await patch('mobile-updates-v181.js', [
  ["const APP_VERSION = '1.8.1';", "const APP_VERSION = '1.8.4';"],
  ['const APP_BUILD = 181;', 'const APP_BUILD = 184;']
]);

await build({
  entryPoints: [path.join(root, 'app', 'native-mobile-entry.js')],
  outfile: path.join(dist, 'native-mobile.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  charset: 'utf8'
});

const htmlFiles = (await readdir(dist)).filter((name) => name.endsWith('.html'));
for (const name of htmlFiles) {
  const file = path.join(dist, name);
  let html = await readFile(file, 'utf8');

  if (!html.includes('mobile-preload.js')) {
    html = html.replace(/<head>/i, '<head>\n  <script src="mobile-preload.js"></script>');
  }

  for (const css of ['mobile.css','mobile-v12.css','mobile-v16.css','mobile-v18.css','mobile-v181.css']) {
    if (!html.includes(css)) html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${css}">\n</head>`);
  }

  if (!html.includes('manifest.webmanifest')) {
    html = html.replace(/<\/head>/i, '  <link rel="manifest" href="manifest.webmanifest">\n  <meta name="theme-color" content="#05090b">\n</head>');
  }

  if (name === 'index.html' && !html.includes('mobile-login-v17.js')) {
    html = html.replace(/<\/body>/i, '  <script src="mobile-login-v17.js"></script>\n</body>');
  }

  if (!html.includes('mobile-bootstrap.js')) {
    html = html.replace(/<\/body>/i, '  <script src="mobile-bootstrap.js"></script>\n  <script src="mobile-v12.js"></script>\n  <script src="native-mobile.js"></script>\n  <script src="mobile-updates-v181.js"></script>\n  <script src="mobile-dashboard-v184.js"></script>\n</body>');
  } else {
    if (!html.includes('mobile-v12.js')) html = html.replace(/<\/body>/i, '  <script src="mobile-v12.js"></script>\n</body>');
    if (!html.includes('native-mobile.js')) html = html.replace(/<\/body>/i, '  <script src="native-mobile.js"></script>\n</body>');
    if (!html.includes('mobile-updates-v181.js')) html = html.replace(/<\/body>/i, '  <script src="mobile-updates-v181.js"></script>\n</body>');
    if (!html.includes('mobile-dashboard-v184.js')) html = html.replace(/<\/body>/i, '  <script src="mobile-dashboard-v184.js"></script>\n</body>');
  }

  await writeFile(file, html, 'utf8');
}

console.log(`TAREFAS Android 1.8.4 build 184 BETA: ${htmlFiles.length} páginas preparadas sobre Web 7.5.3 com próximo serviço no Resumo rápido, download nativo e push interno`);
