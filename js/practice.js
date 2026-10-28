/* ===== B-2 訓練室的練習模式 =====
   - 平常訓練場的玻璃門關著（data/doors.js 的 practice 門）。跟塔納對話 →「🎯 開始訓練」→ 選隊員、史萊姆、數量。
   - 開始後：溫特和選好的隊員進到黃線區域裡，房間暫時變成戰鬥區域（可以開槍、蓋建築）。
     ・不花錢（經費 ∞）、不消耗物資和彈藥（醫療包、杏仁水、照明彈、燃燒彈、麻醉針、急救包、電池）。
     ・史萊姆照樣會打人、擊退、自爆、吐酸，但大家都不會扣 HP、不會倒下。
     ・污染照常累積（可以練疏導、麻醉槍解除暴走）；也能關掉。
     ・沒有任何獎勵：異質碎片、成就、支線任務進度都不算。
     ・房間中間放一個沙包：打不壞、不會動，頭上顯示每秒傷害（DPS），比較武器和隊員的輸出用。
   - 結束：走到門邊按 Space → 選單（結束訓練、開關燈光、開關污染）。
*/
const PRACTICE = {
  mapId: 'map_mvfmo6c2',               // 哪一張地圖是訓練室（地圖的 id：在基地編輯器改地圖名稱也不會壞）
  map: 'B1訓練室',                      // 找不到 id 時，改用地圖名稱找（以前叫 B-2訓練室 → B-1訓練室 → 10/21 統一寫法改成 B1訓練室）
  npc: 'taana',                         // 誰可以開始訓練
  area: { c0: 4, c1: 15, r0: 6, r1: 13 },   // 黃線區域（格子範圍；14、15 排在玻璃牆後面，畫面上被擋住，不放人）
  enter: [9, 13], exit: [9, 18],        // 進場時溫特站的格子、結束後站的格子（門的裡面／外面）
  sandbag: [9, 8],                      // 沙包的格子（會往右偏半格，站在中間）
  money: 99999,
  counts: [0, 3, 6, 10],                // 一次放幾隻史萊姆可以選
  spawnEvery: .6, waveDelay: 3,         // 補怪間隔、一波打完後幾秒再來一波
  dpsWindow: 5,                         // DPS 用最近幾秒的傷害算
  kinds: [['normal', '史萊姆'], ['splitter', '分裂'], ['bomber', '自爆'], ['spitter', '吐酸'], ['giant', '巨型']],
};
const PRACTICE_PREFS = 'tudrc_practice_v1';
const practice = { active: false, team: [], kinds: ['normal'], count: 3, refill: true, taint: true, dark: false, sandbag: true,
  snap: null, spawnT: 0, waveT: 0, hits: [], total: 0 };
try { Object.assign(practice, JSON.parse(localStorage.getItem(PRACTICE_PREFS) || '{}')); practice.active = false; } catch (_) {}
function savePracticePrefs() {
  const { team, kinds, count, refill, taint, dark, sandbag } = practice;
  try { localStorage.setItem(PRACTICE_PREFS, JSON.stringify({ team, kinds, count, refill, taint, dark, sandbag })); } catch (_) {}
}
const practiceOn = () => practice.active;
const isPracticeMap = () => !!(MAP && (MAP.id === PRACTICE.mapId || MAP.name === PRACTICE.map));
const inPracticeArea = (c, r) => c >= PRACTICE.area.c0 && c <= PRACTICE.area.c1 && r >= PRACTICE.area.r0 && r <= PRACTICE.area.r1;

// ---- 訓練中不給獎勵、不出 Smiler（包住原本的函式）----
for (const name of ['questEvent', 'addStat', 'trackKillAchievements', 'earnCrystals', 'updateSmilers', 'tryEquipDrop', 'tryGunFind']) {
  const orig = window[name]; if (typeof orig !== 'function') continue;
  window[name] = function (...args) { if (practice.active) return; return orig.apply(this, args); };
}
// 經費顯示 ∞
const practiceOrigHUD = window.updateHUD;
if (typeof practiceOrigHUD === 'function') window.updateHUD = function (...args) {
  const r = practiceOrigHUD.apply(this, args);
  if (practice.active) { const el = document.getElementById('money'); if (el) el.textContent = '∞'; }
  return r;
};

