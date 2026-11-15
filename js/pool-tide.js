/* ===== 池核的抽水機、漲潮、抽水閥、溺水 =====
   流程（有畫 🛟 深水區的地圖才有，例如池核）：
   ① 一開始：淺水區有水、深水區是深水（要坐救生圈才能進去）
   ② 抽水機（地圖上的發電機 dynamo）全部打開 → 1.5 秒抽乾：淺水區變成地面（之後永遠沒水）、深水區變成淺水，大家都能走
      坐救生圈的人自動收起救生圈。抽水機打開後就關不掉（按了沒效果）
   ③ 第一次抽乾後過 3 分鐘：水漲回來（2 秒），深水區又變回深水
   ④ 水漲起來時：打開「抽水閥」（地圖編輯器選電源開關 → 勾「抽水閥」）→ 1.5 秒抽乾深水區；之後每 50 秒漲一次
   ⑤ 水漲起來時還在深水區的隊友（沒坐救生圈）會溺水：每秒扣 1 HP，畫面上方中間跳「快打開抽水閥！」
      深水區裡沒有隊友：溫特頭上冒泡泡「一定有開關可以把這些水抽走。」
   畫面怎麼跟著變：圖層名稱裡寫這些字（地圖編輯器圖層列的「改名」），那層就照水位淡入淡出
     「抽水後消失」：淺水區的水（抽水機打開後消失）　「抽水後出現」：淺水區抽乾後的地面
     「深水時顯現」：深水區是深水時的樣子　　　　　　「淺水時顯現」：深水區抽成淺水時的樣子
     看不到的圖層：裡面勾了「這是水」的素材也不算水（js/water.js） */
const POOL_TIDE = {
  firstHoldSecs: 180,   // 第一次抽乾後，過幾秒水才漲回來
  holdSecs: 50,         // 之後每次抽乾後，過幾秒水又漲回來
  riseSecs: 2,          // 水漲起來要幾秒
  drainSecs: 1.5,       // 抽乾要幾秒
  drownDps: 1,          // 溺水每秒扣幾 HP
  drownTalkSecs: [6, 10],   // 溺水的隊友每隔幾秒喊一句（data/dialogues.js 的 drown）
  warnText: '快打開抽水閥！',
  winterText: '一定有開關可以把這些水抽走。',
  winterSecs: 3.5,      // 溫特的泡泡停多久
  pumpedText: '抽水機已經在運轉了。',   // 抽水機打開後再按
  valveNoPowerText: '沒有什麼反應……',   // 兩台抽水機（發電機）還沒都啟動時按抽水閥
  valveLowText: '水已經抽掉了。',
  marks: { shallowGone: '抽水後消失', shallowDry: '抽水後出現', deep: '深水時顯現', deepShallow: '淺水時顯現' },
};

// ---- 狀態（每一局重來；存在 G 裡，換地圖、重開都會重設）----
// pumped＝抽水機打開過；deep＝深水區現在的水位（1＝深水、0＝淺水）；shallow＝淺水區的水（1＝有水、0＝乾了）
function poolTide() {
  if (typeof G === 'undefined' || !G) return null;
  if (!G.poolTide || G.poolTide.map !== MAP) G.poolTide = { map: MAP, t: 0, pumped: false, deep: 1, shallow: 1, phase: 'full', riseAt: Infinity, winterUntil: 0, warn: false };
  return G.poolTide;
}
const poolTideActive = () => typeof MAP !== 'undefined' && MAP && Array.isArray(MAP.deepWater) && MAP.deepWater.length > 0;
// 深水區現在是不是深水（js/swim-ring.js 的深水判定問這個：不是深水＝不擋路、不用救生圈）
function poolDeepIsDeep() { const s = poolTideActive() ? poolTide() : null; return !s || s.deep >= .5; }

// ---- 圖層照水位顯示 ----
let poolMarkCache = { list: null, map: new Map() };
function poolLayerMark(lid) {
  const list = typeof MAP !== 'undefined' && MAP && Array.isArray(MAP.layerOrder) ? MAP.layerOrder : null;
  if (poolMarkCache.list !== list) {
    const map = new Map(), M = POOL_TIDE.marks;
    for (const l of list || []) {
      const n = String(l.name || '');
      const mark = n.includes(M.shallowGone) ? 'shallowGone' : n.includes(M.shallowDry) ? 'shallowDry' : n.includes(M.deepShallow) ? 'deepShallow' : n.includes(M.deep) ? 'deep' : '';
      if (mark) map.set(l.id, mark);
    }
    poolMarkCache = { list, map };
  }
  return poolMarkCache.map.get(lid) || '';
}
// 這個圖層現在多不透明（0～1）；沒有標記的圖層＝1（js/maploader.js 畫地圖時問）
function poolLayerAlpha(lid) {
  const mark = poolLayerMark(lid || 'top'); if (!mark) return 1;
  const s = poolTideActive() ? poolTide() : null;
  const deep = s ? s.deep : 1, shallow = s ? s.shallow : 1;
  return mark === 'shallowGone' ? shallow : mark === 'shallowDry' ? 1 - shallow : mark === 'deep' ? deep : 1 - deep;
}

