import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=process.cwd(), dist=path.join(root,'dist');
const VERSION='2.4.12.2', BUILD=299, PATCH='2.4.9.11';

const patch=async(file,fn)=>{
  const p=path.join(dist,file);
  const before=await readFile(p,'utf8');
  const after=fn(before);
  if(after!==before) await writeFile(p,after,'utf8');
};

// Reusa exatamente a cadeia validada da Beta 2.4.9 (build 293).
await import('./build-mobile-v249.mjs');

const patchPath=path.join(root,'patches/TAREFAS-2.4.9.11.tpatch');
const p=JSON.parse(await readFile(patchPath,'utf8'));
if(p.id!==PATCH || p.baseVersion!=='2.4.9.7' || Number(p.minBuild)!==293 || Number(p.maxBuild)!==294){
  throw new Error('2.4.12: patch 2.4.9.11 incompatível com a Beta 2.4.9.');
}
const payloadText=JSON.stringify({js:String(p.payload?.js||''),css:String(p.payload?.css||'')});
const actual=createHash('sha256').update(payloadText,'utf8').digest('hex');
if(actual!==String(p.payloadSha256||'').toLowerCase()){
  throw new Error('2.4.12: SHA interno do 2.4.9.11 divergente: '+actual);
}

// Injeta somente o patch 2.4.9.11 no bundle da 2.4.9.
await patch('mobile-bootstrap.js',source=>{
  const marker='__TAREFAS_ALPHA_24911_CONSOLIDATED__';
  if(source.includes(marker)) return source;
  return source+"\n;(()=>{'use strict';if(globalThis['"+marker+"'])return;globalThis['"+marker+"']=true;"+
    "const s=document.createElement('style');s.id='tarefas-24911-consolidated-style';s.textContent="+JSON.stringify(String(p.payload?.css||''))+";document.head.appendChild(s);"+
    String(p.payload?.js||'')+"\n})();\n";
});

// Promove somente os identificadores da versão/build; não injeta nenhuma correção de layout da 2.4.11.
for(const file of ['mobile-bootstrap.js','mobile-login-v17.js','index.html','mobile-patch-manager-v240.js','mobile-release-v240.js','mobile-v12.js','package.json','v7_5_1_about.js']){
  await patch(file,s=>s
    .replaceAll('2.4.9.7',VERSION)
    .replaceAll('2.4.9',VERSION)
    .replaceAll('APP_BUILD=293','APP_BUILD='+BUILD)
    .replaceAll('APP_BUILD = 293','APP_BUILD = '+BUILD)
    .replaceAll('build:293','build:'+BUILD)
    .replaceAll('build: 293','build: '+BUILD)
    .replaceAll("APP_CHANNEL='alpha'","APP_CHANNEL='alpha'")
    .replaceAll("APP_CHANNEL = 'alpha'","APP_CHANNEL = 'alpha'")
    .replaceAll("channel:'alpha'","channel:'alpha'")
    .replaceAll("channel: 'alpha'","channel: 'alpha'")
  );
}

await rm(path.join(dist,'BETA_2_4_9.json'),{force:true});
await rm(path.join(dist,'BETA_2_4_10.json'),{force:true});
await rm(path.join(dist,'BETA_2_4_11.json'),{force:true});
await rm(path.join(dist,'ALPHA_2_4_9_7.json'),{force:true});
await writeFile(path.join(dist,'ALPHA_2_4_12_2.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'alpha',
  base:'2.4.9',basedOn:'2.4.9',
  incorporatedPatch:PATCH,
  features:{
    notesFiscalPatch24911:true,
    patchManagerPreserved:true,patchManagerV1:true,
    scalesPreserved:true,servicesHotbar2468:true,
    dashboardNextServiceRemoved:true,web797Preserved:true,
    appOnly:true,webDecoupled:true,webVersionVisible:false,
    webDependency:false,releaseBranchIsolatedFromMain:true
  }
},null,2)+'\n');


