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
  "const APP_VERSION = '2.3.22';",
  'const APP_BUILD = 263;',
  '__TAREFAS_BETA_2322__',
  "channel:'beta'",
  'Beta 2.3.22 — estabilidade, segurança, arquivos, notificações e IA.',
  'Novidades da 2.3.22 Beta',
  'Tarefas pela IA para Auxiliar',
  'Arquivos e downloads',
  'Sem elevação de privilégios',
  'Downloads/TAREFAS',
  'Alphas 2.3.21.1 a 2.3.21.5'
]) requireText(bootstrap, marker, 'mobile-bootstrap.js');

const preload = await readDist('mobile-preload.js');
requireText(preload, "tarefasAppVersion = '2.3.22'", 'mobile-preload.js');
requireText(preload, "tarefasAppBuild = '263'", 'mobile-preload.js');

const updates = await readDist('mobile-updates-v181.js');
requireText(updates, 'const APP_BUILD = 263;', 'mobile-updates-v181.js');
requireText(updates, "const APP_CHANNEL = 'beta';", 'mobile-updates-v181.js');
rejectText(updates, "const APP_CHANNEL = 'alpha';", 'mobile-updates-v181.js');

const ai = await readDist('mobile-ai-v230.js');
for (const marker of [
  '__TAREFAS_AI_AUXILIAR_TASKS_V262__',
  'auxiliarTaskCreate:true',
  'noPrivilegeElevation:true',
  'A alteração passou pela autorização do perfil, mas o banco recusou por uma regra de integridade.'
]) requireText(ai, marker, 'mobile-ai-v230.js');

const native = await readDist('native-mobile.js');
for (const marker of [
  '__TAREFAS_TASK_ATTACHMENTS_V261__',
  '__TAREFAS_NOTIFICATION_CLEANUP_V260__',
  '__TAREFAS_APP_FIXES_V259__',
  '__TAREFAS_BIOMETRIC_NATIVE_V258__',
  'Download concluído.',
  'Não foi possível ler o anexo local'
]) requireText(native, marker, 'native-mobile.js');

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
  requireText(html, 'mobile-biometric-v23211.js?v=2.3.22-b263', htmlName);
}

console.log('OK 2.3.22 build 263 BETA: About consolidado e regressao das Alphas 2.3.21.x validados.');
