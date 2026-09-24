(()=>{
'use strict';
const VERSION='7.9.2',MARK='__TAREFAS_WEB_792__';
if(window[MARK])return;window[MARK]=true;

const page=()=>String(location.pathname.split('/').pop()||'dashboard.html').toLowerCase();
const user=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};
const me=user();
const stateKey=()=>me?.id!=null?'tarefas_web_792_state_'+String(me.id):null;
const queueKey=()=>me?.id!=null?'tarefas_web_792_queue_'+String(me.id):null;
const restoreKey='tarefas_web_792_restore';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const defaults=()=>({schemaVersion:1,favorites:[],savedFilters:[],errors:[],downloads:[],mutedCategories:[],pinnedNotifications:[],retentionDays:0,lastNotificationFilter:'todas',updatedAt:Date.now()});
function readJSON(k,f){try{const x=JSON.parse(localStorage.getItem(k)||'null');return x??f}catch(_){return f}}
function normalizeHref(href){try{const u=new URL(String(href||''),location.href);if(u.origin!==location.origin)return'';return(u.pathname.split('/').pop()||'')+u.search+u.hash}catch(_){return String(href||'').trim()}}
function state(){
 const k=stateKey();if(!k)return defaults();
 const out=Object.assign(defaults(),readJSON(k,{}));let changed=false;
 const seen=new Set();out.favorites=(out.favorites||[]).filter(x=>{const h=normalizeHref(x?.href);if(!h||seen.has(h))return false;seen.add(h);if(x.href!==h){x.href=h;changed=true}return true});
 out.savedFilters=(out.savedFilters||[]).map(x=>{if(!x.schemaVersion){x.schemaVersion=1;changed=true}return x});
 if(out.schemaVersion!==1){out.schemaVersion=1;changed=true}
 if(changed)localStorage.setItem(k,JSON.stringify(out));
 return out;
}
function writeState(s){const k=stateKey();if(!k)return;s.updatedAt=Date.now();localStorage.setItem(k,JSON.stringify(s));window.dispatchEvent(new CustomEvent('tarefas:web792-state',{detail:{version:VERSION}}))}
function queue(){const k=queueKey();return k?readJSON(k,[]):[]}
function writeQueue(q){const k=queueKey();if(k)localStorage.setItem(k,JSON.stringify(q.slice(-100)));window.dispatchEvent(new CustomEvent('tarefas:web792-queue'))}
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}

