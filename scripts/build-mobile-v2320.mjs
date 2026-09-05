import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
// 2.3.20 é um teste puro sobre a 2.3.19.1: mantém o instalador da 2.2.0 via FileOpener.
const source=await readFile(path.join(root,'app','native-mobile-entry.js'),'utf8');
if(!source.includes("FileOpener.openFile({path:uri,mimeType:'application/vnd.android.package-archive'})")) throw new Error('2.3.20: fluxo FileOpener da 2.2.0 ausente no fonte');
if(source.includes('StorageAccess.installApk')) throw new Error('2.3.20: instalador Java novo reapareceu no fonte');

await import(pathToFileURL(path.resolve('scripts/build-mobile-v23191.mjs')).href+'?v=2320');
const dist=path.join(root,'dist');
async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');s=fn(s);await writeFile(p,s,'utf8');}

for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.19.1','2.3.20')
     .replaceAll('b251','b252')
     .replaceAll('__TAREFAS_FIXED_STORAGE_V251__','__TAREFAS_FIXED_STORAGE_V252__')
     .replaceAll('__TAREFAS_FILEOPENER_INSTALL_V251__','__TAREFAS_FILEOPENER_INSTALL_V252__')
     .replaceAll('__TAREFAS_23191_INSTALLER_220_FLOW__','__TAREFAS_2320_INSTALLER_220_FLOW__');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 251;','const APP_BUILD = 252;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '251'","tarefasAppBuild = '252'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 251;','const APP_BUILD = 252;'));
await patch('mobile-schema-v239.js',s=>s.replace('build:251','build:252'));

const native=await readFile(path.join(dist,'native-mobile.js'),'utf8');
if(!native.includes('application/vnd.android.package-archive')) throw new Error('2.3.20: MIME APK ausente no bundle');
if(native.includes('__TAREFAS_INSTALLER_CACHE_')) throw new Error('2.3.20: fluxo por cache reapareceu');
await appendFile(path.join(dist,'native-mobile.js'),'\n;globalThis.__TAREFAS_2320_UPDATE_TEST__=true;\n','utf8');
console.log('TAREFAS Android 2.3.20 build 252 BETA: teste puro de atualização usando o FileOpener da 2.2.0.');
