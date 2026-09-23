(()=>{'use strict';
const MARK='__TAREFAS_BETA_244_CONSOLIDATED__';
if(globalThis[MARK])return;
globalThis[MARK]=true;

const API='https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/tarefas-escalas';
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const getSession=()=>String(localStorage.getItem('tarefasPushSession17')||'').trim();
const getUser=()=>{try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')||{}}catch(_){return {}}};

function cleanup(){
  document.querySelectorAll('#kNextServiceCard,[data-tarefas-next-service],.k-next-service-card').forEach(e=>e.remove());
  [...document.querySelectorAll('a,button,li,[role="menuitem"]')].forEach(el=>{
    const h=norm(el.getAttribute?.('href')||el.dataset?.href||''), t=norm(el.textContent);
    if(h.includes('pessoal.html')||h.includes('missao.html')||h.includes('docs.google.com/spreadsheets')||h.includes('script.google.com')||t==='pessoal / escalas'||t==='missões'||t==='missoes'){
      const i=el.closest?.('li,[role="menuitem"]')||el;
      i.style.display='none';
      i.setAttribute('data-tarefas-244-hidden','true');
    }
  });
  document.querySelectorAll('iframe').forEach(el=>{
    const s=String(el.src||'').toLowerCase();
    if(s.includes('docs.google.com/spreadsheets')||s.includes('script.google.com'))el.style.display='none';
  });
  const box=document.getElementById('tmPatchOfficial');
  if(box)[...box.querySelectorAll('.tm-patch-item')].forEach(card=>{
    const txt=norm(card.textContent);
    if(txt.includes('2.4.3.1')||txt.includes('2.4.3.2')||txt.includes('2.4.3.3')||txt.includes('2.4.3.4')||txt.includes('2.4.3.5')||txt.includes('2.4.3.6'))card.style.display='none';
  });
}

async function fetchScale(kind){
  const token=getSession();
  if(token.length<32)throw new Error('Sessão do TAREFAS ausente ou expirada. Faça login novamente.');
  const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-tarefas-session':token},body:JSON.stringify({escala:kind})});
  let data=null;try{data=await res.json()}catch(_){}
  if(!res.ok||!data?.ok)throw new Error(data?.error||('Falha ao consultar a escala (HTTP '+res.status+').'));
  return data;
}

function openScales(){
  document.getElementById('tm244-scale-back')?.remove();
  const u=getUser(), root=document.createElement('div');
  root.id='tm244-scale-back';
  root.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:2147483000;display:flex;align-items:flex-end;justify-content:center';
  root.innerHTML='<section style="width:min(680px,100%);max-height:92vh;overflow:auto;background:var(--card,#10151b);color:var(--text,#fff);border-radius:24px 24px 0 0;padding:18px;box-shadow:0 -12px 50px rgba(0,0,0,.35)">'+
    '<div style="display:flex;align-items:center;justify-content:space-between"><div><b style="font-size:22px">Escalas</b><div style="opacity:.65;font-size:13px">'+esc((u.patente||'')+' '+(u.nome_guerra||''))+'</div></div><button data-tm244-close style="border:0;background:transparent;color:inherit;font-size:28px">×</button></div>'+
    '<div style="display:flex;gap:8px;overflow:auto;margin:12px 0"><button data-tm244-kind="motorista_pa">Motorista PA</button><button data-tm244-kind="patrulheiro">Patrulheiro</button><button data-tm244-kind="permanencia">Permanência</button></div>'+
    '<button data-tm244-sync style="width:100%;padding:12px;border:0;border-radius:14px;font-weight:800">Sincronizar agora</button>'+
    '<div data-tm244-body style="margin-top:12px">Carregando escala…</div>'+
    '<div style="opacity:.5;font-size:11px;text-align:center;margin-top:12px">Google Sheets → Apps Script → Supabase → TAREFAS</div></section>';
  document.body.appendChild(root);
  const body=root.querySelector('[data-tm244-body]'), tabs=[...root.querySelectorAll('[data-tm244-kind]')];
  root.querySelector('[data-tm244-close]').onclick=()=>root.remove();
  root.onclick=e=>{if(e.target===root)root.remove()};
  async function load(kind){
    tabs.forEach(t=>{t.style.fontWeight=t.dataset.tm244Kind===kind?'800':'600';});
    body.innerHTML='<div style="padding:18px;text-align:center;opacity:.75">Sincronizando com a planilha…</div>';
    try{
      const data=await fetchScale(kind);
      const matches=Array.isArray(data?.escalas?.[kind]?.matches)?data.escalas[kind].matches:[];
      if(!matches.length){body.innerHTML='<div style="padding:18px;text-align:center;opacity:.75">Não encontrei seu nome nesta escala.</div>';return;}
      body.innerHTML=matches.map(m=>'<div style="border:1px solid rgba(127,127,127,.18);border-radius:16px;padding:14px;margin:10px 0"><b>'+esc(m.date||'Data não identificada')+'</b><div style="font-size:12px;opacity:.65;margin-top:4px">'+esc(m.aba||'')+' · linha '+esc(m.row)+' · coluna '+esc(m.col)+'</div><div style="font-size:13px;margin-top:8px">'+esc(m.cell)+' — '+(m.values||[]).map(v=>esc(v.value||'')).join(' · ')+'</div></div>').join('');
    }catch(e){body.innerHTML='<div style="padding:14px;border-radius:14px;background:rgba(220,80,80,.08)">'+esc(e?.message||e)+'</div>';}
  }
  tabs.forEach(t=>t.onclick=()=>load(t.dataset.tm244Kind));
  root.querySelector('[data-tm244-sync]').onclick=()=>load(root.querySelector('[data-tm244-kind][data-active="1"]')?.dataset.tm244Kind||'patrulheiro');
  const original=tabs.find(t=>t.dataset.tm244Kind==='patrulheiro')||tabs[0];
  if(original)original.dataset.active='1';
  tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>delete x.dataset.active);t.dataset.active='1';}));
  load(original?.dataset.tm244Kind||'patrulheiro');
}

document.addEventListener('click',e=>{
  const el=e.target?.closest?.('[data-href="#escalas"],a[href="#escalas"]');
  if(!el)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation?.();
  openScales();
},true);

cleanup();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});
new MutationObserver(cleanup).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('focus',cleanup);
window.addEventListener('pageshow',cleanup);
})();