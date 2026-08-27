(function(){
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='about.html')return;

const releases=[
 {v:'7.4.12',title:'Validação única do Admin e estabilização definitiva do Painel SITE',current:true,items:[
  'Painel SITE passa a usar uma única fonte de autorização administrativa.',
  'Nova RPC retorna diretamente se a conta é Admin e qual perfil Admin deve ser usado.',
  'Ações do SITE deixam de depender do perfil atualmente selecionado no Dashboard.',
  'Controle legado V7.4.8 e cores V7.4.9/V7.4.10/V7.4.11 deixam de concorrer entre si.',
  'Removido MutationObserver global; atualização do menu é local e sem consultas repetidas.',
  'Versão e histórico do About passam a incluir corretamente V7.4.9, V7.4.10, V7.4.11 e V7.4.12.'
 ]},
 {v:'7.4.11',title:'Correção do loop e estabilização do carregamento',items:[
  'Remove observação global do DOM que podia provocar atualizações em cascata.',
  'Painel SITE passa a observar apenas a existência do item na navegação.',
  'Reduz consultas periódicas ao estado do SITE e preserva carregamento do Dashboard.'
 ]},
 {v:'7.4.10',title:'Painel SITE estrutural para contas Admin',items:[
  'Painel SITE passa a ser recriado após reconstruções da sidebar.',
  'Permissão visual considera qualquer perfil Admin ativo vinculado à conta.',
  'Painel SITE é posicionado logo abaixo de Dashboard.'
 ]},
 {v:'7.4.9',title:'Perfis, Dashboard e integração do Controle do SITE',items:[
  'Corrige carregamento dos perfis do usuário no Dashboard.',
  'Restaura integração correta do Dashboard com o Supabase.',
  'Adiciona RPCs versionadas para estado e controle do SITE.',
  'Corrige duplicação do bloco Perfil ativo e atualização da versão exibida.'
 ]}
];

function apply(){
  try{
    if(typeof versions!=='undefined'&&Array.isArray(versions)){
      versions.forEach(x=>{if(x)x.current=false});
      for(const rel of [...releases].reverse()){
        const old=versions.find(x=>x.v===rel.v);
        if(old)Object.assign(old,rel);else versions.unshift({...rel});
      }
      versions.sort((a,b)=>{
        const pa=String(a.v).split('.').map(Number),pb=String(b.v).split('.').map(Number);
        for(let i=0;i<Math.max(pa.length,pb.length);i++){const d=(pb[i]||0)-(pa[i]||0);if(d)return d}
        return 0;
      });
      const sel=document.getElementById('versionSelect');
      if(sel){
        sel.innerHTML=versions.map(x=>`<option value="${x.v}">${x.v} — ${x.title}</option>`).join('');
        sel.value='7.4.12';
        sel.dispatchEvent(new Event('change'));
      }
    }
  }catch(e){console.warn('About V7.4.12:',e)}
  const meta=[...document.querySelectorAll('.meta div')].find(x=>x.querySelector('small')?.textContent.includes('Versão atual'));
  if(meta?.querySelector('b'))meta.querySelector('b').textContent='7.4.12';
}
let tries=0;
function tryApply(){
  tries++;
  if(typeof versions!=='undefined'&&Array.isArray(versions)){apply();return}
  if(tries<60)setTimeout(tryApply,100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryApply);else tryApply();
})();