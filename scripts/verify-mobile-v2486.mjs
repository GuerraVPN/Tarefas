import { access,readFile,readdir } from 'node:fs/promises';
import path from 'node:path';
const dir=path.resolve(process.argv[2]||'dist'),root=process.cwd();
const read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.8.6 verify: '+m)};
for(const f of ['mobile-bootstrap.js','mobile-login-v17.js','mobile-patch-manager-v240.js','dashboard.html','dashboard.js','about.html','ALPHA_2_4_8_6.json'])await access(path.join(dir,f));
const b=await read('mobile-bootstrap.js'),pm=await read('mobile-patch-manager-v240.js'),m=JSON.parse(await read('ALPHA_2_4_8_6.json')),patch=JSON.parse(await readFile(path.join(root,'patches/TAREFAS-2.4.8.1.tpatch'),'utf8'));
must(b.includes("const APP_VERSION = '2.4.8.6';")&&b.includes('const APP_BUILD = 292;'),'versão/build incorretos');
must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'2.4.6.8 ausente');
must(!b.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'2.4.6.7 detectado');
must(b.includes('__TAREFAS_ALPHA_2481_DISTRIBUICAO_FISCAL_FIX__'),'fix de Distribuição ausente');
must(pm.includes("const FORMAT='tarefas-tpatch-v1'")&&pm.includes('crypto.subtle.digest')&&pm.includes('indexedDB.open'),'Patch Manager v1 incompleto');
must(patch.id==='2.4.8.1'&&patch.baseVersion==='2.4.8'&&patch.payloadSha256==='76a24c5ec529a67e2a4ad41a84ed5d2366db6edf49c8ea21fcb554bfd83a0e70','tpatch 2.4.8.1 inválido');
const forbidden=['kNextServiceCard','kNextService','tm-next-service-kpi','v756-next-service','ensureNextCard','loadDashboardService','v756NextServiceCss','data-v756-next-icon','Próximo serviço</small>','Próximo Serviço</small>'];
for(const name of await readdir(dir)){if(!/\.(?:js|html)$/i.test(name))continue;const c=await read(name);for(const t of forbidden)must(!c.includes(t),name+' contém '+t)}
for(const [id,sha] of [['2.4.8.2','0796607aa0b1eb973389321dba2123bd235e37454e8bee86bc0c46cb372c8269'],['2.4.8.3','904e33da3ed073c2c7e3aa4366e7fffa61507c4c11b5a2241e9fc1ab86c9d6bf'],['2.4.8.4','62d280d83c38a9978c1f374735f8f218a3ed317ee99a81c59f7c97094e3aea3b'],['2.4.8.5','4ef407e95833c75bb05b4b3da5dab3f872038e03c06390107500b71fb0bc1299']]){
  const p=JSON.parse(await readFile(path.join(root,'patches/TAREFAS-'+id+'.tpatch'),'utf8'));
  must(p.id===id&&p.baseVersion==='2.4.8'&&p.payloadSha256===sha,'patch '+id+' inválido ou SHA divergente');
  must(b.includes(String(p.payload?.js||'').slice(0,80)), 'payload '+id+' não consolidado no bootstrap');
}
const java=await readFile(path.join(root,'app/android/TarefasBiometricPlugin.java'),'utf8');
for(const marker of ['authenticateInProgress','pendingAuthenticateCalls','resolvePendingAuthenticateCalls','rejectPendingAuthenticateCalls','if (authenticateInProgress)','synchronized (authenticateLock)'])must(java.includes(marker),'trava nativa ausente: '+marker);
must((java.match(/new BiometricPrompt\(/g)||[]).length===1,'mais de um BiometricPrompt criado no plugin');
must(!java.includes('activePrompt'),'não usar uma segunda instância de prompt');
const v756=await read('v7_5_6_patch.js');must(v756.includes('loadCalendarServices')&&v756.includes('applyCalendarServices'),'v7.5.6 de calendário não preservado');
must(m.version==='2.4.8.6'&&m.build===292&&m.channel==='alpha'&&m.basedOn==='2.4.8.5'&&m.incorporatedPatch==='2.4.6.8','manifesto incorreto');
must(Array.isArray(m.preservedPatches)&&m.preservedPatches.join(',')==='2.4.8.1,2.4.8.2,2.4.8.3,2.4.8.4,2.4.8.5','patches 2.4.8.x não consolidados');
console.log('VERIFY 2.4.8.6 ALPHA OK: patches 2.4.8.1–2.4.8.5 consolidados; trava nativa contra BiometricPrompt duplicado; Patch Manager preservado; Próximo Serviço ausente.');
