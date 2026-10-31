// ============================================================
//  怪物掉的食物：打死掉在地上 → 在火裡烤熟 → 吃了補血＋短暫 buff
//  ・食物本身（恢復量、buff、生吃鬧肚子、烤成什麼）在 data/supplies.js 的 act:'food' 那幾樣
//  ・掉落：js/combat-feel.js 的 onEnemyDeath 呼叫 foodDeathDrop(e)（金蕉王的香蕉還是 js/golden-banana-king.js 自己掉）
//  ・火烤：地上的食物（G.groundItems）待在火海裡（G.oilFires）FOOD_COOK.time 秒就烤熟；
//    希奧妮的火焰、爆炸這種一下子的火，打到就直接烤熟（cookFoodNear）
//  ・buff 存在 G.foodBuffs（換地圖就沒了）；同一種 buff 再吃＝時間重算、效果取大的，不同種可以同時有
// ============================================================
const FOOD_DROPS = {   // 依怪物的 behavior：掉什麼、幾個、機率
  milkfish:      { id: 'milkfish-belly', min: 1, max: 1, chance: .3 },   // 虱目魚小子 → 虱目魚肚
  milkfishSmall: { id: 'sashimi',        min: 1, max: 1, chance: .3 },   // 小虱目魚小子 → 生魚片
  fishhead:      { id: 'sashimi',        min: 1, max: 2, chance: .3 },   // 魚頭君 → 生魚片
};
const FOOD_COOK = { time: 1.2 };   // 待在火海裡幾秒會烤熟
const FOOD_SICK = { dur: 6, slow: .25 };   // 生吃鬧肚子：幾秒、走慢多少
const FOOD_BUFFS = {
  guard: { name: '減傷', icon: '🛡️', color: '#ffd27a' },
  rate:  { name: '射速', icon: '⚡', color: '#ffe066' },
  speed: { name: '移速', icon: '💨', color: '#9ff0c0' },
  sick:  { name: '鬧肚子', icon: '🤢', color: '#b6d36b' },
};

// ---- 打死掉食物 ----
function foodDeathDrop(e) {
  const d = FOOD_DROPS[e.behavior];
  if (!d || Math.random() >= d.chance || typeof itemById !== 'function' || !itemById(d.id)) return;
  const n = d.min + Math.floor(Math.random() * (d.max - d.min + 1)); if (n <= 0) return;
  G.groundItems = G.groundItems || [];
  G.groundItems.push({ id: d.id, qty: n, x: e.x + (Math.random() - .5) * 16, y: e.y + 8, at: performance.now() / 1000 });
}

// ---- 火烤 ----
function cookGroundFood(g) {
  const it = itemById(g.id), to = it && it.cookTo && itemById(it.cookTo); if (!to) return false;
  g.id = to.id; g.cookT = 0; g.at = performance.now() / 1000;   // 烤好了：彈一下
  flash('🔥 ' + to.name, g.x, g.y - 30, '#ffb35c');
  if (typeof sfxAt === 'function') sfxAt('pop', g.x, g.y, .6, 'food-cooked');
  G.effects.push({ ring: true, x: g.x, y: g.y - 4, r: 4, r2: 22, life: .4, life0: .4, color: '#ffb35c' });
  return true;
}
// 一下子的火（希奧妮的火焰、爆炸）：打到範圍內的食物直接烤熟
function cookFoodNear(x, y, R) {
  for (const g of G.groundItems || []) if (Math.hypot(g.x - x, g.y - y) <= R + 12) cookGroundFood(g);
}
function updateFoodCooking(dt) {
  if (!G.groundItems || !G.groundItems.length || typeof oilFireAt !== 'function') return;
  for (const g of G.groundItems) {
    const it = itemById(g.id); if (!it || !it.cookTo) continue;
    if (!oilFireAt(g.x, g.y, 6)) { g.cookT = 0; continue; }
    if ((g.cookT = (g.cookT || 0) + dt) >= FOOD_COOK.time) cookGroundFood(g);
  }
}

