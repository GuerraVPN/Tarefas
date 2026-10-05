import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=process.cwd(), dir=path.resolve(process.argv[2]||'dist'), read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.12 verify: '+m)};

for(const f of ['mobile-bootstrap.js','mobile-login-v17.js','mobile-patch-manager-v240.js','dashboard.html','dashboard.js','about.html','BETA_2_4_12.json']){
  await access(path.join(dir,f));
}
const b=await read('mobile-bootstrap.js'), pm=await read('mobile-patch-manager-v240.js');
const m=JSON.parse(await read('BETA_2_4_12.json'));

must(b.includes("const APP_VERSION = '2.4.12'") && b.includes('const APP_BUILD = 297'),'versão/build');
must(pm.includes("APP_VERSION='2.4.12'") && pm.includes('APP_BUILD=297') && pm.includes("APP_CHANNEL='beta'"),'Patch Manager');
must(b.includes('tmDrawer') && b.includes('tm-bottom-nav'),'navegação base 2.4.9 perdida');
must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'hotbar Serviços perdida');
must(b.includes('__TAREFAS_PATCH_CONSOLIDATED_2487__'),'cadeia 2.4.9 quebrada');
must(b.includes('__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__'),'correção biométrica da base perdida');
must(b.includes('__TAREFAS_ALPHA_24911_CONSOLIDATED__'),'patch 2.4.9.11 não consolidado');
must(!b.includes('__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__'),'layout específico da 2.4.11 incorporado indevidamente');

const p=JSON.parse(await readFile(path.join(root,'patches/TAREFAS-2.4.9.11.tpatch'),'utf8'));
const actual=createHash('sha256').update(JSON.stringify({js:String(p.payload?.js||''),css:String(p.payload?.css||'')}),'utf8').digest('hex');
must(actual===String(p.payloadSha256||'').toLowerCase(),'SHA do 2.4.9.11');

must(m.version==='2.4.12' && m.build===297 && m.channel==='beta' && m.incorporatedPatch==='2.4.9.11','manifesto');
must(m.webVersion==='7.9.7','Web 7.9.7 perdida');
for(const name of await readdir(dir)){
  if(!/\.(?:js|html|json)$/i.test(name)) continue;
  const s=await read(name);
  for(const t of ['2.4.11','__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__']){
    must(!s.includes(t),name+' contém '+t);
  }
}
console.log('VERIFY 2.4.12 BETA OK: base 2.4.9 + patch 2.4.9.11, sem camada visual 2.4.11.');
