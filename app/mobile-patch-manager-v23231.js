(()=>{
'use strict';
const APP_VERSION='2.3.23.1',APP_BUILD=270;
const FORMAT='tarefas-tpatch-v1';
const CATALOG_FORMAT='tarefas-patch-catalog-v1';
const CATALOG_URL='https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/patches/catalog-v1.json';
const DB_NAME='tarefas-patches-v1',STORE='patches',DB_VERSION=1;
const MARK='__TAREFAS_PATCH_MANAGER_V270__';
if(globalThis[MARK])return;globalThis[MARK]=true;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const hex=buffer=>Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
const sha256=async value=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value))));
const payloadText=p=>JSON.stringify({js:String(p?.js||''),css:String(p?.css||'')});
const payloadSha=p=>sha256(payloadText(p));
const fileSha=text=>sha256(String(text));
const now=()=>new Date().toISOString();

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Falha ao abrir armazenamento de patches.'));
  });
}
async function tx(mode,fn){
  const db=await openDb();
  try{return await new Promise((resolve,reject)=>{
    const t=db.transaction(STORE,mode),s=t.objectStore(STORE);
    let result;
    try{result=fn(s)}catch(e){reject(e);return}
    t.oncomplete=()=>resolve(result?.result??result);t.onerror=()=>reject(t.error||new Error('Falha no armazenamento de patches.'));t.onabort=()=>reject(t.error||new Error('Operação de patch cancelada.'));
  })}finally{db.close()}
}
const getAll=()=>tx('readonly',s=>s.getAll());
const put=patch=>tx('readwrite',s=>s.put(patch));
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
async function applyInstalled(){
  const all=await getAll().catch(()=>[]);
  const enabled=all.filter(p=>p.enabled!==false&&compatible(p)).sort((a,b)=>Number(a.order||0)-Number(b.order||0));
  const applied=[];
  for(const p of enabled){
    try{await validatePatch(p);runPatch(p);applied.push(p.id)}
    catch(err){console.error('[TAREFAS PATCH]',p.id,err);p.lastError=String(err?.message||err);p.enabled=false;await put(p).catch(()=>{})}
  }
  document.documentElement.dataset.tarefasPatches=String(applied.length);
  globalThis.__TAREFAS_APPLIED_PATCHES__=applied;
  return applied;
}

async function catalog(){
  const res=await fetch(CATALOG_URL,{cache:'no-store'});
  if(!res.ok)throw new Error(`Catálogo respondeu HTTP ${res.status}.`);
  const data=await res.json();
  if(data?.format!==CATALOG_FORMAT||!Array.isArray(data.patches))throw new Error('Catálogo de patches inválido.');
  return data;
}
async function installOfficial(meta){
  const url=String(meta?.url||'');
  if(!url.startsWith('https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/patches/'))throw new Error('Origem oficial do patch inválida.');
  const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw new Error(`Download do patch falhou: HTTP ${res.status}.`);
  const text=await res.text();
  const actual=await fileSha(text);
  if(String(meta.sha256||'').toLowerCase()!==actual)throw new Error('SHA-256 do arquivo oficial não confere.');
  const p=await parsePatchText(text);
  if(meta.id&&String(meta.id)!==p.id)throw new Error('ID do catálogo não corresponde ao patch.');
  await put({...p,enabled:true,source:'official',catalogSha256:actual,installedAt:now(),order:Number(p.order||Date.now())});
  location.reload();
}
async function importManual(file){
  const text=await file.text(),p=await parsePatchText(text);
  await put({...p,enabled:true,source:'manual',installedAt:now(),order:Number(p.order||Date.now())});
  location.reload();
}
async function setEnabled(id,enabled){
  const all=await getAll(),p=all.find(x=>x.id===id);if(!p)return;
  p.enabled=!!enabled;p.updatedAt=now();await put(p);location.reload();
}
async function uninstall(id){await remove(id);location.reload()}

