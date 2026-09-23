import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const nativeEntry = path.join(root, 'app', 'native-mobile-entry.js');
const configuracoes = path.join(root, 'configuracoes.html');
const notificacoes = path.join(root, 'notificacoes.js');
const build2315 = path.join(root, 'scripts', 'build-mobile-v2315.mjs');
const temporaryFiles = [nativeEntry, configuracoes, notificacoes, build2315];
const originals = new Map(await Promise.all(temporaryFiles.map(async file => [file, await readFile(file, 'utf8')])));

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`2.3.21.2: trecho ausente: ${label}`);
  return source.replace(before, after);
}

function patchNativeSource(source) {
  const saveAnchor = '\nasync function saveBlob(blob,filename){';
  const helpers = `
function mimeFromFilename(filename,fallback='application/octet-stream'){
 const name=String(filename||'').toLowerCase();
 const map=[['.pdf','application/pdf'],['.odt','application/vnd.oasis.opendocument.text'],['.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],['.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],['.csv','text/csv'],['.txt','text/plain'],['.json','application/json'],['.zip','application/zip'],['.jpg','image/jpeg'],['.jpeg','image/jpeg'],['.png','image/png']];
 for(const [ext,mime] of map)if(name.endsWith(ext))return mime;
 return fallback||'application/octet-stream';
}
async function finalizeRegularFile(info){
 if(!info?.saved)return info;
 const done={...info,confirmedOnScreen:true,openedAfterSave:false};
 try{window.alert('Download concluído.\\n'+String(done.filename||'Arquivo')+'\\nSalvo em '+String(done.path||'Downloads/TAREFAS'))}catch(_){}
 if(!done.uri)return done;
 const mime=mimeFromFilename(done.filename,done.mimeType);
 try{await FileOpener.openFile({path:done.uri,mimeType:mime});done.openedAfterSave=true;done.mimeType=mime;return done}
 catch(openError){
  console.warn('[TAREFAS FILES] Arquivo salvo, mas abertura direta falhou:',openError);
  try{await Share.share({title:done.filename||'Arquivo TAREFAS',dialogTitle:'Abrir arquivo',files:[done.uri]});done.openChooser=true;done.mimeType=mime}
  catch(shareError){done.openError=String(openError?.message||shareError?.message||openError||shareError)}
  return done;
 }
}
`;
  source = replaceRequired(source, saveAnchor, helpers + saveAnchor, 'helpers de abertura de arquivo');

  const oldDownload = `async function downloadDocumentToDownloads(href,name){
 const saved=await StorageAccess.downloadToDownloads({url:href,filename:name,mimeType:'application/octet-stream',subfolder:DOWNLOADS_FOLDER});
 const info={ok:true,saved:true,shared:false,reusedExisting:false,downloaded:true,filename:name,path:saved.path||\`Downloads/\${DOWNLOADS_FOLDER}/\${name}\`,uri:saved.uri||'',mimeType:'application/octet-stream'};window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return info;
}`;
  const newDownload = `async function downloadDocumentToDownloads(href,name){
 const mimeType=mimeFromFilename(name,'application/octet-stream');
 const saved=await StorageAccess.downloadToDownloads({url:href,filename:name,mimeType,subfolder:DOWNLOADS_FOLDER});
 if(!saved?.saved)throw new Error('O Android não confirmou o download do arquivo.');
 const info={ok:true,saved:true,shared:false,reusedExisting:false,downloaded:true,filename:name,path:saved.path||\`Downloads/\${DOWNLOADS_FOLDER}/\${name}\`,uri:saved.uri||'',mimeType};window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return finalizeRegularFile(info);
}`;
  source = replaceRequired(source, oldDownload, newDownload, 'download para Downloads/TAREFAS');

  source = replaceRequired(
    source,
    " const handle=async anchor=>{const href=String(anchor.href||'');if(!href)throw new Error('Link de download vazio.');const result=await downloadUrl(href,anchor.download||filenameFromUrl(href));if(result.saved)window.alert(`Arquivo salvo em ${result.path}`);return result};",
    " const handle=async anchor=>{const href=String(anchor.href||'');if(!href)throw new Error('Link de download vazio.');const result=await downloadUrl(href,anchor.download||filenameFromUrl(href));if(result.saved&&!result.confirmedOnScreen)window.alert(`Arquivo salvo em ${result.path}`);return result};",
    'evitar confirmação duplicada'
  );

  source = replaceRequired(
    source,
    'function navigateNotification(notification){const href=destinationFrom(notification);if(href)location.href=href}',
    "function navigateNotification(notification){let href=destinationFrom(notification);const data=notification?.data||notification?.extra||notification?.notification?.data||{};const id=String(data.notification_id||'').trim();if(href&&id&&!/^https?:\\/\\//i.test(href)){href+=`${href.includes('?')?'&':'?'}notification_id=${encodeURIComponent(id)}`}if(href)location.href=href}",
    'fallback de confirmação da notificação'
  );

  const oldOpen = `async function openPushNotification(notification){await dismissPushNotification(notification);navigateNotification(notification)}
async function openLocalNotification(notification){await dismissLocalNotification(notification);navigateNotification({data:notification?.extra||{}})}`;
  const newOpen = `async function markNotificationRead(notification){
 try{
  const payload=notification?.data||notification?.extra||notification?.notification?.data||{};
  const id=Number(payload.notification_id||0),token=String(localStorage.getItem(PUSH_SESSION_KEY)||'').trim(),c=getClient();
  if(!id||!token||!c)return false;
  const {data,error}=await c.rpc('v2_3_21_2_mark_notification_read',{p_session_token:token,p_notification_id:id});
  if(error)throw error;
  try{await window.Notificacoes26?.atualizarContadores?.()}catch(_){}
  window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));
  return data===true;
 }catch(err){console.warn('[TAREFAS NOTIF] Falha ao marcar notificação como lida:',err);return false}
}
async function openPushNotification(notification){await dismissPushNotification(notification);await markNotificationRead(notification);navigateNotification(notification)}
async function openLocalNotification(notification){await dismissLocalNotification(notification);await markNotificationRead(notification);navigateNotification({data:notification?.extra||{}})}`;
  return replaceRequired(source, oldOpen, newOpen, 'marcar notificação interna ao tocar');
}

