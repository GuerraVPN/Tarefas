from pathlib import Path


def replace(path, old, new, count=None):
    p=Path(path); s=p.read_text(encoding='utf-8')
    if old not in s:
        raise SystemExit(f'{path}: trecho não encontrado: {old[:180]}')
    s=s.replace(old,new) if count is None else s.replace(old,new,count)
    p.write_text(s,encoding='utf-8')

# Documento da lavanderia: escolha ODT ou PDF no mesmo fluxo, site e app.
p=Path('lavanderia_documento_v762.js')
s=p.read_text(encoding='utf-8')
s=s.replace('TAREFAS WEB 7.6.2 / Android 2.1.3','TAREFAS WEB 7.6.4 / Android 2.1.5')
old="""async function generate(){
  const id=currentRequestId();
  if(!id)throw new Error('Selecione uma lavagem antes de gerar a folha.');
  const {request,items}=await fetchData(id),blob=buildOdt(request,items),filename=`Forro_de_Cama_para_Lavar_${safeName(id)}.odt`;
  const path=await save(blob,filename);
  toast(`Arquivo ODT gerado: ${path}`);
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest('#lavPrint'):null;
  if(!target)return;
  event.preventDefault();event.stopImmediatePropagation();
  const old=target.textContent;target.disabled=true;target.textContent='⏳ Gerando ODT…';
  generate().catch(err=>toast(err?.message||'Não foi possível gerar o arquivo ODT.',true)).finally(()=>{target.disabled=false;target.textContent=old});
},true);
"""
new="""function winAnsi(value){
  const map={0x20ac:0x80,0x201a:0x82,0x0192:0x83,0x201e:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02c6:0x88,0x2030:0x89,0x0160:0x8a,0x2039:0x8b,0x0152:0x8c,0x017d:0x8e,0x2018:0x91,0x2019:0x92,0x201c:0x93,0x201d:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02dc:0x98,0x2122:0x99,0x0161:0x9a,0x203a:0x9b,0x0153:0x9c,0x017e:0x9e,0x0178:0x9f};
  let out='';
  for(const ch of String(value??'')){
    const cp=ch.codePointAt(0),b=cp<=255?cp:(map[cp]??63);
    out+=String.fromCharCode(b);
  }
  return out;
}
function pdfLiteral(value){
  const clean=winAnsi(value).split(String.fromCharCode(13)).join(' ').split(String.fromCharCode(10)).join(' ');
  let out='';for(const ch of clean){if(ch.charCodeAt(0)===92||ch==='('||ch===')')out+=String.fromCharCode(92)+ch;else out+=ch}return out;
}
function pdfBytes(value){const out=new Uint8Array(value.length);for(let i=0;i<value.length;i++)out[i]=value.charCodeAt(i)&255;return out}
function buildPdf(request,items){
  const pageW=595,pageH=842,x=55,top=755,w=485,matW=355,rowH=28;
  const cmds=[];
  const text=(font,size,tx,ty,value)=>cmds.push(`BT /${font} ${size} Tf 1 0 0 1 ${tx} ${ty} Tm (${pdfLiteral(value)}) Tj ET`);
  const line=(x1,y1,x2,y2)=>cmds.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  text('F2',18,176,800,'Forro de Cama para Lavar');
  let y=top;
  const rows=[['Material','Quantidade'],...items.map(i=>[String(i.material??''),String(i.quantidade??'')])];
  for(let r=0;r<rows.length;r++){
    const y2=y-rowH;
    line(x,y,x+w,y);line(x,y2,x+w,y2);line(x,y,x,y2);line(x+matW,y,x+matW,y2);line(x+w,y,x+w,y2);
    text(r===0?'F2':'F1',11,x+10,y-18,rows[r][0]);
    text(r===0?'F2':'F1',11,x+matW+30,y-18,rows[r][1]);
    y=y2;
  }
  y-=55;
  line(165,y,430,y);text('F1',10,232,y-16,'Quem mandou lavar');
  y-=82;
  line(165,y,430,y);text('F1',10,251,y-16,'Quem recebeu');
  const stream=cmds.join('\n');
  const objects=[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${pdfBytes(stream).length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf='%PDF-1.4\n%âãÏÓ\n',offsets=[0];
  for(let i=0;i<objects.length;i++){offsets.push(pdfBytes(pdf).length);pdf+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`}
  const xref=pdfBytes(pdf).length;
  pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
  pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdfBytes(pdf)],{type:'application/pdf'});
}
function ensureChooser(){
  let modal=document.getElementById('lavDocFormatModal');
  if(modal)return modal;
  const style=document.createElement('style');style.textContent=`
   #lavDocFormatModal{position:fixed;inset:0;z-index:10060;background:rgba(2,8,23,.72);display:none;align-items:center;justify-content:center;padding:20px}
   #lavDocFormatModal.open{display:flex}#lavDocFormatModal .lav-doc-card{width:min(430px,100%);background:#111827;color:#f8fafc;border:1px solid rgba(148,163,184,.28);border-radius:18px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.45)}
   #lavDocFormatModal h3{margin:0 0 8px;font-size:20px}#lavDocFormatModal p{margin:0 0 18px;color:#cbd5e1;line-height:1.45}
   #lavDocFormatModal .lav-doc-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px}#lavDocFormatModal button{border:0;border-radius:13px;padding:14px 12px;font-weight:800;cursor:pointer}
   #lavDocFormatModal [data-format=odt]{background:#facc15;color:#111827}#lavDocFormatModal [data-format=pdf]{background:#e5e7eb;color:#111827}#lavDocFormatModal .lav-doc-close{margin-top:12px;width:100%;background:#334155;color:#fff}
  `;document.head.appendChild(style);
  modal=document.createElement('div');modal.id='lavDocFormatModal';modal.innerHTML='<div class="lav-doc-card" role="dialog" aria-modal="true" aria-labelledby="lavDocFormatTitle"><h3 id="lavDocFormatTitle">Escolha o formato</h3><p>Gere a folha “Forro de Cama para Lavar” em ODT editável ou PDF pronto para visualizar e imprimir.</p><div class="lav-doc-actions"><button type="button" data-format="odt">📝 ODT</button><button type="button" data-format="pdf">📄 PDF</button></div><button type="button" class="lav-doc-close">Cancelar</button></div>';
  document.body.appendChild(modal);
  modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('.lav-doc-close'))modal.classList.remove('open')});
  return modal;
}
async function generate(format){
  const id=currentRequestId();
  if(!id)throw new Error('Selecione uma lavagem antes de gerar a folha.');
  const {request,items}=await fetchData(id);
  const pdf=format==='pdf',blob=pdf?buildPdf(request,items):buildOdt(request,items),ext=pdf?'pdf':'odt';
  const filename=`Forro_de_Cama_para_Lavar_${safeName(id)}.${ext}`,path=await save(blob,filename);
  toast(`Arquivo ${ext.toUpperCase()} gerado: ${path}`);
}
async function runFormat(format,button){
  const old=button.textContent;button.disabled=true;button.textContent=`⏳ Gerando ${format.toUpperCase()}…`;
  try{await generate(format);ensureChooser().classList.remove('open')}catch(err){toast(err?.message||`Não foi possível gerar o arquivo ${format.toUpperCase()}.`,true)}finally{button.disabled=false;button.textContent=old}
}

document.addEventListener('click',event=>{
  const trigger=event.target instanceof Element?event.target.closest('#lavPrint'):null;
  if(trigger){event.preventDefault();event.stopImmediatePropagation();ensureChooser().classList.add('open');return}
  const choice=event.target instanceof Element?event.target.closest('#lavDocFormatModal [data-format]'):null;
  if(choice){event.preventDefault();runFormat(choice.dataset.format,choice)}
},true);
"""
if old not in s: raise SystemExit('lavanderia_documento_v762.js: bloco generate antigo não encontrado')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Cache/versionamento Web 7.6.4.
for path in ['orcamentarios.html','games.html','games.js','v6_2_mobile.js']:
    p=Path(path); t=p.read_text(encoding='utf-8').replace('7.6.3','7.6.4'); p.write_text(t,encoding='utf-8')
