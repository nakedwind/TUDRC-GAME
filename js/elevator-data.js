const ELEVATOR_STORAGE_KEY = 'tudrc_elevators_v1';
function elevatorCatalog(useBrowserDraft = false) {
  if (useBrowserDraft) {
    try {
      const saved = JSON.parse(localStorage.getItem(ELEVATOR_STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) return saved;
    } catch (_) {}
  }
  return ELEVATORS_DEFAULT;
}
const ACTIVE_ELEVATORS = elevatorCatalog(/[?&](preview|previewElevators)=1(&|$)/.test(location.search));
function elevatorConfig(id) { return ACTIVE_ELEVATORS[id] || null; }
