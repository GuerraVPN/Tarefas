import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
const root=process.cwd(),dist=path.join(root,'dist');
const VERSION='2.4.15.2',BUILD=303;
async function patch(file,fn){const target=path.join(dist,file);const before=await readFile(target,'utf8');const after=fn(before);if(after!==before)await writeFile(target,after,'utf8');}
await import('./build-mobile-v2415.mjs');
const files=['mobile-bootstrap.js','mobile-login-v17.js','index.html','mobile-patch-manager-v240.js','mobile-release-v240.js','mobile-v12.js','mobile-updates-v181.js','v7_5_1_about.js','about.html'];
for(const file of files)await patch(file,s=>s.replace(/2\.4\.15(?!\.\d)/g,VERSION).replace(/(\bAPP_BUILD\s*=\s*)302\b/g,'$1'+BUILD).replace(/(\bBUILD\s*=\s*)302\b/g,'$1'+BUILD).replace(/(\bbuild\s*:\s*)302\b/g,'$1'+BUILD).replace(/(\bversionCode\s*[:=]\s*)302\b/g,'$1'+BUILD).replaceAll('BETA_2_4_15','BETA_2_4_15_2'));
await patch('package.json',s=>{const pkg=JSON.parse(s);pkg.version=VERSION;pkg.description='TAREFAS Android Beta '+VERSION+' build '+BUILD+' — sincronização da versão instalada e correções de notificações.';return JSON.stringify(pkg,null,2)+'\n';});
const calendar=await readFile(path.join(dist,'calendario.html'),'utf8');
if(!calendar.includes('mobile-calendar-reminders-v2415.js'))throw new Error('2.4.15.2: script do Calendário ausente.');
const reminders=await readFile(path.join(dist,'mobile-calendar-reminders-v2415.js'),'utf8');
if(!reminders.includes('__TAREFAS_CAL_REMINDERS_V772__')||!reminders.includes('processar_recorrencias_v4'))throw new Error('2.4.15.2: proteção de Calendário/recorrências ausente.');
let nativeSource=await readFile(path.join(root,'app','native-mobile-entry.js'),'utf8');
if(!nativeSource.includes("const APP_VERSION = '2.4.15.2';")||!nativeSource.includes('App.getInfo()')||!nativeSource.includes('v2_4_1_1_sync_app_version'))throw new Error('2.4.15.2: fonte nativa sem sincronização real.');
const nativeNeedle="const target=await Filesystem.getUri({directory:Directory.Documents,path:targetPath});await FileTransfer.downloadFile({url:href,path:target.uri,progress:false});let installer={opened:false,error:null};if(options?.autoInstall!==false)installer=await openApkInstaller(target.uri);"
const nativeProgress="const target=await Filesystem.getUri({directory:Directory.Documents,path:targetPath});\n let progressHandle=null,lastBytes=0,lastTotal=0,lastAt=Date.now();\n const emitProgress=detail=>window.dispatchEvent(new CustomEvent('tarefas:update-download-progress',{detail:{url:href,filename:name,...detail}}));\n emitProgress({state:'starting',bytes:0,contentLength:0,lengthComputable:false,percent:0,speedBps:0});\n try{progressHandle=await FileTransfer.addListener('progress',progress=>{if(progress?.type!=='download'||String(progress?.url||'')!==href)return;const now=Date.now(),bytes=Math.max(0,Number(progress?.bytes||0)),contentLength=Math.max(0,Number(progress?.contentLength||0)),elapsed=Math.max((now-lastAt)/1000,.001),speedBps=Math.max(0,(bytes-lastBytes)/elapsed),lengthComputable=progress?.lengthComputable!==false&&contentLength>0,percent=lengthComputable?Math.max(0,Math.min(100,bytes/contentLength*100)):0;lastAt=now;lastBytes=bytes;if(contentLength>0)lastTotal=contentLength;emitProgress({state:'downloading',bytes,contentLength,lengthComputable,percent,speedBps})})}catch(err){console.warn('[TAREFAS UPDATE] Progresso nativo indisponível:',err)}\n try{await FileTransfer.downloadFile({url:href,path:target.uri,progress:true});emitProgress({state:'downloaded',bytes:lastTotal||lastBytes,contentLength:lastTotal||lastBytes,lengthComputable:(lastTotal||lastBytes)>0,percent:100,speedBps:0})}finally{if(progressHandle)await progressHandle.remove().catch(()=>{})}\n let installer={opened:false,error:null};if(options?.autoInstall!==false)installer=await openApkInstaller(target.uri);";
if(!nativeSource.includes(nativeNeedle))throw new Error('2.4.15.2: trecho de progresso FileTransfer alterado; bundle cancelado.');
nativeSource=nativeSource.replace(nativeNeedle,nativeProgress);
const temp=path.join(root,'scripts','.native-mobile-entry-v24152.mjs'),out=path.join(dist,'native-mobile.js');
await writeFile(temp,nativeSource,'utf8');
try{await build({entryPoints:[temp],outfile:out,bundle:true,minify:true,format:'iife',platform:'browser',target:['es2020'],charset:'utf8'});}finally{await rm(temp,{force:true});}
await writeFile(out,"\n;globalThis.__TAREFAS_ANDROID_VERSION_SYNC__={version:'"+VERSION+"',build:"+BUILD+"};\n",{flag:'a'});
const old=JSON.parse(await readFile(path.join(dist,'BETA_2_4_15.json'),'utf8'));
await rm(path.join(dist,'BETA_2_4_15.json'),{force:true});
old.version=VERSION;old.build=BUILD;old.channel='beta';old.base='2.4.15';old.basedOn='2.4.15';old.promotedFrom='2.4.15';
old.features={...(old.features||{}),installedVersionFromCapacitor:true,versionSyncAfterStartup:true,versionSyncAfterPushRegistration:true,versionSyncOnForeground:true,unknownVersionsNotAutoOutdated:true,menuEscalaServicoRemoved:true,calendarReminders:true,recurrenceRpcGuard:true,patchSha256Verified:true};
await writeFile(path.join(dist,'BETA_2_4_15_2.json'),JSON.stringify(old,null,2)+'\n','utf8');
const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8'),updates=await readFile(path.join(dist,'mobile-updates-v181.js'),'utf8'),pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8'),nativeBundle=await readFile(out,'utf8');
if(!boot.includes("const APP_VERSION = '2.4.15.2';")||!boot.includes('const APP_BUILD = 303;'))throw new Error('2.4.15.2: versão/build bootstrap incorretos.');
if(!updates.includes("const APP_VERSION = '2.4.15.2';")||!updates.includes('const APP_BUILD = 303;')||!updates.includes("const APP_CHANNEL = 'beta';"))throw new Error('2.4.15.2: central de atualizações incorreta.');
if(!pm.includes('2.4.15.2')||!pm.includes('303'))throw new Error('2.4.15.2: Patch Manager não promovido.');
if(!nativeBundle.includes('__TAREFAS_ANDROID_VERSION_SYNC__')||!nativeBundle.includes('v2_4_1_1_sync_app_version')||!nativeBundle.includes('2.4.15.2')||!nativeBundle.includes('getInfo'))throw new Error('2.4.15.2: bundle nativo sem sync.');
for(const marker of ['tmDrawer','tm-bottom-nav','__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__','__TAREFAS_PATCH_CONSOLIDATED_2487__','__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__','__TAREFAS_ALPHA_24911_CONSOLIDATED__'])if(!boot.includes(marker))throw new Error('2.4.15.2: marcador ausente '+marker);
if(boot.includes('__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__'))throw new Error('2.4.15.2: layout da 2.4.11 presente.');
console.log('TAREFAS Android '+VERSION+' build '+BUILD+' Beta — versão real pelo Capacitor; sincronização de push/Supabase; Calendário e recorrências preservados.');
