import { copyFile, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const VERSION='2.3.25',BUILD=272;
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2324.mjs')).href+'?v=2325');
const dist=path.join(root,'dist');

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=fn(before);
  if(required&&after===before)throw new Error('2.3.25: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-patch-manager-v2325.js'),path.join(dist,'mobile-patch-manager-v2325.js'));
await copyFile(path.join(root,'app/mobile-beta-v2325.js'),path.join(dist,'mobile-beta-v2325.js'));
await rm(path.join(dist,'mobile-patch-manager-v2324.js'),{force:true});

for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);
  let source=await readFile(file,'utf8');
  source=source.replace(/<script src="mobile-patch-manager-v2324\.js[^"]*"><\/script>\s*/g,'');
  source=source.replace(/<script src="mobile-patch-manager-v2325\.js[^"]*"><\/script>\s*/g,'');
  source=source.replace(/<script src="mobile-beta-v2325\.js[^"]*"><\/script>\s*/g,'');
  source=source.replaceAll('2.3.24-b271','2.3.25-b272');
  const tags='<script src="mobile-patch-manager-v2325.js?v='+VERSION+'-b'+BUILD+'"></script>\n<script src="mobile-beta-v2325.js?v='+VERSION+'-b'+BUILD+'"></script>';
  source=source.includes('</body>')?source.replace('</body>',tags+'\n</body>'):source+'\n'+tags;
  await writeFile(file,source,'utf8');
}

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.3.24';","const APP_VERSION = '"+VERSION+"';")
    .replace('const APP_BUILD = 271;','const APP_BUILD = '+BUILD+';')
    .replaceAll('Beta 2.3.24','Beta '+VERSION)
    .replaceAll('2.3.24 Beta',VERSION+' Beta')
    .replaceAll('__TAREFAS_BETA_2324__','__TAREFAS_BETA_2325__')
    .replaceAll('__TAREFAS_PATCH_SYSTEM_V271__','__TAREFAS_PATCH_SYSTEM_V272__')
    .replaceAll("__TAREFAS_VERSION_LABEL_V271__='2.3.24 Beta'","__TAREFAS_VERSION_LABEL_V272__='"+VERSION+" Beta'");
  out+="\n;globalThis.__TAREFAS_BETA_2325__={version:'"+VERSION+"',build:"+BUILD+",channel:'beta',consolidates:['2.3.24.1','2.3.24.2','2.3.24.3','2.3.24.4','2.3.24.5','2.3.24.6','2.3.24.7','2.3.24.8','2.3.24.9'],patchBase:'2.3.25',cumulativePatches:true,alphaAutoPatchCheck:true,coldStartBiometric:true};\n";
  return out;
});

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.3.24',BUILD=271,MARK='__TAREFAS_BETA_NAV_V271__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_BETA_NAV_V272__';")
  .replaceAll('TAREFAS 2.3.24 Beta','TAREFAS '+VERSION+' Beta')
  .replaceAll('TarefasBeta2324','TarefasBeta2325'),{required:false});

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.3.24',BUILD=271","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central Beta 2.3.24','Central Beta '+VERSION)
  .replaceAll('Ferramentas Beta 2.3.24','Ferramentas Beta '+VERSION)
  .replaceAll('BETA 2324','BETA 2325'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_BETA_TABS_V271__',VERSION='2.3.24',BUILD=271","const MARK='__TAREFAS_BETA_TABS_V272__',VERSION='"+VERSION+"',BUILD="+BUILD)
  .replace('<small>Beta 2.3.24</small>','<small>Beta '+VERSION+'</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replace("tarefasAppVersion = '2.3.24'","tarefasAppVersion = '"+VERSION+"'")
  .replace("tarefasAppBuild = '271'","tarefasAppBuild = '"+BUILD+"'"));

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.3.24';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 271;','const APP_BUILD = '+BUILD+';')
  .replace("const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'beta';"),{required:false});

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('BETA 2.3.24','BETA '+VERSION)
  .replaceAll("version:'2.3.24'","version:'"+VERSION+"'")
  .replaceAll('build:271','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.3.24'","version:'"+VERSION+"'")
  .replaceAll('build:271','build:'+BUILD),{required:false});

await rm(path.join(dist,'BETA_2_3_24.json'),{force:true});
await writeFile(path.join(dist,'BETA_2_3_25.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'beta',base:'2.3.24',webVersion:'7.8.2',generatedAt:new Date().toISOString(),
  consolidates:['2.3.24.1','2.3.24.2','2.3.24.3','2.3.24.4','2.3.24.5','2.3.24.6','2.3.24.7','2.3.24.8','2.3.24.9'],
  features:{
    patchManager:true,tpatchV1:true,cumulativePatches:true,replaceOlderSameBase:true,
    manualImport:true,officialCatalog:true,githubContentsCatalog:true,sha256Validation:true,
    patchHistory:true,patchChannels:true,patchNotifications:true,notificationRaceGuard:true,
    alphaAutoPatchCheck:true,alphaAutoPatchCheckOnlyWhenEnabled:true,
    globalEffectiveVersion:true,themePersistence:true,cacheSafeCatalog:true,
    biometricColdStartOnly:true,biometricBackgroundReturnNoPrompt:true,
    nestedFavorites:true,savedFilterState:true,advancedTaskFilters:true,
    aiOptimized:true,offlineQueueRecovery:true,autoVersionSync:true,
    configDomGuard:true,pageLifecycleToken:true,versionMuteGuard:true
  }
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' BETA: patches 2.3.24.1–2.3.24.9 consolidados no APK.');
