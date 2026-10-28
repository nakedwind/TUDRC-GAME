/* ===== 隊友被怪物攻擊時的頭上泡泡 =====
   ・戰鬥地圖裡隊友（哨兵、嚮導）被打、快沒血、倒下、被特定怪物的招式命中時，頭上冒一句台詞。
   ・台詞都在 data/dialogues.js（用「對話編輯器.html」編輯，「戰鬥中・被怪物攻擊」那幾格）；沒填就不說話。
   ・泡泡沿用一般的頭上泡泡（t.say，js/render.js 的 drawSpeechBubble），被虱目魚小子吞掉時畫在魚頭上。
   ・不洗版：一般被打有機率才說、說完要冷卻；特殊招式各自冷卻；快沒血每次掉到門檻以下只說一次；倒下每次只說一次。
   ・重要的蓋掉不重要的：吞掉 ＞ 倒下 ＞ 特殊招式 ＞ 快沒血 ＞ 一般被打。一般被打不會蓋掉正在說的其他話。
   必須在 js/dialogue-data.js 之後載入；js/game.js 每幀呼叫 mateHurtTick，各怪物的招式命中時呼叫 mateHurtSay。
*/
const MATE_HURT_TALK = {
  life: 2.8,          // 泡泡停留幾秒
  hurtChance: .45,    // 一般被打時有多少機率說話（0～1）
  hurtGap: 7,         // 一般被打說完後，至少隔幾秒才會再說「被打」的台詞
  specialGap: 6,      // 同一種特殊招式（吞、纏、壓、撞）說完後，至少隔幾秒才會再說同一種
  lowHpAt: .3,        // 血量掉到幾成以下算「快沒血」
  lowHpRearm: .5,     // 血量回到幾成以上，下次掉下去才會再說「快沒血」
  chatAfter: 3,       // 說完之後，平常的戰鬥閒聊至少再等幾秒
};
let mateHurtClock = 0;   // 冷卻用的時鐘（跟著遊戲時間走：暫停時不會偷跑）
// 每一格台詞的重要程度（數字大的會蓋掉數字小的）
const MATE_HURT_KEYS = {
  hurt: 1,        // 一般被打
  lowHp: 2,       // 快沒血
  rooted: 3,      // 被絲瓜小姐的藤蔓纏住
  slammed: 3,     // 被葫蘆猴泰山壓頂砸到
  rammed: 3,      // 被鳥頭人（含鳥頭大隊長）衝撞撞到
  down: 4,        // 倒下（失去戰鬥能力）
  swallowed: 5,   // 被虱目魚小子吞掉
};

// 讓隊友說一句「被攻擊」的台詞；key 是上面 MATE_HURT_KEYS 的其中一個。說了回傳 true
function mateHurtSay(t, key) {
  if (!t || MAP_SAFE || t.berserk || !G || !G.towers.includes(t)) return false;   // 暴走的不說話（暴走有自己的台詞）
  const C = MATE_HURT_TALK, pri = MATE_HURT_KEYS[key] || 1, now = mateHurtClock;
  const mh = t.mateHurt || (t.mateHurt = { next: {} });
  if ((mh.next[key] || 0) > now) return false;   // 這一種還在冷卻
  const cur = t.say && t.say.text ? (t.say.hurt || 0) : 0;
  if (t.say && t.say.text && (cur ? pri <= cur && key !== 'down' : pri <= 1)) return false;   // 正在說更重要的（或一般被打不蓋掉閒聊）
  if (cur >= 5 && t.eatenBy) return false;   // 還在魚肚子裡：「吞掉」那句說完前不換
  const text = pickDialogueLine(t.type, key);
  if (!text) return false;   // 沒填台詞：不說話
  t.say = { text, life: C.life, hurt: pri };
  t.sayWait = Math.max(t.sayWait || 0, C.chatAfter);
  mh.next[key] = now + (key === 'hurt' ? C.hurtGap : pri === 3 ? C.specialGap : 0);
  if (key !== 'hurt') mh.next.hurt = Math.max(mh.next.hurt || 0, now + C.hurtGap * .5);   // 剛喊完特殊的，一般被打先別接著說
  return true;
}

// 每幀：看隊友的血有沒有變少，決定要不要說「被打／快沒血／倒下」；也幫這種泡泡倒數（被吞、倒下、被纏時一般的對話不會倒數）
function mateHurtTick(dt) {
  if (!G || MAP_SAFE) return;
  const C = MATE_HURT_TALK;
  mateHurtClock += dt;
  for (const t of G.towers) {
    if (t.say && t.say.hurt) {
      t.say.life -= dt;
      if (t.say.life <= 0) { t.say = null; t.sayWait = Math.max(t.sayWait || 0, C.chatAfter); }
    }
    const max = t.maxhp || (TYPES[t.type] && TYPES[t.type].hp) || 100, hp = t.hp ?? max;
    const mh = t.mateHurt || (t.mateHurt = { next: {} });
    const last = mh.hp ?? hp;
    mh.hp = hp;
    if (hp > 0) mh.downSaid = false;
    if (hp / max >= C.lowHpRearm) mh.lowSaid = false;
    if (hp >= last || t.berserk) continue;   // 沒掉血
    if (hp <= 0) { if (!mh.downSaid) { mh.downSaid = true; mateHurtSay(t, 'down'); } continue; }
    if (t.eatenBy) continue;   // 在魚肚子裡被消化：不另外喊痛
    if (hp / max < C.lowHpAt && !mh.lowSaid) { mh.lowSaid = true; if (mateHurtSay(t, 'lowHp')) continue; }
    if ((mh.next.hurt || 0) > mateHurtClock) continue;   // 剛說過（或剛抽過）
    if (Math.random() < C.hurtChance) mateHurtSay(t, 'hurt');
    else mh.next.hurt = mateHurtClock + 1;   // 沒抽到：一秒內別再抽（持續掉血時不會每幀都抽）
  }
}
