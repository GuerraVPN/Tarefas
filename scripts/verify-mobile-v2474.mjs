import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(), dir=path.resolve(process.argv[2]||'dist');
const read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.7.4 verify: '+m)};
const patchFile=path.join(root,'patches','TAREFAS-2.4.6.8.tpatch');

await access(patchFile);
for(const f of ['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js','mobile-dashboard-v184.js','ALPHA_2_4_7_3.json']) await access(path.join(dir,f));

const patchData=JSON.parse(await readFile(patchFile,'utf8'));
must(patchData.id==='2.4.6.8'&&patchData.baseVersion==='2.4.6','tpatch 2.4.6.8 inválido');
must(String(patchData.payloadSha256||'').toLowerCase()==='9bf9f10ca640f313500b6936918debeb45a6c094efb4aeef759bf6c2cfdbe607','SHA-256 declarado do 2.4.6.8 não confere com o artefato oficial');
must(!JSON.stringify(patchData).includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'2.4.6.7 detectado no tpatch');

const [b,pm,u,r,d,m]=await Promise.all(['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js','mobile-dashboard-v184.js','ALPHA_2_4_7_3.json'].map(read));

must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'patch 2.4.6.8 ausente no dist');
must(!b.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'patch 2.4.6.7 detectado no dist');
must(b.includes("const APP_VERSION = '2.4.7.4';")&&b.includes('const APP_BUILD = 286;'),'versão/build do bootstrap incorretos');
must(pm.includes("APP_VERSION='2.4.7.4',APP_BUILD=286,APP_CHANNEL='alpha'"),'Patch Manager alpha incorreto');
must(u.includes("const APP_VERSION = '2.4.7.4';")&&u.includes('const APP_BUILD = 286;')&&(u.includes("const APP_CHANNEL = 'alpha';")||u.includes("const APP_CHANNEL='alpha';")),'updates incorreto');
must(d.includes('kNextServiceCard')===false,'dashboard v184 ainda contém referência ao cartão Próximo Serviço');
must(d.includes('tm-next-service-kpi')===false,'dashboard v184 ainda contém classe do cartão Próximo Serviço');
for(const html of ['dashboard.html','index.html','pessoal.html']){try{const h=await readFile(path.join(dir,html),'utf8');must(h.includes('mobile-dashboard-v184.js?v=2.4.7.4-b286'),html+' sem cache-bust do dashboard')}catch(e){if(e.code!=='ENOENT')throw e}}
must(d185.includes('kNextServiceCard')===false&&d185.includes('tm-next-service-kpi')===false,'dashboard v185 neutralizador inválido');

const man=JSON.parse(m);
must(man.version==='2.4.7.4'&&man.build===286&&man.channel==='alpha'&&man.base==='2.4.6'&&man.basedOn==='2.4.7.2'&&man.incorporatedPatch==='2.4.6.8','manifesto incorreto');
must(man.features?.only2468===true&&man.features?.scalesPatch2467===false&&man.features?.nextServiceDashboardCardRemoved===true,'flags de build incorretas');

console.log('VERIFY 2.4.7.4 ALPHA OK: somente patch 2.4.6.8 + cartão Próximo Serviço removido.');
