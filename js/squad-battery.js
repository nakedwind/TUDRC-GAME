// ============================================================
//  隊友的電池（戴照明頭盔的隊友才有）
//  ・隊友戴照明頭盔要耗電：身上帶著電池（最多 SQUAD_BATTERY.carry 顆），一顆用完自動換下一顆。
//    一顆電池能用多久＝溫特同等級手電筒一顆電池的秒數 × 照明頭盔的 squadBattery（%，預設 150＝1.5 倍；data/equipment.js，開發工坊編輯器可改）。
//  ・電池全部用完：頭盔不亮（又會怕黑），頭上冒思考泡泡顯示電池（沒戴照明頭盔就不會有這個泡泡）。
//  ・補電池：溫特把背包裡的電池丟在地上（背包「放在地上」或從快捷欄拖到地圖上，js/ground-items.js），
//    戴著照明頭盔、身上沒帶滿的隊友會走去撿（地上的在畫面內才去）。打仗時先不撿，等沒有敵人再去；全部沒電了就馬上去撿。
//  ・出勤：從應變中心出勤時，戴著照明頭盔的隊友身上不到 SQUAD_BATTERY.sortie（3）顆的，補到 3 顆（應變中心配發，不扣背包）；頭盔沒電的也先裝好一顆新的。
//  ・左邊隊員欄：戴照明頭盔的隊友，血量條下面顯示身上還有幾顆電池（js/team.js 的 guideKitHudHtml）。
//  ・存檔：localStorage 的 tudrc_squad_battery_v1：{ 隊員: { n: 身上幾顆, charge: 現在這顆還剩多少 %（0～100） } }。
//    換地圖、回基地都帶著；開始新遊戲會清掉（js/new-game.js）。
//  必須在 js/equipment.js、js/gear-v2.js、js/ground-items.js、js/camp-supply.js 之後載入。
// ============================================================
const SQUAD_BATTERY = { carry: 20, sortie: 3, reach: 30, saveEvery: 3 };   // carry：每人最多帶幾顆；sortie：從應變中心出勤時，戴照明頭盔的隊友身上至少有幾顆（不夠的補到這個數）；reach：離地上的電池多近算撿到（px）；saveEvery：耗電每幾秒存一次
const SQUAD_BATTERY_KEY = 'tudrc_squad_battery_v1';
let squadBatteryData = {};
try { const d = JSON.parse(localStorage.getItem(SQUAD_BATTERY_KEY) || '{}'); if (d && typeof d === 'object') squadBatteryData = d; } catch (_) {}
let squadBatteryDirty = false, squadBatterySaveT = 0;
function saveSquadBattery() { squadBatteryDirty = false; try { localStorage.setItem(SQUAD_BATTERY_KEY, JSON.stringify(squadBatteryData)); } catch (_) {} }

// 這個隊友身上的電池：{ n 顆數, charge 現在這顆剩幾 % }
function squadBattery(t) {
  const k = t && t.type; if (!k) return { n: 0, charge: 0 };
  const b = squadBatteryData[k] || (squadBatteryData[k] = { n: 0, charge: 0 });
  if (!(b.n >= 0)) b.n = 0; if (!(b.charge >= 0)) b.charge = 0;
  return b;
}
// 隊友的照明頭盔現在亮不亮：戴著、而且還有電（這一顆還有電，或身上還有電池可以換）
function squadHelmetLit(t) {
  if (!squadHelmetLight(t)) return false;
  const b = squadBattery(t); return b.charge > 0 || b.n > 0;
}
// 一顆電池能用幾秒：溫特同等級的高亮度手電筒一顆電池的秒數 × squadBattery%（照明頭盔，預設 150）
function squadBatterySeconds(t) {
  const key = squadHelmetKey(t), lv = (key && gearKeyLv(key)) || 1;
  const f = typeof equipDef === 'function' && equipDef('headlamp'), fl = f && (f.levels[lv - 1] || f.levels[0]);
  const h = equipDef('lamphelmet'), pct = h && typeof h.squadBattery === 'number' && h.squadBattery > 0 ? h.squadBattery : 150;
  return Math.max(1, ((fl && fl.battery) || 90) * pct / 100);
}
// 隊友在地圖上、會耗電的狀態（倒下、被吃掉、藏起來、搭捷運時不耗電）
const squadBatteryActive = t => t && t.hp > 0 && !t.eatenBy && !t.hidden && !t.mrtRide && !!squadHelmetLight(t);

