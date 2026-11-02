/* ===== 升級特效：開發、升級、製作、學技能的「快感」演出 =====
   levelUpFx({ at, kind, title, sub, pop, max })
   ・at：要從哪裡爆開——DOM 元素、選擇器、或 getBoundingClientRect() 拿到的框（重畫前先量好，重畫後位置一樣）
   ・kind：'dev' 開發（金色）／'up' 升級（藍綠）／'craft' 製作（橘色）／'skill' 技能樹（紫色，多一道光柱）
   ・title：大字（例：「升級！」）；sub：小字（例：「手槍 Lv2 → Lv3」）
   ・pop：重畫之後才找得到的元素（函式回傳），會彈一下＋發光
   ・max：升到最高等級——光更多、字變金色
   聲音：每種一個音檔（音效編輯器可換：wsDevelop／wsUpgrade／wsCraft／skillLearn）＋程式合成的「叮鈴」閃光聲（lvSparkle）
   畫面：一層蓋在最上面的 canvas（不擋滑鼠），粒子跑完就自己收掉。 */
const LEVEL_FX_KINDS = {
  dev:   { sound: 'wsDevelop',  color: '#ffd166', glow: '#ffb02e', title: '開發完成！' },
  up:    { sound: 'wsUpgrade',  color: '#7ef0d0', glow: '#2fd3ff', title: '升級！' },
  craft: { sound: 'wsCraft',    color: '#ffb36b', glow: '#ff7a3d', title: '製作完成！' },
  skill: { sound: 'skillLearn', color: '#d8a6ff', glow: '#9b5cff', title: '技能習得！' },
};
const levelFx = { canvas: null, ctx: null, parts: [], rings: [], beams: [], raf: 0, last: 0 };
const levelFxReduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

