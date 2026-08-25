(function(){
'use strict';
const ADITAMENTO_VERSION='7.4';

const $=id=>document.getElementById(id);
const MONTHS=['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
const WEEK=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const SERVICE_ROWS=[
  {grupo:'sargento',funcao:'COMANDANTE'},
  {grupo:'motorista',funcao:'MOTORISTA'},
  {grupo:'patrulheiro',funcao:'PATRULHEIRO'},
  {grupo:'permanencia',funcao:'PERMANÊNCIA'},
  {grupo:'__canil__',funcao:'PERMANÊNCIA/CANIL'}
];

function modal(on=true){$('aditamentoModal')?.classList.toggle('open',on)}
function pad(n){return String(n).padStart(2,'0')}
function iso(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function parseDate(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)}
function addDays(s,n){const d=parseDate(s);d.setDate(d.getDate()+n);return iso(d)}
function fullDate(s){const d=parseDate(s);return `${pad(d.getDate())} DE ${MONTHS[d.getMonth()]} DE ${d.getFullYear()}`}
function shortDate(s){const d=parseDate(s);return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`}
function weekName(s){return WEEK[parseDate(s).getDay()]}
function clean(v){return String(v??'').trim()}
function fileDate(s){const d=parseDate(s);return `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`}
function today(){return iso(new Date())}
function setStatus(text,error=false){const el=$('aditamentoStatus');if(!el)return;el.textContent=text;el.style.color=error?'var(--v4-danger)':'var(--v4-muted)'}
function personKey(x){return x?.usuario_id?`u:${x.usuario_id}`:x?.pessoa_externa_id?`e:${x.pessoa_externa_id}`:''}
function moveToBack(queue,key){const i=queue.indexOf(key);if(i>=0){queue.splice(i,1);queue.push(key)}}

function dataUrlFromBlob(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)})}
async function loadLogo(){
  try{
    const r=await fetch('brasao_exercito.png?v=7.4',{cache:'force-cache'});
    if(!r.ok)throw new Error('brasão indisponível');
    return await dataUrlFromBlob(await r.blob());
  }catch(_){return null}
}

async function fetchRows(table,ids,cols){
  if(!ids.length)return [];
  const r=await supabaseClient.from(table).select(cols).in('id',ids);
  if(r.error)throw r.error;
  return r.data||[];
}

function selectedDays(){
  const rows=[...document.querySelectorAll('[data-aditamento-dia]')];
  const seen=new Set(),days=[];
  for(const row of rows){
    const date=row.querySelector('[data-aditamento-date]')?.value;
    if(!date||seen.has(date))continue;
    seen.add(date);
    days.push({date,includeStandby:!!row.querySelector('[data-aditamento-standby]')?.checked});
  }
  return days.sort((a,b)=>a.date.localeCompare(b.date));
}

function refreshRemoveButtons(){
  const rows=[...document.querySelectorAll('[data-aditamento-dia]')];
  rows.forEach(r=>{const b=r.querySelector('[data-aditamento-remove]');if(b)b.hidden=rows.length<=1});
}

function addDateRow(date,includeStandby=true){
  const host=$('aditamentoDias');if(!host)return;
  const row=document.createElement('div');
  row.className='v731-adit-day';row.dataset.aditamentoDia='1';
  row.innerHTML=`<div class="v731-adit-date"><label>Data</label><input type="date" data-aditamento-date value="${date}"></div>
    <label class="v731-adit-check"><input type="checkbox" data-aditamento-standby ${includeStandby?'checked':''}><span>Incluir sobreaviso deste dia</span></label>
    <button type="button" class="v7-btn danger" data-aditamento-remove aria-label="Remover dia">Remover</button>`;
  row.querySelector('[data-aditamento-remove]').onclick=()=>{row.remove();refreshRemoveButtons()};
  host.appendChild(row);refreshRemoveButtons();
}

function resetDays(){
  const host=$('aditamentoDias');if(!host)return;
  host.innerHTML='';addDateRow(today(),true);
}
function addNextDay(){
  const days=selectedDays(),base=days.length?days[days.length-1].date:today();
  addDateRow(addDays(base,1),true);
}

function isHoliday(context,date){return context.holidaySet.has(date)}
function laneFor(context,date){const d=parseDate(date);return d.getDay()===0||d.getDay()===6||isHoliday(context,date)?'vermelha':'preta'}
function vacationFor(context,row,date){
  return context.vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_inicio<=date&&v.data_fim>=date);
}
function adaptationFor(context,row,date){
  return context.vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&addDays(v.data_fim,1)===date);
}
function eligible(context,row,date){return !vacationFor(context,row,date)&&!adaptationFor(context,row,date)}

async function loadAditamentoContext(dayOptions){
  const dates=dayOptions.map(x=>x.date).sort(),minDate=dates[0],maxDate=dates[dates.length-1];
  const extStart=addDays(minDate,-365),extEnd=maxDate;
  const [srv,history,mis,members,holidays,vacations]=await Promise.all([
    supabaseClient.from('escala_servicos').select('id,grupo,usuario_id,pessoa_externa_id,data_servico,marcacao,observacao').in('data_servico',dates).order('data_servico').order('grupo').order('id'),
    supabaseClient.from('escala_servicos').select('id,grupo,usuario_id,pessoa_externa_id,data_servico,marcacao,observacao').gte('data_servico',extStart).lte('data_servico',extEnd).order('data_servico').order('grupo').order('id'),
    supabaseClient.from('missoes_escala').select('id,titulo,data_inicio,data_fim,local,descricao').lte('data_inicio',maxDate).gte('data_fim',minDate).order('data_inicio').order('id'),
    supabaseClient.from('escala_integrantes').select('id,grupo,usuario_id,pessoa_externa_id,ordem,ativo').eq('ativo',true).order('grupo').order('ordem').order('id'),
    supabaseClient.from('escala_feriados').select('id,data,nome').gte('data',extStart).lte('data',extEnd).order('data'),
    supabaseClient.from('pessoal_ferias').select('id,usuario_id,pessoa_externa_id,data_inicio,data_fim').lte('data_inicio',extEnd).gte('data_fim',extStart).order('data_inicio')
  ]);
  for(const r of [srv,history,mis,members,holidays,vacations])if(r.error)throw r.error;

  const selectedSet=new Set(dates);
  const missions=(mis.data||[]).filter(m=>dates.some(d=>m.data_inicio<=d&&m.data_fim>=d));
  const missionIds=missions.map(x=>x.id);
  let participants=[];
  if(missionIds.length){
    const p=await supabaseClient.from('missao_participantes').select('id,missao_id,usuario_id,pessoa_externa_id').in('missao_id',missionIds).order('id');
    if(p.error)throw p.error;participants=p.data||[];
  }

  const allPeople=[...(srv.data||[]),...(history.data||[]),...(members.data||[]),...participants];
  const userIds=[...new Set(allPeople.map(x=>x.usuario_id).filter(Boolean).map(Number))];
  const externalIds=[...new Set(allPeople.map(x=>x.pessoa_externa_id).filter(Boolean).map(Number))];
  const [users,externals]=await Promise.all([
    fetchRows('usuarios',userIds,'id,patente,nome_guerra,nome_completo'),
    fetchRows('pessoal_nomes_externos',externalIds,'id,patente,nome')
  ]);
  const userMap=new Map(users.map(x=>[String(x.id),x])),externalMap=new Map(externals.map(x=>[String(x.id),x]));
  const person=x=>{
    if(x?.usuario_id){const u=userMap.get(String(x.usuario_id));return{grad:clean(u?.patente),nome:clean(u?.nome_guerra||u?.nome_completo)||`Usuário ${x.usuario_id}`}}
    if(x?.pessoa_externa_id){const e=externalMap.get(String(x.pessoa_externa_id));return{grad:clean(e?.patente),nome:clean(e?.nome)||`Nome ${x.pessoa_externa_id}`}}
    return{grad:'',nome:''};
  };

  const context={
    dates,selectedSet,services:srv.data||[],historyServices:history.data||[],missions,participants,
    members:members.data||[],holidaySet:new Set((holidays.data||[]).map(x=>x.data)),vacations:vacations.data||[],person
  };
  context.days=dayOptions.map(opt=>({date:opt.date,includeStandby:opt.includeStandby,services:context.services.filter(x=>x.data_servico===opt.date)}));
  for(const day of context.days)day.standby=computeStandby(context,day.date);
  return context;
}

function serviceData(context,day,group){
  if(group==='__canil__')return{grad:'',nome:''};
  const rows=day.services.filter(x=>x.grupo===group);
  if(!rows.length)return{grad:'',nome:''};
  const people=rows.map(context.person);
  return{grad:[...new Set(people.map(x=>x.grad).filter(Boolean))].join(' / '),nome:people.map(x=>x.nome).filter(Boolean).join(' / ')};
}

function computeStandby(context,targetDate){
  const result=new Map(),lane=laneFor(context,targetDate);
  for(const rowDef of SERVICE_ROWS){
    const g=rowDef.grupo;
    if(g==='__canil__'){result.set(g,{grad:'',nome:''});continue}
    const targetActuals=context.services.filter(x=>x.data_servico===targetDate&&x.grupo===g);
    if(!targetActuals.length){result.set(g,{grad:'',nome:''});continue}

    const rows=context.members.filter(x=>x.grupo===g).sort((a,b)=>(a.ordem||100)-(b.ordem||100)||Number(a.id)-Number(b.id));
    const keys=rows.map(personKey).filter(Boolean);
    if(!keys.length){result.set(g,{grad:'',nome:''});continue}
    let queue=[...keys];
    const confirmed=context.historyServices.filter(x=>x.grupo===g&&keys.includes(personKey(x))&&laneFor(context,x.data_servico)===lane&&x.data_servico<=targetDate)
      .sort((a,b)=>a.data_servico.localeCompare(b.data_servico)||Number(a.id)-Number(b.id));
    if(!confirmed.length){result.set(g,{grad:'',nome:''});continue}

    const anchor=confirmed[0].data_servico;
    let date=anchor;
    while(date<=targetDate){
      if(laneFor(context,date)!==lane){date=addDays(date,1);continue}
      const actuals=confirmed.filter(x=>x.data_servico===date);
      if(actuals.length){actuals.forEach(a=>moveToBack(queue,personKey(a)))}
      else if(date<targetDate){
        let idx=-1;
        for(let i=0;i<queue.length;i++){
          const row=rows.find(r=>personKey(r)===queue[i]);
          if(row&&eligible(context,row,date)){idx=i;break}
        }
        if(idx>=0){const [key]=queue.splice(idx,1);queue.push(key)}
      }
      date=addDays(date,1);
    }

    let standbyRow=null;
    const actualKeys=new Set(targetActuals.map(personKey));
    for(const key of queue){
      const row=rows.find(r=>personKey(r)===key);
      if(row&&!actualKeys.has(key)&&eligible(context,row,targetDate)){standbyRow=row;break}
    }
    result.set(g,standbyRow?context.person(standbyRow):{grad:'',nome:''});
  }
  return result;
}

function missionPeople(context,missionId){
  return context.participants.filter(x=>String(x.missao_id)===String(missionId)).map(context.person).map(x=>[x.grad,x.nome].filter(Boolean).join(' '));
}

function docHelpers(doc){
  const pageW=210,pageH=297;
  function border(){doc.setDrawColor(15,23,42);doc.setLineWidth(.55);doc.rect(8,7,pageW-16,pageH-14);doc.setLineWidth(.18);doc.rect(10,9,pageW-20,pageH-18)}
  function newPage(){doc.addPage();border();return 17}
  function ensure(y,need){return y+need>280?newPage():y}
  function center(text,y,size=10,bold=false){doc.setFont('times',bold?'bold':'normal');doc.setFontSize(size);doc.text(String(text),pageW/2,y,{align:'center'});return y}
  return{pageW,pageH,border,newPage,ensure,center};
}

function drawServiceTable(doc,context,day,y,standby=false){
  const x=[17,72,94,193],headH=7,rowH=7;
  doc.setFillColor(225,225,225);doc.rect(x[0],y,x[3]-x[0],headH,'F');doc.setDrawColor(40);doc.setLineWidth(.2);doc.rect(x[0],y,x[3]-x[0],headH);
  for(let i=1;i<x.length-1;i++)doc.line(x[i],y,x[i],y+headH);
  doc.setFont('times','bold');doc.setFontSize(9.3);doc.text('FUNÇÃO',(x[0]+x[1])/2,y+4.7,{align:'center'});doc.text('GRAD.',(x[1]+x[2])/2,y+4.7,{align:'center'});doc.text('NOME',(x[2]+x[3])/2,y+4.7,{align:'center'});y+=headH;
  doc.setFont('times','normal');doc.setFontSize(9.2);
  for(const row of SERVICE_ROWS){
    const p=standby?(day.standby.get(row.grupo)||{grad:'',nome:''}):serviceData(context,day,row.grupo);
    doc.rect(x[0],y,x[3]-x[0],rowH);for(let i=1;i<x.length-1;i++)doc.line(x[i],y,x[i],y+rowH);
    doc.text(row.funcao,(x[0]+x[1])/2,y+4.7,{align:'center'});doc.text(p.grad,(x[1]+x[2])/2,y+4.7,{align:'center'});
    const nameLines=doc.splitTextToSize(p.nome,x[3]-x[2]-4);doc.text(nameLines,(x[2]+x[3])/2,y+(nameLines.length>1?3.3:4.7),{align:'center'});y+=rowH;
  }
  return y;
}

async function buildPdf(context){
  if(!window.jspdf?.jsPDF)throw new Error('Biblioteca de PDF não carregou. Atualize a página e tente novamente.');
  const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'}),h=docHelpers(doc);
  h.border();let y=14;
  const logo=await loadLogo();
  if(logo){try{doc.addImage(logo,'PNG',96,13,18,19)}catch(_){}}
  y=36;h.center('MINISTÉRIO DA DEFESA',y,10,false);y+=4;h.center('EXÉRCITO BRASILEIRO',y,10,false);y+=4;h.center('26º PELOTÃO DE POLÍCIA DO EXÉRCITO MECANIZADO',y,10,true);y+=8;

  const firstDate=context.days[0].date,boletimDate=addDays(firstDate,-1);
  const intro=`ADITAMENTO AO BOLETIM INTERNO DA 6ª BRIGADA DE INFANTARIA BLINDADA,\nDO DIA ${fullDate(boletimDate)}, PARA O CONHECIMENTO DO PELOTÃO E A DEVIDA\nEXECUÇÃO, PUBLICO O SEGUINTE:`;
  doc.setFont('times','bold');doc.setFontSize(9.6);doc.text(intro.split('\n'),105,y,{align:'center'});y+=15;
  h.center('1ª PARTE - SERVIÇOS DIÁRIOS',y,10.5,true);y+=8;

  // Primeiro apresenta TODOS os serviços selecionados, em ordem de data.
  for(const day of context.days){
    y=h.ensure(y,58);
    h.center(`SERVIÇO PARA O DIA ${fullDate(day.date)} (${weekName(day.date)})`,y,9.6,true);y+=3;
    y=drawServiceTable(doc,context,day,y,false);
    y+=5;doc.setFont('times','bold');doc.setFontSize(9.5);doc.text('- PASSAGEM DE SERVIÇO ÀS 08:00h.',17,y);y+=12;
  }

  // Somente depois de todos os serviços, apresenta os Sobreavisos marcados.
  const standbyDays=context.days.filter(day=>day.includeStandby);
  for(const day of standbyDays){
    y=h.ensure(y,54);
    h.center(`SOBREAVISO PARA O DIA ${fullDate(day.date)} (${weekName(day.date)})`,y,9.6,true);y+=3;
    y=drawServiceTable(doc,context,day,y,true);y+=10;
  }

  y=h.ensure(y,30);h.center('2ª PARTE - INSTRUÇÃO:',y,10,true);doc.setFont('times','normal');doc.setFontSize(9.5);doc.text('Sem alteração.',105,y+4,{align:'center'});y+=14;
  h.center('3ª PARTE - ASSUNTOS GERAIS E ADMINISTRATIVOS:',y,10,true);y+=8;
  if(!context.missions.length){doc.setFont('times','normal');doc.setFontSize(9.5);doc.text('Sem alteração.',105,y,{align:'center'});y+=8}
  else{
    for(const m of context.missions){
      const people=missionPeople(context,m.id),period=m.data_inicio===m.data_fim?shortDate(m.data_inicio):`${shortDate(m.data_inicio)} a ${shortDate(m.data_fim)}`;
      const lines=[['Missão:',m.titulo],['Data:',period],['Local:',clean(m.local)||'-'],['Militares:',people.length?people.join(', '):'Nenhum participante cadastrado']];
      if(clean(m.descricao))lines.push(['Observação:',m.descricao]);
      doc.setFont('times','normal');doc.setFontSize(9.3);
      const estimated=lines.reduce((n,[a,b])=>n+Math.max(1,doc.splitTextToSize(`${a} ${b}`,171).length)*4.2,0)+4;
      y=h.ensure(y,estimated);
      for(const [label,value] of lines){
        doc.setFont('times','bold');doc.setFontSize(9.3);doc.text(label,17,y);
        doc.setFont('times','normal');const w=171-doc.getTextWidth(label+' '),wrapped=doc.splitTextToSize(String(value),Math.max(60,w));doc.text(wrapped,17+doc.getTextWidth(label+' '),y);y+=Math.max(1,wrapped.length)*4.2;
      }
      y+=4;
    }
  }

  y=h.ensure(y,34);y+=3;h.center('4ª PARTE - JUSTIÇA E DISCIPLINA:',y,10,true);doc.setFont('times','normal');doc.setFontSize(9.5);doc.text('Sem alteração.',105,y+4,{align:'center'});y+=24;
  h.center('GUILLEN GABRIEL DOS SANTOS SILVA - 1º Ten',y,10.5,true);y+=4.5;h.center('Comandante do 26º Pelotão de Polícia do Exército Mecanizado',y,9.5,false);
  return doc;
}

async function generate(){
  const btn=$('aditamentoGerar');if(btn?.disabled)return;
  const days=selectedDays();
  if(!days.length)return alert('Adicione pelo menos um dia ao aditamento.');
  if(new Set(days.map(x=>x.date)).size!==days.length)return alert('Não repita a mesma data no aditamento.');
  try{
    if(btn){btn.disabled=true;btn.textContent='Gerando PDF...'}
    setStatus(`Buscando ${days.length} dia(s) de serviço, sobreaviso e missões...`);
    const context=await loadAditamentoContext(days),doc=await buildPdf(context);
    const blob=doc.output('blob'),url=URL.createObjectURL(blob),a=document.createElement('a');
    const first=days[0].date,last=days[days.length-1].date,suffix=first===last?fileDate(first):`${fileDate(first)}_a_${fileDate(last)}`;
    a.href=url;a.download=`Aditamento_${suffix}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    const standbyCount=days.filter(x=>x.includeStandby).length;
    setStatus(`PDF gerado com ${days.length} dia(s), ${standbyCount} bloco(s) de sobreaviso e ${context.missions.length} missão(ões).`);
    modal(false);
  }catch(e){console.error(e);setStatus(e.message||'Não foi possível gerar o aditamento.',true);alert('Erro ao gerar aditamento: '+(e.message||e));}
  finally{if(btn){btn.disabled=false;btn.textContent='Gerar PDF'}}
}

function updateLabels(){
  resetDays();
  setStatus('Adicione quantos dias precisar. Marque individualmente quais datas devem sair com Sobreaviso.');
}
function bind(){
  const open=$('generateAddendum');if(!open)return;
  open.onclick=()=>{updateLabels();modal(true)};
  $('aditamentoAddDia').onclick=addNextDay;
  $('aditamentoGerar').onclick=generate;
  $('aditamentoCancelar').onclick=()=>modal(false);
  $('aditamentoClose').onclick=()=>modal(false);
  $('aditamentoModal').onclick=e=>{if(e.target===$('aditamentoModal'))modal(false)};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
