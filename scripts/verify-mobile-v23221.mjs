import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const dist=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dist,rel),'utf8');
const need=(text,needle,label)=>{if(!text.includes(needle))throw new Error(`${label}: marcador ausente: ${needle}`)};
const reject=(text,needle,label)=>{if(text.includes(needle))throw new Error(`${label}: conteúdo proibido: ${needle}`)};

const bootstrap=await read('mobile-bootstrap.js');
for(const m of ["const APP_VERSION = '2.3.22.1';",'const APP_BUILD = 264;','__TAREFAS_ALPHA_23221__',"channel:'alpha'",'Novidades da 2.3.22.1 Alpha','Central de Notificações 2.0','Central reorganizada em abas','Fila offline e sincronização','IA com acesso às ferramentas da Alpha'])need(bootstrap,m,'mobile-bootstrap.js');
const preload=await read('mobile-preload.js');need(preload,"tarefasAppVersion = '2.3.22.1'",'mobile-preload.js');need(preload,"tarefasAppBuild = '264'",'mobile-preload.js');
const updates=await read('mobile-updates-v181.js');need(updates,"const APP_VERSION = '2.3.22.1';",'mobile-updates-v181.js');need(updates,'const APP_BUILD = 264;','mobile-updates-v181.js');need(updates,"const APP_CHANNEL = 'alpha';",'mobile-updates-v181.js');reject(updates,"const APP_CHANNEL = 'beta';",'mobile-updates-v181.js');
const alpha=await read('mobile-alpha-v23221.js');
for(const m of ['Apagar selecionadas','Apagar todas','Apagar todas as lidas','.a23221-group','mutedCategories','retentionDays','downloadUrl','QUEUE_KEY','Central de erros','savedFilters','snoozeNotification','pinnedNotifications','aiContext','aiCommand','flushQueue'])need(alpha,m,'mobile-alpha-v23221.js');
const tabs=await read('mobile-alpha-v23221-tabs.js');
for(const m of ['__TAREFAS_ALPHA_TABS_V264__','Notificações 2.0','data-tab="downloads"','data-tab="favoritos"','data-tab="ferramentas"','Central de Downloads','Salvar filtro atual','Fila offline','Central de erros','a23221-wrap','renderNotifications2','mutateNotifications'])need(tabs,m,'mobile-alpha-v23221-tabs.js');
const core=await read('mobile-alpha-v23221-core.js');for(const m of ['groupedNotifications','retentionDeleteIds','parseAiCommand','sanitizeError','dedupeQueue'])need(core,m,'mobile-alpha-v23221-core.js');
const ai=await read('mobile-ai-v230.js');for(const m of ['__TAREFAS_AI_AUXILIAR_TASKS_V262__','__TAREFAS_AI_ALPHA_TOOLS_V264__','TarefasAlpha23221?.aiCommand','TarefasAlpha23221?.aiContext','destructiveConfirmation:true','noPrivilegeElevation:true'])need(ai,m,'mobile-ai-v230.js');
const native=await read('native-mobile.js');for(const m of ['__TAREFAS_TASK_ATTACHMENTS_V261__','__TAREFAS_NOTIFICATION_CLEANUP_V260__','__TAREFAS_APP_FIXES_V259__','__TAREFAS_BIOMETRIC_NATIVE_V258__','__TAREFAS_NATIVE_ALPHA_23221__','isCategoryMuted'])need(native,m,'native-mobile.js');
const dashboard=await read('dashboard.js');for(const m of ['__TAREFAS_DASHBOARD_NULL_GUARD_V264__','__dashMissing','render protegido'])need(dashboard,m,'dashboard.js');
const notifications=await read('notificacoes.js');for(const m of ['__TAREFAS_CLEAR_NOTIFICATIONS_V260__','v2_3_21_3_mark_all_notifications_read','__TAREFAS_NOTIFICATION_ACK_V259__'])need(notifications,m,'notificacoes.js');
const config=await read('configuracoes.html');need(config,'__TAREFAS_CONFIG_RPC_V259__','configuracoes.html');need(config,'v2_3_21_2_get_my_settings','configuracoes.html');reject(config,".from('usuarios')",'configuracoes.html');
const biometric=await read('mobile-biometric-v23211.js');need(biometric,'__TAREFAS_BIOMETRIC_V258__','mobile-biometric-v23211.js');reject(biometric,'p_senha','mobile-biometric-v23211.js');
const htmlFiles=(await readdir(dist)).filter(x=>/\.html$/i.test(x));if(!htmlFiles.length)throw new Error('Nenhum HTML gerado');
for(const name of htmlFiles){const h=await read(name);need(h,'mobile-alpha-v23221-core.js?v=2.3.22.1-b264',name);need(h,'mobile-alpha-v23221.js?v=2.3.22.1-b264',name);need(h,'mobile-alpha-v23221-tabs.js?v=2.3.22.1-b264',name)}
const manifest=JSON.parse(await read('ALPHA_2_3_22_1.json'));if(manifest.version!=='2.3.22.1'||manifest.build!==264||manifest.channel!=='alpha')throw new Error('Manifesto Alpha inválido');if(!manifest.features?.notifications2||!manifest.features?.centralTabs||!manifest.features?.dashboardNullGuard||!manifest.features?.aiLocalCommands||!manifest.features?.destructiveConfirmation)throw new Error('Manifesto sem recursos obrigatórios');
console.log(`CONFERÊNCIA 1/3 OK: ${htmlFiles.length} telas, versão/build/canal, regressões 2.3.21.x, abas da Central, Dashboard protegido, offline e IA validados.`);
