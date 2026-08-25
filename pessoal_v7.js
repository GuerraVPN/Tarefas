/* TAREFAS V7.4.2 — loader do núcleo da Escala de Serviço.
   O núcleo foi dividido em partes para publicação confiável no GitHub. */
(function(){
'use strict';
const VERSION='7.4.2';
const PARTS=['v7_4_2_service_core_0.js','v7_4_2_service_core_1.js','v7_4_2_service_core_2.js','v7_4_2_service_core_3.js'];
window.__v742CoreChunks=[];
function load(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src+'?v='+VERSION;s.onload=ok;s.onerror=()=>no(new Error('Falha ao carregar '+src));document.head.appendChild(s)})}
async function boot(){
 try{
  for(const p of PARTS)await load(p);
  if(window.__v742CoreChunks.length!==PARTS.length||window.__v742CoreChunks.some(x=>!x))throw new Error('Núcleo da Escala de Serviço incompleto.');
  const arrays=window.__v742CoreChunks.map(b64=>{const bin=atob(b64),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a});
  const size=arrays.reduce((n,a)=>n+a.length,0),all=new Uint8Array(size);let off=0;for(const a of arrays){all.set(a,off);off+=a.length}
  const source=new TextDecoder('utf-8').decode(all);
  if(!source.includes("ESCALA_UI_VERSION='7.4.2'")||!source.includes("canil:'Permanência/Canil'"))throw new Error('Validação do núcleo V7.4.2 falhou.');
  (0,eval)(source);
 }catch(e){console.error('TAREFAS V7.4.2:',e);const board=document.getElementById('scaleBoard');if(board)board.innerHTML='<div class="v7-empty">Erro ao carregar a Escala de Serviço V7.4.2. Atualize a página.</div>'}
 finally{window.__v742CoreChunks=null}
}
boot();
})();
