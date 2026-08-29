(() => {
  'use strict';

  const STYLE_ID = 'tm-mobile-notes-v191-style';

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .bn-fab {
        right: 16px !important;
        bottom: calc(88px + env(safe-area-inset-bottom, 0px)) !important;
        z-index: 10020 !important;
        min-height: 46px;
        padding: 12px 16px !important;
        border-radius: 18px !important;
      }
      .bn-panel {
        left: 8px !important;
        right: 8px !important;
        top: calc(62px + env(safe-area-inset-top, 0px)) !important;
        bottom: calc(82px + env(safe-area-inset-bottom, 0px)) !important;
        width: auto !important;
        max-width: none !important;
        border-radius: 18px !important;
        z-index: 10030 !important;
        box-shadow: 0 20px 55px rgba(0,0,0,.28) !important;
      }
      .bn-head {
        position: sticky;
        top: 0;
        z-index: 2;
        padding: 12px !important;
        background: var(--v4-surface, #fff) !important;
      }
      .bn-head-row { gap: 8px; }
      .bn-head h3 { font-size: 17px !important; line-height: 1.2; }
      .bn-new, .bn-close { min-height: 40px; touch-action: manipulation; }
      .bn-list { padding: 9px !important; overscroll-behavior: contain; }
      .bn-note { padding: 10px !important; border-radius: 14px !important; }
      .bn-note-head { align-items: center; }
      .bn-title { min-width: 0; min-height: 38px; font-size: 15px !important; }
      .bn-note-actions button { min-width: 36px; min-height: 36px; font-size: 16px; }
      .bn-tools { gap: 6px !important; padding: 8px 0 !important; }
      .bn-tools button, .bn-tools label {
        min-height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 11px !important;
      }
      .bn-editor {
        min-height: 180px !important;
        max-height: 42vh !important;
        font-size: 14px !important;
        padding: 11px !important;
        -webkit-user-select: text;
        user-select: text;
      }
      .bn-save { min-height: 38px; padding: 8px 12px !important; }
      @media (max-width: 390px) {
        .bn-panel { left: 5px !important; right: 5px !important; }
        .bn-note-actions { gap: 2px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function enhancePanel() {
    installStyle();
    const fab = document.querySelector('.bn-fab');
    const panel = document.querySelector('.bn-panel');
    if (fab) {
      fab.setAttribute('aria-label', 'Abrir bloco de notas');
      fab.title = 'Bloco de Notas';
    }
    if (panel) {
      panel.setAttribute('aria-label', 'Bloco de Notas');
      panel.setAttribute('role', 'dialog');
    }
  }

  function start() {
    enhancePanel();
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      enhancePanel();
      if (document.querySelector('.bn-panel') || tries >= 20) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
