from pathlib import Path
p=Path('lavanderia_v211.js')
s=p.read_text(encoding='utf-8')
old="else if(selected.status==='enviada')actions=manage?`<button class=\"lav-btn primary\" data-lav-action=\"receber\" ${note.length?'':'disabled'}>✓ Marcar como recebida</button>`:'`;box.innerHTML=`"
new="else if(selected.status==='enviada')actions=manage?`<button class=\"lav-btn primary\" data-lav-action=\"receber\" ${note.length?'':'disabled'}>✓ Marcar como recebida</button>`:'';box.innerHTML=`"
if old not in s: raise SystemExit('trecho esperado não encontrado')
p.write_text(s.replace(old,new),encoding='utf-8')
