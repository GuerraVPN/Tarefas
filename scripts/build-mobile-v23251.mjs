import { copyFile, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const VERSION='2.3.25.1',BUILD=273,WEB_VERSION='7.9.1';
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2325.mjs')).href+'?v=23251');
const dist=path.join(root,'dist');

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=fn(before);
  if(required&&after===before)throw new Error('2.3.25.1: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-patch-manager-v23251.js'),path.join(dist,'mobile-patch-manager-v23251.js'));
await copyFile(path.join(root,'app/mobile-alpha-v23251.js'),path.join(dist,'mobile-alpha-v23251.js'));
await rm(path.join(dist,'mobile-patch-manager-v2325.js'),{force:true});
await rm(path.join(dist,'mobile-beta-v2325.js'),{force:true});

for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);let source=await readFile(file,'utf8');
  source=source.replace(/<script src="mobile-patch-manager-v2325\.js[^"]*"><\/script>\s*/g,'');
  source=source.replace(/<script src="mobile-beta-v2325\.js[^"]*"><\/script>\s*/g,'');
  source=source.replace(/<script src="mobile-patch-manager-v23251\.js[^"]*"><\/script>\s*/g,'');
  source=source.replace(/<script src="mobile-alpha-v23251\.js[^"]*"><\/script>\s*/g,'');
  source=source.replaceAll('2.3.25-b272','2.3.25.1-b273');
  const tags='<script src="mobile-patch-manager-v23251.js?v='+VERSION+'-b'+BUILD+'"></script>\n<script src="mobile-alpha-v23251.js?v='+VERSION+'-b'+BUILD+'"></script>';
  source=source.includes('</body>')?source.replace('</body>',tags+'\n</body>'):source+'\n'+tags;
  await writeFile(file,source,'utf8');
}

await patch('mobile-bootstrap.js',source=>source
  .replace("const APP_VERSION = '2.3.25';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 272;','const APP_BUILD = '+BUILD+';')
  .replaceAll('Beta 2.3.25','Alpha '+VERSION)
  .replaceAll('2.3.25 Beta',VERSION+' Alpha')
  .replaceAll('__TAREFAS_BETA_2325__','__TAREFAS_ALPHA_23251__')
  .replaceAll("__TAREFAS_PATCH_SYSTEM_V272__","__TAREFAS_PATCH_SYSTEM_V273__")
  .replaceAll("__TAREFAS_VERSION_LABEL_V272__='2.3.25 Beta'","__TAREFAS_VERSION_LABEL_V273__='"+VERSION+" Alpha'")
  .replaceAll("version:'2.3.25'","version:'"+VERSION+"'")
  .replaceAll('build:272','build:'+BUILD)
  .replaceAll("channel:'beta'","channel:'alpha'")
  + "\n;globalThis.__TAREFAS_ALPHA_23251__={version:'"+VERSION+"',build:"+BUILD+",channel:'alpha',basedOn:'2.3.25',webVersion:'"+WEB_VERSION+"',webBase:true};\n");

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.3.25',BUILD=272,MARK='__TAREFAS_BETA_NAV_V272__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_ALPHA_NAV_V273__';")
  .replaceAll('TAREFAS 2.3.25 Beta','TAREFAS '+VERSION+' Alpha')
  .replaceAll('TarefasBeta2325','TarefasAlpha23251'),{required:false});

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.3.25',BUILD=272","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central Beta 2.3.25','Central Alpha '+VERSION)
  .replaceAll('Ferramentas Beta 2.3.25','Ferramentas Alpha '+VERSION)
  .replaceAll('BETA 2325','ALPHA 23251'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_BETA_TABS_V272__',VERSION='2.3.25',BUILD=272","const MARK='__TAREFAS_ALPHA_TABS_V273__',VERSION='"+VERSION+"',BUILD="+BUILD)
  .replace('<small>Beta 2.3.25</small>','<small>Alpha '+VERSION+'</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replace("tarefasAppVersion = '2.3.25'","tarefasAppVersion = '"+VERSION+"'")
  .replace("tarefasAppBuild = '272'","tarefasAppBuild = '"+BUILD+"'"));

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.3.25';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 272;','const APP_BUILD = '+BUILD+';')
  .replace("const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'alpha';"),{required:false});

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('BETA 2.3.25','ALPHA '+VERSION)
  .replaceAll("version:'2.3.25'","version:'"+VERSION+"'")
  .replaceAll('build:272','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.3.25'","version:'"+VERSION+"'")
  .replaceAll('build:272','build:'+BUILD),{required:false});

await rm(path.join(dist,'BETA_2_3_25.json'),{force:true});
await writeFile(path.join(dist,'ALPHA_2_3_25_1.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'alpha',base:'2.3.25',webVersion:WEB_VERSION,generatedAt:new Date().toISOString(),
  features:{
    basedOnBeta2325:true,web791:true,sitePanel791:true,central2Web:true,
    patchManager:true,tpatchV1:true,cumulativePatches:true,alphaAutoPatchCheck:true,
    biometricColdStartOnly:true,nestedFavorites:true,savedFilterState:true,
    aiOptimized:true,offlineQueueRecovery:true,autoVersionSync:true
  }
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' ALPHA: Beta 2.3.25 sobre Web '+WEB_VERSION+'.');
