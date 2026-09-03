from pathlib import Path
import re

VERSION='7.6.8'

# Carrega a correção de tema em todas as telas e força cache novo dos arquivos centrais.
for p in Path('.').glob('*.html'):
    s=p.read_text(encoding='utf-8')
    s=re.sub(r'v4_tema\.js\?v=[^"\']+',f'v4_tema.js?v={VERSION}',s)
    s=re.sub(r'v6_2_mobile\.js\?v=[^"\']+',f'v6_2_mobile.js?v={VERSION}',s)
    if 'v7_6_8_theme_fix.js' not in s and '</body>' in s:
        s=s.replace('</body>',f'  <script src="v7_6_8_theme_fix.js?v={VERSION}"></script>\n</body>',1)
    p.write_text(s,encoding='utf-8')

# Controlador global WEB 7.6.8.
p=Path('v7_5_1_version.js'); s=p.read_text(encoding='utf-8')
s=s.replace('__TAREFAS_V767_VERSION__','__TAREFAS_V768_VERSION__').replace("const VERSION='7.6.7'","const VERSION='7.6.8'")
needle="addScript('v7_6_5_webfix.js','__TAREFAS_V765_WEBFIX__')"
if "v7_6_8_theme_fix.js" not in s:
    s=s.replace(needle,needle+";addScript('v7_6_8_theme_fix.js','__TAREFAS_V768_THEME_FIX__')")
p.write_text(s,encoding='utf-8')

# O loader mobile/global precisa pedir a versão nova para furar cache.
p=Path('v6_2_mobile.js'); s=p.read_text(encoding='utf-8')
s=s.replace('v7_5_1_version.js?v=7.6.7','v7_5_1_version.js?v=7.6.8')
s=s.replace('v7_5_1_about.js?v=7.6.7','v7_5_1_about.js?v=7.6.8')
p.write_text(s,encoding='utf-8')

# About.
p=Path('v7_5_1_about.js'); s=p.read_text(encoding='utf-8')
s=s.replace("const VERSION='7.6.7';","const VERSION='7.6.8';")
s=s.replace("{v:'7.6.7',title:'Pagamento com saldo PE e débito da Cia Com',current:true","{v:'7.6.7',title:'Pagamento com saldo PE e débito da Cia Com',current:false")
entry=" {v:'7.6.8',title:'Troca de tema corrigida no site e aplicativo',current:true,items:['Corrigida a troca entre os temas Claro, Escuro, Noturno e Militar.','A seleção passa a ser aplicada imediatamente na tela e persistida no dispositivo e na conta do usuário.','Eliminada a condição de corrida que podia restaurar o tema anterior após a sincronização com o Supabase.','Adicionado reforço visual para componentes legados e cache novo do sistema de temas em todas as páginas.']},\n"
if entry not in s:s=s.replace('const releases=[\n','const releases=[\n'+entry,1)
p.write_text(s,encoding='utf-8')

# Identificações visuais que exibem a versão Web.
for name in ['games.html','games.js','lavanderia_pagamento_v767.js']:
    p=Path(name)
    if p.exists():
        s=p.read_text(encoding='utf-8').replace('WEB 7.6.7','WEB 7.6.8')
        if name=='lavanderia_pagamento_v767.js':s=s.replace("const VERSION='7.6.7';","const VERSION='7.6.8';")
        p.write_text(s,encoding='utf-8')