// ---- 每幀（js/equipment.js 的 updateEquipment 呼叫）：耗電、自動換電池 ----
function updateSquadBattery(dt) {
  if (!MAP_FIELD || MAP_SAFE || !G || !G.towers || G.over) return;
  for (const t of G.towers) {
    if (!squadBatteryActive(t)) continue;
    const b = squadBattery(t);
    if (b.charge > 0) { b.charge = Math.max(0, b.charge - dt * 100 / squadBatterySeconds(t)); squadBatteryDirty = true; }
    if (b.charge > 0) continue;
    if (b.n > 0) {   // 這一顆沒電了：換下一顆
      b.n--; b.charge = 100; b.warned = false; saveSquadBattery();
      if (typeof sentryStatus === 'function') sentryStatus(t, '🔋 換上新電池（剩 ' + b.n + ' 顆）', '#ffe28a');
    } else if (!b.warned) {
      b.warned = true; saveSquadBattery();
      if (typeof sentryStatus === 'function') sentryStatus(t, '頭盔沒電了，需要電池', '#ffb36b');
    }
  }
  if (squadBatteryDirty && (squadBatterySaveT -= dt) <= 0) { squadBatterySaveT = SQUAD_BATTERY.saveEvery; saveSquadBattery(); }
}

// ---- 撿地上的電池（js/sentry.js 的 updateSentryMain 呼叫；回傳 true＝這一幀在走去撿，不做別的）----
function squadBatteryGroundStep(t, dt) {
  if (MAP_SAFE || !MAP_FIELD || t.mode === 'goto' || t.berserk || !squadHelmetLight(t)) { t.batteryTrip = null; return false; }
  const b = squadBattery(t), list = G.groundItems || [];
  if (b.n >= SQUAD_BATTERY.carry || !list.length) { t.batteryTrip = null; return false; }
  const lit = squadHelmetLit(t), empty = !lit;
  const want = g => g.id === 'battery' && g.qty > 0 && (!hasFloors || (g.floor || 1) === actorFloor(t))
    && !(typeof poolItemFloating === 'function' && poolItemFloating(g))   // 漂在深水裡的走不過去
    && (lit || personnelInLight(g.x, g.y));   // 頭盔沒電：暗處的不敢去撿
  for (const g of list) if (want(g) && Math.hypot(g.x - t.x, g.y - t.y) < SQUAD_BATTERY.reach) { squadTakeBattery(t, g); t.batteryTrip = null; return false; }
  // 還有電的時候，忙著打仗、嚮導忙著照顧人就先不去撿（全部沒電了才馬上去）
  const busy = !empty && ((typeof hasAggroTarget === 'function' && hasAggroTarget(t)) || (TYPES[t.type].guide && typeof guideIdle === 'function' && !guideIdle(t)));
  let trip = t.batteryTrip;
  if (trip && (!list.includes(trip.g) || !want(trip.g) || busy)) trip = t.batteryTrip = null;
  if (!trip) {
    if (busy) return false;
    if ((t.batteryTripCd = Math.max(0, (t.batteryTripCd || 0) - dt)) > 0) return false;   // 剛剛走不到：等一下再找
    let best = null, bd = Infinity;
    for (const g of list) {
      if (!want(g) || !(typeof groundOnScreen !== 'function' || groundOnScreen(g))) continue;   // 在玩家畫面內的才去撿
      const d = Math.hypot(g.x - t.x, g.y - t.y); if (d < bd) { bd = d; best = g; }
    }
    if (!best) return false;
    trip = t.batteryTrip = { g: best };
    if (typeof sentryStatus === 'function') sentryStatus(t, '去撿地上的電池', '#8fd3ff');
  }
  t.followDark = true;   // 路上可能經過暗處：照樣走過去（js/sentry.js 的 moveSentryWithPath）
  if (moveSentryWithPath(t, trip.g.x, trip.g.y, (TYPES[t.type].walkSpeed || 80) * 1.3, dt)) { squadTakeBattery(t, trip.g); t.batteryTrip = null; t.navPath = null; return true; }
  if (t.navFailed) { t.batteryTrip = null; t.navFailed = false; t.batteryTripCd = 3; return false; }   // 走不到：等 3 秒再找
  t.target = null;
  return true;
}
function squadTakeBattery(t, g) {
  const b = squadBattery(t), n = Math.min(g.qty, SQUAD_BATTERY.carry - b.n); if (n <= 0) return;
  b.n += n; b.warned = false; removeGroundItem(g, n); saveSquadBattery();
  if (typeof sentryStatus === 'function') sentryStatus(t, '撿起電池' + (n > 1 ? '×' + n : '') + '（身上 ' + b.n + ' 顆）', '#9ff0c0');
  if (typeof sfxAt === 'function') sfxAt('pop', g.x, g.y, .5, 'battery-pick');
}

