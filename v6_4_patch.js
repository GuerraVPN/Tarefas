(function(){
'use strict';

const $=id=>document.getElementById(id);
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

let roleReady=false;
let canApproveDesrel=false;
let activeUser=null;
const pedidoCreatorCache=new Map();
const userNameCache=new Map();
let creatorTimer=null;
let passageProfiles=[];
let passageCaptured=false;
let renderingPassage=false;

function profileUserName(u){
  return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):'';
}

async function resolveRole(){
  try{
    const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');
    if(!base?.id)return;
    activeUser=base;
    if(window.Perfis26){
      try{
        const state=await Perfis26.carregar(supabaseClient,base);
        if(state?.usuario)activeUser=state.usuario;
      }catch(_){}
    }
    const secao=norm(activeUser?.secao),posicao=norm(activeUser?.posicao);
    canApproveDesrel=secao==='admin'||(secao==='fiscalizacao'&&['chefe','auxiliar'].includes(posicao));
  }finally{
    roleReady=true;
    guardDesrelApproval();
  }
}

function guardDesrelApproval(){
  if(!roleReady||canApproveDesrel)return;
  const box=$('pedidoActionButtons');
  if(!box)return;
  const restricted=[...box.querySelectorAll('[data-pedido-action="aprovar"],[data-pedido-action="retornar"]')];
  if(!restricted.length)return;
  restricted.forEach(b=>b.remove());
  if(!box.querySelector('.v64-desrel-wait')){
    const span=document.createElement('span');
    span.className='pedido-status wait v64-desrel-wait';
    span.textContent='Aguardando Chefe/Auxiliar da Fiscalização';
    box.appendChild(span);
  }
  const hint=$('pedidoActionHint');
  if(hint)hint.textContent='Aguardando Fiscalização';
}

function installApprovalGuard(){
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-pedido-action]');
    if(!b||!['aprovar','retornar'].includes(b.dataset.pedidoAction))return;
    if(!roleReady){
      e.preventDefault();e.stopImmediatePropagation();
      alert('Aguarde o carregamento do perfil ativo.');
      return;
    }
    if(canApproveDesrel)return;
    e.preventDefault();e.stopImmediatePropagation();
    alert('Somente Chefe/Auxiliar da Fiscalização ou Admin pode aprovar ou retornar um desrelacionamento.');
  },true);

  const box=$('pedidoActionButtons');
  if(box)new MutationObserver(guardDesrelApproval).observe(box,{childList:true,subtree:true});
}

async function fetchCreator(pedidoId){
  const key=String(pedidoId||'');
  if(!key)return null;
  if(pedidoCreatorCache.has(key))return pedidoCreatorCache.get(key);
  const r=await supabaseClient.from('pedidos_orcamentarios').select('id,criado_por').eq('id',key).maybeSingle();
  if(r.error||!r.data)return null;
  const creator=String(r.data.criado_por||'');
  pedidoCreatorCache.set(key,creator);
  return creator;
}

async function fetchUserName(userId){
  const key=String(userId||'');
  if(!key)return 'Não identificado';
  if(userNameCache.has(key))return userNameCache.get(key);
  const r=await supabaseClient.from('usuarios').select('id,patente,nome_guerra').eq('id',key).maybeSingle();
  const name=!r.error&&r.data?profileUserName(r.data):`Usuário ${key}`;
  userNameCache.set(key,name||`Usuário ${key}`);
  return userNameCache.get(key);
}

async function updateDetailCreator(){
  const field=$('pdCriadoPor');
  if(!field)return;
  const active=document.querySelector('#pedidoList [data-pedido-id].active');
  const pedidoId=active?.dataset.pedidoId;
  if(!pedidoId){field.textContent='-';return;}
  const expected=String(pedidoId);
  field.textContent='Carregando...';
  const creator=await fetchCreator(expected);
  const name=creator?await fetchUserName(creator):'Não identificado';
  const stillActive=document.querySelector('#pedidoList [data-pedido-id].active')?.dataset.pedidoId;
  if(String(stillActive||'')===expected)field.textContent=name;
}

