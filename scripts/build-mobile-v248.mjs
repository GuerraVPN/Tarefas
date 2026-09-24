import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dist=path.join(root,'dist');
const VERSION='2.4.8',BUILD=290,WEB_VERSION='7.9.1',BASE_ALPHA='2.4.7.7';

// 1) Reproduz exatamente a base Alpha 2.4.7.7 já validada.
// 2) Somente depois promovemos a camada para Beta 2.4.8.
// Assim esta Beta não nasce da linha Beta 2.4.7 que foi descartada.
await import('./build-mobile-v2477.mjs');

const patch=(file,fn)=>{
  const f=path.join(dist,file);
  return readFile(f,'utf8').then(before=>{
    const after=fn(before);
    if(after!==before)return writeFile(f,after,'utf8');
  });
};

for(const name of await readdir(dist)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  await patch(name,s=>s
    .replaceAll(BASE_ALPHA,VERSION)
    .replaceAll("APP_VERSION='2.4.7.7'","APP_VERSION='"+VERSION+"'")
    .replaceAll("APP_VERSION = '2.4.7.7'","APP_VERSION = '"+VERSION+"'")
    .replaceAll("version:'2.4.7.7'","version:'"+VERSION+"'")
    .replaceAll("versionName \"2.4.7.7\"","versionName \""+VERSION+"\"")
    .replaceAll('2.4.7.7-b289',VERSION+'-b'+BUILD)
    .replaceAll('build:289','build:'+BUILD)
    .replaceAll('APP_BUILD=289','APP_BUILD='+BUILD)
    .replaceAll('APP_BUILD = 289','APP_BUILD = '+BUILD)
    .replaceAll("APP_CHANNEL='alpha'","APP_CHANNEL='beta'")
    .replaceAll("APP_CHANNEL = 'alpha'","APP_CHANNEL = 'beta'")
    .replaceAll("const APP_CHANNEL = 'alpha'","const APP_CHANNEL = 'beta'")
    .replaceAll("channel:'alpha'","channel:'beta'")
    .replaceAll("channel: 'alpha'","channel: 'beta'")
  );
}

await rm(path.join(dist,'ALPHA_2_4_7_7.json'),{force:true});
await writeFile(path.join(dist,'BETA_2_4_8.json'),JSON.stringify({
  version:VERSION,
  build:BUILD,
  channel:'beta',
  base:'2.4.7.7-alpha',
  basedOn:'2.4.7.7',
  webVersion:WEB_VERSION,
  incorporatedPatch:'2.4.6.8',
  generatedAt:new Date().toISOString(),
  features:{
    promotedFromValidatedAlpha2477:true,
    only2468:true,
    scalesPatch2467:false,
    servicesHotbar2468:true,
    dashboardNextServiceSourceRemoved:true,
    legacyDashboardModuleRemoved:true,
    patchManagerPreserved:true,
    patchManagerV1:true,
    web791:true,
    biometricColdStartOnly:true
  }
},null,2)+'\n','utf8');

const forbiddenNextService=[
  'kNextServiceCard','kNextService','tm-next-service-kpi','v756-next-service',
  'ensureNextCard','loadDashboardService','v756NextServiceCss','data-v756-next-icon',
  'Próximo serviço</small>','Próximo Serviço</small>'
];
const all=[];
for(const name of await readdir(dist)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  const file=path.join(dist,name),content=await readFile(file,'utf8');
  for(const token of forbiddenNextService)if(content.includes(token))all.push(name+' :: '+token);
}
if(all.length)throw new Error('2.4.8: origem do cartão Próximo Serviço detectada: '+all.join(' | '));

const bootstrap=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');
const updates=await readFile(path.join(dist,'mobile-updates-v181.js'),'utf8');
const about=await readFile(path.join(dist,'about.html'),'utf8');

if(!bootstrap.includes("const APP_VERSION = '2.4.8';")||!bootstrap.includes('const APP_BUILD = 290;'))throw new Error('2.4.8: versão/build do bootstrap incorretos');
if(!bootstrap.includes("__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__"))throw new Error('2.4.8: patch 2.4.6.8 ausente');
if(bootstrap.includes("__TAREFAS_ALPHA_2467_ESCALAS_2433__"))throw new Error('2.4.8: patch 2.4.6.7 detectado');
if(!pm.includes("const APP_VERSION='2.4.8',APP_BUILD=290,APP_CHANNEL='beta';"))throw new Error('2.4.8: Patch Manager não promovido para Beta');
if(!updates.includes("const APP_CHANNEL = 'beta';"))throw new Error('2.4.8: canal beta ausente no atualizador');
if(!about.includes('mobile-patch-manager-v240.js'))throw new Error('2.4.8: Patch Manager ausente no About');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' BETA — promovida diretamente da Alpha '+BASE_ALPHA+'; somente patch 2.4.6.8.');
