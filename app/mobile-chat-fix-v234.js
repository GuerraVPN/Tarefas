(()=>{
'use strict';
const MARK='__TAREFAS_ANDROID_234_CHAT_FIX__';
if(window[MARK])return;window[MARK]=true;
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const style=document.createElement('style');
style.id='mcf234-style';
style.textContent=`
/* 2.3.4: chat acima da barra inferior nativa */
.mcf233-overlay{z-index:2147483000!important;padding:0!important;align-items:flex-end!important}
.mcf233-sheet{height:min(88dvh,760px)!important;max-height:calc(100dvh - env(safe-area-inset-top,0px))!important;padding-bottom:max(env(safe-area-inset-bottom,0px),8px)!important}
.mcf233-compose{position:relative!important;z-index:4!important;flex-shrink:0!important;padding:10px 10px 8px!important;background:var(--v4-surface,#fff)!important}
.mcf233-selected,.mcf233-note{position:relative!important;z-index:4!important;flex-shrink:0!important;background:var(--v4-surface,#fff)!important}
.mcf233-attach,.mcf233-send{display:block!important;visibility:visible!important;opacity:1!important;min-width:44px!important}
.mcf233-toast{z-index:2147483001!important;bottom:calc(18px + env(safe-area-inset-bottom,0px))!important}
@media(max-width:759px){.mcf233-sheet{height:calc(100dvh - 76px)!important;max-height:calc(100dvh - 76px)!important;border-radius:20px 20px 0 0!important}}
@media(min-width:760px){.mcf233-overlay{align-items:center!important;padding:24px!important}.mcf233-sheet{height:min(82dvh,720px)!important;border-radius:20px!important}}
`;
document.head.appendChild(style);
function goChat(id){id=Number(id);if(!id)return;location.href=`usuarios.html?chat=${encodeURIComponent(id)}&from=central`}
if(page==='usuarios.html'){
  const q=new URLSearchParams(location.search),target=Number(q.get('chat')||q.get('usuario')||q.get('conversa')||0);
  if(target){
    let tries=0;
    const open=()=>{
      const btn=document.querySelector(`.msg-btn[data-id="${CSS.escape(String(target))}"]`);
      if(btn){btn.click();return}
      if(++tries<80)setTimeout(open,100);
    };
    setTimeout(open,80);
  }
  return;
}
if(page!=='central.html')return;
/* Conversas existentes da Central passam a usar o mesmo overlay privado do app. */
document.addEventListener('click',e=>{
  const conv=e.target instanceof Element?e.target.closest('[data-conv]'):null;
  if(conv){e.preventDefault();e.stopImmediatePropagation();goChat(conv.dataset.conv);return}
  const pick=e.target instanceof Element?e.target.closest('[data-user]'):null;
  if(pick){e.preventDefault();e.stopImmediatePropagation();goChat(pick.dataset.user)}
},true);
/* Mantém o seletor de destinatário da Central, mas deixa claro que a conversa abrirá no chat novo. */
const newMsg=document.getElementById('newMsg');
if(newMsg)newMsg.addEventListener('click',()=>setTimeout(()=>{
  const box=document.querySelector('#newMsgBg .new-msg');
  if(!box||box.querySelector('[data-mcf234-hint]'))return;
  const hint=document.createElement('div');hint.dataset.mcf234Hint='1';hint.textContent='Escolha o destinatário para abrir o chat privado com anexos.';hint.style.cssText='font-size:11px;color:var(--v4-muted,#6b7280);margin:-4px 0 10px';box.querySelector('h3')?.after(hint);
},0),true);
})();