// 2.4.12.2: o Android não expõe mais a identificação/base da Web.
await patch('mobile-bootstrap.js',source=>source
  .replace("const WEB_VERSION = '7.9.7';", "const WEB_VERSION = '';")
  .replace('<article><small>Base web</small><strong>${WEB_VERSION}</strong></article>\\n        ','')
);



// 2.4.12.2: identidade do Android é soberana na interface e no centro de atualizações.
await patch('mobile-bootstrap.js',s=>{
  s=s.replace(/Beta 2\.4\.8[^<\n]*/g,'Alpha 2.4.12.2 — identificação e atualizações do Android.');
  s=s.replace(/Web 7\.9\.1/gi,'').replace(/WEB 7\.9\.1/gi,'');
  s += "\n;(()=>{if(globalThis.__TAREFAS_ANDROID_ONLY_IDENTITY_GUARD__)return;globalThis.__TAREFAS_ANDROID_ONLY_IDENTITY_GUARD__=true;const V='2.4.12.2';function enforce(){document.querySelectorAll('.tm-app-brand small').forEach(el=>{el.textContent=V});document.querySelectorAll('#tmAppUpdates .tm-update-installed').forEach(el=>{el.textContent='ALPHA '+V});document.querySelectorAll('#tmAppUpdates .tm-update-channel').forEach((el,i)=>{if(i===0)el.textContent='ALPHA'});document.querySelectorAll('#tmAppUpdates .tm-update-history-item small').forEach(el=>{el.textContent=el.textContent.replace(/\\s*•\\s*[^•]*$/,'')});if((location.pathname.split('/').pop()||'').toLowerCase()==='about.html'){document.querySelectorAll('.tm-about-grid article,.meta div').forEach(el=>{if(/base\\s*web/i.test(el.textContent||''))el.remove();if(/vers[aã]o atual/i.test(el.textContent||'')){const b=el.querySelector('b');if(b)b.textContent=V}});document.querySelectorAll('.tm-about-page p,.hero p').forEach(el=>{if(/Beta 2\\.4\\.8/i.test(el.textContent||''))el.textContent='Alpha 2.4.12.2 — identificação e atualizações do Android.'});document.querySelectorAll('.tm-about-page *,.hero *').forEach(el=>{if(el.children.length===0&&/base\\s*web\\s*:?|web\\s*[0-9]+\\./i.test(el.textContent||''))el.remove()})}}enforce();[150,500,1200,2500].forEach(ms=>setTimeout(enforce,ms));})();\n";
  return s;
});
for(const file of ['mobile-bootstrap.js','mobile-v12.js','mobile-updates-v181.js','mobile-patch-manager-v240.js','mobile-release-v240.js']){
  await patch(file,s=>{
    return s
      .replace(/const WEB_VERSION\s*=\s*'[^']*';/g,"const WEB_VERSION='';")
      .replace(/const text='[^']*•\s*WEB[^']*';/g,"const text='"+VERSION+"';")
      .replace("const APP_VERSION = '2.4.9';","const APP_VERSION = '"+VERSION+"';")
      .replace('const APP_BUILD = 293;','const APP_BUILD = '+BUILD+';')
      .replace("const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'alpha';")
      .replace(/const wanted=effectiveVersion\s*\+\s*' • WEB '\s*\+\s*web;/g,'const wanted=effectiveVersion;')
      .replace(/const wanted=effectiveVersion\(\)\s*\+\s*' • WEB '\s*\+\s*web;/g,"const wanted=effectiveVersion();")
      .replace(/const wanted=PATCH_VERSION\s*\+\s*' • WEB '\s*\+\s*WEB_VERSION;/g,'const wanted=PATCH_VERSION;')
      .replace(/const wanted=effectiveVersion\s*\+\s*" • WEB "\s*\+\s*web;/g,'const wanted=effectiveVersion;')
      .replace(/const channel=v\.channel==='beta'\?'BETA':'OFICIAL'/g,"const channel=v.channel==='alpha'?'ALPHA':v.channel==='beta'?'BETA':'OFICIAL'")
      .replace(/latestBadge=latest\?\.channel==='beta'\?'BETA':'OFICIAL'/g,"latestBadge=latest?.channel==='alpha'?'ALPHA':latest?.channel==='beta'?'BETA':'OFICIAL'")
      .replaceAll("APP_CHANNEL==='beta'?'BETA':'OFICIAL'","APP_CHANNEL==='alpha'?'ALPHA':APP_CHANNEL==='beta'?'BETA':'OFICIAL'")
      .replace("Build \\${esc(v.build)} • \\${esc(v.web_version||'')}","Build \\${esc(v.build)}")
      .replace(/latest\.channel==='beta'\?'beta':''/g,"latest.channel==='alpha'?'alpha':latest.channel==='beta'?'beta':''");
  });
}
await patch('mobile-bootstrap.js',s=>s
  .replace(/\s*<article>\s*<small>Base web<\/small>\s*<strong>\$\{WEB_VERSION\}<\/strong>\s*<\/article>/gi,'')
  .replace(/<small>\$\{APP_VERSION\}\s*•\s*WEB\s*\$\{WEB_VERSION\}<\/small>/g,'<small>\${APP_VERSION}</small>')
  .replace('<p>Aplicativo móvel do sistema TAREFAS.</p>','<p>Aplicativo Android do sistema TAREFAS.</p>')
);



