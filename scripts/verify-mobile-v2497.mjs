import { access,readFile,readdir } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),dir=path.resolve(process.argv[2]||'dist'),read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.9.7 verify: '+m)};
for(const f of ['mobile-bootstrap.js','mobile-login-v17.js','mobile-patch-manager-v240.js','mobile-release-v240.js','dashboard.html','about.html','ALPHA_2_4_9_7.json'])await access(path.join(dir,f));
const b=await read('mobile-bootstrap.js'),pm=await read('mobile-patch-manager-v240.js'),rel=await read('mobile-release-v240.js'),m=JSON.parse(await read('ALPHA_2_4_9_7.json'));
must(b.includes("const APP_VERSION = '2.4.9.7';")&&b.includes('const APP_BUILD = 294;'),'versão/build');
must(pm.includes("APP_VERSION='2.4.9.7'")&&pm.includes('APP_BUILD=294')&&pm.includes("APP_CHANNEL='alpha'"),'Patch Manager');
must(m.version==='2.4.9.7'&&m.build===294&&m.channel==='alpha'&&m.features?.appOnly===true&&m.features?.webDecoupled===true,'manifest');
for(const [name,s] of [['bootstrap',b],['patch-manager',pm],['release',rel]]){for(const t of [' • WEB ','Base web','Base Web','WEB_VERSION','__TAREFAS_WEB_BASE_VERSION__','tarefasWebVersion'])must(!s.includes(t),name+' ainda contém '+t)}
let bad=[];
for(const name of await readdir(dir)){if(!/\.(?:js|html|json)$/i.test(name))continue;const s=await read(name);for(const t of [' • WEB ','Base web','Base Web'])if(s.includes(t))bad.push(name+' :: '+t)}
must(!bad.length,'Web visível no bundle: '+bad.join(' | '));
const java=await readFile(path.join(root,'app/android/TarefasBiometricPlugin.java'),'utf8');
for(const marker of ['authenticateInProgress','pendingAuthenticateCalls','resolvePendingAuthenticateCalls','rejectPendingAuthenticateCalls','synchronized (authenticateLock)'])must(java.includes(marker),'trava biométrica '+marker);
must(java.match(/new BiometricPrompt\(/g)?.length===1,'mais de um BiometricPrompt');
console.log('VERIFY 2.4.9.7 ALPHA OK');

// final trigger
