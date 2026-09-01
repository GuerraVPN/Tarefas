(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const fmt=v=>Number(v||0).toLocaleString('pt-BR');
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
const ICON={
 dashboard:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
 board:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M16 4v16"/></svg>',
 clipboard:'<svg viewBox="0 0 24 24"><path d="M9 5h6M9 3h6v4H9z"/><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 11h6M9 15h6"/></svg>',
 calendar:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
 chart:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 users:'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
 bell:'<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
 budget:'<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
 shield:'<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21h-4v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3h4v.1A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.4.3.7.7.8 1.2H21v4h-.1a1.7 1.7 0 0 0-1.5.8z"/></svg>',
 file:'<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
 clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 mail:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'
};
let user=null;
function icon(name){return ICON[name]||ICON.dashboard}
function profileLabel(){return [user?.secao,user?.posicao].filter(Boolean).join(' — ')||'Perfil ativo'}
async function initUser(){
 const base=JSON.parse(localStorage.getItem('usuarioLogado')||'null');if(!base?.id)return false;
 user=base;
 if(window.Perfis26){try{const s=await Perfis26.carregar(supabaseClient,base);user=s.usuario}catch(_){}}
 $('dashGreeting').textContent=`Bem-vindo, ${[user.patente,user.nome_guerra].filter(Boolean).join(' ')||'usuário'}.`;
 $('dashProfile').textContent=profileLabel();
 return true;
}
function shortcuts(){
 const admin=norm(user?.secao)==='admin';
 const data=[
  ['board','Quadro','Visão Kanban das tarefas','menu.html'],
  ['clipboard','Minhas Tarefas','Tarefas do perfil ativo','minhas_tarefas.html'],
  ['calendar','Calendário','Prazos e compromissos','calendario.html'],
  ['chart','Relatórios','Indicadores detalhados','relatorios.html'],
  ['users','Usuários','Efetivo e perfis','usuarios.html'],
  ['bell','Central','Notificações e mensagens','central.html'],
  ['budget','Orçamentários','Resumo e módulos orçamentários','orcamentarios.html'],
  ['file','Material Carga','Carga das dependências e depósitos','orcamentarios.html?modulo=material_carga'],
  ['tasks','Passagem de Carga','Histórico e troca de detentores','orcamentarios.html?modulo=passagem_carga'],
  ...(admin?[['shield','Histórico / Auditoria','Ações e reversões','historico_auditoria.html']]:[]),
  ['settings','Configurações','Preferências do sistema','configuracoes.html']
 ];
 $('shortcutGrid').innerHTML=data.map(([i,t,s,u])=>`<button class="v6-shortcut" data-url="${esc(u)}"><span class="v6-shortcut-icon">${icon(i)}</span><span><strong>${esc(t)}</strong><small>${esc(s)}</small></span></button>`).join('');
 $('shortcutGrid').onclick=e=>{const b=e.target.closest('[data-url]');if(b)location.href=b.dataset.url};
 document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
}
async function querySafe(table,select='*',build=null){
 try{let q=supabaseClient.from(table).select(select);if(build)q=build(q);const r=await q;return r.error?[]:(r.data||[])}catch(_){return[]}
}
function taskStats(tasks){
 const today=new Date();today.setHours(0,0,0,0);
 const open=tasks.filter(t=>norm(t.status)!=='concluida'&&norm(t.status)!=='concluída');
 const pending=tasks.filter(t=>norm(t.status)==='pendente').length;
 const andamento=tasks.filter(t=>norm(t.status).includes('andamento')).length;
 const done=tasks.filter(t=>norm(t.status).startsWith('conclu')).length;
 const late=open.filter(t=>t.prazo&&new Date(t.prazo+'T12:00:00')<today).length;
 return {open:open.length,pending,andamento,done,late,total:tasks.length};
}
function renderBars(s){
 const max=Math.max(1,s.total);
 const rows=[['Pendentes',s.pending],['Em andamento',s.andamento],['Concluídas',s.done],['Vencidas',s.late]];
 $('taskBars').innerHTML=rows.map(([n,v])=>`<div class="v6-bar-row"><span>${n}</span><div class="v6-bar-track"><div class="v6-bar-fill" style="width:${Math.min(100,(v/max)*100)}%"></div></div><b>${v}</b></div>`).join('');
}
function renderRecent(tasks){
 const a=[...tasks].sort((x,y)=>new Date(y.atualizado_em||y.criado_em||0)-new Date(x.atualizado_em||x.criado_em||0)).slice(0,8);
 $('recentTasks').innerHTML=a.length?a.map(t=>`<div class="v6-recent-row"><span>${esc(t.codigo||'#'+t.id)}</span><b>${esc(t.titulo||'Sem título')}</b><time>${new Date(t.atualizado_em||t.criado_em).toLocaleString('pt-BR')}</time></div>`).join(''):'<div class="v6-empty">Nenhuma tarefa encontrada.</div>';
}
async function load(){
 const [tasks,users,guides,pedidos,movs,docs,passagens,notifs]=await Promise.all([
  querySafe('tarefas','id,codigo,titulo,status,prazo,secao,criado_em,atualizado_em',q=>{q=q.eq('recorrencia_modelo',false);return ['admin','comandante'].includes(norm(user?.secao))?q:q.eq('secao',user?.secao||'')}),
  querySafe('usuarios','id,ativo'),
  querySafe('guias_orcamentarias','id,etapa_orcamentaria,situacao_fiscalizacao'),
  querySafe('pedidos_orcamentarios','id,tipo,categoria,status,valor_total'),
  querySafe('movimentacoes_material','id,status,valor_total'),
  querySafe('orc_documentos_carga','id,tipo_referencia,referencia,versao'),
  querySafe('orc_passagens_carga','id,status,dependencia,data_passagem'),
  querySafe('notificacoes','id,lida,perfil_id',q=>q.eq('usuario_id',String(user.id)).eq('lida',false))
 ]);
 const ts=taskStats(tasks);
 $('kOpen').textContent=fmt(ts.open);$('kOpenSub').textContent=`${fmt(ts.pending)} pendentes · ${fmt(ts.andamento)} em andamento`;$('kLate').textContent=fmt(ts.late);
 $('kUsers').textContent=fmt(users.filter(x=>x.ativo!==false).length);
 const vis=notifs.filter(x=>x.perfil_id==null||String(x.perfil_id)===String(user.perfil_id??''));$('kNotifs').textContent=fmt(vis.length);
 $('kGuides').textContent=fmt(guides.length);$('kGuidesSub').textContent=`${fmt(guides.filter(x=>x.etapa_orcamentaria==='aguardando_inclusao_carga').length)} aguardando inclusão`;
 renderBars(ts);renderRecent(tasks);
 const baixas=pedidos.filter(x=>x.tipo==='desrelacionamento_baixa'),dist=pedidos.filter(x=>x.tipo==='distribuicao');
 const latestDocs=new Set(docs.map(x=>`${x.tipo_referencia}|${x.referencia}`));
 const budget=[
  ['Guias na Fiscalização',guides.filter(x=>['aguardando_fiscalizacao','em_analise_fiscalizacao'].includes(x.situacao_fiscalizacao)).length,''],
  ['Baixas em andamento',baixas.filter(x=>x.status!=='pronto').length,money(baixas.reduce((s,x)=>s+Number(x.valor_total||0),0))],
  ['Distribuições em andamento',dist.filter(x=>x.status!=='pronto').length,money(dist.reduce((s,x)=>s+Number(x.valor_total||0),0))],
  ['Movimentações em andamento',movs.filter(x=>x.status!=='pronto').length,money(movs.reduce((s,x)=>s+Number(x.valor_total||0),0))],
  ['Documentos de carga',latestDocs.size,'dependências/depósitos com versão'],
  ['Passagens de carga',passagens.filter(x=>x.status==='em_andamento').length,`${passagens.filter(x=>x.status==='concluida').length} concluída(s)`]
 ];
 $('budgetCards').innerHTML=budget.map(([n,v,s])=>`<div class="v6-budget-card"><small>${esc(n)}</small><strong>${esc(v)}</strong><span>${esc(s||'')}</span></div>`).join('');
 $('dashUpdated').textContent='Atualizado em '+new Date().toLocaleString('pt-BR');
}
async function start(){if(!await initUser())return;shortcuts();await load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
