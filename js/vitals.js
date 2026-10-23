/* ===== 隊員和溫特的 HP、SP、負荷：跨地圖保留、回應變中心休養 =====
   ・出勤用「現在」的 HP、SP、負荷出發（不會每張地圖補滿）；打完回來也照帶回來的數字。
   ・回到應變中心時：
       暴走中的隊員：解除暴走，負荷降到暴走邊緣（VITALS.berserkEdge）；其他人保留原本的負荷。
       HP 低於 VITALS.hospitalBelow（30%）的隊員：自動住院（待在 1F醫院、躺在病床上）。
       HP 歸零的隊員回來時至少剩 1。
   ・在應變中心：溫特和每位隊員每秒回 VITALS.baseRegen（1）HP；溫特、嚮導每秒回 1 SP。負荷不會自己降（雷德的自癒照舊）。
   ・1F醫院：躺在病床上每秒回 VITALS.bedRegen（10）HP（溫特自己躺上去也算）。住院的隊員補滿就出院，下次回來待在平常的位置。
       HP 沒滿、但沒有低於 30% 的隊員：跟他對話按「🏥 去醫院休息」，他就會走去醫院（js/game.js 的對話框按鈕）。
   ・2F疏導室：負荷 ≥ VITALS.sootheRoomFrom 的隊員回來時待在疏導室。
       溫特走到旁邊按 C 自己疏導（花 SP）；或跟常駐在疏導室的亞許對話按「🫶 請亞許疏導」，亞許一個一個走過去幫忙疏導（不花溫特的 SP）。
   ・報告下一個任務的通訊員改成艾德林（data/missions.js 的 MISSION_BASE.briefer）。艾德林有任務要報告時，不會被送去醫院或疏導室。
   ・紀錄存在 tudrc_vitals_v1（js/new-game.js 的進度清單：開新遊戲會重設，存檔欄位會一起存）。
   ・訓練室（js/practice.js）裡的 HP、負荷變化不會帶出來。
   必須在 js/game.js 之前載入（game.js 的 newGame、update、openDialogue 會呼叫這裡）。
*/
const VITALS = {
  berserkEdge: 85,        // 暴走的隊員回應變中心時，負荷降到多少（暴走邊緣）
  hospitalBelow: .3,      // HP 低於最大值的幾成：回應變中心時自動住院
  baseRegen: 1,           // 在應變中心：每秒回幾 HP／SP
  bedRegen: 10,           // 醫院病床上：每秒回幾 HP
  sootheRoomFrom: 30,     // 負荷到多少以上：回應變中心時待在疏導室
  hospitalMap: '1F醫院', sootheRoomMap: '2F疏導室',   // 地圖名稱（基地編輯器裡的名稱）
  ash: 'ash', ashSootheTime: 3, ashSootheColor: [176, 196, 214], ashWalkMax: 4,   // 亞許：疏導一次幾秒、光點顏色、最多走幾秒過去
  leaveTimeout: 10,       // 被叫去醫院的隊員：最多走幾秒就離開這張地圖
};
const VITALS_STORE = 'tudrc_vitals_v1';
// player：{ hp }；mates：隊員 → { hp, taint, berserk, hospital }；fromBattle：上一張地圖是戰鬥區（回應變中心時套用規則用）；sortie：出勤時的紀錄（重新挑戰時用）
let vitals = { player: null, mates: {}, fromBattle: false, sortie: null };
try { const saved = JSON.parse(localStorage.getItem(VITALS_STORE) || 'null'); if (saved && typeof saved === 'object') vitals = { ...vitals, ...saved, mates: saved.mates || {} }; } catch (_) {}
let vitalsSavedAt = 0;
function saveVitals() { vitalsSavedAt = performance.now(); try { localStorage.setItem(VITALS_STORE, JSON.stringify(vitals)); } catch (_) {} }
const vitalsMax = id => (TYPES[id] && TYPES[id].hp) || 100;
const vitalsMate = id => vitals.mates[id] || (vitals.mates[id] = { hp: vitalsMax(id), taint: 0, berserk: false, hospital: false });
const vitalsMapName = () => (typeof MAP !== 'undefined' && MAP && MAP.name) || '';
const onHospitalMap = () => MAP_SAFE && vitalsMapName() === VITALS.hospitalMap;
const onSootheRoom = () => MAP_SAFE && vitalsMapName() === VITALS.sootheRoomMap;
const vitalsPractice = () => typeof practiceOn === 'function' && practiceOn();
const briefWaiting = id => typeof MISSION_BASE !== 'undefined' && MISSION_BASE.briefer === id && typeof briefPending === 'function' && !!briefPending();

