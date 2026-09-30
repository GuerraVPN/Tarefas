import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=process.cwd(), dist=path.join(root,'dist');
const VERSION='2.4.11', BUILD=296, PATCH='2.4.9.11';

const patch=async(file,fn)=>{
  const p=path.join(dist,file),before=await readFile(p,'utf8'),after=fn(before);
  if(after!==before)await writeFile(p,after,'utf8');
};

await import('./build-mobile-v2497.mjs');

const patchFile=path.join(root,'patches/TAREFAS-2.4.9.11.tpatch');
const patchObj=JSON.parse(await readFile(patchFile,'utf8'));
if(patchObj.id!==PATCH||patchObj.baseVersion!=='2.4.9.7')throw new Error('2.4.11: patch 2.4.9.11 incompatível com a base esperada.');
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
  .replaceAll("2.4.9.7","2.4.11")
  .replace("const APP_BUILD = 294;","const APP_BUILD = 296;")
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
await rm(path.join(dist,'BETA_2_4_10.json'),{force:true});
await writeFile(path.join(dist,'BETA_2_4_11.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'beta',base:'2.4.10',basedOn:'2.4.10',
  webVersion:'7.9.7',incorporatedPatch:PATCH,
  features:{
    preRelease25:true,notesFiscal:true,notesFiscalConsolidated:true,
    notesFiscalCurrentButtonTheme:true,bottomTabsRestored:true,appOnly:true,webDecoupled:true,webVersionVisible:false,
    webDependency:false,biometricSessionHandoff:true,biometricNativeSinglePrompt:true,
    patchManagerPreserved:true,patchManagerV1:true,scalesPreserved:true,
    servicesHotbar2468:true,dashboardNextServiceRemoved:true,
    legacyOrcamentariosPreserved:true,releaseBranchIsolatedFromMain:true
  }
},null,2)+'\n');

const navFixMarker='__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__';
await patch('mobile-bootstrap.js',s=>s.includes(navFixMarker)?s:s+`\n;(()=>{\n'use strict';\nconst MARK='__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__';\nif(globalThis[MARK])return;globalThis[MARK]=true;\nconst css=document.createElement('style');\ncss.id='tarefas-2411-bottom-tabs-style';\ncss.textContent=\\`\nhtml.tarefas-mobile-shell body{padding-bottom:calc(78px + env(safe-area-inset-bottom,0px))!important;}\nhtml.tarefas-mobile-shell .tm-bottom-nav{display:flex!important;position:fixed!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:auto!important;min-height:68px!important;z-index:2147483000!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;align-items:stretch!important;justify-content:space-around!important;box-sizing:border-box!important;padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px))!important;background:rgba(5,10,9,.97)!important;border-top:1px solid rgba(72,220,86,.18)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;}\nhtml.tarefas-mobile-shell .tm-bottom-nav button{display:flex!important;visibility:visible!important;opacity:1!important;flex:1 1 20%!important;min-width:0!important;height:56px!important;margin:0!important;padding:5px 2px!important;border:0!important;background:transparent!important;color:var(--tm-muted,#7d8792)!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;gap:3px!important;font:inherit!important;font-size:10px!important;font-weight:700!important;line-height:1.1!important;}\nhtml.tarefas-mobile-shell .tm-bottom-nav button.active{color:#35e83f!important;}\nhtml.tarefas-mobile-shell .tm-bottom-nav button svg{display:block!important;width:23px!important;height:23px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;}\nhtml.tarefas-mobile-shell .tm-bottom-nav button span{display:block!important;white-space:nowrap!important;}\\`;\ndocument.head.appendChild(css);\nfunction ensure(){\n if(document.documentElement.classList.contains('mobile-login'))return;\n const nav=document.querySelector('.tm-bottom-nav');\n if(!nav)return;\n nav.style.setProperty('display','flex','important');\n nav.style.setProperty('position','fixed','important');\n nav.style.setProperty('bottom','0','important');\n nav.style.setProperty('z-index','2147483000','important');\n nav.querySelectorAll('button').forEach(b=>{b.style.setProperty('display','flex','important');b.style.setProperty('visibility','visible','important');});\n}\nif(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();\nsetTimeout(ensure,100);setTimeout(ensure,700);\nnew MutationObserver(ensure).observe(document.documentElement,{childList:true,subtree:true});\n})();\n`);

const forbidden=[' • WEB ','Base web','Base Web','WEB_VERSION','__TAREFAS_WEB_BASE_VERSION__','tarefasWebVersion'];
for(const name of ['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-release-v240.js','package.json','v7_5_1_about.js']){
  const s=await readFile(path.join(dist,name),'utf8');
  for(const t of forbidden)if(s.includes(t))throw new Error('2.4.10: referência Web proibida em '+name+' :: '+t);
}
const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');
if(!boot.includes("const APP_VERSION = '2.4.11';")||!boot.includes('const APP_BUILD = 296;'))throw new Error('2.4.11: versão/build incorretos');
if(!pm.includes("APP_VERSION='2.4.11'")||!pm.includes('APP_BUILD=296')||!pm.includes("APP_CHANNEL='beta'"))throw new Error('2.4.11: Patch Manager não promovido');
if(!boot.includes('__TAREFAS_ALPHA_24911_CONSOLIDATED__'))throw new Error('2.4.11: Notas Fiscais 2.4.9.11 não consolidadas');
if(!boot.includes('__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__')||!boot.includes('.tm-bottom-nav'))throw new Error('2.4.11: correção das abas inferiores ausente');
console.log('TAREFAS Android 2.4.11 build 296 BETA — abas inferiores restauradas OK');
