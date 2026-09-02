from pathlib import Path


def replace(path, old, new, count=None, required=True):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    if old not in s:
        if required:
            raise SystemExit(f'{path}: trecho não encontrado: {old[:160]}')
        return False
    s = s.replace(old, new) if count is None else s.replace(old, new, count)
    p.write_text(s, encoding='utf-8')
    return True

# 1) Corrige a causa dos R$ 0,00: const global não vira window.supabaseClient.
p = Path('lavanderia_financeiro_v212.js')
s = p.read_text(encoding='utf-8')
old = "async function load(){if(loading||!window.supabaseClient)return;const box=ensure();if(!box)return;loading=true;try{const [rs,rm]=await Promise.all([supabaseClient.from('lavanderia_financeiro_pe_resumo').select('*').single(),supabaseClient.from('lavanderia_financeiro_pe').select('id,data_movimento,tipo,descricao,valor,solicitacao_id').order('data_movimento',{ascending:false}).order('id',{ascending:false}).limit(12)]);"
new = "function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}\nasync function load(){const c=client();if(loading||!c)return;const box=ensure();if(!box)return;loading=true;try{const [rs,rm]=await Promise.all([c.from('lavanderia_financeiro_pe_resumo').select('*').single(),c.from('lavanderia_financeiro_pe').select('id,data_movimento,tipo,descricao,valor,solicitacao_id').order('data_movimento',{ascending:false}).order('id',{ascending:false}).limit(12)]);"
if old not in s:
    raise SystemExit('lavanderia_financeiro_v212.js: bloco load antigo não encontrado')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')

# 2) Identificação correta da Lavagem na Web.
replace('lavanderia_v211.js', 'ORÇAMENTÁRIO · WEB 7.6.2', 'ORÇAMENTÁRIO · WEB 7.6.6')
replace('lavanderia_documento_v762.js', 'TAREFAS WEB 7.6.4 / Android 2.1.5', 'TAREFAS WEB 7.6.6 / Android 2.1.5', required=False)

# 3) Cache-buster da página Orçamentários e módulos da lavanderia.
p = Path('orcamentarios.html')
s = p.read_text(encoding='utf-8')
s = s.replace('v6_2_mobile.js?v=6.2', 'v6_2_mobile.js?v=7.6.6')
s = s.replace('lavanderia_v211.js?v=7.6.4', 'lavanderia_v211.js?v=7.6.6')
s = s.replace('lavanderia_financeiro_v212.js?v=7.6.4', 'lavanderia_financeiro_v212.js?v=7.6.6')
s = s.replace('lavanderia_documento_v762.js?v=7.6.4', 'lavanderia_documento_v762.js?v=7.6.6')
p.write_text(s, encoding='utf-8')

# 4) Loader global e versão atual.
replace('v6_2_mobile.js', 'v7_5_1_version.js?v=7.6.5', 'v7_5_1_version.js?v=7.6.6')
replace('v6_2_mobile.js', 'v7_5_1_about.js?v=7.6.5', 'v7_5_1_about.js?v=7.6.6')

p = Path('v7_5_1_version.js')
s = p.read_text(encoding='utf-8')
s = s.replace('__TAREFAS_V765_VERSION__', '__TAREFAS_V766_VERSION__')
s = s.replace("const VERSION='7.6.5'", "const VERSION='7.6.6'")
p.write_text(s, encoding='utf-8')

# 5) Patch de navegação passa a identificar 7.6.6 e documenta a correção financeira.
p = Path('v7_6_5_webfix.js')
s = p.read_text(encoding='utf-8')
s = s.replace('__TAREFAS_V765_WEBFIX__', '__TAREFAS_V766_WEBFIX__')
s = s.replace("const VERSION='7.6.5';", "const VERSION='7.6.6';")
old_rel = "const RELEASE={v:VERSION,title:'Navegação da Lavagem e Jogos na Web',current:true,items:['A Lavagem de Forro de Cama passa a aparecer como uma opção própria dentro de Orçamentários.','Corrigido o problema que fazia a tela da Lavagem aparecer junto das outras abas do Orçamentários.','A área Jogos volta a aparecer no menu da versão Web e abre a página com os nove jogos e placares.','Mantidas as opções ODT e PDF da versão 7.6.4 para a folha Forro de Cama para Lavar.']};"
new_rel = "const RELEASE={v:VERSION,title:'Saldo da Lavagem e identificação Web corrigidos',current:true,items:['Corrigido o carregamento do financeiro da Lavagem que deixava Crédito, Gasto e Saldo Disponível em R$ 0,00 mesmo com movimentações registradas.','O painel volta a exibir o crédito do PE, os débitos já lançados e o saldo restante diretamente do Supabase.','A identificação da área Lavagem de Forro de Cama passa a mostrar WEB 7.6.6 em vez de WEB 7.6.2.','Mantidas a aba própria da Lavagem em Orçamentários, a área Jogos e a geração da folha em ODT ou PDF.']};"
if old_rel in s:
    s = s.replace(old_rel, new_rel, 1)
else:
    raise SystemExit('v7_6_5_webfix.js: RELEASE 7.6.5 não encontrado')
p.write_text(s, encoding='utf-8')

# 6) About: 7.6.6 atual, 7.6.5 deixa de ser current.
p = Path('v7_5_1_about.js')
s = p.read_text(encoding='utf-8')
s = s.replace("const VERSION='7.6.5';", "const VERSION='7.6.6';")
s = s.replace("{v:'7.6.5',title:'Navegação da Lavagem e Jogos na Web',current:true", "{v:'7.6.5',title:'Navegação da Lavagem e Jogos na Web',current:false")
entry = " {v:'7.6.6',title:'Saldo da Lavagem e identificação Web corrigidos',current:true,items:['Corrigido o carregamento do financeiro da Lavagem que deixava Crédito, Gasto e Saldo Disponível em R$ 0,00 mesmo com movimentações registradas.','O painel volta a exibir o crédito do PE, os débitos já lançados e o saldo restante diretamente do Supabase.','A identificação da área Lavagem de Forro de Cama passa a mostrar WEB 7.6.6 em vez de WEB 7.6.2.','Mantidas a aba própria da Lavagem em Orçamentários, a área Jogos e a geração da folha em ODT ou PDF.']},\n"
needle = 'const releases=[\n'
if entry not in s:
    if needle not in s:
        raise SystemExit('v7_5_1_about.js: releases não encontrado')
    s = s.replace(needle, needle + entry, 1)
p.write_text(s, encoding='utf-8')

# 7) Identificação estática dos Jogos, evitando piscar a versão anterior antes do patch.
for path in ['games.html', 'games.js']:
    p = Path(path)
    if p.exists():
        t = p.read_text(encoding='utf-8').replace('7.6.4', '7.6.6').replace('7.6.5', '7.6.6')
        p.write_text(t, encoding='utf-8')
