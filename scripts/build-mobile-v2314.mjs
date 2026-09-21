import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();

// Antes de gerar o bundle, neutraliza definitivamente a API antiga de acesso total.
const nativeEntryPath=path.join(root,'app','native-mobile-entry.js');
let nativeEntry=await readFile(nativeEntryPath,'utf8');
const nativeOld=`async function checkAllFilesAccess(){if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='android')return{granted:true,required:false};try{return await StorageAccess.checkAllFilesAccess()}catch(_){return{granted:false,required:false}}}\nasync function requestAllFilesAccess(){if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='android')return{opened:false,granted:true};return StorageAccess.requestAllFilesAccess()}\nasync function ensureFilesPermission(){await ensureLegacyFilesPermission();return checkAllFilesAccess()}`;
const nativeNew=`async function checkAllFilesAccess(){return{granted:true,required:false,deprecated:true}}\nasync function requestAllFilesAccess(){return{opened:false,granted:true,required:false,deprecated:true}}\nasync function ensureFilesPermission(){return{granted:true,required:false,deprecated:true}}`;
if(!nativeEntry.includes(nativeOld))throw new Error('native-mobile-entry.js: API antiga de acesso total não encontrada');
nativeEntry=nativeEntry.replace(nativeOld,nativeNew);
await writeFile(nativeEntryPath,nativeEntry,'utf8');

// O plugin Java não pode mais abrir a tela "Acesso a todos os arquivos".
const javaPath=path.join(root,'app','android','StorageAccessPlugin.java');
let java=await readFile(javaPath,'utf8');
java=java.replace('import android.provider.Settings;\n','');
const javaRe=/    private boolean hasAllFilesAccess\(\) \{[\s\S]*?\n    \}\n\n    @PluginMethod\n    public void requestAllFilesAccess\(PluginCall call\) \{[\s\S]*?\n    \}\n\n    private String safeName/;
if(!javaRe.test(java))throw new Error('StorageAccessPlugin.java: bloco antigo de acesso total não encontrado');
java=java.replace(javaRe,`    @PluginMethod\n    public void checkAllFilesAccess(PluginCall call) {\n        JSObject ret = new JSObject();\n        ret.put("granted", true);\n        ret.put("required", false);\n        ret.put("deprecated", true);\n        call.resolve(ret);\n    }\n\n    @PluginMethod\n    public void requestAllFilesAccess(PluginCall call) {\n        JSObject ret = new JSObject();\n        ret.put("opened", false);\n        ret.put("granted", true);\n        ret.put("required", false);\n        ret.put("deprecated", true);\n        call.resolve(ret);\n    }\n\n    private String safeName`);
await writeFile(javaPath,java,'utf8');

// Gera a base 2.3.13 já com o bridge neutralizado.
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2313.mjs')).href+'?v=2314');
const dist=path.join(root,'dist');

async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');s=fn(s);await writeFile(p,s,'utf8')}

for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.13','2.3.14').replaceAll('b243','b244');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 243;','const APP_BUILD = 244;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '243'","tarefasAppBuild = '244'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 243;','const APP_BUILD = 244;'));
await patch('mobile-schema-v239.js',s=>s.replace('build:243','build:244'));
await appendFile(path.join(dist,'native-mobile.js'),"\n;globalThis.__TAREFAS_NO_ALL_FILES_ACCESS_V244__=true;\n",'utf8');

console.log('TAREFAS Android 2.3.14 build 244 BETA: acesso total aos arquivos removido; Salvar como nativo preservado.');
