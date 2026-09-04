import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

// Mantém integralmente as correções da 2.3.15 e apenas avança a versão
// para validar o fluxo real de descoberta/download/instalação da beta.
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2315.mjs')).href + '?v=2316');

const dist = path.join(root, 'dist');
async function patch(rel, fn) {
  const p = path.join(dist, rel);
  let s = await readFile(p, 'utf8');
  s = fn(s);
  await writeFile(p, s, 'utf8');
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const p = path.join(dist, name);
  let s = await readFile(p, 'utf8');
  s = s
    .replaceAll('2.3.15', '2.3.16')
    .replaceAll('b245', 'b246')
    .replaceAll('__TAREFAS_FIXED_STORAGE_V245__', '__TAREFAS_FIXED_STORAGE_V246__');
  await writeFile(p, s, 'utf8');
}

await patch('mobile-bootstrap.js', s => s.replace('const APP_BUILD = 245;', 'const APP_BUILD = 246;'));
await patch('mobile-preload.js', s => s.replace("tarefasAppBuild = '245'", "tarefasAppBuild = '246'"));
await patch('mobile-updates-v181.js', s => s.replace('const APP_BUILD = 245;', 'const APP_BUILD = 246;'));
await patch('mobile-schema-v239.js', s => s.replace('build:245', 'build:246'));

await appendFile(
  path.join(dist, 'native-mobile.js'),
  "\n;globalThis.__TAREFAS_DOWNLOAD_TEST_V246__=true;\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.16 build 246 BETA: teste real de download sobre a base fixa da 2.3.15.');
