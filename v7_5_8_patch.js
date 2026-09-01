(function(){
'use strict';
if(window.__TAREFAS_V758_PATCH__||window.__TAREFAS_NATIVE_APP__)return;
window.__TAREFAS_V758_PATCH__=true;
const VERSION='7.5.8';
const SESSION_KEY='tarefasPushSession17';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const STYLE_ID='v758WebFeatures';

function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 .v758-edit-task{background:#0f766e!important;color:#fff!important;border:0!important}.v758-edit-task:hover{background:#115e59!important}
 .v758-modal{position:fixed;inset:0;z-index:12000;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:16px}
 .v758-box{width:min(560px,100%);max-height:92vh;overflow:auto;background:var(--v4-surface,#fff);color:var(--v4-text,#111827);border:1px solid var(--v4-border,#d1d5db);border-radius:16px;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,.28)}
 .v758-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.v758-head h3{margin:0}.v758-close{border:0;background:transparent;color:inherit;font-size:26px;cursor:pointer}
 .v758-field{display:grid;gap:6px;margin:12px 0}.v758-field label{font-size:12px;font-weight:800}.v758-field input,.v758-field textarea,.v758-field select{width:100%;box-sizing:border-box;background:var(--v4-surface-2,#f9fafb);color:inherit;border:1px solid var(--v4-border-strong,#cbd5e1);border-radius:9px;padding:11px}.v758-field textarea{min-height:105px;resize:vertical}
 .v758-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:16px}.v758-actions button{border:0;border-radius:9px;padding:11px 14px;font-weight:800;cursor:pointer}.v758-cancel{background:var(--v4-surface-3,#e5e7eb);color:inherit}.v758-save{background:#047857;color:#fff}.v758-save:disabled{opacity:.55}
 .v758-msg-tools{display:grid;gap:8px;margin:0 0 10px}.v758-block-status{padding:10px 11px;border-radius:10px;background:var(--v4-surface-2,#f9fafb);border:1px solid var(--v4-border,#d1d5db);font-size:12px;line-height:1.4}.v758-block-status.warn{background:#3b1f1f;border-color:#7f1d1d;color:#fecaca}.v758-block-status.mine{background:#332b12;border-color:#7c5d12;color:#fde68a}
 .v758-block-btn{width:100%;border:1px solid #7f1d1d;background:#351919;color:#fecaca;border-radius:9px;padding:10px;font-weight:800;cursor:pointer}.v758-block-btn.unblock{border-color:#166534;background:#12351f;color:#bbf7d0}.v758-block-btn:disabled{opacity:.55}
 @media(max-width:600px){.v758-actions{flex-direction:column-reverse}.v758-actions button{width:100%}}
 `;document.head.appendChild(s);
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const client=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}};
const session=()=>localStorage.getItem(SESSION_KEY)||'';
function notice(msg,bad=false){try{if(typeof toast==='function')return toast(msg,bad)}catch(_){}alert(msg)}

function selectedTask(){try{if(typeof tarefaSelecionadaId==='undefined'||typeof encontrarTarefa!=='function')return null;return encontrarTarefa(tarefaSelecionadaId)||null}catch(_){return null}}
function installTaskEditor(){
 if(page!=='minhas_tarefas.html')return true;
 const detail=document.getElementById('modalDetalhesTarefa');if(!detail)return false;
 const actions=detail.querySelector('.modal-buttons');if(!actions)return false;
 if(document.getElementById('v758EditTask'))return true;
 const b=document.createElement('button');b.type='button';b.id='v758EditTask';b.className='btn-salvar v758-edit-task';b.textContent='✎ Alterar tarefa';
 actions.insertBefore(b,actions.firstChild?.nextSibling||actions.firstChild);b.addEventListener('click',openTaskEditor);return true;
}
function openTaskEditor(){
 const t=selectedTask();if(!t)return notice('Não foi possível identificar a tarefa selecionada.',true);
 document.getElementById('v758TaskModal')?.remove();
 const modal=document.createElement('div');modal.id='v758TaskModal';modal.className='v758-modal';
 modal.innerHTML=`<div class="v758-box" role="dialog" aria-modal="true" aria-label="Alterar tarefa"><div class="v758-head"><h3>Alterar tarefa ${esc(t.codigo||'#'+t.id)}</h3><button class="v758-close" type="button" aria-label="Fechar">×</button></div><form id="v758TaskForm"><div class="v758-field"><label>Título *</label><input id="v758Title" maxlength="240" required value="${esc(t.titulo||'')}"></div><div class="v758-field"><label>Descrição</label><textarea id="v758Desc" maxlength="6000">${esc(t.descricao||'')}</textarea></div><div class="v758-field"><label>Prioridade</label><select id="v758Priority"><option${t.prioridade==='Alta'?' selected':''}>Alta</option><option${t.prioridade==='Média'?' selected':''}>Média</option><option${t.prioridade==='Baixa'?' selected':''}>Baixa</option></select></div><div class="v758-field"><label>Prazo</label><input id="v758Deadline" type="date" value="${esc(t.prazo||'')}"></div><div class="v758-actions"><button type="button" class="v758-cancel">Cancelar</button><button type="submit" class="v758-save">Salvar alterações</button></div></form></div>`;
 document.body.appendChild(modal);const close=()=>modal.remove();modal.querySelector('.v758-close').onclick=close;modal.querySelector('.v758-cancel').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});modal.querySelector('#v758TaskForm').addEventListener('submit',e=>saveTaskEdit(e,t,modal));
}
async function saveTaskEdit(e,t,modal){
 e.preventDefault();const c=client();if(!c)return notice('Conexão com o banco indisponível.',true);
 const btn=modal.querySelector('.v758-save'),titulo=modal.querySelector('#v758Title').value.trim(),descricao=modal.querySelector('#v758Desc').value.trim(),prioridade=modal.querySelector('#v758Priority').value,prazo=modal.querySelector('#v758Deadline').value||null;
 if(!titulo)return notice('Informe o título da tarefa.',true);btn.disabled=true;btn.textContent='Salvando…';
 try{const patch={titulo,descricao:descricao||null,prioridade,prazo};try{if(typeof normalizarHistorico==='function'&&typeof criarEntradaHistorico==='function'){const h=normalizarHistorico(t.historico);h.push(criarEntradaHistorico('Dados da tarefa alterados pelo site.'));patch.historico=h}}catch(_){}
  const {error}=await c.from('tarefas').update(patch).eq('id',t.id);if(error)throw error;t.titulo=titulo;t.descricao=descricao||null;t.prioridade=prioridade;t.prazo=prazo;if(patch.historico)t.historico=patch.historico;
  const title=document.getElementById('detalheFormTitulo'),prio=document.getElementById('detalhePrioridade'),desc=document.getElementById('detalheDescricao'),deadline=document.getElementById('detalhePrazo');if(title)title.textContent=titulo;if(prio)prio.textContent=prioridade;if(desc)desc.textContent=descricao||'Sem descrição.';if(deadline)deadline.textContent=prazo?new Date(prazo+'T00:00:00').toLocaleDateString('pt-BR'):'--/--/----';modal.remove();notice('Tarefa alterada com sucesso.');try{if(typeof buscarTarefasDoBanco==='function')await buscarTarefasDoBanco()}catch(_){}
 }catch(err){notice('Erro ao alterar tarefa: '+(err?.message||err),true)}finally{btn.disabled=false;btn.textContent='Salvar alterações'}
}

async function blockStatus(userId){const c=client(),token=session();if(!c||!token)return{blocked_by_me:false,blocked_me:false,noSession:true};const {data,error}=await c.rpc('v1_9_6_message_block_status',{p_session_token:token,p_other_user_id:Number(userId)});if(error)throw error;return data||{blocked_by_me:false,blocked_me:false}}
async function setBlock(userId,blocked){const c=client(),token=session();if(!c||!token)throw new Error('Saia da conta e entre novamente para ativar o bloqueio de mensagens.');const {data,error}=await c.rpc('v1_9_6_set_message_block',{p_session_token:token,p_other_user_id:Number(userId),p_blocked:!!blocked});if(error)throw error;return data}
async function decorateMessage(u){
 const panel=document.getElementById('messagePanel');if(!panel||!u||String(u.id)===String((JSON.parse(localStorage.getItem('usuarioLogado')||'{}')).id||''))return;
 let tools=document.getElementById('v758MsgTools');if(!tools){tools=document.createElement('div');tools.id='v758MsgTools';tools.className='v758-msg-tools';panel.insertBefore(tools,panel.querySelector('.conversation')||panel.firstChild)}
 if(!session()){tools.innerHTML='<div class="v758-block-status mine">Para usar bloqueio de mensagens no site, saia da conta e entre novamente uma vez.</div><button type="button" class="v758-block-btn" disabled>Bloqueio indisponível nesta sessão</button>';return}
 tools.innerHTML='<div class="v758-block-status">Consultando bloqueio…</div>';try{renderBlockTools(u,await blockStatus(u.id))}catch(err){tools.innerHTML=`<div class="v758-block-status warn">Não foi possível consultar o bloqueio: ${esc(err?.message||err)}</div>`}
}
function renderBlockTools(u,st){
 const tools=document.getElementById('v758MsgTools');if(!tools)return;const mine=!!st?.blocked_by_me,theirs=!!st?.blocked_me,locked=mine||theirs;let text='Mensagens liberadas com este usuário.',cls='';
 if(mine&&theirs){text='Usuário bloqueado. Vocês bloquearam mensagens um do outro.';cls='warn'}else if(mine){text='Usuário bloqueado. Você não pode enviar nem receber mensagens deste usuário.';cls='mine'}else if(theirs){text='Este usuário bloqueou suas mensagens. O envio está desativado.';cls='warn'}
 tools.innerHTML=`<div class="v758-block-status ${cls}">${esc(text)}</div><button type="button" class="v758-block-btn ${mine?'unblock':''}" id="v758BlockBtn">${mine?'Desbloquear mensagens':'Bloquear mensagens deste usuário'}</button>`;
 const textarea=document.getElementById('messageText'),send=document.getElementById('sendMessage');if(textarea){textarea.disabled=locked;textarea.placeholder=locked?'Mensagens bloqueadas para este usuário.':'Digite sua mensagem...'}if(send){send.disabled=locked;send.textContent=locked?'🔒 Mensagens bloqueadas':'✈ Enviar mensagem'}
 document.getElementById('v758BlockBtn').onclick=async()=>{const b=document.getElementById('v758BlockBtn');b.disabled=true;try{renderBlockTools(u,await setBlock(u.id,!mine));notice(!mine?'Usuário bloqueado para mensagens.':'Usuário desbloqueado para mensagens.')}catch(err){notice(err?.message||String(err),true)}finally{if(b?.isConnected)b.disabled=false}};
}
function installMessageBlocking(){
 if(page!=='usuarios.html')return true;if(window.__TAREFAS_V758_MESSAGE_PATCH__)return true;
 const originalOpen=window.abrirMensagem,originalSend=window.enviarMensagem;if(typeof originalOpen!=='function'||typeof originalSend!=='function')return false;window.__TAREFAS_V758_MESSAGE_PATCH__=true;
 window.abrirMensagem=async function(u){const r=await originalOpen(u);await decorateMessage(u);return r};
 window.enviarMensagem=async function(u){const txt=document.getElementById('messageText')?.value.trim()||'';if(!txt)return notice('Digite uma mensagem antes de enviar.',true);const token=session();if(!token){notice('Saia da conta e entre novamente para ativar o envio protegido contra bloqueios.',true);return}
  const btn=document.getElementById('sendMessage');if(btn)btn.disabled=true;try{const st=await blockStatus(u.id);if(st.blocked_by_me||st.blocked_me){renderBlockTools(u,st);return notice(st.blocked_me?'Este usuário bloqueou suas mensagens.':'Este usuário está bloqueado para mensagens.',true)}const c=client();const {error}=await c.rpc('v1_9_6_send_message',{p_session_token:token,p_destinatario_id:Number(u.id),p_conteudo:txt});if(error)throw error;document.getElementById('messageText').value='';try{if(typeof atualizarConversa==='function')await atualizarConversa(u)}catch(_){}
  }catch(err){const msg=String(err?.message||err);if(msg.includes('MENSAGEM_BLOQUEADA')){await decorateMessage(u).catch(()=>{});notice('Mensagem não enviada: este usuário está bloqueado.',true)}else notice('Erro ao enviar mensagem: '+msg,true)}finally{if(btn?.isConnected){const st=await blockStatus(u.id).catch(()=>({}));btn.disabled=!!(st.blocked_by_me||st.blocked_me);if(!btn.disabled)btn.textContent='✈ Enviar mensagem'}}};return true;
}
function installLogoutCleanup(){document.addEventListener('click',e=>{const el=e.target?.closest?.('button,a,.logout,.btn-sair-sidebar');if(!el)return;const text=String(el.textContent||'').toLowerCase(),oc=String(el.getAttribute?.('onclick')||'').toLowerCase();if(text.includes('sair')||text.includes('logout')||oc.includes('logout'))localStorage.removeItem(SESSION_KEY)},true)}
function start(){ensureStyle();installLogoutCleanup();let tries=0;(function retry(){tries++;const a=installTaskEditor(),b=installMessageBlocking();if((!a||!b)&&tries<80)setTimeout(retry,100)})()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();