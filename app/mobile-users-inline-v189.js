(() => {
  'use strict';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='usuarios.html'||!window.__TAREFAS_NATIVE_APP__) return;

  const STYLE_ID='tmUsersInline189Style';
  const ACTIVE_CLASS='tm-users-inline-189';
  const SOURCE_CLASS='tm-users-inline-source-189';
  let rightStack=null;
  let profileSection=null;
  let messageSection=null;
  let actionSequence=0;
  let activeKind='';
  let activeId='';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      @media(max-width:900px){
        body .right-stack.${SOURCE_CLASS}{display:none!important}
        body.${ACTIVE_CLASS} .layout{display:block!important}
        body.${ACTIVE_CLASS} .tm-user-inline-panel-189{display:block!important;width:100%!important;margin:0!important;border-radius:0 0 12px 12px!important;border-top:0!important;box-shadow:none!important;animation:tmUserInline189 .16s ease-out}
        body.${ACTIVE_CLASS} .tm-user-inline-panel-189 .panel-title{background:color-mix(in srgb,var(--v4-surface-2,#0f1720) 92%,#22c55e 8%)}
        body.${ACTIVE_CLASS} .user-row.tm-user-inline-owner-189{border-bottom-color:transparent!important;background:var(--v4-surface-2)!important}
      }
      @keyframes tmUserInline189{from{opacity:.55;transform:translateY(-5px)}to{opacity:1;transform:none}}
    `;
    document.head.appendChild(style);
  }

  function initRefs(){
    if(!rightStack||!rightStack.isConnected) rightStack=document.querySelector('.right-stack');
    if(!profileSection||!profileSection.isConnected) profileSection=document.getElementById('profilePanel')?.closest('.panel')||profileSection;
    if(!messageSection||!messageSection.isConnected) messageSection=document.getElementById('messagePanel')?.closest('.panel')||messageSection;
    if(rightStack) rightStack.classList.add(SOURCE_CLASS);
    return !!(rightStack&&profileSection&&messageSection);
  }

  function sendToSource(panel){
    if(!panel||!rightStack) return;
    panel.classList.remove('tm-user-inline-panel-189');
    panel.removeAttribute('data-tm-inline-kind');
    if(panel.parentNode!==rightStack) rightStack.appendChild(panel);
  }

  function restorePanels(){
    if(!initRefs()) return;
    sendToSource(profileSection);
    sendToSource(messageSection);
    document.querySelectorAll('.user-row.tm-user-inline-owner-189').forEach(row=>row.classList.remove('tm-user-inline-owner-189'));
  }

  function findRow(kind,id){
    const cls=kind==='profile'?'.prop-btn':'.msg-btn';
    const button=[...document.querySelectorAll(cls)].find(el=>String(el.dataset.id||'')===String(id));
    return button?.closest('.user-row')||null;
  }

  function placeExclusivePanel(kind,id,sequence,attempt=0){
    if(sequence!==actionSequence||kind!==activeKind||String(id)!==String(activeId)) return;
    if(window.innerWidth>900){restorePanels();document.body.classList.remove(ACTIVE_CLASS);return;}
    if(!initRefs()){
      if(attempt<12) setTimeout(()=>placeExclusivePanel(kind,id,sequence,attempt+1),40);
      return;
    }
    const row=findRow(kind,id);
    if(!row){
      if(attempt<12) setTimeout(()=>placeExclusivePanel(kind,id,sequence,attempt+1),40);
      return;
    }
    const target=kind==='profile'?profileSection:messageSection;
    const other=kind==='profile'?messageSection:profileSection;

    // Exclusividade: o painel oposto volta para a origem ANTES de abrir o escolhido.
    sendToSource(other);
    document.querySelectorAll('.user-row.tm-user-inline-owner-189').forEach(el=>el.classList.remove('tm-user-inline-owner-189'));
    row.classList.add('tm-user-inline-owner-189');
    row.insertAdjacentElement('afterend',target);
    target.classList.add('tm-user-inline-panel-189');
    target.dataset.tmInlineKind=kind;
    document.body.classList.add(ACTIVE_CLASS);
    requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'nearest'}));
  }

  function handleClick(event){
    const prop=event.target.closest?.('.prop-btn');
    const msg=event.target.closest?.('.msg-btn');
    const button=prop||msg;
    if(!button) return;

    const kind=prop?'profile':'message';
    const id=String(button.dataset.id||'');
    const sequence=++actionSequence;
    activeKind=kind;
    activeId=id;

    // Este listener roda na captura. Restauramos o painel atual antes que
    // usuarios.html execute renderLista(), evitando que o painel movido seja destruído.
    restorePanels();
    document.body.classList.remove(ACTIVE_CLASS);

    // O handler original atualiza o conteúdo no mesmo clique; depois recolocamos
    // somente o painel escolhido entre este usuário e o próximo.
    setTimeout(()=>placeExclusivePanel(kind,id,sequence),0);
    setTimeout(()=>placeExclusivePanel(kind,id,sequence),90);
  }

  function start(){
    ensureStyle();
    initRefs();
    document.addEventListener('click',handleClick,true);
    window.addEventListener('resize',()=>{
      if(window.innerWidth>900){
        actionSequence++;
        activeKind='';activeId='';
        restorePanels();
        document.body.classList.remove(ACTIVE_CLASS);
      }
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
