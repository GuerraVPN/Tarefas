(()=>{
'use strict';
if(window.__TAREFAS_LAV_LAYOUT_V212__)return;
window.__TAREFAS_LAV_LAYOUT_V212__=true;
const style=document.createElement('style');
style.id='lavLayoutV212Style';
style.textContent=`
html.tarefas-mobile-shell body .lav-modal-bg{align-items:center!important;justify-content:center!important;padding:calc(76px + env(safe-area-inset-top,0px)) 8px calc(86px + env(safe-area-inset-bottom,0px))!important;overflow:hidden!important}
html.tarefas-mobile-shell body .lav-modal{width:min(680px,100%)!important;max-width:100%!important;max-height:calc(100dvh - 178px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))!important;margin:0 auto!important;padding:13px 13px 10px!important;border-radius:18px!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;scrollbar-gutter:stable}
html.tarefas-mobile-shell body .lav-modal-head{position:sticky!important;top:-13px!important;z-index:6!important;margin:-13px -13px 10px!important;padding:13px!important;background:#071b15!important;border-bottom:1px solid #24483b!important}
html.tarefas-mobile-shell body .lav-modal-head h3{font-size:20px!important;line-height:1.15!important}
html.tarefas-mobile-shell body .lav-modal textarea{min-height:58px!important;max-height:105px!important;resize:vertical!important}
html.tarefas-mobile-shell body .lav-modal-actions{position:sticky!important;bottom:-10px!important;z-index:6!important;margin:12px -13px -10px!important;padding:10px 13px calc(6px + env(safe-area-inset-bottom,0px))!important;background:linear-gradient(180deg,rgba(7,27,21,.82),#071b15 28%)!important;border-top:1px solid #24483b!important}
html.tarefas-mobile-shell body .lav-modal-actions .lav-btn{min-height:44px!important;flex:1 1 120px!important}
html.tarefas-mobile-shell body .lav-form-grid{min-width:0!important;column-gap:7px!important}
html.tarefas-mobile-shell body .lav-form-grid>*{min-width:0!important}
html.tarefas-mobile-shell body .lav-form-grid input{font-size:16px!important;padding:9px 8px!important}
html.tarefas-mobile-shell body .lav-form-grid output{white-space:nowrap!important;font-size:13px!important}
html.tarefas-mobile-shell body #lavNewForm>label,html.tarefas-mobile-shell body #lavRecvForm>label{margin-top:8px!important}
html.tarefas-mobile-shell body .lav-total{position:sticky!important;bottom:54px!important;z-index:4!important;background:#071b15eF!important;margin:4px -4px 0!important;padding:9px 5px!important;border-top:1px solid #1f4938!important}
@media(max-width:520px){
 html.tarefas-mobile-shell body .lav-modal-bg{padding-left:6px!important;padding-right:6px!important}
 html.tarefas-mobile-shell body .lav-modal{max-height:calc(100dvh - 166px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))!important;padding-inline:11px!important}
 html.tarefas-mobile-shell body .lav-modal-head{margin-left:-11px!important;margin-right:-11px!important;padding-left:11px!important;padding-right:11px!important}
 html.tarefas-mobile-shell body .lav-form-grid{grid-template-columns:minmax(118px,1fr) 78px minmax(96px,.82fr)!important;gap:6px!important}
 html.tarefas-mobile-shell body .lav-form-grid.header{font-size:7px!important}
 html.tarefas-mobile-shell body .lav-form-grid output{font-size:12px!important}
 html.tarefas-mobile-shell body .lav-modal-actions{margin-left:-11px!important;margin-right:-11px!important;padding-left:11px!important;padding-right:11px!important}
}
@media(max-height:720px){
 html.tarefas-mobile-shell body .lav-modal-bg{padding-top:68px!important;padding-bottom:78px!important}
 html.tarefas-mobile-shell body .lav-modal{max-height:calc(100dvh - 146px)!important}
 html.tarefas-mobile-shell body .lav-modal textarea{min-height:48px!important;max-height:74px!important}
}
`;
document.head.appendChild(style);
})();
