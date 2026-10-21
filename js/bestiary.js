/* ===== 怪物圖鑑（遊戲）=====
   ・2F應變中心的電腦（電腦辦公桌）前按 Space 打開；左邊是選到的怪物（圖片、名稱、能力），右邊是星級、縮圖、基礎訊息
   ・消滅次數：怪物死掉時記一次（js/combat-feel.js 的 onEnemyDeath 呼叫 bestiaryRecordKill）。
     自爆史萊姆自己炸掉的不算；B1 訓練室（練習模式）打死的預設不算（data/bestiary.js 的 style.countPractice）。
   ・消滅過的怪物才有縮圖、才能點來看；還沒消滅過的是黑底問號
   ・記錄存在瀏覽器（tudrc_bestiary_v1），開新遊戲會清掉（js/new-game.js）
   畫面、版面在 js/bestiary-config.js（跟怪物圖鑑編輯器共用）。必須在 js/costumes.js（costumeSpots）之後載入。
*/
const BESTIARY_STORE = 'tudrc_bestiary_v1';
// 可以打開圖鑑的電腦：地圖素材 id；maps＝只有這幾張地圖上的算（空的＝每張基地地圖都算）
const BESTIARY_COMPUTER = { tiles: ['tile_hq_computer_desk'], maps: ['2F應變中心'] };
let bestiaryOpen = false;
const bst = { el: null, kills: {}, sel: null, page: 0 };
try {
  const d = JSON.parse(localStorage.getItem(BESTIARY_STORE) || 'null');
  if (d && d.kills && typeof d.kills === 'object') for (const [k, n] of Object.entries(d.kills)) if (Number(n) > 0) bst.kills[k] = Math.floor(Number(n));
} catch (_) {}
function saveBestiary() { try { localStorage.setItem(BESTIARY_STORE, JSON.stringify({ kills: bst.kills })); } catch (_) {} }

// ---- 消滅次數 ----
const bestiaryKeyOf = e => e.type === 'slime' ? (!e.variant || e.variant === 'normal' ? 'slime' : 'slime:' + e.variant) : e.type;   // 史萊姆變體分開算
function bestiaryRecordKill(e) {
  if (!e || !e.type || e.dummy || e.exploded) return;   // 沙包、自爆史萊姆自己炸掉的不算
  if (!bestiaryStyle().countPractice && typeof practiceOn === 'function' && practiceOn()) return;
  const k = bestiaryKeyOf(e);
  bst.kills[k] = (bst.kills[k] || 0) + 1;
  saveBestiary();
}

// ---- 電腦：靠近、打開 ----
const bestiarySpots = () => (!BESTIARY_COMPUTER.maps.length || (MAP && BESTIARY_COMPUTER.maps.includes(MAP.name)))
  ? costumeSpots(id => BESTIARY_COMPUTER.tiles.includes(id)) : [];
const bestiaryNearPlayer = () => costumeSpotNearPlayer(bestiarySpots());
function useBestiaryNearPlayer() { if (!bestiaryNearPlayer()) return false; openBestiary(); return true; }

function buildBestiary() {
  const el = bst.el = document.createElement('div');
  el.id = 'bestiary'; el.className = 'hidden';
  document.getElementById('wrap').appendChild(el);
  el.addEventListener('click', e => {
    if (e.target === el) { closeBestiary(); return; }   // 點視窗外面＝關掉
    const b = e.target.closest('.bst-cell.known, .bst-prev, .bst-next, .bst-close'); if (!b) return;
    if (b.classList.contains('bst-close')) { closeBestiary(); return; }
    if (b.classList.contains('bst-prev') || b.classList.contains('bst-next')) { if (!b.disabled) { bst.page += b.classList.contains('bst-next') ? 1 : -1; sfx('switch'); renderBestiary(); } return; }
    if (b.dataset.key !== bst.sel) { bst.sel = b.dataset.key; sfx('switch'); renderBestiary(); }
  });
}
function renderBestiary() {
  if (!bst.el) return;
  const entries = bestiaryEntries(), known = e => (bst.kills[e.key] || 0) > 0;
  if (!entries.some(e => e.key === bst.sel && known(e))) bst.sel = (entries.find(known) || {}).key || null;   // 沒選、選的不在了：選第一隻消滅過的
  bst.page = Math.max(0, Math.min(bestiaryPageCount(null, entries.length) - 1, bst.page));
  bst.el.innerHTML = '<div class="bst-scale">' + bestiaryHtml(null, { entries, kills: bst.kills, sel: bst.sel, page: bst.page }) + '</div>';
  fitBestiary();
}
function fitBestiary() {   // 視窗比 1060×620 小：整個等比例縮小
  if (!bst.el || !bestiaryOpen) return;
  const box = bst.el.getBoundingClientRect(), wrap = bst.el.querySelector('.bst-scale'), card = bst.el.querySelector('.bst-card');
  if (!wrap || !card || !box.width) return;
  const k = Math.min(1, (box.width - 24) / BESTIARY_W, (box.height - 24) / BESTIARY_H);
  wrap.style.width = BESTIARY_W * k + 'px'; wrap.style.height = BESTIARY_H * k + 'px';
  card.style.transform = 'scale(' + k + ')';
}
function openBestiary() {
  if (bestiaryOpen) return;
  if (!bst.el) buildBestiary();
  bestiaryOpen = true;
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  bst.el.classList.remove('hidden');
  const entries = bestiaryEntries(), per = Math.max(1, bestiaryLayout().grid.cols * bestiaryLayout().grid.rows), i = entries.findIndex(e => e.key === bst.sel);
  if (i >= 0) bst.page = Math.floor(i / per);   // 打開時翻到選著的那一隻所在的那一頁
  renderBestiary();
  sfx('menu');
}
function closeBestiary() {
  if (!bestiaryOpen) return;
  bestiaryOpen = false; bst.el.classList.add('hidden');
  sfx('switch');
}
// 開著的時候：Esc 關掉、←→ 翻頁，其他按鍵都不要傳給遊戲
window.addEventListener('keydown', e => {
  if (!bestiaryOpen) return;
  if (e.key === 'Escape') closeBestiary();
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const b = bst.el.querySelector(e.key === 'ArrowLeft' ? '.bst-prev' : '.bst-next'); if (b && !b.disabled) b.click(); }
  if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  e.stopImmediatePropagation();
}, { capture: true });
window.addEventListener('resize', fitBestiary);
