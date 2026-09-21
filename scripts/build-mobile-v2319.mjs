import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23181.mjs')).href+'?v=2319');
const dist=path.join(root,'dist');
async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');s=fn(s);await writeFile(p,s,'utf8');}

for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.18.1','2.3.19')
     .replaceAll('b249','b250')
     .replaceAll('__TAREFAS_INSTALLER_NATIVE_V249__','__TAREFAS_INSTALLER_NATIVE_V250__')
     .replaceAll('__TAREFAS_INSTALLER_TEST_V249__','__TAREFAS_INSTALLER_TEST_V250__')
     .replaceAll('__TAREFAS_INSTALLER_CACHE_V249__','__TAREFAS_INSTALLER_CACHE_V250__');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 249;','const APP_BUILD = 250;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '249'","tarefasAppBuild = '250'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 249;','const APP_BUILD = 250;'));
await patch('mobile-schema-v239.js',s=>s.replace('build:249','build:250'));

await appendFile(path.join(dist,'native-mobile.js'),'\n;globalThis.__TAREFAS_2319_INSTALL_TEST__=true;\n','utf8');
console.log('TAREFAS Android 2.3.19 build 250 BETA: teste puro de atualizacao usando o instalador corrigido da 2.3.18.1.');
