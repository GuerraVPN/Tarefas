import { readFile, writeFile, readdir, rm, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=process.cwd(),dist=path.join(root,'dist');
const VERSION='2.4.9.1',BUILD=294,WEB_VERSION='7.9.1',BASE='2.4.9';
const PATCH='2.4.8.7';

// Promove a base Beta 2.4.9 para a Alpha 2.4.9.1 sem reconstruir a linha principal.
await import('./build-mobile-v249.mjs');
const patch=async(rel,fn)=>{
  const f=path.join(dist,rel),before=await readFile(f,'utf8'),after=fn(before);
  if(after!==before)await writeFile(f,after,'utf8');
};

for(const name of await readdir(dist)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  await patch(name,s=>s
    .replaceAll('2.4.8.6',VERSION)
    .replaceAll('APP_BUILD=292','APP_BUILD='+BUILD)
    .replaceAll('APP_BUILD = 292','APP_BUILD = '+BUILD)
    .replaceAll('build:292','build:'+BUILD)
    .replaceAll('build: 292','build: '+BUILD)
    .replaceAll("channel:'alpha'","channel:'beta'")
    .replaceAll("channel: 'alpha'","channel: 'beta'")
    .replaceAll("APP_CHANNEL='alpha'","APP_CHANNEL='beta'")
    .replaceAll("APP_CHANNEL = 'alpha'","APP_CHANNEL = 'beta'")
    .replaceAll("const APP_CHANNEL = 'alpha'","const APP_CHANNEL = 'beta'")
  );
}

for(const name of await readdir(dist)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  await patch(name,s=>s
    .replaceAll("APP_VERSION='2.4.9'","APP_VERSION='2.4.9.1'")
    .replaceAll("APP_VERSION = '2.4.9'","APP_VERSION = '2.4.9.1'")
    .replaceAll("version:'2.4.9'","version:'2.4.9.1'")
    .replaceAll('versionName "2.4.9"','versionName "2.4.9.1"')
    .replaceAll('2.4.9-b293','2.4.9.1-b294')
    .replaceAll('APP_BUILD=293','APP_BUILD=294')
    .replaceAll('APP_BUILD = 293','APP_BUILD = 294')
    .replaceAll('build:293','build:294')
    .replaceAll('build: 293','build: 294')
    .replaceAll("APP_CHANNEL='beta'","APP_CHANNEL='alpha'")
    .replaceAll("APP_CHANNEL = 'beta'","APP_CHANNEL = 'alpha'")
    .replaceAll("const APP_CHANNEL = 'beta'","const APP_CHANNEL = 'alpha'")
    .replaceAll("channel:'beta'","channel:'alpha'")
    .replaceAll("channel: 'beta'","channel: 'alpha'")
  );
}

const p=JSON.parse(await readFile(path.join(root,'patches/TAREFAS-'+PATCH+'.tpatch'),'utf8'));
if(p.id!==PATCH||p.baseVersion!=='2.4.8.6'||Number(p.minBuild)!==292||Number(p.maxBuild)!==292)throw new Error('2.4.9.1: patch 2.4.8.7 de origem incompatível.');
const payloadText=JSON.stringify({js:String(p.payload?.js||''),css:String(p.payload?.css||'')});
const actual=createHash('sha256').update(payloadText,'utf8').digest('hex');
if(actual!==String(p.payloadSha256||'').toLowerCase())throw new Error('2.4.9.1: SHA interno do 2.4.8.7 divergente: '+actual);

await patch('mobile-bootstrap.js',source=>{
  const marker='__TAREFAS_PATCH_CONSOLIDATED_2487__';
  if(source.includes(marker))return source;
  return source+'\n;(()=>{\'use strict\';if(globalThis[\''+marker+'\'])return;globalThis[\''+marker+'\']=true;\n'+String(p.payload?.js||'')+'\n})();\n';
});

await patch('mobile-bootstrap.js',s=>s.replaceAll('dashboard.html?app=2.4.8.6','dashboard.html?app='+VERSION));
await patch('mobile-login-v17.js',s=>s.replaceAll('dashboard.html?app=2.4.8.6','dashboard.html?app='+VERSION));
await patch('index.html',s=>s.replaceAll('dashboard.html?app=2.4.8.6','dashboard.html?app='+VERSION));

await rm(path.join(dist,'ALPHA_2_4_8_6.json'),{force:true});
await rm(path.join(dist,'BETA_2_4_9.json'),{force:true});
await copyFile(path.join(root,'notas_fiscais.html'),path.join(dist,'notas_fiscais.html'));
await copyFile(path.join(root,'notas_fiscais_v1.js'),path.join(dist,'notas_fiscais_v1.js'));

await patch('orcamentarios.html',s=>{
  if(s.includes('notas_fiscais.html?modulo=notas_fiscais')) return s;
  const anchor='<div class="orc-module-nav"';
  if(!s.includes(anchor)) return s;
  return s.replace(anchor, '<a href="notas_fiscais.html?modulo=notas_fiscais" style="display:inline-flex;align-items:center;text-decoration:none;border:1px solid var(--v4-border);background:var(--v4-surface);color:var(--v4-text-2);padding:8px 10px;border-radius:9px;font-size:9px;font-weight:800;margin:0 0 12px">🧾 Notas Fiscais</a>\\n'+anchor);
});

await patch('mobile-bootstrap.js',s=>{
  const old="['Gestão', [";
  if(s.includes("['Notas Fiscais','notas_fiscais.html?modulo=notas_fiscais'")) return s;
  const marker="      ['Guias','orcamentarios.html?modulo=guias','Guias e fiscalização'],";
  if(!s.includes(marker)) throw new Error('2.4.9.1: ponto de menu Orçamentários não encontrado.');
  return s.replace(marker, marker+"\\n      ['Notas Fiscais','notas_fiscais.html?modulo=notas_fiscais','Empresas, notas, ND, depósito e andamento'],");
});
await writeFile(path.join(dist,'ALPHA_2_4_9_1.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'alpha',base:BASE,basedOn:'2.4.9',
  webVersion:WEB_VERSION,incorporatedPatch:'2.4.8.7',
  preservedPatches:['2.4.8.1','2.4.8.2','2.4.8.3','2.4.8.4','2.4.8.5'],
  features:{
    preRelease25:true,biometricSessionHandoff:true,biometricNativeSinglePrompt:true,
    patchManagerPreserved:true,patchManagerV1:true,scalesPreserved:true,
    servicesHotbar2468:true,dashboardNextServiceRemoved:true,web791Preserved:true,
    releaseBranchIsolatedFromMain:true,notasFiscaisModule:true,notasFiscaisOwnPage:true
  }
},null,2)+'\n');

