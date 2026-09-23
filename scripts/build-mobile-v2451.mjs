import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(), dist=path.join(root,'dist');
const VERSION='2.4.5.1', BUILD=281, WEB_VERSION='7.9.1';

async function patch(rel, fn){
  const file=path.join(dist,rel);
  const before=await readFile(file,'utf8');
  const after=fn(before);
  if(after===before) throw new Error('2.4.5.1: alteração não aplicada em '+rel);
  await writeFile(file,after,'utf8');
}

await patch('mobile-patch-manager-v240.js',s=>s
 .replace("const APP_VERSION='2.4.5',APP_BUILD=280,APP_CHANNEL='beta';","const APP_VERSION='"+VERSION+"',APP_BUILD="+BUILD+",APP_CHANNEL='alpha';")
 .replace('__TAREFAS_PATCH_MANAGER_V280__','__TAREFAS_PATCH_MANAGER_V281__')
 .replaceAll("source:'beta-2.4.5'","source:'alpha-2.4.5.1'"));

await patch('mobile-bootstrap.js',s=>s
 .replace("const APP_VERSION = '2.4.5';","const APP_VERSION = '"+VERSION+"';")
 .replace('const APP_BUILD = 280;','const APP_BUILD = '+BUILD+';')
 .replaceAll('__TAREFAS_BETA_245_BOOT__','__TAREFAS_ALPHA_2451_BOOT__')
 .replaceAll('__TAREFAS_PATCH_SYSTEM_V280__','__TAREFAS_PATCH_SYSTEM_V281__')
 .replace("basedOn:'2.4.3'","basedOn:'2.4.5'")
 .replaceAll("channel:'beta'","channel:'alpha'"));

await patch('mobile-alpha-v23223-fix.js',s=>s
 .replace("VERSION='2.4.5',BUILD=280,MARK='__TAREFAS_BETA_NAV_V280__'","VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_ALPHA_NAV_V281__'")
 .replaceAll('TAREFAS 2.4.5 Beta','TAREFAS '+VERSION+' Alpha'));

await patch('mobile-alpha-v23221-tabs.js',s=>s
 .replace("MARK='__TAREFAS_BETA_TABS_V280__',VERSION='2.4.5',BUILD=280","MARK='__TAREFAS_ALPHA_TABS_V281__',VERSION='"+VERSION+"',BUILD="+BUILD)
 .replace('<small>Beta 2.4.5</small>','<small>Alpha '+VERSION+'</small>'));

await patch('mobile-preload.js',s=>s
 .replaceAll("tarefasAppVersion = '2.4.5'","tarefasAppVersion = '"+VERSION+"'")
 .replaceAll("tarefasAppBuild = '280'","tarefasAppBuild = '"+BUILD+"'"));

await patch('mobile-updates-v181.js',s=>s
 .replace("const APP_VERSION = '2.4.5';","const APP_VERSION = '"+VERSION+"';")
 .replace('const APP_BUILD = 280;','const APP_BUILD = '+BUILD+';')
 .replace("const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'alpha';"));

await patch('native-mobile.js',s=>s
 .replaceAll("version:'2.4.5'","version:'"+VERSION+"'")
 .replaceAll('build:280','build:'+BUILD));

await patch('mobile-release-v240.js',s=>{
 let out=s
 .replaceAll("const PATCH_VERSION='2.4.5';","const PATCH_VERSION='"+VERSION+"';")
 .replaceAll("const BASE_VERSION='2.4.5';","const BASE_VERSION='"+VERSION+"';")
 .replaceAll('const BUILD=280;','const BUILD='+BUILD+';')
 .replaceAll("channel:'beta'","channel:'alpha'")
 .replaceAll('__TAREFAS_BETA_245__','__TAREFAS_ALPHA_2451__');
 out+="\n;globalThis.__TAREFAS_ALPHA_2451__=Object.freeze({version:'"+VERSION+"',build:"+BUILD+",channel:'alpha',basedOn:'2.4.5',webVersion:'"+WEB_VERSION+"',drawerScalesOnly:true,officialPatchSha256Bytes:true,nextServiceCardRemoved:true,historyDescriptionsFixed:true});\n";
 out+=";globalThis.__TAREFAS_EFFECTIVE_VERSION__='"+VERSION+"';\n";
 return out;
});

await patch('mobile-dashboard-v184.js',s=>{
 const out=s.replace(/function ensureCard\(\)\{[\s\S]*?\n  \}\n\n  function setCard/,"function ensureCard(){return null;}\n\n  function setCard");
 if(out===s) throw new Error('2.4.5.1: card Próximo serviço não foi removido');
 return out.replace(/__TAREFAS_NEXT_SERVICE_V184__/g,'__TAREFAS_NEXT_SERVICE_REMOVED_V281__');
});

const htmlFiles=['dashboard.html'];
for(const rel of htmlFiles){
 const s=await readFile(path.join(dist,rel),'utf8');
 if(s.includes('Próximo serviço')) throw new Error('2.4.5.1: Próximo serviço ainda aparece no HTML '+rel);
}

await writeFile(path.join(dist,'ALPHA_2_4_5_1.json'),JSON.stringify({
 version:VERSION,build:BUILD,channel:'alpha',base:'2.4.5',webVersion:WEB_VERSION,
 futureDelivery:{beta:'tpatch',alpha:'tpatch',betaNotifications:'same-apk-beta-preference',alphaNotifications:'same-apk-alpha-preference'},
 features:{base245:true,historyDescriptionsFixed:true,nextServiceCardRemoved:true,drawerScalesOnly:true,officialPatchSha256Bytes:true}
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' ALPHA: histórico de descrições corrigido + Próximo serviço removido da tela inicial.');
