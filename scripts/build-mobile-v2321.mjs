import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

// 2.3.21 / build 257: preserva todas as correções da 2.3.20.4 e adiciona
// o canal alpha opcional, exclusivamente para administradores e moderadores.
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23204.mjs')).href + '?v=2321');

const dist = path.join(root, 'dist');
async function patchFile(rel, transform) {
  const file = path.join(dist, rel);
  const before = await readFile(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`2.3.21: alteração não aplicada em ${rel}`);
  await writeFile(file, after, 'utf8');
}
function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`2.3.21: trecho ausente: ${label}`);
  return source.replace(before, after);
}
function replacePattern(source, pattern, after, label) {
  if (!pattern.test(source)) throw new Error(`2.3.21: padrão ausente: ${label}`);
  return source.replace(pattern, after);
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  const source = await readFile(file, 'utf8');
  await writeFile(file, source.replaceAll('2.3.20.4', '2.3.21').replaceAll('b256', 'b257'), 'utf8');
}

await patchFile('mobile-bootstrap.js', source => source.replace('const APP_BUILD = 256;', 'const APP_BUILD = 257;'));
await patchFile('mobile-preload.js', source => source.replace("tarefasAppBuild = '256'", "tarefasAppBuild = '257'"));
await patchFile('mobile-schema-v239.js', source => source.replace('build:256', 'build:257'));

