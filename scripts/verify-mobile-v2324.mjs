import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('2.3.24 verify: '+msg)};

await access(path.join(dir,'mobile-patch-manager-v2324.js'));
const [pm,bootstrap,nav,tabs,runtime,preload,updates]=await Promise.all([
  read('mobile-patch-manager-v2324.js'),
  read('mobile-bootstrap.js'),
  read('mobile-alpha-v23223-fix.js'),
  read('mobile-alpha-v23221-tabs.js'),
  read('mobile-alpha-v23221.js'),
  read('mobile-preload.js'),
  read('mobile-updates-v181.js')
]);

must(pm.includes("const APP_VERSION='2.3.24',APP_BUILD=271,APP_CHANNEL='beta'"),'Patch Manager com versão/build/canal incorretos');
must(pm.includes("const FORMAT='tarefas-tpatch-v1'"),'formato .tpatch v1 ausente');
must(pm.includes('GITHUB_CONTENTS_PREFIX'),'consulta anti-cache via GitHub Contents ausente');
must(pm.includes('replaceOlderSameBase'),'substituição cumulativa ausente');
must(pm.includes('Histórico de patches'),'histórico de patches ausente');
must(pm.includes('checkPatchNotifications'),'notificação de patches ausente');
must(pm.includes('markPatchSeen'),'proteção contra notificação pós-instalação ausente');
must(pm.includes('installVersionObserver'),'versão efetiva global ausente');
must(pm.includes('installThemeGuard'),'proteção de tema ausente');
must(pm.includes('crypto.subtle.digest'),'SHA-256 ausente');
must(pm.includes('indexedDB.open'),'IndexedDB ausente');

must(bootstrap.includes("const APP_VERSION = '2.3.24';"),'APP_VERSION não é 2.3.24');
must(bootstrap.includes('const APP_BUILD = 271;'),'APP_BUILD não é 271');
must(bootstrap.includes('__TAREFAS_BETA_2324__'),'marcador Beta 2.3.24 ausente');
must(bootstrap.includes('__TAREFAS_PATCH_SYSTEM_V271__'),'marcador patch system V271 ausente');
must(bootstrap.includes("channel:'beta'"),'bootstrap não está no canal beta');
must(bootstrap.includes('2.3.24 Beta'),'rótulo visual Beta ausente');

must(nav.includes("VERSION='2.3.24',BUILD=271"),'navegação ainda aponta para versão anterior');
must(nav.includes('__TAREFAS_BETA_NAV_V271__'),'marcador de navegação Beta ausente');
must(tabs.includes("VERSION='2.3.24',BUILD=271"),'abas ainda apontam para versão anterior');
must(tabs.includes('__TAREFAS_BETA_TABS_V271__'),'marcador de abas Beta ausente');
must(runtime.includes("VERSION='2.3.24',BUILD=271"),'runtime ainda aponta para versão anterior');
must(preload.includes("tarefasAppVersion = '2.3.24'"),'preload ainda mostra versão antiga');
must(preload.includes("tarefasAppBuild = '271'"),'preload ainda mostra build antiga');
must(updates.includes("const APP_VERSION = '2.3.24';"),'atualizador ainda mostra versão antiga');
must(updates.includes('const APP_BUILD = 271;'),'atualizador ainda mostra build antiga');
must(updates.includes("const APP_CHANNEL = 'beta';"),'atualizador não está no canal Beta');

const html=(await readdir(dir)).filter(x=>/\.html$/i.test(x));
must(html.length>0,'nenhum HTML gerado');
for(const name of html){
  const source=await read(name);
  must(source.includes('mobile-patch-manager-v2324.js'),name+' não carrega o Patch Manager 2.3.24');
  must(!source.includes('mobile-patch-manager-v23231.js'),name+' ainda carrega o Patch Manager antigo');
}

const manifest=JSON.parse(await read('BETA_2_3_24.json'));
must(manifest.version==='2.3.24'&&manifest.build===271&&manifest.channel==='beta','manifesto Beta inválido');
must(Array.isArray(manifest.consolidates)&&manifest.consolidates.includes('2.3.23.6'),'patches anteriores não registrados na consolidação');
must(manifest.features?.cumulativePatches===true&&manifest.features?.cacheSafeCatalog===true,'recursos consolidados ausentes');
must(manifest.features?.globalEffectiveVersion===true&&manifest.features?.patchNotifications===true,'versão global/notificações ausentes');

console.log('VERIFY 2.3.24 BETA OK: build 271 + patches 2.3.23.2–2.3.23.6 consolidados.');
