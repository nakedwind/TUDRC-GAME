/* ===== 扭蛋機：花異質碎片轉服裝扭蛋（設定在 data/costumes.js 的 GACHA）=====
   ・地圖上的扭蛋機（GACHA.machineTiles，或名稱有「扭蛋機」的地圖素材；基地、戰鬥地圖都可以）前按 Space 打開
   ・轉到的 skin、配件加進擁有的服裝（js/costumes.js 的 costumeGrant），到衣櫃就能換上
   ・「收藏」分頁：看扭蛋池裡有哪些、拿到幾個；重複的可以分解換回碎片（每樣至少留 1 個）
   必須在 js/costumes.js 之後載入。
*/
let gachaOpen = false;
const gc = { el: null, tab: 'result', results: null, busy: false, msg: '' };
const gachaSpots = () => costumeSpots((id, t) => GACHA.machineTiles.includes(id) || /扭蛋機/.test(t.name || ''), false);   // 戰鬥地圖上擺的也能轉（例如地下街入口）
const gachaNearPlayer = () => costumeSpotNearPlayer(gachaSpots());
function useGachaNearPlayer() { if (!gachaNearPlayer()) return false; openGacha(); return true; }

// ---- 抽 ----
const gachaPool = () => [...COSTUME_ACCESSORIES, ...COSTUME_SKINS].filter(i => i.gacha !== false);
const rarityOf = item => item.rarity || 'N';
function gachaRoll() {
  const pool = gachaPool(); if (!pool.length) return null;
  const tiers = Object.keys(GACHA.rates).filter(r => pool.some(i => rarityOf(i) === r));   // 還沒有東西的稀有度不算
  let roll = Math.random() * tiers.reduce((sum, r) => sum + GACHA.rates[r], 0), tier = tiers[tiers.length - 1];
  for (const r of tiers) { roll -= GACHA.rates[r]; if (roll < 0) { tier = r; break; } }
  const items = pool.filter(i => rarityOf(i) === tier);
  return items[Math.floor(Math.random() * items.length)];
}
function gachaPull(times) {
  if (gc.busy) return;
  const cost = times >= 10 ? GACHA.tenCost : GACHA.cost * times;
  if (!gachaPool().length) { gc.msg = '扭蛋機還是空的（data/costumes.js 還沒有服裝）'; renderGacha(); return; }
  if (training.crystals < cost) { sfx('error'); gc.msg = '異質碎片不夠（還差 ' + (cost - training.crystals) + ' 個）'; renderGacha(); return; }
  if (!spendCrystals(cost)) return;
  const results = [];
  for (let i = 0; i < times; i++) { const item = gachaRoll(); if (item) results.push({ item, isNew: costumeGrant(item.id) }); }
  costumeState.pulls = (costumeState.pulls || 0) + times; saveCostumes();
  gc.results = results; gc.tab = 'result'; gc.msg = ''; gc.busy = true;
  renderGacha();
  // 動畫：機器搖一搖 → 扭蛋掉下來 → 打開
  const card = gc.el.querySelector('.gc-card');
  card.classList.remove('gc-turning'); void card.offsetWidth; card.classList.add('gc-turning');
  sfx('button');
  setTimeout(() => { if (gachaOpen) sfx('place'); }, 520);
  setTimeout(() => {
    gc.busy = false; if (!gachaOpen) return;
    card.classList.remove('gc-turning'); card.classList.add('gc-reveal');
    const best = results.reduce((b, r) => Math.max(b, Object.keys(GACHA.rates).indexOf(rarityOf(r.item))), 0);
    sfx(best >= 2 ? 'achievement' : 'itemPickup');
    renderGacha();
  }, 1050);
}
function gachaDismantle(id, all) {
  const item = costumeItem(id), have = costumeState.owned[id] || 0; if (!item || have <= 1) return;
  const n = all ? have - 1 : 1, gain = n * (GACHA.dismantle[rarityOf(item)] || 0);
  costumeState.owned[id] = have - n; saveCostumes();
  if (gain) earnCrystals(gain);
  if (typeof SFX !== 'undefined') SFX.play('crystalGet', .7, 'gacha-dismantle');
  gc.msg = '分解了 ' + n + ' 個「' + item.name + '」，拿回 ' + gain + ' 個異質碎片';
  if (typeof updateHUD === 'function') updateHUD();
  renderGacha();
}
function gachaDismantleAll() {
  let n = 0, gain = 0;
  for (const item of gachaPool()) {
    const extra = (costumeState.owned[item.id] || 0) - 1; if (extra <= 0) continue;
    n += extra; gain += extra * (GACHA.dismantle[rarityOf(item)] || 0); costumeState.owned[item.id] = 1;
  }
  if (!n) return;
  saveCostumes(); if (gain) earnCrystals(gain);
  if (typeof SFX !== 'undefined') SFX.play('crystalGet', .7, 'gacha-dismantle');
  gc.msg = '分解了 ' + n + ' 個重複的服裝，拿回 ' + gain + ' 個異質碎片';
  if (typeof updateHUD === 'function') updateHUD();
  renderGacha();
}

