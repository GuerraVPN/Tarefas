import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const dir=path.resolve(process.argv[2]||'dist'), read=f=>readFile(path.join(dir,f),'utf8');
const must=(x,m)=>{if(!x)throw new Error('2.4.15 verify: '+m)};
for(const f of ['mobile-calendar-reminders-v2415.js','calendario.html','mobile-bootstrap.js','mobile-login-v17.js','mobile-patch-manager-v240.js','mobile-updates-v181.js','dashboard.html','dashboard.js','about.html','BETA_2_4_15.json'])await access(path.join(dir,f));
const boot=await read('mobile-bootstrap.js'),updates=await read('mobile-updates-v181.js'),pm=await read('mobile-patch-manager-v240.js');
const manifest=JSON.parse(await read('BETA_2_4_15.json')),reminders=await read('mobile-calendar-reminders-v2415.js'),calendar=await read('calendario.html');
must(boot.includes("const APP_VERSION = '2.4.15';")&&boot.includes('const APP_BUILD = 302;'),'versão/build no bootstrap');
must(updates.includes("const APP_VERSION = '2.4.15';")&&updates.includes('const APP_BUILD = 302;')&&updates.includes("const APP_CHANNEL = 'beta';'),'centro de atualizações');
must(pm.includes('2.4.15')&&pm.includes('302'),'Patch Manager');
must(manifest.version==='2.4.15'&&manifest.build===302&&manifest.channel==='beta'&&manifest.base==='2.4.14'&&manifest.features.menuEscalaServicoRemoved===true,'manifesto da Beta');
must(boot.includes('__TAREFAS_2415_HIDE_ESCALA_SERVICO__')&&boot.includes("title==='escala de serviço'"),'remoção apenas da entrada Escala de serviço no menu Android');
must(calendar.includes('mobile-calendar-reminders-v2415.js')&&!calendar.includes('mobile-calendar-reminders-v2414.js'),'conexão do script do calendário');
must(reminders.includes('__TAREFAS_CAL_REMINDERS_V772__')&&reminders.includes('processar_recorrencias_v4'),'calendário/recorrências');
for(const marker of ['tmDrawer','tm-bottom-nav','__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__','__TAREFAS_PATCH_CONSOLIDATED_2487__','__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__','__TAREFAS_ALPHA_24911_CONSOLIDATED__'])must(boot.includes(marker),'marcador '+marker);
must(!boot.includes('__TAREFAS_ANDROID_2411_BOTTOM_TABS_FIX__'),'layout da 2.4.11');
must(!updates.includes('v.web_version'),'histórico ainda renderiza web_version');
must(updates.includes('BETA'),'canal Beta ausente');
for(const name of ['mobile-bootstrap.js','mobile-login-v17.js','mobile-updates-v181.js','about.html']){
 const s=await read(name);must(!/WEB\s*[0-9]+\.[0-9]+/i.test(s),name+' contém versão Web visível');must(!s.includes('Base web'),'card Base web presente em '+name);
}
must(!reminders.includes('Próximo Serviço')&&!reminders.includes('Próximo serviço'),'cartão Próximo Serviço');
console.log('VERIFY 2.4.15 BETA OK: build 302, remoção do item extra, Patch Manager, calendário e proteção de recorrência.');
