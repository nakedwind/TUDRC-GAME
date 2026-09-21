/* ===== 哨兵系統 =====
   哨兵是會走動的人：開場佈署、巡邏移動 AI、點擊選單（巡邏/指派/疏導）。
   哨兵數值在 data/balance.js 的 TYPES。
*/
// ---- 開場佈署：三位哨兵在基地（營地）區隨機位置出現 ----
function spawnSentries() {
  const cand = [];
  if (campCells.size) campCells.forEach(k => cand.push(k.split(',').map(Number)));
  else for (let c = 0; c < COLS; c++) cand.push([c, ROWS - 1]);   // 沒自訂營地＝最下排
  const ok = cand.filter(([c, r]) => inGrid(c, r) && !isWall(c, r) && !isEntrance(c, r) && !G.grid[c + ',' + r]);
  const team = (typeof getTeam === 'function') ? getTeam() : Object.keys(TYPES);
  for (const type of team) {
    const spec = TYPES[type]; if (!spec) continue;
    const cell = ok.length ? ok.splice(Math.floor(Math.random() * ok.length), 1)[0] : [Math.floor(COLS / 2), ROWS - 1];
    const [x, y] = center(cell[0], cell[1]);
    G.towers.push({ kind: 'tower', type, x, y, hp: spec.hp, maxhp: spec.hp, cd: 0, taint: 0, berserk: false, mode: 'free', target: null, anchor: null, waitT: 0.4 + Math.random() });
  }
}

// ---- 場景 NPC：從營地附近出生，只在亮處自由走動 ----
function spawnWanderers() {
  if (!MAP_NPCS) return;            // 只有勾了「場景 NPC」的地圖才會有這些人
  const candidates = [], seen = new Set();
  const occupied = new Set(G.towers.map(t => cellAt(t.x, t.y).join(',')));
  const addCell = (c, r) => {
    const key = c + ',' + r;
    if (seen.has(key) || occupied.has(key) || !inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[key]) return;
    seen.add(key); candidates.push([c, r]);
  };

  if (campCells.size) campCells.forEach(key => addCell(...key.split(',').map(Number)));
  else for (let c = 0; c < COLS; c++) addCell(c, ROWS - 1);
  for (let r = ROWS - 1; r >= 0; r--) for (let c = 0; c < COLS; c++) addCell(c, r);

  for (const profile of WANDERERS) {
    const cell = candidates.shift() || [Math.floor(COLS / 2), ROWS - 1];
    const [x, y] = center(cell[0], cell[1]);
    G.npcs.push({
      kind: 'npc', id: profile.id, x, y, target: null,
      waitT: 0.5 + Math.random() * 1.5, dir: 'front', moving: false, anim: 0,
      blinkWait: 2 + Math.random() * 3, blinkTime: -1,
      say: null, sayWait: 2 + Math.random() * 8,   // 平時對話：倒數到 0 冒一句
    });
  }
}

