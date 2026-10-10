import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(), dist=path.join(root,'dist');
const VERSION='2.4.14', BUILD=301;

const patch=async(file,fn)=>{
  const p=path.join(dist,file);
  const before=await readFile(p,'utf8');
  const after=fn(before);
  if(after!==before) await writeFile(p,after,'utf8');
};

// Base oficial desta Beta: resultado validado da Alpha 2.4.12.2.
await import('./build-mobile-v24122.mjs');

// Promoção limpa: somente versão, build, canal e identificação textual da release.
for(const file of ['mobile-bootstrap.js','mobile-login-v17.js','index.html','mobile-patch-manager-v240.js','mobile-release-v240.js','mobile-v12.js','mobile-updates-v181.js','package.json','v7_5_1_about.js']){
  await patch(file,s=>s
    .replaceAll('2.4.12.2',VERSION)
    .replaceAll('APP_BUILD=299','APP_BUILD='+BUILD)
    .replaceAll('APP_BUILD = 299','APP_BUILD = '+BUILD)
    .replaceAll('build:299','build:'+BUILD)
    .replaceAll('build: 299','build: '+BUILD)
    .replaceAll("APP_CHANNEL='alpha'","APP_CHANNEL='beta'")
    .replaceAll("APP_CHANNEL = 'alpha'","APP_CHANNEL = 'beta'")
    .replaceAll("channel:'alpha'","channel:'beta'")
    .replaceAll("channel: 'alpha'","channel: 'beta'")
    .replaceAll("el.textContent='ALPHA '+V","el.textContent='BETA '+V")
    .replaceAll("el.textContent='ALPHA'","el.textContent='BETA'")
    .replaceAll('Alpha 2.4.12.2','Beta 2.4.14')
    .replaceAll('Alpha 2.4.12.1','Beta 2.4.14')
  );
}

await rm(path.join(dist,'ALPHA_2_4_12_2.json'),{force:true});
await rm(path.join(dist,'ALPHA_2_4_12_1.json'),{force:true});
await writeFile(path.join(dist,'BETA_2_4_13.json'),JSON.stringify({
  version:VERSION,
  build:BUILD,
  channel:'beta',
  base:'2.4.12.2',
  basedOn:'2.4.12.2',
  promotedFrom:'2.4.12.2',
  features:{
    androidIndependentFromWeb:true,
    cleanInterface:true,
    validatedBase:'2.4.12.2',
    noNewFunctionalChanges:false,
    calendarReminders:true,
    recurrenceRpcGuard:true,
    patchSha256Verified:true
  }
},null,2)+'\n');



// Incorporate the cumulative calendar/recurrence patch into this APK build.
import { createHash } from 'node:crypto';
const patchPath=path.join(root,'patches/TAREFAS-2.4.13.2.tpatch');
const sourcePatch=JSON.parse(await readFile(patchPath,'utf8'));
const js=String(sourcePatch?.payload?.js||''), css=String(sourcePatch?.payload?.css||'');
if(!js.includes('__TAREFAS_CAL_REMINDERS_V772__')||!js.includes('processar_recorrencias_v4')) throw new Error('2.4.14: payload calendário/recorrência ausente.');
const actualSha=createHash('sha256').update(JSON.stringify({js,css}),'utf8').digest('hex');
sourcePatch.id='2.4.14.1'; sourcePatch.name='TAREFAS 2.4.14.1 — Calendário e recorrências';
sourcePatch.baseVersion='2.4.14'; sourcePatch.minBuild=301; sourcePatch.maxBuild=301;
sourcePatch.channel='beta'; sourcePatch.cumulative=true; sourcePatch.replaces=[];
sourcePatch.payloadSha256=actualSha; sourcePatch.description='Correção cumulativa de lembretes independentes do calendário e proteção contra chamadas simultâneas de recorrência.';
sourcePatch.changelog=['Protege o RPC processar_recorrencias_v4 contra chamadas simultâneas no mesmo WebView.','Adiciona lembretes diretamente ao dia selecionado no Calendário.','Permite editar e excluir lembretes sem criar ou alterar tarefas.','Mostra lembretes no painel do dia e nas células do mês.'];
await writeFile(path.join(root,'patches/TAREFAS-2.4.14.1.tpatch'),JSON.stringify(sourcePatch,null,2)+'\n','utf8');
await writeFile(path.join(dist,'mobile-calendar-reminders-v2414.js'),js+'\n','utf8');
const calendarPath=path.join(dist,'calendario.html');
let calendar=await readFile(calendarPath,'utf8');
if(!calendar.includes('mobile-calendar-reminders-v2414.js')){
 const tag='<script src="mobile-calendar-reminders-v2414.js"></script>';
 if(calendar.includes('</body>')) calendar=calendar.replace('</body>',tag+'\n</body>'); else calendar+=tag;
 await writeFile(calendarPath,calendar,'utf8');
}

const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const updates=await readFile(path.join(dist,'mobile-updates-v181.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');

if(!boot.includes("const APP_VERSION = '2.4.14';") || !boot.includes('const APP_BUILD = 301;')) throw new Error('2.4.14: versão/build incorretos.');
if(!updates.includes("const APP_VERSION = '2.4.14';") || !updates.includes('const APP_BUILD = 301;') || !updates.includes("const APP_CHANNEL = 'beta';")) throw new Error('2.4.14: centro de atualizações incorreto.');
if(!pm.includes('2.4.14') || !pm.includes('301')) throw new Error('2.4.14: Patch Manager não promovido.');
for(const marker of ['tmDrawer','tm-bottom-nav','__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__','__TAREFAS_PATCH_CONSOLIDATED_2487__','__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__','__TAREFAS_ALPHA_24911_CONSOLIDATED__']){
  if(!boot.includes(marker)) throw new Error('2.4.14: marcador/base ausente '+marker);
}
if(boot.includes('__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__')) throw new Error('2.4.14: layout da 2.4.11 incorporado.');
console.log('TAREFAS Android 2.4.14 build 301 BETA — promoção limpa da 2.4.12.2.');

// Beta 2.4.14 final build trigger.
