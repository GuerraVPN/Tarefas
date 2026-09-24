import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dir=path.resolve(process.argv[2]||'dist'),read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.8 verify: '+m)};

for(const f of [
  'mobile-login-v17.js','mobile-bootstrap.js','mobile-patch-manager-v240.js',
  'mobile-updates-v181.js','dashboard.html','dashboard.js','about.html','BETA_2_4_8.json'
])await access(path.join(dir,f));

const b=await read('mobile-bootstrap.js');
const login=await read('mobile-login-v17.js');
const pm=await read('mobile-patch-manager-v240.js');
const updates=await read('mobile-updates-v181.js');
const h=await read('dashboard.html');
const d=await read('dashboard.js');
const about=await read('about.html');
const m=JSON.parse(await read('BETA_2_4_8.json'));

must(b.includes("const APP_VERSION = '2.4.8';")&&b.includes('const APP_BUILD = 290;'),'versão/build do bootstrap incorretos');
must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'patch 2.4.6.8 ausente');
must(!b.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'patch 2.4.6.7 incorporado');
must(b.includes("dashboard.html?app=2.4.8"),'entrada do Dashboard não está cache-bustada');
must(login.includes("dashboard.html?app=2.4.8"),'login não usa a entrada do Dashboard 2.4.8');

must(pm.includes("const APP_VERSION='2.4.8',APP_BUILD=290,APP_CHANNEL='beta';"),'Patch Manager não foi atualizado para Beta 2.4.8');
must(pm.includes("const FORMAT='tarefas-tpatch-v1'"),'formato .tpatch v1 ausente');
must(pm.includes("DB_NAME='tarefas-patches-v1'"),'IndexedDB do Patch Manager ausente');
must(pm.includes('crypto.subtle.digest'),'validação SHA-256 ausente');
must(pm.includes('indexedDB.open'),'persistência do Patch Manager ausente');
must(pm.includes('Importar .tpatch')&&pm.includes('Verificar patches oficiais'),'funções principais do Patch Manager ausentes');
must(about.includes('mobile-patch-manager-v240.js'),'Patch Manager não está conectado ao About');

must(!h.includes('mobile-dashboard-v184.js')&&!h.includes('mobile-dashboard-v185.js'),'Dashboard referencia módulo legado');
must(!d.includes('kNextService')&&!d.includes('Próximo Serviço')&&!d.includes('Próximo serviço'),'dashboard.js contém lógica do cartão Próximo Serviço');

const forbidden=[
  'kNextServiceCard','kNextService','tm-next-service-kpi','v756-next-service',
  'ensureNextCard','loadDashboardService','v756NextServiceCss','data-v756-next-icon',
  'Próximo serviço</small>','Próximo Serviço</small>'
];
let hits=[];
for(const name of await readdir(dir)){
  if(!/\.(?:js|html)$/i.test(name))continue;
  const x=await read(name);
  if(name.endsWith('.html')&&!x.includes('mobile-patch-manager-v240.js')&&name==='about.html')hits.push(name+' :: Patch Manager');
  for(const token of forbidden)if(x.includes(token))hits.push(name+' :: '+token);
}
must(hits.length===0,'código aberto empacotado contém origem do cartão: '+hits.join(' | '));

const v756=await read('v7_5_6_patch.js');
must(v756.includes('loadCalendarServices')&&v756.includes('applyCalendarServices'),'correções de calendário do v7.5.6 não foram preservadas');

must(m.version==='2.4.8'&&m.build===290&&m.channel==='beta','manifesto BETA_2_4_8 incorreto');
must(m.basedOn==='2.4.7.7'&&m.incorporatedPatch==='2.4.6.8','base/patch da Beta incorretos');
must(m.features?.promotedFromValidatedAlpha2477===true&&m.features?.dashboardNextServiceSourceRemoved===true,'flags da promoção da Alpha não estão presentes');

console.log('VERIFY 2.4.8 BETA OK: base direta na Alpha 2.4.7.7; somente patch 2.4.6.8; origem do Próximo Serviço ausente; Patch Manager preservado.');