function installCss(){
 if(document.getElementById('web792Style'))return;
 const s=document.createElement('style');s.id='web792Style';s.textContent=`
 .w792-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 12px}.w792-tabs button{border:1px solid var(--v4-border,#d7dce3);background:var(--v4-surface,#fff);color:inherit;border-radius:10px;padding:9px 11px;font-size:11px;font-weight:800;cursor:pointer}.w792-tabs button.active{background:var(--v4-accent,#2563eb);border-color:var(--v4-accent,#2563eb);color:#fff}
 .w792-aux{background:var(--v4-surface,#fff);border:1px solid var(--v4-border,#d7dce3);border-radius:14px;min-height:420px;overflow:hidden}.w792-head{padding:14px 16px;border-bottom:1px solid var(--v4-border,#d7dce3);display:flex;align-items:center;justify-content:space-between;gap:10px}.w792-head h3{margin:0;font-size:17px}.w792-head small{display:block;color:var(--v4-muted,#667085);font-size:10px;margin-top:3px}.w792-body{padding:14px;max-height:calc(100vh - 210px);overflow:auto}
 .w792-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.w792-card,.w792-row{border:1px solid var(--v4-border,#d7dce3);border-radius:11px;background:var(--v4-surface-2,#f7f8fa);padding:10px}.w792-card small,.w792-row small{display:block;color:var(--v4-muted,#667085);font-size:9px;margin-top:3px}.w792-row{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-bottom:7px}.w792-row>span{min-width:0;flex:1}.w792-row strong{font-size:12px}.w792-actions{display:flex;gap:5px;flex-wrap:wrap}.w792-btn{border:0;border-radius:8px;padding:7px 9px;background:var(--v4-surface-3,#e9eef5);color:inherit;font-size:10px;font-weight:850;cursor:pointer}.w792-btn.primary{background:var(--v4-accent,#2563eb);color:#fff}.w792-btn.danger{color:#b91c1c}.w792-empty{text-align:center;color:var(--v4-muted,#667085);padding:30px;font-size:11px}
 .w792-notif-tools{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px}.w792-notif-tools select,.w792-filterbar select{border:1px solid var(--v4-border,#d7dce3);background:var(--v4-surface,#fff);color:inherit;border-radius:8px;padding:7px;font-size:10px}.w792-notif{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:flex-start;border:1px solid var(--v4-border,#d7dce3);border-radius:11px;padding:10px;margin-bottom:7px}.w792-notif.unread{box-shadow:inset 3px 0 var(--v4-accent,#2563eb)}.w792-notif p{font-size:10px;color:var(--v4-muted,#667085);margin:4px 0;line-height:1.4}.w792-notif time{font-size:9px;color:var(--v4-muted,#667085);white-space:nowrap}.w792-pill{display:inline-block;border-radius:999px;background:var(--v4-surface-3,#e9eef5);padding:3px 6px;font-size:8px;font-weight:800}
 .w792-modal{position:fixed;inset:0;background:rgba(15,23,42,.7);z-index:100120;display:flex;align-items:center;justify-content:center;padding:16px}.w792-dialog{width:min(680px,96vw);max-height:86vh;overflow:hidden;display:flex;flex-direction:column;background:var(--v4-surface,#fff);color:inherit;border-radius:15px;border:1px solid var(--v4-border,#d7dce3)}.w792-dialog header,.w792-dialog footer{padding:12px 14px;border-bottom:1px solid var(--v4-border,#d7dce3);display:flex;align-items:center;justify-content:space-between;gap:8px}.w792-dialog footer{border-top:1px solid var(--v4-border,#d7dce3);border-bottom:0}.w792-dialog main{padding:12px;overflow:auto}.w792-dest{display:flex;gap:9px;align-items:flex-start;padding:9px;border:1px solid var(--v4-border,#d7dce3);border-radius:9px;margin-bottom:6px}.w792-dest input{margin-top:3px}.w792-dest span{min-width:0}.w792-dest small{display:block;color:var(--v4-muted,#667085);font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .w792-error{white-space:normal!important;word-break:break-word}.w792-status-good{color:#15803d}.w792-status-warn{color:#b45309}
 #w792TaskStatus{min-width:150px}
 @media(max-width:720px){.w792-grid{grid-template-columns:1fr 1fr}.w792-body{max-height:none}.w792-row{align-items:flex-start;flex-direction:column}.w792-actions{width:100%}}
 `;document.head.appendChild(s);
}

function installSafeApi(){
 if(window.TarefasWeb792Safe)return;
 const get=id=>document.getElementById(id);
 window.TarefasWeb792Safe=Object.freeze({
  get,
  text:(id,v)=>{const e=get(id);if(!e)return false;e.textContent=String(v??'');return true},
  html:(id,v)=>{const e=get(id);if(!e)return false;e.innerHTML=String(v??'');return true},
  style:(id,p,v)=>{const e=get(id);if(!e)return false;e.style[p]=v;return true},
  addClass:(id,c)=>{const e=get(id);if(!e)return false;e.classList.add(c);return true},
  removeClass:(id,c)=>{const e=get(id);if(!e)return false;e.classList.remove(c);return true}
 });
}

function installLifecycle(){
 if(window.TarefasWeb792Lifecycle)return;
 let generation=1,active=true;
 const bump=()=>generation++;
 window.addEventListener('pagehide',()=>{active=false;bump()});
 window.addEventListener('pageshow',()=>{active=true;bump()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)bump()});
 window.TarefasWeb792Lifecycle=Object.freeze({token:()=>generation,isActive:t=>active&&t===generation,guard:async(p,t=generation)=>{const v=await p;if(!active||t!==generation){const e=new Error('Resposta assíncrona obsoleta descartada');e.code='TAREFAS_STALE_ASYNC';throw e}return v}});
}

function logError(input){
 if(!me?.id)return;
 const s=state();const row={at:new Date().toISOString(),source:String(input.source||'web'),severity:String(input.severity||'error'),message:String(input.message||'Erro desconhecido').slice(0,700),page:location.pathname+location.search};
 const key=[row.source,row.message,row.page].join('|');const last=s.errors[s.errors.length-1];
 if(last&&[last.source,last.message,last.page].join('|')===key&&Date.now()-Date.parse(last.at)<5000)return;
 s.errors=[...s.errors,row].slice(-80);writeState(s);
}
window.addEventListener('error',e=>logError({source:'window.error',message:e.message}));
window.addEventListener('unhandledrejection',e=>{const r=e.reason; if(r?.code==='TAREFAS_STALE_ASYNC')return;logError({source:'unhandledrejection',message:r?.message||String(r||'Promise rejeitada')})});

