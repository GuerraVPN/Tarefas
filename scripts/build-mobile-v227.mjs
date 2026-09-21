import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v226.mjs')).href + '?v=227');
const dist = path.join(root, 'dist');

async function replaceRequired(rel, replacements) {
  const file = path.join(dist, rel);
  let source = await readFile(file, 'utf8');
  for (const [from, to] of replacements) {
    if (!source.includes(from)) throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);
    source = source.split(from).join(to);
  }
  await writeFile(file, source, 'utf8');
}

// Promove somente a versão Android. A base Web permanece 7.7.2 nesta beta.
for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  let source = await readFile(file, 'utf8');
  source = source.replaceAll('2.2.6', '2.2.7');
  await writeFile(file, source, 'utf8');
}

await replaceRequired('mobile-bootstrap.js', [['const APP_BUILD = 226;', 'const APP_BUILD = 227;']]);
await replaceRequired('mobile-preload.js', [["tarefasAppBuild = '226'", "tarefasAppBuild = '227'"]]);
await replaceRequired('mobile-updates-v181.js', [['const APP_BUILD = 226;', 'const APP_BUILD = 227;']]);
await replaceRequired('v6_2_mobile.js', [['__TAREFAS_V226_LIGHT_LOADER__', '__TAREFAS_V227_LIGHT_LOADER__']]);

// Recurso exclusivo da beta Android: Assistente IA flutuante.
await copyFile(path.join(root, 'app', 'mobile-ai-v227.js'), path.join(dist, 'mobile-ai-v227.js'));
const htmlFiles = (await readdir(dist)).filter(name => name.endsWith('.html'));
for (const name of htmlFiles) {
  const file = path.join(dist, name);
  let html = await readFile(file, 'utf8');
  if (!html.includes('mobile-ai-v227.js')) {
    html = html.replace(/<\/body>/i, '  <script src="mobile-ai-v227.js"></script>\n</body>');
  }
  html = html.replaceAll('?v=2.2.6', '?v=2.2.7');
  await writeFile(file, html, 'utf8');
}

const aiSource = await readFile(path.join(dist, 'mobile-ai-v227.js'), 'utf8');
for (const marker of ['__TAREFAS_ANDROID_227_AI__', 'tarefasPushSession17', '/functions/v1/tarefas-ai', 'BETA 2.2.7 · somente leitura']) {
  if (!aiSource.includes(marker)) throw new Error(`mobile-ai-v227.js: marcador ausente: ${marker}`);
}

console.log(`TAREFAS Android 2.2.7 build 227 BETA: Assistente IA em ${htmlFiles.length} telas, Web 7.7.2 preservada.`);
