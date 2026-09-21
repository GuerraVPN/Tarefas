(()=>{
'use strict';

const APP_VERSION='2.4.0',APP_BUILD=274,APP_CHANNEL='official';
const FORMAT='tarefas-tpatch-v1',CATALOG_FORMAT='tarefas-patch-catalog-v1';
const CATALOG_URL='https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/patches/catalog-v1.json';
const OFFICIAL_RAW_PREFIX='https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/patches/';
const GITHUB_CONTENTS_PREFIX='https://api.github.com/repos/GuerraVPN/Tarefas/contents/patches/';
const DB_NAME='tarefas-patches-v1',STORE='patches',DB_VERSION=1;
const SEEN_KEY='tarefasPatchNotificationsSeenV2';
const THEME_KEY='tarefasThemePinnedV2324';
const LEGACY_THEME_KEYS=['tarefasPatchTheme23235','tarefasPatchTheme23234','tarefasPatchTheme23232'];
const VALID_THEMES=new Set(['light','dark','night','military']);
const MARK='__TAREFAS_PATCH_MANAGER_V274__';
if(globalThis[MARK])return;globalThis[MARK]=true;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const hex=buffer=>Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
const sha256=async value=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value))));
const payloadText=p=>JSON.stringify({js:String(p?.js||''),css:String(p?.css||'')});
const payloadSha=p=>sha256(payloadText(p));
const fileSha=text=>sha256(String(text));
const now=()=>new Date().toISOString();
const sessionToken=()=>String(localStorage.getItem('tarefasPushSession17')||'').trim();
const getClient=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}};

function versionParts(v){return String(v||'').split('.').map(n=>Number(n)||0)}
function compareVersions(a,b){const aa=versionParts(a),bb=versionParts(b),n=Math.max(aa.length,bb.length);for(let i=0;i<n;i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d}return 0}

async function fetchOfficialText(url){
  const href=String(url||'');
  if(href.startsWith(OFFICIAL_RAW_PREFIX)){
    try{
      const name=href.slice(OFFICIAL_RAW_PREFIX.length).split('?')[0];
      const api=GITHUB_CONTENTS_PREFIX+encodeURIComponent(name)+'?ref='+encodeURIComponent('app/releases')+'&cb='+Date.now();
      const r=await fetch(api,{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
      if(r.ok){
        const meta=await r.json();
        if(meta?.encoding==='base64'&&meta?.content){
          const bin=atob(String(meta.content).replace(/\s+/g,''));
          const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
          return new TextDecoder('utf-8').decode(bytes);
        }
      }
    }catch(err){console.warn('[TAREFAS PATCH] GitHub API fallback:',err?.message||err)}
    const sep=href.includes('?')?'&':'?';
    const r=await fetch(href+sep+'cb='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error('Download oficial respondeu HTTP '+r.status+'.');
    return r.text();
  }
  const r=await fetch(href,{cache:'no-store'});
  if(!r.ok)throw new Error('Download respondeu HTTP '+r.status+'.');
  return r.text();
}

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('Falha ao abrir armazenamento de patches.'));
  });
}
async function tx(mode,fn){
  const db=await openDb();
  try{return await new Promise((resolve,reject)=>{
    const t=db.transaction(STORE,mode),s=t.objectStore(STORE);let result;
    try{result=fn(s)}catch(e){reject(e);return}
    t.oncomplete=()=>resolve(result?.result??result);
    t.onerror=()=>reject(t.error||new Error('Falha no armazenamento de patches.'));
    t.onabort=()=>reject(t.error||new Error('Operação de patch cancelada.'));
  })}finally{db.close()}
}
const getAll=()=>tx('readonly',s=>s.getAll());
const put=p=>tx('readwrite',s=>s.put(p));
const remove=id=>tx('readwrite',s=>s.delete(id));

