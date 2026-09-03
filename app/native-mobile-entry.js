import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { FileTransfer } from '@capacitor/file-transfer';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';

const StorageAccess = registerPlugin('StorageAccess');
const CHANNEL_ID = 'tarefas-geral';
const PUSH_SESSION_KEY = 'tarefasPushSession17';
const DEVICE_ID_KEY = 'tarefasDeviceId17';
const APP_VERSION = '1.8.8';
const FILES_FOLDER = 'TAREFAS';
const DOWNLOADS_FOLDER = 'TAREFAS';
const UPDATES_FOLDER = `${FILES_FOLDER}/Atualização`;
const activeUpdateDownloads = new Map();
let pushInitialized = false;
let pushListenersInstalled = false;
let lastToken = '';
let fileBridgeInstalled = false;

function readUser(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function getClient(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
async function deviceId(){const current=await Preferences.get({key:DEVICE_ID_KEY});if(current.value)return current.value;const value=globalThis.crypto?.randomUUID?.()||`android-${Date.now()}-${Math.random().toString(16).slice(2)}`;await Preferences.set({key:DEVICE_ID_KEY,value});return value}
async function ensureLocalPermission(){if(!Capacitor.isNativePlatform())return false;let permission=await LocalNotifications.checkPermissions();if(permission.display!=='granted')permission=await LocalNotifications.requestPermissions();return permission.display==='granted'}
async function ensurePushPermission(){if(!Capacitor.isNativePlatform())return false;let permission=await PushNotifications.checkPermissions();if(permission.receive!=='granted')permission=await PushNotifications.requestPermissions();return permission.receive==='granted'}
async function ensureLegacyFilesPermission(){if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='android')return true;try{let permission=await Filesystem.checkPermissions();if(permission.publicStorage==='granted')return true;permission=await Filesystem.requestPermissions();return permission.publicStorage==='granted'}catch(_){return true}}
async function checkAllFilesAccess(){if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='android')return{granted:true,required:false};try{return await StorageAccess.checkAllFilesAccess()}catch(_){return{granted:false,required:false}}}
async function requestAllFilesAccess(){if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='android')return{opened:false,granted:true};return StorageAccess.requestAllFilesAccess()}
async function ensureFilesPermission(){await ensureLegacyFilesPermission();return checkAllFilesAccess()}

function sanitizeFilename(value,mime=''){let name=String(value||'').trim().replace(/[\\/:*?"<>|\u0000-\u001f]+/g,'_').replace(/^\.+/,'');if(!name)name=`TAREFAS-${new Date().toISOString().replace(/[:.]/g,'-')}`;if(!/\.[a-z0-9]{1,8}$/i.test(name)){const ext=({'application/pdf':'.pdf','text/csv':'.csv','application/json':'.json','text/plain':'.txt','image/jpeg':'.jpg','image/png':'.png','application/zip':'.zip','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'.xlsx','application/vnd.openxmlformats-officedocument.wordprocessingml.document':'.docx','application/vnd.android.package-archive':'.apk'})[String(mime||'').split(';')[0].toLowerCase()];if(ext)name+=ext}return name.slice(0,160)}
function filenameFromUrl(url){try{const parsed=new URL(url,location.href),leaf=decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop()||'');return sanitizeFilename(leaf||`TAREFAS-${Date.now()}`)}catch(_){return sanitizeFilename(`TAREFAS-${Date.now()}`)}}
function updateChannelFolder(channel){return String(channel||'').trim().toLowerCase()==='beta'?'Beta':'Oficial'}
function blobToBase64(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(reader.error||new Error('Falha ao ler o arquivo.'));reader.onload=()=>{const result=String(reader.result||'');resolve(result.includes(',')?result.slice(result.indexOf(',')+1):result)};reader.readAsDataURL(blob)})}

