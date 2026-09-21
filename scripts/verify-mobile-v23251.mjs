import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('2.3.25.1 verify: '+msg)};

for(const f of ['mobile-patch-manager-v23251.js','mobile-alpha-v23251.js','v7_9_1_web.js','v7_9_1_site.js','reiniciar.html','desligado.html'])await access(path.join(dir,f));

const [pm,alpha,bootstrap,nav,tabs,runtime,preload,updates,ai,webVersion,webCore,siteCore,loader]=await Promise.all([
  read('mobile-patch-manager-v23251.js'),
  read('mobile-alpha-v23251.js'),
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

must(pm.includes("const APP_VERSION='2.3.25.1',APP_BUILD=273,APP_CHANNEL='alpha'"),'Patch Manager com versão/build/canal incorretos');
must(pm.includes('__TAREFAS_PATCH_MANAGER_V273__'),'marcador Patch Manager V273 ausente');
must(pm.includes('__TAREFAS_ALPHA_AUTO_PATCH_CHECK_V273__'),'auto-check Alpha V273 ausente');
must(pm.includes('preferences:channelPreferences'),'preferência Alpha ausente');
must(pm.includes('crypto.subtle.digest'),'SHA-256 ausente');

must(alpha.includes("const PATCH_VERSION='2.3.25.1'"),'runtime Alpha não é 2.3.25.1');
must(alpha.includes('const BUILD=273'),'runtime Alpha não é build 273');
must(alpha.includes("||'7.9.1'"),'fallback de base Web não é 7.9.1');
must(alpha.includes('__TAREFAS_ALPHA_23251_WEB_BASE__'),'marcador Web Base ausente');
must(alpha.includes("webVersion:'7.9.1'"),'runtime não registra Web 7.9.1');
must(alpha.includes("relockMode:'cold-start-only'"),'biometria consolidada ausente');

must(bootstrap.includes("const APP_VERSION = '2.3.25.1';"),'APP_VERSION incorreto');
must(bootstrap.includes('const APP_BUILD = 273;'),'APP_BUILD incorreto');
must(bootstrap.includes('__TAREFAS_ALPHA_23251__'),'marcador Alpha ausente');
must(bootstrap.includes("channel:'alpha'"),'bootstrap não está no canal Alpha');
must(bootstrap.includes("webVersion:'7.9.1'"),'bootstrap não registra base Web 7.9.1');

must(nav.includes("VERSION='2.3.25.1',BUILD=273"),'navegação aponta para versão anterior');
must(nav.includes('__TAREFAS_ALPHA_NAV_V273__'),'marcador navegação Alpha V273 ausente');
must(tabs.includes("VERSION='2.3.25.1',BUILD=273"),'abas apontam para versão anterior');
must(tabs.includes('__TAREFAS_ALPHA_TABS_V273__'),'marcador abas Alpha V273 ausente');
must(runtime.includes("VERSION='2.3.25.1',BUILD=273"),'runtime principal aponta para versão anterior');
must(preload.includes("tarefasAppVersion = '2.3.25.1'"),'preload ainda mostra versão anterior');
must(preload.includes("tarefasAppBuild = '273'"),'preload ainda mostra build anterior');
must(updates.includes("const APP_VERSION = '2.3.25.1';"),'atualizador ainda mostra versão anterior');
must(updates.includes('const APP_BUILD = 273;'),'atualizador ainda mostra build anterior');
must(updates.includes("const APP_CHANNEL = 'alpha';"),'atualizador não está em Alpha');
must(ai.includes('ALPHA 2.3.25.1'),'IA ainda mostra Beta anterior');

must(webVersion.includes("const VERSION='7.9.1'"),'base Web global não é 7.9.1');
must(webCore.includes("const VERSION='7.9.1'"),'núcleo Web 7.9.1 ausente');
must(siteCore.includes("const VERSION='7.9.1'"),'Painel SITE 7.9.1 ausente');
must(loader.includes('v7_9_1_web.js?v=7.9.1'),'loader não carrega núcleo Web 7.9.1');
must(loader.includes('v7_9_1_site.js?v=7.9.1'),'loader não carrega Painel SITE 7.9.1');

const html=(await readdir(dir)).filter(x=>/\.html$/i.test(x));
must(html.length>0,'nenhum HTML gerado');
for(const name of html){
  const source=await read(name);
  must(source.includes('mobile-patch-manager-v23251.js'),name+' não carrega Patch Manager Alpha');
  must(source.includes('mobile-alpha-v23251.js'),name+' não carrega runtime Alpha');
  must(!source.includes('mobile-beta-v2325.js'),name+' ainda carrega runtime Beta 2.3.25');
}

const manifest=JSON.parse(await read('ALPHA_2_3_25_1.json'));
must(manifest.version==='2.3.25.1'&&manifest.build===273&&manifest.channel==='alpha','manifesto Alpha inválido');
must(manifest.base==='2.3.25','base Android não é Beta 2.3.25');
must(manifest.webVersion==='7.9.1','Base Web do manifesto não é 7.9.1');
must(manifest.features?.web791===true&&manifest.features?.sitePanel791===true,'recursos Web 7.9.1 não registrados');

console.log('VERIFY 2.3.25.1 ALPHA OK: build 273 + base Android 2.3.25 + Web 7.9.1.');
