// ============================================================
//  三段難度：開新遊戲時的選難度畫面、簡單難度的原地復活、設定選單顯示目前難度
//  ・數值（每段難度的倍率）在 data/monsters.js 的 DIFFICULTY_SETTINGS_DEFAULT，「怪物編輯器 → 🎚️ 難度」調
//  ・讀數值、玩家選了哪一段：js/monster-data.js 的 difficultyValue／currentDifficultyId
//  ・選好的難度怎麼存進新遊戲：js/new-game.js（開新遊戲時呼叫這裡的 pickDifficulty）
//  ・難度只在開新遊戲時選，之後不能改
//  要在 js/defeat-aid.js 之後載入：原地復活要包在 lose 最外層，站起來就不算戰敗
// ============================================================

// ---- 選難度畫面（開新遊戲時跳出來）----
// text：原本確認框要說的話（會重設哪些東西）；onPick(id)：選好了；按取消或 Esc 就什麼都不做
function pickDifficulty(text, onPick) {
  if (document.querySelector('.difficulty-pick')) return;
  const wrap = document.createElement('div');
  wrap.className = 'difficulty-pick';
  const card = document.createElement('div');
  card.className = 'difficulty-card'; card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-labelledby', 'difficultyPickTitle');
  const title = document.createElement('h2'); title.id = 'difficultyPickTitle'; title.textContent = '選擇難度';
  const info = document.createElement('p'); info.className = 'difficulty-info'; info.textContent = text;
  const list = document.createElement('div'); list.className = 'difficulty-options';
  const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = ev => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); close(); } };
  for (const level of DIFFICULTY_LEVELS) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'difficulty-option difficulty-' + level.id;
    const icon = document.createElement('span'); icon.className = 'difficulty-icon'; icon.textContent = level.icon; icon.setAttribute('aria-hidden', 'true');
    const name = document.createElement('strong'); name.textContent = level.name;
    const desc = document.createElement('small'); desc.textContent = level.desc;
    b.append(icon, name, desc);
    b.addEventListener('click', () => { close(); onPick(level.id); });
    list.append(b);
  }
  const note = document.createElement('p'); note.className = 'difficulty-note'; note.textContent = '開始之後就不能再改難度，要換只能重新開新遊戲。';
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'difficulty-cancel'; cancel.textContent = '取消';
  cancel.addEventListener('click', close);
  card.append(title, info, list, note, cancel);
  wrap.append(card);
  wrap.addEventListener('click', ev => { if (ev.target === wrap) close(); });   // 點旁邊的空白處＝取消
  (document.getElementById('wrap') || document.body).append(wrap);
  document.addEventListener('keydown', onKey, true);
  const normal = list.querySelector('.difficulty-normal'); if (normal) normal.focus();
}
window.pickDifficulty = pickDifficulty;

// ---- 簡單難度：每一場第一次倒下原地站起來 ----
// 次數、站起來回幾成血在難度設定的 revives／reviveHp；站起來後 DIFFICULTY_REVIVE_GRACE 秒內怪物的直接攻擊打不到（js/combat-feel.js 的受傷無敵）
const DIFFICULTY_REVIVE_GRACE = 2;
function difficultyTryRevive(cause) {
  if (typeof G === 'undefined' || !G || G.over || !G.player || MAP_SAFE) return false;
  if (typeof practiceOn === 'function' && practiceOn()) return false;
  const max = difficultyValue('revives'), used = G.difficultyRevived || 0;
  if (!(max > used)) return false;
  G.difficultyRevived = used + 1;
  const p = G.player, maxhp = p.maxhp || (typeof PLAYER !== 'undefined' ? PLAYER.hp : 100);
  p.hp = Math.max(1, Math.round(maxhp * difficultyValue('reviveHp')));
  p.hurtGraceT = Math.max(p.hurtGraceT || 0, DIFFICULTY_REVIVE_GRACE);
  p.hitT = 0;
  // 倒在深水裡、捷運軌道上：原地站起來馬上又會倒，改成回營地站起來
  const hazard = p.drowning || (p.poolFall && p.poolFall.phase === 'struggle') || /溺水|列車/.test(cause || '');
  if (hazard && typeof playerSpawnPos === 'function') {
    const [x, y] = playerSpawnPos();
    p.x = x; p.y = y; p.moving = false; p.drowning = false; p.poolFall = null; p.trackJump = null;
    if (typeof updateCamera === 'function') updateCamera();
  }
  const left = max - G.difficultyRevived;
  if (typeof flash === 'function') flash('🌱 重新站起來了！', p.x, p.y - 80, '#8fe3a8', 1.6);
  if (typeof systemNotice === 'function') systemNotice((currentDifficulty() || {}).name + '難度：部隊長' + (hazard ? '回到營地' : '') + '重新站起來了' + (left > 0 ? '（這場還能再站起來 ' + left + ' 次）' : '（這場不能再站起來了）'));
  if (typeof sfx === 'function') sfx('blip');
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}
const difficultyBaseLose = lose;
lose = function (reason, cause) {
  if (reason === 'player' && difficultyTryRevive(cause)) return;
  return difficultyBaseLose.apply(this, arguments);
};

// ---- 設定選單的存檔頁：顯示目前難度 ----
window.addEventListener('DOMContentLoaded', () => {
  const head = document.querySelector('#settings-save .save-heading');
  if (!head) return;
  const tag = document.createElement('p'); tag.className = 'set-hint difficulty-tag';
  const lv = currentDifficulty();
  tag.textContent = '目前難度：' + lv.icon + ' ' + lv.name + '（開新遊戲時選）';
  head.append(tag);
});