function compatible(p){
  if(!p||p.format!==FORMAT)return false;
  if(String(p.baseVersion||'')!==APP_VERSION)return false;
  const min=Number(p.minBuild||0),max=p.maxBuild==null?Number.MAX_SAFE_INTEGER:Number(p.maxBuild);
  return APP_BUILD>=min&&APP_BUILD<=max;
}
async function validatePatch(p){
  if(!p||p.format!==FORMAT)throw new Error('Formato .tpatch inválido.');
  if(!/^[A-Za-z0-9._-]{3,80}$/.test(String(p.id||'')))throw new Error('ID do patch inválido.');
  if(!p.name)throw new Error('Nome do patch ausente.');
  if(!p.payload||typeof p.payload!=='object')throw new Error('Payload do patch ausente.');
  const actual=await payloadSha(p.payload);
  if(String(p.payloadSha256||'').toLowerCase()!==actual)throw new Error('SHA-256 interno do patch não confere.');
  if(!compatible(p))throw new Error(`Patch incompatível. Ele exige ${p.baseVersion||'?'} / build ${p.minBuild||'?'}–${p.maxBuild??'+'}; este app é ${APP_VERSION} / build ${APP_BUILD}.`);
  return {...p,payloadSha256:actual};
}
async function parsePatchText(text){
  let p;try{p=JSON.parse(text)}catch{throw new Error('O arquivo selecionado não é um .tpatch JSON válido.')}
  return validatePatch(p);
}
async function replaceOlderSameBase(next){
  if(!(next?.cumulative===true||next?.replacementMode==='replace-older-same-base'))return 0;
  const rows=await getAll().catch(()=>[]);let removed=0;
  for(const p of rows){
    if(String(p?.baseVersion||'')!==String(next.baseVersion||''))continue;
    const id=String(p?.id||'');
    if(id&&id!==String(next.id)&&compareVersions(id,next.id)<0){await remove(id);removed++}
  }
  return removed;
}

function styleId(id){return 'tarefas-patch-style-'+String(id).replace(/[^a-z0-9_-]/gi,'_')}
function runPatch(p){
  if(p.payload?.css){
    let style=document.getElementById(styleId(p.id));
    if(!style){style=document.createElement('style');style.id=styleId(p.id);style.dataset.tarefasPatch=p.id;document.head.appendChild(style)}
    style.textContent=String(p.payload.css);
  }
  if(p.payload?.js){
    const fn=new Function('window','document','globalThis',`"use strict";\n${String(p.payload.js)}\n//# sourceURL=tpatch-${String(p.id).replace(/[^a-z0-9._-]/gi,'_')}.js`);
    fn(window,document,globalThis);
  }
}

let effectiveVersion=APP_VERSION;
function refreshEffectiveVersion(){
  document.documentElement.dataset.tarefasAppVersion=APP_VERSION;
  document.documentElement.dataset.tarefasAppBuild=String(APP_BUILD);
  document.documentElement.dataset.tarefasEffectiveVersion=effectiveVersion;
  document.querySelectorAll('.tm-app-brand small').forEach(el=>{
    const web=el.textContent.match(/WEB\s*([0-9.]+)/i)?.[1]||'7.8.6';
    const wanted=effectiveVersion+' • WEB '+web;
    if(el.textContent.trim()!==wanted)el.textContent=wanted;
  });
}
function installVersionObserver(){
  let scheduled=false;
  const schedule=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;refreshEffectiveVersion()})};
  schedule();
  const obs=new MutationObserver(schedule);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('focus',schedule);
  window.addEventListener('pageshow',schedule);
}
async function applyInstalled(){
  const all=await getAll().catch(()=>[]);
  const enabled=all.filter(p=>p.enabled!==false&&compatible(p)).sort((a,b)=>Number(a.order||0)-Number(b.order||0));
  const applied=[];
  for(const p of enabled){
    try{await validatePatch(p);runPatch(p);applied.push(p.id)}
    catch(err){console.error('[TAREFAS PATCH]',p.id,err);p.lastError=String(err?.message||err);p.enabled=false;await put(p).catch(()=>{})}
  }
  if(applied.length)effectiveVersion=applied.slice().sort(compareVersions).at(-1)||APP_VERSION;
  globalThis.__TAREFAS_EFFECTIVE_VERSION__=effectiveVersion;
  globalThis.__TAREFAS_APPLIED_PATCHES__=applied;
  document.documentElement.dataset.tarefasPatches=String(applied.length);
  refreshEffectiveVersion();
  return applied;
}

