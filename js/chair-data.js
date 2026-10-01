const CHAIR_STORAGE_KEY = 'tudrc_chairs_v1';
function chairCatalog(useBrowserDraft = false) {
  if (useBrowserDraft) {
    try {
      const saved = JSON.parse(localStorage.getItem(CHAIR_STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) return saved;
    } catch (_) {}
  }
  return CHAIRS_DEFAULT;
}
const ACTIVE_CHAIRS = chairCatalog(/[?&](preview|previewChairs)=1(&|$)/.test(location.search));
function chairConfig(id) {
  const cfg = ACTIVE_CHAIRS[id];
  return cfg && cfg.enabled && cfg.seat && Array.isArray(cfg.solid) ? cfg : null;
}
