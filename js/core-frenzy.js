// ============================================================
//  異質核心甦醒：異質體狂暴化、燈光變紅、BOSS 血條與大橫幅
//  ・有核心醒著（還沒打破）＝狂暴期間：所有異質體（包括之後召喚出來的）跑得更快、打得更痛，身上冒紅光，
//    離核心太遠就衝回核心身邊守著（守在 guardR 格內；被引開超過 leash 格又會跑回去）。
//  ・狂暴期間後室的燈光整體變成紅色調、慢慢脈動。核心全部打破後恢復正常。
//  ・核心醒著時畫面上方有 BOSS 血條；醒來、進入第二階段時畫面中間跳一條大橫幅。
//  數值都在下面的 CORE_FRENZY。
// ============================================================
const CORE_FRENZY = {
  speed: 1.5,          // 異質體移動速度倍率
  dmg: 1.3,            // 異質體攻擊力倍率（打溫特、打哨兵）
  guardR: 4,           // 回到核心幾格內就算到了（開始正常戰鬥）
  leash: 9,            // 離核心超過幾格就跑回去
  tint: [190, 80, 255], // 燈光色調（紫色；想改紅色可以用 [255, 70, 60]）
  tintAlpha: .42,      // 色調強度（0～1）
  tintPulse: .08,      // 脈動幅度
  banner: 3.2,         // 大橫幅顯示幾秒
};
const coreFrenzyActive = () => !!(G && !MAP_SAFE && G.cores && G.cores.some(c => c.awake && !c.dead));

// ---- 每幀（game.js 的 update 呼叫）：狂暴加成套上／拿掉 ----
function updateCoreFrenzy(dt) {
  if (!G || !G.enemies) return;
  const on = coreFrenzyActive();
  for (const e of G.enemies) {
    if (e.elite) continue;   // 菁英怪用自己的數值，不套狂暴加成（js/elite-bird-head.js）
    if (e.coreGiveUpT > 0) e.coreGiveUpT -= dt;
    if (on && !e.frenzy && e.hp > 0) {
      e.frenzy = { speed: e.speed, sentryDamage: e.sentryDamage, playerDamage: e.playerDamage };
      e.speed *= CORE_FRENZY.speed;
      e.sentryDamage = (e.sentryDamage ?? 14) * CORE_FRENZY.dmg;
      e.playerDamage = (e.playerDamage ?? 12) * CORE_FRENZY.dmg;
      e.coreReturning = true;
    } else if (!on && e.frenzy) {
      e.speed = e.frenzy.speed; e.sentryDamage = e.frenzy.sentryDamage; e.playerDamage = e.frenzy.playerDamage;
      e.frenzy = null; e.coreReturning = false;
    }
  }
  if (G.coreBanner) { G.coreBanner.t += dt; if (G.coreBanner.t > CORE_FRENZY.banner) G.coreBanner = null; }
}
// 狂暴的異質體要不要衝回核心（js/enemy-ai.js 呼叫）：回傳要去的核心，不用就回傳 null
function frenzyCoreGoal(e) {
  if (!e.frenzy || e.coreGiveUpT > 0) return null;
  let core = null, d = Infinity;
  for (const c of G.cores) if (c.awake && !c.dead) { const dd = Math.hypot(c.x - e.x, c.y - e.y); if (dd < d) { d = dd; core = c; } }
  if (!core) return null;
  if (e.coreReturning && d <= CORE_FRENZY.guardR * CELL) e.coreReturning = false;   // 到了：開始守著
  else if (!e.coreReturning && d > CORE_FRENZY.leash * CELL) e.coreReturning = true;   // 被引開太遠：跑回去
  return e.coreReturning ? core : null;
}