function parseJson(v){if(!v)return null;if(typeof v==='object')return v;try{return JSON.parse(v)}catch{return null}}
function currentUser(){return parseJson(localStorage.getItem('usuarioLogado'))}
function prefKey(){const u=currentUser();return u?.id!=null?'prefs_usuario_'+u.id:null}
function normTheme(v){v=String(v||'');return VALID_THEMES.has(v)?v:null}
function readTheme(){
  const pinned=normTheme(localStorage.getItem(THEME_KEY));if(pinned)return pinned;
  for(const k of LEGACY_THEME_KEYS){const t=normTheme(localStorage.getItem(k));if(t)return t}
  const key=prefKey(),prefs=key?parseJson(localStorage.getItem(key)):null;
  return normTheme(prefs?.tema)||normTheme(document.documentElement.dataset.theme)||normTheme(document.body?.dataset.theme)||'light';
}
let desiredTheme=readTheme(),applyingTheme=false;
function persistTheme(theme){
  theme=normTheme(theme);if(!theme)return desiredTheme;desiredTheme=theme;
  try{localStorage.setItem(THEME_KEY,theme);for(const k of LEGACY_THEME_KEYS)localStorage.removeItem(k)}catch(_){}
  try{const key=prefKey();if(key){const prefs=parseJson(localStorage.getItem(key))||{};prefs.tema=theme;localStorage.setItem(key,JSON.stringify(prefs))}}catch(_){}
  return theme;
}
function applyTheme(theme=desiredTheme){
  theme=persistTheme(theme);if(!theme||applyingTheme)return;applyingTheme=true;
  try{
    document.documentElement.dataset.theme=theme;if(document.body)document.body.dataset.theme=theme;
    document.documentElement.style.colorScheme=(theme==='light'||theme==='military')?'light':'dark';
    try{window.Temas26?.aplicar?.(theme,true)}catch(_){}
    window.dispatchEvent(new CustomEvent('prefs26:update',{detail:{tema:theme,source:'beta-2.3.24',localFirst:true}}));
  }finally{queueMicrotask(()=>{applyingTheme=false})}
}
function installThemeGuard(){
  applyTheme(desiredTheme);
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-theme-choice]');const t=normTheme(b?.dataset?.themeChoice);if(t)applyTheme(t)},true);
  document.addEventListener('change',e=>{if(e.target?.id==='tema'){const t=normTheme(e.target.value);if(t)applyTheme(t)}},true);
  const obs=new MutationObserver(()=>{const h=normTheme(document.documentElement.dataset.theme),b=normTheme(document.body?.dataset.theme);if((h&&h!==desiredTheme)||(b&&b!==desiredTheme))setTimeout(()=>applyTheme(desiredTheme),0)});
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  if(document.body)obs.observe(document.body,{attributes:true,attributeFilter:['data-theme']});
}

async function catalog(){
  const text=await fetchOfficialText(CATALOG_URL);
  let data;try{data=JSON.parse(text)}catch{throw new Error('Catálogo de patches inválido.')}
  if(data?.format!==CATALOG_FORMAT||!Array.isArray(data.patches))throw new Error('Catálogo de patches inválido.');
  return data;
}
async function installOfficial(meta){
  const url=String(meta?.url||'');
  if(!url.startsWith(OFFICIAL_RAW_PREFIX))throw new Error('Origem oficial do patch inválida.');
  markPatchSeen(meta?.id);
  const text=await fetchOfficialText(url);
  const actual=await fileSha(text);
  if(String(meta.sha256||'').toLowerCase()!==actual)throw new Error('SHA-256 do arquivo oficial não confere.');
  const p=await parsePatchText(text);
  if(meta.id&&String(meta.id)!==p.id)throw new Error('ID do catálogo não corresponde ao patch.');
  await replaceOlderSameBase(p);
  await put({...p,enabled:true,source:'official',catalogSha256:actual,installedAt:now(),order:Number(p.order||Date.now())});
  location.reload();
}
async function importManual(file){
  const text=await file.text(),p=await parsePatchText(text);
  await replaceOlderSameBase(p);
  await put({...p,enabled:true,source:'manual',installedAt:now(),order:Number(p.order||Date.now())});
  location.reload();
}
async function setEnabled(id,enabled){const all=await getAll(),p=all.find(x=>x.id===id);if(!p)return;p.enabled=!!enabled;p.updatedAt=now();await put(p);location.reload()}
async function uninstall(id){await remove(id);location.reload()}

