import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { jsPDF } from 'jspdf';

const dist = path.resolve(process.argv[2] || 'dist');
const aditSource = await readFile(path.join(dist, 'aditamento_v74.js'), 'utf8');
const legacySource = await readFile(path.join(dist, 'v7_4_7_aditamento_patch.js'), 'utf8');
let logoBytes;
try { logoBytes = await readFile(path.join(dist, 'brasao_exercito_v742.png')); }
catch { logoBytes = await readFile(path.join(dist, 'brasao_exercito.png')); }

const listeners = new Map();
const saved = [];
let selectedFormat = 'pdf';

function on(id, type, handler) {
  const key = `${id}:${type}`;
  const list = listeners.get(key) || [];
  list.push(handler);
  listeners.set(key, list);
}
const button = id => ({
  id, dataset: {}, disabled: false, textContent: '', style: {}, hidden: false,
  addEventListener(type, handler) { on(id, type, handler); }
});
const open = button('generateAddendum');
const add = button('aditamentoAddDia');
const go = button('aditamentoGerar');
const cancel = button('aditamentoCancelar');
const close = button('aditamentoClose');
const status = { textContent: '', style: {}, parentElement: null };
const modal = { classList: { toggle() {}, remove() {} }, addEventListener(type, handler) { on('aditamentoModal', type, handler); } };
const ids = { generateAddendum: open, aditamentoAddDia: add, aditamentoGerar: go, aditamentoCancelar: cancel, aditamentoClose: close, aditamentoStatus: status, aditamentoModal: modal };
const dayRow = { querySelector(selector) {
  if (selector === '[data-aditamento-date]') return { value: '2026-09-04' };
  if (selector === '[data-aditamento-standby]') return { checked: false };
  if (selector === '[data-aditamento-passagem]') return { value: '08:00' };
  return null;
} };
const generic = () => ({
  style: {}, dataset: {}, hidden: false, innerHTML: '', className: '',
  classList: { toggle() {}, add() {}, remove() {} },
  appendChild() {}, append() {}, remove() {}, after() {}, setAttribute() {},
  addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }
});
const document = {
  readyState: 'complete', body: generic(), head: generic(),
  getElementById(id) { return ids[id] || null; },
  querySelector(selector) {
    if (selector === 'input[name="aditamentoFormato"]:checked') return { value: selectedFormat };
    return null;
  },
  querySelectorAll(selector) {
    if (selector === '[data-aditamento-dia]') return [dayRow];
    return [];
  },
  createElement() { return generic(); }, addEventListener() {}
};

const serviceRows = [
  { id: 1, grupo: 'motorista', usuario_id: 101, pessoa_externa_id: null, data_servico: '2026-09-04', marcacao: null, observacao: null },
  { id: 2, grupo: 'patrulheiro', usuario_id: 102, pessoa_externa_id: null, data_servico: '2026-09-04', marcacao: null, observacao: null },
  { id: 3, grupo: 'permanencia', usuario_id: 103, pessoa_externa_id: null, data_servico: '2026-09-04', marcacao: null, observacao: null }
];
const users = [
  { id: 101, patente: 'Sd', nome_guerra: 'Teles, Reis', nome_completo: 'Teles, Reis' },
  { id: 102, patente: 'Sd', nome_guerra: 'Da Silva', nome_completo: 'Da Silva' },
  { id: 103, patente: 'Sd Ev', nome_guerra: 'Almeida', nome_completo: 'Almeida' }
];
function queryBuilder(table) {
  const query = {
    select() { return query; }, in() { return query; }, order() { return query; },
    gte() { return query; }, lte() { return query; }, eq() { return query; },
    then(resolve) {
      const data = table === 'escala_servicos' ? serviceRows : table === 'usuarios' ? users : [];
      return Promise.resolve({ data, error: null }).then(resolve);
    }
  };
  return query;
}
class TestFileReader {
  readAsDataURL(blob) {
    blob.arrayBuffer().then(buffer => {
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buffer).toString('base64')}`;
      this.onload?.({ target: this });
    }, error => this.onerror?.(error));
  }
}
const sandbox = {
  console, document, TextEncoder, Uint8Array, Uint32Array, Blob, Map, Set, Date, URL,
  atob, FileReader: TestFileReader, setTimeout, clearTimeout,
  fetch: async () => ({ ok: true, blob: async () => new Blob([logoBytes], { type: 'image/png' }) }),
  alert(message) { throw new Error(`alert inesperado: ${message}`); },
  supabaseClient: { from(table) { return queryBuilder(table); } }, jspdf: { jsPDF },
  TarefasNative: {
    isNative: true,
    files: {
      async saveBlob(blob, filename) {
        saved.push({ blob, filename });
        return { ok: true, saved: true, path: `Downloads/TAREFAS/${filename}`, uri: `content://downloads/${filename}` };
      }
    }
  }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(aditSource, sandbox, { filename: 'aditamento_v74.js' });

