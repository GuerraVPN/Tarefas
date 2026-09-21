import { copyFile, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const VERSION='2.3.24',BUILD=271;
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23231.mjs')).href+'?v=2324');
const dist=path.join(root,'dist');

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=fn(before);
  if(required&&after===before)throw new Error('2.3.24: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-patch-manager-v2324.js'),path.join(dist,'mobile-patch-manager-v2324.js'));
await rm(path.join(dist,'mobile-patch-manager-v23231.js'),{force:true});

for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);let source=await readFile(file,'utf8');
  source=source.replace(/<script src="mobile-patch-manager-v23231\.js[^"]*"><\/script>\s*/g,'');
  source=source.replaceAll('2.3.23.1-b270','2.3.24-b271');
  if(!source.includes('mobile-patch-manager-v2324.js')){
    const tag='<script src="mobile-patch-manager-v2324.js?v='+VERSION+'-b'+BUILD+'"></script>';
    source=source.includes('</body>')?source.replace('</body>',tag+'\n</body>'):source+'\n'+tag;
  }
  await writeFile(file,source,'utf8');
}

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.3.23.1';","const APP_VERSION = '"+VERSION+"';")
    .replace('const APP_BUILD = 270;','const APP_BUILD = '+BUILD+';')
    .replaceAll('Alpha 2.3.23.1','Beta '+VERSION)
    .replaceAll('2.3.23.1 Alpha',VERSION+' Beta')
    .replaceAll('__TAREFAS_ALPHA_23231__','__TAREFAS_BETA_2324__')
    .replaceAll("channel:'alpha'","channel:'beta'")
    .replaceAll("__TAREFAS_PATCH_SYSTEM_V270__","__TAREFAS_PATCH_SYSTEM_V271__")
    .replaceAll("__TAREFAS_VERSION_LABEL_V270__='2.3.23.1 Alpha'","__TAREFAS_VERSION_LABEL_V271__='"+VERSION+" Beta'");
  out+="\n;globalThis.__TAREFAS_BETA_2324__={version:'"+VERSION+"',build:"+BUILD+",channel:'beta',consolidates:['2.3.23.2','2.3.23.3','2.3.23.4','2.3.23.5','2.3.23.6'],patchBase:'2.3.24',cumulativePatches:true,catalogNoCache:true,globalVersion:true};\n";
  return out;
});

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.3.23.1',BUILD=270,MARK='__TAREFAS_ALPHA_NAV_V270__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_BETA_NAV_V271__';")
  .replaceAll('TAREFAS ${VERSION} Alpha','TAREFAS ${VERSION} Beta')
  .replaceAll('TarefasAlpha23231','TarefasBeta2324'));

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.3.23.1',BUILD=270","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central Alpha 2.3.23.1','Central Beta '+VERSION)
  .replaceAll('Ferramentas Alpha 2.3.23.1','Ferramentas Beta '+VERSION)
  .replaceAll('nesta Alpha.','nesta Beta.')
  .replaceAll('ALPHA 23231','BETA 2324'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_ALPHA_TABS_V270__',VERSION='2.3.23.1',BUILD=270","const MARK='__TAREFAS_BETA_TABS_V271__',VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Falha na Central Alpha','Falha na Central Beta')
  .replace('<small>Alpha ${VERSION}</small>','<small>Beta ${VERSION}</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replace("tarefasAppVersion = '2.3.23.1'","tarefasAppVersion = '"+VERSION+"'")
  .replace("tarefasAppBuild = '270'","tarefasAppBuild = '"+BUILD+"'"));

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.3.23.1';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 270;','const APP_BUILD = '+BUILD+';')
  .replace("const APP_CHANNEL = 'alpha';","const APP_CHANNEL = 'beta';"),{required:false});

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('ALPHA 2.3.23.1','BETA '+VERSION)
  .replaceAll("version:'2.3.23.1'","version:'"+VERSION+"'")
  .replaceAll('build:270','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.3.23.1'","version:'"+VERSION+"'")
  .replaceAll('build:270','build:'+BUILD),{required:false});

await writeFile(path.join(dist,'BETA_2_3_24.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'beta',base:'2.3.23.1',generatedAt:new Date().toISOString(),
  consolidates:['2.3.23.2','2.3.23.3','2.3.23.4','2.3.23.5','2.3.23.6'],
  features:{
    patchManager:true,tpatchV1:true,cumulativePatches:true,replaceOlderSameBase:true,
    manualImport:true,officialCatalog:true,githubContentsCatalog:true,sha256Validation:true,
    patchHistory:true,patchChannels:true,patchNotifications:true,notificationRaceGuard:true,
    globalEffectiveVersion:true,themePersistence:true,cacheSafeCatalog:true
  }
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' BETA: patches 2.3.23.2–2.3.23.6 consolidados no APK.');
