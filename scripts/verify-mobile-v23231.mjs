import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('2.3.23.1 verify: '+msg)};

await access(path.join(dir,'mobile-patch-manager-v23231.js'));
const [pm,bootstrap,nav,tabs,runtime,preload,updates]=await Promise.all([
  read('mobile-patch-manager-v23231.js'),
  read('mobile-bootstrap.js'),
  read('mobile-alpha-v23223-fix.js'),
  read('mobile-alpha-v23221-tabs.js'),
  read('mobile-alpha-v23221.js'),
  read('mobile-preload.js'),
  read('mobile-updates-v181.js')
]);

must(pm.includes("const APP_VERSION='2.3.23.1',APP_BUILD=270"),'Patch Manager com versão/build incorretos');
must(pm.includes("const FORMAT='tarefas-tpatch-v1'"),'formato .tpatch v1 ausente');
must(pm.includes('crypto.subtle.digest'),'validação SHA-256 ausente');
must(pm.includes('indexedDB.open'),'armazenamento persistente de patches ausente');
must(pm.includes('Importar .tpatch'),'importação manual ausente');
must(pm.includes('Verificar patches oficiais'),'catálogo oficial ausente');
must(pm.includes('Reverter / desativar'),'rollback/desativação ausente');
must(pm.includes("https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/patches/catalog-v1.json"),'URL do catálogo oficial incorreta');

must(bootstrap.includes("const APP_VERSION = '2.3.23.1';"),'APP_VERSION não é 2.3.23.1');
must(bootstrap.includes('const APP_BUILD = 270;'),'APP_BUILD não é 270');
must(bootstrap.includes('__TAREFAS_ALPHA_23231__'),'marcador da Alpha ausente');
must(bootstrap.includes('__TAREFAS_PATCH_SYSTEM_V270__'),'marcador do sistema de patches ausente');
must(bootstrap.includes("channel:'alpha'"),'bootstrap não está no canal Alpha');
must(bootstrap.includes('2.3.23.1 Alpha'),'rótulo visual da Alpha ausente');

must(nav.includes("VERSION='2.3.23.1',BUILD=270"),'navegação ainda aponta para a Beta');
must(nav.includes('__TAREFAS_ALPHA_NAV_V270__'),'marcador de navegação Alpha ausente');
must(nav.includes('TarefasAlpha23231'),'API de navegação Alpha ausente');
must(tabs.includes("VERSION='2.3.23.1',BUILD=270"),'abas ainda apontam para a Beta');
must(tabs.includes('__TAREFAS_ALPHA_TABS_V270__'),'marcador das abas Alpha ausente');
must(runtime.includes("VERSION='2.3.23.1',BUILD=270"),'runtime ainda aponta para a Beta');
must(preload.includes("tarefasAppVersion = '2.3.23.1'"),'preload ainda mostra versão antiga');
must(preload.includes("tarefasAppBuild = '270'"),'preload ainda mostra build antiga');
must(updates.includes("const APP_VERSION = '2.3.23.1';"),'módulo de atualização ainda mostra versão antiga');
must(updates.includes('const APP_BUILD = 270;'),'módulo de atualização ainda mostra build antiga');
must(updates.includes("const APP_CHANNEL = 'alpha';"),'canal de atualização não é Alpha');

const html=(await readdir(dir)).filter(x=>/\.html$/i.test(x));
must(html.length>0,'nenhum HTML gerado');
for(const name of html){
  const source=await read(name);
  must(source.includes('mobile-patch-manager-v23231.js'),name+' não carrega o Patch Manager');
}

const manifest=JSON.parse(await read('ALPHA_2_3_23_1.json'));
must(manifest.version==='2.3.23.1'&&manifest.build===270&&manifest.channel==='alpha','manifesto Alpha inválido');
must(manifest.base==='2.3.23','base da Alpha não é a Beta 2.3.23');
must(manifest.features?.patchManager===true&&manifest.features?.tpatchV1===true,'recursos de patch não registrados');

console.log('VERIFY 2.3.23.1 ALPHA OK: base 2.3.23 Beta + Patch Manager .tpatch v1 / build 270.');
