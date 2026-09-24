// TAREFAS 2.4.7: base compilada 2.4.6 + aplicação dos patches 2.4.6.7 e 2.4.6.8
import { copyFile, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dist=path.join(root,'dist');
const VERSION='2.4.7',BUILD=282,WEB_VERSION='7.9.1';

async function patch(rel,fn,{required=true}={}){
  const file=path.join(dist,rel);
  const before=await readFile(file,'utf8');
  const after=fn(before);
  if(required&&after===before)throw new Error('2.4.7: alteração não aplicada em '+rel);
  if(after!==before)await writeFile(file,after,'utf8');
}

await copyFile(path.join(root,'app/mobile-launcher-icon-v241.js'),path.join(dist,'mobile-launcher-icon-v241.js'));

const special=new Set(['reiniciar.html','desligado.html']);
for(const name of await readdir(dist)){
  if(!/\.html$/i.test(name))continue;
  const file=path.join(dist,name);
  let source=await readFile(file,'utf8');
  source=source.replace(/<script src=["']mobile-launcher-icon-v242\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
  source=source.replace(/<script src=["']mobile-launcher-icon-v241\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
  source=source.replaceAll('2.4.5-b280','2.4.7-b282');
  source=source.replaceAll('2.4.5-b280','2.4.7-b282');
  source=source.replaceAll('2.4.5-b280','2.4.7-b282');
  if(!special.has(name.toLowerCase())){
    const tag='<script src="mobile-launcher-icon-v241.js?v='+VERSION+'-b'+BUILD+'"></script>';
    source=source.includes('</body>')?source.replace('</body>',tag+'\n</body>'):source+'\n'+tag;
  }
  await writeFile(file,source,'utf8');
}

await patch('mobile-patch-manager-v240.js',source=>source
  .replace("const APP_VERSION='2.4.6',APP_BUILD=281,APP_CHANNEL='beta';","const APP_VERSION='"+VERSION+"',APP_BUILD="+BUILD+",APP_CHANNEL='beta';")
  .replace("__TAREFAS_PATCH_MANAGER_V281__","__TAREFAS_PATCH_MANAGER_V282__")
  .replaceAll("source:'beta-2.4.6'","source:'beta-2.4.7'"),{required:true});

await patch('mobile-bootstrap.js',source=>{
  let out=source
    .replace("const APP_VERSION = '2.4.6';","const APP_VERSION = '"+VERSION+"';")
    .replace('const APP_BUILD = 281;','const APP_BUILD = '+BUILD+';')
    .replaceAll('Beta 2.4.6','Beta '+VERSION)
    .replaceAll('2.4.6 Beta',VERSION+' Beta')
    .replaceAll('__TAREFAS_BETA_246_BOOT__','__TAREFAS_BETA_247_BOOT__')
    .replaceAll('__TAREFAS_PATCH_SYSTEM_V281__','__TAREFAS_PATCH_SYSTEM_V282__')
    .replaceAll("version:'2.4.6'","version:'"+VERSION+"'")
    .replaceAll('build:281','build:'+BUILD);
  if(!out.includes("['Escalas','#escalas','Motorista, patrulheiro e permanência']"))throw new Error('2.4.7: menu Escalas ausente');
  if(out.includes("['Pessoal / Escalas','pessoal.html'")||out.includes("['Missões','missao.html'"))throw new Error('2.4.7: menu antigo presente');
  out=out.replaceAll('tmScales246','tmScales247').replaceAll('tm246-scales-list','tm247-scales-list').replace("basedOn:'2.4.6+2.4.6.7+2.4.6.8'","basedOn:'2.4.6+2.4.6.7+2.4.6.8'");
  out=out.replace("__TAREFAS_BETA_247_BOOT__={version:'"+VERSION+"',build:"+BUILD+",channel:'beta',basedOn:'2.4.6+2.4.6.7+2.4.6.8'", "__TAREFAS_BETA_247_BOOT__={version:'"+VERSION+"',build:"+BUILD+",channel:'beta',basedOn:'2.4.6+2.4.6.7+2.4.6.8'");
  return out;
},{required:true});

await patch('mobile-alpha-v23223-fix.js',source=>source
  .replace("const VERSION='2.4.5',BUILD=280,MARK='__TAREFAS_BETA_NAV_V281__';","const VERSION='"+VERSION+"',BUILD="+BUILD+",MARK='__TAREFAS_BETA_NAV_V282__';")
  .replaceAll('TAREFAS 2.4.6 Beta','TAREFAS '+VERSION+' Beta')
  .replaceAll('TarefasBeta246','TarefasBeta247'),{required:false});

await patch('mobile-alpha-v23221.js',source=>source
  .replace("const VERSION='2.4.5',BUILD=280","const VERSION='"+VERSION+"',BUILD="+BUILD)
  .replaceAll('Central Beta 2.4.6','Central Beta '+VERSION)
  .replaceAll('Ferramentas Beta 2.4.6','Ferramentas Beta '+VERSION)
  .replaceAll('BETA 245','BETA 246'),{required:false});

await patch('mobile-alpha-v23221-tabs.js',source=>source
  .replace("const MARK='__TAREFAS_BETA_TABS_V281__',VERSION='2.4.5',BUILD=280","const MARK='__TAREFAS_BETA_TABS_V282__',VERSION='2.4.7',BUILD=282")
  .replace('<small>Beta 2.4.6</small>','<small>Beta '+VERSION+'</small>'),{required:false});

await patch('mobile-preload.js',source=>source
  .replaceAll("tarefasAppVersion = '2.4.5'","tarefasAppVersion = '"+VERSION+"'")
  .replaceAll("tarefasAppBuild = '280'","tarefasAppBuild = '"+BUILD+"'"),{required:false});

await patch('mobile-updates-v181.js',source=>source
  .replace("const APP_VERSION = '2.4.6';","const APP_VERSION = '"+VERSION+"';")
  .replace('const APP_BUILD = 281;','const APP_BUILD = '+BUILD+';'),{required:false});

await patch('mobile-ai-v230.js',source=>source
  .replaceAll('BETA 2.4.5','BETA '+VERSION)
  .replaceAll("version:'2.4.6'","version:'"+VERSION+"'")
  .replaceAll('build:281','build:'+BUILD),{required:false});

await patch('native-mobile.js',source=>source
  .replaceAll("version:'2.4.6'","version:'"+VERSION+"'")
  .replaceAll('build:281','build:'+BUILD)
  .replaceAll('"2.4.5"','"'+VERSION+'"')
  .replaceAll("'2.4.5'","'"+VERSION+"'"),{required:false});

await patch('mobile-release-v240.js',source=>{
  let out=source
    .replaceAll("const PATCH_VERSION='2.4.6';","const PATCH_VERSION='"+VERSION+"';")
    .replaceAll("const BASE_VERSION='2.4.6';","const BASE_VERSION='"+VERSION+"';")
    .replaceAll('const BUILD=281;','const BUILD='+BUILD+';')
    .replaceAll("version:'2.4.6',build:281,channel:'beta'","version:'"+VERSION+"',build:"+BUILD+",channel:'beta'")
    .replaceAll('__TAREFAS_BETA_246__','__TAREFAS_BETA_247__');
  out+="\n;globalThis.__TAREFAS_BETA_247__=Object.freeze({version:'"+VERSION+"',build:"+BUILD+",channel:'beta',basedOn:'2.4.6+2.4.6.7+2.4.6.8',webVersion:'"+WEB_VERSION+"',launcherIconBridge:true,profileHomeIcon:true,patchChannelsFollowApkPreferences:true,drawerScalesOnly:true,officialPatchSha256Bytes:true});\n";
  out+=";globalThis.__TAREFAS_EFFECTIVE_VERSION__='"+VERSION+"';\n";
  return out;
},{required:true});


await patch('mobile-bootstrap.js',source=>source + '\n' + "(()=>{'use strict';\nconst MARK='__TAREFAS_ALPHA_2467_ESCALAS_2433__';\nif(globalThis[MARK])return;\nglobalThis[MARK]=true;\nconst API='https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/tarefas-escalas';\nconst norm=v=>String(v??'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/\\s+/g,' ').trim().toLowerCase();\nconst esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#039;'}[c]));\nconst user=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}};\nconst session=()=>String(localStorage.getItem('tarefasPushSession17')||'').trim();\n\nfunction removeNext(){document.querySelectorAll('#kNextServiceCard,#kNextService,.tm-next-service-kpi,[data-tarefas-next-service],[data-next-service],.next-service-card').forEach(e=>e.remove())}\nfunction cleanLegacy(){\n document.querySelectorAll('a,button,li,[role=\"menuitem\"]').forEach(el=>{\n  const h=norm(el.getAttribute?.('href')||el.dataset?.href||''),t=norm(el.textContent);\n  if(h.includes('pessoal.html')||h.includes('missao.html')||t==='pessoal / escalas'||t==='missões'||t==='missoes'){\n   (el.closest('li,[role=\"menuitem\"],.tm-drawer-item,.nav-item,.menu-item,.tab-item,.hotbar-item')||el).remove();\n  }\n });\n document.querySelectorAll('iframe').forEach(el=>{const s=norm(el.src);if(s.includes('docs.google.com/spreadsheets')||s.includes('script.google.com'))el.remove()});\n}\nfunction style(){\n if(document.getElementById('tm2433-scale-style'))return;\n const s=document.createElement('style');s.id='tm2433-scale-style';\n s.textContent='.tm2433-back{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483000;display:flex;align-items:flex-end;justify-content:center}.tm2433-panel{width:min(680px,100%);max-height:92vh;background:var(--card,#10151b);color:var(--text,#fff);border-radius:24px 24px 0 0;overflow:auto;padding:18px}.tm2433-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.tm2433-tabs{display:flex;gap:8px;overflow:auto;margin:12px 0}.tm2433-tab,.tm2433-sync{border:0;border-radius:14px;padding:11px 14px;background:rgba(85,199,255,.14);color:inherit;font-weight:800}.tm2433-tab.active{background:rgba(85,199,255,.28)}.tm2433-card,.tm2433-empty,.tm2433-error{border:1px solid rgba(127,127,127,.2);border-radius:16px;padding:14px;margin:10px 0}.tm2433-empty{text-align:center;opacity:.78}.tm2433-error{background:rgba(220,80,80,.08)}.tm2433-meta{font-size:12px;opacity:.65;margin-top:4px}.tm2433-values{font-size:13px;margin-top:8px;word-break:break-word}';\n document.head.appendChild(s);\n}\nasync function requestScale(kind){\n const token=session();if(token.length<32)throw new Error('Sessão do TAREFAS ausente ou expirada. Faça login novamente.');\n const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-tarefas-session':token},body:JSON.stringify({escala:kind})});\n let d=null;try{d=await r.json()}catch(_){}\n if(!r.ok||!d?.ok)throw new Error(d?.error||('Falha ao consultar a escala (HTTP '+r.status+').'));\n return d;\n}\nfunction render(root,k,d){\n const b=root.querySelector('.tm2433-body'),m=Array.isArray(d?.escalas?.[k]?.matches)?d.escalas[k].matches:[];\n if(!m.length){b.innerHTML='<div class=\"tm2433-empty\">Não encontrei seu nome nesta escala.<div class=\"tm2433-meta\">Usuário: '+esc((d?.usuario?.patente||'')+' '+(d?.usuario?.nome_guerra||''))+'</div></div>';return}\n b.innerHTML=m.map(x=>'<div class=\"tm2433-card\"><b>'+esc(x.date||'Data não identificada')+'</b><div class=\"tm2433-meta\">'+esc(x.aba||'')+' · linha '+esc(x.row)+' · coluna '+esc(x.col)+'</div><div class=\"tm2433-values\">'+esc(x.cell)+' — '+(x.values||[]).map(v=>esc(v.value||'')).join(' · ')+'</div></div>').join('');\n}\nfunction openScale(kind='patrulheiro'){\n style();document.getElementById('tm2433-scale-back')?.remove();\n const u=user()||{},r=document.createElement('div');r.id='tm2433-scale-back';r.className='tm2433-back';\n r.innerHTML='<section class=\"tm2433-panel\"><div class=\"tm2433-head\"><div><b>Escalas</b><div class=\"tm2433-meta\">'+esc((u.patente||'')+' '+(u.nome_guerra||''))+'</div></div><button class=\"tm2433-close\">×</button></div><div class=\"tm2433-tabs\"><button class=\"tm2433-tab\" data-k=\"motorista_pa\">Motorista PA</button><button class=\"tm2433-tab\" data-k=\"patrulheiro\">Patrulheiro</button><button class=\"tm2433-tab\" data-k=\"permanencia\">Permanência</button></div><button class=\"tm2433-sync\">Sincronizar agora</button><div class=\"tm2433-body\"><div class=\"tm2433-empty\">Carregando escala…</div></div></section>';\n document.body.appendChild(r);\n const tabs=[...r.querySelectorAll('.tm2433-tab')],b=r.querySelector('.tm2433-body'),sync=r.querySelector('.tm2433-sync');\n r.querySelector('.tm2433-close').onclick=()=>r.remove();\n async function load(k){tabs.forEach(t=>t.classList.toggle('active',t.dataset.k===k));b.innerHTML='<div class=\"tm2433-empty\">Sincronizando com a planilha…</div>';try{render(r,k,await requestScale(k))}catch(e){b.innerHTML='<div class=\"tm2433-error\">'+esc(e?.message||e)+'</div>'}}\n tabs.forEach(t=>t.onclick=()=>load(t.dataset.k));sync.onclick=()=>load(r.querySelector('.tm2433-tab.active')?.dataset.k||kind);load(kind);\n}\nfunction addScaleTab(){\n const groups=[...document.querySelectorAll('.tm-drawer-group,.tm-drawer-section,.drawer-section,.menu-section,.hotbar-section')];\n const group=groups.find(g=>['serviços e pessoal','servicos e pessoal','serviços','servicos'].includes(norm(g.querySelector('h3,h4,strong')?.textContent)));\n if(!group)return;\n const items=[...group.querySelectorAll('a,button,li,[role=\"button\"]')].filter(el=>norm(el.textContent)==='escalas'||norm(el.getAttribute?.('href')||el.dataset?.href)==='#escalas');\n items.slice(1).forEach(e=>(e.closest('li,.nav-item,.menu-item,.tab-item,.drawer-item')||e).remove());\n if(items[0]){items[0].dataset.tarefasScale2467='keep';items[0].onclick=e=>{e.preventDefault();e.stopImmediatePropagation();openScale()};return}\n const b=document.createElement('button');b.type='button';b.className='tm-drawer-item';b.dataset.href='#escalas';b.dataset.tarefasScale2467='keep';b.innerHTML='<span><strong>Escalas</strong></span><span aria-hidden=\"true\">›</span>';b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();openScale()};group.appendChild(b);\n}\nfunction wireServices(){\n const btn=document.querySelector('.tm-bottom-nav [data-key=\"services\"]');if(btn){\n  const span=btn.querySelector('span');if(span)span.textContent='Serviços';\n  btn.setAttribute('aria-label','Serviços');btn.dataset.href='#escalas';\n  if(!btn.__tarefas2467){btn.__tarefas2467=true;btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openScale()},true)}\n }\n addScaleTab();\n}\nfunction blockLegacy(){document.addEventListener('click',e=>{const el=e.target.closest?.('a,button,[role=\"button\"]');if(!el)return;const t=norm(el.textContent),h=norm(el.getAttribute?.('href')||el.dataset?.href||'');if(t==='pessoal / escalas'||t==='missões'||t==='missoes'||h==='pessoal.html'||h==='missao.html'){e.preventDefault();e.stopImmediatePropagation();openScale()}},true)}\nfunction boot(){removeNext();cleanLegacy();wireServices();blockLegacy();let n=0;const timer=setInterval(()=>{removeNext();cleanLegacy();wireServices();if(++n>=120)clearInterval(timer)},250);window.addEventListener('focus',()=>{removeNext();cleanLegacy();wireServices()});window.addEventListener('pageshow',()=>{removeNext();cleanLegacy();wireServices()})}\nif(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();\nglobalThis.TarefasAlpha2467Patch=Object.freeze({version:'2.4.6.7',base:'2.4.6',scaleImplementation:'2.4.3.3',sameScale:true,hotbarServices:true,singleScaleTab:true,removeLegacy:true,removeNextService:true,observer:false});\n})();\n(()=>{'use strict';\nconst MARK='__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__';\nif(globalThis[MARK])return;\nglobalThis[MARK]=true;\nconst norm=v=>String(v??'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/\\s+/g,' ').trim().toLowerCase();\nasync function openServicesScales(){\n const menu=document.querySelector('.tm-app-header [data-menu]');\n if(!menu)return;\n menu.click();\n for(let i=0;i<20;i++){\n  const item=[...document.querySelectorAll('#tmDrawer a,#tmDrawer button,.tm-drawer-item')].find(el=>norm(el.textContent)==='escalas'||norm(el.getAttribute?.('href')||el.dataset?.href)==='#escalas');\n  if(item){item.click();return}\n  await new Promise(r=>setTimeout(r,50));\n }\n}\nfunction wire(){\n const btn=document.querySelector('.tm-bottom-nav [data-key=\"services\"]');\n if(!btn)return false;\n const span=btn.querySelector('span');if(span)span.textContent='Serviços';\n btn.setAttribute('aria-label','Serviços');\n btn.dataset.href='#escalas';\n if(!btn.__tarefas2468fix){\n  btn.__tarefas2468fix=true;\n  btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openServicesScales()},true);\n }\n return true;\n}\nfunction restore(){\n if(wire())return;\n const nav=document.querySelector('.tm-bottom-nav');if(!nav)return;\n const b=document.createElement('button');\n b.type='button';b.dataset.key='services';b.dataset.href='#escalas';b.setAttribute('aria-label','Serviços');\n b.innerHTML='<span>Serviços</span>';\n b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openServicesScales()},true);\n nav.insertBefore(b,nav.lastElementChild||null);\n}\nfunction boot(){restore();let n=0;const timer=setInterval(()=>{restore();if(++n>40)clearInterval(timer)},250);window.addEventListener('focus',restore);window.addEventListener('pageshow',restore)}\nif(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();\nglobalThis.TarefasAlpha2468Fix=Object.freeze({version:'2.4.6.8',base:'2.4.6',hotbarServicesRestored:true,usesExisting2467Scale:true});\n})();" + '\n',{required:true});
await rm(path.join(dist,'RELEASE_2_4_0.json'),{force:true});
await rm(path.join(dist,'BETA_2_4_3.json'),{force:true});
await writeFile(path.join(dist,'BETA_2_4_7.json'),JSON.stringify({
  version:VERSION,build:BUILD,channel:'beta',base:'2.4.6+2.4.6.7+2.4.6.8',webVersion:WEB_VERSION,generatedAt:new Date().toISOString(),
  futureDelivery:{beta:'tpatch',alpha:'tpatch',betaNotifications:'same-apk-beta-preference',alphaNotifications:'same-apk-alpha-preference'},
  features:{basedOnValidated246Patches:true,launcherIconSelector:true,launcherNativeBridge:true,profileAvatarAsHomeIcon:true,launcherPresetBlue:true,launcherPresetMilitary:true,launcherPresetGold:true,launcherPresetSystem:true,defaultLauncherIconFixed:true,patchManager:true,patchBetaChannelUsesApkPreference:true,patchAlphaChannelUsesApkPreference:true,web791:true,biometricColdStartOnly:true,diagnosticTabs:true,drawerScalesOnly:true,officialPatchSha256Bytes:true}
},null,2)+'\n','utf8');

console.log('TAREFAS Android '+VERSION+' build '+BUILD+' BETA pré-release baseada na Beta 2.4.6/build 280.');

console.log('TAREFAS Android 2.4.7 build 282 BETA: base 2.4.6 + Escalas 2.4.6.7 + Serviços 2.4.6.8.');