await patchFile('mobile-updates-v181.js', source => {
  source = source.replace('const APP_BUILD = 256;', 'const APP_BUILD = 257;');

  const newState = "  async function loadState(){const token=sessionToken();const [beta,alphaRows,latestRows,history]=await Promise.all([rpc('v1_8_get_beta_updates',{p_session_token:token}).catch(()=>false),rpc('v2_3_21_alpha_context',{p_session_token:token}).catch(()=>null),rpc('v1_8_latest_app_version',{p_session_token:token}),rpc('v1_8_app_version_history',{p_session_token:token})]);const alpha=Array.isArray(alphaRows)?alphaRows[0]||{}:alphaRows||{};let storage={granted:false,required:false};try{storage=await window.TarefasNative?.files?.checkAllFilesAccess?.()||storage}catch(_){}return{beta:beta===true,alphaEligible:alpha.eligible===true,alpha:alpha.receive_alpha===true,latest:Array.isArray(latestRows)?latestRows[0]||null:latestRows||null,history:Array.isArray(history)?history:[],storage}}";
  source = replacePattern(source, /  async function loadState\(\)\{[^\n]*\}(?=\n  async function saveBeta)/, newState, 'estado do atualizador');

  const betaSaveMatch = /  async function saveBeta\(enabled\)\{[^\n]*\}/;
  const betaSave = source.match(betaSaveMatch)?.[0];
  if (!betaSave) throw new Error('2.3.21: padrão ausente: gravação beta');
  const alphaSave = betaSave + "\n  async function saveAlpha(enabled){const token=sessionToken();if(!token)throw new Error('Faça login novamente para alterar o canal de atualizações.');const ok=await rpc('v2_3_21_set_alpha_updates',{p_session_token:token,p_receive_alpha:!!enabled});if(ok!==true)throw new Error('Somente administradores e moderadores podem receber versões alpha.');return true}";
  source = replacePattern(source, betaSaveMatch, alphaSave, 'gravação da preferência alpha');

  const newHistory = "  function channelLabel(value){return value==='alpha'?'ALPHA':value==='beta'?'BETA':'OFICIAL'}\n  function channelClass(value){return value==='alpha'?'alpha':value==='beta'?'beta':''}\n  function renderHistory(rows){if(!rows.length)return'<div class=\"tm-update-empty\">Nenhuma versão publicada neste canal.</div>';return rows.map(v=>{const channel=channelLabel(v.channel),current=Number(v.build)===APP_BUILD?'<span class=\"tm-update-current\">INSTALADA</span>':'';return`<article class=\"tm-update-history-item\"><div class=\"tm-update-history-head\"><div><strong>${esc(v.version_name)}</strong><small>Build ${esc(v.build)} • ${esc(v.web_version||'')}</small></div><div><span class=\"tm-update-channel ${channelClass(v.channel)}\">${channel}</span>${current}</div></div><h4>${esc(v.title||'Atualização')}</h4><ul>${listItems(v.changelog)}</ul></article>`}).join('')}";
  source = replacePattern(source, /  function renderHistory\(rows\)\{[^\n]*\}/, newHistory, 'rótulos alpha no histórico');

  source = replacePattern(
    source,
    /    const latest=state\.latest,[^\n]+;/,
    "    const latest=state.latest,newer=latest&&Number(latest.build)>APP_BUILD,latestBadge=channelLabel(latest?.channel);",
    'rótulo da versão mais recente'
  );
  source = replaceRequired(
    source,
    "<span class=\"tm-update-channel ${latest.channel==='beta'?'beta':''}\">${latestBadge}</span>",
    "<span class=\"tm-update-channel ${channelClass(latest.channel)}\">${latestBadge}</span>",
    'cor da versão mais recente'
  );

  const storageStart = "      <section class=\"tm-update-card tm-update-storage\">";
  const alphaCard = "      ${state.alphaEligible?`<section class=\"tm-update-card tm-update-alpha\">\n        <div class=\"tm-update-setting\"><div><strong>Receber versões alpha</strong><small>Opção exclusiva para administradores e moderadores. Ao ativar, a próxima alpha aparece como atualização e também gera aviso.</small></div><label class=\"tm-switch\"><input id=\"tmAlphaUpdates\" type=\"checkbox\" ${state.alpha?'checked':''}><span></span></label></div>\n        <div class=\"tm-update-note\">${state.alpha?'Canal alpha ativado. Você receberá alphas além do seu canal atual.':'Canal alpha desativado. Ative quando quiser testar a próxima versão antecipadamente.'}</div>\n      </section>`:''}\n" + storageStart;
  source = replaceRequired(source, storageStart, alphaCard, 'cartão Receber versões alpha');
  source = source.replace('Alpha ou Oficial.', 'Alpha, Beta ou Oficial.').replace('Beta ou Oficial.', 'Alpha, Beta ou Oficial.');

  const betaListenerMatch = /    document\.getElementById\('tmBetaUpdates'\)\?\.addEventListener\('change',[^\n]+/;
  const betaListener = source.match(betaListenerMatch)?.[0];
  if (!betaListener) throw new Error('2.3.21: padrão ausente: evento beta');
  const alphaListener = betaListener + "\n    document.getElementById('tmAlphaUpdates')?.addEventListener('change',async event=>{const input=event.currentTarget;input.disabled=true;try{await saveAlpha(input.checked);await refresh(root)}catch(err){input.checked=!input.checked;alert(err?.message||err)}finally{input.disabled=false}});";
  source = replacePattern(source, betaListenerMatch, alphaListener, 'evento do botão alpha');

  return source + "\n;globalThis.__TAREFAS_ALPHA_UPDATES_V257__={version:'2.3.21',build:257,serverAuthorized:true,roles:['admin','moderator']};\n";
});

await patchFile('native-mobile.js', source => replacePattern(
  source,
  /function updateChannelFolder\(channel\)\{[^\n]*\}/,
  "function updateChannelFolder(channel){const value=String(channel||'').trim().toLowerCase();return value==='alpha'?'Alpha':value==='beta'?'Beta':'Oficial'}",
  'pasta de download Alpha'
));

await appendFile(
  path.join(dist, 'mobile-v181.css'),
  "\n/* Android 2.3.21 — canal alpha */\n.tm-update-channel.alpha{background:#39205a;color:#e1b8ff;border:1px solid rgba(190,125,255,.28)}\n.tm-update-alpha{border-color:rgba(165,91,255,.34);box-shadow:0 12px 30px rgba(52,20,91,.2)}\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.21 build 257 BETA: opção de alphas para admins e moderadores, validada no servidor.');
