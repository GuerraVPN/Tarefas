import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('2.3.25 verify: '+msg)};

await access(path.join(dir,'mobile-patch-manager-v2325.js'));
await access(path.join(dir,'mobile-beta-v2325.js'));
const [pm,beta,bootstrap,nav,tabs,runtime,preload,updates,ai]=await Promise.all([
  read('mobile-patch-manager-v2325.js'),
  read('mobile-beta-v2325.js'),
  read('mobile-bootstrap.js'),
  read('mobile-alpha-v23223-fix.js'),
  read('mobile-alpha-v23221-tabs.js'),
  read('mobile-alpha-v23221.js'),
  read('mobile-preload.js'),
  read('mobile-updates-v181.js'),
  read('mobile-ai-v230.js')
]);

must(pm.includes("const APP_VERSION='2.3.25',APP_BUILD=272,APP_CHANNEL='beta'"),'Patch Manager com versão/build/canal incorretos');
must(pm.includes('__TAREFAS_PATCH_MANAGER_V272__'),'marcador Patch Manager V272 ausente');
must(pm.includes('preferences:channelPreferences'),'preferência Alpha não exposta ao auto-check');
must(pm.includes('__TAREFAS_ALPHA_AUTO_PATCH_CHECK_V272__'),'auto-check Alpha ausente');
must(pm.includes("prefs?.alpha!==true"),'auto-check não está restrito ao Alpha ativo');
must(pm.includes('Verificar patches oficiais'),'botão manual de patches ausente');
must(pm.includes('crypto.subtle.digest'),'SHA-256 ausente');
must(pm.includes('replaceOlderSameBase'),'substituição cumulativa ausente');

must(beta.includes("__TAREFAS_BETA_2325_CONSOLIDATED__"),'consolidação 2.3.25 ausente');
must(beta.includes("version:'2.3.25',build:272"),'script consolidado com versão/build incorretos');
must(beta.includes("relockMode:'cold-start-only'"),'biometria cold-start-only ausente');
must(!beta.includes('function markBackground(){'),'relock ao segundo plano ainda presente');
must(beta.includes("page==='configuracoes.html'"),'proteção DOM de Configurações ausente');
must(beta.includes('discoverDestinations'),'Favoritos por subabas ausente');
must(beta.includes('tmTaskStatusFilter'),'filtro avançado de tarefas ausente');
must(beta.includes('alphaAutoEnabled'),'gate Alpha da sincronização de patch ausente');
must(beta.includes("__alphaDisabled:true"),'estado Alpha desativado ausente');
must(beta.includes('TarefasPageLifecycle'),'token de ciclo da tela ausente');
must(beta.includes('installQueueRecovery'),'recuperação de fila offline ausente');

must(bootstrap.includes("const APP_VERSION = '2.3.25';"),'APP_VERSION não é 2.3.25');
must(bootstrap.includes('const APP_BUILD = 272;'),'APP_BUILD não é 272');
must(bootstrap.includes('__TAREFAS_BETA_2325__'),'marcador Beta 2.3.25 ausente');
must(bootstrap.includes('__TAREFAS_PATCH_SYSTEM_V272__'),'marcador patch system V272 ausente');
must(nav.includes("VERSION='2.3.25',BUILD=272"),'navegação aponta para versão anterior');
must(nav.includes('__TAREFAS_BETA_NAV_V272__'),'marcador navegação V272 ausente');
must(tabs.includes("VERSION='2.3.25',BUILD=272"),'abas apontam para versão anterior');
must(tabs.includes('__TAREFAS_BETA_TABS_V272__'),'marcador abas V272 ausente');
must(runtime.includes("VERSION='2.3.25',BUILD=272"),'runtime aponta para versão anterior');
must(preload.includes("tarefasAppVersion = '2.3.25'"),'preload ainda mostra versão antiga');
must(preload.includes("tarefasAppBuild = '272'"),'preload ainda mostra build antiga');
must(updates.includes("const APP_VERSION = '2.3.25';"),'atualizador ainda mostra versão antiga');
must(updates.includes('const APP_BUILD = 272;'),'atualizador ainda mostra build antiga');
must(ai.includes('BETA 2.3.25'),'Assistente IA ainda mostra Beta antiga');

const html=(await readdir(dir)).filter(x=>/\.html$/i.test(x));
must(html.length>0,'nenhum HTML gerado');
for(const name of html){
  const source=await read(name);
  must(source.includes('mobile-patch-manager-v2325.js'),name+' não carrega Patch Manager 2.3.25');
  must(source.includes('mobile-beta-v2325.js'),name+' não carrega recursos consolidados 2.3.25');
  must(!source.includes('mobile-patch-manager-v2324.js'),name+' ainda carrega Patch Manager 2.3.24');
}

const manifest=JSON.parse(await read('BETA_2_3_25.json'));
must(manifest.version==='2.3.25'&&manifest.build===272&&manifest.channel==='beta','manifesto Beta inválido');
must(Array.isArray(manifest.consolidates)&&manifest.consolidates.includes('2.3.24.9'),'patch .9 não consolidado');
must(manifest.features?.alphaAutoPatchCheckOnlyWhenEnabled===true,'auto-check Alpha não registrado');
must(manifest.features?.biometricColdStartOnly===true,'biometria nova não registrada');
must(manifest.features?.configDomGuard===true&&manifest.features?.pageLifecycleToken===true,'hardening de pré-release ausente');

console.log('VERIFY 2.3.25 BETA OK: build 272 + patches 2.3.24.1–2.3.24.9 consolidados.');
