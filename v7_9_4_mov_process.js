(function(){
'use strict';
if(window.__TAREFAS_WEB_794__)return;
window.__TAREFAS_WEB_794__=true;
const VERSION='7.9.4';
const LABELS={
  encaminhado_fiscal:'Encaminhado ao Fiscal',
  aprovado_fiscal:'Aprovado / Retornado',
  aprovado_detentor:'Aprovação do detentor',
  aprovado_cmt:'Aprovação do Cmt',
  assinado_detentor:'Assinatura do detentor',
  assinado_cmt:'Assinatura do Cmt',
  encaminhado_base:'Encaminhado à Base',
  pronto:'Pronto',
  retornado_fiscal:'Retornado pela Fiscalização'
};
function label(status){return LABELS[status]||status||'Encaminhado ao Fiscal'}
function setText(el,text){if(el&&el.textContent.trim()!==text)el.textContent=text}
function apply(){
  // O título volta a ser o nome da seção; à direita mostramos a situação atual.
  const hint=document.getElementById('movFlowHint');
  if(hint)setText(hint,'Situação atual');
  const detail=document.querySelector('#movDetail .pedido-status.info');
  if(detail){
    const text=detail.textContent.trim();
    // O status real é mantido pelo módulo principal; não substituir por texto genérico.
    if(text==='Como anda o processo') detail.textContent='Situação atual';
  }
  document.querySelectorAll('#movList .pedido-card .pedido-status.info').forEach(el=>{
    if(el.textContent.trim()==='Movimentação'){
      const card=el.closest('.pedido-card');
      const txt=card?.querySelector('.pedido-card-top')?.parentElement?.dataset?.status;
      if(txt)el.textContent=label(txt);
    }
  });
  document.querySelectorAll('.v65-version-badge').forEach(b=>{
    const t='● TAREFAS v'+VERSION;if(b.textContent!==t)b.textContent=t;
    b.title='Sobre a versão '+VERSION;
  });
  document.querySelectorAll('.v65-mobile-version').forEach(v=>setText(v,'v'+VERSION));
  const games=document.getElementById('gamesVersionLabel');
  if(games)games.textContent='WEB '+VERSION+' · 26º PEL PE MEC';
}
function init(){
  apply();
  const obs=new MutationObserver(m=>{if(m.some(x=>x.type==='childList'))requestAnimationFrame(apply)});
  obs.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();