function css(){
  if(document.getElementById('tmPatchManagerStyle'))return;
  const s=document.createElement('style');s.id='tmPatchManagerStyle';s.textContent=`
  .tm-patch-card{margin-top:14px}.tm-patch-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.tm-patch-actions button,.tm-patch-import-label{border:0;border-radius:10px;padding:10px 13px;font-weight:800;cursor:pointer;background:var(--v4-text,#111827);color:var(--v4-surface,#fff)}.tm-patch-import-label input{display:none}.tm-patch-list{display:grid;gap:9px}.tm-patch-item{border:1px solid var(--v4-border,#e5e7eb);border-radius:12px;padding:11px;background:var(--v4-surface,#fff)}.tm-patch-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.tm-patch-head strong{display:block}.tm-patch-head small{display:block;opacity:.72;margin-top:3px}.tm-patch-badge{font-size:10px;font-weight:900;border-radius:999px;padding:5px 8px;background:#eef2ff;color:#3730a3;white-space:nowrap}.tm-patch-badge.manual{background:#fff7ed;color:#9a3412}.tm-patch-badge.off{background:#f3f4f6;color:#4b5563}.tm-patch-item p{margin:8px 0;font-size:12px}.tm-patch-buttons{display:flex;gap:7px;flex-wrap:wrap}.tm-patch-buttons button{border:1px solid var(--v4-border,#d1d5db);background:transparent;color:inherit;border-radius:9px;padding:7px 9px;font-size:11px;font-weight:800}.tm-patch-status{font-size:12px;opacity:.78;margin:7px 0}.tm-patch-warning{font-size:11px;opacity:.72;margin-top:8px}.tm-patch-empty{padding:12px;border:1px dashed var(--v4-border,#d1d5db);border-radius:10px;font-size:12px;opacity:.75}
  `;document.head.appendChild(s);
}
function itemHtml(p){
  const on=p.enabled!==false,source=p.source==='official'?'OFICIAL':'IMPORTADO';
  return `<article class="tm-patch-item"><div class="tm-patch-head"><div><strong>${esc(p.name)}</strong><small>${esc(p.id)} • base ${esc(p.baseVersion)} • build ${esc(p.minBuild)}${p.maxBuild!=null?'–'+esc(p.maxBuild):'+'}</small></div><span class="tm-patch-badge ${p.source==='manual'?'manual':''} ${on?'':'off'}">${on?source:'DESATIVADO'}</span></div><p>${esc(p.description||'Patch do TAREFAS.')}</p><div class="tm-patch-buttons"><button data-patch-toggle="${esc(p.id)}">${on?'Reverter / desativar':'Ativar novamente'}</button><button data-patch-remove="${esc(p.id)}">Remover</button></div></article>`;
}
async function renderManager(){
  css();
  const root=document.getElementById('tmAppUpdates');if(!root)return false;
  let box=document.getElementById('tmPatchManager');
  if(!box){box=document.createElement('section');box.id='tmPatchManager';box.className='tm-update-card tm-patch-card';root.appendChild(box)}
  const installed=(await getAll().catch(()=>[])).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  box.innerHTML=`<div class="tm-update-title"><div><span class="tm-update-eyebrow">PATCHES</span><h2>Gerenciador de patches</h2></div><span class="tm-update-channel beta">ALPHA</span></div><p class="tm-patch-status">Base compatível: <b>${APP_VERSION}</b> • build <b>${APP_BUILD}</b>. Correções pequenas podem ser aplicadas sem reinstalar o APK.</p><div class="tm-patch-actions"><button id="tmPatchCheck">Verificar patches oficiais</button><label class="tm-patch-import-label">Importar .tpatch<input id="tmPatchFile" type="file" accept=".tpatch,application/json"></label></div><div id="tmPatchOfficial"></div><h3>Patches instalados</h3><div class="tm-patch-list">${installed.length?installed.map(itemHtml).join(''):'<div class="tm-patch-empty">Nenhum patch instalado.</div>'}</div><div class="tm-patch-warning">Patches oficiais são conferidos por SHA-256 do catálogo e pelo SHA-256 interno do payload. Patches importados manualmente executam código no app; importe somente arquivos de origem confiável.</div>`;
  box.querySelector('#tmPatchFile')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importManual(f)}catch(err){alert(err?.message||err)}finally{e.target.value=''}});
  box.querySelector('#tmPatchCheck')?.addEventListener('click',async()=>{
    const target=box.querySelector('#tmPatchOfficial');target.innerHTML='<div class="tm-patch-empty">Consultando catálogo…</div>';
    try{
      const c=await catalog(),rows=c.patches.filter(p=>String(p.baseVersion||'')===APP_VERSION&&APP_BUILD>=Number(p.minBuild||0)&&APP_BUILD<=Number(p.maxBuild??Number.MAX_SAFE_INTEGER));
      const have=new Set((await getAll()).map(x=>x.id));
      target.innerHTML=rows.length?'<div class="tm-patch-list">'+rows.map(p=>`<article class="tm-patch-item"><div class="tm-patch-head"><div><strong>${esc(p.name)}</strong><small>${esc(p.id)}</small></div><span class="tm-patch-badge">OFICIAL</span></div><p>${esc(p.description||'Patch oficial disponível.')}</p><div class="tm-patch-buttons"><button data-install-official="${esc(p.id)}" ${have.has(p.id)?'disabled':''}>${have.has(p.id)?'Instalado':'Baixar e aplicar'}</button></div></article>`).join('')+'</div>':'<div class="tm-patch-empty">Nenhum patch oficial novo para esta Alpha.</div>';
      target.querySelectorAll('[data-install-official]').forEach(btn=>btn.addEventListener('click',async()=>{const p=rows.find(x=>x.id===btn.dataset.installOfficial);if(!p)return;btn.disabled=true;btn.textContent='Aplicando…';try{await installOfficial(p)}catch(err){btn.disabled=false;btn.textContent='Baixar e aplicar';alert(err?.message||err)}}));
    }catch(err){target.innerHTML=`<div class="tm-patch-empty">Falha ao consultar patches: ${esc(err?.message||err)}</div>`}
  });
  box.querySelectorAll('[data-patch-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const p=installed.find(x=>x.id===btn.dataset.patchToggle);if(p)setEnabled(p.id,p.enabled===false).catch(err=>alert(err?.message||err))}));
  box.querySelectorAll('[data-patch-remove]').forEach(btn=>btn.addEventListener('click',()=>{const p=installed.find(x=>x.id===btn.dataset.patchRemove);if(p&&confirm(`Remover o patch ${p.name}? O app será recarregado.`))uninstall(p.id).catch(err=>alert(err?.message||err))}));
  return true;
}
function attachUi(){
  let tries=0;const timer=setInterval(()=>{tries++;if(renderManager()||tries>80)clearInterval(timer)},125);
  const obs=new MutationObserver(()=>{if(document.getElementById('tmAppUpdates')&&!document.getElementById('tmPatchManager'))renderManager().catch(()=>{})});obs.observe(document.documentElement,{childList:true,subtree:true});
}
globalThis.TarefasPatchManager={version:APP_VERSION,build:APP_BUILD,format:FORMAT,catalogUrl:CATALOG_URL,list:getAll,verify:validatePatch,importFile:importManual,checkCatalog:catalog,setEnabled,remove:uninstall};
applyInstalled().finally(()=>{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachUi,{once:true});else attachUi()});
})();