// ---- 哨兵移動 AI（哨兵是「人」：在亮處走動巡邏）----
// 模式：free=自由走動（亮處隨便逛）/ hold=在錨點附近小範圍巡邏 / goto=走去指派位置後轉 hold
function sentryBlocked(x, y) {
  const r = 12;
  for (const [sx, sy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const px = x + sx, py = y + sy;
    const [c, rr] = cellAt(px, py);
    if (!inGrid(c, rr) || G.grid[c + ',' + rr]) return true;
    if (solidBlocksPoint(px, py)) return true;      // 不可穿透（含像素微調）
  }
  return false;
}
// 在 (cx,cy) 周圍找一個「亮的、走得到」的隨機點
function sampleWanderTarget(cx, cy, radius) {
  for (let i = 0; i < 12; i++) {
    const ang = Math.random() * Math.PI * 2, d = 30 + Math.random() * radius;
    const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d;
    const [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
    if (!isLit(x, y)) continue;
    return { x, y };
  }
  return null;
}
function updateSentry(t, dt) {
  rescueStuck(t, sentryBlocked);                      // 被卡在建築裡→自動脫困
  updateNpcTalk(t, dt);                                // 哨兵平時也會冒泡泡說話
  if (t.berserk) { t.target = null; return; }        // 暴走中：站在原地失控
  if (menuSentry === t) return;                       // 選單開著時先站好
  // 光沒了（探照燈被拆等）→ 走向最近的光
  if (LIGHT.enabled && !isLit(t.x, t.y)) {
    let best = null, bd = Infinity;
    for (const l of lightsCache) { const d = Math.hypot(l.x - t.x, l.y - t.y) - l.r; if (d < bd) { bd = d; best = l; } }
    if (best) t.target = { x: best.x, y: best.y };
  }
  // 主動接敵：看到亮處的怪物就靠近攻擊（開火由 game.js 處理；這裡只負責走過去）
  // 追多遠依模式：自由走動＝追得遠、原地巡邏／指派＝只追崗位附近，怪死或跑遠就回去巡邏。
  const litHere = !LIGHT.enabled || isLit(t.x, t.y);
  if (litHere && G.enemies.length) {
    const spec = TYPES[t.type];
    const atkR = spec.range * CELL;                       // 射程（像素）
    const anchor = (t.mode !== 'free' && t.anchor) ? t.anchor : t;
    const leashR = t.mode === 'free' ? 260 : 110;         // 離崗上限：自由＝大、原地＝小
    const detectR = atkR + CELL * 1.5;                    // 比射程略遠就開始靠近
    let foe = null, fd = Infinity;
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (LIGHT.enabled && !isLit(e.x, e.y)) continue;    // 只追亮處看得見的怪
      if (Math.hypot(e.x - anchor.x, e.y - anchor.y) > leashR) continue;  // 不離崗太遠
      const d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d < fd && d <= detectR) { fd = d; foe = e; }
    }
    if (foe) {
      t.target = null; t.waitT = 0;                       // 取消原本的閒逛
      if (fd > atkR - 6) {                                // 還沒進射程→靠過去
        const dx = foe.x - t.x, dy = foe.y - t.y, d = fd || 1;
        const step = (spec.walkSpeed || 80) * 1.25 * dt;  // 追敵略快
        const nx = t.x + dx / d * step, ny = t.y + dy / d * step;
        if (!LIGHT.enabled || isLit(nx, ny)) {            // 不追進黑暗
          if (!sentryBlocked(nx, t.y)) t.x = nx;
          if (!sentryBlocked(t.x, ny)) t.y = ny;
        }
      }
      return;                                             // 接敵中：不進入閒逛邏輯
    }
  }
  // 阿瓦倫（哨兵）在「自由走動」模式時緊跟著艾德林（沒敵人可打時）
  if (t.type === 'avaren' && t.mode === 'free' && typeof FOLLOW !== 'undefined') {
    const eldrin = (G.towers || []).find(x => x.type === 'eldrin') || (G.npcs || []).find(n => n.id === 'eldrin');
    if (eldrin) { followTarget(t, eldrin, FOLLOW.avaren, dt); t.target = null; t.waitT = 0; return; }
  }
  // 雷德在「自由走動」模式時慢慢跟著玩家（沒敵人可打時）
  if (t.type === 'red' && t.mode === 'free' && typeof FOLLOW !== 'undefined' && G.player) {
    followTarget(t, G.player, FOLLOW.red, dt); t.target = null; t.waitT = 0; return;
  }
  if (t.waitT > 0) { t.waitT -= dt; return; }
  if (!t.target) {
    const anchor = t.mode === 'hold' && t.anchor ? t.anchor : t;
    const radius = t.mode === 'hold' ? 70 : 200;      // 原地巡邏＝小圈；自由走動＝大範圍
    const tgt = sampleWanderTarget(anchor.x, anchor.y, radius);
    if (!tgt) { t.waitT = 0.8; return; }
    t.target = tgt; return;
  }
  const dx = t.target.x - t.x, dy = t.target.y - t.y, d = Math.hypot(dx, dy);
  const sp = (TYPES[t.type].walkSpeed || 80) * (t.mode === 'goto' ? 1.5 : 1);   // 指派時走快一點
  const step = sp * dt;
  if (d <= step) {
    t.x = t.target.x; t.y = t.target.y; t.target = null;
    if (t.mode === 'goto') { t.mode = 'hold'; t.anchor = { x: t.x, y: t.y }; flash('開始巡邏', t.x, t.y - 24, '#7ee0c0'); }
    else t.waitT = 0.6 + Math.random() * 1.8;         // 到點後停一下再逛
    return;
  }
  const nx = t.x + dx / d * step, ny = t.y + dy / d * step;
  let blockedX = sentryBlocked(nx, t.y), blockedY = sentryBlocked(t.x, ny);
  if (!blockedX) t.x = nx;
  if (!blockedY) t.y = ny;
  if (blockedX && blockedY) {                          // 路被完全擋住
    t.target = null;
    if (t.mode === 'goto') { t.mode = 'hold'; t.anchor = { x: t.x, y: t.y }; flash('路被擋住了，就地巡邏', t.x, t.y - 24, '#ffd24a'); }
  }
}

