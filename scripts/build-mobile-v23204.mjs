import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

// 2.3.20.4 / build 256: mantém a correção Android 16 da 2.3.20.3 e
// reconstrói o ODT com o mesmo projeto visual usado pelo PDF.
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23203.mjs')).href + '?v=23204');

const dist = path.join(root, 'dist');
async function patchFile(rel, transform) {
  const file = path.join(dist, rel);
  const before = await readFile(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`2.3.20.4: correção não aplicada em ${rel}`);
  await writeFile(file, after, 'utf8');
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  const source = await readFile(file, 'utf8');
  await writeFile(
    file,
    source.replaceAll('2.3.20.3', '2.3.20.4').replaceAll('b255', 'b256'),
    'utf8'
  );
}

await patchFile('mobile-bootstrap.js', source => source.replace('const APP_BUILD = 255;', 'const APP_BUILD = 256;'));
await patchFile('mobile-preload.js', source => source.replace("tarefasAppBuild = '255'", "tarefasAppBuild = '256'"));
await patchFile('mobile-updates-v181.js', source => source.replace('const APP_BUILD = 255;', 'const APP_BUILD = 256;'));
await patchFile('mobile-schema-v239.js', source => source.replace('build:255', 'build:256'));

const odtLayout = String.raw`
const __ADITAMENTO_ODT_PDF_LAYOUT_V256__=true;
function aditLogoBytes(dataUrl){
  const match=/^data:image\/png;base64,([A-Za-z0-9+/=\s]+)$/.exec(String(dataUrl||''));
  if(!match||typeof atob!=='function')return null;
  try{return Uint8Array.from(atob(match[1].replace(/\s/g,'')),c=>c.charCodeAt(0))}catch(_){return null}
}
function aditStyles(){return [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.3">',
  '<office:font-face-decls><style:font-face style:name="Times New Roman" svg:font-family="Times New Roman" style:font-family-generic="roman" style:font-pitch="variable"/></office:font-face-decls>',
  '<office:styles>',
  '<style:default-style style:family="paragraph"><style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0cm" fo:line-height="100%"/><style:text-properties style:font-name="Times New Roman" fo:font-family="Times New Roman" fo:font-size="10pt"/></style:default-style>',
  '<style:style style:name="Logo" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="0.18cm" fo:line-height="100%"/></style:style>',
  '<style:style style:name="Header" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="0.05cm" fo:line-height="100%"/><style:text-properties fo:font-size="10pt"/></style:style>',
  '<style:style style:name="HeaderBold" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0.05cm" fo:margin-bottom="0cm" fo:line-height="100%"/><style:text-properties fo:font-size="10pt" fo:font-weight="bold"/></style:style>',
  '<style:style style:name="Intro" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0.58cm" fo:margin-bottom="0.55cm" fo:line-height="120%"/><style:text-properties fo:font-size="9.6pt" fo:font-weight="bold"/></style:style>',
  '<style:style style:name="Section" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0cm" fo:margin-bottom="0.55cm" fo:keep-with-next="always"/><style:text-properties fo:font-size="10.5pt" fo:font-weight="bold"/></style:style>',
  '<style:style style:name="DayTitle" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0cm" fo:margin-bottom="0.16cm" fo:keep-with-next="always"/><style:text-properties fo:font-size="9.6pt" fo:font-weight="bold"/></style:style>',
  '<style:style style:name="CellHead" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin="0cm" fo:line-height="100%"/><style:text-properties fo:font-size="9.3pt" fo:font-weight="bold"/></style:style>',
  '<style:style style:name="CellText" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin="0cm" fo:line-height="100%"/><style:text-properties fo:font-size="9.2pt"/></style:style>',
  '<style:style style:name="Passage" style:family="paragraph"><style:paragraph-properties fo:text-align="left" fo:margin-top="0.25cm" fo:margin-bottom="0.88cm"/><style:text-properties fo:font-size="9.5pt" fo:font-weight="bold"/></style:style>',
  '<style:style style:name="PartTitle" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0cm" fo:margin-bottom="0.15cm" fo:keep-with-next="always"/><style:text-properties fo:font-size="10pt" fo:font-weight="bold"/></style:style>',
  '<style:style style:name="PartBody" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0cm" fo:margin-bottom="0.78cm"/><style:text-properties fo:font-size="9.5pt"/></style:style>',
  '<style:style style:name="Mission" style:family="paragraph"><style:paragraph-properties fo:text-align="left" fo:margin-top="0cm" fo:margin-bottom="0.12cm"/><style:text-properties fo:font-size="9.3pt"/></style:style>',
  '<style:style style:name="SignatureName" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="1.05cm" fo:margin-bottom="0.12cm"/><style:text-properties fo:font-size="10.5pt" fo:font-weight="bold"/></style:style>',
  '<style:style style:name="SignatureRole" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin="0cm"/><style:text-properties fo:font-size="9.5pt"/></style:style>',
  '<style:style style:name="Bold" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style>',
  '</office:styles>',
  '<office:automatic-styles><style:page-layout style:name="pm"><style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" style:print-orientation="portrait" fo:margin="0.7cm" fo:border="1.5pt double #0f172a" style:border-line-width="0.45pt 0.60pt 0.45pt" fo:padding="0.78cm" style:writing-mode="lr-tb"/></style:page-layout></office:automatic-styles>',
  '<office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm"/></office:master-styles>',
  '</office:document-styles>'
].join('')}
function aditTable(title,context,day,standby,index){
  const rows=SERVICE_ROWS.map(row=>{const p=standby?(day.standby.get(row.grupo)||{grad:'',nome:''}):serviceData(context,day,row.grupo);return '<table:table-row table:style-name="AditRow"><table:table-cell table:style-name="AditCell" office:value-type="string"><text:p text:style-name="CellText">'+aditEsc(row.funcao)+'</text:p></table:table-cell><table:table-cell table:style-name="AditCell" office:value-type="string"><text:p text:style-name="CellText">'+aditEsc(p.grad)+'</text:p></table:table-cell><table:table-cell table:style-name="AditCell" office:value-type="string"><text:p text:style-name="CellText">'+aditEsc(p.nome)+'</text:p></table:table-cell></table:table-row>'}).join('');
  return '<text:p text:style-name="DayTitle">'+aditEsc(title)+'</text:p><table:table table:name="'+(standby?'Sobreaviso':'Servico')+String(index||1)+'" table:style-name="AditTable"><table:table-column table:style-name="AditColFunc"/><table:table-column table:style-name="AditColGrad"/><table:table-column table:style-name="AditColNome"/><table:table-header-rows><table:table-row table:style-name="AditHeadRow"><table:table-cell table:style-name="AditHeadCell" office:value-type="string"><text:p text:style-name="CellHead">FUNÇÃO</text:p></table:table-cell><table:table-cell table:style-name="AditHeadCell" office:value-type="string"><text:p text:style-name="CellHead">GRAD.</text:p></table:table-cell><table:table-cell table:style-name="AditHeadCell" office:value-type="string"><text:p text:style-name="CellHead">NOME</text:p></table:table-cell></table:table-row></table:table-header-rows>'+rows+'</table:table>';
}
function aditContent(context,hasLogo){
  const first=context.days[0].date,boletimDate=addDays(first,-1);
  let body='<text:p text:style-name="Logo">'+(hasLogo?'<draw:frame draw:style-name="LogoFrame" draw:name="Brasão do Exército" text:anchor-type="as-char" svg:width="1.8cm" svg:height="1.9cm"><draw:image xlink:href="Pictures/brasao.png" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/></draw:frame>':'<text:s/>')+'</text:p>'+
    '<text:p text:style-name="Header">MINISTÉRIO DA DEFESA</text:p><text:p text:style-name="Header">EXÉRCITO BRASILEIRO</text:p><text:p text:style-name="HeaderBold">26º PELOTÃO DE POLÍCIA DO EXÉRCITO MECANIZADO</text:p>'+
    '<text:p text:style-name="Intro">ADITAMENTO AO BOLETIM INTERNO DA 6ª BRIGADA DE INFANTARIA BLINDADA,<text:line-break/>DO DIA '+aditEsc(fullDate(boletimDate))+', PARA O CONHECIMENTO DO PELOTÃO E A DEVIDA<text:line-break/>EXECUÇÃO, PUBLICO O SEGUINTE:</text:p>'+
    '<text:p text:style-name="Section">1ª PARTE - SERVIÇOS DIÁRIOS</text:p>';
  let tableIndex=0;
  for(const day of context.days){tableIndex++;body+=aditTable('SERVIÇO PARA O DIA '+fullDate(day.date)+' ('+weekName(day.date)+')',context,day,false,tableIndex)+'<text:p text:style-name="Passage">- PASSAGEM DE SERVIÇO ÀS '+aditEsc(day.passage||'08:00')+'h.</text:p>'}
  for(const day of context.days.filter(x=>x.includeStandby)){tableIndex++;body+=aditTable('SOBREAVISO PARA O DIA '+fullDate(day.date)+' ('+weekName(day.date)+')',context,day,true,tableIndex)+'<text:p text:style-name="Passage"><text:s/></text:p>'}
  body+='<text:p text:style-name="PartTitle">2ª PARTE - INSTRUÇÃO:</text:p><text:p text:style-name="PartBody">Sem alteração.</text:p><text:p text:style-name="PartTitle">3ª PARTE - ASSUNTOS GERAIS E ADMINISTRATIVOS:</text:p>';
  if(!context.missions.length)body+='<text:p text:style-name="PartBody">Sem alteração.</text:p>';else for(const m of context.missions){const people=missionPeople(context,m.id),period=m.data_inicio===m.data_fim?shortDate(m.data_inicio):shortDate(m.data_inicio)+' a '+shortDate(m.data_fim);body+='<text:p text:style-name="Mission"><text:span text:style-name="Bold">Missão: </text:span>'+aditEsc(m.titulo)+'</text:p><text:p text:style-name="Mission"><text:span text:style-name="Bold">Data: </text:span>'+aditEsc(period)+'</text:p><text:p text:style-name="Mission"><text:span text:style-name="Bold">Local: </text:span>'+aditEsc(clean(m.local)||'-')+'</text:p><text:p text:style-name="Mission"><text:span text:style-name="Bold">Militares: </text:span>'+aditEsc(people.length?people.join(', '):'Nenhum participante cadastrado')+'</text:p>'+(clean(m.descricao)?'<text:p text:style-name="Mission"><text:span text:style-name="Bold">Observação: </text:span>'+aditEsc(m.descricao)+'</text:p>':'')+'<text:p text:style-name="PartBody"><text:s/></text:p>'}
  body+='<text:p text:style-name="PartTitle">4ª PARTE - JUSTIÇA E DISCIPLINA:</text:p><text:p text:style-name="PartBody">Sem alteração.</text:p><text:p text:style-name="SignatureName">GUILLEN GABRIEL DOS SANTOS SILVA - 1º Ten</text:p><text:p text:style-name="SignatureRole">Comandante do 26º Pelotão de Polícia do Exército Mecanizado</text:p>';
  return '<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.3"><office:automatic-styles><style:style style:name="AditTable" style:family="table"><style:table-properties style:width="17.6cm" table:align="center" table:border-model="collapsing"/></style:style><style:style style:name="AditColFunc" style:family="table-column"><style:table-column-properties style:column-width="5.5cm"/></style:style><style:style style:name="AditColGrad" style:family="table-column"><style:table-column-properties style:column-width="2.2cm"/></style:style><style:style style:name="AditColNome" style:family="table-column"><style:table-column-properties style:column-width="9.9cm"/></style:style><style:style style:name="AditHeadRow" style:family="table-row"><style:table-row-properties style:min-row-height="0.7cm"/></style:style><style:style style:name="AditRow" style:family="table-row"><style:table-row-properties style:min-row-height="0.7cm"/></style:style><style:style style:name="AditHeadCell" style:family="table-cell"><style:table-cell-properties fo:background-color="#e1e1e1" fo:border="0.5pt solid #282828" fo:padding="0.08cm" style:vertical-align="middle"/></style:style><style:style style:name="AditCell" style:family="table-cell"><style:table-cell-properties fo:border="0.5pt solid #282828" fo:padding="0.08cm" style:vertical-align="middle"/></style:style><style:style style:name="LogoFrame" style:family="graphic"><style:graphic-properties style:horizontal-pos="center" style:horizontal-rel="paragraph" style:vertical-pos="middle" style:vertical-rel="character" style:wrap="none"/></style:style></office:automatic-styles><office:body><office:text>'+body+'</office:text></office:body></office:document-content>';
}
function buildAditamentoOdt(context,logoDataUrl){
  const e=new TextEncoder(),logo=aditLogoBytes(logoDataUrl),pictureEntries=logo?'<manifest:file-entry manifest:full-path="Pictures/" manifest:media-type=""/><manifest:file-entry manifest:full-path="Pictures/brasao.png" manifest:media-type="image/png"/>':'';
  const manifest='<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:version="1.3" manifest:media-type="'+ADITAMENTO_ODT+'"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>'+pictureEntries+'</manifest:manifest>';
  const files=[{name:'mimetype',data:e.encode(ADITAMENTO_ODT)},{name:'content.xml',data:e.encode(aditContent(context,!!logo))},{name:'styles.xml',data:e.encode(aditStyles())}];
  if(logo)files.push({name:'Pictures/brasao.png',data:logo});
  files.push({name:'META-INF/manifest.xml',data:e.encode(manifest)});
  return new Blob([aditZip(files)],{type:ADITAMENTO_ODT});
}
`;

