import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v235.mjs')).href+'?v=236');
const dist=path.join(root,'dist');
async function rep(rel,from,to){const p=path.join(dist,rel);let s=await readFile(p,'utf8');if(!s.includes(from))throw new Error(`${rel}: trecho não encontrado: ${from}`);s=s.split(from).join(to);await writeFile(p,s,'utf8')}
for(const name of await readdir(dist)){if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;const p=path.join(dist,name);let s=await readFile(p,'utf8');s=s.replaceAll('2.3.5','2.3.6');await writeFile(p,s,'utf8')}
await rep('mobile-bootstrap.js',"const APP_BUILD = 235;","const APP_BUILD = 236;");
await rep('mobile-preload.js',"tarefasAppBuild = '235'","tarefasAppBuild = '236'");
await rep('mobile-updates-v181.js',"const APP_BUILD = 235;","const APP_BUILD = 236;");
await copyFile(path.join(root,'app','mobile-chat-fit-v236.js'),path.join(dist,'mobile-chat-fit-v236.js'));
for(const rel of ['usuarios.html','central.html']){const p=path.join(dist,rel);let s=await readFile(p,'utf8');if(!s.includes('mobile-chat-fit-v236.js'))s=s.replace(/<\/body>/i,'  <script src="mobile-chat-fit-v236.js?v=2.3.6"></script>\n</body>');await writeFile(p,s,'utf8')}
console.log('TAREFAS Android 2.3.6 build 236 BETA / Web base 7.8.2: chat medido entre header e barra inferior reais.');
