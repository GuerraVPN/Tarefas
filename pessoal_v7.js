(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const GROUPS={sargento:'Sargentos',motorista:'Motoristas',patrulheiro:'Patrulheiros',permanencia:'Permanência'};
const ORDER=['sargento','motorista','patrulheiro','permanencia'];
const WEEK=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];

let user=null,canManage=false,view=new Date(),users=new Map(),externals=new Map();
let members=[],services=[],rotationServices=[],holidays=[],online=new Set(),changes=[],vacations=[],balances=[];
let projections=new Map(),dutyDates=new Map(),nextDuty=new Map();

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDate(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)}
function addDays(s,n){const d=parseDate(s);d.setDate(d.getDate()+n);return iso(d)}
function diffDays(a,b){return Math.round((parseDate(b)-parseDate(a))/86400000)}
function br(v){return v?parseDate(v).toLocaleDateString('pt-BR'):'-'}
function dt(v){return v?new Date(v).toLocaleString('pt-BR'):'-'}
function range(){
 const y=view.getFullYear(),m=view.getMonth(),ini=iso(new Date(y,m,1)),fim=iso(new Date(y,m+1,0));
 return{ini,fim,dias:new Date(y,m+1,0).getDate(),extIni:addDays(ini,-90),extFim:addDays(fim,90)}
}
function hol(date){return holidays.find(x=>x.data===date)}
function dayClass(date){const d=parseDate(date);return d.getDay()===0||d.getDay()===6||hol(date)?'weekend':'normal'}
function modal(id,on=true){$(id)?.classList.toggle('open',on)}
function actorName(id){const u=users.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`}
function extName(id){const p=externals.get(String(id));return p?[p.patente,p.nome].filter(Boolean).join(' '):`Nome externo ${id}`}
function personName(obj){return obj?.usuario_id?actorName(obj.usuario_id):extName(obj?.pessoa_externa_id)}
function personKey(obj){return obj?.usuario_id?`u:${obj.usuario_id}`:`e:${obj?.pessoa_externa_id}`}
function rowByKey(key,g=null){return members.find(x=>personKey(x)===key&&(!g||x.grupo===g))}
function samePerson(a,b){return personKey(a)===personKey(b)}
function currentActual(row,g,date){return services.find(x=>x.grupo===g&&x.data_servico===date&&samePerson(x,row))}
function rotationActuals(g,date){return rotationServices.filter(x=>x.grupo===g&&x.data_servico===date)}
function vacationFor(row,date){
 return vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_inicio<=date&&v.data_fim>=date);
}
function adaptationFor(row,date){
 return vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&addDays(v.data_fim,1)===date);
}
function balanceFor(row){
 return balances.find(b=>(row.usuario_id&&String(b.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(b.pessoa_externa_id)===String(row.pessoa_externa_id)));
}
function changedBy(item){
 if(!item?.atualizado_por)return 'Sem alteração registrada.';
 return `Última alteração por ${actorName(item.atualizado_por)} em ${dt(item.atualizado_em)}.`;
}
function moveToBack(queue,key){const i=queue.indexOf(key);if(i>=0){queue.splice(i,1);queue.push(key)}}
function eligible(row,date){return !vacationFor(row,date)&&!adaptationFor(row,date)}
function todayIso(){return iso(new Date())}

async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 user=base;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);if(p?.usuario)user=p.usuario}catch(_){}}
 const r=await supabaseClient.rpc('v7_2_pode_gerenciar_pessoal',{p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 canManage=!r.error&&r.data===true;
 $('manageMembers').hidden=!canManage;$('manageHolidays').hidden=!canManage;
 if(!canManage)$('scaleInfo').insertAdjacentHTML('beforeend',' Seu perfil possui acesso somente para consulta.');
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
async function loadBalances(){
 try{
  const r=await supabaseClient.rpc('v7_2_1_listar_saldos',{p_usuario_id:Number(user.id),p_perfil_id:profileId()});
  if(!r.error)balances=r.data||[];
 }catch(_){balances=[]}
}
async function loadScale(){
 const rg=range();
 const [m,s,sx,h,c,v]=await Promise.all([
  supabaseClient.from('escala_integrantes').select('*').eq('ativo',true).order('grupo').order('ordem').order('id'),
  supabaseClient.from('escala_servicos').select('*').gte('data_servico',rg.ini).lte('data_servico',rg.fim).order('data_servico').order('grupo').order('id'),
  supabaseClient.from('escala_servicos').select('*').gte('data_servico',rg.extIni).lte('data_servico',rg.extFim).order('data_servico').order('grupo').order('id'),
  supabaseClient.from('escala_feriados').select('*').gte('data',rg.ini).lte('data',rg.fim).order('data'),
  supabaseClient.from('escala_alteracoes').select('*').eq('modulo','servico').order('criado_em',{ascending:false}).limit(30),
  supabaseClient.from('pessoal_ferias').select('*').lte('data_inicio',rg.extFim).gte('data_fim',rg.extIni).order('data_inicio')
 ]);
 if(m.error)throw m.error;if(s.error)throw s.error;if(sx.error)throw sx.error;if(h.error)throw h.error;if(c.error)throw c.error;if(v.error)throw v.error;
 members=(m.data||[]).filter(x=>(x.usuario_id&&users.has(String(x.usuario_id)))||(x.pessoa_externa_id&&externals.has(String(x.pessoa_externa_id))));
 services=s.data||[];rotationServices=sx.data||[];holidays=h.data||[];changes=c.data||[];vacations=v.data||[];
 buildAllProjections();render();renderMembers();renderHolidays();renderChanges();renderSummary();
}
function buildAllProjections(){projections=new Map();dutyDates=new Map();nextDuty=new Map();for(const g of ORDER)buildProjection(g)}
function buildProjection(g){
 const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));
 if(!rows.length)return;
 const keys=rows.map(personKey),queue=[...keys],rg=range(),today=todayIso();
 const confirmed=rotationServices.filter(x=>x.grupo===g&&keys.includes(personKey(x))).sort((a,b)=>a.data_servico.localeCompare(b.data_servico)||Number(a.id)-Number(b.id));
 if(!confirmed.length)return;
 const anchorLimit=rg.fim<today?rg.fim:today;
 let anchor=[...confirmed].reverse().find(x=>x.data_servico<=anchorLimit);
 if(!anchor)anchor=confirmed[0];
 moveToBack(queue,personKey(anchor));
 const localDuty=new Map();
 function addDuty(key,date,type,item=null){
   if(!localDuty.has(key))localDuty.set(key,[]);
   localDuty.get(key).push({date,type,item});
   const k=g+'|'+date;if(!projections.has(k))projections.set(k,[]);
   projections.get(k).push({key,type,item});
 }
 addDuty(personKey(anchor),anchor.data_servico,'actual',anchor);
 let date=addDays(anchor.data_servico,1);
 while(date<=rg.extFim){
   const actuals=rotationActuals(g,date).filter(x=>keys.includes(personKey(x)));
   if(actuals.length){
     actuals.forEach(a=>{const key=personKey(a);addDuty(key,date,'actual',a);moveToBack(queue,key)});
   }else{
     let selectedIndex=-1;
     for(let i=0;i<queue.length;i++){const row=rowByKey(queue[i],g);if(row&&eligible(row,date)){selectedIndex=i;break}}
     if(selectedIndex>=0){
       const key=queue[selectedIndex],row=rowByKey(key,g);
       addDuty(key,date,'predicted',{grupo:g,data_servico:date,usuario_id:row.usuario_id||null,pessoa_externa_id:row.pessoa_externa_id||null});
       queue.splice(selectedIndex,1);queue.push(key);
     }
   }
   date=addDays(date,1);
 }
 for(const [key,list] of localDuty){
   list.sort((a,b)=>a.date.localeCompare(b.date));dutyDates.set(g+'|'+key,list);
   const next=list.find(x=>x.date>=today);if(next)nextDuty.set(g+'|'+key,next);
 }
}
function dutyAt(row,g,date){const list=projections.get(g+'|'+date)||[];return list.find(x=>x.key===personKey(row))}
function folgaNumber(row,g,date){
 const list=dutyDates.get(g+'|'+personKey(row))||[];let prev=null,next=null;
 for(const d of list){if(d.date<date)prev=d;if(d.date>date){next=d;break}}
 if(!prev||!next)return null;return diffDays(prev.date,date);
}
function nextMeta(row,g){
 const vac=vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_fim>=todayIso());
 if(vac&&vac.data_inicio<=todayIso()&&vac.data_fim>=todayIso())return `<span class="v721-person-meta vac">Férias até ${br(vac.data_fim)} · ADP ${br(addDays(vac.data_fim,1))}</span>`;
 const n=nextDuty.get(g+'|'+personKey(row));
 return n?`<span class="v721-person-meta next">Próx. ${n.type==='predicted'?'previsto':'confirmado'}: ${br(n.date)}</span>`:'<span class="v721-person-meta">Sem projeção — confirme um serviço</span>';
}
function renderSummary(){
 const uniqueMembers=new Set(members.map(personKey)),uniqueOnService=new Set(services.map(personKey));
 $('sumScalePeople').textContent=uniqueMembers.size;$('sumServices').textContent=services.length;$('sumPeopleOnService').textContent=uniqueOnService.size;
 let total=0,now=todayIso();
 for(const g of ORDER)for(const row of members.filter(x=>x.grupo===g)){
   const list=dutyDates.get(g+'|'+personKey(row))||[],prev=[...list].reverse().find(x=>x.date<=now),next=list.find(x=>x.date>now);
   if(prev&&next)total+=Math.max(0,diffDays(prev.date,next.date)-1);
 }
 $('sumFolgas').textContent=total;
}
function render(){
 const rg=range();$('monthLabel').textContent=view.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
 let html='';
 for(const g of ORDER){
  const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));
  html+=`<section class="v7-panel"><div class="v7-panel-head"><h3>${GROUPS[g]}</h3><span>${rows.length} pessoa(s)</span></div>`;
  if(!rows.length){html+=`<div class="v7-empty">Nenhuma pessoa cadastrada em ${GROUPS[g]}.</div></section>`;continue}
  html+='<div class="v7-wrap"><table class="v7-table"><thead><tr><th>Militar / Nome</th>';
  for(let d=1;d<=rg.dias;d++){
   const date=iso(new Date(view.getFullYear(),view.getMonth(),d)),day=parseDate(date),holiday=hol(date);
   html+=`<th class="v7-day ${dayClass(date)}" title="${esc(holiday?.nome||'')}"><small>${WEEK[day.getDay()]}</small><b>${String(d).padStart(2,'0')}</b></th>`;
  }
  html+='</tr></thead><tbody>';
  for(const row of rows){
   html+=`<tr><td><div class="v7-user">${row.usuario_id&&online.has(String(row.usuario_id))?'<i class="v7-online" title="Online"></i>':''}<span>${esc(personName(row))}${row.pessoa_externa_id?'<span class="v72-external-tag">SEM CONTA</span>':''}${nextMeta(row,g)}</span></div></td>`;
   for(let d=1;d<=rg.dias;d++){
    const date=iso(new Date(view.getFullYear(),view.getMonth(),d)),actual=currentActual(row,g,date),vac=vacationFor(row,date),adapt=adaptationFor(row,date),duty=dutyAt(row,g,date);
    let cls=['v7-day',dayClass(date),canManage?'manage':''],text='-',title=hol(date)?.nome||'';
    if(actual){cls.push('service');text=esc(actual.marcacao||'SV');title=`Serviço confirmado · ${personName(row)} · ${br(date)}`}
    else if(vac){cls.push('vacation');text='FÉR';title=`Férias · ${br(vac.data_inicio)} a ${br(vac.data_fim)}`}
    else if(adapt){cls.push('adaptation');text='ADP';title=`Dia de adaptação · serviço permitido a partir de ${br(addDays(date,1))}`}
    else if(duty?.type==='predicted'){cls.push('predicted');text='SV';title=`Próximo serviço previsto automaticamente · ${personName(row)} · ${br(date)}`}
    else{const f=folgaNumber(row,g,date);if(f!==null&&f>0){cls.push('folga-count');text=String(f);title=`${f}º dia de folga desde o último serviço`}}
    html+=`<td class="${cls.filter(Boolean).join(' ')}" data-user="${row.usuario_id||''}" data-external="${row.pessoa_externa_id||''}" data-group="${g}" data-date="${date}" title="${esc(title)}">${text}</td>`;
   }
   html+='</tr>';
  }
  html+='</tbody></table></div></section>';
 }
 $('scaleBoard').innerHTML=html;
 if(canManage)$('scaleBoard').querySelectorAll('[data-date]').forEach(td=>td.onclick=()=>openCell(td));
}
function rowFromCell(td){return{usuario_id:Number(td.dataset.user)||null,pessoa_externa_id:Number(td.dataset.external)||null,grupo:td.dataset.group}}
function openCell(td){
 const row=rowFromCell(td),date=td.dataset.date,vac=vacationFor(row,date),adp=adaptationFor(row,date);
 if(vac)return openVacation(row,vac);
 if(adp){alert('Este é o dia de adaptação após as férias. O militar só pode entrar de serviço a partir de '+br(addDays(date,1))+'.');return}
 openService(td);
}
function openService(td){
 const row=rowFromCell(td),date=td.dataset.date,g=td.dataset.group,item=currentActual(row,g,date);
 $('serviceUserId').value=row.usuario_id||'';$('serviceExternalId').value=row.pessoa_externa_id||'';$('serviceGroup').value=g;$('serviceDate').value=date;
 $('serviceUser').value=personName(row);$('serviceDateLabel').value=br(date);$('serviceGroupLabel').value=GROUPS[g];$('serviceMark').value=item?.marcacao||'SV';
 $('serviceNote').value=item?.observacao||'';$('serviceChangedBy').textContent=changedBy(item);$('removeService').hidden=!item;$('swapService').hidden=!item;modal('serviceModal');
}
async function saveService(e){
 e.preventDefault();
 const r=await supabaseClient.rpc('v7_2_1_definir_servico',{
  p_grupo:$('serviceGroup').value,p_usuario_alvo_id:Number($('serviceUserId').value)||null,p_pessoa_externa_id:Number($('serviceExternalId').value)||null,
  p_data_servico:$('serviceDate').value,p_marcacao:$('serviceMark').value.trim()||'SV',p_observacao:$('serviceNote').value.trim()||null,
  p_usuario_id:Number(user.id),p_perfil_id:profileId()
 });
 if(r.error)return alert(r.error.message);modal('serviceModal',false);await loadScale();
}
async function removeService(){
 if(!confirm('Tirar este serviço confirmado? A projeção será recalculada.'))return;
 const r=await supabaseClient.rpc('v7_2_1_remover_servico',{
  p_grupo:$('serviceGroup').value,p_usuario_alvo_id:Number($('serviceUserId').value)||null,p_pessoa_externa_id:Number($('serviceExternalId').value)||null,
  p_data_servico:$('serviceDate').value,p_usuario_id:Number(user.id),p_perfil_id:profileId()
 });
 if(r.error)return alert(r.error.message);modal('serviceModal',false);await loadScale();
}
function servicePerson(){return{usuario_id:Number($('serviceUserId').value)||null,pessoa_externa_id:Number($('serviceExternalId').value)||null}}
function openSwap(){
 const src=servicePerson(),g=$('serviceGroup').value,date=$('serviceDate').value;
 const rows=members.filter(x=>x.grupo===g&&personKey(x)!==personKey(src));
 $('swapSourceUserId').value=src.usuario_id||'';$('swapSourceExternalId').value=src.pessoa_externa_id||'';$('swapGroup').value=g;$('swapDate').value=date;
 $('swapSource').value=personName(src);$('swapDateLabel').value=br(date);$('swapGroupLabel').value=GROUPS[g];$('swapNote').value='';
 $('swapTarget').innerHTML='<option value="">Selecione...</option>'+rows.map(r=>{const blocked=vacationFor(r,date)||adaptationFor(r,date);return `<option value="${personKey(r)}" ${blocked?'disabled':''}>${esc(personName(r))}${vacationFor(r,date)?' — FÉRIAS':adaptationFor(r,date)?' — ADAPTAÇÃO':''}</option>`}).join('');
 modal('serviceModal',false);modal('swapModal');
}
async function saveSwap(e){
 e.preventDefault();const value=$('swapTarget').value;if(!value)return;
 const [kind,id]=value.split(':');
 const r=await supabaseClient.rpc('v7_2_1_trocar_servico',{
  p_grupo:$('swapGroup').value,p_data_servico:$('swapDate').value,
  p_origem_usuario_id:Number($('swapSourceUserId').value)||null,p_origem_pessoa_externa_id:Number($('swapSourceExternalId').value)||null,
  p_destino_usuario_id:kind==='u'?Number(id):null,p_destino_pessoa_externa_id:kind==='e'?Number(id):null,
  p_observacao:$('swapNote').value.trim()||null,p_usuario_id:Number(user.id),p_perfil_id:profileId()
 });
 if(r.error)return alert(r.error.message);modal('swapModal',false);await loadScale();
}
function openVacation(row,vac=null){
 $('vacationId').value=vac?.id||'';$('vacationUserId').value=row.usuario_id||'';$('vacationExternalId').value=row.pessoa_externa_id||'';
 $('vacationPerson').value=personName(row);$('vacationStart').value=vac?.data_inicio||$('serviceDate').value||todayIso();$('vacationEnd').value=vac?.data_fim||$('vacationStart').value;
 $('vacationNote').value=vac?.observacao||'';$('removeVacation').hidden=!vac;const b=balanceFor(row);
 $('vacationBalanceInfo').textContent=b?`Férias: ${b.ferias_disponiveis} dia(s) disponíveis de ${b.ferias_credito} creditados.`:'Saldo de férias ainda não configurado em Férias / Dispensas.';
 modal('serviceModal',false);modal('vacationModal');
}
async function saveVacation(e){
 e.preventDefault();
 const r=await supabaseClient.rpc('v7_2_1_salvar_ferias',{
  p_ferias_id:Number($('vacationId').value)||null,p_usuario_alvo_id:Number($('vacationUserId').value)||null,p_pessoa_externa_id:Number($('vacationExternalId').value)||null,
  p_data_inicio:$('vacationStart').value,p_data_fim:$('vacationEnd').value,p_observacao:$('vacationNote').value.trim()||null,
  p_usuario_id:Number(user.id),p_perfil_id:profileId()
 });
 if(r.error)return alert(r.error.message);modal('vacationModal',false);await Promise.all([loadBalances(),loadScale()]);
}
async function removeVacation(){
 if(!confirm('Excluir este período de férias?'))return;const id=Number($('vacationId').value);if(!id)return;
 const r=await supabaseClient.rpc('v7_2_1_excluir_ferias',{p_ferias_id:id,p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 if(r.error)return alert(r.error.message);modal('vacationModal',false);await Promise.all([loadBalances(),loadScale()]);
}
function toggleMemberMode(){const ext=$('memberMode').value==='externo';$('memberSystemField').hidden=ext;$('memberExternalNameField').hidden=!ext;$('memberExternalRankField').hidden=!ext}
function renderMembers(){
 const g=$('memberGroup').value||'sargento',rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100));
 $('membersList').innerHTML=rows.length?rows.map(x=>`<div class="v7-list-row"><div><b>${esc(personName(x))}${x.pessoa_externa_id?'<span class="v72-external-tag">SEM CONTA</span>':''}</b><div class="v7-mini">Ordem ${x.ordem||100}</div></div><button class="v7-btn danger" data-rm-member="${x.id}">Remover</button></div>`).join(''):'<div class="v7-empty">Nenhuma pessoa nesta escala.</div>';
}
async function addMember(){
 const g=$('memberGroup').value,ordem=Number($('memberOrder').value)||100,mode=$('memberMode').value;let r;
 if(mode==='externo'){const nome=$('memberExternalName').value.trim();if(!nome)return alert('Informe o nome.');r=await supabaseClient.rpc('v7_2_adicionar_integrante_externo',{p_grupo:g,p_nome:nome,p_patente:$('memberExternalRank').value.trim()||null,p_ordem:ordem,p_usuario_id:Number(user.id),p_perfil_id:profileId()})}
 else{const uid=Number($('memberUser').value);if(!uid)return alert('Selecione um usuário.');r=await supabaseClient.rpc('v7_2_adicionar_integrante',{p_grupo:g,p_usuario_alvo_id:uid,p_pessoa_externa_id:null,p_ordem:ordem,p_usuario_id:Number(user.id),p_perfil_id:profileId()})}
 if(r.error)return alert(r.error.message);$('memberExternalName').value='';$('memberExternalRank').value='';await Promise.all([loadPeople(),loadBalances(),loadScale()]);
}
async function removeMember(id){
 if(!confirm('Remover esta pessoa da escala? Serviços confirmados permanecem no histórico.'))return;
 const r=await supabaseClient.rpc('v7_2_remover_integrante',{p_integrante_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 if(r.error)return alert(r.error.message);await loadScale();
}
function renderHolidays(){$('holidaysList').innerHTML=holidays.length?holidays.map(h=>`<div class="v7-list-row"><div><b>${br(h.data)}</b><div class="v7-mini">${esc(h.nome)}</div></div><button class="v7-btn danger" data-rm-holiday="${h.id}">Remover</button></div>`).join(''):'<div class="v7-empty">Nenhum feriado cadastrado neste mês.</div>'}
async function addHoliday(){const date=$('holidayDate').value,nome=$('holidayName').value.trim();if(!date||!nome)return alert('Informe data e descrição.');const r=await supabaseClient.rpc('v7_definir_feriado',{p_data:date,p_nome:nome,p_usuario_id:Number(user.id),p_perfil_id:profileId()});if(r.error)return alert(r.error.message);$('holidayName').value='';await loadScale()}
async function removeHoliday(id){const r=await supabaseClient.rpc('v7_remover_feriado',{p_feriado_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:profileId()});if(r.error)return alert(r.error.message);await loadScale()}
function renderChanges(){$('changesCount').textContent=`${changes.length} registro(s)`;$('serviceChanges').innerHTML=changes.length?changes.map(x=>`<div class="v72-change-row"><div><b>${esc(x.acao||'Alteração')}</b><small>${esc(x.detalhes||'')}</small></div><div style="text-align:right"><b>${esc(actorName(x.usuario_id))}</b><small>${dt(x.criado_em)}</small></div></div>`).join(''):'<div class="v7-empty">Nenhuma alteração registrada.</div>'}
function month(delta){view=new Date(view.getFullYear(),view.getMonth()+delta,1);loadScale().catch(e=>alert(e.message))}
function bind(){
 $('prevMonth').onclick=()=>month(-1);$('nextMonth').onclick=()=>month(1);$('todayMonth').onclick=()=>{view=new Date();loadScale().catch(e=>alert(e.message))};
 $('manageMembers').onclick=()=>{renderMembers();modal('membersModal')};$('manageHolidays').onclick=()=>{renderHolidays();modal('holidayModal')};
 $('serviceForm').onsubmit=saveService;$('removeService').onclick=removeService;$('swapService').onclick=openSwap;$('markVacation').onclick=()=>openVacation(servicePerson());
 $('swapForm').onsubmit=saveSwap;$('vacationForm').onsubmit=saveVacation;$('removeVacation').onclick=removeVacation;
 $('memberGroup').onchange=renderMembers;$('memberMode').onchange=toggleMemberMode;$('addMember').onclick=addMember;$('addHoliday').onclick=addHoliday;
 $('membersList').onclick=e=>{const b=e.target.closest('[data-rm-member]');if(b)removeMember(b.dataset.rmMember)};
 $('holidaysList').onclick=e=>{const b=e.target.closest('[data-rm-holiday]');if(b)removeHoliday(b.dataset.rmHoliday)};
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal(b.dataset.close,false));
 document.querySelectorAll('.v7-modal-bg').forEach(bg=>bg.onclick=e=>{if(e.target===bg)bg.classList.remove('open')});toggleMemberMode();
}
function realtime(){
 try{
  supabaseClient.channel('v721-escalas')
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_integrantes'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_servicos'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_feriados'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'pessoal_ferias'},async()=>{await loadBalances();await loadScale()})
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_alteracoes'},()=>loadScale()).subscribe();
 }catch(_){}
}
(async()=>{if(!await initUser())return;bind();await Promise.all([loadPeople(),loadPresence(),loadBalances()]);await loadScale();realtime()})().catch(e=>{console.error(e);alert('Erro ao abrir a Escala de serviço: '+e.message)});
})();