async function decoratePedidoCards(){
  const cards=[...document.querySelectorAll('#pedidoList [data-pedido-id]')];
  const pending=cards.filter(c=>!c.querySelector('.v64-pedido-autor'));
  if(!pending.length){updateDetailCreator();return;}

  const ids=[...new Set(pending.map(c=>String(c.dataset.pedidoId)).filter(Boolean))];
  const missing=ids.filter(id=>!pedidoCreatorCache.has(id));
  if(missing.length){
    const r=await supabaseClient.from('pedidos_orcamentarios').select('id,criado_por').in('id',missing);
    if(!r.error)(r.data||[]).forEach(x=>pedidoCreatorCache.set(String(x.id),String(x.criado_por||'')));
  }
  const creatorIds=[...new Set(ids.map(id=>pedidoCreatorCache.get(id)).filter(Boolean))];
  const missingUsers=creatorIds.filter(id=>!userNameCache.has(id));
  if(missingUsers.length){
    const r=await supabaseClient.from('usuarios').select('id,patente,nome_guerra').in('id',missingUsers);
    if(!r.error)(r.data||[]).forEach(u=>userNameCache.set(String(u.id),profileUserName(u)||`Usuário ${u.id}`));
  }

  pending.forEach(card=>{
    const id=String(card.dataset.pedidoId||'');
    const creator=pedidoCreatorCache.get(id);
    const name=creator?(userNameCache.get(creator)||`Usuário ${creator}`):'Não identificado';
    const p=card.querySelector('p');
    if(!p||card.querySelector('.v64-pedido-autor'))return;
    const line=document.createElement('span');
    line.className='v64-pedido-autor';
    line.style.cssText='display:block;margin-top:4px;font-size:9px;color:var(--v4-muted)';
    line.textContent=`Feito por: ${name}`;
    p.appendChild(line);
  });
  updateDetailCreator();
}

function scheduleCreatorRefresh(){
  clearTimeout(creatorTimer);
  creatorTimer=setTimeout(()=>decoratePedidoCards().catch(()=>{}),80);
}

function installCreatorDisplay(){
  const list=$('pedidoList');
  if(list)new MutationObserver(scheduleCreatorRefresh).observe(list,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  const title=$('pdTitle');
  if(title)new MutationObserver(scheduleCreatorRefresh).observe(title,{childList:true,characterData:true,subtree:true});
  scheduleCreatorRefresh();
}

function parsePassageOption(o){
  const full=String(o.textContent||'').trim();
  const pieces=full.split(' — ');
  const name=(pieces.shift()||full).trim();
  const meta=pieces.join(' — ').trim();
  const slash=meta.split(' / ');
  const secao=(slash.shift()||'Sem seção').trim()||'Sem seção';
  const posicao=slash.join(' / ').trim();
  return {value:String(o.value),user:String(o.dataset.user||''),name,secao,posicao,full};
}

function renderPassageProfiles(filter=''){
  if(!passageCaptured||renderingPassage)return;
  const sel=$('pgNovoPerfil');if(!sel)return;
  const current=sel.value;
  const q=norm(filter);
  const visible=passageProfiles.filter(x=>!q||norm(`${x.name} ${x.secao} ${x.posicao} ${x.full}`).includes(q));
  const groups=new Map();
  visible.sort((a,b)=>a.secao.localeCompare(b.secao,'pt-BR')||a.name.localeCompare(b.name,'pt-BR')||a.posicao.localeCompare(b.posicao,'pt-BR'));
  visible.forEach(x=>{if(!groups.has(x.secao))groups.set(x.secao,[]);groups.get(x.secao).push(x)});

  renderingPassage=true;
  const frag=document.createDocumentFragment();
  const first=document.createElement('option');first.value='';first.textContent=visible.length?'Selecione o novo detentor...':'Nenhum perfil encontrado';frag.appendChild(first);
  for(const [secao,items] of groups){
    const group=document.createElement('optgroup');group.label=secao;
    items.forEach(x=>{
      const o=document.createElement('option');
      o.value=x.value;o.dataset.user=x.user;
      o.textContent=x.posicao?`${x.name} — ${x.posicao}`:x.name;
      group.appendChild(o);
    });
    frag.appendChild(group);
  }
  sel.replaceChildren(frag);
  if(current&&visible.some(x=>x.value===current))sel.value=current;
  renderingPassage=false;
}

function capturePassageProfiles(){
  if(passageCaptured||renderingPassage)return;
  const sel=$('pgNovoPerfil');if(!sel)return;
  const opts=[...sel.querySelectorAll('option')].filter(o=>o.value);
  if(!opts.length)return;
  passageProfiles=opts.map(parsePassageOption);
  passageCaptured=true;
  renderPassageProfiles($('pgNovoPerfilBusca')?.value||'');
}

function installPassageSelector(){
  const sel=$('pgNovoPerfil'),search=$('pgNovoPerfilBusca');
  if(!sel||!search)return;
  new MutationObserver(()=>{if(!renderingPassage)capturePassageProfiles()}).observe(sel,{childList:true,subtree:true});
  search.addEventListener('input',()=>renderPassageProfiles(search.value));
  $('btnNovaPassagem')?.addEventListener('click',()=>setTimeout(()=>{
    search.value='';
    renderPassageProfiles('');
  },0));
  capturePassageProfiles();
}

async function start(){
  installApprovalGuard();
  installCreatorDisplay();
  installPassageSelector();
  await resolveRole();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
