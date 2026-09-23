import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const nativeEntry = path.join(root, 'app', 'native-mobile-entry.js');
const originalNative = await readFile(nativeEntry, 'utf8');

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`2.3.21.4: trecho ausente: ${label}`);
  return source.replace(before, after);
}

function patchNativeSource(source) {
  const oldNativeBranch = ` if(Capacitor.isNativePlatform()){
   if(!isApk&&Capacitor.getPlatform()==='android')return downloadDocumentToDownloads(href,name);`;
  const newNativeBranch = ` if(Capacitor.isNativePlatform()){
   if(!isApk&&Capacitor.getPlatform()==='android'&&/^(?:data:|blob:)/i.test(href)){
     const response=await fetch(href);
     if(!response.ok)throw new Error(\`Não foi possível ler o anexo local (\${response.status}).\`);
     return saveBlob(await response.blob(),name);
   }
   if(!isApk&&Capacitor.getPlatform()==='android')return downloadDocumentToDownloads(href,name);`;
  return replaceRequired(source, oldNativeBranch, newNativeBranch, 'download de anexos data/blob das tarefas');
}

try {
  await writeFile(nativeEntry, patchNativeSource(originalNative), 'utf8');
  await import(pathToFileURL(path.resolve('scripts/build-mobile-v23213.mjs')).href + '?v=23214');
} finally {
  await writeFile(nativeEntry, originalNative, 'utf8');
}

const dist = path.join(root, 'dist');
async function patchFile(rel, transform) {
  const file = path.join(dist, rel);
  const before = await readFile(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`2.3.21.4: alteracao nao aplicada em ${rel}`);
  await writeFile(file, after, 'utf8');
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  const source = await readFile(file, 'utf8');
  await writeFile(file, source.replaceAll('2.3.21.3', '2.3.21.4').replaceAll('b260', 'b261'), 'utf8');
}

await patchFile('mobile-bootstrap.js', source => {
  source = source.replace('const APP_BUILD = 260;', 'const APP_BUILD = 261;');
  const anchor = '<li>Notificações locais do Android agora usam autoCancel e somem ao tocar.</li>';
  const additions = '<li>Anexos das tarefas em data: e blob: agora são convertidos em arquivo real no Android.</li>\\n          <li>Ao tocar no anexo, ele é salvo em Downloads/TAREFAS, confirma o download e tenta abrir automaticamente.</li>\\n          ' + anchor;
  return source.includes(anchor) ? source.replace(anchor, additions) : source;
});
await patchFile('mobile-preload.js', source => source.replace("tarefasAppBuild = '260'", "tarefasAppBuild = '261'"));
await patchFile('mobile-updates-v181.js', source => source.replace('const APP_BUILD = 260;', 'const APP_BUILD = 261;'));
await patchFile('mobile-schema-v239.js', source => source.replace('build:260', 'build:261'));

await appendFile(
  path.join(dist, 'native-mobile.js'),
  "\n;globalThis.__TAREFAS_TASK_ATTACHMENTS_V261__={version:'2.3.21.4',build:261,dataUrl:true,blobUrl:true,saveToDownloads:true,autoOpen:true};\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.21.4 build 261 ALPHA: anexos data/blob das tarefas salvam em Downloads/TAREFAS e abrem automaticamente.');