async function saveBlob(blob,filename){
 if(!(blob instanceof Blob))throw new Error('Arquivo inválido para salvar.');
 const name=sanitizeFilename(filename,blob.type),data=await blobToBase64(blob);
 if(Capacitor.isNativePlatform()&&Capacitor.getPlatform()==='android'){
   const saved=await StorageAccess.saveBase64ToDownloads({data,filename:name,mimeType:blob.type||'application/octet-stream',subfolder:DOWNLOADS_FOLDER});
   const info={ok:true,saved:true,shared:false,filename:name,path:saved.path||`Downloads/${DOWNLOADS_FOLDER}/${name}`,uri:saved.uri||'',mimeType:blob.type||'application/octet-stream'};
   window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return info;
 }
 await ensureLegacyFilesPermission();
 try{const result=await Filesystem.writeFile({path:`${FILES_FOLDER}/${name}`,data,directory:Directory.Documents,recursive:true});const info={ok:true,saved:true,shared:false,filename:name,path:`Documentos/${FILES_FOLDER}/${name}`,uri:result.uri,mimeType:blob.type||'application/octet-stream'};window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return info}
 catch(publicError){const temp=await Filesystem.writeFile({path:`exports/${name}`,data,directory:Directory.Cache,recursive:true});try{await Share.share({title:name,dialogTitle:'Salvar ou abrir arquivo',files:[temp.uri]});const info={ok:true,saved:false,shared:true,filename:name,path:null,uri:temp.uri,mimeType:blob.type||'application/octet-stream'};window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return info}catch(shareError){throw new Error(`Não foi possível salvar o arquivo: ${shareError?.message||publicError?.message||shareError}`)}}
}

async function openApkInstaller(uri){try{await FileOpener.openFile({path:uri,mimeType:'application/vnd.android.package-archive'});return{opened:true,error:null}}catch(err){console.warn('[TAREFAS UPDATE] Não foi possível abrir o instalador Android:',err);return{opened:false,error:String(err?.message||err||'Falha ao abrir instalador')}}}
async function existingUpdateInfo(targetPath,displayPath,name,channelFolder,autoInstall){try{const stat=await Filesystem.stat({directory:Directory.Documents,path:targetPath});if(Number(stat?.size||0)<=0)return null;const target=await Filesystem.getUri({directory:Directory.Documents,path:targetPath});let installer={opened:false,error:null};if(autoInstall!==false)installer=await openApkInstaller(target.uri);return{ok:true,saved:true,shared:false,reusedExisting:true,downloaded:false,filename:name,path:displayPath,uri:target.uri,mimeType:'application/vnd.android.package-archive',updateChannel:channelFolder,installerOpened:installer.opened,installerError:installer.error}}catch(_){return null}}
async function performUpdateDownload(href,name,channelFolder,options){
 const targetFolder=`${UPDATES_FOLDER}/${channelFolder}`,displayFolder=`Documentos/${UPDATES_FOLDER}/${channelFolder}`;
 await Filesystem.mkdir({directory:Directory.Documents,path:targetFolder,recursive:true}).catch(()=>{});
 const targetPath=`${targetFolder}/${name}`,displayPath=`${displayFolder}/${name}`;
 if(options?.reuseExisting!==false){const existing=await existingUpdateInfo(targetPath,displayPath,name,channelFolder,options?.autoInstall);if(existing){window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:existing}));return existing}}
 const target=await Filesystem.getUri({directory:Directory.Documents,path:targetPath});await FileTransfer.downloadFile({url:href,path:target.uri,progress:false});let installer={opened:false,error:null};if(options?.autoInstall!==false)installer=await openApkInstaller(target.uri);
 const info={ok:true,saved:true,shared:false,reusedExisting:false,downloaded:true,filename:name,path:displayPath,uri:target.uri,mimeType:'application/vnd.android.package-archive',updateChannel:channelFolder,installerOpened:installer.opened,installerError:installer.error};window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return info;
}
async function downloadDocumentToDownloads(href,name){
 const saved=await StorageAccess.downloadToDownloads({url:href,filename:name,mimeType:'application/octet-stream',subfolder:DOWNLOADS_FOLDER});
 const info={ok:true,saved:true,shared:false,reusedExisting:false,downloaded:true,filename:name,path:saved.path||`Downloads/${DOWNLOADS_FOLDER}/${name}`,uri:saved.uri||'',mimeType:'application/octet-stream'};window.dispatchEvent(new CustomEvent('tarefas:file-saved',{detail:info}));return info;
}
async function downloadUrl(url,filename,options={}){
 if(!url)throw new Error('URL de download ausente.');
 const href=String(url),name=sanitizeFilename(filename||filenameFromUrl(href)),isApk=name.toLowerCase().endsWith('.apk'),channelFolder=updateChannelFolder(options?.channel),updateKey=isApk?`${channelFolder}/${name}`:null;
 await ensureLegacyFilesPermission();
 if(Capacitor.isNativePlatform()){
   if(!isApk&&Capacitor.getPlatform()==='android')return downloadDocumentToDownloads(href,name);
   if(updateKey&&activeUpdateDownloads.has(updateKey))return activeUpdateDownloads.get(updateKey);
   const operation=(async()=>{try{return isApk?await performUpdateDownload(href,name,channelFolder,options):await saveBlob(await(await fetch(href)).blob(),name)}catch(nativeError){console.warn('[TAREFAS FILES] Download nativo falhou:',nativeError);if(isApk)throw new Error(`Não foi possível salvar a atualização em Documentos/${UPDATES_FOLDER}/${channelFolder}: ${nativeError?.message||nativeError}`);throw nativeError}})();
   if(updateKey){activeUpdateDownloads.set(updateKey,operation);operation.finally(()=>{if(activeUpdateDownloads.get(updateKey)===operation)activeUpdateDownloads.delete(updateKey)}).catch(()=>{})}return operation;
 }
 const response=await fetch(href,{credentials:'include'});if(!response.ok)throw new Error(`Download falhou (${response.status}).`);return saveBlob(await response.blob(),name);
}

