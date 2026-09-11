import { copyFile, readFile, readdir, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const VERSION='2.3.22.3',BUILD=266;
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23221.mjs')).href+'?v=23223');
const dist=path.join(root,'dist');

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel),before=await readFile(file,'utf8'),after=fn(before);
  if(required&&after===before)throw new Error(`2.3.22.3: alteração não aplicada em ${rel}`);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-alpha-v23223-fix.js'),path.join(dist,'mobile-alpha-v23223-fix.js'));

for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);let source=await readFile(file,'utf8');
  source=source.replaceAll('2.3.22.1-b264','2.3.22.3-b266');
  if(!source.includes('mobile-alpha-v23223-fix.js')){
    const tag=`<script src="mobile-alpha-v23223-fix.js?v=${VERSION}-b${BUILD}"></script>`;
    source=source.includes('</body>')?source.replace('</body>',tag+'\n</body>'):source+'\n'+tag;
  }
  await writeFile(file,source,'utf8');
}

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.3.22.1';",`const APP_VERSION = '${VERSION}';`)
    .replace('const APP_BUILD = 264;',`const APP_BUILD = ${BUILD};`)
    .replaceAll('Alpha 2.3.22.1','Alpha 2.3.22.3')
    .replaceAll('2.3.22.1 Alpha','2.3.22.3 Alpha');
  const communication="    ['Comunicação', [\n      ['Central','central.html','Notificações e mensagens']\n    ]],";
  const replacement="    ['Comunicação', [\n      ['Notificações','central.html?tab=notificacoes','Avisos e atualizações'],\n      ['Mensagens','central.html?tab=mensagens','Conversas entre usuários'],\n      ['Downloads','central.html?tab=downloads','Arquivos salvos no aparelho'],\n      ['Favoritos','central.html?tab=favoritos','Atalhos pessoais'],\n      ['Ferramentas','central.html?tab=ferramentas','Filtros, sincronização e diagnóstico']\n    ]],";
  if(out.includes(communication))out=out.replace(communication,replacement);
  out+=`\n;globalThis.__TAREFAS_ALPHA_23223__={version:'${VERSION}',build:${BUILD},channel:'alpha',fixes:['topLevelSections','sectionRouting','alphaVersionLabel']};\n`;
  return out;
});

await patch('mobile-alpha-v23221.js',source=>source.replace("const VERSION='2.3.22.1',BUILD=264",`const VERSION='${VERSION}',BUILD=${BUILD}`));
await patch('mobile-alpha-v23221-tabs.js',source=>source.replace("const MARK='__TAREFAS_ALPHA_TABS_V264__',VERSION='2.3.22.1',BUILD=264",`const MARK='__TAREFAS_ALPHA_TABS_V266__',VERSION='${VERSION}',BUILD=${BUILD}`));
await patch('mobile-preload.js',source=>source.replace("tarefasAppVersion = '2.3.22.1'",`tarefasAppVersion = '${VERSION}'`).replace("tarefasAppBuild = '264'",`tarefasAppBuild = '${BUILD}'`));
await patch('mobile-updates-v181.js',source=>source.replace("const APP_VERSION = '2.3.22.1';",`const APP_VERSION = '${VERSION}';`).replace('const APP_BUILD = 264;',`const APP_BUILD = ${BUILD};`).replace("const APP_CHANNEL = 'beta';","const APP_CHANNEL = 'alpha';"),{required:false});
await patch('mobile-ai-v230.js',source=>source.replaceAll('ALPHA 2.3.22.1',`ALPHA ${VERSION}`).replaceAll("version:'2.3.22.1'",`version:'${VERSION}'`).replaceAll('build:264',`build:${BUILD}`),{required:false});
await patch('native-mobile.js',source=>source.replaceAll("version:'2.3.22.1'",`version:'${VERSION}'`).replaceAll('build:264',`build:${BUILD}`),{required:false});

await appendFile(path.join(dist,'mobile-bootstrap.js'),`\n;globalThis.__TAREFAS_VERSION_LABEL_V266__='${VERSION} Alpha';\n`,'utf8');
await writeFile(path.join(dist,'ALPHA_2_3_22_3.json'),JSON.stringify({version:VERSION,build:BUILD,channel:'alpha',base:'2.3.22',generatedAt:new Date().toISOString(),fixes:{topLevelSections:true,notificationCentralSeparated:true,downloadsView:true,favoritesView:true,toolsView:true,messagesView:true,versionLabel:true}},null,2)+'\n','utf8');
console.log(`TAREFAS Android ${VERSION} build ${BUILD} ALPHA: seções separadas da Central e identificação Alpha corrigida.`);
