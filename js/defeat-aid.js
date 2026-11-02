// ============================================================
//  連續失利補助：同一張戰鬥地圖連續「全滅」DEFEAT_AID.streak 次，應變中心撥款 DEFEAT_AID.money 元
//  ・全滅＝溫特陣亡，而且這次帶出去的隊員（不算球球）至少 DEFEAT_AID.minMates 人、全部倒下。
//  ・營地被摧毀的失敗：不算一次，也不歸零。打贏、溫特陣亡但有隊員還站著：歸零。換了別張地圖：從頭算。
//  ・練習模式（js/practice.js）、測試模式、新手區、地圖預覽不算。
//  ・錢加在這次的作戰經費（G.money）上：回基地、重新部署時會跟剩下的經費一起變成錢包（js/progression.js 的 settleSortieMoney、
//    js/combat-progress.js 的 keepBattleMoney），不會被蓋掉。錢包也先加上去，萬一還沒結算就關掉網頁，錢也還在。
// ============================================================
const DEFEAT_AID = { streak: 2, money: 10000, minMates: 3 };
const DEFEAT_AID_KEY = 'tudrc_defeat_aid_v1';
let defeatAid = (() => { try { const d = JSON.parse(localStorage.getItem(DEFEAT_AID_KEY) || 'null'); return d && typeof d.map === 'string' ? { map: d.map, count: Math.max(0, Math.floor(d.count) || 0) } : { map: '', count: 0 }; } catch (_) { return { map: '', count: 0 }; } })();
function saveDefeatAid() { try { localStorage.setItem(DEFEAT_AID_KEY, JSON.stringify(defeatAid)); } catch (_) {} }
// 這一場算不算（練習、測試、新手區、預覽、基地裡都不算）
function defeatAidCounts() {
  if (window.TEST_MODE || MAP_SAFE || !MAP || !MAP.id || PREVIEW || MONSTER_PREVIEW_ID) return false;
  if (typeof practiceOn === 'function' && practiceOn()) return false;
  if (typeof isNewbieMap === 'function' && isNewbieMap()) return false;
  return true;
}
// 溫特陣亡那一刻：帶出去的隊員（TYPES 裡的；球球是 G.npcs，不在這裡）是不是至少 minMates 人、全部倒下
function defeatAidWiped() {
  const mates = (G.towers || []).filter(t => TYPES[t.type]);
  return mates.length >= DEFEAT_AID.minMates && mates.every(t => !(t.hp > 0));
}
function defeatAidRecord(wiped) {
  if (!wiped) { if (defeatAid.count) { defeatAid.count = 0; saveDefeatAid(); } return 0; }
  defeatAid.count = defeatAid.map === MAP.id ? defeatAid.count + 1 : 1;
  defeatAid.map = MAP.id;
  let paid = 0;
  if (defeatAid.count >= DEFEAT_AID.streak) {
    paid = DEFEAT_AID.money; defeatAid.count = 0;
    G.money = (G.money || 0) + paid;
    if (typeof walletSet === 'function') walletSet(walletGet() + paid);
  }
  saveDefeatAid();
  return paid;
}
// 包住 game.js 的 lose／win／loseOverlay（跟 js/result-screen.js 一樣的寫法）
const defeatAidBaseLose = lose;
lose = function (reason, cause) {
  if (G && !G.over && reason === 'player' && defeatAidCounts()) {
    G.defeatAidPaid = defeatAidRecord(defeatAidWiped());
    if (G.defeatAidPaid) setTimeout(() => systemNotice('連續失利補助：應變中心撥款 $' + G.defeatAidPaid.toLocaleString()), PLAYER_DEATH.total * 1000 + 300);
  }
  return defeatAidBaseLose.call(this, reason, cause);
};
const defeatAidBaseWin = win;
win = function (...args) {
  if (G && !G.over && defeatAidCounts()) defeatAidRecord(false);
  return defeatAidBaseWin.apply(this, args);
};
const defeatAidBaseLoseOverlay = loseOverlay;
loseOverlay = function (...args) {
  const r = defeatAidBaseLoseOverlay.apply(this, args);
  const box = document.getElementById('ov-text');
  if (box && G && G.defeatAidPaid) box.insertAdjacentHTML('afterbegin',
    '<div class="defeat-aid" style="margin:0 0 10px;padding:8px 12px;border:1px solid #e0b34a;border-radius:8px;background:rgba(224,179,74,.14);color:#ffd77a">' +
    '🏛️ 連續失利補助：應變中心撥款 <b>$' + G.defeatAidPaid.toLocaleString() + '</b><br><small>同一區連續兩次全員倒下，補助已加進作戰經費，回基地會存進錢包。</small></div>');
  return r;
};
