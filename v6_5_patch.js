(function(){
'use strict';
if(window.__TAREFAS_V65_PATCH__)return;
window.__TAREFAS_V65_PATCH__=true;

const VERSION='6.5';
const DISPLAY_VERSION='7.7.1';
const ONLINE_WINDOW_MS=120000;
const HEARTBEAT_MS=60000;
const PRESENCE_REFRESH_MS=60000;
const UI_REFRESH_MS=5000;
const $=id=>document.getElementById(id);
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
let me=null,onlineIds=new Set(),refreshTimer=null,heartbeatTimer=null,uiTimer=null,lastHeartbeat=0;
let decorating=false;

function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function logged(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function file(){return (location.pathname.split('/').pop()||'dashboard.html').toLowerCase()}
function currentPage(){return file()+(location.search||'')}
function presenceVisualPage(){return file()==='usuarios.html'||file()==='central.html'}

function injectStyle(){
  if($('v65GlobalStyle'))return;
  const s=document.createElement('style');s.id='v65GlobalStyle';s.textContent=`
  .v65-version-badge{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:var(--v4-gold,#eab308);border-radius:999px;padding:4px 8px;font:800 9px/1 Arial;cursor:pointer;margin-top:8px}
  .v65-version-badge:hover{background:rgba(255,255,255,.13)}
  .v65-mobile-version{font:800 9px/1 Arial;color:var(--v4-muted,#6b7280);margin-left:7px}
  .v65-online-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px var(--v4-surface,#fff);vertical-align:middle;margin-left:6px;flex:0 0 9px}
  .user-avatar{position:relative}.user-avatar>.v65-online-dot{position:absolute;right:-1px;bottom:1px;margin:0;box-shadow:0 0 0 2px var(--v4-surface,#fff)}
  .v65-nav-extra .v6-nav-icon{font-size:15px;font-weight:900}.v65-nav-extra button{font-family:inherit}
  .v65-ready-lock-note{font-size:9px;color:var(--v4-muted,#6b7280);margin-left:6px}`;
  document.head.appendChild(s);
}
function renderVersion(){
  const sidebar=document.querySelector('.sidebar');
  if(sidebar&&!sidebar.querySelector('.v65-version-badge')){
    const host=sidebar.querySelector('.credit,.creditos-26pel')||sidebar;
    const b=document.createElement('button');b.type='button';b.className='v65-version-badge';b.innerHTML=`● TAREFAS v${DISPLAY_VERSION}`;
    b.title='Sobre esta versão';b.onclick=()=>location.assign(new URL('about.html',location.href).href);host.appendChild(b);
  }
  const brand=document.querySelector('.v62-mobile-brand');
  if(brand&&!brand.querySelector('.v65-mobile-version')){const v=document.createElement('span');v.className='v65-mobile-version';v.textContent=`v${DISPLAY_VERSION}`;brand.appendChild(v)}
}
function navExtra(){
  const list=document.querySelector('.sidebar ul');if(!list)return;
  if(!list.querySelector('[data-v65-nav="help"]')){
    const help=document.createElement('li');help.className='v65-nav-extra';help.dataset.v65Nav='help';
    help.innerHTML='<button class="v6-nav-item '+(file()==='help.html'?'active':'')+'" data-v65-help><span class="v6-nav-icon">?</span><span class="v6-nav-label">Help / Chamados</span></button>';
    list.appendChild(help);help.querySelector('button').onclick=()=>location.href='help.html';
  }
  if(!list.querySelector('[data-v65-nav="about"]')&&!list.querySelector('[data-url="about.html"]')){
    const about=document.createElement('li');about.className='v65-nav-extra';about.dataset.v65Nav='about';
    about.innerHTML='<button class="v6-nav-item '+(file()==='about.html'?'active':'')+'" data-v65-about><span class="v6-nav-icon">ⓘ</span><span class="v6-nav-label">About</span></button>';
    list.appendChild(about);about.querySelector('button').onclick=()=>location.assign(new URL('about.html',location.href).href);
  }
}
function readyText(el){const t=norm(el?.textContent);return t==='pronto'||t==='concluido'||t==='concluida'||t.includes('processo pronto')}
function lockEditButton(statusId,editId){
  const st=$(statusId),btn=$(editId);if(!st||!btn)return;
  if(readyText(st)){btn.hidden=true;btn.style.display='none';btn.dataset.v65ReadyLocked='1';
    const parent=btn.parentElement;if(parent&&!parent.querySelector('.v65-ready-lock-note')){const n=document.createElement('span');n.className='v65-ready-lock-note';n.textContent='Edição encerrada';parent.appendChild(n)}
  }
}
function lockReadyEdits(){lockEditButton('dStatus','btnEditGuide');lockEditButton('pdStatus','btnEditPedido');lockEditButton('mdStatus','btnEditMov')}
function editClickGuard(e){
  const btn=e.target.closest?.('#btnEditGuide,#btnEditPedido,#btnEditMov');if(!btn)return;
  const map={btnEditGuide:'dStatus',btnEditPedido:'pdStatus',btnEditMov:'mdStatus'};
  if(readyText($(map[btn.id]))){e.preventDefault();e.stopImmediatePropagation();alert('Este processo já está pronto/concluído. A edição foi encerrada; a opção de excluir permanece disponível.')}
}

async function heartbeat(force=false){
  const now=Date.now();if(!force&&now-lastHeartbeat<20000)return;
  const c=client();me=me||logged();if(!c||!me?.id)return;lastHeartbeat=now;
  try{await c.from('usuarios_presenca').upsert({usuario_id:String(me.id),perfil_id:me.perfil_id?Number(me.perfil_id):null,pagina:currentPage(),ultima_atividade:new Date().toISOString()},{onConflict:'usuario_id'})}catch(_){}
}
async function refreshPresence(){
  if(!presenceVisualPage())return;
  const c=client();if(!c)return;
  const since=new Date(Date.now()-ONLINE_WINDOW_MS).toISOString();
  try{
    const r=await c.from('usuarios_presenca').select('usuario_id,ultima_atividade').gte('ultima_atividade',since);if(r.error)return;
    onlineIds=new Set((r.data||[]).map(x=>String(x.usuario_id)));decorateOnline();
    window.dispatchEvent(new CustomEvent('v65:presenca',{detail:{online:[...onlineIds]}}));
  }catch(_){}
}
function isOnline(id){return onlineIds.has(String(id))}
function setDot(host,id){
  if(!host||!id)return;let d=host.querySelector(':scope > .v65-online-dot');
  if(!isOnline(id)){d?.remove();return}
  if(!d){d=document.createElement('span');d.className='v65-online-dot';host.appendChild(d)}d.title='Online agora';
}
function decorateUsersPage(){
  document.querySelectorAll('.user-row').forEach(row=>{const id=row.querySelector('[data-id]')?.dataset.id;if(!id)return;row.dataset.v65UserId=id;setDot(row.querySelector('.user-avatar'),id)});
  const selected=document.querySelector('.user-row.selected'),sid=selected?.dataset.v65UserId||selected?.querySelector('[data-id]')?.dataset.id,to=document.querySelector('.msg-to b');if(to&&sid)setDot(to,sid);
}
function decorateCentral(){
  document.querySelectorAll('[data-user]').forEach(el=>setDot(el.querySelector('b,strong')||el,el.dataset.user));
  document.querySelectorAll('[data-conv]').forEach(el=>setDot(el.querySelector('strong')||el,el.dataset.conv));
  const active=document.querySelector('[data-conv].active'),chat=$('chatHead');if(active&&chat)setDot(chat,active.dataset.conv);
}
function decorateOnline(){if(decorating)return;decorating=true;try{if(file()==='usuarios.html')decorateUsersPage();if(file()==='central.html')decorateCentral()}finally{decorating=false}}

function setupPresence(){
  me=logged();const c=client();if(!me?.id||!c)return;
  heartbeat(true);heartbeatTimer=setInterval(()=>heartbeat(false),HEARTBEAT_MS);
  if(presenceVisualPage()){refreshPresence();refreshTimer=setInterval(refreshPresence,PRESENCE_REFRESH_MS)}
  const wake=()=>{heartbeat(false);if(presenceVisualPage())refreshPresence()};
  window.addEventListener('focus',wake);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake()});
  window.Presenca26={versao:VERSION,isOnline,refresh:refreshPresence};
}
function uiSync(){renderVersion();navExtra();lockReadyEdits();if(presenceVisualPage())decorateOnline()}
function init(){
  injectStyle();document.addEventListener('click',editClickGuard,true);uiSync();setupPresence();
  uiTimer=setInterval(uiSync,UI_REFRESH_MS);setTimeout(uiSync,700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();