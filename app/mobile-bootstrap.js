(() => {
  document.documentElement.classList.add('tarefas-mobile-shell');

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch((err) => {
        console.warn('[TAREFAS] Service Worker não registrado:', err);
      });
    });
  }

  window.addEventListener('online', () => document.documentElement.classList.remove('is-offline'));
  window.addEventListener('offline', () => document.documentElement.classList.add('is-offline'));
  if (!navigator.onLine) document.documentElement.classList.add('is-offline');

  // Marcador usado para pequenas adaptações visuais no shell Android/PWA.
  try {
    if (window.Capacitor?.isNativePlatform?.()) {
      document.documentElement.classList.add('is-capacitor');
    }
  } catch (_) {}
})();
