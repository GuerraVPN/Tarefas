(function(){
'use strict';
if(window.__TAREFAS_V782_WEBFIX__)return;
window.__TAREFAS_V782_WEBFIX__=true;
const VERSION='7.8.2';
function page(){return (location.pathname.split('/').pop()||'').toLowerCase()}
function installCss(){if(document.getElementById('v765WebfixStyle'))return;const s=document.createElement('style');s.id='v765WebfixStyle';s.textContent='#lavanderiaModule[hidden]{display:none!important}#lavanderiaModule:not([hidden]){display:block!important}';document.head.appendChild(s)}
function ensureGamesNav(){
 const list=document.querySelector('.sidebar ul');if(!list)return;let li=list.querySelector('[data-v6-nav="games"]');
 if(!li){li=document.createElement('li');li.dataset.v6Nav='games';li.innerHTML='<button class="v6-nav-item" type="button" data-v765-games><span class="v6-nav-icon" aria-hidden="true" style="font-size:17px">🎮</span><span class="v6-nav-label">Jogos</span></button>';const cfg=list.querySelector('[data-v6-nav="configuracoes"]');if(cfg)list.insertBefore(li,cfg);else list.appendChild(li)}
 const b=li.querySelector('[data-v765-games]');if(b){b.classList.toggle('active',page()==='games.html');b.onclick=()=>location.href='games.html'}
}
function ensureLaundryNav(){
 const parent=document.querySelector('.v6-orc-parent[data-v6-nav="orcamentarios"]'),sub=parent?.querySelector('.v6-orc-sub');if(!sub)return;
 let b=sub.querySelector('[data-orc-link="lavanderia"]');if(!b){b=document.createElement('button');b.type='button';b.dataset.orcLink='lavanderia';b.textContent='Lavagem de Forro de Cama';sub.appendChild(b)}
 const active=page()==='orcamentarios.html'&&new URLSearchParams(location.search).get('modulo')==='lavanderia';b.classList.toggle('active',active);b.onclick=e=>{e.preventDefault();e.stopPropagation();location.href='orcamentarios.html?modulo=lavanderia'};
}
function ensureAboutVersion(){
 if(page()!=='about.html')return;
 const release={v:VERSION,title:'Versão Web 7.8.2 — correções e integração da IA',current:true,items:[
  'Versão atual do site consolidada em 7.8.2.',
  'Corrigido o About que continuava exibindo 7.7.1 por causa de um carregador legado.',
  'Mantidas as integrações da Assistente IA e dos anexos de conversa da linha 7.8.',
  'Material Carga passa a carregar os dados essenciais sem esperar consultas auxiliares.',
  'Corrigida a atualização repetitiva do saldo da Cia Com na Lavagem de Forro de Cama.'
 ]};
 const versions=window.versions;
 if(Array.isArray(versions)){
  versions.forEach(x=>{if(x)x.current=false});
  const old=versions.find(x=>x.v===VERSION);if(old)Object.assign(old,release);else versions.unshift(release);
  const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');if(sel.value!==VERSION){sel.value=VERSION;sel.dispatchEvent(new Event('change'))}}
 }
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));
 if(meta?.querySelector('b')&&meta.querySelector('b').textContent!==VERSION)meta.querySelector('b').textContent=VERSION;
}
function ensureOrcState(){
 if(page()!=='orcamentarios.html')return;
 const modulo=new URLSearchParams(location.search).get('modulo')||'relatorio';
 if(modulo==='material_carga'&&window.MaterialCarga782){const panel=document.getElementById('materialCargaModule');if(panel?.hidden)window.MaterialCarga782.activate()}
 if(modulo==='lavanderia'&&window.LavFinanceiro782)window.LavFinanceiro782.load();
 if(modulo==='lavanderia'&&window.LavPagamento782)window.LavPagamento782.sync();
}
function sync(){
 installCss();ensureGamesNav();ensureLaundryNav();ensureAboutVersion();ensureOrcState();
 const label=document.getElementById('gamesVersionLabel');if(label&&label.textContent!==`WEB ${VERSION} · 26º PEL PE MEC`)label.textContent=`WEB ${VERSION} · 26º PEL PE MEC`;
}
function start(){
 sync();setTimeout(sync,500);
 const list=document.querySelector('.sidebar ul');
 if(list){let queued=false;const obs=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;sync()})});obs.observe(list,{childList:true,subtree:true})}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('focus',sync);setInterval(sync,30000);
})();