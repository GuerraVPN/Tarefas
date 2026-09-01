from pathlib import Path
import json,re

# package.json
p=Path('package.json'); data=json.loads(p.read_text(encoding='utf-8'))
data['version']='2.0.0'
data['description']='TAREFAS Android 2.0.0 build 200 oficial com Jogos e Base Web 7.6.0.'
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# package-lock: somente versão do pacote raiz
p=Path('package-lock.json'); s=p.read_text(encoding='utf-8')
s=s.replace('"version": "1.9.9"','"version": "2.0.0"',2)
p.write_text(s,encoding='utf-8')

# build mobile
p=Path('scripts/build-mobile.mjs'); s=p.read_text(encoding='utf-8')
s=s.replace('1.9.9','2.0.0').replace('199','200').replace('7.5.7','7.6.0').replace('v199','v200')
old="await patch('mobile-updates-v181.js',[[\"const APP_VERSION = '1.8.9';\",\"const APP_VERSION = '2.0.0';\"],[\"const APP_BUILD = 189;\",\"const APP_BUILD = 200;\"]]);"
new="await patch('mobile-updates-v181.js',[[\"const APP_VERSION = '1.8.9';\",\"const APP_VERSION = '2.0.0';\"],[\"const APP_BUILD = 189;\",\"const APP_BUILD = 200;\"],[\"const APP_CHANNEL = 'beta';\",\"const APP_CHANNEL = 'official';\"]]);"
if old not in s: raise SystemExit('build: mobile-updates patch não encontrado')
s=s.replace(old,new)
s=s.replace('BETA:', 'OFICIAL:').replace('placar corrigido e nove jogos','Jogos finalizados, gráficos renovados, trilhas próprias e placares públicos')
p.write_text(s,encoding='utf-8')

# verificador - versão/base/canal
p=Path('scripts/verify-mobile-build.mjs'); s=p.read_text(encoding='utf-8')
s=s.replace('1.9.9','2.0.0').replace('199','200').replace('7.5.7','7.6.0')
s=s.replace("\"APP_CHANNEL = 'beta'\"","\"APP_CHANNEL = 'official'\"")
s=s.replace("'v7_5_7_patch.js'","'v7_5_7_patch.js','v7_6_0_patch.js'",1)
# games HTML não usa mais marcador BETA
s=s.replace("'BETA 2.0.0',","")
# valida acabamento novo dos jogos
needle="'durationOverride']"
if needle in s:
    s=s.replace(needle,"'durationOverride','AudioDirector','setPointerCapture','APP 2.0.0','WEB 7.6.0']")
# loader e about 7.6.0
s=s.replace("for(const n of [\"VERSION='7.6.0'\",'v7_5_4_patch.js','v7_5_5_patch.js','v7_5_6_patch.js','v7_5_7_patch.js'])", "for(const n of [\"VERSION='7.6.0'\",'v7_5_4_patch.js','v7_5_5_patch.js','v7_5_6_patch.js','v7_5_7_patch.js','v7_6_0_patch.js'])")
s=s.replace("for(const n of [\"const VERSION='7.6.0'\",\"{v:'7.6.0'\",'contraste dos temas'])", "for(const n of [\"const VERSION='7.6.0'\",\"{v:'7.6.0'\",'Jogos, ranking público'])")
s=s.replace('BETA / WEB','OFICIAL / WEB').replace('BETA / WEB','OFICIAL / WEB').replace('BETA','OFICIAL')
s=s.replace('placar corrigido e nove jogos','Jogos finalizados e nove jogos com placares públicos')
p.write_text(s,encoding='utf-8')
