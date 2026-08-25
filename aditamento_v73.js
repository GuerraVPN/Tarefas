(function(){
'use strict';

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
function selectedDate(){return $('aditamentoDia')?.value==='tomorrow'?addDays(today(),1):today()}
function setStatus(text,error=false){const el=$('aditamentoStatus');if(!el)return;el.textContent=text;el.style.color=error?'var(--v4-danger)':'var(--v4-muted)'}

function dataUrlFromBlob(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)})}
async function loadLogo(){
  try{
    const r=await fetch('brasao_exercito.png?v=7.3',{cache:'force-cache'});
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

async function loadAditamentoData(date){
  const [srv,mis]=await Promise.all([
    supabaseClient.from('escala_servicos').select('id,grupo,usuario_id,pessoa_externa_id,data_servico,marcacao,observacao').eq('data_servico',date).order('grupo').order('id'),
    supabaseClient.from('missoes_escala').select('id,titulo,data_inicio,data_fim,local,descricao').lte('data_inicio',date).gte('data_fim',date).order('data_inicio').order('id')
  ]);
  if(srv.error)throw srv.error;if(mis.error)throw mis.error;
  const services=srv.data||[],missions=mis.data||[],missionIds=missions.map(x=>x.id);
  let participants=[];
  if(missionIds.length){
    const p=await supabaseClient.from('missao_participantes').select('id,missao_id,usuario_id,pessoa_externa_id').in('missao_id',missionIds).order('id');
    if(p.error)throw p.error;participants=p.data||[];
  }
  const userIds=[...new Set([...services,...participants].map(x=>x.usuario_id).filter(Boolean).map(Number))];
  const externalIds=[...new Set([...services,...participants].map(x=>x.pessoa_externa_id).filter(Boolean).map(Number))];
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
  return{date,services,missions,participants,person};
}

function serviceData(data,group){
  if(group==='__canil__')return{grad:'',nome:''};
  const rows=data.services.filter(x=>x.grupo===group);
  if(!rows.length)return{grad:'',nome:''};
  const people=rows.map(data.person);
  return{
    grad:[...new Set(people.map(x=>x.grad).filter(Boolean))].join(' / '),
    nome:people.map(x=>x.nome).filter(Boolean).join(' / ')
  };
}

function missionPeople(data,missionId){
  return data.participants.filter(x=>String(x.missao_id)===String(missionId)).map(data.person)
    .map(x=>[x.grad,x.nome].filter(Boolean).join(' '));
}

function docHelpers(doc){
  const pageW=210,pageH=297,margin=14,innerL=17,innerR=193;
  function border(){doc.setDrawColor(15,23,42);doc.setLineWidth(.55);doc.rect(8,7,pageW-16,pageH-14);doc.setLineWidth(.18);doc.rect(10,9,pageW-20,pageH-18)}
  function newPage(){doc.addPage();border();return 17}
  function ensure(y,need){return y+need>280?newPage():y}
  function center(text,y,size=10,bold=false){doc.setFont('times',bold?'bold':'normal');doc.setFontSize(size);doc.text(String(text),pageW/2,y,{align:'center'});return y}
  function wrapped(text,x,y,width,size=9,bold=false,lineGap=4){doc.setFont('times',bold?'bold':'normal');doc.setFontSize(size);const lines=doc.splitTextToSize(String(text),width);doc.text(lines,x,y);return y+(Math.max(1,lines.length)-1)*lineGap}
  return{pageW,pageH,margin,innerL,innerR,border,newPage,ensure,center,wrapped};
}

async function buildPdf(data){
  if(!window.jspdf?.jsPDF)throw new Error('Biblioteca de PDF não carregou. Atualize a página e tente novamente.');
  const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'}),h=docHelpers(doc);
  h.border();let y=14;
  const logo=await loadLogo();
  if(logo){try{doc.addImage(logo,'PNG',96,13,18,19)}catch(_){}}
  y=36;h.center('MINISTÉRIO DA DEFESA',y,10,false);y+=4;h.center('EXÉRCITO BRASILEIRO',y,10,false);y+=4;h.center('26º PELOTÃO DE POLÍCIA DO EXÉRCITO MECANIZADO',y,10,true);y+=8;

  const boletimDate=addDays(data.date,-1);
  const intro=`ADITAMENTO AO BOLETIM INTERNO DA 6ª BRIGADA DE INFANTARIA BLINDADA,\nDO DIA ${fullDate(boletimDate)}, PARA O CONHECIMENTO DO PELOTÃO E A DEVIDA\nEXECUÇÃO, PUBLICO O SEGUINTE:`;
  doc.setFont('times','bold');doc.setFontSize(9.6);doc.text(intro.split('\n'),105,y,{align:'center'});y+=15;
  h.center('1ª PARTE - SERVIÇOS DIÁRIOS',y,10.5,true);y+=7;
  h.center(`SERVIÇO PARA O DIA ${fullDate(data.date)} (${weekName(data.date)})`,y,9.6,true);y+=3;

  const x=[17,72,94,193],headH=7,rowH=7;
  doc.setFillColor(225,225,225);doc.rect(x[0],y,x[3]-x[0],headH,'F');doc.setDrawColor(40);doc.setLineWidth(.2);doc.rect(x[0],y,x[3]-x[0],headH);
  for(let i=1;i<x.length-1;i++)doc.line(x[i],y,x[i],y+headH);
  doc.setFont('times','bold');doc.setFontSize(9.3);doc.text('FUNÇÃO',(x[0]+x[1])/2,y+4.7,{align:'center'});doc.text('GRAD.',(x[1]+x[2])/2,y+4.7,{align:'center'});doc.text('NOME',(x[2]+x[3])/2,y+4.7,{align:'center'});y+=headH;

  doc.setFont('times','normal');doc.setFontSize(9.2);
  for(const row of SERVICE_ROWS){
    const p=serviceData(data,row.grupo);doc.rect(x[0],y,x[3]-x[0],rowH);for(let i=1;i<x.length-1;i++)doc.line(x[i],y,x[i],y+rowH);
    doc.text(row.funcao,(x[0]+x[1])/2,y+4.7,{align:'center'});doc.text(p.grad,(x[1]+x[2])/2,y+4.7,{align:'center'});
    const nameLines=doc.splitTextToSize(p.nome,x[3]-x[2]-4);doc.text(nameLines,(x[2]+x[3])/2,y+(nameLines.length>1?3.3:4.7),{align:'center'});y+=rowH;
  }
  y+=5;doc.setFont('times','bold');doc.setFontSize(9.5);doc.text('- PASSAGEM DE SERVIÇO ÀS 08:00h.',17,y);y+=12;

  h.center('2ª PARTE - INSTRUÇÃO:',y,10,true);doc.setFont('times','normal');doc.setFontSize(9.5);doc.text('Sem alteração.',105,y+4,{align:'center'});y+=14;

  h.center('3ª PARTE - ASSUNTOS GERAIS E ADMINISTRATIVOS:',y,10,true);y+=8;
  if(!data.missions.length){doc.setFont('times','normal');doc.setFontSize(9.5);doc.text('Sem alteração.',105,y,{align:'center'});y+=8}
  else{
    for(const m of data.missions){
      const people=missionPeople(data,m.id),period=m.data_inicio===m.data_fim?shortDate(m.data_inicio):`${shortDate(m.data_inicio)} a ${shortDate(m.data_fim)}`;
      const lines=[
        ['Missão:',m.titulo],
        ['Data:',period],
        ['Local:',clean(m.local)||'-'],
        ['Militares:',people.length?people.join(', '):'Nenhum participante cadastrado']
      ];
      if(clean(m.descricao))lines.push(['Observação:',m.descricao]);
      doc.setFont('times','normal');doc.setFontSize(9.3);
      let estimated=lines.reduce((n,[a,b])=>n+Math.max(1,doc.splitTextToSize(`${a} ${b}`,171).length)*4.2,0)+4;
      y=h.ensure(y,estimated);
      for(const [label,value] of lines){
        doc.setFont('times','bold');doc.setFontSize(9.3);doc.text(label,17,y);
        doc.setFont('times','normal');const w=171-doc.getTextWidth(label+' ');const wrapped=doc.splitTextToSize(String(value),Math.max(60,w));doc.text(wrapped,17+doc.getTextWidth(label+' '),y);y+=Math.max(1,wrapped.length)*4.2;
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
  const date=selectedDate();
  try{
    if(btn){btn.disabled=true;btn.textContent='Gerando PDF...'}
    setStatus(`Buscando serviço confirmado e missões de ${shortDate(date)}...`);
    const data=await loadAditamentoData(date);
    const doc=await buildPdf(data);
    const blob=doc.output('blob'),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`Aditamento_${fileDate(date)}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    setStatus(`PDF gerado: ${data.services.length} serviço(s) confirmado(s) e ${data.missions.length} missão(ões).`);
    modal(false);
  }catch(e){console.error(e);setStatus(e.message||'Não foi possível gerar o aditamento.',true);alert('Erro ao gerar aditamento: '+(e.message||e));}
  finally{if(btn){btn.disabled=false;btn.textContent='Gerar PDF'}}
}

function updateLabels(){
  const t=today(),tm=addDays(t,1),sel=$('aditamentoDia');if(!sel)return;
  sel.innerHTML=`<option value="today">Hoje - ${shortDate(t)} (${weekName(t)})</option><option value="tomorrow">Amanhã - ${shortDate(tm)} (${weekName(tm)})</option>`;
  setStatus('O PDF usa somente serviços confirmados. Previsões da escala não entram no aditamento.');
}
function bind(){
  const open=$('generateAddendum');if(!open)return;
  open.onclick=()=>{updateLabels();modal(true)};
  $('aditamentoGerar').onclick=generate;
  $('aditamentoCancelar').onclick=()=>modal(false);
  $('aditamentoClose').onclick=()=>modal(false);
  $('aditamentoModal').onclick=e=>{if(e.target===$('aditamentoModal'))modal(false)};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
