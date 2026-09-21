import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.resolve(process.argv[2] || 'dist');
const readDist = rel => readFile(path.join(dist, rel), 'utf8');
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) throw new Error(`${label}: marcador ausente: ${needle}`);
};
const rejectText = (text, needle, label) => {
  if (text.includes(needle)) throw new Error(`${label}: fluxo incompatível presente: ${needle}`);
};

const bootstrap = await readDist('mobile-bootstrap.js');
requireText(bootstrap, '2.3.20.4', 'mobile-bootstrap.js');
requireText(bootstrap, 'const APP_BUILD = 256;', 'mobile-bootstrap.js');

const html = await readDist('pessoal.html');
requireText(html, 'jspdf.umd.min.js?v=2.3.20.4-b256', 'pessoal.html');
requireText(html, 'aditamento_v74.js?v=2.3.20.4-b256', 'pessoal.html');
rejectText(html, 'cdn.jsdelivr.net/npm/jspdf', 'pessoal.html');

const adit = await readDist('aditamento_v74.js');
for (const marker of [
  '__ADITAMENTO_ANDROID_DOWNLOADS_V256__',
  '__TAREFAS_ADITAMENTO_EXPORT_OWNER_V256__',
  '__ADITAMENTO_ODT_PDF_LAYOUT_V256__',
  'window.TAREFAS_ADITAMENTO_V256=Object.freeze',
  'buildPdf,buildAditamentoOdt',
  'Pictures/brasao.png',
  '1.5pt double #0f172a',
  'style:column-width="5.5cm"',
  'style:column-width="2.2cm"',
  'style:column-width="9.9cm"',
  'fo:background-color="#e1e1e1"',
  'data-aditamento-passagem',
  "day.passage||'08:00'",
  "saveAditamentoBlob(doc.output('blob'),filename)",
  'application/vnd.oasis.opendocument.text'
]) requireText(adit, marker, 'aditamento_v74.js');
rejectText(adit, 'Documentos/TAREFAS/Documentos', 'aditamento_v74.js');

const legacy = await readDist('v7_4_7_aditamento_patch.js');
requireText(legacy, 'if(window.__TAREFAS_ADITAMENTO_EXPORT_OWNER_V256__)return;', 'v7_4_7_aditamento_patch.js');

const native = await readDist('native-mobile.js');
requireText(native, '__TAREFAS_ADITAMENTO_DOWNLOADS_V256__', 'native-mobile.js');
requireText(native, '__TAREFAS_ADITAMENTO_ODT_PDF_LAYOUT_V256__', 'native-mobile.js');
requireText(native, 'saveBase64ToDownloads', 'native-mobile.js');
requireText(native, 'Downloads/TAREFAS', 'native-mobile.js');
rejectText(native, 'saveBase64ToDocuments', 'native-mobile.js');

const nativeSource = await readFile(path.join(root, 'app', 'native-mobile-entry.js'), 'utf8');
requireText(nativeSource, "StorageAccess.saveBase64ToDownloads({data,filename:name,mimeType:blob.type||'application/octet-stream',subfolder:DOWNLOADS_FOLDER})", 'app/native-mobile-entry.js');
requireText(nativeSource, "'application/vnd.oasis.opendocument.text':'.odt'", 'app/native-mobile-entry.js');
rejectText(nativeSource, 'saveBase64ToDocuments', 'app/native-mobile-entry.js');

const java = await readFile(path.join(root, 'app', 'android', 'StorageAccessPlugin.java'), 'utf8');
requireText(java, 'MediaStore.Downloads.EXTERNAL_CONTENT_URI', 'StorageAccessPlugin.java');
requireText(java, 'Environment.DIRECTORY_DOWNLOADS', 'StorageAccessPlugin.java');
requireText(java, 'public void saveBase64ToDownloads(PluginCall call)', 'StorageAccessPlugin.java');
rejectText(java, 'public void saveBase64ToDocuments', 'StorageAccessPlugin.java');
rejectText(java, 'MediaStore.Files.getContentUri', 'StorageAccessPlugin.java');

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (packageJson.dependencies?.['@capacitor/android'] !== '8.5.0') throw new Error('Capacitor Android 8.5.0 esperado para SDK 36.');

console.log('OK 2.3.20.4 build 256: ODT espelha o layout do PDF e ambos usam Downloads/TAREFAS no Android 7-16.');
