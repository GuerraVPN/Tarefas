import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const nativeEntry = path.join(root, 'app', 'native-mobile-entry.js');
const notificacoes = path.join(root, 'notificacoes.js');
const central = path.join(root, 'central.js');
const centralHtml = path.join(root, 'central.html');
const temporaryFiles = [nativeEntry, notificacoes, central, centralHtml];
const originals = new Map(await Promise.all(temporaryFiles.map(async file => [file, await readFile(file, 'utf8')])));

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`2.3.21.3: trecho ausente: ${label}`);
  return source.replace(before, after);
}

function patchNativeSource(source) {
  source = replaceRequired(
    source,
    "channelId:Capacitor.getPlatform()==='android'?CHANNEL_ID:undefined,schedule:at?{at:new Date(at)}:{at:new Date(Date.now()+250)},extra:extra||{}",
    "channelId:Capacitor.getPlatform()==='android'?CHANNEL_ID:undefined,autoCancel:Capacitor.getPlatform()==='android'?true:undefined,schedule:at?{at:new Date(at)}:{at:new Date(Date.now()+250)},extra:extra||{}",
    'autoCancel da notificacao local'
  );

  source = replaceRequired(
    source,
    "await notify({title:notification.title||'TAREFAS',body,extra:notification.data||{}}).catch(()=>{})",
    "await notify({title:notification.title||'TAREFAS',body,id:Number(notification.data?.notification_id||0)||undefined,extra:notification.data||{}}).catch(()=>{})",
    'id da notificacao local espelhada'
  );

  source = replaceRequired(
    source,
    "  if(matches.length)await PushNotifications.removeDeliveredNotifications({notifications:matches});\n }catch(err){console.warn('[TAREFAS NOTIF] Falha ao remover push entregue:',err)}",
    "  if(matches.length)await PushNotifications.removeDeliveredNotifications({notifications:matches});\n  const localDelivered=await LocalNotifications.getDeliveredNotifications();\n  const localMatches=(localDelivered?.notifications||[]).filter(item=>notificationMatch(item,notification));\n  if(localMatches.length)await LocalNotifications.removeDeliveredNotifications({notifications:localMatches});\n }catch(err){console.warn('[TAREFAS NOTIF] Falha ao remover push/local entregue:',err)}",
    'limpeza cruzada ao tocar no push'
  );

  source = replaceRequired(
    source,
    "  if(matches.length)await LocalNotifications.removeDeliveredNotifications({notifications:matches});\n }catch(err){console.warn('[TAREFAS NOTIF] Falha ao remover notificação local entregue:',err)}",
    "  if(matches.length)await LocalNotifications.removeDeliveredNotifications({notifications:matches});\n  const pushDelivered=await PushNotifications.getDeliveredNotifications();\n  const opened={id:String(notification?.id||''),data:notification?.extra||{}};\n  const pushMatches=(pushDelivered?.notifications||[]).filter(item=>notificationMatch(item,opened));\n  if(pushMatches.length)await PushNotifications.removeDeliveredNotifications({notifications:pushMatches});\n }catch(err){console.warn('[TAREFAS NOTIF] Falha ao remover notificacao local/push entregue:',err)}",
    'limpeza cruzada ao tocar na local'
  );

  source = replaceRequired(
    source,
    'async function openPushNotification(notification){',
    `async function clearAllNativeNotifications(){
 try{
  const results=await Promise.allSettled([
   PushNotifications.removeAllDeliveredNotifications(),
   LocalNotifications.removeAllDeliveredNotifications()
  ]);
  const failed=results.filter(x=>x.status==='rejected');
  if(failed.length)console.warn('[TAREFAS NOTIF] Algumas notificacoes nativas nao puderam ser removidas:',failed.map(x=>x.reason));
  return failed.length===0;
 }catch(err){console.warn('[TAREFAS NOTIF] Falha ao limpar notificacoes nativas:',err);return false}
}
async function openPushNotification(notification){`,
    'funcao limpar todas nativas'
  );

  source = replaceRequired(
    source,
    "notifications:{ensurePermission:async()=>(await ensureLocalPermission())&&(await ensurePushPermission()),notify,registerPush:initializeRemotePush,unregisterPush:unregisterCurrentDevice,isPushReady:()=>localStorage.getItem('tarefasPushReady17')==='1'},",
    "notifications:{ensurePermission:async()=>(await ensureLocalPermission())&&(await ensurePushPermission()),notify,registerPush:initializeRemotePush,unregisterPush:unregisterCurrentDevice,clearAll:clearAllNativeNotifications,isPushReady:()=>localStorage.getItem('tarefasPushReady17')==='1'},",
    'export limpar todas nativas'
  );

  return source;
}

