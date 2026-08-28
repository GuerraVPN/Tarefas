import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const CHANNEL_ID = 'tarefas-geral';
const WELCOME_FLAG = 'tarefas_native_notifications_ready_v1';

async function ensureNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;

  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') {
    permission = await LocalNotifications.requestPermissions();
  }

  if (permission.display !== 'granted') return false;

  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'TAREFAS',
      description: 'Avisos de tarefas, escalas e serviços',
      importance: 5,
      visibility: 1,
      vibration: true
    }).catch(() => {});
  }

  return true;
}

async function notify({ title = 'TAREFAS', body, id, at, extra } = {}) {
  if (!body) throw new Error('O corpo da notificação é obrigatório.');
  const allowed = await ensureNotificationPermission();
  if (!allowed) return false;

  await LocalNotifications.schedule({
    notifications: [{
      title,
      body,
      id: id || Math.max(1, Math.floor(Date.now() % 2147483000)),
      channelId: Capacitor.getPlatform() === 'android' ? CHANNEL_ID : undefined,
      schedule: at ? { at: new Date(at) } : { at: new Date(Date.now() + 350) },
      extra: extra || {}
    }]
  });

  return true;
}

window.TarefasNative = Object.freeze({
  notifications: {
    ensurePermission: ensureNotificationPermission,
    notify
  },
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform()
});

async function initializeNotificationsForLoggedUser() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  } catch (_) {}
  if (!user?.id || !Capacitor.isNativePlatform()) return;

  const allowed = await ensureNotificationPermission();
  if (!allowed || localStorage.getItem(WELCOME_FLAG) === '1') return;

  localStorage.setItem(WELCOME_FLAG, '1');
  await notify({
    id: 752001,
    title: 'TAREFAS',
    body: 'Notificações ativadas. Você poderá receber avisos de tarefas, escalas e serviços.'
  }).catch(() => {});
}

window.addEventListener('DOMContentLoaded', () => {
  initializeNotificationsForLoggedUser().catch((err) => {
    console.warn('[TAREFAS] Não foi possível inicializar notificações:', err);
  });
});