function readSeen(){try{const a=JSON.parse(localStorage.getItem(SEEN_KEY)||'[]');return new Set(Array.isArray(a)?a.map(String):[])}catch{return new Set()}}
function writeSeen(seen){try{localStorage.setItem(SEEN_KEY,JSON.stringify([...seen].slice(-100)))}catch(_){}}
function markPatchSeen(id){id=String(id||'').trim();if(!id)return;const seen=readSeen();seen.add(id);writeSeen(seen)}
async function channelPreferences(){
  const token=sessionToken(),c=getClient();let beta=false,alpha=false,alphaEligible=false;
  if(!token||!c)return{beta,alpha,alphaEligible};
  try{const r=await c.rpc('v1_8_get_beta_updates',{p_session_token:token});if(!r.error)beta=r.data===true}catch(_){}
  try{const r=await c.rpc('v2_3_21_alpha_context',{p_session_token:token});if(!r.error){const row=Array.isArray(r.data)?r.data[0]:r.data;alphaEligible=row?.eligible===true;alpha=alphaEligible&&row?.receive_alpha===true}}catch(_){}
  return{beta,alpha,alphaEligible};
}
function allowedByPreference(row,prefs){
  const ch=String(row?.channel||'alpha').toLowerCase();
  if(ch==='official')return true;
  if(ch==='beta')return prefs.beta===true;
  return prefs.alpha===true;
}
async function isPatchInstalled(id){const rows=await getAll().catch(()=>[]);return rows.some(p=>String(p?.id||'')===String(id)&&p?.enabled!==false)}
async function notifyPatch(row){
  const ch=String(row.channel||'alpha').toUpperCase();
  const title='Patch '+ch+' '+row.id+' disponível';
  const body=row.description||row.name||'Novo patch do TAREFAS disponível.';
  try{
    const fn=window.TarefasNative?.notifications?.notify;
    if(fn){await fn({title,body,extra:{tipo:'app_patch',channel:String(row.channel||'alpha'),patch_id:String(row.id),destino_url:'about.html?patch='+encodeURIComponent(row.id)}});window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));return true}
  }catch(err){console.warn('[TAREFAS PATCH] notificação nativa:',err?.message||err)}
  try{if('Notification'in window&&Notification.permission==='granted'){new Notification(title,{body,tag:'tarefas-patch-'+row.id});return true}}catch(_){}
  return false;
}
let notificationCheck=null;
async function checkPatchNotifications(){
  if(notificationCheck)return notificationCheck;
  notificationCheck=(async()=>{
    const [c,prefs,installed]=await Promise.all([catalog(),channelPreferences(),getAll().catch(()=>[])]);
    const seen=readSeen();for(const p of installed)seen.add(String(p.id));writeSeen(seen);
    const rows=(c.patches||[]).filter(p=>compatible({...p,format:FORMAT})&&p.installable!==false).sort((a,b)=>compareVersions(a.id,b.id));
    for(const row of rows){
      if(!row.id||seen.has(String(row.id))||!allowedByPreference(row,prefs))continue;
      if(await isPatchInstalled(row.id)){markPatchSeen(row.id);continue}
      markPatchSeen(row.id);
      const sent=await notifyPatch(row);
      if(!sent&&!(await isPatchInstalled(row.id))){const again=readSeen();again.delete(String(row.id));writeSeen(again)}
    }
  })().finally(()=>{notificationCheck=null});
  return notificationCheck;
}

