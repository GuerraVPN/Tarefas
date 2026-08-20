(function(){
'use strict';
let usuario=null,perfilId=null,canal=null;
function getUser(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function n(v){return String(v??'')}
function getClient(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
async function registrarNotificacao(usuarioId,tipo,titulo,mensagem,refTipo,refId,perfilAlvoId=null,urgente=false,destinoUrl=null){
  const c=getClient();if(!c)return {error:new Error('Supabase não disponível')};
  const uid=n(usuarioId),rid=refId==null?null:n(refId);
  if(rid){
    let q=c.from('notificacoes').select('id').eq('usuario_id',uid).eq('tipo',tipo||'sistema').eq('referencia_id',rid).gte('criada_em',new Date(Date.now()-12000).toISOString()).limit(1);
    if(perfilAlvoId!=null)q=q.eq('perfil_id',perfilAlvoId);
    const chk=await q;if(!chk.error&&chk.data?.length)return {data:chk.data[0],error:null,duplicada:true};
  }
  return c.from('notificacoes').insert([{usuario_id:uid,perfil_id:perfilAlvoId==null?null:Number(perfilAlvoId),tipo:tipo||'sistema',titulo:titulo||'Notificação',mensagem:mensagem||null,referencia_tipo:refTipo||null,referencia_id:rid,urgente:!!urgente,destino_url:destinoUrl||null}]).select('*').single();
}
async function contadores(){
  usuario=getUser();perfilId=usuario?.perfil_id||null;const c=getClient();if(!c||!usuario?.id)return {notificacoes:0,mensagens:0,urgentes:0};
  const nr=await c.from('notificacoes').select('id,tipo,urgente,perfil_id,lida').eq('usuario_id',n(usuario.id)).eq('lida',false);
  let list=nr.error?[]:(nr.data||[]);list=list.filter(x=>x.perfil_id==null||(perfilId!=null&&n(x.perfil_id)===n(perfilId)));
  const mr=await c.from('mensagens').select('id').eq('destinatario_id',n(usuario.id)).is('lida_em',null);
  return {notificacoes:list.filter(x=>x.tipo!=='mensagem').length,mensagens:mr.error?0:(mr.data||[]).length,urgentes:list.filter(x=>x.urgente).length};
}
async function atualizarContadores(){const c=await contadores();window.dispatchEvent(new CustomEvent('v3:contadores',{detail:c}));return c}
function realtime(){const c=getClient();usuario=getUser();if(!c||!usuario?.id||canal)return;canal=c.channel('v3-central-count-'+usuario.id).on('postgres_changes',{event:'*',schema:'public',table:'notificacoes'},p=>{const r=p.new||p.old||{};if(n(r.usuario_id)===n(usuario.id))atualizarContadores()}).on('postgres_changes',{event:'*',schema:'public',table:'mensagens'},p=>{const r=p.new||p.old||{};if(n(r.remetente_id)===n(usuario.id)||n(r.destinatario_id)===n(usuario.id))atualizarContadores()}).subscribe()}
async function init(){usuario=getUser();if(!usuario?.id)return;await atualizarContadores();realtime()}
window.registrarNotificacao=registrarNotificacao;window.Notificacoes26={registrarNotificacao,contadores,atualizarContadores,realtime};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