function levelFxRect(at) {
  if (!at) return null;
  if (typeof at === 'string') at = document.querySelector(at);
  if (at && typeof at.getBoundingClientRect === 'function') at = at.getBoundingClientRect();
  return at && at.width > 0 && at.height > 0 ? { x: at.left + at.width / 2, y: at.top + at.height / 2, w: at.width, h: at.height } : null;
}
function levelFxCanvas() {
  if (!levelFx.canvas) {
    const c = document.createElement('canvas'); c.className = 'lvfx-canvas'; c.setAttribute('aria-hidden', 'true');
    levelFx.canvas = c; levelFx.ctx = c.getContext('2d');
  }
  const c = levelFx.canvas, dpr = Math.min(2, window.devicePixelRatio || 1);
  if (!c.isConnected) document.body.appendChild(c);
  const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  levelFx.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return levelFx.ctx;
}
// 四角星（閃光）
function levelFxStar(ctx, x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .28 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function levelFxTick(now) {
  const dt = Math.min(.05, (now - (levelFx.last || now)) / 1000); levelFx.last = now;
  const ctx = levelFxCanvas();
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.globalCompositeOperation = 'lighter';
  levelFx.beams = levelFx.beams.filter(b => (b.t += dt) < b.life);
  for (const b of levelFx.beams) {   // 光柱：從格子往上衝，慢慢變細消失
    const p = b.t / b.life, w = b.w * (1 - p) * Math.min(1, b.t / .08), top = b.y - innerHeight;
    const g = ctx.createLinearGradient(0, b.y, 0, top);
    g.addColorStop(0, b.color); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = (1 - p) * .55; ctx.fillStyle = g; ctx.fillRect(b.x - w / 2, top, w, b.y - top);
    ctx.globalAlpha = (1 - p) * .9; ctx.fillStyle = '#fff'; ctx.fillRect(b.x - w / 8, top, w / 4, b.y - top);
  }
  levelFx.rings = levelFx.rings.filter(r => (r.t += dt) >= 0 ? r.t < r.life : true);
  for (const r of levelFx.rings) {   // 衝擊波光環
    if (r.t < 0) continue;
    const p = r.t / r.life, e = 1 - Math.pow(1 - p, 3);
    ctx.globalAlpha = (1 - p) * .9; ctx.strokeStyle = r.color; ctx.lineWidth = r.width * (1 - p) + 1;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * e, 0, Math.PI * 2); ctx.stroke();
  }
  levelFx.parts = levelFx.parts.filter(o => (o.t += dt) >= 0 ? o.t < o.life : true);
  for (const o of levelFx.parts) {   // 火花、往上飄的光點
    if (o.t < 0) continue;
    o.vx *= Math.pow(o.drag, dt * 60); o.vy = o.vy * Math.pow(o.drag, dt * 60) + o.g * dt;
    o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.spin * dt;
    const p = o.t / o.life, a = p < .15 ? p / .15 : 1 - (p - .15) / .85;
    ctx.globalAlpha = Math.max(0, a) * (o.twinkle ? .6 + .4 * Math.sin(o.t * 30 + o.rot * 5) : 1);
    ctx.fillStyle = o.color;
    if (o.star) levelFxStar(ctx, o.x, o.y, o.r * (1 - p * .5), o.rot);
    else { ctx.beginPath(); ctx.arc(o.x, o.y, o.r * (1 - p * .6), 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (levelFx.parts.length || levelFx.rings.length || levelFx.beams.length) levelFx.raf = requestAnimationFrame(levelFxTick);
  else { levelFx.raf = 0; levelFx.last = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); levelFx.canvas.remove(); }
}
function levelFxBurst(c, k, max) {
  const n = max ? 70 : 46, colors = [k.color, k.glow, '#ffffff', '#fff3b0'];
  for (let i = 0; i < n; i++) {   // 一圈往外噴的火花（有重力）
    const a = Math.random() * Math.PI * 2, sp = 180 + Math.random() * (max ? 460 : 340);
    levelFx.parts.push({ x: c.x, y: c.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, g: 520, drag: .92, t: -Math.random() * .05,
      life: .55 + Math.random() * .5, r: 2 + Math.random() * 3.5, color: colors[i % colors.length], star: i % 3 === 0, rot: Math.random() * 6, spin: (Math.random() - .5) * 12 });
  }
  for (let i = 0; i < (max ? 34 : 22); i++) {   // 慢慢往上飄、會閃的光點
    levelFx.parts.push({ x: c.x + (Math.random() - .5) * Math.max(60, c.w), y: c.y + (Math.random() - .3) * Math.max(30, c.h * .6),
      vx: (Math.random() - .5) * 30, vy: -60 - Math.random() * 90, g: -20, drag: .99, t: -.1 - Math.random() * .5,
      life: 1 + Math.random() * .8, r: 3 + Math.random() * 4, color: i % 2 ? k.color : '#ffffff', star: true, twinkle: true, rot: Math.random() * 6, spin: (Math.random() - .5) * 3 });
  }
  const R = Math.max(c.w, c.h) / 2;
  levelFx.rings.push({ x: c.x, y: c.y, r0: R * .4, r1: R + 120, t: 0, life: .55, width: 8, color: '#ffffff' });
  levelFx.rings.push({ x: c.x, y: c.y, r0: R * .3, r1: R + 200, t: -.08, life: .75, width: 5, color: k.color });
  if (max) levelFx.rings.push({ x: c.x, y: c.y, r0: R * .2, r1: R + 300, t: -.18, life: .9, width: 4, color: '#ffd166' });
}
// 大字橫幅：彈出來、掃一道光、往上飄走
function levelFxBanner(c, k, title, sub, max) {
  const el = document.createElement('div');
  el.className = 'lvfx-banner' + (max ? ' max' : '');
  el.style.setProperty('--lvfx-color', max ? '#ffd166' : k.color);
  el.style.setProperty('--lvfx-glow', max ? '#ff9d00' : k.glow);
  const t = document.createElement('b'); t.textContent = title; el.appendChild(t);
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.appendChild(s); }
  document.body.appendChild(el);
  const bw = el.offsetWidth, bh = el.offsetHeight;   // 不要超出畫面
  el.style.left = Math.max(bw / 2 + 8, Math.min(innerWidth - bw / 2 - 8, c.x)) + 'px';
  el.style.top = Math.max(bh / 2 + 8, Math.min(innerHeight - bh / 2 - 8, c.y - Math.max(40, c.h / 2 + 30))) + 'px';
  setTimeout(() => el.remove(), 1700);
}
function levelUpFx(opt = {}) {
  const k = LEVEL_FX_KINDS[opt.kind] || LEVEL_FX_KINDS.up;
  if (typeof SFX !== 'undefined') {
    SFX.play(k.sound, opt.max ? 1 : .85, 'lvfx-' + opt.kind);
    SFX.play('lvSparkle', opt.max ? 1 : .8, 'lvfx-sparkle');
  }
  const c = levelFxRect(opt.at) || { x: innerWidth / 2, y: innerHeight / 2, w: 120, h: 120 };
  const reduced = levelFxReduced();
  if (!reduced) {
    levelFxBurst(c, k, opt.max);
    if (opt.kind === 'skill' || opt.max) levelFx.beams.push({ x: c.x, y: c.y + c.h / 2, w: Math.max(36, c.w * 1.2), t: 0, life: .7, color: k.color });
    if (!levelFx.raf) levelFx.raf = requestAnimationFrame(levelFxTick);
    const flash = document.createElement('div');   // 整個畫面閃一下（中間亮、四周暗）
    flash.className = 'lvfx-flash';
    flash.style.setProperty('--lvfx-x', c.x + 'px'); flash.style.setProperty('--lvfx-y', c.y + 'px'); flash.style.setProperty('--lvfx-glow', k.glow);
    document.body.appendChild(flash); setTimeout(() => flash.remove(), 600);
  }
  levelFxBanner(c, k, opt.title || k.title, opt.sub || '', opt.max);
  if (opt.pop) requestAnimationFrame(() => {   // 重畫後的那一格：彈一下＋發光
    const el = typeof opt.pop === 'function' ? opt.pop() : opt.pop;
    if (!el) return;
    el.style.setProperty('--lvfx-glow', k.glow);
    el.classList.remove('lvfx-pop'); void el.offsetWidth; el.classList.add('lvfx-pop');
    setTimeout(() => el.classList.remove('lvfx-pop'), 900);
  });
}
