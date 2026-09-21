import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v225.mjs')).href + '?v=226');
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

// Promove as referências textuais da beta anterior sem refazer o empacotador estável.
for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  let source = await readFile(file, 'utf8');
  source = source.replaceAll('2.2.5', '2.2.6').replaceAll('7.7.1', '7.7.2');
  await writeFile(file, source, 'utf8');
}

await replaceRequired('mobile-bootstrap.js', [['const APP_BUILD = 225;', 'const APP_BUILD = 226;']]);
await replaceRequired('mobile-preload.js', [["tarefasAppBuild = '225'", "tarefasAppBuild = '226'"]]);
await replaceRequired('mobile-updates-v181.js', [['const APP_BUILD = 225;', 'const APP_BUILD = 226;']]);
await replaceRequired('v6_2_mobile.js', [['__TAREFAS_V225_LIGHT_LOADER__', '__TAREFAS_V226_LIGHT_LOADER__']]);

const required = ['v7_7_2_scale_export.js', 'v7_7_2_site_patch.js'];
for (const rel of required) {
  const source = await readFile(path.join(dist, rel), 'utf8');
  if (!source.includes('__TAREFAS_V772_')) throw new Error(`${rel}: marcador da Web 7.7.2 ausente`);
}

console.log('TAREFAS Android 2.2.6 build 226 BETA: Web 7.7.2 com exportação de escalas em PDF/ODT.');
