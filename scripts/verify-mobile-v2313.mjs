import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const repo=process.cwd();
const exists=async r=>{try{await access(path.join(root,r));return true}catch{return false}};
const text=r=>readFile(path.join(root,r),'utf8');
const req=(s,m,c)=>{if(!s.includes(m))errors.push(`${c}: marcador ausente: ${m}`)};
const forbid=(s,m,c)=>{if(s.includes(m))errors.push(`${c}: conteúdo proibido: ${m}`)};

for(const r of ['mobile-bootstrap.js','mobile-preload.js','native-mobile.js','aditamento_v74.js','pessoal.html','jspdf.umd.min.js','orcamentarios.html','orcamentarios-loader-v243.js','sistema_comum.js','pedidos_v6.js','movimentacoes_v6.js','material_carga_v6.js','v7_7_0_material_carga.js'])if(!await exists(r))errors.push(`arquivo ausente: ${r}`);

if(await exists('mobile-bootstrap.js')){const s=await text('mobile-bootstrap.js');req(s,"const APP_VERSION = '2.3.13'",'bootstrap');req(s,'const APP_BUILD = 243','bootstrap')}
if(await exists('mobile-preload.js')){const s=await text('mobile-preload.js');req(s,"tarefasAppVersion = '2.3.13'",'preload');req(s,"tarefasAppBuild = '243'",'preload')}
if(await exists('native-mobile.js')){const s=await text('native-mobile.js');req(s,'__TAREFAS_SAVE_PICKER_V243__','native bundle');req(s,'saveBase64WithPicker','native bundle')}

const nativeSource=await readFile(path.join(repo,'app','native-mobile-entry.js'),'utf8');
req(nativeSource,'StorageAccess.saveBase64WithPicker','native source');
req(nativeSource,"'application/vnd.oasis.opendocument.text':'.odt'",'native source');
const androidPickerBlock=nativeSource.match(/if\(Capacitor\.isNativePlatform\(\)&&Capacitor\.getPlatform\(\)==='android'\)\{[\s\S]*?\n \}/)?.[0]||'';
req(androidPickerBlock,'saveBase64WithPicker','native saveBlob android');
forbid(androidPickerBlock,'saveBase64ToDownloads','native saveBlob android');

const java=await readFile(path.join(repo,'app','android','StorageAccessPlugin.java'),'utf8');
for(const m of ['Intent.ACTION_CREATE_DOCUMENT','Intent.CATEGORY_OPENABLE','Intent.EXTRA_TITLE','@ActivityCallback','saveBase64WithPickerResult','resolver.openOutputStream(targetUri, "w")'])req(java,m,'StorageAccessPlugin');

if(await exists('pessoal.html')){const s=await text('pessoal.html');req(s,'jspdf.umd.min.js?v=2.3.13-b243','pessoal');req(s,'aditamento_v74.js?v=2.3.13-b243','pessoal');forbid(s,'cdn.jsdelivr.net/npm/jspdf','pessoal')}
if(await exists('aditamento_v74.js')){
 const s=await text('aditamento_v74.js');
 for(const m of ['ADITAMENTO AO BOLETIM INTERNO','ADITAMENTO_ODT','generatePdf','generateOdt','__ADITAMENTO_NATIVE_SAVE_V242__','__ADITAMENTO_SAVE_PICKER_V243__',"saveAditamentoBlob(doc.output('blob'),filename)","sc.src='jspdf.umd.min.js?v=2.3.13-b243'","Salvamento cancelado pelo usuário."])req(s,m,'aditamento');
 for(const m of ['doc.save(filename)','ESCALA DE SERVIÇO','ESCALA DE MISSÃO','cdn.jsdelivr.net/npm/jspdf'])forbid(s,m,'aditamento');
}
if(await exists('v7_7_2_scale_export.js'))errors.push('exportador de escala ainda empacotado');

if(await exists('orcamentarios.html')){
 const s=await text('orcamentarios.html');
 req(s,'orcamentarios-loader-v243.js?v=2.3.13-b243','orcamentarios');
 req(s,'sistema_comum.js?v=2.3.13-b243','orcamentarios');
 forbid(s,'orcamentarios-loader-v242.js','orcamentarios');forbid(s,'orcamentarios-loader-v241.js','orcamentarios');
}
if(await exists('orcamentarios-loader-v243.js')){
 const s=await text('orcamentarios-loader-v243.js');
 req(s,'__TAREFAS_ORC_LOADER_V243__','loader');
 req(s,"material_carga:['material_carga_v6.js','v7_7_0_material_carga.js']",'loader');
 req(s,'function alreadyLoaded','loader');
 req(s,'applyView();','loader');
}
if(await exists('orcamentarios-loader-v242.js'))errors.push('loader 242 ainda empacotado');
if(await exists('orcamentarios-loader-v241.js'))errors.push('loader 241 ainda empacotado');
if(await exists('sistema_comum.js')){
 const s=await text('sistema_comum.js');req(s,'__TAREFAS_ORC_LAZY_GATE_V243_DISABLED__','sistema comum');forbid(s,'data-orc-report-light','sistema comum');
}

for(const r of ['pedidos_v6.js','movimentacoes_v6.js'])if(await exists(r)){const s=await text(r);forbid(s,'limit(10000)',r);req(s,'.limit(300)',r)}
if(await exists('material_carga_v6.js')){
 const s=await text('material_carga_v6.js');req(s,'__TAREFAS_MATERIAL_CARGA_BASE_READY__','material carga base');req(s,'await Promise.all([loadRefs(),loadDocs()])','material carga base');
}
if(await exists('v7_7_0_material_carga.js')){
 const s=await text('v7_7_0_material_carga.js');
 req(s,'__TAREFAS_MATERIAL_CARGA_EVENT_DRIVEN_V242__','material carga');req(s,'__TAREFAS_MATERIAL_CARGA_SERIAL_V243__','material carga');req(s,'async function waitBase()','material carga');
 for(const m of ['MutationObserver','setInterval('])forbid(s,m,'material carga');
}

for(const r of ['aditamento_v74.js','orcamentarios-loader-v243.js','sistema_comum.js','v7_7_0_material_carga.js','material_carga_v6.js','pedidos_v6.js','movimentacoes_v6.js','native-mobile.js'])if(await exists(r)){
 const x=spawnSync(process.execPath,['--check',path.join(root,r)],{encoding:'utf8'});if(x.status!==0)errors.push(`${r}: JavaScript inválido: ${x.stderr.trim()}`)
}
if(errors.length){for(const e of errors)console.error('ERRO: '+e);process.exit(1)}
console.log('OK: 2.3.13 build 243 — Salvar como nativo, Aditamento PDF/ODT, loader único do Orçamentários e Material Carga serializado.');