(() => {
  'use strict';
  const PUSH_SESSION_KEY = 'tarefasPushSession17';
  const SESSION_ACTIVITY_KEY = 'sessao26_ultima_atividade';

  function getClient(){
    try { return typeof supabaseClient !== 'undefined' ? supabaseClient : null; }
    catch (_) { return null; }
  }

  function normalizeCpf(value){ return String(value || '').replace(/\D/g,'').slice(0,11); }

  async function mobileLogin(event){
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'formLogin') return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const client = getClient();
    const cpf = normalizeCpf(document.getElementById('loginCpf')?.value);
    const senha = String(document.getElementById('loginSenha')?.value || '');
    const btn = document.getElementById('btnEntrar');
    if (!client || !cpf || !senha) return;

    if (btn){ btn.disabled = true; btn.textContent = 'Autenticando...'; }

    try {
      const { data: autenticacao, error } = await client.rpc('v7_7_1_autenticar_usuario', {
        p_cpf: cpf,
        p_senha: senha
      });
      const data = autenticacao?.usuario;
      if (error) throw error;
      if (!data || !autenticacao?.session_token) throw new Error('CPF ou senha inválidos.');

      localStorage.setItem(PUSH_SESSION_KEY, String(autenticacao.session_token));
      localStorage.setItem('usuarioLogado', JSON.stringify({
        id: data.id,
        nome_completo: data.nome_completo,
        nome_guerra: data.nome_guerra,
        patente: data.patente,
        secao: data.secao,
        posicao: data.posicao,
        cpf: data.cpf
      }));
      localStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()));
      location.replace('dashboard.html');
    } catch (err) {
      alert(err?.message || String(err));
      if (btn){ btn.disabled = false; btn.textContent = 'Entrar'; }
    }
  }

  document.addEventListener('submit', mobileLogin, true);
})();
