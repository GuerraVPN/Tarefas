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
  "const APP_VERSION = '2.3.21.5';",
  'const APP_BUILD = 262;',
  'Perfis Auxiliar agora conseguem criar tarefas pela IA',
  'sem exigir Admin/Chefe',
  'Anexos das tarefas em data: e blob:'
]) requireText(bootstrap, marker, 'mobile-bootstrap.js');

const preload = await readDist('mobile-preload.js');
requireText(preload, "tarefasAppVersion = '2.3.21.5'", 'mobile-preload.js');
requireText(preload, "tarefasAppBuild = '262'", 'mobile-preload.js');

const updates = await readDist('mobile-updates-v181.js');
requireText(updates, 'const APP_BUILD = 262;', 'mobile-updates-v181.js');
requireText(updates, "const APP_CHANNEL = 'alpha';", 'mobile-updates-v181.js');

const ai = await readDist('mobile-ai-v230.js');
for (const marker of [
  '__TAREFAS_AI_AUXILIAR_TASKS_V262__',
  'auxiliarTaskCreate:true',
  'taskCodeFallback:true',
  'responsibleTaskLink:true',
  'noPrivilegeElevation:true',
  'A alteração passou pela autorização do perfil, mas o banco recusou por uma regra de integridade.'
]) requireText(ai, marker, 'mobile-ai-v230.js');
rejectText(ai, "if(code==='action_failed')return'A alteração foi autorizada, mas o banco recusou a operação.';", 'mobile-ai-v230.js');

const sql = await readFile(path.join(root, 'supabase_v2_3_21_5_ai_auxiliar_task_creation.sql'), 'utf8');
for (const marker of [
  'v2_3_21_5_prepare_task_insert',
  "new.codigo := '#'",
  "new.responsavel := '[]'",
  "new.prioridade := 'Média'",
  'v2_3_21_5_resolve_task_for_assignment',
  "t.criado_por = new.atribuido_por",
  't.criado_por_perfil_id = new.atribuido_por_perfil_id',
  "t.criado_em >= now() - interval '30 seconds'",
  'cardinality(v_ids) = 1',
  'security definer',
  "set search_path = ''",
  'revoke all on function public.v2_3_21_5_resolve_task_for_assignment() from public',
  'grant execute on function public.v2_3_21_5_resolve_task_for_assignment() to anon, authenticated, service_role'
]) requireText(sql, marker, 'supabase_v2_3_21_5_ai_auxiliar_task_creation.sql');

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
  requireText(html, 'mobile-biometric-v23211.js?v=2.3.21.5-b262', htmlName);
}

console.log('OK 2.3.21.5 build 262: tarefas via IA para Auxiliar, integridade do banco e regressao das Alphas anteriores validadas.');
