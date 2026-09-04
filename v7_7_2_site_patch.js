(function(){
'use strict';
if(window.__TAREFAS_V772_SITE_PATCH__)return;
window.__TAREFAS_V772_SITE_PATCH__=true;
const VERSION='7.7.2';
function patchAbout(){
 if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
 const current=document.querySelector('.hero .meta > div:first-child b');
 if(current)current.textContent=VERSION;
 if(document.getElementById('v772AboutCard'))return;
 const hero=document.querySelector('.hero');if(!hero)return;
 const card=document.createElement('div');card.id='v772AboutCard';card.style.cssText='margin-top:12px;padding:12px;border:1px solid var(--v4-border,#d1d5db);border-radius:10px;background:var(--v4-surface-2,#f7f8fa);font-size:12px;line-height:1.5';
 card.innerHTML='<b>7.7.2 — Exportação de escalas</b><br>Escala de Serviço e Escala de Missão agora podem ser geradas em <b>PDF</b> ou <b>ODT editável</b>, mantendo a visualização por período e as tabelas selecionadas.';
 hero.appendChild(card);
}
function apply(){document.documentElement.dataset.tarefasVersion=VERSION;patchAbout();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.addEventListener('focus',apply);
})();
