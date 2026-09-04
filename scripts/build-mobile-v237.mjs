import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v236.mjs')).href+'?v=237');
const dist=path.join(root,'dist');
async function rep(rel,from,to){const p=path.join(dist,rel);let s=await readFile(p,'utf8');if(!s.includes(from))throw new Error(`${rel}: trecho não encontrado: ${from}`);s=s.split(from).join(to);await writeFile(p,s,'utf8')}
for(const name of await readdir(dist)){if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;const p=path.join(dist,name);let s=await readFile(p,'utf8');s=s.replaceAll('2.3.6','2.3.7');await writeFile(p,s,'utf8')}
await rep('mobile-bootstrap.js',"const APP_BUILD = 236;","const APP_BUILD = 237;");
await rep('mobile-preload.js',"tarefasAppBuild = '236'","tarefasAppBuild = '237'");
await rep('mobile-updates-v181.js',"const APP_BUILD = 236;","const APP_BUILD = 237;");
await copyFile(path.join(root,'app','mobile-ai-tools-v237.js'),path.join(dist,'mobile-ai-tools-v237.js'));
const htmlFiles=(await readdir(dist)).filter(name=>name.endsWith('.html'));
for(const name of htmlFiles){const p=path.join(dist,name);let s=await readFile(p,'utf8');if(!s.includes('mobile-ai-tools-v237.js'))s=s.replace(/<\/body>/i,'  <script src="mobile-ai-tools-v237.js?v=2.3.7"></script>\n</body>');await writeFile(p,s,'utf8')}
console.log(`TAREFAS Android 2.3.7 build 237 BETA / Web base 7.8.2: copiar respostas e exportar IA em ${htmlFiles.length} telas.`);
