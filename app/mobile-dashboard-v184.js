(() => {
  'use strict';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='dashboard.html') return;

  const GROUPS={sargento:'Sargentos',motorista:'Motoristas',patrulheiro:'Patrulheiros',permanencia:'Permanência',canil:'Permanência/Canil'};
  const LANES={preta:'Escala Preta',vermelha:'Escala Vermelha'};
  const PERIOD_KEY='tarefas_v743_period';
  const CARD_ID='kNextServiceCard';
  let loading=false;

  function readUser(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
  function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
  function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function parseDate(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)}
  function addDays(s,n){const d=parseDate(s);d.setDate(d.getDate()+n);return iso(d)}
  function todayIso(){const d=new Date();d.setHours(0,0,0,0);return iso(d)}
  function br(s){return parseDate(s).toLocaleDateString('pt-BR')}
  function dayLabel(s){return parseDate(s).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'}).replace('.','').toUpperCase()}
  function personKey(x){if(x?.usuario_id)return `u:${x.usuario_id}`;if(x?.pessoa_externa_id)return `e:${x.pessoa_externa_id}`;return ''}
  function rotationKey(s){if(s?.rodizio_usuario_id)return `u:${s.rodizio_usuario_id}`;if(s?.rodizio_pessoa_externa_id)return `e:${s.rodizio_pessoa_externa_id}`;return personKey(s)}
  function moveToBack(queue,key){const i=queue.indexOf(key);if(i>=0){queue.splice(i,1);queue.push(key)}}
  function inheritedAnchor(row,lane){const v=lane==='vermelha'?row?.heranca_vermelha_data:row?.heranca_preta_data;return v||null}
  function vacationFor(vacations,row,date){return vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_inicio<=date&&v.data_fim>=date)}
  function adaptationFor(vacations,row,date){return vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&addDays(v.data_fim,1)===date)}
  function eligible(vacations,row,date){return !vacationFor(vacations,row,date)&&!adaptationFor(vacations,row,date)}
  function laneFor(date,holidaySet){const d=parseDate(date);return d.getDay()===0||d.getDay()===6||holidaySet.has(date)?'vermelha':'preta'}
  function eventPriority(x){return x.kind==='confirmed'?0:1}

  function ensureCard(){
    let card=document.getElementById(CARD_ID);
    if(card) return card;
    const grid=document.querySelector('.v6-kpis');
    if(!grid) return null;
    card=document.createElement('article');
    card.id=CARD_ID;
    card.className='v6-kpi tm-next-service-kpi';
    card.tabIndex=0;
    card.setAttribute('role','button');
    card.innerHTML='<div class="v6-kpi-icon" data-next-service-icon>★</div><div><small>Próximo serviço</small><strong id="kNextService">...</strong><span id="kNextServiceSub">Calculando previsão...</span></div>';
    grid.appendChild(card);
    const style=document.createElement('style');
    style.id='tmNextServiceStyle184';
    style.textContent='.tm-next-service-kpi{cursor:pointer}.tm-next-service-kpi[data-state="confirmed"]{outline:1px solid color-mix(in srgb,var(--v4-accent,#22c55e) 42%,transparent)}.tm-next-service-kpi strong{font-size:clamp(22px,6vw,31px)}.tm-next-service-kpi span{line-height:1.35}.tm-next-service-kpi [data-next-service-icon]{font-weight:900}.tm-next-service-kpi[data-state="predicted"] [data-next-service-icon]{opacity:.78}';
    document.head.appendChild(style);
    return card;
  }

  function setCard(state){
    const card=ensureCard();if(!card)return;
    const main=card.querySelector('#kNextService'),sub=card.querySelector('#kNextServiceSub'),icon=card.querySelector('[data-next-service-icon]');
    card.dataset.state=state?.kind||'empty';
    if(!state){main.textContent='—';sub.textContent='Sem previsão disponível na escala';icon.textContent='•';card.onclick=null;card.onkeydown=null;return}
    const tag=state.kind==='confirmed'?(state.mark||'SV'):'PREV.';
    main.textContent=dayLabel(state.date);
    sub.textContent=`${tag} · ${GROUPS[state.group]||state.group} · ${LANES[state.lane]||state.lane}`;
    icon.textContent=state.kind==='confirmed'?'✓':'→';
    const open=()=>{try{localStorage.setItem(PERIOD_KEY,JSON.stringify({mode:'day',anchor:state.date}))}catch(_){}location.href='pessoal.html'};
    card.onclick=open;
    card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};
    card.title=`${state.kind==='confirmed'?'Serviço confirmado':'Próximo serviço previsto'} em ${br(state.date)}`;
  }

  async function q(table,select,build){const c=client();if(!c) return [];try{let req=c.from(table).select(select);if(build)req=build(req);const r=await req;return r.error?[]:(r.data||[])}catch(_){return []}}

  function predictedForGroup({group,members,services,vacations,holidaySet,userId,start,end}){
    const rows=members.filter(x=>x.grupo===group).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));
    if(!rows.length)return [];
    const rowMap=new Map(rows.map(r=>[personKey(r),r]));
    const keys=[...rowMap.keys()];
    const userKey=`u:${userId}`;
    if(!keys.includes(userKey)) return [];
    const out=[];
    for(const lane of ['preta','vermelha']){
      const queue=[...keys];
      let confirmed=services.filter(s=>s.grupo===group&&keys.includes(rotationKey(s))&&laneFor(s.data_servico,holidaySet)===lane).slice();
      for(const row of rows){const anchor=inheritedAnchor(row,lane),key=personKey(row);if(anchor&&!confirmed.some(s=>rotationKey(s)===key&&s.data_servico>=anchor))confirmed.push({id:-Number(row.id||0),grupo:group,data_servico:anchor,_rotation_key:key,_inherited:true})}
      confirmed.sort((a,b)=>String(a.data_servico).localeCompare(String(b.data_servico))||Number(a.id||0)-Number(b.id||0));
      if(!confirmed.length) continue;
      const anchorDate=confirmed[0].data_servico;
      confirmed.filter(s=>s.data_servico===anchorDate).forEach(s=>moveToBack(queue,s._rotation_key||rotationKey(s)));
      let date=addDays(anchorDate,1);
      while(date<=end){
        if(laneFor(date,holidaySet)!==lane){date=addDays(date,1);continue}
        const actuals=confirmed.filter(s=>s.data_servico===date);
        if(actuals.length){actuals.forEach(s=>moveToBack(queue,s._rotation_key||rotationKey(s)))}
        else{let idx=-1;for(let i=0;i<queue.length;i++){const row=rowMap.get(queue[i]);if(row&&eligible(vacations,row,date)){idx=i;break}}if(idx>=0){const key=queue[idx];if(key===userKey&&date>=start)out.push({date,group,lane,kind:'predicted',mark:'PREV.'});queue.splice(idx,1);queue.push(key)}}
        date=addDays(date,1);
      }
    }
    return out;
  }

  async function load(){
    if(loading)return;loading=true;ensureCard();
    try{
      const user=readUser(),c=client();if(!user?.id||!c){setCard(null);return}
      const today=todayIso(),from=addDays(today,-365),to=addDays(today,365),uid=Number(user.id);
      const [members,services,holidays,vacations]=await Promise.all([
        q('escala_integrantes','id,grupo,usuario_id,pessoa_externa_id,ordem,ativo,heranca_preta_data,heranca_vermelha_data',x=>x.eq('ativo',true).order('grupo').order('ordem').order('id')),
        q('escala_servicos','id,grupo,usuario_id,pessoa_externa_id,rodizio_usuario_id,rodizio_pessoa_externa_id,data_servico,marcacao,observacao',x=>x.gte('data_servico',from).lte('data_servico',to).order('data_servico').order('grupo').order('id')),
        q('escala_feriados','data',x=>x.gte('data',from).lte('data',to).order('data')),
        q('pessoal_ferias','usuario_id,pessoa_externa_id,data_inicio,data_fim',x=>x.lte('data_inicio',to).gte('data_fim',from).order('data_inicio'))
      ]);
      const holidaySet=new Set(holidays.map(h=>h.data));
      const groups=[...new Set(members.filter(m=>String(m.usuario_id)===String(uid)).map(m=>m.grupo))];
      const candidates=[];
      for(const s of services.filter(s=>String(s.usuario_id)===String(uid)&&s.data_servico>=today)){
        const substituted=!!(s.rodizio_usuario_id||s.rodizio_pessoa_externa_id);
        candidates.push({date:s.data_servico,group:s.grupo,lane:laneFor(s.data_servico,holidaySet),kind:'confirmed',mark:substituted?'TS':(s.marcacao||'SV')});
      }
      for(const group of groups)candidates.push(...predictedForGroup({group,members,services,vacations,holidaySet,userId:uid,start:today,end:to}));
      candidates.sort((a,b)=>a.date.localeCompare(b.date)||eventPriority(a)-eventPriority(b));
      const next=candidates.find((x,i,arr)=>x.kind==='confirmed'||!arr.some(y=>y.kind==='confirmed'&&y.date===x.date&&y.group===x.group))||null;
      setCard(next);
    }finally{loading=false}
  }

  function start(){ensureCard();load().catch(()=>setCard(null));setTimeout(()=>load().catch(()=>{}),3500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('focus',()=>load().catch(()=>{}));
  window.addEventListener('online',()=>load().catch(()=>{}));
})();