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
requireText(bootstrap, '2.3.21', 'mobile-bootstrap.js');
requireText(bootstrap, 'const APP_BUILD = 257;', 'mobile-bootstrap.js');
rejectText(bootstrap, '2.3.20.4', 'mobile-bootstrap.js');

const updates = await readDist('mobile-updates-v181.js');
for (const marker of [
  "const APP_VERSION = '2.3.21';",
  'const APP_BUILD = 257;',
  "rpc('v2_3_21_alpha_context'",
  "rpc('v2_3_21_set_alpha_updates'",
  'state.alphaEligible',
  'id="tmAlphaUpdates"',
  "value==='alpha'?'ALPHA'",
  'serverAuthorized:true',
  "roles:['admin','moderator']"
]) requireText(updates, marker, 'mobile-updates-v181.js');
rejectText(updates, "norm(user.secao)==='admin'", 'mobile-updates-v181.js');

const native = await readDist('native-mobile.js');
requireText(native, '__TAREFAS_ALPHA_DOWNLOAD_FOLDER_V257__', 'native-mobile.js');
requireText(native, '__TAREFAS_ADITAMENTO_DOWNLOADS_V256__', 'native-mobile.js');
requireText(native, '__TAREFAS_ADITAMENTO_ODT_PDF_LAYOUT_V256__', 'native-mobile.js');

const nativeSource = await readFile(path.join(root, 'app', 'native-mobile-entry.js'), 'utf8');
requireText(nativeSource, "value==='alpha'?'Alpha'", 'app/native-mobile-entry.js');

const css = await readDist('mobile-v181.css');
requireText(css, '.tm-update-channel.alpha', 'mobile-v181.css');
requireText(css, '.tm-update-alpha', 'mobile-v181.css');

const aditamento = await readDist('aditamento_v74.js');
requireText(aditamento, '__ADITAMENTO_ODT_PDF_LAYOUT_V256__', 'aditamento_v74.js');
requireText(aditamento, 'Pictures/brasao.png', 'aditamento_v74.js');

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (packageJson.dependencies?.['@capacitor/android'] !== '8.5.0') throw new Error('Capacitor Android 8.5.0 esperado.');

for (const valid of ['2.3.21.1', '2.3.22.2', '10.20.30.400']) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(valid)) throw new Error(`Alpha válida rejeitada: ${valid}`);
}
for (const invalid of ['2.3.21', '2.3.21.1.1', '2.3.x.1']) {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(invalid)) throw new Error(`Alpha inválida aceita: ${invalid}`);
}

console.log('OK 2.3.21 build 257: botão alpha exclusivo, RPCs protegidas, pasta Alpha e padrão de quatro blocos validados.');