const uiAuditFiles=['mobile-bootstrap.js','mobile-v12.js','mobile-updates-v181.js','mobile-patch-manager-v240.js','mobile-release-v240.js'];
for(const file of uiAuditFiles){
  const s=await readFile(path.join(dist,file),'utf8');
  if(/WEB\s*[0-9]+\.[0-9]+/i.test(s)) throw new Error('2.4.12.2: referência Web visível em '+file);
}
const updatesUi=await readFile(path.join(dist,'mobile-updates-v181.js'),'utf8');
if(!updatesUi.includes("const APP_VERSION = '2.4.12.2';") || !updatesUi.includes('const APP_BUILD = 299;') || !updatesUi.includes("const APP_CHANNEL = 'alpha';")) throw new Error('2.4.12.2: centro de atualizações não promovido.');
const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');

// A base 2.4.9 navigation sanity check: preserve the original drawer and bottom navigation.
for(const marker of ['tmDrawer','tm-bottom-nav','__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__','__TAREFAS_PATCH_CONSOLIDATED_2487__','__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__','__TAREFAS_ALPHA_24911_CONSOLIDATED__']){
  if(!boot.includes(marker)) throw new Error('2.4.12: marcador/base ausente '+marker);
}
if(boot.includes('__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__')){
  throw new Error('2.4.12: correção de layout da 2.4.11 foi incorporada indevidamente.');
}
if(!boot.includes("const APP_VERSION = '2.4.12.2';") || !boot.includes('const APP_BUILD = 299;')){
  throw new Error('2.4.12: versão/build incorretos.');
}
if(!pm.includes("2.4.12.2") || !pm.includes("299")){
  throw new Error('2.4.12.2: Patch Manager não promovido com versão/build.');
}
console.log('TAREFAS Android 2.4.12.2 build 299 — Android-only identity validated.');

// Alpha 2.4.12.2 build trigger.

// validation fix trigger.

// pm validation trigger.

// updates constants trigger.

// final 2.4.12.2 trigger.

// remove unavailable beta module from audit.

// final trigger after runtime audit fix.

// regex Base web removal fix.

// trigger after Base web regex fix.

// identity guard syntax trigger.

// final trigger after identity guard injection.

// alpha badge and history web removal trigger.

// final identity guard content fix.
