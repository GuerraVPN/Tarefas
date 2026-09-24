import { copyFile, readFile, writeFile, access, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(), dist=path.join(root,'dist');
const VERSION='2.4.7.2', BUILD=284, WEB_VERSION='7.9.1';
const PATCH_ID='2.4.6.8';
const PREVIOUS_ALPHA='2.4.7.1';
const PATCH_FILE=path.join(root,'patches','TAREFAS-2.4.6.8.tpatch');
const PATCH_SHA256='9bf9f10ca640f313500b6936918debeb45a6c094efb4aeef759bf6c2cfdbe607';

async function mustFile(file,label){try{await access(file)}catch{throw new Error('2.4.7.2: arquivo obrigatório ausente: '+label+' ('+file+')')}}
async function patch(rel,fn,{required=true}={}){const file=path.join(dist,rel);await mustFile(file,rel);const before=await readFile(file,'utf8');const after=fn(before);if(required&&after===before)throw new Error('2.4.7.2: alteração não aplicada em '+rel);if(after!==before)await writeFile(file,after,'utf8')}

await mustFile(dist,'dist/');
for(const name of ['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js']) await mustFile(path.join(dist,name),name);
await mustFile(path.join(root,'app/mobile-launcher-icon-v241.js'),'app/mobile-launcher-icon-v241.js');
await mustFile(PATCH_FILE,'patches/TAREFAS-2.4.6.8.tpatch');

const patchText=await readFile(PATCH_FILE,'utf8');
const patchData=JSON.parse(patchText);
if(patchData.id!==PATCH_ID||patchData.baseVersion!=='2.4.6')throw new Error('2.4.7.2: metadados do patch 2.4.6.8 inválidos');
if(!patchData.payload?.js)throw new Error('2.4.7.2: payload JS do patch 2.4.6.8 ausente');
const declaredSha=String(patchData.payloadSha256||'').toLowerCase();
if(declaredSha!==PATCH_SHA256)throw new Error('2.4.7.2: SHA-256 declarado do patch 2.4.6.8 não confere com o artefato oficial');
const payload=patchData.payload.js;
if(payload.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'))throw new Error('2.4.7.2: payload proibido 2.4.6.7 detectado');

await copyFile(path.join(root,'app/mobile-launcher-icon-v241.js'),path.join(dist,'mobile-launcher-icon-v241.js'));
for(const name of ['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js']){
  await patch(name,s=>s.replaceAll('2.4.6',VERSION).replaceAll('281',String(BUILD)).replaceAll("channel:'beta'","channel:'alpha'").replaceAll("APP_CHANNEL='beta'","APP_CHANNEL='alpha'").replaceAll("APP_CHANNEL = 'beta'","APP_CHANNEL = 'alpha'"),{required:false});
}
await patch('mobile-bootstrap.js',s=>{
  if(s.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__')) return s;
  return s+'\n'+payload+'\n';
},{required:true});
await patch('mobile-dashboard-v184.js',s=>{
  const start=s.indexOf('  function ensureCard(){');
  const end=s.indexOf('\n\n  function setCard',start);
  if(start<0||end<0)throw new Error('2.4.7.2: ensureCard do dashboard mobile não encontrado');
  return s.slice(0,start)+'  function ensureCard(){ return null; }'+s.slice(end);
},{required:true});
await patch('mobile-release-v240.js',s=>s.replaceAll("version:VERSION,build:BUILD,channel:'alpha'",`version:'${VERSION}',build:${BUILD},channel:'alpha'`),{required:false});
await rm(path.join(dist,'RELEASE_2_4_0.json'),{force:true});
await writeFile(path.join(dist,'ALPHA_2_4_7_2.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'alpha',base:'2.4.6',basedOn:PREVIOUS_ALPHA,incorporatedPatch:PATCH_ID,webVersion:WEB_VERSION,
  features:{only2468:true,scalesPatch2467:false,servicesHotbar2468:true,nextServiceDashboardCardRemoved:true}
},null,2)+'\n');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' ALPHA — somente patch oficial '+PATCH_ID+' e remoção do cartão Próximo Serviço.');
