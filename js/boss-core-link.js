/* ===== BOSS 守護的異質核心（所有 BOSS 共用）=====
   ・BOSS 還活著：牠守的核心最少留 minHp 滴血，打不破（要先打倒 BOSS，核心才會破）
   ・核心護盾：有 BOSS 守的核心受到的傷害少 shield 成（BOSS 自己有核心護盾的照牠自己的：鳥頭大隊長、大夯吉寶、人面蝶后、
     絲瓜女王、虱目魚王、花蓮老鼠王；這裡只補沒有護盾的：池核 BOSS、魚頭王、金蕉皇帝、珍珠大童）
   ・核心血量越低，BOSS 防禦越低：核心滿血時 BOSS 少受 defMax 成傷害；核心血越少擋越少，核心剩最後一滴血＝完全不擋
     （花蓮老鼠王本來就是「核心＝護甲」：改成照每顆核心剩下的血量算，js/rat-king.js 的 ratKingDamageMul）
   ・哪個 BOSS 守哪顆核心：bossCoreGuards() 一個一個問各 BOSS 的檔案（葫蘆猴王沒有守核心）
   ・什麼時候跑：js/anomalous-core.js 的 updateCores 開頭（核心）、js/game.js 判斷怪物死掉之前（BOSS 防禦）和判斷核心破掉之前（核心）
   數值：怪物編輯器「👑 BOSS 數值」→「🛡️ BOSS 守護的核心（共用）」（data/monsters.js 的 BOSS_SETTINGS_DEFAULT.BOSS_CORE_LINK；
         改了下面的欄位或註解要跑 tools/build-boss-fields.py，跑完把只有行尾變動的其他 BOSS 檔案還原）
   必須在各 BOSS 檔案之後、game.js 之前載入 */
const BOSS_CORE_LINK = applyBossSettings('BOSS_CORE_LINK', {
  minHp: 1,          // BOSS 還活著時，牠守的核心最少留幾滴血（0＝關掉這條規則）
  shield: .25,       // 核心護盾：有 BOSS 守、但 BOSS 自己沒有核心護盾的核心，受到的傷害少幾成（0.25＝受七成五；11-26 從 0.5 砍半，原本太硬打不動）
  defMax: .3,        // 核心滿血時，BOSS 受到的傷害少幾成（0.3＝受七成；11-26 從 0.6 砍半）；核心血越少擋越少，剩最後一滴血＝完全不擋（0＝關掉這條規則）
  noteEvery: 2.5,    // 「打不破」「核心護盾」的提示字最快每隔幾秒跳一次
});

// ---- 哪個 BOSS 守哪幾顆核心：[{ bosses: [怪物…], cores: [核心…], alive: 還有 BOSS 活著, shield: 要不要補核心護盾, def: 要不要算 BOSS 防禦, name }] ----
const bclAlive = e => !!(e && !e.dead && e.hp > 0);
function bossCoreGuards() {
  const out = [], add = (bosses, cores, o = {}) => {
    cores = cores.filter(c => c && !c.dead); bosses = bosses.filter(Boolean);
    if (!cores.length || !bosses.length) return;
    out.push({ bosses, cores, alive: o.alive ?? bosses.some(bclAlive), shield: !!o.shield, def: o.def !== false, name: o.name || '' });
  };
  if (typeof G === 'undefined' || !G) return out;
  const enemies = G.enemies || [];
  for (const e of enemies) if (e.elite && e.guardCore) add([e], [e.guardCore], { name: e.eliteName });   // 鳥頭大隊長（自己有護盾）
  const ck = G.capKing;   // 大夯吉寶：還有大夯吉寶活著（含還躲在帽子裡的）就算（自己有護盾）
  if (ck && !ck.over && ck.core) add(ck.bigs || [], [ck.core], { alive: typeof capKingBigsAlive === 'function' && (capKingBigsAlive(ck).length > 0 || (typeof capKingBigsHidden === 'function' && capKingBigsHidden(ck) > 0)) });
  for (const e of [...enemies.filter(m => m.mothBoss), ...(G.mothBossAway || [])]) if (e.carryCore) add([e], [e.carryCore]);   // 人面蝶后（自己有護盾）
  for (const rec of G.loofahQueens || []) add([rec.e], [rec.core]);   // 絲瓜女王（自己有護盾）
  for (const e of (typeof mkKings === 'function' ? mkKings() : [])) if (e.mk) add([e], [e.mk.core]);   // 虱目魚王（自己有護盾）
  if (G.poolBoss && G.poolBoss.e) add([G.poolBoss.e], [G.poolBoss.core], { shield: true });   // 池核 BOSS 巨大比基尼小丑魚
  const fk = G.fishKing; if (fk && fk.e && !fk.done) add([fk.e], [fk.core], { shield: true });   // 魚頭王
  for (const rec of G.bananaEmperors || []) add([rec.e], [rec.core], { shield: true });   // 金蕉皇帝
  for (const e of enemies) if (e.pearlBoss && e.carryCore) add([e], [e.carryCore], { shield: true });   // 珍珠大童（抱著的時候本來就打不到）
  const rk = G.ratKing;   // 花蓮老鼠王：全場的核心都是牠的護甲（防禦照 js/rat-king.js 的 ratKingDamageMul 算；核心有自己的「每次露出來最多被打幾成」）
  if (rk && rk.e && rk.phase !== 'dead') add([rk.e], G.cores || [], { def: false });
  return out;
}

