/* ===== 深水區＋救生圈 =====
   深水區：地圖編輯器「🛟 深水區」筆刷框選的格子（存在地圖資料 MAP.deepWater：['c,r', …]）
     ・沒坐救生圈的人走不進去：溫特、隊員、地面怪物都擋（會飛的人面蝶照樣飛過去）；子彈、燈光不擋
     ・不能在上面蓋建築、放燈（js/build.js 的放置判定會看 isWall，這裡另外擋，見 deepWaterBlocksCell）
     ・划水速度：地圖設定的「🛟 深水區划水速度 %」（MAP.deepWaterSpeed，沒填＝SWIM_RING.speed）
   救生圈：溫特想走進深水區時，頭上跳出提示；按空白鍵（或 Enter）→ 身上有救生圈就坐上去下水，沒有就跳「身上沒有救生圈。」
     ・救生圈不會用掉，有一個就能一直用
     ・坐在救生圈上：只能划水移動（不能開槍）；溫特划到深水區的邊上就停住，出現「收起泳圈」，按空白鍵才收起救生圈、站到岸上
       （隊員照舊：划回不是深水的地方就自動收起救生圈）；水被抽乾、腳下已經不是深水時，溫特也會自動收起
     ・坐進救生圈的畫法（每個角色都通用，不用另外畫圖）：救生圈後半圈 → 角色原本的圖（腳裁掉）→ 救生圈前半圈
       划水時用原本的走路圖，手照樣擺動；腳被救生圈遮住
   隊員：要有「自己的游泳圈」才能下水（t.ownRing；左邊隊員欄頭像右下角會有游泳圈小圖）
     ・怎麼給：溫特從背包「放在地上」（或從快捷欄拖到地上）→ 離游泳圈最近、還沒有游泳圈的隊員走過去撿（一堆有幾個就給幾個人）
     ・溫特下水後，跟著走到池邊、卻沒有游泳圈的隊員，頭上會冒「想要游泳圈」的泡泡
     ・溫特坐救生圈下水後，每隔 0.6～0.8 秒，讓「離溫特最近、正要走進深水區、有自己游泳圈」的隊員下水
     ・隊員撿到的游泳圈整趟出勤都帶著（換戰鬥地圖也帶著）；回到基地、隊員離隊、重新整理遊戲時，自動還回溫特的背包（不會弄丟）
     ・坐救生圈的隊員一樣不能攻擊（js/game.js 的哨兵攻擊），划回岸上就自動收起救生圈
     ・划水的時候循環播放划水聲（音效編輯器的 poolPaddle）；掉進水裡掙扎時也播（js/pool-fall.js 的 poolStruggleSoundGain） */
const SWIM_RING = {
  itemId: 'swim-ring',
  hintText: '好像可以用泳圈做點什麼……',   // 身上沒有泳圈、想走進深水區時溫特頭上的泡泡（有泳圈的話改成腳下出現「進入水中」）
  enterPrompt: '進入水中',   // 身上有泳圈、靠近深水區時的互動提示（按空白鍵坐上泳圈下水）
  noRingText: '身上沒有救生圈。',            // 沒有救生圈還按空白鍵
  hintSecs: 1.6,       // 頭上的泡泡停多久（秒）
  reach: 12,           // 離深水區幾點以內算「在岸邊」（可以按空白鍵下水）
  shorePrompt: '收起泳圈',   // 溫特坐救生圈划到深水區邊上時的提示（按空白鍵收起救生圈、站到岸上）
  shoreReach: 24,      // 划到邊上時，岸上離救生圈多遠以內有站得住的地方才出現提示（點）
  shoreNear: .75,      // 溫特離「不是深水的地方」幾格內，才會出現「收起泳圈」
  speed: 60,           // 划水速度＝平常走路的幾 %（地圖沒設定時用這個）
  image: 'images/Poolcore/Poolcore_swimring.png',
  ringW: 29,           // 救生圈畫多寬（點）：跟角色圖同比例（64 點的角色坐得進去）
  ringDy: 10,          // 救生圈中心在角色位置（y）往下幾點（大約腰的地方）
  cutDy: 13,           // 角色圖畫到角色位置（y）往下幾點為止，再下面（腳）不畫＝藏進救生圈裡（角色圖第 59 列）
  split: .5,           // 救生圈圖上半部＝後半圈（畫在人後面）、下半部＝前半圈（畫在人前面）
  allyDelay: [.6, .8], // 溫特下水後，隊員隔幾秒拿救生圈下水（每個隊員之間也隔這麼久）
  allyWantSecs: .5,    // 隊員多久以內「想走進深水區」才算（js/sentry.js 的 moveSentryWithPath 記下來）
  wantText: '我也想要游泳圈……',   // 沒有游泳圈的隊員在池邊冒的泡泡
  wantSecs: 2.5,       // 泡泡停多久（秒）
  wantGap: 7,          // 同一個隊員多久才再冒一次（秒）
  pickReach: 28,       // 隊員走到離地上的游泳圈多近就撿起來（點）
  lentKey: 'tudrc_swim_ring_lent_v1',   // 隊員手上有幾個游泳圈（重新整理遊戲時還回溫特的背包用）
  paddleSound: 'poolPaddle',
  paddleFade: .3,      // 划水聲淡入淡出幾秒
};

