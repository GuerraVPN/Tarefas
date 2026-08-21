(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const dt=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
const dateBR=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-';
let user=null,canManage=false,passagens=[],dependencias=[],detentores=[],users=new Map(),perfis=[],selected=null,anexos=[],updates=[];

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function safeName(v){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_')}
function toast(msg){const e=$('orcToast');if(!e)return;e.textContent=msg;e.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>e.classList.remove('show'),2500)}
function uname(id){const u=users.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):id?`Usuário ${id}`:'Não definido'}
function detentor(dep){return detentores.find(x=>x.dependencia===dep)||null}
function statusLabel(s){return ({em_andamento:'Em andamento',concluida:'Concluída',cancelada:'Cancelada'}[s]||s)}
function statusClass(s){return s==='concluida'?'ok':s==='cancelada'?'return':'wait'}
async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 user=base;if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);user=p.usuario}catch(_){}}
 const s=norm(user.secao),p=norm(user.posicao);canManage=s==='admin'||(s==='fiscalizacao'&&['chefe','auxiliar'].includes(p));
 return true;
}
async function loadRefs(){
 const [d,h,u,p]=await Promise.all([
   supabaseClient.from('orc_dependencias').select('nome').eq('ativo',true).order('ordem'),
   supabaseClient.from('orc_detentores_carga').select('*').order('dependencia'),
   supabaseClient.from('usuarios').select('id,patente,nome_guerra,ativo'),
   supabaseClient.from('usuario_perfis').select('id,usuario_id,secao,posicao,ativo').eq('ativo',true).order('id')
 ]);
 if(d.error)throw d.error;dependencias=(d.data||[]).map(x=>x.nome);
 detentores=h.error?[]:(h.data||[]);users=new Map((u.error?[]:(u.data||[])).filter(x=>x.ativo!==false).map(x=>[String(x.id),x]));
 perfis=p.error?[]:(p.data||[]).filter(x=>users.has(String(x.usuario_id)));
 const depOpts='<option value="">Selecione...</option>'+dependencias.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');$('pgDependenciaNew').innerHTML=depOpts;
 $('pgNovoPerfil').innerHTML='<option value="">Selecione o novo detentor...</option>'+perfis.map(x=>`<option value="${x.id}" data-user="${esc(x.usuario_id)}">${esc(uname(x.usuario_id))} — ${esc(x.secao||'-')} / ${esc(x.posicao||'-')}</option>`).join('');
}
async function loadPassagens(){
 const r=await supabaseClient.from('orc_passagens_carga').select('*').order('data_passagem',{ascending:false}).order('id',{ascending:false}).limit(500);
 if(r.error)throw r.error;passagens=r.data||[];renderList();
}
function filtered(){
 let a=passagens.slice(),q=norm($('passagemSearch').value),s=$('passagemStatus').value,d=$('passagemDate').value;
 if(s)a=a.filter(x=>x.status===s);if(d)a=a.filter(x=>x.data_passagem===d);
 if(q)a=a.filter(x=>norm(`${x.dependencia} ${uname(x.detentor_anterior_usuario_id)} ${uname(x.novo_detentor_usuario_id)}`).includes(q));return a;
}
function renderList(){
 const a=filtered();$('passagemListInfo').textContent=`${a.length} registro(s)`;
 if(!a.length){$('passagemList').innerHTML='<div class="orc-empty">Nenhuma passagem encontrada.</div>';return}
 const groups=new Map();a.forEach(x=>{const k=x.data_passagem||'sem-data';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(x)});let h='';
 for(const [d,list] of groups){h+=`<div class="orc-date">${d==='sem-data'?'Sem data':dateBR(d)} (${list.length})</div>`;h+=list.map(x=>`<article class="pedido-card ${selected&&String(selected.id)===String(x.id)?'active':''}" data-pg-id="${x.id}"><div class="pedido-card-top"><strong>${esc(x.dependencia)}</strong><span class="pedido-status ${statusClass(x.status)}">${esc(statusLabel(x.status))}</span></div><p>${esc(uname(x.detentor_anterior_usuario_id))} → ${esc(uname(x.novo_detentor_usuario_id))}</p></article>`).join('')}
 $('passagemList').innerHTML=h;
}
async function loadDetail(id){
 const [a,u]=await Promise.all([
   supabaseClient.from('orc_passagem_carga_anexos').select('*').eq('passagem_id',id).order('criado_em',{ascending:false}).order('id',{ascending:false}),
   supabaseClient.from('orc_passagem_carga_atualizacoes').select('*').eq('passagem_id',id).order('criado_em',{ascending:false}).order('id',{ascending:false})
 ]);
 if(a.error)throw a.error;if(u.error)throw u.error;anexos=a.data||[];updates=u.data||[];
}
async function selectPassagem(id){selected=passagens.find(x=>String(x.id)===String(id));if(!selected)return;await loadDetail(selected.id);renderList();renderDetail()}
function renderDetail(){
 $('passagemDetailEmpty').hidden=true;$('passagemDetail').hidden=false;
 $('pgTitle').textContent=`Passagem · ${selected.dependencia}`;$('pgSubtitle').textContent=`Criada em ${dt(selected.criado_em)}`;
 $('pgStatus').textContent=statusLabel(selected.status);$('pgStatus').className=`pedido-status ${statusClass(selected.status)}`;$('pgStatusText').textContent=statusLabel(selected.status);
 $('pgData').textContent=dateBR(selected.data_passagem);$('pgDependencia').textContent=selected.dependencia;$('pgAnterior').textContent=uname(selected.detentor_anterior_usuario_id);$('pgNovo').textContent=uname(selected.novo_detentor_usuario_id);$('pgObs').textContent=selected.observacoes||'-';
 $('pgAttachCount').textContent=`${anexos.length} arquivo(s)`;$('pgAttachList').innerHTML=anexos.length?anexos.map(a=>`<div class="orc-note" style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px"><div><b>${esc(a.arquivo_nome)}</b><br><span style="font-size:8px;color:var(--v4-muted)">${dt(a.criado_em)}</span></div><div style="display:flex;gap:5px"><button class="orc-btn" data-pg-open="${a.id}">Abrir</button><button class="orc-btn" data-pg-down="${a.id}">Baixar</button></div></div>`).join(''):'<div class="orc-empty">Nenhum arquivo.</div>';
 $('pgUpdateCount').textContent=`${updates.length} registro(s)`;$('pgHistory').innerHTML=updates.length?updates.map(x=>`<div class="pedido-hitem"><strong>${esc(uname(x.usuario_id))}</strong><p>${esc(x.mensagem)}</p><small>${dt(x.criado_em)}</small></div>`).join(''):'<div class="orc-empty">Sem atualizações.</div>';
 $('pgAdminActions').hidden=!(canManage&&selected.status==='em_andamento');$('pgFiles').disabled=selected.status!=='em_andamento';$('btnPgFiles').disabled=selected.status!=='em_andamento';
}
function currentHolderText(dep){const h=detentor(dep);return h?`${uname(h.usuario_id)}${h.desde?' · desde '+dateBR(h.desde):''}`:'Não definido'}
function openNew(){if(!canManage)return;$('newPassagemForm').reset();$('pgDataNew').value=new Date().toISOString().slice(0,10);const q=new URLSearchParams(location.search).get('dependencia');if(q&&dependencias.includes(q))$('pgDependenciaNew').value=q;syncCurrent();$('newPassagemBg').classList.add('open')}
function syncCurrent(){$('pgAtualNew').value=currentHolderText($('pgDependenciaNew').value)}
async function uploadFile(file,passagemId,note){
 if(file.size>30*1024*1024)throw new Error(`${file.name}: arquivo maior que 30 MB.`);const path=`passagens/${passagemId}/${Date.now()}_${Math.random().toString(36).slice(2,6)}_${safeName(file.name)}`;
 const up=await supabaseClient.storage.from('passagens-carga').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});if(up.error)throw up.error;
 const pub=supabaseClient.storage.from('passagens-carga').getPublicUrl(path);const r=await supabaseClient.from('orc_passagem_carga_anexos').insert([{passagem_id:passagemId,arquivo_nome:file.name,arquivo_path:path,arquivo_url:pub.data.publicUrl,arquivo_mime:file.type||null,arquivo_tamanho:file.size,observacao:note||null,enviado_por:String(user.id),enviado_por_perfil_id:profileId()}]);if(r.error){await supabaseClient.storage.from('passagens-carga').remove([path]);throw r.error}
}
async function create(e){
 e.preventDefault();const opt=$('pgNovoPerfil').selectedOptions[0];if(!opt?.value)return alert('Selecione o novo detentor.');const novoUser=opt.dataset.user;if(currentHolderText($('pgDependenciaNew').value).startsWith(uname(novoUser)))return alert('O novo detentor já é o detentor atual desta dependência.');
 const btn=$('savePassagem');btn.disabled=true;try{const r=await supabaseClient.rpc('v6_criar_passagem_carga',{p_dependencia:$('pgDependenciaNew').value,p_data_passagem:$('pgDataNew').value,p_novo_usuario_id:String(novoUser),p_novo_perfil_id:Number(opt.value),p_observacoes:$('pgObsNew').value.trim()||null,p_usuario_id:String(user.id),p_perfil_id:profileId()});if(r.error)throw r.error;const id=Number(r.data);for(const f of [...$('pgFilesNew').files])await uploadFile(f,id,'Arquivo anexado na criação da passagem.');$('newPassagemBg').classList.remove('open');toast('Passagem de carga criada.');await loadPassagens();await selectPassagem(id)}catch(err){alert('Erro ao criar passagem: '+err.message)}finally{btn.disabled=false}}
