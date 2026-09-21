import { appendFile, copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const VERSION='2.3.22.1',BUILD=264;
const nativeEntry=path.join(root,'app/native-mobile-entry.js');
let nativeEntrySource=await readFile(nativeEntry,'utf8');
const nativeListenerRx=/(await\s+PushNotifications\.addListener\(['"]pushNotificationReceived['"],\s*async\s+notification=>\{)/;
if(!nativeListenerRx.test(nativeEntrySource))throw new Error('2.3.22.1: listener nativo de push não encontrado na fonte');
nativeEntrySource=nativeEntrySource.replace(/const APP_VERSION = '[^']+';/,`const APP_VERSION = '${VERSION}';`);
nativeEntrySource=nativeEntrySource.replace(nativeListenerRx,`$1if(globalThis.TarefasAlpha23221?.isCategoryMuted?.(notification?.data?.tipo))return;`);
await writeFile(nativeEntry,nativeEntrySource,'utf8');
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2322.mjs')).href+'?v=23221');
const dist=path.join(root,'dist');

async function patchFile(rel,transform,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=transform(before);
  if(required&&after===before)throw new Error(`2.3.22.1: alteração não aplicada em ${rel}`);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-alpha-v23221-core.js'),path.join(dist,'mobile-alpha-v23221-core.js'));
await copyFile(path.join(root,'app/mobile-alpha-v23221.js'),path.join(dist,'mobile-alpha-v23221.js'));
await copyFile(path.join(root,'app/mobile-alpha-v23221-tabs.js'),path.join(dist,'mobile-alpha-v23221-tabs.js'));

for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);let source=await readFile(file,'utf8');
  source=source.replaceAll('2.3.22-b263','2.3.22.1-b264');
  if(!source.includes('mobile-alpha-v23221.js')){
    const tags=`\n<script src="mobile-alpha-v23221-core.js?v=${VERSION}-b${BUILD}"></script><script src="mobile-alpha-v23221.js?v=${VERSION}-b${BUILD}"></script><script src="mobile-alpha-v23221-tabs.js?v=${VERSION}-b${BUILD}"></script>\n`;
    source=source.includes('</body>')?source.replace('</body>',tags+'</body>'):source+tags;
  }else if(!source.includes('mobile-alpha-v23221-tabs.js')){
    const tag=`<script src="mobile-alpha-v23221-tabs.js?v=${VERSION}-b${BUILD}"></script>`;
    source=source.includes('</body>')?source.replace('</body>',tag+'\n</body>'):source+'\n'+tag;
  }
  await writeFile(file,source,'utf8');
}

await patchFile('dashboard.js',source=>{
  const dollar="const $=id=>document.getElementById(id);";
  if(!source.includes(dollar))throw new Error('2.3.22.1: helper do Dashboard não encontrado');
  source=source.replace(dollar,"const __TAREFAS_DASHBOARD_NULL_GUARD_V264__=true;const __dashMissing={textContent:'',innerHTML:'',value:'',disabled:false,scrollTop:0,scrollHeight:0,onclick:null,onkeydown:null,onsubmit:null};const $=id=>document.getElementById(id)||__dashMissing;");
  const start="async function start(){if(!await initUser())return;shortcuts();await load()}";
  if(!source.includes(start))throw new Error('2.3.22.1: start do Dashboard não encontrado');
  return source.replace(start,"async function start(){try{if(!await initUser())return;shortcuts();await load()}catch(err){console.warn('[DASHBOARD 2.3.22.1] render protegido:',err)}}");
});

await patchFile('mobile-bootstrap.js',source=>{
  source=source.replace("const APP_VERSION = '2.3.22';",`const APP_VERSION = '${VERSION}';`).replace('const APP_BUILD = 263;',`const APP_BUILD = ${BUILD};`);
  source=source.replace('<span class="tm-about-chip">BETA</span><h1>TAREFAS</h1><p>Beta 2.3.22 — estabilidade, segurança, arquivos, notificações e IA.</p>','<span class="tm-about-chip">ALPHA</span><h1>TAREFAS</h1><p>Alpha 2.3.22.1 — Central de Notificações 2.0, ferramentas pessoais, offline e IA.</p>');
  const anchor='      <section class="tm-about-card tm-about-beta">\n        <h2>Novidades da 2.3.22 Beta</h2>';
  const card=`      <section class="tm-about-card tm-about-alpha">\n        <h2>Novidades da 2.3.22.1 Alpha</h2>\n        <div class="tm-about-feature"><span>🔔</span><div><strong>Central de Notificações 2.0</strong><small>Seleção múltipla, apagar selecionadas/todas/lidas, deslizar para excluir, filtros, versões agrupadas e contadores separados.</small></div></div>\n        <div class="tm-about-feature"><span>🧭</span><div><strong>Central reorganizada em abas</strong><small>Notificações 2.0 e Mensagens ficam na Central; Downloads e Favoritos ganharam abas próprias; filtros, fila offline e erros ficam em Ferramentas.</small></div></div>\n        <div class="tm-about-feature"><span>🔕</span><div><strong>Silêncio e retenção</strong><small>Categorias podem ser silenciadas e notificações antigas removidas automaticamente em 30, 60 ou 90 dias, preservando itens fixados.</small></div></div>\n        <div class="tm-about-feature"><span>⭐</span><div><strong>Favoritos e filtros salvos</strong><small>Telas, atalhos e filtros ficam acessíveis rapidamente pela Central Alpha.</small></div></div>\n        <div class="tm-about-feature"><span>📥</span><div><strong>Central de Downloads</strong><small>Histórico dos arquivos salvos com caminho, reabertura quando a origem estiver disponível e registro de falhas.</small></div></div>\n        <div class="tm-about-feature"><span>📡</span><div><strong>Fila offline e sincronização</strong><small>Ações compatíveis da Central 2.0 são guardadas sem credenciais e sincronizadas quando a conexão volta, com indicador de estado.</small></div></div>\n        <div class="tm-about-feature"><span>⚡</span><div><strong>Ações rápidas, fixação e soneca</strong><small>Notificações podem ser fixadas, adiadas, marcadas como lidas ou apagadas direto da lista.</small></div></div>\n        <div class="tm-about-feature"><span>🧯</span><div><strong>Central de Erros</strong><small>Falhas JavaScript e de sincronização são registradas localmente com remoção de padrões de credencial.</small></div></div>\n        <div class="tm-about-feature"><span>🤖</span><div><strong>IA com acesso às ferramentas da Alpha</strong><small>A IA recebe contexto local de favoritos, downloads, fila, filtros, erros, lembretes e notificações e executa comandos locais com confirmação para ações destrutivas.</small></div></div>\n      </section>\n`;
  if(!source.includes(anchor))throw new Error('2.3.22.1: âncora do About beta não encontrada');
  return source.replace(anchor,card+anchor);
});

await patchFile('mobile-preload.js',source=>source.replace("tarefasAppVersion = '2.3.22'",`tarefasAppVersion = '${VERSION}'`).replace("tarefasAppBuild = '263'",`tarefasAppBuild = '${BUILD}'`));
await patchFile('mobile-updates-v181.js',source=>source.replace("const APP_VERSION = '2.3.22';",`const APP_VERSION = '${VERSION}';`).replace('const APP_BUILD = 263;',`const APP_BUILD = ${BUILD};`).replace("const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'alpha';"));
await patchFile('mobile-schema-v239.js',source=>source.replaceAll("version:'2.3.22'",`version:'${VERSION}'`).replaceAll('build:263',`build:${BUILD}`),{required:false});

await patchFile('mobile-ai-v230.js',source=>{
  source=source.replace('BETA 2.3.2 · leitura + ações + anexos',`ALPHA ${VERSION} · leitura + ações + anexos + ferramentas locais`);
  const start="async function ask(text,files){if(sending)return;const prompt=String(text||'').trim(),picked=Array.from(files||[]);if(!prompt&&!picked.length)return;sending=true;";
  const replacement="async function ask(text,files){if(sending)return;const prompt=String(text||'').trim(),picked=Array.from(files||[]);if(!prompt&&!picked.length)return;if(!picked.length&&window.TarefasAlpha23221?.aiCommand){const local=await window.TarefasAlpha23221.aiCommand(prompt).catch(()=>null);if(local?.handled){messages.push({role:'user',text:prompt.slice(0,4000)},{role:'model',text:String(local.answer||'Ação concluída.').slice(0,8000)});save(me.id,messages);render();return}}sending=true;";
  if(!source.includes(start))throw new Error('2.3.22.1: ponto de integração local da IA não encontrado');
  source=source.replace(start,replacement);
  const payload="let payload={prompt:prompt||'Analise os anexos enviados.',history:previous},withFiles=false;";
  const enriched="const alphaContext=window.TarefasAlpha23221?.aiContext?.()||'';const alphaPrompt=[prompt||'Analise os anexos enviados.',alphaContext].filter(Boolean).join('\\n\\n');let payload={prompt:alphaPrompt.slice(0,12000),history:previous},withFiles=false;";
  if(!source.includes(payload))throw new Error('2.3.22.1: payload da IA não encontrado');
  return source.replace(payload,enriched);
});
await appendFile(path.join(dist,'mobile-ai-v230.js'),`\n;globalThis.__TAREFAS_AI_ALPHA_TOOLS_V264__={version:'${VERSION}',build:${BUILD},localContext:true,localCommands:true,destructiveConfirmation:true,noPrivilegeElevation:true};\n`,'utf8');

await appendFile(path.join(dist,'native-mobile.js'),`\n;globalThis.__TAREFAS_NATIVE_ALPHA_23221__={version:'${VERSION}',build:${BUILD},categoryMute:true};\n`,'utf8');

await appendFile(path.join(dist,'mobile-bootstrap.js'),`\n;globalThis.__TAREFAS_ALPHA_23221__={version:'${VERSION}',build:${BUILD},channel:'alpha',base:'2.3.22',features:['notifications2','centralTabs','favorites','downloads','offlineQueue','syncIndicator','savedFilters','quickActions','errorCenter','pin','snooze','separateCounters','dashboardNullGuard','aiAccess']};\n`,'utf8');

await writeFile(path.join(dist,'ALPHA_2_3_22_1.json'),JSON.stringify({version:VERSION,build:BUILD,channel:'alpha',base:'2.3.22',generatedAt:new Date().toISOString(),features:{notifications2:true,centralTabs:true,multiSelect:true,deleteSelected:true,deleteAll:true,deleteRead:true,swipeDelete:true,categoryFilters:true,versionGrouping:true,muteCategories:true,retentionDays:[30,60,90],favorites:true,downloads:true,offlineQueue:true,syncIndicator:true,savedFilters:true,quickActions:true,errorCenter:true,pin:true,snooze:true,separateCounters:true,dashboardNullGuard:true,aiLocalContext:true,aiLocalCommands:true,destructiveConfirmation:true}},null,2)+'\n','utf8');
console.log('TAREFAS Android 2.3.22.1 build 264 ALPHA: Central 2.0 em abas, ferramentas reorganizadas, Dashboard protegido e IA integrada.');