function patchBuild2315Source(source) {
  const oldReturn = `   const info={ok:true,saved:true,canceled:false,shared:false,filename:name,path:saved.path||('Downloads/'+DOWNLOADS_FOLDER+'/'+name),uri:saved.uri||'',mimeType:blob.type||'application/octet-stream',selectedByUser:false,fixedDirectory:true};
   window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return info;`;
  const newReturn = `   const info={ok:true,saved:true,canceled:false,shared:false,filename:name,path:saved.path||('Downloads/'+DOWNLOADS_FOLDER+'/'+name),uri:saved.uri||'',mimeType:blob.type||'application/octet-stream',selectedByUser:false,fixedDirectory:true};
   window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return await finalizeRegularFile(info);`;
  return replaceRequired(source, oldReturn, newReturn, 'auto-open de blobs gerados no patch 2.3.15');
}

function patchConfiguracoesSource(source) {
  source = replaceRequired(
    source,
    "        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);",
    "        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);\n        const SETTINGS_SESSION_KEY = 'tarefasPushSession17';\n        function settingsSessionToken(){return String(localStorage.getItem(SETTINGS_SESSION_KEY)||'').trim();}\n        window.__TAREFAS_CONFIG_RPC_V259__=true;",
    'ponte RPC das configurações'
  );

  const oldCpf = `            const atual = cpfSomenteDigitos(cpfBancoOriginal);
            if (limpo === atual) return limpo;

            const { data, error } = await supabaseClient
                .from('usuarios')
                .select('id,nome_guerra')
                .eq('cpf', limpo)
                .neq('id', usuarioLogado.id)
                .limit(1);

            if (error) throw error;

            if (Array.isArray(data) && data.length) {
                throw new Error('Este CPF já está cadastrado em outra conta.');
            }

            return limpo;`;
  const newCpf = `            const atual = cpfSomenteDigitos(cpfBancoOriginal);
            if (limpo === atual) return limpo;
            // A unicidade é validada novamente no servidor pela RPC segura.
            return limpo;`;
  source = replaceRequired(source, oldCpf, newCpf, 'validação segura de CPF');

  const oldLoad = `                const { data, error } = await supabaseClient
                    .from('usuarios')
                    .select('*')
                    .eq('id', usuarioLogado.id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Usuário não encontrado no banco.');`;
  const newLoad = `                const token = settingsSessionToken();
                if (!token) throw new Error('Sessão do aplicativo ausente. Faça login novamente.');
                const { data, error } = await supabaseClient.rpc('v2_3_21_2_get_my_settings', { p_session_token: token });

                if (error) throw error;
                if (!data) throw new Error('Sessão expirada ou usuário não encontrado no banco.');`;
  source = replaceRequired(source, oldLoad, newLoad, 'carregamento do próprio usuário');

  const oldSave = `                const { error } = await supabaseClient
                    .from('usuarios')
                    .update(payload)
                    .eq('id', usuarioLogado.id);
                if (error) throw error;

                usuarioBanco = { ...usuarioBanco, ...payload };`;
  const newSave = `                const token = settingsSessionToken();
                if (!token) throw new Error('Sessão do aplicativo ausente. Faça login novamente.');
                const { data, error } = await supabaseClient.rpc('v2_3_21_2_update_my_settings', { p_session_token: token, p_changes: payload });
                if (error) throw error;

                usuarioBanco = data ? { ...usuarioBanco, ...data } : { ...usuarioBanco, ...payload };`;
  source = replaceRequired(source, oldSave, newSave, 'salvamento do perfil');

  const oldPrefs = `                const { error } = await supabaseClient
                    .from('usuarios')
                    .update({ [colunaPreferencias]: prefs })
                    .eq('id', usuarioLogado.id);
                if (error) throw error;
                usuarioBanco[colunaPreferencias] = prefs;`;
  const newPrefs = `                const token = settingsSessionToken();
                if (!token) throw new Error('Sessão do aplicativo ausente. Faça login novamente.');
                const changes = { preferencias: prefs };
                const { data, error } = await supabaseClient.rpc('v2_3_21_2_update_my_settings', { p_session_token: token, p_changes: changes });
                if (error) throw error;
                if (data) usuarioBanco = { ...usuarioBanco, ...data }; else usuarioBanco[colunaPreferencias] = prefs;`;
  source = replaceRequired(source, oldPrefs, newPrefs, 'salvamento das preferências');

  const oldAvatar = `                    const { error } = await supabaseClient
                        .from('usuarios')
                        .update({ [colunaAvatar]: dataUrl })
                        .eq('id', usuarioLogado.id);
                    if (error) throw error;
                    usuarioBanco[colunaAvatar] = dataUrl;`;
  const newAvatar = `                    const token = settingsSessionToken();
                    if (!token) throw new Error('Sessão do aplicativo ausente. Faça login novamente.');
                    const { data, error } = await supabaseClient.rpc('v2_3_21_2_update_my_settings', { p_session_token: token, p_changes: { avatar: dataUrl } });
                    if (error) throw error;
                    if (data) usuarioBanco = { ...usuarioBanco, ...data }; else usuarioBanco[colunaAvatar] = dataUrl;`;
  return replaceRequired(source, oldAvatar, newAvatar, 'salvamento do avatar');
}

