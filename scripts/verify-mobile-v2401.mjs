import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('2.4.0.1 verify: '+msg)};

for(const f of [
  'mobile-launcher-icon-v2401.js',
  'mobile-patch-manager-v240.js',
  'mobile-release-v240.js',
  'v7_9_1_web.js',
  'v7_9_1_site.js'
])await access(path.join(dir,f));

const [launcher,pm,release,bootstrap,nav,tabs,runtime,preload,updates,ai]=await Promise.all([
  read('mobile-launcher-icon-v2401.js'),
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

must(launcher.includes("__TAREFAS_LAUNCHER_ICON_2401__"),'runtime do seletor de ícones ausente');
must(launcher.includes("pinProfileShortcut"),'modo Meu perfil ausente');
must(launcher.includes("data-launcher-mode=\"profile\""),'opção Meu perfil não foi renderizada');
must(launcher.includes("TAREFAS Azul")&&launcher.includes("Militar")&&launcher.includes("Preto & Ouro"),'presets de ícone incompletos');

must(pm.includes("const APP_VERSION='2.4.0.1',APP_BUILD=275,APP_CHANNEL='alpha'"),'Patch Manager não está em 2.4.0.1 alpha');
must(pm.includes('__TAREFAS_PATCH_MANAGER_V275__'),'marcador V275 ausente');

must(bootstrap.includes("const APP_VERSION = '2.4.0.1';"),'APP_VERSION incorreta');
must(bootstrap.includes('const APP_BUILD = 275;'),'APP_BUILD incorreta');
must(bootstrap.includes("channel:'alpha'"),'bootstrap não está no canal alpha');
must(bootstrap.includes('__TAREFAS_ALPHA_2401_BOOT__'),'marcador de boot alpha ausente');

must(nav.includes("VERSION='2.4.0.1',BUILD=275"),'navegação aponta para versão anterior');
must(nav.includes('__TAREFAS_ALPHA_NAV_V275__'),'marcador navegação V275 ausente');
must(tabs.includes("VERSION='2.4.0.1',BUILD=275"),'abas apontam para versão anterior');
must(tabs.includes('__TAREFAS_ALPHA_TABS_V275__'),'marcador abas V275 ausente');
must(runtime.includes("VERSION='2.4.0.1',BUILD=275"),'runtime principal aponta para versão anterior');
must(preload.includes("tarefasAppVersion = '2.4.0.1'"),'preload mostra versão anterior');
must(preload.includes("tarefasAppBuild = '275'"),'preload mostra build anterior');
must(updates.includes("const APP_VERSION = '2.4.0.1';"),'atualizador mostra versão anterior');
must(updates.includes('const APP_BUILD = 275;'),'atualizador mostra build anterior');
must(updates.includes("const APP_CHANNEL = 'alpha';"),'atualizador não está alpha');
must(ai.includes('ALPHA 2.4.0.1')||ai.includes("version:'2.4.0.1'"),'IA não recebeu versão alpha');

must(release.includes("const PATCH_VERSION='2.4.0.1';"),'runtime consolidado não usa a alpha');
must(release.includes('const BUILD=275;'),'runtime consolidado não usa build 275');
must(release.includes('__TAREFAS_ALPHA_2401__'),'marcador alpha final ausente');
must(release.includes("WEB_VERSION='7.9.1'"),'Web 7.9.1 não preservada');

const html=(await readdir(dir)).filter(x=>/\.html$/i.test(x));
must(html.length>0,'nenhum HTML gerado');
for(const name of html){
  const source=await read(name);
  const special=['reiniciar.html','desligado.html'].includes(name.toLowerCase());
  if(!special)must(source.includes('mobile-launcher-icon-v2401.js'),name+' não carrega seletor de ícones');
}

const manifest=JSON.parse(await read('ALPHA_2_4_0_1.json'));
must(manifest.version==='2.4.0.1'&&manifest.build===275&&manifest.channel==='alpha','manifesto alpha inválido');
must(manifest.base==='2.4.0','base oficial incorreta');
must(manifest.webVersion==='7.9.1','base Web não é 7.9.1');
must(manifest.features?.launcherIconSelector===true,'seletor de ícones não registrado');
must(manifest.features?.profileAvatarAsHomeIcon===true,'ícone de perfil não registrado');

console.log('VERIFY 2.4.0.1 ALPHA OK: build 275 + seletor de ícones + avatar do perfil na tela inicial.');
