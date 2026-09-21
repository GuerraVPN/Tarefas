import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'dist'),errors=[];
const required=['index.html','dashboard.html','about.html','games.html','games.css','games.js','mobile-bootstrap.js','mobile-preload.js','mobile-v12.js','mobile-updates-v181.js','native-mobile.js','mobile-v196.js','v7_5_1_version.js','v7_6_0_patch.js'];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
async function text(rel){return readFile(path.join(root,rel),'utf8')}
for(const rel of required)if(!await exists(rel))errors.push(`arquivo ausente: ${rel}`);
const checks={
 'mobile-bootstrap.js':["const APP_VERSION = '2.1.0'",'const APP_BUILD = 210',"const WEB_VERSION = '7.6.0'",'Jogos'],
 'mobile-preload.js':["tarefasAppVersion = '2.1.0'","tarefasAppBuild = '210'"],
 'mobile-v12.js':['2.1.0 • WEB 7.6.0'],
 'mobile-updates-v181.js':['2.1.0','APP_BUILD = 210',"APP_CHANNEL = 'official'",'Baixar e instalar atualização'],
 'native-mobile.js':['2.1.0','tarefas:update-download-progress'],
 'games.html':['games.css?v=2.1.0','games.js?v=2.1.0','leaderboardList','26º PEL PE MEC'],
 'games.js':['APP 2.1.0','WEB 7.6.0','stage.dataset.game=key',"on(v.c,'click',()=>jump())","on(v.c,'click',()=>flap())",'v1_9_8_games_leaderboard','v1_9_8_start_game_run','v1_9_8_submit_game_score','AudioDirector','setPointerCapture'],
 'games.css':['Android 2.1.0 oficial','overflow-y:auto!important','touch-action:pan-y!important','data-game="snake"','data-game="game2048"','.bn-fab::before','--stage-h:clamp(218px,58vw,272px)'],
 'mobile-v196.js':['Alterar tarefa','v1_9_6_send_message'],
 'v7_5_1_version.js':["VERSION='7.6.0'",'v7_6_0_patch.js'],
 'v7_6_0_patch.js':['🎮 Jogos']
};
for(const [rel,markers] of Object.entries(checks))if(await exists(rel)){const s=await text(rel);for(const marker of markers)if(!s.includes(marker))errors.push(`${rel}: ${marker}`)}
if(await exists('games.html')&&await exists('dashboard.html')){const g=await text('games.html'),d=await text('dashboard.html'),re=/SUPABASE_ANON_KEY\s*=\s*['\"]([^'\"]+)['\"]/;const kg=g.match(re)?.[1],kd=d.match(re)?.[1];if(!kg||!kd||kg!==kd)errors.push('chave Supabase dos Jogos divergente do app')}
if(await exists('games.js')){const s=await text('games.js');for(const game of ['dino','snake','memory','game2048','minesweeper','precision','reflex','flight','hillclimb'])if(!s.includes(game))errors.push(`jogo ausente: ${game}`)}
let total=0;for(const rel of await readdir(root)){try{const st=await stat(path.join(root,rel));if(st.isFile())total+=st.size}catch{}}
if(total<100000)errors.push('bundle pequeno demais');
console.log(`VERIFY 2.1.0 build 210 OFICIAL / WEB 7.6.0: ${root}`);console.log(`Tamanho raiz: ${total} bytes`);if(errors.length){for(const e of errors)console.error('ERRO:',e);process.exit(1)}console.log('OK: 2.1.0 oficial validada com a correção de layout/scroll da 2.0.1 e Base Web 7.6.0.');
