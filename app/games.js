(() => {
  'use strict';

  const GAME_KEY='dino';
  const SESSION_KEY='tarefasPushSession17';
  const user=JSON.parse(localStorage.getItem('usuarioLogado')||'null');
  const canvas=document.getElementById('dinoCanvas');
  const ctx=canvas.getContext('2d');
  const stage=document.getElementById('dinoStage');
  const startButton=document.getElementById('dinoStart');
  const scoreEl=document.getElementById('dinoScore');
  const bestEl=document.getElementById('dinoBest');
  const rankEl=document.getElementById('dinoRank');
  const speedEl=document.getElementById('dinoSpeed');
  const statusEl=document.getElementById('dinoStatus');
  const overlay=document.getElementById('dinoOverlay');
  const overlayTitle=document.getElementById('dinoOverlayTitle');
  const overlayText=document.getElementById('dinoOverlayText');
  const leaderboard=document.getElementById('leaderboardList');
  const refreshButton=document.getElementById('leaderboardRefresh');

  let width=0,height=0,dpr=1,ground=0,raf=0,lastFrame=0,startedAt=0;
  let running=false,starting=false,submitting=false,runToken='',distance=0,score=0,speed=340;
  let spawnIn=1.1,obstacles=[],clouds=[];
  const dino={x:72,y:0,w:40,h:46,vy:0,onGround:true,step:0};

  const session=()=>localStorage.getItem(SESSION_KEY)||'';
  const setStatus=(message,bad=false)=>{statusEl.textContent=message;statusEl.classList.toggle('error',bad)};
  const padScore=value=>String(Math.max(0,Number(value)||0)).padStart(5,'0');
  const friendlyError=error=>{
    const text=String(error?.message||error||'');
    if(text.includes('SESSAO'))return 'Sua sessão expirou. Entre novamente no app.';
    if(text.includes('PARTIDA_JA_ENVIADA'))return 'Essa partida já foi registrada.';
    if(text.includes('PARTIDA'))return 'A partida não pôde ser validada. Jogue novamente.';
    if(text.includes('PONTUACAO')||text.includes('DURACAO'))return 'O servidor não conseguiu validar essa corrida.';
    return 'Não foi possível conectar ao placar agora.';
  };

  function resize(){
    const rect=canvas.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,2);
    width=Math.max(300,Math.round(rect.width));height=Math.max(200,Math.round(rect.height));
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);ground=height-42;
    if(!running)dino.y=ground-dino.h;
    draw();
  }

  function resetWorld(){
    distance=0;score=0;speed=340;spawnIn=1.05;obstacles=[];
    dino.y=ground-dino.h;dino.vy=0;dino.onGround=true;dino.step=0;
    clouds=[{x:width*.25,y:42,s:1},{x:width*.72,y:75,s:.75},{x:width*1.05,y:34,s:.9}];
    scoreEl.textContent='00000';speedEl.textContent='1,0×';
  }

  function roundedRect(x,y,w,h,r){
    const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
  }

  function drawCloud(cloud){
    ctx.save();ctx.globalAlpha=.38;ctx.fillStyle='#6eaa91';
    ctx.beginPath();ctx.arc(cloud.x,cloud.y,12*cloud.s,0,Math.PI*2);ctx.arc(cloud.x+15*cloud.s,cloud.y-5*cloud.s,17*cloud.s,0,Math.PI*2);ctx.arc(cloud.x+33*cloud.s,cloud.y,12*cloud.s,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function drawDino(){
    const x=dino.x,y=dino.y,bob=running&&dino.onGround?Math.sin(dino.step)*1.3:0;
    ctx.save();ctx.translate(x,y+bob);ctx.fillStyle='#0d6b4d';
    roundedRect(5,14,29,27,5);ctx.fill();roundedRect(22,1,26,22,5);ctx.fill();
    ctx.fillRect(43,13,11,7);ctx.fillRect(0,25,10,8);ctx.fillRect(-6,28,8,5);
    ctx.fillStyle='#d8f7e9';ctx.fillRect(35,6,4,4);ctx.fillStyle='#082b20';ctx.fillRect(36,6,3,3);
    ctx.fillStyle='#0d6b4d';
    if(!dino.onGround){ctx.fillRect(9,38,8,8);ctx.fillRect(25,38,8,8)}
    else if(Math.sin(dino.step)>0){ctx.fillRect(8,38,8,8);ctx.fillRect(27,38,7,4)}
    else{ctx.fillRect(8,38,7,4);ctx.fillRect(26,38,8,8)}
    ctx.restore();
  }

  function drawObstacle(o){
    const y=ground-o.h;ctx.save();ctx.fillStyle='#18875f';
    roundedRect(o.x,y,o.w,o.h,4);ctx.fill();
    ctx.fillRect(o.x-7,y+o.h*.36,9,6);ctx.fillRect(o.x-7,y+o.h*.22,5,o.h*.2);
    if(o.w>25){ctx.fillRect(o.x+o.w-2,y+o.h*.48,8,6);ctx.fillRect(o.x+o.w+2,y+o.h*.32,4,o.h*.22)}
    ctx.fillStyle='#0b6044';ctx.fillRect(o.x+Math.max(5,o.w*.45),y+5,3,o.h-9);ctx.restore();
  }

  function draw(){
    if(!width||!height)return;
    const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#e7fff4');sky.addColorStop(1,'#bce9d5');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
    ctx.fillStyle='#f6cc62';ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(width-47,43,20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    clouds.forEach(drawCloud);
    ctx.fillStyle='#8bc6ac';ctx.fillRect(0,ground,width,height-ground);
    ctx.fillStyle='#2b7057';ctx.fillRect(0,ground,width,4);
    ctx.fillStyle='#73b397';for(let x=-(distance%34);x<width;x+=34)ctx.fillRect(x,ground+16,18,3);
    obstacles.forEach(drawObstacle);drawDino();
  }

  function jump(){
    if(!running||!dino.onGround)return;
    dino.vy=-720;dino.onGround=false;
  }

  function spawnObstacle(){
    const tall=Math.random()>.48;
    obstacles.push({x:width+28,w:tall?24:34,h:tall?58:39});
    const pace=Math.max(.72,1.28-speed/1700);spawnIn=pace+Math.random()*.55;
  }

  function collides(o){
    const dx=dino.x+7,dy=dino.y+6,dw=dino.w-10,dh=dino.h-7;
    const oy=ground-o.h;
    return dx<o.x+o.w-3&&dx+dw>o.x+3&&dy<oy+o.h&&dy+dh>oy+4;
  }

  function update(dt){
    speed=Math.min(700,340+score*.45);distance+=speed*dt;score=Math.floor(distance/10);
    scoreEl.textContent=padScore(score);speedEl.textContent=(speed/340).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'×';
    dino.vy+=1850*dt;dino.y+=dino.vy*dt;
    if(dino.y>=ground-dino.h){dino.y=ground-dino.h;dino.vy=0;dino.onGround=true}else dino.onGround=false;
    dino.step+=dt*14;
    spawnIn-=dt;if(spawnIn<=0)spawnObstacle();
    obstacles.forEach(o=>o.x-=speed*dt);obstacles=obstacles.filter(o=>o.x+o.w>-20);
    clouds.forEach(c=>{c.x-=22*c.s*dt;if(c.x<-55)c.x=width+55+Math.random()*120});
    if(obstacles.some(collides))finishGame();
  }

  function frame(now){
    if(!running)return;
    const dt=Math.min(.032,Math.max(0,(now-lastFrame)/1000));lastFrame=now;update(dt);draw();
    if(running)raf=requestAnimationFrame(frame);
  }

  async function beginGame(){
    if(running||starting||submitting)return;
    if(!navigator.onLine)return setStatus('Conecte-se à internet para iniciar uma partida válida.',true);
    if(!session())return setStatus('Faça login novamente para liberar as partidas e o placar.',true);
    starting=true;startButton.disabled=true;startButton.textContent='Preparando…';setStatus('Validando a partida com o servidor…');
    try{
      const {data,error}=await supabaseClient.rpc('v1_9_7_start_game_run',{p_session_token:session(),p_game_key:GAME_KEY});
      if(error)throw error;if(!data)throw new Error('PARTIDA_INVALIDA');
      runToken=data;resetWorld();running=true;startedAt=performance.now();lastFrame=startedAt;
      overlay.classList.add('hidden');startButton.textContent='Correndo…';setStatus('Toque na pista para pular. Boa corrida!');
      raf=requestAnimationFrame(frame);
    }catch(error){setStatus(friendlyError(error),true);startButton.textContent='Tentar novamente'}
    finally{starting=false;startButton.disabled=running}
  }

  async function finishGame(){
    if(!running)return;
    running=false;cancelAnimationFrame(raf);const duration=Math.max(1000,Math.round(performance.now()-startedAt));
    overlay.classList.remove('hidden');overlayTitle.textContent='Fim de jogo';overlayText.textContent=`Você marcou ${score.toLocaleString('pt-BR')} pontos.`;
    startButton.disabled=true;startButton.textContent='Enviando…';submitting=true;setStatus('Registrando sua pontuação no placar…');
    try{
      const {data,error}=await supabaseClient.rpc('v1_9_7_submit_game_score',{p_session_token:session(),p_run_token:runToken,p_game_key:GAME_KEY,p_score:score,p_duration_ms:duration});
      if(error)throw error;
      bestEl.textContent=Number(data?.personal_best||score).toLocaleString('pt-BR');rankEl.textContent=data?.rank?`#${data.rank}`:'—';
      setStatus('Pontuação registrada! O placar já foi atualizado.');await loadLeaderboard();
    }catch(error){setStatus(friendlyError(error)+' Sua corrida ficou somente neste aparelho.',true)}
    finally{submitting=false;startButton.disabled=false;startButton.textContent='Jogar novamente'}
  }

  function abortGame(){
    if(!running)return;
    running=false;cancelAnimationFrame(raf);runToken='';overlay.classList.remove('hidden');overlayTitle.textContent='Partida pausada';overlayText.textContent='Por segurança, inicie uma nova corrida para valer pontos.';
    startButton.disabled=false;startButton.textContent='Recomeçar';setStatus('A partida foi encerrada quando o app saiu da tela.');draw();
  }

  function formatDate(value){
    if(!value)return 'Agora';
    try{return new Date(value).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}catch{return '—'}
  }

  function renderLeaderboard(rows){
    leaderboard.replaceChildren();
    if(!rows.length){const empty=document.createElement('div');empty.className='tm-leaderboard-empty';empty.textContent='Ainda não há pontuações. Seja o primeiro a correr!';leaderboard.appendChild(empty);bestEl.textContent='0';rankEl.textContent='—';return}
    let mine=null;
    rows.forEach(row=>{
      const pos=Number(row.ranking);if(String(row.usuario_id)===String(user?.id))mine=row;
      const item=document.createElement('div');item.className=`tm-leaderboard-row top-${Math.min(pos,4)}${String(row.usuario_id)===String(user?.id)?' me':''}`;
      const place=document.createElement('div');place.className='tm-leaderboard-place';place.textContent=pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':`#${pos}`;
      const player=document.createElement('div');player.className='tm-leaderboard-player';const name=document.createElement('strong');name.textContent=row.jogador||'Jogador';const date=document.createElement('small');date.textContent=(String(row.usuario_id)===String(user?.id)?'Você • ':'')+formatDate(row.achieved_at);player.append(name,date);
      const points=document.createElement('div');points.className='tm-leaderboard-points';const value=document.createElement('strong');value.textContent=Number(row.score||0).toLocaleString('pt-BR');const label=document.createElement('small');label.textContent='PONTOS';points.append(value,label);
      item.append(place,player,points);leaderboard.appendChild(item);
    });
    bestEl.textContent=mine?Number(mine.score).toLocaleString('pt-BR'):'0';rankEl.textContent=mine?`#${mine.ranking}`:'—';
  }

  async function loadLeaderboard(){
    refreshButton.disabled=true;refreshButton.classList.add('loading');
    try{
      const {data,error}=await supabaseClient.rpc('v1_9_7_games_leaderboard',{p_game_key:GAME_KEY,p_limit:50});
      if(error)throw error;renderLeaderboard(Array.isArray(data)?data:[]);
    }catch(error){leaderboard.innerHTML='<div class="tm-leaderboard-empty">Não foi possível carregar o placar. Verifique sua conexão.</div>'}
    finally{refreshButton.disabled=false;refreshButton.classList.remove('loading')}
  }

  stage.addEventListener('pointerdown',event=>{event.preventDefault();if(running)jump();else if(!starting&&!submitting)beginGame()});
  startButton.addEventListener('click',beginGame);refreshButton.addEventListener('click',loadLeaderboard);
  window.addEventListener('keydown',event=>{if(event.code==='Space'||event.code==='ArrowUp'){event.preventDefault();if(running)jump();else beginGame()}});
  window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)abortGame()});

  resetWorld();resize();loadLeaderboard();
})();
