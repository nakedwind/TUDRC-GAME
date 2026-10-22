/* ===== 基地裡的 NPC 閒聊小表演（內容、數值在 data/npc-chats.js）=====
   ・基地（安全區）裡每隔一段時間檢查一次：data 裡某一段的人剛好都在這張地圖，就有機率開始。
   ・流程：大家走到指定地點（桌子前面）→ 面對面站好、中間浮出「● ● ●」等玩家（頭上偶爾冒「…」，畫面外有方向箭頭）
           → 溫特走過去按 Space「聽閒聊」→ 頭上泡泡輪流說台詞 → 說完各自回去閒逛。
     沒人來聽：等 waitTime 秒就散開；聽到一半溫特走超過 leaveRange 格：當作不聽了，也散開。
   ・聊天中的人不會自己亂走、不會冒平常的閒聊泡泡、不會去坐椅子（js/sentry.js 的 updateSentry／updateWanderer 先問 npcChatStep）。
   ・溫特找其中一個人說話、有人被抓起來、離開地圖：這段聊天直接結束。
   ・測試：在主控台打 startNpcChat('theonie-noah-lab') 可以馬上開始一段。
   ・站位：data 裡有 stand（每個人自己的格子、面向，💬 NPC 閒聊編輯器設定）就照它站；沒有就從 spot 自動排。
   ・從閒聊編輯器按「▶ 預覽遊戲」開的遊戲（?previewChats=1）：用編輯器裡還沒存到專案的閒聊內容。
*/
const NPC_CHAT_STORE = 'tudrc_npc_chats_v1';   // 閒聊編輯器的暫存
const npcChatList = (() => {
  let list = typeof NPC_CHATS !== 'undefined' ? NPC_CHATS : [];
  if (/[?&](preview|previewChats)=1(&|$)/.test(location.search)) {
    try { const d = JSON.parse(localStorage.getItem(NPC_CHAT_STORE) || 'null'); if (d && Array.isArray(d.chats)) list = d.chats; } catch (_) {}
  }
  return list;
})();
let npcChatClock = 0;            // 遊戲時間（只在基地裡累積）
let npcChatNextCheck = null;     // 下一次檢查的時間
const npcChatLastAt = {};        // 每一段上次聊完的時間（冷卻）

const NPC_CHAT_GAP = 64;   // 聊天時兩人隔多遠站（像素）
const npcChatActor = id => (G.npcs || []).find(n => n.id === id) || (G.towers || []).find(t => t.type === id) || null;
const npcChatSpeed = a => a.kind === 'tower' ? ((TYPES[a.type] && TYPES[a.type].walkSpeed) || 80) : 65;
const npcChatFree = a => a && !(a.hp <= 0) && !a.berserk && !a.grabbed && !a.grabFall && !a.eatenBy && !(typeof dialogueState !== 'undefined' && dialogueState && dialogueState.actor === a);

