/* TAREFAS V7.4.4 — hotfix do loader da Escala de Serviço.
   O núcleo funcional permanece o da V7.4.3; esta versão corrige a reconstrução
   dos chunks Base64 publicados no GitHub. */
(function(){
'use strict';
const VERSION='7.4.4';
const CORE_VERSION='7.4.3';
const PARTS=[
  'v7_4_3_service_core_0.js',
  'v7_4_3_service_core_1.js',
  'v7_4_3_service_core_2a.js',
  'v7_4_3_service_core_2b.js',
  'v7_4_3_service_core_3a.js',
  'v7_4_3_service_core_3b.js'
];
window.__v743serviceCoreChunks=[];
function load(src){
  return new Promise((ok,no)=>{
    const s=document.createElement('script');
    s.src=src+'?v='+VERSION;
    s.onload=ok;
    s.onerror=()=>no(new Error('Falha ao carregar '+src));
    document.head.appendChild(s);
  });
}
async function boot(){
  try{
    for(const p of PARTS)await load(p);
    const chunks=window.__v743serviceCoreChunks;
    if(!Array.isArray(chunks)||chunks.length!==PARTS.length||chunks.some(x=>typeof x!=='string'||!x.length)){
      throw new Error('Núcleo da Escala de Serviço incompleto.');
    }
    const b64=chunks.join('');
    const bin=atob(b64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const source=new TextDecoder('utf-8').decode(bytes);
    if(!source.includes("ESCALA_UI_VERSION='"+CORE_VERSION+"'")||!source.includes("canil:'Permanência/Canil'")){
      throw new Error('Validação do núcleo da Escala de Serviço falhou.');
    }
    if(!source.trim().endsWith('})();'))throw new Error('Núcleo da Escala de Serviço truncado.');
    (0,eval)(source);
    window.__TAREFAS_SERVICE_UI_VERSION='7.4.4';
  }catch(e){
    console.error('TAREFAS V7.4.4:',e);
    const board=document.getElementById('scaleBoard');
    if(board)board.innerHTML='<div class="v7-empty">Erro ao carregar a Escala de Serviço V7.4.4. Atualize a página.</div>';
  }finally{
    window.__v743serviceCoreChunks=null;
  }
}
boot();
})();
