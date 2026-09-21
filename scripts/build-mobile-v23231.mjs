import { copyFile, readFile, readdir, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const VERSION='2.3.23.1',BUILD=270;
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23223.mjs')).href+'?v=23231');
const dist=path.join(root,'dist');

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=fn(before);
  if(required&&after===before)throw new Error('2.3.23.1: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-patch-manager-v23231.js'),path.join(dist,'mobile-patch-manager-v23231.js'));

for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);let source=await readFile(file,'utf8');
  source=source.replaceAll('2.3.23-b269','2.3.23.1-b270');
  if(!source.includes('mobile-patch-manager-v23231.js')){
    const tag='<script src="mobile-patch-manager-v23231.js?v='+VERSION+'-b'+BUILD+'"></script>';
    source=source.includes('</body>')?source.replace('</body>',tag+'\n</body>'):source+'\n'+tag;
  }
  await writeFile(file,source,'utf8');
}

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.3.23';","const APP_VERSION = '"+VERSION+"';")
    .replace('const APP_BUILD = 269;','const APP_BUILD = '+BUILD+';')
    .replaceAll('Beta 2.3.23','Alpha '+VERSION)
    .replaceAll('2.3.23 Beta',VERSION+' Alpha')
    .replaceAll('__TAREFAS_BETA_2323__','__TAREFAS_ALPHA_23231__')
    .replaceAll("channel:'beta'","channel:'alpha'")
    .replaceAll("promotedFrom:'2.3.22.5'","basedOn:'2.3.23'");
  out+="\n;globalThis.__TAREFAS_PATCH_SYSTEM_V270__={version:'"+VERSION+"',build:"+BUILD+",channel:'alpha',format:'tarefas-tpatch-v1',catalog:'app/releases/patches/catalog-v1.json',rollback:true,manualImport:true,sha256:true};\n";
  return out;
});

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.3.23',BUILD=269,MARK='__TAREFAS_BETA_NAV_V269__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_ALPHA_NAV_V270__';")
  .replaceAll('TAREFAS ${VERSION} Beta','TAREFAS ${VERSION} Alpha')
  .replaceAll('TarefasBeta2323','TarefasAlpha23231'));

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.3.23',BUILD=269","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central Beta 2.3.23','Central Alpha '+VERSION)
  .replaceAll('Ferramentas Beta 2.3.23','Ferramentas Alpha '+VERSION)
  .replaceAll('nesta Beta.','nesta Alpha.')
  .replaceAll('BETA 2323','ALPHA 23231'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_BETA_TABS_V269__',VERSION='2.3.23',BUILD=269","const MARK='__TAREFAS_ALPHA_TABS_V270__',VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Falha na Central Beta','Falha na Central Alpha')
  .replace('<small>Beta ${VERSION}</small>','<small>Alpha ${VERSION}</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replace("tarefasAppVersion = '2.3.23'","tarefasAppVersion = '"+VERSION+"'")
  .replace("tarefasAppBuild = '269'","tarefasAppBuild = '"+BUILD+"'"));

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.3.23';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 269;','const APP_BUILD = '+BUILD+';')
  .replace("const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'alpha';"),{required:false});

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('BETA 2.3.23','ALPHA '+VERSION)
  .replaceAll("version:'2.3.23'","version:'"+VERSION+"'")
  .replaceAll('build:269','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.3.23'","version:'"+VERSION+"'")
  .replaceAll('build:269','build:'+BUILD),{required:false});

await appendFile(path.join(dist,'mobile-bootstrap.js'),"\n;globalThis.__TAREFAS_VERSION_LABEL_V270__='"+VERSION+" Alpha';\n",'utf8');
await writeFile(path.join(dist,'ALPHA_2_3_23_1.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'alpha',base:'2.3.23',generatedAt:new Date().toISOString(),
  features:{
    patchManager:true,tpatchV1:true,manualImport:true,officialCatalog:true,sha256Validation:true,
    compatibilityCheck:true,enableDisable:true,rollbackByReload:true,removePatch:true,installedPatchHistory:true
  }
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' ALPHA: Patch Manager .tpatch habilitado sobre a Beta 2.3.23.');
