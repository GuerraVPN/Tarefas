(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
function init(){
 const release={v:'7.4.2',title:'PDF em tabela, transferências e Canil',current:true,items:['Remove a visualização anual das Escalas de Serviço e Missão, mantendo Hoje, Amanhã, Esta semana e Mês.','Novo gerador de PDF em formato de tabela, com células, cabeçalhos, destaque de finais de semana/feriados, brasão, paginação e seleção das tabelas.','Transferências Motorista ↔ Patrulheiro ↔ Permanência com substituição da vaga e herança das referências de folga.','Permanência/Canil passa a ser uma quinta escala independente, com Preta/Vermelha próprias, ordem, folgas, serviço, Sobreaviso, aditamento e PDF.','Permanência/Canil não participa das transferências para outros serviços.','Seletores de usuário do sistema passam a ter busca por nome na Escala de Serviço e na Escala de Missão.','Páginas de Pessoal passam a usar a área superior padrão com mensagens, notificações, Bloco de Notas e menu rápido de usuário/perfil.','Nova troca direta permite substituir um integrante por militar fora de todas as escalas, preservando ordem e referências de folga da vaga.']};
 try{if(typeof versions!=='undefined'&&Array.isArray(versions)){versions.forEach(x=>{if(x&&x.current)x.current=false});const old=versions.find(x=>x.v==='7.4.2');if(old)Object.assign(old,release);else versions.unshift(release);const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value='7.4.2';sel.dispatchEvent(new Event('change'))}}}catch(e){console.warn('About V7.4.2:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta)meta.querySelector('b').textContent='7.4.2';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
