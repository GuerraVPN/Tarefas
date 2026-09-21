(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html'||window.__TAREFAS_V791_ABOUT__)return;
window.__TAREFAS_V791_ABOUT__=true;
const VERSION='7.9.1';
const release={v:VERSION,title:'Web 7.9.1 — Painel SITE e estabilização',current:true,items:[
'Painel SITE reconstruído com fallback entre RPCs 7.4.12, 7.4.9 e 7.4.7.',
'EXIT USERS avisa usuários comuns e encerra as sessões, redirecionando para o Login; perfis Admin permanecem ativos.',
'Reiniciar SITE avisa usuários comuns e redireciona para reiniciar.html; perfis Admin permanecem no sistema.',
'Desligar SITE avisa usuários comuns e redireciona para desligado.html até que o Admin inicie o sistema.',
'Central 2.0 mantém Favoritos e Filtros com versionamento de estado, deduplicação e renomeação de favoritos.',
'Fila Web passa a mostrar ações pendentes/falhas e oferece nova tentativa.',
'Calendário, labels de serviço, editor de serviço e UI global deixam de usar pollings agressivos e passam a reagir a eventos.',
'Mantidas as melhorias da Web 7.9.0 e a aproximação com o Android 2.3.25.'
]};
function apply(){const versions=window.versions;if(!Array.isArray(versions))return false;versions.forEach(x=>{if(x)x.current=false});const old=versions.find(x=>x.v===VERSION);if(old)Object.assign(old,release);else versions.unshift(release);const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value=VERSION;sel.dispatchEvent(new Event('change'))}const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta?.querySelector('b'))meta.querySelector('b').textContent=VERSION;return true}
let tries=0;(function retry(){tries++;if(!apply()&&tries<100)setTimeout(retry,100)})();
})();