// ---- 換地圖前（game.js 的 newGame 一開始呼叫，這時 G 還是上一張地圖的；MAP 已經是新地圖）----
function rememberVitals() {
  if (typeof G === 'undefined' || !G || !G.player || G.vitalsSkip) return;   // 開遊戲第一次、訓練室：不記
  if (!G.vitalsSafe && G.vitalsMapId === (MAP && MAP.id) && vitals.sortie) {   // 同一張戰鬥地圖重新開始（再挑戰）：回到出勤時的狀態
    vitals = { ...vitals, ...JSON.parse(JSON.stringify(vitals.sortie)), sortie: vitals.sortie };
    saveVitals(); return;
  }
  vitals.player = { hp: G.player.hp };
  for (const t of G.towers || []) {
    if (!TYPES[t.type]) continue;
    const m = vitalsMate(t.type);
    m.hp = t.hp; m.taint = t.taint || 0; m.berserk = !!t.berserk || (t.taint || 0) >= 100;
  }
  vitals.fromBattle = !G.vitalsSafe;
  saveVitals();
}
// ---- 新地圖：G 建好、隊員出生之前（game.js 的 newGame 呼叫）：回應變中心的規則 ----
function arriveVitals() {
  if (vitalsPractice()) return;
  if (MAP_SAFE && vitals.fromBattle) {   // 剛從戰鬥區回來
    for (const [id, m] of Object.entries(vitals.mates)) {
      if (!TYPES[id]) continue;
      if (m.berserk || m.taint >= 100) { m.taint = Math.min(m.taint, VITALS.berserkEdge); m.berserk = false; }
      m.hp = Math.max(1, Math.min(vitalsMax(id), m.hp));
      if (m.hp < vitalsMax(id) * VITALS.hospitalBelow) m.hospital = true;   // 重傷：自動住院
    }
    if (vitals.player) vitals.player.hp = Math.max(1, vitals.player.hp);
    vitals.fromBattle = false; vitals.sortie = null;
    saveVitals();
  }
  if (!MAP_SAFE && !vitals.sortie) { vitals.sortie = JSON.parse(JSON.stringify({ player: vitals.player, mates: vitals.mates })); saveVitals(); }   // 出勤：記下出發時的狀態
}
// ---- 隊員出生時（js/sentry.js 的 spawnSentries 呼叫）：套用記住的 HP、負荷 ----
function applyVitals(t) {
  const m = vitals.mates[t.type]; if (!m) return;
  const bonus = Math.max(0, t.maxhp - vitalsMax(t.type));   // 出勤補給加的生命上限：照樣多那麼多（js/sortie-supply.js）
  t.hp = Math.max(1, Math.min(t.maxhp, m.hp + bonus));
  t.taint = Math.min(m.berserk || m.taint >= 100 ? VITALS.berserkEdge : m.taint, 100);   // 暴走的不會一出場就暴走
}
// ---- G.player 建好之後（game.js 的 newGame 呼叫）：溫特的 HP、醫院病床、訓練室標記 ----
function afterVitalsSpawn() {
  G.vitalsSafe = MAP_SAFE; G.vitalsMapId = MAP && MAP.id; G.vitalsSkip = vitalsPractice();
  if (vitals.player && Number.isFinite(vitals.player.hp)) G.player.hp = Math.max(1, Math.min(G.player.maxhp, vitals.player.hp));
  if (onHospitalMap()) for (const t of G.towers) if (vitalsMate(t.type).hospital) putInBed(t);   // 住院的隊員：躺在病床上
}
// 這位隊員平時在哪（js/sentry.js 的 npcLocation 先問這裡）：住院＝醫院、負荷高＝疏導室；其他照基地編輯器的設定
function vitalsLocation(id) {
  const m = vitals.mates[id];
  if (!m || !TYPES[id] || briefWaiting(id)) return null;
  if (m.hospital) return { map: VITALS.hospitalMap };
  if (m.taint >= VITALS.sootheRoomFrom) return { map: VITALS.sootheRoomMap };
  return null;
}
// 醫院：找一張沒人躺的病床讓他躺上去（一直躺到 HP 補滿）
function putInBed(t) {
  if (typeof mapSeats !== 'function') return false;
  const bed = mapSeats().find(s => s.bed && !seatTaken(s, t));
  if (!bed) return false;   // 病床滿了：先在醫院裡走動（每秒只回 baseRegen）
  t.sitFrom = seatApproachPoint(bed) || { x: t.x, y: t.y };
  t.sitting = bed; t.seatGoal = null; t.sitT = Infinity; t.x = bed.x; t.y = bed.y; t.dir = bed.dir; t.target = null; t.navPath = null;
  return true;
}
const inBed = a => !!(a && a.sitting && a.sitting.bed) && onHospitalMap();