function selectorFor(el){
 if(!el||el.nodeType!==1)return null;
 if(el.id)return'#'+CSS.escape(el.id);
 if(el.name)return el.tagName.toLowerCase()+'[name="'+CSS.escape(el.name)+'"]';
 for(const a of ['data-filter','data-tab','data-orc-module','data-orc-link','data-cat','data-view']){const v=el.getAttribute?.(a);if(v!=null)return'['+a+'="'+CSS.escape(v)+'"]'}
 return null;
}
function captureUi(){
 const controls=[];document.querySelectorAll('input,select,textarea').forEach(el=>{const type=String(el.type||'').toLowerCase();if(['password','file','hidden','button','submit'].includes(type))return;const selector=selectorFor(el);if(!selector)return;const r={selector};if(type==='checkbox'||type==='radio')r.checked=!!el.checked;else r.value=String(el.value??'').slice(0,500);controls.push(r)});
 const active=[];document.querySelectorAll('[data-tab].active,[data-tab][aria-selected="true"],[data-orc-module].active,[data-orc-link].active,[data-cat].active,[data-view].active').forEach(el=>{const selector=selectorFor(el);if(selector)active.push({selector})});
 return{controls:controls.slice(0,100),active:active.slice(0,30)};
}
function applyUi(x){
 if(!x)return;(x.controls||[]).forEach(r=>{const e=document.querySelector(r.selector);if(!e)return;try{if('checked'in r)e.checked=!!r.checked;else e.value=r.value??'';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}catch(_){}});(x.active||[]).forEach(r=>{try{document.querySelector(r.selector)?.click()}catch(_){}});
}
function hrefNow(){return page()+(location.search||'')+(location.hash||'')}
function labelNow(){const h=document.querySelector('main h1,main h2,.heading h2,.page h2');const active=[...document.querySelectorAll('[data-tab].active,[data-orc-module].active,[data-orc-link].active')].map(x=>String(x.textContent||'').trim()).filter(Boolean);return[ String(h?.textContent||document.title||page()).trim(),...active].filter(Boolean).join(' › ').slice(0,110)}
const seeds=[
 ['Início','dashboard.html','Geral'],['Quadro','menu.html','Tarefas'],['Minhas Tarefas','minhas_tarefas.html','Tarefas'],['Calendário','calendario.html','Tarefas'],['Escalas','pessoal.html','Serviços'],['Férias e dispensas','ferias_dispensas.html','Serviços'],['Relatórios','relatorios.html','Geral'],['Usuários','usuarios.html','Administração'],['Configurações','configuracoes.html','Geral'],
 ['Central › Notificações','central.html?tab=notificacoes','Central'],['Central › Mensagens','central.html?tab=mensagens','Central'],['Central › Downloads','central.html?tab=downloads','Central'],['Central › Favoritos','central.html?tab=favoritos','Central'],['Central › Ferramentas','central.html?tab=ferramentas','Central'],
 ['Orçamentários › Resumo','orcamentarios.html?modulo=relatorio','Orçamentários'],['Orçamentários › Guias','orcamentarios.html?modulo=guias','Orçamentários'],['Orçamentários › Baixas','orcamentarios.html?modulo=baixas','Orçamentários'],['Orçamentários › Distribuição','orcamentarios.html?modulo=distribuicao','Orçamentários'],['Orçamentários › Movimentação','orcamentarios.html?modulo=movimentacao','Orçamentários'],['Orçamentários › Material Carga','orcamentarios.html?modulo=material_carga','Orçamentários'],['Orçamentários › Passagem de Carga','orcamentarios.html?modulo=passagem_carga','Orçamentários'],['Orçamentários › Lavanderia','orcamentarios.html?modulo=lavanderia','Orçamentários']
].map(([label,href,group])=>({label,href,group}));
function destinations(){
 const map=new Map(seeds.map(x=>[x.href,x]));const add=(label,href,group='Descobertos')=>{if(!href||/^(?:https?:|javascript:|mailto:|tel:)/i.test(href))return;try{const u=new URL(href,location.href);if(u.origin!==location.origin)return;href=(u.pathname.split('/').pop()||page())+u.search+u.hash}catch(_){}if(!/\.html(?:[?#]|$)/i.test(href))return;if(!map.has(href))map.set(href,{label:String(label||href).trim().slice(0,110),href,group})};
 add(labelNow(),hrefNow(),'Tela atual');document.querySelectorAll('a[href],[data-url]').forEach(e=>add(e.textContent||e.title,e.getAttribute('href')||e.getAttribute('data-url')));
 document.querySelectorAll('[data-tab]').forEach(e=>{const v=e.getAttribute('data-tab');if(!v)return;const q=new URLSearchParams(location.search);q.set('tab',v);add((document.title||page())+' › '+(e.textContent||v),page()+'?'+q,'Abas')});
 document.querySelectorAll('[data-orc-module],[data-orc-link]').forEach(e=>{const v=e.getAttribute('data-orc-module')||e.getAttribute('data-orc-link');if(v)add('Orçamentários › '+(e.textContent||v),'orcamentarios.html?modulo='+encodeURIComponent(v),'Orçamentários')});
 return[...map.values()].sort((a,b)=>a.group.localeCompare(b.group,'pt-BR')||a.label.localeCompare(b.label,'pt-BR'));
}

function openFavoritePicker(){
 const s=state(),fav=new Set(s.favorites.map(x=>x.href)),rows=destinations(),m=document.createElement('div');m.className='w792-modal';let group='';
 m.innerHTML='<section class="w792-dialog"><header><strong>⭐ Escolher telas e abas</strong><button class="w792-btn" data-close>Fechar</button></header><main>'+rows.map(r=>{const h=r.group!==group?'<h4>'+esc(group=r.group)+'</h4>':'';return h+'<label class="w792-dest"><input type="checkbox" data-href="'+esc(r.href)+'" '+(fav.has(r.href)?'checked':'')+'><span><strong>'+esc(r.label)+'</strong><small>'+esc(r.href)+'</small></span></label>'}).join('')+'</main><footer><small>Escolha páginas, módulos e subabas.</small><button class="w792-btn primary" data-save>Salvar</button></footer></section>';
 document.body.appendChild(m);m.onclick=e=>{if(e.target===m||e.target.closest('[data-close]'))m.remove()};
 m.querySelector('[data-save]').onclick=()=>{const chosen=new Set([...m.querySelectorAll('[data-href]:checked')].map(x=>x.dataset.href));const old=new Map(s.favorites.map(x=>[x.href,x]));s.favorites=rows.filter(r=>chosen.has(r.href)).map(r=>old.get(r.href)||{id:'fav-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),label:r.label,href:r.href,createdAt:new Date().toISOString()}).slice(-40);writeState(s);m.remove();renderCentralCurrent()};
}

function scopeOf(href){try{const u=new URL(String(href).split('#')[0],location.href);const sub=u.searchParams.get('modulo')||u.searchParams.get('tab')||u.searchParams.get('view')||'';return(u.pathname.split('/').pop()||'')+(sub?'::'+sub:'')}catch(_){return String(href)}}
function saveFilter(){
 const name=(prompt('Nome do filtro:',labelNow())||'').trim();if(!name)return;const s=state();const row={id:'flt-'+Date.now(),schemaVersion:1,name:name.slice(0,90),href:hrefNow(),scopeKey:scopeOf(hrefNow()),uiState:captureUi(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};s.savedFilters=[...s.savedFilters,row].slice(-40);writeState(s);renderCentralCurrent();
}
function openStored(row){try{sessionStorage.setItem(restoreKey,JSON.stringify({href:row.href,uiState:row.uiState,at:Date.now()}))}catch(_){}location.href=row.href}
function restorePending(){let x=null;try{x=JSON.parse(sessionStorage.getItem(restoreKey)||'null');sessionStorage.removeItem(restoreKey)}catch(_){}if(!x?.uiState)return;[100,350,900,1600].forEach(ms=>setTimeout(()=>applyUi(x.uiState),ms))}
function manageFilter(id,op){
 const s=state(),r=s.savedFilters.find(x=>x.id===id);if(!r)return;
 if(op==='rename'){const n=prompt('Novo nome:',r.name);if(n!=null&&n.trim())r.name=n.trim().slice(0,90)}
 if(op==='replace'){r.schemaVersion=1;r.href=hrefNow();r.scopeKey=scopeOf(r.href);r.uiState=captureUi();r.updatedAt=new Date().toISOString()}
 if(op==='delete'&&confirm('Excluir o filtro "'+r.name+'"?'))s.savedFilters=s.savedFilters.filter(x=>x.id!==id);
 writeState(s);renderCentralCurrent();
}

function trackDownloads(){
 document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a)return;const href=a.getAttribute('href')||'';if(!a.hasAttribute('download')&&!/\.(?:pdf|odt|docx?|xlsx?|csv|zip|apk|png|jpe?g)(?:[?#]|$)/i.test(href))return;const s=state();s.downloads=[...s.downloads,{id:'dl-'+Date.now(),filename:a.getAttribute('download')||href.split('/').pop()?.split('?')[0]||'arquivo',href,at:new Date().toISOString()}].slice(-50);writeState(s)},true);
}

async function mutateNotifications(op,ids){
 ids=[...new Set(ids.map(String).filter(Boolean))];if(!ids.length)return;
 if(navigator.onLine===false||!client()){const q=queue();q.push({id:'q-'+Date.now()+'-'+Math.random().toString(36).slice(2),kind:op,payload:{ids},createdAt:new Date().toISOString(),attempts:0,status:'pending'});writeQueue(q);return}
 let r;if(op==='delete')r=await client().from('notificacoes').delete().eq('usuario_id',String(me.id)).in('id',ids);else r=await client().from('notificacoes').update({lida:true,lida_em:new Date().toISOString()}).eq('usuario_id',String(me.id)).in('id',ids);if(r.error)throw r.error;
}
async function flushQueue(){
 if(navigator.onLine===false||!client())return;const q=queue();for(const item of q){if(item.status==='done')continue;try{await mutateNotifications(item.kind,item.payload?.ids||[]);item.status='done'}catch(e){item.status='failed';item.attempts=(item.attempts||0)+1;item.error=String(e?.message||e).slice(0,200);break}}writeQueue(q.filter(x=>x.status!=='done'));
}
window.addEventListener('online',()=>flushQueue().catch(e=>logError({source:'queue',message:e.message})));

let central={root:null,grid:null,panels:[],aux:null,tab:'notificacoes',selected:new Set(),rows:[]};
function catOf(n){const t=String(n.tipo||'sistema').toLowerCase();if(t.includes('mensag'))return'mensagens';if(t.includes('tarefa'))return'tarefas';if(t.includes('escala')||t.includes('serv'))return'escala';if(t.includes('app_')||t.includes('vers'))return'versoes';return'sistema'}
async function fetchNotifs(){
 const c=client();if(!c||!me?.id)return[];const r=await c.from('notificacoes').select('*').eq('usuario_id',String(me.id)).order('criada_em',{ascending:false}).limit(400);if(r.error)throw r.error;return(r.data||[]).filter(x=>!['app_update','app_update_reminder'].includes(String(x.tipo||'').toLowerCase()));
}
async function renderNotif792(){
 const aux=central.aux;if(!aux)return;const life=window.TarefasWeb792Lifecycle,token=life?.token?.();const st=state();const fetched=await fetchNotifs();if(life&&token!=null&&!life.isActive(token))return;central.rows=fetched;const s=st;const f=s.lastNotificationFilter||'todas';const rows=central.rows.filter(n=>f==='todas'||(f==='nao_lidas'?!n.lida:catOf(n)===f));
 aux.innerHTML='<div class="w792-head"><div><h3>🔔 Notificações 2.0</h3><small>Seleção múltipla, filtros, retenção e silenciamento.</small></div><button class="w792-btn" data-refresh>Atualizar</button></div><div class="w792-body"><div class="w792-notif-tools"><select data-filter><option value="todas">Todas</option><option value="nao_lidas">Não lidas</option><option value="tarefas">Tarefas</option><option value="mensagens">Mensagens</option><option value="versoes">Versões</option><option value="escala">Escala</option><option value="sistema">Sistema</option></select><button class="w792-btn" data-select>Selecionar visíveis</button><button class="w792-btn" data-read>Marcar lidas</button><button class="w792-btn danger" data-delete>Excluir selecionadas</button><select data-ret><option value="0">Sem retenção</option><option value="30">30 dias</option><option value="60">60 dias</option><option value="90">90 dias</option></select><button class="w792-btn" data-mute>Silenciar categoria</button></div><div data-list></div></div>';
 aux.querySelector('[data-filter]').value=f;aux.querySelector('[data-ret]').value=String(s.retentionDays||0);const list=aux.querySelector('[data-list]');
 if(!rows.length)list.innerHTML='<div class="w792-empty">Nenhuma notificação neste filtro.</div>';
 for(const n of rows){const id=String(n.id),d=document.createElement('article');d.className='w792-notif'+(n.lida?'':' unread');d.innerHTML='<input type="checkbox" '+(central.selected.has(id)?'checked':'')+'><div><strong>'+((s.pinnedNotifications||[]).includes(id)?'📌 ':'')+esc(n.titulo||'Notificação')+'</strong><p>'+esc(n.mensagem||'')+'</p><span class="w792-pill">'+esc(catOf(n))+'</span></div><time>'+esc(new Date(n.criada_em).toLocaleString('pt-BR'))+'</time>';d.querySelector('input').onchange=e=>e.target.checked?central.selected.add(id):central.selected.delete(id);d.querySelector('strong').onclick=()=>{s.pinnedNotifications=(s.pinnedNotifications||[]).filter(x=>x!==id);if(!(state().pinnedNotifications||[]).includes(id))s.pinnedNotifications.push(id);writeState(s);renderNotif792()};list.appendChild(d)}
 aux.querySelector('[data-refresh]').onclick=()=>renderNotif792();
 aux.querySelector('[data-filter]').onchange=e=>{const x=state();x.lastNotificationFilter=e.target.value;writeState(x);renderNotif792()};
 aux.querySelector('[data-select]').onclick=()=>{rows.forEach(x=>central.selected.add(String(x.id)));renderNotif792()};
 aux.querySelector('[data-read]').onclick=async()=>{await mutateNotifications('read',[...central.selected]);central.selected.clear();await renderNotif792()};
 aux.querySelector('[data-delete]').onclick=async()=>{if(central.selected.size&&confirm('Excluir notificações selecionadas?')){await mutateNotifications('delete',[...central.selected]);central.selected.clear();await renderNotif792()}};
 aux.querySelector('[data-ret]').onchange=async e=>{const x=state();x.retentionDays=Number(e.target.value)||0;writeState(x);if(x.retentionDays){const cut=Date.now()-x.retentionDays*86400000;const ids=central.rows.filter(n=>n.lida&&!x.pinnedNotifications.includes(String(n.id))&&Date.parse(n.criada_em)<cut).map(n=>n.id);if(ids.length)await mutateNotifications('delete',ids)}await renderNotif792()};
 aux.querySelector('[data-mute]').onclick=()=>{const x=state(),cat=['todas','nao_lidas'].includes(f)?'versoes':f,on=!x.mutedCategories.includes(cat);x.mutedCategories=x.mutedCategories.filter(v=>v!==cat);if(on)x.mutedCategories.push(cat);writeState(x);renderNotif792()};
}
function renderDownloads(){
 const s=state(),a=s.downloads||[];central.aux.innerHTML='<div class="w792-head"><div><h3>📥 Downloads</h3><small>Histórico local de arquivos abertos/baixados pelo navegador.</small></div><button class="w792-btn danger" data-clear>Limpar</button></div><div class="w792-body">'+(a.length?a.slice().reverse().map(x=>'<div class="w792-row"><span><strong>'+esc(x.filename)+'</strong><small>'+esc(x.at?new Date(x.at).toLocaleString('pt-BR'):'')+'</small></span><div class="w792-actions">'+(x.href?'<button class="w792-btn" data-open="'+esc(x.href)+'">Abrir</button>':'')+'</div></div>').join(''):'<div class="w792-empty">Nenhum download registrado.</div>')+'</div>';central.aux.querySelector('[data-clear]').onclick=()=>{const x=state();x.downloads=[];writeState(x);renderDownloads()};central.aux.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>location.href=b.dataset.open)
}
function renderFavorites(){
 const s=state();central.aux.innerHTML='<div class="w792-head"><div><h3>⭐ Favoritos</h3><small>Páginas, módulos e subabas · URLs duplicadas são consolidadas automaticamente.</small></div><button class="w792-btn primary" data-pick>Escolher telas e abas</button></div><div class="w792-body">'+(s.favorites.length?s.favorites.map(x=>'<div class="w792-row"><span><strong>'+esc(x.label)+'</strong><small>'+esc(x.href)+'</small></span><div class="w792-actions"><button class="w792-btn" data-open="'+esc(x.href)+'">Abrir</button><button class="w792-btn" data-favrename="'+esc(x.id)+'">Renomear</button><button class="w792-btn danger" data-rm="'+esc(x.id)+'">Excluir</button></div></div>').join(''):'<div class="w792-empty">Nenhum favorito ainda.</div>')+'</div>';
 central.aux.querySelector('[data-pick]').onclick=openFavoritePicker;
 central.aux.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>location.href=b.dataset.open);
 central.aux.querySelectorAll('[data-favrename]').forEach(b=>b.onclick=()=>{const x=state(),r=x.favorites.find(v=>v.id===b.dataset.favrename);if(!r)return;const n=prompt('Novo nome do favorito:',r.label);if(n!=null&&n.trim()){r.label=n.trim().slice(0,100);writeState(x);renderFavorites()}});
 central.aux.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const x=state();x.favorites=x.favorites.filter(v=>v.id!==b.dataset.rm);writeState(x);renderFavorites()})
}
function renderTools(){
 const s=state(),q=queue(),failed=q.filter(x=>x.status==='failed').length,pending=q.filter(x=>x.status!=='failed').length;central.aux.innerHTML='<div class="w792-head"><div><h3>🧰 Ferramentas</h3><small>Filtros, conexão e diagnóstico Web.</small></div></div><div class="w792-body"><div class="w792-grid"><div class="w792-card"><small>Conexão</small><strong class="'+(navigator.onLine?'w792-status-good':'w792-status-warn')+'">'+(navigator.onLine?'Online':'Offline')+'</strong></div><div class="w792-card"><small>Fila Web</small><strong>'+q.length+'</strong></div><div class="w792-card"><small>Erros registrados</small><strong>'+s.errors.length+'</strong></div></div><div style="margin:12px 0;display:flex;gap:7px;flex-wrap:wrap"><button class="w792-btn primary" data-save>🔎 Salvar filtro atual</button><button class="w792-btn" data-sync>☁️ Sincronizar fila</button><button class="w792-btn danger" data-errors>Limpar erros</button></div><h4>Filtros salvos</h4><div data-filters>'+(s.savedFilters.length?s.savedFilters.map(x=>'<div class="w792-row"><span><strong>'+esc(x.name)+'</strong><small>'+esc(x.scopeKey||scopeOf(x.href))+' · '+esc(x.href)+'</small></span><div class="w792-actions"><button class="w792-btn" data-fopen="'+esc(x.id)+'">Abrir</button><button class="w792-btn" data-frename="'+esc(x.id)+'">Renomear</button><button class="w792-btn" data-freplace="'+esc(x.id)+'">Substituir</button><button class="w792-btn danger" data-fdelete="'+esc(x.id)+'">Excluir</button></div></div>').join(''):'<div class="w792-empty">Nenhum filtro salvo.</div>')+'</div><h4>Central de erros</h4>'+(s.errors.length?s.errors.slice().reverse().map(x=>'<div class="w792-row"><span><strong>'+esc(x.source)+' · '+esc(x.severity)+'</strong><small class="w792-error">'+esc(x.message)+' · '+esc(new Date(x.at).toLocaleString('pt-BR'))+' · '+esc(x.page)+'</small></span></div>').join(''):'<div class="w792-empty">Nenhum erro registrado.</div>')+'</div>';
 central.aux.querySelector('[data-save]').onclick=saveFilter;central.aux.querySelector('[data-sync]').onclick=()=>flushQueue().then(renderTools);central.aux.querySelector('[data-errors]').onclick=()=>{const x=state();x.errors=[];writeState(x);renderTools()};central.aux.querySelectorAll('[data-qretry]').forEach(b=>b.onclick=()=>{const qx=queue(),r=qx.find(x=>x.id===b.dataset.qretry);if(r){r.status='pending';delete r.error;writeQueue(qx);flushQueue().then(renderTools).catch(renderTools)}});
 central.aux.querySelectorAll('[data-fopen]').forEach(b=>b.onclick=()=>{const r=state().savedFilters.find(x=>x.id===b.dataset.fopen);if(r)openStored(r)});
 for(const op of ['rename','replace','delete'])central.aux.querySelectorAll('[data-f'+op+']').forEach(b=>b.onclick=()=>manageFilter(b.dataset['f'+op],op));
}
function renderCentralCurrent(){if(page()!=='central.html'||!central.aux)return;showCentral(central.tab)}
async function showCentral(tab){
 central.tab=['notificacoes','mensagens','downloads','favoritos','ferramentas'].includes(tab)?tab:'notificacoes';document.querySelectorAll('.w792-tabs [data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===central.tab));const u=new URL(location.href);u.searchParams.set('tab',central.tab);history.replaceState(null,'',u.pathname+u.search+u.hash);
 if(central.tab==='mensagens'){central.aux.hidden=true;central.grid.hidden=false;central.grid.style.gridTemplateColumns='1fr';central.panels[0].hidden=true;central.panels[1].hidden=false;return}
 central.grid.hidden=true;central.aux.hidden=false;
 try{if(central.tab==='notificacoes')await renderNotif792();if(central.tab==='downloads')renderDownloads();if(central.tab==='favoritos')renderFavorites();if(central.tab==='ferramentas')renderTools()}catch(e){logError({source:'central',message:e.message});central.aux.innerHTML='<div class="w792-empty">Falha ao carregar: '+esc(e.message)+'</div>'}
}
function installCentral(){
 if(page()!=='central.html')return;const root=document.querySelector('.page'),grid=root?.querySelector('.grid');if(!root||!grid)return;const panels=[...grid.children].filter(x=>x.classList?.contains('panel'));if(panels.length<2)return;central={...central,root,grid,panels};
 let tabs=document.getElementById('w792CentralTabs');if(!tabs){tabs=document.createElement('nav');tabs.id='w792CentralTabs';tabs.className='w792-tabs';tabs.innerHTML='<button data-tab="notificacoes">🔔 Notificações 2.0</button><button data-tab="mensagens">✉️ Mensagens</button><button data-tab="downloads">📥 Downloads</button><button data-tab="favoritos">⭐ Favoritos</button><button data-tab="ferramentas">🧰 Ferramentas</button>';grid.before(tabs);tabs.onclick=e=>{const b=e.target.closest('[data-tab]');if(b)showCentral(b.dataset.tab)}}
 let aux=document.getElementById('w792CentralAux');if(!aux){aux=document.createElement('section');aux.id='w792CentralAux';aux.className='w792-aux';grid.after(aux)}central.aux=aux;showCentral(new URLSearchParams(location.search).get('tab')||'notificacoes');
}

function installTaskFilters(){
 if(!['menu.html','minhas_tarefas.html'].includes(page()))return;if(document.getElementById('w792TaskStatus'))return;const section=document.getElementById('filtroSecao');if(!section)return;const status=document.createElement('select');status.id='w792TaskStatus';status.className=section.className;status.innerHTML='<option value="todas">Todos os status</option><option value="pendente">Pendentes</option><option value="andamento">Em andamento</option><option value="concluida">Concluídas</option>';section.insertAdjacentElement('afterend',status);
 const apply=()=>{const v=status.value;document.querySelectorAll('.kanban-column').forEach(col=>{const t=(col.className+' '+(col.querySelector('h2,h3')?.textContent||'')).toLowerCase();const kind=t.includes('concl')?'concluida':t.includes('andam')?'andamento':'pendente';col.style.display=v==='todas'||v===kind?'':'none'})};status.onchange=apply;apply();
}
function enhanceAi(){
 const starts=new WeakMap();let timer=null;
 const fix=()=>{
  document.querySelectorAll('.ai780-title span').forEach(e=>{const wanted='WEB '+VERSION+' · leitura + ações + anexos';if(e.textContent!==wanted)e.textContent=wanted});
  const typing=[...document.querySelectorAll('.ai780-typing')];
  typing.forEach(e=>{if(!starts.has(e))starts.set(e,Date.now());const sec=Math.floor((Date.now()-starts.get(e))/1000),wanted=(/anexo/i.test(e.textContent)?'Lendo anexos':'Pensando')+'… '+sec+'s';if(e.textContent!==wanted)e.textContent=wanted});
  if(typing.length&&!timer)timer=setInterval(fix,1000);
  if(!typing.length&&timer){clearInterval(timer);timer=null}
 };
 fix();const o=new MutationObserver(()=>queueMicrotask(fix));o.observe(document.body,{childList:true,subtree:true});
}
function installPreconnect(){if(document.querySelector('link[data-w792-preconnect]'))return;const l=document.createElement('link');l.rel='preconnect';l.href='https://bpvijatnsluwsgnzklrd.supabase.co';l.dataset.w792Preconnect='1';document.head.appendChild(l)}

function boot(){
 installCss();installSafeApi();installLifecycle();installPreconnect();trackDownloads();restorePending();installTaskFilters();installCentral();enhanceAi();flushQueue().catch(()=>{});
 document.documentElement.dataset.tarefasVersion=VERSION;
 window.TarefasWeb792=Object.freeze({version:VERSION,state,writeState,destinations,captureUi,flushQueue,diagnostics:()=>({version:VERSION,page:page(),online:navigator.onLine,queue:queue().length,errors:state().errors.length,favorites:state().favorites.length,filters:state().savedFilters.length,stateSchema:state().schemaVersion})});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();