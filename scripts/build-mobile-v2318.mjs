import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2317.mjs')).href+'?v=2318');
const dist=path.join(root,'dist');

async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');s=fn(s);await writeFile(p,s,'utf8');}
for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const p=path.join(dist,name);
  let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.17','2.3.18')
     .replaceAll('b247','b248')
     .replaceAll('__TAREFAS_FIXED_STORAGE_V247__','__TAREFAS_FIXED_STORAGE_V248__')
     .replaceAll('__TAREFAS_INSTALLER_FIX_V247__','__TAREFAS_INSTALLER_TEST_V248__')
     .replaceAll('__TAREFAS_INSTALLER_NATIVE_V247__','__TAREFAS_INSTALLER_NATIVE_V248__');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 247;','const APP_BUILD = 248;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '247'","tarefasAppBuild = '248'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 247;','const APP_BUILD = 248;'));
await patch('mobile-schema-v239.js',s=>s.replace('build:247','build:248'));

const javaPath=path.join(root,'app','android','StorageAccessPlugin.java');
const java=await readFile(javaPath,'utf8');
if(!java.includes('public void installApk(PluginCall call)')) throw new Error('StorageAccessPlugin.java: instalador nativo ausente');
if(!java.includes('Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES')) throw new Error('StorageAccessPlugin.java: fluxo Permitir desta fonte ausente');

await appendFile(path.join(dist,'native-mobile.js'),'\n;globalThis.__TAREFAS_INSTALLER_TEST_V248__=true;\n','utf8');
console.log('TAREFAS Android 2.3.18 build 248 BETA: teste puro do instalador nativo da 2.3.17.');
