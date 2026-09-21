(()=>{
'use strict';

const PATCH_VERSION='2.3.25';
const BASE_VERSION='2.3.25';
const BUILD=272;
const SESSION_KEY='tarefasPushSession17';
const USER_KEY='usuarioLogado';
const ACTIVITY_KEY='sessao26_ultima_atividade';
const UNLOCK_KEY='tarefasSecureUnlocked2325';
const LOCK_KEY='tarefasSecureLockRequired2325';
const PROCESS_SESSION_KEY='tarefasSecureProcessSessionV1';
const PREVIOUS_UNLOCK_KEY='tarefasSecureUnlocked23249';
const PREVIOUS_LOCK_KEY='tarefasSecureLockRequired23249';
const MARK='__TAREFAS_SECURE_ENTRY_2325__';

if(globalThis[MARK])return;
globalThis[MARK]=true;

const page=()=>String(location.pathname.split('/').pop()||'index.html').toLowerCase();
const biometric=()=>window.TarefasNative?.biometric||null;
const client=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}};
const user=()=>{try{return JSON.parse(localStorage.getItem(USER_KEY)||'null')}catch(_){return null}};
const hasSession=()=>String(localStorage.getItem(SESSION_KEY)||'').trim().length>=32;
const isLoginPage=()=>page()==='index.html'||page()==='';
const canceled=e=>/cancel|cancelad|negative|negativ|dismiss|senha/i.test(String(e?.code||'')+' '+String(e?.message||e||''));

let overlay=null;
let bioBusy=false;
let passwordBusy=false;
let currentLockId=0;

function css(){
  if(document.getElementById('tmSecureEntryCss2325'))return;
  const style=document.createElement('style');
  style.id='tmSecureEntryCss2325';
  style.textContent=`
    #tmSecureEntry2325{position:fixed;inset:0;z-index:2147483647;background:rgba(3,10,8,.96);backdrop-filter:blur(18px);display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit}
    #tmSecureEntry2325 *{box-sizing:border-box}
    #tmSecureEntry2325 .tm-sec-card{width:min(430px,100%);border:1px solid rgba(255,255,255,.12);background:#0d1714;border-radius:22px;padding:24px;box-shadow:0 25px 80px rgba(0,0,0,.48);color:#eefbf5}
    #tmSecureEntry2325 .tm-sec-icon{width:58px;height:58px;border-radius:18px;display:grid;place-items:center;background:#113d30;font-size:30px;margin-bottom:17px}
    #tmSecureEntry2325 h2{margin:0;font-size:23px;line-height:1.2;color:#fff}
    #tmSecureEntry2325 .tm-sec-who{margin:7px 0 2px;font-size:13px;color:#a9bdb5}
    #tmSecureEntry2325 .tm-sec-copy{margin:12px 0 18px;font-size:13px;line-height:1.5;color:#b8cbc4}
    #tmSecureEntry2325 .tm-sec-actions{display:grid;gap:9px}
    #tmSecureEntry2325 button{width:100%;border:0;border-radius:12px;padding:13px 14px;font:inherit;font-weight:850;cursor:pointer}
    #tmSecureEntry2325 .tm-sec-bio{background:#10b981;color:#05251a}
    #tmSecureEntry2325 .tm-sec-password-toggle{background:#1d2c27;color:#eaf7f1;border:1px solid rgba(255,255,255,.1)}
    #tmSecureEntry2325 button:disabled{opacity:.55;cursor:wait}
    #tmSecureEntry2325 .tm-sec-password{display:none;margin-top:12px;padding-top:14px;border-top:1px solid rgba(255,255,255,.09)}
    #tmSecureEntry2325 .tm-sec-password.open{display:block}
    #tmSecureEntry2325 label{display:block;font-size:12px;font-weight:800;color:#cfe0d9;margin-bottom:7px}
    #tmSecureEntry2325 input{width:100%;border:1px solid #365248;background:#09110f;color:#fff;border-radius:12px;padding:13px 12px;font:inherit;outline:none}
    #tmSecureEntry2325 input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.13)}
    #tmSecureEntry2325 .tm-sec-submit{margin-top:9px;background:#e8f5ef;color:#09251b}
    #tmSecureEntry2325 .tm-sec-error{min-height:18px;margin:10px 0 0;font-size:12px;line-height:1.4;color:#fca5a5}
    #tmSecureEntry2325 .tm-sec-note{margin:13px 0 0;text-align:center;font-size:10px;line-height:1.45;color:#7f958c}
  `;
  document.head.appendChild(style);
}

function saveSession(token,currentUser){
  localStorage.setItem(SESSION_KEY,String(token));
  if(currentUser?.id){
    localStorage.setItem(USER_KEY,JSON.stringify({
      id:currentUser.id,
      nome_completo:currentUser.nome_completo,
      nome_guerra:currentUser.nome_guerra,
      patente:currentUser.patente,
      secao:currentUser.secao,
      posicao:currentUser.posicao,
      cpf:currentUser.cpf
    }));
  }
  localStorage.setItem(ACTIVITY_KEY,String(Date.now()));
}

function setError(message=''){
  const el=overlay?.querySelector('.tm-sec-error');
  if(el)el.textContent=String(message||'');
}

function unlock(){
  try{
    sessionStorage.setItem(UNLOCK_KEY,'1');
    sessionStorage.removeItem(LOCK_KEY);
    sessionStorage.setItem(PROCESS_SESSION_KEY,'1');
  }catch(_){}
  currentLockId++;
  if(overlay){
    overlay.remove();
    overlay=null;
  }
  document.documentElement.style.removeProperty('overflow');
  document.body?.style.removeProperty('overflow');
  window.dispatchEvent(new CustomEvent('tarefas:secure-unlocked',{detail:{version:PATCH_VERSION,at:Date.now()}}));
}

async function biometricState(){
  const api=biometric();
  if(!api?.isAvailable)return{available:false,hasCredential:false};
  try{return await api.isAvailable()}catch(_){return{available:false,hasCredential:false}}
}

async function tryBiometric(lockId=currentLockId){
  if(!overlay||bioBusy||lockId!==currentLockId)return false;
  const api=biometric(),supabase=client();
  if(!api?.authenticate||!supabase)return false;

  bioBusy=true;
  const btn=overlay.querySelector('.tm-sec-bio');
  if(btn){btn.disabled=true;btn.textContent='Aguardando biometria…'}
  setError('');
  try{
    const state=await biometricState();
    if(!state.available||!state.hasCredential)return false;

    const unlocked=await api.authenticate();
    if(lockId!==currentLockId||!overlay)return false;

    const token=String(unlocked?.sessionToken||'').trim();
    if(token.length<32)throw new Error('Credencial biométrica inválida.');

    const {data,error}=await supabase.rpc('v2_3_21_1_biometric_resume',{p_session_token:token});
    if(error)throw error;
    if(data?.valid!==true||!data?.usuario?.id){
      throw new Error('A sessão biométrica expirou. Use sua senha para entrar.');
    }

    saveSession(token,data.usuario);
    unlock();
    return true;
  }catch(error){
    if(!canceled(error))setError(error?.message||String(error));
    return false;
  }finally{
    bioBusy=false;
    if(btn?.isConnected){btn.disabled=false;btn.textContent='☝ Desbloquear com biometria'}
  }
}

async function passwordUnlock(password,lockId=currentLockId){
  if(!overlay||passwordBusy||lockId!==currentLockId)return;
  const supabase=client(),current=user();
  const cpf=String(current?.cpf||'').replace(/\D/g,'').slice(0,11);
  if(!supabase||cpf.length!==11){
    setError('Não foi possível validar a conta. Entre novamente pelo login.');
    return;
  }
  password=String(password||'');
  if(!password){
    setError('Digite sua senha.');
    return;
  }

  passwordBusy=true;
  const submit=overlay.querySelector('.tm-sec-submit');
  if(submit){submit.disabled=true;submit.textContent='Validando…'}
  setError('');
  try{
    const {data,error}=await supabase.rpc('v7_7_1_autenticar_usuario',{p_cpf:cpf,p_senha:password});
    if(error)throw error;
    if(!data?.usuario?.id||!data?.session_token)throw new Error('Senha inválida.');

    saveSession(data.session_token,data.usuario);
    unlock();
  }catch(error){
    setError(error?.message||'Senha inválida.');
    const input=overlay?.querySelector('#tmSecurePassword2325');
    if(input){input.value='';input.focus()}
  }finally{
    passwordBusy=false;
    if(submit?.isConnected){submit.disabled=false;submit.textContent='Desbloquear'}
  }
}