// ---- 站位：素材（桌子）前面一排、或指定的格子；每個人隔 NPC_CHAT_GAP 像素站一排，左邊的面向右、右邊的面向左 ----
function npcChatSpots(chat, n) {
  // 編輯器指定了每個人的站位：stand[角色] = [格 c, 格 r, 面向（left／right／front／back，沒寫＝面向其他人）]
  if (chat.stand && chat.who.every(id => Array.isArray(chat.stand[id]))) {
    const near = (c, r) => {   // 那格被擋住（例如椅子的碰撞）：改站旁邊最近的空格
      for (let d = 0; d <= 3; d++) for (let dc = -d; dc <= d; dc++) for (let dr = -d; dr <= d; dr++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue;
        const [x, y] = center(c + dc, r + dr); if (inGrid(c + dc, r + dr) && !sentryBlocked(x, y)) return [x, y];
      }
      return center(c, r);
    };
    const pts = chat.who.map(id => { const [c, r] = chat.stand[id]; const [x, y] = near(c, r); return { x, y, face: chat.stand[id][2] }; });
    return pts.map((p, i) => {
      if (p.face) return { x: p.x, y: p.y, dir: p.face };
      const others = pts.filter((_, k) => k !== i), ox = others.reduce((s, o) => s + o.x, 0) / others.length - p.x, oy = others.reduce((s, o) => s + o.y, 0) / others.length - p.y;
      return { x: p.x, y: p.y, dir: !others.length ? 'front' : Math.abs(ox) >= Math.abs(oy) ? (ox < 0 ? 'left' : 'right') : (oy < 0 ? 'back' : 'front') };
    });
  }
  let mid = null;
  const free = (x, y) => !sentryBlocked(x, y);
  const rowFits = (x, y) => Array.from({ length: n }, (_, i) => free(x + (i - (n - 1) / 2) * NPC_CHAT_GAP, y)).every(Boolean);
  if (chat.spot && chat.spot.tile) {
    const s = (MAP.stamps || []).find(st => st.id === chat.spot.tile), t = s && mapTileById(s.id);
    if (s && t) {
      const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL;
      // 先找桌子下面（前面），再找上面、左右；每一邊從中間往外找站得下的位置
      const tries = [];
      for (const [y, dir] of [[y0 + h + CELL * .55, 1], [y0 - CELL * .45, -1]]) for (let k = 0; k <= w / 2 + CELL; k += 10) tries.push([x0 + w / 2 - k, y], [x0 + w / 2 + k, y]);
      for (const x of [x0 - CELL * .9, x0 + w + CELL * .9]) for (let k = 0; k <= h; k += 10) tries.push([x, y0 + h - k]);
      const hit = tries.find(([x, y]) => rowFits(x, y)) || tries.find(([x, y]) => free(x, y));
      if (hit) mid = { x: hit[0], y: hit[1] };
    }
  } else if (Array.isArray(chat.spot)) mid = { x: center(chat.spot[0], chat.spot[1])[0], y: center(chat.spot[0], chat.spot[1])[1] };
  if (!mid) return null;
  return Array.from({ length: n }, (_, i) => {
    const off = (i - (n - 1) / 2) * NPC_CHAT_GAP, x = rowFits(mid.x, mid.y) ? mid.x + off : mid.x + off * .5;
    return { x, y: mid.y, dir: n === 1 ? 'front' : off < 0 ? 'right' : off > 0 ? 'left' : 'front' };
  });
}

// ---- 開始一段 ----
function startNpcChat(id, force = true) {
  const chat = npcChatList.find(c => c.id === id); if (!chat || !G || !MAP_SAFE || G.npcChat) return false;
  if (chat.map && MAP && MAP.name !== chat.map) return false;
  const actors = chat.who.map(npcChatActor);
  if (actors.some(a => !npcChatFree(a))) return false;
  const spots = npcChatSpots(chat, actors.length); if (!spots) return false;
  const talks = chat.talks || [];
  const lines = talks[Math.floor(Math.random() * talks.length)] || [];
  if (!lines.length) return false;
  for (const a of actors) {
    if (a.sitting && typeof npcStandUp === 'function') npcStandUp(a);   // 坐著的先站起來
    a.seatGoal = null; a.target = null; a.navPath = null; a.waitT = 0; a.say = null;
  }
  G.npcChat = { chat, actors, spots, lines, phase: 'walk', arrived: actors.map(() => false), t: 0, idx: -1, forced: force };
  return true;
}
function endNpcChat(cooldown = true) {
  const st = G && G.npcChat; if (!st) return;
  for (const a of st.actors) {
    if (a.say && a.say.chat) a.say = null;
    a.sayWait = 6 + Math.random() * 8;   // 聊完不要馬上又冒平常的泡泡
    a.target = null; a.navPath = null; a.waitT = .4 + Math.random() * 1.2;
  }
  if (cooldown) npcChatLastAt[st.chat.id] = npcChatClock;
  G.npcChat = null;
}

