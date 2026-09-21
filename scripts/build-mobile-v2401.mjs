import { copyFile, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const dist=path.join(root,'dist');
const VERSION='2.4.0.1',BUILD=275,BASE_VERSION='2.4.0',WEB_VERSION='7.9.1';

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=fn(before);
  if(required&&after===before)throw new Error('2.4.0.1: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-launcher-icon-v2401.js'),path.join(dist,'mobile-launcher-icon-v2401.js'));

const special=new Set(['reiniciar.html','desligado.html']);
for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);
  let source=await readFile(file,'utf8');
  source=source.replace(/<script src=["']mobile-launcher-icon-v2401\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
  source=source.replaceAll('2.4.0-b274','2.4.0.1-b275');
  if(!special.has(name.toLowerCase())){
    const tag='<script src="mobile-launcher-icon-v2401.js?v='+VERSION+'-b'+BUILD+'"></script>';
    source=source.includes('</body>')?source.replace('</body>',tag+'\n</body>'):source+'\n'+tag;
  }
  await writeFile(file,source,'utf8');
}

await patch('mobile-patch-manager-v240.js',source=>source
  .replace("const APP_VERSION='2.4.0',APP_BUILD=274,APP_CHANNEL='official';","const APP_VERSION='"+VERSION+"',APP_BUILD="+BUILD+",APP_CHANNEL='alpha';")
  .replace("const MARK='__TAREFAS_PATCH_MANAGER_V274__';","const MARK='__TAREFAS_PATCH_MANAGER_V275__';"));

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.4.0';","const APP_VERSION = '"+VERSION+"';")
    .replace('const APP_BUILD = 274;','const APP_BUILD = '+BUILD+';')
    .replaceAll('Oficial 2.4.0','Alpha '+VERSION)
    .replaceAll('2.4.0 Oficial',VERSION+' Alpha')
    .replaceAll('__TAREFAS_RELEASE_240_BOOT__','__TAREFAS_ALPHA_2401_BOOT__')
    .replaceAll('__TAREFAS_PATCH_SYSTEM_V274__','__TAREFAS_PATCH_SYSTEM_V275__')
    .replaceAll("channel:'official'","channel:'alpha'")
    .replaceAll("version:'2.4.0'","version:'"+VERSION+"'")
    .replaceAll('build:274','build:'+BUILD);
  out+="\n;globalThis.__TAREFAS_ALPHA_2401_BOOT__={version:'"+VERSION+"',build:"+BUILD+",channel:'alpha',basedOn:'"+BASE_VERSION+"',webVersion:'"+WEB_VERSION+"',launcherIconSelector:true,profileHomeIcon:true};\n";
  return out;
});

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.4.0',BUILD=274,MARK='__TAREFAS_RELEASE_NAV_V274__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_ALPHA_NAV_V275__';")
  .replaceAll('TAREFAS 2.4.0 Oficial','TAREFAS '+VERSION+' Alpha')
  .replaceAll('TarefasRelease240','TarefasAlpha2401'),{required:false});

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.4.0',BUILD=274","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central 2.4.0','Central Alpha '+VERSION)
  .replaceAll('Ferramentas 2.4.0','Ferramentas Alpha '+VERSION)
  .replaceAll('RELEASE 240','ALPHA 2401'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_RELEASE_TABS_V274__',VERSION='2.4.0',BUILD=274","const MARK='__TAREFAS_ALPHA_TABS_V275__',VERSION='"+VERSION+"',BUILD="+BUILD)
  .replace('<small>Oficial 2.4.0</small>','<small>Alpha '+VERSION+'</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replace("tarefasAppVersion = '2.4.0'","tarefasAppVersion = '"+VERSION+"'")
  .replace("tarefasAppBuild = '274'","tarefasAppBuild = '"+BUILD+"'"));

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.4.0';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 274;','const APP_BUILD = '+BUILD+';')
  .replace("const APP_CHANNEL = 'official';","const APP_CHANNEL = 'alpha';"));

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('OFICIAL 2.4.0','ALPHA '+VERSION)
  .replaceAll("version:'2.4.0'","version:'"+VERSION+"'")
  .replaceAll('build:274','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.4.0'","version:'"+VERSION+"'")
  .replaceAll('build:274','build:'+BUILD)
  .replaceAll('"2.4.0"','"2.4.0.1"')
  .replaceAll("'2.4.0'","'2.4.0.1'"),{required:false});

await patch('mobile-release-v240.js',source=>{
  let out=source
    .replace("const PATCH_VERSION='2.4.0';","const PATCH_VERSION='"+VERSION+"';")
    .replace('const BUILD=274;','const BUILD='+BUILD+';');
  out+="\n;globalThis.__TAREFAS_ALPHA_2401__=Object.freeze({version:'"+VERSION+"',build:"+BUILD+",channel:'alpha',base:'"+BASE_VERSION+"',webVersion:'"+WEB_VERSION+"',launcherIconSelector:true,profileHomeIcon:true});\n";
  out+=";globalThis.__TAREFAS_EFFECTIVE_VERSION__='"+VERSION+"';\n";
  return out;
});

await rm(path.join(dist,'RELEASE_2_4_0.json'),{force:true});
await writeFile(path.join(dist,'ALPHA_2_4_0_1.json'),JSON.stringify({
  version:VERSION,
  build:BUILD,
  channel:'alpha',
  base:BASE_VERSION,
  webVersion:WEB_VERSION,
  generatedAt:new Date().toISOString(),
  features:{
    launcherIconSelector:true,
    launcherPresetBlue:true,
    launcherPresetMilitary:true,
    launcherPresetGold:true,
    launcherSystemIcon:true,
    profileHomeShortcut:true,
    profileAvatarAsHomeIcon:true,
    androidLauncherAliases:true,
    web791:true,
    patchManager:true,
    biometricColdStartOnly:true,
    diagnosticTabs:true
  }
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' ALPHA: seletor de ícones + ícone do perfil na tela inicial.');
