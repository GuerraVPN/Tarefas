import { readFile, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';

await import('./build-mobile.mjs');

const root=process.cwd();
const dist=path.join(root,'dist');

async function patch(rel,replacements){
  const file=path.join(dist,rel);
  let text=await readFile(file,'utf8');
  for(const [from,to] of replacements){
    if(!text.includes(from)) throw new Error(`${rel}: trecho esperado não encontrado: ${from}`);
    text=text.split(from).join(to);
  }
  await writeFile(file,text,'utf8');
}

await patch('mobile-bootstrap.js',[
  ["const APP_VERSION = '2.0.0';","const APP_VERSION = '2.0.1';"],
  ['const APP_BUILD = 200;','const APP_BUILD = 201;']
]);
await patch('mobile-preload.js',[
  ["tarefasAppVersion = '2.0.0'","tarefasAppVersion = '2.0.1'"],
  ["tarefasAppBuild = '200'","tarefasAppBuild = '201'"]
]);
await patch('mobile-v12.js',[["2.0.0 • WEB 7.6.0","2.0.1 • WEB 7.6.0"]]);
await patch('mobile-updates-v181.js',[
  ["const APP_VERSION = '2.0.0';","const APP_VERSION = '2.0.1';"],
  ["const APP_BUILD = 200;","const APP_BUILD = 201;"],
  ["const APP_CHANNEL = 'official';","const APP_CHANNEL = 'beta';"]
]);
await patch('native-mobile.js',[["2.0.0","2.0.1"]]);

await patch('games.html',[
  ['games.css?v=2.0.0','games.css?v=2.0.1'],
  ['games.js?v=2.0.0','games.js?v=2.0.1']
]);
await patch('games.js',[
  ["current=key;picker.querySelectorAll('[data-game]').forEach", "current=key;stage.dataset.game=key;picker.querySelectorAll('[data-game]').forEach"],
  ["on(v.c,'pointerdown',e=>{e.preventDefault();jump()},{passive:false});", "on(v.c,'click',()=>jump());"],
  ["on(v.c,'pointerdown',e=>{e.preventDefault();flap()},{passive:false});", "on(v.c,'click',()=>flap());"],
  ["'APP 2.0.0':'WEB 7.6.0'", "'APP 2.0.1':'WEB 7.6.0'"]
]);

const css=`
/* Android 2.0.1 beta — enquadramento e rolagem dos Jogos */
html.tarefas-mobile-shell,html.tarefas-mobile-shell body.tm-games-body{height:auto!important;min-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:auto!important;-webkit-overflow-scrolling:touch!important}
html.tarefas-mobile-shell body.tm-games-body{touch-action:pan-y!important}
html.tarefas-mobile-shell .tm-games-page{width:100%!important;max-width:760px!important;min-height:100dvh!important;margin:0 auto!important;padding:12px 10px calc(132px + env(safe-area-inset-bottom,0px))!important;overflow:visible!important;--stage-h:clamp(218px,58vw,272px)}
html.tarefas-mobile-shell .tm-games-hero{margin-top:0!important;margin-bottom:12px!important;padding-top:0!important}
html.tarefas-mobile-shell .tm-games-picker-wrap{margin-bottom:12px!important}
html.tarefas-mobile-shell .tm-game-stage{min-height:var(--stage-h)!important;touch-action:pan-y!important}
html.tarefas-mobile-shell .tm-game-stage canvas{height:var(--stage-h)!important;min-height:0!important;touch-action:pan-y!important}
html.tarefas-mobile-shell .tm-game-stage .game-message{min-height:var(--stage-h)!important}
html.tarefas-mobile-shell .tm-game-stage[data-layout="panel"],html.tarefas-mobile-shell .tm-precision-area,html.tarefas-mobile-shell .tm-reflex-pad{height:clamp(218px,58vw,272px)!important;min-height:218px!important}
html.tarefas-mobile-shell .tm-game-stage[data-layout="grid"]{min-height:0!important;height:auto!important;touch-action:pan-y!important}
html.tarefas-mobile-shell .tm-game-stage[data-game="snake"],html.tarefas-mobile-shell .tm-game-stage[data-game="snake"] canvas,html.tarefas-mobile-shell .tm-game-stage[data-game="game2048"]{touch-action:none!important}
html.tarefas-mobile-shell .tm-game-card,html.tarefas-mobile-shell .tm-leaderboard-card{width:100%!important;max-width:100%!important}
html.tarefas-mobile-shell .tm-game-title{padding:14px 13px 12px!important}
html.tarefas-mobile-shell .tm-game-title p{max-width:min(235px,62vw)!important}
html.tarefas-mobile-shell .tm-game-actions{padding:12px!important}
html.tarefas-mobile-shell .tm-game-stats div{padding:10px 4px!important}
html.tarefas-mobile-shell .tm-leaderboard-card{margin-top:14px!important;margin-bottom:22px!important;padding:14px 11px!important;scroll-margin-bottom:110px}
html.tarefas-mobile-shell .tm-memory-grid,html.tarefas-mobile-shell .tm-2048-grid{width:min(calc(100% - 12px),390px)!important}
html.tarefas-mobile-shell .tm-mine-grid{width:min(calc(100% - 6px),390px)!important}
html.tarefas-mobile-shell .tm-game-controls button,html.tarefas-mobile-shell .tm-game-actions button{user-select:none!important;-webkit-user-select:none!important;-webkit-touch-callout:none!important}
html.tarefas-mobile-shell .tm-game-controls .hold{touch-action:none!important}
html.tarefas-mobile-shell body.tm-games-body .bn-fab{width:54px!important;min-width:54px!important;height:54px!important;padding:0!important;overflow:hidden!important;white-space:nowrap!important;font-size:0!important;border-radius:50%!important;right:12px!important;bottom:calc(var(--tm-nav) + 14px + env(safe-area-inset-bottom,0px))!important}
html.tarefas-mobile-shell body.tm-games-body .bn-fab::before{content:'📝';font-size:22px!important}
@media(max-width:390px){html.tarefas-mobile-shell .tm-games-page{padding-inline:8px!important;--stage-h:clamp(210px,56vw,245px)}html.tarefas-mobile-shell .tm-games-hero h1{font-size:29px!important}html.tarefas-mobile-shell .tm-games-hero p{font-size:11px!important}html.tarefas-mobile-shell .tm-games-picker button{flex-basis:92px!important}.tm-game-live-score{min-width:74px!important}}
`;
await appendFile(path.join(dist,'games.css'),css,'utf8');

console.log('TAREFAS Android 2.0.1 build 201 BETA: Base Web 7.6.0 com correção de enquadramento e scroll dos Jogos no Android.');
