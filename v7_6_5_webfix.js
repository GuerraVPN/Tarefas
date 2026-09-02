(function(){
'use strict';
if(window.__TAREFAS_V765_WEBFIX__)return;
window.__TAREFAS_V765_WEBFIX__=true;
const VERSION='7.6.5';
function page(){return (location.pathname.split('/').pop()||'').toLowerCase()}
function installCss(){
 if(document.getElementById('v765WebfixStyle'))return;
 const s=document.createElement('style');s.id='v765WebfixStyle';
 s.textContent='#lavanderiaModule[hidden]{display:none!important}#lavanderiaModule:not([hidden]){display:block!important}';
 document.head.appendChild(s);
}
function ensureGamesNav(){
 const list=document.querySelector('.sidebar ul');if(!list)return;
 let li=list.querySelector('[data-v6-nav="games"]');
 if(!li){
  li=document.createElement('li');li.dataset.v6Nav='games';
  li.innerHTML='<button class="v6-nav-item" type="button" data-v765-games><span class="v6-nav-icon" aria-hidden="true" style="font-size:17px">🎮</span><span class="v6-nav-label">Jogos</span></button>';
  const cfg=list.querySelector('[data-v6-nav="configuracoes"]');
  if(cfg)list.insertBefore(li,cfg);else list.appendChild(li);
 }
 const b=li.querySelector('[data-v765-games]');
 if(b){b.classList.toggle('active',page()==='games.html');b.onclick=()=>location.href='games.html'}
}
function ensureLaundryNav(){
 const parent=document.querySelector('.v6-orc-parent[data-v6-nav="orcamentarios"]');
 const sub=parent?.querySelector('.v6-orc-sub');if(!sub)return;
 let b=sub.querySelector('[data-orc-link="lavanderia"]');
 if(!b){b=document.createElement('button');b.type='button';b.dataset.orcLink='lavanderia';b.textContent='Lavagem de Forro de Cama';sub.appendChild(b)}
 const active=page()==='orcamentarios.html'&&new URLSearchParams(location.search).get('modulo')==='lavanderia';
 b.classList.toggle('active',active);
 b.onclick=e=>{e.preventDefault();e.stopPropagation();location.href='orcamentarios.html?modulo=lavanderia'};
}
function sync(){
 installCss();ensureGamesNav();ensureLaundryNav();
 const label=document.getElementById('gamesVersionLabel');if(label)label.textContent='WEB '+VERSION+' · 26º PEL PE MEC';
}
function start(){sync();const obs=new MutationObserver(()=>queueMicrotask(sync));obs.observe(document.body,{subtree:true,childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
