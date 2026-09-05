(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.TarefasAlpha23221Core=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION='2.3.22.1',BUILD=264;
  const CATEGORIES=['tarefas','mensagens','versoes','escala','sistema','outros'];
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const asArray=v=>Array.isArray(v)?v:[];
  const uniq=a=>[...new Set(asArray(a).map(x=>String(x)))];
  function category(row){
    const t=norm(row?.tipo),r=norm(row?.referencia_tipo),title=norm(row?.titulo);
    if(['app_update','app_update_reminder'].includes(t)||r==='app_version'||/vers[aã]o|atualiza[cç][aã]o/.test(title))return'versoes';
    if(t==='mensagem'||r==='mensagem')return'mensagens';
    if(t==='tarefa'||r==='tarefa'||r==='tarefas')return'tarefas';
    if(/escala|servico|serviço|missao|missão|ferias|férias|dispensa/.test(`${t} ${r} ${title}`))return'escala';
    if(t==='sistema'||!t)return'sistema';
    return'outros';
  }
  function defaultState(){return{
    schema:1,version:VERSION,build:BUILD,updatedAt:0,
    mutedCategories:[],retentionDays:0,
    favorites:[],downloads:[],savedFilters:[],errors:[],reminders:[],
    pinnedNotifications:[],snoozedNotifications:{},lastNotificationFilter:'todas',queueSummary:{count:0,failed:0,lastSync:null}
  }}
  function normalizeState(raw){
    const d=defaultState(),s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
    const retention=[0,30,60,90].includes(Number(s.retentionDays))?Number(s.retentionDays):0;
    const snoozed=s.snoozedNotifications&&typeof s.snoozedNotifications==='object'&&!Array.isArray(s.snoozedNotifications)?s.snoozedNotifications:{};
    return{
      ...d,...s,version:VERSION,build:BUILD,
      mutedCategories:uniq(s.mutedCategories).filter(x=>CATEGORIES.includes(x)),retentionDays:retention,
      favorites:asArray(s.favorites).slice(-30),downloads:asArray(s.downloads).slice(-60),savedFilters:asArray(s.savedFilters).slice(-30),errors:asArray(s.errors).slice(-50),reminders:asArray(s.reminders).slice(-50),
      pinnedNotifications:uniq(s.pinnedNotifications).slice(-200),snoozedNotifications:snoozed,
      queueSummary:s.queueSummary&&typeof s.queueSummary==='object'?{...d.queueSummary,...s.queueSummary}:d.queueSummary
    };
  }
  function isMuted(row,state){return normalizeState(state).mutedCategories.includes(category(row))}
  function isPinned(row,state){return normalizeState(state).pinnedNotifications.includes(String(row?.id??''))}
  function snoozedUntil(row,state){const v=normalizeState(state).snoozedNotifications?.[String(row?.id??'')];const t=v?new Date(v).getTime():0;return Number.isFinite(t)?t:0}
  function shouldShow(row,state,now=Date.now()){
    if(!row)return false;
    if(isMuted(row,state))return false;
    const until=snoozedUntil(row,state);if(until>now)return false;
    return true;
  }
  function sortRows(rows,state){return [...asArray(rows)].sort((a,b)=>{
    const pa=isPinned(a,state)?1:0,pb=isPinned(b,state)?1:0;if(pa!==pb)return pb-pa;
    const ua=a?.lida?0:1,ub=b?.lida?0:1;if(ua!==ub)return ub-ua;
    return new Date(b?.criada_em||0)-new Date(a?.criada_em||0);
  })}
  function groupedNotifications(rows,state,now=Date.now()){
    const visible=sortRows(asArray(rows).filter(r=>shouldShow(r,state,now)),state),versions=visible.filter(r=>category(r)==='versoes'),others=visible.filter(r=>category(r)!=='versoes');
    const out=[];
    if(versions.length){
      const unread=versions.filter(r=>!r.lida).length;
      out.push({kind:'version_group',id:'version_group',category:'versoes',count:versions.length,unread,urgent:versions.some(r=>r.urgente),rows:versions,createdAt:versions[0]?.criada_em||null});
    }
    for(const row of others)out.push({kind:'notification',id:String(row.id),category:category(row),row});
    return out;
  }
  function counters(rows,state,now=Date.now()){
    const all=asArray(rows),visible=all.filter(r=>shouldShow(r,state,now)),unread=visible.filter(r=>!r.lida);
    const by={tarefas:0,mensagens:0,versoes:0,escala:0,sistema:0,outros:0};
    for(const r of unread)by[category(r)]++;
    return{unread:unread.length,urgent:unread.filter(r=>r.urgente).length,...by,mutedHidden:all.filter(r=>isMuted(r,state)).length,snoozedHidden:all.filter(r=>snoozedUntil(r,state)>now).length};
  }
  function retentionDeleteIds(rows,state,now=Date.now()){
    const days=normalizeState(state).retentionDays;if(!days)return[];
    const cutoff=now-days*86400000;
    return asArray(rows).filter(r=>{
      const t=new Date(r?.criada_em||0).getTime();return Number.isFinite(t)&&t<cutoff&&!isPinned(r,state);
    }).map(r=>String(r.id));
  }
  function sanitizeError(input){
    const msg=String(input?.message||input?.reason||input||'Erro desconhecido').replace(/(?:eyJ[a-zA-Z0-9._-]{20,}|sk-[a-zA-Z0-9_-]{12,}|Bearer\s+[a-zA-Z0-9._-]+)/g,'[credencial removida]').slice(0,700);
    const page=String(input?.page||'').slice(0,220),source=String(input?.source||'app').slice(0,80);
    return{id:String(input?.id||`${Date.now()}-${Math.random().toString(36).slice(2,8)}`),message:msg,page,source,at:input?.at||new Date().toISOString(),severity:String(input?.severity||'error').slice(0,20)};
  }
  function queueKey(action){const a=action&&typeof action==='object'?action:{};return JSON.stringify([a.kind||'',a.payload||{}]);}
  function dedupeQueue(queue){const out=[],seen=new Set();for(const item of asArray(queue)){const k=queueKey(item);if(seen.has(k))continue;seen.add(k);out.push(item)}return out.slice(-100)}
  function parseAiCommand(text){
    const t=norm(text);
    if(!t)return null;
    if(/(mostr|listar|ver).*(download)/.test(t))return{type:'show_downloads'};
    if(/(mostr|listar|ver).*(erro)/.test(t))return{type:'show_errors'};
    if(/(mostr|listar|ver).*(fila|offline)/.test(t))return{type:'show_queue'};
    if(/(mostr|listar|ver).*(favorit)/.test(t))return{type:'show_favorites'};
    if(/(mostr|listar|ver).*(filtro)/.test(t))return{type:'show_filters'};
    if(/(apag|exclu|limp).*(notifica).*(lida)/.test(t))return{type:'delete_read'};
    if(/(apag|exclu|limp).*(todas?).*(notifica)/.test(t)||/(apag|exclu|limp).*(notifica).*(todas?)/.test(t))return{type:'delete_all'};
    if(/(silenci|mut).*(vers|atualiza)/.test(t))return{type:'mute',category:'versoes'};
    if(/(reativ|ativ|dessilenci).*(vers|atualiza)/.test(t))return{type:'unmute',category:'versoes'};
    if(/(silenci|mut).*(tarefa)/.test(t))return{type:'mute',category:'tarefas'};
    if(/(reativ|ativ|dessilenci).*(tarefa)/.test(t))return{type:'unmute',category:'tarefas'};
    if(/(silenci|mut).*(mensag)/.test(t))return{type:'mute',category:'mensagens'};
    if(/(reativ|ativ|dessilenci).*(mensag)/.test(t))return{type:'unmute',category:'mensagens'};
    const retention=t.match(/reten[cç][aã]o[^0-9]*(30|60|90)/);if(retention)return{type:'retention',days:Number(retention[1])};
    if(/(desativ|sem).*(reten[cç][aã]o)/.test(t))return{type:'retention',days:0};
    if(/(adicion|salv|fix).*(favorit).*(tela|pagina|p[aá]gina|aqui)?/.test(t)||/(favorit).*(esta|essa).*(tela|pagina|p[aá]gina)/.test(t))return{type:'favorite_current'};
    if(/(limp|apag).*(erro)/.test(t))return{type:'clear_errors'};
    if(/(limp|apag).*(fila|offline)/.test(t))return{type:'clear_queue'};
    return null;
  }
  return{VERSION,BUILD,CATEGORIES,norm,category,defaultState,normalizeState,isMuted,isPinned,snoozedUntil,shouldShow,groupedNotifications,counters,retentionDeleteIds,sanitizeError,queueKey,dedupeQueue,parseAiCommand};
});