function css(){
  if(document.getElementById('tmPatchManagerStyle'))return;
  const s=document.createElement('style');s.id='tmPatchManagerStyle';s.textContent=`
  .tm-patch-card{margin-top:14px;margin-bottom:14px}.tm-patch-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.tm-patch-actions button,.tm-patch-import-label{border:0;border-radius:10px;padding:10px 13px;font-weight:800;cursor:pointer;background:var(--v4-text,#111827);color:var(--v4-surface,#fff)}.tm-patch-import-label input{display:none}.tm-patch-list{display:grid;gap:9px}.tm-patch-item,.tm-patch-history-item{border:1px solid var(--v4-border,#e5e7eb);border-radius:12px;padding:11px;background:var(--v4-surface,#fff)}.tm-patch-head,.tm-patch-history-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.tm-patch-head strong,.tm-patch-history-head strong{display:block}.tm-patch-head small,.tm-patch-history-head small{display:block;opacity:.72;margin-top:3px}.tm-patch-badge,.tm-patch-history-badge{font-size:10px;font-weight:900;border-radius:999px;padding:5px 8px;background:#eef2ff;color:#3730a3;white-space:nowrap}.tm-patch-badge.manual{background:#fff7ed;color:#9a3412}.tm-patch-badge.off{background:#f3f4f6;color:#4b5563}.tm-patch-item p,.tm-patch-history-item p{margin:8px 0;font-size:12px;line-height:1.45}.tm-patch-buttons{display:flex;gap:7px;flex-wrap:wrap}.tm-patch-buttons button{border:1px solid var(--v4-border,#d1d5db);background:transparent;color:inherit;border-radius:9px;padding:7px 9px;font-size:11px;font-weight:800}.tm-patch-status{font-size:12px;opacity:.78;margin:7px 0}.tm-patch-warning{font-size:11px;opacity:.72;margin-top:8px}.tm-patch-empty{padding:12px;border:1px dashed var(--v4-border,#d1d5db);border-radius:10px;font-size:12px;opacity:.75}.tm-patch-history{margin-top:18px;padding-top:14px;border-top:1px solid var(--v4-border,#d1d5db)}.tm-patch-history h3{margin:0 0 10px}.tm-patch-history-item ul{margin:8px 0 0;padding-left:20px;font-size:12px;line-height:1.5}
  `;document.head.appendChild(s);
}
function itemHtml(p){
  const on=p.enabled!==false,source=p.source==='official'?'OFICIAL':'IMPORTADO';
  return `<article class="tm-patch-item"><div class="tm-patch-head"><div><strong>${esc(p.name)}</strong><small>${esc(p.id)} • base ${esc(p.baseVersion)} • build ${esc(p.minBuild)}${p.maxBuild!=null?'–'+esc(p.maxBuild):'+'}</small></div><span class="tm-patch-badge ${p.source==='manual'?'manual':''} ${on?'':'off'}">${on?source:'DESATIVADO'}</span></div><p>${esc(p.description||'Patch do TAREFAS.')}</p><div class="tm-patch-buttons"><button data-patch-toggle="${esc(p.id)}">${on?'Reverter / desativar':'Ativar novamente'}</button><button data-patch-remove="${esc(p.id)}">Remover</button></div></article>`;
}
async function renderHistory(box,installed){
  const target=box.querySelector('#tmPatchHistory');if(!target)return;
  target.innerHTML='<div class="tm-patch-empty">Carregando histórico…</div>';
  try{
    const c=await catalog(),map=new Map(installed.map(p=>[String(p.id),p]));
    const rows=(Array.isArray(c.history)?c.history:c.patches||[]).filter(p=>String(p.baseVersion||'')===APP_VERSION).sort((a,b)=>compareVersions(b.id,a.id));
    target.innerHTML=rows.length?rows.map(row=>{
      const p=map.get(String(row.id)),state=p?(p.enabled===false?'DESATIVADO':'INSTALADO'):(row.installable===false?'ANTERIOR':'DISPONÍVEL');
      const changes=Array.isArray(row.changelog)&&row.changelog.length?'<ul>'+row.changelog.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'';
      return `<article class="tm-patch-history-item"><div class="tm-patch-history-head"><div><strong>${esc(row.id)}</strong><small>${esc(row.name||'Patch TAREFAS')}</small></div><span class="tm-patch-history-badge">${esc(state)}</span></div><p>${esc(row.description||'')}</p>${changes}</article>`;
    }).join(''):'<div class="tm-patch-empty">Ainda não há patches publicados para a Beta 2.3.24.</div>';
  }catch(err){target.innerHTML='<div class="tm-patch-empty">Não foi possível carregar o histórico: '+esc(err?.message||err)+'</div>'}
}
async function renderManager(){
  css();
  const root=document.getElementById('tmAppUpdates');if(!root)return false;
  let box=document.getElementById('tmPatchManager');
  if(!box){
    box=document.createElement('section');box.id='tmPatchManager';box.className='tm-update-card tm-patch-card';
    const main=root.querySelector('.tm-update-main');if(main)main.insertAdjacentElement('afterend',box);else root.prepend(box);
  }
  const installed=(await getAll().catch(()=>[])).filter(p=>String(p.baseVersion||'')===APP_VERSION).sort((a,b)=>compareVersions(b.id,a.id));
  box.innerHTML=`<div class="tm-update-title"><div><span class="tm-update-eyebrow">PATCHES</span><h2>Gerenciador de Patches</h2></div><span class="tm-update-channel beta">OFICIAL ${APP_VERSION}</span></div><p class="tm-patch-status">Base compatível: <b>${APP_VERSION}</b> • build <b>${APP_BUILD}</b>. Patches novos substituem automaticamente os anteriores da mesma base quando forem cumulativos.</p><div class="tm-patch-actions"><button id="tmPatchCheck">Verificar patches oficiais</button><label class="tm-patch-import-label">Importar .tpatch<input id="tmPatchFile" type="file" accept=".tpatch,application/json"></label></div><div id="tmPatchOfficial"></div><h3>Patches instalados</h3><div class="tm-patch-list">${installed.length?installed.map(itemHtml).join(''):'<div class="tm-patch-empty">Nenhum patch instalado nesta base.</div>'}</div><div class="tm-patch-history"><h3>Histórico de patches</h3><div id="tmPatchHistory"></div></div><div class="tm-patch-warning">Patches oficiais são validados por SHA-256 do catálogo e SHA-256 interno do payload. Arquivos importados manualmente executam código no app; use somente fontes confiáveis.</div>`;

  box.querySelector('#tmPatchFile')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importManual(f)}catch(err){alert(err?.message||err)}finally{e.target.value=''}});
  box.querySelector('#tmPatchCheck')?.addEventListener('click',async()=>{
    const checkButton=box.querySelector('#tmPatchCheck');
    if(checkButton?.dataset.busy==='1')return;
    if(checkButton){checkButton.dataset.busy='1';checkButton.disabled=true;checkButton.textContent='Verificando patches…'}
    const target=box.querySelector('#tmPatchOfficial');target.innerHTML='<div class="tm-patch-empty">Consultando catálogo…</div>';
    try{
      const c=await catalog(),rows=(c.patches||[]).filter(p=>String(p.baseVersion||'')===APP_VERSION&&APP_BUILD>=Number(p.minBuild||0)&&APP_BUILD<=Number(p.maxBuild??Number.MAX_SAFE_INTEGER)&&p.installable!==false);
      const have=new Set((await getAll()).map(x=>String(x.id)));
      target.innerHTML=rows.length?'<div class="tm-patch-list">'+rows.map(p=>`<article class="tm-patch-item"><div class="tm-patch-head"><div><strong>${esc(p.name)}</strong><small>${esc(p.id)} • ${esc(String(p.channel||'alpha').toUpperCase())}</small></div><span class="tm-patch-badge">OFICIAL</span></div><p>${esc(p.description||'Patch oficial disponível.')}</p><div class="tm-patch-buttons"><button data-install-official="${esc(p.id)}" ${have.has(String(p.id))?'disabled':''}>${have.has(String(p.id))?'Instalado':'Baixar e aplicar'}</button></div></article>`).join('')+'</div>':'<div class="tm-patch-empty">Nenhum patch oficial novo para esta Beta.</div>';
      target.querySelectorAll('[data-install-official]').forEach(btn=>btn.addEventListener('click',async()=>{const p=rows.find(x=>String(x.id)===btn.dataset.installOfficial);if(!p)return;markPatchSeen(p.id);btn.disabled=true;btn.textContent='Aplicando…';try{await installOfficial(p)}catch(err){btn.disabled=false;btn.textContent='Baixar e aplicar';alert(err?.message||err)}}));
    }catch(err){target.innerHTML='<div class="tm-patch-empty">Falha ao consultar patches: '+esc(err?.message||err)+'</div>'}
    finally{
      if(checkButton){delete checkButton.dataset.busy;checkButton.disabled=false;checkButton.textContent='Verificar patches oficiais'}
      window.dispatchEvent(new CustomEvent('tarefas:patch-official-refreshed',{detail:{at:Date.now()}}));
    }
  });
  box.querySelectorAll('[data-patch-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const p=installed.find(x=>String(x.id)===btn.dataset.patchToggle);if(p)setEnabled(p.id,p.enabled===false).catch(err=>alert(err?.message||err))}));
  box.querySelectorAll('[data-patch-remove]').forEach(btn=>btn.addEventListener('click',()=>{const p=installed.find(x=>String(x.id)===btn.dataset.patchRemove);if(p&&confirm('Remover o patch '+p.name+'? O app será recarregado.'))uninstall(p.id).catch(err=>alert(err?.message||err))}));
  renderHistory(box,installed);
  return true;
}
function attachUi(){
  let tries=0;const timer=setInterval(()=>{tries++;if(renderManager()||tries>80)clearInterval(timer)},125);
  const obs=new MutationObserver(()=>{if(document.getElementById('tmAppUpdates')&&!document.getElementById('tmPatchManager'))renderManager().catch(()=>{})});
  obs.observe(document.documentElement,{childList:true,subtree:true});
}
function installNotificationWatcher(){
  queueMicrotask(()=>checkPatchNotifications().catch(()=>{}));
  window.addEventListener('focus',()=>checkPatchNotifications().catch(()=>{}));
  window.addEventListener('online',()=>checkPatchNotifications().catch(()=>{}));
  window.addEventListener('pageshow',()=>checkPatchNotifications().catch(()=>{}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkPatchNotifications().catch(()=>{})});
  setInterval(()=>{if(!document.hidden)checkPatchNotifications().catch(()=>{})},15*60*1000);
}

