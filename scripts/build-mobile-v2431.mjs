import { copyFile, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dist=path.join(root,'dist');
const VERSION='2.4.3.1',BUILD=279,WEB_VERSION='7.9.1';

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=fn(before);
  if(required&&after===before)throw new Error('2.4.3: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-launcher-icon-v241.js'),path.join(dist,'mobile-launcher-icon-v241.js'));

const special=new Set(['reiniciar.html','desligado.html']);
for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);let source=await readFile(file,'utf8');
  source=source.replace(/<script src=["']mobile-launcher-icon-v242\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
  source=source.replace(/<script src=["']mobile-launcher-icon-v241\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
  source=source.replaceAll('2.4.0-b274','2.4.3.1-b279').replaceAll('2.4.2-b277','2.4.3.1-b279');
  if(!special.has(name.toLowerCase())){
    const tag='<script src="mobile-launcher-icon-v241.js?v='+VERSION+'-b'+BUILD+'"></script>';
    source=source.includes('</body>')?source.replace('</body>',tag+'\n</body>'):source+'\n'+tag;
  }
  await writeFile(file,source,'utf8');
}

await patch('mobile-patch-manager-v240.js',source=>source
  .replace("const APP_VERSION='2.4.2',APP_BUILD=279,APP_CHANNEL='alpha';","const APP_VERSION='"+VERSION+"',APP_BUILD="+BUILD+",APP_CHANNEL='alpha';")
  .replace("__TAREFAS_PATCH_MANAGER_V277__","__TAREFAS_PATCH_MANAGER_V279__")
  .replaceAll("source:'beta-2.4.2'","source:'beta-2.4.3'"),{required:true});

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.4.3.1';","const APP_VERSION = '"+VERSION+"';")
    .replace('const APP_BUILD = 279;','const APP_BUILD = '+BUILD+';')
    .replaceAll('Beta 2.4.2','Beta '+VERSION)
    .replaceAll('2.4.2 Beta',VERSION+' Beta')
    .replaceAll('__TAREFAS_BETA_242_BOOT__','__TAREFAS_ALPHA_2431_BOOT__')
    .replaceAll('__TAREFAS_PATCH_SYSTEM_V277__','__TAREFAS_PATCH_SYSTEM_V278__')
    .replaceAll("version:'2.4.2'","version:'"+VERSION+"'")
    .replaceAll('build:277','build:'+BUILD)
    .replaceAll("version:'2.4.0'","version:'"+VERSION+"'")
    .replaceAll('build:274','build:'+BUILD);

  const old="['Serviços e pessoal', [\n      ['Pessoal / Escalas','pessoal.html','Escala preta, vermelha e SV/TSV'],\n      ['Missões','missao.html','Missões e serviços'],\n      ['Férias e dispensas','ferias_dispensas.html','Ausências e dispensas']\n    ]]";
  const neu="['Serviços e pessoal', [\n      ['Escalas','#escalas','Motorista, patrulheiro e permanência'],\n      ['Férias e dispensas','ferias_dispensas.html','Ausências e dispensas']\n    ]]";
  if(!out.includes(old))throw new Error('2.4.3: bloco Serviços e pessoal não encontrado');
  out=out.replace(old,neu);

  const marker="  function openDrawer(){";
  const fn=`  function openScales(){\n    const wrap=sheetBase('tmScales243','Escalas');\n    const body=wrap.querySelector('.tm-sheet-body');\n    const links=[\n      ['Escala de motorista','https://docs.google.com/spreadsheets/d/1T_BM9KY0NLwVhlifetQ6W6AdetujQjx--zOZHa27eQs/edit?usp=drivesdk'],\n      ['Escala de patrulheiro','https://docs.google.com/spreadsheets/d/1_LlfIHx4EuSHkC9BOR2VorvXoaiMyLa028wU6C0dQLs/edit?usp=drivesdk'],\n      ['Escala de permanência','https://docs.google.com/spreadsheets/d/13eEei_JdGjAdVo371BGfPS59QdYySe9lJ47DLjWb_x0/edit?usp=drivesdk']\n    ];\n    body.innerHTML='<div class="tm243-scales-list"></div>';\n    const list=body.querySelector('.tm243-scales-list');\n    links.forEach(([label,url])=>{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer external';a.textContent=label;a.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 4px;border-bottom:1px solid rgba(127,127,127,.18);color:inherit;text-decoration:none;font-weight:700';const s=document.createElement('span');s.textContent='↗';s.style.opacity='.6';a.appendChild(s);list.appendChild(a)});\n  }\n\n`;
  if(!out.includes(marker))throw new Error('2.4.3: openDrawer não encontrado');
  out=out.replace(marker,fn+marker);

  const oldClick="body.querySelectorAll('[data-href]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.href)));";
  const newClick="body.querySelectorAll('[data-href]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.href==='#escalas'){wrap.remove();openScales();}else navigate(btn.dataset.href);}));";
  if(!out.includes(oldClick))throw new Error('2.4.3: handler do drawer não encontrado');
  out=out.replace(oldClick,newClick);

  out+="\n;globalThis.__TAREFAS_ALPHA_2431_BOOT__={version:'"+VERSION+"',build:"+BUILD+",channel:'alpha',basedOn:'2.4.2',webVersion:'"+WEB_VERSION+"',launcherIconBridge:true,patchChannelsFollowApkPreferences:true,drawerScalesOnly:true};\n";
  return out;
});

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.4.2',BUILD=277,MARK='__TAREFAS_BETA_NAV_V277__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_ALPHA_NAV_V279__';")
  .replaceAll('TAREFAS 2.4.2 Beta','TAREFAS '+VERSION+' Beta')
  .replaceAll('TarefasBeta242','TarefasBeta243'),{required:false});

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.4.2',BUILD=277","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central Beta 2.4.2','Central Beta '+VERSION)
  .replaceAll('Ferramentas Beta 2.4.2','Ferramentas Beta '+VERSION)
  .replaceAll('BETA 242','BETA 243'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_BETA_TABS_V277__',VERSION='2.4.2',BUILD=277","const MARK='__TAREFAS_ALPHA_TABS_V279__',VERSION='"+VERSION+"',BUILD="+BUILD)
  .replace('<small>Beta 2.4.2</small>','<small>Beta '+VERSION+'</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replaceAll("tarefasAppVersion = '2.4.2'","tarefasAppVersion = '"+VERSION+"'")
  .replaceAll("tarefasAppBuild = '277'","tarefasAppBuild = '"+BUILD+"'")
  .replaceAll("tarefasAppVersion = '2.4.0'","tarefasAppVersion = '"+VERSION+"'")
  .replaceAll("tarefasAppBuild = '274'","tarefasAppBuild = '"+BUILD+"'"));

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.4.3.1';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 279;','const APP_BUILD = '+BUILD+';'),{required:false});

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('BETA 2.4.2','BETA '+VERSION)
  .replaceAll("version:'2.4.2'","version:'"+VERSION+"'")
  .replaceAll('build:277','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.4.2'","version:'"+VERSION+"'")
  .replaceAll('build:277','build:'+BUILD)
  .replaceAll('"2.4.2"','"'+VERSION+'"')
  .replaceAll("'2.4.2'","'"+VERSION+"'"),{required:false});

