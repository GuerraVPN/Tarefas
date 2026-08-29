import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';

const CHANNEL_ID = 'tarefas-geral';
// Chaves V1.7 mantidas para atualizar sem perder o dispositivo/sessão já registrados.
const PUSH_SESSION_KEY = 'tarefasPushSession17';
const DEVICE_ID_KEY = 'tarefasDeviceId17';
const APP_VERSION = '1.8.0';
const FILES_FOLDER = 'TAREFAS';
let pushInitialized = false;
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
    // Android 11+ usa armazenamento com escopo; o seletor de documentos pode
    // funcionar sem uma permissão ampla. A gravação é tentada normalmente.
    console.warn('[TAREFAS FILES] Permissão pública não exigida/disponível:', err);
    return true;
  }
}

function sanitizeFilename(value, mime=''){
  let name = String(value || '').trim().replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').replace(/^\.+/, '');
  if (!name) name = `TAREFAS-${new Date().toISOString().replace(/[:.]/g,'-')}`;
  if (!/\.[a-z0-9]{1,8}$/i.test(name)) {
    const ext = ({
      'application/pdf':'.pdf',
      'text/csv':'.csv',
      'application/json':'.json',
      'text/plain':'.txt',
      'image/jpeg':'.jpg',
      'image/png':'.png',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'.xlsx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'.docx'
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
  } catch (_) {
    return sanitizeFilename(`TAREFAS-${Date.now()}`);
  }
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
    const result = await Filesystem.writeFile({
      path: `${FILES_FOLDER}/${name}`,
      data,
      directory: Directory.Documents,
      recursive: true
    });
    const info = {
      ok: true,
      saved: true,
      shared: false,
      filename: name,
      path: `Documentos/${FILES_FOLDER}/${name}`,
      uri: result.uri,
      mimeType: blob.type || 'application/octet-stream'
    };
    window.dispatchEvent(new CustomEvent('tarefas:file-saved', { detail: info }));
    return info;
  } catch (publicError) {
    console.warn('[TAREFAS FILES] Documents indisponível, usando seletor nativo:', publicError);
    const temp = await Filesystem.writeFile({
      path: `exports/${name}`,
      data,
      directory: Directory.Cache,
      recursive: true
    });
    try {
      await Share.share({
        title: name,
        dialogTitle: 'Salvar ou abrir arquivo',
        files: [temp.uri]
      });
      const info = {
        ok: true,
        saved: false,
        shared: true,
        filename: name,
        path: null,
        uri: temp.uri,
        mimeType: blob.type || 'application/octet-stream'
      };
      window.dispatchEvent(new CustomEvent('tarefas:file-saved', { detail: info }));
      return info;
    } catch (shareError) {
      throw new Error(`Não foi possível salvar o arquivo: ${shareError?.message || publicError?.message || shareError}`);
    }
  }
}

async function downloadUrl(url, filename){
  if (!url) throw new Error('URL de download ausente.');
  const response = await fetch(String(url), { credentials: 'include' });
  if (!response.ok) throw new Error(`Download falhou (${response.status}).`);
  const blob = await response.blob();
  return saveBlob(blob, filename || filenameFromUrl(String(url)));
}

function installFileBridge(){
  if (fileBridgeInstalled || !Capacitor.isNativePlatform()) return;
  fileBridgeInstalled = true;

  // Antes do seletor de arquivos ser aberto, prepara a permissão necessária em
  // Android antigo. Em Android novo o próprio seletor do sistema controla o acesso.
  document.addEventListener('pointerdown', (event) => {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    if (input?.type === 'file') ensureFilesPermission().catch(() => {});
  }, true);

  document.addEventListener('change', (event) => {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    if (input?.type !== 'file') return;
    window.dispatchEvent(new CustomEvent('tarefas:file-imported', {
      detail: { count: input.files?.length || 0 }
    }));
  }, true);

  const originalClick = HTMLAnchorElement.prototype.click;
  const bypass = new WeakSet();

  const handleAnchorDownload = async (anchor) => {
    const href = String(anchor.href || '');
    if (!href) throw new Error('Link de download vazio.');
    const result = await downloadUrl(href, anchor.download || filenameFromUrl(href));
    if (result.saved) window.alert(`Arquivo salvo em ${result.path}`);
    return result;
  };

  const fallback = (anchor) => {
    bypass.add(anchor);
    try { originalClick.call(anchor); }
    finally { setTimeout(() => bypass.delete(anchor), 0); }
  };

  HTMLAnchorElement.prototype.click = function(){
    if (this.hasAttribute('download') && this.href && !bypass.has(this)) {
      handleAnchorDownload(this).catch(err => {
        console.warn('[TAREFAS FILES] Download nativo falhou; usando fluxo web:', err);
        fallback(this);
      });
      return;
    }
    return originalClick.call(this);
  };

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('a[download]') : null;
    if (!target || bypass.has(target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    handleAnchorDownload(target).catch(err => {
      console.warn('[TAREFAS FILES] Download nativo falhou; usando fluxo web:', err);
      fallback(target);
    });
  }, true);
}

async function ensureChannel(){
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  await PushNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'TAREFAS',
    description: 'Tarefas, escalas, serviços e avisos importantes',
    importance: 5,
    visibility: 0,
    vibration: true
  }).catch(() => {});
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'TAREFAS',
    description: 'Tarefas, escalas, serviços e avisos importantes',
    importance: 5,
    visibility: 1,
    vibration: true
  }).catch(() => {});
}

