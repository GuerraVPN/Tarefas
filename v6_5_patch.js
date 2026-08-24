(function(){
'use strict';

const VERSION='6.5';
const ONLINE_WINDOW_MS=120000;
const HEARTBEAT_MS=30000;
const $=id=>document.getElementById(id);
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let me=null,onlineIds=new Set(),presenceChannel=null,refreshTimer=null,heartbeatTimer=null;
let decorating=false;

function client(){
  try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}
}
function logged(){
  try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}
}
function currentPage(){
  return (location.pathname.split('/').pop()||'dashboard.html')+(location.search||'');
}

function injectStyle(){
  if($('v65GlobalStyle'))return;
  const s=document.createElement('style');
  s.id='v65GlobalStyle';
  s.textContent=`
  .v65-version-badge{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:var(--v4-gold,#eab308);border-radius:999px;padding:4px 8px;font:800 9px/1 Arial;cursor:pointer;margin-top:8px}
  .v65-version-badge:hover{background:rgba(255,255,255,.13)}
  .v65-mobile-version{font:800 9px/1 Arial;color:var(--v4-muted,#6b7280);margin-left:7px}
  .v65-online-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px var(--v4-surface,#fff);vertical-align:middle;margin-left:6px;flex:0 0 9px}
  .v65-online-dot.offline{background:#94a3b8;opacity:.55}
  .user-avatar{position:relative}
  .user-avatar>.v65-online-dot{position:absolute;right:-1px;bottom:1px;margin:0;box-shadow:0 0 0 2px var(--v4-surface,#fff)}
  .v65-nav-extra .v6-nav-icon{font-size:15px;font-weight:900}
  .v65-nav-extra button{font-family:inherit}
  .v65-ready-lock-note{font-size:9px;color:var(--v4-muted,#6b7280);margin-left:6px}
  `;
  document.head.appendChild(s);
}

function renderVersion(){
  const sidebar=document.querySelector('.sidebar');
  if(sidebar&&!sidebar.querySelector('.v65-version-badge')){
    const host=sidebar.querySelector('.credit,.creditos-26pel')||sidebar;
    const b=document.createElement('button');
    b.type='button';b.className='v65-version-badge';b.innerHTML=`● TAREFAS v${VERSION}`;
    b.title='Sobre esta versão';
    b.onclick=()=>location.href='about.html';
    host.appendChild(b);
  }
  const brand=document.querySelector('.v62-mobile-brand');
  if(brand&&!brand.querySelector('.v65-mobile-version')){
    const v=document.createElement('span');v.className='v65-mobile-version';v.textContent=`v${VERSION}`;
    brand.appendChild(v);
  }
}

function navExtra(){
  const list=document.querySelector('.sidebar ul');
  if(!list)return;
  if(!list.querySelector('[data-v65-nav="help"]')){
    const help=document.createElement('li');help.className='v65-nav-extra';help.dataset.v65Nav='help';
    help.innerHTML='<button class="v6-nav-item '+((location.pathname.split('/').pop()||'')==='help.html'?'active':'')+'" data-v65-help><span class="v6-nav-icon">?</span><span class="v6-nav-label">Help / Chamados</span></button>';
    list.appendChild(help);
    help.querySelector('button').onclick=()=>location.href='help.html';
  }
  if(!list.querySelector('[data-v65-nav="about"]')){
    const about=document.createElement('li');about.className='v65-nav-extra';about.dataset.v65Nav='about';
    about.innerHTML='<button class="v6-nav-item '+((location.pathname.split('/').pop()||'')==='about.html'?'active':'')+'" data-v65-about><span class="v6-nav-icon">ⓘ</span><span class="v6-nav-label">About</span></button>';
    list.appendChild(about);
    about.querySelector('button').onclick=()=>location.href='about.html';
  }
}

function readyText(el){
  const t=norm(el?.textContent);
  return t==='pronto'||t==='concluido'||t==='concluida'||t.includes('processo pronto');
}
function lockEditButton(statusId,editId){
  const st=$(statusId),btn=$(editId);if(!st||!btn)return;
  if(readyText(st)){
    btn.hidden=true;
    btn.style.display='none';
    btn.dataset.v65ReadyLocked='1';
    const parent=btn.parentElement;
    if(parent&&!parent.querySelector('.v65-ready-lock-note')){
      const n=document.createElement('span');n.className='v65-ready-lock-note';n.textContent='Edição encerrada';
      parent.appendChild(n);
    }
  }
}
function lockReadyEdits(){
  lockEditButton('dStatus','btnEditGuide');
  lockEditButton('pdStatus','btnEditPedido');
  lockEditButton('mdStatus','btnEditMov');
}
function editClickGuard(e){
  const btn=e.target.closest?.('#btnEditGuide,#btnEditPedido,#btnEditMov');if(!btn)return;
  const map={btnEditGuide:'dStatus',btnEditPedido:'pdStatus',btnEditMov:'mdStatus'};
  if(readyText($(map[btn.id]))){
    e.preventDefault();e.stopImmediatePropagation();
    alert('Este processo já está pronto/concluído. A edição foi encerrada; a opção de excluir permanece disponível.');
  }
}

