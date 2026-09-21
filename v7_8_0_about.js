(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html'||window.__TAREFAS_V790_ABOUT__)return;
window.__TAREFAS_V790_ABOUT__=true;
const VERSION='7.9.0';
const release={v:VERSION,title:'Web 7.9.0 — Central 2.0 e paridade com o app',current:true,items:[
'Central 2.0 no navegador com seleção múltipla, filtros, retenção, silenciamento e ações em lote.',
'Favoritos passam a aceitar páginas, módulos e subabas internas, incluindo os módulos de Orçamentários.',
'Filtros salvos guardam rota, subaba e valores dos campos, com abrir, renomear, substituir e excluir.',
'Quadro e Minhas Tarefas ganham filtro combinado por seção, busca e status.',
'Assistente IA Web usa contexto recente mais enxuto, mostra a versão 7.9.0 e recebe indicador de tempo de resposta.',
'Adicionadas Central de Erros Web, fila sequencial para ações da Central quando a conexão oscila e proteção contra respostas assíncronas obsoletas.',
'O carregador global foi aliviado, removendo a verificação de versão a cada 5 segundos e observações desnecessárias de texto.',
'A Web 7.9.0 vira a nova base para aproximar o site do Android 2.3.25 e da futura Release 2.4.'
]};
function apply(){const versions=window.versions;if(!Array.isArray(versions))return false;versions.forEach(x=>{if(x)x.current=false});const old=versions.find(x=>x.v===VERSION);if(old)Object.assign(old,release);else versions.unshift(release);const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value=VERSION;sel.dispatchEvent(new Event('change'))}const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta?.querySelector('b'))meta.querySelector('b').textContent=VERSION;return true}
let tries=0;(function retry(){tries++;if(!apply()&&tries<100)setTimeout(retry,100)})();
})();