// ---- 每幀（game.js 的 update 呼叫）：要不要開始、走位、輪流說話 ----
function updateNpcChats(dt) {
  if (!G || !npcChatList.length) return;
  if (!MAP_SAFE) { if (G.npcChat) endNpcChat(false); return; }
  const R = NPC_CHAT_RULES;
  npcChatClock += dt;
  const st = G.npcChat;
  if (!st) {
    if (npcChatNextCheck == null || G.npcChatMap !== MAP) { G.npcChatMap = MAP; npcChatNextCheck = npcChatClock + R.firstDelay + Math.random() * R.checkEvery; }
    if (npcChatClock < npcChatNextCheck) return;
    npcChatNextCheck = npcChatClock + R.checkEvery;
    const here = npcChatList.filter(c => (!c.map || c.map === MAP.name) && npcChatClock - (npcChatLastAt[c.id] ?? -Infinity) >= R.cooldown);
    for (const c of here.sort(() => Math.random() - .5)) if (Math.random() < (c.chance ?? R.chance) && startNpcChat(c.id, false)) break;
    return;
  }
  if (st.actors.some(a => !npcChatFree(a) || !(G.npcs.includes(a) || G.towers.includes(a)))) { endNpcChat(); return; }   // 被叫走了、被抓起來…
  st.t += dt;
  if (st.phase === 'walk') {
    if (st.arrived.every(Boolean) || st.t > R.walkTimeout) {
      st.phase = 'wait'; st.t = 0; st.murmurT = .8; st.murmurWho = 0;
      if (typeof systemNotice === 'function') systemNotice(st.actors.map(a => npcChatNameOf(a)).join('和') + '好像在聊什麼……');
    }
    return;
  }
  const mid = npcChatMid(st), p = G.player;
  if (st.phase === 'wait') {   // 等溫特來聽：頭上偶爾冒「…」，太久沒人來就散開
    if (st.t > R.waitTime) { endNpcChat(); return; }
    st.murmurT -= dt;
    if (st.murmurT <= 0) {
      for (const a of st.actors) if (a.say && a.say.chat) a.say = null;
      if (st.murmurOn) { st.murmurOn = false; st.murmurT = R.murmurEvery * (.6 + Math.random() * .8); }
      else { const a = st.actors[st.murmurWho++ % st.actors.length]; a.say = { text: '…', life: 999, chat: true }; st.murmurOn = true; st.murmurT = .9; }
    }
    return;
  }
  if (p && mid && Math.hypot(p.x - mid.x, p.y - mid.y) > R.leaveRange * CELL) { endNpcChat(); return; }   // 聽到一半走太遠：當作不聽了
  // talk：一句一句來（t 從負的倒數到 0＝停頓中）
  if (st.t < 0) return;
  if (st.idx >= 0 && !st.gap) {
    if (st.t < st.lineT) return;
    for (const a of st.actors) if (a.say && a.say.chat) a.say = null;   // 這句說完：泡泡收掉、停一下
    st.gap = true; st.t = -R.lineGap; return;
  }
  st.idx++; st.gap = false;
  if (st.idx >= st.lines.length) { endNpcChat(); return; }
  const [who, text] = st.lines[st.idx], speaker = st.actors[st.chat.who.indexOf(who)] || npcChatActor(who);
  for (const a of st.actors) if (a !== speaker && a.say && a.say.chat) a.say = null;
  if (speaker) speaker.say = { text, life: 999, chat: true };
  st.lineT = Math.min(R.lineMax, R.lineBase + String(text).length * R.linePerChar);
  st.t = 0;
}

