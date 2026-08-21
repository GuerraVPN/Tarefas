(function(){
'use strict';
let usuario=null,estadoPerfis=null;
function getUser(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}

const SESSAO26_CHAVE='sessao26_ultima_atividade';
const SESSAO26_TEMPO=30*60*1000;
const SESSAO26_THROTTLE=20*1000;
let sessao26UltimoRegistro=0;
let sessao26Expirando=false;

function sessao26Encerrar(redirecionar=true){
  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem(SESSAO26_CHAVE);
  if(redirecionar)location.replace('index.html');
}

function sessao26Valida(){
  const atual=getUser();
  if(!atual?.id)return false;

  const agora=Date.now();
  let ultima=Number(localStorage.getItem(SESSAO26_CHAVE)||0);

  // Compatibilidade com uma sessão aberta antes do patch.
  if(!ultima){
    ultima=agora;
    localStorage.setItem(SESSAO26_CHAVE,String(agora));
    sessao26UltimoRegistro=agora;
    return true;
  }

  return (agora-ultima)<SESSAO26_TEMPO;
}

function sessao26RegistrarAtividade(){
  if(sessao26Expirando||!getUser()?.id)return;

  const agora=Date.now();

  // Primeiro verifica se não expirou ANTES de renovar.
  if(!sessao26Valida()){
    sessao26Expirando=true;
    sessao26Encerrar(true);
    return;
  }

  if((agora-sessao26UltimoRegistro)<SESSAO26_THROTTLE)return;
  sessao26UltimoRegistro=agora;
  localStorage.setItem(SESSAO26_CHAVE,String(agora));
}

function sessao26Verificar(){
  if(sessao26Expirando)return;

  if(!sessao26Valida()){
    sessao26Expirando=true;
    sessao26Encerrar(true);
  }
}

function sessao26Iniciar(){
  if(!getUser()?.id){
    location.replace('index.html');
    return false;
  }

  if(!sessao26Valida()){
    sessao26Encerrar(true);
    return false;
  }

  sessao26RegistrarAtividade();

  // Eventos que realmente indicam uso do sistema.
  ['pointerdown','keydown','touchstart','wheel'].forEach(evt=>{
    window.addEventListener(evt,sessao26RegistrarAtividade,{passive:true});
  });

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)sessao26Verificar();
  });

  window.addEventListener('focus',sessao26Verificar);

  // Se a página ficar aberta parada, encerra após o limite.
  setInterval(sessao26Verificar,30*1000);

  return true;
}

