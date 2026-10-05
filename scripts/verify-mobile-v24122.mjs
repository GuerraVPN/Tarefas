import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=process.cwd(), dir=path.resolve(process.argv[2]||'dist'), read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.12.2 verify: '+m)};

for(const f of ['mobile-bootstrap.js','mobile-login-v17.js','mobile-patch-manager-v240.js','dashboard.html','dashboard.js','about.html','ALPHA_2_4_12_2.json']){
  await access(path.join(dir,f));
}
const b=await read('mobile-bootstrap.js'), pm=await read('mobile-patch-manager-v240.js');
const m=JSON.parse(await read('ALPHA_2_4_12_2.json'));

must(b.includes("const APP_VERSION = '2.4.12.2'") && b.includes('const APP_BUILD = 299'),'versão/build');
must(pm.includes('2.4.12.2') && pm.includes('299'),'Patch Manager');
must(b.includes('tmDrawer') && b.includes('tm-bottom-nav'),'navegação base 2.4.9 perdida');
must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'hotbar Serviços perdida');
must(b.includes('__TAREFAS_PATCH_CONSOLIDATED_2487__'),'cadeia 2.4.9 quebrada');
must(b.includes('__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__'),'correção biométrica da base perdida');
must(b.includes('__TAREFAS_ALPHA_24911_CONSOLIDATED__'),'patch 2.4.9.11 não consolidado');
must(!b.includes('__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__'),'layout específico da 2.4.11 incorporado indevidamente');

const p=JSON.parse(await readFile(path.join(root,'patches/TAREFAS-2.4.9.11.tpatch'),'utf8'));
const actual=createHash('sha256').update(JSON.stringify({js:String(p.payload?.js||''),css:String(p.payload?.css||'')}),'utf8').digest('hex');
must(actual===String(p.payloadSha256||'').toLowerCase(),'SHA do 2.4.9.11');

must(m.version==='2.4.12.2' && m.build===299 && m.channel==='alpha' && m.incorporatedPatch==='2.4.9.11','manifesto');
must(!('webVersion' in m),'manifesto Android não deve expor webVersion');
for(const name of await readdir(dir)){
  if(!/\.(?:js|html|json)$/i.test(name)) continue;
  const s=await read(name);
  for(const t of ['2.4.11','__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__']){
    must(!s.includes(t),name+' contém '+t);
  }
}


const uiFiles=['mobile-bootstrap.js','mobile-v12.js','mobile-updates-v181.js','mobile-patch-manager-v240.js','mobile-release-v240.js','mobile-beta-v2325.js'];
for(const file of uiFiles){
  const s=await read(file);
  must(!/WEB\s*[0-9]+\.[0-9]+/i.test(s),file+' contém referência Web visível');
}
const boot=await read('mobile-bootstrap.js');
must(boot.includes('<small>\${APP_VERSION}</small>'),'cabeçalho Android-only ausente');
must(!boot.includes('Base web'),'card Base web ainda presente');
must(boot.includes('Aplicativo Android do sistema TAREFAS.'),'texto Android-only do About ausente');
const updates=await read('mobile-updates-v181.js');
must(updates.includes("const APP_VERSION = '2.4.12.2';"),'versão do centro de atualizações');
must(updates.includes('const APP_BUILD = 299;'),'build do centro de atualizações');
must(updates.includes("const APP_CHANNEL = 'alpha';"),'canal do centro de atualizações');
must(updates.includes("latestBadge=latest?.channel==='alpha'?'ALPHA'"),'badge Alpha do centro de atualizações');
must(updates.includes("const channel=v.channel==='alpha'?'ALPHA'"),'histórico reconhece Alpha');
must(!updates.includes('v.web_version'), 'histórico ainda exibe web_version');

console.log('VERIFY 2.4.12.2 ALPHA OK: Android sem identificação Web na interface.');

// final alpha verification trigger.

// manifest path fix trigger.

// final PM format trigger.
