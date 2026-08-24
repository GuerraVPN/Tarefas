(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const GROUPS={sargento:'Sargentos',motorista:'Motoristas',patrulheiro:'Patrulheiros',permanencia:'Permanência'};
const ORDER=['sargento','motorista','patrulheiro','permanencia'];
const WEEK=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];

let user=null,canManage=false,view=new Date(),users=new Map(),externals=new Map();
let members=[],services=[],holidays=[],online=new Set(),changes=[];

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function br(v){return v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-'}
function dt(v){return v?new Date(v).toLocaleString('pt-BR'):'-'}
function range(){const y=view.getFullYear(),m=view.getMonth();return{ini:iso(new Date(y,m,1)),fim:iso(new Date(y,m+1,0)),dias:new Date(y,m+1,0).getDate()}}
function hol(date){return holidays.find(x=>x.data===date)}
function dayClass(date){const d=new Date(date+'T12:00:00');return d.getDay()===0||d.getDay()===6||hol(date)?'weekend':'normal'}
function modal(id,on=true){$(id)?.classList.toggle('open',on)}
function actorName(id){const u=users.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`}
function extName(id){
 const p=externals.get(String(id));if(!p)return `Nome externo ${id}`;
 return [p.patente,p.nome].filter(Boolean).join(' ');
}
function personName(obj){
 return obj?.usuario_id?actorName(obj.usuario_id):extName(obj?.pessoa_externa_id);
}
function personKey(obj){
 return obj?.usuario_id?`u:${obj.usuario_id}`:`e:${obj?.pessoa_externa_id}`;
}
function serviceFor(row,g,date){
 return services.find(x=>x.grupo===g&&x.data_servico===date&&(
   row.usuario_id?String(x.usuario_id)===String(row.usuario_id):
   String(x.pessoa_externa_id)===String(row.pessoa_externa_id)
 ));
}
function changedBy(item){
 if(!item?.atualizado_por)return 'Sem alteração registrada.';
 return `Última alteração por ${actorName(item.atualizado_por)} em ${dt(item.atualizado_em)}.`;
}

async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 user=base;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);if(p?.usuario)user=p.usuario}catch(_){}}
 const r=await supabaseClient.rpc('v7_2_pode_gerenciar_pessoal',{p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 canManage=!r.error&&r.data===true;
 $('manageMembers').hidden=!canManage;$('manageHolidays').hidden=!canManage;
 if(!canManage)$('scaleInfo').textContent+=' Somente a 1ª Seção e Admin podem alterar a escala.';
 return true;
}
async function loadPeople(){
 const [u,e]=await Promise.all([
   supabaseClient.from('usuarios').select('id,patente,nome_guerra,secao,posicao,ativo').order('nome_guerra'),
   supabaseClient.from('pessoal_nomes_externos').select('id,nome,patente,ativo').eq('ativo',true).order('nome')
 ]);
 if(u.error)throw u.error;if(e.error)throw e.error;
 users=new Map((u.data||[]).filter(x=>x.ativo!==false).map(x=>[String(x.id),x]));
 externals=new Map((e.data||[]).map(x=>[String(x.id),x]));
 $('memberUser').innerHTML='<option value="">Selecione...</option>'+[...users.values()].map(x=>`<option value="${x.id}">${esc(actorName(x.id))} — ${esc(x.secao||'-')} / ${esc(x.posicao||'-')}</option>`).join('');
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
 const [m,s,h,c]=await Promise.all([
  supabaseClient.from('escala_integrantes').select('*').eq('ativo',true).order('grupo').order('ordem').order('id'),
  supabaseClient.from('escala_servicos').select('*').gte('data_servico',rg.ini).lte('data_servico',rg.fim).order('data_servico').order('grupo').order('id'),
  supabaseClient.from('escala_feriados').select('*').gte('data',rg.ini).lte('data',rg.fim).order('data'),
  supabaseClient.from('escala_alteracoes').select('*').eq('modulo','servico').order('criado_em',{ascending:false}).limit(30)
 ]);
 if(m.error)throw m.error;if(s.error)throw s.error;if(h.error)throw h.error;if(c.error)throw c.error;
 members=(m.data||[]).filter(x=>(x.usuario_id&&users.has(String(x.usuario_id)))||(x.pessoa_externa_id&&externals.has(String(x.pessoa_externa_id))));
 services=s.data||[];holidays=h.data||[];changes=c.data||[];
 render();renderMembers();renderHolidays();renderChanges();renderSummary();
}
function renderSummary(){
 const uniqueMembers=new Set(members.map(personKey));
 const uniqueOnService=new Set(services.map(personKey));
 $('sumScalePeople').textContent=uniqueMembers.size;
 $('sumServices').textContent=services.length;
 $('sumPeopleOnService').textContent=uniqueOnService.size;
 const folgas=services.reduce((n,x)=>n+Number(x.folgas_geradas||0),0);
 $('sumFolgas').textContent=Number.isInteger(folgas)?folgas:folgas.toFixed(1).replace('.',',');
}
function render(){
 const rg=range();
 $('monthLabel').textContent=view.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
 let html='';
 for(const g of ORDER){
  const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));
  html+=`<section class="v7-panel"><div class="v7-panel-head"><h3>${GROUPS[g]}</h3><span>${rows.length} pessoa(s)</span></div>`;
  if(!rows.length){html+=`<div class="v7-empty">Nenhuma pessoa cadastrada em ${GROUPS[g]}.</div></section>`;continue}
  html+='<div class="v7-wrap"><table class="v7-table"><thead><tr><th>Militar / Nome</th>';
  for(let d=1;d<=rg.dias;d++){
   const date=iso(new Date(view.getFullYear(),view.getMonth(),d)),day=new Date(date+'T12:00:00'),holiday=hol(date);
   html+=`<th class="v7-day ${dayClass(date)}" title="${esc(holiday?.nome||'')}"><small>${WEEK[day.getDay()]}</small><b>${String(d).padStart(2,'0')}</b></th>`;
  }
  html+='</tr></thead><tbody>';
  for(const row of rows){
   const isExt=!!row.pessoa_externa_id;
   html+=`<tr><td><div class="v7-user">${row.usuario_id&&online.has(String(row.usuario_id))?'<i class="v7-online" title="Online"></i>':''}<span>${esc(personName(row))}${isExt?'<span class="v72-external-tag">SEM CONTA</span>':''}</span></div></td>`;
   for(let d=1;d<=rg.dias;d++){
    const date=iso(new Date(view.getFullYear(),view.getMonth(),d)),item=serviceFor(row,g,date);
    const cls=['v7-day',dayClass(date),item?'service':'',canManage?'manage':''].filter(Boolean).join(' ');
    const title=item?`${personName(row)} · ${br(date)} · ${GROUPS[g]} · ${Number(item.folgas_geradas||0)} folga(s)${item.observacao?' · '+item.observacao:''}`:(hol(date)?.nome||'');
    html+=`<td class="${cls}" data-user="${row.usuario_id||''}" data-external="${row.pessoa_externa_id||''}" data-group="${g}" data-date="${date}" title="${esc(title)}">${item?esc(item.marcacao||'SV'):'-'}</td>`;
   }
   html+='</tr>';
  }
  html+='</tbody></table></div></section>';
 }
 $('scaleBoard').innerHTML=html;
 if(canManage)$('scaleBoard').querySelectorAll('[data-date]').forEach(td=>td.onclick=()=>openService(td));
}
function openService(td){
 const uid=td.dataset.user||null,eid=td.dataset.external||null,g=td.dataset.group,date=td.dataset.date;
 const row={usuario_id:uid||null,pessoa_externa_id:eid||null};
 const item=serviceFor(row,g,date);
 $('serviceUserId').value=uid||'';$('serviceExternalId').value=eid||'';
 $('serviceGroup').value=g;$('serviceDate').value=date;
 $('serviceUser').value=personName(row);$('serviceDateLabel').value=br(date);$('serviceGroupLabel').value=GROUPS[g];
 $('serviceMark').value=item?.marcacao||'SV';$('serviceFolgas').value=Number(item?.folgas_geradas||0);
 $('serviceNote').value=item?.observacao||'';$('serviceChangedBy').textContent=changedBy(item);
 $('removeService').hidden=!item;modal('serviceModal');
}
async function saveService(e){
 e.preventDefault();
 const uid=Number($('serviceUserId').value)||null,eid=Number($('serviceExternalId').value)||null;
 const r=await supabaseClient.rpc('v7_2_definir_servico',{
  p_grupo:$('serviceGroup').value,p_usuario_alvo_id:uid,p_pessoa_externa_id:eid,p_data_servico:$('serviceDate').value,
  p_marcacao:$('serviceMark').value.trim()||'SV',p_folgas_geradas:Number($('serviceFolgas').value)||0,
  p_observacao:$('serviceNote').value.trim()||null,p_usuario_id:Number(user.id),p_perfil_id:profileId()
 });
 if(r.error)return alert(r.error.message);modal('serviceModal',false);await Promise.all([loadPeople(),loadScale()]);
}
async function removeService(){
 if(!confirm('Remover este serviço da escala?'))return;
 const r=await supabaseClient.rpc('v7_2_remover_servico',{
  p_grupo:$('serviceGroup').value,p_usuario_alvo_id:Number($('serviceUserId').value)||null,
  p_pessoa_externa_id:Number($('serviceExternalId').value)||null,p_data_servico:$('serviceDate').value,
  p_usuario_id:Number(user.id),p_perfil_id:profileId()
 });
 if(r.error)return alert(r.error.message);modal('serviceModal',false);await loadScale();
}
function toggleMemberMode(){
 const ext=$('memberMode').value==='externo';
 $('memberSystemField').hidden=ext;$('memberExternalNameField').hidden=!ext;$('memberExternalRankField').hidden=!ext;
}
function renderMembers(){
 const g=$('memberGroup').value||'sargento';
 const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100));
 $('membersList').innerHTML=rows.length?rows.map(x=>`<div class="v7-list-row"><div><b>${esc(personName(x))}${x.pessoa_externa_id?'<span class="v72-external-tag">SEM CONTA</span>':''}</b><div class="v7-mini">Ordem ${x.ordem||100}</div></div><button class="v7-btn danger" data-rm-member="${x.id}">Remover</button></div>`).join(''):'<div class="v7-empty">Nenhuma pessoa nesta escala.</div>';
}
async function addMember(){
 const g=$('memberGroup').value,ordem=Number($('memberOrder').value)||100,mode=$('memberMode').value;
 let r;
 if(mode==='externo'){
   const nome=$('memberExternalName').value.trim();if(!nome)return alert('Informe o nome.');
   r=await supabaseClient.rpc('v7_2_adicionar_integrante_externo',{
     p_grupo:g,p_nome:nome,p_patente:$('memberExternalRank').value.trim()||null,p_ordem:ordem,
     p_usuario_id:Number(user.id),p_perfil_id:profileId()
   });
 }else{
   const uid=Number($('memberUser').value);if(!uid)return alert('Selecione um usuário.');
   r=await supabaseClient.rpc('v7_2_adicionar_integrante',{
     p_grupo:g,p_usuario_alvo_id:uid,p_pessoa_externa_id:null,p_ordem:ordem,
     p_usuario_id:Number(user.id),p_perfil_id:profileId()
   });
 }
 if(r.error)return alert(r.error.message);
 $('memberExternalName').value='';$('memberExternalRank').value='';
 await Promise.all([loadPeople(),loadScale()]);
}
async function removeMember(id){
 if(!confirm('Remover esta pessoa da escala? Serviços já registrados permanecem no histórico.'))return;
 const r=await supabaseClient.rpc('v7_2_remover_integrante',{p_integrante_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:profileId()});
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
function renderChanges(){
 $('changesCount').textContent=`${changes.length} registro(s)`;
 $('serviceChanges').innerHTML=changes.length?changes.map(x=>`<div class="v72-change-row"><div><b>${esc(x.acao||'Alteração')}</b><small>${esc(x.detalhes||'')}</small></div><div style="text-align:right"><b>${esc(actorName(x.usuario_id))}</b><small>${dt(x.criado_em)}</small></div></div>`).join(''):'<div class="v7-empty">Nenhuma alteração registrada.</div>';
}
function month(delta){view=new Date(view.getFullYear(),view.getMonth()+delta,1);loadScale().catch(e=>alert(e.message))}
function bind(){
 $('prevMonth').onclick=()=>month(-1);$('nextMonth').onclick=()=>month(1);$('todayMonth').onclick=()=>{view=new Date();loadScale().catch(e=>alert(e.message))};
 $('manageMembers').onclick=()=>{renderMembers();modal('membersModal')};$('manageHolidays').onclick=()=>{renderHolidays();modal('holidayModal')};
 $('serviceForm').onsubmit=saveService;$('removeService').onclick=removeService;
 $('memberGroup').onchange=renderMembers;$('memberMode').onchange=toggleMemberMode;$('addMember').onclick=addMember;$('addHoliday').onclick=addHoliday;
 $('membersList').onclick=e=>{const b=e.target.closest('[data-rm-member]');if(b)removeMember(b.dataset.rmMember)};
 $('holidaysList').onclick=e=>{const b=e.target.closest('[data-rm-holiday]');if(b)removeHoliday(b.dataset.rmHoliday)};
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal(b.dataset.close,false));
 document.querySelectorAll('.v7-modal-bg').forEach(bg=>bg.onclick=e=>{if(e.target===bg)bg.classList.remove('open')});
 toggleMemberMode();
}
function realtime(){
 try{
  supabaseClient.channel('v72-escalas')
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_integrantes'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_servicos'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_feriados'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_alteracoes'},()=>loadScale())
   .subscribe();
 }catch(_){}
}
(async()=>{
 if(!await initUser())return;bind();await Promise.all([loadPeople(),loadPresence()]);await loadScale();realtime();
})().catch(e=>{console.error(e);alert('Erro ao abrir a Escala de serviço: '+e.message)});
})();