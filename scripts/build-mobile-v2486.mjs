import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const dist=path.join(root,'dist');
const VERSION='2.4.8.6';
const BUILD=292;
const WEB_VERSION='7.9.1';
const BASE='2.4.8';
const PATCHES=['2.4.8.1','2.4.8.2','2.4.8.3','2.4.8.4','2.4.8.5'];

await import('./build-mobile-v248.mjs');

const patch=async(rel,fn)=>{
  const f=path.join(dist,rel);
  const before=await readFile(f,'utf8');
  const after=fn(before);
  if(after!==before)await writeFile(f,after,'utf8');
};

for(const name of await readdir(dist)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  await patch(name,s=>s
    .replaceAll("APP_VERSION='2.4.8'","APP_VERSION='"+VERSION+"'")
    .replaceAll("APP_VERSION = '2.4.8'","APP_VERSION = '"+VERSION+"'")
    .replaceAll("version:'2.4.8'","version:'"+VERSION+"'")
    .replaceAll("version: '2.4.8'","version: '"+VERSION+"'")
    .replaceAll('2.4.8-b290',VERSION+'-b'+BUILD)
    .replaceAll('APP_BUILD=290','APP_BUILD='+BUILD)
    .replaceAll('APP_BUILD = 290','APP_BUILD = '+BUILD)
    .replaceAll('build:290','build:'+BUILD)
    .replaceAll("channel:'beta'","channel:'alpha'")
    .replaceAll("channel: 'beta'","channel: 'alpha'")
    .replaceAll("APP_CHANNEL='beta'","APP_CHANNEL='alpha'")
    .replaceAll("APP_CHANNEL = 'beta'","APP_CHANNEL = 'alpha'")
    .replaceAll("const APP_CHANNEL = 'beta'","const APP_CHANNEL = 'alpha'")
  );
}

for(const id of PATCHES){
  const file=path.join(root,'patches','TAREFAS-'+id+'.tpatch');
  const data=JSON.parse(await readFile(file,'utf8'));
  if(data.id!==id||data.baseVersion!==BASE||Number(data.minBuild)!==290||Number(data.maxBuild)!==290){
    throw new Error('2.4.8.6: patch '+id+' incompatível com '+BASE+' / build 290.');
  }
  const payload=data.payload||{};
  const payloadText=JSON.stringify({js:String(payload.js||''),css:String(payload.css||'')});
  const actual=await import('node:crypto').then(({createHash})=>createHash('sha256').update(payloadText,'utf8').digest('hex'));
  if(actual!==String(data.payloadSha256||'').toLowerCase()){
    throw new Error('2.4.8.6: SHA interno divergente no patch '+id+'.');
  }
  await patch('mobile-bootstrap.js',source=>{
    let out=source;
    const marker='__TAREFAS_PATCH_CONSOLIDATED_'+id.replaceAll('.','_')+'__';
    if(!out.includes(marker)){
      out+='\n;(()=>{\'use strict\';if(globalThis[\''+marker+'\'])return;globalThis[\''+marker+'\']=true;\n'+String(payload.js||'')+'\n})();\n';
    }
    const css=String(payload.css||'');
    if(css){
      const cssId='tm-tpatch-css-'+id.replaceAll('.','_');
      if(!out.includes(cssId)){
        out+='\n;(()=>{const id='+JSON.stringify(cssId)+';if(document.getElementById(id))return;const s=document.createElement(\'style\');s.id=id;s.textContent='+JSON.stringify(css)+';(document.head||document.documentElement).appendChild(s)})();\n';
      }
    }
    return out;
  });
}

await patch('mobile-bootstrap.js',s=>s.replaceAll('dashboard.html?app=2.4.8','dashboard.html?app='+VERSION));
await patch('mobile-login-v17.js',s=>s.replaceAll('dashboard.html?app=2.4.8','dashboard.html?app='+VERSION));
await patch('index.html',s=>s.replaceAll('dashboard.html?app=2.4.8','dashboard.html?app='+VERSION));

await rm(path.join(dist,'BETA_2_4_8.json'),{force:true});
await rm(path.join(dist,'ALPHA_2_4_8_1.json'),{force:true});
await writeFile(path.join(dist,'ALPHA_2_4_8_6.json'),JSON.stringify({
  version:VERSION,
  build:BUILD,
  channel:'alpha',
  base:BASE,
  basedOn:'2.4.8.5',
  preservedPatches:PATCHES,
  incorporatedPatch:'2.4.6.8',
  webVersion:WEB_VERSION,
  features:{
    all248xPatchesConsolidated:true,
    biometricNativeSinglePrompt:true,
    biometricConcurrentCallsShared:true,
    biometricPatch2485Preserved:true,
    patchManagerPreserved:true,
    patchManagerV1:true,
    only2468:true,
    scalesPatch2467:false,
    web791:true,
    releaseBranchIsolatedFromMain:true
  }
},null,2)+'\n');

const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');
const java=await readFile(path.join(root,'app/android/TarefasBiometricPlugin.java'),'utf8');
const forbidden=[
  'kNextServiceCard','kNextService','tm-next-service-kpi','v756-next-service',
  'ensureNextCard','loadDashboardService','v756NextServiceCss','data-v756-next-icon',
  'Próximo serviço</small>','Próximo Serviço</small>'
];
for(const name of await readdir(dist)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  const c=await readFile(path.join(dist,name),'utf8');
  for(const token of forbidden)if(c.includes(token)){
    throw new Error('2.4.8.6: origem do Próximo Serviço detectada em '+name+' :: '+token);
  }
}
for(const marker of [
  '__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__',
  '__TAREFAS_ALPHA_2481_DISTRIBUICAO_FISCAL_FIX__',
  '__TAREFAS_ALPHA_2482_GUIDES_READY_FIX__',
  '__TAREFAS_ALPHA_2483_FORNECIMENTO__',
  '__TAREFAS_ALPHA_2484_PEDIDO_LAYOUT_FIX__',
  '__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__'
]){
  if(!boot.includes(marker))throw new Error('2.4.8.6: patch consolidado ausente '+marker);
}
if(boot.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'))throw new Error('2.4.8.6: patch 2.4.6.7 detectado.');
if(!boot.includes("const APP_VERSION = '"+VERSION+"';")||!boot.includes('const APP_BUILD = '+BUILD+';'))throw new Error('2.4.8.6: versão/build do bootstrap incorretos.');
if(!pm.includes("const FORMAT='tarefas-tpatch-v1'")||!pm.includes('crypto.subtle.digest')||!pm.includes('indexedDB.open'))throw new Error('2.4.8.6: Patch Manager incompleto.');

for(const marker of ['authenticateInProgress','pendingAuthenticateCalls','resolvePendingAuthenticateCalls','rejectPendingAuthenticateCalls','if (authenticateInProgress)','synchronized (authenticateLock)']){
  if(!java.includes(marker))throw new Error('2.4.8.6: trava nativa ausente '+marker);
}
if((java.match(/new BiometricPrompt\(/g)||[]).length!==1)throw new Error('2.4.8.6: quantidade inesperada de BiometricPrompt.');
if(!java.includes('resolvePendingAuthenticateCalls(response)'))throw new Error('2.4.8.6: retorno compartilhado ausente.');
if(!java.includes('rejectPendingAuthenticateCalls(errString.toString(), code, null)'))throw new Error('2.4.8.6: rejeição compartilhada ausente.');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' ALPHA — patches 2.4.8.1–2.4.8.5 consolidados e autenticação biométrica nativa serializada.');