// ---- 跟塔納對話：多一個「🎯 開始訓練」按鈕（game.js 的 openDialogue 呼叫）----
function onDialogueOpenedPractice(actor) {
  const btn = document.getElementById('dialoguePractice'); if (!btn) return;
  btn.classList.toggle('hidden', !(actor && (actor.kind === 'tower' ? actor.type : actor.id) === PRACTICE.npc && isPracticeMap() && !practice.active));   // 塔納是出勤隊員（tower）：看 type
}
document.getElementById('dialoguePractice')?.addEventListener('click', () => { if (typeof closeDialogue === 'function') closeDialogue(true); openPracticePanel(); });

// ---- 訓練設定面板（選隊員、史萊姆、數量）----
let practiceEl = null, practicePanelOpen = false, practiceMenu = false;
function ensurePracticeEl() {
  if (practiceEl) return;
  practiceEl = document.createElement('div'); practiceEl.id = 'practicePanel'; practiceEl.className = 'hidden';
  practiceEl.addEventListener('click', e => {
    if (e.target === practiceEl || e.target.closest('.workshop-close') || e.target.closest('[data-pr-cancel]')) { closePracticePanel(); return; }
    const b = e.target.closest('[data-pr]'); if (!b) return;
    const [kind, v] = b.dataset.pr.split(':');
    const cap = typeof TEAM_SIZE !== 'undefined' ? TEAM_SIZE : 4;
    if (kind === 'team') {
      if (practice.team.includes(v)) practice.team = practice.team.filter(x => x !== v);
      else if (practice.team.length < cap) practice.team.push(v); else { sfx('error'); systemNotice('最多帶 ' + cap + ' 位隊員', true); return; }
    } else if (kind === 'kind') {
      if (practice.kinds.includes(v)) { if (practice.kinds.length > 1) practice.kinds = practice.kinds.filter(x => x !== v); }
      else practice.kinds.push(v);
    } else if (kind === 'count') practice.count = Number(v);
    else if (kind === 'refill') practice.refill = !practice.refill;
    else if (kind === 'taint') { practice.taint = !practice.taint; if (practice.active) practiceApplyRules(); }
    else if (kind === 'dark') { practice.dark = !practice.dark; if (practice.active) practiceApplyRules(); }
    else if (kind === 'sandbag') practice.sandbag = !practice.sandbag;
    else if (kind === 'start') { savePracticePrefs(); closePracticePanel(true); startPractice(); return; }
    else if (kind === 'end') { closePracticePanel(true); endPractice(); return; }
    savePracticePrefs(); sfx('button'); renderPracticePanel();
  });
  document.getElementById('wrap').appendChild(practiceEl);
}
function renderPracticePanel() {
  const toggle = (key, label, on) => '<button type="button" class="pr-chip' + (on ? ' on' : '') + '" data-pr="' + key + '">' + (on ? '✔ ' : '') + label + '</button>';
  const onOff = (key, label, on, desc) => '<div class="pr-row"><b>' + label + '</b><button type="button" class="pr-switch' + (on ? ' on' : '') + '" data-pr="' + key + '"><i></i>' + (on ? '開' : '關') + '</button><small>' + desc + '</small></div>';
  const rules = onOff('taint', '污染累積', practice.taint, '開：跟戰鬥一樣會累積污染、會暴走（可以練疏導、麻醉槍）') +
    onOff('dark', '關燈', practice.dark, '開：房間變暗，可以測試手電筒、照明頭盔、照明彈');
  let body;
  if (practiceMenu) {   // 訓練中，在門邊打開的選單
    body = '<p class="pr-tip">訓練進行中。要結束的話，按下面的「結束訓練」，大家會回到門外。</p>' + rules +
      '<div class="pr-actions"><button type="button" class="ws-btn pr-ghost" data-pr-cancel>繼續訓練</button><button type="button" class="ws-btn" data-pr="end">結束訓練</button></div>';
  } else {
    const roster = (typeof ROSTER !== 'undefined' ? ROSTER : Object.keys(TYPES)).filter(id => TYPES[id]);
    const cap = typeof TEAM_SIZE !== 'undefined' ? TEAM_SIZE : 4;
    const team = roster.map(id => {
      const img = sentrySprites[id]?.front?.[0]?.src, on = practice.team.includes(id);
      return '<button type="button" class="pr-member' + (on ? ' on' : '') + '" data-pr="team:' + id + '">' + (img ? '<img src="' + img + '" alt="">' : '') + '<span>' + TYPES[id].name + '</span>' + (on ? '<em>✔</em>' : '') + '</button>';
    }).join('');
    body = '<h3>帶哪些隊員 <small>（最多 ' + cap + ' 位，也可以都不帶）</small></h3><div class="pr-members">' + team + '</div>' +
      '<h3>史萊姆種類</h3><div class="pr-chips">' + PRACTICE.kinds.map(([id, n]) => toggle('kind:' + id, n, practice.kinds.includes(id))).join('') + '</div>' +
      '<h3>一次幾隻</h3><div class="pr-chips">' + PRACTICE.counts.map(n => toggle('count:' + n, n ? n + ' 隻' : '不放（只打沙包）', practice.count === n)).join('') + '</div>' +
      '<div class="pr-chips">' + toggle('refill', '打倒就馬上補上（關掉＝整波打完再來下一波）', practice.refill) + toggle('sandbag', '放沙包（顯示 DPS）', practice.sandbag) + '</div>' +
      '<h3>規則</h3>' + rules +
      '<p class="pr-tip">訓練中不花錢、不消耗物資和彈藥，大家都不會扣 HP；也沒有任何獎勵。要結束就走到門邊按 Space。</p>' +
      '<div class="pr-actions"><button type="button" class="ws-btn pr-ghost" data-pr-cancel>取消</button><button type="button" class="ws-btn" data-pr="start">🎯 開始訓練</button></div>';
  }
  practiceEl.innerHTML = '<section class="workshop-card practice-card" role="dialog" aria-modal="true" aria-label="訓練室">' +
    '<header class="workshop-head"><div class="workshop-title"><small>B-2 訓練室・塔納</small><h2>' + (practiceMenu ? '訓練選單' : '練習模式') + '</h2>' +
    '<p>' + (practiceMenu ? '調整規則，或結束訓練' : '在黃線區域裡測試武器、裝備和隊員的能力') + '</p></div>' +
    '<button type="button" class="workshop-close" aria-label="關閉（Esc）">×</button></header><div class="workshop-body practice-body">' + body + '</div></section>';
}
function openPracticePanel(menu = false) {
  ensurePracticeEl(); practiceMenu = menu; practicePanelOpen = true;
  Object.keys(keys).forEach(k => { keys[k] = false; });
  renderPracticePanel(); practiceEl.classList.remove('hidden'); sfx('menu');
}
function closePracticePanel(silent = false) {
  if (!practicePanelOpen) return; practicePanelOpen = false; practiceEl.classList.add('hidden'); if (!silent) sfx('switch');
}
window.addEventListener('keydown', e => {
  if (!practicePanelOpen) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closePracticePanel(); return; }
  if (!(e.target instanceof HTMLButtonElement)) e.stopImmediatePropagation();   // 面板打開時，按鍵不控制角色
}, true);

