from pathlib import Path
p=Path('lavanderia_documento_v762.js')
s=p.read_text(encoding='utf-8')
s=s.replace("const stream=cmds.join('\n');","const NL=String.fromCharCode(10),stream=cmds.join(NL);")
s=s.replace("let pdf='%PDF-1.4\n%âãÏÓ\n',offsets=[0];","let pdf='%PDF-1.4'+NL+'%âãÏÓ'+NL,offsets=[0];")
s=s.replace("+' 00000 n \n';","+' 00000 n '+NL;")
p.write_text(s,encoding='utf-8')