async function showLock({autoBiometric=true}={}){
  if(isLoginPage()||!hasSession()||!user()?.id)return false;

  // A trava desta versão só existe para quem ativou biometria no TAREFAS.
  // Sem credencial biométrica salva, o app segue normalmente sem pedir senha.
  const state=await biometricState();
  if(!state.available||!state.hasCredential){
    if(overlay){
      overlay.remove();
      overlay=null;
      document.documentElement.style.removeProperty('overflow');
      document.body?.style.removeProperty('overflow');
    }
    try{
      sessionStorage.setItem(UNLOCK_KEY,'1');
      sessionStorage.removeItem(LOCK_KEY);
      sessionStorage.setItem(PROCESS_SESSION_KEY,'1');
    }catch(_){}
    return false;
  }

  if(overlay)return true;

  css();
  try{
    sessionStorage.removeItem(UNLOCK_KEY);
    sessionStorage.setItem(LOCK_KEY,'1');
  }catch(_){}

  currentLockId++;
  const lockId=currentLockId;
  const current=user();
  overlay=document.createElement('div');
  overlay.id='tmSecureEntry2325';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.innerHTML=`
    <div class="tm-sec-card">
      <div class="tm-sec-icon">🔐</div>
      <h2>Desbloquear TAREFAS</h2>
      <div class="tm-sec-who">${String(current?.nome_guerra||current?.nome_completo||'Usuário')}</div>
      <p class="tm-sec-copy">Confirme sua identidade para continuar usando o aplicativo.</p>
      <div class="tm-sec-actions">
        <button type="button" class="tm-sec-bio">☝ Desbloquear com biometria</button>
        <button type="button" class="tm-sec-password-toggle">Usar senha</button>
      </div>
      <form class="tm-sec-password" autocomplete="off">
        <label for="tmSecurePassword2325">Senha da conta</label>
        <input id="tmSecurePassword2325" type="password" autocomplete="current-password" inputmode="text" enterkeyhint="done">
        <button class="tm-sec-submit" type="submit">Desbloquear</button>
      </form>
      <div class="tm-sec-error" aria-live="polite"></div>
      <p class="tm-sec-note">O conteúdo permanece bloqueado até a autenticação ser concluída.</p>
    </div>
  `;
  document.documentElement.appendChild(overlay);
  document.documentElement.style.overflow='hidden';
  if(document.body)document.body.style.overflow='hidden';

  const bioBtn=overlay.querySelector('.tm-sec-bio');
  const passwordToggle=overlay.querySelector('.tm-sec-password-toggle');
  const form=overlay.querySelector('.tm-sec-password');

  if(!overlay||lockId!==currentLockId)return true;

  bioBtn.addEventListener('click',()=>tryBiometric(lockId));
  passwordToggle.addEventListener('click',()=>{
    form.classList.add('open');
    passwordToggle.style.display='none';
    setTimeout(()=>overlay?.querySelector('#tmSecurePassword2325')?.focus(),30);
  });

  form.addEventListener('submit',event=>{
    event.preventDefault();
    passwordUnlock(overlay?.querySelector('#tmSecurePassword2325')?.value,lockId);
  });

  if(autoBiometric&&state.available&&state.hasCredential){
    setTimeout(()=>tryBiometric(lockId),180);
  }
  return true;
}

function migrateCurrentSession(){
  try{
    // Installing this patch over .8 may reload the page inside the same
    // WebView. Preserve that already-unlocked session so patch installation
    // itself does not trigger a new biometric prompt.
    const previousUnlocked=sessionStorage.getItem(PREVIOUS_UNLOCK_KEY)==='1';
    const previousLocked=sessionStorage.getItem(PREVIOUS_LOCK_KEY)==='1';
    if(previousUnlocked&&!previousLocked){
      sessionStorage.setItem(PROCESS_SESSION_KEY,'1');
      sessionStorage.setItem(UNLOCK_KEY,'1');
      sessionStorage.removeItem(LOCK_KEY);
    }
  }catch(_){}
}

function currentAppSessionUnlocked(){
  try{return sessionStorage.getItem(PROCESS_SESSION_KEY)==='1'}catch{return false}
}

function boot(){
  if(isLoginPage()||!hasSession()||!user()?.id)return;

  migrateCurrentSession();

  // Biometria agora é cobrada apenas em um novo ciclo real do app.
  // Ir para segundo plano, apagar a tela, abrir Recentes ou voltar ao app
  // mantém a mesma sessionStorage e não cria nova trava.
  if(!currentAppSessionUnlocked()){
    showLock({autoBiometric:true});
  }

  // Não marcamos LOCK_KEY em visibilitychange/focus/pageshow.
  // Se o Android encerrar completamente a Activity/WebView, a
  // sessionStorage é recriada no próximo início e a biometria volta a ser pedida.
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

globalThis.TarefasSecureEntry2325=Object.freeze({
  version:PATCH_VERSION,
  baseVersion:BASE_VERSION,
  build:BUILD,
  lock:()=>showLock({autoBiometric:true}),
  unlockState:()=>({
    locked:!!overlay,
    sessionUnlocked:sessionStorage.getItem(PROCESS_SESSION_KEY)==='1',
    relockMode:'cold-start-only'
  })
});
})();

