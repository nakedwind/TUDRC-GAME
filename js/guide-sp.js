/* Each allied guide keeps SP across scenes; drinks restore it, soothing spends it. */
const GUIDE_SP_STORE = 'tudrc_guide_sp_v1';
const guideSPRecords = Object.create(null);
try {
  const saved = JSON.parse(localStorage.getItem(GUIDE_SP_STORE) || '{}');
  for (const [id, value] of Object.entries(saved || {})) if (TYPES[id]?.guide && Number.isFinite(value)) guideSPRecords[id] = value;
} catch (_) {}
const guideSPMax = () => START.guideMax;
const guideSPCost = () => SOOTHE.cost;
const guideSPPractice = () => typeof practiceOn === 'function' && practiceOn();
function initGuideSP(t) {
  if (!TYPES[t.type]?.guide) return;
  t.maxsp = guideSPMax();
  if (!Number.isFinite(t.sp)) t.sp = guideSPRecords[t.type] ?? t.maxsp;
  t.sp = Math.max(0, Math.min(t.maxsp, t.sp));
}
function guideSP(t) { initGuideSP(t); return t.sp; }
function guideSPFor(id) {
  const live = typeof G !== 'undefined' && G?.towers?.find(t => t.type === id);
  if (live) return guideSP(live);
  return Math.max(0, Math.min(guideSPMax(), guideSPRecords[id] ?? guideSPMax()));
}
function saveGuideSP(t) {
  if (t && TYPES[t.type]?.guide) guideSPRecords[t.type] = guideSP(t);
  try { localStorage.setItem(GUIDE_SP_STORE, JSON.stringify(guideSPRecords)); } catch (_) {}
}
function rememberGuideSP() {
  for (const t of (typeof G !== 'undefined' && G?.towers) || []) if (TYPES[t.type]?.guide) guideSPRecords[t.type] = guideSP(t);
  saveGuideSP();
}
function warnGuideSP(t) {
  const sp = guideSP(t), threshold = SANITY.swayBelow;
  if (sp >= threshold + 5) t.spWarned = false;
  if (sp >= threshold || t.spWarned || t.hp <= 0) return;
  t.spWarned = true;
  const entry = typeof DIALOGUES !== 'undefined' ? DIALOGUES.characters?.[t.type]?.lowSp : null;
  const lines = typeof chapterPick === 'function' ? chapterPick(entry) : entry;
  const text = Array.isArray(lines) && lines.length ? lines[Math.floor(Math.random() * lines.length)] : SANITY.warnText;
  t.say = { text, life: 4, col: '#c9b8ff' };
  t.sayWait = 8;
}
function spendGuideSP(t) {
  if (guideSPPractice()) return true;
  if (guideSP(t) < guideSPCost()) return false;
  t.sp -= guideSPCost(); saveGuideSP(t); warnGuideSP(t);
  return true;
}
function drinkGuideAlmond(t, fromInventory = false) {
  if (guideSPPractice() || !TYPES[t?.type]?.guide || t.hp <= 0 || t.berserk || t.eatenBy || t.sleepT > 0 || t.frozenT > 0 || t.soothingT > 0) return false;
  const before = guideSP(t), item = supplyById('almond-water');
  if (before >= t.maxsp || !item || !(item.restore > 0)) return false;
  const source = fromInventory ? supplyInventory : guideKit(t);
  const count = fromInventory ? source.get(item.id) || 0 : source[item.id] || 0;
  if (count <= 0) return false;
  if (fromInventory) { if (count === 1) source.delete(item.id); else source.set(item.id, count - 1); }
  else source[item.id] = count - 1;
  t.sp = Math.min(t.maxsp, before + item.restore);
  t.spDrinkCd = 1.5;
  if (t.sp >= SANITY.swayBelow + 5) t.spWarned = false;
  saveGuideSP(t); sfx('drink');
  flash('杏仁水 +' + Math.round(t.sp - before) + ' SP', t.x, t.y - 54, '#8fd3ff');
  if (fromInventory) saveGame();
  updateHUD();
  if (typeof renderFieldSquadHud === 'function') renderFieldSquadHud();
  if (typeof isSquadPanelOpen === 'function' && isSquadPanelOpen()) renderSquadPanel();
  return true;
}
function updateGuideSP(t, dt) {
  if (!TYPES[t.type]?.guide || t.hp <= 0 || t.berserk) return;
  if (guideSPPractice()) return;
  initGuideSP(t); warnGuideSP(t);
  t.spDrinkCd = Math.max(0, (t.spDrinkCd || 0) - dt);
  const restore = supplyById('almond-water')?.restore || 30;
  if (!MAP_SAFE && t.spDrinkCd <= 0 && t.sp <= t.maxsp - restore) drinkGuideAlmond(t);
}
window.addEventListener('beforeunload', rememberGuideSP);
