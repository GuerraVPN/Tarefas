(function(){
'use strict';

const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const dateBR=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'-';
const dtBR=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);

let user=null,isAdmin=false;
let dependencias=['1ª Seção','3ª Seção','4ª Seção','SALC','Garagem','Reserva de Armamento','Reserva de Materiais','Canil'];
let movs=[],items=[],attachments=[],history=[],selected=null,selectedItems=[],selectedAttachments=[];
let editingMovId=null;
let usersMap=new Map();

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function canManage(m){return !!(m&&(String(m.criado_por)===String(user?.id)||isAdmin))}
function safeName(v){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_')}
function toast(msg){const el=$('orcToast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2500)}
function userName(id){const u=usersMap.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):`Usuário ${id||'-'}`}
async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');
 if(!base?.id)return false;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);user=p.usuario}catch(_){user=base}}else user=base;
 isAdmin=norm(user.secao)==='admin';
 return true;
}
async function loadRefs(){
 try{
   const r=await supabaseClient.from('orc_dependencias').select('nome').eq('ativo',true).order('ordem');
   if(!r.error&&r.data?.length)dependencias=r.data.map(x=>x.nome);
 }catch(_){}
 const opts='<option value="">Selecione...</option>'+dependencias.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
 $('mOrigem').innerHTML=opts;$('mDestino').innerHTML=opts;
 $('movDependenciaFilter').innerHTML='<option value="">Todas as dependências</option>'+dependencias.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
}
async function loadUsers(){
 const r=await supabaseClient.from('usuarios').select('id,patente,nome_guerra');
 if(!r.error)(r.data||[]).forEach(x=>usersMap.set(String(x.id),x));
}
async function loadAll(){
 const [m,i]=await Promise.all([
   supabaseClient.from('movimentacoes_material').select('*').order('data_movimentacao',{ascending:false}).order('id',{ascending:false}).limit(1000),
   supabaseClient.from('movimentacao_material_itens').select('*').order('id',{ascending:true}).limit(10000)
 ]);
 if(m.error){$('movList').innerHTML=`<div class="orc-empty">Erro ao carregar movimentações:<br>${esc(m.error.message)}</div>`;return}
 movs=m.data||[];items=i.error?[]:(i.data||[]);renderList();
 const id=new URLSearchParams(location.search).get('movimentacao');
 if(id&&movs.some(x=>String(x.id)===String(id)))selectMov(id);
}
function its(id){return items.filter(x=>String(x.movimentacao_id)===String(id))}
function filtered(){
 let arr=movs.slice();
 const q=norm($('movSearch').value),dep=$('movDependenciaFilter').value,date=$('movDateFilter').value;
 if(dep)arr=arr.filter(x=>x.dependencia_origem===dep||x.dependencia_destino===dep);
 if(date)arr=arr.filter(x=>x.data_movimentacao===date);
 if(q)arr=arr.filter(x=>norm(`${x.numero} ${x.dependencia_origem} ${x.dependencia_destino} ${x.finalidade} ${its(x.id).map(i=>`${i.nome} ${i.numero_ficha} ${i.patrimonio||''}`).join(' ')}`).includes(q));
 return arr;
}
function renderList(){
 const arr=filtered();$('movListInfo').textContent=`${arr.length} movimentação(ões)`;
 if(!arr.length){$('movList').innerHTML='<div class="orc-empty">Nenhuma movimentação encontrada.</div>';return}
 const groups=new Map();arr.forEach(m=>{const k=m.data_movimentacao||'sem-data';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(m)});
 let h='';
 for(const [d,list] of groups){
   h+=`<div class="orc-date">${d==='sem-data'?'Sem data':dateBR(d)} (${list.length})</div>`;
   h+=list.map(m=>`<article class="pedido-card ${selected&&String(selected.id)===String(m.id)?'active':''}" data-mov-id="${m.id}">
     <div class="pedido-card-top"><strong>${esc(m.numero)}</strong><span class="pedido-status info">Movimentação</span></div>
     <p>${esc(m.dependencia_origem)} → ${esc(m.dependencia_destino)} · ${its(m.id).length} material(is)<br>Total: ${esc(money(m.valor_total))}</p>
   </article>`).join('');
 }
 $('movList').innerHTML=h;
}
async function loadDetailData(id){
 const [a,h]=await Promise.all([
   supabaseClient.from('movimentacao_material_anexos').select('*').eq('movimentacao_id',id).order('criado_em',{ascending:false}).order('id',{ascending:false}),
   supabaseClient.from('movimentacao_material_tramitacoes').select('*').eq('movimentacao_id',id).order('criado_em',{ascending:false}).order('id',{ascending:false})
 ]);
 if(a.error)throw a.error;if(h.error)throw h.error;
 selectedAttachments=a.data||[];history=h.data||[];
}
async function selectMov(id){
 selected=movs.find(x=>String(x.id)===String(id));if(!selected)return;
 selectedItems=its(selected.id);await loadDetailData(selected.id);renderList();renderDetail();
}
function renderDetail(){
 $('movDetailEmpty').hidden=true;$('movDetail').hidden=false;
 $('mdTitle').textContent=`Movimentação ${selected.numero}`;
 $('mdSubtitle').textContent=`Criada por ${userName(selected.criado_por)} · ${dtBR(selected.criado_em)}`;
 $('mdData').textContent=dateBR(selected.data_movimentacao);
 $('mdOrigem').textContent=selected.dependencia_origem;
 $('mdDestino').textContent=selected.dependencia_destino;
 $('mdFinalidade').textContent=selected.finalidade;
 $('mdObservacoes').textContent=selected.observacoes||'-';
 $('mdTotal').textContent=money(selected.valor_total);
 $('btnEditMov').hidden=!canManage(selected);$('btnDeleteMov').hidden=!canManage(selected);
 renderItems();renderAttachments();renderHistory();
}
function renderItems(){
 $('mdItemsCount').textContent=`${selectedItems.length} item(ns)`;
 $('mdItemsBody').innerHTML=selectedItems.map(i=>`<tr><td>${esc(i.nome)}</td><td>${esc(i.numero_ficha)}</td><td>${esc(i.patrimonio||'-')}</td><td class="num">${esc(i.quantidade)}</td><td class="num">${esc(money(i.valor_unitario))}</td><td class="num"><b>${esc(money(i.valor_total))}</b></td></tr>`).join('');
 $('mdItemsTotal').textContent=money(selected.valor_total);
}
function renderAttachments(){
 $('mdAttachCount').textContent=`${selectedAttachments.length} arquivo(s)`;
 $('mdAttachList').innerHTML=selectedAttachments.length?selectedAttachments.map(a=>`<div class="orc-note" style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px">
   <div><b>${esc(a.arquivo_nome)}</b><br><span style="font-size:8px;color:var(--v4-muted)">${dtBR(a.criado_em)}${a.observacao?' · '+esc(a.observacao):''}</span></div>
   <div style="display:flex;gap:5px"><button type="button" class="orc-btn" data-open-att="${a.id}">Abrir</button><button type="button" class="orc-btn" data-download-att="${a.id}">Baixar</button></div>
 </div>`).join(''):'<div class="orc-empty">Nenhum arquivo anexado.</div>';
}
function renderHistory(){
 $('mdHistoryCount').textContent=`${history.length} evento(s)`;
 $('mdHistory').innerHTML=history.length?history.map(h=>`<div class="pedido-hitem"><strong>${esc(({movimentacao_criada:'Movimentação cadastrada',movimentacao_editada:'Movimentação editada',arquivo_adicionado:'Arquivo anexado',atualizacao:'Atualização'}[h.evento]||h.evento))}</strong>${h.mensagem?`<p>${esc(h.mensagem)}</p>`:''}<small>${esc(userName(h.usuario_id))} · ${dtBR(h.criado_em)}</small></div>`).join(''):'<div class="orc-empty">Sem histórico.</div>';
}
function addRow(values={}){
 const row=document.createElement('div');row.className='pedido-item-row';
 row.innerHTML=`<input class="mi-name" required placeholder="Nome do material" value="${esc(values.nome||'')}">
 <input class="mi-ficha" required placeholder="Nº da ficha" value="${esc(values.numero_ficha||'')}">
 <input class="mi-patrimonio" required placeholder="Nº Patrimônio" value="${esc(values.patrimonio||'')}">
 <input class="mi-qtd" type="number" min="0.001" step="0.001" required value="${values.quantidade||1}">
 <input class="mi-unit" type="number" min="0" step="0.01" required value="${values.valor_unitario??0}">
 <div class="pedido-item-total">${money((values.quantidade||1)*(values.valor_unitario||0))}</div>
 <button type="button" class="pedido-remove">×</button>`;
 $('movItemsEditor').appendChild(row);
 row.querySelector('.pedido-remove').onclick=()=>{if(document.querySelectorAll('#movItemsEditor .pedido-item-row').length<=1)return alert('Informe pelo menos um material.');row.remove();calcTotal()};
 row.querySelectorAll('input').forEach(i=>i.addEventListener('input',calcTotal));calcTotal();
}
function calcTotal(){
 let t=0;document.querySelectorAll('#movItemsEditor .pedido-item-row').forEach(r=>{const q=Number(r.querySelector('.mi-qtd').value)||0,u=Number(r.querySelector('.mi-unit').value)||0,v=q*u;r.querySelector('.pedido-item-total').textContent=money(v);t+=v});$('movEditorTotal').textContent=money(t);
}
function readItems(){return [...document.querySelectorAll('#movItemsEditor .pedido-item-row')].map(r=>({nome:r.querySelector('.mi-name').value.trim(),numero_ficha:r.querySelector('.mi-ficha').value.trim(),patrimonio:r.querySelector('.mi-patrimonio').value.trim(),quantidade:Number(r.querySelector('.mi-qtd').value),valor_unitario:Number(r.querySelector('.mi-unit').value)}))}
function openNew(){
 editingMovId=null;$('newMovForm').reset();$('movItemsEditor').innerHTML='';$('mData').value=new Date().toISOString().slice(0,10);addRow();$('newMovTitle').textContent='Nova Movimentação de Material';$('saveMov').textContent='Salvar movimentação';$('newMovBg').classList.add('open');
}
function openEdit(){
 if(!selected||!canManage(selected))return;
 editingMovId=selected.id;$('newMovForm').reset();$('movItemsEditor').innerHTML='';
 $('mNumero').value=selected.numero||'';$('mData').value=selected.data_movimentacao||'';$('mOrigem').value=selected.dependencia_origem||'';$('mDestino').value=selected.dependencia_destino||'';$('mFinalidade').value=selected.finalidade||'';$('mObservacoes').value=selected.observacoes||'';
 selectedItems.forEach(addRow);if(!selectedItems.length)addRow();
 $('newMovTitle').textContent=`Editar Movimentação ${selected.numero}`;$('saveMov').textContent='Salvar alterações';$('newMovBg').classList.add('open');
}
async function uploadOne(file,movId,note){
 if(file.size>25*1024*1024)throw new Error(`${file.name}: arquivo maior que 25 MB.`);
 const path=`movimentacoes/${movId}/${Date.now()}_${Math.random().toString(36).slice(2,7)}_${safeName(file.name)}`;
 const up=await supabaseClient.storage.from('movimentacoes-material').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});
 if(up.error)throw up.error;
 const pub=supabaseClient.storage.from('movimentacoes-material').getPublicUrl(path);
 const r=await supabaseClient.from('movimentacao_material_anexos').insert([{
   movimentacao_id:movId,arquivo_nome:file.name,arquivo_path:path,arquivo_url:pub.data.publicUrl,
   arquivo_mime:file.type||null,arquivo_tamanho:file.size,observacao:note||null,
   enviado_por:String(user.id),enviado_por_perfil_id:profileId()
 }]).select('*').single();
 if(r.error){await supabaseClient.storage.from('movimentacoes-material').remove([path]);throw r.error}
 await supabaseClient.from('movimentacao_material_tramitacoes').insert([{
   movimentacao_id:movId,evento:'arquivo_adicionado',mensagem:`Arquivo anexado: ${file.name}`,usuario_id:String(user.id),perfil_id:profileId()
 }]);
 return path;
}
async function saveMov(e){
 e.preventDefault();const its=readItems();
 if($('mOrigem').value===$('mDestino').value)return alert('Origem e destino precisam ser diferentes.');
 if(its.some(i=>!i.nome||!i.numero_ficha||!i.patrimonio||!(i.quantidade>0)||i.valor_unitario<0))return alert('Confira os materiais, incluindo o Nº de Patrimônio.');
 const btn=$('saveMov');btn.disabled=true;
 try{
   if(editingMovId){
     const r=await supabaseClient.rpc('v5_4_editar_movimentacao',{
       p_movimentacao_id:editingMovId,p_usuario_id:String(user.id),p_perfil_id:profileId(),
       p_numero:$('mNumero').value.trim(),p_data_movimentacao:$('mData').value,
       p_dependencia_origem:$('mOrigem').value,p_dependencia_destino:$('mDestino').value,
       p_finalidade:$('mFinalidade').value.trim(),p_observacoes:$('mObservacoes').value.trim()||null,p_itens:its
     });
     if(r.error)throw r.error;const id=editingMovId;editingMovId=null;$('newMovBg').classList.remove('open');toast('Movimentação atualizada.');await loadAll();await selectMov(id);return;
   }

   const r=await supabaseClient.from('movimentacoes_material').insert([{
     numero:$('mNumero').value.trim(),data_movimentacao:$('mData').value,
     dependencia_origem:$('mOrigem').value,dependencia_destino:$('mDestino').value,
     finalidade:$('mFinalidade').value.trim(),observacoes:$('mObservacoes').value.trim()||null,
     criado_por:String(user.id),criado_por_perfil_id:profileId(),secao_criador:user.secao||null,posicao_criador:user.posicao||null
   }]).select('*').single();
   if(r.error)throw r.error;const mov=r.data;
   const ir=await supabaseClient.from('movimentacao_material_itens').insert(its.map(i=>({...i,movimentacao_id:mov.id})));if(ir.error)throw ir.error;
   await supabaseClient.from('movimentacao_material_tramitacoes').insert([{movimentacao_id:mov.id,evento:'movimentacao_criada',mensagem:'Movimentação de material cadastrada.',usuario_id:String(user.id),perfil_id:profileId()}]);
   const files=[...$('mFiles').files];for(const f of files)await uploadOne(f,mov.id,'Arquivo anexado no cadastro.');
   $('newMovBg').classList.remove('open');toast('Movimentação cadastrada.');await loadAll();await selectMov(mov.id);
 }catch(err){alert('Erro ao salvar movimentação: '+err.message)}
 finally{btn.disabled=false;btn.textContent=editingMovId?'Salvar alterações':'Salvar movimentação'}
}
async function addFiles(){
 if(!selected)return;const fs=[...$('movAddFiles').files];if(!fs.length)return alert('Selecione um ou mais arquivos.');
 const note=$('movAttachNote').value.trim();
 try{for(const f of fs)await uploadOne(f,selected.id,note);$('movAddFiles').value='';$('movAttachNote').value='';toast('Arquivo(s) anexado(s).');await loadDetailData(selected.id);renderAttachments();renderHistory()}catch(err){alert('Erro ao anexar: '+err.message)}
}
async function addUpdate(){
 if(!selected)return;const text=$('movUpdateText').value.trim();if(!text)return alert('Digite a atualização.');
 const r=await supabaseClient.rpc('v5_4_adicionar_atualizacao_movimentacao',{p_movimentacao_id:selected.id,p_usuario_id:String(user.id),p_perfil_id:profileId(),p_mensagem:text});
 if(r.error)return alert(r.error.message);$('movUpdateText').value='';toast('Atualização registrada.');await loadDetailData(selected.id);renderHistory();
}
async function del(){
 if(!selected||!canManage(selected))return;if(!confirm(`Excluir a movimentação ${selected.numero}?`))return;
 const r=await supabaseClient.rpc('v5_4_excluir_movimentacao',{p_movimentacao_id:selected.id,p_usuario_id:String(user.id),p_perfil_id:profileId()});
 if(r.error)return alert(r.error.message);const paths=Array.isArray(r.data)?r.data:[];if(paths.length)try{await supabaseClient.storage.from('movimentacoes-material').remove(paths)}catch(_){}
 selected=null;$('movDetail').hidden=true;$('movDetailEmpty').hidden=false;toast('Movimentação excluída.');await loadAll();
}
function switchToMov(){
 document.querySelectorAll('[data-orc-module]').forEach(b=>b.classList.toggle('active',b.dataset.orcModule==='movimentacao'));
 $('guiasModule').hidden=true;$('pedidosModule').hidden=true;$('movimentacaoModule').hidden=false;
 $('orcPageTitle').textContent='Orçamentários · Movimentação de Material';
 $('orcPageSubtitle').textContent='Dependência de origem e destino, materiais, anexos e atualizações.';
 renderList();
}
function bind(){
 $('orcModuleNav').addEventListener('click',e=>{const b=e.target.closest('[data-orc-module="movimentacao"]');if(b)switchToMov()});
 $('btnNovaMovimentacao').onclick=openNew;$('btnEditMov').onclick=openEdit;$('btnDeleteMov').onclick=del;
 $('closeMov').onclick=$('cancelMov').onclick=()=>{editingMovId=null;$('newMovBg').classList.remove('open')};
 $('newMovBg').onclick=e=>{if(e.target===$('newMovBg'))$('newMovBg').classList.remove('open')};
 $('btnAddMovItem').onclick=()=>addRow();$('newMovForm').onsubmit=saveMov;
 ['movSearch','movDependenciaFilter','movDateFilter'].forEach(id=>$(id).addEventListener(id==='movSearch'?'input':'change',renderList));
 $('movList').onclick=e=>{const c=e.target.closest('[data-mov-id]');if(c)selectMov(c.dataset.movId)};
 $('mdAttachList').onclick=e=>{const o=e.target.closest('[data-open-att]'),d=e.target.closest('[data-download-att]');const id=o?.dataset.openAtt||d?.dataset.downloadAtt;if(!id)return;const a=selectedAttachments.find(x=>String(x.id)===String(id));if(!a)return;if(o)window.open(a.arquivo_url,'_blank','noopener');else{const l=document.createElement('a');l.href=a.arquivo_url;l.download=a.arquivo_nome;l.target='_blank';l.click()}};
 $('btnMovAddFiles').onclick=addFiles;$('btnMovUpdate').onclick=addUpdate;
}
async function start(){
 if(!await initUser())return;bind();await Promise.all([loadRefs(),loadUsers(),loadAll()]);
 if(new URLSearchParams(location.search).get('modulo')==='movimentacao'||new URLSearchParams(location.search).get('movimentacao'))switchToMov();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();