// ---- 深水區的格子：換地圖才重新整理 ----
const deepEmpty = new Set();
let deepCache = { map: null, list: null, cells: new Set() };
// 永遠深水（地圖編輯器「🔒 永遠深水」筆刷，MAP.deepWaterKeep）：一樣是深水區，但抽水不影響，永遠要坐救生圈才過得去（例如救生員台四周）
function deepWaterCells() {
  if (typeof MAP === 'undefined' || !MAP) return deepCache.cells;
  if (deepCache.map !== MAP || deepCache.list !== MAP.deepWater || deepCache.keepList !== MAP.deepWaterKeep) {
    const keep = new Set(Array.isArray(MAP.deepWaterKeep) ? MAP.deepWaterKeep : []);
    deepCache = { map: MAP, list: MAP.deepWater, keepList: MAP.deepWaterKeep, keep, cells: new Set([...(Array.isArray(MAP.deepWater) ? MAP.deepWater : []), ...keep]) };
  }
  if (typeof poolDeepIsDeep === 'function' && !poolDeepIsDeep()) return deepCache.keep;   // 抽水抽成淺水了：一般深水區暫時不算深水，永遠深水照樣是（js/pool-tide.js）
  return deepCache.cells;
}
// 地圖上所有深水區的格子（一般＋永遠深水，不管現在水位）
function deepWaterAllList() { if (typeof MAP === 'undefined' || !MAP) return []; deepWaterCells(); return [...deepCache.cells]; }
const isDeepWaterCell = (c, r) => deepWaterCells().has(c + ',' + r);
// 這個點在不在深水區：有用地圖編輯器「🎯 碰撞微調」移過的深水格（MAP.deepWaterOffsets），照移過去的位置算（跟紅格的微調一樣，最多將近一格）
// 微調過的深水格「本身和周圍 8 格」：只有這些格子要細算，其他格子直接看是不是深水格（結果一樣，但快很多：隊員找路一次要問上千次）
let deepNudgeNear = { offs: null, set: new Set() };
function deepNudgeNearSet(offs) {
  if (deepNudgeNear.offs === offs) return deepNudgeNear.set;
  const set = new Set();
  for (const k in offs) { const [c, r] = k.split(',').map(Number); for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) set.add((c + dc) + ',' + (r + dr)); }
  deepNudgeNear = { offs, set };
  return set;
}
function deepCellsHavePoint(cells, x, y) {
  if (!cells || !cells.size) return false;
  const offs = typeof MAP !== 'undefined' && MAP && MAP.deepWaterOffsets, [c, r] = cellAt(x, y), k = c + ',' + r;
  if (!offs) return cells.has(k);
  if (!deepNudgeNearSet(offs).has(k)) return cells.has(k);   // 附近沒有微調過的深水格
  if (cells.has(k) && !offs[k]) return true;   // 沒微調過的：整格都是
  for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {   // 微調過的：看旁邊移過來的格子有沒有蓋到這個點
    const kk = (c + dc) + ',' + (r + dr), o = offs[kk];
    if (!o || !cells.has(kk)) continue;
    const x0 = OX + (c + dc) * CELL + o[0], y0 = OY + (r + dr) * CELL + o[1];
    if (x >= x0 && x < x0 + CELL && y >= y0 && y < y0 + CELL) return true;
  }
  return false;
}
const deepWaterAtPoint = (x, y) => deepCellsHavePoint(deepWaterCells(), x, y);
// 燃燒彈、照明彈、黏著彈落在深水裡：沒有效果（燒不起來、不會亮、黏膠被水沖散），只濺起水花
// fire＝會燒的子彈（燃燒彈、照明彈）：一碰到水就熄掉，多冒幾團白色水蒸氣
// 回傳 true＝落在水裡了（呼叫的地方就不要再做原本的效果）；在 2 樓（陸橋上）的不算
function shotLandsInWater(x, y, floor, fire) {
  if ((floor || 1) === 2 || !deepWaterAtPoint(x, y)) return false;
  if (typeof poolFallSplash === 'function') poolFallSplash(x, y, false);
  if (fire) for (let i = 0; i < 6; i++) {   // 白色水蒸氣（跟黑煙同一套畫法，shade 調大就變白）
    const L = .9 + Math.random() * .6;
    G.effects.push({ smoke: true, x: x + (Math.random() - .5) * 14, y: y - 4, vx: (Math.random() * 2 - 1) * 10, vy: -(30 + Math.random() * 20),
      r0: 4 + Math.random() * 3, r1: 14 + Math.random() * 8, ph: Math.random() * 6.28, shade: 12 + Math.random(), life: L, life0: L });
  }
  if (typeof sfxAt === 'function') sfxAt('poolWaterDrop', x, y, .7, 'shot-in-water');
  return true;
}
const riding = () => !!(typeof G !== 'undefined' && G && G.player && G.player.swimRing);
// 現在在更新哪個隊員（js/sentry.js 的 updateSentry 設定）：隊員坐救生圈時深水不擋、划水變慢
let swimCurActor = null;
function swimRingWithActor(t, fn) { const prev = swimCurActor; swimCurActor = t; try { return fn(); } finally { swimCurActor = prev; } }
const swimMover = () => swimCurActor || (typeof G !== 'undefined' && G ? G.player : null);
// 隊員的碰撞（js/sentry.js 的 sentryBlocked）：沒坐救生圈的隊員不會下水
function deepWaterBlocksAlly(x, y) { return !(swimCurActor && (swimCurActor.swimRing || swimCurActor.drowning || swimCurActor.poolFall)) && deepWaterAtPoint(x, y); }   // 溺水中的隊友（js/pool-tide.js）可以自己游出來；失足掉進水裡的（js/pool-fall.js）也不擋，不然會一直被推回岸上、看起來在抽搐
// 怪物尋路、建築放置用：這格是深水（不管有沒有人坐救生圈，怪物和建築都不能進去）
function deepWaterBlocksCell(c, r) { return isDeepWaterCell(c, r); }
// 溫特的碰撞（js/game.js 的 playerBlocked）：沒坐救生圈就不能從岸上踩進深水；
// 已經泡在深水裡（水漲回來時人在深水區＝溺水，js/pool-tide.js）就不擋：原地不動、可以自己走回岸上，但走上岸之後就下不去了。
// 坐救生圈時反過來：划不出深水區（停在邊上，要按「收起泳圈」才上岸）。溫特腳下已經不是深水（例如水剛被抽乾）就不擋，讓他可以自動收起
// 擋路用的深水：微調過位置的深水格之間會留下 1～2 像素的縫，縫兩邊（3 像素內）都是深水就當成深水
// （不然坐救生圈划到縫上會被擋住，像撞到看不見的東西）
const deepWaterSolidAt = (x, y) => deepWaterAtPoint(x, y)
  || (deepWaterAtPoint(x - 3, y) && deepWaterAtPoint(x + 3, y)) || (deepWaterAtPoint(x, y - 3) && deepWaterAtPoint(x, y + 3));
