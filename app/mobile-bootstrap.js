(() => {
  'use strict';
  document.documentElement.classList.add('tarefas-mobile-shell','tm-v13');

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const isLogin = page === 'index.html' || document.title.toLowerCase().includes('login');
  if (isLogin) document.documentElement.classList.add('mobile-login');

  const SVG = {
    menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    bell:'<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
    home:'<svg viewBox="0 0 24 24"><path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5h-5.8v-6.3H9.3V21H3.5a.5.5 0 0 1-.5-.5z"/></svg>',
    tasks:'<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2h6v4H9zM8.5 10h7M8.5 14h7M8.5 18h4"/></svg>',
    calendar:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18"/></svg>',
    services:'<svg viewBox="0 0 24 24"><path d="M8 4h8M9 2h6v4H9zM6 7h12l1 14H5z"/><path d="M9 11h6M9 15h6"/></svg>',
    more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>',
    close:'<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    chevron:'<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
    down:'<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>'
  };

  const ORC = [
    ['Relatório geral','orcamentarios.html','Visão consolidada'],
    ['Guias','orcamentarios.html?modulo=guias','Guias e fiscalização'],
    ['Desrelacionamento / Baixa','orcamentarios.html?modulo=baixas','Baixas e desrelacionamentos'],
    ['Distribuição','orcamentarios.html?modulo=distribuicao','Distribuição de material'],
    ['Movimentação de Material','orcamentarios.html?modulo=movimentacao','Movimentações entre cargas'],
    ['Material Carga / Depósito','orcamentarios.html?modulo=material_carga','Controle de material carga'],
    ['Passagem de Carga','orcamentarios.html?modulo=passagem_carga','Passagens e detentores']
  ];

  const AREAS = [
    ['Principal', [
      ['Início','dashboard.html','Visão geral'],
      ['Quadro','menu.html','Kanban de tarefas'],
      ['Minhas tarefas','minhas_tarefas.html','Tarefas do perfil ativo'],
      ['Calendário','calendario.html','Prazos, serviços e datas']
    ]],
    ['Serviços e pessoal', [
      ['Pessoal / Escalas','pessoal.html','Escala preta, vermelha e SV/TSV'],
      ['Missões','missao.html','Missões e serviços'],
      ['Férias e dispensas','ferias_dispensas.html','Ausências e dispensas']
    ]],
    ['Comunicação', [['Central','central.html','Notificações e mensagens']]],
    ['Gestão', [
      ['Usuários','usuarios.html','Cadastros e acessos'],
      ['Relatórios','relatorios.html','Indicadores e relatórios'],
      ['Orçamentários','#orcamentarios','Guias, baixas, distribuição e movimentações'],
      ['Histórico / Auditoria','historico_auditoria.html','Histórico de alterações']
    ]],
    ['Sistema', [
      ['Configurações','configuracoes.html','Perfil e preferências'],
      ['Ajuda','help.html','Ajuda do sistema'],
      ['Sobre','about.html','Versão e informações']
    ]]
  ];

  const readUser = () => { try { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); } catch (_) { return null; } };
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const navigate = href => { if (!href) return; const current = page + location.search; if (href !== current) location.href = href; };

  function removeLegacyChrome(root=document){
    root.querySelectorAll?.('#v62MobileBar,.v62-mobile-bar,#v62MobileBackdrop,.v62-mobile-backdrop').forEach(el=>el.remove());
    document.body?.classList.remove('v62-mobile-ready','v62-menu-open');
  }

  function activeKey(){
    if(page==='dashboard.html') return 'home';
    if(page==='minhas_tarefas.html'||page==='menu.html') return 'tasks';
    if(page==='calendario.html') return 'calendar';
    if(['pessoal.html','missao.html','ferias_dispensas.html'].includes(page)) return 'services';
    return 'more';
  }

  function sheetBase(id,title){
    document.getElementById(id)?.remove();
    const wrap=document.createElement('div');
    wrap.id=id; wrap.className='tm-sheet-wrap';
    wrap.innerHTML=`<div class="tm-sheet-backdrop" data-close></div><section class="tm-sheet" role="dialog" aria-modal="true"><header><h2>${esc(title)}</h2><button class="tm-icon" data-close aria-label="Fechar">${SVG.close}</button></header><div class="tm-sheet-body"></div></section>`;
    wrap.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>wrap.remove()));
    document.body.appendChild(wrap);
    requestAnimationFrame(()=>wrap.classList.add('open'));
    return wrap;
  }

  function orcSubmenu(){
    return `<div class="tm-drawer-sub" data-orc-sub hidden>${ORC.map(([name,href,desc])=>`<button class="tm-drawer-subitem" data-href="${href}"><span><strong>${esc(name)}</strong><small>${esc(desc)}</small></span>${SVG.chevron}</button>`).join('')}</div>`;
  }

  function openDrawer(){
    const user=readUser();
    const wrap=sheetBase('tmDrawer','Menu');
    const body=wrap.querySelector('.tm-sheet-body');
    body.innerHTML=`<button class="tm-user-card" id="tmProfileButton"><span class="tm-avatar">${esc((user?.nome_guerra||'U').slice(0,1).toUpperCase())}</span><span><strong>${esc(user?.patente||'')} ${esc(user?.nome_guerra||'Usuário')}</strong><small>${esc(user?.secao||'')} • ${esc(user?.posicao||'')}</small></span>${SVG.chevron}</button>` + AREAS.map(([group,items])=>`<div class="tm-drawer-group"><h3>${esc(group)}</h3>${items.map(([name,href,desc])=> href==='#orcamentarios' ? `<button class="tm-drawer-item tm-drawer-parent" data-orc-toggle aria-expanded="false"><span><strong>${esc(name)}</strong><small>${esc(desc)}</small></span><span class="tm-orc-chevron">${SVG.down}</span></button>${orcSubmenu()}` : `<button class="tm-drawer-item ${page===href?'active':''}" data-href="${href}"><span><strong>${esc(name)}</strong><small>${esc(desc)}</small></span>${SVG.chevron}</button>`).join('')}</div>`).join('');
    body.querySelectorAll('[data-href]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.href)));
    body.querySelector('[data-orc-toggle]')?.addEventListener('click',e=>{
      const btn=e.currentTarget, sub=body.querySelector('[data-orc-sub]');
      const open=btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded',String(!open));
      if(sub) sub.hidden=open;
      btn.classList.toggle('open',!open);
    });
    if(page==='orcamentarios.html'){
      const btn=body.querySelector('[data-orc-toggle]'), sub=body.querySelector('[data-orc-sub]');
      if(btn){btn.setAttribute('aria-expanded','true');btn.classList.add('open');}
      if(sub) sub.hidden=false;
    }
    body.querySelector('#tmProfileButton')?.addEventListener('click',()=>{wrap.remove();openProfiles();});
  }

  async function openProfiles(){
    const wrap=sheetBase('tmProfiles','Trocar perfil');
    const body=wrap.querySelector('.tm-sheet-body');
    body.innerHTML='<div class="tm-loading">Carregando perfis…</div>';
    const base=readUser();
    let client=null; try { if(typeof supabaseClient!=='undefined') client=supabaseClient; } catch(_) {}
    if(!base?.id || !client || !window.Perfis26){ body.innerHTML='<div class="tm-empty">Não foi possível carregar os perfis nesta tela.</div>'; return; }
    try{
      const estado=await window.Perfis26.carregar(client,base);
      body.innerHTML=`<div class="tm-profile-current"><span class="tm-avatar">${esc((base.nome_guerra||'U').slice(0,1).toUpperCase())}</span><div><strong>${esc(base.patente||'')} ${esc(base.nome_guerra||'')}</strong><small>Escolha o perfil de trabalho</small></div></div><div class="tm-profile-list"></div>`;
      const list=body.querySelector('.tm-profile-list');
      estado.perfis.forEach(p=>{
        const ativo=String(p.id)===String(estado.ativo?.id);
        const b=document.createElement('button'); b.className='tm-profile-option'+(ativo?' active':'');
        b.innerHTML=`<span><strong>${esc(window.Perfis26.label(p))}</strong>${p.principal?'<small>Perfil principal</small>':''}</span><span>${ativo?'✓':SVG.chevron}</span>`;
        b.addEventListener('click',()=>{ if(!ativo) window.Perfis26.trocar(estado.usuario,p); }); list.appendChild(b);
      });
    }catch(err){ body.innerHTML=`<div class="tm-empty">Erro ao carregar perfis: ${esc(err?.message||err)}</div>`; }
  }

  async function openNotifications(){
    const wrap=sheetBase('tmNotifications','Notificações');
    const body=wrap.querySelector('.tm-sheet-body');
    body.innerHTML='<div class="tm-loading">Carregando notificações…</div>';
    if(window.TarefasNative?.notifications?.ensurePermission){ window.TarefasNative.notifications.ensurePermission().catch(()=>{}); }
    try{
      const api=window.Notificacoes26;
      if(!api){ body.innerHTML='<div class="tm-empty">Central de notificações indisponível nesta tela.</div><button class="tm-primary" data-central>Abrir Central</button>'; body.querySelector('[data-central]')?.addEventListener('click',()=>navigate('central.html?tab=notificacoes')); return; }
      const [rows,counters]=await Promise.all([api.recentes(12),api.contadores()]);
      body.innerHTML=`<div class="tm-notif-summary"><strong>${counters.notificacoes||0}</strong><span>não lidas</span><button data-central>Abrir Central</button></div><div class="tm-notif-list"></div>`;
      body.querySelector('[data-central]')?.addEventListener('click',()=>navigate('central.html?tab=notificacoes'));
      const list=body.querySelector('.tm-notif-list');
      if(!rows.length){ list.innerHTML='<div class="tm-empty">Nenhuma notificação recente.</div>'; return; }
      rows.forEach(r=>{
        const b=document.createElement('button'); b.className='tm-notif-item'+(!r.lida?' unread':'');
        const when=r.criada_em?new Date(r.criada_em).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
        b.innerHTML=`<span class="tm-notif-dot"></span><span><strong>${esc(r.titulo||'Notificação')}</strong><small>${esc(r.mensagem||'')}</small><em>${esc(when)}</em></span>${SVG.chevron}`;
        b.addEventListener('click',async()=>{ await api.marcarLida(r).catch(()=>{}); wrap.remove(); navigate(api.destinoNotificacao(r)); }); list.appendChild(b);
      });
    }catch(err){ body.innerHTML=`<div class="tm-empty">Erro ao carregar notificações: ${esc(err?.message||err)}</div>`; }
  }

  function buildShell(){
    if(isLogin || document.querySelector('.tm-app-header')) return;
    removeLegacyChrome();
    const user=readUser();
    const header=document.createElement('header'); header.className='tm-app-header';
    header.innerHTML=`<button class="tm-icon" data-menu aria-label="Menu">${SVG.menu}</button><img class="tm-app-logo" src="assets/logo.svg" alt=""><button class="tm-app-brand" data-profile><strong>TAREFAS</strong><small>V1.3 • WEB 7.5.2</small></button><button class="tm-icon tm-bell" data-bell aria-label="Notificações">${SVG.bell}<span class="tm-badge" hidden>0</span></button>`;
    header.querySelector('[data-menu]').addEventListener('click',openDrawer);
    header.querySelector('[data-profile]').addEventListener('click',openProfiles);
    header.querySelector('[data-bell]').addEventListener('click',openNotifications);

    const nav=document.createElement('nav'); nav.className='tm-bottom-nav';
    const active=activeKey();
    const items=[['home','dashboard.html','Início',SVG.home],['tasks','minhas_tarefas.html','Tarefas',SVG.tasks],['calendar','calendario.html','Calendário',SVG.calendar],['services','pessoal.html','Serviços',SVG.services],['more','#','Mais',SVG.more]];
    nav.innerHTML=items.map(([key,href,label,icon])=>`<button class="${active===key?'active':''}" data-key="${key}" data-href="${href}">${icon}<span>${label}</span></button>`).join('');
    nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>b.dataset.key==='more'?openDrawer():navigate(b.dataset.href)));
    document.body.append(header,nav);

    if(user?.nome_guerra) document.documentElement.dataset.tmUser=user.nome_guerra;
    const refreshBadge=async()=>{ try{ const c=await window.Notificacoes26?.contadores?.(); const badge=header.querySelector('.tm-badge'); if(badge&&c){badge.textContent=String(c.notificacoes||0);badge.hidden=!(c.notificacoes>0);} }catch(_){} };
    refreshBadge(); window.addEventListener('v3:contadores',refreshBadge); window.addEventListener('v6:notificacoes:update',refreshBadge);
  }

  function adaptTables(root=document){ root.querySelectorAll?.('table').forEach(t=>{ if(t.closest('.tarefas-mobile-table-scroll'))return; const w=document.createElement('div');w.className='tarefas-mobile-table-scroll';t.parentNode.insertBefore(w,t);w.appendChild(t); }); }

  function init(){
    removeLegacyChrome(); buildShell(); adaptTables();
    const observer=new MutationObserver(ms=>{ removeLegacyChrome(); for(const m of ms)for(const n of m.addedNodes){ if(n instanceof Element && !n.closest?.('.tm-sheet-wrap,.tm-app-header,.tm-bottom-nav')) adaptTables(n); } });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  window.addEventListener('online',()=>document.documentElement.classList.remove('is-offline'));
  window.addEventListener('offline',()=>document.documentElement.classList.add('is-offline'));
  if(!navigator.onLine) document.documentElement.classList.add('is-offline');
})();