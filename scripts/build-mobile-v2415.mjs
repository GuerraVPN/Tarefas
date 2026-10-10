import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=process.cwd(), dist=path.join(root,'dist');
const VERSION='2.4.15', BUILD=302;
const patch=async(file,fn)=>{
  const p=path.join(dist,file);
  const before=await readFile(p,'utf8');
  const after=fn(before);
  if(after!==before)await writeFile(p,after,'utf8');
};

// Reutiliza a cadeia Android validada da Beta 2.4.14 e preserva Calendário/recorrências.
await import('./build-mobile-v2414.mjs');

for(const file of ['mobile-bootstrap.js','mobile-login-v17.js','index.html','mobile-patch-manager-v240.js','mobile-release-v240.js','mobile-v12.js','mobile-updates-v181.js','package.json','v7_5_1_about.js']){
  await patch(file,s=>s
    .replaceAll('2.4.14',VERSION)
    .replaceAll('APP_BUILD=301','APP_BUILD='+BUILD)
    .replaceAll('APP_BUILD = 301','APP_BUILD = '+BUILD)
    .replaceAll('build:301','build:'+BUILD)
    .replaceAll('build: 301','build: '+BUILD)
    .replaceAll('Beta 2.4.14','Beta '+VERSION)
    .replaceAll('BETA_2_4_14','BETA_2_4_15')
  );
}

// Renomeia a camada de lembretes para esta versão e conserva o comportamento do Calendário.
const reminders=await readFile(path.join(dist,'mobile-calendar-reminders-v2414.js'),'utf8');
await writeFile(path.join(dist,'mobile-calendar-reminders-v2415.js'),reminders,'utf8');
await rm(path.join(dist,'mobile-calendar-reminders-v2414.js'),{force:true});
await patch('calendario.html',s=>s.replaceAll('mobile-calendar-reminders-v2414.js','mobile-calendar-reminders-v2415.js'));

// Remove somente a entrada redundante no drawer Android, mesmo que seja recriada por outra camada.
// A remoção atua no menu visível e não apaga dados, tabelas nem rotas do banco.
const guard=String.raw`
;(()=>{'use strict';
const MARK='__TAREFAS_2415_HIDE_ESCALA_SERVICO__';
if(globalThis[MARK])return;
globalThis[MARK]=true;
function removeEscalaServico(){
  const drawer=document.getElementById('tmDrawer');
  if(!drawer)return;
  drawer.querySelectorAll('.tm-drawer-item,[data-href],a').forEach(item=>{
    const heading=item.querySelector('strong');
    const title=String(heading?heading.textContent:item.textContent||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('pt-BR');
    if(title==='escala de serviço')item.remove();
  });
}
const observer=new MutationObserver(removeEscalaServico);
observer.observe(document.documentElement,{childList:true,subtree:true});
removeEscalaServico();
document.addEventListener('click',event=>{
  if(event.target&&event.target.closest&&event.target.closest('[data-menu],#tmMenuButton,.tm-icon'))setTimeout(removeEscalaServico,0);
},true);
})();`;
await patch('mobile-bootstrap.js',s=>{
  if(s.includes('__TAREFAS_2415_HIDE_ESCALA_SERVICO__'))return s;
  return s+'\n'+guard+'\n';
});

