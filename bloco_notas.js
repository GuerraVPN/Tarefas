(function(){
  'use strict';

  const TABLE_NAME='bloco_notas_usuario';
  const OPEN_KEY_PREFIX='bloco_notas_aberto_';
  const DATA_KEY_PREFIX='bloco_notas_dados_';

  let usuario=null;
  let notes=[];
  let ui={};
  let usarBanco=true;
  let avisoModo='Banco de dados';

  function getUsuarioLogado(){
    try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}
  }

  function hasSupabase(){
    try{return typeof supabaseClient!=='undefined'&&!!supabaseClient}catch(_){return false}
  }

  function uid(){return 'tmp_'+Date.now()+'_'+Math.random().toString(36).slice(2,8)}
  function nowIso(){return new Date().toISOString()}
  function txt(v){return String(v==null?'':v)}

  function chaveDados(){return DATA_KEY_PREFIX+(usuario?.id||'anon')}
  function chaveAberto(){return OPEN_KEY_PREFIX+(usuario?.id||'anon')}

  function normalizarNota(n){
    return {
      id:n?.id??uid(),
      usuario_id:n?.usuario_id??usuario?.id??null,
      titulo:txt(n?.titulo||'Nova nota'),
      conteudo:txt(n?.conteudo||''),
      fixada:!!n?.fixada,
      recolhida:!!n?.recolhida,
      criado_em:n?.criado_em||nowIso(),
      atualizado_em:n?.atualizado_em||nowIso(),
      dirty:!!n?.dirty
    };
  }

  function persistirRascunhos(){
    try{
      localStorage.setItem(chaveDados(),JSON.stringify(notes.map(n=>({
        id:n.id,
        usuario_id:n.usuario_id,
        titulo:n.titulo,
        conteudo:n.conteudo,
        fixada:!!n.fixada,
        recolhida:!!n.recolhida,
        criado_em:n.criado_em,
        atualizado_em:n.atualizado_em,
        dirty:!!n.dirty
      }))));
    }catch(err){console.warn('Notas locais:',err)}
  }

  function lerRascunhos(){
    try{
      const arr=JSON.parse(localStorage.getItem(chaveDados())||'[]');
      return Array.isArray(arr)?arr.map(normalizarNota):[];
    }catch(_){return []}
  }

  function dataBonita(iso){
    try{
      const d=new Date(iso);
      return Number.isNaN(d.getTime())?'Agora':d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
    }catch(_){return 'Agora'}
  }

  function status(msg,erro=false){
    if(!ui.statusText)return;
    ui.statusText.textContent=msg;
    ui.statusText.style.color=erro?'#b91c1c':'';
  }

  function atualizarModo(){
    if(!ui.mode)return;
    ui.mode.textContent=avisoModo;
    ui.mode.className='bn-mode '+(usarBanco?'ok':'local');
  }

  function atualizarContador(){
    if(ui.counter)ui.counter.textContent=String(notes.length);
  }

  function mergeBancoComRascunhos(db,local){
    const mapa=new Map((db||[]).map(n=>[String(n.id),normalizarNota({...n,dirty:false})]));

    (local||[]).forEach(n=>{
      const k=String(n.id);
      if(String(n.id).startsWith('tmp_')||n.dirty){
        mapa.set(k,normalizarNota(n));
      }
    });

    return [...mapa.values()];
  }

  async function carregarNotas(){
    const locais=lerRascunhos();

    if(!hasSupabase()||!usuario?.id){
      usarBanco=false;
      avisoModo='Somente neste navegador';
      notes=locais;
      persistirRascunhos();
      return;
    }

    try{
      const {data,error}=await supabaseClient.from(TABLE_NAME)
        .select('*')
        .eq('usuario_id',usuario.id)
        .order('fixada',{ascending:false})
        .order('atualizado_em',{ascending:false})
        .order('id',{ascending:false});

      if(error)throw error;

      usarBanco=true;
      avisoModo='Banco de dados';
      notes=mergeBancoComRascunhos(data||[],locais);
      persistirRascunhos();
    }catch(err){
      console.warn('Bloco de notas: usando rascunhos locais.',err?.message||err);
      usarBanco=false;
      avisoModo='Somente neste navegador';
      notes=locais;
      persistirRascunhos();
    }
  }

  async function salvarNoBanco(nota){
    const payload={
      usuario_id:Number(usuario.id),
      titulo:(nota.titulo||'Nova nota').trim()||'Nova nota',
      conteudo:nota.conteudo||'',
      fixada:!!nota.fixada,
      recolhida:!!nota.recolhida,
      atualizado_em:nowIso()
    };

    if(String(nota.id).startsWith('tmp_')){
      const {data,error}=await supabaseClient.from(TABLE_NAME)
        .insert(payload)
        .select('*')
        .single();
      if(error)throw error;
      return normalizarNota({...data,dirty:false});
    }

    const {data,error}=await supabaseClient.from(TABLE_NAME)
      .update(payload)
      .eq('id',nota.id)
      .eq('usuario_id',usuario.id)
      .select('*')
      .single();

    if(error)throw error;
    return normalizarNota({...data,dirty:false});
  }

  async function salvarNota(id,button){
    const idx=notes.findIndex(n=>String(n.id)===String(id));
    if(idx<0)return;

    const nota=notes[idx];
    if(button){button.disabled=true;button.textContent='Salvando...'}
    status('Salvando nota...');

    // Sempre mantém uma cópia do rascunho local primeiro.
    nota.atualizado_em=nowIso();
    persistirRascunhos();

    if(!usarBanco||!hasSupabase()){
      nota.dirty=false;
      persistirRascunhos();
      status('Salvo neste navegador.');
      if(button){button.disabled=false;button.textContent='💾 Salvar'}
      renderizarNotas();
      return;
    }

    try{
      const salva=await salvarNoBanco(nota);
      notes[idx]=salva;
      persistirRascunhos();
      status('Nota salva no banco de dados.');
      renderizarNotas();
    }catch(err){
      nota.dirty=true;
      persistirRascunhos();
      status('Não foi possível salvar no banco. O rascunho foi mantido neste navegador.',true);
      if(button){button.disabled=false;button.textContent='💾 Salvar'}
      console.warn('Erro ao salvar nota:',err?.message||err);
    }
  }

  async function excluirNota(id){
    const nota=notes.find(n=>String(n.id)===String(id));
    notes=notes.filter(n=>String(n.id)!==String(id));
    persistirRascunhos();
    renderizarNotas();

    if(!nota||!usarBanco||!hasSupabase()||String(nota.id).startsWith('tmp_'))return;

    try{
      const {error}=await supabaseClient.from(TABLE_NAME)
        .delete()
        .eq('id',nota.id)
        .eq('usuario_id',usuario.id);
      if(error)throw error;
      status('Nota excluída.');
    }catch(err){
      status('A nota saiu da tela, mas houve erro ao excluir no banco.',true);
      console.warn(err);
    }
  }

  function novaNota(){
    const nota=normalizarNota({
      id:uid(),
      usuario_id:usuario?.id,
      titulo:'Nova nota',
      conteudo:'',
      fixada:false,
      recolhida:false,
      criado_em:nowIso(),
      atualizado_em:nowIso(),
      dirty:true
    });
    notes.unshift(nota);
    persistirRascunhos();
    renderizarNotas();
    abrirPainel(true);

    setTimeout(()=>{
      const title=document.querySelector(`[data-note-title="${CSS.escape(String(nota.id))}"]`);
      if(title){title.focus();title.select()}
    },40);
  }

  function abrirPainel(aberto){
    if(!ui.panel||!ui.fab)return;
    const open=aberto!==undefined?!!aberto:!ui.panel.classList.contains('open');
    ui.panel.classList.toggle('open',open);
    ui.fab.classList.toggle('hidden',open);
    localStorage.setItem(chaveAberto(),open?'1':'0');
  }

  function buildCard(nota){
    const card=document.createElement('div');
    card.className='bn-note'+(nota.fixada?' pinned':'')+(nota.recolhida?' collapsed':'')+(nota.dirty?' dirty':'');
    card.dataset.id=String(nota.id);

    const head=document.createElement('div');
    head.className='bn-note-head';

    const title=document.createElement('input');
    title.type='text';
    title.className='bn-title';
    title.maxLength=80;
    title.value=nota.titulo||'';
    title.placeholder='Título da nota';
    title.dataset.noteTitle=String(nota.id);

    const actions=document.createElement('div');
    actions.className='bn-note-actions';

    const pin=document.createElement('button');
    pin.type='button';
    pin.className='bn-icon-btn';
    pin.title=nota.fixada?'Desafixar':'Fixar';
    pin.textContent=nota.fixada?'📌':'📍';

    const collapse=document.createElement('button');
    collapse.type='button';
    collapse.className='bn-icon-btn';
    collapse.title=nota.recolhida?'Expandir':'Recolher';
    collapse.textContent=nota.recolhida?'▢':'—';

    const del=document.createElement('button');
    del.type='button';
    del.className='bn-icon-btn danger';
    del.title='Excluir';
    del.textContent='🗑';

    actions.append(pin,collapse,del);
    head.append(title,actions);

    const body=document.createElement('div');
    body.className='bn-note-body';

    const area=document.createElement('textarea');
    area.className='bn-text';
    area.placeholder='Escreva sua anotação aqui...';
    area.value=nota.conteudo||'';

    const saveRow=document.createElement('div');
    saveRow.className='bn-save-row';

    const state=document.createElement('span');
    state.className='bn-note-state';
    state.textContent=nota.dirty?'Alterações ainda não salvas':'Salva';

    const save=document.createElement('button');
    save.type='button';
    save.className='bn-save';
    save.textContent='💾 Salvar';

    const foot=document.createElement('div');
    foot.className='bn-note-foot';
    foot.textContent='Última atualização: '+dataBonita(nota.atualizado_em||nota.criado_em);

    saveRow.append(state,save);
    body.append(area,saveRow,foot);
    card.append(head,body);

    function marcarRascunho(){
      nota.dirty=true;
      nota.atualizado_em=nowIso();
      persistirRascunhos();
      state.textContent='Alterações ainda não salvas';
      card.classList.add('dirty');
      status('Rascunho mantido. Clique em Salvar para gravar a nota.');
    }

    title.addEventListener('input',()=>{
      nota.titulo=title.value;
      marcarRascunho();
    });

    // ENTER no título pula para o campo de texto.
    title.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        area.focus();
        const len=area.value.length;
        area.setSelectionRange(len,len);
      }
    });

    // No corpo, ENTER permanece com o comportamento normal do textarea:
    // cria uma nova linha e continua escrevendo sem salvar nem recriar o campo.
    area.addEventListener('input',()=>{
      nota.conteudo=area.value;
      marcarRascunho();
    });

    pin.addEventListener('click',()=>{
      nota.fixada=!nota.fixada;
      marcarRascunho();
      renderizarNotas();
    });

    collapse.addEventListener('click',()=>{
      nota.recolhida=!nota.recolhida;
      marcarRascunho();
      renderizarNotas();
    });

    del.addEventListener('click',async()=>{
      if(confirm('Excluir esta nota?'))await excluirNota(nota.id);
    });

    save.addEventListener('click',()=>salvarNota(nota.id,save));

    return card;
  }

  function renderizarNotas(){
    if(!ui.list)return;

    notes.sort((a,b)=>
      Number(b.fixada)-Number(a.fixada) ||
      new Date(b.atualizado_em)-new Date(a.atualizado_em)
    );

    ui.list.innerHTML='';

    if(!notes.length){
      const empty=document.createElement('div');
      empty.className='bn-empty';
      empty.innerHTML='<div class="bn-empty-icon">📝</div><strong>Sem notas ainda</strong><span>Clique em “Nova nota” para criar.</span>';
      ui.list.appendChild(empty);
    }else{
      notes.forEach(n=>ui.list.appendChild(buildCard(n)));
    }

    atualizarContador();
    atualizarModo();
  }

  function injectStyles(){
    if(document.getElementById('bn-style'))return;
    const style=document.createElement('style');
    style.id='bn-style';
    style.textContent=`
      .bn-fab{position:fixed;right:18px;bottom:18px;z-index:9995;border:none;border-radius:999px;background:#047857;color:#fff;padding:14px 18px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.18);cursor:pointer;display:flex;align-items:center;gap:10px;transition:.2s}
      .bn-fab:hover{transform:translateY(-2px)}.bn-fab.hidden{opacity:0;pointer-events:none}
      .bn-panel{position:fixed;right:16px;top:82px;bottom:16px;width:370px;max-width:calc(100vw - 24px);background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 18px 40px rgba(0,0,0,.16);z-index:9996;display:flex;flex-direction:column;overflow:hidden;transform:translateX(calc(100% + 24px));transition:transform .24s ease}
      .bn-panel.open{transform:translateX(0)}
      .bn-head{padding:16px 16px 12px;border-bottom:1px solid #e5e7eb;background:#fff;display:flex;flex-direction:column;gap:10px}
      .bn-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px}.bn-main-title{font-size:21px;font-weight:800;color:#111827;display:flex;align-items:center;gap:10px}
      .bn-close{border:none;background:#f3f4f6;color:#111827;border-radius:10px;padding:8px 10px;cursor:pointer;font-weight:700}
      .bn-subline{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;color:#4b5563;font-size:12px}
      .bn-mode{display:inline-flex;padding:5px 9px;border-radius:999px;font-weight:700}.bn-mode.ok{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}.bn-mode.local{background:#fffbeb;color:#b45309;border:1px solid #fcd34d}
      .bn-counter{min-width:28px;height:28px;border-radius:999px;background:#111827;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700}
      .bn-add{border:none;background:#047857;color:#fff;border-radius:10px;padding:12px 14px;font-weight:700;cursor:pointer}.bn-add:hover{background:#065f46}
      .bn-list{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px;background:#f9fafb}
      .bn-note{background:#fffbe6;border:1px solid #f4df94;border-radius:14px;padding:12px;box-shadow:0 2px 10px rgba(0,0,0,.05)}
      .bn-note.dirty{border-color:#eab308}.bn-note.pinned{box-shadow:0 0 0 2px rgba(234,179,8,.22),0 2px 10px rgba(0,0,0,.05)}.bn-note.collapsed .bn-note-body{display:none}
      .bn-note-head{display:flex;gap:8px;align-items:flex-start}.bn-title{flex:1;border:none;background:transparent;font-weight:800;font-size:16px;color:#111827;outline:none;padding:4px 0}
      .bn-note-actions{display:flex;gap:4px}.bn-icon-btn{border:none;background:rgba(255,255,255,.75);border-radius:8px;padding:6px 8px;cursor:pointer}.bn-icon-btn:hover{background:#fff}.bn-icon-btn.danger:hover{background:#fee2e2}
      .bn-text{width:100%;min-height:145px;resize:vertical;border:1px solid #eadca5;border-radius:10px;padding:10px 11px;margin-top:10px;background:#fffef5;color:#111827;outline:none;line-height:1.45;white-space:pre-wrap}
      .bn-text:focus{border-color:#eab308;box-shadow:0 0 0 2px rgba(234,179,8,.18)}
      .bn-save-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:9px}.bn-note-state{font-size:11px;color:#6b7280}
      .bn-save{border:none;background:#047857;color:#fff;border-radius:8px;padding:8px 13px;font-weight:700;cursor:pointer}.bn-save:hover{background:#065f46}.bn-save:disabled{opacity:.6;cursor:wait}
      .bn-note-foot{margin-top:8px;font-size:11px;color:#6b7280}
      .bn-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;min-height:220px;border:2px dashed #d1d5db;border-radius:14px;background:#fff;color:#6b7280;padding:20px}.bn-empty-icon{font-size:30px}
      .bn-foot{padding:10px 14px;border-top:1px solid #e5e7eb;background:#fff;font-size:11px;color:#6b7280;display:flex;justify-content:space-between;gap:10px}
      @media(max-width:880px){.bn-panel{left:12px;right:12px;top:76px;bottom:12px;width:auto;max-width:none}.bn-fab{right:12px;bottom:12px}}
    `;
    document.head.appendChild(style);
  }

  function buildUi(){
    if(document.getElementById('bn-panel'))return;

    const fab=document.createElement('button');
    fab.id='bn-fab';
    fab.type='button';
    fab.className='bn-fab';
    fab.innerHTML='📝 <span>Bloco de notas</span>';

    const panel=document.createElement('aside');
    panel.id='bn-panel';
    panel.className='bn-panel';
    panel.innerHTML=`
      <div class="bn-head">
        <div class="bn-title-row">
          <div class="bn-main-title">📝 Bloco de Notas <span class="bn-counter" id="bn-counter">0</span></div>
          <button class="bn-close" id="bn-close" type="button">Fechar</button>
        </div>
        <div class="bn-subline">
          <span class="bn-mode ok" id="bn-mode">Banco de dados</span>
          <span>O rascunho fica guardado; só grava no banco ao clicar em Salvar.</span>
        </div>
        <button class="bn-add" id="bn-add" type="button">＋ Nova nota</button>
      </div>
      <div class="bn-list" id="bn-list"></div>
      <div class="bn-foot">
        <span id="bn-status">Pronto.</span>
        <span>Enter cria uma nova linha normalmente.</span>
      </div>
    `;

    document.body.append(fab,panel);

    ui={
      fab,panel,
      list:panel.querySelector('#bn-list'),
      add:panel.querySelector('#bn-add'),
      close:panel.querySelector('#bn-close'),
      counter:panel.querySelector('#bn-counter'),
      mode:panel.querySelector('#bn-mode'),
      statusText:panel.querySelector('#bn-status')
    };

    fab.addEventListener('click',()=>abrirPainel(true));
    ui.close.addEventListener('click',()=>abrirPainel(false));
    ui.add.addEventListener('click',novaNota);

    const abrir=localStorage.getItem(chaveAberto())!=='0';
    abrirPainel(abrir);
  }

  async function init(){
    if(window.__blocoNotasInicializado)return;
    window.__blocoNotasInicializado=true;

    usuario=getUsuarioLogado();
    if(!usuario?.id)return;

    injectStyles();
    buildUi();
    await carregarNotas();
    renderizarNotas();
    status('Pronto. Clique em Salvar quando terminar a nota.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();