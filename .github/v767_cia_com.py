from pathlib import Path

VERSION='7.6.7'

def read(path): return Path(path).read_text(encoding='utf-8')
def write(path,text): Path(path).write_text(text,encoding='utf-8')
def replace(path,old,new,count=None,required=True):
    s=read(path)
    if old not in s:
        if required: raise SystemExit(f'{path}: trecho não encontrado: {old[:160]}')
        return
    s=s.replace(old,new) if count is None else s.replace(old,new,count)
    write(path,s)

# Orçamentários: carrega o novo módulo de divisão PE/Cia Com e força cache novo.
p='orcamentarios.html'; s=read(p)
s=s.replace('v6_2_mobile.js?v=7.6.6','v6_2_mobile.js?v=7.6.7')
s=s.replace('lavanderia_v211.js?v=7.6.6','lavanderia_v211.js?v=7.6.7')
s=s.replace('lavanderia_financeiro_v212.js?v=7.6.6','lavanderia_financeiro_v212.js?v=7.6.7')
s=s.replace('lavanderia_documento_v762.js?v=7.6.6','lavanderia_documento_v762.js?v=7.6.7')
needle='  <script src="lavanderia_financeiro_v212.js?v=7.6.7"></script>\n'
line='  <script src="lavanderia_pagamento_v767.js?v=7.6.7"></script>\n'
if line not in s:
    if needle not in s: raise SystemExit('orcamentarios.html: financeiro 7.6.7 não encontrado')
    s=s.replace(needle,needle+line,1)
write(p,s)

# Identificação interna da área.
replace('lavanderia_v211.js','ORÇAMENTÁRIO · WEB 7.6.6','ORÇAMENTÁRIO · WEB 7.6.7',required=False)

# Versão global e carregador.
p='v7_5_1_version.js'; s=read(p)
s=s.replace('__TAREFAS_V766_VERSION__','__TAREFAS_V767_VERSION__')
s=s.replace("const VERSION='7.6.6'","const VERSION='7.6.7'")
write(p,s)

p='v6_2_mobile.js'; s=read(p)
s=s.replace('v7_5_1_version.js?v=7.6.6','v7_5_1_version.js?v=7.6.7')
s=s.replace('v7_5_1_about.js?v=7.6.6','v7_5_1_about.js?v=7.6.7')
write(p,s)

# Jogos também recebe o cache global novo.
p='games.html'; s=read(p)
s=s.replace('games.css?v=7.6.4','games.css?v=7.6.7')
s=s.replace('games.js?v=7.6.4','games.js?v=7.6.7')
s=s.replace('v6_2_mobile.js?v=6.2','v6_2_mobile.js?v=7.6.7')
s=s.replace('WEB 7.6.4 · 26º PEL PE MEC','WEB 7.6.7 · 26º PEL PE MEC')
write(p,s)

# O patch global de navegação passa a anunciar a versão atual e registrar o About.
p='v7_6_5_webfix.js'; s=read(p)
s=s.replace("if(window.__TAREFAS_V765_WEBFIX__)return;","if(window.__TAREFAS_V767_WEBFIX__)return;")
s=s.replace("window.__TAREFAS_V765_WEBFIX__=true;","window.__TAREFAS_V767_WEBFIX__=true;")
s=s.replace("const VERSION='7.6.5';","const VERSION='7.6.7';")
start=s.find('const RELEASE=')
end=s.find(';\nfunction page()',start)
if start<0 or end<0: raise SystemExit('v7_6_5_webfix.js: RELEASE não encontrado')
release="const RELEASE={v:VERSION,title:'Pagamento com saldo PE e débito da Cia Com',current:true,items:['Adicionada a opção de usar o débito pendente da Cia Com como parte do pagamento das lavagens.','A lavagem pode ser paga somente pelo PE, somente pela Cia Com ou dividida entre os dois saldos.','O painel passa a mostrar o débito disponível da Cia Com e o total combinado PE + Cia Com.','O uso do débito da Cia Com reduz automaticamente o valor disponível e mantém histórico da divisão usada em cada lavagem.']};"
s=s[:start]+release+s[end+1:]
write(p,s)

# About consolidado.
p='v7_5_1_about.js'; s=read(p)
s=s.replace("const VERSION='7.6.4';","const VERSION='7.6.7';")
s=s.replace("{v:'7.6.6',title:'Saldo da Lavagem e identificação Web corrigidos',current:true","{v:'7.6.6',title:'Saldo da Lavagem e identificação Web corrigidos',current:false")
s=s.replace("{v:'7.6.4',title:'Lavagem com escolha ODT ou PDF',current:true","{v:'7.6.4',title:'Lavagem com escolha ODT ou PDF',current:false")
entry=" {v:'7.6.7',title:'Pagamento com saldo PE e débito da Cia Com',current:true,items:['Adicionada a opção de usar o débito pendente da Cia Com como parte do pagamento das lavagens.','A lavagem pode ser paga somente pelo PE, somente pela Cia Com ou dividida entre os dois saldos.','O painel passa a mostrar o débito disponível da Cia Com e o total combinado PE + Cia Com.','O uso do débito da Cia Com reduz automaticamente o valor disponível e mantém histórico da divisão usada em cada lavagem.']},\n"
needle='const releases=[\n'
if entry not in s:
    if needle not in s: raise SystemExit('v7_5_1_about.js: releases não encontrado')
    s=s.replace(needle,needle+entry,1)
write(p,s)