function patchNotificacoesSource(source) {
  const anchor = '\nfunction realtime(){';
  const clearFn = `
async function limparTudo(confirmar=true){
 try{
  if(confirmar&&typeof window.confirm==='function'&&!window.confirm('Deseja marcar todas as notificacoes como lidas e limpar as notificacoes do Android?'))return{ok:false,canceled:true,updated:0};
  const c=getClient(),token=String(localStorage.getItem('tarefasPushSession17')||'').trim();
  if(!c||!token)throw new Error('Sessao do aplicativo ausente. Faca login novamente.');
  const {data,error}=await c.rpc('v2_3_21_3_mark_all_notifications_read',{p_session_token:token});
  if(error)throw error;
  try{await window.TarefasNative?.notifications?.clearAll?.()}catch(nativeError){console.warn('Notificacoes26: falha ao limpar a barra do Android:',nativeError)}
  window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));
  await atualizarContadores();
  return{ok:true,canceled:false,updated:Number(data)||0};
 }catch(error){console.warn('Notificacoes26: falha ao limpar notificacoes:',error?.message||error);throw error}
}
window.__TAREFAS_CLEAR_NOTIFICATIONS_V260__=true;
`;
  source = replaceRequired(source, anchor, clearFn + anchor, 'limpar tudo no modulo de notificacoes');
  source = replaceRequired(
    source,
    'window.Notificacoes26={registrarNotificacao,contadores,atualizarContadores,realtime,recentes,mensagensRecentes,marcarLida,abrirNotificacao,destinoNotificacao};',
    'window.Notificacoes26={registrarNotificacao,contadores,atualizarContadores,realtime,recentes,mensagensRecentes,marcarLida,abrirNotificacao,limparTudo,destinoNotificacao};',
    'export limpar tudo'
  );
  return source;
}

function patchCentralSource(source) {
  const oldFn = "async function openNotif(n){if(window.Notificacoes26?.abrirNotificacao)return Notificacoes26.abrirNotificacao(n);if(!n.lida){await supabaseClient.from('notificacoes').update({lida:true,lida_em:new Date().toISOString()}).eq('id',n.id);n.lida=true;renderNotifs();stats()}if(n.destino_url)location.href=n.destino_url}async function markAll(){const ids=notifs.filter(x=>!x.lida).map(x=>x.id);if(!ids.length)return;const r=await supabaseClient.from('notificacoes').update({lida:true,lida_em:new Date().toISOString()}).in('id',ids);if(r.error)return alert(r.error.message);await loadNotifs()}";
  const newFn = "async function openNotif(n){if(window.Notificacoes26?.abrirNotificacao)return Notificacoes26.abrirNotificacao(n);if(!n.lida){await supabaseClient.from('notificacoes').update({lida:true,lida_em:new Date().toISOString()}).eq('id',n.id);n.lida=true;renderNotifs();stats()}if(n.destino_url)location.href=n.destino_url}async function markAll(){try{const result=await window.Notificacoes26?.limparTudo?.(true);if(result?.canceled)return;if(!result?.ok)throw new Error('Nao foi possivel limpar as notificacoes.');notifs.forEach(x=>{x.lida=true;x.lida_em=x.lida_em||new Date().toISOString()});renderNotifs();stats();await loadNotifs()}catch(error){alert('Erro ao limpar notificacoes: '+(error?.message||error))}}";
  return replaceRequired(source, oldFn, newFn, 'acao limpar notificacoes da Central');
}

function patchCentralHtmlSource(source) {
  return replaceRequired(
    source,
    '<button class="btn" id="markAll">Marcar todas como lidas</button>',
    '<button class="btn" id="markAll" title="Marca todas como lidas e limpa a barra do Android">🗑 Limpar notificações</button>',
    'botao limpar notificacoes'
  );
}

try {
  await writeFile(nativeEntry, patchNativeSource(originals.get(nativeEntry)), 'utf8');
  await writeFile(notificacoes, patchNotificacoesSource(originals.get(notificacoes)), 'utf8');
  await writeFile(central, patchCentralSource(originals.get(central)), 'utf8');
  await writeFile(centralHtml, patchCentralHtmlSource(originals.get(centralHtml)), 'utf8');
  await import(pathToFileURL(path.resolve('scripts/build-mobile-v23212.mjs')).href + '?v=23213');
} finally {
  await Promise.all([...originals].map(([file, source]) => writeFile(file, source, 'utf8')));
}

const dist = path.join(root, 'dist');
async function patchFile(rel, transform) {
  const file = path.join(dist, rel);
  const before = await readFile(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`2.3.21.3: alteracao nao aplicada em ${rel}`);
  await writeFile(file, after, 'utf8');
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  const source = await readFile(file, 'utf8');
  await writeFile(file, source.replaceAll('2.3.21.2', '2.3.21.3').replaceAll('b259', 'b260'), 'utf8');
}

await patchFile('mobile-bootstrap.js', source => {
  source = source.replace('const APP_BUILD = 259;', 'const APP_BUILD = 260;');
  const anchor = '<li>Configurações voltam a carregar e salvar os dados do próprio usuário por sessão segura.</li>';
  const additions = '<li>Notificações locais do Android agora usam autoCancel e somem ao tocar.</li>\\n          <li>Push e notificação local espelhada são removidos juntos pelo mesmo notification_id.</li>\\n          <li>A Central ganhou o botão Limpar notificações para marcar tudo como lido e limpar a barra do Android.</li>\\n          ' + anchor;
  return source.includes(anchor) ? source.replace(anchor, additions) : source;
});
await patchFile('mobile-preload.js', source => source.replace("tarefasAppBuild = '259'", "tarefasAppBuild = '260'"));
await patchFile('mobile-updates-v181.js', source => source.replace('const APP_BUILD = 259;', 'const APP_BUILD = 260;'));
await patchFile('mobile-schema-v239.js', source => source.replace('build:259', 'build:260'));

await appendFile(
  path.join(dist, 'native-mobile.js'),
  "\n;globalThis.__TAREFAS_NOTIFICATION_CLEANUP_V260__={version:'2.3.21.3',build:260,autoCancel:true,crossDismiss:true,clearAll:true};\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.21.3 build 260 ALPHA: autoCancel, limpeza cruzada push/local e Limpar notificacoes.');