// ---- 核心這一邊（每一幀、判斷核心破掉之前）：補核心護盾、BOSS 活著就最少留 minHp 滴血 ----
function bossCoreShieldCores() {
  const C = BOSS_CORE_LINK, now = performance.now() / 1000;
  for (const g of bossCoreGuards()) {
    if (!g.alive) continue;
    for (const core of g.cores) {
      if (g.shield && C.shield > 0 && core.awake && core.hp < core.lastHp) {   // 這一幀被打掉的血打折（跟各 BOSS 自己的核心護盾同一個做法）
        core.hp = core.lastHp - (core.lastHp - core.hp) * (1 - C.shield);
        core.lastHp = core.hp; core.hitT = .16;
        if (now > (G.bclShieldNoteAt || 0)) { G.bclShieldNoteAt = now + C.noteEvery; flash('核心護盾', core.x, core.y - CORE.h - 14, '#9fd8ff'); }
      }
      if (C.minHp > 0 && core.hp < C.minHp) {   // 打不破：留最後一滴血
        core.hp = Math.min(core.maxhp, C.minHp); core.lastHp = Math.min(core.lastHp, core.hp);
        if (now > (G.bclMinNoteAt || 0)) { G.bclMinNoteAt = now + C.noteEvery; flash('打不破！先打倒守護它的 BOSS', core.x, core.y - CORE.h - 30, '#ffb27a', 1.6); }
      }
    }
  }
}

// ---- BOSS 這一邊（判斷怪物死掉之前）：核心血越多，BOSS 受到的傷害越少 ----
// 守的核心剩下的血量比例（好幾顆就平均；已經打破的算 0）
function bossCoreHpRatio(cores) {
  if (!cores.length) return 0;
  return cores.reduce((s, c) => s + (c.dead ? 0 : Math.max(0, (c.hp - BOSS_CORE_LINK.minHp)) / Math.max(1, c.maxhp - BOSS_CORE_LINK.minHp)), 0) / cores.length;
}
// 這隻 BOSS 現在受到的傷害倍率（1＝照原本）；沒有守核心＝1
function bossCoreDamageMul(e) {
  const C = BOSS_CORE_LINK; if (!(C.defMax > 0) || !e) return 1;
  const g = bossCoreGuards().find(x => x.def && x.bosses.includes(e)); if (!g) return 1;
  return 1 - C.defMax * Math.min(1, bossCoreHpRatio(g.cores));
}
// 這一幀 BOSS 被打掉的血照倍率重算（不管子彈、近戰、爆炸，都是直接扣 hp，這裡事後補回來；跟老鼠王的護甲同一個做法）
function bossCoreDefense() {
  const C = BOSS_CORE_LINK; if (!(C.defMax > 0)) return;
  for (const g of bossCoreGuards()) {
    if (!g.def) continue;
    const mul = 1 - C.defMax * Math.min(1, bossCoreHpRatio(g.cores));
    for (const e of g.bosses) {
      if (e.dead) continue;
      if (e.bclHp == null || e.hp > e.bclHp) { e.bclHp = e.hp; continue; }   // 補血、第一次看到：記下來就好
      if (e.hp < e.bclHp && mul < 1) { e.hp = e.bclHp - (e.bclHp - e.hp) * mul; e.bclArmorFlash = .18; }
      e.bclHp = e.hp;
    }
  }
}
// 畫面上方 BOSS 血條旁邊要不要標「核心護體」：回傳 0～1（擋掉幾成；js/core-frenzy.js 可以問）
const bossCoreArmorOf = e => 1 - bossCoreDamageMul(e);
