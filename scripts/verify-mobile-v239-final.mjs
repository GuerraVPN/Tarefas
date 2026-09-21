import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=path.resolve(process.argv[2]||'dist');
await import(pathToFileURL(path.resolve('scripts/verify-mobile-v239.mjs')).href+'?final=1');
const schemaFile=path.join(root,'mobile-schema-v239.js');
await access(schemaFile);
const schema=await readFile(schemaFile,'utf8');
for(const marker of ['__TAREFAS_ANDROID_239_SCHEMA_CHECK__',"from('app_versions').select('id,version,version_name,build')","from('orc_depositos').select('id,atualizado_em')","from('orc_passagens_carga').select('id,detentor_anterior_usuario_id,novo_detentor_usuario_id,atualizado_em')","from('pedidos_orcamentarios').select('id,numero,tipo,status,atualizado_em')"]){if(!schema.includes(marker))throw new Error(`mobile-schema-v239.js: marcador ausente: ${marker}`)}
for(const name of ['index.html','central.html','usuarios.html','orcamentarios.html','missao.html','minhas_tarefas.html']){const s=await readFile(path.join(root,name),'utf8');if(!s.includes('mobile-schema-v239.js'))throw new Error(`${name}: schema check 2.3.9 não injetado`)}
console.log('OK: 2.3.9 verifica automaticamente o schema esperado na inicialização.');