// ---- 每幀（game.js 的 update 呼叫）：應變中心裡慢慢恢復 ----
function updateVitals(dt) {
  if (!MAP_SAFE || vitalsPractice() || !G.player) return;
  const p = G.player;
  p.hp = Math.min(p.maxhp, p.hp + (inBed(p) ? VITALS.bedRegen : VITALS.baseRegen) * dt);
  G.guide = Math.min(G.guideMax, G.guide + VITALS.baseRegen * dt);   // 溫特的 SP
  vitals.player = { hp: p.hp };
  const here = new Set();
  for (const t of G.towers) {
    if (!TYPES[t.type]) continue;
    here.add(t.type);
    const m = vitalsMate(t.type);
    if (t.hp > 0) t.hp = Math.min(t.maxhp, t.hp + (inBed(t) ? VITALS.bedRegen : VITALS.baseRegen) * dt);
    if (TYPES[t.type].guide && typeof initGuideSP === 'function') { initGuideSP(t); t.sp = Math.min(t.maxsp, t.sp + VITALS.baseRegen * dt); guideSPRecords[t.type] = t.sp; }
    if (onHospitalMap() && m.hospital) {
      if (t.hp >= t.maxhp) {   // 補滿：出院
        m.hospital = false;
        if (t.sitting) t.sitT = 0;   // 起床（js/sentry.js 的 npcSeatStep）
        if (typeof sentryStatus === 'function') sentryStatus(t, '傷好了，出院', '#7ee0a8');
      } else if (inBed(t)) t.sitT = Infinity;   // 住院中：一直躺著
      else if (!t.sitting && !t.seatGoal) {   // 走去找空的病床
        const bed = mapSeats().find(s => s.bed && !seatTaken(s, t)), approach = bed && seatApproachPoint(bed);
        if (approach) { t.seatGoal = { seat: bed, approach }; t.target = null; t.navPath = null; t.waitT = 0; }
      }
    }
    m.hp = t.hp; m.taint = t.taint || 0; m.berserk = false;
    if (t.vitalsLeaving) stepLeaving(t, dt);
  }
  for (const [id, m] of Object.entries(vitals.mates)) {   // 不在這張地圖的隊員：住院的當作躺在病床上
    if (here.has(id) || !TYPES[id]) continue;
    m.hp = Math.min(vitalsMax(id), m.hp + (m.hospital ? VITALS.bedRegen : VITALS.baseRegen) * dt);
    if (m.hospital && m.hp >= vitalsMax(id)) m.hospital = false;
  }
  if (typeof guideSPRecords !== 'undefined') for (const id of Object.keys(TYPES)) {
    if (here.has(id) || !TYPES[id].guide || !(id in guideSPRecords)) continue;
    guideSPRecords[id] = Math.min(guideSPMax(), guideSPRecords[id] + VITALS.baseRegen * dt);
  }
  G.towers = G.towers.filter(t => !t.vitalsGone);   // 走去醫院的隊員：離開這張地圖
  updateAshSoothe(dt);
  if (performance.now() - vitalsSavedAt > 2000) { saveVitals(); if (typeof saveGuideSP === 'function') saveGuideSP(); }
}
window.addEventListener('beforeunload', () => { if (typeof G !== 'undefined' && G && MAP_SAFE && !G.vitalsSkip) updateVitals(0); saveVitals(); });

