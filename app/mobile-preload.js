(() => {
  const USER_KEY = 'usuarioLogado';
  const ACTIVITY_KEY = 'sessao26_ultima_atividade';

  try {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) return;

    const user = JSON.parse(rawUser);
    if (!user || !user.id) return;

    // Exclusivo do bundle Android/PWA: ao reabrir o app, a sessão existente
    // é considerada ativa novamente. O site web continua com sua regra atual.
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    document.documentElement.dataset.tarefasPersistentSession = '1';
  } catch (_) {
    // Se os dados estiverem inválidos, o fluxo de login original decide o que fazer.
  }
})();
