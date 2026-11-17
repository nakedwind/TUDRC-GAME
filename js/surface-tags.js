/* ===== 素材的「牆／地板」標記（🧱 牆地板編輯器 設定）=====
   每張素材可以標成：
     ・wall  ＝ 🧱 牆：牆、柱子這類會立起來的東西
     ・floor ＝ 🟫 地板：可以站上去的地面
     ・none  ＝ ⚪ 不是牆：門、閘門、欄杆、手扶梯…（不會被當成平台邊緣的牆；算不算地板照圖層）
     ・沒標  ＝ 照原本的規則（看它放在哪個圖層）
   用到這個標記的地方（不再看素材的名字猜）：
     ・平台邊緣的牆面不能當 2 樓地面（js/map-levels.js 的 wallFaceCells）：只有標成「牆」的素材才算
       → 遊戲擋 2 樓的人、地板圖挖掉牆面（js/maploader.js）、地圖編輯器的紅色斜線和樓層檢查都跟著這份
     ・2 樓地面自動從圖層算（js/map-levels.js 的 autoDeckCells）：標「地板」＝算、標「牆」＝不算；沒標或「不是牆」照圖層
   資料：data/surface-tags.js 的 SURFACE_TAGS＝{ 素材 id: 'wall' | 'floor' | 'none' }
   編輯器裡還沒存到專案的修改，先存在這個瀏覽器（SURFACE_TAG_DRAFT，只記改過的素材，null＝拿掉標記），
   遊戲和地圖編輯器重新整理就會疊上去，方便邊改邊試；別人更新了專案檔，你沒改過的素材照樣跟著新的。 */
const SURFACE_TAG_DRAFT = 'tudrc_surface_tags_draft_v1';
const SURFACE_TAG_KINDS = {
  wall: { label: '🧱 牆', short: '牆', color: '#ff7a5c' },
  floor: { label: '🟫 地板', short: '地板', color: '#6fd08c' },
  none: { label: '⚪ 不是牆', short: '不是牆', color: '#9aa4b2' },
};
let surfaceTagCache = { raw: undefined, data: {} };
function surfaceTagData() {
  let raw = null; try { raw = localStorage.getItem(SURFACE_TAG_DRAFT); } catch (_) {}
  if (raw === surfaceTagCache.raw) return surfaceTagCache.data;
  const data = { ...(typeof SURFACE_TAGS !== 'undefined' ? SURFACE_TAGS : {}) };
  let draft = null; try { draft = raw ? JSON.parse(raw) : null; } catch (_) {}
  if (draft && typeof draft === 'object') for (const [id, v] of Object.entries(draft)) { if (SURFACE_TAG_KINDS[v]) data[id] = v; else delete data[id]; }
  surfaceTagCache = { raw, data };
  return data;
}
// 這張素材標成什麼：'wall'、'floor'、'none'，沒標＝null
function surfaceTagOf(id) { const v = surfaceTagData()[id]; return SURFACE_TAG_KINDS[v] ? v : null; }

// 只給編輯器的「🔮 依名字預填」按鈕用：照名字猜一個標記（遊戲和判斷都不用這個）
function surfaceTagGuess(t) {
  const name = String(t && t.id || '') + ' ' + String(t && t.name || '') + ' ' + String(t && t.file || '');
  if (/gate|door|閘門|門|railing|欄|escalator|手扶梯/i.test(name)) return 'none';
  if (/wall|牆|pillar|柱/i.test(name)) return 'wall';
  if (/floor|地板|地面|ground|tile_floor|磁磚/i.test(name)) return 'floor';
  return null;
}

// ---- 牆頂幾列（只對標成「牆」的素材有用）----
// 平台邊緣的牆：圖最上面幾列是牆頂（2 樓的人可以走），下面是牆面（走不進去）。每張牆的圖牆頂高度不一樣，所以每張素材自己設。
// 資料：data/surface-tags.js 的 SURFACE_WALL_TOP＝{ 素材 id: 列數 }，沒列＝SURFACE_WALL_TOP_DEFAULT（1 列）
// 編輯器還沒存到專案的修改一樣先存在這個瀏覽器（SURFACE_WALL_TOP_DRAFT，null＝回到預設）
const SURFACE_WALL_TOP_DRAFT = 'tudrc_surface_walltop_draft_v1';
const SURFACE_WALL_TOP_DEFAULT = 1;
let surfaceWallTopCache = { raw: undefined, data: {} };
function surfaceWallTopData() {
  let raw = null; try { raw = localStorage.getItem(SURFACE_WALL_TOP_DRAFT); } catch (_) {}
  if (raw === surfaceWallTopCache.raw) return surfaceWallTopCache.data;
  const data = { ...(typeof SURFACE_WALL_TOP !== 'undefined' ? SURFACE_WALL_TOP : {}) };
  let draft = null; try { draft = raw ? JSON.parse(raw) : null; } catch (_) {}
  if (draft && typeof draft === 'object') for (const [id, v] of Object.entries(draft)) { if (Number.isFinite(v)) data[id] = v; else delete data[id]; }
  surfaceWallTopCache = { raw, data };
  return data;
}
// 這張牆的牆頂有幾列（0＝整張都是牆面，2 樓的人完全走不上去）
function surfaceWallTopOf(id) { const v = surfaceWallTopData()[id]; return Number.isFinite(v) ? Math.max(0, Math.round(v)) : SURFACE_WALL_TOP_DEFAULT; }
