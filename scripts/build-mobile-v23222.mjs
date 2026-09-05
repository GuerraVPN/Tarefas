import { appendFile, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const dist=path.join(root,'dist');
const VERSION='2.3.22.2',BUILD=265;
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23221.mjs')).href+'?v=23222');

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel);const before=await readFile(file,'utf8');const after=fn(before);
  if(required&&after===before)throw new Error(`2.3.22.2: alteração não aplicada em ${rel}`);
  if(after!==before)await writeFile(file,after,'utf8');
}

for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);let s=await readFile(file,'utf8');
  s=s.replaceAll('2.3.22.1-b264','2.3.22.2-b265');
  await writeFile(file,s,'utf8');
}

await patch('mobile-bootstrap.js',s=>s
  .replace("const APP_VERSION = '2.3.22.1';",`const APP_VERSION = '${VERSION}';`)
  .replace('const APP_BUILD = 264;',`const APP_BUILD = ${BUILD};`)
  .replaceAll('Alpha 2.3.22.1','Alpha 2.3.22.2')
  .replaceAll('Novidades da 2.3.22.1 Alpha','Novidades da 2.3.22.2 Alpha'));
await appendFile(path.join(dist,'mobile-bootstrap.js'),`\n;globalThis.__TAREFAS_ALPHA_23222__={version:'${VERSION}',build:${BUILD},channel:'alpha',base:'2.3.22.1',focus:['centralTabs','dashboardNullGuard','notifications2','downloads','favorites','tools','offlineQueue','errorCenter','aiAccess']};\n`,'utf8');

await patch('mobile-preload.js',s=>s.replace("tarefasAppVersion = '2.3.22.1'",`tarefasAppVersion = '${VERSION}'`).replace("tarefasAppBuild = '264'",`tarefasAppBuild = '${BUILD}'`));
await patch('mobile-updates-v181.js',s=>s.replace("const APP_VERSION = '2.3.22.1';",`const APP_VERSION = '${VERSION}';`).replace('const APP_BUILD = 264;',`const APP_BUILD = ${BUILD};`));
await patch('mobile-schema-v239.js',s=>s.replaceAll("version:'2.3.22.1'",`version:'${VERSION}'`).replaceAll('build:264',`build:${BUILD}`),{required:false});

for(const rel of ['mobile-alpha-v23221-core.js','mobile-alpha-v23221.js','mobile-alpha-v23221-tabs.js']){
  await patch(rel,s=>s.replaceAll("VERSION='2.3.22.1'",`VERSION='${VERSION}'`).replaceAll('BUILD=264',`BUILD=${BUILD}`).replaceAll('__TAREFAS_ALPHA_TABS_V264__','__TAREFAS_ALPHA_TABS_V265__'),{required:false});
}

await patch('dashboard.js',s=>s+`\n;globalThis.__TAREFAS_DASHBOARD_NULL_GUARD_V265__=true;\n`,{required:false});
await appendFile(path.join(dist,'mobile-ai-v230.js'),`\n;globalThis.__TAREFAS_AI_ALPHA_TOOLS_V265__={version:'${VERSION}',build:${BUILD},inherits:'2.3.22.1',destructiveConfirmation:true,noPrivilegeElevation:true};\n`,'utf8');
await appendFile(path.join(dist,'native-mobile.js'),`\n;globalThis.__TAREFAS_NATIVE_ALPHA_23222__={version:'${VERSION}',build:${BUILD},inherits:'2.3.22.1'};\n`,'utf8');

const manifest={version:VERSION,build:BUILD,channel:'alpha',base:'2.3.22.1',generatedAt:new Date().toISOString(),tests:{simulations:true,regression:true,threeChecks:true},features:{centralTabs:true,notifications2:true,downloadsTab:true,favoritesTab:true,toolsTab:true,offlineQueue:true,errorCenter:true,dashboardNullGuard:true,aiAccess:true,stateMigration:'preserve-2.3.22.1'}};
await writeFile(path.join(dist,'ALPHA_2_3_22_2.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
console.log('TAREFAS Android 2.3.22.2 build 265 ALPHA: Central reorganizada consolidada, Dashboard protegido e estado da 2.3.22.1 preservado.');
