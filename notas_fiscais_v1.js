(function(){
'use strict';
if(window.__TAREFAS_NF_V797__)return;window.__TAREFAS_NF_V797__=true;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const dt=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
const STATUS=[
 {id:'aguardando_aprovacao_fiscal_administrativo',label:'Aguardando aprovação do Fiscal Administrativo'},
 {id:'aguardando_inclusao_siscofis',label:'Aguardando inclusão no Siscofis'},
 {id:'aguardando_inclusao_carga',label:'Aguardando inclusão em carga'},
 {id:'pronto',label:'Pronto'}
];
const ND={30:'Material Consumo ND 30',32:'Uso duradouro ND 32',52:'Permanente ND 52'};
let user=null,canApprove=false,empresas=[],depositos=[],notas=[],selected=null,historico=[];
function profileId(){return user?.perfil_id!=null?Number(user.perfil_id):null}
async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 user=base;
 if(window.Perfis26){try{const p=await Perfis26.carregar(supabaseClient,base);user=p.usuario}catch(_){}}
 const sec=norm(user.secao),pos=norm(user.posicao);
 canApprove=sec==='admin'||(sec==='fiscalizacao'&&['chefe','auxiliar','fiscal administrativo','fiscal_administrativo'].includes(pos));
 return true;
}
function timeout(p,ms,label){return Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+' demorou mais de 7s.')),ms))])}
async function loadData(){
 const results=await Promise.allSettled([
   timeout(supabaseClient.from('orc_empresas').select('*').eq('ativo',true).order('nome'),7000,'Empresas'),
   timeout(supabaseClient.from('orc_depositos').select('id,nome').eq('ativo',true).order('ordem'),7000,'Depósitos'),
   timeout(supabaseClient.from('orc_notas_fiscais_resumo').select('*').order('criado_em',{ascending:false}),7000,'Notas Fiscais')
 ]);
 const e=results[0],d=results[1],n=results[2];
 if(e.status==='fulfilled'&&!e.value.error)empresas=e.value.data||[];else throw new Error(e.status==='rejected'?e.reason?.message:(e.value?.error?.message||'Falha ao carregar empresas.'));
 if(d.status==='fulfilled'&&!d.value.error)depositos=d.value.data||[];else throw new Error(d.status==='rejected'?d.reason?.message:(d.value?.error?.message||'Falha ao carregar depósitos.'));
 if(n.status==='fulfilled'&&!n.value.error)notas=n.value.data||[];else throw new Error(n.status==='rejected'?n.reason?.message:(n.value?.error?.message||'Falha ao carregar notas fiscais.'));
 fillSelects();renderEmpresas();renderNotas();
}
function fillSelects(){
 $('nfEmpresa').innerHTML='<option value="">Selecione...</option>'+empresas.map(x=>'<option value="'+x.id+'">'+esc(x.nome)+(x.cnpj?' · CNPJ '+esc(x.cnpj):'')+'</option>').join('');
 $('nfDeposito').innerHTML='<option value="">Selecione...</option>'+depositos.map(x=>'<option value="'+x.id+'">'+esc(x.nome)+'</option>').join('');
 $('nfStatus').innerHTML='<option value="">Todos os andamentos</option>'+STATUS.map(x=>'<option value="'+x.id+'">'+x.label+'</option>').join('');
}
function statusBy(id){return STATUS.find(x=>x.id===id)||STATUS[0]}
function statusClass(id){return id==='pronto'?'ok':id==='aguardando_aprovacao_fiscal_administrativo'?'wait':'info'}
function renderEmpresas(){
 const q=norm($('nfCompanySearch').value);
 const arr=empresas.filter(x=>!q||norm(x.nome+' '+(x.cnpj||'')).includes(q));
 $('nfCompanyCount').textContent=empresas.length+' empresa(s)';
 $('nfCompanyList').innerHTML=arr.length?arr.map(x=>'<article class="nf-company '+(selected&&String(selected.empresa_id)===String(x.id)?'active':'')+'" data-company="'+x.id+'"><strong>'+esc(x.nome)+'</strong><small>'+(x.cnpj?'CNPJ '+esc(x.cnpj):'Sem CNPJ cadastrado')+'</small></article>').join(''):'<div class="nf-empty">Nenhuma empresa encontrada.</div>';
}
function filteredNotas(){
 const q=norm($('nfSearch').value),s=$('nfStatus').value,nd=$('nfND').value;
 return notas.filter(n=>{
   if(s&&n.status!==s)return false;if(nd&&String(n.nd)!==nd)return false;
   return !q||norm(n.numero+' '+n.empresa_origem+' '+n.deposito_destino+' '+n.natureza_material).includes(q);
 });
}
function renderNotas(){
 const arr=filteredNotas();$('nfListInfo').textContent=arr.length+' nota(s)';
 $('nfList').innerHTML=arr.length?arr.map(n=>{const st=statusBy(n.status);return '<article class="nf-note-card '+(selected&&String(selected.id)===String(n.id)?'active':'')+'" data-note="'+n.id+'"><div class="nf-note-top"><strong>NF '+esc(n.numero)+'</strong><span class="nf-status '+statusClass(n.status)+'">'+esc(st.label)+'</span></div><div class="nf-note-meta">'+esc(n.empresa_origem)+' → '+esc(n.deposito_destino)+'<br>'+esc(n.natureza_material)+' · '+money(n.valor_total)+'</div></article>'}).join(''):'<div class="nf-empty">Nenhuma nota fiscal encontrada.</div>';
}
function renderDetail(){
 const e=$('nfDetail');if(!selected){e.innerHTML='<div class="nf-empty">Selecione uma Nota Fiscal para visualizar os dados.</div>';return}
 const idx=STATUS.findIndex(x=>x.id===selected.status),st=statusBy(selected.status);
 const steps=STATUS.map((x,i)=>'<div class="nf-step '+(i<idx?'done ':'')+(i===idx?'current':'')+'">'+(i<idx?'✓ ':'')+esc(x.label)+'</div>').join('');
 let button='';
 if(selected.status!=='pronto'){
   const next=STATUS[idx+1];
   const first=selected.status==='aguardando_aprovacao_fiscal_administrativo';
   if(first&&!canApprove)button='<span style="font-size:9px;color:var(--v4-muted)">Aguardando aprovação do Fiscal Administrativo.</span>';
   else button='<button class="orc-btn primary" id="btnNfAdvance">Avançar para: '+esc(next.label)+'</button>';
 }
 e.innerHTML='<div class="nf-detail"><div class="nf-head" style="padding:0 0 12px;border:0"><div><h3>Nota Fiscal '+esc(selected.numero)+'</h3><span>Cadastrada em '+dt(selected.criado_em)+'</span></div><span class="nf-status '+statusClass(selected.status)+'">'+esc(st.label)+'</span></div><div class="nf-detail-grid"><div class="nf-kv"><small>Número</small><b>'+esc(selected.numero)+'</b></div><div class="nf-kv"><small>Valor total</small><b>'+money(selected.valor_total)+'</b></div><div class="nf-kv"><small>Empresa na origem</small><b>'+esc(selected.empresa_origem)+'</b></div><div class="nf-kv"><small>Depósito no destino</small><b>'+esc(selected.deposito_destino)+'</b></div><div class="nf-kv"><small>Classificação</small><b>'+esc(ND[selected.nd]||selected.natureza_material)+'</b></div><div class="nf-kv"><small>Andamento atual</small><b>'+esc(st.label)+'</b></div></div><div class="nf-section"><h3 style="font-size:11px;margin-bottom:8px">Andamento</h3><div class="nf-flow">'+steps+'</div><div class="nf-section nf-actions-bar">'+button+'</div></div><div class="nf-section"><h3 style="font-size:11px;margin-bottom:6px">Histórico</h3><div id="nfHistory"><div class="nf-empty">Carregando histórico...</div></div></div></div>';
 if(selected.status!=='pronto' && (! (selected.status==='aguardando_aprovacao_fiscal_administrativo'&&!canApprove))) $('btnNfAdvance').onclick=advance;
 loadHistory(selected.id);
}
async function loadHistory(id){
 const r=await timeout(supabaseClient.from('orc_notas_fiscais_historico').select('*').eq('nota_fiscal_id',id).order('criado_em',{ascending:false}),7000,'Histórico');
 historico=r.error?[]:r.data||[];
 const box=$('nfHistory');if(!box)return;
 box.innerHTML=historico.length?historico.map(h=>'<div class="nf-history-item"><strong>'+esc(statusBy(h.status_novo).label)+'</strong><p>'+esc(h.mensagem||'Andamento atualizado.')+'</p><small>'+dt(h.criado_em)+'</small></div>').join(''):'<div class="nf-empty">Sem histórico.</div>';
}
async function advance(){
 if(!selected)return;
 const i=STATUS.findIndex(x=>x.id===selected.status),next=STATUS[i+1];if(!next)return;
 if(selected.status==='aguardando_aprovacao_fiscal_administrativo'&&!canApprove)return;
 const b=$('btnNfAdvance');if(b)b.disabled=true;
 const r=await timeout(supabaseClient.from('orc_notas_fiscais').update({status:next.id}).eq('id',selected.id),7000,'Atualização do andamento');
 if(r.error){alert('Erro ao avançar: '+r.error.message);if(b)b.disabled=false;return}
 selected={...selected,status:next.id};notas=notas.map(n=>String(n.id)===String(selected.id)?selected:n);renderNotas();renderEmpresas();renderDetail();
}
async function createEmpresa(e){
 e.preventDefault();const nome=$('empresaNome').value.trim(),cnpj=$('empresaCnpj').value.replace(/\D/g,'')||null;if(!nome)return;
 const b=e.submitter;b.disabled=true;const r=await timeout(supabaseClient.from('orc_empresas').insert({nome,cnpj}),7000,'Cadastro de empresa');
 if(r.error){alert('Erro ao cadastrar empresa: '+r.error.message);b.disabled=false;return}
 $('empresaForm').reset();$('empresaModal').classList.remove('open');await loadData();toast('Empresa cadastrada.');b.disabled=false;
}
async function createNF(e){
 e.preventDefault();const numero=$('nfNumero').value.trim(),valor=Number($('nfValor').value),empresa=Number($('nfEmpresa').value),dep=Number($('nfDeposito').value),nd=Number($('nfND').value);
 if(!numero||!Number.isFinite(valor)||!empresa||!dep||![30,32,52].includes(nd))return;
 const b=e.submitter;b.disabled=true;
 const r=await timeout(supabaseClient.from('orc_notas_fiscais').insert({numero,valor_total:valor,empresa_id:empresa,deposito_id:dep,nd}),7000,'Cadastro da Nota Fiscal');
 if(r.error){alert('Erro ao cadastrar nota fiscal: '+r.error.message);b.disabled=false;return}
 $('nfForm').reset();$('nfModal').classList.remove('open');await loadData();toast('Nota Fiscal cadastrada.');b.disabled=false;
}
function toast(msg){const el=document.createElement('div');el.textContent=msg;el.style.cssText='position:fixed;right:18px;bottom:18px;z-index:500;background:var(--v4-surface);color:var(--v4-text);border:1px solid var(--v4-border);padding:10px 13px;border-radius:9px;font-size:10px;box-shadow:0 10px 30px rgba(0,0,0,.2)';document.body.appendChild(el);setTimeout(()=>el.remove(),2400)}
function bind(){
 $('btnNovaEmpresa').onclick=()=>{$('empresaModal').classList.add('open');$('empresaNome').focus()};
 $('closeEmpresa').onclick=$('cancelEmpresa').onclick=()=>$('empresaModal').classList.remove('open');
 $('closeNF').onclick=$('cancelNF').onclick=()=>$('nfModal').classList.remove('open');
 $('empresaModal').onclick=e=>{if(e.target===$('empresaModal'))$('empresaModal').classList.remove('open')};
 $('nfModal').onclick=e=>{if(e.target===$('nfModal'))$('nfModal').classList.remove('open')};
 $('empresaForm').onsubmit=createEmpresa;$('nfForm').onsubmit=createNF;
 $('btnNovaNF').onclick=()=>{$('nfModal').classList.add('open');$('nfNumero').focus()};
 $('nfCompanySearch').oninput=renderEmpresas;$('nfSearch').oninput=renderNotas;$('nfStatus').onchange=renderNotas;$('nfND').onchange=renderNotas;
 $('nfList').onclick=e=>{const card=e.target.closest('[data-note]');if(!card)return;selected=notas.find(n=>String(n.id)===String(card.dataset.note))||null;renderNotas();renderEmpresas();renderDetail()};
 $('nfCompanyList').onclick=e=>{const card=e.target.closest('[data-company]');if(!card)return;const empresa=empresas.find(x=>String(x.id)===String(card.dataset.company));$('nfSearch').value=empresa?empresa.nome:'';renderNotas()};
}
async function start(){
 if(!await initUser()){location.replace('index.html');return}
 bind();
 try{await loadData()}catch(err){console.error(err);$('nfList').innerHTML='<div class="nf-empty">Erro ao abrir Notas Fiscais:<br>'+esc(err.message)+'</div>';};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();