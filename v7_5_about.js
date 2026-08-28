(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;
const release={v:'7.5',title:'Edição e exclusão de serviços',current:true,items:[
 'Serviços confirmados passam a exibir claramente o modo de edição.',
 'Salvar alterações atualiza marcação e observação do serviço existente.',
 'Novo botão Excluir serviço remove o lançamento com confirmação explícita.',
 'A exclusão recalcula rodízio e projeções após a remoção.',
 'Toda exclusão é registrada em Últimas alterações da escala de serviço.',
 'Militares com conta recebem notificação de serviço cancelado.',
 'O antigo Tirar serviço passa a ser exibido como Substituir militar.'
]};
function apply(){
 const versions=window.versions;
 if(!Array.isArray(versions))return false;
 versions.forEach(x=>{if(x)x.current=false});
 const old=versions.find(x=>x.v===release.v);
 if(old)Object.assign(old,release);else versions.unshift({...release});
 const sel=document.getElementById('versionSelect');
 if(sel){
   sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');
   sel.value='7.5';
   sel.dispatchEvent(new Event('change'));
 }
 const meta=[...document.querySelectorAll('.meta div')]
   .find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));
 if(meta?.querySelector('b'))meta.querySelector('b').textContent='7.5';
 return true;
}
let tries=0;(function retry(){tries++;if(!apply()&&tries<80)setTimeout(retry,100)})();
})();