async function clearOldUpdates(){
 if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='android')return{ok:false,unsupported:true,deleted:0};
 return StorageAccess.clearOldUpdates({currentVersion:APP_VERSION});
}

function installFileBridge(){
 if(fileBridgeInstalled||!Capacitor.isNativePlatform())return;fileBridgeInstalled=true;
 document.addEventListener('pointerdown',event=>{const input=event.target instanceof HTMLInputElement?event.target:null;if(input?.type==='file')ensureLegacyFilesPermission().catch(()=>{})},true);
 document.addEventListener('change',event=>{const input=event.target instanceof HTMLInputElement?event.target:null;if(input?.type==='file')window.dispatchEvent(new CustomEvent('tarefas:file-imported',{detail:{count:input.files?.length||0}}))},true);
 const originalClick=HTMLAnchorElement.prototype.click,bypass=new WeakSet();
 const handle=async anchor=>{const href=String(anchor.href||'');if(!href)throw new Error('Link de download vazio.');const result=await downloadUrl(href,anchor.download||filenameFromUrl(href));if(result.saved)window.alert(`Arquivo salvo em ${result.path}`);return result};
 const fallback=anchor=>{bypass.add(anchor);try{originalClick.call(anchor)}finally{setTimeout(()=>bypass.delete(anchor),0)}};
 HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute('download')&&this.href&&!bypass.has(this)){handle(this).catch(err=>{console.warn('[TAREFAS FILES] Download nativo falhou; usando fluxo web:',err);fallback(this)});return}return originalClick.call(this)};
 document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target.closest('a[download]'):null;if(!target||bypass.has(target))return;event.preventDefault();event.stopImmediatePropagation();handle(target).catch(err=>{console.warn('[TAREFAS FILES] Download nativo falhou; usando fluxo web:',err);fallback(target)})},true);
}

