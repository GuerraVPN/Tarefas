from pathlib import Path

def patch(path, old, new, count=None):
    p=Path(path); s=p.read_text(encoding='utf-8')
    if old not in s: raise SystemExit(f'{path}: trecho não encontrado: {old[:120]}')
    s=s.replace(old,new) if count is None else s.replace(old,new,count)
    p.write_text(s,encoding='utf-8')

# Jogos WEB: liberar rolagem vertical sem perder os controles próprios.
patch('games.css','html,body{overscroll-behavior-y:none}','html,body{overscroll-behavior-y:auto;overflow-y:auto!important;height:auto!important;touch-action:pan-y}')
patch('games.css','padding:86px 16px calc(108px + env(safe-area-inset-bottom));overflow-x:clip}','padding:86px 16px calc(108px + env(safe-area-inset-bottom));overflow-x:clip;overflow-y:visible}')
patch('games.css','touch-action:none;isolation:isolate','touch-action:pan-y;isolation:isolate')
patch('games.css','max-width:100%;touch-action:none}','max-width:100%;touch-action:pan-y}')

patch('games.js',"on(v.c,'pointerdown',e=>{e.preventDefault();jump()},{passive:false});","let tapX=0,tapY=0;on(v.c,'pointerdown',e=>{tapX=e.clientX;tapY=e.clientY},{passive:true});on(v.c,'pointerup',e=>{if(Math.hypot(e.clientX-tapX,e.clientY-tapY)<18)jump()},{passive:true});")
patch('games.js',"on(v.c,'pointerdown',e=>{e.preventDefault();flap()},{passive:false});","let flapX=0,flapY=0;on(v.c,'pointerdown',e=>{flapX=e.clientX;flapY=e.clientY},{passive:true});on(v.c,'pointerup',e=>{if(Math.hypot(e.clientX-flapX,e.clientY-flapY)<18)flap()},{passive:true});")
patch('games.js',"on(v.c,'pointerdown',e=>{e.preventDefault();sx=e.clientX;sy=e.clientY},{passive:false});on(v.c,'pointerup',e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;if(Math.abs(dx)>Math.abs(dy))turn(Math.sign(dx),0);else turn(0,Math.sign(dy))});","if(window.__TAREFAS_NATIVE_APP__){on(v.c,'pointerdown',e=>{e.preventDefault();sx=e.clientX;sy=e.clientY},{passive:false});on(v.c,'pointerup',e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;if(Math.abs(dx)>Math.abs(dy))turn(Math.sign(dx),0);else turn(0,Math.sign(dy))})}")
patch('games.js',"on(stage,'pointerdown',e=>{e.preventDefault();sx=e.clientX;sy=e.clientY},{passive:false});on(stage,'pointerup',e=>{const x=e.clientX-sx,y=e.clientY-sy;if(Math.max(Math.abs(x),Math.abs(y))<25)return;if(Math.abs(x)>Math.abs(y))move(Math.sign(x),0);else move(0,Math.sign(y))});","if(window.__TAREFAS_NATIVE_APP__){on(stage,'pointerdown',e=>{e.preventDefault();sx=e.clientX;sy=e.clientY},{passive:false});on(stage,'pointerup',e=>{const x=e.clientX-sx,y=e.clientY-sy;if(Math.max(Math.abs(x),Math.abs(y))<25)return;if(Math.abs(x)>Math.abs(y))move(Math.sign(x),0);else move(0,Math.sign(y))})}")
patch('games.js',"'WEB 7.6.0'","'WEB 7.6.1'")
patch('games.html','games.css?v=7.6.0','games.css?v=7.6.1')
patch('games.html','WEB 7.6.0 · 26º PEL PE MEC','WEB 7.6.1 · 26º PEL PE MEC')
patch('games.html','games.js?v=7.6.0','games.js?v=7.6.1')

# ADP: primeiro dia útil (segunda a sexta) após o término das férias.
helper="function adaptationDate(s){let d=addDays(s,1);while([0,6].includes(parseDate(d).getDay()))d=addDays(d,1);return d}\n"
for path in ['pessoal_v7.js','ferias_dispensas_v721.js','aditamento_v74.js']:
    p=Path(path); s=p.read_text(encoding='utf-8')
    needle="function addDays(s,n){const d=parseDate(s);d.setDate(d.getDate()+n);return iso(d)}\n"
    if helper.strip() not in s:
        if needle not in s: raise SystemExit(f'{path}: addDays não encontrado')
        s=s.replace(needle,needle+helper,1)
    s=s.replace('addDays(v.data_fim,1)===date','adaptationDate(v.data_fim)===date')
    s=s.replace('br(addDays(v.data_fim,1))','br(adaptationDate(v.data_fim))')
    p.write_text(s,encoding='utf-8')

patch('pessoal_v7.js',"const ESCALA_UI_VERSION='7.5.10';","const ESCALA_UI_VERSION='7.6.1';")
patch('pessoal.html','pessoal_v7.js?v=7.5.10','pessoal_v7.js?v=7.6.1')
patch('pessoal.html','aditamento_v74.js?v=7.4.7','aditamento_v74.js?v=7.6.1')
patch('ferias_dispensas.html','ferias_dispensas_v721.js?v=7.2.1','ferias_dispensas_v721.js?v=7.6.1')

# Versão e About.
patch('v7_5_1_version.js','__TAREFAS_V760_VERSION__','__TAREFAS_V761_VERSION__')
patch('v7_5_1_version.js',"const VERSION='7.6.0'","const VERSION='7.6.1'")
patch('v7_5_1_about.js',"const VERSION='7.6.0';","const VERSION='7.6.1';")
patch('v7_5_1_about.js',"{v:'7.6.0',title:'Jogos, ranking público e acabamento visual',current:true","{v:'7.6.0',title:'Jogos, ranking público e acabamento visual',current:false")
patch('v7_5_1_about.js',"const releases=[\n {v:'7.6.0'","const releases=[\n {v:'7.6.1',title:'Rolagem dos Jogos e retorno de férias',current:true,items:['Corrigida a rolagem vertical da página Jogos no site, inclusive quando o gesto começa sobre a pista do Dinossauro ou Voo Infinito.','No site, Cobrinha e 2048 passam a priorizar os botões de direção para não prender o scroll da página.','A ADP após férias nunca mais cai em sábado ou domingo: o retorno é deslocado para o próximo dia útil.','Exemplo: férias terminando na sexta-feira geram ADP na segunda-feira e o primeiro serviço permitido passa a ser terça-feira.','A regra também foi aplicada às validações do Supabase, escala de serviço, férias e aditamento.']},\n {v:'7.6.0'")
patch('v6_2_mobile.js',"v7_5_1_version.js?v=7.5.11","v7_5_1_version.js?v=7.6.1")
patch('v6_2_mobile.js',"v7_5_1_about.js?v=7.5.11","v7_5_1_about.js?v=7.6.1")
