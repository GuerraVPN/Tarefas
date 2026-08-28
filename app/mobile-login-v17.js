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
      const { data, error } = await client.from('usuarios').select('*').eq('cpf', cpf).single();
      if (error || !data) throw new Error('CPF não cadastrado ou erro na busca.');
      if (data.senha !== senha) throw new Error('Senha incorreta.');

      const { data: pushSession, error: pushError } = await client.rpc('v1_7_emitir_sessao_push', {
        p_usuario_id: Number(data.id),
        p_senha: senha
      });
      if (pushError || !pushSession) throw new Error('Não foi possível ativar o push neste login.');

      localStorage.setItem(PUSH_SESSION_KEY, String(pushSession));
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