async function ensureChannel(){if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='android')return;await PushNotifications.createChannel({id:CHANNEL_ID,name:'TAREFAS',description:'Tarefas, escalas, serviços e avisos importantes',importance:5,visibility:0,vibration:true}).catch(()=>{});await LocalNotifications.createChannel({id:CHANNEL_ID,name:'TAREFAS',description:'TAREFAS, escalas, serviços e avisos importantes',importance:5,visibility:1,vibration:true}).catch(()=>{})}
async function notify({title='TAREFAS',body,id,at,extra}={}){if(!body)throw new Error('O corpo da notificação é obrigatório.');if(!await ensureLocalPermission())return false;await ensureChannel();await LocalNotifications.schedule({notifications:[{title,body,id:Number(id)||Math.max(1,Math.floor(Date.now()%2147483000)),channelId:Capacitor.getPlatform()==='android'?CHANNEL_ID:undefined,schedule:at?{at:new Date(at)}:{at:new Date(Date.now()+250)},extra:extra||{}}]});return true}
async function registerToken(token){const value=String(token||'').trim();if(!value||value===lastToken)return false;const user=readUser(),sessionToken=localStorage.getItem(PUSH_SESSION_KEY),c=getClient();if(!user?.id||!sessionToken||!c)return false;const id=await deviceId();const {data,error}=await c.rpc('v1_7_registrar_push_device',{p_session_token:sessionToken,p_fcm_token:value,p_device_id:id,p_platform:Capacitor.getPlatform(),p_app_version:APP_VERSION,p_perfil_id:user.perfil_id==null?null:Number(user.perfil_id)});if(error||data!==true){console.warn('[TAREFAS PUSH] Falha ao registrar aparelho:',error?.message||'sessão de push inválida');return false}lastToken=value;localStorage.setItem('tarefasPushReady17','1');window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:true}}));return true}
function destinationFrom(notification){const data=notification?.data||notification?.notification?.data||{},tipo=String(data.tipo||''),ref=String(data.referencia_id||'').trim();if(tipo==='app_update'||String(data.referencia_tipo||'')==='app_version')return `about.html?update=${encodeURIComponent(ref||'latest')}`;const href=String(data.destino_url||'central.html?tab=notificacoes').trim();if(/^https?:\/\//i.test(href))return'central.html?tab=notificacoes';return href.endsWith('.html')||href.includes('.html?')?href:'central.html?tab=notificacoes'}
const __TAREFAS_V221_NOTIFICATION_DISMISS__=true;
function navigateNotification(notification){const href=destinationFrom(notification);if(href)location.href=href}
function notificationMatch(delivered,opened){
 const openedData=opened?.data||opened?.extra||{};
 const deliveredData=delivered?.data||delivered?.extra||{};
 const openedRemoteId=String(opened?.id||'').trim();
 const openedDbId=String(openedData.notification_id||'').trim();
 if(openedRemoteId&&String(delivered?.id||'').trim()===openedRemoteId)return true;
 return !!openedDbId&&String(deliveredData.notification_id||'').trim()===openedDbId;
}
async function dismissPushNotification(notification){
 try{
  const delivered=await PushNotifications.getDeliveredNotifications();
  const matches=(delivered?.notifications||[]).filter(item=>notificationMatch(item,notification));
  if(matches.length)await PushNotifications.removeDeliveredNotifications({notifications:matches});
 }catch(err){console.warn('[TAREFAS NOTIF] Falha ao remover push entregue:',err)}
}
async function dismissLocalNotification(notification){
 try{
  const delivered=await LocalNotifications.getDeliveredNotifications();
  const id=Number(notification?.id||0);
  const dbId=String(notification?.extra?.notification_id||'').trim();
  const matches=(delivered?.notifications||[]).filter(item=>{
   if(id&&Number(item?.id||0)===id)return true;
   return !!dbId&&String(item?.extra?.notification_id||'').trim()===dbId;
  });
  if(matches.length)await LocalNotifications.removeDeliveredNotifications({notifications:matches});
 }catch(err){console.warn('[TAREFAS NOTIF] Falha ao remover notificação local entregue:',err)}
}
async function openPushNotification(notification){await dismissPushNotification(notification);navigateNotification(notification)}
async function openLocalNotification(notification){await dismissLocalNotification(notification);navigateNotification({data:notification?.extra||{}})}
async function installPushListeners(){if(pushListenersInstalled)return;pushListenersInstalled=true;await PushNotifications.addListener('registration',async({value})=>{await registerToken(value).catch(err=>console.warn('[TAREFAS PUSH] Registro:',err))});await PushNotifications.addListener('registrationError',error=>{console.error('[TAREFAS PUSH] Firebase registration error:',error);window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'registration_error'}}))});await PushNotifications.addListener('pushNotificationReceived',async notification=>{window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));const body=notification.body||notification.data?.mensagem||'Você recebeu uma nova notificação.';await notify({title:notification.title||'TAREFAS',body,extra:notification.data||{}}).catch(()=>{})});await PushNotifications.addListener('pushNotificationActionPerformed',action=>{openPushNotification(action.notification).catch(()=>navigateNotification(action.notification))});await LocalNotifications.addListener('localNotificationActionPerformed',action=>{openLocalNotification(action.notification).catch(()=>navigateNotification({data:action.notification?.extra||{}}))})}
async function initializeRemotePush(){if(pushInitialized||!Capacitor.isNativePlatform())return false;const user=readUser();if(!user?.id)return false;const sessionToken=localStorage.getItem(PUSH_SESSION_KEY);if(!sessionToken){localStorage.removeItem('tarefasPushReady17');window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'login_required'}}));return false}pushInitialized=true;await ensureChannel();if(!await ensurePushPermission()){pushInitialized=false;window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'permission_denied'}}));return false}await installPushListeners();await PushNotifications.register();return true}
async function unregisterCurrentDevice(){const c=getClient(),sessionToken=localStorage.getItem(PUSH_SESSION_KEY);if(!c||!sessionToken)return false;const id=await deviceId();const {data,error}=await c.rpc('v1_7_desregistrar_push_device',{p_session_token:sessionToken,p_device_id:id});if(!error&&data===true)localStorage.removeItem('tarefasPushReady17');return !error&&data===true}

