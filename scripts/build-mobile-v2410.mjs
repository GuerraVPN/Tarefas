import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=process.cwd(), dist=path.join(root,'dist');
const VERSION='2.4.10', BUILD=295, PATCH='2.4.9.11';

const patch=async(file,fn)=>{
  const p=path.join(dist,file),before=await readFile(p,'utf8'),after=fn(before);
  if(after!==before)await writeFile(p,after,'utf8');
};

await import('./build-mobile-v2497.mjs');

const patchFile=path.join(root,'patches/TAREFAS-2.4.9.11.tpatch');
const patchObj=JSON.parse(await readFile(patchFile,'utf8'));
if(patchObj.id!==PATCH||patchObj.baseVersion!=='2.4.9.7')throw new Error('2.4.10: patch 2.4.9.11 incompatível com a base esperada.');
const payloadText=JSON.stringify({js:String(patchObj.payload?.js||''),css:String(patchObj.payload?.css||'')});
const actual=createHash('sha256').update(payloadText,'utf8').digest('hex');
if(actual!==String(patchObj.payloadSha256||'').toLowerCase())throw new Error('2.4.10: SHA interno do 2.4.9.11 divergente: '+actual);

await patch('mobile-bootstrap.js',source=>{
  const marker='__TAREFAS_ALPHA_24911_CONSOLIDATED__';
  if(source.includes(marker))return source;
  const css=String(patchObj.payload?.css||'');
  const js=String(patchObj.payload?.js||'');
  const injected="\\n;(()=>{\'use strict\';if(globalThis[\'"+marker+"\'])return;globalThis[\'"+marker+"\']=true;"+
    "const s=document.createElement(\'style\');s.id=\'tarefas-24911-consolidated-style\';s.textContent="+JSON.stringify(css)+";document.head.appendChild(s);"+
    js+"\\n})();\\n";
  return source+injected;
});

await patch('mobile-bootstrap.js',s=>s
  .replaceAll("2.4.9.7","2.4.10")
  .replace("const APP_BUILD = 294;","const APP_BUILD = 295;")
  .replace("channel:'alpha'","channel:'beta'")
  .replace("channel: 'alpha'","channel: 'beta'")
  .replace("APP_CHANNEL='alpha'","APP_CHANNEL='beta'")
  .replace("APP_CHANNEL = 'alpha'","APP_CHANNEL = 'beta'")
  .replace("const APP_CHANNEL = 'alpha'","const APP_CHANNEL = 'beta'")
);
await patch('mobile-patch-manager-v240.js',s=>s
  .replace("const APP_VERSION='2.4.9.7',APP_BUILD=294,APP_CHANNEL='alpha';","const APP_VERSION='2.4.10',APP_BUILD=295,APP_CHANNEL='beta';")
);
await patch('mobile-release-v240.js',s=>s
  .replaceAll("2.4.9.7","2.4.10")
  .replaceAll("channel:'alpha'","channel:'beta'")
  .replaceAll("channel: 'alpha'","channel: 'beta'")
  .replaceAll("APP_CHANNEL='alpha'","APP_CHANNEL='beta'")
  .replaceAll("APP_CHANNEL = 'alpha'","APP_CHANNEL = 'beta'")
  .replaceAll("WEB_VERSION","APP_VERSION")
  .replaceAll(" • WEB "," ")
  .replaceAll("Base Web","TAREFAS App")
  .replaceAll("Base web","TAREFAS App")
  .replaceAll("__TAREFAS_WEB_BASE_VERSION__","__TAREFAS_APP_BASE_VERSION__")
  .replaceAll("tarefasWebVersion","tarefasAppBaseVersion")
);
await patch('mobile-v12.js',s=>s.replace(/([0-9.]+) • WEB [0-9.]+/g,VERSION));
await patch('package.json',s=>s.replace(/Base Web/gi,'TAREFAS App').replace(/WEB_VERSION/gi,'APP_VERSION'));
await patch('v7_5_1_about.js',s=>s.replace(/Base Web/gi,'TAREFAS App').replace(/Web 7\.[0-9.]+/g,'TAREFAS App'));

await rm(path.join(dist,'ALPHA_2_4_9_7.json'),{force:true});
await writeFile(path.join(dist,'BETA_2_4_10.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'beta',base:'2.4.9.7',basedOn:'2.4.9.7',
  webVersion:'7.9.7',incorporatedPatch:PATCH,
  features:{
    preRelease25:true,notesFiscal:true,notesFiscalConsolidated:true,
    notesFiscalCurrentButtonTheme:true,appOnly:true,webDecoupled:true,webVersionVisible:false,
    webDependency:false,biometricSessionHandoff:true,biometricNativeSinglePrompt:true,
    patchManagerPreserved:true,patchManagerV1:true,scalesPreserved:true,
    servicesHotbar2468:true,dashboardNextServiceRemoved:true,
    legacyOrcamentariosPreserved:true,releaseBranchIsolatedFromMain:true
  }
},null,2)+'\n');

const forbidden=[' • WEB ','Base web','Base Web','WEB_VERSION','__TAREFAS_WEB_BASE_VERSION__','tarefasWebVersion'];
for(const name of ['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-release-v240.js','package.json','v7_5_1_about.js']){
  const s=await readFile(path.join(dist,name),'utf8');
  for(const t of forbidden)if(s.includes(t))throw new Error('2.4.10: referência Web proibida em '+name+' :: '+t);
}
const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');
if(!boot.includes("const APP_VERSION = '2.4.10';")||!boot.includes('const APP_BUILD = 295;'))throw new Error('2.4.10: versão/build incorretos');
if(!pm.includes("APP_VERSION='2.4.10'")||!pm.includes('APP_BUILD=295')||!pm.includes("APP_CHANNEL='beta'"))throw new Error('2.4.10: Patch Manager não promovido');
if(!boot.includes('__TAREFAS_ALPHA_24911_CONSOLIDATED__'))throw new Error('2.4.10: Notas Fiscais 2.4.9.11 não consolidadas');
console.log('TAREFAS Android 2.4.10 build 295 BETA — pré-release OK');
