(function(){
  'use strict';

  const STORAGE_PREFIX = 'perfilAtivo26Pel:';

  function norm(v){
    return String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  }

  function storageKey(usuarioId){
    return STORAGE_PREFIX + String(usuarioId);
  }

  function erroTabelaAusente(error){
    const code = String(error?.code || '');
    const msg = String(error?.message || '').toLowerCase();
    return ['42P01','PGRST205','PGRST204'].includes(code)
      || (msg.includes('usuario_perfis') && (msg.includes('not find') || msg.includes('does not exist') || msg.includes('schema cache')));
  }

  function fallbackPerfil(base){
    return {
      id: null,
      usuario_id: base?.id ?? null,
      secao: base?.secao || '',
      posicao: base?.posicao || 'Auxiliar',
      principal: true,
      ativo: true,
      legado: true
    };
  }

  function label(perfil){
    const secao = norm(perfil?.secao) === 'admin' ? 'Admin' : (perfil?.secao || 'Sem seção');
    return `${secao} — ${perfil?.posicao || 'Auxiliar'}`;
  }

  function salvarUsuarioLocal(base, ativo){
    if(!base || !ativo) return;
    const atual = {
      ...base,
      secao: ativo.secao || base.secao || '',
      posicao: ativo.posicao || base.posicao || '',
      perfil_id: ativo.id ?? null
    };
    // Não grava a lista de perfis inteira dentro da sessão.
    delete atual.perfis_disponiveis;
    localStorage.setItem('usuarioLogado', JSON.stringify(atual));
  }

  async function carregar(client, base){
    let perfis = [];
    let disponivel = true;

    try{
      const {data,error} = await client
        .from('usuario_perfis')
        .select('id,usuario_id,secao,posicao,principal,ativo,criado_em')
        .eq('usuario_id', base.id)
        .eq('ativo', true)
        .order('principal', {ascending:false})
        .order('id', {ascending:true});

      if(error) throw error;
      perfis = data || [];
    }catch(error){
      if(erroTabelaAusente(error)){
        disponivel = false;
        perfis = [fallbackPerfil(base)];
      }else{
        console.warn('Perfis26: erro ao carregar perfis:', error.message);
        perfis = [fallbackPerfil(base)];
      }
    }

    if(!perfis.length) perfis = [fallbackPerfil(base)];

    const salvo = localStorage.getItem(storageKey(base.id));
    let ativo = salvo ? perfis.find(p => String(p.id) === String(salvo)) : null;
    if(!ativo) ativo = perfis.find(p => p.principal) || perfis[0];

    if(ativo?.id != null) localStorage.setItem(storageKey(base.id), String(ativo.id));
    else localStorage.removeItem(storageKey(base.id));

    const usuario = {
      ...base,
      secao: ativo?.secao || base.secao || '',
      posicao: ativo?.posicao || base.posicao || '',
      perfil_id: ativo?.id ?? null
    };

    salvarUsuarioLocal(usuario, ativo);

    return {usuario, perfis, ativo, disponivel};
  }

  function trocar(usuarioBase, perfil){
    if(!usuarioBase || !perfil) return;
    if(perfil.id != null) localStorage.setItem(storageKey(usuarioBase.id), String(perfil.id));
    else localStorage.removeItem(storageKey(usuarioBase.id));
    salvarUsuarioLocal(usuarioBase, perfil);
    window.location.reload();
  }

  function injetarEstilo(){
    if(document.getElementById('perfis26Style')) return;
    const style = document.createElement('style');
    style.id = 'perfis26Style';
    style.textContent = `
      .perfis26-box{border-bottom:1px solid #e5e7eb;padding:8px 8px 10px;margin-bottom:6px}
      .perfis26-title{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--v4-muted);padding:3px 6px 7px}
      .perfis26-option{width:100%;display:flex!important;align-items:center;justify-content:space-between;gap:9px;padding:9px 10px!important;border:0!important;border-radius:7px!important;background:transparent!important;color:var(--v4-text-2)!important;text-align:left!important;cursor:pointer}
      .perfis26-option:hover{background:var(--v4-surface-3)!important}
      .perfis26-option.ativo{background:var(--v4-accent-soft)!important;color:var(--v4-accent)!important;font-weight:700}
      .perfis26-check{font-size:12px;color:#047857}
      .perfis26-sub{font-size:10px;color:var(--v4-muted);margin-top:2px}
      .perfis26-one{font-size:11px;color:var(--v4-muted);padding:4px 7px 2px}
    `;
    document.head.appendChild(style);
  }

  function renderizarDropdown(container, estado, usuarioBase){
    if(!container || !estado) return;
    injetarEstilo();

    const anterior = container.querySelector('#perfis26Box');
    if(anterior) anterior.remove();

    const box = document.createElement('div');
    box.id = 'perfis26Box';
    box.className = 'perfis26-box';

    const title = document.createElement('div');
    title.className = 'perfis26-title';
    title.textContent = 'Perfil ativo';
    box.appendChild(title);

    estado.perfis.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const ativo = String(p.id) === String(estado.ativo?.id);
      btn.className = 'perfis26-option' + (ativo ? ' ativo' : '');
      btn.innerHTML = `<span><span>${escapeHtml(label(p))}</span>${p.principal ? '<div class="perfis26-sub">Perfil principal</div>' : ''}</span><span class="perfis26-check">${ativo ? '✓' : ''}</span>`;
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if(!ativo) trocar(usuarioBase || estado.usuario, p);
      });
      box.appendChild(btn);
    });

    if(!estado.disponivel){
      const aviso = document.createElement('div');
      aviso.className = 'perfis26-one';
      aviso.textContent = 'Execute o SQL de perfis múltiplos para habilitar a troca.';
      box.appendChild(aviso);
    }

    container.insertBefore(box, container.firstChild);
  }

  function escapeHtml(v){
    return String(v ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[c]));
  }

  window.Perfis26 = {
    carregar,
    trocar,
    renderizarDropdown,
    label,
    norm,
    erroTabelaAusente,
    storageKey
  };
})();