(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const GROUPS={sargento:'Sargentos',cabo:'Cabos',soldado:'Soldados'};
const ORDER=['sargento','cabo','soldado'];
const WEEK=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
let user=null,canManage=false,view=new Date(),users=new Map(),externals=new Map(),quals=new Map();
let members=[],missions=[],rotationMissions=[],participants=[],rotationParticipants=[],holidays=[],vacations=[],changes=[],selected=null;
let projections=new Map(),dutyDates=new Map(),nextDuty=new Map();

function pid(){return user?.perfil_id?Number(user.perfil_id):null}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDate(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)}
function addDays(s,n){const d=parseDate(s);d.setDate(d.getDate()+n);return iso(d)}
function br(v){return v?parseDate(v).toLocaleDateString('pt-BR'):'-'}
function dt(v){return v?new Date(v).toLocaleString('pt-BR'):'-'}
function range(){const y=view.getFullYear(),m=view.getMonth(),ini=iso(new Date(y,m,1)),fim=iso(new Date(y,m+1,0));return{ini,fim,dias:new Date(y,m+1,0).getDate(),extIni:addDays(ini,-365),extFim:addDays(fim,365)}}
function modal(id,on=true){$(id)?.classList.toggle('open',on)}
function actorName(id){const u=users.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`}
function extName(id){const x=externals.get(String(id));return x?[x.patente,x.nome].filter(Boolean).join(' '):`Nome externo ${id}`}
function personName(p){return p?.usuario_id?actorName(p.usuario_id):extName(p?.pessoa_externa_id)}
function personKey(p){return p?.usuario_id?`u:${p.usuario_id}`:p?.pessoa_externa_id?`e:${p.pessoa_externa_id}`:''}
function qFor(p){return quals.get(personKey(p))||null}
function qualText(p){const q=qFor(p),parts=[];if(q?.cnh_categoria)parts.push(`CNH ${q.cnh_categoria}`);if(q?.cursos?.length)parts.push(q.cursos.join(', '));return parts.join(' · ')||'Sem habilitação/cursos informados'}
function cnhBadge(p){const q=qFor(p);return q?.cnh_categoria?`<span class="v74-cnh">CNH ${esc(q.cnh_categoria)}</span>`:''}
function missionState(m){const t=iso(new Date());if(m.data_fim<t)return'Finalizada';if(m.data_inicio<=t&&m.data_fim>=t)return'Em andamento';return'Planejada'}
function qty(m,g){return Number(g==='sargento'?m.qtd_sargentos:g==='cabo'?m.qtd_cabos:m.qtd_soldados)||0}
function laneFor(date){const d=parseDate(date);return d.getDay()===0||d.getDay()===6||holidays.some(h=>h.data===date)?'vermelha':'preta'}
function laneName(date){return laneFor(date)==='vermelha'?'Vermelha':'Preta'}
function laneClass(date){return laneFor(date)==='vermelha'?'weekend':'normal'}
function isLaneDate(date,lane){return laneFor(date)===lane}
function countLaneDays(fromExclusive,toExclusive,lane){let n=0,d=addDays(fromExclusive,1);while(d<toExclusive){if(isLaneDate(d,lane))n++;d=addDays(d,1)}return n}
function vacationFor(row,date){return vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_inicio<=date&&v.data_fim>=date)}
function adaptationFor(row,date){return vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&addDays(v.data_fim,1)===date)}
function eligibleDay(row,date){return !vacationFor(row,date)&&!adaptationFor(row,date)}
function eligiblePeriod(row,start,end){let d=start;while(d<=end){if(!eligibleDay(row,d))return false;d=addDays(d,1)}return true}
function moveToBack(queue,key){const i=queue.indexOf(key);if(i>=0){queue.splice(i,1);queue.push(key)}}
function memberByKey(key,g){return members.find(x=>x.grupo===g&&personKey(x)===key)}
function missionById(id){return rotationMissions.find(m=>String(m.id)===String(id))||missions.find(m=>String(m.id)===String(id))}
function participantGroup(p){if(p.grupo_escala)return p.grupo_escala;const key=personKey(p),m=members.find(x=>personKey(x)===key);return m?.grupo||null}
function peopleFor(mid){return participants.filter(x=>String(x.missao_id)===String(mid))}
function actualFor(mid,g){return rotationParticipants.filter(p=>String(p.missao_id)===String(mid)&&participantGroup(p)===g)}
function days(m){return Math.max(1,Math.round((parseDate(m.data_fim)-parseDate(m.data_inicio))/86400000)+1)}
function totalDisp(m){return peopleFor(m.id).length*Number(m.dispensas_por_pessoa||0)}
function fmt(n){n=Number(n||0);return Number.isInteger(n)?String(n):n.toFixed(1).replace('.',',')}

async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;user=base;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);if(p?.usuario)user=p.usuario}catch(_){}}
 const r=await supabaseClient.rpc('v7_2_pode_gerenciar_pessoal',{p_usuario_id:Number(user.id),p_perfil_id:pid()});
 canManage=!r.error&&r.data===true;$('newMission').hidden=!canManage;$('manageMissionMembers').hidden=!canManage;return true;
}
async function loadPeople(){
 const [u,e,q]=await Promise.all([
  supabaseClient.from('usuarios').select('id,patente,nome_guerra,nome_completo,secao,posicao,ativo').order('nome_guerra'),
  supabaseClient.from('pessoal_nomes_externos').select('id,nome,patente,ativo').eq('ativo',true).order('nome'),
  supabaseClient.from('pessoal_qualificacoes').select('*').order('id')
 ]);
 if(u.error)throw u.error;if(e.error)throw e.error;if(q.error)throw q.error;
 users=new Map((u.data||[]).filter(x=>x.ativo!==false).map(x=>[String(x.id),x]));externals=new Map((e.data||[]).map(x=>[String(x.id),x]));
 quals=new Map((q.data||[]).map(x=>[x.usuario_id?`u:${x.usuario_id}`:`e:${x.pessoa_externa_id}`,x]));
 $('missionMemberUser').innerHTML='<option value="">Selecione...</option>'+[...users.values()].map(x=>`<option value="${x.id}">${esc(actorName(x.id))} — ${esc(x.secao||'-')}</option>`).join('');
}
async function load(){
 const rg=range();
 const [mi,mx,mem,h,v,c]=await Promise.all([
  supabaseClient.from('missoes_escala').select('*').gte('data_inicio',rg.ini).lte('data_inicio',rg.fim).order('data_inicio').order('id'),
  supabaseClient.from('missoes_escala').select('*').gte('data_inicio',rg.extIni).lte('data_inicio',rg.extFim).order('data_inicio').order('id'),
  supabaseClient.from('missao_escala_integrantes').select('*').eq('ativo',true).order('grupo').order('ordem').order('id'),
  supabaseClient.from('escala_feriados').select('*').gte('data',rg.extIni).lte('data',rg.extFim).order('data'),
  supabaseClient.from('pessoal_ferias').select('*').lte('data_inicio',rg.extFim).gte('data_fim',rg.extIni).order('data_inicio'),
  supabaseClient.from('escala_alteracoes').select('*').eq('modulo','missao').order('criado_em',{ascending:false}).limit(40)
 ]);
 for(const r of [mi,mx,mem,h,v,c])if(r.error)throw r.error;
 missions=mi.data||[];rotationMissions=mx.data||[];members=(mem.data||[]).filter(x=>(x.usuario_id&&users.has(String(x.usuario_id)))||(x.pessoa_externa_id&&externals.has(String(x.pessoa_externa_id))));holidays=h.data||[];vacations=v.data||[];changes=c.data||[];
 const ids=rotationMissions.map(x=>x.id);rotationParticipants=[];
 if(ids.length){const p=await supabaseClient.from('missao_participantes').select('*').in('missao_id',ids).order('id');if(p.error)throw p.error;rotationParticipants=p.data||[]}
 const currentIds=new Set(missions.map(x=>String(x.id)));participants=rotationParticipants.filter(p=>currentIds.has(String(p.missao_id)));
 buildProjections();renderAll();renderScale();renderMembers();if(selected){const fresh=missions.find(x=>String(x.id)===String(selected.id));selected=fresh||null;if(selected)renderDetail();else{$('missionDetail').hidden=true;$('missionEmpty').hidden=false}}
}

function buildProjections(){
 projections=new Map();dutyDates=new Map();nextDuty=new Map();
 for(const g of ORDER)for(const lane of ['preta','vermelha'])buildProjection(g,lane);
}
function buildProjection(g,lane){
 const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));if(!rows.length)return;
 let queue=rows.map(personKey);const local=new Map(),today=iso(new Date());
 const ms=rotationMissions.filter(m=>laneFor(m.data_inicio)===lane).sort((a,b)=>a.data_inicio.localeCompare(b.data_inicio)||Number(a.id)-Number(b.id));
 function add(key,m,type,p=null){if(!key)return;if(!local.has(key))local.set(key,[]);const item={date:m.data_inicio,endDate:m.data_fim,missionId:m.id,type,participant:p,lane};local.get(key).push(item);const k=`${g}|${lane}|${m.data_inicio}`;if(!projections.has(k))projections.set(k,[]);projections.get(k).push({...item,key})}
 for(const m of ms){
  const actuals=actualFor(m.id,g).filter(p=>queue.includes(personKey(p)));const used=new Set();
  for(const p of actuals){const key=personKey(p);used.add(key);add(key,m,'actual',p);moveToBack(queue,key)}
  let need=Math.max(0,qty(m,g)-actuals.length);
  while(need>0){let idx=-1;for(let i=0;i<queue.length;i++){const key=queue[i],row=memberByKey(key,g);if(row&&!used.has(key)&&eligiblePeriod(row,m.data_inicio,m.data_fim)){idx=i;break}}if(idx<0)break;const key=queue[idx];used.add(key);add(key,m,'predicted');queue.splice(idx,1);queue.push(key);need--}
 }
 for(const [key,list] of local){list.sort((a,b)=>a.date.localeCompare(b.date));dutyDates.set(`${g}|${lane}|${key}`,list);const n=list.find(x=>x.date>=today);if(n)nextDuty.set(`${g}|${lane}|${key}`,n)}
}
function entriesFor(row,g){const key=personKey(row);return [...(dutyDates.get(`${g}|preta|${key}`)||[]),...(dutyDates.get(`${g}|vermelha|${key}`)||[])].sort((a,b)=>a.date.localeCompare(b.date))}
function periodAt(row,g,date){return entriesFor(row,g).find(x=>x.date<=date&&x.endDate>=date)||null}
function folgaNumber(row,g,date){const lane=laneFor(date),list=dutyDates.get(`${g}|${lane}|${personKey(row)}`)||[];const prev=[...list].reverse().find(x=>x.endDate<date);if(!prev)return null;return countLaneDays(prev.endDate,addDays(date,1),lane)}
function nextMeta(row,g){const key=personKey(row),b=nextDuty.get(`${g}|preta|${key}`),r=nextDuty.get(`${g}|vermelha|${key}`),parts=[];if(b)parts.push(`Preta ${br(b.date)}${b.type==='predicted'?' prev.':''}`);if(r)parts.push(`Vermelha ${br(r.date)}${r.type==='predicted'?' prev.':''}`);return parts.length?parts.join(' · '):'Sem próxima missão'}
function projectedForMission(m,g){return (projections.get(`${g}|${laneFor(m.data_inicio)}|${m.data_inicio}`)||[]).filter(x=>String(x.missionId)===String(m.id)&&x.type==='predicted')}

function renderScale(){
 const rg=range();let html='';
 for(const g of ORDER){const rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));html+=`<section class="v7-panel"><div class="v7-panel-head"><h3>${GROUPS[g]}</h3><span>${rows.length} pessoa(s)</span></div>`;if(!rows.length){html+=`<div class="v7-empty">Nenhuma pessoa cadastrada em ${GROUPS[g]}.</div></section>`;continue}
  html+='<div class="v7-wrap"><table class="v7-table v74-table"><thead><tr><th>Militar / Qualificação</th>';
  for(let d=1;d<=rg.dias;d++){const date=iso(new Date(view.getFullYear(),view.getMonth(),d)),day=parseDate(date),h=holidays.find(x=>x.data===date);html+=`<th class="v7-day ${laneClass(date)}" title="${esc(h?.nome||'')}"><small>${WEEK[day.getDay()]}</small><b>${String(d).padStart(2,'0')}</b></th>`}html+='</tr></thead><tbody>';
  for(const row of rows){html+=`<tr><td><div class="v7-user">${esc(personName(row))}${cnhBadge(row)}</div><span class="v74-member-meta qual">${esc(qualText(row))}</span><span class="v74-member-meta next">${esc(nextMeta(row,g))}</span></td>`;
   for(let d=1;d<=rg.dias;d++){const date=iso(new Date(view.getFullYear(),view.getMonth(),d)),vac=vacationFor(row,date),adp=adaptationFor(row,date),period=periodAt(row,g,date);let cls=`v7-day ${laneClass(date)}`,text='';if(vac){cls+=' vacation';text='FÉRIAS'}else if(adp){cls+=' adaptation';text='ADP'}else if(period){cls+=period.type==='actual'?' mission':' projected';if(date>period.date)cls+=' period';text=period.type==='actual'?(date===period.date?'MS':'MIS'):(date===period.date?'PRV':'PRV')}else{const n=folgaNumber(row,g,date);if(n!==null){cls+=' folga-count';text=String(n)}}html+=`<td class="${cls}" title="${period?esc(missionById(period.missionId)?.titulo||'Missão'):''}">${text}</td>`}html+='</tr>'}
  html+='</tbody></table></div></section>';
 }
 $('missionScaleBoard').innerHTML=html;
}

function renderAll(){
 $('monthLabel').textContent=view.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());$('missionCount').textContent=`${missions.length} registro(s)`;
 $('missionList').innerHTML=missions.length?missions.map(m=>{const lane=laneFor(m.data_inicio),p=peopleFor(m.id);return`<article class="v74-mission-card ${selected&&String(selected.id)===String(m.id)?'active':''}" data-mission="${m.id}"><div class="v74-mission-top"><div><h4>${esc(m.titulo)}</h4><p>${br(m.data_inicio)} → ${br(m.data_fim)}${m.local?' · '+esc(m.local):''}</p></div><span class="v74-badge ${lane==='vermelha'?'red':''}">${lane==='vermelha'?'Vermelha':'Preta'}</span></div><p><b>${p.length}</b> confirmado(s) · necessidade Sgt ${qty(m,'sargento')} / Cb ${qty(m,'cabo')} / Sd ${qty(m,'soldado')} · ${days(m)} dia(s)</p><p>${missionState(m)} · ${fmt(totalDisp(m))} dispensa(s) previstas</p></article>`}).join(''):'<div class="v7-empty">Nenhuma missão iniciando neste mês.</div>';
 $('sumMissionScalePeople').textContent=new Set(members.map(personKey)).size;$('sumMissions').textContent=missions.length;$('sumMissionPeople').textContent=participants.length;
 let total=0,now=iso(new Date());for(const g of ORDER)for(const row of members.filter(x=>x.grupo===g))for(const lane of ['preta','vermelha']){const list=dutyDates.get(`${g}|${lane}|${personKey(row)}`)||[],prev=[...list].reverse().find(x=>x.endDate<=now),next=list.find(x=>x.date>now);if(prev&&next)total+=countLaneDays(prev.endDate,next.date,lane)}$('sumMissionFolgas').textContent=total;
 $('missionChangesCount').textContent=`${changes.length} registro(s)`;$('missionChanges').innerHTML=changes.length?changes.map(x=>`<div class="v72-change-row"><div><b>${esc(x.acao)}</b><small>${esc(x.detalhes||'')}</small></div><div style="text-align:right"><b>${esc(actorName(x.usuario_id))}</b><small>${dt(x.criado_em)}</small></div></div>`).join(''):'<div class="v7-empty">Nenhuma alteração registrada.</div>';
}
function groupCounts(m,g){const actual=peopleFor(m.id).filter(p=>participantGroup(p)===g).length;return{actual,required:qty(m,g)}}
function renderDetail(){
 if(!selected)return;const list=peopleFor(selected.id),lane=laneFor(selected.data_inicio);$('missionEmpty').hidden=true;$('missionDetail').hidden=false;
 const req=ORDER.map(g=>{const c=groupCounts(selected,g);return`<div><span>${GROUPS[g]}</span><b>${c.actual}/${c.required}</b></div>`}).join('');
 $('missionDetail').innerHTML=`<div class="v74-mission-top"><div><h3 style="margin:0">${esc(selected.titulo)}</h3><div class="v7-mini">${br(selected.data_inicio)} → ${br(selected.data_fim)} · Escala <b class="${lane==='vermelha'?'v74-lane-vermelha':'v74-lane-preta'}">${laneName(selected.data_inicio)}</b></div></div><div class="v74-toolbar">${canManage?'<button class="v7-btn" data-edit>Editar</button><button class="v7-btn danger" data-delete>Excluir</button>':''}</div></div><div class="v74-meta"><div><small>Local</small><b>${esc(selected.local||'-')}</b></div><div><small>Participantes</small><b>${list.length}</b></div><div><small>Dispensas/pessoa</small><b>${fmt(selected.dispensas_por_pessoa)}</b></div><div><small>Dispensas previstas</small><b>${fmt(totalDisp(selected))}</b></div></div><div class="v74-required">${req}</div><div class="v7-note" style="margin-top:8px">${esc(selected.descricao||'Sem observações.')}</div>${canManage?participantForm():''}<div style="margin-top:10px"><b style="font-size:10px">Efetivo confirmado</b><div class="v74-participants">${list.length?list.map(p=>{const g=participantGroup(p)||'-';return`<div class="v74-participant"><div><b>${esc(personName(p))}${cnhBadge(p)}</b><div class="v74-qual">${esc(qualText(p))}</div></div><span>${esc(GROUPS[g]||g)}</span>${canManage?`<button class="v7-btn danger" data-rm-participant="${p.id}">Remover</button>`:''}</div>`}).join(''):'<div class="v7-empty">Nenhuma pessoa confirmada.</div>'}</div></div><div class="v72-last-change" style="margin-top:10px">Última alteração por ${esc(actorName(selected.atualizado_por||selected.criado_por))} em ${dt(selected.atualizado_em||selected.criado_em)}.</div>`;
 wireDetail();
}
function candidateOptions(m,g){
 const counts=groupCounts(m,g);if(counts.actual>=counts.required)return '';
 const actualKeys=new Set(peopleFor(m.id).map(personKey)),predKeys=new Set(projectedForMission(m,g).map(x=>x.key));
 const rows=members.filter(x=>x.grupo===g&&!actualKeys.has(personKey(x))&&eligiblePeriod(x,m.data_inicio,m.data_fim));
 return rows.sort((a,b)=>Number(predKeys.has(personKey(b)))-Number(predKeys.has(personKey(a)))||(a.ordem||100)-(b.ordem||100)).map(r=>{const key=personKey(r),fol=folgaNumber(r,g,m.data_inicio),q=qFor(r);return`<option value="${key}">${predKeys.has(key)?'★ ':''}${esc(personName(r))}${q?.cnh_categoria?' — CNH '+esc(q.cnh_categoria):''}${fol!==null?' — '+fol+' folga(s)':''}</option>`}).join('');
}
function participantForm(){return`<div class="v7-panel" style="margin-top:9px;padding:9px"><div class="v74-toolbar"><select id="partGroup" class="v7-btn"><option value="sargento">Sargentos</option><option value="cabo">Cabos</option><option value="soldado">Soldados</option></select><select id="partPerson" class="v7-btn" style="min-width:310px"></select><button id="addParticipant" class="v7-btn primary">Confirmar na missão</button></div><div id="partHelp" class="v74-candidate-help"></div></div>`}
function refreshCandidates(){if(!selected||!$('partGroup'))return;const g=$('partGroup').value,counts=groupCounts(selected,g),options=candidateOptions(selected,g);$('partPerson').innerHTML='<option value="">Selecione...</option>'+options;$('addParticipant').disabled=counts.actual>=counts.required;const p=projectedForMission(selected,g);$('partHelp').innerHTML=counts.actual>=counts.required?'Quantidade prevista deste grupo já preenchida.':p.length?`<span class="v74-rec">★ Recomendado pelo rodízio:</span> ${p.map(x=>esc(personName(memberByKey(x.key,g)))).join(', ')}`:'Sem previsão pendente neste grupo.'}
function wireDetail(){
 $('missionDetail').querySelector('[data-edit]')?.addEventListener('click',()=>openMission(selected));$('missionDetail').querySelector('[data-delete]')?.addEventListener('click',deleteMission);$('missionDetail').querySelectorAll('[data-rm-participant]').forEach(b=>b.onclick=()=>removeParticipant(b.dataset.rmParticipant));if($('partGroup')){$('partGroup').onchange=refreshCandidates;$('addParticipant').onclick=addParticipant;refreshCandidates()}
}
function openMission(m=null){$('missionForm').reset();$('missionId').value=m?.id||'';$('missionModalTitle').textContent=m?'Editar missão':'Nova missão';$('missionTitle').value=m?.titulo||'';$('missionStart').value=m?.data_inicio||iso(new Date());$('missionEnd').value=m?.data_fim||$('missionStart').value;$('missionPlace').value=m?.local||'';$('missionDispensas').value=Number(m?.dispensas_por_pessoa||0);$('missionQtySgt').value=Number(m?.qtd_sargentos||0);$('missionQtyCb').value=Number(m?.qtd_cabos||0);$('missionQtySd').value=Number(m?.qtd_soldados||0);$('missionDescription').value=m?.descricao||'';updateLaneLabel();modal('missionModal')}
function updateLaneLabel(){const d=$('missionStart').value;$('missionLaneLabel').value=d?`Escala ${laneName(d)}`:'Definido pela data de início'}
async function saveMission(e){e.preventDefault();const r=await supabaseClient.rpc('v7_4_salvar_missao',{p_missao_id:Number($('missionId').value)||null,p_titulo:$('missionTitle').value.trim(),p_data_inicio:$('missionStart').value,p_data_fim:$('missionEnd').value,p_local:$('missionPlace').value.trim()||null,p_descricao:$('missionDescription').value.trim()||null,p_dispensas_por_pessoa:Number($('missionDispensas').value)||0,p_qtd_sargentos:Number($('missionQtySgt').value)||0,p_qtd_cabos:Number($('missionQtyCb').value)||0,p_qtd_soldados:Number($('missionQtySd').value)||0,p_usuario_id:Number(user.id),p_perfil_id:pid()});if(r.error)return alert(r.error.message);modal('missionModal',false);await load();selected=missions.find(x=>String(x.id)===String(r.data))||null;if(selected)renderDetail()}
async function deleteMission(){if(!selected||!confirm('Excluir esta missão e seus participantes?'))return;const r=await supabaseClient.rpc('v7_2_excluir_missao',{p_missao_id:selected.id,p_usuario_id:Number(user.id),p_perfil_id:pid()});if(r.error)return alert(r.error.message);selected=null;$('missionDetail').hidden=true;$('missionEmpty').hidden=false;await load()}
async function addParticipant(){if(!selected)return;const g=$('partGroup').value,counts=groupCounts(selected,g);if(counts.actual>=counts.required)return alert('A quantidade prevista para este grupo já foi preenchida.');const val=$('partPerson').value;if(!val)return alert('Selecione o militar.');const [kind,id]=val.split(':');const r=await supabaseClient.rpc('v7_4_adicionar_participante_missao',{p_missao_id:selected.id,p_grupo:g,p_usuario_alvo_id:kind==='u'?Number(id):null,p_pessoa_externa_id:kind==='e'?Number(id):null,p_usuario_id:Number(user.id),p_perfil_id:pid()});if(r.error)return alert(r.error.message);await load();selected=missions.find(x=>String(x.id)===String(selected.id));renderDetail()}
async function removeParticipant(id){const r=await supabaseClient.rpc('v7_2_remover_participante_missao',{p_participante_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:pid()});if(r.error)return alert(r.error.message);await load();selected=missions.find(x=>String(x.id)===String(selected.id));renderDetail()}

function toggleMemberMode(){const ext=$('missionMemberMode').value==='externo';$('missionMemberSystemField').hidden=ext;$('missionMemberExternalNameField').hidden=!ext;$('missionMemberExternalRankField').hidden=!ext}
function renderMembers(){const g=$('missionMemberGroup').value||'sargento',rows=members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100));$('missionMembersList').innerHTML=rows.length?rows.map(x=>`<div class="v7-list-row"><div class="v74-list-person"><div><b>${esc(personName(x))}${cnhBadge(x)}</b><div class="v7-mini">Ordem ${x.ordem||100} · ${esc(qualText(x))}</div></div></div><button class="v7-btn danger" data-rm-mission-member="${x.id}">Remover</button></div>`).join(''):'<div class="v7-empty">Nenhuma pessoa neste grupo.</div>'}
async function addMissionMember(){const g=$('missionMemberGroup').value,ordem=Number($('missionMemberOrder').value)||100,mode=$('missionMemberMode').value;let r;if(mode==='externo'){const nome=$('missionMemberExternalName').value.trim();if(!nome)return alert('Informe o nome.');r=await supabaseClient.rpc('v7_4_adicionar_integrante_externo_missao',{p_grupo:g,p_nome:nome,p_patente:$('missionMemberExternalRank').value.trim()||null,p_ordem:ordem,p_usuario_id:Number(user.id),p_perfil_id:pid()})}else{const uid=Number($('missionMemberUser').value);if(!uid)return alert('Selecione um usuário.');r=await supabaseClient.rpc('v7_4_adicionar_integrante_missao',{p_grupo:g,p_usuario_alvo_id:uid,p_pessoa_externa_id:null,p_ordem:ordem,p_usuario_id:Number(user.id),p_perfil_id:pid()})}if(r.error)return alert(r.error.message);$('missionMemberExternalName').value='';$('missionMemberExternalRank').value='';await loadPeople();await load()}
async function removeMissionMember(id){if(!confirm('Remover esta pessoa da Escala de Missão? O histórico das missões permanece.'))return;const r=await supabaseClient.rpc('v7_4_remover_integrante_missao',{p_integrante_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:pid()});if(r.error)return alert(r.error.message);await load()}
function month(delta){view=new Date(view.getFullYear(),view.getMonth()+delta,1);selected=null;load().catch(e=>alert(e.message))}
function bind(){
 $('prevMonth').onclick=()=>month(-1);$('nextMonth').onclick=()=>month(1);$('todayMonth').onclick=()=>{view=new Date();selected=null;load().catch(e=>alert(e.message))};$('newMission').onclick=()=>openMission();$('manageMissionMembers').onclick=()=>{renderMembers();modal('missionMembersModal')};$('missionForm').onsubmit=saveMission;$('missionStart').onchange=updateLaneLabel;$('missionList').onclick=e=>{const c=e.target.closest('[data-mission]');if(c){selected=missions.find(x=>String(x.id)===String(c.dataset.mission));renderAll();renderDetail()}};$('missionMemberGroup').onchange=renderMembers;$('missionMemberMode').onchange=toggleMemberMode;$('addMissionMember').onclick=addMissionMember;$('missionMembersList').onclick=e=>{const b=e.target.closest('[data-rm-mission-member]');if(b)removeMissionMember(b.dataset.rmMissionMember)};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal(b.dataset.close,false));document.querySelectorAll('.v7-modal-bg').forEach(bg=>bg.onclick=e=>{if(e.target===bg)bg.classList.remove('open')});toggleMemberMode();
}
function realtime(){try{supabaseClient.channel('v74-missoes').on('postgres_changes',{event:'*',schema:'public',table:'missoes_escala'},()=>load()).on('postgres_changes',{event:'*',schema:'public',table:'missao_participantes'},()=>load()).on('postgres_changes',{event:'*',schema:'public',table:'missao_escala_integrantes'},()=>load()).on('postgres_changes',{event:'*',schema:'public',table:'pessoal_qualificacoes'},async()=>{await loadPeople();await load()}).on('postgres_changes',{event:'*',schema:'public',table:'pessoal_ferias'},()=>load()).on('postgres_changes',{event:'*',schema:'public',table:'escala_feriados'},()=>load()).on('postgres_changes',{event:'*',schema:'public',table:'escala_alteracoes'},()=>load()).subscribe()}catch(_){}}
(async()=>{if(!await initUser())return;bind();await loadPeople();await load();realtime()})().catch(e=>{console.error(e);alert('Erro ao abrir a Escala de missão V7.4: '+e.message)});
})();
