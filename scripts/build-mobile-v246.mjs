import { copyFile, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dist=path.join(root,'dist');
const VERSION='2.4.6',BUILD=281,WEB_VERSION='7.9.1';

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel);
  const before=await readFile(file,'utf8');
  const after=fn(before);
  if(required&&after===before)throw new Error('2.4.6: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-launcher-icon-v241.js'),path.join(dist,'mobile-launcher-icon-v241.js'));

const special=new Set(['reiniciar.html','desligado.html']);
for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);
  let source=await readFile(file,'utf8');
  source=source.replace(/<script src=["']mobile-launcher-icon-v242\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
  source=source.replace(/<script src=["']mobile-launcher-icon-v241\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
  source=source.replaceAll('2.4.6-b281','2.4.6-b281');
  source=source.replaceAll('2.4.6-b281','2.4.6-b281');
  source=source.replaceAll('2.4.6-b281','2.4.6-b281');
  if(!special.has(name.toLowerCase())){
    const tag='<script src="mobile-launcher-icon-v241.js?v='+VERSION+'-b'+BUILD+'"></script>';
    source=source.includes('</body>')?source.replace('</body>',tag+'\n</body>'):source+'\n'+tag;
  }
  await writeFile(file,source,'utf8');
}

await patch('mobile-patch-manager-v240.js',source=>source
  .replace("const APP_VERSION='2.4.5',APP_BUILD=280,APP_CHANNEL='beta';","const APP_VERSION='"+VERSION+"',APP_BUILD="+BUILD+",APP_CHANNEL='beta';")
  .replace("__TAREFAS_PATCH_MANAGER_V280__","__TAREFAS_PATCH_MANAGER_V281__")
  .replaceAll("source:'beta-2.4.5'","source:'beta-2.4.6'"),{required:true});

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.4.5';","const APP_VERSION = '"+VERSION+"';")
    .replace('const APP_BUILD = 280;','const APP_BUILD = '+BUILD+';')
    .replaceAll('Beta 2.4.5','Beta '+VERSION)
    .replaceAll('2.4.5 Beta',VERSION+' Beta')
    .replaceAll('__TAREFAS_BETA_245_BOOT__','__TAREFAS_BETA_246_BOOT__')
    .replaceAll('__TAREFAS_PATCH_SYSTEM_V280__','__TAREFAS_PATCH_SYSTEM_V281__')
    .replaceAll("version:'2.4.5'","version:'"+VERSION+"'")
    .replaceAll('build:280','build:'+BUILD);
  if(!out.includes("['Escalas','#escalas','Motorista, patrulheiro e permanência']"))throw new Error('2.4.6: menu Escalas ausente');
  if(out.includes("['Pessoal / Escalas','pessoal.html'")||out.includes("['Missões','missao.html'"))throw new Error('2.4.6: menu antigo presente');
  out=out.replaceAll('tmScales245','tmScales246').replaceAll('tm245-scales-list','tm246-scales-list').replace("basedOn:'2.4.3'","basedOn:'2.4.5'");
  out=out.replace("__TAREFAS_BETA_246_BOOT__={version:'"+VERSION+"',build:"+BUILD+",channel:'beta',basedOn:'2.4.5'", "__TAREFAS_BETA_246_BOOT__={version:'"+VERSION+"',build:"+BUILD+",channel:'beta',basedOn:'2.4.5'");
  return out;
},{required:true});

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.4.5',BUILD=280,MARK='__TAREFAS_BETA_NAV_V280__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_BETA_NAV_V281__';")
  .replaceAll('TAREFAS 2.4.5 Beta','TAREFAS '+VERSION+' Beta')
  .replaceAll('TarefasBeta245','TarefasBeta246'),{required:false});

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.4.5',BUILD=280","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central Beta 2.4.5','Central Beta '+VERSION)
  .replaceAll('Ferramentas Beta 2.4.5','Ferramentas Beta '+VERSION)
  .replaceAll('BETA 245','BETA 246'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_BETA_TABS_V280__',VERSION='2.4.5',BUILD=280","const MARK='__TAREFAS_BETA_TABS_V281__',VERSION='2.4.6',BUILD=281")
  .replace('<small>Beta 2.4.5</small>','<small>Beta '+VERSION+'</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replaceAll("tarefasAppVersion = '2.4.5'","tarefasAppVersion = '"+VERSION+"'")
  .replaceAll("tarefasAppBuild = '280'","tarefasAppBuild = '"+BUILD+"'"),{required:false});

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.4.3';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 278;','const APP_BUILD = '+BUILD+';'),{required:false});

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('BETA 2.4.3','BETA '+VERSION)
  .replaceAll("version:'2.4.5'","version:'"+VERSION+"'")
  .replaceAll('build:280','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.4.5'","version:'"+VERSION+"'")
  .replaceAll('build:280','build:'+BUILD)
  .replaceAll('"2.4.3"','"'+VERSION+'"')
  .replaceAll("'2.4.3'","'"+VERSION+"'"),{required:false});

await patch('mobile-release-v240.js',source=>{
  let out=source
    .replaceAll("const PATCH_VERSION='2.4.5';","const PATCH_VERSION='"+VERSION+"';")
    .replaceAll("const BASE_VERSION='2.4.5';","const BASE_VERSION='"+VERSION+"';")
    .replaceAll('const BUILD=278;','const BUILD='+BUILD+';')
    .replaceAll("version:'2.4.5',build:280,channel:'beta'","version:'"+VERSION+"',build:"+BUILD+",channel:'beta'")
    .replaceAll('__TAREFAS_BETA_245__','__TAREFAS_BETA_246__');
  out+="\n;globalThis.__TAREFAS_BETA_246__=Object.freeze({version:'"+VERSION+"',build:"+BUILD+",channel:'beta',basedOn:'2.4.5',webVersion:'"+WEB_VERSION+"',launcherIconBridge:true,profileHomeIcon:true,patchChannelsFollowApkPreferences:true,drawerScalesOnly:true,officialPatchSha256Bytes:true});\n";
  out+=";globalThis.__TAREFAS_EFFECTIVE_VERSION__='"+VERSION+"';\n";
  return out;
},{required:true});

await rm(path.join(dist,'RELEASE_2_4_0.json'),{force:true});
await rm(path.join(dist,'BETA_2_4_3.json'),{force:true});
await writeFile(path.join(dist,'BETA_2_4_6.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'beta',base:'2.4.5',webVersion:WEB_VERSION,generatedAt:new Date().toISOString(),
  futureDelivery:{beta:'tpatch',alpha:'tpatch',betaNotifications:'same-apk-beta-preference',alphaNotifications:'same-apk-alpha-preference'},
  features:{basedOnValidated245:true,launcherIconSelector:true,launcherNativeBridge:true,profileAvatarAsHomeIcon:true,launcherPresetBlue:true,launcherPresetMilitary:true,launcherPresetGold:true,launcherPresetSystem:true,defaultLauncherIconFixed:true,patchManager:true,patchBetaChannelUsesApkPreference:true,patchAlphaChannelUsesApkPreference:true,web791:true,biometricColdStartOnly:true,diagnosticTabs:true,drawerScalesOnly:true,officialPatchSha256Bytes:true}
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' BETA baseada diretamente na build validada 2.4.3/278.');