// ---- 門：訓練中在門邊按 Space 打開選單；平常按了提醒要找塔納（game.js 的互動鍵、render.js 的提示呼叫）----
function practiceDoorNear() {
  if (!isPracticeMap() || !G || !G.player || G.player.sitting) return null;
  const p = G.player;   // 門的正上方（訓練場裡、玻璃牆前）或正下方（門外）都算
  return mapDoors.find(d => d.mode === 'practice' && Math.abs(p.x - d.x) < CELL * 1.5 && p.y > d.top - CELL * 1.3 && p.y < d.y + CELL * 1.6) || null;
}
function practiceDoorPrompt() { return practice.active ? '結束訓練／訓練選單' : '訓練場（找塔納開始訓練）'; }
function usePracticeDoorNearPlayer() {
  const d = practiceDoorNear(); if (!d) return false;
  if (practice.active) openPracticePanel(true);
  else { sfx('error'); flash('門鎖著，找塔納', d.x, d.top, '#ffcf89', 1.8); }
  return true;
}

// ---- 開始／結束（黑幕淡入淡出，和走門一樣）----
function practiceTravel(fn) {
  if (mapTransitioning) return;
  mapTransitioning = true;
  Object.keys(keys).forEach(k => { keys[k] = false; });
  requestAnimationFrame(() => {
    mapTransition.classList.add('visible');
    setTimeout(() => setTimeout(() => {
      fn(); updateCamera(); draw();
      requestAnimationFrame(() => mapTransition.classList.remove('visible'));
      setTimeout(() => { mapTransitioning = false; }, PORTAL_FADE_MS);
    }, PORTAL_BLACK_MS), PORTAL_FADE_MS);
  });
}
function practiceCellsNear(c0, r0, n, avoid = []) {   // 黃線區域裡、離 (c0, r0) 最近的 n 個空格
  const out = [];
  for (let c = PRACTICE.area.c0; c <= PRACTICE.area.c1; c++) for (let r = PRACTICE.area.r0; r <= PRACTICE.area.r1; r++) {
    if (isWall(c, r) || G.grid[c + ',' + r] || avoid.some(([ac, ar]) => ac === c && ar === r)) continue;
    out.push([c, r]);
  }
  out.sort((a, b) => Math.hypot(a[0] - c0, a[1] - r0) - Math.hypot(b[0] - c0, b[1] - r0));
  return out.slice(0, n);
}
function startPractice() {
  if (practice.active || !isPracticeMap()) return;
  practiceTravel(() => {
    const p = G.player, eqp = typeof equipState !== 'undefined' ? equipState : null;
    practice.snap = { guide: G.guide, supplies: new Map(supplyInventory),
      bullets: eqp ? JSON.parse(JSON.stringify(eqp.bullets || {})) : null, battery: eqp ? eqp.battery : 100 };
    practice.active = true; practice.hits = []; practice.total = 0; practice.spawnT = .8; practice.waveT = 0;
    switchMap(MAP_INDEX); begin(false);   // 同一張地圖重新佈置成「戰鬥區域」（MAP_SAFE 關掉，js/maploader.js）
    G.money = PRACTICE.money; G.guide = practice.snap.guide;
    G.loofahTestDone = G.fishTestDone = G.bananaKingTestDone = G.gourdTestDone = true;   // 戰鬥地圖的測試用生怪（絲瓜、魚頭）不要出現在訓練室
    const [ec, er] = PRACTICE.enter, [px, py] = center(ec, er);
    G.player.x = px + CELL / 2; G.player.y = py; G.player.dir = 'back';
    const cells = practiceCellsNear(ec, er - 2, G.towers.length, [PRACTICE.sandbag]);
    G.towers.forEach((t, i) => { const cell = cells[i]; if (!cell) return; [t.x, t.y] = center(...cell); t.navPath = null; t.anchor = null; t.mode = 'free'; });
    if (practice.sandbag) spawnSandbag();
    practiceApplyRules(); updateHUD();
    systemNotice('🎯 訓練開始！要結束就走到門邊按 Space');
  });
}
function endPractice() {
  if (!practice.active) return;
  practiceTravel(() => {
    const s = practice.snap;
    G.moneySettled = true;                 // 訓練用的經費不會帶回錢包
    if (s) G.guide = s.guide;              // SP 回到訓練前（rememberSanitySP 會在換地圖時記住）
    practice.active = false;
    switchMap(MAP_INDEX); begin(false);    // 變回安全區
    if (s) {
      supplyInventory.clear(); for (const [k, v] of s.supplies) Map.prototype.set.call(supplyInventory, k, v);
      if (typeof equipState !== 'undefined') { if (s.bullets && s.bullets.n) equipState.bullets = s.bullets; equipState.battery = s.battery; saveEquipment(); }
    }
    practice.snap = null;
    const [xc, xr] = PRACTICE.exit, [x, y] = center(xc, xr);
    G.player.x = x + CELL / 2; G.player.y = y; G.player.dir = 'front';
    updateHUD();
    systemNotice('訓練結束');
  });
}
// 燈光、污染開關（開始時、在選單切換時）
function practiceApplyRules() {
  if (typeof LIGHT !== 'undefined') LIGHT.enabled = (typeof LIGHT_BASE_ENABLED === 'undefined' || LIGHT_BASE_ENABLED) && practice.dark;
  if (!practice.taint) for (const t of G.towers) { t.taint = 0; t.berserk = false; }
}

