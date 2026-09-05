import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
// Hotfix 2.3.19.1: volta somente o instalador para o fluxo comprovado da 2.2.0.
// Base 2.3.16 preserva os diretórios atuais da linha 2.3 (Documentos/TAREFAS/Beta|Oficial e Downloads/TAREFAS)
// e ainda usa FileTransfer -> Filesystem.getUri -> FileOpener.openFile para APKs.
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2316.mjs')).href+'?v=23191');
const dist=path.join(root,'dist');
async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');s=fn(s);await writeFile(p,s,'utf8');}

for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.16','2.3.19.1')
     .replaceAll('b246','b251')
     .replaceAll('__TAREFAS_FIXED_STORAGE_V246__','__TAREFAS_FIXED_STORAGE_V251__')
     .replaceAll('__TAREFAS_DOWNLOAD_TEST_V246__','__TAREFAS_FILEOPENER_INSTALL_V251__');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 246;','const APP_BUILD = 251;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '246'","tarefasAppBuild = '251'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 246;','const APP_BUILD = 251;'));
await patch('mobile-schema-v239.js',s=>s.replace('build:246','build:251'));

const native=await readFile(path.join(dist,'native-mobile.js'),'utf8');
if(!native.includes('FileOpener.openFile')) throw new Error('2.3.19.1: FileOpener ausente');
if(!native.includes('application/vnd.android.package-archive')) throw new Error('2.3.19.1: MIME APK ausente');
if(native.includes('StorageAccess.installApk')) throw new Error('2.3.19.1: instalador Java novo ainda presente');
if(native.includes('__TAREFAS_INSTALLER_CACHE_')) throw new Error('2.3.19.1: instalador por cache ainda presente');

await appendFile(path.join(dist,'native-mobile.js'),'\n;globalThis.__TAREFAS_23191_INSTALLER_220_FLOW__=true;\n','utf8');
console.log('TAREFAS Android 2.3.19.1 build 251 BETA: instalador restaurado ao fluxo 2.2.0 via FileOpener.');
