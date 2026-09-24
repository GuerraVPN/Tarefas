import { copyFile, readFile, writeFile, access, rm, readdir } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dist=path.join(root,'dist');
const VERSION='2.4.7.7',BUILD=289,WEB_VERSION='7.9.1';
const PATCH_ID='2.4.6.8',PREVIOUS_ALPHA='2.4.7.6';
const PATCH_FILE=path.join(root,'patches','TAREFAS-2.4.6.8.tpatch');
const PATCH_SHA256='9bf9f10ca640f313500b6936918debeb45a6c094efb4aeef759bf6c2cfdbe607';

const mustFile=async(f,label)=>{try{await access(f)}catch{throw new Error('2.4.7.7: arquivo ausente: '+label)}};
const patch=async(rel,fn)=>{const f=path.join(dist,rel);await mustFile(f,rel);const before=await readFile(f,'utf8'),after=fn(before);if(after!==before)await writeFile(f,after,'utf8')};

await mustFile(dist,'dist/');
await mustFile(PATCH_FILE,'patches/TAREFAS-2.4.6.8.tpatch');
for(const n of ['mobile-login-v17.js','mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js','dashboard.html','dashboard.js'])await mustFile(path.join(dist,n),n);

const patchData=JSON.parse(await readFile(PATCH_FILE,'utf8'));
if(patchData.id!==PATCH_ID||patchData.baseVersion!=='2.4.6'||!patchData.payload?.js)throw new Error('2.4.7.7: tpatch 2.4.6.8 inválido');
if(String(patchData.payloadSha256||'').toLowerCase()!==PATCH_SHA256)throw new Error('2.4.7.7: SHA-256 do tpatch 2.4.6.8 não confere');
if(JSON.stringify(patchData).includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'))throw new Error('2.4.7.7: conteúdo de 2.4.6.7 detectado');
const payload=patchData.payload.js;

await copyFile(path.join(root,'app/mobile-launcher-icon-v241.js'),path.join(dist,'mobile-launcher-icon-v241.js'));

for(const n of ['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js']){
 await patch(n,s=>s.replaceAll('2.4.6',VERSION).replaceAll('281',String(BUILD)).replaceAll("channel:'beta'","channel:'alpha'").replaceAll("APP_CHANNEL='beta'","APP_CHANNEL='alpha'").replaceAll("APP_CHANNEL = 'beta'","APP_CHANNEL = 'alpha'"));
}
await patch('mobile-bootstrap.js',s=>s.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__')?s:s+'\n'+payload+'\n');
await patch('mobile-login-v17.js',s=>s.replaceAll("location.replace('dashboard.html')","location.replace('dashboard.html?app=2.4.7.7')"));
await patch('index.html',s=>s.replaceAll('window.location.replace("dashboard.html")','window.location.replace("dashboard.html?app=2.4.7.7")').replaceAll('window.location.href = "dashboard.html"','window.location.href = "dashboard.html?app=2.4.7.7"'));
await patch('mobile-bootstrap.js',s=>s.replaceAll("['home','dashboard.html','Início'","['home','dashboard.html?app=2.4.7.7','Início'"));

for(const name of await readdir(dist)){
 if(!name.endsWith('.html'))continue;
 const f=path.join(dist,name);
 let h=await readFile(f,'utf8');
 h=h.replace(/\s*<script[^>]+src=["']mobile-dashboard-v18[45]\.js(?:\?[^"']*)?["'][^>]*><\/script>\s*/gi,'\n');
 if(name==='about.html'&&!h.includes('mobile-patch-manager-v240.js')) h=h.replace(/<\/body>/i,'  <script src="mobile-patch-manager-v240.js?v=2.4.7.7-b288"></script>\n</body>');
 await writeFile(f,h,'utf8');
}

await rm(path.join(dist,'mobile-dashboard-v184.js'),{force:true});
await rm(path.join(dist,'mobile-dashboard-v185.js'),{force:true});
await rm(path.join(dist,'RELEASE_2_4_0.json'),{force:true});
await rm(path.join(dist,'BETA_2_4_3.json'),{force:true});

const forbiddenNextService = [
  'kNextServiceCard',
  'kNextService',
  'tm-next-service-kpi',
  'v756-next-service',
  'ensureNextCard',
  'loadDashboardService',
  'v756NextServiceCss',
  'data-v756-next-icon',
  'Próximo serviço</small>',
  'Próximo Serviço</small>'
];
for (const name of await readdir(dist)) {
  if (!/\.(?:js|html)$/i.test(name)) continue;
  const file=path.join(dist,name), content=await readFile(file,'utf8');
  for (const token of forbiddenNextService) {
    if (content.includes(token)) throw new Error('2.4.7.7: origem do Próximo Serviço ainda presente em '+name+' ('+token+')');
  }
}
const v756=await readFile(path.join(dist,'v7_5_6_patch.js'),'utf8');
if(!v756.includes('loadCalendarServices')||!v756.includes('applyCalendarServices'))throw new Error('2.4.7.7: correções de calendário do v7.5.6 foram removidas junto com o cartão');

await writeFile(path.join(dist,'ALPHA_2_4_7_7.json'),JSON.stringify({
 version:VERSION,build:BUILD,channel:'alpha',base:'2.4.6',basedOn:PREVIOUS_ALPHA,incorporatedPatch:PATCH_ID,webVersion:WEB_VERSION,
 features:{only2468:true,scalesPatch2467:false,servicesHotbar2468:true,dashboardPathRebuilt:true,legacyDashboardModuleRemoved:true,cacheBustedDashboardEntry:true,patchManagerPreserved:true,patchManagerV1:true}
},null,2)+'\n');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' ALPHA — caminho do Dashboard reestruturado; somente patch '+PATCH_ID+'.');
