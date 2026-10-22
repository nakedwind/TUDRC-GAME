/* 異質碎片與哨兵養成（技能樹在 js/skills.js、data/skills.js）。獨立存檔，不改動地圖與編隊存檔。 */
const TRAINING_KEY = 'sentinel-crystals-v1';
const training = { crystals: 0, skills: {} };
try {
  const saved = JSON.parse(localStorage.getItem(TRAINING_KEY) || '{}');
  training.crystals = Number.isSafeInteger(saved.crystals) && saved.crystals >= 0 ? saved.crystals : 0;
  if (saved.skills && typeof saved.skills === 'object') training.skills = saved.skills;
  // 舊的升等系統已經拿掉：之前升等花掉的碎片全部退回（Lv.n 花了 30×(1+2+…+(n−1))）
  if (saved.levels && !saved.levelsRefunded) {
    let refund = 0;
    for (const lv of Object.values(saved.levels)) { const n = Math.max(1, Math.min(30, Math.floor(Number(lv) || 1))); refund += 30 * (n - 1) * n / 2; }
    training.crystals += refund;
    if (refund) setTimeout(() => { if (typeof systemNotice === 'function') systemNotice('升等系統改成技能樹，之前升等花的 ◆ ' + refund + ' 已退回'); }, 1500);
  }
} catch (_) {}
function saveTraining() {
  try { localStorage.setItem(TRAINING_KEY,JSON.stringify({ ...training, levelsRefunded: true })); }
  catch (_) {}
}
function earnCrystals(amount) {
  if (typeof addStat === 'function' && amount > 0) addStat('crystalsEarned', Math.floor(amount));   // 成就：獲得的異質碎片
  training.crystals += Math.max(0, Math.floor(amount || 0));
  if (typeof G !== 'undefined' && G && G.battle && !MAP_SAFE) G.battle.crystals += Math.max(0, Math.floor(amount || 0));   // 結算畫面
  saveTraining();
  if (typeof isSquadPanelOpen === 'function' && isSquadPanelOpen()) renderSquadPanel();
}
// 異質核心（生成、甦醒、召喚、繪製、碎裂）在 js/anomalous-core.js

// ===== 錢包：基地裡的錢（存在瀏覽器）=====
// 出勤時：錢包裡的錢全部帶出去，加上戰鬥地圖給的「作戰經費」（地圖編輯器的規則 money，預設 3000），打怪不會加錢。
// 回到安全區（基地）時：剩下的錢全部變成錢包的錢（因為出勤時已經把錢包整個帶出去了）。基地裡（商店、販賣機）花的是錢包的錢。
const WALLET_KEY = 'tudrc_wallet_v1', WALLET_START = 300;   // 第一次玩時錢包有多少
let wallet = (() => { try { const v = Number(localStorage.getItem(WALLET_KEY)); return localStorage.getItem(WALLET_KEY) == null ? WALLET_START : Math.max(0, Math.floor(v) || 0); } catch (_) { return WALLET_START; } })();
function walletGet() { return wallet; }
function walletSet(n) {
  wallet = Math.max(0, Math.floor(Number(n) || 0));
  try { localStorage.setItem(WALLET_KEY, String(wallet)); } catch (_) {}
}
// 離開戰鬥地圖時（換地圖之前呼叫）：剩下的作戰經費帶回錢包
function settleSortieMoney() {
  if (typeof G === 'undefined' || !G || MAP_SAFE || G.moneySettled || window.TEST_MODE) return;
  if (G.phase === 'ready') return;   // 還沒開始作戰（只是載入地圖）：不算
  G.moneySettled = true;
  const left = Math.max(0, Math.floor(G.money || 0));
  walletSet(left);   // 錢包的錢出勤時已經全部帶出去了，所以剩下多少，錢包就是多少（不是再加上去）
  if (!left) return;
  setTimeout(() => { if (typeof systemNotice === 'function') systemNotice('作戰經費剩下 $' + left + '，已帶回基地'); }, 900);
}