const beforeLegacy = listeners.get('aditamentoGerar:click')?.length || 0;
vm.runInContext(legacySource, sandbox, { filename: 'v7_4_7_aditamento_patch.js' });
const afterLegacy = listeners.get('aditamentoGerar:click')?.length || 0;
if (beforeLegacy !== 1 || afterLegacy !== 1) throw new Error(`Geradores concorrentes detectados: antes=${beforeLegacy}, depois=${afterLegacy}.`);

const handler = listeners.get('aditamentoGerar:click')[0];
selectedFormat = 'pdf';
await handler({ preventDefault() {}, stopImmediatePropagation() {} });
selectedFormat = 'odt';
await handler({ preventDefault() {}, stopImmediatePropagation() {} });

if (saved.length !== 2) throw new Error(`Esperava exatamente 2 salvamentos; recebeu ${saved.length}.`);
const pdf = saved.find(item => item.filename.endsWith('.pdf'));
const odt = saved.find(item => item.filename.endsWith('.odt'));
if (!pdf || !odt) throw new Error('O clique unificado não gerou os dois formatos.');
if (pdf.blob.type !== 'application/pdf') throw new Error(`MIME PDF inválido: ${pdf.blob.type}`);
if (odt.blob.type !== 'application/vnd.oasis.opendocument.text') throw new Error(`MIME ODT inválido: ${odt.blob.type}`);
if (pdf.filename !== 'Aditamento_04-09-2026.pdf') throw new Error(`Nome PDF inválido: ${pdf.filename}`);
if (odt.filename !== 'Aditamento_04-09-2026.odt') throw new Error(`Nome ODT inválido: ${odt.filename}`);

const pdfBytes = Buffer.from(await pdf.blob.arrayBuffer());
const odtBytes = Buffer.from(await odt.blob.arrayBuffer());
if (pdfBytes.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error('Assinatura PDF inválida.');
if (odtBytes.subarray(0, 2).toString('ascii') !== 'PK') throw new Error('Assinatura ZIP/ODT inválida.');

for (const needle of [
  'application/vnd.oasis.opendocument.text',
  'Pictures/brasao.png',
  '<draw:image xlink:href="Pictures/brasao.png"',
  'fo:border="1.5pt double #0f172a"',
  'style:column-width="5.5cm"',
  'style:column-width="2.2cm"',
  'style:column-width="9.9cm"',
  'fo:background-color="#e1e1e1"',
  'ADITAMENTO AO BOLETIM INTERNO DA 6ª BRIGADA DE INFANTARIA BLINDADA',
  'SERVIÇO PARA O DIA 04 DE SETEMBRO DE 2026 (Sexta-feira)',
  'Teles, Reis',
  'Da Silva',
  'Almeida',
  'PASSAGEM DE SERVIÇO ÀS 08:00h.',
  'GUILLEN GABRIEL DOS SANTOS SILVA - 1º Ten'
]) if (!odtBytes.includes(Buffer.from(needle))) throw new Error(`ODT sem o elemento do PDF: ${needle}`);

const fixtureDir = process.env.ADITAMENTO_FIXTURE_DIR;
if (fixtureDir) {
  const output = path.resolve(fixtureDir);
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, pdf.filename), pdfBytes);
  await writeFile(path.join(output, odt.filename), odtBytes);
  console.log(`Fixtures gravadas em ${output}`);
}

console.log(`OK: PDF ${pdf.blob.size} bytes e ODT ${odt.blob.size} bytes, com os mesmos dados, brasão, moldura e tabela.`);
