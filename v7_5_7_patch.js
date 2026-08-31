(function(){
'use strict';
if(window.__TAREFAS_V757_PATCH__)return;
window.__TAREFAS_V757_PATCH__=true;
const page=(location.pathname.split('/').pop()||'').toLowerCase();
if(page!=='pessoal.html'&&page!=='missao.html')return;
const style=document.createElement('style');
style.id='v757ScaleThemeFix';
style.textContent=`
:root,html[data-theme="light"]{
 --v757-grid-bg:#f8fafc;--v757-grid-text:#111827;--v757-grid-head:#e7ebf0;--v757-grid-day:#f3f6f9;--v757-grid-weekend:#f6d1d1;--v757-grid-border:#cbd5e1;--v757-meta:#475569;--v757-next:#9a6700;--v757-qual:#1d4ed8;
}
html[data-theme="military"]{
 --v757-grid-bg:#ece9d2;--v757-grid-text:#24291b;--v757-grid-head:#d5d0ad;--v757-grid-day:#e6e1c7;--v757-grid-weekend:#d9aaa0;--v757-grid-border:#a9a47f;--v757-meta:#555d45;--v757-next:#7a5a14;--v757-qual:#3f5874;
}
html[data-theme="dark"]{
 --v757-grid-bg:#0d1114;--v757-grid-text:#f3f4f6;--v757-grid-head:#171c20;--v757-grid-day:#101417;--v757-grid-weekend:#792929;--v757-grid-border:#414950;--v757-meta:#94a3b8;--v757-next:#facc15;--v757-qual:#93c5fd;
}
html[data-theme="night"]{
 --v757-grid-bg:#08101b;--v757-grid-text:#e7eef8;--v757-grid-head:#0f1a2a;--v757-grid-day:#0c1724;--v757-grid-weekend:#692b36;--v757-grid-border:#29415f;--v757-meta:#91a2ba;--v757-next:#e6c85e;--v757-qual:#93c5fd;
}
.v7-table{background:var(--v757-grid-bg)!important;color:var(--v757-grid-text)!important}
.v7-table th,.v7-table td{color:var(--v757-grid-text)!important;border-color:var(--v757-grid-border)!important}
.v7-table thead th,.v7-table th:first-child,.v7-table td:first-child{background:var(--v757-grid-head)!important;color:var(--v757-grid-text)!important}
.v7-table .v7-user,.v7-table .v7-user *{color:var(--v757-grid-text)!important}
.v7-table .v721-person-meta,.v7-table .v74-member-meta{color:var(--v757-meta)!important}
.v7-table .v721-person-meta.next,.v7-table .v74-member-meta.next{color:var(--v757-next)!important}
.v7-table .v721-person-meta.qual,.v7-table .v74-member-meta.qual{color:var(--v757-qual)!important}
.v7-table .v7-day.normal{background:var(--v757-grid-day)!important;color:var(--v757-grid-text)!important}
.v7-table .v7-day.weekend{background:var(--v757-grid-weekend)!important;color:var(--v757-grid-text)!important}
.v7-table .v7-day.normal.folga-count,.v7-table .v7-day.weekend.folga-count{color:var(--v757-grid-text)!important}
.v7-table .v7-day.service,.v7-table .v7-day.predicted,.v74-table .v7-day.mission,.v74-table .v7-day.projected{background:#f0d900!important;color:#111!important;font-weight:900}
.v7-table .v7-day.service *,.v7-table .v7-day.predicted *,.v74-table .v7-day.mission *,.v74-table .v7-day.projected *{color:#111!important}
.v7-table .v7-day.vacation{background:#2563eb!important;color:#fff!important}.v7-table .v7-day.vacation *{color:#fff!important}
.v7-table .v7-day.adaptation{background:#64748b!important;color:#fff!important}.v7-table .v7-day.adaptation *{color:#fff!important}
.v7-panel-head{background:var(--v4-surface-3)!important;color:var(--v4-text)!important;border-color:var(--v4-border)!important}
.v7-panel-head h3{color:var(--v4-text)!important}.v7-panel-head span{color:var(--v4-muted)!important}
.v7-wrap{background:var(--v757-grid-bg)!important}
`;
document.head.appendChild(style);
})();