function deepWaterBlocksPlayer(x, y) {
  const p = G.player;
  if (!riding()) return deepWaterSolidAt(x, y) && !deepWaterAtPoint(p.x, p.y);
  return deepWaterAtPoint(p.x, p.y) && !deepWaterSolidAt(x, y);
}
// 划水速度（給 js/build.js 的 slowFactorAt）
function swimRingSpeedAt(x, y) {
  const m = swimMover(); if (!m || !m.swimRing || !deepWaterAtPoint(x, y)) return 1;
  const v = Number(MAP && MAP.deepWaterSpeed);
  return Math.max(10, Math.min(100, Number.isFinite(v) && v > 0 ? v : SWIM_RING.speed)) / 100;
}
const swimRingCount = () => typeof supplyInventory !== 'undefined' ? (supplyInventory.get(SWIM_RING.itemId) || 0) : 0;
const hasSwimRing = () => swimRingCount() > 0;

// ---- 岸邊：溫特身體旁邊 reach 點以內有沒有深水；有的話回傳最近那格深水的中心 ----
function deepWaterNearPlayer() { const p = G && G.player; return p && !riding() ? deepWaterNearActor(p) : null; }
function deepWaterNearActor(p) {
  if (!p || p.swimRing || !deepWaterCells().size) return null;
  const onPlatform = typeof poolPlatformStandingAny === 'function' && G && p === G.player && poolPlatformStandingAny();   // 站在救生台上（js/pool-platform.js）：邊緣有碰撞擋著，放寬一點
  const R = PLAYER.r + SWIM_RING.reach + (onPlatform ? POOL_PLATFORM.leaveReach : 0);
  let best = null, bd = Infinity;
  const [c0, r0] = cellAt(p.x, p.y);
  for (let dc = -2; dc <= 2; dc++) for (let dr = -2; dr <= 2; dr++) {
    const c = c0 + dc, r = r0 + dr; if (!isDeepWaterCell(c, r)) continue;
    const x0 = OX + c * CELL, y0 = OY + r * CELL;
    const d = Math.hypot(Math.max(x0 - p.x, 0, p.x - (x0 + CELL)), Math.max(y0 - p.y, 0, p.y - (y0 + CELL)));
    if (d <= R && d < bd) { bd = d; best = { c, r, x: x0 + CELL / 2, y: y0 + CELL / 2 }; }
  }
  return best;
}

// ---- 每次溫特走動之後（js/game.js 的 updatePlayer 呼叫）：撞到深水跳提示、划上岸收起救生圈 ----
function swimRingAfterMove(p, dx, dy) {
  if (!p) return;
  if (p.swimRing) {
    const r = PLAYER.r;
    const inDeep = [[-r, -r], [r, -r], [-r, r], [r, r]].some(([sx, sy]) => deepWaterAtPoint(p.x + sx, p.y + sy));
    if (!inDeep) p.swimRing = false;   // 整個人都不在深水裡了（水被抽乾）：收起救生圈。平常划到邊上會被擋住，要自己按「收起泳圈」
    return;
  }
  if (!(dx || dy) || !deepWaterCells().size || p.drowning) return;   // 溺水中：頭上已經在喊要救生圈（js/pool-tide.js），不再跳這個提示
  const len = Math.hypot(dx, dy), ahead = PLAYER.r + 6;
  if (deepWaterAtPoint(p.x + dx / len * ahead, p.y + dy / len * ahead)) p.swimHintAt = performance.now();   // 往深水走：頭上跳提示
}

