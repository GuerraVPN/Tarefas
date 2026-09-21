import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v239.mjs')).href+'?final=1');
const dist=path.join(root,'dist');
await copyFile(path.join(root,'app','mobile-schema-v239.js'),path.join(dist,'mobile-schema-v239.js'));
const htmlFiles=(await readdir(dist)).filter(name=>name.endsWith('.html'));
for(const name of htmlFiles){const p=path.join(dist,name);let s=await readFile(p,'utf8');if(!s.includes('mobile-schema-v239.js'))s=s.replace(/<\/body>/i,'  <script src="mobile-schema-v239.js?v=2.3.9"></script>\n</body>');await writeFile(p,s,'utf8')}
console.log(`TAREFAS Android 2.3.9 build 239: verificação automática de schema injetada em ${htmlFiles.length} telas.`);
