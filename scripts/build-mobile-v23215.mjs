import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23214.mjs')).href + '?v=23215');
const dist = path.join(root, 'dist');

async function patchFile(rel, transform) {
  const file = path.join(dist, rel);
  const before = await readFile(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`2.3.21.5: alteracao nao aplicada em ${rel}`);
  await writeFile(file, after, 'utf8');
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  const source = await readFile(file, 'utf8');
  await writeFile(file, source.replaceAll('2.3.21.4', '2.3.21.5').replaceAll('b261', 'b262'), 'utf8');
}

await patchFile('mobile-bootstrap.js', source => {
  source = source.replace('const APP_BUILD = 261;', 'const APP_BUILD = 262;');
  const anchor = '<li>Anexos das tarefas em data: e blob: agora são convertidos em arquivo real no Android.</li>';
  const additions = '<li>Perfis Auxiliar agora conseguem criar tarefas pela IA dentro das permissões normais do perfil ativo.</li>\\n          <li>A criação pela IA completa automaticamente código e campos legados obrigatórios sem exigir Admin/Chefe.</li>\\n          <li>O vínculo de responsável da IA passa a usar a tarefa recém-criada quando o tarefa_id ainda não existe no planejamento.</li>\\n          ' + anchor;
  return source.includes(anchor) ? source.replace(anchor, additions) : source;
});
await patchFile('mobile-preload.js', source => source.replace("tarefasAppBuild = '261'", "tarefasAppBuild = '262'"));
await patchFile('mobile-updates-v181.js', source => source.replace('const APP_BUILD = 261;', 'const APP_BUILD = 262;'));
await patchFile('mobile-schema-v239.js', source => source.replace('build:261', 'build:262'));

await patchFile('mobile-ai-v230.js', source => source.replace(
  "if(code==='action_failed')return'A alteração foi autorizada, mas o banco recusou a operação.';",
  "if(code==='action_failed')return'A alteração passou pela autorização do perfil, mas o banco recusou por uma regra de integridade. Tente novamente ou informe o erro ao suporte.';"
));

await appendFile(
  path.join(dist, 'mobile-ai-v230.js'),
  "\n;globalThis.__TAREFAS_AI_AUXILIAR_TASKS_V262__={version:'2.3.21.5',build:262,auxiliarTaskCreate:true,taskCodeFallback:true,responsibleTaskLink:true,noPrivilegeElevation:true};\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.21.5 build 262 ALPHA: criação de tarefas pela IA corrigida para perfis Auxiliar sem elevar privilégios.');
