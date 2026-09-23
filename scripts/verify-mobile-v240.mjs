import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('2.4.0 verify: '+msg)};

for(const f of [
  'mobile-patch-manager-v240.js','mobile-release-v240.js',
  'v7_9_1_web.js','v7_9_1_site.js','reiniciar.html','desligado.html'
])await access(path.join(dir,f));

const [pm,rel,bootstrap,nav,tabs,runtime,preload,updates,ai,webVersion,webCore,siteCore,loader]=await Promise.all([
  read('mobile-patch-manager-v240.js'),
  read('mobile-release-v240.js'),
  read('mobile-bootstrap.js'),
  read('mobile-alpha-v23223-fix.js'),
  read('mobile-alpha-v23221-tabs.js'),
  read('mobile-alpha-v23221.js'),
  read('mobile-preload.js'),
  read('mobile-updates-v181.js'),
  read('mobile-ai-v230.js'),
  read('v7_5_1_version.js'),
  read('v7_9_1_web.js'),
  read('v7_9_1_site.js'),
  read('v6_2_mobile.js')
]);

must(pm.includes("const APP_VERSION='2.4.0',APP_BUILD=274,APP_CHANNEL='official'"),'Patch Manager não está em 2.4.0 oficial');
must(pm.includes('__TAREFAS_PATCH_MANAGER_V274__'),'marcador Patch Manager V274 ausente');
must(pm.includes('preferences:channelPreferences'),'preferências de canal ausentes');
must(pm.includes('crypto.subtle.digest'),'SHA-256 ausente no Patch Manager');
must(pm.includes('replaceOlderSameBase'),'patch cumulativo ausente');

must(rel.includes("__TAREFAS_RELEASE_240__"),'runtime oficial 2.4.0 ausente');
must(rel.includes("version:'2.4.0',build:274,channel:'official'"),'runtime oficial com versão/build/canal incorretos');
must(rel.includes("WEB_VERSION='7.9.1'"),'runtime não aponta para Web 7.9.1');
must(rel.includes("relockMode:'cold-start-only'"),'biometria cold-start-only ausente');
must(!rel.includes('function markBackground(){'),'relock ao voltar do segundo plano reapareceu');
must(rel.includes('installQueueRecovery'),'recuperação de fila offline ausente');
must(rel.includes('discoverDestinations'),'Favoritos/subabas ausentes');
must(rel.includes('tmTaskStatusFilter'),'filtro de tarefas ausente');
must(rel.includes('repairRogueCssText'),'correção de CSS vazado da .2 ausente');
must(rel.includes('Abas para diagnóstico'),'recurso da .3 ausente');
must(rel.includes('tarefas_diag_tabs_23253_'),'preferência de diagnóstico da .3 não foi preservada');
must(rel.includes('__TAREFAS_RELEASE_240_DIAGNOSTIC_TABS__'),'marcador diagnóstico oficial ausente');

must(bootstrap.includes("const APP_VERSION = '2.4.0';"),'APP_VERSION não é 2.4.0');
must(bootstrap.includes('const APP_BUILD = 274;'),'APP_BUILD não é 274');
must(bootstrap.includes('__TAREFAS_RELEASE_240__'),'bootstrap oficial ausente');
must(bootstrap.includes("channel:'official'"),'bootstrap não está oficial');
must(bootstrap.includes("webVersion:'7.9.1'"),'bootstrap não registra Web 7.9.1');
must(nav.includes("VERSION='2.4.0',BUILD=274"),'navegação aponta para versão anterior');
must(nav.includes('__TAREFAS_RELEASE_NAV_V274__'),'marcador navegação V274 ausente');
must(tabs.includes("VERSION='2.4.0',BUILD=274"),'abas apontam para versão anterior');
must(tabs.includes('__TAREFAS_RELEASE_TABS_V274__'),'marcador abas V274 ausente');
must(runtime.includes("VERSION='2.4.0',BUILD=274"),'runtime principal aponta para versão anterior');
must(preload.includes("tarefasAppVersion = '2.4.0'"),'preload mostra versão anterior');
must(preload.includes("tarefasAppBuild = '274'"),'preload mostra build anterior');
must(updates.includes("const APP_VERSION = '2.4.0';"),'atualizador mostra versão anterior');
must(updates.includes('const APP_BUILD = 274;'),'atualizador mostra build anterior');
must(updates.includes("const APP_CHANNEL = 'official';"),'atualizador não está no canal oficial');
must(ai.includes('OFICIAL 2.4.0'),'IA não mostra versão oficial');

must(webVersion.includes("const VERSION='7.9.1'"),'base Web global não é 7.9.1');
must(webCore.includes("const VERSION='7.9.1'"),'núcleo Web 7.9.1 ausente');
must(siteCore.includes("const VERSION='7.9.1'"),'Painel SITE 7.9.1 ausente');
must(loader.includes('v7_9_1_web.js?v=7.9.1'),'loader não carrega núcleo Web 7.9.1');
must(loader.includes('v7_9_1_site.js?v=7.9.1'),'loader não carrega Painel SITE 7.9.1');
must(siteCore.includes("index.html?site_action=exit_users"),'EXIT USERS novo ausente');
must(siteCore.includes("reiniciar.html?site_action=reiniciar"),'reinício dedicado ausente');
must(siteCore.includes("desligado.html?site_action=desligar"),'desligamento dedicado ausente');

const html=(await readdir(dir)).filter(x=>/\.html$/i.test(x));
must(html.length>0,'nenhum HTML gerado');
for(const name of html){
  const source=await read(name);
  const special=['reiniciar.html','desligado.html'].includes(name.toLowerCase());
  if(!special){
    must(source.includes('mobile-patch-manager-v240.js'),name+' não carrega Patch Manager 2.4');
    must(source.includes('mobile-release-v240.js'),name+' não carrega runtime oficial 2.4');
  }
  must(!source.includes('mobile-patch-manager-v2325.js'),name+' ainda carrega Patch Manager 2.3.25');
  must(!source.includes('mobile-beta-v2325.js'),name+' ainda carrega runtime Beta 2.3.25');
}

const manifest=JSON.parse(await read('RELEASE_2_4_0.json'));
must(manifest.version==='2.4.0'&&manifest.build===274&&manifest.channel==='official','manifesto oficial inválido');
must(manifest.webVersion==='7.9.1','manifesto não usa Web 7.9.1');
must(manifest.consolidates.includes('2.3.25.3'),'patch .3 não consolidado');
must(manifest.features?.diagnosticTabs===true,'Abas para diagnóstico não registradas');
must(manifest.features?.biometricColdStartOnly===true,'biometria consolidada não registrada');
must(manifest.features?.sitePanel791===true,'Painel SITE 7.9.1 não registrado');

console.log('VERIFY 2.4.0 OFICIAL OK: build 274 + Web 7.9.1 + patches até 2.3.25.3 consolidados.');