// ---- 沙包：打不壞、不會動，記錄受到的傷害算 DPS ----
function spawnSandbag() {
  const [c, r] = PRACTICE.sandbag, [x, y] = center(c, r);
  G.enemies.push({ type: 'sandbag', dummy: true, x: x + CELL / 2, y, homeX: x + CELL / 2, homeY: y, hp: 1e6, maxhp: 1e6, speed: 0, reward: 0, crystals: 0,
    playerDamage: 0, sentryDamage: 0, buildingDamage: 0, drawWidth: 34, drawHeight: 58, noHitSquash: true, knockMul: 0, noStun: false, behavior: 'dummy',
    hasTarget: false, wanderWait: 99, sway: 0 });
}
const practiceSandbag = () => G.enemies.find(e => e.dummy);
function practiceDps() {
  const now = performance.now() / 1000, W = PRACTICE.dpsWindow;
  practice.hits = practice.hits.filter(h => now - h.t <= W);
  if (!practice.hits.length) return 0;
  const span = Math.max(1, Math.min(W, now - practice.hits[0].t));
  return practice.hits.reduce((s, h) => s + h.d, 0) / span;
}

// ---- 每幀（game.js 的 update 呼叫）----
function updatePractice(dt) {
  if (!practice.active || !G || MAP_SAFE) return;
  const p = G.player;
  G.money = PRACTICE.money;
  if (p) { p.hp = p.maxhp; }                                  // 不扣 HP
  for (const t of G.towers) { if (t.hp < t.maxhp) t.hp = t.maxhp; if (!practice.taint) { t.taint = 0; t.berserk = false; } }
  // 不消耗物資、彈藥
  const s = practice.snap;
  if (s) for (const [k, v] of s.supplies) if ((supplyInventory.get(k) || 0) < v) Map.prototype.set.call(supplyInventory, k, v);
  if (typeof equipState !== 'undefined') {
    equipState.battery = 100;
    if (s && s.bullets && s.bullets.n) for (const [id, n] of Object.entries(s.bullets.n)) if (bulletCount(id) < n) equipState.bullets.n[id] = n;   // 子彈：補回訓練前的數量
    const aid = typeof equipLv === 'function' && equipLv('firstaid');
    if (aid && typeof firstAid !== 'undefined' && !firstAid.channel) { firstAid.forG = G; firstAid.uses = aid.uses; }
  }
  // 沙包
  const bag = practiceSandbag();
  if (bag) {
    const d = bag.maxhp - bag.hp;
    if (d > 0) { practice.hits.push({ t: performance.now() / 1000, d }); practice.total += d; bag.sway = Math.min(1, bag.sway + d / 25); }
    bag.hp = bag.maxhp; bag.x = bag.homeX; bag.y = bag.homeY; bag.burnT = Math.min(bag.burnT || 0, 4);
    bag.sway = Math.max(0, bag.sway - dt * 1.6);
  }
  // 史萊姆（不是史萊姆、也不是沙包的怪物：別的系統放進來的，直接移除）
  G.enemies = G.enemies.filter(e => e.dummy || e.type === 'slime');
  const alive = G.enemies.filter(e => !e.dead && !e.dummy).length;
  if (!practice.count) return;
  if (practice.refill) {
    practice.spawnT -= dt;
    if (alive < practice.count && practice.spawnT <= 0) { spawnPracticeSlime(); practice.spawnT = PRACTICE.spawnEvery; }
  } else if (alive === 0) {
    practice.waveT += dt;
    if (practice.waveT >= PRACTICE.waveDelay) { practice.waveT = 0; for (let i = 0; i < practice.count; i++) spawnPracticeSlime(); }
  } else practice.waveT = 0;
}
function spawnPracticeSlime() {
  const spec = (typeof ACTIVE_MONSTERS !== 'undefined' && ACTIVE_MONSTERS.find(m => m.id === 'slime')) || MONSTERS_DEFAULT.find(m => m.id === 'slime');
  if (!spec) return;
  const p = G.player, [bc, br] = PRACTICE.sandbag, cells = [];
  for (let c = PRACTICE.area.c0; c <= PRACTICE.area.c1; c++) for (let r = PRACTICE.area.r0; r <= PRACTICE.area.r1; r++) {
    if (isWall(c, r) || G.grid[c + ',' + r]) continue;
    const [x, y] = center(c, r);
    if (Math.hypot(x - p.x, y - p.y) < 3 * CELL || (Math.abs(c - bc) <= 1 && Math.abs(r - br) <= 1)) continue;
    cells.push([x, y]);
  }
  if (!cells.length) return;
  const [x, y] = cells[Math.floor(Math.random() * cells.length)];
  const variant = practice.kinds[Math.floor(Math.random() * practice.kinds.length)] || 'normal';
  const e = createMonster(spec, x, y, variant); e.practice = true;
  G.enemies.push(e);
  G.effects.push({ ring: true, x, y: y + 6, r: 4, r2: 26, life: .35, life0: .35, color: '#8fd3ff' });
}

