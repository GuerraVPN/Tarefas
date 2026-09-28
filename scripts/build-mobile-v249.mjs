import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=process.cwd(),dist=path.join(root,'dist');
const VERSION='2.4.9',BUILD=293,WEB_VERSION='7.9.1',BASE='2.4.8.6';
const PATCH='2.4.8.7';

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

const p=JSON.parse(await readFile(path.join(root,'patches/TAREFAS-'+PATCH+'.tpatch'),'utf8'));
if(p.id!==PATCH||p.baseVersion!==BASE||Number(p.minBuild)!==292||Number(p.maxBuild)!==292)throw new Error('2.4.9: patch 2.4.8.7 incompatível.');
const payloadText=JSON.stringify({js:String(p.payload?.js||''),css:String(p.payload?.css||'')});
const actual=createHash('sha256').update(payloadText,'utf8').digest('hex');
if(actual!==String(p.payloadSha256||'').toLowerCase())throw new Error('2.4.9: SHA interno do 2.4.8.7 divergente: '+actual);

await patch('mobile-bootstrap.js',source=>{
  const marker='__TAREFAS_PATCH_CONSOLIDATED_2487__';
  if(source.includes(marker))return source;
  return source+'\n;(()=>{\'use strict\';if(globalThis[\''+marker+'\'])return;globalThis[\''+marker+'\']=true;\n'+String(p.payload?.js||'')+'\n})();\n';
});

await patch('mobile-bootstrap.js',s=>s.replaceAll('dashboard.html?app=2.4.8.6','dashboard.html?app='+VERSION));
await patch('mobile-login-v17.js',s=>s.replaceAll('dashboard.html?app=2.4.8.6','dashboard.html?app='+VERSION));
await patch('index.html',s=>s.replaceAll('dashboard.html?app=2.4.8.6','dashboard.html?app='+VERSION));

await rm(path.join(dist,'ALPHA_2_4_8_6.json'),{force:true});
await writeFile(path.join(dist,'BETA_2_4_9.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'beta',base:BASE,basedOn:'2.4.8.6',
  webVersion:WEB_VERSION,incorporatedPatch:'2.4.8.7',
  preservedPatches:['2.4.8.1','2.4.8.2','2.4.8.3','2.4.8.4','2.4.8.5'],
  features:{
    preRelease25:true,biometricSessionHandoff:true,biometricNativeSinglePrompt:true,
    patchManagerPreserved:true,patchManagerV1:true,scalesPreserved:true,
    servicesHotbar2468:true,dashboardNextServiceRemoved:true,web791Preserved:true,
    releaseBranchIsolatedFromMain:true
  }
},null,2)+'\n');

const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');
const login=await readFile(path.join(dist,'mobile-login-v17.js'),'utf8');
const forbidden=['kNextServiceCard','kNextService','tm-next-service-kpi','v756-next-service','ensureNextCard','loadDashboardService','v756NextServiceCss','data-v756-next-icon','Próximo serviço</small>','Próximo Serviço</small>'];
for(const name of await readdir(dist)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  const c=await readFile(path.join(dist,name),'utf8');
  for(const token of forbidden)if(c.includes(token))throw new Error('2.4.9: origem do Próximo Serviço em '+name+' :: '+token);
}
for(const marker of ['__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__','__TAREFAS_ALPHA_2481_DISTRIBUICAO_FISCAL_FIX__','__TAREFAS_ALPHA_2482_GUIDES_READY_FIX__','__TAREFAS_ALPHA_2483_FORNECIMENTO__','__TAREFAS_ALPHA_2484_PEDIDO_LAYOUT_FIX__','__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__','__TAREFAS_PATCH_CONSOLIDATED_2487__']){
  if(!boot.includes(marker))throw new Error('2.4.9: marcador ausente '+marker);
}
if(boot.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'))throw new Error('2.4.9: patch 2.4.6.7 detectado.');
if(!boot.includes("const APP_VERSION = '2.4.9';")||!boot.includes('const APP_BUILD = 293;'))throw new Error('2.4.9: versão/build incorretos.');
if(!pm.includes("const APP_VERSION='2.4.9',APP_BUILD=293,APP_CHANNEL='beta';"))throw new Error('2.4.9: Patch Manager não promovido.');
if(!login.includes('dashboard.html?app=2.4.9'))throw new Error('2.4.9: login sem cache-bust.');
console.log('TAREFAS Android 2.4.9 build 293 BETA — pré-release da 2.5 com handoff de sessão biométrica consolidado.');
