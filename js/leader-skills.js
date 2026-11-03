/* ===== 艾德林當隊長（玩家操作艾德林）時的能力 =====
   兵分兩路（js/team.js）時，艾德林隊由玩家操作艾德林。技能樹、隊員裝備照樣有用：
   ・槍、防禦、移動速度用他自己的數值：js/game.js 的 playerGun、js/equipment.js 的 leaderSpec。
   ・補血、疏導（急救包、醫療包、疏導）是範圍的，但比較慢、補比較少：data/balance.js 的 CARE_STYLE。
   ・技能樹的嚮導技能（群體補血、守護祝福、生命之泉）和隨身疏導光環，當隊長時都沒有（只有當隊員時才有），免得比溫特還強。
   ・出勤配置裡隊長卡也有補給格，出勤時吃掉，效果加在玩家身上（leaderOnSpawn）。 */
const isLeaderPlay = () => typeof PLAYER_CHARACTER !== 'undefined' && PLAYER_CHARACTER !== 'winter' && !!TYPES[PLAYER_CHARACTER];

// ---- 進地圖、G.player 建好之後（game.js 的 newGame 呼叫）：出勤補給的效果加在玩家身上 ----
function leaderOnSpawn() {
  const p = G && G.player; if (!p || !isLeaderPlay() || MAP_SAFE) return;
  const a = typeof sortie !== 'undefined' && sortie.active[PLAYER_CHARACTER];
  if (!a) return;
  p.buff = { ...a.buff };
  if (p.buff.hp) { p.maxhp = Math.round(p.maxhp * (1 + p.buff.hp)); p.hp = p.maxhp; }
}

// ---- 每一幀（game.js 的 updatePlayer 呼叫）：增益倒數；回傳 true＝要站著不動（目前沒有）----
function updateLeader(p, dt) {
  if (!isLeaderPlay() || MAP_SAFE) return false;
  if (typeof tickSkillBuffs === 'function') tickSkillBuffs(p, dt);   // 別人給的增益倒數
  return false;
}

// ---- 補血、疏導的範圍（data/balance.js 的 CARE_STYLE）：溫特＝只有那一個人；艾德林＝身邊 area 格內的人一起 ----
// first＝原本選的那一個（一定算進去）；ok(o)＝這個人需不需要；withSelf＝自己也算（補血算、疏導不算）
function careTargets(first, ok, withSelf) {
  const st = careStyle(), p = G.player;
  if (!st.area || !p) return first ? [first] : [];
  const near = [...(withSelf ? [p] : []), ...G.towers.filter(o => o.hp > 0 && !o.eatenBy)]
    .filter(o => o === first || (Math.hypot(o.x - p.x, o.y - p.y) <= st.area * CELL && ok(o)));
  if (first && !near.includes(first)) near.unshift(first);
  return near;
}
