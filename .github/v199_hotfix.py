from pathlib import Path
import json


def patch(path, old, new, count=None):
    p=Path(path)
    s=p.read_text(encoding='utf-8')
    if old not in s:
        raise SystemExit(f'{path}: trecho não encontrado: {old[:100]}')
    s=s.replace(old,new) if count is None else s.replace(old,new,count)
    p.write_text(s,encoding='utf-8')

# Versão do pacote.
p=Path('package.json')
data=json.loads(p.read_text(encoding='utf-8'))
data['version']='1.9.9'
data['description']='TAREFAS Android 1.9.9 build 199 beta com correção da conexão do placar e início dos jogos, mantendo a Base web 7.5.7.'
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Mantém o lock coerente com o package.json.
p=Path('package-lock.json')
if p.exists():
    s=p.read_text(encoding='utf-8')
    s=s.replace('"version": "1.9.8"','"version": "1.9.9"',2)
    p.write_text(s,encoding='utf-8')

# Build móvel 1.9.9 / 199.
p=Path('scripts/build-mobile.mjs')
s=p.read_text(encoding='utf-8')
s=s.replace('1.9.8','1.9.9').replace('198','199').replace('v198','v199')
s=s.replace('com Jogos, nove jogos e placares públicos','com Jogos, placar corrigido e nove jogos')
p.write_text(s,encoding='utf-8')

# Verificador 1.9.9 / 199 e trava para a chave do Supabase.
p=Path('scripts/verify-mobile-build.mjs')
s=p.read_text(encoding='utf-8')
s=s.replace('1.9.8','1.9.9').replace('198','199')
needle="if(await exists('games.html')){const s=await text('games.html');for(const n of ['BETA 1.9.9','Dinossauro','Cobrinha','Memória','2048','Campo Minado','Precisão','Reflexo','Voo Infinito','Subida Infinita','gamePicker','leaderboardList','games.css','games.js'])if(!s.includes(n))errors.push(`jogos html: ${n}`)}"
if needle not in s:
    raise SystemExit('verify: bloco games.html esperado não encontrado')
replacement=needle+"\nif(await exists('games.html')&&await exists('dashboard.html')){const g=await text('games.html'),d=await text('dashboard.html');const re=/SUPABASE_ANON_KEY\\s*=\\s*['\\\"]([^'\\\"]+)['\\\"]/;const kg=g.match(re)?.[1],kd=d.match(re)?.[1];if(!kg||!kd)errors.push('supabase anon key ausente em games/dashboard');else if(kg!==kd)errors.push('games.html: chave Supabase diferente da chave canônica do app')}"
s=s.replace(needle,replacement)
s=s.replace('nove jogos e placares públicos','placar corrigido e nove jogos')
p.write_text(s,encoding='utf-8')

# Pipeline oficial: novo build, mesma branch autorizada e mesmos RPCs v1_9_8.
p=Path('.github/workflows/android-debug.yml')
s=p.read_text(encoding='utf-8')
s=s.replace('1.9.8','1.9.9').replace('198','199')
# Confere explicitamente que a chave dos Jogos é a mesma do dashboard no bundle.
marker="          node --check dist/games.js\n"
if marker in s and 'Chave Supabase dos Jogos' not in s:
    extra="""          node --check dist/games.js\n          echo 'Chave Supabase dos Jogos'\n          python3 - <<'PY'\n          import re\n          from pathlib import Path\n          def key(path):\n              m=re.search(r\"SUPABASE_ANON_KEY\\s*=\\s*['\\\"]([^'\\\"]+)['\\\"]\",Path(path).read_text(encoding='utf-8'))\n              assert m, path\n              return m.group(1)\n          assert key('dist/games.html') == key('dist/dashboard.html'), 'games.html com chave Supabase divergente'\n          PY\n"""
    s=s.replace(marker,extra,1)
p.write_text(s,encoding='utf-8')
