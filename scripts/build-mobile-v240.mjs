import { copyFile, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const VERSION='2.4.0',BUILD=274,WEB_VERSION='7.9.1';
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2325.mjs')).href+'?v=240');
const dist=path.join(root,'dist');

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=fn(before);
  if(required&&after===before)throw new Error('2.4.0: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-patch-manager-v240.js'),path.join(dist,'mobile-patch-manager-v240.js'));
await copyFile(path.join(root,'app/mobile-release-v240.js'),path.join(dist,'mobile-release-v240.js'));
await rm(path.join(dist,'mobile-patch-manager-v2325.js'),{force:true});
await rm(path.join(dist,'mobile-beta-v2325.js'),{force:true});

for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);
  let source=await readFile(file,'utf8');
  source=source.replace(/<script src="mobile-patch-manager-v2325\.js[^"]*"><\/script>\s*/g,'');
  source=source.replace(/<script src="mobile-beta-v2325\.js[^"]*"><\/script>\s*/g,'');
  source=source.replace(/<script src="mobile-patch-manager-v240\.js[^"]*"><\/script>\s*/g,'');
  source=source.replace(/<script src="mobile-release-v240\.js[^"]*"><\/script>\s*/g,'');
  source=source.replaceAll('2.3.25-b272','2.4.0-b274');
  const tags='<script src="mobile-patch-manager-v240.js?v='+VERSION+'-b'+BUILD+'"></script>\n<script src="mobile-release-v240.js?v='+VERSION+'-b'+BUILD+'"></script>';
  source=source.includes('</body>')?source.replace('</body>',tags+'\n</body>'):source+'\n'+tags;
  await writeFile(file,source,'utf8');
}

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.3.25';","const APP_VERSION = '"+VERSION+"';")
    .replace('const APP_BUILD = 272;','const APP_BUILD = '+BUILD+';')
    .replaceAll('Beta 2.3.25','Oficial '+VERSION)
    .replaceAll('2.3.25 Beta',VERSION+' Oficial')
    .replaceAll('__TAREFAS_BETA_2325__','__TAREFAS_RELEASE_240__')
    .replaceAll('__TAREFAS_PATCH_SYSTEM_V272__','__TAREFAS_PATCH_SYSTEM_V274__')
    .replaceAll("__TAREFAS_VERSION_LABEL_V272__='2.3.25 Beta'","__TAREFAS_VERSION_LABEL_V274__='"+VERSION+" Oficial'")
    .replaceAll("version:'2.3.25'","version:'"+VERSION+"'")
    .replaceAll('build:272','build:'+BUILD)
    .replaceAll("channel:'beta'","channel:'official'");
  out+="\n;globalThis.__TAREFAS_RELEASE_240_BOOT__={version:'"+VERSION+"',build:"+BUILD+",channel:'official',webVersion:'"+WEB_VERSION+"',consolidatesThrough:'2.3.25.3'};\n";
  return out;
});

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.3.25',BUILD=272,MARK='__TAREFAS_BETA_NAV_V272__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_RELEASE_NAV_V274__';")
  .replaceAll('TAREFAS 2.3.25 Beta','TAREFAS '+VERSION+' Oficial')
  .replaceAll('TarefasBeta2325','TarefasRelease240'),{required:false});

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.3.25',BUILD=272","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central Beta 2.3.25','Central '+VERSION)
  .replaceAll('Ferramentas Beta 2.3.25','Ferramentas '+VERSION)
  .replaceAll('BETA 2325','RELEASE 240'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_BETA_TABS_V272__',VERSION='2.3.25',BUILD=272","const MARK='__TAREFAS_RELEASE_TABS_V274__',VERSION='"+VERSION+"',BUILD="+BUILD)
  .replace('<small>Beta 2.3.25</small>','<small>Oficial '+VERSION+'</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replace("tarefasAppVersion = '2.3.25'","tarefasAppVersion = '"+VERSION+"'")
  .replace("tarefasAppBuild = '272'","tarefasAppBuild = '"+BUILD+"'"));

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.3.25';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 272;','const APP_BUILD = '+BUILD+';')
  .replace("const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'official';"),{required:false});

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('BETA 2.3.25','OFICIAL '+VERSION)
  .replaceAll("version:'2.3.25'","version:'"+VERSION+"'")
  .replaceAll('build:272','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.3.25'","version:'"+VERSION+"'")
  .replaceAll('build:272','build:'+BUILD),{required:false});

await rm(path.join(dist,'BETA_2_3_25.json'),{force:true});
await writeFile(path.join(dist,'RELEASE_2_4_0.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'official',webVersion:WEB_VERSION,generatedAt:new Date().toISOString(),
  previousOfficial:'2.2.0',
  developmentLine:'2.3.x',
  consolidates:[
    '2.3.24.1','2.3.24.2','2.3.24.3','2.3.24.4','2.3.24.5','2.3.24.6','2.3.24.7','2.3.24.8','2.3.24.9',
    '2.3.25.1','2.3.25.2','2.3.25.3'
  ],
  features:{
    web791:true,sitePanel791:true,central2:true,
    patchManager:true,tpatchV1:true,cumulativePatches:true,replaceOlderSameBase:true,
    manualImport:true,officialCatalog:true,sha256Validation:true,patchHistory:true,
    alphaAutoPatchCheck:true,globalEffectiveVersion:true,cacheSafeCatalog:true,
    biometricColdStartOnly:true,biometricBackgroundReturnNoPrompt:true,
    nestedFavorites:true,savedFilterState:true,diagnosticTabs:true,
    advancedTaskFilters:true,aiOptimized:true,offlineQueueRecovery:true,
    autoVersionSync:true,configDomGuard:true,pageLifecycleToken:true,
    versionMuteGuard:true,cssLeakRepair:true
  }
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' OFICIAL: Web '+WEB_VERSION+' + linha 2.3.x consolidada.');
