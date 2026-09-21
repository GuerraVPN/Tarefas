import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dir,rel),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`2.3.23 verify: ${msg}`)};

await access(path.join(dir,'mobile-alpha-v23223-fix.js'));
const [fix,bootstrap,tabs,runtime,preload,updates]=await Promise.all([
  read('mobile-alpha-v23223-fix.js'),read('mobile-bootstrap.js'),read('mobile-alpha-v23221-tabs.js'),read('mobile-alpha-v23221.js'),read('mobile-preload.js'),read('mobile-updates-v181.js')
]);
must(fix.includes("VERSION='2.3.23',BUILD=269"),'patch de navegação com versão/build incorretos');
must(fix.includes("__TAREFAS_BETA_NAV_V269__"),'marcador Beta de navegação ausente');
must(fix.includes("TAREFAS ${VERSION} Beta"),'título das abas não identifica Beta');
must(fix.includes('tm-alpha-main-tabs'),'abas principais não encontradas');
must(fix.includes('removeDrawerShortcuts'),'proteção para remover Acesso rápido ausente');
must(!fix.includes('<h3>Acesso rápido</h3>'),'bloco Acesso rápido ainda é criado pelo patch');
must(fix.includes("document.getElementById('a23221-central-tabs')?.remove()"),'abas antigas da Central não são removidas');
for(const tab of ['notificacoes','mensagens','downloads','favoritos','ferramentas'])must(fix.includes(`'${tab}'`),`seção ${tab} ausente`);
must(bootstrap.includes("const APP_VERSION = '2.3.23';"),'APP_VERSION não é 2.3.23');
must(bootstrap.includes('__TAREFAS_BETA_2323__'),'marcador global da Beta ausente');
must(bootstrap.includes("channel:'beta'"),'bootstrap não está no canal Beta');
must(bootstrap.includes("promotedFrom:'2.3.22.5'"),'origem da promoção não registrada');
must(bootstrap.includes("2.3.23 Beta"),'rótulo visual da Beta ausente');
must(bootstrap.includes('const APP_BUILD = 269;'),'APP_BUILD não é 269');
must(bootstrap.includes("['Downloads','central.html?tab=downloads'"),'Downloads não está no menu principal');
must(bootstrap.includes("['Favoritos','central.html?tab=favoritos'"),'Favoritos não está no menu principal');
must(bootstrap.includes("['Ferramentas','central.html?tab=ferramentas'"),'Ferramentas não está no menu principal');
must(bootstrap.includes("['Mensagens','central.html?tab=mensagens'"),'Mensagens não está no menu principal');
must(tabs.includes("VERSION='2.3.23',BUILD=269"),'runtime das abas ainda aponta para versão antiga');
must(tabs.includes('__TAREFAS_BETA_TABS_V269__'),'abas ainda não usam marcador Beta');
must(!tabs.includes('<small>Alpha ${VERSION}</small>'),'abas ainda exibem Alpha ao usuário');
must(runtime.includes("VERSION='2.3.23',BUILD=269"),'runtime ainda aponta para versão antiga');
must(!runtime.includes('Central Alpha 2.3.22.1'),'Central ainda exibe identificação Alpha antiga');
must(!runtime.includes('Ferramentas Alpha 2.3.22.1'),'Ferramentas ainda exibem identificação Alpha antiga');
must(!runtime.includes('nesta Alpha.'),'texto de Alpha ainda aparece no runtime');
must(preload.includes("tarefasAppVersion = '2.3.23'"),'preload ainda mostra versão antiga');
must(updates.includes("const APP_VERSION = '2.3.23';"),'módulo de atualização ainda mostra versão antiga');
must(updates.includes("const APP_CHANNEL = 'beta';"),'canal de atualização não é beta');
must(!updates.includes("const APP_CHANNEL = 'alpha';"),'canal Alpha ainda ficou ativo');
const manifest=JSON.parse(await read('BETA_2_3_23.json'));
must(manifest.version==='2.3.23'&&manifest.build===269&&manifest.channel==='beta','manifesto Beta inválido');
console.log('VERIFY 2.3.23 BETA OK: base 2.3.22.5 promovida, sem Acesso rápido duplicado e canal Beta validado.');
