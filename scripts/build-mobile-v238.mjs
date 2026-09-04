import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v237.mjs')).href+'?v=238');
const dist=path.join(root,'dist');
async function rep(rel,from,to){const p=path.join(dist,rel);let s=await readFile(p,'utf8');if(!s.includes(from))throw new Error(`${rel}: trecho não encontrado: ${from}`);s=s.split(from).join(to);await writeFile(p,s,'utf8')}
for(const name of await readdir(dist)){if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;const p=path.join(dist,name);let s=await readFile(p,'utf8');s=s.replaceAll('2.3.7','2.3.8');await writeFile(p,s,'utf8')}
await rep('mobile-bootstrap.js','const APP_BUILD = 237;','const APP_BUILD = 238;');
await rep('mobile-preload.js',"tarefasAppBuild = '237'","tarefasAppBuild = '238'");
await rep('mobile-updates-v181.js','const APP_BUILD = 237;','const APP_BUILD = 238;');
await copyFile(path.join(root,'app','mobile-ai-auto-file-v238.js'),path.join(dist,'mobile-ai-auto-file-v238.js'));
const htmlFiles=(await readdir(dist)).filter(name=>name.endsWith('.html'));
for(const name of htmlFiles){const p=path.join(dist,name);let s=await readFile(p,'utf8');if(!s.includes('mobile-ai-auto-file-v238.js'))s=s.replace(/<\/body>/i,'  <script src="mobile-ai-auto-file-v238.js?v=2.3.8"></script>\n</body>');await writeFile(p,s,'utf8')}
console.log(`TAREFAS Android 2.3.8 build 238 BETA / Web base 7.8.2: geração automática de arquivos IA em ${htmlFiles.length} telas.`);