// ---- 坐救生圈划到深水區的邊上：岸上離救生圈最近、站得住的地方 { x, y }（js/render.js 畫「收起泳圈」、空白鍵用）----
// 畫面每一幀都會問（畫「收起泳圈」），算一次要好幾毫秒：溫特沒動（同一個 4 像素格）、半秒內就用上次的答案
let swimShoreCache = { key: '', at: 0, spot: null };
function swimRingShoreSpot() {
  const p = typeof G !== 'undefined' && G && G.player;
  const key = p ? Math.round(p.x / 4) + ',' + Math.round(p.y / 4) + (p.swimRing ? 'r' : '') : '', now = performance.now();
  if (key === swimShoreCache.key && now - swimShoreCache.at < 500) return swimShoreCache.spot ? { ...swimShoreCache.spot } : null;
  const spot = swimRingShoreSpotNow();
  swimShoreCache = { key, at: now, spot: spot ? { ...spot } : null };
  return spot;
}
function swimRingShoreSpotNow() {
  const p = typeof G !== 'undefined' && G && G.player;
  if (!p || !p.swimRing || p.hp <= 0 || !deepWaterAtPoint(p.x, p.y)) return null;
  // 旁邊就是電燈開關（電源、抽水閥）：讓給開關，不然「收起泳圈」會蓋掉開關、按空白鍵也只會上岸（js/storage-lockers.js）
  // 想上岸：離開關遠一點就會再出現「收起泳圈」
  if (typeof storagePropNearPlayer === 'function' && storagePropNearPlayer(prop => prop.kind === 'power')) return null;
  // 先看溫特離「不是深水的地方」夠不夠近（SWIM_RING.shoreNear 格內），太遠就不出現提示
  const near = SWIM_RING.shoreNear * CELL;
  let close = false;
  for (let d = 2; d <= near && !close; d += 2)
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; if (!deepWaterAtPoint(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d)) { close = true; break; } }
  if (!close) return null;
  const r = PLAYER.r; let best = null;
  p.swimRing = false;   // 先當作收起救生圈，看岸上那個點站不站得住
  try {
    for (let d = 2 * r - 2; d <= 2 * r + SWIM_RING.shoreReach && !best; d += 4) {
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2, x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d;
        if (deepWaterAtPoint(x, y) || playerBlocked(x, y)) continue;
        if (swimRingTinyIsland(x, y)) continue;   // 四周一下子就碰到深水的小空格（多半是深水區漏畫的格子）：不算岸邊
        if (typeof edgeWallCrossed === 'function' && edgeWallCrossed(p.x, p.y, x, y, r)) continue;   // 中間隔著邊緣碰撞（薄牆）
        if (swimRingWallBetween(p.x, p.y, x, y)) continue;   // 中間隔著牆（泳池上下的牆另一邊是走廊）：不能穿牆上岸，只能從沒有牆的岸邊（左右的階梯）上去
        if (swimRingPocket(x, y)) continue;   // 牆上的小凹槽（例如「只是圖片」的門的門洞）：上去了也走不到別的地方，不算岸邊
        best = { x, y }; break;
      }
    }
  } finally { p.swimRing = true; }
  return best;
}
// 這個岸上的點是不是牆上的小凹槽：從這裡往外一步一步擴散（每步 6 像素，深水、牆都走不過去），
// 擴散不到 SWIM_POCKET_MIN 步就走完了＝小凹槽（真正的岸邊、階梯會連到一大片陸地）
const SWIM_POCKET_MIN = 60;
function swimRingPocket(x, y) {
  const S = 6, seen = new Set(['0,0']), q = [[0, 0]];   // q＝走得到的點
  for (let h = 0; h < q.length; h++) {
    if (q.length >= SWIM_POCKET_MIN) return false;
    const [i, j] = q[h];
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di, nj = j + dj, k = ni + ',' + nj; if (seen.has(k)) continue;
      seen.add(k);
      const px = x + ni * S, py = y + nj * S;
      if (playerBlocked(px, py) || deepWaterAtPoint(px, py)) continue;
      q.push([ni, nj]);
    }
  }
  return true;
}
// 從救生圈到岸上那個點，中間有沒有牆（每 4 像素看一次「不可穿透」：紅格、微調後的紅格、橘框）
function swimRingWallBetween(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / 4));
  for (let i = 1; i < n; i++) { const t = i / n; if (solidBlocksPoint(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return true; }
  return false;
}
// 這個不是深水的點，往上下左右各走不到 2 格就又碰到深水：是被深水圍住的小空格（例如地圖編輯器漏畫了一格深水），不當作岸邊
function swimRingTinyIsland(x, y) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => { for (let s = 4; s <= 2 * CELL; s += 4) if (deepWaterAtPoint(x + dx * s, y + dy * s)) return true; return false; });
}
// 空白鍵：收起救生圈、站到岸上（js/game.js 的互動鍵）
function useSwimRingShore() {
  const spot = swimRingShoreSpot(); if (!spot) return false;
  const p = G.player;
  p.swimRing = false; p.x = spot.x; p.y = spot.y; p.moving = false;
  return true;
}

