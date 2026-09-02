from pathlib import Path

VERSION='7.6.2'

def patch(path, old, new, count=None):
    p=Path(path); s=p.read_text(encoding='utf-8')
    if old not in s:
        raise SystemExit(f'{path}: trecho não encontrado: {old[:140]}')
    s=s.replace(old,new) if count is None else s.replace(old,new,count)
    p.write_text(s,encoding='utf-8')

# A Lavagem veio da base Android 2.1.2, mas no site deve identificar a base Web atual.
patch('lavanderia_v211.js','ORÇAMENTÁRIO · BETA 2.1.1','ORÇAMENTÁRIO · WEB 7.6.2')

# Carregar Lavagem + financeiro + gerador ODT no site.
p=Path('orcamentarios.html'); s=p.read_text(encoding='utf-8')
block='''  <script src="lavanderia_v211.js?v=7.6.2"></script>\n  <script src="lavanderia_financeiro_v212.js?v=7.6.2"></script>\n  <script src="lavanderia_documento_v762.js?v=7.6.2"></script>\n'''
if 'lavanderia_documento_v762.js' not in s:
    if '</body>' not in s: raise SystemExit('orcamentarios.html: </body> não encontrado')
    s=s.replace('</body>',block+'</body>',1)
p.write_text(s,encoding='utf-8')

# Versão global 7.6.2.
patch('v7_5_1_version.js','__TAREFAS_V761_VERSION__','__TAREFAS_V762_VERSION__')
patch('v7_5_1_version.js',"const VERSION='7.6.1'","const VERSION='7.6.2'")
patch('v7_5_1_about.js',"const VERSION='7.6.1';","const VERSION='7.6.2';")
patch('v7_5_1_about.js',"{v:'7.6.1',title:'Rolagem dos Jogos e retorno de férias',current:true","{v:'7.6.1',title:'Rolagem dos Jogos e retorno de férias',current:false")
p=Path('v7_5_1_about.js'); s=p.read_text(encoding='utf-8')
entry=" {v:'7.6.2',title:'Arquivo ODT da Lavagem de Forro de Cama',current:true,items:['Corrigida a geração da folha Forro de Cama para Lavar no site: o botão passa a criar um arquivo ODT real em vez de depender de janela de impressão.','O documento reproduz a tabela Material/Quantidade e as linhas Quem mandou lavar e Quem recebeu.','A Lavagem de Forro de Cama foi incorporada à Base Web 7.6.2 com o mesmo fluxo já usado no aplicativo.','O download funciona mesmo com bloqueio de pop-up, pois a geração é feita diretamente no navegador.']},\n"
needle='const releases=[\n'
if entry not in s:
    if needle not in s: raise SystemExit('v7_5_1_about.js: releases não encontrado')
    s=s.replace(needle,needle+entry,1)
p.write_text(s,encoding='utf-8')
patch('v6_2_mobile.js','v7_5_1_version.js?v=7.6.1','v7_5_1_version.js?v=7.6.2')
patch('v6_2_mobile.js','v7_5_1_about.js?v=7.6.1','v7_5_1_about.js?v=7.6.2')

# Identificação da área Jogos acompanha a versão global do site.
for path in ['games.html','games.js']:
    p=Path(path); s=p.read_text(encoding='utf-8').replace('WEB 7.6.1','WEB 7.6.2').replace('games.css?v=7.6.1','games.css?v=7.6.2').replace('games.js?v=7.6.1','games.js?v=7.6.2')
    p.write_text(s,encoding='utf-8')
