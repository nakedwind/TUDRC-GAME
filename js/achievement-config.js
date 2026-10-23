/* ===== 成就：設定（遊戲 js/achievements.js、成就編輯器 js/achievement-editor.js 共用）=====
   資料在 data/achievements.js 的 ACHIEVEMENT_DATA（由「🏆 成就編輯器」匯出）。
   ・ACHIEVE_STATS：遊戲會累計的數字（程式裡呼叫 addStat 的地方）。成就的條件只能從這裡選；要加新的種類得改程式。
   ・kill:怪物 id：擊倒某一種怪物的次數＝怪物圖鑑的消滅次數（js/bestiary.js；史萊姆變體是 kill:slime:splitter 這樣），
     怪物清單跟怪物圖鑑一樣（js/bestiary-config.js 的 bestiaryBaseList），所以新增怪物後不用改這裡。
   ・desc：成就說明＝玩家在成就畫面看到的達成條件（照寫的顯示）。stat／goal 是遊戲怎麼算，玩家看不到。
   ・自訂條件（stat: 'custom'）：遊戲還不會算的條件；請 Claude 照 desc 的說明實作，實作後換成正式的 stat（desc 保留）。
     還沒實作前遊戲裡不顯示（js/achievements.js）。舊資料的 custom 文字會讀成 desc。
   必須在 data/achievements.js 之後載入；怪物名稱要等 js/bestiary-config.js 載入後才拿得到（用到時才去讀）。
*/
const ACHIEVE_STATS = [
  { id: 'slimeKills', name: '討伐史萊姆（所有種類都算）' },
  { id: 'giantKills', name: '擊倒巨型史萊姆' },
  { id: 'bomberKills', name: '擊倒自爆史萊姆' },
  { id: 'splitterKills', name: '擊倒分裂史萊姆' },
  { id: 'spitterKills', name: '擊倒吐酸史萊姆' },
  { id: 'crits', name: '溫特打出爆擊' },
  { id: 'soothes', name: '溫特親自疏導哨兵' },
  { id: 'berserkCalmed', name: '把暴走的隊友疏導回來' },
  { id: 'wins', name: '守住營地（戰鬥勝利）' },
  { id: 'fullControls', name: '徹底控制一個區域（清除所有核心與異質體）' },
  // ---- 10/23 加的（成就編輯器的自訂條件）----
  { id: 'revives', name: '溫特用異質急救包把倒下的隊員救回來' },
  { id: 'acidDeaths', name: '溫特被阿瓦倫的腐蝕波及而倒下' },
  { id: 'pistolDamage', name: '溫特用手槍造成的傷害（累計）' },
  { id: 'flawlessWins', name: '守住營地，而且營地完全沒受傷' },
  { id: 'controlNoMedkit', name: '一場戰鬥都沒用醫療包就徹底控制區域' },
  { id: 'fastWins', name: '10 分鐘內打贏（守住營地或徹底控制區域）' },
  { id: 'brokeInBattle', name: '在戰鬥中把經費花到 0' },
  { id: 'almondInBattle', name: '一場戰鬥中喝最多幾瓶杏仁水（含保溫杯）' },
  { id: 'graffitis', name: '畫塗鴉（次數）' },
  { id: 'longestSit', name: '在基地坐在同一張椅子上最久（分鐘，不算床）' },
  { id: 'longestIdle', name: '待在原地不動最久（分鐘）' },
  { id: 'longestMove', name: '不間斷移動最久（分鐘；中途停下不超過 20 秒都算連續）' },
  { id: 'stairFloors', name: '走樓梯換樓層（每走一次算 1 層）' },
  { id: 'elevatorStreak', name: '連續只搭電梯換樓層（最多連續幾次；走一次樓梯就重算）' },
  { id: 'othersBeds', name: '躺別人寢室的床（次數）' },
  { id: 'ownBed', name: '溫特躺自己的床（溫特寢室）' },
  { id: 'allRooms', name: '參觀過基地的每一個房間（全部去過＝1）' },
  { id: 'allChairs', name: '坐過基地裡的每一張椅子（全部坐過＝1，不算床）' },
  { id: 'allSnacks', name: '買過每一種零食和飲料（全部買過＝1）' },
  { id: 'talkedAll', name: '跟基地裡每一位角色都說過話（全部說過＝1）' },
  { id: 'allPosters', name: '看過每一張宣導海報（data/posters.js 裡有大圖 art 的海報；全部看過＝1）' },
  { id: 'gifts', name: '送禮（次數，零食飲料和服裝都算）' },
  { id: 'tpBestScore', name: '射擊練習室限時挑戰：最高分' },
  { id: 'tpMostShots', name: '射擊練習室限時挑戰：一場最多發射幾發' },
  { id: 'vendItems', name: '在販賣機買的商品（件數）' },
  { id: 'vendBuys', name: '在販賣機結帳（次數）' },
  { id: 'vendSpent', name: '在販賣機花的錢' },
  { id: 'shopItems', name: '在商店買的商品（件數；便利商店、飲料店、後室商店）' },
  { id: 'shopBuys', name: '在商店結帳（次數）' },
  { id: 'shopSpent', name: '在商店花的錢' },
  { id: 'moneySpent', name: '總共花掉的錢（商店、販賣機、蓋建築）' },
  { id: 'gachaPulls', name: '扭蛋（次數）' },
  { id: 'gachaItems', name: '從扭蛋機拿到的東西（個數，重複的也算）' },
  { id: 'crystalsSpent', name: '花掉的異質碎片（扭蛋、開發工坊、技能）' },
  { id: 'crystalsEarned', name: '獲得的異質碎片' },
];
// 「溫特被暴走的○○打倒」（downedBy:角色 id）、「全員戴上○○」（allWear:配件 id）：跟擊倒怪物一樣，用第二層選單選對象
const ACHIEVE_CUSTOM = 'custom';   // 自訂條件（等 Claude 實作）
const ACHIEVE_TEXT_DEFAULT = {
  title: '成就', subtitle: 'Y102 應變編組的戰績紀錄', overview: '總覽', total: '已達成',
  recent: '最近達成', pending: '尚未完成', empty: '還沒有達成的成就，出去打一場吧！',
  toast: '達成成就', secret: '？？？', doneDate: '達成',
};
const ACHIEVE_TEXT_LABELS = {   // 成就編輯器裡每個文字欄位的說明
  title: '畫面標題', subtitle: '標題下面的說明', overview: '「總覽」分頁的名稱', total: '達成進度的字（已達成 3 / 19）',
  recent: '總覽：最近達成', pending: '總覽：尚未完成', empty: '還沒有達成任何成就時顯示的字',
  toast: '右下角通知的小標題', secret: '隱藏成就達成前顯示的名稱', doneDate: '達成日期後面的字（2026/10/23 達成）',
};
const ACHIEVE_COUNT_DEFAULT = { recent: 3, pending: 3 };