// ---- 溫特：靠近按 Space「聽閒聊」（game.js 的互動鍵、render.js 的提示）----
const npcChatNameOf = a => (typeof CHARACTERS !== 'undefined' && CHARACTERS[a.id || a.type] && CHARACTERS[a.id || a.type].name) || a.name || a.id || a.type;
function npcChatMid(st) {   // 大家站位的中間（「● ● ●」和「聽閒聊」提示畫在這上面）
  if (!st || !st.spots || !st.spots.length) return null;
  const x = st.spots.reduce((s, q) => s + q.x, 0) / st.spots.length, y = Math.min(...st.spots.map(q => q.y));
  return { x, y, top: y - 110 };   // top：「聽閒聊」提示的位置（在「● ● ●」上面）
}
function npcChatNearPlayer() {
  const st = G && G.npcChat, p = G && G.player;
  if (!st || st.phase !== 'wait' || !p || p.sitting) return null;
  const mid = npcChatMid(st);
  return mid && Math.hypot(p.x - mid.x, p.y - mid.y) <= NPC_CHAT_RULES.listenRange * CELL ? mid : null;
}
function useNpcChatNearPlayer() {
  const st = G && G.npcChat; if (!npcChatNearPlayer()) return false;
  for (const a of st.actors) if (a.say && a.say.chat) a.say = null;
  st.phase = 'talk'; st.t = -NPC_CHAT_RULES.startPause; st.idx = -1; st.gap = false;
  if (typeof sfx === 'function') sfx('blip');
  return true;
}
// 「● ● ●」：等玩家來聽時浮在大家中間（render.js 在角色泡泡之後畫，世界座標）
function drawNpcChatMarks(ctx) {
  const st = G && G.npcChat; if (!st || st.phase !== 'wait') return;
  const mid = npcChatMid(st); if (!mid) return;
  const now = performance.now() / 1000, x = mid.x, y = mid.y - 92 + Math.sin(now * 2.2) * 2.5;   // 在名字上面，不蓋住名字
  ctx.save();
  ctx.fillStyle = 'rgba(248,250,252,.95)'; ctx.strokeStyle = 'rgba(70,86,110,.9)'; ctx.lineWidth = 1.5;
  roundRect(x - 21, y - 12, 42, 22, 11); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 4, y + 10); ctx.lineTo(x + 4, y + 10); ctx.lineTo(x, y + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 3; i++) {   // 三個點輪流跳起來
    const k = Math.max(0, Math.sin(now * 6 - i * .9));
    ctx.fillStyle = '#5a6a86'; ctx.beginPath(); ctx.arc(x - 10 + i * 10, y - 1 - k * 3, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// 畫面外的方向提示：聊天的人不在畫面裡時，畫面邊緣出現一個小「●●●」箭頭指向他們（render.js 在畫面座標畫）
function drawNpcChatOffscreen(ctx, cv) {
  const st = G && G.npcChat; if (!st || st.phase !== 'wait' || typeof cam === 'undefined') return;
  const mid = npcChatMid(st); if (!mid) return;
  const sx = (mid.x - cam.x) * VIEW_SCALE, sy = (mid.y - 30 - cam.y) * VIEW_SCALE, m = 34;
  if (sx > 0 && sx < cv.width && sy > 0 && sy < cv.height) return;   // 在畫面裡就不用
  const cx = cv.width / 2, cy = cv.height / 2, dx = sx - cx, dy = sy - cy;
  const k = Math.min((cx - m) / Math.max(1, Math.abs(dx)), (cy - m) / Math.max(1, Math.abs(dy)));
  const x = cx + dx * k, y = cy + dy * k, ang = Math.atan2(dy, dx), now = performance.now() / 1000;
  ctx.save();
  ctx.globalAlpha = .82 + .18 * Math.sin(now * 3);
  ctx.translate(x, y);
  ctx.save(); ctx.rotate(ang); ctx.fillStyle = 'rgba(248,250,252,.95)'; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(15, -8); ctx.lineTo(15, 8); ctx.closePath(); ctx.fill(); ctx.restore();   // 箭頭
  ctx.fillStyle = 'rgba(248,250,252,.95)'; ctx.strokeStyle = 'rgba(70,86,110,.9)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = '#5a6a86'; ctx.beginPath(); ctx.arc(-6 + i * 6, 0, 2, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// ---- 聊天中的人：走到自己的位置、面對對方站著（js/sentry.js 的 updateSentry／updateWanderer 先問這裡；回傳 true＝這幀不跑一般行為）----
function npcChatStep(a, dt) {
  const st = G && G.npcChat; if (!st) return false;
  const i = st.actors.indexOf(a); if (i < 0) return false;
  const spot = st.spots[i];
  a.target = null; a.waitT = 0;
  if (st.phase === 'walk' && !st.arrived[i]) {
    if (Math.hypot(spot.x - a.x, spot.y - a.y) < 4 || moveSentryWithPath(a, spot.x, spot.y, npcChatSpeed(a), dt)) { st.arrived[i] = true; a.navPath = null; a.dir = spot.dir; }
    else if (a.navFailed) { st.arrived[i] = true; a.navPath = null; }   // 走不過去：就在原地聊
    return true;
  }
  a.moving = false; a.dir = spot.dir;
  return true;
}
