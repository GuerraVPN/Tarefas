(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const dt=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
let user=null,isSupport=false,isAdmin=false,tickets=[],selected=null,messages=[],users=new Map(),moderators=new Set(),channel=null;

function logged(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function uname(id){const u=users.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`}
function statusLabel(s){return({aberto:'Aberto',em_analise:'Em análise',aguardando_usuario:'Aguardando usuário',resolvido:'Resolvido',fechado:'Fechado'}[s]||s)}
function priLabel(s){return({baixa:'Baixa',media:'Média',alta:'Alta',critica:'Crítica'}[s]||s)}
function catLabel(s){return({bug:'Bug / erro',falha:'Falha do sistema',melhoria:'Melhoria / sugestão',acesso:'Acesso / permissão',outro:'Outro'}[s]||s)}
function protocol(t){return `CH-${String(t.id).padStart(5,'0')}`}

async function initUser(){
 const base=logged();if(!base?.id){location.replace('index.html');return false}
 user=base;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);if(p?.usuario)user=p.usuario}catch(_){}}
 isAdmin=norm(user.secao)==='admin';
 try{
   const r=await supabaseClient.rpc('v6_5_eh_suporte',{p_usuario_id:String(user.id),p_perfil_id:profileId()});
   isSupport=!r.error&&r.data===true;
 }catch(_){isSupport=isAdmin}
 $('listTitle').textContent=isSupport?'Chamados de suporte':'Meus chamados';
 $('moderatorPanel').hidden=!isAdmin;
 return true;
}
async function loadUsers(){
 const r=await supabaseClient.from('usuarios').select('id,patente,nome_guerra,telefone,email').order('nome_guerra');
 if(!r.error)users=new Map((r.data||[]).map(x=>[String(x.id),x]));
}
async function loadModerators(){
 if(!isAdmin)return;
 const r=await supabaseClient.from('suporte_moderadores').select('usuario_id,ativo').eq('ativo',true);
 moderators=new Set((r.error?[]:(r.data||[])).map(x=>String(x.usuario_id)));
 const opts=[...users.values()].filter(x=>String(x.id)!==String(user.id)&&!moderators.has(String(x.id)));
 $('moderatorUser').innerHTML='<option value="">Selecione um usuário...</option>'+opts.map(x=>`<option value="${esc(x.id)}">${esc([x.patente,x.nome_guerra].filter(Boolean).join(' '))}</option>`).join('');
 $('moderatorList').innerHTML=moderators.size?[...moderators].map(id=>`<div class="moderator-row"><span>${esc(uname(id))}</span><button class="btn danger" data-remove-mod="${esc(id)}">Remover</button></div>`).join(''):'<div class="empty">Nenhum moderador adicional. Administradores continuam atendendo normalmente.</div>';
}
async function loadTickets(){
 let q=supabaseClient.from('chamados_suporte').select('*').order('atualizado_em',{ascending:false}).limit(500);
 if(!isSupport)q=q.eq('usuario_id',String(user.id));
 const r=await q;
 if(r.error){$('ticketList').innerHTML=`<div class="empty">Execute o SQL da V6.5 para habilitar os chamados.<br>${esc(r.error.message)}</div>`;return}
 tickets=r.data||[];renderList();
 const id=new URLSearchParams(location.search).get('chamado');
 if(id&&tickets.some(x=>String(x.id)===String(id)))await selectTicket(id);
}
function filtered(){
 const q=norm($('ticketSearch').value),s=$('ticketStatus').value;
 return tickets.filter(t=>(!s||t.status===s)&&(!q||norm(`${protocol(t)} ${t.titulo} ${t.categoria} ${uname(t.usuario_id)}`).includes(q)));
}
function renderList(){
 const a=filtered();$('ticketCount').textContent=a.length;
 $('ticketList').innerHTML=a.length?a.map(t=>`<article class="ticket ${selected&&String(selected.id)===String(t.id)?'active':''}" data-ticket="${t.id}">
  <div class="ticket-top"><strong>${esc(protocol(t))} · ${esc(t.titulo)}</strong><span class="pill ${t.status==='resolvido'||t.status==='fechado'?'done':'open'}">${esc(statusLabel(t.status))}</span></div>
  <p>${isSupport?esc(uname(t.usuario_id))+' · ':''}${esc(catLabel(t.categoria))} · <span class="pill ${t.prioridade==='critica'?'critical':t.prioridade==='alta'?'high':''}">${esc(priLabel(t.prioridade))}</span><br>${dt(t.atualizado_em)}</p>
 </article>`).join(''):'<div class="empty">Nenhum chamado neste filtro.</div>';
}
async function loadMessages(id){
 const r=await supabaseClient.from('chamado_mensagens').select('*').eq('chamado_id',id).order('criado_em',{ascending:true}).order('id',{ascending:true});
 if(r.error)throw r.error;messages=(r.data||[]).filter(x=>isSupport||!x.interno);
}
async function selectTicket(id){
 selected=tickets.find(x=>String(x.id)===String(id));if(!selected)return;
 await loadMessages(selected.id);renderList();renderDetail();
}
function renderDetail(){
 $('ticketEmpty').hidden=true;$('ticketDetail').hidden=false;
 const t=selected,u=users.get(String(t.usuario_id));
 const supportControls=isSupport?`<div class="support-actions">
   ${!t.atendente_id?'<button class="btn primary" data-action="assumir">Assumir chamado</button>':''}
   <select id="supportStatus"><option value="aberto">Aberto</option><option value="em_analise">Em análise</option><option value="aguardando_usuario">Aguardando usuário</option><option value="resolvido">Resolvido</option><option value="fechado">Fechado</option></select>
   <button class="btn" data-action="status">Salvar status</button>
 </div>`:'';
 const critical=isAdmin&&['alta','critica'].includes(t.prioridade)?`<div class="critical-contact"><b>Contato em caso de falha importante</b><br>${esc(u?.telefone||'Telefone não informado')} · ${esc(u?.email||'E-mail não informado')}<br><button class="btn" style="margin-top:7px" data-contact="${esc(t.usuario_id)}">Abrir conversa na Central</button></div>`:'';
 $('ticketDetail').innerHTML=`<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><h3 style="margin:0">${esc(protocol(t))} · ${esc(t.titulo)}</h3><div style="font-size:9px;color:var(--v4-muted);margin-top:4px">${esc(uname(t.usuario_id))} · ${dt(t.criado_em)}</div></div><span class="pill ${t.status==='resolvido'||t.status==='fechado'?'done':'open'}">${esc(statusLabel(t.status))}</span></div>
 <div class="meta"><div><small>Tipo</small><b>${esc(catLabel(t.categoria))}</b></div><div><small>Prioridade</small><b>${esc(priLabel(t.prioridade))}</b></div><div><small>Atendente</small><b>${esc(t.atendente_id?uname(t.atendente_id):'Não definido')}</b></div></div>
 <div class="desc">${esc(t.descricao)}</div>${critical}${supportControls}
 <div style="margin-top:13px"><b style="font-size:11px">Conversa do chamado</b><div class="thread">${messages.length?messages.map(m=>`<div class="msg ${String(m.usuario_id)!==String(t.usuario_id)?'support':''}"><b>${esc(uname(m.usuario_id))}</b><div style="margin-top:4px;white-space:pre-wrap">${esc(m.mensagem)}</div><small>${dt(m.criado_em)}${m.interno?' · Nota interna':''}</small></div>`).join(''):'<div class="empty">Sem mensagens ainda.</div>'}</div></div>
 <form class="reply" id="replyForm"><textarea id="replyText" maxlength="5000" placeholder="Responder ao chamado..."></textarea><div><button class="btn primary" id="replyBtn">Enviar resposta</button></div></form>`;
 if(isSupport){$('supportStatus').value=t.status}
 $('replyForm').onsubmit=reply;
}
async function reply(e){
 e.preventDefault();const text=$('replyText').value.trim();if(!text)return;
 const btn=$('replyBtn');btn.disabled=true;
 const r=await supabaseClient.rpc('v6_5_responder_chamado',{p_chamado_id:selected.id,p_usuario_id:String(user.id),p_perfil_id:profileId(),p_mensagem:text,p_interno:false});
 btn.disabled=false;if(r.error)return alert(r.error.message);
 await loadMessages(selected.id);await loadTickets();selected=tickets.find(x=>String(x.id)===String(selected.id));renderDetail();
}
async function supportAction(action){
 if(!isSupport||!selected)return;
 if(action==='assumir'){
   const r=await supabaseClient.rpc('v6_5_atualizar_chamado',{p_chamado_id:selected.id,p_usuario_id:String(user.id),p_perfil_id:profileId(),p_status:'em_analise',p_atendente_id:String(user.id)});
   if(r.error)return alert(r.error.message);
 }else if(action==='status'){
   const r=await supabaseClient.rpc('v6_5_atualizar_chamado',{p_chamado_id:selected.id,p_usuario_id:String(user.id),p_perfil_id:profileId(),p_status:$('supportStatus').value,p_atendente_id:selected.atendente_id||String(user.id)});
   if(r.error)return alert(r.error.message);
 }
 const id=selected.id;await loadTickets();await selectTicket(id);
}
async function createTicket(e){
 e.preventDefault();const btn=$('saveTicket');btn.disabled=true;
 const r=await supabaseClient.rpc('v6_5_criar_chamado',{
  p_usuario_id:String(user.id),p_perfil_id:profileId(),p_categoria:$('tCategory').value,p_prioridade:$('tPriority').value,
  p_titulo:$('tTitle').value.trim(),p_descricao:$('tDescription').value.trim(),p_pagina_origem:location.href
 });
 btn.disabled=false;if(r.error)return alert(r.error.message);
 $('ticketModal').classList.remove('open');$('ticketForm').reset();await loadTickets();await selectTicket(r.data);
}
async function setModerator(id,active){
 if(!isAdmin||!id)return;
 const r=await supabaseClient.rpc('v6_5_definir_moderador',{p_admin_usuario_id:String(user.id),p_admin_perfil_id:profileId(),p_usuario_alvo_id:String(id),p_ativo:active});
 if(r.error)return alert(r.error.message);await loadModerators();
}
function realtime(){
 try{
  channel=supabaseClient.channel('v65-help-'+user.id)
   .on('postgres_changes',{event:'*',schema:'public',table:'chamados_suporte'},()=>loadTickets())
   .on('postgres_changes',{event:'*',schema:'public',table:'chamado_mensagens'},async()=>{if(selected){await loadMessages(selected.id);renderDetail()}})
   .subscribe();
 }catch(_){}
}
function bind(){
 $('newTicket').onclick=()=>$('ticketModal').classList.add('open');
 $('closeTicket').onclick=$('cancelTicket').onclick=()=>$('ticketModal').classList.remove('open');
 $('ticketModal').onclick=e=>{if(e.target===$('ticketModal'))$('ticketModal').classList.remove('open')};
 $('ticketForm').onsubmit=createTicket;$('ticketSearch').oninput=renderList;$('ticketStatus').onchange=renderList;
 $('ticketList').onclick=e=>{const t=e.target.closest('[data-ticket]');if(t)selectTicket(t.dataset.ticket)};
 $('ticketDetail').onclick=e=>{
  const a=e.target.closest('[data-action]');if(a)supportAction(a.dataset.action);
  const c=e.target.closest('[data-contact]');if(c)location.href=`central.html?tab=mensagens&usuario=${encodeURIComponent(c.dataset.contact)}`;
 };
 $('addModerator').onclick=()=>setModerator($('moderatorUser').value,true);
 $('moderatorList').onclick=e=>{const b=e.target.closest('[data-remove-mod]');if(b)setModerator(b.dataset.removeMod,false)};
}
(async()=>{
 if(!await initUser())return;bind();await loadUsers();await Promise.all([loadTickets(),loadModerators()]);realtime();
})().catch(e=>{console.error(e);alert('Erro ao abrir Help: '+e.message)});
})();