function injectCss(){if(document.getElementById('v3UiStyle'))return;const s=document.createElement('style');s.id='v3UiStyle';s.textContent=`
@media(min-width:901px){body.v3-shell{overflow:hidden!important}body.v3-shell .sidebar{position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:238px!important;min-height:100vh!important;height:100vh!important;overflow-y:auto!important;z-index:3500!important;padding:16px!important}body.v3-shell .main-content,body.v3-shell .main{margin-left:238px!important;width:calc(100% - 238px)!important;height:100vh!important;overflow-y:auto!important;overflow-x:hidden!important}body.v3-shell .header,body.v3-shell .topbar{position:sticky!important;top:0!important;z-index:3300!important;min-height:62px!important;padding-left:20px!important;padding-right:18px!important;background:var(--v4-surface)!important}body.v3-shell .kanban-board{padding:16px 18px 24px!important;gap:14px!important}body.v3-shell .kanban-column{padding:14px!important}body.v3-shell .task-card{padding:13px!important;margin-bottom:10px!important}body.v3-shell .content,body.v3-shell .page{padding:18px 20px 28px!important;max-width:none!important}}
.v3-user-zone{display:flex;align-items:center;gap:8px;margin-left:10px;position:relative;flex-shrink:0}.v3-top-icon{width:38px;height:38px;border:1px solid var(--v4-border);border-radius:10px;background:var(--v4-surface);display:grid;place-items:center;cursor:pointer;position:relative;color:var(--v4-text-2)}.v3-top-icon:hover{background:var(--v4-surface-2)}.v3-user-button{border:0;background:transparent;display:flex;align-items:center;gap:9px;cursor:pointer;padding:4px 5px;border-radius:10px}.v3-user-button:hover{background:var(--v4-surface-3)}.v3-avatar{width:38px;height:38px;border-radius:50%;background:var(--v4-sidebar);color:var(--v4-gold);border:2px solid var(--v4-gold);display:grid;place-items:center;font-weight:800;overflow:hidden;flex-shrink:0}.v3-avatar img{width:100%;height:100%;object-fit:cover}.v3-user-text{text-align:left;line-height:1.2;max-width:180px}.v3-user-text strong{display:block;font-size:12px;color:var(--v4-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v3-user-text span{font-size:10px;color:var(--v4-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;margin-top:3px}.v3-profile-menu{position:absolute;right:0;top:48px;width:300px;background:var(--v4-surface);border:1px solid var(--v4-border);border-radius:12px;box-shadow:0 16px 38px rgba(0,0,0,.16);padding:8px;display:none;z-index:99990}.v3-profile-menu.open{display:block}.v3-menu-title{font-size:10px;color:var(--v4-muted);font-weight:800;text-transform:uppercase;padding:6px 8px}.v3-profile-option{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;border:0;background:transparent;padding:9px 10px;border-radius:8px;text-align:left;cursor:pointer;color:var(--v4-text-2)}.v3-profile-option:hover{background:var(--v4-surface-3)}.v3-profile-option.active{background:var(--v4-accent-soft);color:var(--v4-accent);font-weight:700}.v3-profile-option small{display:block;color:var(--v4-muted);margin-top:2px}.v3-menu-sep{height:1px;background:var(--v4-border);margin:6px 0}.v3-menu-action{width:100%;border:0;background:transparent;text-align:left;padding:9px 10px;border-radius:8px;cursor:pointer;color:var(--v4-text-2)}.v3-menu-action:hover{background:var(--v4-surface-3)}.v3-menu-action.danger{color:var(--v4-danger)}.v3-count{position:absolute;right:-5px;top:-6px;min-width:18px;height:18px;padding:0 4px;border-radius:999px;background:var(--v4-danger);color:#fff;font:700 10px/18px Arial;text-align:center;display:none}.v3-count.show{display:block}.v3-central-nav-badge{margin-left:auto;background:var(--v4-danger);color:#fff;border-radius:999px;min-width:19px;height:19px;padding:0 5px;display:none;align-items:center;justify-content:center;font-size:10px;font-weight:800}.v3-central-nav-badge.show{display:inline-flex}.v3-password-bg{position:fixed;inset:0;background:rgba(17,24,39,.55);z-index:100000;display:none;align-items:center;justify-content:center;padding:18px}.v3-password-bg.open{display:flex}.v3-password-box{width:min(430px,100%);background:var(--v4-surface);border-radius:14px;padding:20px;box-shadow:0 25px 70px rgba(0,0,0,.2)}.v3-password-box h3{margin-bottom:14px}.v3-password-box label{display:block;font-size:12px;font-weight:700;color:var(--v4-text-2);margin:10px 0 5px}.v3-password-box input{width:100%;padding:10px;border:1px solid var(--v4-border-strong);border-radius:8px}.v3-password-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:17px}.v3-password-actions button{border:1px solid var(--v4-border-strong);border-radius:8px;padding:9px 13px;background:var(--v4-surface);font-weight:700;cursor:pointer}.v3-password-actions .save{background:var(--v4-accent);color:#fff;border-color:var(--v4-accent)}.task-last-update{margin-top:7px;font-size:9px;color:var(--v4-muted);display:flex;align-items:center;gap:4px}.v3-create-resp{margin-top:7px;border:1px solid var(--v4-border-strong);border-radius:9px;background:var(--v4-surface);overflow:hidden}.v3-create-resp-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;background:var(--v4-surface-2)}.v3-create-resp-head span{font-size:11px;color:var(--v4-muted)}.v3-create-resp-head button{border:0;background:var(--v4-accent);color:#fff;border-radius:7px;padding:7px 10px;font-weight:700;cursor:pointer}.v3-create-selected{display:flex;flex-wrap:wrap;gap:5px;padding:8px 10px;min-height:38px}.v3-create-chip{font-size:10px;background:var(--v4-accent-soft);color:var(--v4-accent);border:1px solid var(--v4-accent);border-radius:999px;padding:4px 7px}.v3-create-empty{font-size:11px;color:var(--v4-muted)}.v3-create-panel{display:none;border-top:1px solid var(--v4-border);padding:9px}.v3-create-panel.open{display:block}.v3-create-panel input[type=search]{width:100%;padding:8px;border:1px solid var(--v4-border-strong);border-radius:7px;margin-bottom:7px}.v3-create-list{max-height:210px;overflow:auto;display:grid;gap:4px}.v3-create-row{display:flex;align-items:flex-start;gap:8px;padding:7px;border-radius:7px;cursor:pointer}.v3-create-row:hover{background:var(--v4-surface-3)}.v3-create-row strong{font-size:11px;display:block}.v3-create-row small{font-size:9px;color:var(--v4-muted)}@media(max-width:900px){.v3-user-text{display:none}.v3-user-zone{gap:5px}.v3-profile-menu{position:fixed;right:10px;top:66px;max-width:calc(100vw - 20px)}}`;document.head.appendChild(s);document.body.classList.add('v3-shell')}
function hideOld(){document.querySelectorAll('#topAvatar,#miniAvatar,.topbar-right .mini-avatar,.header-actions .top-avatar,.topbar-right .bell,.header-actions .bell').forEach(el=>el.style.display='none');const s=document.querySelector('#sidebarUserBtn');if(s){s.style.pointerEvents='none';s.title='Use o perfil no canto superior direito'}}
function header(){return document.querySelector('.header,.topbar')}
function photo(b){return b?.avatar||b?.avatar_url||b?.foto_url||localStorage.getItem(`avatar_usuario_${b?.id}`)||''}
function avatar(b){const p=photo(b);return p&&/^(data:image\/|https?:\/\/)/i.test(p)?`<img src="${esc(p)}" alt="Foto">`:esc(String(b?.nome_guerra||b?.nome||'U').charAt(0).toUpperCase())}
function addNav(){const list=document.querySelector('.sidebar ul');if(!list||list.querySelector('[data-v3-central]'))return;const li=document.createElement('li');li.dataset.v3Central='1';li.innerHTML='🔔 Central <span class="v3-central-nav-badge" id="v3NavCount">0</span>';li.onclick=()=>location.href='central.html';const cfg=[...list.children].find(x=>(x.textContent||'').toLowerCase().includes('config'));if(cfg)list.insertBefore(li,cfg);else list.appendChild(li)}
async function loadProfiles(){const c=client();usuario=getUser();if(!c||!usuario?.id)return;let base={...usuario};try{const r=await c.from('usuarios').select('id,nome_completo,nome_guerra,patente,secao,posicao,avatar').eq('id',usuario.id).maybeSingle();if(!r.error&&r.data)base={...base,...r.data}}catch(_){}if(window.Perfis26){try{estadoPerfis=await Perfis26.carregar(c,base);usuario=estadoPerfis.usuario;return}catch(e){console.warn(e)}}estadoPerfis={usuario:base,perfis:[],ativo:null};usuario=base}
function renderMenu(){const m=document.getElementById('v3ProfileMenu');if(!m)return;const perfis=estadoPerfis?.perfis?.length?estadoPerfis.perfis:[{id:usuario?.perfil_id,secao:usuario?.secao,posicao:usuario?.posicao,principal:true}];m.innerHTML='<div class="v3-menu-title">Perfil ativo</div>'+perfis.map(p=>{const active=String(p.id??'')===String(usuario?.perfil_id??estadoPerfis?.ativo?.id??'');return `<button class="v3-profile-option ${active?'active':''}" data-profile-id="${esc(p.id??'')}"><span>${esc((p.secao||'-')+' — '+(p.posicao||'Auxiliar'))}${p.principal?'<small>Perfil principal</small>':''}</span><span>${active?'✓':''}</span></button>`}).join('')+'<div class="v3-menu-sep"></div><button class="v3-menu-action" data-v3-password>🔑 Alterar senha</button><button class="v3-menu-action" onclick="location.href=\'configuracoes.html\'">⚙️ Configurações</button><button class="v3-menu-action danger" data-v3-logout>➔ Sair</button>';m.querySelectorAll('[data-profile-id]').forEach(b=>b.onclick=()=>{const p=perfis.find(x=>String(x.id??'')===String(b.dataset.profileId));if(p&&String(p.id??'')!==String(usuario?.perfil_id??'')&&window.Perfis26)Perfis26.trocar(usuario,p)});m.querySelector('[data-v3-password]').onclick=openPassword;m.querySelector('[data-v3-logout]').onclick=()=>{sessao26Encerrar(false);location.replace('index.html')}}
function renderUser(){const h=header();if(!h||document.getElementById('v3UserZone'))return;const z=document.createElement('div');z.id='v3UserZone';z.className='v3-user-zone';z.innerHTML=`<button class="v3-top-icon" id="v3Bell" title="Notificações">🔔<span class="v3-count" id="v3BellCount">0</span></button><button class="v3-top-icon" id="v3Mail" title="Mensagens">✉️<span class="v3-count" id="v3MailCount">0</span></button><button class="v3-user-button" id="v3UserBtn"><span class="v3-avatar">${avatar(usuario)}</span><span class="v3-user-text"><strong>${esc([usuario?.patente,usuario?.nome_guerra].filter(Boolean).join(' ')||'Usuário')}</strong><span>${esc((usuario?.secao||'-')+' — '+(usuario?.posicao||'-'))}</span></span><span style="font-size:10px;color:var(--v4-muted)">⌄</span></button><div class="v3-profile-menu" id="v3ProfileMenu"></div>`;const a=h.querySelector('.header-actions,.topbar-right');if(a)a.insertAdjacentElement('afterend',z);else h.appendChild(z);document.getElementById('v3Bell').onclick=()=>location.href='central.html?tab=notificacoes';document.getElementById('v3Mail').onclick=()=>location.href='central.html?tab=mensagens';document.getElementById('v3UserBtn').onclick=e=>{e.stopPropagation();document.getElementById('v3ProfileMenu').classList.toggle('open')};renderMenu()}
function passModal(){if(document.getElementById('v3PasswordBg'))return;const b=document.createElement('div');b.id='v3PasswordBg';b.className='v3-password-bg';b.innerHTML='<div class="v3-password-box"><h3>Alterar senha</h3><label>Nova senha</label><input id="v3NewPass" type="password" minlength="6"><label>Confirmar nova senha</label><input id="v3ConfirmPass" type="password" minlength="6"><div class="v3-password-actions"><button id="v3PassCancel">Cancelar</button><button class="save" id="v3PassSave">Salvar</button></div></div>';document.body.appendChild(b);document.getElementById('v3PassCancel').onclick=()=>b.classList.remove('open');b.onclick=e=>{if(e.target===b)b.classList.remove('open')};document.getElementById('v3PassSave').onclick=savePassword}
function openPassword(){passModal();document.getElementById('v3ProfileMenu')?.classList.remove('open');document.getElementById('v3PasswordBg').classList.add('open')}
async function savePassword(){const a=document.getElementById('v3NewPass').value,b=document.getElementById('v3ConfirmPass').value;if(a.length<6)return alert('A senha precisa ter pelo menos 6 caracteres.');if(a!==b)return alert('As senhas não coincidem.');const r=await client().from('usuarios').update({senha:a}).eq('id',usuario.id);if(r.error)return alert('Erro: '+r.error.message);document.getElementById('v3PasswordBg').classList.remove('open');alert('Senha alterada com sucesso.')}
function counts(c){const vals=[['v3BellCount',Number(c?.notificacoes||0)],['v3MailCount',Number(c?.mensagens||0)],['v3NavCount',Number(c?.notificacoes||0)+Number(c?.mensagens||0)]];for(const [id,v] of vals){const e=document.getElementById(id);if(!e)continue;e.textContent=v>99?'99+':v;e.classList.toggle('show',v>0)}}
window.addEventListener('v3:contadores',e=>counts(e.detail));document.addEventListener('click',e=>{if(!e.target.closest('#v3UserZone'))document.getElementById('v3ProfileMenu')?.classList.remove('open')});
async function init(){if(!sessao26Iniciar())return;injectCss();hideOld();addNav();await loadProfiles();renderUser();passModal();if(window.Notificacoes26)Notificacoes26.atualizarContadores()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
