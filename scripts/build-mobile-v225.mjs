import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = path.resolve('scripts/build-mobile-v224.mjs');
const tempPath = path.resolve('scripts/.build-mobile-v225-fixed.mjs');
let source = await readFile(sourcePath, 'utf8');
const broken = 'setInterval(()=>{if(moduloCargaAtivo())refresh(true)},300000);"\n]);';
const fixed = 'setInterval(()=>{if(moduloCargaAtivo())refresh(true)},300000);"]\n]);';
if (!source.includes(broken)) throw new Error('Ponto de correção do build 2.2.5 não encontrado.');
source = source.replace(broken, fixed);
await writeFile(tempPath, source, 'utf8');
try {
  await import(pathToFileURL(tempPath).href + '?v=225');
} finally {
  await rm(tempPath, { force: true });
}
