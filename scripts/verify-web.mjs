import { readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(process.argv[2] || '.');
const errors = [];
const entries = await readdir(root);
const htmlFiles = entries.filter(name => name.endsWith('.html')).sort();
const jsFiles = entries.filter(name => name.endsWith('.js')).sort();

console.log('CONFERÊNCIA 1/3 — Sintaxe e referências locais');
for (const name of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, name)], { encoding: 'utf8' });
  if (result.status !== 0) errors.push(`${name}: JavaScript inválido\n${result.stderr.trim()}`);
}

const localRef = /\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi;
for (const name of htmlFiles) {
  const html = await readFile(path.join(root, name), 'utf8');
  if (/^(?:<{7}|={7}|>{7})/m.test(html)) errors.push(`${name}: marcador de conflito Git`);
  for (const match of html.matchAll(localRef)) {
    const raw = match[2].trim();
    if (!raw || raw.includes('${') || /^(?:https?:|data:|blob:|mailto:|tel:|javascript:|#|\/\/)/i.test(raw)) continue;
    const rel = decodeURIComponent(raw.split(/[?#]/, 1)[0]);
    if (!rel || rel.startsWith('/')) continue;
    const target = path.resolve(root, rel);
    if (!target.startsWith(root + path.sep)) { errors.push(`${name}: referência fora da raiz: ${raw}`); continue; }
    try { if (!(await stat(target)).isFile()) errors.push(`${name}: arquivo local ausente: ${raw}`); }
    catch { errors.push(`${name}: arquivo local ausente: ${raw}`); }
  }
  const inline = /<script\b(?![^>]*\bsrc\s*=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let index = 0;
  for (const match of html.matchAll(inline)) {
    index += 1;
    if (/\btype\s*=\s*["'](?:application\/json|application\/ld\+json)["']/i.test(match[1])) continue;
    try { new vm.Script(match[2], { filename: `${name}#inline-${index}` }); }
    catch (error) { errors.push(`${name}: script inline ${index} inválido: ${error.message}`); }
  }
}

console.log('CONFERÊNCIA 2/3 — Anti-travamento global');
const requiredMarkers = {
  'v6_2_mobile.js':['__TAREFAS_V771_PAGE_LOADER__',"'about.html','games.html','orcamentarios.html'",'v7_7_1_site_light.js'],
  'v6_5_patch.js':['HEARTBEAT_MS=60000','PRESENCE_REFRESH_MS=60000','presenceVisualPage()'],
  'v7_7_1_site_light.js':['POLL_MS=30000']
};
for (const [name,markers] of Object.entries(requiredMarkers)) {
  const src=await readFile(path.join(root,name),'utf8').catch(()=> '');
  if(!src){errors.push(`${name}: arquivo obrigatório ausente`);continue}
  for(const marker of markers)if(!src.includes(marker))errors.push(`${name}: marcador de desempenho ausente: ${marker}`);
}
const v65=await readFile(path.join(root,'v6_5_patch.js'),'utf8');
if(v65.includes('postgres_changes'))errors.push('v6_5_patch.js: realtime global de presença não pode voltar');
if(v65.includes('document.documentElement,{subtree:true'))errors.push('v6_5_patch.js: MutationObserver global não pode voltar');

console.log('CONFERÊNCIA 3/3 — Orçamentários e Material Carga');
const comum=await readFile(path.join(root,'sistema_comum.js'),'utf8');
for(const marker of ['__TAREFAS_ORC_ACTIVE_MODULE__','guias_v6.js','pedidos_v6.js','movimentacoes_v6.js','material_carga_v6.js','passagem_carga_v6.js','lavanderia_v211.js'])
  if(!comum.includes(marker))errors.push(`sistema_comum.js: lazy-load Orçamentário incompleto: ${marker}`);
const carga=await readFile(path.join(root,'v7_7_0_material_carga.js'),'utf8');
for(const marker of ["days=type==='deposito'?30:90","hasPending?'pos_processo':'periodica'","detectProcessCompletion","bindProcessWatcher"])
  if(!carga.includes(marker))errors.push(`v7_7_0_material_carga.js: regra de conferência ausente: ${marker}`);

console.log(`Verificados ${htmlFiles.length} HTML e ${jsFiles.length} JavaScript.`);
if (errors.length) {
  for (const error of errors) console.error(`ERRO: ${error}`);
  process.exit(1);
}
console.log('OK: 3/3 conferências concluídas; sintaxe, desempenho e regras do Orçamentário válidos.');
