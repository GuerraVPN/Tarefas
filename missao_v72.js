(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
let user=null,canManage=false,view=new Date(),users=new Map(),externals=new Map(),missions=[],participants=[],changes=[],selected=null;

function pid(){return user?.perfil_id?Number(user.perfil_id):null}
function dt(v){return v?new Date(v).toLocaleString('pt-BR'):'-'}
function br(v){return v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-'}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function range(){const y=view.getFullYear(),m=view.getMonth();return{ini:iso(new Date(y,m,1)),fim:iso(new Date(y,m+1,0))}}
function actorName(id){const u=users.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`}
function extName(id){const x=externals.get(String(id));return x?[x.patente,x.nome].filter(Boolean).join(' '):`Nome externo ${id}`}
function personName(p){return p.usuario_id?actorName(p.usuario_id):extName(p.pessoa_externa_id)}
function peopleFor(mid){return participants.filter(x=>String(x.missao_id)===String(mid))}
function days(m){const a=new Date(m.data_inicio+'T12:00:00'),b=new Date(m.data_fim+'T12:00:00');return Math.max(1,Math.round((b-a)/86400000)+1)}
function totalDisp(m){return peopleFor(m.id).length*Number(m.dispensas_por_pessoa||0)}
function modal(id,on=true){$(id)?.classList.toggle('open',on)}
function missionState(m){
 const today=iso(new Date());
 if(m.data_fim<today)return 'Finalizada';
 if(m.data_inicio<=today&&m.data_fim>=today)return 'Em andamento';
 return 'Planejada';
}
async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 user=base;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);if(p?.usuario)user=p.usuario}catch(_){}}
 const r=await supabaseClient.rpc('v7_2_pode_gerenciar_pessoal',{p_usuario_id:Number(user.id),p_perfil_id:pid()});
 canManage=!r.error&&r.data===true;$('newMission').hidden=!canManage;return true;
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
 const rg=range();
 const [m,c]=await Promise.all([
  supabaseClient.from('missoes_escala').select('*').lte('data_inicio',rg.fim).gte('data_fim',rg.ini).order('data_inicio').order('id'),
  supabaseClient.from('escala_alteracoes').select('*').eq('modulo','missao').order('criado_em',{ascending:false}).limit(30)
 ]);
 if(m.error)throw m.error;if(c.error)throw c.error;
 missions=m.data||[];changes=c.data||[];
 const ids=missions.map(x=>x.id);
 if(ids.length){
  const p=await supabaseClient.from('missao_participantes').select('*').in('missao_id',ids).order('id');
  if(p.error)throw p.error;participants=p.data||[];
 }else participants=[];
 renderAll();
 if(selected){
  const fresh=missions.find(x=>String(x.id)===String(selected.id));
  if(fresh){selected=fresh;renderDetail()}else{selected=null;$('missionDetail').hidden=true;$('missionEmpty').hidden=false}
 }
}
function renderAll(){
 $('monthLabel').textContent=view.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
 $('missionCount').textContent=`${missions.length} registro(s)`;
 $('missionList').innerHTML=missions.length?missions.map(m=>`<article class="v72-mission-card ${selected&&String(selected.id)===String(m.id)?'active':''}" data-mission="${m.id}">
  <div class="v72-mission-top"><div><h4>${esc(m.titulo)}</h4><p>${br(m.data_inicio)} → ${br(m.data_fim)}${m.local?' · '+esc(m.local):''}</p></div><span class="v72-badge">${missionState(m)}</span></div>
  <p><b>${peopleFor(m.id).length}</b> pessoa(s) · <b>${fmt(totalDisp(m))}</b> dispensa(s) previstas · ${days(m)} dia(s)</p>
  <p>Alterado por ${esc(actorName(m.atualizado_por||m.criado_por))} · ${dt(m.atualizado_em||m.criado_em)}</p>
 </article>`).join(''):'<div class="v7-empty">Nenhuma missão neste mês.</div>';
 $('sumMissions').textContent=missions.length;
 $('sumMissionPeople').textContent=participants.length;
 $('sumMissionDays').textContent=missions.reduce((n,m)=>n+days(m),0);
 $('sumDispensas').textContent=fmt(missions.reduce((n,m)=>n+totalDisp(m),0));
 $('missionChangesCount').textContent=`${changes.length} registro(s)`;
 $('missionChanges').innerHTML=changes.length?changes.map(x=>`<div class="v72-change-row"><div><b>${esc(x.acao)}</b><small>${esc(x.detalhes||'')}</small></div><div style="text-align:right"><b>${esc(actorName(x.usuario_id))}</b><small>${dt(x.criado_em)}</small></div></div>`).join(''):'<div class="v7-empty">Nenhuma alteração registrada.</div>';
}
function fmt(n){n=Number(n||0);return Number.isInteger(n)?String(n):n.toFixed(1).replace('.',',')}
function renderDetail(){
 if(!selected)return;
 const list=peopleFor(selected.id);
 $('missionEmpty').hidden=true;$('missionDetail').hidden=false;
 $('missionDetail').innerHTML=`<div class="v72-mission-top"><div><h3 style="margin:0">${esc(selected.titulo)}</h3><div class="v7-mini">${br(selected.data_inicio)} → ${br(selected.data_fim)} · ${days(selected)} dia(s)</div></div><div class="v72-toolbar-line">${canManage?'<button class="v7-btn" data-edit>Editar</button><button class="v7-btn danger" data-delete>Excluir</button>':''}</div></div>
 <div class="v72-mission-meta">
  <div><small>Local</small><b>${esc(selected.local||'-')}</b></div>
  <div><small>Participantes</small><b>${list.length}</b></div>
  <div><small>Dispensas por pessoa</small><b>${fmt(selected.dispensas_por_pessoa)}</b></div>
  <div><small>Dispensas previstas</small><b>${fmt(totalDisp(selected))}</b></div>
 </div>
 <div class="v7-note">${esc(selected.descricao||'Sem observações.')}</div>
 ${canManage?participantForm():''}
 <div style="margin-top:10px"><b style="font-size:10px">Pessoas na missão</b><div class="v72-participants">${list.length?list.map(p=>`<div class="v72-participant"><span>${esc(personName(p))}${p.pessoa_externa_id?'<span class="v72-external-tag">SEM CONTA</span>':''}</span>${canManage?`<button class="v7-btn danger" data-rm-participant="${p.id}">Remover</button>`:''}</div>`).join(''):'<div class="v7-empty">Nenhuma pessoa adicionada.</div>'}</div></div>
 <div class="v72-last-change" style="margin-top:10px">Última alteração por ${esc(actorName(selected.atualizado_por||selected.criado_por))} em ${dt(selected.atualizado_em||selected.criado_em)}.</div>`;
 wireDetail();
}
function participantForm(){
 return `<div class="v7-panel" style="margin-top:9px;padding:9px"><div class="v72-toolbar-line">
  <select id="partMode" class="v7-btn"><option value="sistema">Usuário do sistema</option><option value="externo">Nome sem usuário</option></select>
  <select id="partUser" class="v7-btn" style="min-width:220px">${[...users.values()].map(u=>`<option value="${u.id}">${esc(actorName(u.id))} — ${esc(u.secao||'-')}</option>`).join('')}</select>
  <input id="partExternalName" class="v7-btn" style="min-width:180px" maxlength="120" placeholder="Nome" hidden>
  <input id="partExternalRank" class="v7-btn" style="width:115px" maxlength="40" placeholder="Posto/Grad." hidden>
  <button id="addParticipant" class="v7-btn primary">Adicionar</button>
 </div></div>`;
}
function wireDetail(){
 $('missionDetail').querySelector('[data-edit]')?.addEventListener('click',()=>openMission(selected));
 $('missionDetail').querySelector('[data-delete]')?.addEventListener('click',deleteMission);
 $('missionDetail').querySelectorAll('[data-rm-participant]').forEach(b=>b.onclick=()=>removeParticipant(b.dataset.rmParticipant));
 const mode=$('partMode');if(mode){
  mode.onchange=()=>{
   const ext=mode.value==='externo';$('partUser').hidden=ext;$('partExternalName').hidden=!ext;$('partExternalRank').hidden=!ext;
  };
  $('addParticipant').onclick=addParticipant;
 }
}
function openMission(m=null){
 $('missionForm').reset();$('missionId').value=m?.id||'';$('missionModalTitle').textContent=m?'Editar missão':'Nova missão';
 $('missionTitle').value=m?.titulo||'';$('missionStart').value=m?.data_inicio||iso(new Date());
 $('missionEnd').value=m?.data_fim||$('missionStart').value;$('missionPlace').value=m?.local||'';
 $('missionDispensas').value=Number(m?.dispensas_por_pessoa||0);$('missionDescription').value=m?.descricao||'';modal('missionModal');
}
async function saveMission(e){
 e.preventDefault();
 const r=await supabaseClient.rpc('v7_2_salvar_missao',{
  p_missao_id:Number($('missionId').value)||null,p_titulo:$('missionTitle').value.trim(),
  p_data_inicio:$('missionStart').value,p_data_fim:$('missionEnd').value,p_local:$('missionPlace').value.trim()||null,
  p_descricao:$('missionDescription').value.trim()||null,p_dispensas_por_pessoa:Number($('missionDispensas').value)||0,
  p_usuario_id:Number(user.id),p_perfil_id:pid()
 });
 if(r.error)return alert(r.error.message);modal('missionModal',false);await load();selected=missions.find(x=>String(x.id)===String(r.data))||null;if(selected)renderDetail();
}
async function deleteMission(){
 if(!selected||!confirm('Excluir esta missão e seus participantes?'))return;
 const r=await supabaseClient.rpc('v7_2_excluir_missao',{p_missao_id:selected.id,p_usuario_id:Number(user.id),p_perfil_id:pid()});
 if(r.error)return alert(r.error.message);selected=null;$('missionDetail').hidden=true;$('missionEmpty').hidden=false;await load();
}
async function addParticipant(){
 if(!selected)return;
 let r;
 if($('partMode').value==='externo'){
  const nome=$('partExternalName').value.trim();if(!nome)return alert('Informe o nome.');
  r=await supabaseClient.rpc('v7_2_adicionar_participante_externo_missao',{
   p_missao_id:selected.id,p_nome:nome,p_patente:$('partExternalRank').value.trim()||null,p_usuario_id:Number(user.id),p_perfil_id:pid()
  });
 }else{
  const uid=Number($('partUser').value);if(!uid)return;
  r=await supabaseClient.rpc('v7_2_adicionar_participante_missao',{
   p_missao_id:selected.id,p_usuario_alvo_id:uid,p_pessoa_externa_id:null,p_usuario_id:Number(user.id),p_perfil_id:pid()
  });
 }
 if(r.error)return alert(r.error.message);await Promise.all([loadPeople(),load()]);selected=missions.find(x=>String(x.id)===String(selected.id));renderDetail();
}
async function removeParticipant(id){
 const r=await supabaseClient.rpc('v7_2_remover_participante_missao',{p_participante_id:Number(id),p_usuario_id:Number(user.id),p_perfil_id:pid()});
 if(r.error)return alert(r.error.message);await load();selected=missions.find(x=>String(x.id)===String(selected.id));renderDetail();
}
function month(delta){view=new Date(view.getFullYear(),view.getMonth()+delta,1);selected=null;load().catch(e=>alert(e.message))}
function bind(){
 $('prevMonth').onclick=()=>month(-1);$('nextMonth').onclick=()=>month(1);$('todayMonth').onclick=()=>{view=new Date();selected=null;load().catch(e=>alert(e.message))};
 $('newMission').onclick=()=>openMission();$('missionForm').onsubmit=saveMission;
 $('missionList').onclick=e=>{const c=e.target.closest('[data-mission]');if(c){selected=missions.find(x=>String(x.id)===String(c.dataset.mission));renderAll();renderDetail()}};
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal(b.dataset.close,false));
 document.querySelectorAll('.v7-modal-bg').forEach(bg=>bg.onclick=e=>{if(e.target===bg)bg.classList.remove('open')});
}
function realtime(){
 try{
  supabaseClient.channel('v72-missoes')
   .on('postgres_changes',{event:'*',schema:'public',table:'missoes_escala'},()=>load())
   .on('postgres_changes',{event:'*',schema:'public',table:'missao_participantes'},()=>load())
   .on('postgres_changes',{event:'*',schema:'public',table:'escala_alteracoes'},()=>load())
   .subscribe();
 }catch(_){}
}
(async()=>{if(!await initUser())return;bind();await loadPeople();await load();realtime()})().catch(e=>{console.error(e);alert('Erro ao abrir a Escala de missão: '+e.message)});
})();