// 平時對話：倒數到 0 隨機冒一句話，顯示幾秒後消失、再排下一次
function updateNpcTalk(npc, dt) {
  if (typeof WANDER_TALK === 'undefined') return;
  if (npc.berserk) { npc.say = null; return; }   // 暴走的哨兵不說話
  const nextGap = () => WANDER_TALK.minGap + Math.random() * (WANDER_TALK.maxGap - WANDER_TALK.minGap);
  if (npc.sayWait == null) npc.sayWait = nextGap();
  if (npc.say) {
    npc.say.life -= dt;
    if (npc.say.life <= 0) { npc.say = null; npc.sayWait = nextGap(); }
    return;
  }
  npc.sayWait -= dt;
  if (npc.sayWait <= 0) {
    const key = npc.id || npc.type;   // NPC 用 id、哨兵用 type
    const lines = (typeof WANDER_LINES !== 'undefined' && chapterPick(WANDER_LINES[key])) || null;
    if (lines && lines.length) npc.say = { text: lines[Math.floor(Math.random() * lines.length)], life: WANDER_TALK.duration };
    else npc.sayWait = 4;   // 沒台詞：晚點再檢查
  }
}
// 跟隨：朝目標移動，保持 cfg.dist 的距離就停（只改座標，走路動畫由主迴圈處理）
function followTarget(mover, target, cfg, dt) {
  if (!target) return false;
  const dx = target.x - mover.x, dy = target.y - mover.y, d = Math.hypot(dx, dy);
  if (d <= cfg.dist) return true;          // 夠近了就停
  const step = cfg.speed * dt;
  const nx = mover.x + dx / d * step, ny = mover.y + dy / d * step;
  if (!sentryBlocked(nx, mover.y)) mover.x = nx;
  if (!sentryBlocked(mover.x, ny)) mover.y = ny;
  return true;
}
function updateWanderer(npc, dt) {
  rescueStuck(npc, sentryBlocked);
  updateNpcTalk(npc, dt);   // 對話倒數（即使站著不動也會說話）
  // 阿瓦倫緊跟著艾德林
  if (npc.id === 'avaren' && typeof FOLLOW !== 'undefined') {
    const eldrin = G.npcs.find(n => n.id === 'eldrin');
    if (eldrin) { followTarget(npc, eldrin, FOLLOW.avaren, dt); npc.target = null; npc.waitT = 0; return; }
  }
  if (npc.waitT > 0) { npc.waitT -= dt; return; }
  if (!npc.target) {
    npc.target = sampleWanderTarget(npc.x, npc.y, 180);
    if (!npc.target) npc.waitT = 0.8;
    return;
  }

  const dx = npc.target.x - npc.x, dy = npc.target.y - npc.y, distance = Math.hypot(dx, dy);
  const step = 65 * dt;
  if (distance <= step) {
    npc.x = npc.target.x; npc.y = npc.target.y; npc.target = null;
    npc.waitT = 0.8 + Math.random() * 2;
    return;
  }

  const nx = npc.x + dx / distance * step, ny = npc.y + dy / distance * step;
  const blockedX = sentryBlocked(nx, npc.y), blockedY = sentryBlocked(npc.x, ny);
  if (!blockedX) npc.x = nx;
  if (!blockedY) npc.y = ny;
  if (blockedX && blockedY) npc.target = null;
}