globalThis.TarefasPatchManager={
  version:APP_VERSION,build:APP_BUILD,channel:APP_CHANNEL,format:FORMAT,catalogUrl:CATALOG_URL,
  list:getAll,verify:validatePatch,importFile:importManual,checkCatalog:catalog,setEnabled,remove:uninstall,
  checkNotifications:checkPatchNotifications,markSeen:markPatchSeen,isInstalled:isPatchInstalled,preferences:channelPreferences
};

installVersionObserver();
installThemeGuard();
applyInstalled().finally(()=>{
  installNotificationWatcher();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachUi,{once:true});else attachUi();
});
})();
;(()=>{
'use strict';
const MARK='__TAREFAS_ALPHA_AUTO_PATCH_CHECK_V274__';
if(globalThis[MARK])return;globalThis[MARK]=true;
const INTERVAL=5*60*1000;
let running=false,lastRun=0;

async function autoCheckOfficialPatches(){
  if(running||navigator.onLine===false)return false;
  const manager=globalThis.TarefasPatchManager;
  if(!manager?.preferences)return false;
  running=true;
  try{
    const prefs=await manager.preferences();
    if(prefs?.alpha!==true)return false;
    const button=document.getElementById('tmPatchCheck');
    if(!button||button.dataset.busy==='1')return false;
    if(Date.now()-lastRun<15000)return false;
    lastRun=Date.now();
    button.click();
    return true;
  }catch(_){return false}
  finally{running=false}
}

const trigger=()=>setTimeout(()=>autoCheckOfficialPatches().catch(()=>{}),250);
queueMicrotask(trigger);
window.addEventListener('online',trigger);
window.addEventListener('focus',trigger);
window.addEventListener('pageshow',trigger);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)trigger()});
window.addEventListener('tarefas:versions-synced',trigger);
setInterval(()=>{if(!document.hidden)autoCheckOfficialPatches().catch(()=>{})},INTERVAL);

globalThis.TarefasAlphaAutoPatchCheckV274=Object.freeze({
  version:'2.4.0',build:274,intervalMs:INTERVAL,run:autoCheckOfficialPatches
});
})();
