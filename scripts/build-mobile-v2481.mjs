import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dist=path.join(root,'dist');
const VERSION='2.4.8.1',BUILD=291,WEB_VERSION='7.9.1',BASE='2.4.8';
const PATCH_ID='2.4.8.1',PATCH_FILE=path.join(root,'patches','TAREFAS-2.4.8.1.tpatch');

await import('./build-mobile-v248.mjs');

const patchData=JSON.parse(await readFile(PATCH_FILE,'utf8'));
if(patchData.id!==PATCH_ID||patchData.baseVersion!==BASE||patchData.payload?.js==null)throw new Error('2.4.8.1: tpatch inválido');
const payload=patchData.payload.js;

const patch=async(rel,fn)=>{
  const f=path.join(dist,rel),before=await readFile(f,'utf8'),after=fn(before);
  if(after!==before)await writeFile(f,after,'utf8');
};

for(const name of await readdir(dist)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  await patch(name,s=>s
    .replaceAll("APP_VERSION='2.4.8'","APP_VERSION='2.4.8.1'")
    .replaceAll("APP_VERSION = '2.4.8'","APP_VERSION = '2.4.8.1'")
    .replaceAll("version:'2.4.8'","version:'2.4.8.1'")
    .replaceAll("version: '2.4.8'","version: '2.4.8.1'")
    .replaceAll('2.4.8-b290','2.4.8.1-b291')
    .replaceAll('APP_BUILD=290','APP_BUILD=291')
    .replaceAll('APP_BUILD = 290','APP_BUILD = 291')
    .replaceAll('build:290','build:291')
    .replaceAll('channel:\'beta\'','channel:\'alpha\'')
    .replaceAll("APP_CHANNEL='beta'","APP_CHANNEL='alpha'")
    .replaceAll("APP_CHANNEL = 'beta'","APP_CHANNEL = 'alpha'")
    .replaceAll("const APP_CHANNEL = 'beta'","const APP_CHANNEL = 'alpha'")
  );
}

await patch('mobile-bootstrap.js',s=>s.includes('__TAREFAS_ALPHA_2481_DISTRIBUICAO_FISCAL_FIX__')?s:s+'\n'+payload+'\n');
await patch('mobile-login-v17.js',s=>s.replaceAll('dashboard.html?app=2.4.8','dashboard.html?app=2.4.8.1'));
await patch('index.html',s=>s.replaceAll('dashboard.html?app=2.4.8','dashboard.html?app=2.4.8.1'));
await patch('mobile-bootstrap.js',s=>s.replaceAll('dashboard.html?app=2.4.8','dashboard.html?app=2.4.8.1'));

await writeFile(path.join(dist,'ALPHA_2_4_8_1.json'),JSON.stringify({
 version:VERSION,build:BUILD,channel:'alpha',base:BASE,basedOn:'2.4.8',incorporatedPatch:'2.4.6.8',webVersion:WEB_VERSION,
 features:{distributionFiscalAmbiguousMotivoFixed:true,supabaseFunctionMigrationIncluded:true,patchManagerPreserved:true,patchManagerV1:true,only2468:true,scalesPatch2467:false,web791:true}
},null,2)+'\n');

const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');
const forbidden=['kNextServiceCard','kNextService','tm-next-service-kpi','v756-next-service','ensureNextCard','loadDashboardService','v756NextServiceCss','data-v756-next-icon','Próximo serviço</small>','Próximo Serviço</small>'];
for(const name of await readdir(dist)){
 if(!/\.(?:js|html)$/i.test(name))continue;
 const c=await readFile(path.join(dist,name),'utf8');
 for(const t of forbidden)if(c.includes(t))throw new Error('2.4.8.1: origem do Próximo Serviço detectada em '+name+' :: '+t);
}
if(!boot.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'))throw new Error('2.4.8.1: patch 2.4.6.8 ausente');
if(boot.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'))throw new Error('2.4.8.1: patch 2.4.6.7 detectado');
if(!boot.includes('__TAREFAS_ALPHA_2481_DISTRIBUICAO_FISCAL_FIX__'))throw new Error('2.4.8.1: correção de Distribuição ausente');
if(!pm.includes("const FORMAT='tarefas-tpatch-v1'"))throw new Error('2.4.8.1: Patch Manager v1 ausente');
if(!pm.includes('crypto.subtle.digest')||!pm.includes('indexedDB.open'))throw new Error('2.4.8.1: Patch Manager incompleto');
console.log('TAREFAS Android 2.4.8.1 build 291 ALPHA — correção da aprovação de Distribuição; somente patch 2.4.6.8 incorporado.');
