import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dir=path.resolve(process.argv[2]||'dist'),read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.7.7 verify: '+m)};
const patchFile=path.join(root,'patches','TAREFAS-2.4.6.8.tpatch');
await access(patchFile);
for(const f of ['mobile-login-v17.js','mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js','dashboard.html','dashboard.js','ALPHA_2_4_7_7.json'])await access(path.join(dir,f));
const patchData=JSON.parse(await readFile(patchFile,'utf8'));
must(patchData.id==='2.4.6.8'&&patchData.baseVersion==='2.4.6','tpatch 2.4.6.8 inválido');
must(String(patchData.payloadSha256||'').toLowerCase()==='9bf9f10ca640f313500b6936918debeb45a6c094efb4aeef759bf6c2cfdbe607','SHA-256 do 2.4.6.8 inválido');
must(!JSON.stringify(patchData).includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'2.4.6.7 detectado no tpatch');
const b=await read('mobile-bootstrap.js'),login=await read('mobile-login-v17.js'),d=await read('dashboard.js'),h=await read('dashboard.html'),pm=await read('mobile-patch-manager-v240.js'),m=JSON.parse(await read('ALPHA_2_4_7_7.json'));
must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'2.4.6.8 ausente');
must(!b.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'2.4.6.7 incorporado');
must(b.includes("const APP_VERSION = '2.4.7.7';")&&b.includes('const APP_BUILD = 289;'),'versão/build incorretos');
must(login.includes("dashboard.html?app=2.4.7.7"),'login não usa nova entrada');
must(b.includes("dashboard.html?app=2.4.7.7"),'hotbar não usa nova entrada');
must(!h.includes('mobile-dashboard-v184.js')&&!h.includes('mobile-dashboard-v185.js'),'dashboard ainda carrega módulo mobile legado');
const forbiddenNextService=['kNextServiceCard','kNextService','tm-next-service-kpi','v756-next-service','ensureNextCard','loadDashboardService','v756NextServiceCss','data-v756-next-icon','Próximo serviço</small>','Próximo Serviço</small>'];
must(!d.includes('kNextService')&&!d.includes('Próximo Serviço')&&!d.includes('Próximo serviço'),'dashboard.js contém lógica do Próximo Serviço');
let nextHits=[];
for(const name of await readdir(dir)){
  const x=await read(name);
  if(/\.html$/i.test(name))must(!x.includes('mobile-dashboard-v184.js')&&!x.includes('mobile-dashboard-v185.js'),name+' ainda referencia módulo legado do Dashboard');
  if(!/\.(?:js|html)$/i.test(name))continue;
  for(const token of forbiddenNextService)if(x.includes(token))nextHits.push(name+' :: '+token);
}
must(nextHits.length===0,'código aberto empacotado ainda contém origem do cartão Próximo Serviço: '+nextHits.join(' | '));
const v756=await read('v7_5_6_patch.js');
must(v756.includes('loadCalendarServices')&&v756.includes('applyCalendarServices'),'correções de calendário do v7.5.6 foram removidas junto com a limpeza do Dashboard');

must(m.version==='2.4.7.7'&&m.build===289&&m.channel==='alpha'&&m.base==='2.4.6'&&m.basedOn==='2.4.7.4'&&m.incorporatedPatch==='2.4.6.8','manifesto incorreto');
must(m.features?.dashboardPathRebuilt===true&&m.features?.legacyDashboardModuleRemoved===true&&m.features?.cacheBustedDashboardEntry===true,'flags da reestruturação ausentes');
must(pm.includes("const APP_VERSION='2.4.7.7',APP_BUILD=289,APP_CHANNEL='alpha';"),'Patch Manager não foi preservado/atualizado');
must(pm.includes("const FORMAT='tarefas-tpatch-v1'"),'formato .tpatch v1 ausente');
must(pm.includes("DB_NAME='tarefas-patches-v1'"),'armazenamento persistente do Patch Manager não preservado');
must(pm.includes('crypto.subtle.digest'),'validação SHA-256 ausente');
must(pm.includes('indexedDB.open'),'IndexedDB do Patch Manager ausente');
must(pm.includes('Importar .tpatch'),'importação manual ausente');
must(pm.includes('Verificar patches oficiais'),'catálogo oficial ausente');
must((await read('about.html')).includes('mobile-patch-manager-v240.js'),'Patch Manager não foi conectado ao About');
console.log('VERIFY 2.4.7.7 ALPHA OK: caminho do Dashboard reestruturado; nenhum HTML carrega v184/v185; somente patch 2.4.6.8.');