// 隊員 HP／負荷（Y102隊員面板用：在應變中心時看紀錄，不在這張地圖的人也看得到）
function vitalsOf(id) {
  const live = typeof G !== 'undefined' && G && G.towers && G.towers.find(t => t.type === id);
  if (live) return live;
  const m = vitals.mates[id];
  return m ? { hp: Math.max(0, Math.min(vitalsMax(id), m.hp)), maxhp: vitalsMax(id), taint: m.taint || 0 } : null;
}

// ---- 叫隊員去醫院（對話框的「🏥 去醫院休息」）----
const canSendToHospital = a => !!(a && a.kind === 'tower' && MAP_SAFE && !vitalsPractice() && TYPES[a.type] && a.hp < a.maxhp && !vitalsMate(a.type).hospital && !a.vitalsLeaving);
function sendToHospital(t) {
  if (!canSendToHospital(t)) return;
  vitalsMate(t.type).hospital = true; saveVitals();
  if (onHospitalMap()) { systemNotice(TYPES[t.type].name + '去病床躺著休息'); return; }   // 已經在醫院：下一幀自己去找病床
  // 走到這張地圖最近的出入口，然後離開（下次去醫院就看得到他躺在病床上）
  let best = null, bd = Infinity;
  for (const pt of mapPortals || []) { const [x, y] = center(pt.c, pt.r), d = Math.hypot(x - t.x, y - t.y); if (d < bd) { bd = d; best = { x, y }; } }
  t.vitalsLeaving = { t: 0, to: best };
  if (best) { t.mode = 'goto'; t.target = { x: best.x, y: best.y }; t.anchor = null; t.waitT = 0; t.navPath = null; t.navGoal = null; t.sitting = null; t.seatGoal = null; }
  systemNotice(TYPES[t.type].name + '前往 ' + VITALS.hospitalMap + ' 休息');
}
function stepLeaving(t, dt) {
  const L = t.vitalsLeaving; L.t += dt;
  const there = !L.to || Math.hypot(L.to.x - t.x, L.to.y - t.y) < CELL * 1.2;
  if (there || L.t > VITALS.leaveTimeout || (t.navFailed && L.t > 1)) t.vitalsGone = true;
  else if (L.to && t.mode !== 'goto') { t.mode = 'goto'; t.target = { x: L.to.x, y: L.to.y }; }
}

