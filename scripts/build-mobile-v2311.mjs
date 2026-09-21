import { copyFile, readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2310.mjs')).href+'?v=2311');
const dist=path.join(root,'dist');

async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');const before=s;s=fn(s);if(s===before)console.warn(`[2.3.11] sem alteração em ${rel}`);await writeFile(p,s,'utf8')}
async function rep(rel,from,to,{required=true}={}){await patch(rel,s=>{if(required&&!s.includes(from))throw new Error(`${rel}: trecho não encontrado: ${from}`);return s.split(from).join(to)})}

// Versão/build.
for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');s=s.replaceAll('2.3.10','2.3.11');await writeFile(p,s,'utf8');
}
await rep('mobile-bootstrap.js','const APP_BUILD = 240;','const APP_BUILD = 241;');
await rep('mobile-preload.js',"tarefasAppBuild = '240'","tarefasAppBuild = '241'");
await rep('mobile-updates-v181.js','const APP_BUILD = 240;','const APP_BUILD = 241;');
await rep('mobile-schema-v239.js','build:240','build:241',{required:false});

// ADITAMENTO: usa exclusivamente o gerador oficial de aditamento.
// Também bloqueia eventual JS antigo de escala que tenha ficado em cache no WebView.
for(const page of ['pessoal.html','missao.html']){
  await patch(page,s=>{
    if(!s.includes('__BLOCK_V772_SCALE_CACHE__'))s=s.replace(/<head>/i,'<head>\n<script>/*__BLOCK_V772_SCALE_CACHE__*/window.__TAREFAS_V772_SCALE_EXPORT__=true;<\/script>');
    s=s.replace(/aditamento_v74\.js\?v=[^"']+/g,'aditamento_v74.js?v=2.3.11-b241');
    s=s.replace(/v7_5_1_version\.js\?v=[^"']+/g,'v7_5_1_version.js?v=2.3.11-b241');
    s=s.replace(/Gerar aditamento PDF/g,'Gerar aditamento');
    return s;
  });
}
await patch('v7_5_1_version.js',s=>s
  .replaceAll("addScript('v7_7_2_scale_export.js','__TAREFAS_V772_SCALE_EXPORT__');",'')
  .replaceAll('addScript("v7_7_2_scale_export.js","__TAREFAS_V772_SCALE_EXPORT__");',''));
try{await unlink(path.join(dist,'v7_7_2_scale_export.js'))}catch(_){}

// O pipeline antigo parte de snapshots históricos. Para a correção de performance,
// sobrescreve no dist os módulos Orçamentários com as fontes atuais deste branch.
const orcSources=[
 'pedidos_v6.js','movimentacoes_v6.js','guias_v6.js','material_carga_v6.js',
 'v7_7_0_material_carga.js','passagem_carga_v6.js',
 'lavanderia_v211.js','lavanderia_financeiro_v212.js','lavanderia_pagamento_v767.js','lavanderia_documento_v762.js'
];
for(const f of orcSources)await copyFile(path.join(root,f),path.join(dist,f));

// ORÇAMENTÁRIOS: remove os módulos estáticos do HTML. O loader 241 traz somente o módulo aberto.
await copyFile(path.join(root,'app','orcamentarios-loader-v241.js'),path.join(dist,'orcamentarios-loader-v241.js'));
await patch('orcamentarios.html',s=>{
  const files=['guias_v6.js','pedidos_v6.js','movimentacoes_v6.js','material_carga_v6.js','v7_7_0_material_carga.js','passagem_carga_v6.js','lavanderia_v211.js','lavanderia_financeiro_v212.js','lavanderia_pagamento_v767.js','lavanderia_documento_v762.js'];
  for(const f of files){const q=f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');s=s.replace(new RegExp(`<script\\s+src=["']${q}[^"']*["'][^>]*><\\/script>\\s*`,'gi'),'')}
  if(!s.includes('orcamentarios-loader-v241.js'))s=s.replace(/<\/body>/i,'  <script src="orcamentarios-loader-v241.js?v=2.3.11-b241"></script>\n</body>');
  s=s.replace(/sistema_comum\.js\?v=[^"']+/g,'sistema_comum.js?v=2.3.11-b241');
  return s;
});

// Pedidos: cabeçalhos na abertura; itens somente ao abrir o pedido.
await patch('pedidos_v6.js',s=>{
  s=s.replace("supabaseClient.from('pedidos_orcamentarios').select('*').order('data_pedido',{ascending:false}).order('id',{ascending:false}).limit(1000)","supabaseClient.from('pedidos_orcamentarios').select('id,numero,data_pedido,tipo,categoria,dependencia_origem,deposito_origem,dependencia_destino,motivo,observacoes,status,retorno_motivo,valor_total,criado_por,criado_por_perfil_id,secao_criador,posicao_criador,criado_em,atualizado_em,pronto_em').order('data_pedido',{ascending:false}).order('id',{ascending:false}).limit(300)");
  s=s.replace("supabaseClient.from('pedido_orcamentario_itens').select('*').order('id',{ascending:true}).limit(10000)","Promise.resolve({data:[],error:null})");
  const old=`async function selectPedido(id){\n selected=pedidos.find(x=>String(x.id)===String(id));if(!selected)return;\n selectedItems=itemsFor(selected.id);\n await loadHistory(selected.id);\n renderList();renderDetail();\n}`;
  const neu=`async function selectPedido(id){\n selected=pedidos.find(x=>String(x.id)===String(id));if(!selected)return;\n const ir=await supabaseClient.from('pedido_orcamentario_itens').select('id,pedido_id,nome,numero_ficha,patrimonio,quantidade,valor_unitario,valor_total').eq('pedido_id',selected.id).order('id',{ascending:true});\n selectedItems=ir.error?[]:(ir.data||[]);\n allItems=allItems.filter(x=>String(x.pedido_id)!==String(selected.id)).concat(selectedItems);\n await loadHistory(selected.id);\n renderList();renderDetail();\n}`;
  if(!s.includes(old))throw new Error('pedidos_v6.js: selectPedido esperado não encontrado');
  return s.replace(old,neu);
});

// Movimentações: mesma estratégia, sem os 10 mil itens na abertura.
await patch('movimentacoes_v6.js',s=>{
  s=s.replace("supabaseClient.from('movimentacoes_material').select('*').order('data_movimentacao',{ascending:false}).order('id',{ascending:false}).limit(1000)","supabaseClient.from('movimentacoes_material').select('id,numero,data_movimentacao,dependencia_origem,dependencia_destino,finalidade,observacoes,status,retorno_motivo,valor_total,criado_por,criado_por_perfil_id,criado_em,atualizado_em').order('data_movimentacao',{ascending:false}).order('id',{ascending:false}).limit(300)");
  s=s.replace("supabaseClient.from('movimentacao_material_itens').select('*').order('id',{ascending:true}).limit(10000)","Promise.resolve({data:[],error:null})");
  const old=`async function selectMov(id){\n selected=movs.find(x=>String(x.id)===String(id));if(!selected)return;\n selectedItems=its(selected.id);await loadDetailData(selected.id);renderList();renderDetail();\n}`;
  const neu=`async function selectMov(id){\n selected=movs.find(x=>String(x.id)===String(id));if(!selected)return;\n const ir=await supabaseClient.from('movimentacao_material_itens').select('id,movimentacao_id,nome,numero_ficha,patrimonio,quantidade,valor_unitario,valor_total').eq('movimentacao_id',selected.id).order('id',{ascending:true});\n selectedItems=ir.error?[]:(ir.data||[]);\n items=items.filter(x=>String(x.movimentacao_id)!==String(selected.id)).concat(selectedItems);\n await loadDetailData(selected.id);renderList();renderDetail();\n}`;
  if(!s.includes(old))throw new Error('movimentacoes_v6.js: selectMov esperado não encontrado');
  return s.replace(old,neu);
});

// Guias e Passagens: limites menores; detalhes continuam sob demanda.
await patch('guias_v6.js',s=>s.replace(".order('data_guia',{ascending:false}).order('id',{ascending:false}).limit(1000)",".order('data_guia',{ascending:false}).order('id',{ascending:false}).limit(300)"));
await patch('passagem_carga_v6.js',s=>s.replace(".order('data_passagem',{ascending:false}).order('id',{ascending:false}).limit(500)",".order('data_passagem',{ascending:false}).order('id',{ascending:false}).limit(250)"));

// Material Carga 7.7.0: observer só dentro do módulo e polling bem mais leve.
await patch('v7_7_0_material_carga.js',s=>{
  const beforeObserver="const obs=new MutationObserver(()=>queueMicrotask(renderAll));obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});";
  const scopedObserver="const host=$('materialCargaModule');if(host){let queued=false;const obs=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;renderAll()})});obs.observe(host,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']})}";
  if(!s.includes(beforeObserver))throw new Error('v7_7_0_material_carga.js: observer global esperado não encontrado');
  s=s.replace(beforeObserver,scopedObserver);
  if(!s.includes('setInterval(refresh,60000);'))throw new Error('v7_7_0_material_carga.js: polling de 60s esperado não encontrado');
  s=s.replace('setInterval(refresh,60000);',"setInterval(()=>{if(!document.hidden)refresh()},300000);");
  return s;
});

console.log('TAREFAS Android 2.3.11 build 241 BETA: aditamento oficial restaurado e Orçamentários com carregamento realmente isolado por módulo.');
