(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
let user=null,canManage=false,users=new Map(),externals=new Map(),balances=[],vacations=[],uses=[],selected=null;

function pid(){return user?.perfil_id?Number(user.perfil_id):null}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDate(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)}
function addDays(s,n){const d=parseDate(s);d.setDate(d.getDate()+n);return iso(d)}
function adaptationDate(s){let d=addDays(s,1);while([0,6].includes(parseDate(d).getDay()))d=addDays(d,1);return d}
function br(v){return v?parseDate(v).toLocaleDateString('pt-BR'):'-'}
function dt(v){return v?new Date(v).toLocaleString('pt-BR'):'-'}
function fmt(n){n=Number(n||0);return Number.isInteger(n)?String(n):n.toFixed(1).replace('.',',')}
function modal(id,on=true){$(id)?.classList.toggle('open',on)}
function personKey(x){return x.usuario_id?`u:${x.usuario_id}`:`e:${x.pessoa_externa_id}`}
function personName(x){
 if(x.usuario_id){const u=users.get(String(x.usuario_id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${x.usuario_id}`}
 const e=externals.get(String(x.pessoa_externa_id));return e?[e.patente,e.nome].filter(Boolean).join(' '):`Nome externo ${x.pessoa_externa_id}`;
}
function vacFor(x,date=iso(new Date())){return vacations.find(v=>personKey(v)===personKey(x)&&v.data_inicio<=date&&v.data_fim>=date)}
function adaptFor(x,date=iso(new Date())){return vacations.find(v=>personKey(v)===personKey(x)&&adaptationDate(v.data_fim)===date)}
function historyVac(x){return vacations.filter(v=>personKey(v)===personKey(x)).sort((a,b)=>b.data_inicio.localeCompare(a.data_inicio))}
function historyUses(x){return x.usuario_id?uses.filter(u=>String(u.usuario_id)===String(x.usuario_id)).sort((a,b)=>String(b.criado_em).localeCompare(String(a.criado_em))):[]}

async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 user=base;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);if(p?.usuario)user=p.usuario}catch(_){}}
 const r=await supabaseClient.rpc('v7_2_pode_gerenciar_pessoal',{p_usuario_id:Number(user.id),p_perfil_id:pid()});
 canManage=!r.error&&r.data===true;return true;
}
async function loadPeople(){
 const [u,e]=await Promise.all([
  supabaseClient.from('usuarios').select('id,patente,nome_guerra,secao,posicao,ativo').order('nome_guerra'),
  supabaseClient.from('pessoal_nomes_externos').select('id,nome,patente,ativo').eq('ativo',true).order('nome')
 ]);
 if(u.error)throw u.error;if(e.error)throw e.error;
 users=new Map((u.data||[]).filter(x=>x.ativo!==false).map(x=>[String(x.id),x]));
 externals=new Map((e.data||[]).map(x=>[String(x.id),x]));
}
async function load(){
 const [b,v,u]=await Promise.all([
  supabaseClient.rpc('v7_2_1_listar_saldos',{p_usuario_id:Number(user.id),p_perfil_id:pid()}),
  supabaseClient.from('pessoal_ferias').select('*').order('data_inicio',{ascending:false}),
  supabaseClient.from('pessoal_dispensa_usos').select('*').order('criado_em',{ascending:false}).limit(500)
 ]);
 if(b.error)throw b.error;if(v.error)throw v.error;if(u.error)throw u.error;
 balances=b.data||[];
 vacations=(v.data||[]).filter(x=>canManage||String(x.usuario_id)===String(user.id));
 uses=(u.data||[]).filter(x=>canManage||String(x.usuario_id)===String(user.id));
 renderAll();
 if(selected){
  const fresh=balances.find(x=>personKey(x)===personKey(selected));selected=fresh||null;
  if(selected)renderDetail();else{$('fdDetail').hidden=true;$('fdEmpty').hidden=false}
 }
}
function visible(){const q=norm($('peopleSearch').value);return balances.filter(x=>!q||norm(`${personName(x)} ${x.secao||''}`).includes(q))}
function status(x){
 const v=vacFor(x),a=adaptFor(x);
 if(v)return{cls:'vac',txt:`Férias até ${br(v.data_fim)}`};
 if(a)return{cls:'adp',txt:'Adaptação'};
 return{cls:'',txt:'Disponível'};
}
function renderAll(){
 const list=visible();$('peopleCount').textContent=`${list.length} pessoa(s)`;$('sumPeople').textContent=list.length;
 $('sumVacation').textContent=fmt(list.reduce((n,x)=>n+Number(x.ferias_disponiveis||0),0));
 $('sumDispensa').textContent=fmt(list.reduce((n,x)=>n+Number(x.dispensas_disponiveis||0),0));
 $('sumOnVacation').textContent=list.filter(x=>!!vacFor(x)).length;
 $('peopleList').innerHTML=list.length?list.map(x=>{const st=status(x);return `<article class="v721-person-card ${selected&&personKey(selected)===personKey(x)?'active':''}" data-person="${personKey(x)}">
  <div style="display:flex;justify-content:space-between;gap:8px"><h4>${esc(personName(x))}${x.pessoa_externa_id?'<span class="v72-external-tag">SEM CONTA</span>':''}</h4><span class="v721-status ${st.cls}">${esc(st.txt)}</span></div>
  <p>Férias: <b>${fmt(x.ferias_disponiveis)}</b> / ${fmt(x.ferias_credito)} dia(s) · Dispensas: <b>${fmt(x.dispensas_disponiveis)}</b></p>
  ${x.usuario_id?`<p>Missões: +${fmt(x.dispensas_missao)} · Usadas: -${fmt(x.dispensas_usadas)}</p>`:''}
 </article>`}).join(''):'<div class="v7-empty">Nenhuma pessoa neste filtro.</div>';
}
function renderDetail(){
 if(!selected)return;
 const vhist=historyVac(selected),uhist=historyUses(selected),isMe=selected.usuario_id&&String(selected.usuario_id)===String(user.id);
 $('fdEmpty').hidden=true;$('fdDetail').hidden=false;
 $('fdDetail').innerHTML=`<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><h3 style="margin:0">${esc(personName(selected))}</h3><div class="v7-mini">${selected.usuario_id?esc(selected.secao||'-'):'Nome sem conta do sistema'}</div></div><div style="display:flex;gap:6px;flex-wrap:wrap">${canManage?'<button class="v7-btn" data-balance>Créditos</button><button class="v7-btn" data-vacation>Marcar férias</button>':''}${selected.usuario_id&&(isMe||canManage)?'<button class="v7-btn primary" data-dispensa>Usar dispensa</button>':''}</div></div>
 <div class="v721-balance-grid">
  <div><small>Férias creditadas</small><b>${fmt(selected.ferias_credito)} dias</b></div>
  <div><small>Férias disponíveis</small><b>${fmt(selected.ferias_disponiveis)} dias</b></div>
  <div><small>Dispensas de missão</small><b>${fmt(selected.dispensas_missao)}</b></div>
  <div><small>Dispensas disponíveis</small><b>${fmt(selected.dispensas_disponiveis)}</b></div>
 </div>
 <div class="v7-note"><b>Dispensas:</b> crédito manual ${fmt(selected.dispensas_credito_manual)} + missões finalizadas ${fmt(selected.dispensas_missao)} - usadas ${fmt(selected.dispensas_usadas)} = <b>${fmt(selected.dispensas_disponiveis)}</b>. Elas não interferem na Escala de Serviço.</div>
 <div style="margin-top:10px"><b style="font-size:10px">Férias</b><div class="v721-history">${vhist.length?vhist.map(v=>`<div class="v721-history-row"><div style="display:flex;justify-content:space-between;gap:8px"><b>${br(v.data_inicio)} → ${br(v.data_fim)} · ${v.dias_consumidos} dia(s)</b>${canManage?`<button class="v7-btn" data-edit-vac="${v.id}">Editar</button>`:''}</div><small>Adaptação: ${br(adaptationDate(v.data_fim))}${v.observacao?' · '+esc(v.observacao):''}</small></div>`).join(''):'<div class="v7-empty">Sem férias registradas.</div>'}</div></div>
 ${selected.usuario_id?`<div style="margin-top:10px"><b style="font-size:10px">Dispensas utilizadas</b><div class="v721-history">${uhist.length?uhist.map(u=>`<div class="v721-history-row"><b>${u.quantidade} dispensa(s)</b><small>${(u.dias||[]).map(br).join(', ')} · ${dt(u.criado_em)}${u.observacao?' · '+esc(u.observacao):''}</small></div>`).join(''):'<div class="v7-empty">Nenhuma dispensa utilizada.</div>'}</div></div>`:''}`;
 $('fdDetail').querySelector('[data-balance]')?.addEventListener('click',openBalance);
 $('fdDetail').querySelector('[data-vacation]')?.addEventListener('click',()=>openVacation());
 $('fdDetail').querySelector('[data-dispensa]')?.addEventListener('click',openDispensa);
 $('fdDetail').querySelectorAll('[data-edit-vac]').forEach(b=>b.onclick=()=>openVacation(vhist.find(v=>String(v.id)===String(b.dataset.editVac))));
}
function openBalance(){
 $('balanceUserId').value=selected.usuario_id||'';$('balanceExternalId').value=selected.pessoa_externa_id||'';
 $('balancePerson').value=personName(selected);$('balanceVacation').value=Number(selected.ferias_credito||0);$('balanceDispensa').value=Number(selected.dispensas_credito_manual||0);modal('balanceModal');
}
async function saveBalance(e){
 e.preventDefault();
 const r=await supabaseClient.rpc('v7_2_1_definir_creditos',{
  p_usuario_alvo_id:Number($('balanceUserId').value)||null,p_pessoa_externa_id:Number($('balanceExternalId').value)||null,
  p_ferias_credito:Number($('balanceVacation').value)||0,p_dispensas_credito_manual:Number($('balanceDispensa').value)||0,
  p_usuario_id:Number(user.id),p_perfil_id:pid()
 });
 if(r.error)return alert(r.error.message);modal('balanceModal',false);await load();
}
function openVacation(v=null){
 $('fdVacationId').value=v?.id||'';$('fdVacationUserId').value=selected.usuario_id||'';$('fdVacationExternalId').value=selected.pessoa_externa_id||'';
 $('fdVacationPerson').value=personName(selected);$('fdVacationStart').value=v?.data_inicio||iso(new Date());$('fdVacationEnd').value=v?.data_fim||$('fdVacationStart').value;$('fdVacationNote').value=v?.observacao||'';$('fdDeleteVacation').hidden=!v;modal('fdVacationModal');
}
async function saveVacation(e){
 e.preventDefault();
 const r=await supabaseClient.rpc('v7_2_1_salvar_ferias',{
  p_ferias_id:Number($('fdVacationId').value)||null,p_usuario_alvo_id:Number($('fdVacationUserId').value)||null,p_pessoa_externa_id:Number($('fdVacationExternalId').value)||null,
  p_data_inicio:$('fdVacationStart').value,p_data_fim:$('fdVacationEnd').value,p_observacao:$('fdVacationNote').value.trim()||null,
  p_usuario_id:Number(user.id),p_perfil_id:pid()
 });
 if(r.error)return alert(r.error.message);modal('fdVacationModal',false);await load();
}
async function deleteVacation(){
 const id=Number($('fdVacationId').value);if(!id||!confirm('Excluir este período de férias?'))return;
 const r=await supabaseClient.rpc('v7_2_1_excluir_ferias',{p_ferias_id:id,p_usuario_id:Number(user.id),p_perfil_id:pid()});
 if(r.error)return alert(r.error.message);modal('fdVacationModal',false);await load();
}
function addDate(value=''){
 const row=document.createElement('div');row.className='v721-date-row';row.innerHTML=`<input type="date" value="${esc(value)}" required><button type="button" class="v7-btn danger">×</button>`;
 row.querySelector('button').onclick=()=>{if($('dispensaDates').children.length>1)row.remove()};$('dispensaDates').appendChild(row);
}
function openDispensa(){
 $('dispensaUserId').value=selected.usuario_id;$('dispensaPerson').value=personName(selected);$('dispensaBalanceInfo').textContent=`Saldo disponível: ${fmt(selected.dispensas_disponiveis)} dispensa(s).`;
 $('dispensaDates').innerHTML='';addDate();$('dispensaNote').value='';modal('dispensaModal');
}
async function saveDispensa(e){
 e.preventDefault();const dates=[...$('dispensaDates').querySelectorAll('input[type="date"]')].map(x=>x.value).filter(Boolean);
 if(!dates.length)return alert('Informe pelo menos um dia.');
 const r=await supabaseClient.rpc('v7_2_1_usar_dispensa',{
  p_usuario_alvo_id:Number($('dispensaUserId').value),p_dias:[...new Set(dates)],p_observacao:$('dispensaNote').value.trim()||null,
  p_usuario_id:Number(user.id),p_perfil_id:pid()
 });
 if(r.error)return alert(r.error.message);modal('dispensaModal',false);await load();
}
function bind(){
 $('peopleSearch').oninput=renderAll;$('balanceForm').onsubmit=saveBalance;$('fdVacationForm').onsubmit=saveVacation;$('fdDeleteVacation').onclick=deleteVacation;$('dispensaForm').onsubmit=saveDispensa;$('addDispensaDate').onclick=()=>addDate();
 $('peopleList').onclick=e=>{const c=e.target.closest('[data-person]');if(c){selected=balances.find(x=>personKey(x)===c.dataset.person);renderAll();renderDetail()}};
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal(b.dataset.close,false));document.querySelectorAll('.v7-modal-bg').forEach(bg=>bg.onclick=e=>{if(e.target===bg)bg.classList.remove('open')});
}
function realtime(){
 try{supabaseClient.channel('v721-ferias-dispensas').on('postgres_changes',{event:'*',schema:'public',table:'pessoal_ferias'},()=>load()).on('postgres_changes',{event:'*',schema:'public',table:'pessoal_dispensa_usos'},()=>load()).on('postgres_changes',{event:'*',schema:'public',table:'pessoal_saldos'},()=>load()).subscribe()}catch(_){}
}
(async()=>{if(!await initUser())return;bind();await loadPeople();await load();realtime()})().catch(e=>{console.error(e);alert('Erro ao abrir Férias / Dispensas: '+e.message)});
})();