// ---- 抽水機（js/storage-lockers.js 的發電機開關呼叫）----
// 回傳 true＝已經抽過水了，這次按了沒效果
function poolPumpLocked() { return poolTideActive() && poolTide().pumped; }
function poolPumpCheck() {
  if (!poolTideActive() || typeof dynamosAllOn !== 'function' || !dynamosAllOn()) return;
  const s = poolTide(); if (s.pumped) return;
  s.pumped = true; s.phase = 'draining'; s.firstDrain = true;
  if (typeof systemNotice === 'function') systemNotice('抽水機啟動了，水正在退去……');
}
// ---- 抽水閥（地圖編輯器勾了「抽水閥」的電源開關）----
function usePoolValve() {
  const s = poolTideActive() ? poolTide() : null;
  if (!s || !s.pumped) { sfx('error'); systemNotice(POOL_TIDE.valveNoPowerText, true); return; }
  if (s.phase !== 'high' && s.phase !== 'rising') { sfx('switch'); systemNotice(POOL_TIDE.valveLowText); return; }
  s.phase = 'draining'; s.firstDrain = false; sfx('powerOn');
}
// 抽水閥的開關圖：水抽掉的時候是「開」，漲起來是「關」
const poolValveShowsOn = () => { const s = poolTideActive() ? poolTide() : null; return !!(s && s.pumped && s.deep < .5); };

// ---- 每一幀（js/game.js 的 update 呼叫）----
let poolDeepWas = true;
function updatePoolTide(dt) {
  if (!poolTideActive()) { poolWarnShow(false); return; }
  if (typeof updatePoolBoss === 'function') updatePoolBoss(dt);   // 池核 BOSS：游泳、潛水、擱淺（js/pool-boss.js）
  const s = poolTide(); s.t += dt;
  if (s.phase === 'draining') {
    const k = dt / POOL_TIDE.drainSecs;
    s.deep = Math.max(0, s.deep - k); s.shallow = Math.max(0, s.shallow - k);
    if (s.deep <= 0 && s.shallow <= 0) { s.phase = 'low'; s.riseAt = s.t + (s.firstDrain ? POOL_TIDE.firstHoldSecs : POOL_TIDE.holdSecs); }
  } else if (s.phase === 'low' && s.t >= s.riseAt) {
    s.phase = 'rising';
    const mates = poolMatesInDeep();
    if (!mates.length) s.winterUntil = performance.now() + POOL_TIDE.winterSecs * 1000;   // 深水區沒有隊友：溫特自言自語
  } else if (s.phase === 'rising') {
    s.deep = Math.min(1, s.deep + dt / POOL_TIDE.riseSecs);
    if (s.deep >= 1) s.phase = 'high';
  }
  // 深水 ↔ 淺水 換過去的那一刻：坐救生圈的人收起來、怪物重新找路
  const deepNow = s.deep >= .5;
  if (deepNow !== poolDeepWas) {
    poolDeepWas = deepNow;
    if (!deepNow) { if (G.player) G.player.swimRing = false; for (const t of G.towers || []) t.swimRing = false; }
    if (typeof computeFlow === 'function') computeFlow();
  }
  // 溺水：深水時，還在深水區、沒坐救生圈的隊友每秒扣血
  const drowning = deepNow && s.pumped ? poolMatesInDeep() : [];
  for (const t of G.towers || []) t.drowning = drowning.includes(t);
  for (const t of drowning) {
    t.hp = Math.max(0, t.hp - POOL_TIDE.drownDps * dt);
    t.hitT = Math.max(t.hitT || 0, .12); t.hitColor = '#6fb7ff';
    if ((t.drownTalkT = (t.drownTalkT ?? 0) - dt) <= 0) {
      const [a, b] = POOL_TIDE.drownTalkSecs; t.drownTalkT = a + Math.random() * (b - a);
      const line = typeof pickDialogueLine === 'function' ? pickDialogueLine(t.type, 'drown') : null;
      if (line && !t.berserk) t.say = { text: line, life: 2.6 };
    }
    if (t.hp <= 0) { t.target = null; if (typeof sentryStatus === 'function') sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  }
  poolWarnShow(drowning.length > 0 && G.running && !G.over);
}
// 在深水區裡、沒坐救生圈、還站得起來的隊友
function poolMatesInDeep() {
  if (typeof deepWaterAtPoint !== 'function') return [];
  return (G.towers || []).filter(t => t.hp > 0 && !t.swimRing && !t.eatenBy && !t.mrtRide && poolPointInDeepZone(t.x, t.y));
}
// 不管現在水位，這個點在不在畫好的深水區範圍裡
function poolPointInDeepZone(x, y) {
  const list = MAP && MAP.deepWater; if (!Array.isArray(list) || !list.length) return false;
  if (poolZoneCache.list !== list) poolZoneCache = { list, set: new Set(list) };
  return typeof deepCellsHavePoint === 'function' ? deepCellsHavePoint(poolZoneCache.set, x, y) : poolZoneCache.set.has(cellAt(x, y).join(','));   // 有微調過的深水格照微調後的位置（js/swim-ring.js）
}
let poolZoneCache = { list: null, set: null };

// ---- 畫面：溫特頭上的泡泡（js/render.js 的 drawInteractionPrompts 呼叫）----
function drawPoolTideBubble() {
  const s = poolTideActive() ? poolTide() : null, p = G && G.player;
  if (!s || !p || performance.now() > s.winterUntil) return;
  if (typeof queueTowerBubble === 'function') queueTowerBubble(p, p.x, p.y - 50, POOL_TIDE.winterText);
}
// 畫面上方中間的警告「快打開抽水閥！」（蓋在遊戲畫面上的一行字，跟著畫面位置走）
let poolWarnEl = null;
function poolWarnShow(on) {
  if (!on) { if (poolWarnEl) poolWarnEl.style.display = 'none'; return; }
  if (!poolWarnEl) {
    poolWarnEl = document.createElement('div');
    poolWarnEl.textContent = POOL_TIDE.warnText;
    poolWarnEl.style.cssText = 'position:fixed;z-index:50;transform:translateX(-50%);padding:6px 18px;border-radius:8px;font:bold 20px sans-serif;letter-spacing:2px;'
      + 'color:#fff;background:rgba(150,20,30,.82);border:2px solid #ff8a8a;box-shadow:0 0 18px rgba(255,60,60,.55);pointer-events:none;animation:poolWarnBlink 1s ease-in-out infinite';
    const st = document.createElement('style'); st.textContent = '@keyframes poolWarnBlink{0%,100%{opacity:1}50%{opacity:.55}}'; document.head.appendChild(st);
    document.body.appendChild(poolWarnEl);
  }
  const cv = document.getElementById('cv'), r = cv ? cv.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth };
  poolWarnEl.style.left = (r.left + r.width / 2) + 'px'; poolWarnEl.style.top = (r.top + r.height * .26) + 'px';   // 在 BOSS 血條下面
  poolWarnEl.style.display = 'block';
}

