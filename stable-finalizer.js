(function () {
  function applyVisualPreview() {
    const api = window.DIVI_MANAGER_APP;
    if (!api || typeof api.getState !== 'function') return;
    const state = api.getState();
    if (!state || !state.result || !state.originalHtml) return;
    if (!state.result.layout || state.result.layout.mode !== 'visual') return;

    state.result.previewHtml = state.originalHtml;
    const createdPreview = document.getElementById('created-preview');
    if (createdPreview) createdPreview.srcdoc = state.originalHtml;
  }

  document.addEventListener('click', function (event) {
    if (!event.target || !event.target.closest('#convert-btn')) return;
    setTimeout(applyVisualPreview, 0);
    setTimeout(applyVisualPreview, 150);
    setTimeout(applyVisualPreview, 600);
  }, true);

  window.DIVI_MANAGER_FINALIZER = {
    applyVisualPreview: applyVisualPreview
  };
})();