// ---- 哨兵選單（點哨兵彈出：自由走動／原地巡邏／指派位置／疏導）----
const sentryMenu = document.getElementById('sentryMenu');
let menuSentry = null;    // 目前開著選單的哨兵
let assigning = null;     // 「指派位置巡邏」等待點地圖的哨兵
function openSentryMenu(t, silent) {
  if (!silent) sfx('menu');
  menuSentry = t; assigning = null;
  const spec = TYPES[t.type];
  sentryMenu.innerHTML =
    '<div class="sm-title">' + spec.name + '　汙染 ' + Math.round(t.taint) + '</div>' +
    '<button data-act="free">🚶 自由走動</button>' +
    '<button data-act="hold">📍 在原地巡邏</button>' +
    '<button data-act="goto">🎯 指派位置巡邏</button>' +
    '<button data-act="talk">💬 對話</button>' +
    '<button data-act="soothe">💗 疏導（-' + SOOTHE.cost + ' 能量）</button>';
  sentryMenu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => sentryMenuAct(b.dataset.act)));
  // 選單位置：跟著哨兵在畫面上的位置（換算成 CSS 座標）
  const rect = cv.getBoundingClientRect();
  const sx = (t.x - cam.x) * VIEW_SCALE * (rect.width / VIEW_W), sy = (t.y - cam.y) * VIEW_SCALE * (rect.height / VIEW_H);
  sentryMenu.style.left = Math.round(Math.min(sx + 22, rect.width - 170)) + 'px';
  sentryMenu.style.top = Math.round(Math.max(6, sy - 30)) + 'px';
  sentryMenu.classList.remove('hidden');
}
function closeSentryMenu() { menuSentry = null; sentryMenu.classList.add('hidden'); }
function sentryMenuAct(act) {
  const t = menuSentry; if (!t) return;
  if (act === 'free') { sfx('button'); t.mode = 'free'; t.anchor = null; t.target = null; flash('自由走動', t.x, t.y - 24, '#8fd3ff'); }
  else if (act === 'hold') { sfx('button'); t.mode = 'hold'; t.anchor = { x: t.x, y: t.y }; t.target = null; flash('在原地巡邏', t.x, t.y - 24, '#8fd3ff'); }
  else if (act === 'goto') { sfx('button'); assigning = t; closeSentryMenu(); flash('點地圖指定巡邏位置（Esc 取消）', t.x, t.y - 24, '#ffd479'); return; }
  else if (act === 'talk') { openDialogue(t); return; }
  else if (act === 'soothe') { soothe(t); openSentryMenu(t, true); return; }   // soothe() 自帶音效；選單靜默重開、更新汙染數字
  closeSentryMenu();
}
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') { assigning = null; closeSentryMenu(); closeGroundMenu(); closeBuildMenu(); }
});
// ---- 疏導哨兵（花嚮導能量降汙染、解暴走）----
function soothe(t) {
  if (t.taint <= 0 && !t.berserk) { sfx('error'); flash('無需疏導', t.x, t.y - 26, '#9aa4b2'); return; }
  if (G.guide < SOOTHE.cost) { sfx('error'); flash('嚮導能量不足', t.x, t.y - 26, '#ff8f8f'); return; }
  G.guide -= SOOTHE.cost; t.taint = Math.max(0, t.taint - SOOTHE.heal);
  if (t.berserk && t.taint < 60) t.berserk = false;
  sfx('soothe');
  flash('疏導 -' + SOOTHE.heal, t.x, t.y - 26, '#7ee0c0'); updateHUD();
}
