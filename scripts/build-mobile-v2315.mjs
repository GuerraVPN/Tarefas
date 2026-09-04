import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();

// 2.3.15: volta ao armazenamento fixo planejado, sem seletor "Salvar como".
// Atualizações: Documentos/TAREFAS/Oficial ou Beta.
// Documentos/arquivos gerados: Downloads/TAREFAS.
const nativePath=path.join(root,'app','native-mobile-entry.js');
let native=await readFile(nativePath,'utf8');

native=native.replace("const UPDATES_FOLDER = `${FILES_FOLDER}/Atualização`;","const UPDATES_FOLDER = FILES_FOLDER;");

const pickerBranch=` if(Capacitor.isNativePlatform()&&Capacitor.getPlatform()==='android'){\n   const saved=await StorageAccess.saveBase64WithPicker({data,filename:name,mimeType:blob.type||'application/octet-stream'});\n   if(saved?.canceled){const info={ok:false,saved:false,canceled:true,shared:false,filename:name,path:null,uri:'',mimeType:blob.type||'application/octet-stream'};window.dispatchEvent(new CustomEvent('tarefas:file-save-canceled',{detail:info}));return info}\n   if(!saved?.saved)throw new Error('O Android não confirmou o salvamento do arquivo.');\n   const info={ok:true,saved:true,canceled:false,shared:false,filename:name,path:saved.path||saved.uri||name,uri:saved.uri||'',mimeType:blob.type||'application/octet-stream',selectedByUser:true};\n   window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return info;\n }`;
const fixedBranch=` if(Capacitor.isNativePlatform()&&Capacitor.getPlatform()==='android'){\n   const saved=await StorageAccess.saveBase64ToDownloads({data,filename:name,mimeType:blob.type||'application/octet-stream',subfolder:DOWNLOADS_FOLDER});\n   if(!saved?.saved)throw new Error('O Android não confirmou o salvamento em Downloads/TAREFAS.');\n   const info={ok:true,saved:true,canceled:false,shared:false,filename:name,path:saved.path||\`Downloads/${DOWNLOADS_FOLDER}/${name}\`,uri:saved.uri||'',mimeType:blob.type||'application/octet-stream',selectedByUser:false,fixedDirectory:true};\n   window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return info;\n }`;
if(!native.includes(pickerBranch))throw new Error('native-mobile-entry.js: branch Salvar como não encontrado');
native=native.replace(pickerBranch,fixedBranch);

const permissionLine=" await ensureLegacyFilesPermission();\n if(Capacitor.isNativePlatform()){`";
if(!native.includes(permissionLine))throw new Error('native-mobile-entry.js: gate de permissão legado não encontrado');
native=native.replace(permissionLine," if(Capacitor.isNativePlatform()){`");

const oldClear=`async function clearOldUpdates(){\n if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='android')return{ok:false,unsupported:true,deleted:0};\n return StorageAccess.clearOldUpdates({currentVersion:APP_VERSION});\n}`;
const newClear=`async function clearOldUpdates(){\n if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='android')return{ok:false,unsupported:true,deleted:0,requiresAllFilesAccess:false};\n const roots=[\`${FILES_FOLDER}/Oficial\`,\`${FILES_FOLDER}/Beta\`,\`${FILES_FOLDER}/Atualização/Oficial\`,\`${FILES_FOLDER}/Atualização/Beta\`];\n let deleted=0,bytes=0;const files=[];\n for(const dir of roots){\n   let listed;try{listed=await Filesystem.readdir({directory:Directory.Documents,path:dir})}catch(_){continue}\n   for(const item of listed?.files||[]){\n     const name=typeof item==='string'?item:String(item?.name||'');if(!/\\.apk$/i.test(name))continue;\n     const filePath=\`${dir}/${name}\`;\n     try{const stat=await Filesystem.stat({directory:Directory.Documents,path:filePath});bytes+=Math.max(0,Number(stat?.size||0))}catch(_){}\n     try{await Filesystem.deleteFile({directory:Directory.Documents,path:filePath});deleted++;files.push(name)}catch(_){}\n   }\n }\n return{ok:true,requiresAllFilesAccess:false,deleted,bytes,files};\n}`;
if(!native.includes(oldClear))throw new Error('native-mobile-entry.js: clearOldUpdates antigo não encontrado');
native=native.replace(oldClear,newClear);
await writeFile(nativePath,native,'utf8');

