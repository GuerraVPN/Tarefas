(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
function init(){
 const release={v:'7.4.3',title:'Navegação por Dia, Semana e Mês',current:true,items:['Novo seletor simplificado com apenas Dia, Semana e Mês nas Escalas de Serviço e Missão.','No modo Dia, as setas avançam ou voltam um dia e o mini calendário permite escolher qualquer data.','No modo Semana, as setas navegam por semanas completas de domingo a sábado; selecionar qualquer data abre automaticamente a semana correspondente.','No modo Mês, as setas navegam mês a mês e o seletor permite escolher diretamente o mês desejado.','O período escolhido é compartilhado entre Serviço e Missão e permanece salvo durante a navegação no Pessoal.','O gerador de PDF passa a usar exatamente o Dia, Semana ou Mês selecionado, inclusive semanas que atravessam a virada de mês ou ano.']};
 try{if(typeof versions!=='undefined'&&Array.isArray(versions)){versions.forEach(x=>{if(x&&x.current)x.current=false});const old=versions.find(x=>x.v==='7.4.3');if(old)Object.assign(old,release);else versions.unshift(release);const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value='7.4.3';sel.dispatchEvent(new Event('change'))}}}catch(e){console.warn('About V7.4.3:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta)meta.querySelector('b').textContent='7.4.3';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
