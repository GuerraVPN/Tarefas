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

  function adaptTables(root = document) {
    root.querySelectorAll('table').forEach((table) => {
      if (table.parentElement?.classList.contains('tarefas-mobile-table-scroll')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'tarefas-mobile-table-scroll';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  function markWideElements(root = document) {
    root.querySelectorAll('[style*="width"], [style*="min-width"]').forEach((el) => {
      const rect = el.getBoundingClientRect?.();
      if (rect && rect.width > window.innerWidth + 8) {
        el.style.maxWidth = '100%';
      }
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    adaptTables();
    markWideElements();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches?.('table')) adaptTables(node.parentElement || document);
          else adaptTables(node);
          markWideElements(node);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

  try {
    if (window.Capacitor?.isNativePlatform?.()) {
      document.documentElement.classList.add('is-capacitor');
    }
  } catch (_) {}
})();