// ---- 空白鍵：在岸邊 → 坐上救生圈下水（js/game.js 的互動鍵）----
function useSwimRingNearPlayer() {
  const p = G && G.player; if (!p || p.sitting) return false;
  if (p.drowning) {   // 溺水中（js/pool-tide.js；失足掉進水裡也是，js/pool-fall.js）：原地坐上救生圈，位置不變
    if (!hasSwimRing()) { sfx('error'); systemNotice(SWIM_RING.noRingText, true); return true; }
    if (typeof poolFallRingLocked === 'function' && poolFallRingLocked(p)) { sfx('error'); systemNotice('太慌張了，戴不上泳圈！', true); return true; }   // 被魚頭王的水柱噴飛落水：慌張完才能戴（js/pool-fall.js）
    p.swimRing = true; p.drowning = false; p.swimHintAt = 0;
    if (typeof poolFallEnd === 'function') poolFallEnd(p);
    swimAllyNextAt = performance.now() + swimAllyDelay();
    return true;
  }
  if (p.poolFall) return false;   // 正在失足（搖晃、掉下去）
  const spot = deepWaterNearPlayer(); if (!spot) return false;
  if (!hasSwimRing()) { sfx('error'); systemNotice(SWIM_RING.noRingText, true); return true; }
  const keepX = p.x, keepY = p.y;
  p.swimRing = true; p.swimHintAt = 0;
  // 下水：移到最近那格深水的中間；那裡被擋住（例如救生台四周畫了邊緣碰撞，線剛好穿過那格深水），就試那格的其他位置、再試旁邊的深水格
  const spots = deepWaterSpotsNear(p, spot);
  // 落點要站得住、而且往四個方向都能動一點（不能剛好跨在邊緣碰撞的線上，不然下水後會卡住）
  const roomy = (x, y) => !playerBlocked(x, y) && [[5, 0], [-5, 0], [0, 5], [0, -5]].every(([dx, dy]) => !playerBlocked(x + dx, y + dy));
  const ok = spots.find(([x, y]) => { p.x = x; p.y = y; return roomy(x, y); }) || spots.find(([x, y]) => { p.x = x; p.y = y; return !playerBlocked(x, y); });
  if (!ok) { p.x = keepX; p.y = keepY; p.swimRing = false; sfx('error'); return true; }   // 全部被別的東西擋住：下不去
  // 坐進救生圈不播音效（原本借用的「水把火澆熄」被換成火熄滅的聲音，聽起來不對）
  swimAllyNextAt = performance.now() + swimAllyDelay();   // 隊員過一下子再跟著下水
  return true;
}

// 下水可以落在哪些點：最近那格深水（spot）優先，再來是旁邊一格以內的深水格；每格試中間和往四周偏一點的位置。回傳 [[x, y], …]（近的在前）
function deepWaterSpotsNear(p, spot) {
  const out = [[spot.x, spot.y]], R = PLAYER.r + SWIM_RING.reach + CELL, [c0, r0] = cellAt(p.x, p.y), cells = [];
  for (let dc = -2; dc <= 2; dc++) for (let dr = -2; dr <= 2; dr++) {
    const c = c0 + dc, r = r0 + dr; if (!isDeepWaterCell(c, r)) continue;
    const x0 = OX + c * CELL, y0 = OY + r * CELL;
    const d = Math.hypot(Math.max(x0 - p.x, 0, p.x - (x0 + CELL)), Math.max(y0 - p.y, 0, p.y - (y0 + CELL)));
    if (d <= R) cells.push({ d, x: x0 + CELL / 2, y: y0 + CELL / 2 });
  }
  cells.sort((a, b) => a.d - b.d);
  for (const k of cells) for (const [dx, dy] of [[0, 0], [-10, 0], [10, 0], [0, -10], [0, 10], [-19, 0], [19, 0], [0, -19], [0, 19]]) out.push([k.x + dx, k.y + dy]);
  return out;
}

