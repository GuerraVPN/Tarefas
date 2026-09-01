from pathlib import Path

p=Path('pessoal_v7.js')
s=p.read_text()

def rep(old,new):
    global s
    if old not in s:
        raise SystemExit('Trecho não encontrado:\n'+old[:240])
    s=s.replace(old,new,1)

rep("const ESCALA_UI_VERSION='7.5.9';","const ESCALA_UI_VERSION='7.5.10';")
rep("let projections=new Map(),dutyDates=new Map(),nextDuty=new Map();","let projections=new Map(),dutyDates=new Map(),nextDuty=new Map(),nextForecast=new Map(),nextConfirmedDuty=new Map();")
rep("""function projectedNear(row,date){
 const key=personKey(row);
 if(rotationServices.some(x=>samePerson(x,row)&&Math.abs(diffDays(x.data_servico,date))<=2))return true;
 for(const list of projections.values())for(const x of list){const d=x?.item?.data_servico||x?.date;if(x?.key===key&&d&&Math.abs(diffDays(d,date))<=2)return true}
 return false;
}
function eligible(row,date,checkInterval=false){return !vacationFor(row,date)&&!adaptationFor(row,date)&&(!checkInterval||!projectedNear(row,date))}
""","""function confirmedNear(row,date){
 return rotationServices.some(x=>samePerson(x,row)&&Math.abs(diffDays(x.data_servico,date))<=2);
}
function forecastNear(row,date){
 const key=personKey(row);
 for(const list of projections.values())for(const x of list){
  const d=x?.item?.data_servico||x?.date;
  if(x?.type==='predicted'&&x?.key===key&&d&&Math.abs(diffDays(d,date))<=2)return true;
 }
 return false;
}
function eligible(row,date,checkInterval=false){return !vacationFor(row,date)&&!adaptationFor(row,date)&&(!checkInterval||(!confirmedNear(row,date)&&!forecastNear(row,date)))}
""")
rep("""function previousDuty(row,g,date,lane){
 const list=dutyDates.get(g+'|'+lane+'|'+personKey(row))||[];
 const real=[...list].reverse().find(x=>x.date<date&&x.type==='actual')||null;
 const inherited=inheritedAnchor(row,lane);
 if(inherited&&inherited.date<date&&(!real||inherited.date>real.date))return inherited;
 return real;
}
""","""function previousDuty(row,g,date,lane){
 const real=rotationServices
  .filter(x=>x.grupo===g&&samePerson(x,row)&&scaleLane(x.data_servico)===lane&&x.data_servico<date)
  .sort((a,b)=>b.data_servico.localeCompare(a.data_servico)||Number(b.id||0)-Number(a.id||0))[0]||null;
 const actual=real?{date:real.data_servico,type:'actual',item:real,lane}:null;
 const inherited=inheritedAnchor(row,lane);
 if(inherited&&inherited.date<date&&(!actual||inherited.date>actual.date))return inherited;
 return actual;
}
""")
rep("""function buildAllProjections(){
 projections=new Map();dutyDates=new Map();nextDuty=new Map();
 for(const g of ORDER){buildProjection(g,'preta');buildProjection(g,'vermelha')}
}
""","""function buildAllProjections(){
 projections=new Map();dutyDates=new Map();nextDuty=new Map();nextForecast=new Map();nextConfirmedDuty=new Map();
 for(const g of ORDER){buildProjection(g,'preta');buildProjection(g,'vermelha')}
}
""")
rep(""" for(const [key,list] of localDuty){
   list.sort((a,b)=>a.date.localeCompare(b.date));dutyDates.set(g+'|'+lane+'|'+key,list);
   const next=list.find(x=>x.date>=today);if(next)nextDuty.set(g+'|'+lane+'|'+key,next);
 }
""",""" for(const [key,list] of localDuty){
   list.sort((a,b)=>a.date.localeCompare(b.date));dutyDates.set(g+'|'+lane+'|'+key,list);
   const next=list.find(x=>x.date>=today);if(next)nextDuty.set(g+'|'+lane+'|'+key,next);
   const confirmedNext=list.find(x=>x.date>=today&&x.type==='actual');if(confirmedNext)nextConfirmedDuty.set(g+'|'+lane+'|'+key,confirmedNext);
   const forecast=list.find(x=>x.date>=today&&x.type==='predicted');if(forecast)nextForecast.set(g+'|'+lane+'|'+key,forecast);
 }
""")
rep("""function nextMeta(row,g){
 const vac=vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_fim>=todayIso());
 if(vac&&vac.data_inicio<=todayIso()&&vac.data_fim>=todayIso())return `<span class=\"v721-person-meta vac\">Férias até ${br(vac.data_fim)} · ADP ${br(addDays(vac.data_fim,1))}</span>`;
 const key=personKey(row),black=nextDuty.get(g+'|preta|'+key),red=nextDuty.get(g+'|vermelha|'+key),parts=[];
 if(row.heranca_origem)parts.push(`Vaga herdada de ${row.heranca_origem}`);
 if(black)parts.push(`Preta: ${br(black.date)}${black.type==='predicted'?' prev.':''}`);
 if(red)parts.push(`Vermelha: ${br(red.date)}${red.type==='predicted'?' prev.':''}`);
 return parts.length?`<span class=\"v721-person-meta next\">${parts.join(' · ')}</span>`:'<span class=\"v721-person-meta\">Sem projeção — confirme um serviço em cada escala</span>';
}
""","""function nextMeta(row,g){
 const vac=vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_fim>=todayIso());
 if(vac&&vac.data_inicio<=todayIso()&&vac.data_fim>=todayIso())return `<span class=\"v721-person-meta vac\">Férias até ${br(vac.data_fim)} · ADP ${br(addDays(vac.data_fim,1))}</span>`;
 const key=personKey(row),parts=[];
 if(row.heranca_origem)parts.push(`Vaga herdada de ${row.heranca_origem}`);
 for(const lane of ['preta','vermelha']){
  const label=lane==='preta'?'Preta':'Vermelha';
  const confirmed=nextConfirmedDuty.get(g+'|'+lane+'|'+key),forecast=nextForecast.get(g+'|'+lane+'|'+key);
  if(confirmed&&forecast)parts.push(`${label}: conf. ${br(confirmed.date)} · prev. ${br(forecast.date)}`);
  else if(confirmed)parts.push(`${label}: conf. ${br(confirmed.date)}`);
  else if(forecast)parts.push(`${label}: prev. ${br(forecast.date)}`);
 }
 return parts.length?`<span class=\"v721-person-meta next\">${parts.join(' · ')}</span>`:'<span class=\"v721-person-meta\">Sem previsão — confirme um serviço inicial desta escala</span>';
}
""")
rep("""function renderSummary(){
 const uniqueMembers=new Set(members.map(personKey)),uniqueOnService=new Set(services.map(personKey));
 $('sumScalePeople').textContent=uniqueMembers.size;$('sumServices').textContent=services.length;$('sumPeopleOnService').textContent=uniqueOnService.size;
 let total=0,now=todayIso();
 for(const g of ORDER)for(const row of members.filter(x=>x.grupo===g))for(const lane of ['preta','vermelha']){
   const list=dutyDates.get(g+'|'+lane+'|'+personKey(row))||[],prev=previousDuty(row,g,addDays(now,1),lane),next=list.find(x=>x.date>now);
   if(prev&&next)total+=countLaneDays(prev.date,next.date,lane);
 }
 $('sumFolgas').textContent=total;
}
""","""function renderSummary(){
 const uniqueMembers=new Set(members.map(personKey)),uniqueOnService=new Set(services.map(personKey));
 $('sumScalePeople').textContent=uniqueMembers.size;$('sumServices').textContent=services.length;$('sumPeopleOnService').textContent=uniqueOnService.size;
 let total=0;
 for(const g of ORDER)for(const row of members.filter(x=>x.grupo===g))for(const lane of ['preta','vermelha']){
   const forecast=nextForecast.get(g+'|'+lane+'|'+personKey(row));
   if(!forecast)continue;
   const prev=previousDuty(row,g,forecast.date,lane);
   if(prev)total+=countLaneDays(prev.date,forecast.date,lane);
 }
 $('sumFolgas').textContent=total;
}
""")
rep("title=`${f}º dia da ${scaleLaneName(date)} desde o último serviço desta mesma escala`","title=`${f}º dia da ${scaleLaneName(date)} desde o último serviço confirmado desta mesma escala`")

p.write_text(s)

h=Path('pessoal.html')
t=h.read_text().replace('pessoal_v7.js?v=7.5.9','pessoal_v7.js?v=7.5.10')
h.write_text(t)

v=Path('v7_5_1_version.js')
z=v.read_text().replace('__TAREFAS_V759_VERSION__','__TAREFAS_V7510_VERSION__').replace("VERSION='7.5.9'","VERSION='7.5.10'")
v.write_text(z)
