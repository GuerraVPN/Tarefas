
(function(){
  'use strict';

  const TABLE_NAME = 'bloco_notas_usuario';
  const OPEN_KEY_PREFIX = 'bloco_notas_aberto_';
  const DATA_KEY_PREFIX = 'bloco_notas_dados_';
  const MODE_KEY_PREFIX = 'bloco_notas_modo_';

  let usuario = null;
  let notes = [];
  let ui = {};
  let carregando = false;
  let usarBanco = true;
  let avisoModo = 'Sincronizado';
  const timers = new Map();

  function getUsuarioLogado() {
    try { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); }
    catch { return null; }
  }

  function hasSupabase() {
    try { return typeof supabaseClient !== 'undefined' && !!supabaseClient; }
    catch { return false; }
  }

  function uid() {
    return 'tmp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function somenteTexto(v) {
    return String(v == null ? '' : v);
  }

  function salvarEstadoUiAberto(aberto) {
    if (!usuario?.id) return;
    localStorage.setItem(OPEN_KEY_PREFIX + usuario.id, aberto ? '1' : '0');
  }

  function lerEstadoUiAberto() {
    if (!usuario?.id) return true;
    return localStorage.getItem(OPEN_KEY_PREFIX + usuario.id) !== '0';
  }

  function chaveDadosLocal() {
    return DATA_KEY_PREFIX + (usuario?.id || 'anon');
  }

  function persistirLocal() {
    try {
      const safe = notes.map(n => ({
        id: n.id,
        usuario_id: n.usuario_id,
        titulo: n.titulo,
        conteudo: n.conteudo,
        fixada: !!n.fixada,
        recolhida: !!n.recolhida,
        criado_em: n.criado_em || nowIso(),
        atualizado_em: n.atualizado_em || nowIso()
      }));
      localStorage.setItem(chaveDadosLocal(), JSON.stringify(safe));
      localStorage.setItem(MODE_KEY_PREFIX + usuario.id, usarBanco ? 'db' : 'local');
    } catch (err) {
      console.warn('Falha ao persistir notas localmente:', err);
    }
  }

  function lerLocal() {
    try {
      const raw = localStorage.getItem(chaveDadosLocal());
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.map(normalizarNota) : [];
    } catch {
      return [];
    }
  }

  function normalizarNota(nota) {
    return {
      id: nota.id ?? uid(),
      usuario_id: nota.usuario_id ?? usuario?.id ?? null,
      titulo: somenteTexto(nota.titulo || 'Nova nota'),
      conteudo: somenteTexto(nota.conteudo || ''),
      fixada: !!nota.fixada,
      recolhida: !!nota.recolhida,
      criado_em: nota.criado_em || nowIso(),
      atualizado_em: nota.atualizado_em || nowIso()
    };
  }

  function dataBonita(iso) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return 'Agora';
      return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return 'Agora';
    }
  }

  async function carregarNotas() {
    const notasLocal = lerLocal();

    if (!hasSupabase() || !usuario?.id) {
      usarBanco = false;
      avisoModo = 'Modo local';
      notes = notasLocal;
      persistirLocal();
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('fixada', { ascending: false })
        .order('atualizado_em', { ascending: false })
        .order('id', { ascending: false });

      if (error) throw error;

      notes = Array.isArray(data) ? data.map(normalizarNota) : [];
      usarBanco = true;
      avisoModo = 'Sincronizado';
      persistirLocal();

      if (!notes.length && notasLocal.length) {
        // Se houver notas locais antigas, adota para não perder.
        notes = notasLocal;
        persistirLocal();
      }
    } catch (err) {
      console.warn('Bloco de notas: fallback local ativado.', err.message || err);
      usarBanco = false;
      avisoModo = 'Modo local';
      notes = notasLocal;
      persistirLocal();
    }
  }

  async function salvarNotaBanco(nota) {
    if (!usarBanco || !hasSupabase() || !usuario?.id) return nota;

    const payload = {
      usuario_id: usuario.id,
      titulo: nota.titulo,
      conteudo: nota.conteudo,
      fixada: !!nota.fixada,
      recolhida: !!nota.recolhida,
      atualizado_em: nowIso()
    };

    if (String(nota.id).startsWith('tmp_')) {
      const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      return normalizarNota(data);
    } else {
      const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .update(payload)
        .eq('id', nota.id)
        .eq('usuario_id', usuario.id)
        .select('*')
        .single();

      if (error) throw error;
      return normalizarNota(data || { ...nota, ...payload });
    }
  }

  function agendarSalvar(id, delay) {
    clearTimeout(timers.get(id));
    const t = setTimeout(() => salvarNota(id), delay ?? 600);
    timers.set(id, t);
  }

  async function salvarNota(id) {
    const idx = notes.findIndex(n => String(n.id) === String(id));
    if (idx < 0) return;
    const nota = notes[idx];

    nota.atualizado_em = nowIso();
    persistirLocal();
    atualizarEstadoRodape('Salvando...');

    if (!usarBanco) {
      atualizarEstadoRodape('Salvo localmente');
      renderizarNotas();
      return;
    }

    try {
      const salva = await salvarNotaBanco(nota);
      notes[idx] = salva;
      persistirLocal();
      atualizarEstadoRodape('Salvo automaticamente');
      renderizarNotas();
    } catch (err) {
      console.warn('Erro ao salvar nota no banco, mantendo local:', err.message || err);
      usarBanco = false;
      avisoModo = 'Modo local';
      persistirLocal();
      atualizarBadgeModo();
      atualizarEstadoRodape('Salvo localmente');
      renderizarNotas();
    }
  }

  async function excluirNota(id) {
    const nota = notes.find(n => String(n.id) === String(id));
    notes = notes.filter(n => String(n.id) !== String(id));
    persistirLocal();
    renderizarNotas();

    if (!nota || !usarBanco || !hasSupabase() || String(nota.id).startsWith('tmp_')) return;

    try {
      await supabaseClient.from(TABLE_NAME).delete().eq('id', nota.id).eq('usuario_id', usuario.id);
    } catch (err) {
      console.warn('Erro ao excluir nota do banco:', err.message || err);
    }
  }

  function criarNotaPadrao() {
    const titulo = 'Nova nota';
    return normalizarNota({
      id: uid(),
      usuario_id: usuario?.id ?? null,
      titulo,
      conteudo: '',
      fixada: false,
      recolhida: false,
      criado_em: nowIso(),
      atualizado_em: nowIso()
    });
  }

  async function adicionarNota() {
    const nota = criarNotaPadrao();
    notes.unshift(nota);
    persistirLocal();
    renderizarNotas();
    abrirPainel(true);
    agendarSalvar(nota.id, 50);
    setTimeout(() => {
      const campo = document.querySelector('[data-note-title="' + CSS.escape(String(nota.id)) + '"]');
      if (campo) { campo.focus(); campo.select(); }
    }, 60);
  }

  function atualizarBadgeModo() {
    if (!ui.mode) return;
    ui.mode.textContent = avisoModo;
    ui.mode.className = 'bn-mode ' + (usarBanco ? 'ok' : 'local');
  }

  function atualizarContador() {
    if (!ui.counter) return;
    ui.counter.textContent = String(notes.length);
  }

  function atualizarEstadoRodape(msg) {
    if (ui.statusText) ui.statusText.textContent = msg;
  }

  function abrirPainel(aberto) {
    if (!ui.panel || !ui.fab) return;
    const isOpen = aberto !== undefined ? !!aberto : !ui.panel.classList.contains('open');
    ui.panel.classList.toggle('open', isOpen);
    ui.fab.classList.toggle('hidden', isOpen);
    salvarEstadoUiAberto(isOpen);
  }

  function buildNoteCard(nota) {
    const card = document.createElement('div');
    card.className = 'bn-note' + (nota.fixada ? ' pinned' : '') + (nota.recolhida ? ' collapsed' : '');
    card.dataset.id = String(nota.id);

    const head = document.createElement('div');
    head.className = 'bn-note-head';

    const title = document.createElement('input');
    title.className = 'bn-title';
    title.type = 'text';
    title.maxLength = 80;
    title.value = nota.titulo || '';
    title.placeholder = 'Título da nota';
    title.setAttribute('data-note-title', String(nota.id));
    title.addEventListener('input', () => {
      nota.titulo = title.value.trimStart();
      nota.atualizado_em = nowIso();
      persistirLocal();
      agendarSalvar(nota.id, 500);
      atualizarEstadoRodape('Salvando...');
    });

    const actions = document.createElement('div');
    actions.className = 'bn-note-actions';

    const btnPin = document.createElement('button');
    btnPin.type = 'button';
    btnPin.className = 'bn-icon-btn';
    btnPin.title = nota.fixada ? 'Desafixar nota' : 'Fixar nota';
    btnPin.textContent = nota.fixada ? '📌' : '📍';
    btnPin.addEventListener('click', () => {
      nota.fixada = !nota.fixada;
      nota.atualizado_em = nowIso();
      notes.sort((a,b) => Number(b.fixada) - Number(a.fixada) || new Date(b.atualizado_em) - new Date(a.atualizado_em));
      persistirLocal();
      renderizarNotas();
      agendarSalvar(nota.id, 80);
    });

    const btnCollapse = document.createElement('button');
    btnCollapse.type = 'button';
    btnCollapse.className = 'bn-icon-btn';
    btnCollapse.title = nota.recolhida ? 'Expandir nota' : 'Recolher nota';
    btnCollapse.textContent = nota.recolhida ? '▢' : '—';
    btnCollapse.addEventListener('click', () => {
      nota.recolhida = !nota.recolhida;
      nota.atualizado_em = nowIso();
      persistirLocal();
      renderizarNotas();
      agendarSalvar(nota.id, 80);
    });

    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'bn-icon-btn danger';
    btnDelete.title = 'Excluir nota';
    btnDelete.textContent = '🗑';
    btnDelete.addEventListener('click', async () => {
      const ok = confirm('Excluir esta nota?');
      if (!ok) return;
      await excluirNota(nota.id);
      atualizarEstadoRodape('Nota excluída');
    });

    actions.append(btnPin, btnCollapse, btnDelete);
    head.append(title, actions);

    const body = document.createElement('div');
    body.className = 'bn-note-body';

    const area = document.createElement('textarea');
    area.className = 'bn-text';
    area.placeholder = 'Escreva sua anotação aqui...';
    area.value = nota.conteudo || '';
    area.addEventListener('input', () => {
      nota.conteudo = area.value;
      nota.atualizado_em = nowIso();
      persistirLocal();
      agendarSalvar(nota.id, 650);
      atualizarEstadoRodape('Salvando...');
    });

    const foot = document.createElement('div');
    foot.className = 'bn-note-foot';
    foot.textContent = 'Atualizada: ' + dataBonita(nota.atualizado_em || nota.criado_em);

    body.append(area, foot);
    card.append(head, body);
    return card;
  }

  function renderizarNotas() {
    if (!ui.list) return;

    notes.sort((a,b) => Number(b.fixada) - Number(a.fixada) || new Date(b.atualizado_em) - new Date(a.atualizado_em));

    ui.list.innerHTML = '';
    if (!notes.length) {
      const empty = document.createElement('div');
      empty.className = 'bn-empty';
      empty.innerHTML = '<div class="bn-empty-icon">📝</div><strong>Sem notas ainda</strong><span>Clique em "Nova nota" para criar a primeira.</span>';
      ui.list.appendChild(empty);
    } else {
      notes.forEach(nota => ui.list.appendChild(buildNoteCard(nota)));
    }

    atualizarContador();
    atualizarBadgeModo();
  }

  function injectStyles() {
    if (document.getElementById('bn-style')) return;

    const css = `
      .bn-fab{
        position:fixed;right:18px;bottom:18px;z-index:9995;border:none;border-radius:999px;
        background:#047857;color:#fff;padding:14px 18px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.18);
        cursor:pointer;display:flex;align-items:center;gap:10px;transition:transform .2s ease, opacity .2s ease;
      }
      .bn-fab:hover{transform:translateY(-2px)}
      .bn-fab.hidden{opacity:0;pointer-events:none}
      .bn-panel{
        position:fixed;right:16px;top:82px;bottom:16px;width:360px;max-width:calc(100vw - 24px);
        background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 18px 40px rgba(0,0,0,.16);
        z-index:9996;display:flex;flex-direction:column;overflow:hidden;transform:translateX(calc(100% + 24px));
        transition:transform .24s ease;
      }
      .bn-panel.open{transform:translateX(0)}
      .bn-head{
        padding:16px 16px 12px;border-bottom:1px solid #e5e7eb;background:#fff;display:flex;flex-direction:column;gap:10px
      }
      .bn-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
      .bn-main-title{font-size:22px;font-weight:800;color:#111827;display:flex;align-items:center;gap:10px}
      .bn-close{border:none;background:#f3f4f6;color:#111827;border-radius:10px;padding:8px 10px;cursor:pointer;font-weight:700}
      .bn-subline{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#4b5563;font-size:13px}
      .bn-mode{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-weight:700}
      .bn-mode.ok{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}
      .bn-mode.local{background:#fffbeb;color:#b45309;border:1px solid #fcd34d}
      .bn-counter{min-width:28px;height:28px;border-radius:999px;background:#111827;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700}
      .bn-add{
        border:none;background:#047857;color:#fff;border-radius:10px;padding:12px 14px;font-weight:700;cursor:pointer
      }
      .bn-add:hover{background:#065f46}
      .bn-list{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px;background:#f9fafb}
      .bn-note{background:#fffbe6;border:1px solid #f4df94;border-radius:14px;padding:12px;box-shadow:0 2px 10px rgba(0,0,0,.05)}
      .bn-note.pinned{box-shadow:0 0 0 2px rgba(234,179,8,.25), 0 2px 10px rgba(0,0,0,.05)}
      .bn-note.collapsed .bn-note-body{display:none}
      .bn-note-head{display:flex;gap:8px;align-items:flex-start}
      .bn-title{
        flex:1;border:none;background:transparent;font-weight:800;font-size:16px;color:#111827;outline:none;padding:2px 0
      }
      .bn-note-actions{display:flex;gap:4px}
      .bn-icon-btn{
        border:none;background:rgba(255,255,255,.7);border-radius:8px;padding:6px 8px;cursor:pointer
      }
      .bn-icon-btn:hover{background:#fff}
      .bn-icon-btn.danger:hover{background:#fee2e2}
      .bn-text{
        width:100%;min-height:110px;resize:vertical;border:1px solid #eadca5;border-radius:10px;padding:10px 11px;
        margin-top:10px;background:#fffef5;color:#111827;outline:none
      }
      .bn-text:focus{border-color:#eab308;box-shadow:0 0 0 2px rgba(234,179,8,.18)}
      .bn-note-foot{margin-top:8px;font-size:12px;color:#6b7280}
      .bn-empty{
        display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;
        min-height:220px;border:2px dashed #d1d5db;border-radius:14px;background:#fff;color:#6b7280;padding:20px
      }
      .bn-empty-icon{font-size:30px}
      .bn-foot{
        padding:10px 14px;border-top:1px solid #e5e7eb;background:#fff;font-size:12px;color:#6b7280;display:flex;justify-content:space-between;gap:12px
      }
      @media (max-width: 880px){
        .bn-panel{left:12px;right:12px;top:76px;bottom:12px;width:auto;max-width:none}
        .bn-fab{right:12px;bottom:12px}
      }
    `;
    const style = document.createElement('style');
    style.id = 'bn-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildUI() {
    if (document.getElementById('bn-panel')) return;

    const fab = document.createElement('button');
    fab.className = 'bn-fab';
    fab.id = 'bn-fab';
    fab.type = 'button';
    fab.innerHTML = '📝 <span>Bloco de notas</span>';
    fab.addEventListener('click', () => abrirPainel(true));

    const panel = document.createElement('aside');
    panel.className = 'bn-panel';
    panel.id = 'bn-panel';
    panel.innerHTML = `
      <div class="bn-head">
        <div class="bn-title-row">
          <div class="bn-main-title">📝 Bloco de Notas <span class="bn-counter" id="bn-counter">0</span></div>
          <button class="bn-close" id="bn-close" type="button">Fechar</button>
        </div>
        <div class="bn-subline">
          <span class="bn-mode ok" id="bn-mode">Sincronizado</span>
          <span>Visível em todas as abas e salvo automaticamente.</span>
        </div>
        <button class="bn-add" id="bn-add" type="button">＋ Nova nota</button>
      </div>
      <div class="bn-list" id="bn-list"></div>
      <div class="bn-foot">
        <span id="bn-status">Salvo automaticamente</span>
        <span>As notas permanecem disponíveis para este usuário.</span>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    ui = {
      fab,
      panel,
      list: panel.querySelector('#bn-list'),
      add: panel.querySelector('#bn-add'),
      close: panel.querySelector('#bn-close'),
      counter: panel.querySelector('#bn-counter'),
      mode: panel.querySelector('#bn-mode'),
      statusText: panel.querySelector('#bn-status')
    };

    ui.add.addEventListener('click', adicionarNota);
    ui.close.addEventListener('click', () => abrirPainel(false));

    // Fecha ao clicar fora em telas pequenas
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 880) return;
      if (!ui.panel.classList.contains('open')) return;
      if (e.target.closest('#bn-panel') || e.target.closest('#bn-fab')) return;
      abrirPainel(false);
    });

    abrirPainel(lerEstadoUiAberto());
  }

  async function init() {
    if (window.__blocoNotasInicializado) return;
    window.__blocoNotasInicializado = true;

    usuario = getUsuarioLogado();
    if (!usuario?.id) return;

    injectStyles();
    buildUI();
    carregando = true;
    await carregarNotas();
    renderizarNotas();
    carregando = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
