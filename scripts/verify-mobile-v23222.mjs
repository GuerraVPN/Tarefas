import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const dist=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dist,rel),'utf8');
const need=(text,needle,label)=>{if(!text.includes(needle))throw new Error(`${label}: marcador ausente: ${needle}`)};
const reject=(text,needle,label)=>{if(text.includes(needle))throw new Error(`${label}: conteúdo proibido: ${needle}`)};

const bootstrap=await read('mobile-bootstrap.js');
for(const m of ["const APP_VERSION = '2.3.22.2';",'const APP_BUILD = 265;','__TAREFAS_ALPHA_23222__',"channel:'alpha'",'Alpha 2.3.22.2'])need(bootstrap,m,'mobile-bootstrap.js');
const preload=await read('mobile-preload.js');need(preload,"tarefasAppVersion = '2.3.22.2'",'mobile-preload.js');need(preload,"tarefasAppBuild = '265'",'mobile-preload.js');
const updates=await read('mobile-updates-v181.js');need(updates,"const APP_VERSION = '2.3.22.2';",'mobile-updates-v181.js');need(updates,'const APP_BUILD = 265;','mobile-updates-v181.js');need(updates,"const APP_CHANNEL = 'alpha';",'mobile-updates-v181.js');
const tabs=await read('mobile-alpha-v23221-tabs.js');for(const m of ['__TAREFAS_ALPHA_TABS_V265__','notificacoes','mensagens','downloads','favoritos','ferramentas','renderTools','renderDownloads','renderFavorites'])need(tabs,m,'abas da Central');
const runtime=await read('mobile-alpha-v23221.js');for(const m of ['Apagar selecionadas','Apagar todas','Apagar todas as lidas','flushQueue','aiContext','aiCommand'])need(runtime,m,'runtime');
const core=await read('mobile-alpha-v23221-core.js');for(const m of ['groupedNotifications','retentionDeleteIds','sanitizeError','dedupeQueue','parseAiCommand'])need(core,m,'núcleo');
const dash=await read('dashboard.js');need(dash,'__TAREFAS_DASHBOARD_NULL_GUARD_V264__','dashboard.js');need(dash,'__TAREFAS_DASHBOARD_NULL_GUARD_V265__','dashboard.js');
const ai=await read('mobile-ai-v230.js');for(const m of ['__TAREFAS_AI_ALPHA_TOOLS_V265__','destructiveConfirmation:true','noPrivilegeElevation:true'])need(ai,m,'IA');
const native=await read('native-mobile.js');for(const m of ['__TAREFAS_NATIVE_ALPHA_23222__','isCategoryMuted','__TAREFAS_BIOMETRIC_NATIVE_V258__'])need(native,m,'native');
reject(ai,'service_role','IA');
const htmlFiles=(await readdir(dist)).filter(x=>/\.html$/i.test(x));if(!htmlFiles.length)throw new Error('Nenhum HTML gerado');
for(const name of htmlFiles){const h=await read(name);need(h,'mobile-alpha-v23221-core.js?v=2.3.22.2-b265',name);need(h,'mobile-alpha-v23221.js?v=2.3.22.2-b265',name);need(h,'mobile-alpha-v23221-tabs.js?v=2.3.22.2-b265',name)}
const manifest=JSON.parse(await read('ALPHA_2_3_22_2.json'));if(manifest.version!=='2.3.22.2'||manifest.build!==265||manifest.channel!=='alpha')throw new Error('Manifesto 2.3.22.2 inválido');
console.log(`CONFERÊNCIA 1/3 OK: ${htmlFiles.length} telas, versão/build/canal, regressão, 5 abas, Dashboard, fila, erros e IA validados.`);
