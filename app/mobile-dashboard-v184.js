(() => {
  'use strict';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='dashboard.html') return;
  const removeNextServiceCard=()=>{
    document.getElementById('kNextServiceCard')?.remove();
    document.getElementById('tmNextServiceStyle184')?.remove();
    document.querySelectorAll('.tm-next-service-kpi').forEach(el=>el.remove());
  };
  const boot=()=>{
    removeNextServiceCard();
    setTimeout(removeNextServiceCard,0);
    setTimeout(removeNextServiceCard,500);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.addEventListener('focus',removeNextServiceCard);
  window.addEventListener('pageshow',removeNextServiceCard);
  window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')removeNextServiceCard()});
})();