// A tela About não deve mais consultar, pedir ou anunciar acesso total.
const updatesPath=path.join(root,'app','mobile-updates-v181.js');
let updates=await readFile(updatesPath,'utf8');
const oldState="let storage={granted:false,required:false};try{storage=await window.TarefasNative?.files?.checkAllFilesAccess?.()||storage}catch(_){}return{beta:beta===true,latest:Array.isArray(latestRows)?latestRows[0]||null:latestRows||null,history:Array.isArray(history)?history:[],storage}";
if(!updates.includes(oldState))throw new Error('mobile-updates-v181.js: consulta de armazenamento antiga não encontrada');
updates=updates.replace(oldState,"const storage={granted:true,required:false,fixedDirectories:true};return{beta:beta===true,latest:Array.isArray(latestRows)?latestRows[0]||null:latestRows||null,history:Array.isArray(history)?history:[],storage}");
const requestRe=/  async function requestStorageAccess\(root\)\{[\s\S]*?\n  \}\n  async function cleanOldVersions/;
if(!requestRe.test(updates))throw new Error('mobile-updates-v181.js: requestStorageAccess não encontrado');
updates=updates.replace(requestRe,'  async function cleanOldVersions');
updates=updates.replace("      if(result?.requiresAllFilesAccess){await requestStorageAccess(root);return}\n",'');
updates=updates.replace("    const storageText=state.storage?.required?(state.storage?.granted?'Acesso total aos arquivos concedido.':'Acesso total aos arquivos ainda não concedido.'):'Esta versão do Android não exige acesso especial.';","    const storageText='Sem permissão especial: o TAREFAS usa apenas as pastas fixas do próprio fluxo.';");
updates=updates.replace('Documentos das tarefas são salvos em <b>Downloads/TAREFAS</b>. APKs de atualização continuam separados em Documentos/TAREFAS/Atualização/Beta ou Oficial.','PDF, ODT e outros arquivos são salvos em <b>Downloads/TAREFAS</b>. Atualizações ficam em <b>Documentos/TAREFAS/Oficial</b> ou <b>Documentos/TAREFAS/Beta</b>.');
updates=updates.replace("          ${state.storage?.required&&!state.storage?.granted?'<button class=\"tm-primary\" id=\"tmGrantStorageAccess\">Conceder acesso total aos arquivos</button>':''}\n",'');
updates=updates.replace("    document.getElementById('tmGrantStorageAccess')?.addEventListener('click',()=>requestStorageAccess(root).catch(err=>alert(err?.message||err)));\n",'');
await writeFile(updatesPath,updates,'utf8');

// Gera a 2.3.14 (que neutraliza a API antiga de acesso total) sobre estas fontes.
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2314.mjs')).href+'?v=2315');
const dist=path.join(root,'dist');

async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');s=fn(s);await writeFile(p,s,'utf8')}
for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.14','2.3.15').replaceAll('b244','b245');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 244;','const APP_BUILD = 245;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '244'","tarefasAppBuild = '245'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 244;','const APP_BUILD = 245;'));
await patch('mobile-schema-v239.js',s=>s.replace('build:244','build:245'));

// Remove de vez o seletor ACTION_CREATE_DOCUMENT do plugin que será copiado para o APK.
const javaPath=path.join(root,'app','android','StorageAccessPlugin.java');
let java=await readFile(javaPath,'utf8');
const pickerRe=/\n    @PluginMethod\n    public void saveBase64WithPicker\(PluginCall call\) \{[\s\S]*?\n    \}\n\n    @ActivityCallback\n    private void saveBase64WithPickerResult\(PluginCall call, ActivityResult result\) \{[\s\S]*?\n    \}\n/;
if(!pickerRe.test(java))throw new Error('StorageAccessPlugin.java: seletor Salvar como não encontrado');
java=java.replace(pickerRe,'\n');
const clearRe=/    @PluginMethod\n    public void clearOldUpdates\(PluginCall call\) \{[\s\S]*?\n    \}\n\}/;
if(!clearRe.test(java))throw new Error('StorageAccessPlugin.java: clearOldUpdates não encontrado');
java=java.replace(clearRe,`    @PluginMethod\n    public void clearOldUpdates(PluginCall call) {\n        JSObject ret = new JSObject();\n        ret.put("ok", true);\n        ret.put("requiresAllFilesAccess", false);\n        ret.put("deleted", 0);\n        ret.put("bytes", 0);\n        call.resolve(ret);\n    }\n}`);
await writeFile(javaPath,java,'utf8');

await appendFile(path.join(dist,'native-mobile.js'),"\n;globalThis.__TAREFAS_FIXED_STORAGE_V245__={downloads:'Downloads/TAREFAS',official:'Documentos/TAREFAS/Oficial',beta:'Documentos/TAREFAS/Beta'};\n",'utf8');
console.log('TAREFAS Android 2.3.15 build 245 BETA: armazenamento fixo restaurado, sem Salvar como e sem acesso total.');
