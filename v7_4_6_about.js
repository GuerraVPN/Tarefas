(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
const releases=[
 {v:'7.4.6',title:'Escala de Serviço estabilizada sem loader por chunks',current:true,items:['Substitui o loader Base64 fragmentado da Escala de Serviço pelo núcleo monolítico validado, eliminando a falha que impedia a tabela de carregar.','Mantém Dia, Semana e Mês, Permanência/Canil, transferências, substituições, notas, habilitações/cursos e geração de PDF.','Atualiza cache-busters e versão global para V7.4.6.']},
 {v:'7.4.5',title:'Tentativa de correção do loader da Escala de Serviço',items:['Adicionou fallback de reconstrução Base64 e novo cache-buster, mas o conjunto de chunks ainda estava inconsistente.']},
 {v:'7.4.4',title:'Primeira tentativa de estabilização do loader',items:['Incluiu trecho adicional do núcleo e ajustes de cache, porém a reconstrução ainda permanecia incompatível.','Corrigiu a geração do aditamento PDF.']},
 {v:'7.4.3',title:'Navegação por Dia, Semana e Mês',items:['Novo seletor simplificado com Dia, Semana e Mês nas Escalas de Serviço e Missão.','No modo Dia há setas e calendário; no modo Semana o período vai de domingo a sábado; no modo Mês é possível navegar ou escolher o mês.']},
 {v:'7.4.2',title:'PDF em tabela, transferências e Permanência/Canil',items:['Novo PDF em grade, Permanência/Canil independente, transferências Motorista ↔ Patrulheiro ↔ Permanência, notas, substituição por pessoa fora das escalas e seletores pesquisáveis.']},
 {v:'7.4.1',title:'Filtros, ordem automática e PDF',items:['Filtros iniciais de período, ordem automática, setas de reordenação e geração selecionável de PDF.']}
];
function apply(){
 try{
  if(typeof versions!=='undefined'&&Array.isArray(versions)){
   versions.forEach(x=>{if(x)x.current=false});
   for(const r of [...releases].reverse()){const old=versions.find(x=>x.v===r.v);if(old)Object.assign(old,r);else versions.unshift({...r})}
   const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value='7.4.6';sel.dispatchEvent(new Event('change'))}
  }
 }catch(e){console.warn('About V7.4.6:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta)meta.querySelector('b').textContent='7.4.6';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
