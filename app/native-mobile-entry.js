import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { FileTransfer } from '@capacitor/file-transfer';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';

const CHANNEL_ID = 'tarefas-geral';
// Chaves V1.7 mantidas para atualizar sem perder o dispositivo/sessão já registrados.
const PUSH_SESSION_KEY = 'tarefasPushSession17';
const DEVICE_ID_KEY = 'tarefasDeviceId17';
const APP_VERSION = '1.8.5';
const FILES_FOLDER = 'TAREFAS';
const UPDATES_FOLDER = `${FILES_FOLDER}/Atualização`;
let pushInitialized = false;
let pushListenersInstalled = false;
let lastToken = '';
let fileBridgeInstalled = false;

function readUser(){
  try { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); }
  catch (_) { return null; }
}

function getClient(){
  try { return typeof supabaseClient !== 'undefined' ? supabaseClient : null; }
  catch (_) { return null; }
}

async function deviceId(){
  const current = await Preferences.get({ key: DEVICE_ID_KEY });
  if (current.value) return current.value;
  const value = globalThis.crypto?.randomUUID?.() || `android-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await Preferences.set({ key: DEVICE_ID_KEY, value });
  return value;
}

async function ensureLocalPermission(){
  if (!Capacitor.isNativePlatform()) return false;
  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') permission = await LocalNotifications.requestPermissions();
  return permission.display === 'granted';
}

async function ensurePushPermission(){
  if (!Capacitor.isNativePlatform()) return false;
  let permission = await PushNotifications.checkPermissions();
  if (permission.receive !== 'granted') permission = await PushNotifications.requestPermissions();
  return permission.receive === 'granted';
}

async function ensureFilesPermission(){
  if (!Capacitor.isNativePlatform()) return true;
  if (Capacitor.getPlatform() !== 'android') return true;
  try {
    let permission = await Filesystem.checkPermissions();
    if (permission.publicStorage === 'granted') return true;
    permission = await Filesystem.requestPermissions();
    return permission.publicStorage === 'granted';
  } catch (err) {
    console.warn('[TAREFAS FILES] Permissão pública não exigida/disponível:', err);
    return true;
  }
}

function sanitizeFilename(value, mime=''){
  let name = String(value || '').trim().replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').replace(/^\.+/, '');
  if (!name) name = `TAREFAS-${new Date().toISOString().replace(/[:.]/g,'-')}`;
  if (!/\.[a-z0-9]{1,8}$/i.test(name)) {
    const ext = ({
      'application/pdf':'.pdf','text/csv':'.csv','application/json':'.json','text/plain':'.txt',
      'image/jpeg':'.jpg','image/png':'.png',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'.xlsx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'.docx',
      'application/vnd.android.package-archive':'.apk'
    })[String(mime || '').split(';')[0].toLowerCase()];
    if (ext) name += ext;
  }
  return name.slice(0, 160);
}

function filenameFromUrl(url){
  try {
    const parsed = new URL(url, location.href);
    const leaf = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '');
    return sanitizeFilename(leaf || `TAREFAS-${Date.now()}`);
  } catch (_) { return sanitizeFilename(`TAREFAS-${Date.now()}`); }
}

function updateChannelFolder(channel){
  return String(channel || '').trim().toLowerCase() === 'beta' ? 'Beta' : 'Oficial';
}

function blobToBase64(blob){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('Falha ao ler o arquivo.'));
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.slice(result.indexOf(',') + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

async function saveBlob(blob, filename){
  if (!(blob instanceof Blob)) throw new Error('Arquivo inválido para salvar.');
  const name = sanitizeFilename(filename, blob.type);
  const data = await blobToBase64(blob);
  await ensureFilesPermission();
  try {
    const result = await Filesystem.writeFile({ path: `${FILES_FOLDER}/${name}`, data, directory: Directory.Documents, recursive: true });
    const info = { ok:true,saved:true,shared:false,filename:name,path:`Documentos/${FILES_FOLDER}/${name}`,uri:result.uri,mimeType:blob.type||'application/octet-stream' };
    window.dispatchEvent(new CustomEvent('tarefas:file-saved', { detail: info }));
    return info;
  } catch (publicError) {
    const temp = await Filesystem.writeFile({ path:`exports/${name}`,data,directory:Directory.Cache,recursive:true });
    try {
      await Share.share({ title:name,dialogTitle:'Salvar ou abrir arquivo',files:[temp.uri] });
      const info={ok:true,saved:false,shared:true,filename:name,path:null,uri:temp.uri,mimeType:blob.type||'application/octet-stream'};
      window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));
      return info;
    } catch (shareError) {
      throw new Error(`Não foi possível salvar o arquivo: ${shareError?.message || publicError?.message || shareError}`);
    }
  }
}

async function openApkInstaller(uri){
  try {
    await FileOpener.openFile({ path:uri, mimeType:'application/vnd.android.package-archive' });
    return { opened:true, error:null };
  } catch (err) {
    console.warn('[TAREFAS UPDATE] Não foi possível abrir o instalador Android:', err);
    return { opened:false, error:String(err?.message || err || 'Falha ao abrir instalador') };
  }
}

async function downloadUrl(url, filename, options={}){
  if (!url) throw new Error('URL de download ausente.');
  const href=String(url),name=sanitizeFilename(filename || filenameFromUrl(href));
  const isApk=name.toLowerCase().endsWith('.apk');
  const channelFolder=updateChannelFolder(options?.channel);
  const targetFolder=isApk?`${UPDATES_FOLDER}/${channelFolder}`:FILES_FOLDER;
  const displayFolder=isApk?`Documentos/${UPDATES_FOLDER}/${channelFolder}`:`Documentos/${FILES_FOLDER}`;
  await ensureFilesPermission();
  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.mkdir({directory:Directory.Documents,path:targetFolder,recursive:true}).catch(()=>{});
      const target=await Filesystem.getUri({directory:Directory.Documents,path:`${targetFolder}/${name}`});
      await FileTransfer.downloadFile({url:href,path:target.uri,progress:false});
      let installer={opened:false,error:null};
      if(isApk && options?.autoInstall!==false) installer=await openApkInstaller(target.uri);
      const info={
        ok:true,saved:true,shared:false,filename:name,path:`${displayFolder}/${name}`,uri:target.uri,
        mimeType:isApk?'application/vnd.android.package-archive':'application/octet-stream',
        updateChannel:isApk?channelFolder:null,installerOpened:installer.opened,installerError:installer.error
      };
      window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));
      return info;
    } catch (nativeError) {
      console.warn('[TAREFAS FILES] FileTransfer em Documents falhou:',nativeError);
      if(isApk){
        throw new Error(`Não foi possível salvar a atualização em ${displayFolder}: ${nativeError?.message || nativeError}`);
      }
      try {
        const temp=await Filesystem.getUri({directory:Directory.Cache,path:`updates/${name}`});
        await FileTransfer.downloadFile({url:href,path:temp.uri,progress:false});
        await Share.share({title:name,dialogTitle:'Salvar ou abrir arquivo',files:[temp.uri]});
        const info={ok:true,saved:false,shared:true,filename:name,path:null,uri:temp.uri,mimeType:'application/octet-stream'};
        window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));
        return info;
      } catch (fallbackError) {
        throw new Error(`Download nativo falhou: ${fallbackError?.message || nativeError?.message || fallbackError}`);
      }
    }
  }
  const response=await fetch(href,{credentials:'include'});
  if(!response.ok)throw new Error(`Download falhou (${response.status}).`);
  return saveBlob(await response.blob(),name);
}

function installFileBridge(){
  if (fileBridgeInstalled || !Capacitor.isNativePlatform()) return;
  fileBridgeInstalled = true;
  document.addEventListener('pointerdown', event => { const input=event.target instanceof HTMLInputElement?event.target:null;if(input?.type==='file')ensureFilesPermission().catch(()=>{}); }, true);
  document.addEventListener('change', event => { const input=event.target instanceof HTMLInputElement?event.target:null;if(input?.type==='file')window.dispatchEvent(new CustomEvent('tarefas:file-imported',{detail:{count:input.files?.length||0}})); }, true);
  const originalClick=HTMLAnchorElement.prototype.click,bypass=new WeakSet();
  const handle=async anchor=>{const href=String(anchor.href||'');if(!href)throw new Error('Link de download vazio.');const result=await downloadUrl(href,anchor.download||filenameFromUrl(href));if(result.saved)window.alert(`Arquivo salvo em ${result.path}`);return result};
  const fallback=anchor=>{bypass.add(anchor);try{originalClick.call(anchor)}finally{setTimeout(()=>bypass.delete(anchor),0)}};
  HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute('download')&&this.href&&!bypass.has(this)){handle(this).catch(err=>{console.warn('[TAREFAS FILES] Download nativo falhou; usando fluxo web:',err);fallback(this)});return}return originalClick.call(this)};
  document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target.closest('a[download]'):null;if(!target||bypass.has(target))return;event.preventDefault();event.stopImmediatePropagation();handle(target).catch(err=>{console.warn('[TAREFAS FILES] Download nativo falhou; usando fluxo web:',err);fallback(target)})},true);
}

async function ensureChannel(){
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  await PushNotifications.createChannel({id:CHANNEL_ID,name:'TAREFAS',description:'Tarefas, escalas, serviços e avisos importantes',importance:5,visibility:0,vibration:true}).catch(()=>{});
  await LocalNotifications.createChannel({id:CHANNEL_ID,name:'TAREFAS',description:'Tarefas, escalas, serviços e avisos importantes',importance:5,visibility:1,vibration:true}).catch(()=>{});
}

async function notify({ title='TAREFAS', body, id, at, extra }={}){
  if(!body)throw new Error('O corpo da notificação é obrigatório.');
  if(!await ensureLocalPermission())return false;
  await ensureChannel();
  await LocalNotifications.schedule({notifications:[{title,body,id:Number(id)||Math.max(1,Math.floor(Date.now()%2147483000)),channelId:Capacitor.getPlatform()==='android'?CHANNEL_ID:undefined,schedule:at?{at:new Date(at)}:{at:new Date(Date.now()+250)},extra:extra||{}}]});
  return true;
}

async function registerToken(token){
  const value=String(token||'').trim();if(!value||value===lastToken)return false;
  const user=readUser(),sessionToken=localStorage.getItem(PUSH_SESSION_KEY),c=getClient();if(!user?.id||!sessionToken||!c)return false;
  const id=await deviceId();
  const {data,error}=await c.rpc('v1_7_registrar_push_device',{p_session_token:sessionToken,p_fcm_token:value,p_device_id:id,p_platform:Capacitor.getPlatform(),p_app_version:APP_VERSION,p_perfil_id:user.perfil_id==null?null:Number(user.perfil_id)});
  if(error||data!==true){console.warn('[TAREFAS PUSH] Falha ao registrar aparelho:',error?.message||'sessão de push inválida');return false}
  lastToken=value;localStorage.setItem('tarefasPushReady17','1');window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:true}}));return true;
}

function destinationFrom(notification){
  const data=notification?.data||notification?.notification?.data||{};
  const tipo=String(data.tipo||'');
  const ref=String(data.referencia_id||'').trim();
  if(tipo==='app_update'||String(data.referencia_tipo||'')==='app_version')return `about.html?update=${encodeURIComponent(ref||'latest')}`;
  const href=String(data.destino_url||'central.html?tab=notificacoes').trim();
  if(/^https?:\/\//i.test(href))return 'central.html?tab=notificacoes';
  return href.endsWith('.html')||href.includes('.html?')?href:'central.html?tab=notificacoes';
}

function navigateNotification(notification){const href=destinationFrom(notification);if(href)location.href=href}

async function installPushListeners(){
  if(pushListenersInstalled)return;pushListenersInstalled=true;
  await PushNotifications.addListener('registration',async({value})=>{await registerToken(value).catch(err=>console.warn('[TAREFAS PUSH] Registro:',err))});
  await PushNotifications.addListener('registrationError',error=>{console.error('[TAREFAS PUSH] Firebase registration error:',error);window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'registration_error'}}))});
  await PushNotifications.addListener('pushNotificationReceived',async notification=>{window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));const body=notification.body||notification.data?.mensagem||'Você recebeu uma nova notificação.';await notify({title:notification.title||'TAREFAS',body,extra:notification.data||{}}).catch(()=>{})});
  await PushNotifications.addListener('pushNotificationActionPerformed',action=>navigateNotification(action.notification));
  await LocalNotifications.addListener('localNotificationActionPerformed',action=>navigateNotification({data:action.notification?.extra||{}}));
}

async function initializeRemotePush(){
  if(pushInitialized||!Capacitor.isNativePlatform())return false;
  const user=readUser();if(!user?.id)return false;
  const sessionToken=localStorage.getItem(PUSH_SESSION_KEY);if(!sessionToken){localStorage.removeItem('tarefasPushReady17');window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'login_required'}}));return false}
  pushInitialized=true;await ensureChannel();
  if(!await ensurePushPermission()){pushInitialized=false;window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'permission_denied'}}));return false}
  await installPushListeners();await PushNotifications.register();return true;
}

async function unregisterCurrentDevice(){
  const c=getClient(),sessionToken=localStorage.getItem(PUSH_SESSION_KEY);if(!c||!sessionToken)return false;
  const id=await deviceId();const {data,error}=await c.rpc('v1_7_desregistrar_push_device',{p_session_token:sessionToken,p_device_id:id});if(!error&&data===true)localStorage.removeItem('tarefasPushReady17');return !error&&data===true;
}

window.TarefasNative=Object.freeze({notifications:{ensurePermission:async()=>(await ensureLocalPermission())&&(await ensurePushPermission()),notify,registerPush:initializeRemotePush,unregisterPush:unregisterCurrentDevice,isPushReady:()=>localStorage.getItem('tarefasPushReady17')==='1'},files:{ensurePermission:ensureFilesPermission,saveBlob,downloadUrl,folder:`Documentos/${FILES_FOLDER}`,updatesFolder:`Documentos/${UPDATES_FOLDER}`},isNative:Capacitor.isNativePlatform(),platform:Capacitor.getPlatform(),appVersion:APP_VERSION});

window.addEventListener('DOMContentLoaded',()=>{installFileBridge();initializeRemotePush().catch(err=>{pushInitialized=false;console.warn('[TAREFAS PUSH] Inicialização:',err)})});
window.addEventListener('tarefas:push-session-ready',()=>{pushInitialized=false;initializeRemotePush().catch(err=>console.warn('[TAREFAS PUSH] Reinicialização:',err))});
App.addListener('appStateChange',({isActive})=>{if(isActive&&Capacitor.isNativePlatform()){pushInitialized=false;initializeRemotePush().catch(()=>{})}}).catch(()=>{});
