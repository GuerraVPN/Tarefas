(function(){
'use strict';
let usuario=null,perfilId=null,canal=null;
const locks=new Map();
function getUser(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function n(v){return String(v??'')}
function norm(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()}
function getClient(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function visible(row){const u=getUser();const p=u?.perfil_id??null;return row?.perfil_id==null||(p!=null&&n(row.perfil_id)===n(p))}
function lockKey(usuarioId,tipo,refTipo,refId,perfilAlvoId,titulo){return [usuarioId,tipo||'sistema',refTipo||'',refId||'',perfilAlvoId??'global',titulo||''].join('|')}
function destinoNotificacao(row){
 if(row?.destino_url)return row.destino_url;
 const tipo=norm(row?.referencia_tipo||row?.tipo),id=row?.referencia_id;
 if(!id){if(tipo==='mensagem')return'central.html?tab=mensagens';return'central.html?tab=notificacoes'}
 if(['tarefa','tarefas'].includes(tipo))return`minhas_tarefas.html?tarefa=${encodeURIComponent(id)}`;
 if(['guia','guias'].includes(tipo))return`orcamentarios.html?modulo=guias&guia=${encodeURIComponent(id)}`;
 if(['pedido','pedidos','baixa','distribuicao'].includes(tipo))return`orcamentarios.html?pedido=${encodeURIComponent(id)}`;
 if(['movimentacao','movimentacao_material'].includes(tipo))return`orcamentarios.html?modulo=movimentacao&movimentacao=${encodeURIComponent(id)}`;
 if(['passagem','passagem_carga'].includes(tipo))return`orcamentarios.html?modulo=passagem_carga&passagem=${encodeURIComponent(id)}`;
 if(['usuario','usuarios'].includes(tipo))return`usuarios.html?usuario=${encodeURIComponent(id)}`;
 return'central.html?tab=notificacoes';
}
async function registrarNotificacao(usuarioId,tipo,titulo,mensagem,refTipo,refId,perfilAlvoId=null,urgente=false,destinoUrl=null){
 const c=getClient();if(!c)return {error:new Error('Supabase não disponível')};
 const uid=n(usuarioId),rid=refId==null?null:n(refId),chave=lockKey(uid,tipo,refTipo,rid,perfilAlvoId,titulo),agora=Date.now();
 if((locks.get(chave)||0)>agora-60000)return {data:null,error:null,duplicada:true};locks.set(chave,agora);
 try{
  let q=c.from('notificacoes').select('id,criada_em').eq('usuario_id',uid).eq('tipo',tipo||'sistema').gte('criada_em',new Date(Date.now()-90000).toISOString()).limit(1);
  if(rid!=null)q=q.eq('referencia_id',rid);else q=q.is('referencia_id',null);if(refTipo)q=q.eq('referencia_tipo',refTipo);if(perfilAlvoId!=null)q=q.eq('perfil_id',Number(perfilAlvoId));else q=q.is('perfil_id',null);if(titulo)q=q.eq('titulo',titulo);
  const check=await q;if(!check.error&&check.data?.length)return {data:check.data[0],error:null,duplicada:true};
  return await c.from('notificacoes').insert([{usuario_id:uid,perfil_id:perfilAlvoId==null?null:Number(perfilAlvoId),tipo:tipo||'sistema',titulo:titulo||'Notificação',mensagem:mensagem||null,referencia_tipo:refTipo||null,referencia_id:rid,urgente:!!urgente,destino_url:destinoUrl||null}]).select('*').single();
 }finally{setTimeout(()=>locks.delete(chave),65000)}
}
async function contadores(){
 usuario=getUser();perfilId=usuario?.perfil_id||null;const c=getClient();if(!c||!usuario?.id)return{notificacoes:0,mensagens:0,urgentes:0};
 const [nr,mr]=await Promise.all([
  c.from('notificacoes').select('id,tipo,urgente,perfil_id,lida').eq('usuario_id',n(usuario.id)).eq('lida',false),
  c.from('mensagens').select('id').eq('destinatario_id',n(usuario.id)).is('lida_em',null)
 ]);
 let lista=nr.error?[]:(nr.data||[]);lista=lista.filter(visible);
 return{notificacoes:lista.length,mensagens:mr.error?0:(mr.data||[]).length,urgentes:lista.filter(x=>x.urgente).length};
}
async function atualizarContadores(){const c=await contadores();window.dispatchEvent(new CustomEvent('v3:contadores',{detail:c}));return c}
async function recentes(limit=6){
 const c=getClient(),u=getUser();if(!c||!u?.id)return[];
 const r=await c.from('notificacoes').select('*').eq('usuario_id',n(u.id)).order('criada_em',{ascending:false}).limit(Math.max(12,limit*3));
 if(r.error)return[];const out=[],seen=new Set();for(const x of (r.data||[]).filter(visible)){const k=[x.tipo,x.referencia_tipo,x.referencia_id,x.titulo,x.mensagem].join('|');if(seen.has(k))continue;seen.add(k);out.push(x);if(out.length>=limit)break}return out;
}
async function mensagensRecentes(limit=6){
 const c=getClient(),u=getUser();if(!c||!u?.id)return[];const id=n(u.id);
 const r=await c.from('mensagens').select('*').or(`remetente_id.eq.${id},destinatario_id.eq.${id}`).order('criada_em',{ascending:false}).limit(80);if(r.error)return[];
 const seen=new Set(),out=[];for(const m of r.data||[]){const partner=n(m.remetente_id)===id?n(m.destinatario_id):n(m.remetente_id);if(seen.has(partner))continue;seen.add(partner);out.push({...m,parceiro_id:partner});if(out.length>=limit)break}return out;
}
async function marcarLida(row){const c=getClient();if(!c||!row?.id||row.lida)return;await c.from('notificacoes').update({lida:true,lida_em:new Date().toISOString()}).eq('id',row.id);row.lida=true;await atualizarContadores()}
async function abrirNotificacao(row){if(!row)return;await marcarLida(row);location.href=destinoNotificacao(row)}
function realtime(){
 const c=getClient();usuario=getUser();if(!c||!usuario?.id||canal)return;
 canal=c.channel('v6-central-'+usuario.id)
  .on('postgres_changes',{event:'*',schema:'public',table:'notificacoes'},payload=>{const row=payload.new||payload.old||{};if(n(row.usuario_id)===n(usuario.id)){atualizarContadores();window.dispatchEvent(new CustomEvent('v6:notificacoes:update'))}})
  .on('postgres_changes',{event:'*',schema:'public',table:'mensagens'},payload=>{const row=payload.new||payload.old||{};if(n(row.remetente_id)===n(usuario.id)||n(row.destinatario_id)===n(usuario.id)){atualizarContadores();window.dispatchEvent(new CustomEvent('v6:mensagens:update'))}}).subscribe();
}
async function init(){usuario=getUser();if(!usuario?.id)return;await atualizarContadores();realtime()}
window.registrarNotificacao=registrarNotificacao;
window.Notificacoes26={registrarNotificacao,contadores,atualizarContadores,realtime,recentes,mensagensRecentes,marcarLida,abrirNotificacao,destinoNotificacao};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
