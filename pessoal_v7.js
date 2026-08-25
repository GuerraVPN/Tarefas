/* TAREFAS V7.4.3 — loader do núcleo da Escala de Serviço. */
(function(){
'use strict';
const VERSION='7.4.3';
const PARTS=['v7_4_3_service_core_0.js','v7_4_3_service_core_1.js','v7_4_3_service_core_2a.js','v7_4_3_service_core_2b.js','v7_4_3_service_core_3a.js'];
window.__v743serviceCoreChunks=[];
function load(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src+'?v='+VERSION;s.onload=ok;s.onerror=()=>no(new Error('Falha ao carregar '+src));document.head.appendChild(s)})}
async function boot(){try{for(const p of PARTS)await load(p);if(window.__v743serviceCoreChunks.length!==PARTS.length||window.__v743serviceCoreChunks.some(x=>!x))throw new Error('Núcleo da Escala de Serviço incompleto.');const arrays=window.__v743serviceCoreChunks.map(b64=>{const bin=atob(b64),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a});const size=arrays.reduce((n,a)=>n+a.length,0),all=new Uint8Array(size);let off=0;for(const a of arrays){all.set(a,off);off+=a.length}const source=new TextDecoder('utf-8').decode(all);if(!source.includes("ESCALA_UI_VERSION='7.4.3'")||!source.includes("canil:'Permanência/Canil'"))throw new Error('Validação do núcleo V7.4.3 falhou.');(0,eval)(source)}catch(e){console.error('TAREFAS V7.4.3:',e);const board=document.getElementById('scaleBoard');if(board)board.innerHTML='<div class="v7-empty">Erro ao carregar a Escala de Serviço V7.4.3. Atualize a página.</div>'}finally{window.__v743serviceCoreChunks=null}}
boot();
})();
