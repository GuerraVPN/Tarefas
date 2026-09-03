from pathlib import Path

VERSION='7.6.11'

def replace(path, old, new, required=True):
    p=Path(path)
    s=p.read_text(encoding='utf-8')
    if old not in s:
        if required:
            raise SystemExit(f'{path}: trecho não encontrado: {old[:100]}')
        return False
    p.write_text(s.replace(old,new),encoding='utf-8')
    return True

needle=".from('tarefas').update({"
actor=".from('tarefas').update({atualizado_por:Number(usuarioLogado.id),atualizado_por_perfil_id:usuarioPerfilAtual?.perfil_id?Number(usuarioPerfilAtual.perfil_id):null,"

for name in ['menu.html','minhas_tarefas.html']:
    p=Path(name)
    s=p.read_text(encoding='utf-8')
    total=s.count(needle)
    if total < 1:
        raise SystemExit(f'{name}: nenhuma atualização direta de tarefa encontrada')
    if 'atualizado_por:Number(usuarioLogado.id)' in s:
        raise SystemExit(f'{name}: marcador V7.6.11 já existe antes do patch')
    s=s.replace(needle,actor)
    p.write_text(s,encoding='utf-8')
    print(f'{name}: {total} update(s) de tarefa identificados com autor')

replace('v7_5_1_version.js',"const VERSION='7.6.10',BADGE='● TAREFAS v'+VERSION;","const VERSION='7.6.11',BADGE='● TAREFAS v'+VERSION;")
replace('v7_5_1_about.js',"const VERSION='7.6.10';","const VERSION='7.6.11';")
replace('v7_5_1_about.js',
"const releases=[\n {v:'7.6.10',title:'Atualizações do Android exclusivas do aplicativo',current:true,",
"const releases=[\n {v:'7.6.11',title:'Notificações sem avisar o próprio autor',current:true,items:['Ações feitas pelo próprio usuário deixam de gerar notificações para ele mesmo.','Tarefas atualizadas e novos despachos continuam notificando normalmente os outros responsáveis.','A regra central também vale para ações identificadas de escala, férias/dispensas, guias orçamentárias e lavanderia.','Avisos automáticos, lembretes, mensagens de outras pessoas e atualizações do aplicativo continuam funcionando normalmente.','Base preparada para a beta Android 2.2.2.']},\n {v:'7.6.10',title:'Atualizações do Android exclusivas do aplicativo',current:false,")
replace('v6_2_mobile.js','v7_5_1_version.js?v=7.6.10','v7_5_1_version.js?v=7.6.11')
replace('v6_2_mobile.js','v7_5_1_about.js?v=7.6.10','v7_5_1_about.js?v=7.6.11')

htmls=list(Path('.').glob('*.html'))
for p in htmls:
    s=p.read_text(encoding='utf-8')
    s=s.replace('?v=7.6.10','?v=7.6.11')
    s=s.replace('notificacoes.js?v=6.0','notificacoes.js?v=7.6.11')
    s=s.replace('central.js?v=6.0','central.js?v=7.6.11')
    s=s.replace('central.js?v=5.2','central.js?v=7.6.11')
    s=s.replace('central.js?v=5.1','central.js?v=7.6.11')
    p.write_text(s,encoding='utf-8')

for name in ['menu.html','minhas_tarefas.html']:
    s=Path(name).read_text(encoding='utf-8')
    if needle in s.replace(actor,''):
        raise SystemExit(f'{name}: ainda existe update de tarefa sem autor V7.6.11')
    if s.count(actor) < 1:
        raise SystemExit(f'{name}: marcador do autor não foi aplicado')

print(f'Web {VERSION}: auto-notificações do autor suprimidas em {len(htmls)} páginas.')
