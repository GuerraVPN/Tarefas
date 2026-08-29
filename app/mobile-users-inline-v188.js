(() => {
  'use strict';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='usuarios.html'||!window.__TAREFAS_NATIVE_APP__) return;

  const STYLE_ID='tmUsersInline188Style';
  const ACTIVE_CLASS='tm-users-inline-188';
  let rightStack=null;
  let profileSection=null;
  let messageSection=null;

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      @media(max-width:900px){
        body.${ACTIVE_CLASS} .layout{display:block!important}
        body.${ACTIVE_CLASS} .tm-user-inline-panel-188{display:block!important;width:100%!important;margin:0!important;border-radius:0 0 12px 12px!important;border-top:0!important;box-shadow:none!important;animation:tmUserInline188 .16s ease-out}
        body.${ACTIVE_CLASS} .tm-user-inline-panel-188 .panel-title{background:color-mix(in srgb,var(--v4-surface-2,#0f1720) 92%,#22c55e 8%)}
        body.${ACTIVE_CLASS} .user-row.tm-user-inline-owner-188{border-bottom-color:transparent!important;background:var(--v4-surface-2)!important}
        body.${ACTIVE_CLASS} .right-stack{display:none!important}
      }
      @keyframes tmUserInline188{from{opacity:.55;transform:translateY(-5px)}to{opacity:1;transform:none}}
    `;
    document.head.appendChild(style);
  }

  function initRefs(){
    rightStack=document.querySelector('.right-stack');
    profileSection=document.getElementById('profilePanel')?.closest('.panel')||null;
    messageSection=document.getElementById('messagePanel')?.closest('.panel')||null;
    return !!(rightStack&&profileSection&&messageSection);
  }

  function restorePanels(){
    if(!initRefs()) return;
    profileSection.classList.remove('tm-user-inline-panel-188');
    messageSection.classList.remove('tm-user-inline-panel-188');
    if(profileSection.parentNode!==rightStack) rightStack.appendChild(profileSection);
    if(messageSection.parentNode!==rightStack) rightStack.appendChild(messageSection);
    document.querySelectorAll('.user-row.tm-user-inline-owner-188').forEach(row=>row.classList.remove('tm-user-inline-owner-188'));
  }

  function findRow(kind,id){
    const cls=kind==='profile'?'.prop-btn':'.msg-btn';
    const button=[...document.querySelectorAll(cls)].find(el=>String(el.dataset.id||'')===String(id));
    return button?.closest('.user-row')||null;
  }

  function placePanel(kind,id,attempt=0){
    if(window.innerWidth>900){restorePanels();document.body.classList.remove(ACTIVE_CLASS);return;}
    if(!initRefs()){
      if(attempt<12) setTimeout(()=>placePanel(kind,id,attempt+1),50);
      return;
    }
    const row=findRow(kind,id);
    if(!row){if(attempt<12)setTimeout(()=>placePanel(kind,id,attempt+1),50);return;}
    const target=kind==='profile'?profileSection:messageSection;
    const other=kind==='profile'?messageSection:profileSection;

    if(other.parentNode!==rightStack) rightStack.appendChild(other);
    other.classList.remove('tm-user-inline-panel-188');
    document.querySelectorAll('.user-row.tm-user-inline-owner-188').forEach(el=>el.classList.remove('tm-user-inline-owner-188'));

    row.classList.add('tm-user-inline-owner-188');
    row.insertAdjacentElement('afterend',target);
    target.classList.add('tm-user-inline-panel-188');
    document.body.classList.add(ACTIVE_CLASS);
    requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'nearest'}));
  }

  function handleClick(event){
    const prop=event.target.closest?.('.prop-btn');
    const msg=event.target.closest?.('.msg-btn');
    const button=prop||msg;
    if(!button) return;
    const id=button.dataset.id;
    const kind=prop?'profile':'message';
    setTimeout(()=>placePanel(kind,id),0);
    setTimeout(()=>placePanel(kind,id),90);
  }

  function start(){
    ensureStyle();
    initRefs();
    document.addEventListener('click',handleClick,true);
    window.addEventListener('resize',()=>{if(window.innerWidth>900){restorePanels();document.body.classList.remove(ACTIVE_CLASS)}});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