replace('v7_5_1_version.js','__TAREFAS_V763_VERSION__','__TAREFAS_V764_VERSION__')
replace('v7_5_1_version.js',"const VERSION='7.6.3'","const VERSION='7.6.4'")
replace('v7_5_1_about.js',"const VERSION='7.6.3';","const VERSION='7.6.4';")
replace('v7_5_1_about.js',"{v:'7.6.3',title:'Férias protegem também o fim de semana antes da ADP',current:true","{v:'7.6.3',title:'Férias protegem também o fim de semana antes da ADP',current:false")
p=Path('v7_5_1_about.js'); t=p.read_text(encoding='utf-8')
entry=" {v:'7.6.4',title:'Lavagem com escolha ODT ou PDF',current:true,items:['Ao gerar a folha Forro de Cama para Lavar, o sistema agora abre uma escolha entre ODT e PDF.','O ODT continua editável e o PDF é gerado diretamente no navegador, pronto para visualizar, compartilhar ou imprimir.','A escolha funciona tanto no site quanto no aplicativo Android.','Mantida a correção 7.6.3 que impede serviço no fim de semana protegido pelas férias até a ADP.']},\n"
needle='const releases=[\n'
if entry not in t:t=t.replace(needle,needle+entry,1)
p.write_text(t,encoding='utf-8')
