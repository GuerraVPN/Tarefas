(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const GROUPS={sargento:'Sargentos',motorista:'Motoristas',patrulheiro:'Patrulheiros',permanencia:'Permanência'};
const ORDER=['sargento','motorista','patrulheiro','permanencia'];
const WEEK=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];

let user=null,canManage=false,view=new Date(),users=new Map(),members=[],services=[],holidays=[],online=new Set();

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function br(v){return v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-'}
function name(id){const u=users.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id}`}
function range(){const y=view.getFullYear(),m=view.getMonth();return{ini:iso(new Date(y,m,1)),fim:iso(new Date(y,m+1,0)),dias:new Date(y,m+1,0).getDate()}}
function svc(uid,g,date){return services.find(x=>String(x.usuario_id)===String(uid)&&x.grupo===g&&x.data_servico===date)}
function hol(date){return holidays.find(x=>x.data===date)}
function dayClass(date){const d=new Date(date+'T12:00:00');return d.getDay()===0||d.getDay()===6||hol(date)?'weekend':'normal'}
function modal(id,on=true){$(id)?.classList.toggle('open',on)}

async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 user=base;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);if(p?.usuario)user=p.usuario}catch(_){}}
 const adminAtivo=norm(user?.secao)==='admin';
 const r=await supabaseClient.rpc('v7_pode_gerenciar_escala',{p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 canManage=adminAtivo||(!r.error&&r.data===true);
 $('manageMembers').hidden=!canManage;$('manageHolidays').hidden=!canManage;
 if(!canManage)$('scaleInfo').textContent+=' Seu perfil possui acesso somente para consulta.';
 return true;
}
async function loadUsers(){
 const r=await supabaseClient.from('usuarios').select('id,patente,nome_guerra,secao,posicao,ativo').order('nome_guerra');
 if(r.error)throw r.error;
 users=new Map((r.data||[]).filter(x=>x.ativo!==false).map(x=>[String(x.id),x]));
 $('memberUser').innerHTML='<option value="">Selecione...</option>'+[...users.values()].map(u=>`<option value="${u.id}">${esc(name(u.id))} — ${esc(u.secao||'-')} / ${esc(u.posicao||'-')}</option>`).join('');
}
async function loadPresence(){
 try{
  const since=new Date(Date.now()-120000).toISOString();
  const r=await supabaseClient.from('usuarios_presenca').select('usuario_id').gte('ultima_atividade',since);
  if(!r.error)online=new Set((r.data||[]).map(x=>String(x.usuario_id)));
 }catch(_){}
}
async function loadScale(){
 const rg=range();
 const [m,s,h]=await Promise.all([
  supabaseClient.from('escala_integrantes').select('*').eq('ativo',true).order('grupo').order('ordem').order('id'),
  supabaseClient.from('escala_servicos').select('*').gte('data_servico',rg.ini).lte('data_servico',rg.fim).order('data_servico').order('grupo').order('id'),
  supabaseClient.from('escala_feriados').select('*').gte('data',rg.ini).lte('data',rg.fim).order('data')
 ]);
 if(m.error)throw m.error;if(s.error)throw s.error;if(h.error)throw h.error;
 members=(m.data||[]).filter(x=>users.has(String(x.usuario_id)));services=s.data||[];holidays=h.data||[];
 render();renderMembers();renderHolidays();
}
function render(){
 const rg=range();
 $('monthLabel').textContent=view.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
 let html='';
 for(const g of ORDER){
  const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));
  html+=`<section class="v7-panel"><div class="v7-panel-head"><h3>${GROUPS[g]}</h3><span>${rows.length} militar(es)</span></div>`;
  if(!rows.length){html+=`<div class="v7-empty">Nenhum militar cadastrado em ${GROUPS[g]}.</div></section>`;continue}
  html+='<div class="v7-wrap"><table class="v7-table"><thead><tr><th>Militar</th>';
  for(let d=1;d<=rg.dias;d++){
   const date=iso(new Date(view.getFullYear(),view.getMonth(),d)),dt=new Date(date+'T12:00:00'),holiday=hol(date);
   html+=`<th class="v7-day ${dayClass(date)}" title="${esc(holiday?.nome||'')}"><small>${WEEK[dt.getDay()]}</small><b>${String(d).padStart(2,'0')}</b></th>`;
  }
  html+='</tr></thead><tbody>';
  for(const row of rows){
   html+=`<tr><td><div class="v7-user">${online.has(String(row.usuario_id))?'<i class="v7-online" title="Online"></i>':''}<span>${esc(name(row.usuario_id))}</span></div></td>`;
   for(let d=1;d<=rg.dias;d++){
    const date=iso(new Date(view.getFullYear(),view.getMonth(),d)),item=svc(row.usuario_id,g,date);
    const cls=['v7-day',dayClass(date),item?'service':'',canManage?'manage':''].filter(Boolean).join(' ');
    const title=item?`${name(row.usuario_id)} · ${br(date)} · ${GROUPS[g]}${item.observacao?' · '+item.observacao:''}`:(hol(date)?.nome||'');
    html+=`<td class="${cls}" data-user="${row.usuario_id}" data-group="${g}" data-date="${date}" title="${esc(title)}">${item?esc(item.marcacao||'SV'):'-'}</td>`;
   }
   html+='</tr>';
  }
  html+='</tbody></table></div></section>';
 }
 $('scaleBoard').innerHTML=html;
 if(canManage)$('scaleBoard').querySelectorAll('[data-user][data-date]').forEach(td=>td.onclick=()=>openService(td));
}
function openService(td){
 const uid=td.dataset.user,g=td.dataset.group,date=td.dataset.date,item=svc(uid,g,date);
 $('serviceUserId').value=uid;$('serviceGroup').value=g;$('serviceDate').value=date;
 $('serviceUser').value=name(uid);$('serviceDateLabel').value=br(date);$('serviceGroupLabel').value=GROUPS[g];
 $('serviceMark').value=item?.marcacao||'SV';$('serviceNote').value=item?.observacao||'';$('removeService').hidden=!item;
 modal('serviceModal');
}
async function saveService(e){
 e.preventDefault();
 const r=await supabaseClient.rpc('v7_definir_servico',{
  p_grupo:$('serviceGroup').value,p_usuario_alvo_id:Number($('serviceUserId').value),p_data_servico:$('serviceDate').value,
  p_marcacao:$('serviceMark').value.trim()||'SV',p_observacao:$('serviceNote').value.trim()||null,
  p_usuario_id:Number(user.id),p_perfil_id:profileId()
 });
 if(r.error)return alert(r.error.message);modal('serviceModal',false);await loadScale();
}
async function removeService(){
 if(!confirm('Remover este serviço da escala?'))return;
 const r=await supabaseClient.rpc('v7_remover_servico',{
  p_grupo:$('serviceGroup').value,p_usuario_alvo_id:Number($('serviceUserId').value),p_data_servico:$('serviceDate').value,
  p_usuario_id:Number(user.id),p_perfil_id:profileId()
 });
 if(r.error)return alert(r.error.message);modal('serviceModal',false);await loadScale();
}
function renderMembers(){
 const g=$('memberGroup').value||'sargento';
 const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100));
 $('membersList').innerHTML=rows.length?rows.map(x=>`<div class="v7-list-row"><div><b>${esc(name(x.usuario_id))}</b><div class="v7-mini">Ordem ${x.ordem||100}</div></div><button class="v7-btn danger" data-rm-member="${x.id}">Remover</button></div>`).join(''):'<div class="v7-empty">Nenhum militar nesta escala.</div>';
}
async function addMember(){
 const uid=Number($('memberUser').value);if(!uid)return alert('Selecione um militar.');
 const r=await supabaseClient.rpc('v7_adicionar_integrante',{p_grupo:$('memberGroup').value,p_usuario_alvo_id:uid,p_ordem:Number($('memberOrder').value)||100,p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 if(r.error)return alert(r.error.message);await loadScale();
}
async function removeMember(id){
 if(!confirm('Remover este militar da escala? Os serviços já lançados ficam preservados.'))return;
 const r=await supabaseClient.rpc('v7_remover_integrante',{p_integrante_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 if(r.error)return alert(r.error.message);await loadScale();
}
function renderHolidays(){
 $('holidaysList').innerHTML=holidays.length?holidays.map(h=>`<div class="v7-list-row"><div><b>${br(h.data)}</b><div class="v7-mini">${esc(h.nome)}</div></div><button class="v7-btn danger" data-rm-holiday="${h.id}">Remover</button></div>`).join(''):'<div class="v7-empty">Nenhum feriado cadastrado neste mês.</div>';
}
async function addHoliday(){
 const date=$('holidayDate').value,nome=$('holidayName').value.trim();if(!date||!nome)return alert('Informe data e descrição.');
 const r=await supabaseClient.rpc('v7_definir_feriado',{p_data:date,p_nome:nome,p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 if(r.error)return alert(r.error.message);$('holidayName').value='';await loadScale();
}
async function removeHoliday(id){
 const r=await supabaseClient.rpc('v7_remover_feriado',{p_feriado_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 if(r.error)return alert(r.error.message);await loadScale();
}
function month(delta){view=new Date(view.getFullYear(),view.getMonth()+delta,1);loadScale().catch(e=>alert(e.message))}
function bind(){
 $('prevMonth').onclick=()=>month(-1);$('nextMonth').onclick=()=>month(1);$('todayMonth').onclick=()=>{view=new Date();loadScale().catch(e=>alert(e.message))};
 $('manageMembers').onclick=()=>{renderMembers();modal('membersModal')};$('manageHolidays').onclick=()=>{renderHolidays();modal('holidayModal')};
 $('serviceForm').onsubmit=saveService;$('removeService').onclick=removeService;$('memberGroup').onchange=renderMembers;$('addMember').onclick=addMember;$('addHoliday').onclick=addHoliday;
 $('membersList').onclick=e=>{const b=e.target.closest('[data-rm-member]');if(b)removeMember(b.dataset.rmMember)};
 $('holidaysList').onclick=e=>{const b=e.target.closest('[data-rm-holiday]');if(b)removeHoliday(b.dataset.rmHoliday)};
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal(b.dataset.close,false));
 document.querySelectorAll('.v7-modal-bg').forEach(bg=>bg.onclick=e=>{if(e.target===bg)bg.classList.remove('open')});
}
function realtime(){
 try{
  supabaseClient.channel('v7-escalas')
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_integrantes'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_servicos'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_feriados'},()=>loadScale())
   .subscribe();
 }catch(_){}
}
(async()=>{
 if(!await initUser())return;bind();await Promise.all([loadUsers(),loadPresence()]);await loadScale();realtime();
})().catch(e=>{console.error(e);alert('Erro ao abrir a Escala de serviço: '+e.message)});
})();