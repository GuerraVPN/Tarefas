(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
const release={
 v:'7.4.10',
 title:'Painel SITE estrutural para contas Admin',
 current:true,
 items:[
  'Painel SITE passa a ser recriado de forma estável após qualquer reconstrução da sidebar.',
  'Permissão do Painel SITE considera qualquer perfil Admin ativo vinculado à conta, mesmo com outro perfil selecionado.',
  'Validação Admin deixa de disparar consultas repetidas ao Supabase durante alterações do Dashboard.',
  'Painel SITE volta a aparecer logo abaixo de Dashboard em todas as telas que usam a navegação global.',
  'Mantém os controles EXIT USERS, Desligar, Reiniciar, Iniciar e Cancelar ação.'
 ]
};
function apply(){
 try{
  if(typeof versions!=='undefined'&&Array.isArray(versions)){
   versions.forEach(x=>{if(x)x.current=false});
   const old=versions.find(x=>x.v===release.v);if(old)Object.assign(old,release);else versions.unshift({...release});
   const sel=document.getElementById('versionSelect');if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value=release.v;sel.dispatchEvent(new Event('change'))}
  }
 }catch(e){console.warn('About V7.4.10:',e)}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));if(meta)meta.querySelector('b').textContent=release.v;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
