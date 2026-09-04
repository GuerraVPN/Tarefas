(()=>{
'use strict';
const MARK='__TAREFAS_ANDROID_235_CHAT_AUTOFIT__';
if(window[MARK])return;window[MARK]=true;

const style=document.createElement('style');
style.id='mcf235-style';
style.textContent=`
/* 2.3.5: chat dimensionado pela área visível real do aparelho */
.mcf233-overlay{position:fixed!important;left:0!important;top:0!important;width:100%!important;height:var(--mcf235-vh,100dvh)!important;min-height:0!important;max-height:none!important;padding:0!important;align-items:flex-start!important;justify-content:center!important;overflow:hidden!important;z-index:2147483000!important;transform:translateY(var(--mcf235-vtop,0px))!important}
.mcf233-sheet{width:min(620px,100%)!important;height:var(--mcf235-chat-h,100%)!important;min-height:0!important;max-height:none!important;margin:0!important;border-radius:0!important;padding:0!important;padding-bottom:var(--mcf235-safe-bottom,0px)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;box-sizing:border-box!important}
.mcf233-head{flex:0 0 auto!important}.mcf233-conv{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overscroll-behavior:contain!important}.mcf233-selected,.mcf233-compose,.mcf233-note{flex:0 0 auto!important;position:relative!important;z-index:5!important}.mcf233-compose{padding:9px 10px!important}.mcf233-attach,.mcf233-send{display:block!important;visibility:visible!important;opacity:1!important;min-width:44px!important}
body.mcf233-open .bn-nav,body.mcf233-open .bottom-nav,body.mcf233-open [data-bottom-nav]{visibility:hidden!important;pointer-events:none!important}
.mcf233-toast{z-index:2147483001!important;bottom:calc(14px + var(--mcf235-safe-bottom,0px))!important}
@media(min-width:760px){.mcf233-overlay{align-items:center!important;padding:24px!important;transform:none!important;height:100dvh!important}.mcf233-sheet{height:min(82dvh,720px)!important;border-radius:20px!important;padding-bottom:0!important}}
`;
document.head.appendChild(style);

function px(n){return `${Math.max(0,Math.round(Number(n)||0))}px`}
function cssSafeBottom(){
  const probe=document.createElement('div');
  probe.style.cssText='position:fixed;visibility:hidden;padding-bottom:env(safe-area-inset-bottom,0px)';
  document.body.appendChild(probe);
  const v=parseFloat(getComputedStyle(probe).paddingBottom)||0;
  probe.remove();
  return v;
}
function navHeight(){
  const selectors=['.bn-nav','.bottom-nav','[data-bottom-nav]','.mobile-bottom-nav','.app-bottom-nav','nav[aria-label="Navegação inferior"]'];
  for(const s of selectors){
    const el=document.querySelector(s);if(!el)continue;
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
    if(cs.display!=='none'&&cs.visibility!=='hidden'&&r.height>20&&r.bottom>window.innerHeight-140)return r.height;
  }
  return 0;
}
function fit(){
  const vv=window.visualViewport;
  const mobile=matchMedia('(max-width:759px)').matches;
  if(!mobile)return;
  const viewportH=vv?.height||window.innerHeight||document.documentElement.clientHeight;
  const viewportTop=vv?.offsetTop||0;
  const safe=cssSafeBottom();
  const nav=navHeight();
  /* Quando o teclado abre, visualViewport já exclui a área ocupada por ele. A barra inferior fica escondida enquanto o chat está aberto. */
  const available=Math.max(260,viewportH-safe);
  const root=document.documentElement;
  root.style.setProperty('--mcf235-vh',px(viewportH));
  root.style.setProperty('--mcf235-vtop',px(viewportTop));
  root.style.setProperty('--mcf235-safe-bottom',px(safe));
  root.style.setProperty('--mcf235-nav-h',px(nav));
  root.style.setProperty('--mcf235-chat-h',px(available));
}
let raf=0;function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(fit)}
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(schedule,80),{passive:true});
window.visualViewport?.addEventListener('resize',schedule,{passive:true});
window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
new MutationObserver(()=>{if(document.body.classList.contains('mcf233-open'))schedule()}).observe(document.body,{attributes:true,attributeFilter:['class']});
document.addEventListener('focusin',e=>{if(e.target?.closest?.('.mcf233-overlay'))setTimeout(schedule,50)},true);
document.addEventListener('focusout',e=>{if(e.target?.closest?.('.mcf233-overlay'))setTimeout(schedule,120)},true);
fit();
})();
