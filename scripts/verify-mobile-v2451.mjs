import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('2.4.5.1 verify: '+msg)};
for(const f of ['mobile-launcher-icon-v241.js','mobile-patch-manager-v240.js','mobile-release-v240.js','mobile-bootstrap.js','mobile-dashboard-v184.js','mobile-preload.js','mobile-updates-v181.js','ALPHA_2_4_5_1.json'])await access(path.join(dir,f));
const [launcher,pm,release,bootstrap,dashboard,preload,updates]=await Promise.all([
 read('mobile-launcher-icon-v241.js'),read('mobile-patch-manager-v240.js'),read('mobile-release-v240.js'),read('mobile-bootstrap.js'),read('mobile-dashboard-v184.js'),read('mobile-preload.js'),read('mobile-updates-v181.js')
]);
must(launcher.includes('__TAREFAS_LAUNCHER_ICON_241__')&&launcher.includes('pinProfileShortcut'),'launcher ausente');
must(pm.includes("const APP_VERSION='2.4.5.1',APP_BUILD=281,APP_CHANNEL='alpha'")&&pm.includes('__TAREFAS_PATCH_MANAGER_V281__'),'Patch Manager Alpha incorreto');
must(pm.includes('sha256Bytes')&&pm.includes('fetchOfficialBytes')&&pm.includes('crypto.subtle.digest'),'SHA por bytes ausente');
must(bootstrap.includes("const APP_VERSION = '2.4.5.1';")&&bootstrap.includes('const APP_BUILD = 281'),'bootstrap versão/build incorretos');
must(bootstrap.includes('__TAREFAS_ALPHA_2451_BOOT__')&&bootstrap.includes("basedOn:'2.4.5'"),'bootstrap Alpha/base ausente');
must(bootstrap.includes("['Escalas','#escalas','Motorista, patrulheiro e permanência']"),'Escalas ausente');
must(!bootstrap.includes("['Pessoal / Escalas','pessoal.html'")&&!bootstrap.includes("['Missões','missao.html'"),'menus antigos presentes');
must(dashboard.includes('__TAREFAS_NEXT_SERVICE_REMOVED_V281__'),'marcador remoção Próximo serviço ausente');
must(dashboard.includes('function ensureCard(){return null;}'),'card Próximo serviço ainda pode ser criado');
must(preload.includes("tarefasAppVersion = '2.4.5.1'")&&preload.includes("tarefasAppBuild = '281'"),'preload incorreto');
must(updates.includes("const APP_VERSION = '2.4.5.1';")&&updates.includes('const APP_BUILD = 281')&&updates.includes("const APP_CHANNEL = 'alpha';"),'updates Alpha incorreto');
must(release.includes('__TAREFAS_ALPHA_2451__')&&release.includes("basedOn:'2.4.5'"),'runtime Alpha ausente');
const manifest=JSON.parse(await read('ALPHA_2_4_5_1.json'));
must(manifest.version==='2.4.5.1'&&manifest.build===281&&manifest.channel==='alpha'&&manifest.base==='2.4.5','manifesto Alpha inválido');
must(manifest.features.nextServiceCardRemoved===true&&manifest.features.historyDescriptionsFixed===true,'correções Alpha ausentes');
const html=(await readdir(dir)).filter(x=>/\.html$/i.test(x));
for(const name of html)if(name==='dashboard.html'){const s=await read(name);must(!s.includes('Próximo serviço'),'dashboard ainda contém Próximo serviço');}
console.log('VERIFY 2.4.5.1 ALPHA OK: build 281 baseada na 2.4.5/280 + histórico corrigido + Próximo serviço removido.');
