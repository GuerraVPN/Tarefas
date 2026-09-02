from pathlib import Path

VERSION='7.6.3'

def replace(path, old, new, count=None):
    p=Path(path); s=p.read_text(encoding='utf-8')
    if old not in s:
        raise SystemExit(f'{path}: trecho não encontrado: {old[:180]}')
    s=s.replace(old,new) if count is None else s.replace(old,new,count)
    p.write_text(s,encoding='utf-8')

# Escala: férias terminando antes do fim de semana continuam protegendo o militar
# até a ADP do próximo dia útil. Assim a fila da Vermelha não pula o militar:
# ele permanece na frente e vai para o próximo fim de semana elegível.
replace('pessoal_v7.js',"const ESCALA_UI_VERSION='7.6.1';", "const ESCALA_UI_VERSION='7.6.3';")
needle="""function vacationFor(row,date){\n return vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_inicio<=date&&v.data_fim>=date);\n}\nfunction adaptationFor(row,date){"""
insert="""function vacationFor(row,date){\n return vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_inicio<=date&&v.data_fim>=date);\n}\nfunction vacationProtectionFor(row,date){\n return vacations.find(v=>((row.usuario_id&&String(v.usuario_id)===String(row.usuario_id))||(row.pessoa_externa_id&&String(v.pessoa_externa_id)===String(row.pessoa_externa_id)))&&v.data_inicio<=date&&adaptationDate(v.data_fim)>=date);\n}\nfunction adaptationFor(row,date){"""
replace('pessoal_v7.js',needle,insert,1)
replace('pessoal_v7.js',"function eligible(row,date,checkInterval=false){return !vacationFor(row,date)&&!adaptationFor(row,date)&&(!checkInterval||(!confirmedNear(row,date)&&!forecastNear(row,date)))}", "function eligible(row,date,checkInterval=false){return !vacationProtectionFor(row,date)&&(!checkInterval||(!confirmedNear(row,date)&&!forecastNear(row,date)))}",1)

# Cache bust das telas que usam a escala/férias.
for path in ['pessoal.html','ferias_dispensas.html']:
    p=Path(path); s=p.read_text(encoding='utf-8').replace('?v=7.6.1','?v=7.6.3')
    p.write_text(s,encoding='utf-8')

# Versão global do site.
replace('v7_5_1_version.js','__TAREFAS_V762_VERSION__','__TAREFAS_V763_VERSION__')
replace('v7_5_1_version.js',"const VERSION='7.6.2'","const VERSION='7.6.3'")
replace('v7_5_1_about.js',"const VERSION='7.6.2';","const VERSION='7.6.3';")
replace('v7_5_1_about.js',"{v:'7.6.2',title:'Arquivo ODT da Lavagem de Forro de Cama',current:true","{v:'7.6.2',title:'Arquivo ODT da Lavagem de Forro de Cama',current:false")
p=Path('v7_5_1_about.js'); s=p.read_text(encoding='utf-8')
entry=" {v:'7.6.3',title:'Férias protegem também o fim de semana antes da ADP',current:true,items:['Corrigida a Escala Vermelha quando as férias terminam antes do fim de semana: sábado e domingo permanecem bloqueados até a ADP do próximo dia útil.','O militar não perde a vez no rodízio quando seu serviço cair nesse período protegido; ele permanece na fila e é colocado no próximo fim de semana elegível.','O Supabase agora impede confirmar ou transferir serviço para qualquer data entre o início das férias e a ADP, inclusive o fim de semana intermediário.','Mantida a correção 7.6.2 que gera o ODT Forro de Cama para Lavar no site e no aplicativo.']},\n"
needle='const releases=[\n'
if entry not in s:
    if needle not in s: raise SystemExit('v7_5_1_about.js: releases não encontrado')
    s=s.replace(needle,needle+entry,1)
p.write_text(s,encoding='utf-8')

# Atualiza referências do carregador e páginas com versão visível/cache.
for path in ['v6_2_mobile.js','games.html','games.js','orcamentarios.html']:
    p=Path(path); s=p.read_text(encoding='utf-8').replace('7.6.2','7.6.3')
    p.write_text(s,encoding='utf-8')
