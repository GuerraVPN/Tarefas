(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
const release={
 v:'7.4.7',
 title:'Finalização do aditamento, horário das missões e controle do site',
 current:true,
 items:[
  'Missões passam a ter horário obrigatório e opção Prontos no local ou Prontos no pelotão.',
  'Aditamento imprime Data/Hora em GDH, por exemplo 230800 AGO 26, seguido da situação de apresentação.',
  'Horário da passagem de serviço passa a ser escolhido no gerador do aditamento, por dia.',
  'Nomes da Escala de Serviço saem em MAIÚSCULO no aditamento; nomes das missões permanecem com a grafia normal.',
  'Ajusta o espaçamento entre Missão, Data/Hora, Local e Militares e os respectivos valores.',
  'Novo Controle do Site exclusivo do Admin: EXIT USERS, Desligar/Iniciar e Reiniciar com aviso global de 30 segundos.',
  'No modo desligado, usuários comuns ficam bloqueados em manutenção; o Admin continua com acesso para reabrir o sistema.',
  'Reiniciar atualiza caches/recursos e recarrega a aplicação mantendo a sessão.',
  'No aditamento, missões sem Local informado omitem completamente a linha Local.'
 ]
};
function apply(){
 try{
  if(typeof versions!=='undefined'&&Array.isArray(versions)){
   versions.forEach(x=>{if(x)x.current=false});
   const old=versions.find(x=>x.v===release.v);if(old)Object.assign(old,release);else versions.unshift({...release});
   const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value='7.4.7';sel.dispatchEvent(new Event('change'))}
  }
 }catch(e){console.warn('About V7.4.7:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta)meta.querySelector('b').textContent='7.4.7';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
