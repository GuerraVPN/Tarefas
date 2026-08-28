(() => {
  document.documentElement.classList.add('tarefas-mobile-shell');

  const currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const isLogin = currentPage === 'index.html' || document.title.toLowerCase().includes('login');
  if (isLogin) document.documentElement.classList.add('mobile-login');

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch((err) => {
        console.warn('[TAREFAS] Service Worker não registrado:', err);
      });
    });
  }

  window.addEventListener('online', () => document.documentElement.classList.remove('is-offline'));
  window.addEventListener('offline', () => document.documentElement.classList.add('is-offline'));
  if (!navigator.onLine) document.documentElement.classList.add('is-offline');

  const icons = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5h-5.8v-6.3H9.3V21H3.5a.5.5 0 0 1-.5-.5z"/><path d="M9.3 21h5.4"/></svg>',
    tasks: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2h6v4H9zM8.5 10h7M8.5 14h7M8.5 18h4"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M7 14h3M14 14h3M7 18h3"/></svg>',
    services: '<svg viewBox="0 0 24 24"><path d="M8 4h8M9 2h6v4H9zM6 7h12l1 14H5z"/><path d="M9 11h6M9 15h6"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  function readUser() {
    try { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); }
    catch (_) { return null; }
  }

  function getActiveSection(page) {
    if (page === 'dashboard.html') return 'home';
    if (page === 'minhas_tarefas.html') return 'tasks';
    if (page === 'calendario.html') return 'calendar';
    if (['menu.html', 'missao.html', 'ferias_dispensas.html'].includes(page)) return 'services';
    return 'more';
  }

  function buildShell() {
    if (isLogin || document.querySelector('.tm-app-header')) return;

    const user = readUser();
    const header = document.createElement('header');
    header.className = 'tm-app-header';
    header.innerHTML = `
      <button class="tm-app-icon-btn" type="button" aria-label="Abrir menu" data-tm-menu>${icons.menu}</button>
      <img class="tm-app-logo" src="assets/logo.svg" alt="TAREFAS">
      <div class="tm-app-brand">
        <strong>TAREFAS</strong>
        <small>V1.1 • WEB 7.5.2</small>
      </div>
      <div class="tm-app-header-actions">
        <button class="tm-app-icon-btn" type="button" aria-label="Notificações" data-tm-notifications>${icons.bell}</button>
      </div>`;

    const active = getActiveSection(currentPage);
    const nav = document.createElement('nav');
    nav.className = 'tm-bottom-nav';
    nav.setAttribute('aria-label', 'Navegação principal');
    const items = [
      ['home', 'dashboard.html', 'Início', icons.home],
      ['tasks', 'minhas_tarefas.html', 'Tarefas', icons.tasks],
      ['calendar', 'calendario.html', 'Calendário', icons.calendar],
      ['services', 'menu.html', 'Serviços', icons.services],
      ['more', 'configuracoes.html', 'Mais', icons.more]
    ];
    nav.innerHTML = items.map(([key, href, label, icon]) =>
      `<a href="${href}" class="${active === key ? 'active' : ''}" data-tm-nav="${key}">${icon}<span>${label}</span></a>`
    ).join('');

    const offline = document.createElement('div');
    offline.className = 'tm-offline-pill';
    offline.textContent = 'Modo offline';

    document.body.append(header, nav, offline);

    header.querySelector('[data-tm-menu]')?.addEventListener('click', () => {
      location.href = 'menu.html';
    });

    header.querySelector('[data-tm-notifications]')?.addEventListener('click', async () => {
      if (window.TarefasNative?.notifications?.ensurePermission) {
        await window.TarefasNative.notifications.ensurePermission().catch(() => {});
      }
      const notificationButton = document.querySelector('[data-notificacoes], .notification-button, .btn-notificacoes, #btnNotificacoes');
      if (notificationButton instanceof HTMLElement) notificationButton.click();
      else location.href = 'configuracoes.html';
    });

    if (user?.nome_guerra) {
      document.documentElement.dataset.tmUser = user.nome_guerra;
    }
  }

  function adaptTables(root = document) {
    root.querySelectorAll('table').forEach((table) => {
      if (table.parentElement?.classList.contains('tarefas-mobile-table-scroll')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'tarefas-mobile-table-scroll';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  function markWideElements(root = document) {
    root.querySelectorAll('[style*="width"], [style*="min-width"]').forEach((el) => {
      const rect = el.getBoundingClientRect?.();
      if (rect && rect.width > window.innerWidth + 8) el.style.maxWidth = '100%';
    });
  }

  function decorateDashboard() {
    if (currentPage !== 'dashboard.html') return;
    document.documentElement.classList.add('tm-dashboard');

    const greeting = document.getElementById('dashGreeting');
    const user = readUser();
    if (greeting && user?.nome_guerra) greeting.textContent = `Bom dia, ${user.nome_guerra}! 💪🏼`;

    const welcome = document.querySelector('.v6-welcome');
    if (welcome && !welcome.querySelector('.tm-dashboard-kicker')) {
      const kicker = document.createElement('div');
      kicker.className = 'tm-dashboard-kicker';
      kicker.textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()).toUpperCase();
      welcome.prepend(kicker);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    buildShell();
    decorateDashboard();
    adaptTables();
    markWideElements();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.closest?.('.tm-app-header, .tm-bottom-nav')) continue;
          if (node.matches?.('table')) adaptTables(node.parentElement || document);
          else adaptTables(node);
          markWideElements(node);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

  try {
    if (window.Capacitor?.isNativePlatform?.()) document.documentElement.classList.add('is-capacitor');
  } catch (_) {}
})();
