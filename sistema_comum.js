(function(){
  'use strict';

  const FILE_BY_KEY={
    quadro:'menu.html',
    minhas:'minhas_tarefas.html',
    calendario:'calendario.html',
    relatorios:'relatorios.html',
    usuarios:'usuarios.html'
  };
  let usuario=null;

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
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar)return;

    const style=document.createElement('style');
    style.id='creditos26PelStyle';
    style.textContent='.creditos-26pel{margin:10px 8px 4px;padding:9px 10px;border-top:1px solid rgba(255,255,255,.08);color:#9ca3af;font-size:10px;line-height:1.45;text-align:center}.creditos-26pel strong{color:#facc15;font-weight:700}';
    document.head.appendChild(style);

    const box=document.createElement('div');
    box.id='creditos26Pel';
    box.className='creditos-26pel';
    box.innerHTML='Criado por <strong>Sd Guerra</strong><br>26º Pel PE Mec 💪🏼';

    const footer=sidebar.querySelector('.sidebar-footer,.side-user');
    if(footer)sidebar.insertBefore(box,footer); else sidebar.appendChild(box);
  }

  async function db(){
    try{
      if(!usuario?.id||typeof supabaseClient==='undefined')return;
      const {data,error}=await supabaseClient.from('usuarios').select('preferencias').eq('id',usuario.id).maybeSingle();
      if(error)return;
      const prefs=parse(data?.preferencias);
      if(!prefs)return;
      const k=prefKey(); if(k)localStorage.setItem(k,JSON.stringify(prefs));
      apply(prefs);
    }catch(err){console.warn('Preferências da sidebar:',err?.message||err)}
  }

  function init(){
    usuario=getUsuario();
    credits();
    apply(local()||{});
    setTimeout(db,0);
  }

  window.addEventListener('prefs26:update',e=>{
    const prefs=e.detail||{};
    const k=prefKey(); if(k)localStorage.setItem(k,JSON.stringify(prefs));
    apply(prefs);
  });

  window.addEventListener('storage',e=>{
    if(e.key===prefKey())apply(parse(e.newValue)||{});
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();