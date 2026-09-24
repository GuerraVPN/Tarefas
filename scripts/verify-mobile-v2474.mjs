import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(), dir=path.resolve(process.argv[2]||'dist');
const read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.7.4 verify: '+m)};
const patchFile=path.join(root,'patches','TAREFAS-2.4.6.8.tpatch');

await access(patchFile);
for(const f of ['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js','mobile-dashboard-v184.js','ALPHA_2_4_7_4.json']) await access(path.join(dir,f));

const patchData=JSON.parse(await readFile(patchFile,'utf8'));
must(patchData.id==='2.4.6.8'&&patchData.baseVersion==='2.4.6','tpatch 2.4.6.8 inválido');
must(String(patchData.payloadSha256||'').toLowerCase()==='9bf9f10ca640f313500b6936918debeb45a6c094efb4aeef759bf6c2cfdbe607','SHA-256 declarado do 2.4.6.8 não confere com o artefato oficial');
must(!JSON.stringify(patchData).includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'2.4.6.7 detectado no tpatch');

const [b,pm,u,r,d,d185,m]=await Promise.all(['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js','mobile-dashboard-v184.js','mobile-dashboard-v185.js','ALPHA_2_4_7_4.json'].map(read));

must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'patch 2.4.6.8 ausente no dist');
must(!b.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'patch 2.4.6.7 detectado no dist');
must(b.includes("const APP_VERSION = '2.4.7.4';")&&b.includes('const APP_BUILD = 286;'),'versão/build do bootstrap incorretos');
must(pm.includes("APP_VERSION='2.4.7.4',APP_BUILD=286,APP_CHANNEL='alpha'"),'Patch Manager alpha incorreto');
must(u.includes("const APP_VERSION = '2.4.7.4';")&&u.includes('const APP_BUILD = 286;')&&(u.includes("const APP_CHANNEL = 'alpha';")||u.includes("const APP_CHANNEL='alpha';")),'updates incorreto');
must(d.includes('function ensureCard')===false,'dashboard v184 ainda contém o criador original do cartão');
must(!d.includes("card=document.createElement('article')"),'dashboard v184 ainda contém criação dinâmica do cartão');
must(!d.includes('Próximo serviço previsto'),'dashboard v184 ainda contém lógica de previsão do cartão');
must(d.includes('removeNextServiceCard'),'dashboard v184 não contém o neutralizador defensivo');
for(const html of ['dashboard.html','index.html','pessoal.html']){try{const h=await readFile(path.join(dir,html),'utf8');must(h.includes('mobile-dashboard-v185.js?v=2.4.7.4-b286'),html+' sem referência ao dashboard v185');must(!h.includes('mobile-dashboard-v184.js'),html+' ainda aponta para dashboard v184')}catch(e){if(e.code!=='ENOENT')throw e}}
must(d185.includes('function ensureCard')===false&&d185.includes("card=document.createElement('article')")===false&&d185.includes('Próximo serviço previsto')===false,'dashboard v185 ainda contém lógica do cartão');must(d185.includes('removeNextServiceCard'),'dashboard v185 neutralizador inválido');

const man=JSON.parse(m);
must(man.version==='2.4.7.4'&&man.build===286&&man.channel==='alpha'&&man.base==='2.4.6'&&man.basedOn==='2.4.7.3'&&man.incorporatedPatch==='2.4.6.8','manifesto incorreto');
must(man.features?.only2468===true&&man.features?.scalesPatch2467===false&&man.features?.nextServiceDashboardCardRemoved===true,'flags de build incorretas');

console.log('VERIFY 2.4.7.4 ALPHA OK: somente patch 2.4.6.8 + cartão Próximo Serviço removido.');