// ---- 介面 ----
function gachaArt(item) {   // 配件：正面圖；skin：那套的正面胸像
  if (item.slot) return '<span class="gc-icon"><img src="' + item.art.front + '" alt=""></span>';
  return '<span class="wd-face gc-skin" data-char="' + item.char + '"><img src="images/character/' + item.folder + '/' + item.folder.replace('_', '') + '_0000_Front.png" alt=""></span>';
}
function gachaKind(item) {
  if (item.slot) return (COSTUME_SLOTS.find(s => s.id === item.slot) || {}).name || item.slot;
  return ((CHARACTERS[item.char] || {}).name || item.char) + '的服裝';
}
const rarityTag = r => '<em class="r-' + r + '">' + r + '</em>';
function buildGacha() {
  const el = gc.el = document.createElement('div');
  el.id = 'gacha'; el.className = 'hidden';
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', '扭蛋機');
  el.innerHTML = '<section class="gc-card"><header class="gc-head"><div class="gc-title"><h2>扭蛋機</h2><p>投入異質碎片，轉出服裝和配件</p></div>'
    + '<span class="gc-shards"><img src="images/碎片鑰匙/anomalous-shard.png" alt=""><b></b></span>'
    + '<button type="button" class="gc-close" aria-label="關閉（Esc）">×</button></header>'
    + '<div class="gc-body"><div class="gc-machine"><div class="gc-machine-art"><img src="images/street/street-capsule-toy-machines.png" alt=""><i class="gc-capsule"></i></div>'
    + '<div class="gc-buttons"><button type="button" data-pull="1"></button><button type="button" data-pull="10"></button></div><p class="gc-rates"></p></div>'
    + '<div class="gc-side"><nav class="gc-tabs"><button type="button" data-tab="result">轉到的</button><button type="button" data-tab="book">收藏</button></nav>'
    + '<p class="gc-msg" role="status"></p><div class="gc-list"></div></div></div></section>';
  document.getElementById('wrap').appendChild(el);
  el.querySelector('.gc-close').addEventListener('click', closeGacha);
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.pull) gachaPull(Number(b.dataset.pull));
    else if (b.dataset.tab) { gc.tab = b.dataset.tab; gc.msg = ''; sfx('switch'); renderGacha(); }
    else if (b.dataset.dismantle) gachaDismantle(b.dataset.dismantle, e.shiftKey);
    else if ('dismantleAll' in b.dataset) gachaDismantleAll();
  });
}
function renderGacha() {
  if (!gc.el) return;
  const el = gc.el;
  el.querySelector('.gc-shards b').textContent = training.crystals;
  const [one, ten] = el.querySelectorAll('[data-pull]');
  one.innerHTML = '轉 1 次<small><img src="images/碎片鑰匙/anomalous-shard.png" alt="">' + GACHA.cost + '</small>';
  ten.innerHTML = '轉 10 次<small><img src="images/碎片鑰匙/anomalous-shard.png" alt="">' + GACHA.tenCost + '</small>';
  one.disabled = ten.disabled = gc.busy;
  one.classList.toggle('poor', training.crystals < GACHA.cost); ten.classList.toggle('poor', training.crystals < GACHA.tenCost);
  const pool = gachaPool(), tiers = Object.keys(GACHA.rates).filter(r => pool.some(i => rarityOf(i) === r)), total = tiers.reduce((s, r) => s + GACHA.rates[r], 0);
  el.querySelector('.gc-rates').innerHTML = tiers.map(r => rarityTag(r) + ' ' + Math.round(GACHA.rates[r] / total * 1000) / 10 + '%').join('　') + '<br>共 ' + pool.length + ' 種・已收集 ' + pool.filter(i => costumeOwned(i.id)).length + ' 種';
  el.querySelectorAll('.gc-tabs [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === gc.tab));
  el.querySelector('.gc-msg').textContent = gc.msg;
  const list = el.querySelector('.gc-list');
  if (gc.tab === 'result') {
    list.className = 'gc-list gc-results';
    if (gc.busy) list.innerHTML = '<p class="gc-wait">轉轉轉……</p>';
    else if (!gc.results) list.innerHTML = '<p class="gc-wait">投入碎片，轉轉看！<br><small>轉到的服裝到衣櫃就能換上</small></p>';
    else list.innerHTML = gc.results.map(({ item, isNew }, i) => '<div class="gc-item r-' + rarityOf(item) + '" style="--i:' + i + '">' + gachaArt(item)
      + '<b>' + item.name + '</b><small>' + gachaKind(item) + '</small>' + rarityTag(rarityOf(item)) + (isNew ? '<i class="gc-new">NEW</i>' : '') + '</div>').join('');
  } else {
    list.className = 'gc-list gc-book';
    const dupes = pool.reduce((n, i) => n + Math.max(0, (costumeState.owned[i.id] || 0) - 1), 0);
    list.innerHTML = (dupes ? '<div class="gc-book-bar">重複的服裝 ' + dupes + ' 個<button type="button" data-dismantle-all>全部分解</button></div>' : '')
      + pool.map(item => {
        const have = costumeState.owned[item.id] || 0, r = rarityOf(item);
        if (!have) return '<div class="gc-item gc-locked r-' + r + '">' + gachaArt(item) + '<b>？？？</b><small>' + gachaKind(item) + '</small>' + rarityTag(r) + '</div>';
        return '<div class="gc-item r-' + r + '">' + gachaArt(item) + '<b>' + item.name + '</b><small>' + gachaKind(item) + '</small>' + rarityTag(r)
          + (have > 1 ? '<i class="gc-count">×' + have + '</i><button type="button" class="gc-dismantle" data-dismantle="' + item.id + '" title="分解 1 個（按住 Shift 分解全部重複的）">分解 +' + (GACHA.dismantle[r] || 0) + '</button>' : '') + '</div>';
      }).join('');
  }
}
function openGacha() {
  if (gachaOpen) return;
  if (!gc.el) buildGacha();
  gachaOpen = true; gc.msg = '';
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  gc.el.classList.remove('hidden'); gc.el.querySelector('.gc-card').classList.remove('gc-turning', 'gc-reveal');
  renderGacha();
  sfx('menu');
}
function closeGacha() {
  if (!gachaOpen) return;
  gachaOpen = false; gc.busy = false; gc.el.classList.add('hidden');
  sfx('switch');
}
// 開著的時候：Esc 關掉，其他按鍵都不要傳給遊戲
window.addEventListener('keydown', e => {
  if (!gachaOpen) return;
  if (e.key === 'Escape') closeGacha();
  if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  e.stopImmediatePropagation();
}, { capture: true });