;(()=>{
'use strict';

const MARK='__TAREFAS_DOM_LIFECYCLE_FIX_2325__';
if(globalThis[MARK])return;
globalThis[MARK]=true;

const currentPage=()=>String(location.pathname.split('/').pop()||'').toLowerCase();
const page=currentPage();
const currentUser=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};

function knownTransientError(row){
  const msg=String(row?.message||row?.reason||row||'');
  const url=String(row?.page||location.href||'').toLowerCase();
  const usersNull=/cannot read properties of null \(reading ['"]classlist['"]\)/i.test(msg)
    && /usuarios\.html(?:[?#]|$)/i.test(url);
  const dashboardNull=/cannot set properties of null \(setting ['"]textcontent['"]\)/i.test(msg)
    && /dashboard\.html(?:[?#]|$)/i.test(url);
  const configStyleNull=/(cannot (?:read|set) properties of null .*['"]style['"]|cannot read properties of null \(reading ['"]style['"]\))/i.test(msg)
    && /configuracoes\.html(?:[?#]|$)/i.test(url);
  return usersNull||dashboardNull||configStyleNull;
}

function sanitizeAlphaState(value){
  let data=value;
  try{if(typeof data==='string')data=JSON.parse(data)}catch(_){return value}
  if(!data||typeof data!=='object'||!Array.isArray(data.errors))return value;
  const before=data.errors.length;
  data={...data,errors:data.errors.filter(row=>!knownTransientError(row))};
  if(before===data.errors.length)return value;
  return typeof value==='string'?JSON.stringify(data):data;
}

function installErrorStoreSanitizer(){
  const u=currentUser();
  if(!u?.id)return;
  const stateKey='tarefas_alpha_23221_state_'+String(u.id);

  // Limpa apenas os dois registros benignos já existentes.
  try{
    const raw=localStorage.getItem(stateKey);
    if(raw){
      const clean=sanitizeAlphaState(raw);
      if(clean!==raw)localStorage.setItem(stateKey,clean);
    }
  }catch(_){}

  // Impede que os mesmos falsos positivos sejam persistidos novamente.
  if(!globalThis.__TAREFAS_ALPHA_ERROR_STORE_GUARD_2325__){
    globalThis.__TAREFAS_ALPHA_ERROR_STORE_GUARD_2325__=true;
    const nativeSet=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){
      try{
        if(this===localStorage&&String(key)===stateKey){
          value=sanitizeAlphaState(value);
        }
      }catch(_){}
      return nativeSet.call(this,key,value);
    };
  }

  // A Central lê o estado pelo runtime Alpha; filtra a cópia exibida
  // sem apagar outros diagnósticos.
  const alpha=globalThis.TarefasAlpha23221;
  if(alpha?.getState&&!alpha.__domErrorFilter2325){
    const original=alpha.getState.bind(alpha);
    alpha.getState=()=>{
      const state=original();
      return sanitizeAlphaState(state);
    };
    alpha.__domErrorFilter2325=true;
  }

  window.dispatchEvent(new CustomEvent('tarefas:alpha-state',{detail:{source:'patch-2.3.25'}}));
}

function installDomLifecycleGuard(){
  let guardedIds=null,guardedSelectors=new Set();
  if(page==='dashboard.html'){
    guardedIds=new Set(['dashGreeting','dashProfile','dashUpdated','kOpen','kOpenSub','kLate','kUsers','kNotifs','kGuides','kGuidesSub','shortcutGrid','taskBars','budgetCards','recentTasks']);
  }else if(page==='usuarios.html'){
    guardedIds=new Set(['userModal','profilesModal','passwordModal']);
  }else if(page==='configuracoes.html'){
    guardedIds=new Set(['loadingCover','saveStatus','statusText','statusTime','sidebar','menuToggle','miniNome','miniDetalhes','miniAvatar','topAvatar','avatarLarge','nomeCompleto','nomeGuerra','cpf','telefone','email','patente','secaoField','secao','posicao','tema','themePreviews','prefQuadro','prefMinhas','prefCalendario','prefRelatorios','prefUsuarios','prefHint','btnSalvarPerfil','btnSalvarPreferencias','btnAvatar','avatarInput','btnSair']);
    guardedSelectors=new Set(['[data-pref-item="quadro"]','[data-pref-item="minhas"]','[data-pref-item="calendario"]','[data-pref-item="relatorios"]','[data-pref-item="usuarios"]']);
  }else return;

  if(globalThis.__TAREFAS_GET_ELEMENT_GUARD_2325__)return;
  globalThis.__TAREFAS_GET_ELEMENT_GUARD_2325__=true;

  const originalGet=Document.prototype.getElementById;
  const originalQuery=Document.prototype.querySelector;
  const dummies=new Map();
  const dummyFor=(key,tag='div')=>{
    if(!dummies.has(key)){
      const dummy=document.createElement(tag);
      dummy.dataset.tarefasDetachedFallback=String(key);
      dummy.setAttribute('aria-hidden','true');
      dummy.style.display='none';
      dummies.set(key,dummy);
    }
    return dummies.get(key);
  };

  Document.prototype.getElementById=function(id){
    const found=originalGet.call(this,id);
    if(found||this!==document||!guardedIds.has(String(id)))return found;
    const s=String(id);
    let tag='div';
    if(/^(?:tema|patente|secao|posicao)$/i.test(s))tag='select';
    else if(/^(?:nome|cpf|telefone|email|pref|avatarInput)/i.test(s))tag='input';
    else if(/^btn/i.test(s))tag='button';
    else if(/Text|Time|Nome|Detalhes/i.test(s))tag='span';
    const dummy=dummyFor('id:'+s,tag);
    if(tag==='input'&&/^pref/i.test(s))dummy.type='checkbox';
    return dummy;
  };

  Document.prototype.querySelector=function(selector){
    const found=originalQuery.call(this,selector);
    if(found||this!==document||!guardedSelectors.has(String(selector)))return found;
    return dummyFor('selector:'+String(selector),'li');
  };
}

installDomLifecycleGuard();
installErrorStoreSanitizer();

globalThis.TarefasDomLifecycleFix2325=Object.freeze({
  version:'2.3.25',
  page,
  isKnownTransientError:knownTransientError
});
})();

;(()=>{
'use strict';

const MARK='__TAREFAS_FAVORITES_FILTERS_2325__';
if(globalThis[MARK])return;
globalThis[MARK]=true;

const u=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};
const me=u();
if(!me?.id)return;

const Core=globalThis.TarefasAlpha23221Core;
const STATE_KEY='tarefas_alpha_23221_state_'+String(me.id);
const CATALOG_KEY='tarefas_destinations_2325_'+String(me.id);
const RESTORE_KEY='tarefas_restore_state_2325';
const page=()=>String(location.pathname.split('/').pop()||'dashboard.html').toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function readJson(key,fallback){
  try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch(_){return fallback}
}
function getState(){
  const raw=readJson(STATE_KEY,{});
  return Core?.normalizeState?Core.normalizeState(raw):raw;
}
async function saveState(next){
  const state=Core?.normalizeState?Core.normalizeState(next):next;
  state.updatedAt=Date.now();
  localStorage.setItem(STATE_KEY,JSON.stringify(state));

  const current=u();
  if(current?.id){
    const prefs={...(current.preferencias&&typeof current.preferencias==='object'?current.preferencias:{}),
      alpha_2_3_22_1:{...state,errors:(state.errors||[]).slice(-20),downloads:(state.downloads||[]).slice(-30)}
    };
    current.preferencias=prefs;
    localStorage.setItem('usuarioLogado',JSON.stringify(current));
    try{
      if(navigator.onLine!==false&&typeof supabaseClient!=='undefined'){
        await supabaseClient.from('usuarios').update({preferencias:prefs}).eq('id',current.id);
      }
    }catch(_){}
  }
  window.dispatchEvent(new CustomEvent('tarefas:alpha-state',{detail:{source:'patch-2.3.25'}}));
  return state;
}

function cssSelectorFor(el){
  if(!el||el.nodeType!==1)return null;
  if(el.id)return '#'+CSS.escape(el.id);
  if(el.name)return el.tagName.toLowerCase()+'[name="'+CSS.escape(el.name)+'"]';
  for(const a of ['data-filter','data-tab','data-orc-module','data-orc-link','data-cat','data-pedido-cat','data-section','data-view']){
    const v=el.getAttribute?.(a);
    if(v!=null)return '['+a+'="'+CSS.escape(v)+'"]';
  }
  return null;
}

function captureUiState(){
  const controls=[];
  document.querySelectorAll('input,select,textarea').forEach(el=>{
    const type=String(el.type||'').toLowerCase();
    if(['password','file','hidden','button','submit'].includes(type))return;
    if(el.closest('#tmPatchManager,#tmFavPicker2325,#tmSecureEntry23242,#tmSecureEntry2325'))return;
    const selector=cssSelectorFor(el);
    if(!selector)return;
    const rec={selector};
    if(type==='checkbox'||type==='radio')rec.checked=!!el.checked;
    else rec.value=String(el.value??'').slice(0,500);
    controls.push(rec);
  });

  const active=[];
  document.querySelectorAll(
    '[data-tab].active,[data-tab][aria-selected="true"],'+
    '[data-orc-module].active,[data-orc-link].active,'+
    '[data-cat].active,[data-pedido-cat].active,'+
    '[data-section].active,[data-view].active'
  ).forEach(el=>{
    const selector=cssSelectorFor(el);
    if(selector)active.push({selector,text:String(el.textContent||'').trim().slice(0,100)});
  });

  return {controls:controls.slice(0,80),active:active.slice(0,20),capturedAt:Date.now()};
}

function applyUiState(state){
  if(!state||typeof state!=='object')return;
  for(const rec of state.controls||[]){
    const el=document.querySelector(rec.selector);
    if(!el)continue;
    try{
      if('checked'in rec)el.checked=!!rec.checked;
      else if('value'in rec)el.value=rec.value;
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    }catch(_){}
  }
  for(const rec of state.active||[]){
    const el=document.querySelector(rec.selector);
    if(!el)continue;
    try{el.click()}catch(_){}
  }
}

function currentBaseHref(){
  return page()+(location.search||'');
}
function stateSignature(state){
  const parts=(state?.active||[]).map(x=>x.selector).sort();
  if(!parts.length)return'';
  let h=2166136261;
  const s=parts.join('|');
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
  return (h>>>0).toString(36);
}
function currentHrefWithState(){
  const state=captureUiState();
  const base=currentBaseHref();
  if(location.hash&&!location.hash.startsWith('#tmfav-')&&!location.hash.startsWith('#tmflt-'))return base+location.hash;
  const sig=stateSignature(state);
  return sig?base+'#tmfav-'+sig:base;
}
function currentLabel(){
  const title=(document.querySelector('main h1,main h2,.page h1,.page h2')?.textContent||document.title||page()).trim();
  const active=[...document.querySelectorAll(
    '[data-tab].active,[data-tab][aria-selected="true"],[data-orc-module].active,[data-orc-link].active,[data-cat].active,[data-pedido-cat].active'
  )].map(x=>String(x.textContent||'').trim()).filter(Boolean);
  return [...new Set([title,...active])].join(' › ').slice(0,110);
}

const SEEDS=[
  ['Início','dashboard.html','Geral'],
  ['Quadro','menu.html','Tarefas'],
  ['Minhas Tarefas','minhas_tarefas.html','Tarefas'],
  ['Calendário','calendario.html','Tarefas'],
  ['Pessoal / Serviços','pessoal.html','Serviços'],
  ['Missão','missao.html','Serviços'],
  ['Férias e dispensas','ferias_dispensas.html','Serviços'],
  ['Central › Notificações','central.html?tab=notificacoes','Central'],
  ['Central › Mensagens','central.html?tab=mensagens','Central'],
  ['Central › Downloads','central.html?tab=downloads','Central'],
  ['Central › Favoritos','central.html?tab=favoritos','Central'],
  ['Central › Ferramentas','central.html?tab=ferramentas','Central'],
  ['Relatórios','relatorios.html','Geral'],
  ['Usuários','usuarios.html','Administração'],
  ['Configurações','configuracoes.html','Geral'],
  ['Histórico / Auditoria','historico_auditoria.html','Administração'],
  ['Orçamentários › Resumo','orcamentarios.html?modulo=relatorio','Orçamentários'],
  ['Orçamentários › Guias','orcamentarios.html?modulo=guias','Orçamentários'],
  ['Orçamentários › Baixas','orcamentarios.html?modulo=baixas','Orçamentários'],
  ['Orçamentários › Distribuição','orcamentarios.html?modulo=distribuicao','Orçamentários'],
  ['Orçamentários › Movimentação','orcamentarios.html?modulo=movimentacao','Orçamentários'],
  ['Orçamentários › Material Carga','orcamentarios.html?modulo=material_carga','Orçamentários'],
  ['Orçamentários › Passagem de Carga','orcamentarios.html?modulo=passagem_carga','Orçamentários'],
  ['Orçamentários › Lavanderia','orcamentarios.html?modulo=lavanderia','Orçamentários']
].map(([label,href,group])=>({label,href,group,source:'seed'}));

function loadCatalog(){
  const rows=readJson(CATALOG_KEY,[]);
  const map=new Map();
  for(const row of [...SEEDS,...(Array.isArray(rows)?rows:[])]){
    if(!row?.href)return;
    map.set(String(row.href),{label:String(row.label||row.href),href:String(row.href),group:String(row.group||'Outros'),source:row.source||'discovered'});
  }
  return [...map.values()];
}
function persistCatalog(rows){
  const clean=rows.filter(x=>x?.href&&/\.html(?:[?#]|$)/i.test(x.href)).slice(-150);
  localStorage.setItem(CATALOG_KEY,JSON.stringify(clean));
}
function addCandidate(map,label,href,group='Descobertos'){
  href=String(href||'').trim();
  if(!href||/^(?:https?:|mailto:|tel:|javascript:)/i.test(href))return;
  try{
    const url=new URL(href,location.href);
    if(url.origin!==location.origin)return;
    href=(url.pathname.split('/').pop()||page())+url.search+url.hash;
  }catch(_){}
  if(!/\.html(?:[?#]|$)/i.test(href))return;
  if(!map.has(href))map.set(href,{label:String(label||href).trim().slice(0,110),href,group,source:'discovered'});
}
function discoverDestinations(){
  const map=new Map(loadCatalog().map(x=>[x.href,x]));
  addCandidate(map,currentLabel(),currentHrefWithState(),'Visitadas');

  document.querySelectorAll('a[href],[data-url]').forEach(el=>{
    const href=el.getAttribute('href')||el.getAttribute('data-url');
    addCandidate(map,el.textContent||el.title||href,href,'Descobertos');
  });
  document.querySelectorAll('[data-tab]').forEach(el=>{
    const tab=el.getAttribute('data-tab');if(!tab)return;
    const q=new URLSearchParams(location.search);q.set('tab',tab);
    addCandidate(map,(document.title||page())+' › '+String(el.textContent||tab).trim(),page()+'?'+q.toString(),'Abas');
  });
  document.querySelectorAll('[data-orc-module],[data-orc-link]').forEach(el=>{
    const mod=el.getAttribute('data-orc-module')||el.getAttribute('data-orc-link');if(!mod)return;
    addCandidate(map,'Orçamentários › '+String(el.textContent||mod).trim(),'orcamentarios.html?modulo='+encodeURIComponent(mod),'Orçamentários');
  });

  const rows=[...map.values()];
  persistCatalog(rows);
  return rows;
}

function stashRestore(item){
  if(!item?.uiState)return;
  try{
    sessionStorage.setItem(RESTORE_KEY,JSON.stringify({href:item.href,uiState:item.uiState,at:Date.now()}));
  }catch(_){}
}
function restorePending(){
  let pending=null;
  try{
    pending=JSON.parse(sessionStorage.getItem(RESTORE_KEY)||'null');
    if(pending)sessionStorage.removeItem(RESTORE_KEY);
  }catch(_){}
  if(!pending){
    const state=getState();
    const here=currentBaseHref()+location.hash;
    const item=[...(state.favorites||[]),...(state.savedFilters||[])].find(x=>String(x.href||'')===here&&x.uiState);
    if(item)pending={uiState:item.uiState};
  }
  if(!pending?.uiState)return;
  [80,300,800,1500].forEach(ms=>setTimeout(()=>applyUiState(pending.uiState),ms));
}

function addFavorite(item){
  const state=getState();
  state.favorites=Array.isArray(state.favorites)?state.favorites:[];
  if(state.favorites.some(x=>String(x.href)===String(item.href)))return;
  state.favorites.push({
    id:'fav-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),
    label:String(item.label||item.href).slice(0,100),
    href:String(item.href).slice(0,350),
    group:item.group||'Geral',
    uiState:item.uiState||null,
    createdAt:new Date().toISOString()
  });
  state.favorites=state.favorites.slice(-30);
  saveState(state);
}
function removeFavoriteByHref(href){
  const state=getState();
  state.favorites=(state.favorites||[]).filter(x=>String(x.href)!==String(href));
  saveState(state);
}

function saveFilterCurrent(){
  const state=getState();
  state.savedFilters=Array.isArray(state.savedFilters)?state.savedFilters:[];
  const label=prompt('Nome deste filtro:',currentLabel()||('Filtro '+(state.savedFilters.length+1)));
  if(label==null)return;
  const uiState=captureUiState();
  let href=currentBaseHref();
  const sig=stateSignature(uiState);
  if(sig)href+='#tmflt-'+sig;
  state.savedFilters.push({
    id:'flt-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),
    name:String(label||'Filtro').slice(0,100),
    href:String(href).slice(0,350),
    uiState,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  });
  state.savedFilters=state.savedFilters.slice(-30);
  saveState(state);
}

function findFilterByHref(href){
  return (getState().savedFilters||[]).find(x=>String(x.href)===String(href))||null;
}
function replaceFilter(filter){
  const state=getState();
  const row=(state.savedFilters||[]).find(x=>String(x.id)===String(filter.id));
  if(!row)return;
  const uiState=captureUiState();
  let href=currentBaseHref();
  const sig=stateSignature(uiState);
  if(sig)href+='#tmflt-'+sig;
  row.href=href;
  row.uiState=uiState;
  row.updatedAt=new Date().toISOString();
  saveState(state);
}
function renameFilter(filter){
  const name=prompt('Novo nome do filtro:',filter.name||'Filtro');
  if(name==null)return;
  const state=getState();
  const row=(state.savedFilters||[]).find(x=>String(x.id)===String(filter.id));
  if(row){row.name=String(name||'Filtro').slice(0,100);row.updatedAt=new Date().toISOString();saveState(state)}
}
function deleteFilter(filter){
  if(!confirm('Excluir o filtro "'+String(filter.name||'Filtro')+'"?'))return;
  const state=getState();
  state.savedFilters=(state.savedFilters||[]).filter(x=>String(x.id)!==String(filter.id));
  saveState(state);
}

function ensureModalCss(){
  if(document.getElementById('tmFavPickerCss2325'))return;
  const s=document.createElement('style');s.id='tmFavPickerCss2325';s.textContent=`
  #tmFavPicker2325{position:fixed;inset:0;z-index:2147483000;background:rgba(2,6,23,.72);display:flex;align-items:flex-end;justify-content:center;padding-top:40px}
  #tmFavPicker2325 .tmfp-card{width:min(760px,100%);max-height:88vh;background:var(--v4-surface,#0b1114);color:inherit;border-radius:20px 20px 0 0;border:1px solid var(--v4-border,#243244);display:flex;flex-direction:column;overflow:hidden}
  #tmFavPicker2325 header{padding:14px 16px;display:flex;justify-content:space-between;gap:12px;align-items:center;border-bottom:1px solid var(--v4-border,#243244)}
  #tmFavPicker2325 header h3{margin:0;font-size:17px}
  #tmFavPicker2325 header button{border:0;background:transparent;color:inherit;font-size:20px}
  #tmFavPicker2325 .tmfp-body{overflow:auto;padding:10px 14px}
  #tmFavPicker2325 .tmfp-group{margin:12px 0 6px;font-size:11px;font-weight:900;opacity:.7;text-transform:uppercase}
  #tmFavPicker2325 label{display:flex;gap:10px;align-items:flex-start;padding:10px;border:1px solid var(--v4-border,#243244);border-radius:12px;margin-bottom:7px}
  #tmFavPicker2325 label input{margin-top:3px;width:18px;height:18px}
  #tmFavPicker2325 label span{min-width:0}
  #tmFavPicker2325 label strong{display:block;font-size:13px}
  #tmFavPicker2325 label small{display:block;font-size:10px;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #tmFavPicker2325 footer{padding:12px 14px;border-top:1px solid var(--v4-border,#243244);display:flex;gap:8px}
  #tmFavPicker2325 footer button{flex:1;border:0;border-radius:11px;padding:12px;font-weight:900}
  #tmFavPicker2325 .primary{background:#2563eb;color:white}
  #tmFavPicker2325 .secondary{background:var(--v4-surface-3,#182230);color:inherit}
  .tm-filter-manage-2325{display:flex!important;gap:5px!important;flex-wrap:wrap!important;margin-left:6px}
  .tm-filter-manage-2325 button{font-size:10px!important;padding:7px 8px!important}
  `;document.head.appendChild(s);
}

function openFavoritePicker(){
  ensureModalCss();
  document.getElementById('tmFavPicker2325')?.remove();
  const state=getState();
  const favs=new Map((state.favorites||[]).map(x=>[String(x.href),x]));
  const candidates=discoverDestinations();

  const current={label:currentLabel(),href:currentHrefWithState(),group:'Tela atual',source:'current',uiState:captureUiState()};
  const map=new Map(candidates.map(x=>[x.href,x]));map.set(current.href,current);
  const rows=[...map.values()].sort((a,b)=>String(a.group).localeCompare(String(b.group),'pt-BR')||String(a.label).localeCompare(String(b.label),'pt-BR'));

  const modal=document.createElement('div');modal.id='tmFavPicker2325';
  let group='';
  modal.innerHTML='<section class="tmfp-card"><header><h3>⭐ Escolher telas e abas</h3><button type="button" data-close>✕</button></header><div class="tmfp-body">'+
    rows.map(row=>{
      const head=row.group!==group?'<div class="tmfp-group">'+esc(group=row.group)+'</div>':'';
      return head+'<label><input type="checkbox" data-fav-href="'+esc(row.href)+'" '+(favs.has(row.href)?'checked':'')+'><span><strong>'+esc(row.label)+'</strong><small>'+esc(row.href)+'</small></span></label>';
    }).join('')+
    '</div><footer><button type="button" class="secondary" data-current>Adicionar tela atual</button><button type="button" class="primary" data-save>Salvar seleção</button></footer></section>';
  document.body.appendChild(modal);

  modal.addEventListener('click',async e=>{
    if(e.target===modal||e.target.closest('[data-close]')){modal.remove();return}
    if(e.target.closest('[data-current]')){
      addFavorite(current);modal.remove();return;
    }
    if(e.target.closest('[data-save]')){
      const selected=new Set([...modal.querySelectorAll('[data-fav-href]:checked')].map(x=>x.dataset.favHref));
      let next=getState();
      next.favorites=Array.isArray(next.favorites)?next.favorites:[];
      const candidateSet=new Set(rows.map(x=>x.href));
      next.favorites=next.favorites.filter(x=>!candidateSet.has(String(x.href))||selected.has(String(x.href)));
      for(const row of rows){
        if(!selected.has(row.href)||next.favorites.some(x=>String(x.href)===String(row.href)))continue;
        next.favorites.push({
          id:'fav-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
          label:row.label,
          href:row.href,
          group:row.group,
          uiState:row.source==='current'?current.uiState:null,
          createdAt:new Date().toISOString()
        });
      }
      next.favorites=next.favorites.slice(-30);
      await saveState(next);
      modal.remove();
    }
  });
}

function enhanceCentral(){
  if(page()!=='central.html')return;

  const favButton=document.querySelector('[data-add-fav]');
  if(favButton&&!favButton.dataset.v2325){
    favButton.dataset.v2325='1';
    favButton.textContent='Escolher telas e abas';
  }

  document.querySelectorAll('[data-open-filter]').forEach(open=>{
    const row=open.closest('.a23221-tab-row');
    if(!row||row.querySelector('.tm-filter-manage-2325'))return;
    const filter=findFilterByHref(open.dataset.openFilter);
    if(!filter)return;
    const box=document.createElement('div');box.className='tm-filter-manage-2325';
    box.innerHTML='<button type="button" data-fm="rename">Renomear</button><button type="button" data-fm="replace">Substituir</button><button type="button" data-fm="delete">Excluir</button>';
    row.querySelector('.a23221-tab-actions')?.appendChild(box);
    box.addEventListener('click',e=>{
      const act=e.target.closest('[data-fm]')?.dataset.fm;
      if(act==='rename')renameFilter(filter);
      if(act==='replace')replaceFilter(filter);
      if(act==='delete')deleteFilter(filter);
    });
  });
}

document.addEventListener('click',e=>{
  const fav=e.target.closest?.('[data-add-fav]');
  if(fav){
    e.preventDefault();e.stopImmediatePropagation();openFavoritePicker();return;
  }
  const sf=e.target.closest?.('[data-save-filter]');
  if(sf){
    e.preventDefault();e.stopImmediatePropagation();saveFilterCurrent();return;
  }
  const of=e.target.closest?.('[data-open-filter]');
  if(of){
    const filter=findFilterByHref(of.dataset.openFilter);
    if(filter?.uiState){
      e.preventDefault();e.stopImmediatePropagation();stashRestore(filter);location.href=filter.href;return;
    }
  }
  const favOpen=e.target.closest?.('[data-open-fav]');
  if(favOpen){
    const item=(getState().favorites||[]).find(x=>String(x.href)===String(favOpen.dataset.openFav));
    if(item?.uiState){
      e.preventDefault();e.stopImmediatePropagation();stashRestore(item);location.href=item.href;return;
    }
  }
},true);

function boot(){
  discoverDestinations();
  restorePending();
  enhanceCentral();
  const obs=new MutationObserver(()=>enhanceCentral());
  obs.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',()=>{discoverDestinations();enhanceCentral()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

globalThis.TarefasFavoritesFilters2325=Object.freeze({
  version:'2.3.25',
  discover:discoverDestinations,
  capture:captureUiState,
  openPicker:openFavoritePicker,
  saveFilter:saveFilterCurrent
});
})();

;(()=>{
'use strict';

const MARK='__TAREFAS_AI_SYNC_FILTERS_2325__';
if(globalThis[MARK])return;
globalThis[MARK]=true;

const VERSION='2.3.25';
const AI_ENDPOINT='https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/tarefas-ai';
const AI_FILE_ENDPOINT='https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/tarefas-ai-files';
const page=()=>String(location.pathname.split('/').pop()||'').toLowerCase();

function installPreconnect(){
  for(const rel of ['preconnect','dns-prefetch']){
    if(document.querySelector('link[data-ai-preconnect="'+rel+'"]'))continue;
    const l=document.createElement('link');
    l.rel=rel;
    l.href='https://bpvijatnsluwsgnzklrd.supabase.co';
    l.dataset.aiPreconnect=rel;
    document.head.appendChild(l);
  }
}

function installAiFetchOptimizer(){
  if(globalThis.__TAREFAS_AI_FETCH_OPT_2325__||!globalThis.fetch)return;
  globalThis.__TAREFAS_AI_FETCH_OPT_2325__=true;
  const nativeFetch=globalThis.fetch.bind(globalThis);

  globalThis.fetch=async(input,init)=>{
    try{
      const href=typeof input==='string'?input:input?.url;
      if((href===AI_ENDPOINT||href===AI_FILE_ENDPOINT)&&String(init?.method||'GET').toUpperCase()==='POST'&&init?.body){
        const body=JSON.parse(String(init.body));
        if(Array.isArray(body.history)){
          // Mantém contexto recente suficiente, mas evita enviar conversas muito grandes
          // a cada pergunta. Isso reduz upload e tokens de contexto do provedor.
          body.history=body.history.slice(-6).map(m=>({
            role:m?.role==='model'?'model':'user',
            text:String(m?.text||'').slice(0,2500)
          }));
        }
        init={
          ...(init||{}),
          body:JSON.stringify(body),
          cache:'no-store',
          priority:'high'
        };
      }
    }catch(_){}
    return nativeFetch(input,init);
  };
}

function effectiveVersion(){
  return String(globalThis.__TAREFAS_EFFECTIVE_VERSION__||document.documentElement.dataset.tarefasEffectiveVersion||VERSION);
}
function fixAiVersion(){
  const el=document.querySelector('.ai230-title span');
  if(!el)return;
  const wanted='BETA '+effectiveVersion()+' • leitura + ações + anexos + arquivos';
  if(el.textContent!==wanted)el.textContent=wanted;
}
function installAiVersionObserver(){
  fixAiVersion();
  const obs=new MutationObserver(fixAiVersion);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',fixAiVersion);
}

function installTypingTimer(){
  if(globalThis.__TAREFAS_AI_TIMER_2325__)return;
  globalThis.__TAREFAS_AI_TIMER_2325__=true;
  const starts=new WeakMap();

  setInterval(()=>{
    document.querySelectorAll('.ai230-typing').forEach(el=>{
      if(!starts.has(el))starts.set(el,Date.now());
      const sec=Math.max(0,Math.floor((Date.now()-starts.get(el))/1000));
      const hasFile=/analisando/i.test(el.textContent||'');
      const base=hasFile?'Analisando anexos':'Pensando';
      el.textContent=base+'… '+sec+'s';
    });
  },1000);
}

function installQueueRecovery(){
  if(globalThis.__TAREFAS_QUEUE_RECOVERY_2325__)return;
  globalThis.__TAREFAS_QUEUE_RECOVERY_2325__=true;

  let timer=null,running=false,retries=0;
  const schedule=(delay=500)=>{
    clearTimeout(timer);
    timer=setTimeout(run,delay);
  };
  const run=async()=>{
    if(running||navigator.onLine===false)return;
    const api=globalThis.TarefasAlpha23221;
    const queue=api?.getQueue?.()||[];
    if(!queue.length){retries=0;return}
    if(!api?.flushQueue)return;

    running=true;
    try{
      await api.flushQueue();
      const left=api.getQueue?.()||[];
      if(left.length){
        retries=Math.min(retries+1,4);
        schedule([1500,4000,10000,30000,60000][retries]||60000);
      }else retries=0;
    }catch(_){
      retries=Math.min(retries+1,4);
      schedule([1500,4000,10000,30000,60000][retries]||60000);
    }finally{
      running=false;
    }
  };

  window.addEventListener('online',()=>{retries=0;schedule(800)});
  window.addEventListener('focus',()=>{if(navigator.onLine!==false)schedule(500)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&navigator.onLine!==false)schedule(500)});
  try{navigator.connection?.addEventListener?.('change',()=>{if(navigator.onLine!==false)schedule(1000)})}catch(_){}
  setInterval(()=>{if(navigator.onLine!==false)schedule(100)},30000);
  schedule(1200);
}

function installAdvancedTaskFilters(){
  if(!['menu.html','minhas_tarefas.html'].includes(page()))return;

  const search=document.getElementById('buscaTarefa');
  const section=document.getElementById('filtroSecao');
  const actions=document.querySelector('.header-actions');
  if(!actions||!section||document.getElementById('tmTaskStatusFilter2325'))return;

  const status=document.createElement('select');
  status.id='tmTaskStatusFilter2325';
  status.className=section.className||'select-secao';
  status.setAttribute('aria-label','Filtrar tarefas por status');
  status.innerHTML=
    '<option value="todas">Todos os status</option>'+
    '<option value="pendente">Pendentes</option>'+
    '<option value="andamento">Em andamento</option>'+
    '<option value="concluida">Concluídas</option>';

  const clear=document.createElement('button');
  clear.type='button';
  clear.id='tmTaskClearFilters2325';
  clear.className='btn-nova-tarefa';
  clear.textContent='Limpar filtros';
  clear.style.cssText='background:var(--v4-surface-3,#172033);color:inherit;white-space:nowrap';

  section.insertAdjacentElement('afterend',status);
  status.insertAdjacentElement('afterend',clear);

  const apply=()=>{
    const value=status.value;
    const map={
      pendente:'.col-pendente',
      andamento:'.col-andamento',
      concluida:'.col-concluida'
    };
    document.querySelectorAll('.kanban-column').forEach(col=>{
      const show=value==='todas'||Object.entries(map).some(([k,sel])=>k===value&&col.matches(sel));
      col.style.display=show?'':'none';
    });
    document.documentElement.dataset.tarefasTaskStatusFilter=value;
  };

  status.addEventListener('change',apply);
  clear.addEventListener('click',()=>{
    if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}))}
    section.value='Todas';
    section.dispatchEvent(new Event('change',{bubbles:true}));
    status.value='todas';
    apply();
  });

  // A 2.3.25.4 captura inputs/selects com ID, então este novo status
  // entra automaticamente nos filtros salvos junto com seção e busca.
  apply();
}

function installPreventiveUiApi(){
  // API comum para os próximos módulos; evita repetir acesso direto a DOM nulo.
  if(globalThis.TarefasUiSafe2325)return;
  const get=id=>document.getElementById(id);
  globalThis.TarefasUiSafe2325=Object.freeze({
    get,
    text:(id,value)=>{const el=get(id);if(el)el.textContent=String(value??'');return !!el},
    html:(id,value)=>{const el=get(id);if(el)el.innerHTML=String(value??'');return !!el},
    addClass:(id,name)=>{const el=get(id);if(el)el.classList.add(name);return !!el},
    removeClass:(id,name)=>{const el=get(id);if(el)el.classList.remove(name);return !!el},
    value:(id,value)=>{const el=get(id);if(!el)return false;el.value=value??'';return true}
  });
}

function boot(){
  installPreconnect();
  installAiFetchOptimizer();
  installAiVersionObserver();
  installTypingTimer();
  installQueueRecovery();
  installAdvancedTaskFilters();
  installPreventiveUiApi();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

globalThis.TarefasPatch2325=Object.freeze({
  version:VERSION,
  aiOptimized:true,
  queueRecovery:true,
  advancedTaskFilters:true,
  uiSafe:true
});
})();

;(()=>{
'use strict';

const MARK='__TAREFAS_VERSION_AUTO_SYNC_2325__';
if(globalThis[MARK])return;
globalThis[MARK]=true;

const VERSION='2.3.25';
const BASE_VERSION='2.3.25';
const BASE_BUILD=272;
const SESSION_KEY='tarefasPushSession17';
const SNAPSHOT_KEY='tarefasVersionSnapshot2325';
const INTERVAL=5*60*1000;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const token=()=>String(localStorage.getItem(SESSION_KEY)||'').trim();
const client=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}};
const effectiveVersion=()=>String(globalThis.__TAREFAS_EFFECTIVE_VERSION__||document.documentElement.dataset.tarefasEffectiveVersion||VERSION);
const compareVersions=(a,b)=>{
  const aa=String(a||'').split('.').map(n=>Number(n)||0),bb=String(b||'').split('.').map(n=>Number(n)||0),n=Math.max(aa.length,bb.length);
  for(let i=0;i<n;i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d}
  return 0;
};

function readSnapshot(){
  try{return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'null')}catch(_){return null}
}
function saveSnapshot(data){
  try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(data))}catch(_){}
}
function fmtTime(iso){
  if(!iso)return'—';
  try{return new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date(iso))}catch(_){return'—'}
}

async function alphaAutoEnabled(){
  const c=client(),t=token();
  if(!c||!t)return false;
  try{
    const {data,error}=await c.rpc('v2_3_21_alpha_context',{p_session_token:t});
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;
    return row?.eligible===true&&row?.receive_alpha===true;
  }catch(_){return false}
}

async function latestPatch(){
  if(!(await alphaAutoEnabled()))return{__alphaDisabled:true};
  try{
    const manager=globalThis.TarefasPatchManager;
    const catalog=manager?.checkCatalog?await manager.checkCatalog():null;
    if(catalog){
      const rows=(catalog.patches||[])
        .filter(p=>String(p.baseVersion||'')===BASE_VERSION)
        .filter(p=>BASE_BUILD>=Number(p.minBuild||0)&&BASE_BUILD<=Number(p.maxBuild??Number.MAX_SAFE_INTEGER))
        .filter(p=>p.installable!==false)
        .sort((a,b)=>compareVersions(b.id,a.id));
      return rows[0]||null;
    }
  }catch(_){}

  try{
    const url='https://api.github.com/repos/GuerraVPN/Tarefas/contents/patches/catalog-v1.json?ref='+encodeURIComponent('app/releases')+'&cb='+Date.now();
    const r=await fetch(url,{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
    if(!r.ok)return null;
    const meta=await r.json();
    if(meta?.encoding!=='base64'||!meta?.content)return null;
    const bin=atob(String(meta.content).replace(/\s+/g,''));
    const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
    const c=JSON.parse(new TextDecoder('utf-8').decode(bytes));
    const rows=(c.patches||[])
      .filter(p=>String(p.baseVersion||'')===BASE_VERSION)
      .filter(p=>BASE_BUILD>=Number(p.minBuild||0)&&BASE_BUILD<=Number(p.maxBuild??Number.MAX_SAFE_INTEGER))
      .filter(p=>p.installable!==false)
      .sort((a,b)=>compareVersions(b.id,a.id));
    return rows[0]||null;
  }catch(_){return null}
}

async function latestApk(){
  const c=client(),t=token();
  if(!c||!t)return null;
  try{
    const {data,error}=await c.rpc('v1_8_latest_app_version',{p_session_token:t});
    if(error)throw error;
    return Array.isArray(data)?data[0]||null:data||null;
  }catch(_){return null}
}

async function syncVersions({paint=true}={}){
  const startedAt=new Date().toISOString();
  const [patch,apk]=await Promise.all([latestPatch(),latestApk()]);
  const previous=readSnapshot()||{};
  const patchAutoEnabled=patch?.__alphaDisabled!==true;
  const snapshot={
    patchAutoEnabled,
    syncedAt:new Date().toISOString(),
    startedAt,
    installed:{
      apkVersion:BASE_VERSION,
      apkBuild:BASE_BUILD,
      patchVersion:effectiveVersion()
    },
    latest:{
      patch:!patchAutoEnabled?null:patch?{
        id:String(patch.id||''),
        name:String(patch.name||''),
        channel:String(patch.channel||'alpha'),
        publishedAt:patch.publishedAt||null
      }:previous?.latest?.patch||null,
      apk:apk?{
        version:String(apk.version_name||''),
        build:Number(apk.build||0),
        channel:String(apk.channel||'official'),
        title:String(apk.title||'')
      }:previous?.latest?.apk||null
    }
  };
  saveSnapshot(snapshot);
  window.dispatchEvent(new CustomEvent('tarefas:versions-synced',{detail:snapshot}));
  try{
    document.documentElement.dataset.tarefasEffectiveVersion=effectiveVersion();
    document.querySelectorAll('.tm-app-brand small').forEach(el=>{
      const web=el.textContent.match(/WEB\s*([0-9.]+)/i)?.[1]||'7.8.2';
      const wanted=effectiveVersion()+' • WEB '+web;
      if(el.textContent.trim()!==wanted)el.textContent=wanted;
    });
  }catch(_){}
  if(paint)renderSnapshot(snapshot);
  return snapshot;
}

function ensureCss(){
  if(document.getElementById('tmVersionSyncCss2325'))return;
  const s=document.createElement('style');
  s.id='tmVersionSyncCss2325';
  s.textContent=`
  .tm-version-sync-2325{margin:14px 0;padding:14px;border:1px solid var(--v4-border,#263244);border-radius:16px;background:var(--v4-surface,#0b1114);color:inherit}
  .tm-version-sync-2325 .tmvs-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}
  .tm-version-sync-2325 .tmvs-head strong{display:block;font-size:15px}
  .tm-version-sync-2325 .tmvs-head small{display:block;font-size:10px;opacity:.65;margin-top:3px}
  .tm-version-sync-2325 .tmvs-badge{font-size:10px;font-weight:900;border-radius:999px;padding:5px 8px;background:var(--v4-surface-3,#162131)}
  .tm-version-sync-2325 .tmvs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .tm-version-sync-2325 .tmvs-item{border:1px solid var(--v4-border,#263244);border-radius:12px;padding:10px;background:var(--v4-surface-2,#0f171b)}
  .tm-version-sync-2325 .tmvs-item small{display:block;font-size:9px;opacity:.62;margin-bottom:3px}
  .tm-version-sync-2325 .tmvs-item strong{display:block;font-size:13px}
  .tm-version-sync-2325 .tmvs-item span{display:block;font-size:10px;opacity:.72;margin-top:3px}
  .tm-version-sync-2325 .tmvs-new{color:#22c55e}
  .tm-version-sync-2325 .tmvs-foot{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:10px;font-size:10px;opacity:.7}
  .tm-version-sync-2325 button{border:1px solid var(--v4-border,#263244);background:var(--v4-surface-3,#162131);color:inherit;border-radius:9px;padding:7px 9px;font-size:10px;font-weight:850}
  @media(max-width:500px){.tm-version-sync-2325 .tmvs-grid{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(s);
}

function renderSnapshot(snapshot=readSnapshot()){
  const root=document.getElementById('tmAppUpdates');
  if(!root||!snapshot)return false;
  ensureCss();

  let box=document.getElementById('tmVersionSync2325');
  if(!box){
    box=document.createElement('section');
    box.id='tmVersionSync2325';
    box.className='tm-version-sync-2325';

    const main=root.querySelector('.tm-update-main');
    const patchManager=document.getElementById('tmPatchManager');
    if(patchManager)patchManager.insertAdjacentElement('beforebegin',box);
    else if(main)main.insertAdjacentElement('afterend',box);
    else root.prepend(box);
  }

  const patchInstalled=String(snapshot.installed?.patchVersion||VERSION);
  const patchLatest=snapshot.patchAutoEnabled===false?'Alpha desativado':String(snapshot.latest?.patch?.id||'Não consultado');
  const apkInstalled=String(snapshot.installed?.apkVersion||BASE_VERSION);
  const apkLatest=String(snapshot.latest?.apk?.version||'Não consultado');
  const patchNew=snapshot.patchAutoEnabled!==false&&snapshot.latest?.patch?.id&&compareVersions(patchLatest,patchInstalled)>0;
  const apkNew=Number(snapshot.latest?.apk?.build||0)>Number(snapshot.installed?.apkBuild||BASE_BUILD);

  const fingerprint=JSON.stringify({
    apkInstalled,apkLatest,patchInstalled,patchLatest,
    apkBuild:snapshot.installed?.apkBuild||BASE_BUILD,
    latestApkBuild:snapshot.latest?.apk?.build||0,
    apkChannel:snapshot.latest?.apk?.channel||'',
    patchChannel:snapshot.latest?.patch?.channel||'',
    syncedAt:snapshot.syncedAt||''
  });
  if(box.dataset.renderFingerprint===fingerprint)return true;
  box.dataset.renderFingerprint=fingerprint;

  box.innerHTML=`
    <div class="tmvs-head">
      <div><strong>🔄 Sincronização automática de versões</strong><small>Consulta somente informações. Nenhuma atualização é instalada automaticamente.</small></div>
      <span class="tmvs-badge">AUTO</span>
    </div>
    <div class="tmvs-grid">
      <div class="tmvs-item"><small>APK instalado</small><strong>${esc(apkInstalled)}</strong><span>Build ${esc(snapshot.installed?.apkBuild||BASE_BUILD)}</span></div>
      <div class="tmvs-item"><small>APK mais recente</small><strong class="${apkNew?'tmvs-new':''}">${esc(apkLatest)}</strong><span>${snapshot.latest?.apk?'Build '+esc(snapshot.latest.apk.build)+' • '+esc(String(snapshot.latest.apk.channel||'').toUpperCase()):'Aguardando consulta'}</span></div>
      <div class="tmvs-item"><small>Patch aplicado</small><strong>${esc(patchInstalled)}</strong><span>Base ${esc(BASE_VERSION)}</span></div>
      <div class="tmvs-item"><small>Patch mais recente</small><strong class="${patchNew?'tmvs-new':''}">${esc(patchLatest)}</strong><span>${snapshot.latest?.patch?esc(String(snapshot.latest.patch.channel||'alpha').toUpperCase()):'Aguardando consulta'}</span></div>
    </div>
    <div class="tmvs-foot"><span>Última sincronização: ${esc(fmtTime(snapshot.syncedAt))}</span><button type="button" data-sync-now>Sincronizar agora</button></div>
  `;
  box.querySelector('[data-sync-now]')?.addEventListener('click',async e=>{
    const btn=e.currentTarget;
    btn.disabled=true;btn.textContent='Sincronizando…';
    try{await syncVersions({paint:true})}finally{btn.disabled=false;btn.textContent='Sincronizar agora'}
  });
  return true;
}

function installUiWatcher(){
  let rootSeen=!!document.getElementById('tmAppUpdates');
  let syncBoxSeen=!!document.getElementById('tmVersionSync2325');
  let scheduled=false;

  const refreshIfNeeded=()=>{
    scheduled=false;
    const rootNow=!!document.getElementById('tmAppUpdates');
    const boxNow=!!document.getElementById('tmVersionSync2325');

    // Só redesenha quando a área de Atualizações nasceu/reapareceu
    // ou quando o painel de sincronização foi removido externamente.
    if(rootNow && (!rootSeen || (syncBoxSeen && !boxNow))){
      renderSnapshot();
    }else if(rootNow && !boxNow && !syncBoxSeen){
      renderSnapshot();
    }

    rootSeen=rootNow;
    syncBoxSeen=!!document.getElementById('tmVersionSync2325');
  };

  const schedule=()=>{
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(refreshIfNeeded);
  };

  if(rootSeen)renderSnapshot();

  const obs=new MutationObserver(mutations=>{
    for(const m of mutations){
      if(m.type!=='childList')continue;

      // Ignora alterações feitas dentro do próprio painel para evitar
      // MutationObserver -> render -> MutationObserver -> render.
      if(m.target instanceof Element && m.target.closest?.('#tmVersionSync2325'))continue;

      let relevant=false;
      for(const node of [...m.addedNodes,...m.removedNodes]){
        if(!(node instanceof Element))continue;
        if(
          node.id==='tmAppUpdates' ||
          node.id==='tmVersionSync2325' ||
          node.querySelector?.('#tmAppUpdates,#tmVersionSync2325')
        ){
          relevant=true;
          break;
        }
      }
      if(relevant){schedule();break}
    }
  });

  obs.observe(document.documentElement,{childList:true,subtree:true});
}

function installAutoSync(){
  let running=null;
  const run=()=>{
    if(running)return running;
    running=syncVersions({paint:true}).catch(()=>null).finally(()=>{running=null});
    return running;
  };

  queueMicrotask(run);
  window.addEventListener('online',run);
  window.addEventListener('focus',run);
  window.addEventListener('pageshow',run);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});
  setInterval(()=>{if(!document.hidden&&navigator.onLine!==false)run()},INTERVAL);

  globalThis.TarefasVersionAutoSync2325=Object.freeze({
    version:VERSION,
    sync:run,
    snapshot:readSnapshot,
    intervalMs:INTERVAL
  });
}

function boot(){
  installUiWatcher();
  installAutoSync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
;(()=>{
'use strict';
const MARK='__TAREFAS_PRERELEASE_HARDENING_2325__';
if(globalThis[MARK])return;globalThis[MARK]=true;
const VERSION='2.3.25';
const currentUser=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};
const stateKey=()=>{const u=currentUser();return u?.id!=null?'tarefas_alpha_23221_state_'+String(u.id):null};
const readState=()=>{const k=stateKey();if(!k)return null;try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
const versionsMuted=()=>{const s=readState();return Array.isArray(s?.mutedCategories)&&s.mutedCategories.includes('versoes')};

function installVersionMuteGuard(){
  const api=window.TarefasNative?.notifications;
  if(!api?.notify||api.__v2325MuteWrapped)return;
  const original=api.notify.bind(api);
  try{
    api.notify=async payload=>{
      const title=String(payload?.title||'');
      const type=String(payload?.extra?.tipo||payload?.type||'').toLowerCase();
      const versionLike=type==='app_patch'||type==='app_update'||/(?:patch|atualiza(?:ção|cao)|nova versão|nova versao)/i.test(title);
      if(versionLike&&versionsMuted())return{ok:true,muted:true,category:'versoes'};
      return original(payload);
    };
    api.__v2325MuteWrapped=true;
  }catch(_){}
}

function normalizeSavedFilterScopes(){
  const k=stateKey(),s=readState();if(!k||!s||!Array.isArray(s.savedFilters))return false;
  let changed=false;
  for(const row of s.savedFilters){
    if(!row?.href)continue;
    const href=String(row.href).split('#')[0];
    let scope='';
    try{
      const u=new URL(href,location.href);
      const p=u.pathname.split('/').pop()||'';
      const sub=u.searchParams.get('modulo')||u.searchParams.get('tab')||u.searchParams.get('view')||u.searchParams.get('section')||'';
      scope=p+(sub?'::'+sub:'');
    }catch(_){scope=href}
    if(row.scopeKey!==scope){row.scopeKey=scope;changed=true}
  }
  if(changed){s.updatedAt=Date.now();localStorage.setItem(k,JSON.stringify(s));window.dispatchEvent(new CustomEvent('tarefas:alpha-state',{detail:{source:'patch-2.3.25-filter-scope'}}))}
  return changed;
}

function installLifecycleToken(){
  if(globalThis.TarefasPageLifecycle2325)return;
  let generation=1,active=true;
  const retire=()=>{active=false;generation++};
  const revive=()=>{active=true;generation++};
  window.addEventListener('pagehide',retire);
  window.addEventListener('pageshow',revive);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)generation++});
  globalThis.TarefasPageLifecycle2325=Object.freeze({
    version:VERSION,
    token:()=>generation,
    isActive:t=>active&&t===generation,
    guard:async(promise,t=generation)=>{
      const value=await promise;
      if(!active||t!==generation){const e=new Error('Resposta assíncrona obsoleta descartada.');e.code='TAREFAS_STALE_ASYNC';throw e}
      return value;
    }
  });
}

function diagnostics(){
  const alpha=globalThis.TarefasAlpha23221;
  const state=readState()||{};
  const queue=alpha?.getQueue?.()||[];
  const snapshot=globalThis.TarefasVersionAutoSync2325?.snapshot?.()||null;
  return{
    version:VERSION,
    domGuard:!!globalThis.__TAREFAS_GET_ELEMENT_GUARD_2325__,
    queue:{count:queue.length,sequential:true,failed:queue.filter(x=>x.status==='failed').length},
    notifications:{versionsMuted:versionsMuted()},
    savedFilters:{count:(state.savedFilters||[]).length,scoped:(state.savedFilters||[]).filter(x=>x.scopeKey).length},
    favorites:{count:(state.favorites||[]).length},
    versionSync:{available:!!globalThis.TarefasVersionAutoSync2325,lastSync:snapshot?.syncedAt||null}
  };
}

function boot(){
  installVersionMuteGuard();
  normalizeSavedFilterScopes();
  installLifecycleToken();
  globalThis.TarefasPreRelease2325=Object.freeze({version:VERSION,diagnostics,versionsMuted});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
;(()=>{
'use strict';
const MARK='__TAREFAS_BIOMETRIC_COLD_START_2325__';
if(globalThis[MARK])return;globalThis[MARK]=true;
globalThis.TarefasBiometricColdStart2325=Object.freeze({
  version:'2.3.25',
  mode:'cold-start-only',
  processSessionKey:'tarefasSecureProcessSessionV1',
  unlocked:()=>{try{return sessionStorage.getItem('tarefasSecureProcessSessionV1')==='1'}catch{return false}}
});
})();
;globalThis.__TAREFAS_BETA_2325_CONSOLIDATED__=Object.freeze({version:'2.3.25',build:272,channel:'beta',consolidates:['2.3.24.1','2.3.24.2','2.3.24.3','2.3.24.4','2.3.24.5','2.3.24.6','2.3.24.7','2.3.24.8','2.3.24.9'],alphaAutoPatchCheck:true});