await patch('mobile-release-v240.js',source=>{
  let out=source
    .replaceAll("const PATCH_VERSION='2.4.2';","const PATCH_VERSION='"+VERSION+"';")
    .replaceAll("const BASE_VERSION='2.4.2';","const BASE_VERSION='"+VERSION+"';")
    .replaceAll('const BUILD=277;','const BUILD='+BUILD+';')
    .replaceAll('const BASE_BUILD=277;','const BASE_BUILD='+BUILD+';')
    .replaceAll("version:'2.4.2',build:277,channel:'alpha'","version:'"+VERSION+"',build:"+BUILD+",channel:'alpha'");
  out=out.replaceAll('__TAREFAS_BETA_242__','__TAREFAS_ALPHA_2431__');
  out=out.replaceAll("version:'2.4.0',build:274","version:'"+VERSION+"',build:"+BUILD);
  out+="\n;globalThis.__TAREFAS_ALPHA_2431__=Object.freeze({version:'"+VERSION+"',build:"+BUILD+",channel:'alpha',webVersion:'"+WEB_VERSION+"',launcherIconBridge:true,profileHomeIcon:true,patchChannelsFollowApkPreferences:true,drawerScalesOnly:true});\n";
  out+=";globalThis.__TAREFAS_EFFECTIVE_VERSION__='"+VERSION+"';\n";
  return out;
});

await rm(path.join(dist,'RELEASE_2_4_0.json'),{force:true});
await rm(path.join(dist,'BETA_2_4_2.json'),{force:true});
await writeFile(path.join(dist,'ALPHA_2_4_3_1.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'alpha',base:'2.4.2',webVersion:WEB_VERSION,generatedAt:new Date().toISOString(),
  futureDelivery:{beta:'tpatch',alpha:'tpatch',betaNotifications:'same-apk-beta-preference',alphaNotifications:'same-apk-alpha-preference'},
  features:{launcherIconSelector:true,launcherNativeBridge:true,profileAvatarAsHomeIcon:true,launcherPresetBlue:true,launcherPresetMilitary:true,launcherPresetGold:true,launcherPresetSystem:true,defaultLauncherIconFixed:true,patchManager:true,patchBetaChannelUsesApkPreference:true,patchAlphaChannelUsesApkPreference:true,web791:true,biometricColdStartOnly:true,diagnosticTabs:true,drawerScalesOnly:true,officialPatchSha256Bytes:true}
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' BETA: base consolidada com patches 2.4.1.8–2.4.1.12, menu Escalas e ponte nativa de ícones.');