// Promove o patch de calendário para a nova base/build com SHA-256 recalculado sobre {js, css}.
const sourcePatch=JSON.parse(await readFile(path.join(root,'patches/TAREFAS-2.4.14.1.tpatch'),'utf8'));
const js=String(sourcePatch?.payload?.js||''), css=String(sourcePatch?.payload?.css||'');
const actualSha=createHash('sha256').update(JSON.stringify({js,css}),'utf8').digest('hex');
sourcePatch.id='2.4.15.1';
sourcePatch.name='TAREFAS 2.4.15.1 — Calendário e recorrências';
sourcePatch.baseVersion=VERSION; sourcePatch.minBuild=BUILD; sourcePatch.maxBuild=BUILD;
sourcePatch.channel='beta'; sourcePatch.cumulative=true; sourcePatch.replaces=[];
sourcePatch.payloadSha256=actualSha;
sourcePatch.description='Preserva os lembretes independentes do calendário e a proteção contra chamadas simultâneas de recorrência na base 2.4.15.';
sourcePatch.publishedAt=new Date().toISOString();
await writeFile(path.join(root,'patches/TAREFAS-2.4.15.1.tpatch'),JSON.stringify(sourcePatch,null,2)+'\n','utf8');

// Atualiza o manifesto da Beta sem promover a versão Web nem introduzir o cartão Próximo Serviço.
const oldManifest=JSON.parse(await readFile(path.join(dist,'BETA_2_4_14.json'),'utf8'));
await rm(path.join(dist,'BETA_2_4_14.json'),{force:true});
oldManifest.version=VERSION; oldManifest.build=BUILD; oldManifest.channel='beta';
oldManifest.base='2.4.14'; oldManifest.basedOn='2.4.14'; oldManifest.promotedFrom='2.4.14';
oldManifest.features={...(oldManifest.features||{}),menuEscalaServicoRemoved:true,calendarReminders:true,recurrenceRpcGuard:true,patchSha256Verified:true};
await writeFile(path.join(dist,'BETA_2_4_15.json'),JSON.stringify(oldManifest,null,2)+'\n','utf8');

const boot=await readFile(path.join(dist,'mobile-bootstrap.js'),'utf8');
const updates=await readFile(path.join(dist,'mobile-updates-v181.js'),'utf8');
const pm=await readFile(path.join(dist,'mobile-patch-manager-v240.js'),'utf8');
const calendar=await readFile(path.join(dist,'calendario.html'),'utf8');
if(!boot.includes("const APP_VERSION = '2.4.15';")||!boot.includes('const APP_BUILD = 302;'))throw new Error('2.4.15: versão/build incorretos no bootstrap.');
if(!updates.includes("const APP_VERSION = '2.4.15';")||!updates.includes('const APP_BUILD = 302;')||!updates.includes("const APP_CHANNEL = 'beta';"))throw new Error('2.4.15: centro de atualizações incorreto.');
if(!pm.includes('2.4.15')||!pm.includes('302'))throw new Error('2.4.15: Patch Manager não promovido.');
if(!boot.includes('__TAREFAS_2415_HIDE_ESCALA_SERVICO__'))throw new Error('2.4.15: guarda de remoção da Escala de serviço ausente.');
if(!calendar.includes('mobile-calendar-reminders-v2415.js'))throw new Error('2.4.15: script de lembretes não ligado ao Calendário.');
if(!reminders.includes('__TAREFAS_CAL_REMINDERS_V772__')||!reminders.includes('processar_recorrencias_v4'))throw new Error('2.4.15: calendário/recorrências perdeu a base validada.');
const shaCheck=createHash('sha256').update(JSON.stringify({js:String(sourcePatch.payload?.js||''),css:String(sourcePatch.payload?.css||'')}),'utf8').digest('hex');
if(shaCheck!==sourcePatch.payloadSha256)throw new Error('2.4.15: SHA-256 do patch de calendário não confere.');
for(const marker of ['tmDrawer','tm-bottom-nav','__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__','__TAREFAS_PATCH_CONSOLIDATED_2487__','__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__','__TAREFAS_ALPHA_24911_CONSOLIDATED__'])if(!boot.includes(marker))throw new Error('2.4.15: marcador/base ausente '+marker);
if(boot.includes('__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__'))throw new Error('2.4.15: layout da 2.4.11 incorporado.');
console.log('TAREFAS Android 2.4.15 build 302 BETA — menu corrigido; Patch Manager, calendário e recorrências preservados.');
