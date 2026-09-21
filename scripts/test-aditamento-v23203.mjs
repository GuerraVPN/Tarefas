import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { jsPDF } from 'jspdf';

const dist = path.resolve(process.argv[2] || 'dist');
const aditPath = path.join(dist, 'aditamento_v74.js');
const legacyPath = path.join(dist, 'v7_4_7_aditamento_patch.js');
const aditSource = await readFile(aditPath, 'utf8');
const legacySource = await readFile(legacyPath, 'utf8');

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
  id,
  dataset: {},
  disabled: false,
  textContent: '',
  style: {},
  hidden: false,
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
  if (selector === '[data-aditamento-date]') return { value: '2026-09-05' };
  if (selector === '[data-aditamento-standby]') return { checked: false };
  if (selector === '[data-aditamento-passagem]') return { value: '08:30' };
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
function queryBuilder() {
  const query = {
    select() { return query; }, in() { return query; }, order() { return query; },
    gte() { return query; }, lte() { return query; }, eq() { return query; },
    then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); }
  };
  return query;
}
const sandbox = {
  console, document, TextEncoder, Uint8Array, Uint32Array, Blob, Map, Set, Date, URL,
  setTimeout, clearTimeout, fetch: async () => ({ ok: false }),
  alert(message) { throw new Error(`alert inesperado: ${message}`); },
  supabaseClient: { from() { return queryBuilder(); } }, jspdf: { jsPDF },
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
if (beforeLegacy !== 1 || afterLegacy !== 1) {
  throw new Error(`Geradores concorrentes detectados: antes=${beforeLegacy}, depois=${afterLegacy}.`);
}

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
if (!pdf.filename.startsWith('Aditamento_05-09-2026')) throw new Error(`Nome PDF inválido: ${pdf.filename}`);
if (!odt.filename.startsWith('Aditamento_05-09-2026')) throw new Error(`Nome ODT inválido: ${odt.filename}`);

const pdfMagic = Buffer.from(await pdf.blob.slice(0, 5).arrayBuffer()).toString('ascii');
const odtMagic = Buffer.from(await odt.blob.slice(0, 2).arrayBuffer()).toString('ascii');
if (pdfMagic !== '%PDF-') throw new Error(`Assinatura PDF inválida: ${JSON.stringify(pdfMagic)}`);
if (odtMagic !== 'PK') throw new Error(`Assinatura ZIP/ODT inválida: ${JSON.stringify(odtMagic)}`);

const odtBytes = Buffer.from(await odt.blob.arrayBuffer());
if (!odtBytes.includes(Buffer.from('application/vnd.oasis.opendocument.text'))) throw new Error('ODT sem mimetype obrigatório.');
if (!odtBytes.includes(Buffer.from('PASSAGEM DE SERVIÇO ÀS 08:30h.'))) throw new Error('ODT não preservou o horário escolhido.');

console.log(`OK: clique completo sem concorrência — PDF ${pdf.blob.size} bytes e ODT ${odt.blob.size} bytes em Downloads/TAREFAS.`);