window.TarefasNative=Object.freeze({
 notifications:{ensurePermission:async()=>(await ensureLocalPermission())&&(await ensurePushPermission()),notify,registerPush:initializeRemotePush,unregisterPush:unregisterCurrentDevice,isPushReady:()=>localStorage.getItem('tarefasPushReady17')==='1'},
 files:{ensurePermission:ensureFilesPermission,checkAllFilesAccess,requestAllFilesAccess,clearOldUpdates,saveBlob,downloadUrl,folder:`Downloads/${DOWNLOADS_FOLDER}`,updatesFolder:`Documentos/${UPDATES_FOLDER}`},
 isNative:Capacitor.isNativePlatform(),platform:Capacitor.getPlatform(),appVersion:APP_VERSION
});
window.addEventListener('DOMContentLoaded',()=>{installFileBridge();initializeRemotePush().catch(err=>{pushInitialized=false;console.warn('[TAREFAS PUSH] Inicialização:',err)})});
window.addEventListener('tarefas:push-session-ready',()=>{pushInitialized=false;initializeRemotePush().catch(err=>console.warn('[TAREFAS PUSH] Reinicialização:',err))});
App.addListener('appStateChange',({isActive})=>{if(isActive&&Capacitor.isNativePlatform()){pushInitialized=false;initializeRemotePush().catch(()=>{})}}).catch(()=>{});
