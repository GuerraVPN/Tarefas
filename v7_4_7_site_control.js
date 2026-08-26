(function(){
'use strict';
if(window.__TAREFAS_SITE_CONTROL_747__)return;
window.__TAREFAS_SITE_CONTROL_747__=true;

const VERSION='7.4.7';
const POLL_MS=3000;
const KEY_RESTART='tarefas_v747_restart_seen';
const KEY_EXIT='tarefas_v747_exit_seen';
const ACTION_LABEL={
  exit_users:'EXIT USERS',
  desligar:'Desligamento do site',
  reiniciar:'Reinício do site'
};
let current=null,user=null,isAdmin=false,pollTimer=null,countdownTimer=null,wasOffline=false,booted=false,serverOffset=0;

function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function logged(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function norm(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function getStateRow(data){return Array.isArray(data)?(data[0]||null):data||null}

async function resolveAdmin(){
  user=logged();isAdmin=false;
  const c=client();if(!c||!user?.id)return false;
  try{
    if(window.Perfis26){
      const st=await window.Perfis26.carregar(c,user);
      if(st?.usuario){user=st.usuario;localStorage.setItem('usuarioLogado',JSON.stringify(user))}
    }
  }catch(_){}
  if(!user?.perfil_id){
    try{
      const q=await c.from('usuario_perfis').select('id,secao,posicao,principal,ativo').eq('usuario_id',Number(user.id)).eq('ativo',true).order('principal',{ascending:false}).order('id');
      if(!q.error){
        const preferred=(q.data||[]).find(p=>norm(p.secao)===norm(user.secao))||(q.data||[])[0];
        if(preferred){user={...user,secao:preferred.secao,posicao:preferred.posicao,perfil_id:preferred.id};localStorage.setItem('usuarioLogado',JSON.stringify(user))}
      }
    }catch(_){}
  }
  if(!user?.perfil_id){isAdmin=false;return false}
  try{
    const r=await c.rpc('v7_1_admin_total',{p_usuario_id:Number(user.id),p_perfil_id:Number(user.perfil_id)});
    isAdmin=!r.error&&r.data===true;
  }catch(_){isAdmin=norm(user?.secao)==='admin'}
  return isAdmin;
}

function injectCss(){
  if(document.getElementById('v747SiteControlCss'))return;
  const s=document.createElement('style');s.id='v747SiteControlCss';s.textContent=`
  #v747SiteWarning{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:2147483600;max-width:min(760px,calc(100vw - 24px));padding:10px 14px;border-radius:11px;background:#7f1d1d;color:#fff;border:1px solid #ef4444;box-shadow:0 12px 30px #0007;font:800 12px/1.35 Arial,sans-serif;text-align:center}
  #v747SiteWarning b{color:#fde68a}#v747AdminSiteBadge{position:fixed;left:14px;bottom:14px;z-index:2147483500;border:1px solid #ef4444;background:#111827;color:#fecaca;border-radius:12px;padding:10px 13px;font:900 11px Arial,sans-serif;box-shadow:0 10px 25px #0007;cursor:pointer}
  #v747AdminSiteBadge.online{border-color:#22c55e;color:#bbf7d0}#v747AdminSiteBadge.pending{border-color:#f59e0b;color:#fde68a}
  #v747AdminOffline{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483490;padding:8px 12px;border-radius:999px;background:#7f1d1d;color:#fff;font:900 10px Arial,sans-serif;border:1px solid #ef4444}
  #v747Maintenance{position:fixed;inset:0;z-index:2147483640;background:#050b16;color:#e5e7eb;display:grid;place-items:center;padding:24px;font-family:Arial,sans-serif}
  #v747Maintenance .box{width:min(560px,100%);text-align:center;border:1px solid #334155;border-radius:20px;background:#0f172a;padding:30px;box-shadow:0 30px 70px #0009}#v747Maintenance h1{margin:0 0 10px;color:#fff;font-size:28px}#v747Maintenance p{color:#94a3b8;line-height:1.55}#v747Maintenance .spin{width:34px;height:34px;margin:18px auto;border:4px solid #334155;border-top-color:#3b82f6;border-radius:50%;animation:v747spin .9s linear infinite}@keyframes v747spin{to{transform:rotate(360deg)}}
  #v747SiteModal{position:fixed;inset:0;z-index:2147483630;background:#0009;display:grid;place-items:center;padding:18px;font-family:Arial,sans-serif}#v747SiteModal[hidden]{display:none!important}#v747SiteModal .card{width:min(560px,100%);background:#0f172a;color:#e5e7eb;border:1px solid #334155;border-radius:18px;padding:18px;box-shadow:0 25px 70px #000b}#v747SiteModal h3{margin:0 0 4px;font-size:20px;color:#fff}#v747SiteModal .sub{font-size:11px;color:#94a3b8;margin-bottom:14px}#v747SiteModal .status{padding:11px;border:1px solid #334155;border-radius:10px;background:#111827;margin-bottom:12px;font-size:12px;line-height:1.5}#v747SiteModal .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}#v747SiteModal button{border:1px solid #475569;background:#111827;color:#e5e7eb;border-radius:10px;padding:11px;font-weight:800;cursor:pointer}#v747SiteModal button.danger{border-color:#ef4444;color:#fecaca}#v747SiteModal button.warn{border-color:#f59e0b;color:#fde68a}#v747SiteModal button.good{border-color:#22c55e;color:#bbf7d0}#v747SiteModal .close{width:100%;margin-top:9px}
  @media(max-width:520px){#v747SiteModal .grid{grid-template-columns:1fr}#v747AdminSiteBadge{bottom:76px}}
  `;document.head.appendChild(s);
}

function warningText(s){
  const label=ACTION_LABEL[s?.acao_pendente]||'Manutenção';
  const end=Date.parse(s?.executa_em||'');
  const secs=Number.isFinite(end)?Math.max(0,Math.ceil((end-(Date.now()+serverOffset))/1000)):0;
  if(s?.acao_pendente==='exit_users')return `${label}: sessões dos usuários comuns serão encerradas em <b>${secs}s</b>. Salve seu trabalho agora.`;
  if(s?.acao_pendente==='desligar')return `${label}: o sistema será colocado em manutenção em <b>${secs}s</b>. Salve seu trabalho agora.`;
  if(s?.acao_pendente==='reiniciar')return `${label}: o sistema será recarregado e o cache atualizado em <b>${secs}s</b>. Salve seu trabalho agora.`;
  return '';
}
function renderWarning(s){
  let el=document.getElementById('v747SiteWarning');
  if(!s?.acao_pendente){el?.remove();if(countdownTimer){clearInterval(countdownTimer);countdownTimer=null}return}
  if(!el){el=document.createElement('div');el.id='v747SiteWarning';document.body.appendChild(el)}
  const tick=()=>{if(!current?.acao_pendente)return;el.innerHTML=warningText(current);const end=Date.parse(current.executa_em||'');if(Number.isFinite(end)&&(Date.now()+serverOffset)>=end){clearInterval(countdownTimer);countdownTimer=null;poll(true)}};
  tick();if(!countdownTimer)countdownTimer=setInterval(tick,500);
}

function showMaintenance(){
  if(document.getElementById('v747Maintenance'))return;
  const el=document.createElement('div');el.id='v747Maintenance';el.innerHTML=`<div class="box"><h1>🔧 Sistema em manutenção</h1><p>O TAREFAS foi temporariamente desligado para aplicação de atualizações. Nenhum dado foi perdido.</p><div class="spin"></div><p><b>Aguarde.</b> A página será liberada automaticamente quando o Admin iniciar o site.</p></div>`;document.body.appendChild(el);
}
function hideMaintenance(){document.getElementById('v747Maintenance')?.remove()}
function showAdminOffline(on){
  let el=document.getElementById('v747AdminOffline');
  if(on){if(!el){el=document.createElement('div');el.id='v747AdminOffline';el.textContent='MODO MANUTENÇÃO · acesso exclusivo do Admin';document.body.appendChild(el)}}else el?.remove();
}

function adminBadge(){
  if(!isAdmin){document.getElementById('v747AdminSiteBadge')?.remove();return}
  let b=document.getElementById('v747AdminSiteBadge');if(!b){b=document.createElement('button');b.id='v747AdminSiteBadge';b.type='button';b.onclick=openPanel;document.body.appendChild(b)}
  const pending=!!current?.acao_pendente,off=current?.modo==='desligado';b.className=pending?'pending':off?'':'online';b.textContent=pending?'⚠ SITE · ação pendente':off?'⏻ SITE · DESLIGADO':'● SITE · ONLINE';
}
function openPanel(){
  if(!isAdmin)return;let m=document.getElementById('v747SiteModal');if(!m){m=document.createElement('div');m.id='v747SiteModal';document.body.appendChild(m)}m.hidden=false;renderPanel();
}
function renderPanel(){
  const m=document.getElementById('v747SiteModal');if(!m)return;
  const pending=current?.acao_pendente?`${ACTION_LABEL[current.acao_pendente]||current.acao_pendente} — executa em ${Math.max(0,Math.ceil((Date.parse(current.executa_em)-(Date.now()+serverOffset))/1000))}s`:'Nenhuma ação pendente';
  m.innerHTML=`<div class="card"><h3>Controle do Site · V${VERSION}</h3><div class="sub">Somente o perfil Admin pode executar estas ações.</div><div class="status"><b>Status:</b> ${current?.modo==='desligado'?'DESLIGADO / MANUTENÇÃO':'ONLINE'}<br><b>Ação:</b> ${esc(pending)}</div><div class="grid"><button class="danger" data-act="exit_users">EXIT USERS</button><button class="danger" data-act="desligar">Desligar site</button><button class="warn" data-act="reiniciar">Reiniciar site</button><button class="good" data-act="iniciar">Iniciar site</button>${current?.acao_pendente?'<button data-act="cancelar">Cancelar ação pendente</button>':''}</div><button class="close" data-close>Fechar</button></div>`;
  m.querySelector('[data-close]').onclick=()=>m.hidden=true;
  m.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>requestAction(b.dataset.act));
}

async function requestAction(action){
  if(!isAdmin||!user?.id||!user?.perfil_id)return alert('Ação disponível somente para o perfil Admin ativo.');
  const scheduled=['exit_users','desligar','reiniciar'].includes(action);
  const message=action==='exit_users'?'Encerrar as sessões de todos os usuários comuns em 30 segundos?':action==='desligar'?'Desligar o site em 30 segundos e manter somente o Admin com acesso?':action==='reiniciar'?'Reiniciar o site em 30 segundos para atualizar cache e arquivos?':action==='iniciar'?'Iniciar o site agora e liberar os usuários?':'Cancelar a ação pendente?';
  if(!confirm(message))return;
  const c=client();if(!c)return alert('Conexão com o servidor indisponível.');
  const r=await c.rpc('v7_4_7_controle_site',{p_acao:action,p_usuario_id:Number(user.id),p_perfil_id:Number(user.perfil_id)});
  if(r.error)return alert(r.error.message||'Falha ao alterar o estado do site.');
  current=getStateRow(r.data)||current;handleState(current,true);renderPanel();
  if(scheduled)alert('Aviso global iniciado. A ação será executada após 30 segundos.');
}

function forceLogout(){
  const u=logged();
  try{localStorage.removeItem('usuarioLogado');localStorage.removeItem('sessao26_ultima_atividade');if(u?.id)localStorage.removeItem('perfilAtivo26Pel:'+u.id)}catch(_){}
  location.replace('index.html?exit_users='+Date.now());
}
async function refreshAssetsAndReload(token){
  try{
    if('caches'in window){const names=await caches.keys();await Promise.all(names.map(n=>caches.delete(n)))}
    if(navigator.serviceWorker?.getRegistrations){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister().catch(()=>false)))}
    const urls=[...document.querySelectorAll('script[src],link[rel="stylesheet"][href]')].map(el=>el.src||el.href).filter(Boolean);
    await Promise.allSettled(urls.map(u=>fetch(u,{cache:'reload'})));
  }catch(e){console.warn('Reinício V7.4.7: limpeza parcial de cache.',e)}
  const url=new URL(location.href);url.searchParams.set('restart',String(token||Date.now()));url.searchParams.set('_ts',String(Date.now()));location.replace(url.toString());
}
function processTokens(s){
  const exit=Number(s?.exit_token||0),restart=Number(s?.restart_token||0);
  const exitRaw=localStorage.getItem(KEY_EXIT),restartRaw=localStorage.getItem(KEY_RESTART);
  if(exitRaw===null)localStorage.setItem(KEY_EXIT,String(exit));
  else if(exit>Number(exitRaw||0)){localStorage.setItem(KEY_EXIT,String(exit));if(!isAdmin)return forceLogout()}
  if(restartRaw===null)localStorage.setItem(KEY_RESTART,String(restart));
  else if(restart>Number(restartRaw||0)){localStorage.setItem(KEY_RESTART,String(restart));return refreshAssetsAndReload(restart)}
}

function handleState(s,fromAction=false){
  if(!s)return;const server=Date.parse(s.servidor_em||'');if(Number.isFinite(server))serverOffset=server-Date.now();current=s;renderWarning(s);processTokens(s);
  const off=s.modo==='desligado';
  if(off){
    wasOffline=true;
    const onLogin=(location.pathname.split('/').pop()||'index.html').toLowerCase()==='index.html';
    if(isAdmin){hideMaintenance();showAdminOffline(true)}
    else if(onLogin&&!logged()){showAdminOffline(false);hideMaintenance()}
    else{showAdminOffline(false);showMaintenance()}
  }else{
    showAdminOffline(false);
    if(wasOffline&&!isAdmin&&document.getElementById('v747Maintenance')){hideMaintenance();location.reload();return}
    hideMaintenance();wasOffline=false;
  }
  adminBadge();if(fromAction)renderPanel();
}

async function poll(force=false){
  const c=client();if(!c)return;
  try{
    const r=await c.rpc('v7_4_7_estado_site');if(r.error)throw r.error;
    handleState(getStateRow(r.data));
  }catch(e){if(force)console.warn('Controle do site V7.4.7:',e?.message||e)}
}
async function init(){
  if(booted)return;booted=true;injectCss();await resolveAdmin();await poll(true);pollTimer=setInterval(poll,POLL_MS);
  window.addEventListener('focus',()=>poll());document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});
}
window.SiteControl26={poll,openPanel:()=>isAdmin&&openPanel(),version:VERSION};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
