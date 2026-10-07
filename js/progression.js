/* 異質結晶與哨兵養成。獨立存檔，不改動地圖與編隊存檔。 */
const TRAINING_KEY = 'sentinel-crystals-v1';
const training = { crystals: 0, levels: {} };
try {
  const saved = JSON.parse(localStorage.getItem(TRAINING_KEY) || '{}');
  training.crystals = Number.isSafeInteger(saved.crystals) && saved.crystals >= 0 ? saved.crystals : 0;
  for (const key of Object.keys(TYPES)) training.levels[key] = Math.max(1, Math.min(30, Math.floor(Number(saved.levels?.[key]) || 1)));
} catch (_) {}
const trainingBase = Object.fromEntries(Object.entries(TYPES).map(([key,s]) => [key,{hp:s.hp,dmg:s.dmg}]));
function applyTraining() {
  for (const [key, base] of Object.entries(trainingBase)) {
    const n = (training.levels[key] || 1)-1;
    TYPES[key].hp = Math.round(base.hp*(1+n*.10));
    TYPES[key].dmg = Math.round(base.dmg*(1+n*.08));
  }
}
applyTraining();
function saveTraining() {
  try { localStorage.setItem(TRAINING_KEY,JSON.stringify(training)); }
  catch (_) {}
}
function earnCrystals(amount) {
  training.crystals += Math.max(0, Math.floor(amount || 0));
  saveTraining();
  if (typeof isSquadPanelOpen === 'function' && isSquadPanelOpen()) renderSquadPanel();
}
function sentryLevel(type) { return training.levels[type] || 1; }
function sentryUpgradeCost(type) { return 30 * sentryLevel(type); }
function canUpgradeSentry(type) {
  const spec = TYPES[type];
  return !!spec && typeof MAP_SAFE !== 'undefined' && MAP_SAFE && sentryLevel(type) < 30 && training.crystals >= sentryUpgradeCost(type);
}
function upgradeSentry(type) {
  if (!canUpgradeSentry(type)) return false;
  const cost = sentryUpgradeCost(type);
  training.crystals -= cost;
  training.levels[type] = sentryLevel(type) + 1;
  applyTraining(); saveTraining();
  if (typeof G !== 'undefined' && G) for (const t of G.towers) if (t.type === type) {
    const ratio = t.maxhp > 0 ? t.hp / t.maxhp : 1;
    t.maxhp = TYPES[type].hp; t.hp = Math.max(0, ratio * t.maxhp);
  }
  return true;
}
// 異質核心（生成、甦醒、召喚、繪製、碎裂）在 js/anomalous-core.js
