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
// 一張家具坐好幾個人：椅子編輯器設定的 seat 是第一個位子，這裡列其他位子（px，相對圖片左上；沒寫的 x、dir 跟第一個位子一樣）
const CHAIR_EXTRA_SEATS = {
  tile_restaurant_booth_seating_vertical: [{ y: 112 }, { y: 161 }, { y: 210 }],   // 餐廳長椅：一排坐 4 人
};
function chairConfig(id) {
  const cfg = ACTIVE_CHAIRS[id];
  return cfg && cfg.enabled && cfg.seat && Array.isArray(cfg.solid) ? cfg : null;
}