// 資料整理成固定的樣子（沒寫的用預設值）；data 不傳＝用 data/achievements.js
function achieveCfg(data) {
  const d = data || (typeof ACHIEVEMENT_DATA !== 'undefined' ? ACHIEVEMENT_DATA : {});
  const list = (Array.isArray(d.list) ? d.list : []).filter(a => a && a.id).map(a => ({
    id: String(a.id), group: String(a.group || '其他'), name: String(a.name || ''), stat: String(a.stat || ''),
    goal: Math.max(1, Math.floor(Number(a.goal) || 1)), secret: !!a.secret,
    desc: String(a.desc ?? a.custom ?? ''),   // 成就說明（玩家看得到）；舊的自訂條件文字（custom）也當說明
    note: String(a.note || ''),               // 算法補充（只有編輯器看得到；給 Claude 實作自訂條件用）
  }));
  const groups = (Array.isArray(d.groups) ? d.groups : []).map(String);
  for (const a of list) if (!groups.includes(a.group)) groups.push(a.group);   // 成就用到、但分類清單裡沒有的分類：接在後面
  const counts = { ...ACHIEVE_COUNT_DEFAULT, ...(d.counts || {}) };
  return {
    groups, list,
    board: (Array.isArray(d.board) ? d.board : []).filter(b => b && b.stat).map(b => ({ stat: String(b.stat), label: String(b.label || achieveStatName(b.stat)) })),
    texts: { ...ACHIEVE_TEXT_DEFAULT, ...(d.texts || {}) },
    counts: { recent: Math.max(0, Math.floor(+counts.recent || 0)), pending: Math.max(0, Math.floor(+counts.pending || 0)) },
  };
}
// 所有能當成就條件的數字：固定的幾項＋每一種怪物的擊倒次數
function achieveStatList() {
  const monsters = typeof bestiaryBaseList === 'function' ? bestiaryBaseList() : [];
  const names = typeof bestiaryEntries === 'function' ? Object.fromEntries(bestiaryEntries(undefined, true).map(e => [e.key, e.name])) : {};   // 怪物圖鑑裡改過的名稱
  const fighters = typeof CHARACTERS !== 'undefined' ? Object.values(CHARACTERS).filter(c => c.combat && c.kind !== 'player') : [];
  const accs = typeof COSTUME_ACCESSORIES !== 'undefined' ? COSTUME_ACCESSORIES : [];
  const giftable = typeof CHARACTERS !== 'undefined' ? Object.values(CHARACTERS).filter(ch => ch.kind !== 'player' && (typeof GIFT_PREFS === 'undefined' || GIFT_PREFS[ch.id])) : [];
  const nameOf = id => (typeof CHARACTERS !== 'undefined' && CHARACTERS[id] && CHARACTERS[id].name) || id;
  // 「同時帶著○○出勤」：成就資料裡已經用到的組合都列出來（要新的組合：選自訂條件，請 Claude 加）
  const combos = [...new Set((typeof ACHIEVEMENT_DATA !== 'undefined' ? ACHIEVEMENT_DATA.list : []).map(a => String(a.stat)).filter(x => x.startsWith('sortieWith:')))];
  return [
    ...ACHIEVE_STATS.map(s => ({ ...s, group: '戰績' })),
    ...fighters.map(ch => ({ id: 'downedBy:' + ch.id, name: '溫特被暴走的「' + ch.name + '」打倒', group: '溫特被某位暴走的隊員打倒' })),
    ...accs.map(a => ({ id: 'allWear:' + a.id, name: '全員戴上「' + a.name + '」（全部戴上＝1）', group: '全員穿戴某件配件' })),
    ...giftable.map(ch => ({ id: 'giftsTo:' + ch.id, name: '送「' + ch.name + '」禮物（次數，零食飲料和服裝都算）', group: '送某位角色禮物' })),
    ...combos.map(id => ({ id, name: '帶著 ' + id.slice(11).split('+').map(nameOf).join('、') + ' 一起出勤（進入戰鬥地圖時算 1 次）', group: '同時帶著某幾位隊員出勤' })),
    ...monsters.map(m => ({ id: 'kill:' + m.key, name: '擊倒「' + (names[m.key] || m.name) + '」', group: '擊倒某一種怪物（跟怪物圖鑑的消滅次數一樣）' })),
  ];
}
function achieveStatName(id) {
  if (id === ACHIEVE_CUSTOM) return '自訂條件（等 Claude 實作）';
  const s = ACHIEVE_STATS.find(x => x.id === id); if (s) return s.name;
  const m = achieveStatList().find(x => x.id === id); return m ? m.name : String(id || '');
}
