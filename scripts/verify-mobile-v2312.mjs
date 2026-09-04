import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const exists=async r=>{try{await access(path.join(root,r));return true}catch{return false}};
const text=r=>readFile(path.join(root,r),'utf8');
const req=(s,m,c)=>{if(!s.includes(m))errors.push(`${c}: marcador ausente: ${m}`)};
const forbid=(s,m,c)=>{if(s.includes(m))errors.push(`${c}: conteúdo proibido: ${m}`)};

for(const r of ['mobile-bootstrap.js','mobile-preload.js','aditamento_v74.js','pessoal.html','jspdf.umd.min.js','orcamentarios.html','orcamentarios-loader-v242.js','pedidos_v6.js','movimentacoes_v6.js','v7_7_0_material_carga.js'])if(!await exists(r))errors.push(`arquivo ausente: ${r}`);

if(await exists('mobile-bootstrap.js')){const s=await text('mobile-bootstrap.js');req(s,"const APP_VERSION = '2.3.12'",'bootstrap');req(s,'const APP_BUILD = 242','bootstrap')}
if(await exists('mobile-preload.js')){const s=await text('mobile-preload.js');req(s,"tarefasAppVersion = '2.3.12'",'preload');req(s,"tarefasAppBuild = '242'",'preload')}

if(await exists('pessoal.html')){const s=await text('pessoal.html');req(s,'jspdf.umd.min.js?v=2.3.12-b242','pessoal');req(s,'aditamento_v74.js?v=2.3.12-b242','pessoal');forbid(s,'cdn.jsdelivr.net/npm/jspdf','pessoal')}
if(await exists('aditamento_v74.js')){
 const s=await text('aditamento_v74.js');
 for(const m of ['ADITAMENTO AO BOLETIM INTERNO','ADITAMENTO_ODT','generatePdf','generateOdt','__ADITAMENTO_NATIVE_SAVE_V242__',"saveAditamentoBlob(doc.output('blob'),filename)","sc.src='jspdf.umd.min.js?v=2.3.12-b242'"])req(s,m,'aditamento');
 for(const m of ['doc.save(filename)','ESCALA DE SERVIÇO','ESCALA DE MISSÃO','cdn.jsdelivr.net/npm/jspdf'])forbid(s,m,'aditamento');
}
if(await exists('v7_7_2_scale_export.js'))errors.push('exportador de escala ainda empacotado');

if(await exists('orcamentarios.html')){const s=await text('orcamentarios.html');req(s,'orcamentarios-loader-v242.js?v=2.3.12-b242','orcamentarios');forbid(s,'orcamentarios-loader-v241.js','orcamentarios')}
if(await exists('orcamentarios-loader-v242.js')){const s=await text('orcamentarios-loader-v242.js');req(s,'__TAREFAS_ORC_LOADER_V242__','loader');req(s,"material_carga:['material_carga_v6.js','v7_7_0_material_carga.js']",'loader')}
if(await exists('orcamentarios-loader-v241.js'))errors.push('loader 241 ainda empacotado');

for(const r of ['pedidos_v6.js','movimentacoes_v6.js'])if(await exists(r)){const s=await text(r);forbid(s,'limit(10000)',r);req(s,'.limit(300)',r)}
if(await exists('v7_7_0_material_carga.js')){
 const s=await text('v7_7_0_material_carga.js');
 req(s,'__TAREFAS_MATERIAL_CARGA_EVENT_DRIVEN_V242__','material carga');
 req(s,".eq('tipo_referencia',tipoAtual())",'material carga');
 req(s,".eq('status','pendente')",'material carga');
 for(const m of ['MutationObserver','observe(','setInterval(','300000','60000'])forbid(s,m,'material carga');
}

for(const r of ['aditamento_v74.js','orcamentarios-loader-v242.js','v7_7_0_material_carga.js','material_carga_v6.js','pedidos_v6.js','movimentacoes_v6.js'])if(await exists(r)){
 const x=spawnSync(process.execPath,['--check',path.join(root,r)],{encoding:'utf8'});if(x.status!==0)errors.push(`${r}: JavaScript inválido: ${x.stderr.trim()}`)
}
if(errors.length){for(const e of errors)console.error('ERRO: '+e);process.exit(1)}
console.log('OK: 2.3.12 build 242 — Aditamento com jsPDF local/bridge nativo e Material Carga orientado a eventos.');