async function heartbeat(){
  const c=client();me=me||logged();if(!c||!me?.id)return;
  const payload={
    usuario_id:String(me.id),
    perfil_id:me.perfil_id?Number(me.perfil_id):null,
    pagina:currentPage(),
    ultima_atividade:new Date().toISOString()
  };
  try{await c.from('usuarios_presenca').upsert(payload,{onConflict:'usuario_id'})}catch(_){}
}
async function refreshPresence(){
  const c=client();if(!c)return;
  const since=new Date(Date.now()-ONLINE_WINDOW_MS).toISOString();
  try{
    const r=await c.from('usuarios_presenca').select('usuario_id,ultima_atividade').gte('ultima_atividade',since);
    if(r.error)return;
    onlineIds=new Set((r.data||[]).map(x=>String(x.usuario_id)));
    decorateOnline();
    window.dispatchEvent(new CustomEvent('v65:presenca',{detail:{online:[...onlineIds]}}));
  }catch(_){}
}
function isOnline(id){return onlineIds.has(String(id))}
function dot(online=true){
  const s=document.createElement('span');s.className='v65-online-dot'+(online?'':' offline');
  s.title=online?'Online agora':'Offline';return s;
}
function setDot(host,id,absolute=false){
  if(!host||!id)return;
  let d=host.querySelector(':scope > .v65-online-dot');
  if(!isOnline(id)){
    if(d)d.remove();return;
  }
  if(!d){d=dot(true);host.appendChild(d)}
  d.classList.remove('offline');d.title='Online agora';
}

function decorateUsersPage(){
  document.querySelectorAll('.user-row').forEach(row=>{
    const id=row.querySelector('[data-id]')?.dataset.id;
    if(!id)return;
    row.dataset.v65UserId=id;
    setDot(row.querySelector('.user-avatar'),id,true);
  });
  const selected=document.querySelector('.user-row.selected');
  const sid=selected?.dataset.v65UserId||selected?.querySelector('[data-id]')?.dataset.id;
  const to=document.querySelector('.msg-to b');
  if(to&&sid)setDot(to,sid);
}
function decorateCentral(){
  document.querySelectorAll('[data-user]').forEach(el=>{
    const id=el.dataset.user,host=el.querySelector('b,strong')||el;
    setDot(host,id);
  });
  document.querySelectorAll('[data-conv]').forEach(el=>{
    const id=el.dataset.conv,host=el.querySelector('strong')||el;
    setDot(host,id);
  });
  const active=document.querySelector('[data-conv].active');
  const chat=$('chatHead');
  if(active&&chat)setDot(chat,active.dataset.conv);
}
function decorateOnline(){
  if(decorating)return;decorating=true;
  try{decorateUsersPage();decorateCentral()}finally{decorating=false}
}

function setupPresence(){
  me=logged();const c=client();if(!me?.id||!c)return;
  heartbeat();refreshPresence();
  heartbeatTimer=setInterval(heartbeat,HEARTBEAT_MS);
  refreshTimer=setInterval(refreshPresence,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){heartbeat();refreshPresence()}});
  window.addEventListener('focus',()=>{heartbeat();refreshPresence()});
  window.addEventListener('pagehide',()=>{heartbeat()});
  try{
    presenceChannel=c.channel('v65-presenca-'+String(me.id))
      .on('postgres_changes',{event:'*',schema:'public',table:'usuarios_presenca'},()=>refreshPresence())
      .subscribe();
  }catch(_){}
  window.Presenca26={versao:VERSION,isOnline,refresh:refreshPresence};
}

function observe(){
  const mo=new MutationObserver(()=>{
    renderVersion();navExtra();lockReadyEdits();decorateOnline();
  });
  mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
}

function init(){
  injectStyle();
  document.addEventListener('click',editClickGuard,true);
  renderVersion();navExtra();lockReadyEdits();
  setupPresence();decorateOnline();observe();
  setTimeout(()=>{renderVersion();navExtra();lockReadyEdits();decorateOnline()},700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
