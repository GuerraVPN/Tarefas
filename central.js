(function(){
'use strict';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));let u=null,notifs=[],filter='todas',users=[],profiles=new Map(),messages=[],otherId=null,channel=null;
function user(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}function visible(n){return n.perfil_id==null||String(n.perfil_id)===String(u.perfil_id??'')}function time(v){const d=new Date(v),diff=(Date.now()-d)/60000;if(diff<1)return'Agora';if(diff<60)return Math.floor(diff)+' min';if(diff<1440)return Math.floor(diff/60)+' h';return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}
function dedupeNotificacoes(lista){
  const resultado=[];
  const vistos=new Map();

  for(const item of (lista||[])){
    const chave=[
      item.usuario_id||'',
      item.perfil_id??'global',
      item.tipo||'',
      item.referencia_tipo||'',
      item.referencia_id||'',
      item.titulo||'',
      item.mensagem||''
    ].join('|');

    const ts=new Date(item.criada_em).getTime();
    const anterior=vistos.get(chave);

    // Notificações iguais geradas praticamente juntas são uma só.
    if(anterior!=null && Math.abs(anterior-ts)<=120000)continue;

    vistos.set(chave,ts);
    resultado.push(item);
  }

  return resultado;
}

async function loadNotifs(){const r=await supabaseClient.from('notificacoes').select('*').eq('usuario_id',String(u.id)).order('criada_em',{ascending:false}).limit(250);if(r.error)throw r.error;notifs=dedupeNotificacoes((r.data||[]).filter(visible));renderNotifs();stats()}function stats(){$('sUnread').textContent=notifs.filter(x=>!x.lida).length;$('sUrgent').textContent=notifs.filter(x=>!x.lida&&x.urgente).length;$('sMsg').textContent=notifs.filter(x=>!x.lida&&x.tipo==='mensagem').length;$('sSystem').textContent=notifs.filter(x=>!x.lida&&x.tipo==='sistema').length;window.Notificacoes26?.atualizarContadores()}
function filtered(){if(filter==='nao_lidas')return notifs.filter(x=>!x.lida);if(filter!=='todas')return notifs.filter(x=>x.tipo===filter);return notifs}function renderNotifs(){const a=filtered();$('notifList').innerHTML=a.length?a.map(n=>`<div class="notif ${n.lida?'':'unread'}" data-id="${n.id}"><span class="dot"></span><div><strong>${esc(n.titulo)}</strong><p>${esc(n.mensagem||'')}</p><span class="pill ${esc(n.tipo)} ${n.urgente?'urgent':''}">${n.urgente?'URGENTE · ':''}${esc(n.tipo||'sistema')}</span></div><time>${time(n.criada_em)}</time></div>`).join(''):'<div class="empty">Nenhuma notificação neste filtro.</div>'}
async function openNotif(n){if(!n.lida){await supabaseClient.from('notificacoes').update({lida:true,lida_em:new Date().toISOString()}).eq('id',n.id);n.lida=true;renderNotifs();stats()}if(n.destino_url)location.href=n.destino_url}async function markAll(){const ids=notifs.filter(x=>!x.lida).map(x=>x.id);if(!ids.length)return;const r=await supabaseClient.from('notificacoes').update({lida:true,lida_em:new Date().toISOString()}).in('id',ids);if(r.error)return alert(r.error.message);await loadNotifs()}
async function loadUsers(){const [r,p]=await Promise.all([supabaseClient.from('usuarios').select('id,nome_guerra,patente,secao,posicao').order('nome_guerra'),supabaseClient.from('usuario_perfis').select('id,usuario_id,secao,posicao').eq('ativo',true)]);if(r.error)throw r.error;if(p.error)throw p.error;users=(r.data||[]).filter(x=>String(x.id)!==String(u.id));profiles=new Map((p.data||[]).map(x=>[String(x.id),x]));renderPick()}function renderPick(){const q=$('userSearch').value.trim().toLowerCase(),a=users.filter(x=>`${x.patente} ${x.nome_guerra} ${x.secao}`.toLowerCase().includes(q));$('userPick').innerHTML=a.map(x=>`<button data-user="${x.id}"><b>${esc([x.patente,x.nome_guerra].filter(Boolean).join(' '))}</b><br><small>${esc(x.secao||'-')} — ${esc(x.posicao||'-')}</small></button>`).join('')}
async function loadMessages(){const id=String(u.id),r=await supabaseClient.from('mensagens').select('*').or(`remetente_id.eq.${id},destinatario_id.eq.${id}`).order('criada_em',{ascending:true}).limit(1000);if(r.error)throw r.error;messages=r.data||[];renderConvs();if(otherId)renderChat()}function partner(m){return String(m.remetente_id)===String(u.id)?String(m.destinatario_id):String(m.remetente_id)}function uname(id){const x=users.find(z=>String(z.id)===String(id));return x?[x.patente,x.nome_guerra].filter(Boolean).join(' '):`Usuário ${id}`}
function renderConvs(){const q=$('convSearch').value.trim().toLowerCase(),map=new Map();messages.forEach(m=>{const p=partner(m),o=map.get(p);if(!o||new Date(m.criada_em)>new Date(o.criada_em))map.set(p,m)});let a=[...map.entries()].sort((x,y)=>new Date(y[1].criada_em)-new Date(x[1].criada_em));if(q)a=a.filter(([id])=>uname(id).toLowerCase().includes(q));$('convList').innerHTML=a.length?a.map(([id,m])=>`<div class="conv ${String(id)===String(otherId)?'active':''}" data-conv="${id}"><strong>${esc(uname(id))}</strong><small>${esc(m.conteudo)}</small></div>`).join(''):'<div class="empty">Nenhuma conversa ainda.</div>'}
async function openConv(id){otherId=String(id);$('chatText').disabled=false;$('sendBtn').disabled=false;renderConvs();await markRead();renderChat()}async function markRead(){const ids=messages.filter(m=>String(m.remetente_id)===String(otherId)&&String(m.destinatario_id)===String(u.id)&&!m.lida_em).map(m=>m.id);if(ids.length){await supabaseClient.from('mensagens').update({lida_em:new Date().toISOString()}).in('id',ids);messages.forEach(m=>{if(ids.includes(m.id))m.lida_em=new Date().toISOString()});window.Notificacoes26?.atualizarContadores()}}
function renderChat(){$('chatHead').textContent=uname(otherId);const a=messages.filter(m=>partner(m)===String(otherId));$('chatBody').innerHTML=a.length?a.map(m=>{const me=String(m.remetente_id)===String(u.id);const p=profiles.get(String(m.remetente_perfil_id||''));const perfil=p?` · ${p.secao} — ${p.posicao}`:'';return `<div class="bubble ${me?'me':''}">${esc(m.conteudo)}<small>${new Date(m.criada_em).toLocaleString('pt-BR')}${esc(perfil)}</small></div>`}).join(''):'<div class="empty">Inicie a conversa.</div>';$('chatBody').scrollTop=$('chatBody').scrollHeight}
async function send(e){e.preventDefault();const text=$('chatText').value.trim();if(!text||!otherId)return;$('sendBtn').disabled=true;const r=await supabaseClient.from('mensagens').insert([{remetente_id:String(u.id),destinatario_id:String(otherId),remetente_perfil_id:u.perfil_id?Number(u.perfil_id):null,conteudo:text}]);$('sendBtn').disabled=false;if(r.error)return alert(r.error.message);$('chatText').value='';await loadMessages()}
function realtime(){channel=supabaseClient.channel('central-v3-'+u.id).on('postgres_changes',{event:'*',schema:'public',table:'notificacoes'},()=>loadNotifs()).on('postgres_changes',{event:'*',schema:'public',table:'mensagens'},()=>loadMessages()).subscribe()}
document.addEventListener('click',e=>{const n=e.target.closest('.notif[data-id]');if(n){const x=notifs.find(z=>String(z.id)===String(n.dataset.id));if(x)openNotif(x)}const c=e.target.closest('[data-conv]');if(c)openConv(c.dataset.conv);const p=e.target.closest('[data-user]');if(p){$('newMsgBg').classList.remove('open');openConv(p.dataset.user)}});$('notifTabs').onclick=e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;document.querySelectorAll('#notifTabs .tab').forEach(x=>x.classList.toggle('active',x===b));renderNotifs()};$('markAll').onclick=markAll;$('newMsg').onclick=()=>$('newMsgBg').classList.add('open');$('closeNew').onclick=()=>$('newMsgBg').classList.remove('open');$('userSearch').oninput=renderPick;$('convSearch').oninput=renderConvs;$('chatForm').onsubmit=send;$('chatText').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('chatForm').requestSubmit()}};
(async()=>{u=user();if(!u?.id)return location.href='index.html';await Promise.all([loadUsers(),loadNotifs()]);await loadMessages();const q=new URLSearchParams(location.search);if(q.get('conversa'))openConv(q.get('conversa'));realtime()})().catch(e=>alert('Erro na Central: '+e.message));
})();
