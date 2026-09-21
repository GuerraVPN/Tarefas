(()=>{
'use strict';

const VERSION='2.4.0.1';
const BUILD=275;
const MARK='__TAREFAS_LAUNCHER_ICON_2401__';
if(globalThis[MARK])return;
globalThis[MARK]=true;

const page=()=>String(location.pathname.split('/').pop()||'').toLowerCase();
const isSettings=()=>page()==='configuracoes.html';
const user=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};

let pluginCache=null;
function launcherPlugin(){
  if(pluginCache)return pluginCache;
  const cap=globalThis.Capacitor;
  try{
    if(cap?.registerPlugin){
      pluginCache=cap.registerPlugin('TarefasLauncherIcon');
      return pluginCache;
    }
    if(cap?.Plugins?.TarefasLauncherIcon){
      pluginCache=cap.Plugins.TarefasLauncherIcon;
      return pluginCache;
    }
    if(typeof cap?.nativePromise==='function'){
      pluginCache=new Proxy({},{
        get:(_,method)=>(options={})=>cap.nativePromise('TarefasLauncherIcon',String(method),options)
      });
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
  if(u?.id){
    const local=String(localStorage.getItem('avatar_usuario_'+u.id)||'').trim();
    if(local)return local;
  }
  return '';
}

function css(){
  if(document.getElementById('tmLauncherIconCss2401'))return;
  const style=document.createElement('style');
  style.id='tmLauncherIconCss2401';
  style.textContent=`
    #tmLauncherIconCard2401{grid-column:1/-1}
    #tmLauncherIconCard2401 .tm-li-copy{color:var(--v4-muted,#64748b);font-size:12px;line-height:1.5;margin-bottom:13px}
    #tmLauncherIconCard2401 .tm-li-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
    #tmLauncherIconCard2401 .tm-li-option{border:2px solid var(--v4-border,#d6dce4);background:var(--v4-surface,#fff);border-radius:13px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:7px;color:var(--v4-text,#111827);cursor:pointer;min-width:0;transition:.16s}
    #tmLauncherIconCard2401 .tm-li-option:hover{transform:translateY(-1px);border-color:var(--v4-muted,#64748b)}
    #tmLauncherIconCard2401 .tm-li-option.selected{border-color:#047857;box-shadow:0 0 0 2px rgba(4,120,87,.12)}
    #tmLauncherIconCard2401 .tm-li-option:disabled{opacity:.55;cursor:not-allowed;transform:none}
    #tmLauncherIconCard2401 .tm-li-icon{width:58px;height:58px;border-radius:15px;display:grid;place-items:center;font-weight:950;font-size:29px;overflow:hidden;box-shadow:0 5px 16px rgba(0,0,0,.18)}
    #tmLauncherIconCard2401 .tm-li-blue{background:#08283b;color:#55c7ff;border:1px solid #15537a}
    #tmLauncherIconCard2401 .tm-li-military{background:#26351f;color:#d8dfb8;border:1px solid #55674a}
    #tmLauncherIconCard2401 .tm-li-gold{background:#171717;color:#f6c945;border:1px solid #725d18}
    #tmLauncherIconCard2401 .tm-li-system{background:#eef2f7;color:#475569;border:1px solid #cbd5e1;font-size:22px}
    #tmLauncherIconCard2401 .tm-li-profile{background:#07151c;color:#fff;border:1px solid #234454}
    #tmLauncherIconCard2401 .tm-li-profile img{width:100%;height:100%;object-fit:cover}
    #tmLauncherIconCard2401 .tm-li-option strong{font-size:10px;line-height:1.2;text-align:center;overflow-wrap:anywhere}
    #tmLauncherIconCard2401 .tm-li-status{margin-top:12px;border:1px solid var(--v4-border,#d6dce4);background:var(--v4-surface-2,#f8fafc);border-radius:9px;padding:10px 11px;color:var(--v4-muted,#64748b);font-size:11px;line-height:1.45}
    #tmLauncherIconCard2401 .tm-li-status.ok{border-color:#86efac;color:#166534;background:#f0fdf4}
    #tmLauncherIconCard2401 .tm-li-status.error{border-color:#fecaca;color:#991b1b;background:#fef2f2}
    #tmLauncherIconCard2401 .tm-li-note{margin-top:9px;color:var(--v4-muted,#64748b);font-size:10px;line-height:1.45}
    @media(max-width:720px){#tmLauncherIconCard2401 .tm-li-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
    @media(max-width:430px){#tmLauncherIconCard2401 .tm-li-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  document.head.appendChild(style);
}

function setStatus(message,type=''){
  const el=document.querySelector('#tmLauncherIconStatus2401');
  if(!el)return;
  el.className='tm-li-status'+(type?' '+type:'');
  el.textContent=String(message||'');
}

function markSelected(mode){
  document.querySelectorAll('#tmLauncherIconCard2401 [data-launcher-mode]').forEach(btn=>{
    btn.classList.toggle('selected',btn.dataset.launcherMode===mode);
  });
}

function refreshAvatarPreview(){
  const box=document.querySelector('#tmLauncherProfilePreview2401');
  if(!box)return;
  const avatar=profileAvatar();
  box.innerHTML=avatar?'<img alt="Ícone do perfil">':'👤';
  const img=box.querySelector('img');
  if(img)img.src=avatar;
  const button=document.querySelector('[data-launcher-mode="profile"]');
  if(button)button.disabled=!avatar;
}

async function loadState(){
  const api=launcherPlugin();
  if(!api){
    setStatus('Seletor disponível somente no APK Android 2.4.0.1.','');
    return;
  }
  try{
    const state=await api.getState({});
    markSelected(String(state?.mode||'blue'));
    setStatus(
      state?.mode==='profile'
        ?'Modo Perfil selecionado. O atalho personalizado fica na tela inicial.'
        :'Ícone atual: '+String(state?.mode||'blue')+'.',
      'ok'
    );
  }catch(error){
    setStatus(error?.message||String(error),'error');
  }
}

async function choosePreset(mode,button){
  const api=launcherPlugin();
  if(!api){setStatus('Recurso nativo indisponível nesta instalação.','error');return}
  const buttons=[...document.querySelectorAll('#tmLauncherIconCard2401 [data-launcher-mode]')];
  buttons.forEach(b=>b.disabled=true);
  try{
    setStatus('Aplicando ícone…');
    const result=await api.setPreset({mode});
    markSelected(mode);
    setStatus(result?.message||'Ícone atualizado.','ok');
  }catch(error){
    setStatus(error?.message||String(error),'error');
  }finally{
    buttons.forEach(b=>b.disabled=false);
    refreshAvatarPreview();
  }
}

async function chooseProfile(){
  const api=launcherPlugin();
  if(!api){setStatus('Recurso nativo indisponível nesta instalação.','error');return}
  const avatar=profileAvatar();
  if(!avatar){setStatus('Adicione primeiro uma foto/ícone ao seu perfil.','error');return}
  const buttons=[...document.querySelectorAll('#tmLauncherIconCard2401 [data-launcher-mode]')];
  buttons.forEach(b=>b.disabled=true);
  try{
    setStatus('Preparando o ícone do seu perfil…');
    const result=await api.pinProfileShortcut({avatarDataUrl:avatar,label:'TAREFAS'});
    if(result?.ok){
      markSelected('profile');
      setStatus(result?.message||'Ícone do perfil preparado.','ok');
    }else{
      setStatus(result?.message||'O Android não aceitou a solicitação.','error');
    }
  }catch(error){
    setStatus(error?.message||String(error),'error');
  }finally{
    buttons.forEach(b=>b.disabled=false);
    refreshAvatarPreview();
  }
}

function install(){
  if(!isSettings()||document.getElementById('tmLauncherIconCard2401'))return;
  const grid=document.querySelector('.content .grid,.grid');
  if(!grid)return;
  css();

  const card=document.createElement('section');
  card.className='card';
  card.id='tmLauncherIconCard2401';
  card.innerHTML=`
    <div class="card-title">Ícone da tela inicial <small style="font-size:9px;opacity:.55">Alpha ${VERSION}</small></div>
    <div class="card-body">
      <div class="tm-li-copy">Escolha o visual do TAREFAS no launcher. Os modelos fixos trocam o ícone do aplicativo; <b>Meu perfil</b> usa a imagem do seu perfil para criar/atualizar o atalho TAREFAS na tela inicial.</div>
      <div class="tm-li-grid">
        <button type="button" class="tm-li-option" data-launcher-mode="blue"><span class="tm-li-icon tm-li-blue">T</span><strong>TAREFAS Azul</strong></button>
        <button type="button" class="tm-li-option" data-launcher-mode="military"><span class="tm-li-icon tm-li-military">★</span><strong>Militar</strong></button>
        <button type="button" class="tm-li-option" data-launcher-mode="gold"><span class="tm-li-icon tm-li-gold">T</span><strong>Preto & Ouro</strong></button>
        <button type="button" class="tm-li-option" data-launcher-mode="system"><span class="tm-li-icon tm-li-system">◈</span><strong>Ícone do sistema</strong></button>
        <button type="button" class="tm-li-option" data-launcher-mode="profile"><span class="tm-li-icon tm-li-profile" id="tmLauncherProfilePreview2401">👤</span><strong>Meu perfil</strong></button>
      </div>
      <div class="tm-li-status" id="tmLauncherIconStatus2401">Carregando seletor…</div>
      <div class="tm-li-note">No modo <b>Meu perfil</b>, o Android pode pedir confirmação para adicionar o atalho. Por segurança do próprio Android, uma foto escolhida pelo usuário não pode substituir dinamicamente o ícone da gaveta de apps; ela é aplicada ao atalho da tela inicial.</div>
    </div>
  `;
  grid.appendChild(card);

  card.querySelectorAll('[data-launcher-mode]').forEach(button=>{
    button.addEventListener('click',()=>{
      const mode=button.dataset.launcherMode;
      if(mode==='profile')chooseProfile();
      else choosePreset(mode,button);
    });
  });

  refreshAvatarPreview();
  loadState();

  const avatarHost=document.getElementById('avatarLarge');
  if(avatarHost){
    new MutationObserver(()=>refreshAvatarPreview()).observe(avatarHost,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});
else setTimeout(install,0);

window.addEventListener('pageshow',()=>setTimeout(install,0));

globalThis.TarefasLauncherIcon2401=Object.freeze({
  version:VERSION,
  build:BUILD,
  refresh:refreshAvatarPreview,
  state:loadState
});
})();