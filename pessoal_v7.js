(function(){
'use strict';
const ESCALA_UI_VERSION='7.4.6';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const GROUPS={sargento:'Sargentos',motorista:'Motoristas',patrulheiro:'Patrulheiros',permanencia:'Permanência',canil:'Permanência/Canil'};
const ORDER=['sargento','motorista','patrulheiro','permanencia','canil'];
const WEEK=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];

let user=null,canManage=false,view=new Date(),users=new Map(),externals=new Map();
let members=[],services=[],rotationServices=[],holidays=[],online=new Set(),changes=[],vacations=[],balances=[],qualifications=[];
let selectedQualification=null;
let projections=new Map(),dutyDates=new Map(),nextDuty=new Map();

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDate(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)}
function addDays(s,n){const d=parseDate(s);d.setDate(d.getDate()+n);return iso(d)}
function diffDays(a,b){return Math.round((parseDate(b)-parseDate(a))/86400000)}
function br(v){return v?parseDate(v).toLocaleDateString('pt-BR'):'-'}
function dt(v){return v?new Date(v).toLocaleString('pt-BR'):'-'}
const PERIOD_KEY='tarefas_v743_period';
function periodState(){
 let saved=null;try{saved=JSON.parse(localStorage.getItem(PERIOD_KEY)||'null')}catch(_){}
 const mode=['day','week','month'].includes(saved?.mode)?saved.mode:'day';
 let anchor=saved?.anchor&&/^\d{4}-\d{2}-\d{2}$/.test(saved.anchor)?parseDate(saved.anchor):new Date();anchor.setHours(0,0,0,0);
 let start=new Date(anchor),end=new Date(anchor);
 if(mode==='week'){start.setDate(start.getDate()-start.getDay());end=new Date(start);end.setDate(end.getDate()+6)}
 else if(mode==='month'){start=new Date(anchor.getFullYear(),anchor.getMonth(),1);end=new Date(anchor.getFullYear(),anchor.getMonth()+1,0)}
 const dates=[];for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))dates.push(iso(d));
 return{mode,anchor,start,end,anchorIso:iso(anchor),ini:iso(start),fim:iso(end),dates};
}
function range(){const st=periodState();return{...st,dias:st.dates.length,extIni:addDays(st.ini,-365),extFim:addDays(st.fim,365)}}
function hol(date){return holidays.find(x=>x.data===date)}
function dayClass(date){const d=parseDate(date);return d.getDay()===0||d.getDay()===6||hol(date)?'weekend':'normal'}
function scaleLane(date){return dayClass(date)==='weekend'?'vermelha':'preta'}
function scaleLaneName(date){return scaleLane(date)==='vermelha'?'Escala Vermelha':'Escala Preta'}
function isLaneDate(date,lane){return scaleLane(date)===lane}
function countLaneDays(fromExclusive,toExclusive,lane){
 let n=0,date=addDays(fromExclusive,1);
 while(date<toExclusive){if(isLaneDate(date,lane))n++;date=addDays(date,1)}
 return n;
}
function modal(id,on=true){$(id)?.classList.toggle('open',on)}
function actorName(id){const u=users.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`}
function extName(id){const p=externals.get(String(id));return p?[p.patente,p.nome].filter(Boolean).join(' '):`Nome externo ${id}`}
function personName(obj){return obj?.usuario_id?actorName(obj.usuario_id):extName(obj?.pessoa_externa_id)}
function personKey(obj){return obj?.usuario_id?`u:${obj.usuario_id}`:`e:${obj?.pessoa_externa_id}`}
function qualificationFor(obj){return qualifications.find(q=>(obj?.usuario_id&&String(q.usuario_id)===String(obj.usuario_id))||(obj?.pessoa_externa_id&&String(q.pessoa_externa_id)===String(obj.pessoa_externa_id)))||null}
function qualificationSummary(obj){const q=qualificationFor(obj),parts=[];if(q?.cnh_categoria)parts.push(`CNH ${q.cnh_categoria}`);if(q?.cursos?.length)parts.push(q.cursos.join(', '));return parts.join(' · ')||'Sem habilitação/cursos'}
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
function inheritedAnchor(row,lane){
 const v=lane==='vermelha'?row?.heranca_vermelha_data:row?.heranca_preta_data;
 return v?{date:v,type:'inherited',lane}:null;
}
function previousDuty(row,g,date,lane){
 const list=dutyDates.get(g+'|'+lane+'|'+personKey(row))||[];
 const real=[...list].reverse().find(x=>x.date<date)||null;
 const inherited=inheritedAnchor(row,lane);
 if(inherited&&inherited.date<date&&(!real||inherited.date>real.date))return inherited;
 return real;
}
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
 const [u,e,q]=await Promise.all([
  supabaseClient.from('usuarios').select('id,patente,nome_guerra,secao,posicao,ativo').order('nome_guerra'),
  supabaseClient.from('pessoal_nomes_externos').select('id,nome,patente,ativo').eq('ativo',true).order('nome'),
  supabaseClient.from('pessoal_qualificacoes').select('*').order('id')
 ]);
 if(u.error)throw u.error;if(e.error)throw e.error;if(q.error)throw q.error;
 users=new Map((u.data||[]).filter(x=>x.ativo!==false).map(x=>[String(x.id),x]));
 externals=new Map((e.data||[]).map(x=>[String(x.id),x]));qualifications=q.data||[];
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
  supabaseClient.from('escala_feriados').select('*').gte('data',rg.extIni).lte('data',rg.extFim).order('data'),
  supabaseClient.from('escala_alteracoes').select('*').eq('modulo','servico').order('criado_em',{ascending:false}).limit(30),
  supabaseClient.from('pessoal_ferias').select('*').lte('data_inicio',rg.extFim).gte('data_fim',rg.extIni).order('data_inicio')
 ]);
 if(m.error)throw m.error;if(s.error)throw s.error;if(sx.error)throw sx.error;if(h.error)throw h.error;if(c.error)throw c.error;if(v.error)throw v.error;
 members=(m.data||[]).filter(x=>(x.usuario_id&&users.has(String(x.usuario_id)))||(x.pessoa_externa_id&&externals.has(String(x.pessoa_externa_id))));
 services=s.data||[];rotationServices=sx.data||[];holidays=h.data||[];changes=c.data||[];vacations=v.data||[];
 buildAllProjections();render();renderMembers();renderHolidays();renderChanges();renderSummary();
}
function buildAllProjections(){
 projections=new Map();dutyDates=new Map();nextDuty=new Map();
 for(const g of ORDER){buildProjection(g,'preta');buildProjection(g,'vermelha')}
}
function buildProjection(g,lane){
 const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));
 if(!rows.length)return;
 const keys=rows.map(personKey),queue=[...keys],rg=range(),today=todayIso();
 let confirmed=rotationServices.filter(x=>x.grupo===g&&keys.includes(personKey(x))&&scaleLane(x.data_servico)===lane);
 // V7.4.2: quando alguém assume a vaga de outro militar, a última referência
 // da Preta/Vermelha acompanha a vaga sem reescrever o histórico antigo.
 for(const row of rows){
   const inherited=inheritedAnchor(row,lane);
   if(inherited&&!confirmed.some(x=>personKey(x)===personKey(row)&&x.data_servico>=inherited.date)){
     confirmed.push({id:-Number(row.id||0),grupo:g,data_servico:inherited.date,usuario_id:row.usuario_id||null,pessoa_externa_id:row.pessoa_externa_id||null,_inherited:true});
   }
 }
 confirmed.sort((a,b)=>a.data_servico.localeCompare(b.data_servico)||Number(a.id)-Number(b.id));
 if(!confirmed.length)return;
 const anchorDate=confirmed[0].data_servico;
 const localDuty=new Map();
 function addDuty(key,date,type,item=null){
   if(!localDuty.has(key))localDuty.set(key,[]);
   localDuty.get(key).push({date,type,item,lane});
   const k=g+'|'+lane+'|'+date;if(!projections.has(k))projections.set(k,[]);
   projections.get(k).push({key,type,item,lane});
 }
 confirmed.filter(x=>x.data_servico===anchorDate).forEach(a=>{const key=personKey(a);addDuty(key,anchorDate,'actual',a);moveToBack(queue,key)});
 let date=addDays(anchorDate,1);
 while(date<=rg.extFim){
   if(!isLaneDate(date,lane)){date=addDays(date,1);continue}
   const actuals=rotationActuals(g,date).filter(x=>keys.includes(personKey(x))&&scaleLane(x.data_servico)===lane);
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
   list.sort((a,b)=>a.date.localeCompare(b.date));dutyDates.set(g+'|'+lane+'|'+key,list);
   const next=list.find(x=>x.date>=today);if(next)nextDuty.set(g+'|'+lane+'|'+key,next);
 }
}
function dutyAt(row,g,date){const lane=scaleLane(date),list=projections.get(g+'|'+lane+'|'+date)||[];return list.find(x=>x.key===personKey(row))}
function folgaNumber(row,g,date){
 const lane=scaleLane(date),prev=previousDuty(row,g,date,lane);
 if(!prev)return null;
 return countLaneDays(prev.date,addDays(date,1),lane);
}
function nextMeta(row,g){
 const vac=vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_fim>=todayIso());
 if(vac&&vac.data_inicio<=todayIso()&&vac.data_fim>=todayIso())return `<span class="v721-person-meta vac">Férias até ${br(vac.data_fim)} · ADP ${br(addDays(vac.data_fim,1))}</span>`;
 const key=personKey(row),black=nextDuty.get(g+'|preta|'+key),red=nextDuty.get(g+'|vermelha|'+key),parts=[];
 if(row.heranca_origem)parts.push(`Vaga herdada de ${row.heranca_origem}`);
 if(black)parts.push(`Preta: ${br(black.date)}${black.type==='predicted'?' prev.':''}`);
 if(red)parts.push(`Vermelha: ${br(red.date)}${red.type==='predicted'?' prev.':''}`);
 return parts.length?`<span class="v721-person-meta next">${parts.join(' · ')}</span>`:'<span class="v721-person-meta">Sem projeção — confirme um serviço em cada escala</span>';
}
function renderSummary(){
 const uniqueMembers=new Set(members.map(personKey)),uniqueOnService=new Set(services.map(personKey));
 $('sumScalePeople').textContent=uniqueMembers.size;$('sumServices').textContent=services.length;$('sumPeopleOnService').textContent=uniqueOnService.size;
 let total=0,now=todayIso();
 for(const g of ORDER)for(const row of members.filter(x=>x.grupo===g))for(const lane of ['preta','vermelha']){
   const list=dutyDates.get(g+'|'+lane+'|'+personKey(row))||[],prev=previousDuty(row,g,addDays(now,1),lane),next=list.find(x=>x.date>now);
   if(prev&&next)total+=countLaneDays(prev.date,next.date,lane);
 }
 $('sumFolgas').textContent=total;
}
function render(){
 const rg=range();$('monthLabel').textContent=rg.mode==='day'?br(rg.ini):rg.mode==='week'?`${br(rg.ini)} — ${br(rg.fim)}`:rg.start.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
 let html='';
 for(const g of ORDER){
  const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));
  html+=`<section class="v7-panel"><div class="v7-panel-head"><h3>${GROUPS[g]}</h3><span>${rows.length} pessoa(s)</span></div>`;
  if(!rows.length){html+=`<div class="v7-empty">Nenhuma pessoa cadastrada em ${GROUPS[g]}.</div></section>`;continue}
  html+='<div class="v7-wrap"><table class="v7-table"><thead><tr><th>Militar / Nome</th>';
  for(const date of rg.dates){
   const day=parseDate(date),holiday=hol(date);
   const dayLabel=rg.mode==='month'?String(day.getDate()).padStart(2,'0'):`${String(day.getDate()).padStart(2,'0')}/${String(day.getMonth()+1).padStart(2,'0')}`;
   html+=`<th class="v7-day ${dayClass(date)}" title="${esc(holiday?.nome||'')}"><small>${WEEK[day.getDay()]}</small><b>${dayLabel}</b></th>`;
  }
  html+='</tr></thead><tbody>';
  for(const row of rows){
   html+=`<tr><td><div class="v7-user">${row.usuario_id&&online.has(String(row.usuario_id))?'<i class="v7-online" title="Online"></i>':''}<span>${esc(personName(row))}${row.pessoa_externa_id?'<span class="v72-external-tag">SEM CONTA</span>':''}${nextMeta(row,g)}</span></div></td>`;
   for(const date of rg.dates){
    const actual=currentActual(row,g,date),vac=vacationFor(row,date),adapt=adaptationFor(row,date),duty=dutyAt(row,g,date);
    let cls=['v7-day',dayClass(date),canManage?'manage':''],text='-',title=hol(date)?.nome||'';
    if(actual){cls.push('service');text=esc(actual.marcacao||'SV');title=`Serviço confirmado · ${personName(row)} · ${br(date)}`}
    else if(vac){cls.push('vacation');text='FÉRIAS';title=`Férias · ${br(vac.data_inicio)} a ${br(vac.data_fim)}`}
    else if(adapt){cls.push('adaptation');text='ADP';title=`Dia de adaptação · serviço permitido a partir de ${br(addDays(date,1))}`}
    else if(duty?.type==='predicted'){cls.push('predicted');text='SV';title=`Próximo serviço previsto automaticamente · ${personName(row)} · ${br(date)}`}
    else{const f=folgaNumber(row,g,date);if(f!==null&&f>0){cls.push('folga-count');text=String(f);title=`${f}º dia da ${scaleLaneName(date)} desde o último serviço desta mesma escala`}}
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
function serviceContext(row,g,date){
 const lane=scaleLane(date),list=dutyDates.get(g+'|'+lane+'|'+personKey(row))||[];
 const prev=previousDuty(row,g,date,lane);
 const next=list.find(x=>x.date>date)||null;
 return{lane,prev,next,folgas:prev?countLaneDays(prev.date,date,lane):null,diasAte:next?countLaneDays(date,next.date,lane):null,diasCorridos:next?Math.max(0,diffDays(date,next.date)):null};
}
function fillServiceContext(row,g,date,item){
 const ctx=serviceContext(row,g,date);
 $('serviceFolgas').value=ctx.prev?`${ctx.folgas} dia(s) da ${ctx.lane==='vermelha'?'Vermelha':'Preta'} · último SV ${br(ctx.prev.date)}`:'Sem serviço anterior calculado nesta escala';
 $('serviceNext').value=ctx.next?`${ctx.next.type==='predicted'?'Previsto':'Confirmado'} · ${br(ctx.next.date)}`:'Sem próximo serviço calculado';
 $('serviceNextDays').value=ctx.next?`${ctx.diasAte} dia(s) desta escala · ${ctx.diasCorridos} dia(s) corridos`:'Sem previsão';
 $('serviceModalTitle').textContent=item?'Editar serviço':'Lançar serviço';
}
function openService(td){
 const row=rowFromCell(td),date=td.dataset.date,g=td.dataset.group,item=currentActual(row,g,date);
 $('serviceUserId').value=row.usuario_id||'';$('serviceExternalId').value=row.pessoa_externa_id||'';$('serviceGroup').value=g;$('serviceDate').value=date;
 $('serviceUser').value=personName(row);$('serviceDateLabel').value=br(date);$('serviceGroupLabel').value=`${GROUPS[g]} · ${scaleLaneName(date)}`;$('serviceMark').value=item?.marcacao||'SV';
 $('serviceNote').value=item?.observacao||'';fillServiceContext(row,g,date,item);$('serviceChangedBy').textContent=changedBy(item);$('removeService').hidden=!item;$('swapService').hidden=!item;modal('serviceModal');
}
async function saveService(e){
 e.preventDefault();const g=$('serviceGroup').value,uid=Number($('serviceUserId').value)||null,eid=Number($('serviceExternalId').value)||null;
 const common={p_data_servico:$('serviceDate').value,p_marcacao:$('serviceMark').value.trim()||'SV',p_observacao:$('serviceNote').value.trim()||null,p_usuario_id:Number(user.id),p_perfil_id:profileId()};
 const r=g==='canil'?await supabaseClient.rpc('v7_4_2_definir_servico_canil',{p_usuario_alvo_id:uid,p_pessoa_externa_id:eid,...common}):await supabaseClient.rpc('v7_2_3_definir_servico',{p_grupo:g,p_usuario_alvo_id:uid,p_pessoa_externa_id:eid,...common});
 if(r.error)return alert(r.error.message);modal('serviceModal',false);await loadScale();
}
function servicePerson(){return{usuario_id:Number($('serviceUserId').value)||null,pessoa_externa_id:Number($('serviceExternalId').value)||null}}
function targetOptions(src,g,date){
 return members.filter(x=>x.grupo===g&&personKey(x)!==personKey(src)).map(r=>{
  const vac=vacationFor(r,date),adp=adaptationFor(r,date),blocked=vac||adp;
  return `<option value="${personKey(r)}" ${blocked?'disabled':''}>${esc(personName(r))}${vac?' — FÉRIAS':adp?' — ADP':''}</option>`;
 }).join('');
}
function openSwap(){
 const src=servicePerson(),g=$('serviceGroup').value,date=$('serviceDate').value;
 $('swapSourceUserId').value=src.usuario_id||'';$('swapSourceExternalId').value=src.pessoa_externa_id||'';$('swapGroup').value=g;$('swapDate').value=date;
 $('swapSource').value=personName(src);$('swapDateLabel').value=br(date);$('swapGroupLabel').value=`${GROUPS[g]} · ${scaleLaneName(date)}`;$('swapNote').value='';
 $('swapTarget').innerHTML='<option value="">Selecione...</option>'+targetOptions(src,g,date);
 modal('serviceModal',false);modal('swapModal');
}
async function saveSwap(e){
 e.preventDefault();const value=$('swapTarget').value;if(!value)return;const [kind,id]=value.split(':'),g=$('swapGroup').value;
 const common={p_data_servico:$('swapDate').value,p_origem_usuario_id:Number($('swapSourceUserId').value)||null,p_origem_pessoa_externa_id:Number($('swapSourceExternalId').value)||null,p_destino_usuario_id:kind==='u'?Number(id):null,p_destino_pessoa_externa_id:kind==='e'?Number(id):null,p_observacao:$('swapNote').value.trim()||null,p_usuario_id:Number(user.id),p_perfil_id:profileId()};
 const r=g==='canil'?await supabaseClient.rpc('v7_4_2_transferir_servico_canil',{p_modo:'troca',...common}):await supabaseClient.rpc('v7_2_3_trocar_servico',{p_grupo:g,...common});
 if(r.error)return alert(r.error.message);modal('swapModal',false);await loadScale();
}
function openReplacement(){
 const src=servicePerson(),g=$('serviceGroup').value,date=$('serviceDate').value;
 $('replaceSourceUserId').value=src.usuario_id||'';$('replaceSourceExternalId').value=src.pessoa_externa_id||'';$('replaceGroup').value=g;$('replaceDate').value=date;
 $('replaceSource').value=personName(src);$('replaceDateLabel').value=br(date);$('replaceGroupLabel').value=`${GROUPS[g]} · ${scaleLaneName(date)}`;$('replaceNote').value='';
 $('replaceTarget').innerHTML='<option value="">Selecione...</option>'+targetOptions(src,g,date);
 modal('serviceModal',false);modal('replaceModal');
}
async function saveReplacement(e){
 e.preventDefault();const value=$('replaceTarget').value;if(!value)return;const [kind,id]=value.split(':'),g=$('replaceGroup').value;
 const common={p_data_servico:$('replaceDate').value,p_origem_usuario_id:Number($('replaceSourceUserId').value)||null,p_origem_pessoa_externa_id:Number($('replaceSourceExternalId').value)||null,p_destino_usuario_id:kind==='u'?Number(id):null,p_destino_pessoa_externa_id:kind==='e'?Number(id):null,p_observacao:$('replaceNote').value.trim()||null,p_usuario_id:Number(user.id),p_perfil_id:profileId()};
 const r=g==='canil'?await supabaseClient.rpc('v7_4_2_transferir_servico_canil',{p_modo:'substituicao',...common}):await supabaseClient.rpc('v7_2_3_substituir_servico',{p_grupo:g,...common});
 if(r.error)return alert(r.error.message);modal('replaceModal',false);await loadScale();
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
function qualificationPeopleRows(){
 const term=norm($('qualificationSearch')?.value||'');
 const rows=[...users.values()].map(u=>({usuario_id:u.id,pessoa_externa_id:null})).concat([...externals.values()].map(e=>({usuario_id:null,pessoa_externa_id:e.id})));
 return rows.filter(r=>!term||norm(personName(r)+' '+qualificationSummary(r)).includes(term)).sort((a,b)=>personName(a).localeCompare(personName(b),'pt-BR'));
}
function renderQualificationPeople(){
 const rows=qualificationPeopleRows();$('qualificationCount').textContent=`${rows.length} pessoa(s)`;
 $('qualificationPeople').innerHTML=rows.length?rows.map(r=>{const q=qualificationFor(r),key=personKey(r),active=selectedQualification&&personKey(selectedQualification)===key;return `<div class="v74-qual-person ${active?'active':''}" data-qual-person="${key}"><b>${esc(personName(r))}${q?.cnh_categoria?`<span class="v74-cnh-chip">CNH ${esc(q.cnh_categoria)}</span>`:''}</b><small>${esc(qualificationSummary(r))}</small></div>`}).join(''):'<div class="v7-empty">Nenhuma pessoa encontrada.</div>';
}
function openQualification(row){
 selectedQualification=row;const q=qualificationFor(row);$('qualificationEmpty').hidden=true;$('qualificationForm').hidden=false;$('qualificationUserId').value=row.usuario_id||'';$('qualificationExternalId').value=row.pessoa_externa_id||'';$('qualificationPerson').value=personName(row);$('qualificationCnh').value=q?.cnh_categoria||'';$('qualificationCnhValidity').value=q?.cnh_validade||'';$('qualificationCourses').value=(q?.cursos||[]).join(', ');$('qualificationNote').value=q?.observacao||'';$('qualificationSave').hidden=!canManage;$('qualificationCnh').disabled=!canManage;$('qualificationCnhValidity').disabled=!canManage;$('qualificationCourses').disabled=!canManage;$('qualificationNote').disabled=!canManage;renderQualificationPeople();
}
function openQualifications(){selectedQualification=null;$('qualificationForm').hidden=true;$('qualificationEmpty').hidden=false;$('qualificationSearch').value='';renderQualificationPeople();modal('qualificationsModal')}
async function saveQualification(e){
 e.preventDefault();if(!canManage)return;const cursos=$('qualificationCourses').value.split(',').map(x=>x.trim()).filter(Boolean);
 const r=await supabaseClient.rpc('v7_4_salvar_qualificacao',{p_usuario_alvo_id:Number($('qualificationUserId').value)||null,p_pessoa_externa_id:Number($('qualificationExternalId').value)||null,p_cnh_categoria:$('qualificationCnh').value.trim()||null,p_cnh_validade:$('qualificationCnhValidity').value||null,p_cursos:cursos,p_observacao:$('qualificationNote').value.trim()||null,p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 if(r.error)return alert(r.error.message);await loadPeople();if(selectedQualification){selectedQualification=selectedQualification.usuario_id?{usuario_id:selectedQualification.usuario_id,pessoa_externa_id:null}:{usuario_id:null,pessoa_externa_id:selectedQualification.pessoa_externa_id};openQualification(selectedQualification)}
}
function toggleMemberMode(){const ext=$('memberMode').value==='externo';$('memberSystemField').hidden=ext;$('memberExternalNameField').hidden=!ext;$('memberExternalRankField').hidden=!ext}
function renderMembers(){
 const g=$('memberGroup').value||'sargento',rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100));
 $('membersList').innerHTML=rows.length?rows.map(x=>`<div class="v7-list-row"><div><b>${esc(personName(x))}${x.pessoa_externa_id?'<span class="v72-external-tag">SEM CONTA</span>':''}</b><div class="v7-mini">Ordem ${x.ordem||100}</div></div><button class="v7-btn danger" data-rm-member="${x.id}">Remover</button></div>`).join(''):'<div class="v7-empty">Nenhuma pessoa nesta escala.</div>';
}
async function addMember(){
 const g=$('memberGroup').value,ordem=Number($('memberOrder').value)||100,mode=$('memberMode').value;let r;
 if(mode==='externo'){
  const nome=$('memberExternalName').value.trim();if(!nome)return alert('Informe o nome.');
  r=g==='canil'?await supabaseClient.rpc('v7_4_2_adicionar_integrante_externo_canil',{p_nome:nome,p_patente:$('memberExternalRank').value.trim()||null,p_ordem:ordem,p_usuario_id:Number(user.id),p_perfil_id:profileId()}):await supabaseClient.rpc('v7_2_adicionar_integrante_externo',{p_grupo:g,p_nome:nome,p_patente:$('memberExternalRank').value.trim()||null,p_ordem:ordem,p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 }else{
  const uid=Number($('memberUser').value);if(!uid)return alert('Selecione um usuário.');
  r=g==='canil'?await supabaseClient.rpc('v7_4_2_adicionar_integrante_canil',{p_usuario_alvo_id:uid,p_pessoa_externa_id:null,p_ordem:ordem,p_usuario_id:Number(user.id),p_perfil_id:profileId()}):await supabaseClient.rpc('v7_2_adicionar_integrante',{p_grupo:g,p_usuario_alvo_id:uid,p_pessoa_externa_id:null,p_ordem:ordem,p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 }
 if(r.error)return alert(r.error.message);$('memberExternalName').value='';$('memberExternalRank').value='';await Promise.all([loadPeople(),loadBalances(),loadScale()]);
}
async function removeMember(id){
 if(!confirm('Remover esta pessoa da escala? Serviços confirmados permanecem no histórico.'))return;
 const r=await supabaseClient.rpc('v7_2_remover_integrante',{p_integrante_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 if(r.error)return alert(r.error.message);await loadScale();
}
function renderHolidays(){const rg=range(),list=holidays.filter(h=>h.data>=rg.ini&&h.data<=rg.fim);$('holidaysList').innerHTML=list.length?list.map(h=>`<div class="v7-list-row"><div><b>${br(h.data)}</b><div class="v7-mini">${esc(h.nome)}</div></div><button class="v7-btn danger" data-rm-holiday="${h.id}">Remover</button></div>`).join(''):'<div class="v7-empty">Nenhum feriado cadastrado neste período.</div>'}
async function addHoliday(){const date=$('holidayDate').value,nome=$('holidayName').value.trim();if(!date||!nome)return alert('Informe data e descrição.');const r=await supabaseClient.rpc('v7_definir_feriado',{p_data:date,p_nome:nome,p_usuario_id:Number(user.id),p_perfil_id:profileId()});if(r.error)return alert(r.error.message);$('holidayName').value='';await loadScale()}
async function removeHoliday(id){const r=await supabaseClient.rpc('v7_remover_feriado',{p_feriado_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:profileId()});if(r.error)return alert(r.error.message);await loadScale()}
function renderChanges(){$('changesCount').textContent=`${changes.length} registro(s)`;$('serviceChanges').innerHTML=changes.length?changes.map(x=>`<div class="v72-change-row"><div><b>${esc(x.acao||'Alteração')}</b><small>${esc(x.detalhes||'')}</small></div><div style="text-align:right"><b>${esc(actorName(x.usuario_id))}</b><small>${dt(x.criado_em)}</small></div></div>`).join(''):'<div class="v7-empty">Nenhuma alteração registrada.</div>'}
function month(delta){view=new Date(view.getFullYear(),view.getMonth()+delta,1);loadScale().catch(e=>alert(e.message))}
function bind(){
 $('prevMonth').onclick=()=>month(-1);$('nextMonth').onclick=()=>month(1);$('todayMonth').onclick=()=>{view=new Date();loadScale().catch(e=>alert(e.message))};
 $('manageMembers').onclick=()=>{renderMembers();modal('membersModal')};$('manageHolidays').onclick=()=>{renderHolidays();modal('holidayModal')};$('manageQualifications').onclick=openQualifications;
 $('serviceForm').onsubmit=saveService;$('removeService').onclick=openReplacement;$('swapService').onclick=openSwap;$('markVacation').onclick=()=>openVacation(servicePerson());
 $('swapForm').onsubmit=saveSwap;$('replaceForm').onsubmit=saveReplacement;$('vacationForm').onsubmit=saveVacation;$('removeVacation').onclick=removeVacation;
 $('memberGroup').onchange=renderMembers;$('memberMode').onchange=toggleMemberMode;$('addMember').onclick=addMember;$('addHoliday').onclick=addHoliday;$('qualificationSearch').oninput=renderQualificationPeople;$('qualificationForm').onsubmit=saveQualification;$('qualificationPeople').onclick=e=>{const el=e.target.closest('[data-qual-person]');if(!el)return;const [kind,id]=el.dataset.qualPerson.split(':');openQualification(kind==='u'?{usuario_id:Number(id),pessoa_externa_id:null}:{usuario_id:null,pessoa_externa_id:Number(id)})};
 $('membersList').onclick=e=>{const b=e.target.closest('[data-rm-member]');if(b)removeMember(b.dataset.rmMember)};
 $('holidaysList').onclick=e=>{const b=e.target.closest('[data-rm-holiday]');if(b)removeHoliday(b.dataset.rmHoliday)};
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal(b.dataset.close,false));
 document.querySelectorAll('.v7-modal-bg').forEach(bg=>bg.onclick=e=>{if(e.target===bg)bg.classList.remove('open')});toggleMemberMode();
}
function realtime(){
 try{
  supabaseClient.channel('v723-escalas')
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_integrantes'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_servicos'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_feriados'},()=>loadScale())
   .on('postgres_changes',{event:'*',schema:'public',table:'pessoal_ferias'},async()=>{await loadBalances();await loadScale()})
   .on('postgres_changes',{event:'*',schema:'public',table:'pessoal_qualificacoes'},async()=>{await loadPeople();renderQualificationPeople()})
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_alteracoes'},()=>loadScale()).subscribe();
 }catch(_){}
}
(async()=>{if(!await initUser())return;bind();await Promise.all([loadPeople(),loadPresence(),loadBalances()]);await loadScale();realtime()})().catch(e=>{console.error(e);alert('Erro ao abrir a Escala de serviço: '+e.message)});
})();
