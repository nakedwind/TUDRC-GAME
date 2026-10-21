const ELEVATOR_STORAGE_KEY = 'tudrc_elevators_v1';
function elevatorCatalog(useBrowserDraft = false) {
  if (useBrowserDraft) {
    try {
      const saved = (typeof DraftSync !== 'undefined' ? DraftSync.load(ELEVATOR_STORAGE_KEY, ELEVATORS_DEFAULT, { label: '電梯' }) : JSON.parse(localStorage.getItem(ELEVATOR_STORAGE_KEY) || 'null'));   // 編輯器裡：暫存和專案檔三方合併（js/draft-sync.js）
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) return saved;
    } catch (_) {}
  }
  return ELEVATORS_DEFAULT;
}
const ACTIVE_ELEVATORS = elevatorCatalog(/[?&](preview|previewElevators)=1(&|$)/.test(location.search));
function elevatorConfig(id) { return ACTIVE_ELEVATORS[id] || null; }
