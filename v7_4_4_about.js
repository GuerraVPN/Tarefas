(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
const releases=[
 {v:'7.4.4',title:'Correção de carregamento da Escala de Serviço e estabilização da V7.4.3',current:true,items:['Corrige o loader da Escala de Serviço reunindo todos os chunks Base64 antes da decodificação e incluindo o último trecho do núcleo.','Elimina o erro que impedia o carregamento das cinco escalas de serviço.','Publica o núcleo atualizado da Escala de Missão para Dia, Semana e Mês.','Corrige o Gerar aditamento PDF com carregamento seguro do jsPDF, salvamento direto e fallback para Android/WebView.','Atualiza cache-busters e versão visual para V7.4.4.','Restaura no About o histórico detalhado das versões V7.4.1 a V7.4.4.']},
 {v:'7.4.3',title:'Navegação por Dia, Semana e Mês',items:['Novo seletor simplificado com apenas Dia, Semana e Mês nas Escalas de Serviço e Missão.','No modo Dia, as setas avançam ou voltam um dia e o mini calendário permite escolher qualquer data.','No modo Semana, as setas navegam por semanas completas de domingo a sábado; selecionar qualquer data abre automaticamente a semana correspondente.','No modo Mês, as setas navegam mês a mês e o seletor permite escolher diretamente o mês desejado.','O período escolhido é compartilhado entre Serviço e Missão e permanece salvo durante a navegação no Pessoal.','O gerador de PDF usa exatamente o Dia, Semana ou Mês selecionado, inclusive semanas que atravessam a virada de mês ou ano.']},
 {v:'7.4.2',title:'PDF em tabela, transferência de vagas e melhorias de Pessoal',items:['Novo PDF com tabelas em grade, brasão, cabeçalhos, fins de semana destacados e paginação.','Transferências Motorista ↔ Patrulheiro ↔ Permanência com substituição da vaga e herança das referências de folga; Permanência/Canil permanece isolada.','Seletores pesquisáveis de usuário do sistema nas escalas de Serviço e Missão.','Nova escala independente de Permanência/Canil, com rodízios Preta/Vermelha, aditamento e PDF próprios.','Pessoal recebe mensagens, notificações, Bloco de Notas e menu rápido de usuário/perfil no topo.','Trocar por fora da escala permite substituir um integrante por militar que não esteja em nenhuma escala de serviço, herdando ordem e referências de folga da vaga.']},
 {v:'7.4.1',title:'Filtros por período, ordem automática e PDF das tabelas',items:['Escalas de Serviço e Missão recebem os primeiros filtros de período.','Gerar tabela PDF passa a permitir escolher por caixas quais tabelas entram no documento.','A ordem é criada automaticamente ao adicionar militar.','Setas para cima e para baixo permitem reorganizar o rodízio.','Ajustes de cache e versionamento acompanham as novas funções.']}
];
function apply(){
 try{
  if(typeof versions!=='undefined'&&Array.isArray(versions)){
   versions.forEach(x=>{if(x)x.current=false});
   for(const r of [...releases].reverse()){
    const old=versions.find(x=>x.v===r.v);if(old)Object.assign(old,r);else versions.unshift({...r});
   }
   const sel=document.getElementById('versionSelect');
   if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value='7.4.4';sel.dispatchEvent(new Event('change'))}
  }
 }catch(e){console.warn('About V7.4.4:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));
 if(meta)meta.querySelector('b').textContent='7.4.4';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
