(()=>{
'use strict';
const MARK='__TAREFAS_ANDROID_236_CHAT_REAL_AUTOFIT__';
if(window[MARK])return;window[MARK]=true;

document.getElementById('mcf234-style')?.remove();
document.getElementById('mcf235-style')?.remove();
const style=document.createElement('style');
style.id='mcf236-style';
style.textContent=`
/* 2.3.6: chat medido pela geometria real do shell e da viewport. */
.mcf233-overlay{
  position:fixed!important;
  left:0!important;
  right:0!important;
  top:var(--mcf236-top,0px)!important;
  bottom:var(--mcf236-bottom,0px)!important;
  width:auto!important;
  height:auto!important;
  min-height:0!important;
  max-height:none!important;
  padding:0!important;
  margin:0!important;
  transform:none!important;
  align-items:stretch!important;
  justify-content:center!important;
  overflow:hidden!important;
  z-index:2147483400!important;
}
.mcf233-sheet{
  width:min(620px,100%)!important;
  height:100%!important;
  min-height:0!important;
  max-height:none!important;
  margin:0 auto!important;
  padding:0!important;
  border-radius:0!important;
  display:flex!important;
  flex-direction:column!important;
  overflow:hidden!important;
  box-sizing:border-box!important;
}
.mcf233-head{display:flex!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;min-height:62px!important}
.mcf233-conv{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overscroll-behavior:contain!important}
.mcf233-selected{flex:0 0 auto!important;position:relative!important;z-index:5!important}
.mcf233-compose{
  display:grid!important;
  visibility:visible!important;
  opacity:1!important;
  flex:0 0 auto!important;
  position:relative!important;
  z-index:6!important;
  grid-template-columns:44px minmax(0,1fr) 50px!important;
  padding:9px 10px!important;
  margin:0!important;
  box-sizing:border-box!important;
}
.mcf233-note{display:block!important;flex:0 0 auto!important;position:relative!important;z-index:6!important;padding-bottom:max(7px,env(safe-area-inset-bottom,0px))!important}
.mcf233-attach,.mcf233-send{display:block!important;visibility:visible!important;opacity:1!important;min-width:44px!important;min-height:44px!important}
.mcf233-compose textarea{min-width:0!important;max-width:100%!important;box-sizing:border-box!important}
.mcf233-toast{z-index:2147483401!important;bottom:calc(var(--mcf236-bottom,0px) + 12px)!important}
@media(min-width:760px){
  .mcf233-overlay{top:0!important;bottom:0!important;align-items:center!important;padding:24px!important;z-index:2147483400!important}
  .mcf233-sheet{height:min(82dvh,720px)!important;border-radius:20px!important}
}
`;
document.head.appendChild(style);

function visibleRect(el){
  if(!el)return null;
  const cs=getComputedStyle(el),r=el.getBoundingClientRect();
  if(cs.display==='none'||cs.visibility==='hidden'||r.width<1||r.height<1)return null;
  return r;
}
function safeBottom(){
  const p=document.createElement('div');
  p.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)';
  document.body.appendChild(p);
  const n=parseFloat(getComputedStyle(p).paddingBottom)||0;
  p.remove();
  return n;
}
function fit(){
  if(!matchMedia('(max-width:759px)').matches)return;
  const winH=Math.max(1,window.innerHeight||document.documentElement.clientHeight||0);
  const header=visibleRect(document.querySelector('.tm-app-header'));
  const nav=visibleRect(document.querySelector('.tm-bottom-nav'));
  const vv=window.visualViewport;
  const viewportTop=vv?Math.max(0,Number(vv.offsetTop)||0):0;
  const viewportBottom=vv?Math.max(0,Math.min(winH,viewportTop+(Number(vv.height)||winH))):winH;

  const top=Math.max(viewportTop,header?Math.max(0,Math.min(winH,header.bottom)):0);
  const navInset=nav?Math.max(0,winH-Math.max(0,Math.min(winH,nav.top))):0;
  const keyboardInset=Math.max(0,winH-viewportBottom);
  const bottom=Math.max(navInset,keyboardInset,safeBottom());

  const maxBottom=Math.max(0,winH-top-220);
  const finalBottom=Math.min(bottom,maxBottom);
  const height=Math.max(220,winH-top-finalBottom);
  const root=document.documentElement;
  root.style.setProperty('--mcf236-top',`${Math.round(top)}px`);
  root.style.setProperty('--mcf236-bottom',`${Math.round(finalBottom)}px`);
  root.style.setProperty('--mcf236-h',`${Math.round(height)}px`);

  const overlay=document.getElementById('mcf233-overlay');
  if(overlay){
    overlay.dataset.fitTop=String(Math.round(top));
    overlay.dataset.fitBottom=String(Math.round(finalBottom));
    overlay.dataset.fitHeight=String(Math.round(height));
  }
}
let raf=0;
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(fit)}
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(schedule,80),{passive:true});
window.visualViewport?.addEventListener('resize',schedule,{passive:true});
window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
document.addEventListener('focusin',e=>{if(e.target?.closest?.('.mcf233-overlay'))setTimeout(schedule,30)},true);
document.addEventListener('focusout',e=>{if(e.target?.closest?.('.mcf233-overlay'))setTimeout(schedule,100)},true);
new MutationObserver(()=>{if(document.body.classList.contains('mcf233-open'))schedule()}).observe(document.body,{attributes:true,attributeFilter:['class']});
const ro=window.ResizeObserver?new ResizeObserver(schedule):null;
if(ro){
  const attach=()=>{const h=document.querySelector('.tm-app-header'),n=document.querySelector('.tm-bottom-nav');if(h)ro.observe(h);if(n)ro.observe(n)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
}
fit();
})();
