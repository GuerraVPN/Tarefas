import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dir=path.resolve(process.argv[2]||'dist'),read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.7.5 verify: '+m)};
const patchFile=path.join(root,'patches','TAREFAS-2.4.6.8.tpatch');
await access(patchFile);
for(const f of ['mobile-login-v17.js','mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js','dashboard.html','dashboard.js','ALPHA_2_4_7_5.json'])await access(path.join(dir,f));
const patchData=JSON.parse(await readFile(patchFile,'utf8'));
must(patchData.id==='2.4.6.8'&&patchData.baseVersion==='2.4.6','tpatch 2.4.6.8 inválido');
must(String(patchData.payloadSha256||'').toLowerCase()==='9bf9f10ca640f313500b6936918debeb45a6c094efb4aeef759bf6c2cfdbe607','SHA-256 do 2.4.6.8 inválido');
must(!JSON.stringify(patchData).includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'2.4.6.7 detectado no tpatch');
const b=await read('mobile-bootstrap.js'),login=await read('mobile-login-v17.js'),d=await read('dashboard.js'),h=await read('dashboard.html'),m=JSON.parse(await read('ALPHA_2_4_7_5.json'));
must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'2.4.6.8 ausente');
must(!b.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'2.4.6.7 incorporado');
must(b.includes("const APP_VERSION = '2.4.7.5';")&&b.includes('const APP_BUILD = 287;'),'versão/build incorretos');
must(login.includes("dashboard.html?app=2.4.7.5"),'login não usa nova entrada');
must(b.includes("dashboard.html?app=2.4.7.5"),'hotbar não usa nova entrada');
must(!h.includes('mobile-dashboard-v184.js')&&!h.includes('mobile-dashboard-v185.js'),'dashboard ainda carrega módulo mobile legado');
must(!d.includes('kNextService')&&!d.includes('Próximo Serviço')&&!d.includes('Próximo serviço'),'dashboard.js contém lógica do Próximo Serviço');
for(const name of await readdir(dir)){if(!name.endsWith('.html'))continue;const x=await read(name);must(!x.includes('mobile-dashboard-v184.js')&&!x.includes('mobile-dashboard-v185.js'),name+' ainda referencia módulo legado do Dashboard');}
must(m.version==='2.4.7.5'&&m.build===287&&m.channel==='alpha'&&m.base==='2.4.6'&&m.basedOn==='2.4.7.4'&&m.incorporatedPatch==='2.4.6.8','manifesto incorreto');
must(m.features?.dashboardPathRebuilt===true&&m.features?.legacyDashboardModuleRemoved===true&&m.features?.cacheBustedDashboardEntry===true,'flags da reestruturação ausentes');
console.log('VERIFY 2.4.7.5 ALPHA OK: caminho do Dashboard reestruturado; nenhum HTML carrega v184/v185; somente patch 2.4.6.8.');
