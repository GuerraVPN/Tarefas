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
  "const APP_VERSION = '2.3.21.1';",
  'const APP_BUILD = 258;',
  '<strong>Login biométrico</strong>',
  'sem armazenar a senha'
]) requireText(bootstrap, marker, 'mobile-bootstrap.js');

const preload = await readDist('mobile-preload.js');
requireText(preload, "tarefasAppVersion = '2.3.21.1'", 'mobile-preload.js');
requireText(preload, "tarefasAppBuild = '258'", 'mobile-preload.js');

const updates = await readDist('mobile-updates-v181.js');
requireText(updates, "const APP_CHANNEL = 'alpha';", 'mobile-updates-v181.js');
requireText(updates, '${channelLabel(APP_CHANNEL)} ${APP_VERSION}', 'mobile-updates-v181.js');
requireText(updates, 'versão alpha mais nova', 'mobile-updates-v181.js');

const login = await readDist('mobile-login-v17.js');
requireText(login, 'TarefasBiometricLogin?.afterPasswordLogin', 'mobile-login-v17.js');
requireText(login, 'sessionToken: String(autenticacao.session_token)', 'mobile-login-v17.js');

const biometric = await readDist('mobile-biometric-v23211.js');
for (const marker of [
  '__TAREFAS_BIOMETRIC_V258__',
  'Entrar com biometria',
  'Ativar login por biometria neste aparelho',
  "rpc('v2_3_21_1_biometric_resume'",
  'data?.valid !== true',
  'biometric.authenticate()',
  'biometric.clear()',
  'tarefasBiometricClearPending258',
  "page() !== 'configuracoes.html'"
]) requireText(biometric, marker, 'mobile-biometric-v23211.js');
rejectText(biometric, 'p_senha', 'mobile-biometric-v23211.js');
rejectText(biometric, 'localStorage.setItem(\'senha', 'mobile-biometric-v23211.js');

const native = await readDist('native-mobile.js');
requireText(native, 'TarefasBiometric', 'native-mobile.js');
requireText(native, '__TAREFAS_BIOMETRIC_NATIVE_V258__', 'native-mobile.js');
requireText(native, '__TAREFAS_ALPHA_DOWNLOAD_FOLDER_V257__', 'native-mobile.js');

const java = await readFile(path.join(root, 'app', 'android', 'TarefasBiometricPlugin.java'), 'utf8');
for (const marker of [
  '@CapacitorPlugin(name = "TarefasBiometric")',
  'AndroidKeyStore',
  'BIOMETRIC_STRONG',
  'setUserAuthenticationRequired(true)',
  'setInvalidatedByBiometricEnrollment(true)',
  'AES/GCM/NoPadding',
  '@PluginMethod\n    public void authenticate',
  '@PluginMethod\n    public void clear'
]) requireText(java, marker, 'TarefasBiometricPlugin.java');
rejectText(java, 'DEVICE_CREDENTIAL', 'TarefasBiometricPlugin.java');
rejectText(java, 'password', 'TarefasBiometricPlugin.java');

const sql = await readFile(path.join(root, 'supabase_v2_3_21_1_biometric_login.sql'), 'utf8');
for (const marker of [
  'security definer',
  "set search_path = ''",
  "extensions.digest(p_session_token, 'sha256')",
  's.expira_em > now()',
  'coalesce(u.ativo, true) = true',
  'revoke all on function public.v2_3_21_1_biometric_resume(text) from public',
  'grant execute on function public.v2_3_21_1_biometric_resume(text) to anon, authenticated, service_role'
]) requireText(sql, marker, 'supabase_v2_3_21_1_biometric_login.sql');
rejectText(sql, 'v_usuario.senha', 'supabase_v2_3_21_1_biometric_login.sql');

for (const htmlName of ['index.html', 'configuracoes.html', 'dashboard.html']) {
  const html = await readDist(htmlName);
  requireText(html, 'mobile-biometric-v23211.js?v=2.3.21.1-b258', htmlName);
}

const logout = await readDist('v7_5_4_patch.js');
requireText(logout, "TarefasNative?.biometric?.clear?.()", 'v7_5_4_patch.js');
requireText(logout, 'tarefasBiometricClearPending258', 'v7_5_4_patch.js');

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (packageJson.dependencies?.['@capacitor/android'] !== '8.5.0') {
  throw new Error('Capacitor Android 8.5.0 esperado.');
}

console.log('OK 2.3.21.1 build 258: biometria forte, Keystore, servidor, tela de login, Configurações e limpeza no logout validados.');
