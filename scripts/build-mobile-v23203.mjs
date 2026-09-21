import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

// 2.3.20.3 volta ao fluxo de armazenamento comprovado nas versões 2.0.0,
// 2.1.0 e 2.2.0: MediaStore.Downloads/TAREFAS no Android 10+ e a pasta
// pública Downloads/TAREFAS com permissão limitada até o Android 9.
// A base é a 2.3.20.1 (última versão antes do experimento MediaStore.Files /
// Documentos + abertura automática da 2.3.20.2).
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23201.mjs')).href + '?v=23203');

const dist = path.join(root, 'dist');
async function patch(rel, fn) {
  const file = path.join(dist, rel);
  const before = await readFile(file, 'utf8');
  const after = fn(before);
  if (after === before) throw new Error(`2.3.20.3: correção não aplicada em ${rel}`);
  await writeFile(file, after, 'utf8');
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  const source = await readFile(file, 'utf8');
  await writeFile(
    file,
    source.replaceAll('2.3.20.1', '2.3.20.3').replaceAll('b253', 'b255'),
    'utf8'
  );
}

await patch('mobile-bootstrap.js', source => source.replace('const APP_BUILD = 253;', 'const APP_BUILD = 255;'));
await patch('mobile-preload.js', source => source.replace("tarefasAppBuild = '253'", "tarefasAppBuild = '255'"));
await patch('mobile-updates-v181.js', source => source.replace('const APP_BUILD = 253;', 'const APP_BUILD = 255;'));
await patch('mobile-schema-v239.js', source => source.replace('build:253', 'build:255'));

await patch('aditamento_v74.js', source => {
  const selectedOld = "days.push({date,includeStandby:!!row.querySelector('[data-aditamento-standby]')?.checked});";
  const selectedNew = "days.push({date,includeStandby:!!row.querySelector('[data-aditamento-standby]')?.checked,passage:row.querySelector('[data-aditamento-passagem]')?.value||'08:00'});";
  if (!source.includes(selectedOld)) throw new Error('aditamento: leitura dos dias não encontrada');
  source = source.replace(selectedOld, selectedNew);

  const rowOld = `<div class="v731-adit-date"><label>Data</label><input type="date" data-aditamento-date value="${'${date}'}"></div>
    <label class="v731-adit-check">`;
  const rowNew = `<div class="v731-adit-date"><label>Data</label><input type="date" data-aditamento-date value="${'${date}'}"></div>
    <div class="v731-adit-date"><label>Passagem de serviço</label><input type="time" data-aditamento-passagem value="08:00"></div>
    <label class="v731-adit-check">`;
  if (!source.includes(rowOld)) throw new Error('aditamento: linha de data não encontrada');
  source = source.replace(rowOld, rowNew);

  const contextOld = "context.days=dayOptions.map(opt=>({date:opt.date,includeStandby:opt.includeStandby,services:context.services.filter(x=>x.data_servico===opt.date)}));";
  const contextNew = "context.days=dayOptions.map(opt=>({date:opt.date,includeStandby:opt.includeStandby,passage:opt.passage||'08:00',services:context.services.filter(x=>x.data_servico===opt.date)}));";
  if (!source.includes(contextOld)) throw new Error('aditamento: montagem do contexto não encontrada');
  source = source.replace(contextOld, contextNew);

  const pdfPassageOld = "doc.text('- PASSAGEM DE SERVIÇO ÀS 08:00h.',17,y);";
  const pdfPassageNew = "doc.text('- PASSAGEM DE SERVIÇO ÀS '+(day.passage||'08:00')+'h.',17,y);";
  if (!source.includes(pdfPassageOld)) throw new Error('aditamento: passagem fixa do PDF não encontrada');
  source = source.replace(pdfPassageOld, pdfPassageNew);

  const odtPassageOld = "+'<text:p text:style-name=\"Bold\">- PASSAGEM DE SERVIÇO ÀS 08:00h.</text:p>'";
  const odtPassageNew = "+'<text:p text:style-name=\"Bold\">- PASSAGEM DE SERVIÇO ÀS '+aditEsc(day.passage||'08:00')+'h.</text:p>'";
  if (!source.includes(odtPassageOld)) throw new Error('aditamento: passagem fixa do ODT não encontrada');
  source = source.replace(odtPassageOld, odtPassageNew);

  source = source
    .replace('__ADITAMENTO_ANDROID_DIRECT_DOWNLOADS_V253__', '__ADITAMENTO_ANDROID_DOWNLOADS_V255__')
    .replaceAll('[ADITAMENTO 253]', '[ADITAMENTO 255]')
    .replaceAll('[ADITAMENTO 243] ODT', '[ADITAMENTO 255] ODT');

  const apiAnchor = "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();";
  const api = "window.__TAREFAS_ADITAMENTO_EXPORT_OWNER_V255__=true;window.TAREFAS_ADITAMENTO_V255=Object.freeze({generatePdf,generateOdt,buildAditamentoOdt,saveAditamentoBlob});\n";
  if (!source.includes(apiAnchor)) throw new Error('aditamento: ponto de exposição da API não encontrado');
  return source.replace(apiAnchor, api + apiAnchor);
});

// O patch 7.4.7 antigo registrava um segundo listener em captura no mesmo botão,
// chamava stopImmediatePropagation() e sempre executava PDF. Isso anulava a
// seleção ODT e também contornava o bridge nativo já corrigido.
await patch('v7_4_7_aditamento_patch.js', source => {
  const anchor = "'use strict';\n";
  if (!source.includes(anchor)) throw new Error('patch legado: cabeçalho não encontrado');
  return source.replace(anchor, anchor + "if(window.__TAREFAS_ADITAMENTO_EXPORT_OWNER_V255__)return;\n");
});

await appendFile(
  path.join(dist, 'native-mobile.js'),
  "\n;globalThis.__TAREFAS_ADITAMENTO_DOWNLOADS_V255__={path:'Downloads/TAREFAS',androidMin:24,androidTarget:36};\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.20.3 build 255: Aditamento PDF/ODT com um único gerador e MediaStore.Downloads compatível com Android 16.');
