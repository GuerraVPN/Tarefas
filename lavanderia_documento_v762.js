(()=>{
'use strict';
if(window.__TAREFAS_LAV_DOC_V762__)return;
window.__TAREFAS_LAV_DOC_V762__=true;

const MIME='application/vnd.oasis.opendocument.text';
const encoder=new TextEncoder();

function toast(message,bad=false){
  const el=document.getElementById('lavToast');
  if(el){
    el.textContent=message;
    el.classList.toggle('bad',bad);
    el.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer=setTimeout(()=>el.classList.remove('show'),3600);
    return;
  }
  if(bad)console.error('[TAREFAS LAVANDERIA]',message);else console.info('[TAREFAS LAVANDERIA]',message);
}
function xml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
function safeName(value){return String(value??'arquivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^_+|_+$/g,'')||'arquivo'}
function currentRequestId(){
  const urlId=new URL(location.href).searchParams.get('lavagem');
  if(urlId&&/^\d+$/.test(urlId))return Number(urlId);
  const text=document.querySelector('#lavDetail h3')?.textContent||'';
  const match=text.match(/#(\d+)/);
  return match?Number(match[1]):null;
}
function crc32(bytes){
  let crc=0xffffffff;
  for(const byte of bytes){
    crc^=byte;
    for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }
  return (crc^0xffffffff)>>>0;
}
function dosDateTime(date=new Date()){
  const year=Math.max(1980,date.getFullYear());
  return {
    time:((date.getHours()&31)<<11)|((date.getMinutes()&63)<<5)|((Math.floor(date.getSeconds()/2))&31),
    date:(((year-1980)&127)<<9)|(((date.getMonth()+1)&15)<<5)|(date.getDate()&31)
  };
}
function concat(chunks,total){
  const out=new Uint8Array(total);let offset=0;
  for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.length}
  return out;
}
function u16(view,offset,value){view.setUint16(offset,value,true)}
function u32(view,offset,value){view.setUint32(offset,value>>>0,true)}
function zipStore(entries){
  const localChunks=[],centralChunks=[];
  let localOffset=0,localTotal=0,centralTotal=0;
  const stamp=dosDateTime();
  for(const entry of entries){
    const name=encoder.encode(entry.name),data=entry.bytes instanceof Uint8Array?entry.bytes:encoder.encode(entry.bytes),crc=crc32(data);
    const local=new Uint8Array(30+name.length+data.length),lv=new DataView(local.buffer);
    u32(lv,0,0x04034b50);u16(lv,4,20);u16(lv,6,0x0800);u16(lv,8,0);u16(lv,10,stamp.time);u16(lv,12,stamp.date);u32(lv,14,crc);u32(lv,18,data.length);u32(lv,22,data.length);u16(lv,26,name.length);u16(lv,28,0);
    local.set(name,30);local.set(data,30+name.length);localChunks.push(local);localTotal+=local.length;

    const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);
    u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x0800);u16(cv,10,0);u16(cv,12,stamp.time);u16(cv,14,stamp.date);u32(cv,16,crc);u32(cv,20,data.length);u32(cv,24,data.length);u16(cv,28,name.length);u16(cv,30,0);u16(cv,32,0);u16(cv,34,0);u16(cv,36,0);u32(cv,38,0);u32(cv,42,localOffset);
    central.set(name,46);centralChunks.push(central);centralTotal+=central.length;
    localOffset+=local.length;
  }
  const end=new Uint8Array(22),ev=new DataView(end.buffer);
  u32(ev,0,0x06054b50);u16(ev,4,0);u16(ev,6,0);u16(ev,8,entries.length);u16(ev,10,entries.length);u32(ev,12,centralTotal);u32(ev,16,localTotal);u16(ev,20,0);
  return concat([...localChunks,...centralChunks,end],localTotal+centralTotal+end.length);
}
function stylesXml(){return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
 <office:styles>
  <style:default-style style:family="paragraph"><style:text-properties style:font-name="Arial" fo:font-family="Arial" fo:font-size="11pt"/></style:default-style>
 </office:styles>
 <office:automatic-styles>
  <style:page-layout style:name="pm1"><style:page-layout-properties fo:page-width="8.27in" fo:page-height="11.69in" style:print-orientation="portrait" fo:margin-top="0.75in" fo:margin-bottom="0.75in" fo:margin-left="0.8in" fo:margin-right="0.8in"/></style:page-layout>
 </office:automatic-styles>
 <office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"/></office:master-styles>
</office:document-styles>`}
function contentXml(request,items){
  const rows=items.map(item=>`<table:table-row><table:table-cell table:style-name="Cell"><text:p text:style-name="Body">${xml(item.material)}</text:p></table:table-cell><table:table-cell table:style-name="Cell"><text:p text:style-name="Center">${xml(item.quantidade)}</text:p></table:table-cell></table:table-row>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
 <office:automatic-styles>
  <style:style style:name="Title" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0.08in" fo:margin-bottom="0.18in"/><style:text-properties fo:font-size="18pt" fo:font-weight="bold"/></style:style>
  <style:style style:name="Body" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin="0in"/><style:text-properties fo:font-size="11pt"/></style:style>
  <style:style style:name="Center" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin="0in"/><style:text-properties fo:font-size="11pt"/></style:style>
  <style:style style:name="Header" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin="0in"/><style:text-properties fo:font-size="11pt" fo:font-weight="bold"/></style:style>
  <style:style style:name="Spacer" style:family="paragraph"><style:paragraph-properties fo:margin-bottom="0.22in"/><style:text-properties fo:font-size="11pt"/></style:style>
  <style:style style:name="Sign" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0in" fo:margin-bottom="0in"/><style:text-properties fo:font-size="11pt"/></style:style>
  <style:style style:name="SignLabel" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0in" fo:margin-bottom="0.55in"/><style:text-properties fo:font-size="10pt"/></style:style>
  <style:style style:name="ForroTable" style:family="table"><style:table-properties style:width="6.45in" table:align="center"/></style:style>
  <style:style style:name="ColMaterial" style:family="table-column"><style:table-column-properties style:column-width="3.85in"/></style:style>
  <style:style style:name="ColQtd" style:family="table-column"><style:table-column-properties style:column-width="2.60in"/></style:style>
  <style:style style:name="Cell" style:family="table-cell"><style:table-cell-properties fo:border="0.75pt solid #000000" fo:padding="0.07in" fo:vertical-align="middle"/></style:style>
  <style:style style:name="CellHeader" style:family="table-cell"><style:table-cell-properties fo:border="0.75pt solid #000000" fo:padding="0.07in" fo:background-color="#f2f2f2" fo:vertical-align="middle"/></style:style>
 </office:automatic-styles>
 <office:body><office:text>
  <text:p text:style-name="Title">Forro de Cama para Lavar</text:p>
  <table:table table:name="Forro de Cama" table:style-name="ForroTable">
   <table:table-column table:style-name="ColMaterial"/>
   <table:table-column table:style-name="ColQtd"/>
   <table:table-row><table:table-cell table:style-name="CellHeader"><text:p text:style-name="Header">Material</text:p></table:table-cell><table:table-cell table:style-name="CellHeader"><text:p text:style-name="Header">Quantidade</text:p></table:table-cell></table:table-row>
   ${rows}
  </table:table>
  <text:p text:style-name="Spacer"></text:p><text:p text:style-name="Spacer"></text:p><text:p text:style-name="Spacer"></text:p>
  <text:p text:style-name="Sign">_____________________________________</text:p>
  <text:p text:style-name="SignLabel">Quem mandou lavar</text:p>
  <text:p text:style-name="Spacer"></text:p>
  <text:p text:style-name="Sign">_____________________________________</text:p>
  <text:p text:style-name="SignLabel">Quem recebeu</text:p>
 </office:text></office:body>
</office:document-content>`;
}
function manifestXml(){return `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
 <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="${MIME}"/>
 <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
 <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
 <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`}
function metaXml(request){
  const created=new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" office:version="1.2"><office:meta><dc:title>Forro de Cama para Lavar</dc:title><meta:generator>TAREFAS WEB 7.6.6 / Android 2.1.5</meta:generator><meta:creation-date>${xml(created)}</meta:creation-date><meta:keyword>Lavagem ${xml(request?.id??'')}</meta:keyword></office:meta></office:document-meta>`;
}
function buildOdt(request,items){
  const entries=[
    {name:'mimetype',bytes:encoder.encode(MIME)},
    {name:'content.xml',bytes:encoder.encode(contentXml(request,items))},
    {name:'styles.xml',bytes:encoder.encode(stylesXml())},
    {name:'meta.xml',bytes:encoder.encode(metaXml(request))},
    {name:'META-INF/manifest.xml',bytes:encoder.encode(manifestXml())}
  ];
  return new Blob([zipStore(entries)],{type:MIME});
}
async function fetchData(id){
  if(typeof supabaseClient==='undefined')throw new Error('Banco de dados indisponível.');
  const [req,it]=await Promise.all([
    supabaseClient.from('lavanderia_solicitacoes').select('*').eq('id',id).single(),
    supabaseClient.from('lavanderia_itens').select('*').eq('solicitacao_id',id).order('id')
  ]);
  if(req.error)throw req.error;if(it.error)throw it.error;
  if(!it.data?.length)throw new Error('A lavagem não possui materiais para gerar a folha.');
  return {request:req.data,items:it.data};
}
async function save(blob,filename){
  if(window.TarefasNative?.files?.saveBlob){
    const result=await window.TarefasNative.files.saveBlob(blob,filename);
    return result?.path||filename;
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
  return filename;
}
function winAnsi(value){
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
  const NL=String.fromCharCode(10),stream=cmds.join(NL);
  const objects=[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${pdfBytes(stream).length} >>
stream
${stream}
endstream`
  ];
  let pdf='%PDF-1.4'+NL+'%âãÏÓ'+NL,offsets=[0];
  for(let i=0;i<objects.length;i++){offsets.push(pdfBytes(pdf).length);pdf+=`${i+1} 0 obj
${objects[i]}
endobj
`}
  const xref=pdfBytes(pdf).length;
  pdf+=`xref
0 ${objects.length+1}
0000000000 65535 f 
`;
  for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n '+NL;
  pdf+=`trailer
<< /Size ${objects.length+1} /Root 1 0 R >>
startxref
${xref}
%%EOF`;
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
})();
