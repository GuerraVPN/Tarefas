(() => {
  'use strict';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='dashboard.html') return;
  function removeNextService(){
    document.getElementById('kNextServiceCard')?.remove();
    document.getElementById('tmNextServiceStyle184')?.remove();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',removeNextService,{once:true});
  else removeNextService();
  window.addEventListener('load',removeNextService,{once:true});
})();
