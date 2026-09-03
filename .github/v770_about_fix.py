from pathlib import Path

ROOT=Path('.')

def read(p): return (ROOT/p).read_text(encoding='utf-8')
def write(p,s): (ROOT/p).write_text(s,encoding='utf-8')

# 1) About vira item nativo do v4_ui, sem depender do patch v6_5.
p='v4_ui.js'; s=read(p)
old="if(f.includes('config'))return'configuracoes';return''}"
new="if(f.includes('config'))return'configuracoes';if(f.includes('about'))return'about';return''}"
if old not in s and new not in s:
    raise SystemExit('v4_ui.js: activeKey não encontrado')
s=s.replace(old,new,1)
old=" navItem('configuracoes','Configurações','configuracoes.html','settings');"
new=" navItem('configuracoes','Configurações','configuracoes.html','settings')+\n navItem('about','About','about.html','file');"
if old not in s and new not in s:
    raise SystemExit('v4_ui.js: fim da navegação não encontrado')
s=s.replace(old,new,1)
write(p,s)

# 2) Patch legado não deve criar About duplicado; o badge usa navegação absoluta da origem atual.
p='v6_5_patch.js'; s=read(p)
s=s.replace("b.onclick=()=>location.href='about.html';","b.onclick=()=>location.assign(new URL('about.html',location.href).href);",1)
s=s.replace("if(!list.querySelector('[data-v65-nav=\"about\"]')){","if(!list.querySelector('[data-v65-nav=\"about\"]')&&!list.querySelector('[data-url=\"about.html\"]')){",1)
s=s.replace("about.querySelector('button').onclick=()=>location.href='about.html';","about.querySelector('button').onclick=()=>location.assign(new URL('about.html',location.href).href);",1)
write(p,s)

# 3) Fura cache do patch legado.
p='v6_2_mobile.js'; s=read(p)
s=s.replace("v6_5_patch.js?v=6.5","v6_5_patch.js?v=7.7.0-aboutfix")
write(p,s)

# 4) About carrega o histórico 7.7.0 diretamente, sem esperar a cadeia inteira do loader mobile.
p='about.html'; s=read(p)
s=s.replace('<b>7.4.12</b></div><div><small>Criador</small>','<b>7.7.0</b></div><div><small>Criador</small>',1)
needle='<script src="v6_2_mobile.js?v=7.7.0"></script>'
direct='<script src="v7_5_1_about.js?v=7.7.0-aboutfix"></script>\n'+needle
if 'v7_5_1_about.js?v=7.7.0-aboutfix' not in s:
    if needle not in s: raise SystemExit('about.html: loader mobile não encontrado')
    s=s.replace(needle,direct,1)

# 5) Corrige somente o About no desktop: o shell do v4_ui fixa a sidebar e também aplica
# margem/largura ao .main. Como esta página já nasce em flex, o flex-grow fazia o conteúdo
# ganhar novamente a largura da sidebar e ficar cortado à direita.
layout_fix='@media(min-width:901px){html body.v3-shell main.main{flex:0 0 calc(100% - 238px)!important;max-width:calc(100% - 238px)!important;min-width:0!important}}'
mobile_media='@media(max-width:900px){body{display:block}'
if layout_fix not in s:
    if mobile_media not in s: raise SystemExit('about.html: media query mobile não encontrada')
    s=s.replace(mobile_media,layout_fix+mobile_media,1)
write(p,s)

print('About 7.7.0 corrigido: navegação nativa, histórico direto e layout desktop sem recorte.')
