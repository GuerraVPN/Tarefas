import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';

const CHANNEL_ID = 'tarefas-geral';
const PUSH_SESSION_KEY = 'tarefasPushSession17';
const DEVICE_ID_KEY = 'tarefasDeviceId17';
const APP_VERSION = '1.7';
let pushInitialized = false;
let lastToken = '';

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
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform(),
  appVersion: APP_VERSION
});

window.addEventListener('DOMContentLoaded', () => {
  initializeRemotePush().catch(err => {
    pushInitialized = false;
    console.warn('[TAREFAS PUSH] Inicialização:', err);
  });
});

App.addListener('appStateChange', ({ isActive }) => {
  if (isActive && Capacitor.isNativePlatform()) {
    pushInitialized = false;
    initializeRemotePush().catch(() => {});
  }
}).catch(() => {});