// ---- 疏導室：請亞許幫忙疏導（對話框的「🫶 請亞許疏導」）----
// 亞許一位一位走過去，站定閉眼疏導 ashSootheTime 秒，每次降 SOOTHE.heal 負荷；負荷降到 0 才換下一位，沒人要疏導就回去平常的位置
let ashJob = null;
const ashNpc = () => (G.npcs || []).find(n => n.id === VITALS.ash) || null;
const ashTargets = () => G.towers.filter(t => t.hp > 0 && !TYPES[t.type].guide && (t.taint > 0 || t.berserk) && !t.vitalsLeaving);
const canAskAsh = a => !!(a && a.kind === 'npc' && a.id === VITALS.ash && onSootheRoom() && !ashJob && ashTargets().length);
function askAshSoothe() {
  if (!onSootheRoom() || !ashTargets().length) { sfx('error'); return; }
  ashJob = { target: null, t: 0 };
  systemNotice((CHARACTERS[VITALS.ash]?.name || '亞許') + '開始幫大家疏導');
}
function updateAshSoothe(dt) {
  if (!ashJob) return;
  const ash = ashNpc();
  if (!ash || !onSootheRoom()) { ashJob = null; return; }
  let t = ashJob.target;
  if (!t || !G.towers.includes(t) || t.hp <= 0 || !(t.taint > 0 || t.berserk)) {   // 換下一位：負荷最高的優先
    t = ashJob.target = ashTargets().sort((a, b) => b.taint - a.taint)[0] || null; ashJob.t = 0; ashJob.walkT = 0;
    if (!t) { ashJob = null; ash.soothingT = 0; ash.waitT = 1; systemNotice('疏導室的隊員都疏導完了'); return; }
  }
  ash.target = null; ash.sitting = null; ash.seatGoal = null;
  const d = Math.hypot(t.x - ash.x, t.y - ash.y);
  if (ashJob.t <= 0 && d > CELL * 1.6) {   // 先走過去；走不過去（被家具擋住）走了 ashWalkMax 秒就在原地疏導
    ashJob.walkT = (ashJob.walkT || 0) + dt;
    if (ashJob.walkT < VITALS.ashWalkMax) { followTarget(ash, t, { dist: CELL * 1.1, speed: 75 }, dt); return; }
  }
  if (ashJob.t <= 0) {   // 開始疏導：兩個人站定、亞許閉眼
    ashJob.t = VITALS.ashSootheTime; spawnSootheCast(ash, VITALS.ashSootheColor, 0);
    if (typeof sfxAt === 'function') sfxAt('soothe', ash.x, ash.y, .5, 'ash-soothe');
  }
  ashJob.t -= dt;
  ash.soothingT = Math.max(ashJob.t, .05); ash.moving = false; ash.dir = 'front';
  t.frozenT = Math.max(t.frozenT || 0, .1);
  if (typeof spawnSootheMotes === 'function') spawnSootheMotes([ash, t], VITALS.ashSootheColor, dt, ashJob);
  if (ashJob.t > 0) return;
  const before = t.taint || 0;
  t.taint = Math.max(0, before - SOOTHE.heal); if (t.berserk && t.taint < 60) t.berserk = false;   // 跟溫特疏導一次一樣的量
  spawnSootheEffect(t.x, t.y - 8, VITALS.ashSootheColor, t);
  if (typeof sfxAt === 'function') sfxAt('sootheEnd', t.x, t.y, .5, 'ash-soothe-end');
  sentryStatus(t, '疏導 -' + Math.round(before - t.taint), '#7ee0c0');
  ash.soothingT = 0; ashJob.t = 0;
}
// 疏導中的亞許：不要自己走開（js/sentry.js 的 updateWanderer 先問這裡）
const ashBusy = npc => !!(ashJob && npc && npc.id === VITALS.ash);

// ---- 對話框的按鈕（game.js 的 openDialogue 呼叫）----
function onDialogueOpenedVitals(actor) {
  const hosp = document.getElementById('dialogueHospital'), ash = document.getElementById('dialogueAshSoothe');
  if (hosp) hosp.classList.toggle('hidden', !canSendToHospital(actor));
  if (ash) ash.classList.toggle('hidden', !canAskAsh(actor));
}
document.getElementById('dialogueHospital')?.addEventListener('click', () => {
  const a = dialogueState && dialogueState.actor; closeDialogue(true); sfx('button'); sendToHospital(a);
});
document.getElementById('dialogueAshSoothe')?.addEventListener('click', () => { closeDialogue(true); sfx('button'); askAshSoothe(); });
