import { access,readFile,readdir } from 'node:fs/promises';
import path from 'node:path';
const dir=path.resolve(process.argv[2]||'dist'),root=process.cwd();
const read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.8.1 verify: '+m)};
for(const f of ['mobile-bootstrap.js','mobile-login-v17.js','mobile-patch-manager-v240.js','dashboard.html','dashboard.js','about.html','ALPHA_2_4_8_1.json'])await access(path.join(dir,f));
const b=await read('mobile-bootstrap.js'),pm=await read('mobile-patch-manager-v240.js'),m=JSON.parse(await read('ALPHA_2_4_8_1.json')),patch=JSON.parse(await readFile(path.join(root,'patches/TAREFAS-2.4.8.1.tpatch'),'utf8'));
must(b.includes("const APP_VERSION = '2.4.8.1';")&&b.includes('const APP_BUILD = 291;'),'versão/build incorretos');
must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'2.4.6.8 ausente');
must(!b.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'2.4.6.7 detectado');
must(b.includes('__TAREFAS_ALPHA_2481_DISTRIBUICAO_FISCAL_FIX__'),'fix de Distribuição ausente');
must(pm.includes("const FORMAT='tarefas-tpatch-v1'")&&pm.includes('crypto.subtle.digest')&&pm.includes('indexedDB.open'),'Patch Manager v1 incompleto');
must(patch.id==='2.4.8.1'&&patch.baseVersion==='2.4.8'&&patch.payloadSha256==='76a24c5ec529a67e2a4ad41a84ed5d2366db6edf49c8ea21fcb554bfd83a0e70','tpatch 2.4.8.1 inválido');
const forbidden=['kNextServiceCard','kNextService','tm-next-service-kpi','v756-next-service','ensureNextCard','loadDashboardService','v756NextServiceCss','data-v756-next-icon','Próximo serviço</small>','Próximo Serviço</small>'];
for(const name of await readdir(dir)){if(!/\.(?:js|html)$/i.test(name))continue;const c=await read(name);for(const t of forbidden)must(!c.includes(t),name+' contém '+t)}
const v756=await read('v7_5_6_patch.js');must(v756.includes('loadCalendarServices')&&v756.includes('applyCalendarServices'),'v7.5.6 de calendário não preservado');
must(m.version==='2.4.8.1'&&m.build===291&&m.channel==='alpha'&&m.basedOn==='2.4.8'&&m.incorporatedPatch==='2.4.6.8','manifesto incorreto');
console.log('VERIFY 2.4.8.1 ALPHA OK: fix da Distribuição presente; somente 2.4.6.8; Patch Manager preservado; Próximo Serviço ausente.');
