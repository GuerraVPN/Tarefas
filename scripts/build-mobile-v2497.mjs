import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(), dist=path.join(root,'dist');
const VERSION='2.4.9.7', BUILD=294;

async function patch(file,fn){
 const p=path.join(dist,file), before=await readFile(p,'utf8'), after=fn(before);
 if(after!==before)await writeFile(p,after,'utf8');
}

await import('./build-mobile-v249.mjs');

await patch('mobile-bootstrap.js',s=>s
 .replace("const APP_VERSION = '2.4.9';","const APP_VERSION = '2.4.9.7';")
 .replace('const APP_BUILD = 293;','const APP_BUILD = 294;')
 .replace(/\s*const WEB_VERSION = '[^']*';/,'')
 .replace('<article><small>Base web</small><strong>${WEB_VERSION}</strong></article>','')
 .replace('${APP_VERSION} • WEB ${WEB_VERSION}','${APP_VERSION}')
);
await patch('mobile-patch-manager-v240.js',s=>s
 .replace("const APP_VERSION='2.4.9',APP_BUILD=293,APP_CHANNEL='beta';","const APP_VERSION='2.4.9.7',APP_BUILD=294,APP_CHANNEL='alpha';")
 .replace(/const web=el\.textContent\.match\(\/WEB\\s\*\(\[0-9\.\]\+\)\/i\)\?\.\[1\]\|\|'7\.8\.6';\s*const wanted=effectiveVersion\+' • WEB '\+web;/,'const wanted=effectiveVersion;')
);
await patch('mobile-release-v240.js',s=>s
 .replace("const WEB_VERSION='7.9.1';","const WEB_VERSION='';")
 .replace("globalThis.__TAREFAS_WEB_BASE_VERSION__=WEB_VERSION;\n",'')
 .replace("document.documentElement.dataset.tarefasWebVersion=WEB_VERSION;\n",'')
 .replace("const wanted=effectiveVersion()+' • WEB '+web;","const wanted=effectiveVersion();")
 .replace("const wanted=PATCH_VERSION+' • WEB '+WEB_VERSION;","const wanted=PATCH_VERSION;")
 .replace("      next=next.replace(/WEB\\s*7\\.8(?:\\.0|\\.1|\\.2|\\.6)?/ig,'WEB '+WEB_VERSION);\n      next=next.replace(/Base\\s*Web\\s*[:•-]?\\s*7\\.8(?:\\.0|\\.1|\\.2|\\.6)?/ig,'Base Web: '+WEB_VERSION);\n",'')
);
await patch('mobile-v12.js',s=>s.replace(/([0-9.]+) • WEB [0-9.]+/g,VERSION));
await patch('mobile-beta-v2325.js',s=>s.replace("const wanted=effectiveVersion()+' • WEB '+web;","const wanted=effectiveVersion();"));

const manifest={version:VERSION,build:BUILD,channel:'alpha',base:'2.4.9',basedOn:'2.4.9',features:{appOnly:true,webDecoupled:true,webVersionVisible:false,webDependency:false,biometricSessionHandoff:true,patchManagerPreserved:true,patchManagerV1:true,scalesPreserved:true,notesFiscal2493:true,legacyOrcamentariosPreserved:true,releaseBranchIsolatedFromMain:true}};
await writeFile(path.join(dist,'ALPHA_2_4_9_7.json'),JSON.stringify(manifest,null,2)+'\n');
await rm(path.join(dist,'BETA_2_4_9.json'),{force:true});

const forbidden=[' • WEB ','Base web','Base Web','WEB_VERSION','__TAREFAS_WEB_BASE_VERSION__','tarefasWebVersion'];
const hits=[];
for(const name of await readdir(dist)){
 if(!/\.(?:js|html|json)$/i.test(name))continue;
 const s=await readFile(path.join(dist,name),'utf8');
 for(const t of forbidden)if(s.includes(t))hits.push(name+' :: '+t);
}
if(hits.length)throw new Error('Web ainda enraizado no bundle: '+hits.slice(0,30).join(' | '));
const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8'),pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');
if(!boot.includes("const APP_VERSION = '2.4.9.7';")||!boot.includes('const APP_BUILD = 294;'))throw new Error('App version/build não promovidos');
if(!pm.includes("APP_VERSION='2.4.9.7'")||!pm.includes('APP_BUILD=294')||!pm.includes("APP_CHANNEL='alpha'"))throw new Error('Patch Manager não promovido');
if(/new\s+MutationObserver/.test(boot))throw new Error('Observer global indevido no bootstrap');
console.log('TAREFAS Alpha 2.4.9.7 build 294 — App independente da Web: OK');

// Alpha 2.4.9.7 build trigger: source-level Web decoupling.
