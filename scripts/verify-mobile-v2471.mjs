import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(), dir=path.resolve(process.argv[2]||'dist');
const read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.7.1 verify: '+m)};
const patchFile=path.join(root,'patches','TAREFAS-2.4.6.8.tpatch');
await access(patchFile);
for(const f of ['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js','ALPHA_2_4_7_1.json']) await access(path.join(dir,f));

const patchData=JSON.parse(await readFile(patchFile,'utf8'));
must(patchData.id==='2.4.6.8'&&patchData.baseVersion==='2.4.6','tpatch 2.4.6.8 inválido');
const patchSha=String(patchData.payloadSha256||'').toLowerCase();
must(patchSha==='9bf9f10ca640f313500b6936918debeb45a6c094efb4aeef759bf6c2cfdbe607','SHA-256 declarado do 2.4.6.8 não confere com o artefato oficial');
must(!JSON.stringify(patchData).includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'2.4.6.7 detectado no tpatch');

const [b,pm,u,r,m]=await Promise.all(['mobile-bootstrap.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','mobile-release-v240.js','ALPHA_2_4_7_1.json'].map(read));
must(b.includes('__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__'),'patch 2.4.6.8 ausente no dist');
must(!b.includes('__TAREFAS_ALPHA_2467_ESCALAS_2433__'),'patch 2.4.6.7 detectado no dist');
must(b.includes("const APP_VERSION = '2.4.7.1';")&&b.includes('const APP_BUILD = 283;'),'versão/build incorretos');
must(pm.includes("APP_VERSION='2.4.7.1',APP_BUILD=283,APP_CHANNEL='alpha'"),'Patch Manager alpha incorreto');
must(u.includes("const APP_VERSION = '2.4.7.1';")&&u.includes('const APP_BUILD = 283;')&&(u.includes("const APP_CHANNEL = 'alpha';")||u.includes("const APP_CHANNEL='alpha';")),'updates incorreto');
const man=JSON.parse(m);
must(man.version==='2.4.7.1'&&man.build===283&&man.channel==='alpha'&&man.incorporatedPatch==='2.4.6.8'&&man.features?.only2468===true&&man.features?.scalesPatch2467===false,'manifesto incorreto');
console.log('VERIFY 2.4.7.1 ALPHA OK: tpatch oficial 2.4.6.8 validado; 2.4.6.7 não incorporado.');
