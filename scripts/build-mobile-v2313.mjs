import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2312.mjs')).href+'?v=2313');
const dist=path.join(root,'dist');

async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');const before=s;s=fn(s);if(s===before)console.warn(`[2.3.13] sem alteração em ${rel}`);await writeFile(p,s,'utf8')}
async function rep(rel,from,to,{required=true}={}){await patch(rel,s=>{if(required&&!s.includes(from))throw new Error(`${rel}: trecho não encontrado: ${from}`);return s.split(from).join(to)})}

// Versão/build 243 e cache-bust.
for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.12','2.3.13').replaceAll('b242','b243');
  await writeFile(p,s,'utf8');
}
await rep('mobile-bootstrap.js','const APP_BUILD = 242;','const APP_BUILD = 243;');
await rep('mobile-preload.js',"tarefasAppBuild = '242'","tarefasAppBuild = '243'");
await rep('mobile-updates-v181.js','const APP_BUILD = 242;','const APP_BUILD = 243;');
await rep('mobile-schema-v239.js','build:242','build:243',{required:false});

// Aditamento: o bridge Android agora abre ACTION_CREATE_DOCUMENT (Salvar como).
await patch('aditamento_v74.js',s=>{
  s=s.replace('const __ADITAMENTO_NATIVE_SAVE_V242__=true;','const __ADITAMENTO_NATIVE_SAVE_V242__=true;const __ADITAMENTO_SAVE_PICKER_V243__=true;');
  const old="    const r=await window.TarefasNative.files.saveBlob(blob,filename);\n    if(r?.ok||r?.saved||r?.shared||r?.path)return r||{ok:true,saved:true,path:filename};";
  const next="    const r=await window.TarefasNative.files.saveBlob(blob,filename);\n    if(r?.canceled)throw new Error('Salvamento cancelado pelo usuário.');\n    if(r?.ok||r?.saved||r?.shared||r?.path)return r||{ok:true,saved:true,path:filename};";
  if(!s.includes(old))throw new Error('aditamento_v74.js: bridge de salvamento esperado não encontrado');
  s=s.replace(old,next).replaceAll('[ADITAMENTO 242]','[ADITAMENTO 243]');
  return s;
});

// Marca o bundle nativo aprovado para o seletor de destino.
await appendFile(path.join(dist,'native-mobile.js'),"\n;globalThis.__TAREFAS_SAVE_PICKER_V243__=true;\n",'utf8');

console.log('TAREFAS Android 2.3.13 build 243 BETA: documentos gerados usam seletor nativo Salvar como; Aditamento PDF/ODT preservado.');