const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');
const login=await readFile(path.join(dist,'mobile-login-v17.js'),'utf8');
const forbidden=['kNextServiceCard','kNextService','tm-next-service-kpi','v756-next-service','ensureNextCard','loadDashboardService','v756NextServiceCss','data-v756-next-icon','Próximo serviço</small>','Próximo Serviço</small>'];
for(const name of await readdir(dist)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  const c=await readFile(path.join(dist,name),'utf8');
  for(const token of forbidden)if(c.includes(token))throw new Error('2.4.9.1: origem do Próximo Serviço em '+name+' :: '+token);
}
for(const marker of ['__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__','__TAREFAS_ALPHA_2481_DISTRIBUICAO_FISCAL_FIX__','__TAREFAS_ALPHA_2482_GUIDES_READY_FIX__','__TAREFAS_ALPHA_2483_FORNECIMENTO__','__TAREFAS_ALPHA_2484_PEDIDO_LAYOUT_FIX__','__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__','__TAREFAS_PATCH_CONSOLIDATED_2487__']){
  if(!boot.includes(marker))throw new Error('2.4.9.1: marcador ausente '+marker);
}
if(boot.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'))throw new Error('2.4.9.1: patch 2.4.6.7 detectado.');
if(!boot.includes("const APP_VERSION = '2.4.9.1';")||!boot.includes('const APP_BUILD = 294;'))throw new Error('2.4.9.1: versão/build incorretos.');
if(!pm.includes("const APP_VERSION='2.4.9.1',APP_BUILD=294,APP_CHANNEL='alpha';"))throw new Error('2.4.9.1: Patch Manager não promovido.');
if(!login.includes('dashboard.html?app=2.4.9.1'))throw new Error('2.4.9.1: login sem cache-bust.');
console.log('TAREFAS Android 2.4.9.1 build 294 ALPHA — módulo Notas Fiscais integrado ao Orçamentários.');
