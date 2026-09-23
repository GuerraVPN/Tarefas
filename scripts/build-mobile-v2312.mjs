import { copyFile, readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2311.mjs')).href+'?v=2312');
const dist=path.join(root,'dist');

async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');const before=s;s=fn(s);if(s===before)console.warn(`[2.3.12] sem alteração em ${rel}`);await writeFile(p,s,'utf8')}
async function rep(rel,from,to,{required=true}={}){await patch(rel,s=>{if(required&&!s.includes(from))throw new Error(`${rel}: trecho não encontrado: ${from}`);return s.split(from).join(to)})}

// Versão/build e cache-bust.
for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.11','2.3.12').replaceAll('b241','b242');
  await writeFile(p,s,'utf8');
}
await rep('mobile-bootstrap.js','const APP_BUILD = 241;','const APP_BUILD = 242;');
await rep('mobile-preload.js',"tarefasAppBuild = '241'","tarefasAppBuild = '242'");
await rep('mobile-updates-v181.js','const APP_BUILD = 241;','const APP_BUILD = 242;');
await rep('mobile-schema-v239.js','build:241','build:242',{required:false});

// PDF do Aditamento: jsPDF local, embarcado no APK, sem CDN no WebView.
await copyFile(path.join(root,'node_modules','jspdf','dist','jspdf.umd.min.js'),path.join(dist,'jspdf.umd.min.js'));
await patch('pessoal.html',s=>s
  .replaceAll('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','jspdf.umd.min.js?v=2.3.12-b242')
  .replace(/aditamento_v74\.js\?v=[^"']+/g,'aditamento_v74.js?v=2.3.12-b242'));

await patch('aditamento_v74.js',s=>{
  s=s.replace("sc.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';","sc.src='jspdf.umd.min.js?v=2.3.12-b242';");

  const oldSave=`    try{doc.save(filename)}catch(saveError){\n      console.warn('doc.save falhou; usando fallback de Blob.',saveError);\n      const blob=doc.output('blob'),url=URL.createObjectURL(blob),a=document.createElement('a');\n      a.href=url;a.download=filename;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();\n      setTimeout(()=>URL.revokeObjectURL(url),60000);\n    }`;
  if(!s.includes(oldSave))throw new Error('aditamento_v74.js: bloco doc.save esperado não encontrado');
  s=s.replace(oldSave,`    const saved=await saveAditamentoBlob(doc.output('blob'),filename);\n    console.info('[ADITAMENTO 242] PDF salvo',saved?.path||filename);`);

  const oldBlob="async function saveAditamentoBlob(blob,filename){if(window.TarefasNative?.isNative&&window.TarefasNative?.files?.saveBlob){const r=await window.TarefasNative.files.saveBlob(blob,filename);if(r?.saved)return r}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);return{saved:true}}";
  const newBlob=`const __ADITAMENTO_NATIVE_SAVE_V242__=true;\nasync function saveAditamentoBlob(blob,filename){\n  if(!(blob instanceof Blob))throw new Error('Arquivo do aditamento inválido.');\n  if(window.TarefasNative?.files?.saveBlob){\n    const r=await window.TarefasNative.files.saveBlob(blob,filename);\n    if(r?.ok||r?.saved||r?.shared||r?.path)return r||{ok:true,saved:true,path:filename};\n  }\n  const url=URL.createObjectURL(blob),a=document.createElement('a');\n  a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();\n  setTimeout(()=>URL.revokeObjectURL(url),4000);\n  return{ok:true,saved:true,path:filename};\n}`;
  if(!s.includes(oldBlob))throw new Error('aditamento_v74.js: saveAditamentoBlob antigo não encontrado');
  s=s.replace(oldBlob,newBlob);

  // Mensagens mais claras no Android: o modal só fecha após o bridge confirmar o arquivo.
  s=s.replace("setStatus(`PDF gerado com ${days.length} dia(s), ${standbyCount} bloco(s) de sobreaviso e ${context.missions.length} missão(ões).`);","setStatus(`PDF salvo com ${days.length} dia(s), ${standbyCount} bloco(s) de sobreaviso e ${context.missions.length} missão(ões).`);");
  s=s.replace("await saveAditamentoBlob(buildAditamentoOdt(context),filename);const standbyCount=days.filter(x=>x.includeStandby).length;setStatus('ODT gerado com '+days.length+' dia(s), '+standbyCount+' bloco(s) de sobreaviso e '+context.missions.length+' missão(ões).');","const saved=await saveAditamentoBlob(buildAditamentoOdt(context),filename);console.info('[ADITAMENTO 242] ODT salvo',saved?.path||filename);const standbyCount=days.filter(x=>x.includeStandby).length;setStatus('ODT salvo com '+days.length+' dia(s), '+standbyCount+' bloco(s) de sobreaviso e '+context.missions.length+' missão(ões).');");
  return s;
});

// Material Carga/Depósitos: o observer da 2.3.11 ainda podia se retroalimentar.
// Agora não há MutationObserver nem polling. Atualiza somente por eventos reais.
await patch('v7_7_0_material_carga.js',s=>{
  s=s.replace(
    "supabaseClient.from('orc_documentos_carga').select('*').order('tipo_referencia').order('referencia').order('versao',{ascending:false})",
    "supabaseClient.from('orc_documentos_carga').select('id,tipo_referencia,referencia,versao,arquivo_nome,arquivo_path,arquivo_url,arquivo_mime,arquivo_tamanho,observacao,criado_em,conferido_em,conferido_por,motivo_atualizacao').eq('tipo_referencia',tipoAtual()).order('referencia').order('versao',{ascending:false})"
  );
  s=s.replace(
    "supabaseClient.from('orc_carga_pendencias').select('*').order('criada_em',{ascending:false})",
    "supabaseClient.from('orc_carga_pendencias').select('id,tipo_referencia,referencia,status,origem_tipo,origem_id,origem_numero,descricao,criada_em').eq('status','pendente').order('criada_em',{ascending:false})"
  );
  const oldObserver="const host=$('materialCargaModule');if(host){let queued=false;const obs=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;renderAll()})});obs.observe(host,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']})}";
  const eventDriven="const host=$('materialCargaModule');if(host&&!host.dataset.v770EventDriven){host.dataset.v770EventDriven='1';const list=$('cargaRefList');if(list)list.addEventListener('click',()=>setTimeout(renderAll,0));document.querySelectorAll('[data-carga-tipo]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>refresh().catch(e=>console.warn('[MATERIAL CARGA 242]',e)),250)));document.addEventListener('visibilitychange',()=>{if(!document.hidden&&window.__TAREFAS_ORC_ACTIVE_MODULE__==='material_carga')refresh().catch(e=>console.warn('[MATERIAL CARGA 242]',e))})}";
  if(!s.includes(oldObserver))throw new Error('v7_7_0_material_carga.js: observer 2.3.11 não encontrado');
  s=s.replace(oldObserver,eventDriven);
  const oldPoll="setInterval(()=>{if(!document.hidden)refresh()},300000);";
  if(!s.includes(oldPoll))throw new Error('v7_7_0_material_carga.js: polling 2.3.11 não encontrado');
  s=s.replace(oldPoll,'/* 2.3.12: sem polling automático; atualização orientada a eventos. */');
  if(!s.includes('__TAREFAS_V770_MATERIAL_CARGA__'))throw new Error('v7_7_0_material_carga.js inválido');
  s=s.replace("window.__TAREFAS_V770_MATERIAL_CARGA__=true;","window.__TAREFAS_V770_MATERIAL_CARGA__=true;window.__TAREFAS_MATERIAL_CARGA_EVENT_DRIVEN_V242__=true;");
  return s;
});

// Loader 242.
await copyFile(path.join(root,'app','orcamentarios-loader-v242.js'),path.join(dist,'orcamentarios-loader-v242.js'));
await patch('orcamentarios.html',s=>s
  .replace(/<script\s+src=["']orcamentarios-loader-v241\.js[^"']*["'][^>]*><\/script>/gi,'<script src="orcamentarios-loader-v242.js?v=2.3.12-b242"></script>')
  .replace(/sistema_comum\.js\?v=[^"']+/g,'sistema_comum.js?v=2.3.12-b242'));
try{await unlink(path.join(dist,'orcamentarios-loader-v241.js'))}catch(_){}

console.log('TAREFAS Android 2.3.12 build 242 BETA: Aditamento PDF/ODT com bridge nativo e Material Carga/Depósitos sem observer/polling.');