async function addFiles(){if(!selected||selected.status!=='em_andamento')return;const fs=[...$('pgFiles').files];if(!fs.length)return alert('Selecione um arquivo.');try{for(const f of fs)await uploadFile(f,selected.id,$('pgAttachNote').value.trim()||null);$('pgFiles').value='';$('pgAttachNote').value='';toast('Arquivo(s) anexado(s).');await loadDetail(selected.id);renderDetail()}catch(err){alert('Erro ao anexar: '+err.message)}}
async function addUpdate(){if(!selected)return;const text=$('pgUpdateText').value.trim();if(!text)return alert('Digite a atualização.');const r=await supabaseClient.rpc('v6_atualizar_passagem_carga',{p_passagem_id:selected.id,p_mensagem:text,p_usuario_id:String(user.id),p_perfil_id:profileId()});if(r.error)return alert(r.error.message);$('pgUpdateText').value='';toast('Atualização registrada.');await loadDetail(selected.id);renderDetail()}
async function conclude(){if(!selected||!canManage)return;if(!confirm('Concluir a passagem e tornar o novo detentor o detentor atual da carga?'))return;const r=await supabaseClient.rpc('v6_concluir_passagem_carga',{p_passagem_id:selected.id,p_usuario_id:String(user.id),p_perfil_id:profileId()});if(r.error)return alert(r.error.message);toast('Passagem concluída. Detentor atualizado.');await Promise.all([loadPassagens(),loadRefs()]);await selectPassagem(selected.id)}
async function cancel(){if(!selected||!canManage)return;const motivo=$('pgActionNote').value.trim();if(!motivo)return alert('Informe o motivo do cancelamento.');const r=await supabaseClient.rpc('v6_cancelar_passagem_carga',{p_passagem_id:selected.id,p_motivo:motivo,p_usuario_id:String(user.id),p_perfil_id:profileId()});if(r.error)return alert(r.error.message);$('pgActionNote').value='';toast('Passagem cancelada.');await loadPassagens();await selectPassagem(selected.id)}
function switchToPassagem(){document.querySelectorAll('[data-orc-module]').forEach(b=>b.classList.toggle('active',b.dataset.orcModule==='passagem_carga'));if($('reportModule'))$('reportModule').hidden=true;$('guiasModule').hidden=true;$('pedidosModule').hidden=true;$('movimentacaoModule').hidden=true;$('materialCargaModule').hidden=true;$('passagemCargaModule').hidden=false;$('orcPageTitle').textContent='Orçamentários · Passagem de Carga';$('orcPageSubtitle').textContent='Histórico dos detentores atuais e transferência formal de carga por dependência.';$('btnNovaPassagem').hidden=!canManage;renderList()}
function bind(){
 $('orcModuleNav').addEventListener('click',e=>{const b=e.target.closest('[data-orc-module="passagem_carga"]');if(b)switchToPassagem()});$('btnNovaPassagem').onclick=openNew;$('closePassagem').onclick=$('cancelPassagem').onclick=()=>$('newPassagemBg').classList.remove('open');$('newPassagemBg').onclick=e=>{if(e.target===$('newPassagemBg'))$('newPassagemBg').classList.remove('open')};$('pgDependenciaNew').onchange=syncCurrent;$('newPassagemForm').onsubmit=create;
 ['passagemSearch','passagemStatus','passagemDate'].forEach(id=>$(id).addEventListener(id==='passagemSearch'?'input':'change',renderList));$('passagemList').onclick=e=>{const c=e.target.closest('[data-pg-id]');if(c)selectPassagem(c.dataset.pgId)};$('btnPgFiles').onclick=addFiles;$('btnPgUpdate').onclick=addUpdate;$('btnPgConcluir').onclick=conclude;$('btnPgCancelar').onclick=cancel;$('pgAttachList').onclick=e=>{const o=e.target.closest('[data-pg-open]'),d=e.target.closest('[data-pg-down]');const id=o?.dataset.pgOpen||d?.dataset.pgDown;if(!id)return;const a=anexos.find(x=>String(x.id)===String(id));if(!a)return;if(o)window.open(a.arquivo_url,'_blank','noopener');else{const l=document.createElement('a');l.href=a.arquivo_url;l.download=a.arquivo_nome;l.target='_blank';l.click()}};
}
async function start(){if(!await initUser())return;bind();await Promise.all([loadRefs(),loadPassagens()]);const p=new URLSearchParams(location.search);if(p.get('modulo')==='passagem_carga'||p.get('passagem')){switchToPassagem();if(p.get('passagem')&&passagens.some(x=>String(x.id)===String(p.get('passagem'))))await selectPassagem(p.get('passagem'))}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
