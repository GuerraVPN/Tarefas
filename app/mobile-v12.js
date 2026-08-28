(() => {
  'use strict';
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase().replace('.html','');
  document.documentElement.classList.add(`tm-page-${page}`);

  function readUser(){
    try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}
  }

  function patchVersion(){
    const el=document.querySelector('.tm-app-brand small');
    const text='V1.6 • WEB 7.5.2';
    if(el && el.textContent!==text) el.textContent=text;
  }

  function addProfileCard(){
    if(page!=='configuracoes') return;
    const content=document.querySelector('.content');
    if(!content || content.querySelector('.tm-v12-profile-card')) return;
    const u=readUser()||{};
    const nome=u.nome_guerra||u.nome_completo||'Usuário';
    const detalhe=[u.patente,u.secao].filter(Boolean).join(' • ')||'Perfil conectado';
    const initial=String(nome).trim().charAt(0).toUpperCase()||'U';
    const card=document.createElement('section');
    card.className='tm-v12-profile-card';
    card.innerHTML=`<div class="tm-v12-avatar">${initial}</div><div class="tm-v12-profile-copy"><strong>${nome}</strong><small>${detalhe}</small></div><span class="tm-v12-profile-badge">ONLINE</span>`;
    content.prepend(card);
  }

  function removeOldServiceHub(){
    document.querySelectorAll('.tm-v12-services-hero,.tm-v12-service-grid').forEach(el=>el.remove());
  }

  function activateOrcModule(){
    if(page!=='orcamentarios') return;
    const modulo=new URLSearchParams(location.search).get('modulo');
    const nav=document.getElementById('orcModuleNav');
    if(nav){
      nav.hidden=false;
      nav.setAttribute('aria-hidden','false');
      nav.style.removeProperty('display');
    }
    if(!modulo) return;
    const safe=window.CSS?.escape?CSS.escape(modulo):modulo.replace(/[^a-z0-9_\-]/gi,'');
    const target=document.querySelector(`.orc-module-btn[data-orc-module="${safe}"]`);
    if(target) setTimeout(()=>target.click(),120);
  }

  function stripLegacyMobileChrome(){
    document.querySelectorAll('#v62MobileBar,.v62-mobile-bar,#v62MobileBackdrop,.v62-mobile-backdrop').forEach(el=>el.remove());
    document.body?.classList.remove('v62-mobile-ready','v62-menu-open');
  }

  function apply(){
    patchVersion();
    addProfileCard();
    removeOldServiceHub();
    stripLegacyMobileChrome();
    activateOrcModule();
  }

  // V1.6: sem MutationObserver global. O observer anterior reescrevia o próprio
  // conteúdo observado e podia entrar em ciclo infinito no Android WebView.
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();

  // Pequenas conferências pontuais, sem observar todo o DOM continuamente.
  setTimeout(patchVersion,250);
  setTimeout(stripLegacyMobileChrome,500);
})();
