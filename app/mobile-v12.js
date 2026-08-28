(() => {
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase().replace('.html','');
  document.documentElement.classList.add(`tm-page-${page}`);

  function readUser(){
    try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}
  }

  function patchVersion(){
    const el=document.querySelector('.tm-app-brand small');
    if(el) el.textContent='V1.2 • WEB 7.5.2';
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

  function addServiceHub(){
    if(page!=='menu') return;
    const host=document.querySelector('.main-content, main, .content');
    if(!host || document.querySelector('.tm-v12-services-hero')) return;
    const hero=document.createElement('section');
    hero.className='tm-v12-services-hero';
    hero.innerHTML='<small>CENTRAL DE SERVIÇOS</small><h2>Escalas e serviços</h2><p>Acesse rapidamente as áreas mais usadas no celular.</p>';
    const grid=document.createElement('section');
    grid.className='tm-v12-service-grid';
    grid.innerHTML=`
      <a class="tm-v12-service-card" href="pessoal.html"><span class="ico">📅</span><div><strong>Escala Preta</strong><small>Dias da semana</small></div></a>
      <a class="tm-v12-service-card red" href="pessoal.html"><span class="ico">🗓️</span><div><strong>Escala Vermelha</strong><small>Finais de semana e feriados</small></div></a>
      <a class="tm-v12-service-card" href="calendario.html"><span class="ico">▦</span><div><strong>Calendário</strong><small>Visualize serviços e datas</small></div></a>
      <a class="tm-v12-service-card" href="missao.html"><span class="ico">⇄</span><div><strong>Serviços</strong><small>Trocas, histórico e missões</small></div></a>`;
    host.prepend(grid);
    host.prepend(hero);
  }

  window.addEventListener('DOMContentLoaded',()=>{
    patchVersion();
    addProfileCard();
    addServiceHub();
  });
})();
