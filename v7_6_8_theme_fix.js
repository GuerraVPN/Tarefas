(function(){
'use strict';
if(window.__TAREFAS_V768_THEME_FIX__)return;
window.__TAREFAS_V768_THEME_FIX__=true;
const VALID=new Set(['light','dark','night','military']);
const VARS={
 light:{'--v4-bg':'#eef1f5','--v4-surface':'#ffffff','--v4-surface-2':'#f7f8fa','--v4-surface-3':'#e9edf2','--v4-text':'#111827','--v4-text-2':'#374151','--v4-muted':'#6b7280','--v4-border':'#dfe4ea','--v4-border-strong':'#c7ced8','--v4-sidebar':'#101827','--v4-sidebar-hover':'#1d2939','--v4-sidebar-text':'#e5e7eb','--v4-accent':'#059669','--v4-accent-hover':'#047857','--v4-accent-soft':'#d1fae5','--v4-gold':'#eab308','--v4-danger':'#dc2626','--v4-warning':'#d97706','--v4-info':'#2563eb','--v4-shadow':'rgba(15,23,42,.10)'},
 dark:{'--v4-bg':'#14171c','--v4-surface':'#20242a','--v4-surface-2':'#272c33','--v4-surface-3':'#30363f','--v4-text':'#f3f4f6','--v4-text-2':'#d1d5db','--v4-muted':'#a0a8b5','--v4-border':'#3b424d','--v4-border-strong':'#515b69','--v4-sidebar':'#0c0f14','--v4-sidebar-hover':'#262c35','--v4-sidebar-text':'#e5e7eb','--v4-accent':'#10b981','--v4-accent-hover':'#34d399','--v4-accent-soft':'#153e33','--v4-gold':'#facc15','--v4-danger':'#fb7185','--v4-warning':'#fbbf24','--v4-info':'#60a5fa','--v4-shadow':'rgba(0,0,0,.36)'},
 night:{'--v4-bg':'#050912','--v4-surface':'#0c1422','--v4-surface-2':'#111c2d','--v4-surface-3':'#18263b','--v4-text':'#e1eaf7','--v4-text-2':'#c1cee0','--v4-muted':'#8798b1','--v4-border':'#203451','--v4-border-strong':'#304c71','--v4-sidebar':'#02060d','--v4-sidebar-hover':'#101e32','--v4-sidebar-text':'#d5e0ef','--v4-accent':'#3b82f6','--v4-accent-hover':'#60a5fa','--v4-accent-soft':'#102b4d','--v4-gold':'#d6b856','--v4-danger':'#fb7185','--v4-warning':'#f59e0b','--v4-info':'#60a5fa','--v4-shadow':'rgba(0,0,0,.55)'},
 military:{'--v4-bg':'#d7d3bb','--v4-surface':'#ece9d2','--v4-surface-2':'#e2dec4','--v4-surface-3':'#cfccb0','--v4-text':'#24291b','--v4-text-2':'#3d452f','--v4-muted':'#646c51','--v4-border':'#b5b18e','--v4-border-strong':'#969b74','--v4-sidebar':'#28371e','--v4-sidebar-hover':'#3b4d2b','--v4-sidebar-text':'#e7e6ce','--v4-accent':'#506a31','--v4-accent-hover':'#3d5425','--v4-accent-soft':'#d6e0ba','--v4-gold':'#b99633','--v4-danger':'#9b3c32','--v4-warning':'#9a681d','--v4-info':'#48617a','--v4-shadow':'rgba(42,52,31,.18)'}
};
let desired='light',lastUserChange=0,saving=false;
function user(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function parse(v){if(!v)return null;if(typeof v==='object')return v;try{return JSON.parse(v)}catch(_){return null}}
function norm(v){v=String(v||'');return VALID.has(v)?v:'light'}
function key(){const u=user();return u?.id!=null?`prefs_usuario_${u.id}`:null}
function localPrefs(){const k=key();return k?parse(localStorage.getItem(k))||{}:{}}
function ensureStyle(){if(document.getElementById('v768ThemeFixStyle'))return;const s=document.createElement('style');s.id='v768ThemeFixStyle';s.textContent=`
html,body,.main,.main-content,.content,.page,.kanban-board{background:var(--v4-bg)!important;color:var(--v4-text)!important}
.sidebar{background:var(--v4-sidebar)!important;color:var(--v4-sidebar-text)!important;border-color:var(--v4-border)!important}
.header,.topbar,.v6-dashboard-top{background:var(--v4-surface)!important;color:var(--v4-text)!important;border-color:var(--v4-border)!important}
.card,.panel,.task-card,.kanban-column,.modal-content,.modal-card,.status-strip,.toolbar,.kpi,.mini-kpi{background:var(--v4-surface)!important;color:var(--v4-text)!important;border-color:var(--v4-border)!important}
input,textarea,select,option{background:var(--v4-surface)!important;color:var(--v4-text)!important;border-color:var(--v4-border-strong)!important}
`;document.head.appendChild(s)}
function syncControls(theme){const sel=document.getElementById('tema');if(sel&&sel.value!==theme)sel.value=theme;document.querySelectorAll('[data-theme-choice]').forEach(b=>b.classList.toggle('selected',b.dataset.themeChoice===theme))}
function persistLocal(theme){const k=key();if(!k)return;const p=localPrefs();p.tema=theme;localStorage.setItem(k,JSON.stringify(p))}
function apply(theme,persist=false,userChange=false){theme=norm(theme);desired=theme;if(userChange)lastUserChange=Date.now();ensureStyle();document.documentElement.dataset.theme=theme;if(document.body)document.body.dataset.theme=theme;document.documentElement.style.colorScheme=(theme==='light'||theme==='military')?'light':'dark';for(const [k,v] of Object.entries(VARS[theme]))document.documentElement.style.setProperty(k,v);if(persist)persistLocal(theme);syncControls(theme);window.dispatchEvent(new CustomEvent('tema26:changed',{detail:{tema:theme,v768:true}}));return theme}
async function saveDb(theme){if(saving)return;const u=user();let c=null;try{if(typeof supabaseClient!=='undefined')c=supabaseClient}catch(_){}if(!u?.id||!c)return;saving=true;try{const p=localPrefs();p.tema=theme;const r=await c.from('usuarios').update({preferencias:p}).eq('id',u.id);if(r.error)throw r.error}catch(e){console.warn('[TAREFAS TEMA 7.6.8] não foi possível salvar no banco',e?.message||e)}finally{saving=false}}
async function syncDb(){const u=user();let c=null;try{if(typeof supabaseClient!=='undefined')c=supabaseClient}catch(_){}if(!u?.id||!c||Date.now()-lastUserChange<5000)return;try{const r=await c.from('usuarios').select('preferencias').eq('id',u.id).maybeSingle();if(r.error||!r.data)return;const p=parse(r.data.preferencias);if(p?.tema&&Date.now()-lastUserChange>=5000){persistLocal(norm(p.tema));apply(p.tema,false,false)}}catch(e){console.warn('[TAREFAS TEMA 7.6.8] sincronização falhou',e?.message||e)}}
function choose(theme){theme=apply(theme,true,true);saveDb(theme)}
function wire(){document.addEventListener('click',e=>{const b=e.target.closest?.('[data-theme-choice]');if(!b)return;choose(b.dataset.themeChoice)},true);document.addEventListener('change',e=>{if(e.target?.id==='tema')choose(e.target.value)},true);window.addEventListener('prefs26:update',e=>{if(e.detail?.tema)choose(e.detail.tema)});window.addEventListener('storage',e=>{if(e.key===key()){const p=parse(e.newValue);if(p?.tema&&Date.now()-lastUserChange>=1000)apply(p.tema,false,false)}})}
function guard(){const mo=new MutationObserver(()=>{if(document.documentElement.dataset.theme!==desired||document.body?.dataset.theme!==desired)apply(desired,false,false)});mo.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});if(document.body)mo.observe(document.body,{attributes:true,attributeFilter:['data-theme']})}
function boot(){const p=localPrefs();apply(p.tema||document.documentElement.dataset.theme||'light',false,false);wire();guard();setTimeout(syncDb,120);window.addEventListener('focus',()=>{apply(desired,false,false);syncDb()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
