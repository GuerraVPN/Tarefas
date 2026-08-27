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
    delete atual.perfis_disponiveis;
    localStorage.setItem('usuarioLogado', JSON.stringify(atual));
  }

  // V7.4.9: algumas versões da página Configurações perdiam um item da
  // sidebar depois da reconstrução visual e aplicarSidebar() tentava acessar
  // .style de null. Criamos apenas os alvos ausentes, invisíveis, antes de
  // devolver o estado dos perfis. Isso mantém compatibilidade com o código
  // legado sem interferir no menu novo.
  function garantirAlvosConfiguracoes(){
    const pagina=(location.pathname.split('/').pop()||'').toLowerCase();
    if(pagina!=='configuracoes.html') return;
    const chaves=['quadro','minhas','calendario','relatorios','usuarios'];
    chaves.forEach(chave=>{
      if(document.querySelector(`[data-pref-item="${chave}"]`)) return;
      const el=document.createElement('span');
      el.dataset.prefItem=chave;
      el.hidden=true;
      el.setAttribute('aria-hidden','true');
      (document.body||document.documentElement).appendChild(el);
    });
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

    // Elimina somente duplicatas reais e nunca reduz a lista ao perfil ativo.
    const vistos=new Set();
    perfis=perfis.filter(p=>{
      const chave=p.id!=null?`id:${p.id}`:`${norm(p.secao)}|${norm(p.posicao)}`;
      if(vistos.has(chave)) return false;
      vistos.add(chave); return true;
    });

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
    garantirAlvosConfiguracoes();

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

  // V7.4.9: o cabeçalho novo podia montar o dropdown usando apenas o perfil
  // atual. Sempre que o menu de usuário aparece/abre, reidratamos a caixa com
  // TODOS os perfis ativos retornados de usuario_perfis.
  let hidratando=false;
  async function hidratarDropdownGlobal(){
    if(hidratando) return;
    const base=(()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}})();
    let client=null; try{client=typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){}
    if(!base?.id||!client) return;
    const candidatos=[...document.querySelectorAll('.v3-profile-menu,.profile-menu,.user-menu,[role="menu"]')];
    const container=candidatos.find(el=>/alterar senha|configura/i.test(el.textContent||''));
    if(!container) return;
    hidratando=true;
    try{
      const estado=await carregar(client,base);
      renderizarDropdown(container,estado,base);
    }catch(e){console.warn('Perfis26 V7.4.9:',e?.message||e)}
    finally{hidratando=false}
  }

  function iniciarHidratacaoGlobal(){
    let timer=null;
    const pedir=()=>{clearTimeout(timer);timer=setTimeout(hidratarDropdownGlobal,60)};
    document.addEventListener('click',e=>{
      if(e.target.closest('.v3-user-button,.top-avatar,.user-avatar,[data-user-menu],button')) pedir();
    },true);
    const obs=new MutationObserver(pedir);
    obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    pedir();
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

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciarHidratacaoGlobal);
  else iniciarHidratacaoGlobal();
})();