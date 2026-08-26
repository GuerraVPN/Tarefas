(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
const release={
 v:'7.4.8',
 title:'Controle do Site estabilizado e About consolidado',
 current:true,
 items:[
  'Controle do Site passa a identificar qualquer perfil Admin ativo do usuário, mesmo quando outro perfil estiver selecionado.',
  'Botão SITE fica visível no topo e no mobile para Admin, com EXIT USERS, Desligar/Iniciar e Reiniciar.',
  'Mantém aviso global de 30 segundos antes de EXIT USERS, desligamento ou reinício.',
  'Reiniciar limpa caches/recursos e força a aplicação das atualizações mantendo a sessão.',
  'About passa a registrar a V7.4.8 diretamente no HTML e no patch da versão, evitando histórico antigo em cache.',
  'Mantém as correções da V7.4.7: GDH, horário/apresentação da missão, passagem de serviço, nomes do serviço em maiúsculo e Local opcional.'
 ]
};
function apply(){
 try{
  if(typeof versions!=='undefined'&&Array.isArray(versions)){
   versions.forEach(x=>{if(x)x.current=false});
   const old=versions.find(x=>x.v===release.v);if(old)Object.assign(old,release);else versions.unshift({...release});
   const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value='7.4.8';sel.dispatchEvent(new Event('change'))}
  }
 }catch(e){console.warn('About V7.4.8:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta)meta.querySelector('b').textContent='7.4.8';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
