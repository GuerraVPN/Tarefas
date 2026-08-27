(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
const releases=[
 {v:'7.4.11',title:'Correção do loop e estabilização do Painel SITE',current:true,items:[
  'Remove o observer global da V7.4.10 que podia disparar atualizações sucessivas do DOM.',
  'Painel SITE passa a reaparecer de forma segura sem consultas repetidas ao Supabase.',
  'A visibilidade do Painel SITE considera qualquer perfil Admin ativo vinculado à conta.',
  'Mantém validação administrativa forte ao abrir ou executar ações do Painel SITE.',
  'Corrige o histórico do About para exibir corretamente V7.4.9, V7.4.10 e V7.4.11.'
 ]},
 {v:'7.4.10',title:'Painel SITE estrutural para contas Admin',items:[
  'Painel SITE passa a ser recriado após reconstruções da sidebar.',
  'Permissão do Painel SITE considera qualquer perfil Admin ativo vinculado à conta, mesmo com outro perfil selecionado.',
  'Validação Admin deixa de disparar consultas repetidas durante alterações comuns do Dashboard.',
  'Painel SITE é posicionado logo abaixo de Dashboard.',
  'Mantém EXIT USERS, Desligar, Reiniciar, Iniciar e Cancelar ação.'
 ]},
 {v:'7.4.9',title:'Correções de perfis, Dashboard e integração do Painel SITE',items:[
  'Corrige o carregamento de múltiplos perfis ativos no menu do usuário.',
  'Corrige o perfil exibido em Configurações e compatibilidade da sidebar.',
  'Restaura a integração correta do Dashboard com o Supabase.',
  'Adiciona RPCs versionadas para consultar e controlar o estado do SITE.',
  'Inicia a disponibilização global do Painel SITE para contas com perfil Admin.'
 ]}
];
function apply(){
 try{
  if(typeof versions!=='undefined'&&Array.isArray(versions)){
   versions.forEach(x=>{if(x)x.current=false});
   for(let i=releases.length-1;i>=0;i--){
    const release=releases[i];
    const old=versions.find(x=>x.v===release.v);
    if(old)Object.assign(old,release);else versions.unshift({...release});
   }
   const sel=document.getElementById('versionSelect');
   if(sel){
    sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');
    sel.value='7.4.11';
    sel.dispatchEvent(new Event('change'));
   }
  }
 }catch(e){console.warn('About V7.4.11:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));
 if(meta)meta.querySelector('b').textContent='7.4.11';
 document.documentElement.dataset.tarefasVersion='7.4.11';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
