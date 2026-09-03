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
  'v7_7_0_material_carga.js', 'v7_6_5_webfix.js', 'v6_2_mobile.js', 'v6_5_patch.js',
  'v7_4_12_site.js', 'v7_4_12_global.js', 'v4_ui.js'
];
async function exists(rel) { try { await access(path.join(root, rel)); return true; } catch { return false; } }
async function text(rel) { return readFile(path.join(root, rel), 'utf8'); }
for (const rel of required) if (!await exists(rel)) errors.push(`arquivo ausente: ${rel}`);

console.log('CONFERÊNCIA 1/3 — Integridade, versão e sintaxe');
const markers = {
  'mobile-bootstrap.js': ["const APP_VERSION = '2.2.5'", 'const APP_BUILD = 225', "const WEB_VERSION = '7.7.1'"],
  'mobile-preload.js': ["tarefasAppVersion = '2.2.5'", "tarefasAppBuild = '225'"],
  'mobile-v12.js': ['2.2.5 • WEB 7.7.1'],
  'mobile-updates-v181.js': ["const APP_VERSION = '2.2.5'", 'const APP_BUILD = 225', "const APP_CHANNEL = 'beta'"],
  'mobile-login-v17.js': ['v7_7_1_autenticar_usuario', 'session_token'],
  'native-mobile.js': ['2.2.5', 'tarefas:update-download-progress'],
  'v7_5_1_about.js': ["const VERSION='7.7.1';", 'Auditoria geral e estabilidade do login'],
  'index.html': ['v7_7_1_autenticar_usuario', 'mobile-login-v17.js'],
  'orcamentarios.html': ['v7_7_0_material_carga.js?v=2.2.5']
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
  if (html.includes('?v=7.7.1') || html.includes('?v=2.2.4') || html.includes('?v=2.2.3')) errors.push(`${rel}: cache antigo no APK`);
}
for (const rel of entries.filter(name => name.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, rel)], { encoding: 'utf8' });
  if (result.status !== 0) errors.push(`${rel}: JavaScript inválido: ${result.stderr.trim()}`);
}

console.log('CONFERÊNCIA 2/3 — Correções de desempenho e gatilhos globais');
const perfMarkers = {
  'v6_2_mobile.js': ['__TAREFAS_V225_LIGHT_LOADER__', "['games.html','about.html','orcamentarios.html']"],
  'v6_5_patch.js': ['window.__TAREFAS_NATIVE_APP__?60000:30000', 'if(window.__TAREFAS_NATIVE_APP__)return;'],
  'v7_4_12_site.js': ['window.__TAREFAS_NATIVE_APP__?30000:5000'],
  'v7_4_12_global.js': ['window.__TAREFAS_NATIVE_APP__?120000:30000', "if(!window.__TAREFAS_NATIVE_APP__)renderAdminOnline()"],
  'v7_5_1_version.js': ['if(window.__TAREFAS_NATIVE_APP__)return;', 'window.__TAREFAS_NATIVE_APP__?30000:5000'],
  'v7_6_5_webfix.js': ["if(label.textContent!==text)label.textContent=text", 'if(window.__TAREFAS_NATIVE_APP__)return;']
};
for (const [rel, expected] of Object.entries(perfMarkers)) if (await exists(rel)) {
  const source = await text(rel);
  for (const marker of expected) if (!source.includes(marker)) errors.push(`${rel}: correção de desempenho ausente: ${marker}`);
}

console.log('CONFERÊNCIA 3/3 — Material Carga, Depósitos e pós-processo');
if (await exists('v7_7_0_material_carga.js')) {
  const source = await text('v7_7_0_material_carga.js');
  const materialMarkers = [
    "const NATIVE=!!window.__TAREFAS_NATIVE_APP__",
    "days=type==='deposito'?30:90",
    "p_motivo_atualizacao:hasPending?'pos_processo':'periodica'",
    'detectProcessCompletion',
    'bindProcessWatcher',
    'moduloCargaAtivo()',
    'setInterval(()=>{if(moduloCargaAtivo())refresh(true)},300000)'
  ];
  for (const marker of materialMarkers) if (!source.includes(marker)) errors.push(`v7_7_0_material_carga.js: regra/conferência ausente: ${marker}`);
}

let total = 0;
for (const rel of entries) {
  const info = await stat(path.join(root, rel));
  if (info.isFile()) total += info.size;
}
if (htmlFiles.length < 17) errors.push(`HTML esperados pelo menos 17, encontrados ${htmlFiles.length}`);
if (total < 100000) errors.push('bundle pequeno demais');
console.log(`VERIFY 2.2.5 build 225 BETA / WEB 7.7.1: ${htmlFiles.length} telas, ${total} bytes.`);
if (errors.length) {
  for (const error of errors) console.error(`ERRO: ${error}`);
  process.exit(1);
}
console.log('OK: 3/3 conferências concluídas; bundle Android reproduzível e validado.');
