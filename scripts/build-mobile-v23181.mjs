import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2318.mjs')).href+'?v=23181');
const dist=path.join(root,'dist');
async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');s=fn(s);await writeFile(p,s,'utf8');}

for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const p=path.join(dist,name);
  let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.18','2.3.18.1')
     .replaceAll('b248','b249')
     .replaceAll('__TAREFAS_INSTALLER_NATIVE_V248__','__TAREFAS_INSTALLER_NATIVE_V249__')
     .replaceAll('__TAREFAS_INSTALLER_TEST_V248__','__TAREFAS_INSTALLER_TEST_V249__')
     .replaceAll('__TAREFAS_INSTALLER_CACHE_V248__','__TAREFAS_INSTALLER_CACHE_V249__');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 248;','const APP_BUILD = 249;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '248'","tarefasAppBuild = '249'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 248;','const APP_BUILD = 249;'));
await patch('mobile-schema-v239.js',s=>s.replace('build:248','build:249'));

await appendFile(path.join(dist,'native-mobile.js'),'\n;globalThis.__TAREFAS_23181_FINAL_HOTFIX__=true;\n','utf8');
console.log('TAREFAS Android 2.3.18.1 build 249 BETA: hotfix final da linha 2.3 com instalador por cache privado.');
