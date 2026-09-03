import { readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(process.argv[2] || '.');
const errors = [];
const entries = await readdir(root);
const htmlFiles = entries.filter(name => name.endsWith('.html')).sort();
const jsFiles = entries.filter(name => name.endsWith('.js')).sort();

for (const name of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, name)], {
    encoding: 'utf8'
  });
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
    if (!target.startsWith(root + path.sep)) {
      errors.push(`${name}: referência fora da raiz: ${raw}`);
      continue;
    }
    try {
      if (!(await stat(target)).isFile()) errors.push(`${name}: arquivo local ausente: ${raw}`);
    } catch {
      errors.push(`${name}: arquivo local ausente: ${raw}`);
    }
  }

  const inline = /<script\b(?![^>]*\bsrc\s*=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let index = 0;
  for (const match of html.matchAll(inline)) {
    index += 1;
    if (/\btype\s*=\s*["'](?:application\/json|application\/ld\+json)["']/i.test(match[1])) continue;
    try {
      new vm.Script(match[2], { filename: `${name}#inline-${index}` });
    } catch (error) {
      errors.push(`${name}: script inline ${index} inválido: ${error.message}`);
    }
  }
}

console.log(`Verificados ${htmlFiles.length} HTML e ${jsFiles.length} JavaScript.`);
if (errors.length) {
  for (const error of errors) console.error(`ERRO: ${error}`);
  process.exit(1);
}
console.log('OK: sintaxe e referências locais válidas.');
