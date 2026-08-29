(() => {
  'use strict';

  window.__TAREFAS_NATIVE_APP__ = true;
  document.documentElement.classList.add('tarefas-native-app', 'tarefas-mobile-shell', 'tm-v17');
  document.documentElement.dataset.tarefasAppVersion = '1.7';

  const USER_KEY = 'usuarioLogado';
  const ACTIVITY_KEY = 'sessao26_ultima_atividade';
  const PUSH_SESSION_KEY = 'tarefasPushSession17';
  const PUSH_PASSWORD_KEY = 'tarefasPushPassword17';

  function readUser(){
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch (_) { return null; }
  }

  try {
    const user = readUser();
    if (user?.id) {
      localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
      document.documentElement.dataset.tarefasPersistentSession = '1';
    }
  } catch (_) {}

  function captureLoginPassword(){
    const form = document.getElementById('formLogin');
    if (!form || form.dataset.push17Capture === '1') return;
    form.dataset.push17Capture = '1';
    form.addEventListener('submit', () => {
      try {
        const password = document.getElementById('loginSenha')?.value || '';
        if (password) sessionStorage.setItem(PUSH_PASSWORD_KEY, password);
      } catch (_) {}
    }, { capture: true });
  }

  function getClient(){
    try { return typeof supabaseClient !== 'undefined' ? supabaseClient : null; }
    catch (_) { return null; }
  }

  async function bootstrapPushSession(){
    const user = readUser();
    if (!user?.id || localStorage.getItem(PUSH_SESSION_KEY)) return;
    let password = '';
    try { password = sessionStorage.getItem(PUSH_PASSWORD_KEY) || ''; } catch (_) {}
    if (!password) return;

    let client = getClient();
    for (let i = 0; !client && i < 40; i++) {
      await new Promise(r => setTimeout(r, 100));
      client = getClient();
    }
    if (!client) return;

    try {
      const { data, error } = await client.rpc('v1_7_emitir_sessao_push', {
        p_usuario_id: Number(user.id),
        p_senha: password
      });
      if (error || !data) {
        console.warn('[TAREFAS PUSH] Sessão de push não emitida:', error?.message || 'sem token');
        return;
      }
      localStorage.setItem(PUSH_SESSION_KEY, String(data));
      try { sessionStorage.removeItem(PUSH_PASSWORD_KEY); } catch (_) {}
      window.dispatchEvent(new CustomEvent('tarefas:push-session-ready'));
    } catch (err) {
      console.warn('[TAREFAS PUSH] Falha ao preparar sessão:', err);
    }
  }

  const init = () => {
    captureLoginPassword();
    bootstrapPushSession().catch(() => {});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