function patchNotificacoesSource(source) {
  source = replaceRequired(source, 'const locks=new Map();', "const locks=new Map();\nconst SESSION_KEY='tarefasPushSession17';", 'chave de sessão das notificações');
  const realtimeAnchor = '\nfunction realtime(){';
  const ack = `
async function confirmarNotificacaoAberta(){
 try{
  const url=new URL(location.href),raw=String(url.searchParams.get('notification_id')||'').trim();
  if(!/^\\d+$/.test(raw))return false;
  const c=getClient(),token=String(localStorage.getItem(SESSION_KEY)||'').trim();
  if(!c||!token)return false;
  const {data,error}=await c.rpc('v2_3_21_2_mark_notification_read',{p_session_token:token,p_notification_id:Number(raw)});
  if(error)throw error;
  url.searchParams.delete('notification_id');
  history.replaceState(history.state,'',url.pathname+url.search+url.hash);
  window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));
  return data===true;
 }catch(error){console.warn('Notificacoes26: falha ao confirmar notificação aberta:',error?.message||error);return false}
}
window.__TAREFAS_NOTIFICATION_ACK_V259__=true;
`;
  source = replaceRequired(source, realtimeAnchor, ack + realtimeAnchor, 'fallback de leitura no destino');
  return replaceRequired(
    source,
    "async function init(){usuario=getUser();if(!usuario?.id)return;await atualizarContadores();realtime()}",
    "async function init(){usuario=getUser();if(!usuario?.id)return;await confirmarNotificacaoAberta();await atualizarContadores();realtime()}",
    'inicialização das notificações'
  );
}

