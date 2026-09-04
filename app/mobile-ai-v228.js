(() => {
  'use strict';

  const MARK = '__TAREFAS_ANDROID_228_AI__';
  const SESSION_KEY = 'tarefasPushSession17';
  const ENDPOINT = 'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/tarefas-ai';
  const MAX_LOCAL_MESSAGES = 20;

  if (window[MARK]) return;
  window[MARK] = true;

  function user() {
    try { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); }
    catch (_) { return null; }
  }

  function page() {
    return (location.pathname.split('/').pop() || '').toLowerCase();
  }

  function historyKey(id) {
    return `tarefas_ai_v228_${id}`;
  }

  function readStored(key) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw
        .filter(item => item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string')
        .slice(-MAX_LOCAL_MESSAGES)
        .map(item => ({ role: item.role, text: item.text.slice(0, 4000) }));
    } catch (_) {
      return [];
    }
  }

  function readHistory(id) {
    const current = readStored(historyKey(id));
    if (current.length) return current;
    return readStored(`tarefas_ai_v227_${id}`);
  }

  function writeHistory(id, messages) {
    try { localStorage.setItem(historyKey(id), JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES))); }
    catch (_) {}
  }

  function injectCss() {
    if (document.getElementById('ai228-style')) return;
    const style = document.createElement('style');
    style.id = 'ai228-style';
    style.textContent = `
      .ai228-fab{position:fixed;right:16px;bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:10025;border:0;border-radius:18px;background:linear-gradient(135deg,var(--v4-accent,#2563eb),#7c3aed);color:#fff;min-height:46px;padding:12px 16px;font-weight:900;box-shadow:0 12px 30px rgba(0,0,0,.26);cursor:pointer;letter-spacing:.1px;touch-action:manipulation}
      .ai228-fab.hidden{display:none!important}
      body.ai228-open .bn-fab{display:none!important}
      .ai228-panel{position:fixed;right:14px;top:74px;bottom:14px;width:390px;max-width:calc(100vw - 22px);z-index:10050;background:var(--v4-surface,#fff);border:1px solid var(--v4-border,#d7dce3);border-radius:16px;box-shadow:0 18px 48px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden;transform:translateX(calc(100% + 32px));transition:transform .22s ease}
      .ai228-panel.open{transform:none}
      .ai228-head{padding:12px 13px;border-bottom:1px solid var(--v4-border,#d7dce3);display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--v4-surface,#fff)}
      .ai228-title{display:flex;flex-direction:column;min-width:0}.ai228-title strong{font-size:16px}.ai228-title span{font-size:10px;color:var(--v4-muted,#6b7280);font-weight:700}
      .ai228-head-actions{display:flex;gap:6px}.ai228-head button{border:0;border-radius:8px;padding:7px 9px;font-weight:800;cursor:pointer;background:var(--v4-surface-3,#eef2f7);color:inherit}
      .ai228-messages{flex:1;overflow:auto;padding:12px;background:var(--v4-surface-2,#f6f7f9);display:flex;flex-direction:column;gap:9px;overscroll-behavior:contain}
      .ai228-row{display:flex}.ai228-row.user{justify-content:flex-end}.ai228-row.model{justify-content:flex-start}
      .ai228-bubble{max-width:86%;padding:10px 11px;border-radius:14px;font-size:13px;line-height:1.42;white-space:pre-wrap;word-break:break-word;box-shadow:0 1px 2px rgba(0,0,0,.06)}
      .ai228-row.user .ai228-bubble{background:var(--v4-accent,#2563eb);color:#fff;border-bottom-right-radius:5px}
      .ai228-row.model .ai228-bubble{background:var(--v4-surface,#fff);color:inherit;border:1px solid var(--v4-border,#d7dce3);border-bottom-left-radius:5px}
      .ai228-row.system .ai228-bubble{max-width:100%;margin:auto;background:transparent;color:var(--v4-muted,#6b7280);box-shadow:none;font-size:10px;text-align:center;padding:2px 8px}
      .ai228-typing{opacity:.72;font-style:italic}
      .ai228-compose{border-top:1px solid var(--v4-border,#d7dce3);padding:9px;background:var(--v4-surface,#fff);display:flex;gap:7px;align-items:flex-end}
      .ai228-compose textarea{flex:1;resize:none;min-height:42px;max-height:120px;border:1px solid var(--v4-border,#d7dce3);background:var(--v4-surface,#fff);color:inherit;border-radius:11px;padding:10px 11px;font:inherit;font-size:13px;outline:none}
      .ai228-compose textarea:focus{border-color:var(--v4-accent,#2563eb);box-shadow:0 0 0 2px color-mix(in srgb,var(--v4-accent,#2563eb) 18%,transparent)}
      .ai228-send{min-width:52px;height:42px;border:0;border-radius:11px;background:var(--v4-accent,#2563eb);color:#fff;font-weight:900;cursor:pointer}.ai228-send:disabled{opacity:.55;cursor:default}
      .ai228-foot{padding:6px 10px 8px;text-align:center;font-size:9px;color:var(--v4-muted,#6b7280);background:var(--v4-surface,#fff)}
      @media(max-width:700px){.ai228-panel{left:8px;right:8px;width:auto;top:calc(62px + env(safe-area-inset-top,0px));bottom:calc(82px + env(safe-area-inset-bottom,0px));border-radius:18px}.ai228-fab{right:16px;bottom:calc(150px + env(safe-area-inset-bottom,0px))}}
    `;
    document.head.appendChild(style);
  }

  function createRow(role, text, extraClass = '') {
    const row = document.createElement('div');
    row.className = `ai228-row ${role}${extraClass ? ` ${extraClass}` : ''}`;
    const bubble = document.createElement('div');
    bubble.className = 'ai228-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    return row;
  }

  function friendlyError(code, status) {
    if (status === 401 || code === 'session_expired' || code === 'session_required') return 'Sua sessão expirou. Saia e entre novamente no aplicativo.';
    if (code === 'rate_limited') return 'Você enviou mensagens muito rápido. Aguarde alguns segundos e tente novamente.';
    if (code === 'provider_limit') return 'A cota da IA foi atingida por enquanto. Tente novamente mais tarde.';
    if (code === 'provider_auth') return 'A configuração da chave da IA foi recusada pelo provedor. O problema está no servidor, não na sua internet.';
    if (code === 'provider_model') return 'O modelo de IA configurado não está disponível no momento.';
    if (code === 'provider_unavailable') return 'O serviço de IA está temporariamente indisponível. Tente novamente em alguns instantes.';
    if (code === 'provider_request') return 'O provedor da IA recusou esta solicitação. O erro foi registrado no servidor.';
    if (code === 'provider_network') return 'O servidor TAREFAS não conseguiu alcançar o provedor da IA agora.';
    if (code === 'gemini_not_configured') return 'A IA ainda não está configurada no servidor.';
    if (code === 'empty_response') return 'A IA não retornou uma resposta desta vez. Tente reformular a pergunta.';
    if (code === 'network') return 'Não consegui alcançar o servidor TAREFAS. Verifique a conexão do aparelho e tente novamente.';
    if (status >= 500) return 'A IA respondeu com um erro no servidor. Tente novamente em alguns instantes.';
    return 'Não consegui concluir a solicitação com a IA agora.';
  }

  async function init() {
    const me = user();
    if (!me?.id || page() === 'index.html') return;
    const session = String(localStorage.getItem(SESSION_KEY) || '').trim();
    if (!session) return;

    injectCss();

    let messages = readHistory(me.id);
    let sending = false;

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'ai228-fab';
    fab.setAttribute('aria-label', 'Abrir Assistente IA');
    fab.textContent = '✨ IA';

    const panel = document.createElement('aside');
    panel.className = 'ai228-panel';
    panel.setAttribute('aria-label', 'Assistente IA');
    panel.setAttribute('role', 'dialog');
    panel.innerHTML = `
      <div class="ai228-head">
        <div class="ai228-title"><strong>✨ Assistente IA</strong><span>BETA 2.2.8 · somente leitura</span></div>
        <div class="ai228-head-actions"><button type="button" data-ai-clear>Limpar</button><button type="button" data-ai-close>Fechar</button></div>
      </div>
      <div class="ai228-messages"></div>
      <form class="ai228-compose">
        <textarea rows="1" maxlength="4000" placeholder="Pergunte alguma coisa..." aria-label="Mensagem para a IA"></textarea>
        <button class="ai228-send" type="submit">➤</button>
      </form>
      <div class="ai228-foot">Nesta beta a IA responde perguntas, mas ainda não altera dados do TAREFAS.</div>
    `;

    document.body.append(fab, panel);
    const list = panel.querySelector('.ai228-messages');
    const form = panel.querySelector('.ai228-compose');
    const input = panel.querySelector('textarea');
    const send = panel.querySelector('.ai228-send');

    function scrollEnd() {
      requestAnimationFrame(() => { list.scrollTop = list.scrollHeight; });
    }

    function render() {
      list.textContent = '';
      if (!messages.length) {
        list.appendChild(createRow('model', 'Olá! Sou o Assistente IA do TAREFAS. Nesta beta posso responder perguntas e ajudar com textos, mas ainda não consulto nem altero dados do sistema.'));
      } else {
        for (const message of messages) list.appendChild(createRow(message.role, message.text));
      }
      scrollEnd();
    }

    function open(value) {
      panel.classList.toggle('open', value);
      fab.classList.toggle('hidden', value);
      document.body.classList.toggle('ai228-open', value);
      if (value) {
        const notesClose = document.querySelector('.bn-panel.open .bn-close');
        if (notesClose instanceof HTMLElement) notesClose.click();
        setTimeout(() => input.focus(), 80);
      }
    }

    function save() {
      writeHistory(me.id, messages);
    }

    async function ask(text) {
      if (sending) return;
      const prompt = String(text || '').trim();
      if (!prompt) return;

      sending = true;
      send.disabled = true;
      input.disabled = true;
      const previous = messages.slice(-8);
      messages.push({ role: 'user', text: prompt });
      save();
      render();

      const typing = createRow('model', 'Pensando...', 'ai228-typing');
      list.appendChild(typing);
      scrollEnd();

      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tarefas-Session': session,
          },
          body: JSON.stringify({ prompt, history: previous }),
        });
        const data = await response.json().catch(() => ({}));
        typing.remove();
        if (!response.ok || !data?.ok || !data?.answer) {
          list.appendChild(createRow('model', friendlyError(data?.error, response.status)));
          scrollEnd();
          return;
        }
        messages.push({ role: 'model', text: String(data.answer).slice(0, 8000) });
        save();
        render();
      } catch (_) {
        typing.remove();
        list.appendChild(createRow('model', friendlyError('network', 0)));
        scrollEnd();
      } finally {
        sending = false;
        send.disabled = false;
        input.disabled = false;
        input.focus();
      }
    }

    fab.addEventListener('click', () => open(true));
    panel.querySelector('[data-ai-close]').addEventListener('click', () => open(false));
    panel.querySelector('[data-ai-clear]').addEventListener('click', () => {
      if (!messages.length || confirm('Limpar a conversa com a IA neste aparelho?')) {
        messages = [];
        save();
        render();
      }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const text = input.value;
      input.value = '';
      ask(text);
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    document.addEventListener('click', event => {
      if (panel.classList.contains('open') && event.target instanceof Element && event.target.closest('.bn-fab')) open(false);
    }, true);

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