// ---- 溺水的隊友往岸上逃（js/sentry.js 的 updateSentryMain 呼叫；回傳 true＝這一幀由這裡移動，隊員不攻擊）----
// 用隊員自己走路速度的 POOL_TIDE.drownFleeMul 倍，沿著深水區的格子游到最近的岸邊
POOL_TIDE.drownFleeMul = .3;   // 溺水時逃上岸的速度＝自己走路速度的幾倍
function poolDrownFlee(t, dt) {
  if (!t.drowning) return false;
  const now = performance.now();
  if (!t.drownPath || !t.drownPath.length || now > (t.drownPathAt || 0) + 1000) { t.drownPath = poolShorePath(t); t.drownPathAt = now; }
  t.target = null; t.navPath = null;
  const path = t.drownPath; if (!path || !path.length) { t.moving = false; return true; }
  const [gx, gy] = path[0], dx = gx - t.x, dy = gy - t.y, d = Math.hypot(dx, dy);
  const speed = ((typeof TYPES !== 'undefined' && TYPES[t.type] && TYPES[t.type].walkSpeed) || 80) * POOL_TIDE.drownFleeMul;
  const step = Math.min(d, speed * dt);
  if (d > .5) {
    const nx = t.x + dx / d * step, ny = t.y + dy / d * step;
    t.x = nx; t.y = ny;
    if (Math.abs(dx) > Math.abs(dy)) t.dir = dx < 0 ? 'left' : 'right'; else t.dir = dy < 0 ? 'back' : 'front';
  }
  if (d <= 4) path.shift();
  t.moving = true;
  return true;
}
// 從隊員站的格子，沿著深水區的格子找最近的岸邊（不是深水區、走得到的格子），回傳一路上每格中心
function poolShorePath(t) {
  const [c0, r0] = cellAt(t.x, t.y), seen = new Map([[c0 + ',' + r0, null]]), q = [[c0, r0]];
  const inZone = (c, r) => poolPointInDeepZone(...center(c, r));
  for (let h = 0; h < q.length && h < 4000; h++) {
    const [c, r] = q[h];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
      if (seen.has(k) || !inGrid(nc, nr) || isWall(nc, nr)) continue;
      seen.set(k, c + ',' + r);
      if (!inZone(nc, nr)) {   // 找到岸邊：倒回去組出路線
        const out = []; let cur = k;
        while (cur) { const [cc, rr] = cur.split(',').map(Number); out.unshift(center(cc, rr)); cur = seen.get(cur); }
        out.shift();   // 第一格是自己站的
        return out;
      }
      q.push([nc, nr]);
    }
  }
  return [];
}

// ---- 這個電源開關是不是抽水閥：地圖編輯器勾了「抽水閥」，或放在名稱有「抽水閥」的圖層（取消勾選的＝valve: false，不算）----
function poolIsValve(stamp) {
  if (!stamp) return false;
  if (stamp.valve === true) return true;
  if (stamp.valve === false) return false;
  const list = typeof MAP !== 'undefined' && MAP && Array.isArray(MAP.layerOrder) ? MAP.layerOrder : [];
  const l = list.find(x => x.id === (stamp.layer || 'top'));
  return !!(l && String(l.name || '').includes('抽水閥'));
}
