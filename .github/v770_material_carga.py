from pathlib import Path

ROOT=Path('.')
VERSION='7.7.0'
PREV='7.6.11'
HTMLS=[
 'about.html','calendario.html','central.html','configuracoes.html','dashboard.html',
 'ferias_dispensas.html','games.html','help.html','historico_auditoria.html','index.html',
 'menu.html','minhas_tarefas.html','missao.html','orcamentarios.html','pessoal.html',
 'relatorios.html','usuarios.html'
]

def read(path): return (ROOT/path).read_text(encoding='utf-8')
def write(path,text): (ROOT/path).write_text(text,encoding='utf-8')

# Versão visual global.
s=read('v7_5_1_version.js')
s=s.replace('__TAREFAS_V769_VERSION__','__TAREFAS_V770_VERSION__')
s=s.replace("const VERSION='7.6.11',BADGE=", "const VERSION='7.7.0',BADGE=")
if "const VERSION='7.7.0',BADGE=" not in s:
 raise SystemExit('v7_5_1_version.js: não foi possível promover para 7.7.0')
write('v7_5_1_version.js',s)

# Cache dos loaders.
s=read('v6_2_mobile.js')
s=s.replace('v7_5_1_version.js?v=7.6.11','v7_5_1_version.js?v=7.7.0')
s=s.replace('v7_5_1_about.js?v=7.6.11','v7_5_1_about.js?v=7.7.0')
write('v6_2_mobile.js',s)

# Histórico / About.
s=read('v7_5_1_about.js')
s=s.replace("const VERSION='7.6.11';","const VERSION='7.7.0';",1)
s=s.replace("{v:'7.6.11',title:'Notificações sem avisar o próprio autor',current:true,", "{v:'7.6.11',title:'Notificações sem avisar o próprio autor',current:false,",1)
entry=" {v:'7.7.0',title:'Material Carga sempre atualizado',current:true,items:['Depósitos passam a ter conferência periódica a cada 30 dias e Material Carga das dependências a cada 90 dias.','Desrelacionamentos/Baixas, Distribuições e Movimentações concluídas marcam automaticamente as relações afetadas como pendentes de atualização.','Após a conclusão de um processo que altera a carga, o sistema avisa que é necessário gerar uma nova relação e oferece acesso direto ao Material Carga / Depósito.','Cada nova relação registra obrigatoriamente quem conferiu e a data/hora da conferência, mantendo histórico auditável.','Pendências causadas por processos são encerradas automaticamente quando a nova relação correspondente é anexada.','Regra compartilhada com a base da próxima beta Android via PWA + Capacitor.']},\n"
needle='const releases=[\n'
if entry.strip() not in s:
 s=s.replace(needle,needle+entry,1)
if "const VERSION='7.7.0';" not in s or "{v:'7.7.0'" not in s:
 raise SystemExit('v7_5_1_about.js: promoção 7.7.0 incompleta')
write('v7_5_1_about.js',s)

# Cache da base e novo módulo V7.7.0.
for name in HTMLS:
 p=ROOT/name
 html=p.read_text(encoding='utf-8')
 html=html.replace('?v=7.6.11','?v=7.7.0')
 if name=='orcamentarios.html' and 'v7_7_0_material_carga.js' not in html:
  marker='<script src="material_carga_v6.js?v=6.0"></script>'
  if marker in html:
   html=html.replace(marker,marker+'\n<script src="v7_7_0_material_carga.js?v=7.7.0"></script>',1)
  else:
   pos=html.lower().rfind('</body>')
   if pos<0: raise SystemExit('orcamentarios.html: </body> ausente')
   html=html[:pos]+'<script src="v7_7_0_material_carga.js?v=7.7.0"></script>\n'+html[pos:]
 p.write_text(html,encoding='utf-8')

print('WEB 7.7.0: Material Carga/Depósitos com validade, pendências e conferência promovidos.')
