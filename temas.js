(function(){
'use strict';

const VALIDOS=new Set(['light','dark','night','military']);
let usuario=null;

function getUser(){
  try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}
}

function key(){
  return usuario?.id!=null?`prefs_usuario_${usuario.id}`:null;
}

function parse(raw){
  if(!raw)return null;
  if(typeof raw==='object')return raw;
  try{return JSON.parse(raw)}catch(_){return null}
}

function normalizar(tema){
  return VALIDOS.has(String(tema||''))?String(tema):'light';
}

function temaLocal(){
  usuario=getUser();
  const k=key();
  if(!k)return 'light';
  return normalizar(parse(localStorage.getItem(k))?.tema);
}

function aplicar(tema,persistir=false){
  tema=normalizar(tema);
  document.documentElement.dataset.theme=tema;
  document.body?.setAttribute('data-theme',tema);

  if(persistir){
    usuario=getUser();
    const k=key();
    if(k){
      const prefs=parse(localStorage.getItem(k))||{};
      prefs.tema=tema;
      localStorage.setItem(k,JSON.stringify(prefs));
    }
  }

  window.dispatchEvent(new CustomEvent('tema26:changed',{detail:{tema}}));
  return tema;
}

async function sincronizarBanco(){
  usuario=getUser();
  if(!usuario?.id)return;

  let c=null;
  try{
    if(typeof supabaseClient!=='undefined')c=supabaseClient;
  }catch(_){}
  if(!c)return;

  try{
    const r=await c.from('usuarios').select('preferencias').eq('id',usuario.id).maybeSingle();
    if(r.error||!r.data)return;
    const prefs=parse(r.data.preferencias);
    if(!prefs)return;

    const k=key();
    if(k)localStorage.setItem(k,JSON.stringify(prefs));
    aplicar(prefs.tema||'light',false);
  }catch(err){
    console.warn('Tema: não foi possível sincronizar com o banco.',err?.message||err);
  }
}

function init(){
  usuario=getUser();
  aplicar(temaLocal(),false);
  setTimeout(sincronizarBanco,0);
}

window.addEventListener('prefs26:update',e=>{
  const prefs=e.detail||{};
  if(prefs.tema)aplicar(prefs.tema,true);
});

window.addEventListener('storage',e=>{
  if(e.key===key()){
    const prefs=parse(e.newValue)||{};
    aplicar(prefs.tema||'light',false);
  }
});

window.Temas26={
  aplicar,
  sincronizarBanco,
  temaAtual:()=>document.documentElement.dataset.theme||'light',
  validos:[...VALIDOS]
};

// Aplica o tema local o quanto antes para reduzir "flash" claro.
usuario=getUser();
aplicar(temaLocal(),false);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();