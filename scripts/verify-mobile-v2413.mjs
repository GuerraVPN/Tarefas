import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(), dir=path.resolve(process.argv[2]||'dist'), read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.13 verify: '+m)};

for(const f of ['mobile-bootstrap.js','mobile-login-v17.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','dashboard.html','dashboard.js','about.html','BETA_2_4_13.json']) await access(path.join(dir,f));

const boot=await read('mobile-bootstrap.js');
const updates=await read('mobile-updates-v181.js');
const pm=await read('mobile-patch-manager-v240.js');
const manifest=JSON.parse(await read('BETA_2_4_13.json'));

must(boot.includes("const APP_VERSION = '2.4.13';") && boot.includes('const APP_BUILD = 300;'),'versão/build');
must(updates.includes("const APP_VERSION = '2.4.13';") && updates.includes('const APP_BUILD = 300;') && updates.includes("const APP_CHANNEL = 'beta';"),'centro de atualizações');
must(pm.includes('2.4.13') && pm.includes('300'),'Patch Manager');
must(manifest.version==='2.4.13' && manifest.build===300 && manifest.channel==='beta' && manifest.base==='2.4.12.2' && manifest.basedOn==='2.4.12.2' && manifest.promotedFrom==='2.4.12.2','manifesto da Beta');

for(const marker of ['tmDrawer','tm-bottom-nav','__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__','__TAREFAS_PATCH_CONSOLIDATED_2487__','__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__','__TAREFAS_ALPHA_24911_CONSOLIDATED__']) must(boot.includes(marker),'marcador '+marker);
must(!boot.includes('__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__'),'layout da 2.4.11 incorporado');

for(const name of ['mobile-bootstrap.js','mobile-login-v17.js','mobile-updates-v181.js','about.html','v7_5_1_about.js']){
  const s=await read(name);
  must(!/WEB\s*[0-9]+\.[0-9]+/i.test(s),name+' contém versão Web visível');
  must(!s.includes('Base web'),'card Base web presente em '+name);
}
must(!updates.includes('v.web_version'),'histórico ainda renderiza web_version');
must(updates.includes('BETA'),'badge/canal Beta ausente');

console.log('VERIFY 2.4.13 BETA OK: promoção limpa da 2.4.12.2.');

// final Beta verifier trigger.