try {
  await writeFile(nativeEntry, patchNativeSource(originals.get(nativeEntry)), 'utf8');
  await writeFile(configuracoes, patchConfiguracoesSource(originals.get(configuracoes)), 'utf8');
  await writeFile(notificacoes, patchNotificacoesSource(originals.get(notificacoes)), 'utf8');
  await writeFile(build2315, patchBuild2315Source(originals.get(build2315)), 'utf8');
  await import(pathToFileURL(path.resolve('scripts/build-mobile-v23211.mjs')).href + '?v=23212');
} finally {
  await Promise.all([...originals].map(([file, source]) => writeFile(file, source, 'utf8')));
}

const dist = path.join(root, 'dist');
async function patchFile(rel, transform) {
  const file = path.join(dist, rel);
  const before = await readFile(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`2.3.21.2: alteração não aplicada em ${rel}`);
  await writeFile(file, after, 'utf8');
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  const source = await readFile(file, 'utf8');
  await writeFile(file, source.replaceAll('2.3.21.1', '2.3.21.2').replaceAll('b258', 'b259'), 'utf8');
}

await patchFile('mobile-bootstrap.js', source => {
  source = source.replace('const APP_BUILD = 258;', 'const APP_BUILD = 259;');
  const biometric = '<li>Login por impressão digital ou reconhecimento facial forte, sem armazenar a senha.</li>';
  const additions = '<li>Configurações voltam a carregar e salvar os dados do próprio usuário por sessão segura.</li>\\n          <li>Ao tocar uma notificação do Android, ela também é marcada como lida dentro do aplicativo.</li>\\n          <li>PDF, ODT e outros arquivos confirmam o download e abrem automaticamente após serem salvos.</li>\\n          ' + biometric;
  return replaceRequired(source, biometric, additions, 'novidades 2.3.21.2 no About');
});
await patchFile('mobile-preload.js', source => source.replace("tarefasAppBuild = '258'", "tarefasAppBuild = '259'"));
await patchFile('mobile-updates-v181.js', source => source.replace('const APP_BUILD = 258;', 'const APP_BUILD = 259;'));
await patchFile('mobile-schema-v239.js', source => source.replace('build:258', 'build:259'));

await appendFile(
  path.join(dist, 'native-mobile.js'),
  "\n;globalThis.__TAREFAS_APP_FIXES_V259__={version:'2.3.21.2',build:259,settingsRpc:true,notificationAck:true,downloadConfirm:true,autoOpen:true};\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.21.2 build 259 ALPHA: Configurações seguras, notificações confirmadas e arquivos com confirmação + abertura automática.');
