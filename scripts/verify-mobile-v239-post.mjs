import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=path.resolve(process.argv[2]||'dist');
await import(pathToFileURL(path.resolve('scripts/verify-mobile-v239-final.mjs')).href+'?post=1');
const ai=await readFile(path.join(root,'mobile-ai-schema-v239.js'),'utf8');
for(const marker of ['__TAREFAS_ANDROID_239_AI_SCHEMA_HINTS__','pedidos_orcamentarios: id, numero','guias_orcamentarias: id, numero','NÃO use detentor_origem'])if(!ai.includes(marker))throw new Error('mobile-ai-schema-v239.js: marcador ausente: '+marker);
for(const name of ['index.html','central.html','usuarios.html','orcamentarios.html','missao.html','minhas_tarefas.html']){const s=await readFile(path.join(root,name),'utf8');if(!s.includes('mobile-ai-schema-v239.js'))throw new Error(`${name}: schema IA 2.3.9 não injetado`)}
try{await access(path.join(root,'v7_7_2_scale_export.js'));throw new Error('Gerar escala ainda presente no bundle')}catch(e){if(!String(e?.message||'').includes('Gerar escala ainda presente')){/* esperado: arquivo ausente */}else throw e}
const adit=await readFile(path.join(root,'aditamento_v74.js'),'utf8');
for(const m of ['ADITAMENTO_ODT','buildAditamentoOdt','name="aditamentoFormato"','Gerar ODT'])if(!adit.includes(m))throw new Error('aditamento_v74.js: ODT ausente: '+m);
console.log('OK: IA usa schema canônico; Gerar escala removido; aditamento PDF/ODT disponível.');
