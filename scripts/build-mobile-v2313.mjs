import { appendFile, copyFile, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
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

// Um único dono do lazy-load no Orçamentários. O gate antigo do sistema_comum
// interceptava DOMContentLoaded e também podia carregar o relatório em paralelo.
await patch('sistema_comum.js',s=>{
  const re=/  function installOrcLazyGate\(\)\{[\s\S]*?\n  \}\n  installOrcLazyGate\(\);/;
  if(!re.test(s))throw new Error('sistema_comum.js: lazy gate antigo não encontrado');
  return s.replace(re,"  function installOrcLazyGate(){ window.__TAREFAS_ORC_LAZY_GATE_V243_DISABLED__=true; }\n  installOrcLazyGate();");
});

// Loader 243 é o único responsável por mostrar e carregar o módulo aberto.
await copyFile(path.join(root,'app','orcamentarios-loader-v243.js'),path.join(dist,'orcamentarios-loader-v243.js'));
await patch('orcamentarios.html',s=>s
  .replace(/<script\s+src=["']orcamentarios-loader-v242\.js[^"']*["'][^>]*><\/script>/gi,'<script src="orcamentarios-loader-v243.js?v=2.3.13-b243"></script>')
  .replace(/sistema_comum\.js\?v=[^"']+/g,'sistema_comum.js?v=2.3.13-b243'));
try{await unlink(path.join(dist,'orcamentarios-loader-v242.js'))}catch(_){}
try{await unlink(path.join(dist,'orcamentarios-loader-v241.js'))}catch(_){}

// Material Carga: primeiro desenha referências/documentos; detentores entram depois.
// Isso evita a rajada simultânea de consultas quando o módulo e o complemento 7.7.0 iniciam juntos.
await patch('material_carga_v6.js',s=>{
  const old=`async function start(){\n if(!await initUser())return;bind();await Promise.all([loadRefs(),loadDocs(),loadDetentores()]);\n const p=new URLSearchParams(location.search);if(p.get('modulo')==='material_carga')switchToCarga();\n}`;
  const neu=`async function start(){\n if(!await initUser())return;bind();await Promise.all([loadRefs(),loadDocs()]);\n const p=new URLSearchParams(location.search);if(p.get('modulo')==='material_carga')switchToCarga();else renderList();\n window.__TAREFAS_MATERIAL_CARGA_BASE_READY__=true;\n setTimeout(async()=>{try{await loadDetentores();renderList();if(selectedRef)renderDetail()}catch(e){console.warn('[MATERIAL CARGA 243] detentores',e)}},0);\n}`;
  if(!s.includes(old))throw new Error('material_carga_v6.js: start esperado não encontrado');
  return s.replace(old,neu);
});

// Complemento 7.7.0 espera o módulo base terminar e faz somente um refresh por troca de aba.
await patch('v7_7_0_material_carga.js',s=>{
  const oldStart="async function start(){\n injectCss();if(!await initUser())return;await refresh();bindProcessWatcher();await restoreFocus();renderAll();";
  const newStart="async function waitBase(){for(let i=0;i<50&&!window.__TAREFAS_MATERIAL_CARGA_BASE_READY__;i++)await new Promise(r=>setTimeout(r,40))}\nasync function start(){\n injectCss();if(!await initUser())return;await waitBase();await refresh();bindProcessWatcher();await restoreFocus();renderAll();";
  if(!s.includes(oldStart))throw new Error('v7_7_0_material_carga.js: start esperado não encontrado');
  s=s.replace(oldStart,newStart);
  s=s.replace("document.querySelectorAll('[data-carga-tipo]').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,120)));",'/* 2.3.13: refresh da aba controlado somente pelo listener event-driven. */');
  s=s.replace('window.__TAREFAS_MATERIAL_CARGA_EVENT_DRIVEN_V242__=true;','window.__TAREFAS_MATERIAL_CARGA_EVENT_DRIVEN_V242__=true;window.__TAREFAS_MATERIAL_CARGA_SERIAL_V243__=true;');
  return s;
});

// Marca o bundle nativo aprovado para o seletor de destino.
await appendFile(path.join(dist,'native-mobile.js'),"\n;globalThis.__TAREFAS_SAVE_PICKER_V243__=true;\n",'utf8');

console.log('TAREFAS Android 2.3.13 build 243 BETA: Salvar como nativo, loader único do Orçamentários e Material Carga serializado.');