(() => {
  'use strict';

  // Executa no <head>, antes dos scripts legados do site.
  window.__TAREFAS_NATIVE_APP__ = true;
  document.documentElement.classList.add('tarefas-native-app', 'tarefas-mobile-shell', 'tm-v17');
  document.documentElement.dataset.tarefasAppVersion = '1.7';

  const USER_KEY = 'usuarioLogado';
  const ACTIVITY_KEY = 'sessao26_ultima_atividade';

  try {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) return;

    const user = JSON.parse(rawUser);
    if (!user || !user.id) return;

    localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    document.documentElement.dataset.tarefasPersistentSession = '1';
  } catch (_) {
    // Se os dados estiverem inválidos, o fluxo de login original decide o que fazer.
  }
})();
