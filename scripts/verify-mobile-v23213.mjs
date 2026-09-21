import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.resolve(process.argv[2] || 'dist');
const readDist = rel => readFile(path.join(dist, rel), 'utf8');
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) throw new Error(`${label}: marcador ausente: ${needle}`);
};
const rejectText = (text, needle, label) => {
  if (text.includes(needle)) throw new Error(`${label}: conteudo proibido: ${needle}`);
};

const bootstrap = await readDist('mobile-bootstrap.js');
for (const marker of [
  "const APP_VERSION = '2.3.21.3';",
  'const APP_BUILD = 260;',
  'Notificações locais do Android agora usam autoCancel',
  'Push e notificação local espelhada são removidos juntos',
  'Limpar notificações'
]) requireText(bootstrap, marker, 'mobile-bootstrap.js');

const preload = await readDist('mobile-preload.js');
requireText(preload, "tarefasAppVersion = '2.3.21.3'", 'mobile-preload.js');
requireText(preload, "tarefasAppBuild = '260'", 'mobile-preload.js');

const updates = await readDist('mobile-updates-v181.js');
requireText(updates, 'const APP_BUILD = 260;', 'mobile-updates-v181.js');
requireText(updates, "const APP_CHANNEL = 'alpha';", 'mobile-updates-v181.js');

const native = await readDist('native-mobile.js');
for (const marker of [
  '__TAREFAS_NOTIFICATION_CLEANUP_V260__',
  'autoCancel',
  'removeAllDeliveredNotifications',
  'notification_id',
  'clearAll',
  '__TAREFAS_APP_FIXES_V259__',
  '__TAREFAS_BIOMETRIC_NATIVE_V258__',
  'Download concluído.'
]) requireText(native, marker, 'native-mobile.js');

const notifications = await readDist('notificacoes.js');
for (const marker of [
  '__TAREFAS_CLEAR_NOTIFICATIONS_V260__',
  'v2_3_21_3_mark_all_notifications_read',
  'limparTudo',
  '__TAREFAS_NOTIFICATION_ACK_V259__',
  'v2_3_21_2_mark_notification_read'
]) requireText(notifications, marker, 'notificacoes.js');

const centralHtml = await readDist('central.html');
requireText(centralHtml, '🗑 Limpar notificações', 'central.html');
requireText(centralHtml, 'id="markAll"', 'central.html');

const central = await readDist('central.js');
requireText(central, 'Notificacoes26?.limparTudo', 'central.js');
requireText(central, 'Erro ao limpar notificacoes', 'central.js');

const config = await readDist('configuracoes.html');
requireText(config, '__TAREFAS_CONFIG_RPC_V259__', 'configuracoes.html');
requireText(config, 'v2_3_21_2_get_my_settings', 'configuracoes.html');
rejectText(config, ".from('usuarios')", 'configuracoes.html');

const biometric = await readDist('mobile-biometric-v23211.js');
requireText(biometric, '__TAREFAS_BIOMETRIC_V258__', 'mobile-biometric-v23211.js');
requireText(biometric, 'biometric.authenticate()', 'mobile-biometric-v23211.js');
rejectText(biometric, 'p_senha', 'mobile-biometric-v23211.js');

const sql = await readFile(path.join(root, 'supabase_v2_3_21_3_clear_notifications.sql'), 'utf8');
for (const marker of [
  'v2_3_21_3_mark_all_notifications_read',
  'security definer',
  "set search_path = ''",
  "extensions.digest(trim(p_session_token),'sha256')",
  'where n.usuario_id=v_usuario_id::text',
  'revoke all on function public.v2_3_21_3_mark_all_notifications_read(text) from public',
  'grant execute on function public.v2_3_21_3_mark_all_notifications_read(text) to anon, authenticated'
]) requireText(sql, marker, 'supabase_v2_3_21_3_clear_notifications.sql');

for (const htmlName of ['index.html', 'configuracoes.html', 'dashboard.html', 'central.html']) {
  const html = await readDist(htmlName);
  requireText(html, 'mobile-biometric-v23211.js?v=2.3.21.3-b260', htmlName);
}

console.log('OK 2.3.21.3 build 260: autoCancel, limpeza cruzada push/local, Limpar notificacoes e regressao das correcoes anteriores validados.');
