import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.resolve(process.argv[2] || 'dist');
const readDist = rel => readFile(path.join(dist, rel), 'utf8');
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) throw new Error(`${label}: marcador ausente: ${needle}`);
};
const rejectText = (text, needle, label) => {
  if (text.includes(needle)) throw new Error(`${label}: conteúdo proibido: ${needle}`);
};

const bootstrap = await readDist('mobile-bootstrap.js');
for (const marker of [
  "const APP_VERSION = '2.3.21.2';",
  'const APP_BUILD = 259;',
  '<strong>Login biométrico</strong>',
  'Configurações voltam a carregar e salvar',
  'marcada como lida dentro do aplicativo',
  'abrem automaticamente após serem salvos'
]) requireText(bootstrap, marker, 'mobile-bootstrap.js');

const preload = await readDist('mobile-preload.js');
requireText(preload, "tarefasAppVersion = '2.3.21.2'", 'mobile-preload.js');
requireText(preload, "tarefasAppBuild = '259'", 'mobile-preload.js');

const updates = await readDist('mobile-updates-v181.js');
requireText(updates, "const APP_BUILD = 259;", 'mobile-updates-v181.js');
requireText(updates, "const APP_CHANNEL = 'alpha';", 'mobile-updates-v181.js');
requireText(updates, '__TAREFAS_ALPHA_UPDATES_V257__', 'mobile-updates-v181.js');

const config = await readDist('configuracoes.html');
for (const marker of [
  '__TAREFAS_CONFIG_RPC_V259__',
  "rpc('v2_3_21_2_get_my_settings'",
  "rpc('v2_3_21_2_update_my_settings'",
  "const SETTINGS_SESSION_KEY = 'tarefasPushSession17'"
]) requireText(config, marker, 'configuracoes.html');
rejectText(config, ".from('usuarios')", 'configuracoes.html');

const notifications = await readDist('notificacoes.js');
for (const marker of [
  '__TAREFAS_NOTIFICATION_ACK_V259__',
  "rpc('v2_3_21_2_mark_notification_read'",
  "url.searchParams.get('notification_id')",
  'confirmarNotificacaoAberta()'
]) requireText(notifications, marker, 'notificacoes.js');

const native = await readDist('native-mobile.js');
for (const marker of [
  '__TAREFAS_APP_FIXES_V259__',
  'Download concluído.',
  'application/pdf',
  'application/vnd.oasis.opendocument.text',
  'confirmedOnScreen',
  'openedAfterSave',
  'v2_3_21_2_mark_notification_read',
  'notification_id=',
  'TarefasBiometric',
  '__TAREFAS_BIOMETRIC_NATIVE_V258__'
]) requireText(native, marker, 'native-mobile.js');
requireText(native, 'openFile', 'native-mobile.js');
requireText(native, 'share', 'native-mobile.js');

const biometric = await readDist('mobile-biometric-v23211.js');
for (const marker of [
  '__TAREFAS_BIOMETRIC_V258__',
  'Entrar com biometria',
  "rpc('v2_3_21_1_biometric_resume'",
  'biometric.authenticate()'
]) requireText(biometric, marker, 'mobile-biometric-v23211.js');
rejectText(biometric, 'p_senha', 'mobile-biometric-v23211.js');

for (const htmlName of ['index.html', 'configuracoes.html', 'dashboard.html']) {
  const html = await readDist(htmlName);
  requireText(html, 'mobile-biometric-v23211.js?v=2.3.21.2-b259', htmlName);
}

const sql = await readFile(path.join(root, 'supabase_v2_3_21_2_mobile_settings_and_notification_ack.sql'), 'utf8');
for (const marker of [
  'v2_3_21_2_get_my_settings',
  'v2_3_21_2_update_my_settings',
  'v2_3_21_2_mark_notification_read',
  'security definer',
  "set search_path = ''",
  "extensions.digest(trim(p_session_token),'sha256')",
  'revoke all on function public.v2_3_21_2_get_my_settings(text) from public',
  'grant execute on function public.v2_3_21_2_get_my_settings(text) to anon, authenticated',
  'revoke all on function public.v2_3_21_2_update_my_settings(text,jsonb) from public',
  'revoke all on function public.v2_3_21_2_mark_notification_read(text,bigint) from public'
]) requireText(sql, marker, 'supabase_v2_3_21_2_mobile_settings_and_notification_ack.sql');

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (packageJson.dependencies?.['@capacitor/android'] !== '8.5.0') {
  throw new Error('Capacitor Android 8.5.0 esperado.');
}

console.log('OK 2.3.21.2 build 259: Configurações por sessão segura, notificação interna confirmada e arquivos com confirmação + abertura automática validados.');
