(function(){
'use strict';
if(window.__TAREFAS_V770_MATERIAL_CARGA__)return;
window.__TAREFAS_V770_MATERIAL_CARGA__=true;
if((location.pathname.split('/').pop()||'').toLowerCase()!=='orcamentarios.html')return;

const VERSION='7.7.0';
const DAY=86400000;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const dt=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
const date=v=>v?new Date(v).toLocaleDateString('pt-BR'):'-';

let user=null,docs=[],pending=[],users=[];
let usersMap=new Map();
let refreshBusy=false,processCheckTimer=null;

function profileId(){return user?.perfil_id?Number(user.perfil_id):null}
function tipoAtual(){return document.querySelector('[data-carga-tipo].active')?.dataset.cargaTipo||'dependencia'}
function refAtual(){const t=$('cargaTitle')?.textContent?.trim();return t&&t!=='Selecione um registro'?t:null}
function safeName(v){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_')}
function userName(id){const u=usersMap.get(String(id));return u?[u.patente,u.nome_guerra].filter(Boolean).join(' '):id?`Usuário ${id}`:'Não informado'}
function latest(type,ref){return docs.find(x=>x.tipo_referencia===type&&x.referencia===ref)||null}
function pendings(type,ref){return pending.filter(x=>x.tipo_referencia===type&&x.referencia===ref&&x.status==='pendente')}
function dueInfo(type,ref){
 const d=latest(type,ref),p=pendings(type,ref),days=type==='deposito'?30:90;
 if(!d)return{level:'critical',text:'Sem relação atualizada',detail:'É necessário anexar a primeira relação.',doc:null,p,due:null,remaining:null};
 const base=new Date(d.conferido_em||d.criado_em);const due=new Date(base.getTime()+days*DAY);
 const remaining=Math.ceil((due-Date.now())/DAY);
 if(p.length)return{level:'critical',text:'Atualização obrigatória após processo',detail:`${p.length} processo(s) alteraram esta carga.`,doc:d,p,due,remaining};
 if(remaining<0)return{level:'critical',text:`Vencido há ${Math.abs(remaining)} dia(s)`,detail:`Prazo de ${days} dias ultrapassado.`,doc:d,p,due,remaining};
 if(remaining===0)return{level:'warning',text:'Atualizar hoje',detail:`Prazo de ${days} dias vence hoje.`,doc:d,p,due,remaining};
 if(remaining<=7)return{level:'warning',text:`Vence em ${remaining} dia(s)`,detail:`Prazo de ${days} dias próximo do vencimento.`,doc:d,p,due,remaining};
 return{level:'ok',text:`Em dia · ${remaining} dia(s) restantes`,detail:`Prazo de ${days} dias.`,doc:d,p,due,remaining};
}

function injectCss(){
 if($('v770CargaCss'))return;
 const s=document.createElement('style');s.id='v770CargaCss';s.textContent=`
 .v770-carga-status{margin-top:7px;font-size:11px;font-weight:800;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
 .v770-carga-status.ok{color:#16a34a}.v770-carga-status.warning{color:#d97706}.v770-carga-status.critical{color:#dc2626}
 .v770-carga-panel{margin:12px 0;padding:12px;border:1px solid var(--v4-border,#d1d5db);border-radius:10px;background:var(--v4-surface,#fff)}
 .v770-carga-panel h4{margin:0 0 8px;font-size:13px}.v770-carga-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
 .v770-carga-kv{padding:8px;border-radius:8px;background:var(--v4-surface-2,#f8fafc)}.v770-carga-kv small{display:block;opacity:.7}.v770-carga-kv b{font-size:12px}
 .v770-carga-alert{margin-top:8px;padding:8px 10px;border-radius:8px;font-size:11px;font-weight:700}.v770-carga-alert.critical{background:#fee2e2;color:#991b1b}.v770-carga-alert.warning{background:#fef3c7;color:#92400e}.v770-carga-alert.ok{background:#dcfce7;color:#166534}
 .v770-checker{display:grid;grid-template-columns:1fr;gap:5px}.v770-checker label{font-size:11px;font-weight:800}.v770-checker select{width:100%;min-height:38px}
 @media(max-width:700px){.v770-carga-grid{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}

async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);user=p.usuario}catch(_){user=base}}else user=base;
 return true;
}

async function loadData(){
 if(!window.supabaseClient)return;
 const [d,p,u]=await Promise.all([
  supabaseClient.from('orc_documentos_carga').select('*').order('tipo_referencia').order('referencia').order('versao',{ascending:false}),
  supabaseClient.from('orc_carga_pendencias').select('*').order('criada_em',{ascending:false}),
  supabaseClient.from('usuarios').select('id,patente,nome_guerra').order('nome_guerra')
 ]);
 if(!d.error)docs=d.data||[];
 if(!p.error)pending=p.data||[];
 if(!u.error){users=u.data||[];usersMap=new Map(users.map(x=>[String(x.id),x]));}
}

function injectChecker(){
 const area=$('cargaFiscalUpdate');if(!area||$('cargaConferidoPor'))return;
 const actions=area.querySelector('.pedido-actions')||area;
 const wrap=document.createElement('div');wrap.className='v770-checker';wrap.innerHTML=`
  <label for="cargaConferidoPor">Quem conferiu <span aria-hidden="true">*</span></label>
  <select id="cargaConferidoPor" required><option value="">Selecione quem conferiu...</option></select>`;
 const file=$('cargaNewFile');if(file&&file.parentNode===actions)actions.insertBefore(wrap,file);else actions.prepend(wrap);
 fillChecker();
}
function fillChecker(){
 const sel=$('cargaConferidoPor');if(!sel)return;
 const cur=sel.value||String(user?.id||'');
 sel.innerHTML='<option value="">Selecione quem conferiu...</option>'+users.map(u=>`<option value="${esc(u.id)}">${esc([u.patente,u.nome_guerra].filter(Boolean).join(' '))}</option>`).join('');
 if([...sel.options].some(o=>o.value===cur))sel.value=cur;
}

function annotateList(){
 const type=tipoAtual();
 document.querySelectorAll('#cargaRefList [data-carga-ref]').forEach(card=>{
  const ref=card.dataset.cargaRef,info=dueInfo(type,ref);
  let el=card.querySelector('.v770-carga-status');if(!el){el=document.createElement('div');card.appendChild(el)}
  el.className=`v770-carga-status ${info.level}`;el.textContent=info.text;
 });
}

function renderDetail(){
 const ref=refAtual();if(!ref||!$('cargaDetail')||$('cargaDetail').hidden)return;
 const type=tipoAtual(),info=dueInfo(type,ref),d=info.doc;
 let panel=$('v770CargaPanel');if(!panel){panel=document.createElement('div');panel.id='v770CargaPanel';panel.className='v770-carga-panel';const target=$('cargaFiscalUpdate')||$('cargaDetentorPanel')||$('cargaDetail');target.parentNode.insertBefore(panel,target)}
 const motives={historico:'Histórico anterior à V7.7.0',periodica:'Conferência periódica',pos_processo:'Atualização após processo',manual:'Atualização manual'};
 const pend=info.p||[];
 panel.innerHTML=`<h4>Conferência e validade</h4>
 <div class="v770-carga-grid">
  <div class="v770-carga-kv"><small>Quem conferiu</small><b>${d?esc(userName(d.conferido_por)):'-'}</b></div>
  <div class="v770-carga-kv"><small>Conferido em</small><b>${d?esc(dt(d.conferido_em||d.criado_em)):'-'}</b></div>
  <div class="v770-carga-kv"><small>Próxima atualização</small><b>${info.due?esc(date(info.due)):'-'}</b></div>
  <div class="v770-carga-kv"><small>Motivo da última versão</small><b>${d?esc(motives[d.motivo_atualizacao]||d.motivo_atualizacao||'-'):'-'}</b></div>
 </div>
 <div class="v770-carga-alert ${info.level}">${esc(info.text)}${info.detail?' · '+esc(info.detail):''}</div>
 ${pend.length?`<div style="margin-top:8px">${pend.map(p=>`<div class="pedido-hitem"><strong>${esc(p.origem_tipo)} ${esc(p.origem_numero||'#'+p.origem_id)}</strong><p>${esc(p.descricao||'Relação precisa ser atualizada.')}</p><small>${esc(dt(p.criada_em))}</small></div>`).join('')}</div>`:''}`;
}

async function upload770(){
 const ref=refAtual(),type=tipoAtual();if(!ref)return alert('Selecione a dependência ou depósito.');
 const file=$('cargaNewFile')?.files?.[0];if(!file)return alert('Selecione o documento atualizado.');
 if(file.size>30*1024*1024)return alert('O arquivo ultrapassa 30 MB.');
 const checker=$('cargaConferidoPor')?.value;if(!checker)return alert('Informe quem conferiu a relação.');
 const path=`${type}/${safeName(ref)}/${Date.now()}_${safeName(file.name)}`;let uploaded=false;
 try{
  const up=await supabaseClient.storage.from('material-carga-depositos').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});
  if(up.error)throw up.error;uploaded=true;
  const pub=supabaseClient.storage.from('material-carga-depositos').getPublicUrl(path);
  const hasPending=pendings(type,ref).length>0;
  const r=await supabaseClient.rpc('v7_7_0_registrar_documento_carga',{
    p_tipo_referencia:type,p_referencia:ref,p_arquivo_nome:file.name,p_arquivo_path:path,
    p_arquivo_url:pub.data.publicUrl,p_arquivo_mime:file.type||null,p_arquivo_tamanho:file.size,
    p_usuario_id:String(user.id),p_perfil_id:profileId(),p_conferido_por:String(checker),
    p_observacao:$('cargaNote')?.value?.trim()||null,p_motivo_atualizacao:hasPending?'pos_processo':'periodica'
  });
  if(r.error)throw r.error;
  sessionStorage.setItem('v770CargaFocus',JSON.stringify({type,ref}));
  alert('Relação atualizada e conferência registrada.');location.reload();
 }catch(err){
  if(uploaded)try{await supabaseClient.storage.from('material-carga-depositos').remove([path])}catch(_){}
  alert('Erro ao atualizar documento: '+(err?.message||err));
 }
}

function bindUpload(){
 const b=$('btnCargaUpdate');if(!b||b.dataset.v770Bound)return;b.dataset.v770Bound='1';
 b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();upload770()},true);
}

async function restoreFocus(){
 let f=null;try{f=JSON.parse(sessionStorage.getItem('v770CargaFocus')||'null')}catch(_){}
 if(!f)return;sessionStorage.removeItem('v770CargaFocus');
 const tab=document.querySelector(`[data-carga-tipo="${CSS.escape(f.type)}"]`);if(tab&&!tab.classList.contains('active'))tab.click();
 for(let i=0;i<30;i++){
  const card=[...document.querySelectorAll('#cargaRefList [data-carga-ref]')].find(x=>x.dataset.cargaRef===f.ref);
  if(card){card.click();return}await new Promise(r=>setTimeout(r,100));
 }
}

async function detectProcessCompletion(beforeIds,clickedAt){
 clearTimeout(processCheckTimer);
 processCheckTimer=setTimeout(async()=>{
  const r=await supabaseClient.from('orc_carga_pendencias').select('*').eq('status','pendente').order('criada_em',{ascending:false});
  if(r.error)return;pending=r.data||[];
  const fresh=pending.filter(p=>!beforeIds.has(String(p.id))&&new Date(p.criada_em).getTime()>=clickedAt-5000);
  if(!fresh.length)return;
  const labels=fresh.map(p=>`${p.tipo_referencia==='deposito'?'Depósito':'Dependência'}: ${p.referencia}`).join('\n');
  const go=confirm(`Processo concluído. A carga foi alterada e precisa de nova relação:\n\n${labels}\n\nDeseja ir agora para Material Carga / Depósito?`);
  if(go){const first=fresh.find(p=>p.tipo_referencia==='dependencia')||fresh[0];sessionStorage.setItem('v770CargaFocus',JSON.stringify({type:first.tipo_referencia,ref:first.referencia}));location.href='orcamentarios.html?modulo=material_carga'}
 },1400);
}
function bindProcessWatcher(){
 if(document.documentElement.dataset.v770ProcessWatcher)return;document.documentElement.dataset.v770ProcessWatcher='1';
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-pedido-action="pronto"],[data-mov-action="pronto"],[data-movimentacao-action="pronto"]');if(!b)return;
  const before=new Set(pending.filter(x=>x.status==='pendente').map(x=>String(x.id)));detectProcessCompletion(before,Date.now());
 },true);
}

function renderAll(){injectChecker();fillChecker();annotateList();renderDetail();bindUpload()}
async function refresh(){if(refreshBusy)return;refreshBusy=true;try{await loadData();renderAll()}finally{refreshBusy=false}}
async function start(){
 injectCss();if(!await initUser())return;await refresh();bindProcessWatcher();await restoreFocus();renderAll();
 const obs=new MutationObserver(()=>queueMicrotask(renderAll));obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
 document.querySelectorAll('[data-carga-tipo]').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,120)));
 setInterval(refresh,60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();