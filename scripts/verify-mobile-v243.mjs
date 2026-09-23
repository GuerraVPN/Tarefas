import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('2.4.3 verify: '+msg)};
for(const f of ['mobile-launcher-icon-v241.js','mobile-patch-manager-v240.js','mobile-release-v240.js','mobile-bootstrap.js','v7_9_1_web.js','v7_9_1_site.js'])await access(path.join(dir,f));
const [launcher,pm,release,bootstrap,nav,tabs,runtime,preload,updates]=await Promise.all([
 read('mobile-launcher-icon-v241.js'),read('mobile-patch-manager-v240.js'),read('mobile-release-v240.js'),read('mobile-bootstrap.js'),
 read('mobile-alpha-v23223-fix.js'),read('mobile-alpha-v23221-tabs.js'),read('mobile-alpha-v23221.js'),read('mobile-preload.js'),read('mobile-updates-v181.js')
]);
must(launcher.includes('__TAREFAS_LAUNCHER_ICON_241__')&&launcher.includes('pinProfileShortcut'),'launcher nativo ausente');
must(pm.includes("const APP_VERSION='2.4.3',APP_BUILD=278,APP_CHANNEL='beta'")&&pm.includes('__TAREFAS_PATCH_MANAGER_V278__'),'Patch Manager 2.4.3/278 ausente');
must(pm.includes('sha256Bytes')&&pm.includes('fetchOfficialBytes')&&pm.includes('crypto.subtle.digest'),'validação SHA por bytes ausente');
must(pm.includes('v1_8_get_beta_updates')&&pm.includes('v2_3_21_alpha_context'),'preferências Beta/Alpha ausentes');
must(bootstrap.includes("const APP_VERSION = '2.4.3';")&&bootstrap.includes('const APP_BUILD = 278;'),'bootstrap versão/build incorretos');
must(bootstrap.includes('__TAREFAS_BETA_243_BOOT__'),'marker bootstrap ausente');
must(bootstrap.includes("['Escalas','#escalas','Motorista, patrulheiro e permanência']"),'menu Escalas não consolidado');
must(!bootstrap.includes("['Pessoal / Escalas','pessoal.html'")&&!bootstrap.includes("['Missões','missao.html'"),'menu antigo ainda presente');
must(bootstrap.includes('function openScales()')&&bootstrap.includes('tmScales243'),'tela de Escalas ausente');
must(bootstrap.includes('1T_BM9KY0NLwVhlifetQ6W6AdetujQjx--zOZHa27eQs')&&bootstrap.includes('1_LlfIHx4EuSHkC9BOR2VorvXoaiMyLa028wU6C0dQLs')&&bootstrap.includes('13eEei_JdGjAdVo371BGfPS59QdYySe9lJ47DLjWb_x0'),'links das 3 escalas ausentes');
must(nav.includes("VERSION='2.4.3',BUILD=278")||nav.includes('__TAREFAS_BETA_NAV_V278__'),'navegação não consolidada');
must(tabs.includes("VERSION='2.4.3',BUILD=278")||tabs.includes('__TAREFAS_BETA_TABS_V278__'),'abas não consolidadas');
must(release.includes('__TAREFAS_BETA_243__'),'runtime Beta 2.4.3 ausente');
must(preload.includes("tarefasAppVersion = '2.4.3'")&&preload.includes("tarefasAppBuild = '278'"),'preload incorreto');
must(updates.includes("const APP_VERSION = '2.4.3';")&&updates.includes('const APP_BUILD = 278;')&&updates.includes("const APP_CHANNEL = 'beta';"),'updates incorreto');
const html=(await readdir(dir)).filter(x=>/\.html$/i.test(x));must(html.length>0,'nenhum HTML');
for(const name of html){const s=await read(name);if(!['reiniciar.html','desligado.html'].includes(name.toLowerCase()))must(s.includes('mobile-launcher-icon-v241.js'),name+' sem launcher bridge')}
const manifest=JSON.parse(await read('BETA_2_4_3.json'));
must(manifest.version==='2.4.3'&&manifest.build===278&&manifest.channel==='beta','manifesto inválido');
must(manifest.webVersion==='7.9.1','Web 7.9.1 ausente');
must(manifest.futureDelivery.beta==='tpatch'&&manifest.futureDelivery.alpha==='tpatch','futuro não está em tpatch');
must(manifest.features.drawerScalesOnly===true&&manifest.features.officialPatchSha256Bytes===true,'recursos consolidados ausentes');
console.log('VERIFY 2.4.3 BETA OK: build 278 + patches consolidados + Escalas + SHA por bytes.');
