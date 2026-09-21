(() => {
  'use strict';
  if(!window.__TAREFAS_NATIVE_APP__) return;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const SESSION_KEY='tarefasPushSession17';
  const STYLE_ID='tmMobile196Style';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .tm196-edit-task{background:#0f766e!important;color:#fff!important;border:0!important}
      .tm196-edit-task:hover{background:#115e59!important}
      .tm196-modal{position:fixed;inset:0;z-index:12000;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:16px}
      .tm196-box{width:min(560px,100%);max-height:92vh;overflow:auto;background:var(--v4-surface,#0b1512);color:var(--v4-text,#fff);border:1px solid var(--v4-border,#27463b);border-radius:16px;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,.36)}
      .tm196-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.tm196-head h3{margin:0}.tm196-close{border:0;background:transparent;color:inherit;font-size:26px;cursor:pointer}
      .tm196-field{display:grid;gap:6px;margin:12px 0}.tm196-field label{font-size:12px;font-weight:800}.tm196-field input,.tm196-field textarea,.tm196-field select{width:100%;background:var(--v4-surface-2,#0f1e19);color:inherit;border:1px solid var(--v4-border-strong,#315247);border-radius:9px;padding:11px}.tm196-field textarea{min-height:105px;resize:vertical}
      .tm196-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:16px}.tm196-actions button{border:0;border-radius:9px;padding:11px 14px;font-weight:800;cursor:pointer}.tm196-cancel{background:var(--v4-surface-3,#1b2c26);color:inherit}.tm196-save{background:#047857;color:#fff}.tm196-save:disabled{opacity:.55}
      .tm196-msg-tools{display:grid;gap:8px;margin:0 0 10px}.tm196-block-status{padding:10px 11px;border-radius:10px;background:var(--v4-surface-2,#0f1e19);border:1px solid var(--v4-border,#29493e);font-size:12px;line-height:1.4}.tm196-block-status.warn{background:#3b1f1f;border-color:#7f1d1d;color:#fecaca}.tm196-block-status.mine{background:#332b12;border-color:#7c5d12;color:#fde68a}.tm196-block-btn{width:100%;border:1px solid #7f1d1d;background:#351919;color:#fecaca;border-radius:9px;padding:10px;font-weight:800;cursor:pointer}.tm196-block-btn.unblock{border-color:#166534;background:#12351f;color:#bbf7d0}.tm196-block-btn:disabled{opacity:.55}
      @media(max-width:600px){.tm196-actions{flex-direction:column-reverse}.tm196-actions button{width:100%}}
    `;document.head.appendChild(s);
  }
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const client=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}};
  const session=()=>localStorage.getItem(SESSION_KEY)||'';
  function notice(msg,bad=false){try{if(typeof toast==='function')return toast(msg,bad)}catch(_){} alert(msg)}

  function installTaskEditor(){
    if(page!=='minhas_tarefas.html')return;
    const detail=document.getElementById('modalDetalhesTarefa');if(!detail)return false;
    const actions=detail.querySelector('.modal-buttons');if(!actions)return false;
    if(document.getElementById('tm196EditTask'))return true;
    const b=document.createElement('button');b.type='button';b.id='tm196EditTask';b.className='btn-salvar tm196-edit-task';b.textContent='✎ Alterar tarefa';
    actions.insertBefore(b,actions.firstChild?.nextSibling||actions.firstChild);
    b.addEventListener('click',openTaskEditor);
    return true;
  }

  function selectedTask(){
    try{if(typeof tarefaSelecionadaId==='undefined'||typeof encontrarTarefa!=='function')return null;return encontrarTarefa(tarefaSelecionadaId)||null}catch(_){return null}
  }
  function openTaskEditor(){
    const t=selectedTask();if(!t)return notice('Não foi possível identificar a tarefa selecionada.',true);
    document.getElementById('tm196TaskModal')?.remove();
    const modal=document.createElement('div');modal.id='tm196TaskModal';modal.className='tm196-modal';
    modal.innerHTML=`<div class="tm196-box" role="dialog" aria-modal="true" aria-label="Alterar tarefa"><div class="tm196-head"><h3>Alterar tarefa ${esc(t.codigo||'#'+t.id)}</h3><button class="tm196-close" type="button" aria-label="Fechar">×</button></div><form id="tm196TaskForm"><div class="tm196-field"><label>Título *</label><input id="tm196Title" maxlength="240" required value="${esc(t.titulo||'')}"></div><div class="tm196-field"><label>Descrição</label><textarea id="tm196Desc" maxlength="6000">${esc(t.descricao||'')}</textarea></div><div class="tm196-field"><label>Prioridade</label><select id="tm196Priority"><option${t.prioridade==='Alta'?' selected':''}>Alta</option><option${t.prioridade==='Média'?' selected':''}>Média</option><option${t.prioridade==='Baixa'?' selected':''}>Baixa</option></select></div><div class="tm196-field"><label>Prazo</label><input id="tm196Deadline" type="date" value="${esc(t.prazo||'')}"></div><div class="tm196-actions"><button type="button" class="tm196-cancel">Cancelar</button><button type="submit" class="tm196-save">Salvar alterações</button></div></form></div>`;
    document.body.appendChild(modal);
    const close=()=>modal.remove();modal.querySelector('.tm196-close').onclick=close;modal.querySelector('.tm196-cancel').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});
    modal.querySelector('#tm196TaskForm').addEventListener('submit',e=>saveTaskEdit(e,t,modal));
  }
  async function saveTaskEdit(e,t,modal){
    e.preventDefault();const c=client();if(!c)return notice('Conexão com o banco indisponível.',true);
    const btn=modal.querySelector('.tm196-save'),titulo=modal.querySelector('#tm196Title').value.trim(),descricao=modal.querySelector('#tm196Desc').value.trim(),prioridade=modal.querySelector('#tm196Priority').value,prazo=modal.querySelector('#tm196Deadline').value||null;
    if(!titulo)return notice('Informe o título da tarefa.',true);btn.disabled=true;btn.textContent='Salvando…';
    try{
      const patch={titulo,descricao:descricao||null,prioridade,prazo};
      try{if(typeof normalizarHistorico==='function'&&typeof criarEntradaHistorico==='function'){const h=normalizarHistorico(t.historico);h.push(criarEntradaHistorico('Dados da tarefa alterados pelo aplicativo.'));patch.historico=h}}catch(_){}
      const {error}=await c.from('tarefas').update(patch).eq('id',t.id);if(error)throw error;
      t.titulo=titulo;t.descricao=descricao||null;t.prioridade=prioridade;t.prazo=prazo;if(patch.historico)t.historico=patch.historico;
      const title=document.getElementById('detalheFormTitulo'),prio=document.getElementById('detalhePrioridade'),desc=document.getElementById('detalheDescricao'),deadline=document.getElementById('detalhePrazo');
      if(title)title.textContent=titulo;if(prio)prio.textContent=prioridade;if(desc)desc.textContent=descricao||'Sem descrição.';if(deadline)deadline.textContent=prazo?new Date(prazo+'T00:00:00').toLocaleDateString('pt-BR'):'--/--/----';
      modal.remove();notice('Tarefa alterada com sucesso.');try{if(typeof buscarTarefasDoBanco==='function')await buscarTarefasDoBanco()}catch(_){}
    }catch(err){notice('Erro ao alterar tarefa: '+(err?.message||err),true)}finally{btn.disabled=false;btn.textContent='Salvar alterações'}
  }

  async function blockStatus(userId){
    const c=client(),token=session();if(!c||!token)return{blocked_by_me:false,blocked_me:false,noSession:true};
    const {data,error}=await c.rpc('v1_9_6_message_block_status',{p_session_token:token,p_other_user_id:Number(userId)});if(error)throw error;return data||{blocked_by_me:false,blocked_me:false};
  }
  async function setBlock(userId,blocked){
    const c=client(),token=session();if(!c||!token)throw new Error('Faça login novamente para usar o bloqueio de mensagens.');
    const {data,error}=await c.rpc('v1_9_6_set_message_block',{p_session_token:token,p_other_user_id:Number(userId),p_blocked:!!blocked});if(error)throw error;return data;
  }
  async function decorateMessage(u){
    const panel=document.getElementById('messagePanel');if(!panel||!u||String(u.id)===String((JSON.parse(localStorage.getItem('usuarioLogado')||'{}')).id||''))return;
    let tools=document.getElementById('tm196MsgTools');if(!tools){tools=document.createElement('div');tools.id='tm196MsgTools';tools.className='tm196-msg-tools';panel.insertBefore(tools,panel.querySelector('.conversation')||panel.firstChild)}
    tools.innerHTML='<div class="tm196-block-status">Consultando bloqueio…</div>';
    try{const st=await blockStatus(u.id);renderBlockTools(u,st)}catch(err){tools.innerHTML=`<div class="tm196-block-status warn">Não foi possível consultar o bloqueio: ${esc(err?.message||err)}</div>`}
  }
  function renderBlockTools(u,st){
    const tools=document.getElementById('tm196MsgTools');if(!tools)return;
    const mine=!!st?.blocked_by_me,theirs=!!st?.blocked_me,locked=mine||theirs;
    let text='Mensagens liberadas com este usuário.',cls='';
    if(mine&&theirs){text='Usuário bloqueado. Vocês bloquearam mensagens um do outro.';cls='warn'}
    else if(mine){text='Usuário bloqueado. Você não pode enviar nem receber mensagens deste usuário.';cls='mine'}
    else if(theirs){text='Este usuário bloqueou suas mensagens. O envio está desativado.';cls='warn'}
    tools.innerHTML=`<div class="tm196-block-status ${cls}">${esc(text)}</div><button type="button" class="tm196-block-btn ${mine?'unblock':''}" id="tm196BlockBtn">${mine?'Desbloquear mensagens':'Bloquear mensagens deste usuário'}</button>`;
    const textarea=document.getElementById('messageText'),send=document.getElementById('sendMessage');if(textarea){textarea.disabled=locked;textarea.placeholder=locked?'Mensagens bloqueadas para este usuário.':'Digite sua mensagem...'}if(send){send.disabled=locked;send.textContent=locked?'🔒 Mensagens bloqueadas':'✈ Enviar mensagem'}
    document.getElementById('tm196BlockBtn').onclick=async()=>{const b=document.getElementById('tm196BlockBtn');b.disabled=true;try{const next=await setBlock(u.id,!mine);renderBlockTools(u,next);notice(!mine?'Usuário bloqueado para mensagens.':'Usuário desbloqueado para mensagens.')}catch(err){notice(err?.message||String(err),true)}finally{if(b?.isConnected)b.disabled=false}};
  }

  function installMessageBlocking(){
    if(page!=='usuarios.html')return;
    if(window.__TM196_MESSAGE_PATCH__)return;window.__TM196_MESSAGE_PATCH__=true;
    const tryPatch=()=>{
      const originalOpen=window.abrirMensagem,originalSend=window.enviarMensagem;
      if(typeof originalOpen!=='function'||typeof originalSend!=='function')return false;
      window.abrirMensagem=async function(u){const r=await originalOpen(u);await decorateMessage(u);return r};
      window.enviarMensagem=async function(u){
        const txt=document.getElementById('messageText')?.value.trim()||'';if(!txt)return notice('Digite uma mensagem antes de enviar.',true);
        const token=session();if(!token)return originalSend(u);
        const btn=document.getElementById('sendMessage');if(btn)btn.disabled=true;
        try{const st=await blockStatus(u.id);if(st.blocked_by_me||st.blocked_me){renderBlockTools(u,st);return notice(st.blocked_me?'Este usuário bloqueou suas mensagens.':'Este usuário está bloqueado para mensagens.',true)}
          const c=client();const {error}=await c.rpc('v1_9_6_send_message',{p_session_token:token,p_destinatario_id:Number(u.id),p_conteudo:txt});if(error)throw error;document.getElementById('messageText').value='';try{if(typeof atualizarConversa==='function')await atualizarConversa(u)}catch(_){};
        }catch(err){const msg=String(err?.message||err);if(msg.includes('MENSAGEM_BLOQUEADA')){await decorateMessage(u).catch(()=>{});notice('Mensagem não enviada: este usuário está bloqueado.',true)}else notice('Erro ao enviar mensagem: '+msg,true)}finally{if(btn?.isConnected){const st=await blockStatus(u.id).catch(()=>({}));btn.disabled=!!(st.blocked_by_me||st.blocked_me);if(!btn.disabled)btn.textContent='✈ Enviar mensagem'}}
      };
      return true;
    };
    if(tryPatch())return;let n=0;const t=setInterval(()=>{if(tryPatch()||++n>40)clearInterval(t)},100);
  }

  function start(){ensureStyle();installMessageBlocking();if(!installTaskEditor()&&page==='minhas_tarefas.html'){let n=0;const t=setInterval(()=>{if(installTaskEditor()||++n>40)clearInterval(t)},100)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();