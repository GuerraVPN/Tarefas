(()=>{
'use strict';
const MARK='__TAREFAS_ANDROID_238_AI_AUTO_FILE__';
if(window[MARK])return;window[MARK]=true;
const LABEL={pdf:'PDF',docx:'DOCX',odt:'ODT',txt:'TXT',md:'Markdown',csv:'CSV',json:'JSON',html:'HTML'};
const FILE_WORD=/(arquivo|documento|relat[oó]rio|planilha|pdf|docx|word|odt|libreoffice|txt|texto|markdown|\bmd\b|csv|json|html)/i;
const MAKE_WORD=/(gere|gerar|gera|crie|criar|cria|monte|montar|fa[cç]a|produza|produzir|exporte|exportar|salve|salvar|transforme|converter|converta)/i;
let pending=null;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function requestedFormat(text){
 const s=norm(text);
 if(/\b(docx|word)\b/.test(s))return'docx';
 if(/\b(odt|libreoffice)\b/.test(s))return'odt';
 if(/\bpdf\b/.test(s))return'pdf';
 if(/\bcsv\b/.test(s))return'csv';
 if(/\bjson\b/.test(s))return'json';
 if(/\bhtml?\b/.test(s))return'html';
 if(/\b(markdown|md)\b/.test(s))return'md';
 if(/\b(txt|texto)\b/.test(s))return'txt';
 return'pdf';
}
function isFileRequest(text){return MAKE_WORD.test(String(text||''))&&FILE_WORD.test(String(text||''))}
function latestAnswerAfterLastUser(panel){
 const rows=[...panel.querySelectorAll('.ai230-row')];
 let lastUser=-1;for(let i=rows.length-1;i>=0;i--)if(rows[i].classList.contains('user')){lastUser=i;break}
 if(lastUser<0)return null;
 for(let i=lastUser+1;i<rows.length;i++)if(rows[i].classList.contains('model')&&!rows[i].classList.contains('ai230-typing')&&rows[i].querySelector('.ai230-bubble'))return rows[i];
 return null;
}
function looksError(text){return /sess[aã]o expirou|n[aã]o consegui|temporariamente indispon[ií]vel|cota gratuita|perfil ativo n[aã]o|erro no servidor|falha/i.test(String(text||''))}
function cardFor(row,fmt){
 let card=row.querySelector('.ai238-auto-file');if(card)return card;
 card=document.createElement('div');card.className='ai238-auto-file';card.textContent=`📄 Pedido de arquivo detectado · gerando ${LABEL[fmt]}…`;
 const host=row.querySelector('.ai237-wrap')||row;host.appendChild(card);return card;
}
function waitStatus(row,card){
 let tries=0;const timer=setInterval(()=>{tries++;const st=row.querySelector('.ai237-status');const text=String(st?.textContent||'').trim();if(/^Salvo:/i.test(text)){card.textContent=`✅ ${text}`;card.classList.add('ok');clearInterval(timer)}else if(/falha/i.test(text)){card.textContent=`❌ ${text}`;card.classList.add('err');clearInterval(timer)}else if(tries>=60){card.textContent='📄 Arquivo solicitado. Use o botão Arquivo para tentar novamente.';clearInterval(timer)}},200);
}
function tryGenerate(){
 if(!pending)return;
 if(Date.now()-pending.at>120000){pending=null;return}
 const panel=document.querySelector('.ai230-panel');if(!panel)return;
 const row=latestAnswerAfterLastUser(panel);if(!row||row.dataset.ai238FileDone==='1')return;
 const bubble=row.querySelector('.ai230-bubble'),text=String(bubble?.textContent||'');if(!text||looksError(text))return;
 const fileBtn=[...row.querySelectorAll('.ai237-tool')].find(b=>/Arquivo/i.test(b.textContent||''));
 const formats=[...row.querySelectorAll('.ai237-format')];
 if(!fileBtn||!formats.length){setTimeout(tryGenerate,120);return}
 const fmt=pending.format,label=LABEL[fmt],formatBtn=formats.find(b=>String(b.textContent||'').trim()===label);
 if(!formatBtn){pending=null;return}
 row.dataset.ai238FileDone='1';const card=cardFor(row,fmt);fileBtn.click();setTimeout(()=>{formatBtn.click();waitStatus(row,card)},30);pending=null;
}
const style=document.createElement('style');style.id='ai238-auto-file-style';style.textContent='.ai238-auto-file{margin-top:6px;padding:7px 9px;border-radius:9px;border:1px dashed var(--v4-border,#d7dce3);background:var(--v4-surface-2,#f6f7f9);font-size:9px;font-weight:800;color:var(--v4-muted,#6b7280)}.ai238-auto-file.ok{color:#047857;border-color:#10b981}.ai238-auto-file.err{color:#b91c1c;border-color:#ef4444}';document.head.appendChild(style);
document.addEventListener('submit',ev=>{
 const form=ev.target;if(!(form instanceof HTMLFormElement)||!form.classList.contains('ai230-compose'))return;
 const input=form.querySelector('textarea'),text=String(input?.value||'').trim();if(!isFileRequest(text))return;
 pending={format:requestedFormat(text),at:Date.now(),prompt:text};setTimeout(tryGenerate,50);
},true);
new MutationObserver(()=>{if(pending)tryGenerate()}).observe(document.body,{childList:true,subtree:true});
window.addEventListener('tarefas:file-saved',ev=>{const row=document.querySelector('.ai230-panel .ai230-row.model[data-ai238-file-done="1"]:last-of-type');const card=row?.querySelector('.ai238-auto-file');if(!card)return;const d=ev?.detail||{};if(d?.saved){card.textContent=`✅ ${d.path||`Downloads/TAREFAS/${d.filename||'arquivo'}`}`;card.classList.add('ok')}});
function refreshBadge(){const span=document.querySelector('.ai230-title span');if(span)span.textContent='BETA 2.3.8 · leitura + ações + anexos + arquivos automáticos'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshBadge,{once:true});else refreshBadge();
})();