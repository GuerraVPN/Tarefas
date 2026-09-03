from pathlib import Path

ROOT=Path('.')
VERSION='7.6.9'
HTMLS=[
 'about.html','calendario.html','central.html','configuracoes.html','dashboard.html',
 'ferias_dispensas.html','games.html','help.html','historico_auditoria.html','index.html',
 'menu.html','minhas_tarefas.html','missao.html','orcamentarios.html','pessoal.html',
 'relatorios.html','usuarios.html'
]


def write(path,text):
 p=ROOT/path
 p.write_text(text,encoding='utf-8')

# Identificação visual e cache do site.
p=ROOT/'v7_5_1_version.js'; s=p.read_text(encoding='utf-8')
s=s.replace('window.__TAREFAS_V768_VERSION__','window.__TAREFAS_V769_VERSION__')
s=s.replace("const VERSION='7.6.8',BADGE=", "const VERSION='7.6.9',BADGE=")
write('v7_5_1_version.js',s)

p=ROOT/'v6_2_mobile.js'; s=p.read_text(encoding='utf-8')
s=s.replace("v7_5_1_version.js?v=7.6.8","v7_5_1_version.js?v=7.6.9")
s=s.replace("v7_5_1_about.js?v=7.6.8","v7_5_1_about.js?v=7.6.9")
write('v6_2_mobile.js',s)

p=ROOT/'v7_5_1_about.js'; s=p.read_text(encoding='utf-8')
s=s.replace("const VERSION='7.6.8';","const VERSION='7.6.9';",1)
s=s.replace("{v:'7.6.8',title:'Troca de tema corrigida no site e aplicativo',current:true,", "{v:'7.6.8',title:'Troca de tema corrigida no site e aplicativo',current:false,",1)
entry=" {v:'7.6.9',title:'Atualização cadastral obrigatória',current:true,items:['Militares com CPF padrão ou inválido, telefone ausente ou inválido e e-mail ausente ou inválido passam a ter atualização cadastral obrigatória ao acessar o TAREFAS.','O acesso ao restante do sistema fica bloqueado até CPF, telefone e e-mail serem validados e salvos.','A etapa obrigatória não pode ser ignorada pelo botão voltar enquanto houver pendências.','O usuário Admin permanece fora dessa obrigatoriedade.','Correção aprovada anteriormente na beta Android 2.1.7 e promovida para o site.']},\n"
needle="const releases=[\n"
if entry.strip() not in s:
 s=s.replace(needle,needle+entry,1)
write('v7_5_1_about.js',s)

for name in HTMLS:
 p=ROOT/name; html=p.read_text(encoding='utf-8')
 html=html.replace('v4_tema.js?v=7.6.8','v4_tema.js?v=7.6.9')
 html=html.replace('v6_2_mobile.js?v=7.6.8','v6_2_mobile.js?v=7.6.9')
 html=html.replace('v7_6_8_theme_fix.js?v=7.6.8','v7_6_8_theme_fix.js?v=7.6.9')
 if 'v7_6_9_profile_required.js' not in html:
  if '</body>' not in html.lower():
   raise SystemExit(f'{name}: </body> ausente')
  pos=html.lower().rfind('</body>')
  html=html[:pos]+'  <script src="v7_6_9_profile_required.js?v=7.6.9"></script>\n'+html[pos:]
 p.write_text(html,encoding='utf-8')

print(f'WEB {VERSION}: atualização cadastral obrigatória aplicada em {len(HTMLS)} páginas.')