// ---- 繪製沙包（render.js 依腳底位置排前後時呼叫）----
// 圖片：images/地下訓練室/sandbag.png（76×180）；畫成 SANDBAG_IMG_H 高、底部貼在腳底，被打到會晃、變亮。圖還沒讀到時用下面畫的
const SANDBAG_IMG = new Image(); SANDBAG_IMG.src = 'images/地下訓練室/sandbag.png';
const SANDBAG_IMG_H = 70;
function drawSandbag(ctx, e) {
  const now = performance.now() / 1000, sway = Math.sin(now * 18) * e.sway * .18;
  const x = e.x, y = e.y + 13;
  ctx.save();
  if (SANDBAG_IMG.complete && SANDBAG_IMG.naturalWidth) {
    const h = SANDBAG_IMG_H, w = h * SANDBAG_IMG.naturalWidth / SANDBAG_IMG.naturalHeight;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y - 7, w * .6, 5, 0, 0, Math.PI * 2); ctx.fill();   // 影子（比腳底高 5）
    ctx.translate(x, y); ctx.rotate(sway);   // 以底座為軸晃
    ctx.drawImage(SANDBAG_IMG, -w / 2, -h, w, h);
    if (e.hitT > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35; ctx.drawImage(SANDBAG_IMG, -w / 2, -h, w, h); }   // 被打到：變亮
    ctx.restore();
  } else {
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y, 17, 5, 0, 0, Math.PI * 2); ctx.fill();   // 影子
  ctx.fillStyle = '#3a3f47'; ctx.beginPath(); ctx.ellipse(x, y - 2, 14, 5, 0, 0, Math.PI * 2); ctx.fill();   // 底座
  ctx.fillStyle = '#585f6a'; ctx.beginPath(); ctx.ellipse(x, y - 4, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(x, y - 6); ctx.rotate(sway);
  const w = 26, h = 50;
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, '#6b2f26'); g.addColorStop(.45, e.hitT > 0 ? '#e0786a' : '#b14b3c'); g.addColorStop(1, '#5a261f');
  ctx.fillStyle = g; ctx.strokeStyle = '#2b1410'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-w / 2, -h, w, h, 9) : ctx.rect(-w / 2, -h, w, h); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(30,30,30,.55)';   // 膠帶
  ctx.fillRect(-w / 2, -h + 9, w, 4); ctx.fillRect(-w / 2, -12, w, 4);
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-w / 2 + 4, -h + 5, 3, h - 12);   // 反光
  ctx.restore();
  }
  // DPS 數字
  const dps = practiceDps();
  ctx.save(); ctx.textAlign = 'center';
  ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
  const label = 'DPS ' + dps.toFixed(1), sub = '總傷害 ' + Math.round(practice.total);
  const tw = Math.max(ctx.measureText(label).width, 70) + 14;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - tw / 2, y - 106, tw, 30, 7) : ctx.rect(x - tw / 2, y - 106, tw, 30); ctx.fill();
  ctx.fillStyle = dps > 0 ? '#ffd479' : '#c9d3dc'; ctx.fillText(label, x, y - 93);
  ctx.font = '10px "Microsoft JhengHei", sans-serif'; ctx.fillStyle = '#c9d3dc'; ctx.fillText(sub, x, y - 81);
  ctx.restore();
}
