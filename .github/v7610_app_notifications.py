from pathlib import Path

VERSION='7.6.10'


def replace(path, old, new, required=True):
    p=Path(path)
    s=p.read_text(encoding='utf-8')
    if old not in s:
        if required:
            raise SystemExit(f'{path}: trecho não encontrado: {old[:80]}')
        return False
    p.write_text(s.replace(old,new),encoding='utf-8')
    return True

# Atualizações do app são exclusivamente do Android: não entram em listas/contadores da Web.
replace('notificacoes.js',
"function visible(row){const u=getUser();const p=u?.perfil_id??null;return row?.perfil_id==null||(p!=null&&n(row.perfil_id)===n(p))}",
"function native(){return !!window.__TAREFAS_NATIVE_APP__}\nfunction appUpdate(row){return ['app_update','app_update_reminder'].includes(norm(row?.tipo))}\nfunction visible(row){const u=getUser();const p=u?.perfil_id??null;const perfil=row?.perfil_id==null||(p!=null&&n(row.perfil_id)===n(p));return perfil&&(native()||!appUpdate(row))}")

replace('central.js',
"function user(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}function visible(n){return n.perfil_id==null||String(n.perfil_id)===String(u.perfil_id??'')}function time(v)",
"function user(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}function native(){return !!window.__TAREFAS_NATIVE_APP__}function appUpdate(n){return ['app_update','app_update_reminder'].includes(String(n?.tipo||'').trim().toLowerCase())}function visible(n){const perfil=n.perfil_id==null||String(n.perfil_id)===String(u.perfil_id??'');return perfil&&(native()||!appUpdate(n))}function time(v)")

# A antiga preferência de exibição no site deixa de existir: na Web é sempre oculto.
p=Path('v7_5_4_patch.js')
s=p.read_text(encoding='utf-8')
start=s.index('function filterSiteAppUpdates(){')
end=s.index('\nfunction injectAppLogout(){',start)
new_block="""function filterSiteAppUpdates(){
 if(native())return;
 for(const card of notificationCards()){card.style.display='none';card.dataset.v754AppUpdate='hidden'}
 document.getElementById('v754SiteAppUpdates')?.remove();
}
function injectSiteUpdateSetting(){
 if(native())return;
 document.getElementById('v754SiteAppUpdates')?.remove();
}
"""
s=s[:start]+new_block+s[end:]
p.write_text(s,encoding='utf-8')

replace('v7_5_1_version.js',"const VERSION='7.6.9',BADGE='● TAREFAS v'+VERSION;",f"const VERSION='{VERSION}',BADGE='● TAREFAS v'+VERSION;")
replace('v7_5_1_about.js',"const VERSION='7.6.9';",f"const VERSION='{VERSION}';")
replace('v7_5_1_about.js',
"const releases=[\n {v:'7.6.9',title:'Atualização cadastral obrigatória',current:true,",
"const releases=[\n {v:'7.6.10',title:'Atualizações do Android exclusivas do aplicativo',current:true,items:['Notificações de novas versões do aplicativo deixam de aparecer na Web e deixam de entrar nos contadores da Central no navegador.','Os avisos de atualização continuam disponíveis normalmente no aplicativo Android.','Removida da Web a antiga opção de exibir ou ocultar avisos do Android, pois eles passam a ser sempre exclusivos do app.','Base preparada para a beta Android 2.2.1 com lembrete diário de versão antiga e descarte da notificação ao tocar.']},\n {v:'7.6.9',title:'Atualização cadastral obrigatória',current:false,")
replace('v6_2_mobile.js',"v7_5_1_version.js?v=7.6.9","v7_5_1_version.js?v=7.6.10")
replace('v6_2_mobile.js',"v7_5_1_about.js?v=7.6.9","v7_5_1_about.js?v=7.6.10")

htmls=list(Path('.').glob('*.html'))
for p in htmls:
    s=p.read_text(encoding='utf-8')
    s=s.replace('?v=7.6.9','?v=7.6.10')
    s=s.replace('notificacoes.js?v=6.0','notificacoes.js?v=7.6.10')
    s=s.replace('central.js?v=6.0','central.js?v=7.6.10')
    s=s.replace('central.js?v=5.2','central.js?v=7.6.10')
    s=s.replace('central.js?v=5.1','central.js?v=7.6.10')
    p.write_text(s,encoding='utf-8')

print(f'Web {VERSION}: atualizações Android ocultas na Web em {len(htmls)} páginas.')