async function notify({ title = 'TAREFAS', body, id, at, extra } = {}){
  if (!body) throw new Error('O corpo da notificação é obrigatório.');
  const allowed = await ensureLocalPermission();
  if (!allowed) return false;
  await ensureChannel();
  await LocalNotifications.schedule({
    notifications: [{
      title,
      body,
      id: Number(id) || Math.max(1, Math.floor(Date.now() % 2147483000)),
      channelId: Capacitor.getPlatform() === 'android' ? CHANNEL_ID : undefined,
      schedule: at ? { at: new Date(at) } : { at: new Date(Date.now() + 250) },
      extra: extra || {}
    }]
  });
  return true;
}

async function registerToken(token){
  const value = String(token || '').trim();
  if (!value || value === lastToken) return false;
  const user = readUser();
  const sessionToken = localStorage.getItem(PUSH_SESSION_KEY);
  const client = getClient();
  if (!user?.id || !sessionToken || !client) return false;

  const id = await deviceId();
  const { data, error } = await client.rpc('v1_7_registrar_push_device', {
    p_session_token: sessionToken,
    p_fcm_token: value,
    p_device_id: id,
    p_platform: Capacitor.getPlatform(),
    p_app_version: APP_VERSION,
    p_perfil_id: user.perfil_id == null ? null : Number(user.perfil_id)
  });
  if (error || data !== true) {
    console.warn('[TAREFAS PUSH] Falha ao registrar aparelho:', error?.message || 'sessão de push inválida');
    return false;
  }
  lastToken = value;
  localStorage.setItem('tarefasPushReady17','1');
  window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:true}}));
  return true;
}

function destinationFrom(notification){
  const data = notification?.data || notification?.notification?.data || {};
  const href = String(data.destino_url || 'central.html?tab=notificacoes');
  return href.endsWith('.html') || href.includes('.html?') ? href : 'central.html?tab=notificacoes';
}

async function initializeRemotePush(){
  if (pushInitialized || !Capacitor.isNativePlatform()) return false;
  const user = readUser();
  if (!user?.id) return false;
  const sessionToken = localStorage.getItem(PUSH_SESSION_KEY);
  if (!sessionToken) {
    localStorage.removeItem('tarefasPushReady17');
    window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'login_required'}}));
    return false;
  }

  pushInitialized = true;
  await ensureChannel();
  const allowed = await ensurePushPermission();
  if (!allowed) {
    pushInitialized = false;
    window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'permission_denied'}}));
    return false;
  }

  await PushNotifications.addListener('registration', async ({ value }) => {
    await registerToken(value).catch(err => console.warn('[TAREFAS PUSH] Registro:', err));
  });
  await PushNotifications.addListener('registrationError', error => {
    console.error('[TAREFAS PUSH] Firebase registration error:', error);
    window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'registration_error'}}));
  });
  await PushNotifications.addListener('pushNotificationReceived', async notification => {
    window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));
    const body = notification.body || notification.data?.mensagem || 'Você recebeu uma nova notificação.';
    await notify({
      title: notification.title || 'TAREFAS',
      body,
      extra: notification.data || {}
    }).catch(() => {});
  });
  await PushNotifications.addListener('pushNotificationActionPerformed', action => {
    const href = destinationFrom(action.notification);
    if (href) location.href = href;
  });

  await PushNotifications.register();
  return true;
}

async function unregisterCurrentDevice(){
  const client = getClient();
  const sessionToken = localStorage.getItem(PUSH_SESSION_KEY);
  if (!client || !sessionToken) return false;
  const id = await deviceId();
  const { data, error } = await client.rpc('v1_7_desregistrar_push_device', {
    p_session_token: sessionToken,
    p_device_id: id
  });
  if (!error && data === true) localStorage.removeItem('tarefasPushReady17');
  return !error && data === true;
}

window.TarefasNative = Object.freeze({
  notifications: {
    ensurePermission: async () => (await ensureLocalPermission()) && (await ensurePushPermission()),
    notify,
    registerPush: initializeRemotePush,
    unregisterPush: unregisterCurrentDevice,
    isPushReady: () => localStorage.getItem('tarefasPushReady17') === '1'
  },
  files: {
    ensurePermission: ensureFilesPermission,
    saveBlob,
    downloadUrl,
    folder: `Documentos/${FILES_FOLDER}`
  },
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform(),
  appVersion: APP_VERSION
});

window.addEventListener('DOMContentLoaded', () => {
  installFileBridge();
  initializeRemotePush().catch(err => {
    pushInitialized = false;
    console.warn('[TAREFAS PUSH] Inicialização:', err);
  });
});

window.addEventListener('tarefas:push-session-ready', () => {
  pushInitialized = false;
  initializeRemotePush().catch(err => console.warn('[TAREFAS PUSH] Reinicialização:', err));
});

App.addListener('appStateChange', ({ isActive }) => {
  if (isActive && Capacitor.isNativePlatform()) {
    pushInitialized = false;
    initializeRemotePush().catch(() => {});
  }
}).catch(() => {});
