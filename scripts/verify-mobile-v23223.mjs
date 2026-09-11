import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`2.3.22.3 verify: ${msg}`)};

await access(path.join(dir,'mobile-alpha-v23223-fix.js'));
const [fix,bootstrap,tabs,runtime,preload,updates]=await Promise.all([
  read('mobile-alpha-v23223-fix.js'),read('mobile-bootstrap.js'),read('mobile-alpha-v23221-tabs.js'),read('mobile-alpha-v23221.js'),read('mobile-preload.js'),read('mobile-updates-v181.js')
]);
must(fix.includes("VERSION='2.3.22.3',BUILD=266"),'patch de navegação com versão/build incorretos');
must(fix.includes('tm-alpha-main-tabs'),'abas principais não encontradas');
must(fix.includes("document.getElementById('a23221-central-tabs')?.remove()"),'abas antigas da Central não são removidas');
for(const tab of ['notificacoes','mensagens','downloads','favoritos','ferramentas'])must(fix.includes(`'${tab}'`),`seção ${tab} ausente`);
must(bootstrap.includes("const APP_VERSION = '2.3.22.3';"),'APP_VERSION não é 2.3.22.3');
must(bootstrap.includes('const APP_BUILD = 266;'),'APP_BUILD não é 266');
must(bootstrap.includes("['Downloads','central.html?tab=downloads'"),'Downloads não está no menu principal');
must(bootstrap.includes("['Favoritos','central.html?tab=favoritos'"),'Favoritos não está no menu principal');
must(bootstrap.includes("['Ferramentas','central.html?tab=ferramentas'"),'Ferramentas não está no menu principal');
must(bootstrap.includes("['Mensagens','central.html?tab=mensagens'"),'Mensagens não está no menu principal');
must(tabs.includes("VERSION='2.3.22.3',BUILD=266"),'runtime das abas ainda aponta para versão antiga');
must(runtime.includes("VERSION='2.3.22.3',BUILD=266"),'runtime Alpha ainda aponta para versão antiga');
must(preload.includes("tarefasAppVersion = '2.3.22.3'"),'preload ainda mostra versão antiga');
must(updates.includes("const APP_VERSION = '2.3.22.3';"),'módulo de atualização ainda mostra versão antiga');
must(updates.includes("const APP_CHANNEL = 'alpha';"),'canal de atualização não é alpha');
const manifest=JSON.parse(await read('ALPHA_2_3_22_3.json'));
must(manifest.version==='2.3.22.3'&&manifest.build===266&&manifest.channel==='alpha','manifesto Alpha inválido');
console.log('VERIFY 2.3.22.3 OK: navegação separada, conteúdo por seção e identificação Alpha conferidos.');