// ---- 頭上的思考泡泡：戴著照明頭盔、電池全部用完時顯示電池（跟嚮導缺急救包的泡泡同一個樣子，js/camp-supply.js）----
let squadBatteryIcon = null;
function drawSquadBatteryBubbles(ctx) {
  if (MAP_SAFE || !MAP_FIELD || !G || !G.towers) return;
  for (const t of G.towers) {
    if (!squadBatteryActive(t) || t.berserk || squadHelmetLit(t)) continue;
    if (!squadBatteryIcon) { squadBatteryIcon = new Image(); squadBatteryIcon.src = (itemById('battery') || {}).image || 'images/items/battery.png'; }
    const bob = Math.sin(performance.now() / 400 + t.x * .01) * 2;
    const w = 36, h = 26, x = Math.round(t.x + 6);
    let top = t.y - 92;
    // 嚮導同時缺急救包／杏仁水（那個泡泡也在這個位置）：電池的泡泡排到上面
    if (TYPES[t.type].guide && t.kit && typeof guideMissing === 'function' && guideMissing(t).length) top -= h + 8;
    if (t.bubbleAt && performance.now() - t.bubbleAt < 120) top = Math.min(top, t.bubbleTop - h - 16);   // 頭上正在說話：排到對話泡泡上面
    const y = Math.round(top + bob);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(40,48,60,.85)'; ctx.lineWidth = 1.5;
    roundRect(x, y, w, h, 12); ctx.fill(); ctx.stroke();
    for (const [dx, dy, r] of [[4, h + 5, 4], [-1, h + 12, 2.5]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }   // 思考泡泡的小圓點
    ctx.imageSmoothingEnabled = false;
    if (squadBatteryIcon.complete && squadBatteryIcon.naturalWidth) ctx.drawImage(squadBatteryIcon, x + 8, y + 3, 20, 20);
    ctx.restore();
  }
}

// ---- 出勤（js/sortie-supply.js 的 onSortieNewGame 呼叫）：戴照明頭盔的隊友身上補到 3 顆電池 ----
function squadBatterySortie() {
  if (typeof getTeam !== 'function') return;
  const got = [];
  for (const type of getTeam()) {
    if (!TYPES[type] || !squadHelmetKey({ type })) continue;
    const b = squadBattery({ type }), before = b.n;
    if (b.n < SQUAD_BATTERY.sortie) b.n = SQUAD_BATTERY.sortie;
    if (b.charge <= 0) b.charge = 100;   // 頭盔沒電：先裝好一顆新的（身上的 3 顆不動）
    b.warned = false;
    if (b.n > before) got.push(TYPES[type].name);
  }
  saveSquadBattery();
  if (got.length && typeof systemNotice === 'function') systemNotice('🔋 ' + got.join('、') + '帶上了電池（身上補到 ' + SQUAD_BATTERY.sortie + ' 顆）');
}
