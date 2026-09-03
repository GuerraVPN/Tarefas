import { access, readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
const errors = [];
const required = [
  'index.html', 'dashboard.html', 'about.html', 'configuracoes.html', 'central.html',
  'orcamentarios.html', 'pessoal.html', 'games.html', 'menu.html', 'minhas_tarefas.html',
  'mobile-bootstrap.js', 'mobile-preload.js', 'mobile-login-v17.js', 'mobile-v12.js',
  'mobile-updates-v181.js', 'native-mobile.js', 'v7_5_1_version.js', 'v7_5_1_about.js',
  'v7_7_0_material_carga.js', 'v4_ui.js'
];
async function exists(rel) { try { await access(path.join(root, rel)); return true; } catch { return false; } }
async function text(rel) { return readFile(path.join(root, rel), 'utf8'); }
for (const rel of required) if (!await exists(rel)) errors.push(`arquivo ausente: ${rel}`);

const markers = {
  'mobile-bootstrap.js': ["const APP_VERSION = '2.2.4'", 'const APP_BUILD = 224', "const WEB_VERSION = '7.7.1'"],
  'mobile-preload.js': ["tarefasAppVersion = '2.2.4'", "tarefasAppBuild = '224'"],
  'mobile-v12.js': ['2.2.4 • WEB 7.7.1'],
  'mobile-updates-v181.js': ["const APP_VERSION = '2.2.4'", 'const APP_BUILD = 224', "const APP_CHANNEL = 'beta'"],
  'mobile-login-v17.js': ['v7_7_1_autenticar_usuario', 'session_token'],
  'native-mobile.js': ['2.2.4', 'tarefas:update-download-progress'],
  'v7_5_1_version.js': ["VERSION='7.7.1'"],
  'v7_5_1_about.js': ["const VERSION='7.7.1';", 'Auditoria geral e estabilidade do login'],
  'index.html': ['v7_7_1_autenticar_usuario', 'mobile-login-v17.js'],
  'orcamentarios.html': ['v7_7_0_material_carga.js?v=2.2.4']
};
for (const [rel, expected] of Object.entries(markers)) if (await exists(rel)) {
  const source = await text(rel);
  for (const marker of expected) if (!source.includes(marker)) errors.push(`${rel}: marcador ausente: ${marker}`);
}

const entries = await readdir(root);
const htmlFiles = entries.filter(name => name.endsWith('.html'));
const injected = ['mobile-preload.js', 'mobile.css', 'mobile-bootstrap.js', 'native-mobile.js', 'mobile-updates-v181.js'];
for (const rel of htmlFiles) {
  const html = await text(rel);
  for (const asset of injected) if (!html.includes(asset)) errors.push(`${rel}: injeção ausente: ${asset}`);
  if (html.includes('?v=7.7.1') || html.includes('?v=2.2.3')) errors.push(`${rel}: cache antigo no APK`);
}
for (const rel of entries.filter(name => name.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, rel)], { encoding: 'utf8' });
  if (result.status !== 0) errors.push(`${rel}: JavaScript inválido: ${result.stderr.trim()}`);
}

let total = 0;
for (const rel of entries) {
  const info = await stat(path.join(root, rel));
  if (info.isFile()) total += info.size;
}
if (htmlFiles.length < 17) errors.push(`HTML esperados pelo menos 17, encontrados ${htmlFiles.length}`);
if (total < 100000) errors.push('bundle pequeno demais');
console.log(`VERIFY 2.2.4 build 224 BETA / WEB 7.7.1: ${htmlFiles.length} telas, ${total} bytes.`);
if (errors.length) {
  for (const error of errors) console.error(`ERRO: ${error}`);
  process.exit(1);
}
console.log('OK: bundle Android reproduzível e validado.');
