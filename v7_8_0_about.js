(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html'||window.__TAREFAS_V780_ABOUT__)return;
window.__TAREFAS_V780_ABOUT__=true;
const VERSION='7.8.0';
const release={v:VERSION,title:'Assistente IA chega ao TAREFAS',current:true,items:[
'Adicionado o novo balão ✨ IA no site, disponível para usuários autenticados.',
'O Assistente IA responde perguntas, ajuda a redigir textos e mantém um histórico curto da conversa no navegador.',
'A comunicação passa pelo backend do TAREFAS; a chave do provedor de IA não é exposta no navegador nem no aplicativo.',
'O backend valida a sessão do usuário e limita a frequência de mensagens para proteger a cota gratuita.',
'Nesta primeira versão oficial, a IA permanece em modo somente leitura e ainda não consulta nem altera dados internos do TAREFAS.',
'A versão Android 2.3.0 Oficial acompanha a mesma estreia do Assistente IA.'
]};
function apply(){const versions=window.versions;if(!Array.isArray(versions))return false;versions.forEach(x=>{if(x)x.current=false});const old=versions.find(x=>x.v===VERSION);if(old)Object.assign(old,release);else versions.unshift(release);const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value=VERSION;sel.dispatchEvent(new Event('change'))}const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta?.querySelector('b'))meta.querySelector('b').textContent=VERSION;return true}
let tries=0;(function retry(){tries++;if(!apply()&&tries<100)setTimeout(retry,100)})();
})();
