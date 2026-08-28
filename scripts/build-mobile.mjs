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
await cp(path.join(root, 'app', 'mobile.css'), path.join(dist, 'mobile.css'));

await build({
  entryPoints: [path.join(root, 'app', 'native-mobile-entry.js')],
  outfile: path.join(dist, 'native-mobile.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020']
});

const htmlFiles = (await readdir(dist)).filter((name) => name.endsWith('.html'));
for (const name of htmlFiles) {
  const file = path.join(dist, name);
  let html = await readFile(file, 'utf8');

  if (!html.includes('mobile-preload.js')) {
    html = html.replace(/<head>/i, '<head>\n  <script src="mobile-preload.js"></script>');
  }

  if (!html.includes('mobile.css')) {
    html = html.replace(/<\/head>/i, '  <link rel="stylesheet" href="mobile.css">\n</head>');
  }

  if (!html.includes('manifest.webmanifest')) {
    html = html.replace(/<\/head>/i, '  <link rel="manifest" href="manifest.webmanifest">\n  <meta name="theme-color" content="#0b1220">\n</head>');
  }

  if (!html.includes('mobile-bootstrap.js')) {
    html = html.replace(/<\/body>/i, '  <script src="mobile-bootstrap.js"></script>\n  <script src="native-mobile.js"></script>\n</body>');
  } else if (!html.includes('native-mobile.js')) {
    html = html.replace(/<\/body>/i, '  <script src="native-mobile.js"></script>\n</body>');
  }

  await writeFile(file, html, 'utf8');
}

console.log(`TAREFAS mobile: ${htmlFiles.length} páginas preparadas em dist/ com layout mobile, sessão persistente e notificações nativas`);
