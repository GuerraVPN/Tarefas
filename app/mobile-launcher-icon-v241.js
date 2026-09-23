(()=>{
'use strict';
const VERSION='2.4.1',BUILD=276,MARK='__TAREFAS_LAUNCHER_ICON_241__';
if(globalThis[MARK])return;globalThis[MARK]=true;
const page=()=>String(location.pathname.split('/').pop()||'').toLowerCase();
const user=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};
let pluginCache=null;
function launcherPlugin(){
  if(pluginCache)return pluginCache;
  const cap=globalThis.Capacitor;
  try{
    if(cap?.registerPlugin){pluginCache=cap.registerPlugin('TarefasLauncherIcon');return pluginCache}
    if(cap?.Plugins?.TarefasLauncherIcon){pluginCache=cap.Plugins.TarefasLauncherIcon;return pluginCache}
    if(typeof cap?.nativePromise==='function'){
      pluginCache=new Proxy({},{get:(_,method)=>(options={})=>cap.nativePromise('TarefasLauncherIcon',String(method),options)});
      return pluginCache;
    }
  }catch(_){}
  return null;
}
function profileAvatar(){
  const img=document.querySelector('#avatarLarge img,#topAvatar img,.avatar-circle img');
  const src=String(img?.src||'').trim();
  if(src&&src!=='about:blank')return src;
  const u=user();
  return u?.id?String(localStorage.getItem('avatar_usuario_'+u.id)||'').trim():'';
}
function ensureCss(){
  if(document.getElementById('tmLauncherIconCss241'))return;
  const s=document.createElement('style');s.id='tmLauncherIconCss241';s.textContent=`
  #tmLauncherIconCard241{grid-column:1/-1}
  #tmLauncherIconCard241 .li-copy{color:var(--v4-muted,#64748b);font-size:12px;line-height:1.5;margin-bottom:13px}
  #tmLauncherIconCard241 .li-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
  #tmLauncherIconCard241 .li-option{border:2px solid var(--v4-border,#d6dce4);background:var(--v4-surface,#fff);border-radius:13px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:7px;color:var(--v4-text,#111827);cursor:pointer;min-width:0}
  #tmLauncherIconCard241 .li-option.selected{border-color:#047857;box-shadow:0 0 0 2px rgba(4,120,87,.12)}
  #tmLauncherIconCard241 .li-option:disabled{opacity:.55;cursor:not-allowed}
  #tmLauncherIconCard241 .li-icon{width:58px;height:58px;border-radius:15px;display:grid;place-items:center;font-weight:950;font-size:29px;overflow:hidden;box-shadow:0 5px 16px rgba(0,0,0,.18)}
  #tmLauncherIconCard241 .blue{background:#08283b;color:#55c7ff;border:1px solid #15537a}
  #tmLauncherIconCard241 .military{background:#26351f;color:#d8dfb8;border:1px solid #55674a}
  #tmLauncherIconCard241 .gold{background:#171717;color:#f6c945;border:1px solid #725d18}
  #tmLauncherIconCard241 .system{background:#eef2f7;color:#475569;border:1px solid #cbd5e1;font-size:22px}
  #tmLauncherIconCard241 .profile{background:#07151c;color:#fff;border:1px solid #234454}
  #tmLauncherIconCard241 .profile img{width:100%;height:100%;object-fit:cover}
  #tmLauncherIconCard241 .li-option strong{font-size:10px;text-align:center}
  #tmLauncherIconCard241 .li-status{margin-top:12px;border:1px solid var(--v4-border,#d6dce4);background:var(--v4-surface-2,#f8fafc);border-radius:9px;padding:10px 11px;color:var(--v4-muted,#64748b);font-size:11px}
  #tmLauncherIconCard241 .li-status.ok{border-color:#86efac;color:#166534;background:#f0fdf4}
  #tmLauncherIconCard241 .li-status.error{border-color:#fecaca;color:#991b1b;background:#fef2f2}
  #tmLauncherIconCard241 .li-note{margin-top:9px;color:var(--v4-muted,#64748b);font-size:10px;line-height:1.45}
  @media(max-width:720px){#tmLauncherIconCard241 .li-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
  @media(max-width:430px){#tmLauncherIconCard241 .li-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;document.head.appendChild(s);
}
function status(msg,type=''){const el=document.getElementById('tmLauncherIconStatus241');if(el){el.className='li-status'+(type?' '+type:'');el.textContent=String(msg||'')}}
function select(mode){document.querySelectorAll('#tmLauncherIconCard241 [data-launcher-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.launcherMode===mode))}
function refreshAvatar(){
  const box=document.getElementById('tmLauncherProfilePreview241');if(!box)return;
  const avatar=profileAvatar();box.innerHTML=avatar?'<img alt="Ícone do perfil">':'👤';
  const img=box.querySelector('img');if(img)img.src=avatar;
  const b=document.querySelector('#tmLauncherIconCard241 [data-launcher-mode="profile"]');if(b)b.disabled=!avatar;
}
async function loadState(){
  const api=launcherPlugin();if(!api){status('Recurso nativo indisponível nesta instalação.','error');return}
  try{const s=await api.getState({});select(String(s?.mode||'blue'));status(s?.mode==='profile'?'Meu perfil está selecionado.':'Ícone selecionado: '+String(s?.mode||'blue')+'.','ok')}
  catch(e){status(e?.message||String(e),'error')}
}
async function apply(mode){
  const api=launcherPlugin();if(!api){status('Recurso nativo indisponível.','error');return}
  const buttons=[...document.querySelectorAll('#tmLauncherIconCard241 [data-launcher-mode]')];buttons.forEach(b=>b.disabled=true);
  try{
    status('Aplicando ícone…');
    const result=mode==='profile'
      ?await api.pinProfileShortcut({avatarDataUrl:profileAvatar(),label:'TAREFAS'})
      :await api.setPreset({mode});
    if(result?.ok){select(mode);status(result?.message||'Ícone atualizado.','ok')}
    else status(result?.message||'O Android não aceitou a alteração.','error');
  }catch(e){status(e?.message||String(e),'error')}
  finally{buttons.forEach(b=>b.disabled=false);refreshAvatar()}
}
function install(){
  if(page()!=='configuracoes.html'||document.getElementById('tmLauncherIconCard241'))return;
  const grid=document.querySelector('.content .grid,.grid');if(!grid)return;ensureCss();
  const card=document.createElement('section');card.className='card';card.id='tmLauncherIconCard241';
  card.innerHTML=`
  <div class="card-title">Ícone da tela inicial <small style="font-size:9px;opacity:.55">Beta ${VERSION}</small></div>
  <div class="card-body">
    <div class="li-copy">Escolha o ícone do TAREFAS para a tela inicial. <b>Meu perfil</b> usa a própria imagem/ícone configurado no seu perfil.</div>
    <div class="li-grid">
      <button type="button" class="li-option" data-launcher-mode="blue"><span class="li-icon blue">T</span><strong>TAREFAS Azul</strong></button>
      <button type="button" class="li-option" data-launcher-mode="military"><span class="li-icon military">★</span><strong>Militar</strong></button>
      <button type="button" class="li-option" data-launcher-mode="gold"><span class="li-icon gold">T</span><strong>Preto & Ouro</strong></button>
      <button type="button" class="li-option" data-launcher-mode="system"><span class="li-icon system">◈</span><strong>Sistema</strong></button>
      <button type="button" class="li-option" data-launcher-mode="profile"><span class="li-icon profile" id="tmLauncherProfilePreview241">👤</span><strong>Meu perfil</strong></button>
    </div>
    <div class="li-status" id="tmLauncherIconStatus241">Carregando seletor…</div>
    <div class="li-note">Na primeira escolha o Android pode pedir confirmação para adicionar o atalho. Depois, novas escolhas atualizam o mesmo atalho. O ícone padrão do APK também foi corrigido nesta Beta.</div>
  </div>`;
  grid.appendChild(card);
  card.querySelectorAll('[data-launcher-mode]').forEach(b=>b.onclick=()=>apply(b.dataset.launcherMode));
  refreshAvatar();loadState();
  const host=document.getElementById('avatarLarge');if(host)new MutationObserver(refreshAvatar).observe(host,{childList:true,subtree:true,attributes:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
window.addEventListener('pageshow',()=>setTimeout(install,0));
globalThis.TarefasLauncherIcon241=Object.freeze({version:VERSION,build:BUILD,refresh:refreshAvatar,state:loadState});
})();