import { copyFile, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const dist=path.join(root,'dist');
const VERSION='2.4.1',BUILD=276,WEB_VERSION='7.9.1';

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=fn(before);
  if(required&&after===before)throw new Error('2.4.1: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-launcher-icon-v241.js'),path.join(dist,'mobile-launcher-icon-v241.js'));

const special=new Set(['reiniciar.html','desligado.html']);
for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);
  let source=await readFile(file,'utf8');
  source=source.replace(/<script src=["']mobile-launcher-icon-v241\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
  source=source.replaceAll('2.4.0-b274','2.4.1-b276');
  if(!special.has(name.toLowerCase())){
    const tag='<script src="mobile-launcher-icon-v241.js?v='+VERSION+'-b'+BUILD+'"></script>';
    source=source.includes('</body>')?source.replace('</body>',tag+'\n</body>'):source+'\n'+tag;
  }
  await writeFile(file,source,'utf8');
}

await patch('mobile-patch-manager-v240.js',source=>source
  .replace("const APP_VERSION='2.4.0',APP_BUILD=274,APP_CHANNEL='official';","const APP_VERSION='"+VERSION+"',APP_BUILD="+BUILD+",APP_CHANNEL='beta';")
  .replace("const MARK='__TAREFAS_PATCH_MANAGER_V274__';","const MARK='__TAREFAS_PATCH_MANAGER_V276__';")
  .replace("source:'beta-2.3.24'","source:'beta-2.4.1'"),{required:false});

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.4.0';","const APP_VERSION = '"+VERSION+"';")
    .replace('const APP_BUILD = 274;','const APP_BUILD = '+BUILD+';')
    .replaceAll('Oficial 2.4.0','Beta '+VERSION)
    .replaceAll('2.4.0 Oficial',VERSION+' Beta')
    .replaceAll('__TAREFAS_RELEASE_240_BOOT__','__TAREFAS_BETA_241_BOOT__')
    .replaceAll('__TAREFAS_PATCH_SYSTEM_V274__','__TAREFAS_PATCH_SYSTEM_V276__')
    .replaceAll("channel:'official'","channel:'beta'")
    .replaceAll("version:'2.4.0'","version:'"+VERSION+"'")
    .replaceAll('build:274','build:'+BUILD);
  out+="\n;globalThis.__TAREFAS_BETA_241_BOOT__={version:'"+VERSION+"',build:"+BUILD+",channel:'beta',basedOn:'2.4.0',webVersion:'"+WEB_VERSION+"',launcherIconBridge:true,patchChannelsFollowApkPreferences:true};\n";
  return out;
});

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.4.0',BUILD=274,MARK='__TAREFAS_RELEASE_NAV_V274__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_BETA_NAV_V276__';")
  .replaceAll('TAREFAS 2.4.0 Oficial','TAREFAS '+VERSION+' Beta')
  .replaceAll('TarefasRelease240','TarefasBeta241'),{required:false});

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.4.0',BUILD=274","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central 2.4.0','Central Beta '+VERSION)
  .replaceAll('Ferramentas 2.4.0','Ferramentas Beta '+VERSION)
  .replaceAll('RELEASE 240','BETA 241'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_RELEASE_TABS_V274__',VERSION='2.4.0',BUILD=274","const MARK='__TAREFAS_BETA_TABS_V276__',VERSION='"+VERSION+"',BUILD="+BUILD)
  .replace('<small>Oficial 2.4.0</small>','<small>Beta '+VERSION+'</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replace("tarefasAppVersion = '2.4.0'","tarefasAppVersion = '"+VERSION+"'")
  .replace("tarefasAppBuild = '274'","tarefasAppBuild = '"+BUILD+"'"));

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.4.0';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 274;','const APP_BUILD = '+BUILD+';')
  .replace("const APP_CHANNEL = 'official';","const APP_CHANNEL = 'beta';"));

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('OFICIAL 2.4.0','BETA '+VERSION)
  .replaceAll("version:'2.4.0'","version:'"+VERSION+"'")
  .replaceAll('build:274','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.4.0'","version:'"+VERSION+"'")
  .replaceAll('build:274','build:'+BUILD)
  .replaceAll('"2.4.0"','"2.4.1"')
  .replaceAll("'2.4.0'","'2.4.1'"),{required:false});

await patch('mobile-release-v240.js',source=>{
  let out=source
    .replaceAll("const PATCH_VERSION='2.4.0';","const PATCH_VERSION='"+VERSION+"';")
    .replaceAll("const BASE_VERSION='2.4.0';","const BASE_VERSION='"+VERSION+"';")
    .replaceAll('const BUILD=274;','const BUILD='+BUILD+';')
    .replaceAll('const BASE_BUILD=274;','const BASE_BUILD='+BUILD+';')
    .replaceAll("version:'2.4.0',build:274,channel:'official'","version:'"+VERSION+"',build:"+BUILD+",channel:'beta'");
  out+="\n;globalThis.__TAREFAS_BETA_241__=Object.freeze({version:'"+VERSION+"',build:"+BUILD+",channel:'beta',webVersion:'"+WEB_VERSION+"',launcherIconBridge:true,profileHomeIcon:true,patchChannelsFollowApkPreferences:true});\n";
  out+=";globalThis.__TAREFAS_EFFECTIVE_VERSION__='"+VERSION+"';\n";
  return out;
});

await rm(path.join(dist,'RELEASE_2_4_0.json'),{force:true});
await writeFile(path.join(dist,'BETA_2_4_1.json'),JSON.stringify({
  version:VERSION,
  build:BUILD,
  channel:'beta',
  base:'2.4.0',
  webVersion:WEB_VERSION,
  generatedAt:new Date().toISOString(),
  futureDelivery:{
    beta:'tpatch',
    alpha:'tpatch',
    betaNotifications:'same-apk-beta-preference',
    alphaNotifications:'same-apk-alpha-preference'
  },
  features:{
    launcherIconSelector:true,
    launcherNativeBridge:true,
    profileAvatarAsHomeIcon:true,
    launcherPresetBlue:true,
    launcherPresetMilitary:true,
    launcherPresetGold:true,
    launcherPresetSystem:true,
    defaultLauncherIconFixed:true,
    patchManager:true,
    patchBetaChannelUsesApkPreference:true,
    patchAlphaChannelUsesApkPreference:true,
    web791:true,
    biometricColdStartOnly:true,
    diagnosticTabs:true
  }
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' BETA: seletor nativo de ícones; próximas Betas/Alphas via .tpatch no mesmo canal de notificações.');
