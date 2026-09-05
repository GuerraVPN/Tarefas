import { readFile } from 'node:fs/promises';
import path from 'node:path';

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
  "const APP_VERSION = '2.3.21.4';",
  'const APP_BUILD = 261;',
  'Anexos das tarefas em data: e blob:',
  'salvo em Downloads/TAREFAS',
  'Notificações locais do Android agora usam autoCancel'
]) requireText(bootstrap, marker, 'mobile-bootstrap.js');

const preload = await readDist('mobile-preload.js');
requireText(preload, "tarefasAppVersion = '2.3.21.4'", 'mobile-preload.js');
requireText(preload, "tarefasAppBuild = '261'", 'mobile-preload.js');

const updates = await readDist('mobile-updates-v181.js');
requireText(updates, 'const APP_BUILD = 261;', 'mobile-updates-v181.js');
requireText(updates, "const APP_CHANNEL = 'alpha';", 'mobile-updates-v181.js');

const native = await readDist('native-mobile.js');
for (const marker of [
  '__TAREFAS_TASK_ATTACHMENTS_V261__',
  '__TAREFAS_NOTIFICATION_CLEANUP_V260__',
  '__TAREFAS_APP_FIXES_V259__',
  '__TAREFAS_BIOMETRIC_NATIVE_V258__',
  'Download concluído.',
  'Downloads/TAREFAS',
  'FileOpener',
  'blob:',
  'data:',
  'downloadDocumentToDownloads'
]) requireText(native, marker, 'native-mobile.js');

// Valida o comportamento sem depender dos nomes internos reescritos pelo bundler.
requireText(native, 'saveToDownloads:true', 'native-mobile.js');
requireText(native, 'autoOpen:true', 'native-mobile.js');

const minhas = await readDist('minhas_tarefas.html');
for (const marker of [
  "arq.content.startsWith('data:')",
  'download="${nome}"',
  'file-name-link'
]) requireText(minhas, marker, 'minhas_tarefas.html');

const menu = await readDist('menu.html');
for (const marker of [
  "arq.content.startsWith('data:')",
  'download="${nome}"'
]) requireText(menu, marker, 'menu.html');

const notifications = await readDist('notificacoes.js');
for (const marker of [
  '__TAREFAS_CLEAR_NOTIFICATIONS_V260__',
  'v2_3_21_3_mark_all_notifications_read',
  '__TAREFAS_NOTIFICATION_ACK_V259__'
]) requireText(notifications, marker, 'notificacoes.js');

const config = await readDist('configuracoes.html');
requireText(config, '__TAREFAS_CONFIG_RPC_V259__', 'configuracoes.html');
requireText(config, 'v2_3_21_2_get_my_settings', 'configuracoes.html');
rejectText(config, ".from('usuarios')", 'configuracoes.html');

const biometric = await readDist('mobile-biometric-v23211.js');
requireText(biometric, '__TAREFAS_BIOMETRIC_V258__', 'mobile-biometric-v23211.js');
rejectText(biometric, 'p_senha', 'mobile-biometric-v23211.js');

for (const htmlName of ['index.html', 'configuracoes.html', 'dashboard.html', 'central.html']) {
  const html = await readDist(htmlName);
  requireText(html, 'mobile-biometric-v23211.js?v=2.3.21.4-b261', htmlName);
}

console.log('OK 2.3.21.4 build 261: anexos data/blob das tarefas, download, abertura automatica e regressao das Alphas anteriores validados.');
