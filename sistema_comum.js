(function(){
  'use strict';

  const FILE_BY_KEY={
    dashboard:'dashboard.html',
    quadro:'menu.html',
    minhas:'minhas_tarefas.html',
    calendario:'calendario.html',
    relatorios:'relatorios.html',
    usuarios:'usuarios.html',
    central:'central.html',
    orcamentarios:'orcamentarios.html'
  };
  let usuario=null;

  function currentPage(){return (location.pathname.split('/').pop()||'').toLowerCase()}
  function installOrcLazyGate(){
    if(currentPage()!=='orcamentarios.html'||window.__TAREFAS_ORC_LAZY_GATE__)return;
    window.__TAREFAS_ORC_LAZY_GATE__=true;
    const params=new URLSearchParams(location.search);
    let modulo=params.get('modulo')||'relatorio';
    if(params.get('movimentacao'))modulo='movimentacao';
    if(params.get('pedido')&&!params.get('modulo'))modulo='pedido';
    window.__TAREFAS_ORC_ACTIVE_MODULE__=modulo;

    const managed=new Set([
      'guias_v6.js','pedidos_v6.js','movimentacoes_v6.js','material_carga_v6.js',
      'v7_7_0_material_carga.js','passagem_carga_v6.js','lavanderia_v211.js',
      'lavanderia_financeiro_v212.js','lavanderia_pagamento_v767.js','lavanderia_documento_v762.js'
    ]);
    const allowed=new Set();
    if(modulo==='guias')allowed.add('guias_v6.js');
    else if(modulo==='movimentacao')allowed.add('movimentacoes_v6.js');
    else if(modulo==='material_carga'){allowed.add('material_carga_v6.js');allowed.add('v7_7_0_material_carga.js')}
    else if(modulo==='passagem_carga')allowed.add('passagem_carga_v6.js');
    else if(modulo==='lavanderia'){
      ['lavanderia_v211.js','lavanderia_financeiro_v212.js','lavanderia_pagamento_v767.js','lavanderia_documento_v762.js'].forEach(x=>allowed.add(x));
    }else if(['baixas','distribuicao','pedido'].includes(modulo))allowed.add('pedidos_v6.js');
    else if(modulo!=='relatorio')allowed.add('pedidos_v6.js');

    const original=document.addEventListener;
    document.addEventListener=function(type,listener,options){
      if(type==='DOMContentLoaded'){
        const src=(document.currentScript?.src||'').split('/').pop().split('?')[0];
        if(src&&managed.has(src)&&!allowed.has(src))return;
      }
      return original.call(this,type,listener,options);
    };
    original.call(document,'DOMContentLoaded',()=>{document.addEventListener=original},{once:true});

    if(modulo==='relatorio'&&!document.querySelector('script[data-orc-report-light]')){
      const s=document.createElement('script');
      s.src='orcamentarios_relatorio_light.js?v=7.8.2-orcfix1';
      s.defer=true;s.dataset.orcReportLight='1';document.head.appendChild(s);
    }

    if(modulo==='guias'){
      original.call(document,'DOMContentLoaded',()=>setTimeout(()=>{
        const ids=['reportModule','pedidosModule','movimentacaoModule','materialCargaModule','passagemCargaModule','lavanderiaModule'];
        ids.forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=true});
        const guias=document.getElementById('guiasModule');if(guias)guias.hidden=false;
        const title=document.getElementById('orcPageTitle');if(title)title.textContent='Orçamentários · Guias';
        const sub=document.getElementById('orcPageSubtitle');if(sub)sub.textContent='Guias, fiscalização, documentos e andamento.';
      },0),{once:true});
    }
  }
  installOrcLazyGate();

  function getUsuario(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
  function prefKey(){return usuario?.id!=null?`prefs_usuario_${usuario.id}`:null}
  function parse(raw){if(!raw)return null;if(typeof raw==='object')return raw;try{return JSON.parse(raw)}catch(_){return null}}
  function local(){const k=prefKey();return k?parse(localStorage.getItem(k)):null}

  function itemKey(el){
    if(el?.dataset?.prefItem)return el.dataset.prefItem;
    const texto=((el.getAttribute?.('href')||'')+' '+(el.getAttribute?.('onclick')||'')).toLowerCase();
    for(const [key,file] of Object.entries(FILE_BY_KEY))if(texto.includes(file))return key;
    return null;
  }

  function apply(prefs){
    const sidebar=prefs?.sidebar||{};
    document.querySelectorAll('.sidebar li,.sidebar a,[data-pref-item]').forEach(el=>{
      const key=itemKey(el);
      if(key)el.style.display=sidebar[key]===false?'none':'';
    });
  }

  function credits(){
    if(document.getElementById('creditos26Pel'))return;
    const existente=document.querySelector('.sidebar .credit,.sidebar .creditos-26pel');
    if(existente){existente.id='creditos26Pel';return}
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar)return;
    const style=document.createElement('style');
    style.id='creditos26PelStyle';
    style.textContent='.creditos-26pel{margin:10px 8px 4px;padding:9px 10px;border-top:1px solid rgba(255,255,255,.08);color:#9ca3af;font-size:10px;line-height:1.45;text-align:center}.creditos-26pel strong{color:#facc15;font-weight:700}';
    document.head.appendChild(style);
    const box=document.createElement('div');
    box.id='creditos26Pel';box.className='creditos-26pel';
    box.innerHTML='Criado por <strong>Sd Guerra</strong><br>26º Pel PE Mec 💪🏼';
    const footer=sidebar.querySelector('.sidebar-footer,.side-user');
    if(footer)sidebar.insertBefore(box,footer); else sidebar.appendChild(box);
  }

  async function db(){
    try{
      if(!usuario?.id||typeof supabaseClient==='undefined')return;
      const {data,error}=await supabaseClient.from('usuarios').select('preferencias').eq('id',usuario.id).maybeSingle();
      if(error)return;
      const prefs=parse(data?.preferencias);if(!prefs)return;
      const k=prefKey();if(k)localStorage.setItem(k,JSON.stringify(prefs));
      apply(prefs);
    }catch(err){console.warn('Preferências da sidebar:',err?.message||err)}
  }

  function init(){
    usuario=getUsuario();credits();apply(local()||{});setTimeout(db,0);
  }

  window.addEventListener('prefs26:update',e=>{
    const prefs=e.detail||{};const k=prefKey();if(k)localStorage.setItem(k,JSON.stringify(prefs));apply(prefs);
  });
  window.addEventListener('storage',e=>{if(e.key===prefKey())apply(parse(e.newValue)||{})});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();