// ---- 畫面 ----
// 狂暴的異質體腳下的紅光（render.js 畫異質體之前呼叫）
function drawFrenzyAura(ctx, e) {
  if (!e.frenzy) return;
  const t = performance.now() / 1000, k = .75 + .25 * Math.sin(t * 6 + e.x * .05);
  ctx.save();
  const g = ctx.createRadialGradient(e.x, e.y + 6, 2, e.x, e.y + 6, 26);
  g.addColorStop(0, `rgba(255,60,50,${.5 * k})`); g.addColorStop(1, 'rgba(255,40,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(e.x, e.y + 6, 26, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// 燈光變紅：亮的地方乘上紅色（暗處還是暗的），慢慢脈動（render.js 在黑幕和燈光之後呼叫）
function drawFrenzyTint(ctx) {
  if (!coreFrenzyActive()) return;
  const t = performance.now() / 1000, a = CORE_FRENZY.tintAlpha + Math.sin(t * 2.2) * CORE_FRENZY.tintPulse;
  const [r, g, b] = CORE_FRENZY.tint;
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = Math.max(0, Math.min(1, a));
  ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL);
  ctx.restore();
}
// 醒來、第二階段：大橫幅（js/anomalous-core.js 呼叫）
function coreBanner(text, sub, color = '#ff5a6e') { if (G) G.coreBanner = { text, sub, color, t: 0 }; }
// 螢幕座標：上方的 BOSS 血條、中間的大橫幅（render.js 最後呼叫）
function drawCoreBossUI(ctx, cv) {
  if (!G || MAP_SAFE || !G.cores) return;
  const awake = G.cores.filter(c => c.awake && !c.dead);
  awake.slice(0, 3).forEach((c, i) => {
    const w = Math.min(520, cv.width * .45), h = 14, x = (cv.width - w) / 2, y = 58 + i * 40;   // 放在任務文字下面
    const ratio = Math.max(0, c.hp / c.maxhp), hit = c.hitT > 0;
    ctx.save();
    ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.85)';
    const label = '異質核心' + (awake.length > 1 ? ' ' + (i + 1) : '') + (c.phase === 2 ? '・第二階段' : '');
    ctx.strokeText(label, cv.width / 2, y - 3); ctx.fillStyle = c.phase === 2 ? '#ff8ad8' : '#e3b8ff'; ctx.fillText(label, cv.width / 2, y - 3);
    ctx.fillStyle = 'rgba(10,6,16,.85)'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.strokeStyle = c.phase === 2 ? '#ff5fd2' : '#a970ff'; ctx.lineWidth = 2; ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, c.phase === 2 ? '#ff3f9a' : '#7b3cff'); grad.addColorStop(1, c.phase === 2 ? '#ff8ad8' : '#c78bff');
    ctx.fillStyle = hit ? '#ffffff' : grad; ctx.fillRect(x, y, w * ratio, h);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1;   // 每 10% 一條刻度
    for (let k = 1; k < 10; k++) { ctx.beginPath(); ctx.moveTo(x + w * k / 10, y); ctx.lineTo(x + w * k / 10, y + h); ctx.stroke(); }
    ctx.restore();
  });
  // 菁英怪的血條：接在核心血條下面（js/elite-bird-head.js）
  const elites = typeof eliteBossBars === 'function' ? eliteBossBars() : [];
  elites.slice(0, 2).forEach((bar, j) => {
    const i = Math.min(3, awake.length) + j;
    const w = Math.min(520, cv.width * .45), h = 14, x = (cv.width - w) / 2, y = 58 + i * 40;
    ctx.save();
    ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.85)';
    ctx.strokeText(bar.label, cv.width / 2, y - 3); ctx.fillStyle = bar.text; ctx.fillText(bar.label, cv.width / 2, y - 3);
    ctx.fillStyle = 'rgba(16,10,4,.85)'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.strokeStyle = bar.frame; ctx.lineWidth = 2; ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, bar.colors[0]); grad.addColorStop(1, bar.colors[1]);
    ctx.fillStyle = bar.hit ? '#ffffff' : grad; ctx.fillRect(x, y, w * Math.max(0, bar.ratio), h);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1;
    for (let k = 1; k < 10; k++) { ctx.beginPath(); ctx.moveTo(x + w * k / 10, y); ctx.lineTo(x + w * k / 10, y + h); ctx.stroke(); }
    ctx.restore();
  });
  const b = G.coreBanner; if (!b) return;
  const T = CORE_FRENZY.banner, inT = .35, outT = .6;
  const k = b.t < inT ? b.t / inT : b.t > T - outT ? Math.max(0, (T - b.t) / outT) : 1;
  const ease = 1 - (1 - k) * (1 - k), cy = cv.height * .42, bh = 96 * ease;
  ctx.save();
  const band = ctx.createLinearGradient(0, 0, cv.width, 0);
  band.addColorStop(0, 'rgba(0,0,0,0)'); band.addColorStop(.2, 'rgba(0,0,0,.72)'); band.addColorStop(.8, 'rgba(0,0,0,.72)'); band.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = band; ctx.fillRect(0, cy - bh / 2, cv.width, bh);
  const edge=ctx.createLinearGradient(cv.width*.15,0,cv.width*.85,0);
  edge.addColorStop(0,'transparent');edge.addColorStop(.2,'#888888');edge.addColorStop(.8,'#888888');edge.addColorStop(1,'transparent');
  ctx.fillStyle = edge; ctx.globalAlpha = ease; ctx.fillRect(cv.width * .15, cy - bh / 2, cv.width * .7, 2); ctx.fillRect(cv.width * .15, cy + bh / 2 - 2, cv.width * .7, 2);
  const slide = (1 - ease) * 60;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 40px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#ffffff'; ctx.fillText('⚠ ' + b.text + ' ⚠', cv.width / 2 + slide, cy - 12);
  if (b.sub) { ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif'; ctx.fillStyle = '#ff5a62'; ctx.fillText(b.sub, cv.width / 2 - slide, cy + 26); }
  ctx.restore();
}
