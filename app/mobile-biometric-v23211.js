(() => {
  'use strict';
  if (window.__TAREFAS_BIOMETRIC_V258__) return;
  window.__TAREFAS_BIOMETRIC_V258__ = true;

  const SESSION_KEY = 'tarefasPushSession17';
  const USER_KEY = 'usuarioLogado';
  const ACTIVITY_KEY = 'sessao26_ultima_atividade';
  const CLEAR_PENDING_KEY = 'tarefasBiometricClearPending258';
  let settingsRendering = false;
  const page = () => (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const api = () => window.TarefasNative?.biometric || null;
  const client = () => { try { return typeof supabaseClient !== 'undefined' ? supabaseClient : null; } catch (_) { return null; } };
  const user = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (_) { return null; } };
  const canceled = error => /BIOMETRIC_CANCELED|cancel|cancelad|negativ|senha/i.test(String(error?.code || '') + ' ' + String(error?.message || error || ''));

  function injectCss() {
    if (document.getElementById('tmBiometricCss258')) return;
    const style = document.createElement('style');
    style.id = 'tmBiometricCss258';
    style.textContent = `
      .tm-bio-option{display:flex;align-items:center;gap:10px;margin:2px 0 15px;color:#334155;font-size:13px;line-height:1.35}
      .tm-bio-option input{width:18px!important;height:18px;margin:0!important;accent-color:#047857;flex:0 0 auto}
      .tm-bio-login{margin-top:12px!important;background:#047857!important;display:flex;align-items:center;justify-content:center;gap:9px;font-weight:800}
      .tm-bio-login:disabled{opacity:.62}
      .tm-bio-note{text-align:center;color:#64748b;font-size:11px;line-height:1.4;margin:10px 0 0}
      .tm-bio-remove{display:block;width:auto!important;margin:8px auto 0!important;padding:5px 8px!important;background:transparent!important;color:#64748b!important;font-size:11px!important;text-decoration:underline}
      #tmBiometricCard{grid-column:1/-1}
      #tmBiometricCard .tm-bio-card-body{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
      #tmBiometricCard .tm-bio-card-copy{flex:1;min-width:210px;color:var(--v4-muted,#64748b);font-size:12px;line-height:1.5}
      #tmBiometricCard .tm-bio-card-copy strong{display:block;color:var(--v4-text,#0f172a);font-size:14px;margin-bottom:3px}
      #tmBiometricCard .tm-bio-card-btn{width:auto;border:0;border-radius:9px;padding:11px 15px;background:#047857;color:#fff;font-weight:800}
      #tmBiometricCard .tm-bio-card-btn.off{background:#991b1b}
      #tmBiometricCard .tm-bio-card-btn:disabled{opacity:.6}
    `;
    document.head.appendChild(style);
  }

  async function status() {
    const biometric = api();
    if (!biometric?.isAvailable) return { available: false, hasCredential: false, reason: 'unsupported' };
    try { return await biometric.isAvailable(); }
    catch (_) { return { available: false, hasCredential: false, reason: 'error' }; }
  }

  async function enableWithSession(sessionToken) {
    const biometric = api();
    if (!biometric?.enable) throw new Error('Biometria indisponível neste aparelho.');
    return biometric.enable({ sessionToken: String(sessionToken || '') });
  }

  function saveSession(sessionToken, currentUser) {
    localStorage.setItem(SESSION_KEY, String(sessionToken));
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: currentUser.id,
      nome_completo: currentUser.nome_completo,
      nome_guerra: currentUser.nome_guerra,
      patente: currentUser.patente,
      secao: currentUser.secao,
      posicao: currentUser.posicao,
      cpf: currentUser.cpf
    }));
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
  }

  async function biometricLogin(button) {
    const biometric = api(), supabase = client();
    if (!biometric?.authenticate || !supabase) return;
    const old = button.textContent;
    button.disabled = true;
    button.textContent = 'Aguardando biometria…';
    try {
      const unlocked = await biometric.authenticate();
      const sessionToken = String(unlocked?.sessionToken || '').trim();
      if (sessionToken.length < 32) throw new Error('Credencial biométrica inválida.');
      const { data, error } = await supabase.rpc('v2_3_21_1_biometric_resume', { p_session_token: sessionToken });
      if (error) throw error;
      const currentUser = data?.usuario;
      if (!currentUser?.id || data?.valid !== true) {
        await biometric.clear().catch(() => {});
        throw new Error('A sessão biométrica expirou. Entre novamente com CPF e senha.');
      }
      saveSession(sessionToken, currentUser);
      location.replace('dashboard.html');
    } catch (error) {
      if (!canceled(error)) alert(error?.message || String(error));
      button.disabled = false;
      button.textContent = old;
    }
  }

  async function initLogin() {
    if (page() !== 'index.html') return;
    const form = document.getElementById('formLogin');
    if (!form) return;
    injectCss();
    if (localStorage.getItem(CLEAR_PENDING_KEY) === '1') {
      await api()?.clear?.().catch(() => {});
      localStorage.removeItem(CLEAR_PENDING_KEY);
    }
    const state = await status();
    if (!state.available) {
      if (state.reason === 'not_enrolled') {
        const note = document.createElement('p');
        note.className = 'tm-bio-note';
        note.textContent = 'Cadastre uma biometria segura no Android para ativar o acesso rápido.';
        form.after(note);
      }
      return;
    }

    const password = document.getElementById('loginSenha');
    if (!state.hasCredential && password) {
      const option = document.createElement('label');
      option.className = 'tm-bio-option';
      option.innerHTML = '<input id="tmEnableBiometric" type="checkbox"><span>Ativar login por biometria neste aparelho</span>';
      password.after(option);
    }

    if (state.hasCredential) {
      const button = document.createElement('button');
      button.id = 'tmBiometricLogin';
      button.type = 'button';
      button.className = 'tm-bio-login';
      button.textContent = '☝ Entrar com biometria';
      form.after(button);
      button.addEventListener('click', () => biometricLogin(button));

      const note = document.createElement('p');
      note.className = 'tm-bio-note';
      note.textContent = 'A senha não fica salva. O acesso é protegido pelo Android.';
      button.after(note);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'tm-bio-remove';
      remove.textContent = 'Remover biometria deste aparelho';
      note.after(remove);
      remove.addEventListener('click', async () => {
        if (!confirm('Remover o login biométrico deste aparelho?')) return;
        await api()?.clear?.().catch(() => {});
        location.reload();
      });
    }
  }

  window.TarefasBiometricLogin = Object.freeze({
    async afterPasswordLogin({ sessionToken }) {
      const checkbox = document.getElementById('tmEnableBiometric');
      if (!checkbox?.checked) return false;
      try {
        await enableWithSession(sessionToken);
        return true;
      } catch (error) {
        if (!canceled(error)) alert('O login foi concluído, mas a biometria não pôde ser ativada: ' + (error?.message || error));
        return false;
      }
    }
  });

  async function renderSettingsCard() {
    if (settingsRendering || page() !== 'configuracoes.html' || document.getElementById('tmBiometricCard')) return;
    const biometric = api(), currentUser = user();
    if (!biometric || !currentUser?.id) return;
    settingsRendering = true;
    try {
      const state = await status();
      if (!state.available && state.reason !== 'not_enrolled') return;
      if (document.getElementById('tmBiometricCard')) return;
      const host = document.querySelector('.content .grid') || document.querySelector('.content') || document.querySelector('main');
      if (!host) return;
      injectCss();
      const card = document.createElement('section');
      card.id = 'tmBiometricCard';
      card.className = 'card';
      card.innerHTML = `<div class="card-title">☝ Login por biometria</div><div class="card-body tm-bio-card-body"><div class="tm-bio-card-copy"><strong>${state.hasCredential ? 'Biometria ativada' : state.reason === 'not_enrolled' ? 'Biometria não cadastrada' : 'Biometria disponível'}</strong><span>${state.hasCredential ? 'A credencial está protegida pelo Android Keystore e será confirmada no servidor ao entrar.' : state.reason === 'not_enrolled' ? 'Cadastre sua impressão digital ou rosto nas configurações do Android.' : 'Ative para entrar sem digitar CPF e senha neste aparelho.'}</span></div><button type="button" class="tm-bio-card-btn ${state.hasCredential ? 'off' : ''}">${state.hasCredential ? 'Desativar' : state.reason === 'not_enrolled' ? 'Abrir configurações' : 'Ativar biometria'}</button></div>`;
      host.appendChild(card);
      const button = card.querySelector('button');
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          if (state.hasCredential) {
            if (!confirm('Desativar o login biométrico neste aparelho?')) return;
            await biometric.clear();
          } else if (state.reason === 'not_enrolled') {
            await biometric.openSettings();
            return;
          } else {
            const sessionToken = localStorage.getItem(SESSION_KEY) || '';
            if (sessionToken.length < 32) throw new Error('Entre novamente com CPF e senha antes de ativar a biometria.');
            await enableWithSession(sessionToken);
          }
          card.remove();
          await renderSettingsCard();
        } catch (error) {
          if (!canceled(error)) alert(error?.message || String(error));
        } finally {
          if (button.isConnected) button.disabled = false;
        }
      });
    } finally {
      settingsRendering = false;
    }
  }

  function isLogoutTarget(target) {
    const element = target instanceof Element ? target.closest('button,a,.logout,.btn-sair-sidebar') : null;
    if (!element) return false;
    if (element.matches('.v754-logout')) return false;
    if (element.matches('.logout,.btn-sair-sidebar,[data-v3-logout],#btnSair,#btnSairSessao,#logoutBtn')) return true;
    const text = String(element.textContent || '').toLowerCase();
    const onclick = String(element.getAttribute?.('onclick') || '').toLowerCase();
    return /^\s*(?:➔\s*)?(?:sair|logout)(?:\s+(?:da conta|da sessão))?\s*$/.test(text) || onclick.includes('logout');
  }

  function clearOnLogout(event) {
    if (!isLogoutTarget(event.target)) return;
    localStorage.setItem(CLEAR_PENDING_KEY, '1');
    api()?.clear?.().then(() => localStorage.removeItem(CLEAR_PENDING_KEY)).catch(() => {});
  }

  function start() {
    initLogin().catch(() => {});
    renderSettingsCard().catch(() => {});
    if (page() === 'configuracoes.html') {
      const observer = new MutationObserver(() => renderSettingsCard().catch(() => {}));
      observer.observe(document.body, { childList: true, subtree: true });
    }
    document.addEventListener('click', clearOnLogout, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
