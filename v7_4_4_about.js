(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
const releases=[
 {v:'7.4.5',title:'Correção definitiva do carregamento da Escala de Serviço',current:true,items:['Corrige definitivamente o loader da Escala de Serviço: os seis chunks Base64 passam a ser decodificados individualmente e concatenados em bytes antes da execução.','Mantém o último trecho do núcleo 3b na reconstrução, evitando arquivo truncado.','Força novo cache-buster V7.4.5 na página de Escala de Serviço para impedir reaproveitamento do loader 7.4.4 no Android.','Mantém Dia, Semana e Mês, Permanência/Canil, transferências, substituições e PDF já existentes.']},
 {v:'7.4.4',title:'Primeira tentativa de estabilização do loader',items:['Incluiu o sexto trecho do núcleo da Escala de Serviço e atualizou cache/versão, mas a concatenação Base64 ainda não era compatível com a forma como os chunks haviam sido gerados.']},
 {v:'7.4.3',title:'Navegação por Dia, Semana e Mês',items:['Novo seletor simplificado com apenas Dia, Semana e Mês nas Escalas de Serviço e Missão.','No modo Semana, o período vai de domingo a sábado e pode atravessar mês ou ano.']},
 {v:'7.4.2',title:'PDF em tabela, transferências e Permanência/Canil',items:['Novo PDF em grade, Permanência/Canil independente, transferências Motorista ↔ Patrulheiro ↔ Permanência, notas e seletores pesquisáveis.']},
 {v:'7.4.1',title:'Filtros, ordem automática e PDF',items:['Filtros iniciais de período, ordem automática, setas de reordenação e geração selecionável de PDF.']}
];
function apply(){
 try{
  if(typeof versions!=='undefined'&&Array.isArray(versions)){
   versions.forEach(x=>{if(x)x.current=false});
   for(const r of [...releases].reverse()){const old=versions.find(x=>x.v===r.v);if(old)Object.assign(old,r);else versions.unshift({...r})}
   const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value='7.4.5';sel.dispatchEvent(new Event('change'))}
  }
 }catch(e){console.warn('About V7.4.5:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta)meta.querySelector('b').textContent='7.4.5';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
