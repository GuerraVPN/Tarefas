from pathlib import Path
import re

def patch(path, old, new):
    p=Path(path); s=p.read_text(encoding='utf-8')
    if old not in s: raise SystemExit(f'{path}: trecho não encontrado: {old[:80]}')
    p.write_text(s.replace(old,new),encoding='utf-8')

# Pontuações que dependem da duração precisam enviar exatamente a duração usada na fórmula.
patch('app/games.js',
"async function submitResult(value,details={}){if(ending||!runToken)return;ending=true;const duration=Math.max(1000,Math.round(performance.now()-startedAt));",
"async function submitResult(value,details={},durationOverride=null){if(ending||!runToken)return;ending=true;const duration=durationOverride??Math.max(1000,Math.round(performance.now()-startedAt));")
patch('app/games.js',"submitResult(sc,{moves,completed:true})","submitResult(sc,{moves,completed:true},dur)")
patch('app/games.js',"submitResult(sc,{revealed:open.size,completed:true})","submitResult(sc,{revealed:open.size,completed:true},dur)")

# Uma rodada de reflexo aceita apenas um toque.
patch('app/games.js',"let round=0,ready=false,goAt=0,values=[];function next(){","let round=0,ready=false,locked=false,goAt=0,values=[];function next(){")
patch('app/games.js',"round++;ready=false;pad.className='tm-reflex-pad wait';","round++;ready=false;locked=false;pad.className='tm-reflex-pad wait';")
patch('app/games.js',"pad.onclick=()=>{if(!busy)return;if(!ready){","pad.onclick=()=>{if(!busy||locked)return;locked=true;if(!ready){")
patch('app/games.js',"ready=true;goAt=performance.now();pad.className='tm-reflex-pad go';","ready=true;locked=false;goAt=performance.now();pad.className='tm-reflex-pad go';")

# A entrada do menu passa a ser o hub Jogos.
p=Path('app/mobile-bootstrap.js'); s=p.read_text(encoding='utf-8')
for old in [
    "['Dinossauro','games.html','Corra, marque pontos e dispute o placar']",
    "['Dinossauro','games.html','Jogo e placar público']",
    "['Dinossauro','games.html','Jogo e ranking público']"
]:
    s=s.replace(old,"['Jogos','games.html','Nove jogos e placares públicos']")
p.write_text(s,encoding='utf-8')

# Versão 1.9.8 / build 198, ainda sobre a Base web 7.5.7 do app.
p=Path('package.json'); s=p.read_text(encoding='utf-8')
s=s.replace('"version": "1.9.7"','"version": "1.9.8"')
s=re.sub(r'"description": ".*?"', '"description": "TAREFAS Android 1.9.8 build 198 beta com nove jogos e placares públicos, mantendo a Base web 7.5.7."', s, count=1)
p.write_text(s,encoding='utf-8')

lock=Path('package-lock.json')
if lock.exists():
    s=lock.read_text(encoding='utf-8').replace('"version": "1.9.7"','"version": "1.9.8"',2)
    lock.write_text(s,encoding='utf-8')

p=Path('scripts/build-mobile.mjs'); s=p.read_text(encoding='utf-8')
s=s.replace('1.9.7','1.9.8').replace('197','198').replace('v197','v198')
s=s.replace('Dinossauro e placar público','nove jogos e placares públicos').replace('Dinossauro, pontuação e placar público','nove jogos e placares públicos')
p.write_text(s,encoding='utf-8')

# Atualiza o verificador legado da 1.9.7 para o hub completo da 1.9.8.
p=Path('scripts/verify-mobile-build.mjs'); s=p.read_text(encoding='utf-8')
s=s.replace('1.9.7','1.9.8').replace('197','198')
lines=[]
for line in s.splitlines():
    if line.startswith("if(await exists('mobile-bootstrap.js'))"):
        line=line.replace("['Dinossauro','games.html'","['Jogos','games.html'")
    elif line.startswith("if(await exists('games.html'))"):
        line="if(await exists('games.html')){const s=await text('games.html');for(const n of ['BETA 1.9.8','Dinossauro','Cobrinha','Memória','2048','Campo Minado','Precisão','Reflexo','Voo Infinito','Subida Infinita','gamePicker','leaderboardList','games.css','games.js'])if(!s.includes(n))errors.push(`jogos html: ${n}`)}"
    elif line.startswith("if(await exists('games.js'))"):
        line="if(await exists('games.js')){const s=await text('games.js');for(const n of ['v1_9_8_start_game_run','v1_9_8_submit_game_score','v1_9_8_games_leaderboard','tarefasPushSession17','requestAnimationFrame','dino','snake','memory','game2048','minesweeper','precision','reflex','flight','hillclimb','durationOverride'])if(!s.includes(n))errors.push(`jogos script: ${n}`)}"
    elif line.startswith("if(await exists('games.css'))"):
        line="if(await exists('games.css')){const s=await text('games.css');for(const n of ['.tm-games-picker','.tm-game-stage','.tm-memory-grid','.tm-2048-grid','.tm-mine-grid','.tm-target','.tm-reflex-pad','.tm-leaderboard-row','touch-action:none'])if(!s.includes(n))errors.push(`jogos css: ${n}`)}"
    lines.append(line)
s='\n'.join(lines)+'\n'
s=s.replace('Dinossauro e placar público','nove jogos e placares públicos').replace('Dinossauro, placar público','nove jogos e placares públicos')
p.write_text(s,encoding='utf-8')
