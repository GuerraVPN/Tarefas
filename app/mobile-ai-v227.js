(() => {
  'use strict';

  const MARK = '__TAREFAS_ANDROID_227_AI__';
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
    return `tarefas_ai_v227_${id}`;
  }

  function readHistory(id) {
    try {
      const raw = JSON.parse(localStorage.getItem(historyKey(id)) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw
        .filter(item => item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string')
        .slice(-MAX_LOCAL_MESSAGES)
        .map(item => ({ role: item.role, text: item.text.slice(0, 4000) }));
    } catch (_) {
      return [];
    }
  }

  function writeHistory(id, messages) {
    try { localStorage.setItem(historyKey(id), JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES))); }
    catch (_) {}
  }

  function injectCss() {
    if (document.getElementById('ai227-style')) return;
    const style = document.createElement('style');
    style.id = 'ai227-style';
    style.textContent = `
      .ai227-fab{position:fixed;right:18px;bottom:76px;z-index:8010;border:0;border-radius:999px;background:linear-gradient(135deg,var(--v4-accent,#2563eb),#7c3aed);color:#fff;padding:13px 17px;font-weight:900;box-shadow:0 12px 30px rgba(0,0,0,.22);cursor:pointer;letter-spacing:.1px}
      .ai227-fab.hidden{display:none}
      .ai227-panel{position:fixed;right:14px;top:74px;bottom:14px;width:390px;max-width:calc(100vw - 22px);z-index:8600;background:var(--v4-surface,#fff);border:1px solid var(--v4-border,#d7dce3);border-radius:16px;box-shadow:0 18px 48px rgba(0,0,0,.22);display:flex;flex-direction:column;overflow:hidden;transform:translateX(calc(100% + 32px));transition:transform .22s ease}
      .ai227-panel.open{transform:none}
      .ai227-head{padding:12px 13px;border-bottom:1px solid var(--v4-border,#d7dce3);display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--v4-surface,#fff)}
      .ai227-title{display:flex;flex-direction:column;min-width:0}.ai227-title strong{font-size:16px}.ai227-title span{font-size:10px;color:var(--v4-muted,#6b7280);font-weight:700}
      .ai227-head-actions{display:flex;gap:6px}.ai227-head button{border:0;border-radius:8px;padding:7px 9px;font-weight:800;cursor:pointer;background:var(--v4-surface-3,#eef2f7);color:inherit}
      .ai227-messages{flex:1;overflow:auto;padding:12px;background:var(--v4-surface-2,#f6f7f9);display:flex;flex-direction:column;gap:9px}
      .ai227-row{display:flex}.ai227-row.user{justify-content:flex-end}.ai227-row.model{justify-content:flex-start}
      .ai227-bubble{max-width:86%;padding:10px 11px;border-radius:14px;font-size:13px;line-height:1.42;white-space:pre-wrap;word-break:break-word;box-shadow:0 1px 2px rgba(0,0,0,.06)}
      .ai227-row.user .ai227-bubble{background:var(--v4-accent,#2563eb);color:#fff;border-bottom-right-radius:5px}
      .ai227-row.model .ai227-bubble{background:var(--v4-surface,#fff);color:inherit;border:1px solid var(--v4-border,#d7dce3);border-bottom-left-radius:5px}
      .ai227-row.system .ai227-bubble{max-width:100%;margin:auto;background:transparent;color:var(--v4-muted,#6b7280);box-shadow:none;font-size:10px;text-align:center;padding:2px 8px}
      .ai227-typing{opacity:.72;font-style:italic}
      .ai227-compose{border-top:1px solid var(--v4-border,#d7dce3);padding:9px;background:var(--v4-surface,#fff);display:flex;gap:7px;align-items:flex-end}
      .ai227-compose textarea{flex:1;resize:none;min-height:42px;max-height:120px;border:1px solid var(--v4-border,#d7dce3);background:var(--v4-surface,#fff);color:inherit;border-radius:11px;padding:10px 11px;font:inherit;font-size:13px;outline:none}
      .ai227-compose textarea:focus{border-color:var(--v4-accent,#2563eb);box-shadow:0 0 0 2px color-mix(in srgb,var(--v4-accent,#2563eb) 18%,transparent)}
      .ai227-send{min-width:52px;height:42px;border:0;border-radius:11px;background:var(--v4-accent,#2563eb);color:#fff;font-weight:900;cursor:pointer}.ai227-send:disabled{opacity:.55;cursor:default}
      .ai227-foot{padding:6px 10px 8px;text-align:center;font-size:9px;color:var(--v4-muted,#6b7280);background:var(--v4-surface,#fff)}
      @media(max-width:700px){.ai227-panel{left:9px;right:9px;width:auto;top:70px;bottom:9px}.ai227-fab{right:18px;bottom:76px}}
    `;
    document.head.appendChild(style);
  }

  function createRow(role, text, extraClass = '') {
    const row = document.createElement('div');
    row.className = `ai227-row ${role}${extraClass ? ` ${extraClass}` : ''}`;
    const bubble = document.createElement('div');
    bubble.className = 'ai227-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    return row;
  }

  function friendlyError(code, status) {
    if (status === 401 || code === 'session_expired' || code === 'session_required') return 'Sua sessão expirou. Saia e entre novamente no aplicativo.';
    if (code === 'rate_limited') return 'Você enviou mensagens muito rápido. Aguarde alguns segundos e tente novamente.';
    if (code === 'provider_limit') return 'A cota gratuita da IA foi atingida por enquanto. Tente novamente mais tarde.';
    if (code === 'gemini_not_configured') return 'A IA ainda não está configurada no servidor.';
    if (code === 'empty_response') return 'A IA não retornou uma resposta desta vez. Tente reformular a pergunta.';
    return 'Não consegui falar com a IA agora. Verifique a conexão e tente novamente.';
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
    fab.className = 'ai227-fab';
    fab.setAttribute('aria-label', 'Abrir Assistente IA');
    fab.textContent = '✨ IA';

    const panel = document.createElement('aside');
    panel.className = 'ai227-panel';
    panel.setAttribute('aria-label', 'Assistente IA');
    panel.innerHTML = `
      <div class="ai227-head">
        <div class="ai227-title"><strong>✨ Assistente IA</strong><span>BETA 2.2.7 · somente leitura</span></div>
        <div class="ai227-head-actions"><button type="button" data-ai-clear>Limpar</button><button type="button" data-ai-close>Fechar</button></div>
      </div>
      <div class="ai227-messages"></div>
      <form class="ai227-compose">
        <textarea rows="1" maxlength="4000" placeholder="Pergunte alguma coisa..." aria-label="Mensagem para a IA"></textarea>
        <button class="ai227-send" type="submit">➤</button>
      </form>
      <div class="ai227-foot">Nesta beta a IA responde perguntas, mas não altera dados do TAREFAS.</div>
    `;

    document.body.append(fab, panel);
    const list = panel.querySelector('.ai227-messages');
    const form = panel.querySelector('.ai227-compose');
    const input = panel.querySelector('textarea');
    const send = panel.querySelector('.ai227-send');

    function scrollEnd() {
      requestAnimationFrame(() => { list.scrollTop = list.scrollHeight; });
    }

    function render() {
      list.textContent = '';
      if (!messages.length) {
        list.appendChild(createRow('model', 'Olá! Sou o Assistente IA do TAREFAS. Nesta primeira beta posso responder perguntas e ajudar com textos, mas ainda não consulto nem altero dados do sistema.'));
      } else {
        for (const message of messages) list.appendChild(createRow(message.role, message.text));
      }
      scrollEnd();
    }

    function open(value) {
      panel.classList.toggle('open', value);
      fab.classList.toggle('hidden', value);
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

      const typing = createRow('model', 'Pensando...', 'ai227-typing');
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
