import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('2.4.1 verify: '+msg)};

for(const f of [
  'mobile-launcher-icon-v241.js',
  'mobile-patch-manager-v240.js',
  'mobile-release-v240.js',
  'v7_9_1_web.js',
  'v7_9_1_site.js'
])await access(path.join(dir,f));

const [launcher,pm,release,bootstrap,nav,tabs,runtime,preload,updates,ai]=await Promise.all([
  read('mobile-launcher-icon-v241.js'),
  read('mobile-patch-manager-v240.js'),
  read('mobile-release-v240.js'),
  read('mobile-bootstrap.js'),
  read('mobile-alpha-v23223-fix.js'),
  read('mobile-alpha-v23221-tabs.js'),
  read('mobile-alpha-v23221.js'),
  read('mobile-preload.js'),
  read('mobile-updates-v181.js'),
  read('mobile-ai-v230.js')
]);

must(launcher.includes('__TAREFAS_LAUNCHER_ICON_241__'),'seletor de ícones ausente');
must(launcher.includes('pinProfileShortcut'),'modo Meu perfil ausente');
must(launcher.includes('TAREFAS Azul')&&launcher.includes('Militar')&&launcher.includes('Preto & Ouro'),'presets incompletos');

must(pm.includes("const APP_VERSION='2.4.1',APP_BUILD=276,APP_CHANNEL='beta'"),'Patch Manager não usa 2.4.1 build 276 beta');
must(pm.includes('__TAREFAS_PATCH_MANAGER_V276__'),'marcador Patch Manager V276 ausente');
must(pm.includes("v1_8_get_beta_updates"),'canal de preferência Beta APK não foi preservado');
must(pm.includes("v2_3_21_alpha_context"),'canal de preferência Alpha APK não foi preservado');
must(pm.includes("if(ch==='beta')return prefs.beta===true"),'filtro de patch Beta não segue preferência Beta');
must(pm.includes("return prefs.alpha===true"),'filtro de patch Alpha não segue preferência Alpha');

must(bootstrap.includes("const APP_VERSION = '2.4.1';"),'APP_VERSION incorreta');
must(bootstrap.includes('const APP_BUILD = 276;'),'APP_BUILD incorreta');
must(bootstrap.includes("channel:'beta'"),'bootstrap não está Beta');
must(bootstrap.includes('__TAREFAS_BETA_241_BOOT__'),'marcador de boot Beta ausente');

must(nav.includes("VERSION='2.4.1',BUILD=276"),'navegação aponta para versão anterior');
must(nav.includes('__TAREFAS_BETA_NAV_V276__'),'marcador navegação V276 ausente');
must(tabs.includes("VERSION='2.4.1',BUILD=276"),'abas apontam para versão anterior');
must(tabs.includes('__TAREFAS_BETA_TABS_V276__'),'marcador abas V276 ausente');
must(runtime.includes("VERSION='2.4.1',BUILD=276"),'runtime principal aponta para versão anterior');
must(preload.includes("tarefasAppVersion = '2.4.1'"),'preload mostra versão anterior');
must(preload.includes("tarefasAppBuild = '276'"),'preload mostra build anterior');
must(updates.includes("const APP_VERSION = '2.4.1';"),'atualizador mostra versão anterior');
must(updates.includes('const APP_BUILD = 276;'),'atualizador mostra build anterior');
must(updates.includes("const APP_CHANNEL = 'beta';"),'atualizador não está Beta');
must(ai.includes('BETA 2.4.1')||ai.includes("version:'2.4.1'"),'IA não recebeu versão Beta');

must(release.includes("const PATCH_VERSION='2.4.1';"),'runtime consolidado não usa 2.4.1');
must(release.includes("const BASE_VERSION='2.4.1';"),'runtime consolidado não usa base 2.4.1');
must(release.includes('const BUILD=276;'),'runtime consolidado não usa build 276');
must(release.includes('__TAREFAS_BETA_241__'),'marcador Beta final ausente');
must(release.includes("WEB_VERSION='7.9.1'"),'Web 7.9.1 não preservada');

const html=(await readdir(dir)).filter(x=>/\.html$/i.test(x));
must(html.length>0,'nenhum HTML gerado');
for(const name of html){
  const source=await read(name);
  const special=['reiniciar.html','desligado.html'].includes(name.toLowerCase());
  if(!special)must(source.includes('mobile-launcher-icon-v241.js'),name+' não carrega seletor de ícones');
}

const manifest=JSON.parse(await read('BETA_2_4_1.json'));
must(manifest.version==='2.4.1'&&manifest.build===276&&manifest.channel==='beta','manifesto Beta inválido');
must(manifest.webVersion==='7.9.1','base Web não é 7.9.1');
must(manifest.features?.launcherNativeBridge===true,'ponte nativa do launcher não registrada');
must(manifest.features?.profileAvatarAsHomeIcon===true,'ícone de perfil não registrado');
must(manifest.futureDelivery?.beta==='tpatch'&&manifest.futureDelivery?.alpha==='tpatch','política futura de Betas/Alphas não está em .tpatch');
must(manifest.features?.patchBetaChannelUsesApkPreference===true,'canal Beta de patch não registrado');
must(manifest.features?.patchAlphaChannelUsesApkPreference===true,'canal Alpha de patch não registrado');

console.log('VERIFY 2.4.1 BETA OK: build 276 + seletor nativo de ícones + canais Beta/Alpha de patches alinhados ao APK.');
