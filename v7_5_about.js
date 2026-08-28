(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
const VERSION='7.5.1';
const releases=[
 {v:'7.5.1',title:'Substituição preserva o rodízio e versão unificada',current:true,items:[
  'Substituir militar altera somente quem executa o serviço confirmado.',
  'O militar originalmente escalado continua sendo a referência normal do rodízio e das folgas.',
  'O militar substituto não herda a posição nem as folgas do militar substituído.',
  'A Escala Preta e a Escala Vermelha continuam independentes.',
  'Versão exibida é unificada em 7.5.1, inclusive no Painel SITE, eliminando conflito visual com 7.4.12.'
 ]},
 {v:'7.5',title:'Edição e exclusão de serviços',items:[
  'Serviços confirmados podem ser editados.',
  'Novo comando Excluir serviço com auditoria e notificação de cancelamento.',
  'Substituir militar fica separado da exclusão.'
 ]}
];
function apply(){
 const versions=window.versions;
 if(!Array.isArray(versions))return false;
 versions.forEach(x=>{if(x)x.current=false});
 for(const rel of [...releases].reverse()){
  const old=versions.find(x=>x.v===rel.v);
  if(old)Object.assign(old,rel);else versions.unshift({...rel});
 }
 const sel=document.getElementById('versionSelect');
 if(sel){sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');sel.value=VERSION;sel.dispatchEvent(new Event('change'));}
 const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));
 if(meta?.querySelector('b'))meta.querySelector('b').textContent=VERSION;
 return true;
}
let tries=0;(function retry(){tries++;if(!apply()&&tries<100)setTimeout(retry,100)})();
})();