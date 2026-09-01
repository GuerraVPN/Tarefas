from pathlib import Path
import re

def patch(path, old, new):
    p=Path(path); s=p.read_text(encoding='utf-8')
    if old not in s: raise SystemExit(f'{path}: trecho não encontrado: {old[:80]}')
    p.write_text(s.replace(old,new),encoding='utf-8')

# Corrige partidas com pontuação dependente exatamente da duração enviada.
patch('app/games.js',
"async function submitResult(value,details={}){if(ending||!runToken)return;ending=true;const duration=Math.max(1000,Math.round(performance.now()-startedAt));",
"async function submitResult(value,details={},durationOverride=null){if(ending||!runToken)return;ending=true;const duration=durationOverride??Math.max(1000,Math.round(performance.now()-startedAt));")
patch('app/games.js',"submitResult(sc,{moves,completed:true})","submitResult(sc,{moves,completed:true},dur)")
patch('app/games.js',"submitResult(sc,{revealed:open.size,completed:true})","submitResult(sc,{revealed:open.size,completed:true},dur)")

# Evita múltiplos toques contarem mais de uma vez na mesma rodada de reflexo.
patch('app/games.js',"let round=0,ready=false,goAt=0,values=[];function next(){","let round=0,ready=false,locked=false,goAt=0,values=[];function next(){")
patch('app/games.js',"round++;ready=false;pad.className='tm-reflex-pad wait';","round++;ready=false;locked=false;pad.className='tm-reflex-pad wait';")
patch('app/games.js',"pad.onclick=()=>{if(!busy)return;if(!ready){","pad.onclick=()=>{if(!busy||locked)return;locked=true;if(!ready){")
patch('app/games.js',"ready=true;goAt=performance.now();pad.className='tm-reflex-pad go';","ready=true;locked=false;goAt=performance.now();pad.className='tm-reflex-pad go';")

# Eleva a beta para 1.9.8 / build 198 mantendo a base web atual do app.
p=Path('package.json'); s=p.read_text(encoding='utf-8')
s=s.replace('"version": "1.9.7"','"version": "1.9.8"')
s=re.sub(r'"description": ".*?"', '"description": "TAREFAS Android 1.9.8 build 198 beta com nove jogos e placares públicos, mantendo a Base web 7.5.7."', s, count=1)
p.write_text(s,encoding='utf-8')

lock=Path('package-lock.json')
if lock.exists():
    s=lock.read_text(encoding='utf-8').replace('"version": "1.9.7"','"version": "1.9.8"',2)
    lock.write_text(s,encoding='utf-8')

p=Path('scripts/build-mobile.mjs'); s=p.read_text(encoding='utf-8')
s=s.replace("'1.9.7'","'1.9.8'").replace('197','198').replace('v197','v198')
s=s.replace('Dinossauro e placar público','nove jogos e placares públicos').replace('Dinossauro, pontuação e placar público','nove jogos e placares públicos')
p.write_text(s,encoding='utf-8')

p=Path('scripts/verify-mobile-build.mjs'); s=p.read_text(encoding='utf-8')
s=s.replace('1.9.7','1.9.8').replace('197','198')
needle="assertFileContains('games.js', 'v1_9_7_games_leaderboard');"
if needle in s:
    s=s.replace(needle,"assertFileContains('games.js', 'v1_9_8_games_leaderboard');\nassertFileContains('games.js', 'v1_9_8_start_game_run');\nassertFileContains('games.js', 'v1_9_8_submit_game_score');\nfor (const marker of ['snake','memory','game2048','minesweeper','precision','reflex','flight','hillclimb']) assertFileContains('games.js', marker);")
s=s.replace('Dinossauro e placar público','nove jogos e placares públicos').replace('Dinossauro, pontuação e placar público','nove jogos e placares públicos')
p.write_text(s,encoding='utf-8')