// ---- 隊員拿救生圈下水 ----
let swimAllyNextAt = Infinity;
const swimAllyDelay = () => (SWIM_RING.allyDelay[0] + Math.random() * (SWIM_RING.allyDelay[1] - SWIM_RING.allyDelay[0])) * 1000;
// 隊員想走去的地方是深水（跟著溫特、追怪、指派位置…；js/sentry.js 的 moveSentryWithPath 呼叫）：
// 記下時間（溫特在水裡時會拿救生圈下水），並改成走到離那裡最近、走得到的岸邊（不然找不到路會站著不動）。回傳 [x, y]，不用改就回傳 null
function swimRingShoreGoal(t, tx, ty, dark) {
  if (!t || t.swimRing || !deepWaterCells().size || !deepWaterAtPoint(tx, ty)) return null;
  t.swimWantAt = performance.now();
  const [c, r] = cellAt(tx, ty);
  for (let radius = 1; radius <= 16; radius++) {
    let best = null, bd = Infinity;
    for (let dc = -radius; dc <= radius; dc++) for (let dr = -radius; dr <= radius; dr++) {
      if (Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue;
      const nc = c + dc, nr = r + dr; if (!sentryCellWalkable(nc, nr, false, dark)) continue;
      const [x, y] = center(nc, nr), d = Math.hypot(x - tx, y - ty) + Math.hypot(x - t.x, y - t.y) * .25;   // 離目的地近的優先，同樣近就挑離自己近的
      if (d < bd) { bd = d; best = [x, y]; }
    }
    if (best) return best;
  }
  return null;
}
// 每一幀（js/sentry.js 的 updateSentry 呼叫，同一幀只做一次）：時間到了就挑一個有游泳圈的隊員下水；沒有游泳圈的在池邊冒泡泡
let swimAllyTickAt = -1;
function swimRingAllyTick() {
  const now = performance.now(); if (now === swimAllyTickAt) return; swimAllyTickAt = now;
  swimRingLentSync();
  if (!riding()) { swimAllyNextAt = Infinity; return; }   // 溫特不在水裡：隊員不會自己下水
  const p = G.player; let best = null, bd = Infinity;
  for (const t of G.towers || []) {
    if (t.swimRing || t.hp <= 0 || t.sitting || t.eatenBy || t.mrtRide || !(now - (t.swimWantAt || -1e9) <= SWIM_RING.allyWantSecs * 1000)) continue;
    const spot = deepWaterNearActor(t); if (!spot) continue;   // 還沒走到岸邊
    if (!t.ownRing) { swimRingWantBubble(t, now); continue; }   // 沒有自己的游泳圈：留在岸上，冒泡泡
    const d = Math.hypot(t.x - p.x, t.y - p.y);
    if (d < bd) { bd = d; best = { t, spot }; }
  }
  if (!best || now < swimAllyNextAt) return;   // 現在沒有人要下水，或還沒輪到下一個
  const { t, spot } = best, keepX = t.x, keepY = t.y;
  t.swimRing = true; t.x = spot.x; t.y = spot.y; t.navPath = null; t.navGoal = null;
  if (swimRingWithActor(t, () => sentryBlocked(t.x, t.y))) { t.x = keepX; t.y = keepY; t.swimRing = false; return; }   // 那裡被擋住：下不去
  t.gunT = 0; t.meleeSwing = null; t.gunSwing = null;
  // 隊員坐進救生圈也不播音效
  swimAllyNextAt = now + swimAllyDelay();
}
// 沒有游泳圈的隊員走到池邊：頭上冒「想要游泳圈」的泡泡（隔 wantGap 秒才再冒，正在說別的話就不打斷）
function swimRingWantBubble(t, now) {
  if (t.say || now < (t.ringWantAt || 0)) return;
  t.say = { text: SWIM_RING.wantText, life: SWIM_RING.wantSecs };
  t.ringWantAt = now + SWIM_RING.wantGap * 1000;
}

// ---- 地上的游泳圈：離它最近、還沒有游泳圈的隊員去撿（js/sentry.js 的 updateSentryMain 呼叫；回傳 true＝這一幀在走去撿）----
const swimRingCanPick = t => !t.ownRing && !t.swimRing && t.hp > 0 && !t.berserk && !t.sitting && !t.eatenBy && !t.mrtRide && !t.grabbed && !(performance.now() < (t.ringSkipUntil || 0));
let swimPickPlan = { at: -1, who: new Map() };   // 這一幀誰去撿哪一堆（同一幀只算一次）
function swimRingPickPlan() {
  const now = performance.now(); if (swimPickPlan.at === now) return swimPickPlan.who;
  const who = new Map(), rings = (G.groundItems || []).filter(g => g.id === SWIM_RING.itemId && g.qty > 0 && !(typeof poolItemFloating === 'function' && poolItemFloating(g)));   // 漂在深水裡的游泳圈：隊員走不過去，不去撿
  const free = (G.towers || []).filter(swimRingCanPick);
  for (const g of rings) {   // 一堆有幾個，就分給離它最近的幾個人
    const near = free.filter(t => !who.has(t)).sort((a, b) => Math.hypot(a.x - g.x, a.y - g.y) - Math.hypot(b.x - g.x, b.y - g.y));
    for (const t of near.slice(0, g.qty)) who.set(t, g);
  }
  swimPickPlan = { at: now, who };
  return who;
}
function swimRingGroundStep(t, dt) {
  if (!G.groundItems || !G.groundItems.length || !swimRingCanPick(t)) return false;
  const g = swimRingPickPlan().get(t); if (!g) return false;
  const take = () => {   // 撿起來
    removeGroundItem(g, 1); t.ownRing = true; t.navPath = null;
    if (typeof sentryStatus === 'function') sentryStatus(t, '撿起游泳圈', '#9ff0c0');
    if (typeof sfxAt === 'function') sfxAt('pop', g.x, g.y, .5, 'ring-pick');
    swimRingSaveLent(); swimPickPlan.at = -1;
    if (typeof renderFieldSquadHud === 'function') renderFieldSquadHud();
  };
  if (Math.hypot(g.x - t.x, g.y - t.y) <= SWIM_RING.pickReach) { take(); return false; }
  t.followDark = true;
  if (moveSentryWithPath(t, g.x, g.y, (TYPES[t.type].walkSpeed || 80) * 1.3, dt)) { take(); return true; }   // 走到了（游泳圈在溫特腳邊時，會停在旁邊一點點）
  if (t.navFailed) { t.navFailed = false; t.ringSkipUntil = performance.now() + 3000; swimPickPlan.at = -1; return false; }   // 走不到：讓給別人，3 秒後再試
  t.target = null;
  return true;
}

// ---- 隊員手上的游泳圈：回到基地、隊員離隊、重新整理遊戲時，還回溫特的背包 ----
let swimLentHolders = [], swimLentLoaded = false;
function swimRingSaveLent() {
  swimLentHolders = ((G && G.towers) || []).filter(t => t.ownRing);
  try { if (swimLentHolders.length) localStorage.setItem(SWIM_RING.lentKey, String(swimLentHolders.length)); else localStorage.removeItem(SWIM_RING.lentKey); } catch (_) {}
}
function swimRingGiveBack(n) {
  if (!(n > 0) || typeof supplyInventory === 'undefined') return;
  supplyInventory.set(SWIM_RING.itemId, (supplyInventory.get(SWIM_RING.itemId) || 0) + n);
  if (typeof saveGame === 'function') saveGame();
}
function swimRingLentSync() {
  if (!swimLentLoaded) {   // 剛打開遊戲：上次隊員手上的游泳圈還回來
    swimLentLoaded = true;
    let n = 0; try { n = +localStorage.getItem(SWIM_RING.lentKey) || 0; localStorage.removeItem(SWIM_RING.lentKey); } catch (_) {}
    swimRingGiveBack(n);
  }
  if (!swimLentHolders.length) return;
  if (typeof MAP_SAFE !== 'undefined' && MAP_SAFE) {   // 回到基地＝出勤結束：全部還回來
    for (const t of swimLentHolders) t.ownRing = false;
    swimRingGiveBack(swimLentHolders.length); swimRingSaveLent();
    if (typeof renderFieldSquadHud === 'function') renderFieldSquadHud();
    return;
  }
  const gone = swimLentHolders.filter(t => !((G && G.towers) || []).includes(t));   // 隊員離隊（不在場上了）：他的還回來
  if (gone.length) { for (const t of gone) t.ownRing = false; swimRingGiveBack(gone.length); swimRingSaveLent(); }
}

// 隊員更新完（js/sentry.js 的 updateSentry）：整個人都划出深水區就收起救生圈
function swimRingAllyAfterMove(t) {
  if (!t || !t.swimRing) return;
  const r = 12;
  if (![[-r, -r], [r, -r], [-r, r], [r, r]].some(([sx, sy]) => deepWaterAtPoint(t.x + sx, t.y + sy))) t.swimRing = false;
}

// ---- 畫面 ----
// 溫特頭上的提示泡泡（js/render.js 的 drawInteractionPrompts 呼叫）
function drawSwimRingHint() {
  const p = G && G.player; if (!p || riding() || !p.swimHintAt || p.poolFall) return;
  if (hasSwimRing()) return;   // 身上有泳圈：腳下改成「進入水中」（swimRingEnterSpot）
  if (performance.now() - p.swimHintAt > SWIM_RING.hintSecs * 1000) return;
  if (!deepWaterNearPlayer()) return;   // 走開了就不顯示
  if (typeof queueTowerBubble === 'function') queueTowerBubble(p, p.x, p.y - 50, SWIM_RING.hintText);
}
// 身上有泳圈、站在深水區岸邊：「進入水中」的提示畫在哪（js/render.js 的互動提示）；不顯示＝null
function swimRingEnterSpot() {
  const p = G && G.player;
  if (!p || riding() || p.drowning || p.poolFall || p.sitting || p.hp <= 0 || !hasSwimRing()) return null;
  return deepWaterNearPlayer() ? { x: p.x, y: p.y - 34 } : null;
}
// 坐進救生圈（js/water.js 的 drawWaded 呼叫；溫特、隊員都一樣）：
// 救生圈後半圈 → 角色原本的圖（腳裁掉，划水時用走路圖，手照樣擺）→ 救生圈前半圈。整組一起在水上輕輕晃
const swimRingImg = new Image(); swimRingImg.src = SWIM_RING.image;
function drawSwimRinged(a, drawFn) {
  if (!swimRingImg.complete || !swimRingImg.naturalWidth) { drawFn(); return; }
  const iw = swimRingImg.naturalWidth, ih = swimRingImg.naturalHeight, w = SWIM_RING.ringW, h = w * ih / iw, k = SWIM_RING.split;
  const bob = Math.sin(performance.now() / 420 + (a.x + a.y) * .05) * 1.2;   // 每個人晃的節奏錯開一點
  const x = a.x - w / 2, y = a.y + SWIM_RING.ringDy - h / 2 + bob;
  const ring = (front) => {
    ctx.save(); ctx.imageSmoothingEnabled = false;
    if (front) ctx.drawImage(swimRingImg, 0, ih * k, iw, ih * (1 - k), x, y + h * k, w, h * (1 - k));
    else ctx.drawImage(swimRingImg, 0, 0, iw, ih * k, x, y, w, h * k);
    ctx.restore();
  };
  ring(false);
  ctx.save();
  ctx.translate(0, bob);
  ctx.beginPath(); ctx.rect(a.x - 400, a.y - 2000, 800, 2000 + SWIM_RING.cutDy); ctx.clip();   // 腳不畫
  drawFn();
  ctx.restore();
  ring(true);
}

// ---- 划水聲：坐在救生圈上移動時循環播放 ----
(() => {
  if (typeof document === 'undefined') return;
  let unlocked = false, audio = null, audioFile = null;
  ['pointerdown', 'keydown'].forEach(n => window.addEventListener(n, () => { unlocked = true; }, true));
  const fileOf = name => { const it = typeof SFX !== 'undefined' && SFX.list().find(x => x.name === name); return it && typeof it.file === 'string' ? it.file : null; };
  setInterval(() => {
    if (!unlocked || typeof SFX === 'undefined') return;
    const p = typeof G !== 'undefined' && G && G.player;
    const live = !!(p && G.running && !G.over);
    // 多大聲：坐救生圈在動＝1；有人掉進水裡掙扎＝看離多遠（js/pool-fall.js 的 poolStruggleSoundGain），兩個取大的
    const mul = !live ? 0 : Math.max(p.swimRing && p.moving ? 1 : 0, typeof poolStruggleSoundGain === 'function' ? poolStruggleSoundGain() : 0);
    const file = fileOf(SWIM_RING.paddleSound);
    const want = mul > 0 && file && SFX.enabled ? Math.min(1, SFX.volume * (SFX.gainOf(SWIM_RING.paddleSound) ?? 1) * mul) : 0;
    if (file && want > 0 && (!audio || audioFile !== file)) {
      if (audio) audio.pause();
      audio = new Audio('Sound effects/' + file); audio.loop = true; audio.volume = 0; audioFile = file;
    }
    if (!audio) return;
    const step = .1 / SWIM_RING.paddleFade * Math.max(want, audio.volume, .05);
    audio.volume = Math.max(0, Math.min(1, audio.volume + Math.max(-step, Math.min(step, want - audio.volume))));
    if (want > 0 && audio.paused) audio.play().catch(() => {});
    else if (want <= 0 && audio.volume <= 0 && !audio.paused) audio.pause();   // 停下來就停，下次接著播
  }, 100);
})();

// 救生圈外面的一圈水波紋（js/water.js 的 drawWaded 呼叫；跟泡在水裡的波紋同一套，走動時往外擴散）
function swimRingRippleInfo(a) {
  return { w: { depth: 0, see: 1 }, bottom: a.y + SWIM_RING.ringDy + 2, height: 1, width: SWIM_RING.ringW * 1.35 };
}

// ---- 爬梯子：坐救生圈划到梯子底下（梯子下端泡在深水裡）→ 出現「爬梯子」，按空白鍵（或 Enter）收起救生圈、爬到梯子上面 ----
// 梯子＝地圖上的 poolcore_ladder 素材（例如救生員台的梯子）；爬上去的位置＝梯子上端附近、不是深水、站得住的地方
const LADDER = { file: /\/poolcore_ladder\.png$/i, reach: CELL * .5, prompt: '爬梯子' };   // reach：溫特（中心點）離梯子下端中間幾點內才出現「爬梯子」（11-27 從 1 格改成半格）
let ladderCache = { map: null, n: -1, list: [] };
function ladderSpots() {
  if (typeof MAP === 'undefined' || !MAP) return [];
  const n = (MAP.stamps || []).length;
  if (ladderCache.map === MAP && ladderCache.n === n) return ladderCache.list;
  const list = [];
  for (const s of MAP.stamps || []) {
    const t = mapTileById(s.id); if (!t || !LADDER.file.test(String(t.file || '').replace(/\\/g, '/'))) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL;
    list.push({ s, x: x0 + w / 2, topY: y0, bottomY: y0 + h });
  }
  return (ladderCache = { map: MAP, n, list }).list;
}
// 坐在救生圈上、離某個「下端在深水裡」的梯子底下夠近：回傳那個梯子
function ladderNearPlayer() {
  const p = typeof G !== 'undefined' && G && G.player; if (!p || !p.swimRing || p.hp <= 0) return null;
  let best = null, bd = LADDER.reach;
  for (const l of ladderSpots()) {
    if (!deepWaterAtPoint(l.x, l.bottomY + 4) && !deepWaterAtPoint(l.x, l.bottomY - 8)) continue;   // 梯子下端沒泡在深水裡：不是給救生圈爬的
    const d = Math.hypot(p.x - l.x, p.y - l.bottomY);
    if (d < bd) { bd = d; best = l; }
  }
  return best;
}
// 按空白鍵：收起救生圈，爬到梯子上面（js/game.js 的互動鍵）
function useLadderNearPlayer() {
  const l = ladderNearPlayer(); if (!l) return false;
  const p = G.player, keep = [p.x, p.y];
  p.swimRing = false;
  // 從梯子上端往下找第一個站得住、又不是深水的位置（梯子上端通常就是平台）
  for (let y = l.topY + 6; y <= l.bottomY; y += 6) for (const dx of [0, -12, 12, -24, 24]) {
    const x = l.x + dx;
    if (deepWaterAtPoint(x, y) || deepWaterAtPoint(x, y + 14) || playerBlocked(x, y)) continue;
    p.x = x; p.y = y; p.moving = false; p.dir = 'back';
    // 收起救生圈不播音效（原本借用的「水把火澆熄」被換成火熄滅的聲音，聽起來不對）
    if (typeof flash === 'function') flash('爬上去了', p.x, p.y - 50, '#bfe8ff');
    return true;
  }
  p.swimRing = true; p.x = keep[0]; p.y = keep[1];   // 上面沒有站得住的地方：爬不上去
  if (typeof sfx === 'function') sfx('error');
  return true;
}