await patchFile('aditamento_v74.js', source => {
  source = source
    .replaceAll('V255', 'V256')
    .replaceAll('[ADITAMENTO 255]', '[ADITAMENTO 256]');

  const odtStart = source.indexOf('function aditStyles(){');
  const odtEnd = source.indexOf('const __ADITAMENTO_NATIVE_SAVE_V242__', odtStart);
  if (odtStart < 0 || odtEnd < 0) throw new Error('aditamento: bloco ODT não encontrado');
  source = source.slice(0, odtStart) + odtLayout + '\n' + source.slice(odtEnd);

  const generateStart = source.indexOf('async function generateOdt(){');
  const generateEnd = source.indexOf('async function generate(){', generateStart);
  if (generateStart < 0 || generateEnd < 0) throw new Error('aditamento: generateOdt não encontrado');
  const generateOdt = "async function generateOdt(){const btn=$('aditamentoGerar');if(btn?.disabled)return;const days=selectedDays();if(!days.length)return alert('Adicione pelo menos um dia ao aditamento.');if(new Set(days.map(x=>x.date)).size!==days.length)return alert('Não repita a mesma data no aditamento.');try{btn.disabled=true;btn.textContent='Gerando ODT...';setStatus('Buscando dados para montar o ODT com o mesmo layout do PDF...');const context=await loadAditamentoContext(days),logo=await loadLogo(),first=days[0].date,last=days[days.length-1].date,suffix=first===last?fileDate(first):fileDate(first)+'_a_'+fileDate(last),filename='Aditamento_'+suffix+'.odt';const saved=await saveAditamentoBlob(buildAditamentoOdt(context,logo),filename);console.info('[ADITAMENTO 256] ODT salvo com layout do PDF',saved?.path||filename);const standbyCount=days.filter(x=>x.includeStandby).length;setStatus('ODT salvo com o mesmo layout do PDF, '+days.length+' dia(s), '+standbyCount+' bloco(s) de sobreaviso e '+context.missions.length+' missão(ões).');modal(false)}catch(e){console.error(e);setStatus(e.message||'Não foi possível gerar o ODT.',true);alert('Erro ao gerar aditamento ODT: '+(e.message||e))}finally{btn.disabled=false;btn.textContent='Gerar arquivo'}}\n";
  source = source.slice(0, generateStart) + generateOdt + source.slice(generateEnd);

  const apiOld = 'window.TAREFAS_ADITAMENTO_V256=Object.freeze({generatePdf,generateOdt,buildAditamentoOdt,saveAditamentoBlob});';
  const apiNew = 'window.TAREFAS_ADITAMENTO_V256=Object.freeze({generatePdf,generateOdt,buildPdf,buildAditamentoOdt,saveAditamentoBlob});';
  if (!source.includes(apiOld)) throw new Error('aditamento: API V256 não encontrada');
  return source.replace(apiOld, apiNew);
});

await patchFile('v7_4_7_aditamento_patch.js', source => source.replaceAll('V255', 'V256'));
await patchFile('native-mobile.js', source => source.replaceAll('V255', 'V256'));

await appendFile(
  path.join(dist, 'native-mobile.js'),
  "\n;globalThis.__TAREFAS_ADITAMENTO_ODT_PDF_LAYOUT_V256__={editable:true,logo:true,border:'double',tableWidthsCm:[5.5,2.2,9.9]};\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.20.4 build 256: ODT editável com o mesmo layout visual do PDF, em Downloads/TAREFAS.');