// ---- 吃（背包「使用」、快捷欄）----
function useFood(id) {
  const it = itemById(id), p = G && G.player, f = it && it.food;
  if (!f || !p || p.hp <= 0 || (supplyInventory.get(id) || 0) <= 0) return false;
  consumeItem(id);
  const parts = [];
  const hp = Math.min(f.hp || 0, p.maxhp - p.hp); if (hp > 0) { p.hp += hp; parts.push('+' + Math.ceil(hp) + ' HP'); }
  const sp = Math.min(f.sp || 0, G.guideMax - G.guide); if (sp > 0) { G.guide += sp; parts.push('+' + Math.ceil(sp) + ' SP'); }
  if (f.buff) { addFoodBuff(f.buff.kind, f.buff.val, f.buff.dur); parts.push(FOOD_BUFFS[f.buff.kind].icon); }
  sfx(f.sp ? 'drink' : 'soothe');
  flash(it.name + (parts.length ? ' ' + parts.join(' ') : ''), p.x, p.y - 54, '#ffd27a');
  if (f.sick && Math.random() < f.sick) {   // 生吃：鬧肚子
    addFoodBuff('sick', FOOD_SICK.slow, FOOD_SICK.dur);
    setTimeout(() => { if (G && G.player) flash('🤢 肚子怪怪的…', G.player.x, G.player.y - 70, FOOD_BUFFS.sick.color); }, 500);
  }
  if (f.buff) G.effects.push({ ring: true, x: p.x, y: p.y, r: 6, r2: 36, life: .35, life0: .35, color: FOOD_BUFFS[f.buff.kind].color });
  updateHUD();
  return true;
}

// ---- buff ----
function addFoodBuff(kind, val, dur) {
  const B = (G.foodBuffs = G.foodBuffs || {}), b = B[kind];
  B[kind] = { val: b ? Math.max(b.val, val) : val, t: Math.max(b ? b.t : 0, dur), t0: dur };
}
const foodBuff = kind => { const b = G && G.foodBuffs && G.foodBuffs[kind]; return b && b.t > 0 ? b.val : 0; };
const foodGuardMul = () => 1 - foodBuff('guard');   // 溫特受到的傷害（js/equipment.js 的 equipPlayerDamage）
const foodRateMul = () => 1 + foodBuff('rate');     // 手槍射速（js/game.js）
const foodSpeedMul = () => (1 + foodBuff('speed')) * (1 - foodBuff('sick'));   // 移動速度（js/equipment.js 的 equipSpeedMul）
function updateFoodBuffs(dt) {
  const B = G.foodBuffs; if (!B) return;
  for (const k in B) if ((B[k].t -= dt) <= 0) delete B[k];
}
// game.js 的 update 呼叫
function updateFood(dt) { updateFoodCooking(dt); updateFoodBuffs(dt); }

// ---- 溫特血條右邊：吃到的 buff 小圖示，外圈是剩下的時間（js/render.js 的 drawPlayer 呼叫）----
function drawFoodBuffs(p, hpY) {
  const B = G.foodBuffs; if (!B) return;
  let x = p.x + 31; const y = hpY + 2;
  for (const k in B) {
    const b = B[k], def = FOOD_BUFFS[k]; if (!def || b.t <= 0) continue;
    const k01 = Math.max(0, Math.min(1, b.t / b.t0)), blink = b.t < 3 && Math.floor(b.t * 4) % 2;   // 快結束了：閃
    ctx.save(); ctx.globalAlpha = blink ? .45 : 1;
    ctx.fillStyle = 'rgba(8,12,18,.88)'; ctx.beginPath(); ctx.arc(x, y, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 7.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k01); ctx.stroke();
    ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(def.icon, x, y + .5);
    ctx.restore();
    x += 17;
  }
}
