/* ===== 繪圖 =====
   從 game.js 拆出來的「把畫面畫出來」：
   - 各種東西的畫法：建築、哨兵（含武器揮擊）、怪物、NPC、玩家、對話泡泡、互動提示
   - 堤諾的「感知」標記
   - draw：每一幀的總繪製（地圖、深度排序、光影、特效、畫面暗角）
   這裡只負責「畫」，不改變遊戲狀態；遊戲規則在 game.js、特效產生在 attack-fx.js。
   必須在 game.js 之前載入。
*/
// ---- 各種角色/物件的畫法（拆成函式，方便深度排序時逐一呼叫）----
const HIT_DUR = 0.3;   // 建築被攻擊時「閃紅＋震動」持續秒數
const ORE_GUN_FLASH = { ms: 120, alpha: .65 };   // 手槍打異質礦的閃白：持續毫秒、最亮多少
function drawObstacle(o) {
  const w = (o.w || 1) * CELL, h = (o.h || 1) * CELL;
  // 受擊震動：依剩餘 hitT 隨機抖動，越接近結束越小
  const hit = o.hitT > 0 ? o.hitT / HIT_DUR : 0;
  const shX = hit ? (Math.random() * 2 - 1) * 4 * hit : 0;
  const shY = hit ? (Math.random() * 2 - 1) * 4 * hit : 0;
  const x = OX + o.c * CELL + shX, y = OY + o.r * CELL + shY;
  // 放置動畫：位移＋以「底部中央」為錨點的壓扁/回彈縮放
  const a = dropAnim(o.spawnT);
  if (a) {
    ctx.save();
    ctx.translate(0, a.dy);                       // 掉落中的高度位移
    ctx.translate(x + w / 2, y + h);              // 錨點移到底部中央
    ctx.scale(a.sx, a.sy);
    ctx.translate(-(x + w / 2), -(y + h));
  }
  const img = o.type && obstacleImgs[o.type] && obstacleImgs[o.type][o.orient || 'h'];
  // 基地本體是地圖上的平面大圖，這裡只負責碰撞、受擊效果與血條，避免重複繪製。
  if (!o.isBase && !o.mapSource) {
    if (img && img.complete && img.naturalWidth) {
      if(o.type==='irongate')drawSlidingIronGate(ctx,o,img,x,y,w,h);else ctx.drawImage(img,x,y,w,h);
    }
    else { ctx.fillStyle = '#7a5a3a'; roundRect(x + 3, y + 3, w - 6, h - 6, 5); ctx.fill(); ctx.strokeStyle = '#5a4128'; ctx.lineWidth = 2; ctx.stroke(); }
  }
  if (o.ore && typeof drawOreGlow === 'function') drawOreGlow(ctx, o, x, y, w, h);   // 被照亮時結晶發出紫光（js/ore.js）
  // 手槍打中異質礦：礦石的形狀閃一下白（ORE_GUN_FLASH 毫秒內淡掉）
  const gunFlash = o.ore && o.gunFlashAt ? 1 - (performance.now() - o.gunFlashAt) / ORE_GUN_FLASH.ms : 0;
  if (gunFlash > 0 && typeof flashSprite === 'function') {
    // mapSource：格子素材是 "圖層:c,r" 字串，圖章素材是圖章物件
    const s = o.mapSource && typeof o.mapSource === 'object' ? o.mapSource : null;
    const t = o.mapTileId ? mapTileById(o.mapTileId) : null, im = t ? tileImage(t) : img;
    const sil = im && im.complete !== false && (im.naturalWidth || im.width) ? flashSprite(im, '#ffffff') : null;
    if (sil) {
      const sx = s ? OX + s.c * CELL + (s.ox || 0) + shX : x, sy = s ? OY + s.r * CELL + (s.oy || 0) + shY : y;
      const sw = s ? mapStampW(s, t) * CELL : t ? CELL : w, sh = s ? mapStampH(s, t) * CELL : t ? CELL : h;   // 格子素材固定畫一格大
      ctx.save(); ctx.globalAlpha = ORE_GUN_FLASH.alpha * gunFlash; ctx.imageSmoothingEnabled = false;
      const rot = s ? mapStampTurn(s) : 0, iw = rot % 2 ? sh : sw, ih = rot % 2 ? sw : sh;   // 旋轉過的圖章：閃光也要跟著轉
      if (s && (s.fx || s.fy || rot)) { ctx.translate(sx + sw / 2, sy + sh / 2); if (rot) ctx.rotate(rot * Math.PI / 2); ctx.scale(s.fx ? -1 : 1, s.fy ? -1 : 1); ctx.drawImage(sil, -iw / 2, -ih / 2, iw, ih); }
      else ctx.drawImage(sil, sx, sy, sw, sh);
      ctx.restore();
    }
  }
  if (hit && !(gunFlash > 0)) {   // 閃紅：半透明紅疊在圖上
    ctx.globalAlpha = (o.ore ? .35 : .55) * hit; ctx.fillStyle = o.ore ? '#e6c8ff' : '#ff3030';   // 採礦敲擊：淡紫光（不是受傷的紅）
    if (o.isBase) {
      ctx.lineWidth = 6; ctx.strokeStyle = '#ff3030'; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    } else ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }
  if (a) ctx.restore();
  if (o.isBase) {         // 基地血條永久顯示，並依剩餘 HP 變色
    const ratio = Math.max(0, Math.min(1, o.hp / o.maxhp));
    const barW = Math.max(120, w - 48), barH = 10;
    const barX = x + (w - barW) / 2, barY = y + 8;
    ctx.fillStyle = 'rgba(0,0,0,.82)'; roundRect(barX - 3, barY - 3, barW + 6, barH + 6, 4); ctx.fill();
    ctx.fillStyle = '#352d2d'; roundRect(barX, barY, barW, barH, 2); ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? '#59d26f' : (ratio > 0.25 ? '#f0c54d' : '#ef5b5b');
    if (ratio > 0) { roundRect(barX, barY, barW * ratio, barH, 2); ctx.fill(); }
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.9)';
    const label = '基地 HP ' + Math.max(0, Math.ceil(o.hp)) + ' / ' + o.maxhp;
    ctx.strokeText(label, x + w / 2, barY - 4); ctx.fillStyle = '#fff'; ctx.fillText(label, x + w / 2, barY - 4);
  } else if (o.hp < o.maxhp) {   // 一般障礙物受損才顯示血條
    ctx.fillStyle = '#000'; ctx.fillRect(x + 2, y + h - 6, w - 4, 4);
    ctx.fillStyle = '#c9a26a'; ctx.fillRect(x + 2, y + h - 6, (w - 4) * Math.max(0, o.hp) / o.maxhp, 4);
  }
}
// 開槍後座位移：前搖微微前傾瞄準 → 開火往後踢 → 收招回正。回傳 -1(後)～+0.3(前)
function gunSwingOffset(s) {
  if (s.age < s.wind) return 0.3 * (s.age / s.wind);
  if (s.age < s.impact) return 0.3;
  if (s.age < s.impact + .07) return 0.3 - 1.3 * ((s.age - s.impact) / .07);
  const u = Math.min(1, (s.age - s.impact - .07) / (s.duration - s.impact - .07));
  return -1 + u;
}
function meleeSwingAngle(s) {
  // 角度＝斧頭方向（已鏡像的座標系）：-π/2 朝上、0 朝前、+π/2 朝下。過頭劈：上後方→前下方。
  const REST = -0.5, BACK = -2.15, CHOP = 0.8, OVER = 1.0;
  if (s.age < s.wind) {                                   // 舉斧過頭蓄力（ease-out）
    const u = s.age / s.wind, e = 1 - (1 - u) * (1 - u);
    return REST + (BACK - REST) * e;
  }
  if (s.age < s.impact) {                                 // 往下劈（ease-in 加速，才有力道）
    const u = (s.age - s.wind) / (s.impact - s.wind), e = u * u;
    return BACK + (CHOP - BACK) * e;
  }
  if (s.age < s.impact + .06) {                           // 命中過衝一下
    const u = (s.age - s.impact) / .06;
    return CHOP + (OVER - CHOP) * Math.sin(u * Math.PI);
  }
  const u = Math.min(1, (s.age - s.impact - .06) / (s.duration - s.impact - .06));   // 收招回正
  return CHOP + (REST - CHOP) * (1 - (1 - u) * (1 - u));
}
function drawSwingWeapon(t, img, w, h, arm) {   // 揮擊時才出現的武器圖（過頭揮，沿弧線往外）
  const s = t.meleeSwing;
  if (!s || !img.complete || !img.naturalWidth) return;
  const fx = Math.cos(s.angle) >= 0 ? 1 : -1, sweep = meleeSwingAngle(s);
  ctx.save();
  ctx.translate(t.x + fx * 4, t.y - 14);   // 肩膀支點（揮擊弧線中心）
  ctx.scale(fx, 1);
  ctx.rotate(sweep + Math.PI / 2);   // 讓圖中朝上的武器對齊揮砍方向
  ctx.translate(0, -arm);            // 沿弧線往外推，離身體遠一點
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
}
function drawFireAxe(t) {
  if (MAP_SAFE || t.hp <= 0 || t.berserk) return;
  if (t.type === 'red') { if (!(t.meleeSwing && t.meleeSwing.ult)) drawSwingWeapon(t, redAxeImg, 21, 32, 22); return; }   // 雷德：fire_axe_01（大招用盾衝撞，不拿斧）
  if (t.type === 'avaren') { drawSwingWeapon(t, avarenKnifeImg, 9, 29, 20); return; }  // 阿瓦倫：military_knife
  if (t.type === 'luther') { drawSwingWeapon(t, lutherAxeImg, 28, 46, 26); return; }   // 路德：fire_axe_02（攻擊時才出現）
  if (t.type === 'colyn') { drawColynSword(t); return; }   // 柯林：長劍
}
// 柯林的突擊連刺：身體前後衝的量（-＝往後、+＝往前）。先往後蓄力；每刺一下 0.05 秒衝到最前，
// 再被反作用力彈回比原位更後面（後座力），等下一刺；最後一刺後慢慢回正。amp＝[前後 px, 上下 px, 傾斜]
const STAB_LUNGE = { amp: [7, 5, .12], back: -.8, front: 1.8, dash: .05, recoil: .08, settle: .3 };
function stabLunge(s) {
  const L = STAB_LUNGE, first = s.stabs[0];
  if (s.age < first) return L.back * Math.sin(s.age / first * Math.PI / 2);   // 蓄力：往後縮
  let last = first; for (const ts of s.stabs) if (s.age >= ts) last = ts;
  const u = s.age - last;   // 這一刺過了幾秒
  if (u < L.dash) return L.back + (L.front - L.back) * (u / L.dash);                         // 猛往前衝
  if (u < L.dash + L.recoil) return L.front + (L.back - L.front) * ((u - L.dash) / L.recoil);   // 反作用力彈回
  if (last !== s.stabs[s.stabs.length - 1]) return L.back;                                  // 等下一刺
  return L.back * Math.max(0, 1 - (u - L.dash - L.recoil) / L.settle);                      // 收招：回正
}
function drawColynSword(t) {   // 柯林：一般攻擊沿弧線揮；大招突刺時劍尖朝目標，跟著身體前後衝
  const s = t.meleeSwing;
  if (!s || !colynSwordImg.complete || !colynSwordImg.naturalWidth) return;
  if (!s.stabs) { drawSwingWeapon(t, colynSwordImg, 9, 46, 18); return; }
  const lunge = stabLunge(s), [ax, ay] = STAB_LUNGE.amp, cos = Math.cos(s.angle), sin = Math.sin(s.angle);
  const reach = 6 + Math.max(0, lunge) * 8;   // 往前衝的時候劍再多伸出去一點
  ctx.save();
  ctx.translate(t.x + cos * (6 + lunge * ax), t.y - 12 + sin * (4 + lunge * ay));
  ctx.rotate(s.angle + Math.PI / 2);   // 圖裡朝上的劍尖對準目標
  ctx.translate(0, -reach); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(colynSwordImg, -4.5, -40, 9, 46);
  ctx.restore();
}
function sentryRedFlash(t) {   // 回傳紅閃強度 0~1：受擊閃一下、瀕臨暴走慢脈動、暴走快脈動
  if (t.hp <= 0) return 0;
  const hit = t.hitT > 0 ? Math.min(1, t.hitT / .2) * 0.9 : 0;   // 受擊閃紅
  if (MAP_SAFE) return hit;
  const now = performance.now() / 1000;
  if (t.berserk) return Math.max(hit, (Math.sin(now * Math.PI * 2 * 3) + 1) / 2);                                       // 暴走：快閃（約 3Hz）
  if (!TYPES[t.type].guide && t.taint > 85) return Math.max(hit, (Math.sin(now * Math.PI * 2 * 0.8) + 1) / 2 * 0.85);   // 瀕臨暴走：慢閃
  return hit;
}
// 腳下接地陰影：站立、走路共用；抓起／掉落時由 grabDrawWrap 畫離地陰影。
function drawCharacterShadow(actor) {
  if (!actor || actor.eatenBy || actor.sitting || actor.grabFall || (typeof grab !== 'undefined' && grab && grab.actor === actor)) return;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath();
  const down = actor.hp <= 0;
  ctx.ellipse(actor.x + (down ? 10 : 0), actor.y + (down ? 5 : 15), 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function drawTower(t) {
  if (t.eatenBy) return;   // 被虱目魚小子吃掉：只畫魚嘴裡露出的腳（js/milkfish-kid.js）
  drawCharacterShadow(t);
  const spec = TYPES[t.type];
  let set = sentrySprites[t.type];
  if (t.type === 'red' && t.shieldMode && !MAP_SAFE && !t.berserk && redShieldSprites.front) set = redShieldSprites;   // 舉盾造型
  const img = set && pickCharacterFrame(set, t);
  let visualTop = t.y - 17;
  if (img && img.complete && img.naturalWidth) {
    const size = PLAYER.drawSize;
    visualTop = t.y - size + 18 + (set && img === set.fail ? 14 : 0);   // 倒地圖：人躺著比較矮，名字和血條往下貼近身體
    const shX = t.hp <= 0 ? 0   // 失去戰鬥能力：躺著不動（倒地圖，js/game.js 的 pickCharacterFrame）
      : t.berserk ? (Math.random() * 2 - 1) * 1.5   // 暴走：微微發抖
      : (t.hitT > .12 ? (Math.random() * 2 - 1) * 2.5 : 0);    // 受擊：短暫抖一下
    if (t.berserk) {   // 暴走：腳下紅光
      ctx.fillStyle = 'rgba(255,60,60,0.45)';
      ctx.beginPath(); ctx.ellipse(t.x, t.y + 14, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
    const prevSmooth = ctx.imageSmoothingEnabled;   // 畫完放回原本的設定（不要直接打開平滑，不然後面畫的牆、道具會被糊掉）
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    if (t.meleeSwing) {
      const s = t.meleeSwing;
      let lunge;   // -1 後仰蓄力 → +1 前傾撲擊
      if (s.stabs) lunge = stabLunge(s);   // 柯林的突擊連刺：一刺一刺前後衝
      else if (s.age < s.wind) lunge = -Math.sin(s.age / s.wind * Math.PI / 2) * .65;
      else if (s.age < s.impact) { const u = (s.age - s.wind) / (s.impact - s.wind); lunge = -.65 + 1.65 * u * u; }
      else { const u = Math.min(1, (s.age - s.impact) / (s.duration - s.impact)); lunge = 1 * (1 - u * u); }
      const dx = Math.cos(s.angle), dy = Math.sin(s.angle), [ax, ay, ar] = s.stabs ? STAB_LUNGE.amp : [6, 4, .16];
      ctx.translate(t.x + dx * lunge * ax, t.y + dy * lunge * ay);
      ctx.rotate(dx * lunge * ar); ctx.translate(-t.x, -t.y);
    } else if (t.gunSwing) {   // 開槍後座：沿瞄準方向前傾→後踢→回正
      const off = gunSwingOffset(t.gunSwing), dx = Math.cos(t.gunSwing.angle), dy = Math.sin(t.gunSwing.angle);
      ctx.translate(dx * off * 4, dy * off * 4);
    }
    seatRotate(t, size);   // 躺在橫放的床上：跟溫特一樣旋轉
    if (typeof applyStruggleTransform === 'function') applyStruggleTransform(ctx, t);   // 被絲瓜藤纏住：扭動
    if (typeof applySlipTransform === 'function') applySlipTransform(ctx, t);   // 踩到香蕉皮：往後仰（js/golden-banana-king.js）
    if (t.hp > 0) t.downAt = null;
    else if (t.downAt == null) t.downAt = performance.now();   // 剛失去戰鬥能力：播倒下動畫
    const downAge = t.downAt != null ? (performance.now() - t.downAt) / 1000 : Infinity;
    if (downAge < FALL_DOWN_TIME() && drawFallDown(t, set, downAge)) { /* 倒下動畫中 */ }
    else {
      if (t.hp > 0) costumeLayer(t.type, t, t.x - size / 2 + shX, t.y - size + 18, size, 'behind');   // 倒下時不畫配件（人躺著）
      ctx.drawImage(img, t.x - size / 2 + shX, t.y - size + 18, size, size);
      if (t.hp > 0) costumeLayer(t.type, t, t.x - size / 2 + shX, t.y - size + 18, size, 'front');
    }
    const redFlash = sentryRedFlash(t);   // 瀕臨暴走慢閃紅、暴走快閃紅
    const redSil = redFlash > 0.01 ? flashSprite(img, '#ff3b3b') : null;
    if (redSil) {
      ctx.globalAlpha = redFlash * 0.5;
      ctx.drawImage(redSil, t.x - size / 2 + shX, t.y - size + 18, size, size);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.imageSmoothingEnabled = prevSmooth;
  } else {
    ctx.fillStyle = t.berserk ? '#5a1f27' : spec.color; roundRect(t.x - 17, t.y - 17, 34, 34, 6); ctx.fill();
  }

  drawFireAxe(t);
  // 頭頂資訊：名字在上，HP 條在下。
  // 安全區域沒有血條，名字往下 5px 貼近頭頂（跟 NPC 一致）；戰鬥區域維持原本的名字＋血條間距。
  const nameY = visualTop - (MAP_SAFE ? 6 : 11);
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  // 戰鬥區域：名字前面加職業圖示（哨兵＝交叉雙劍、嚮導＝盾牌＋十字），名字跟圖示一起置中
  const roleKey = spec.guide ? 'guide' : 'sentinel', roleImg = !MAP_SAFE ? roleNameIcons[roleKey] : npcNameIcons[t.type];   // 基地裡：特殊 NPC 的小圖示（例如塔納的哨子）
  const hasRole = roleImg && roleImg.complete && roleImg.naturalWidth, roleSize = 12, roleGap = 3;
  const nameX = t.x + (hasRole ? (roleSize + roleGap) / 2 : 0);
  ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(spec.name, nameX, nameY);
  const taintDanger = !MAP_SAFE && !t.berserk && !spec.guide && t.taint > 85 && t.hp > 0;
  ctx.fillStyle = t.berserk ? '#ff4d4d' : taintDanger ? '#ffb24d' : '#fff'; ctx.fillText(spec.name, nameX, nameY);   // 暴走紅字、瀕臨暴走橘字
  if (hasRole) {
    const ix = nameX - ctx.measureText(spec.name).width / 2 - roleGap - roleSize, iy = nameY - 10, edge = npcIconOutline(MAP_SAFE ? t.type : 'role-' + roleKey, roleImg);
    ctx.save(); ctx.imageSmoothingEnabled = true;
    for (let a = 0; a < 16; a++) ctx.drawImage(edge, ix + Math.cos(a / 8 * Math.PI) * 1.5, iy + Math.sin(a / 8 * Math.PI) * 1.5, roleSize, roleSize);   // 黑邊
    ctx.drawImage(roleImg, ix, iy, roleSize, roleSize);
    ctx.restore();
  }

  if (!MAP_SAFE) {        // 安全區域沒有戰鬥，頭上不顯示血條（名字留著）
    const maxhp = t.maxhp || spec.hp || 100;
    const hp = Math.max(0, Math.min(maxhp, t.hp ?? maxhp));
    const barW = 42, barH = 3, barX = t.x - barW / 2, barY = visualTop - 7;
    ctx.fillStyle = 'rgba(0,0,0,.85)'; roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2); ctx.fill();
    if (hp > 0) {
      ctx.fillStyle = hp / maxhp > 0.5 ? '#57d879' : (hp / maxhp > 0.25 ? '#f1c84b' : '#ef5b5b');
      roundRect(barX, barY, barW * hp / maxhp, barH, 1); ctx.fill();
    }
  }
  // 「暴走」「瀕臨暴走」標籤：黑底＋外框
  const tagText = t.berserk && t.hp > 0 ? '暴走' : taintDanger ? '瀕臨暴走' : '';
  if (tagText) drawTaintTag(t.x, nameY - 15, tagText, t.berserk ? '#ff4d4d' : '#ffb24d');
  if (t.say && t.say.text && !t.berserk) queueTowerBubble(t, t.x, nameY - (tagText ? 30 : 13), t.say.text, t.say.col || BUBBLE_COLORS[t.type]);   // 哨兵對話泡泡（有標籤時往上移；等頭上的選項畫完才畫）
}
function drawTaintTag(cx, centerY, text, color) {
  ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = Math.ceil(ctx.measureText(text).width) + 10, h = 14;
  const x = Math.round(cx - w / 2) + .5, y = Math.round(centerY - h / 2) + .5;
  ctx.fillStyle = 'rgba(0,0,0,.92)'; roundRect(x, y, w, h, 3); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 1; roundRect(x, y, w, h, 3); ctx.stroke();
  ctx.fillStyle = color; ctx.fillText(text, cx, centerY + .5);
  ctx.textBaseline = 'alphabetic';
}
// ---- 堤諾的異能力「感知」----
// 帶著堤諾出勤時，他周圍一定範圍內、位於黑暗中的怪物會以輪廓標示出來。
// 這是「只有玩家看得見」的情報：哨兵的索敵仍然只看亮處，所以不影響戰鬥判定。
function sensedEnemies() {
  if (!LIGHT.enabled || !G || !G.enemies.length) return [];
  const eyes = (G.towers || []).filter(t => (TYPES[t.type] || {}).sense && t.hp > 0 && !t.berserk);
  if (!eyes.length) return [];
  return G.enemies.filter(e => !e.dead && !enemyVisible(e)
    && eyes.some(t => Math.hypot(e.x - t.x, e.y - t.y) <= TYPES[t.type].sense * CELL));
}
function drawSensedEnemies() {
  const list = sensedEnemies();
  if (!list.length) return;
  const pulse = .55 + .25 * Math.sin(performance.now() / 260);
  ctx.save();
  for (const e of list) {
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = '#f0a63c'; ctx.lineWidth = 1.5;                   // 堤諾的代表色
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 2, 14, 12, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = pulse * .35; ctx.fillStyle = '#f0a63c';
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 2, 14, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = pulse; ctx.fillStyle = '#ffd9a0';                 // 中心小點，暗處也看得出位置
    ctx.beginPath(); ctx.arc(e.x, e.y + 2, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// 走路的怪物（有 frames）：依移動方向選正面／側面，走動時換腳，停下來站著
// 揮手時手臂的角度（度）：半舉 → 高舉（慢慢往後拉、微微發抖）→ 一口氣劈下 → 稍微甩過頭 → 收回原位
function rigArmAngle(R, t) {
  const S = MONSTER_SWING, [a1, a2, a3] = R.angles, rest = R.rest, w = S.windup;
  const lerp = (a, b, k) => a + (b - a) * k, out = k => 1 - (1 - k) * (1 - k), inOut = k => k * k * (3 - 2 * k);
  if (t < 0) return rest;
  if (t < w * .3) return lerp(rest, a1, out(t / (w * .3)));
  if (t < w * .6) return lerp(a1, a2, out((t - w * .3) / (w * .3)));
  const pull = a2 + (a2 > a3 ? 7 : -7);   // 劈下前再往後拉一點（蓄力）
  if (t < w) return lerp(a2, pull, inOut((t - w * .6) / (w * .4))) + Math.sin(t * 70) * 1.2;
  if (t < w + S.strike) { const k = (t - w) / S.strike; return lerp(pull, a3, k * k); }   // 越劈越快
  const over = a3 + (a3 - pull > 0 ? 9 : -9), u = (t - w - S.strike) / S.recover;   // 甩過頭一點再收回
  return u < .25 ? lerp(a3, over, out(u / .25)) : lerp(over, rest, inOut((u - .25) / .75));
}
function monsterWalkFrame(e) {
  if (e.forceFrame) return { file: e.forceFrame, flip: !!e.forceFlip, attack: !!e.forceAttack };   // 指定的動作圖（例如絲瓜小姐抬腳）；forceAttack＝尺寸跟站姿圖不同的攻擊圖，照原本的像素比例畫（虱目魚小子，js/milkfish-kid.js）
  const f = e.frames;
  if (e.swing && f.attackRig) {   // 揮手攻擊（即時轉動手臂，比換圖流暢）
    const t = performance.now() / 1000 - e.swing.at, S = MONSTER_SWING, R = f.attackRig;
    if (t >= 0 && t < S.windup + S.strike + S.recover) {
      const flip = e.swing.right === (R.facing === 'left');
      return { rig: R, angle: rigArmAngle(R, t), ghosts: t >= S.windup && t < S.windup + S.strike + .05 ? [rigArmAngle(R, t - .025), rigArmAngle(R, t - .05)] : null,
        flip, charging: t > S.windup * .6 && t < S.windup, file: R.body };
    }
    e.swing = null;
  }
  if (e.swing && f.attack) {   // 揮手攻擊中（js/enemy-ai.js 的 MONSTER_SWING）
    const t = performance.now() / 1000 - e.swing.at, S = MONSTER_SWING;
    if (t >= 0 && t < S.windup + S.strike + S.recover) {
      // 4 張：半舉 → 高舉蓄力（前搖後段，身體微微發抖）→ 快速揮下 → 收回；3 張：舉手 → 揮出 → 收手
      const four = f.attack.length >= 4;
      const i = t < S.windup ? (four && t >= S.windup * .3 ? 1 : 0) : t < S.windup + S.strike ? (four ? 2 : 1) : (four ? 3 : 2);
      const flip = e.swing.right === (f.attackFacing === 'left');   // 原圖往左揮、目標在右邊（或反過來）就左右翻
      return { file: f.attack[Math.min(i, f.attack.length - 1)], flip, attack: true, charging: four && i === 1 };
    }
    e.swing = null;
  }
  const mdx = e.x - (e.animX ?? e.x), mdy = e.y - (e.animY ?? e.y), moved = Math.hypot(mdx, mdy);
  e.animX = e.x; e.animY = e.y;
  const now = performance.now() / 1000;
  if (moved > .15 && moved < 20 && !(e.knockT > 0)) {   // 被擊退滑行不算走路
    e.walkDist = (e.walkDist || 0) + moved; e.walkUntil = now + .15;
    if (Math.abs(mdx) > Math.abs(mdy) * .9) { e.animSide = true; e.faceRight = mdx > 0; }
    else if (Math.abs(mdy) > Math.abs(mdx) * 1.1) e.animSide = false;
  }
  const walking = (e.walkUntil || 0) > now && !(e.stunT > 0);
  const step = Math.floor((e.walkDist || 0) / (e.ch && e.ch.state === 'charge' ? 20 : 10));   // 衝刺時步伐大一點
  const lazy = !e.ch || e.ch.state === 'idle' || e.ch.state === 'wander';   // 沒在追人的時候
  if (f.walkBack && e.behavior === 'charger') {   // 鳥頭人：往畫面上方走露出背面；守衛（faceBack）背對玩家看著核心
    if (e.faceBack) e.showBack = true;
    else if (!walking) e.showBack = false;   // 停下來就轉回正面（發呆轉眼睛、蓄力瞪人）
    else if (moved > .15 && moved < 20 && !(e.knockT > 0)) e.showBack = mdy < -Math.abs(mdx) * .3 ? true : mdy > Math.abs(mdx) * .3 ? false : e.showBack;
    // 背面站姿圖比正面窄：照原圖比例畫（natural），不要被撐寬
    if (e.showBack) return { file: walking && !e.faceBack ? f.walkBack[step % f.walkBack.length] : f.back, flip: !!e.faceRight === (f.backFacing === 'left'), natural: true };
  }
  if (f.walkBack && e.showBack) return { file: walking ? f.walkBack[step % f.walkBack.length] : f.back, flip: !!e.faceRight === (f.backFacing === 'left') };   // 背面（魚頭君露出魚肉）
  if (!walking && f.blink && f.blink.length) {   // 站著不動：每隔幾秒眨一次眼（半閉→全閉→半閉）
    if (e.blinkAt == null) e.blinkAt = now + 1 + Math.random() * 3;
    let bt = now - e.blinkAt;
    if (bt > .3) { e.blinkAt = now + 2 + Math.random() * 3.5; bt = -1; }
    if (bt >= 0) return { file: bt < .07 || bt > .23 ? f.blink[0] : (f.blink[1] || f.blink[0]), flip: false };
  }
  if (!walking && f.idle && lazy) {   // 站著不動：原地動畫（鳥頭人轉眼睛），朝最後面向的方向
    if (e.idlePhase == null) e.idlePhase = Math.random() * 10;
    const i = Math.floor((now + e.idlePhase) * f.idleFps) % f.idle.length;
    return { file: f.idle[i], flip: !!e.faceRight === (f.idleFacing === 'left') };
  }
  if (e.animSide && f.side) return { file: walking ? f.side[step % f.side.length] : f.side[0], flip: e.faceRight === (f.sideFacing === 'left') };
  // 走路圖朝左（或朝右）的怪物：往另一邊走就左右翻；上下走時維持最後面向的方向
  return { file: walking ? f.walkFront[step % f.walkFront.length] : f.front, flip: f.walkFacing ? !!e.faceRight === (f.walkFacing === 'left') : false };
}
function drawRigArm(e, fr, dx, dy, dw, dh) {
  const R = fr.rig, arm = monsterImage(R.arm), base = monsterImage(e.frames.front);
  if (!arm.complete || !arm.naturalWidth || !base.naturalWidth) return;
  const kx = dw / base.naturalWidth, ky = dh / base.naturalHeight;
  const px = dx + R.pivot[0] * kx, py = dy + R.pivot[1] * ky;
  const drawAt = (deg, alpha) => {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(px, py); ctx.rotate((deg - R.rest) * Math.PI / 180);
    ctx.drawImage(tintedSprite(arm, e.tint), -R.pivot[0] * kx, -R.pivot[1] * ky, dw, dh);
    ctx.restore();
  };
  if (fr.ghosts) fr.ghosts.forEach((g, i) => drawAt(g, .35 - i * .15));   // 劈下時的殘影
  drawAt(fr.angle, 1);
}
const SHOW_ENEMY_ALERT = false;   // 怪物被槍吸引過來時頭上彈出「！」：true＝顯示
function drawEnemy(e) {
  ctx.save();
  if (e.hitT > 0) ctx.translate((Math.random() * 2 - 1) * 2.5, (Math.random() * 2 - 1) * 1.5);
  else if (e.shockT > 0) ctx.translate((Math.random() * 2 - 1) * 1.3, (Math.random() * 2 - 1) * .6);   // 麻痺：微微顫抖
  const lift = e.slimeLift || 0, size = e.sizeMul || 1;
  // 受擊壓扁回彈：被打瞬間變扁變寬，0.16 秒內彈回
  const squash = (e.hitSquashT || 0) / .16, sqX = 1 + .22 * squash, sqY = 1 - .2 * squash;
  // 跳躍／硬直的壓扁拉長只給史萊姆：鳥頭人、珍珠小童沒有跳躍動作會把形狀重設，套用的話被爆擊後會一直扁著
  const bodyX = e.behavior || e.noHitSquash ? 1 : (e.slimeScaleX || 1), bodyY = e.behavior || e.noHitSquash ? 1 : (e.slimeScaleY || 1);
  const slimeW = (e.drawWidth || 42) * bodyX * sqX, slimeH = (e.drawHeight || 33) * bodyY * sqY;
  const bottomY = e.y + 13 - lift;
  const shadowScale = Math.max(.55, 1 - lift / 22) * size;
  ctx.globalAlpha = .28 * Math.min(1, shadowScale); ctx.fillStyle = '#071015';
  if (e.behavior !== 'burrow') { ctx.beginPath(); ctx.ellipse(e.x, e.y + 13, 15 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2); ctx.fill(); }   // 版權老鼠從土堆裡出來，不畫腳下陰影
  // 撲擊落點警示：蓄力時由外往內縮的紅圈＋逐漸填滿，飛撲時保持顯示
  const pounceGoal = e.playerPounceGoal;
  if (pounceGoal && (e.playerWindupT > 0 || e.playerPounceT > 0)) {
    const charge = e.playerWindupT > 0 ? 1 - e.playerWindupT / SLIME_POUNCE.windup : 1;
    const R = SLIME_POUNCE.hitRadius * (e.sizeMul || 1), gy = pounceGoal.y + 10;
    ctx.globalAlpha = .18 + .22 * charge; ctx.fillStyle = '#ff4b3a';
    ctx.beginPath(); ctx.ellipse(pounceGoal.x, gy, R * charge, R * .45 * charge, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .55 + .4 * charge; ctx.strokeStyle = '#ff8665'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(pounceGoal.x, gy, R, R * .45, 0, 0, Math.PI * 2); ctx.stroke();
  }
  if (e.playerWindupT > 0) {   // 蓄力時身體顫抖
    const charge = 1 - e.playerWindupT / SLIME_POUNCE.windup;
    ctx.translate((Math.random() * 2 - 1) * 1.6 * charge, 0);
  }
  ctx.globalAlpha = 1;
  const walkFrame = e.frames ? monsterWalkFrame(e) : null;
  if (walkFrame && walkFrame.charging) ctx.translate((Math.random() * 2 - 1) * 1.2, 0);   // 高舉蓄力時微微發抖
  if (e.tremble) ctx.translate((Math.random() * 2 - 1) * 1.8, (Math.random() * 2 - 1) * .6);   // 菁英鳥頭人衝撞前蓄力：全身發抖（js/elite-bird-head.js）
  if (walkFrame) { e.lastFrameFile = walkFrame.file; e.lastFrameFlip = walkFrame.flip; }   // 死亡倒地用目前這張圖
  const baseSprite = monsterImage(walkFrame ? walkFrame.file : e.art ? shooterFrame(e) : (e.sprite || 'images/monster/Monster_Slime.png'));   // 珍珠小童：眨眼／生氣圖
  const sway = e.behavior === 'charger' && typeof chargerSwayAngle === 'function' ? chargerSwayAngle(e) : 0;   // 鳥頭人暈眩：以腳底為軸左右斜晃（js/bird-head.js）
  if (sway) { ctx.save(); ctx.translate(e.x, bottomY); ctx.rotate(sway); ctx.translate(-e.x, -bottomY); }
  if (walkFrame && walkFrame.flip) { ctx.translate(e.x, 0); ctx.scale(-1, 1); ctx.translate(-e.x, 0); }   // 朝另一邊：左右翻
  if (e.behavior === 'burrow' && typeof drawBurrowingMouseBody === 'function') {
    drawBurrowingMouseBody(ctx, e);
  } else if (baseSprite.complete && baseSprite.naturalWidth) {
    const sprite = tintedSprite(baseSprite, e.tint);   // 變體換色
    const prevSmooth = ctx.imageSmoothingEnabled;   // 畫完放回原本的設定（不要直接打開平滑，不然後面畫的牆、道具會被糊掉）
    ctx.imageSmoothingEnabled = false;
    let fw = slimeW, fh = slimeH;
    if (walkFrame && (walkFrame.attack || walkFrame.natural)) {   // 攻擊圖畫布比較大（鳥頭人背面圖比較窄）：照站姿圖的比例換算，腳底中央對齊
      const base = monsterImage(e.frames.front);
      if (base.naturalWidth) { fw = baseSprite.naturalWidth * slimeW / base.naturalWidth; fh = baseSprite.naturalHeight * slimeH / base.naturalHeight; }
    }
    const dx = Math.round(e.x - fw / 2), dy = Math.round(bottomY - fh), dw = Math.round(fw), dh = Math.round(fh);
    ctx.drawImage(sprite, dx, dy, dw, dh);
    // 受擊閃紅；自爆引信點燃時越閃越快
    const fuseP = e.fuseT > 0 ? 1 - e.fuseT / SLIME_BOMB.fuse : 0;
    const fuseFlash = fuseP > 0 ? (Math.sin(fuseP * fuseP * 60) > 0 ? .85 : .15) : 0;
    if (e.hitT > 0) drawHitFlash(sprite, Math.min(1, e.hitT / .16), e.hitColor, dx, dy, dw, dh);   // 先閃白，再轉屬性色
    if (e.mf && e.mf.prey && typeof drawMilkfishPrey === 'function') drawMilkfishPrey(ctx, e, dx, dy, dw, dh, baseSprite);   // 虱目魚小子嘴裡的隊友：用這一幀實際畫的位置，被打壓扁、晃動時才會黏在嘴上（js/milkfish-kid.js）
    if (walkFrame && walkFrame.rig) drawRigArm(e, walkFrame, dx, dy, dw, dh);   // 揮手：即時轉動的手臂
    const fuseSil = fuseFlash ? flashSprite(sprite, '#ff6a3d') : null;
    if (fuseSil) { ctx.globalAlpha = fuseFlash * .75; ctx.drawImage(fuseSil, dx, dy, dw, dh); ctx.globalAlpha = 1; }
    ctx.imageSmoothingEnabled = prevSmooth;
  } else {
    ctx.fillStyle = '#48c7d5'; ctx.beginPath(); ctx.ellipse(e.x, bottomY - slimeH / 2, slimeW / 2.8, slimeH / 2.8, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (sway) ctx.restore();   // 斜晃只套在身體上（連左右翻一起還原），血條和文字不跟著晃
  else if (walkFrame && walkFrame.flip) { ctx.translate(e.x, 0); ctx.scale(-1, 1); ctx.translate(-e.x, 0); }   // 翻回來，血條和文字才不會左右顛倒
  // 血條放在圖的上方（體型大的變體血條也跟著變寬、變高）
  const barW = 32 * Math.max(1, size), barY = e.y + 13 - (e.drawHeight || 33) - 6 - (e.behavior === 'shooter' ? lift : 0);   // 浮在空中的怪物，血條跟著往上
  if (!e.hideBar) {   // 劇情裡的怪物不畫血條（js/story-scene.js）
    ctx.fillStyle = '#000'; ctx.fillRect(e.x - barW / 2, barY, barW, 3);
    ctx.fillStyle = e.variant === 'giant' ? '#c79bff' : '#7CFC7C'; ctx.fillRect(e.x - barW / 2, barY, barW * Math.max(0, e.hp) / e.maxhp, 3);
  }
  if (e.variant === 'giant') {
    ctx.fillStyle = '#e3c8ff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(SLIME_VARIANTS.giant.name, e.x, barY - 4);
  }
  if (e.burnT > 0) { ctx.strokeStyle='#ff7b39';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,17,0,Math.PI*2);ctx.stroke(); }
  if (e.stunT > 0 && e.behavior !== 'burrow') { ctx.fillStyle='#ffe36e';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(e.sleepT > 0 ? '睡著' : e.shockT > 0 ? '麻痺' : '顫抖',e.x,barY - 4 - (e.variant === 'giant' ? 13 : 0)); }   // 雷擊＝麻痺；其他停住＝顫抖
  if (e.confuseT > 0) { ctx.fillStyle='#d6a0ff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('混亂',e.x,e.y-33); }
  if (SHOW_ENEMY_ALERT && e.alertT > 0) {   // 剛被溫特的槍吸引過來：頭上彈出「！」（目前關掉）
    const age = ENEMY_ALERT_TIME - e.alertT, pop = age < .12 ? .6 + age / .12 * .7 : 1.3 - Math.min(.3, (age - .12) * 1.5);
    ctx.save(); ctx.translate(e.x, barY - 9); ctx.scale(pop, pop); ctx.globalAlpha = Math.min(1, e.alertT / .25);
    ctx.font = '900 17px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText('!', 0, 0);
    ctx.fillStyle = '#ffd24a'; ctx.fillText('!', 0, 0);
    ctx.restore();
  }
  if (e.hitT > 0) {
    ctx.globalAlpha = Math.min(1, e.hitT / .16);
    ctx.strokeStyle = e.hitColor || '#fff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(e.x, e.y, 15 + (1 - e.hitT / .16) * 5, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
// 坐著的人畫在椅子的前或後：一般椅子／床畫在上面（+0.5）；背面的椅子讓椅背蓋住人（-0.5）
function seatDrawY(seat) { return seat.sortY + (seat.chairInFront ? -0.5 : 0.5); }
// 椅子設定有旋轉角度（橫放的床）時，以角色圖中心旋轉（呼叫前要先 ctx.save()）
function seatRotate(actor, size) {
  const deg = actor.sitting && actor.sitting.rotation;
  if (!deg) return;
  const cy = actor.y - size / 2 + 18;
  ctx.translate(actor.x, cy); ctx.rotate(deg * Math.PI / 180); ctx.translate(-actor.x, -cy);
}
// 特殊 NPC 名字前的白色小圖示（角色 id → 圖檔）；要幫別的 NPC 加圖示，在這裡多加一行
const NPC_NAME_ICON_SRC = {
  noah: 'images/ui/noah-wrench.svg?v=20261021cute',   // 諾亞：開發工坊（扳手，粗圓版）
  ash: 'images/ui/ash-clipboard.svg?v=20261021',   // 亞許：通訊員、報告任務（任務板）
  taana: 'images/ui/taana-whistle.svg?v=20261021', // 塔納：訓練室負責人（哨子）
};
const npcNameIcons = {};
for (const id in NPC_NAME_ICON_SRC) { npcNameIcons[id] = new Image(); npcNameIcons[id].src = NPC_NAME_ICON_SRC[id]; }
// 戰鬥區域隊員名字前的職業圖示
const roleNameIcons = { sentinel: new Image(), guide: new Image() };
roleNameIcons.sentinel.src = 'images/ui/sentinel-swords.svg'; roleNameIcons.guide.src = 'images/ui/guide-shield-plus.svg';
// 圖示的黑色剪影（畫黑邊用）：第一次用到時做一張，之後重複使用
const npcIconEdges = {};
function npcIconOutline(id, img) {
  if (npcIconEdges[id]) return npcIconEdges[id];
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, 64, 64);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgba(0,0,0,.9)'; g.fillRect(0, 0, 64, 64);
  return (npcIconEdges[id] = c);
}
// 走路時一蹦一蹦的 NPC：height＝最高蹦幾像素、perSec＝每秒蹦幾下（只有圖會跳，頭上的名字和泡泡不跳）
const NPC_HOP = { ball: { height: 3, perSec: 4.5 } };
// 衣櫃裡戴上的配件（js/costumes.js）：behind＝畫在角色後面、front＝前面
const costumeLayer = (id, who, x, y, size, layer) => { if (typeof drawCostumeAccessories === 'function') drawCostumeAccessories(ctx, id, who, x, y, size, layer); };
function drawWanderer(npc) {
  const size = PLAYER.drawSize;
  const ballSleep = npc.id === 'ball' && typeof ballSleeping === 'function' && ballSleeping(npc);
  if (!ballSleep) drawCharacterShadow(npc);   // 睡在床上：床那張圖已經有影子
  const posed = npc.id === 'ball' && typeof drawBallPose === 'function' && drawBallPose(npc, size);   // 球球：坐下、睡在床上（js/ball-poses.js）
  const set = wandererSprites[npc.id];
  const img = !posed && set && pickCharacterFrame(set, npc);
  if (img && img.complete && img.naturalWidth) {
    const hop = NPC_HOP[npc.id], hopY = hop && npc.moving && !npc.sitting ? -Math.abs(Math.sin((npc.anim || 0) * Math.PI * hop.perSec)) * hop.height : 0;
    const prevSmooth = ctx.imageSmoothingEnabled;   // 畫完放回原本的設定（不要直接打開平滑，不然後面畫的牆、道具會被糊掉）
    ctx.imageSmoothingEnabled = false;
    ctx.save(); seatRotate(npc, size);
    costumeLayer(npc.id, npc, npc.x - size / 2, Math.round(npc.y - size + 18 + hopY), size, 'behind');
    ctx.drawImage(img, npc.x - size / 2, Math.round(npc.y - size + 18 + hopY), size, size);
    costumeLayer(npc.id, npc, npc.x - size / 2, Math.round(npc.y - size + 18 + hopY), size, 'front');
    ctx.restore();
    ctx.imageSmoothingEnabled = prevSmooth;
  }
  // 頭頂名字（跟哨兵同樣式；NPC 沒有血條）
  const name = (WANDERERS.find(w => w.id === npc.id) || {}).name;
  if (!name) return;
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const nameY = npc.y - size + 12 + (NPC_LABEL_DY[npc.id] || 0);   // 比圖片頂端再往下 5px（矮的角色再往下，見 NPC_LABEL_DY）
  const nameIcon = npcNameIcons[npc.id];
  const hasIcon = nameIcon && nameIcon.complete && nameIcon.naturalWidth;
  const iconSize = 12, iconGap = 3;
  const textX = npc.x + (hasIcon ? (iconSize + iconGap) / 2 : 0);
  ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(name, textX, nameY);
  ctx.fillStyle = '#fff'; ctx.fillText(name, textX, nameY);
  if (hasIcon) {
    const iconX = textX - ctx.measureText(name).width / 2 - iconGap - iconSize;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    // 黑邊：跟名字的描邊一樣粗（名字 lineWidth 3 ＝ 往外 1.5 像素），把黑色剪影往四周各蓋一圈，再畫白色圖示
    const edge = npcIconOutline(npc.id, nameIcon);
    if (edge) for (let a = 0; a < 16; a++) ctx.drawImage(edge, iconX + Math.cos(a / 8 * Math.PI) * 1.5, nameY - 10 + Math.sin(a / 8 * Math.PI) * 1.5, iconSize, iconSize);
    ctx.drawImage(nameIcon, iconX, nameY - 10, iconSize, iconSize);
    ctx.restore();
  }
  if (npc.say && npc.say.text) queueTowerBubble(npc, npc.x, nameY - 13, npc.say.text, BUBBLE_COLORS[npc.id]);   // 頭上對話泡泡（角色專屬色）：先記下來，最後畫在最上層（flushTowerBubbles）
}
// 頭上的名字、對話泡泡、「與 XX 對話」提示要往下移幾像素（角色比人矮的時候用，例如球球是狗）
const NPC_LABEL_DY = { ball: 22 };
// 對話泡泡：參考《苦艾與甘露》——深色半透明底＋角色專屬色邊框/文字＋圓角＋向下小尾巴＋淡光暈
// 淺底色＋深色字，每個角色一種顏色（bg 淺底／bd 邊框＋尾巴／tx 深色文字）
const BUBBLE_COLORS = {
  taana:   { bg: '#e0e0fb', bd: '#5a5fc4', tx: '#262a6e' },   // 偏紫的藍
  eden:    { bg: '#fde0ef', bd: '#d0609a', tx: '#5e1f42' },   // 粉色
  salem:   { bg: '#ddf0fb', bd: '#4f9cc9', tx: '#173f58' },   // 淺藍
  colyn:   { bg: '#fdebd2', bd: '#d98a2b', tx: '#5a3208' },   // 暖橘（配他的橘色眼睛）
  rowan:   { bg: '#e2f1dc', bd: '#5e9a52', tx: '#21401b' },   // 淡綠（配他的綠頭髮）
  cael:    { bg: '#eceedd', bd: '#8f9a62', tx: '#3a4020' },   // 灰綠（配他的淺綠頭髮）
  saku:    { bg: '#e2e5f4', bd: '#4c5a92', tx: '#1d2550' },   // 靛藍（配朔的黑髮藍眼）
  kakuma:  { bg: '#f5e2e3', bd: '#b0474f', tx: '#4f1a1f' },   // 灰紅（配赫真的灰髮紅眼）
  avaren:  { bg: '#dce8fb', bd: '#3a5fa0', tx: '#1c3766' },   // 淺藍
  eldrin:  { bg: '#d8efe6', bd: '#2f8a68', tx: '#123f2e' },   // 青綠
  noah:    { bg: '#f3ecd9', bd: '#a89355', tx: '#4a3f1c' },   // 米黃
  chris:   { bg: '#eef2f6', bd: '#8a97a8', tx: '#2b3541' },   // 冷白
  claire:  { bg: '#f5ecd6', bd: '#a07a3a', tx: '#4d3712' },   // 金
  luther:  { bg: '#e4f0d6', bd: '#5f8a35', tx: '#2c4014' },   // 草綠
  muomn:   { bg: '#d6edf2', bd: '#2f8598', tx: '#123842' },   // 藍綠
  theonie: { bg: '#fbe0ec', bd: '#c04a7a', tx: '#5a1c38' },   // 粉紅
  amber:   { bg: '#e5e2f7', bd: '#5f52a8', tx: '#2a2356' },   // 藍紫
  red:     { bg: '#f7dee1', bd: '#a8303a', tx: '#5a1a20' },   // 紅
  tino:    { bg: '#fdeacb', bd: '#d1892a', tx: '#5a3410' },   // 橘黃（對應橘髮與金黃色眼睛）
  ash:     { bg: '#e6e8ee', bd: '#5b6478', tx: '#242a36' },   // 墨灰
};
const BUBBLE_DEFAULT = { bg: '#eef2f7', bd: '#5a6a86', tx: '#232a36' };
function drawSpeechBubble(cx, bottomY, text, col) {
  const c = !col ? BUBBLE_DEFAULT : typeof col === 'string' ? { ...BUBBLE_DEFAULT, bd: col } : col, tail = 6, rad = 9;   // 只給一個色碼：當作框的顏色
  ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const lines = wrapBubbleText(text), lineH = 18;
  const tw = Math.max(...lines.map(l => ctx.measureText(l).width)), w = tw + 24, h = 8 + lines.length * lineH;
  const x = Math.round(cx - w / 2), y = Math.round(bottomY - tail - h);
  ctx.fillStyle = c.bg; roundRect(x, y, w, h, rad); ctx.fill();
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1.2; roundRect(x, y, w, h, rad); ctx.stroke();
  ctx.fillStyle = c.bd;                                       // 向下小三角尾巴（同邊框色）
  ctx.beginPath(); ctx.moveTo(cx - 5, y + h); ctx.lineTo(cx + 5, y + h); ctx.lineTo(cx, y + h + tail); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c.tx; lines.forEach((l, i) => ctx.fillText(l, cx, y + 18 + i * lineH));    // 角色色文字
  return y;   // 泡泡頂端：互動提示會排到它上面，不會蓋住
}
// 泡泡太長就換行：每行最寬 BUBBLE_MAX_W 像素；幾行之間盡量一樣長，而且優先在標點符號後面斷（台詞裡打 \n 也會換行）
const BUBBLE_MAX_W = 200;   // 大約 14 個字（建議寬度：在標點斷行時最多可以再超出 BUBBLE_STRETCH 像素）
const BUBBLE_STRETCH = 28;   // 大約 2 個字
const bubbleWrapCache = new Map();
function wrapBubbleText(text) {
  const key = String(text); if (bubbleWrapCache.has(key)) return bubbleWrapCache.get(key);
  const out = [];
  for (const para of key.split('\n')) {
    const full = ctx.measureText(para).width;
    if (full <= BUBBLE_MAX_W) { out.push(para); continue; }
    // 先決定要幾行，再一行一行找最好的斷點：每行盡量接近平均寬度、在標點後面斷加分、標點不放在行首
    let rest = [...para], n = Math.ceil(full / BUBBLE_MAX_W);
    while (n > 1 && rest.length) {
      const w = i => ctx.measureText(rest.slice(0, i).join('')).width, restW = ctx.measureText(rest.join('')).width, target = restW / n;
      let best = -1, bestScore = Infinity;
      for (let i = 1; i < rest.length; i++) {
        const wl = w(i); if (wl > BUBBLE_MAX_W + BUBBLE_STRETCH) break;
        const punct = /[，。！？…、；」』）\s]/.test(rest[i - 1]);
        if (wl > BUBBLE_MAX_W && !punct) continue;   // 超過建議寬度：只有在標點後面斷才可以
        if (/[，。！？…、；」』）]/.test(rest[i])) continue;   // 下一行不能用標點開頭
        if (ctx.measureText(rest.slice(i).join('')).width > (BUBBLE_MAX_W + BUBBLE_STRETCH) * (n - 1)) continue;   // 剩下的要塞得進剩下的行數
        const score = Math.abs(wl - target) - (/[，。！？…、；」』）\s]/.test(rest[i - 1]) ? 64 : 0);   // 在標點後面斷：大約可以多讓 4 個字的長短差
        if (score < bestScore) { bestScore = score; best = i; }
      }
      if (best < 0) best = Math.max(1, rest.length - 1);
      out.push(rest.slice(0, best).join('')); rest = rest.slice(best); n--;
    }
    if (rest.length) out.push(rest.join(''));
  }
  if (bubbleWrapCache.size > 300) bubbleWrapCache.clear();
  bubbleWrapCache.set(key, out);
  return out;
}
// 所有角色（隊員、NPC）頭上的對話泡泡：先記下來，等建築、屋簷、黑幕、「急救／疏導」選項都畫完，最後才畫（flushTowerBubbles）
// → 泡泡永遠在最上層，不會被角色前面的牆、建築擋住。
// 這位隊員頭上有選項時，泡泡排到選項的上面——選項固定在頭上不會被泡泡推走。
let pendingTowerBubbles = new Map();   // 隊員 → 這一幀要畫的泡泡（同一位隊員一幀可能畫兩次身體，只留最後一次）
function queueTowerBubble(t, cx, bottomY, text, col) { pendingTowerBubbles.set(t, { cx, bottomY, text, col, alpha: ctx.globalAlpha }); }
function flushTowerBubbles() {
  for (const [t, b] of pendingTowerBubbles) {
    const mine = towerPrompts.filter(p => p.actor === t);
    const bottom = mine.length ? Math.min(b.bottomY, Math.min(...mine.map(p => p.y)) - 2) : b.bottomY;
    ctx.save(); ctx.globalAlpha = b.alpha;
    markBubble(t, drawSpeechBubble(b.cx, bottom, b.text, b.col));
    ctx.restore();
  }
  pendingTowerBubbles.clear();
}
// 記下這一幀角色頭上泡泡的頂端；互動提示（drawInteractPrompt）用來避開泡泡
function markBubble(actor, top) { actor.bubbleTop = top; actor.bubbleAt = performance.now(); }
function promptTopAbove(actor, top) {
  return actor && actor.bubbleAt && performance.now() - actor.bubbleAt < 120 ? Math.min(top, actor.bubbleTop - 2) : top;
}
// 椅子上方的「[E] 坐」提示框
// 拆除模式：滑鼠指到可以拆的建築時，紅框框起來＋上方顯示「拆除 退回 $X」
// ---- 逃生樓梯的常駐箭頭：樓梯右邊的出入口＝上樓、左邊＝下樓 ----
const STAIR_ARROW = { ids: [
  'tile_eoc_escape_stairs', 'tile_mvi1thjl', 'tile_hq_stairs',
  'tile_mrt_stairs_dark', 'tile_mrt_stairs_light', 'tile_mvcrmipy'
] };
let stairArrowCache = null;
// 從地圖名稱看樓層：「2F應變中心」→ 2、「B3」→ −3（舊寫法「B-3」也認得）；看不出來回傳 null
function mapFloorNumber(name) {
  const t = String(name || '').trim(), b = /^B-?(\d+)/i.exec(t), f = /^(\d+)F/i.exec(t);
  return b ? -Number(b[1]) : f ? Number(f[1]) : null;
}
function stairArrowSpots() {
  if (stairArrowCache && stairArrowCache.map === MAP && stairArrowCache.portals === (typeof mapPortals !== 'undefined' ? mapPortals : null)) return stairArrowCache.list;
  const list = [];
  for (const s of (MAP && MAP.stamps) || []) {
    if (!STAIR_ARROW.ids.includes(s.id) || typeof mapPortals === 'undefined') continue;
    const t = mapTileById(s.id); if (!t) continue;
    const w = mapStampW(s, t), h = mapStampH(s, t);
    const left = s.c + (s.ox || 0) / CELL, top = s.r + (s.oy || 0) / CELL, mid = left + w / 2;
    const groups = {};   // 同一個目的地的出入口格合成一個箭頭
    for (const pt of mapPortals) {
      if (pt.c + .5 < left || pt.c + .5 >= left + w || pt.r + .5 < top || pt.r + .5 >= top + h) continue;
      (groups[pt.to] = groups[pt.to] || []).push(pt);
    }
    const here = mapFloorNumber(MAP && MAP.name);
    for (const [to, pts] of Object.entries(groups)) {
      const x = pts.reduce((sum, pt) => sum + center(pt.c, pt.r)[0], 0) / pts.length;
      const y = Math.min(...pts.map(pt => center(pt.c, pt.r)[1]));
      const there = mapFloorNumber(portalTargetName({ to }));
      // 看得出樓層就比樓層；看不出來就照位置：右邊上樓、左邊下樓
      const dir = here != null && there != null && here !== there ? (there > here ? 'up' : 'down') : (x >= OX + mid * CELL ? 'up' : 'down');
      list.push({ dir, x, y, portals: pts });
    }
  }
  stairArrowCache = { map: MAP, portals: typeof mapPortals !== 'undefined' ? mapPortals : null, list };
  return list;
}
function isStairPortal(portal) {
  return !!stairPortalDir(portal);
}
// 這個出入口是樓梯的話，回傳 'up'（上樓）或 'down'（下樓）；不是樓梯回傳 null
function stairPortalDir(portal) {
  const a = stairArrowSpots().find(a => a.portals.some(p => p.c === portal.c && p.r === portal.r && p.to === portal.to));
  return a ? a.dir : null;
}
function drawStairArrows() {
  if (!G?.running) return;
  const bob = Math.sin(performance.now() / 1000 * Math.PI * 2 / 1.8) * 3;
  for (const a of stairArrowSpots()) {
    const x = Math.round(a.x), y = a.y - CELL * 1.1 + bob, direction = a.dir === 'up' ? -1 : 1;
    ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = '#a0a5aa'; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y + direction * 4); ctx.lineTo(x - 7, y - direction * 3); ctx.lineTo(x + 7, y - direction * 3); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
  }
}
// 放建築時：溫特周圍「能蓋的範圍」（畫在黑幕上面，暗處也看得到）
function drawBuildRange() {
  if (!G || !G.player || !G.running || !G.selType || !G.selType.startsWith('build:') || typeof BUILD_RANGE === 'undefined') return;
  const x = G.player.x, y = G.player.y, R = BUILD_RANGE * CELL;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(143,211,255,.9)'; ctx.setLineDash([10, 6]);
  ctx.stroke();
  ctx.restore();
}
// flash() 跳出來的提示字（黑底標籤），畫在黑幕上面
const textEffectIconImages = {};
function drawTextEffects() {
  for (const f of G.effects) {
    if (!f.text || f.dmg || f.spriteEffect) continue;
    const life0 = f.life0 || 0.8;
    const alpha = Math.min(1, f.life / 0.6);                 // 最後 0.6 秒才淡出，其餘維持清晰
    const ty = f.y + (f.vy || 0) * Math.min(0.8, life0 - f.life);   // 只在前段緩緩上飄
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';   // 字小一點（12px），上下置中在黑底標籤裡
    // 黑底標籤：讓提示字在任何背景上都看得清楚
    const tw = ctx.measureText(f.text).width;
    const iconSpace=f.iconImage?34:0,totalWidth=tw+iconSpace;
    const textX=f.x+iconSpace/2;
    ctx.globalAlpha = alpha * 0.72; ctx.fillStyle = '#000';
    const boxH = f.iconImage ? 30 : 19, cy = ty - (f.iconImage ? 5 : 4.5);   // 標籤的正中間（跟原本的位置一樣）
    roundRect(f.x - totalWidth / 2 - 8, cy - boxH / 2, totalWidth + 16, boxH, 6); ctx.fill();
    ctx.globalAlpha = alpha; ctx.fillStyle = f.color;
    ctx.fillText(f.text, textX, cy + 1);   // +1：中文字的視覺中心稍微偏上，往下補一點
    if(f.iconImage){
      let img=textEffectIconImages[f.iconImage];
      if(!img){img=new Image();img.src=f.iconImage;textEffectIconImages[f.iconImage]=img;}
      if(img.complete&&img.naturalWidth){
        const scale=Math.min(28/img.naturalWidth,24/img.naturalHeight);
        const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
        ctx.imageSmoothingEnabled=false;ctx.drawImage(img,f.x-totalWidth/2+(28-w)/2,ty-5-h/2,w,h);
      }
    }
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
  }
}
function drawDemolishPreview() {
  if (!G || G.selType !== 'demolish' || !aimClient || typeof playerBuildingAt !== 'function') return;
  const w = clientToWorld(aimClient.x, aimClient.y), [c, r] = cellAt(w.x, w.y), o = playerBuildingAt(c, r);
  if (!o) return;
  const x = OX + o.c * CELL, y = OY + o.r * CELL, bw = (o.w || 1) * CELL, bh = (o.h || 1) * CELL;
  ctx.save();
  ctx.strokeStyle = '#ff8a6a'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(x + 1, y + 1, bw - 2, bh - 2); ctx.setLineDash([]);
  const refund = demolishRefund(o), label = o.playerBuilt ? (refund ? '退回 $' + refund : '退回 $0') : '不退錢';
  ctx.font = 'bold 13px sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  const tw = ctx.measureText(label).width + 18, tx = Math.round(x + bw / 2 - tw / 2), ty = Math.round(y - 30);
  ctx.fillStyle = 'rgba(12,16,22,.92)'; roundRect(tx, ty, tw, 22, 6); ctx.fill();
  ctx.strokeStyle = refund ? 'rgba(255,212,121,.9)' : 'rgba(170,180,190,.7)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = refund ? '#ffd479' : '#b9c3cd'; ctx.fillText(label, tx + tw / 2, ty + 11.5);
  ctx.restore();
}
function drawInteractPrompt(cx, topY, label) {
  ctx.textBaseline='alphabetic';ctx.font='bold 13px sans-serif';
  const pad=9,boxW=ctx.measureText(label).width+pad*2,boxH=24;
  const x=Math.round(cx-boxW/2),y=Math.round(topY-boxH-3);
  ctx.fillStyle='rgba(12,16,22,.9)';roundRect(x,y,boxW,boxH,6);ctx.fill();
  ctx.strokeStyle='rgba(143,211,255,.85)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#e6ebf2';ctx.textAlign='center';ctx.fillText(label,cx,y+17);
}
// ---- 靠近隊員時頭上的按鍵提示：上面「急救」（F）、下面「疏導」（C）；只能按鍵，滑鼠點不到 ----
// 倒下的隊員只顯示「急救」（身上有異質急救包才會出現）。現在用不到的選項（滿血或沒有急救包＝不顯示「急救」；沒有污染＝不顯示「疏導」）直接不出現。
// 框線顏色：急救＝粉紅色、疏導＝藍色。畫出來的位置記在 towerPrompts，頭上的對話泡泡會排到它上面（flushTowerBubbles）。
let towerPrompts = [];
const TOWER_PROMPT_STYLE = {
  firstaid: { line: 'rgba(255,138,138,.55)' },
  soothe:   { line: 'rgba(143,211,255,.55)' },
};
function drawTowerPrompts(actor, topY) {
  if (typeof playerChannel !== 'undefined' && playerChannel) return;   // 正在疏導／急救／包紮：頭上換成進度條，不顯示選項
  const canAid = !MAP_SAFE && (typeof aidUsableOn === 'function' ? aidUsableOn(actor) : true);   // 疏導室（安全區）裡只有「C 疏導」
  const items = actor.hp <= 0 ? [{ kind: 'firstaid', label: '急救', key: canAid ? 'F' : '', off: !canAid }]   // 由上往下
    : [{ kind: 'firstaid', label: '急救', key: canAid ? 'F' : '', off: !canAid }, { kind: 'soothe', label: '疏導', key: 'C', off: !(actor.taint > 0 || actor.berserk) }].filter(it => !it.off);   // 現在用不到的選項（不需要補血、不需要疏導）不顯示
  if (!items.length) return;   // 兩個都用不到：頭上什麼都不出現
  const boxH = 20, gap = 1;
  ctx.save();
  ctx.textBaseline = 'alphabetic'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
  const keyFont = 'bold 10px sans-serif', keyW = it => { if (!it.key) return 0; ctx.font = keyFont; const w = ctx.measureText(it.key).width + 8; ctx.font = 'bold 13px sans-serif'; return w + 4; };
  const boxW = Math.max(...items.map(it => ctx.measureText(it.label).width + keyW(it))) + 14;   // 寬：按鍵小框＋字寬＋左右各 7px
  const x = Math.round(actor.x - boxW / 2);
  let y = Math.round(topY - 5 - items.length * boxH - (items.length - 1) * gap);   // 縮小後底邊往上 2px，讓按鈕中心留在原本的位置
  for (const it of items) {
    const st = TOWER_PROMPT_STYLE[it.kind];
    towerPrompts.push({ x, y, w: boxW, h: boxH, kind: it.kind, actor });
    ctx.fillStyle = 'rgba(12,16,22,.9)';
    roundRect(x, y, boxW, boxH, 6); ctx.fill();
    ctx.strokeStyle = st.line; ctx.lineWidth = 1.5;
    roundRect(x, y, boxW, boxH, 6); ctx.stroke();
    const kw = keyW(it), lw = ctx.measureText(it.label).width, left = actor.x - (kw + lw) / 2;
    if (kw) {   // 按鍵小框（例如 F、空白鍵）
      ctx.save(); ctx.font = keyFont;
      ctx.fillStyle = 'rgba(255,255,255,.14)'; roundRect(left, y + 4, kw - 4, boxH - 8, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1; roundRect(left, y + 4, kw - 4, boxH - 8, 3); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(it.key, left + (kw - 4) / 2, y + 14);
      ctx.restore();
    }
    ctx.fillStyle = it.off ? '#7d8996' : '#e6ebf2';
    ctx.textAlign = 'left'; ctx.fillText(it.label, left + kw, y + 15); ctx.textAlign = 'center';
    y += boxH + gap;
  }
  ctx.restore();
}
function drawSitPrompt(seat) { drawInteractPrompt(seat.x, seat.top, seat.prompt || '坐'); }
function drawPlayerReloadCountdown(p, size) {
  if (!(p.reloadT > 0)) return;
  const w = 58, h = 20, x = Math.round(p.x - w / 2), y = Math.round(p.y - size - 14);
  const progress = Math.max(0, Math.min(1, 1 - p.reloadT / PLAYER_ATK.reloadTime));
  ctx.save();
  ctx.fillStyle = 'rgba(10,17,27,.94)'; roundRect(x, y, w, h, 6); ctx.fill();
  ctx.strokeStyle = '#5d88a8'; ctx.lineWidth = 1; ctx.stroke();
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e2f2ff'; ctx.fillText('Reload', p.x, y + 8);
  ctx.fillStyle = '#243a50'; ctx.fillRect(x + 5, y + h - 6, w - 10, 3);
  ctx.fillStyle = '#71c8fa'; ctx.fillRect(x + 5, y + h - 6, (w - 10) * progress, 3);
  ctx.restore();
}
// 低血量警示：溫特 HP 低於 hp 時，畫面四周和溫特身上一起閃紅光（period＝閃一次幾秒）
const LOW_HP_FX = { hp: 30, period: 1.1, edge: .5, body: .38, topBottom: 1.3, heartbeat: 2.6 };   // heartbeat：心跳聲音量倍率（js/sanity.js 播；音檔本身很小聲，最大只有 34%，所以放大到 2.6 倍≈滿格）   // topBottom：上下邊紅光的強弱（1＝跟左右一樣，越大越淡）
function lowHpPulse() {   // 0～1，不在低血量時回傳 0
  const p = G && G.player;
  if (!p || MAP_SAFE || G.over || p.hp <= 0 || p.hp >= LOW_HP_FX.hp) return 0;
  const t = performance.now() / 1000 / LOW_HP_FX.period;
  return Math.pow(.5 - .5 * Math.cos(t * Math.PI * 2), 1.5);   // 慢慢亮起、慢慢暗下（像心跳）
}
// 溫特陣亡動畫（js/game.js 的 lose 開始；戰場定格，只有這段在動）
function drawPlayerDeath(p) {
  drawFallDown(p, playerSprites, (performance.now() - G.playerDeath.at) / 1000, false);   // 溫特：不左右晃，只閃白
}
// 倒下動畫（溫特陣亡、隊員失去戰鬥能力共用）：踉蹌（站姿閃白、左右晃）→ 倒地圖從上面落下、著地壓扁回彈、揚起灰塵
// age＝倒下後過了幾秒；時間長度沿用 js/game.js 的 PLAYER_DEATH.stagger／fall。回傳 false＝這個角色沒有倒地圖
const FALL_DOWN_TIME = () => PLAYER_DEATH.stagger + PLAYER_DEATH.fall + .5;   // 整段動畫（含灰塵）多久
function drawFallDown(p, set, age, wobble = true) {
  const D = PLAYER_DEATH, size = PLAYER.drawSize;
  const fail = set && set.fail, stand = set && pickCharacterFrame(set, { ...p, hp: 1, moving: false, gunT: 0, sitting: null });
  if (!(fail && fail.complete && fail.naturalWidth)) return false;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if (age < D.stagger) {   // 踉蹌：站著閃白、左右晃
    const k = Math.max(0, 1 - age / D.stagger), shake = wobble ? Math.sin(age * 70) * 3 * k : 0;
    if (stand && stand.complete && stand.naturalWidth) {
      ctx.drawImage(stand, p.x - size / 2 + shake, p.y - size + 18, size, size);
      drawHitFlash(stand, Math.min(1, k * 1.4), '#ff4d4d', p.x - size / 2 + shake, p.y - size + 18, size, size);
    }
  } else {   // 倒地：從上面落下，著地時壓扁回彈，揚起灰塵
    const u = Math.min(1, (age - D.stagger) / D.fall), landed = age - D.stagger - D.fall;
    const drop = (1 - u * u) * 14;
    const squash = landed > 0 ? Math.max(0, .18 * Math.cos(landed * 18) * Math.exp(-landed * 7)) : 0;
    const w = size * (1 + squash), h = size * (1 - squash);
    ctx.drawImage(fail, p.x - w / 2, p.y + 18 - h - drop, w, h);
    if (landed > 0 && landed < .5) {   // 灰塵圈
      const q = landed / .5;
      ctx.globalAlpha = (1 - q) * .55; ctx.strokeStyle = '#b9b2a2'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 14, 10 + q * 26, 4 + q * 8, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
  return true;
}
// 衝刺（js/game.js 的 DASH）：身後淡藍色的殘影；頭上血條上方一條細細的白色冷卻條（冷卻好了就不畫）
function drawDashTrail(p, img, size) {
  const tr = p.dashTrail; if (!tr || !tr.length || typeof DASH === 'undefined') return;
  const now = performance.now() / 1000;
  while (tr.length && now - tr[0].t > DASH.trailLife) tr.shift();
  const sil = typeof flashSprite === 'function' ? flashSprite(img, '#8fd3ff') : null; if (!sil) return;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for (const g of tr) {
    const k = 1 - (now - g.t) / DASH.trailLife; if (k <= 0) continue;
    ctx.globalAlpha = .45 * k; ctx.drawImage(sil, g.x - size / 2, g.y - size + 18, size, size);
  }
  ctx.restore();
}
// 冷卻條：跟左上角隊員頭像的大招冷卻條（css/style.css 的 .field-cd-bar）同一個樣子——剛衝完是滿的，往左慢慢縮短
// hpY＝血條的 y（戰鬥地圖：畫在血條上方 DASH_BAR.gap；基地沒有血條：畫在血條的位置再往上 DASH_BAR.lift，才不會擋到頭飾）
const DASH_BAR = { w: 34, h: 2, gap: 2, lift: 7, color: '#ffffff' };
function drawDashCooldown(p, hpY) {
  if (typeof DASH === 'undefined' || !(p.dashCd > 0)) return;
  const remain = Math.min(1, p.dashCd / DASH.cd), { w, h, gap } = DASH_BAR;
  const x = p.x - w / 2, y = MAP_SAFE ? hpY + 1 - DASH_BAR.lift : hpY - 1 - gap - 1 - h;
  ctx.save();
  ctx.fillStyle = 'rgba(8,15,24,.75)'; roundRect(x - 1, y - 1, w + 2, h + 2, 2); ctx.fill();
  ctx.shadowColor = DASH_BAR.color; ctx.shadowBlur = 4;   // 淡淡的光暈
  ctx.fillStyle = DASH_BAR.color; ctx.fillRect(x, y, w * remain, h);
  ctx.restore();
}
function drawPlayer(p) {
  drawCharacterShadow(p);
  if (G.playerDeath) { drawPlayerDeath(p); return; }   // 倒下：陣亡動畫
  const img = pickCharacterFrame(playerSprites, p);
  const size = PLAYER.drawSize;
  if (img && img.complete && img.naturalWidth && !p.sitting) drawDashTrail(p, img, size);   // 衝刺：殘影（畫在溫特後面）
  if (img && img.complete && img.naturalWidth) {
    ctx.save();
    if (p.recoilT > 0) {   // 開槍後座力：往反方向頂一下再回正
      const k = (p.recoilT / 0.14) * 4;
      ctx.translate(-Math.cos(p.recoilAng || 0) * k, -Math.sin(p.recoilAng || 0) * k);
    }
    if (typeof applyStruggleTransform === 'function') applyStruggleTransform(ctx, p);   // 被絲瓜藤纏住：掙扎扭動（js/loofah-lady.js）
    if (typeof applySlipTransform === 'function') applySlipTransform(ctx, p);   // 踩到香蕉皮：往後仰（js/golden-banana-king.js）
    ctx.imageSmoothingEnabled = false;
    const hitK = p.hitT > 0 ? Math.min(1, p.hitT / .45) : 0;   // 受擊：先閃白，再轉紅淡出
    if (p.sitting?.rotation) {
      ctx.translate(p.x, p.y - size / 2 + 18);
      ctx.rotate(p.sitting.rotation * Math.PI / 180);
      costumeLayer(PLAYER_CHARACTER, p, -size / 2, -size / 2, size, 'behind');
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      costumeLayer(PLAYER_CHARACTER, p, -size / 2, -size / 2, size, 'front');
      drawHitFlash(img, hitK, '#ff4d4d', -size / 2, -size / 2, size, size);
    } else {
      costumeLayer(PLAYER_CHARACTER, p, p.x - size / 2, p.y - size + 18, size, 'behind');
      ctx.drawImage(img, p.x - size / 2, p.y - size + 18, size, size);
      costumeLayer(PLAYER_CHARACTER, p, p.x - size / 2, p.y - size + 18, size, 'front');
      drawHitFlash(img, hitK, '#ff4d4d', p.x - size / 2, p.y - size + 18, size, size);
      const low = lowHpPulse() * LOW_HP_FX.body;   // 低血量：身上微微閃紅
      if (low > .01 && hitK <= 0) drawHitFlash(img, low, '#ff2a2a', p.x - size / 2, p.y - size + 18, size, size);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  } else {
    ctx.fillStyle = '#5ec8ff'; roundRect(p.x - 14, p.y - 16, 28, 32, 8); ctx.fill();
  }
  const hpY = p.y - size + 13;
  if (!MAP_SAFE) {
    const w = 46, h = 5, ratio = Math.max(0, p.hp / p.maxhp), x = p.x - w / 2, y = hpY;
    ctx.fillStyle = 'rgba(8,12,18,.88)'; roundRect(x - 1, y - 1, w + 2, h + 2, 3); ctx.fill();
    if (ratio > 0) { ctx.fillStyle = ratio > .35 ? '#63d7aa' : '#ff6363'; roundRect(x, y, w * ratio, h, 2); ctx.fill(); }
  }
  drawDashCooldown(p, hpY);   // 衝刺冷卻條（血條上方）
  drawPlayerReloadCountdown(p, size);
}

// 點隊員頭像：畫面內標出本人，畫面外貼著畫面邊緣指向所在方向（跟暴走的邊緣箭頭同一種做法，js/berserk-fx.js）。
function fieldLocatePosition(sx, sy, width, height) {
  const m = EDGE_ALERT.margin, inset = EDGE_ALERT.inset;
  const inside = sx > m && sx < width - m && sy > m && sy < height - m;
  if (inside) return { x: sx, y: sy, angle: Math.PI / 2, inside };
  // 從畫面中心往隊員方向，找到碰到畫面邊緣的那一點，再往內縮一點免得被切掉
  const dx = sx - width / 2, dy = sy - height / 2;
  const k = Math.min(Math.abs(dx) > 1e-6 ? (width / 2) / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-6 ? (height / 2) / Math.abs(dy) : Infinity);
  const x = Math.max(inset, Math.min(width - inset, width / 2 + dx * k)), y = Math.max(inset, Math.min(height - inset, height / 2 + dy * k));
  return { x, y, angle: Math.atan2(dy, dx), inside };
}
function drawFieldMemberLocator() {
  const hint = G.fieldLocate, now = performance.now();
  if (MAP_SAFE || !hint || now >= hint.until) return;
  const actor = hint.actor;
  if (!(G.towers || []).includes(actor) && !(G.npcs || []).includes(actor)) return;
  const spec = TYPES[actor.type] || CHARACTERS[actor.id] || {};
  const sx = (actor.x - cam.x) * VIEW_SCALE;
  const sy = (actor.y - PLAYER.drawSize - cam.y) * VIEW_SCALE;
  const pos = fieldLocatePosition(sx, sy, cv.width, cv.height);
  ctx.save();
  ctx.globalAlpha = Math.min(1, (hint.until - now) / 400);
  ctx.translate(pos.x, pos.y);
  ctx.save(); ctx.rotate(pos.angle);
  ctx.translate(Math.sin(now / 140) * 3, 0);
  ctx.fillStyle = '#ffd479'; ctx.strokeStyle = '#14202d'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-7, -11); ctx.lineTo(-3, 0); ctx.lineTo(-7, 11); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const label = spec.name || '隊員', w = ctx.measureText(label).width + 18;
  // 畫面內：名字在箭頭上方；畫面外：名字放在箭頭往畫面內側那邊
  const labelX = pos.inside ? 0 : -Math.cos(pos.angle) * (w / 2 + 20);
  const labelY = pos.inside ? -24 : -Math.sin(pos.angle) * 30;
  ctx.fillStyle = 'rgba(10,18,28,.92)'; roundRect(labelX - w / 2, labelY - 12, w, 24, 6); ctx.fill();
  ctx.fillStyle = '#ffd479'; ctx.fillText(label, labelX, labelY);
  ctx.restore();
}
// ---- 繪製 ----
function draw() {
  if (StoryScene.active()) { StoryScene.draw(); return; }
  lightsCache = LIGHT.enabled ? getLights() : [];   // 更新這一幀的光源
  computeLightField();                              // 光沿格子擴散、碰牆停（牆後全黑）
  computeFlashField();                              // 攻擊閃光（只影響畫面）
  ctx.clearRect(0, 0, cv.width, cv.height);
  // 之後畫的都是「世界座標」：先套畫面縮放，再平移鏡頭位置，畫面就會跟著玩家捲動
  ctx.save();
  if (typeof applySanitySway === 'function') applySanitySway(ctx, cv);   // SP 低於 40：畫面慢慢搖晃（js/sanity.js）
  if ((G.cameraShakeT || 0) > 0) {
    const power = 4 * Math.min(1, G.cameraShakeT / .2);
    ctx.translate((Math.random() * 2 - 1) * power, (Math.random() * 2 - 1) * power);
  }
  ctx.scale(VIEW_SCALE, VIEW_SCALE);
  const shx = shakeAmt ? (Math.random() * 2 - 1) * shakeAmt : 0, shy = shakeAmt ? (Math.random() * 2 - 1) * shakeAmt : 0;   // 打擊震動
  ctx.translate(-Math.round(cam.x * VIEW_SCALE) / VIEW_SCALE + shx, -Math.round(cam.y * VIEW_SCALE) / VIEW_SCALE + shy);
  ctx.imageSmoothingEnabled = false;   // 放大時保持像素銳利
  // 底色＝純黑：沒有鋪任何素材的格子就是黑的（跟地圖編輯器看到的一致）
  ctx.fillStyle = '#000'; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL);
  // 地面層（地板、地面裝飾）：永遠畫在角色下方
  drawMapGround(ctx);
  if (typeof drawBurrowingMouseGround === 'function') drawBurrowingMouseGround(ctx);
  if (typeof drawGraffitiGround === 'function') drawGraffitiGround(ctx);   // 地板上的塗鴉（js/graffiti.js）
  // 不可穿透格只負責碰撞；沒放美術素材時保持地圖原貌，與編輯器一致。
  // ---- 深度排序：會遮擋的地圖圖片（牆/物件）＋障礙物＋哨兵＋怪物＋玩家，一起依「底部Y」由上往下畫 ----
  //      底部Y 較小（畫面上方）的先畫、會被後畫的蓋住 → 走到牆後面就會被牆遮住。
  const sortables = [];
  // 角色泡在水裡：下半身半透明＋水面波紋（js/water.js 的 drawWaded；沒載入就照常畫）
  const wadeDraw = (a, kind, fn) => typeof drawWaded === 'function' ? drawWaded(a, kind, fn) : fn();
  collectMapOccluders(ctx, sortables);
  if (typeof graffitiSortables === 'function') graffitiSortables(sortables);
  if (typeof drawDoorLock === 'function') for (const d of mapDoors) if (!d.open && doorLocked(d)) sortables.push({ y: d.y + 1.5, draw: () => drawDoorLock(ctx, d) });   // 門上的鎖鏈、大鎖（js/doors.js）：緊接在門後面畫   // 畫在牆、物品上的塗鴉：緊接在那個東西之後畫
  for(const core of G.cores) if(!core.dead && enemyVisible(core)) sortables.push({y:core.y+23,draw:()=>drawCore(core)});
  for (const o of G.obstacles) if (!o.trap) sortables.push({ y: (o.r + (o.h || 1)) * CELL, draw: () => drawObstacle(o) });   // 地雷另外畫在地面層
  // 坐在椅子／躺在床上時，跟溫特一樣沿用椅子的排序值 +0.5（畫在椅子上面）
  for (const t of G.towers) sortables.push({ y: t.sitting ? seatDrawY(t.sitting) : t.y + 17, draw: () => wadeDraw(t, 'char', () => drawTower(t)) });
  for (const npc of G.npcs) { const bedY = npc.id === 'ball' && typeof ballSortY === 'function' ? ballSortY(npc) : null; sortables.push({ y: npc.sitting ? seatDrawY(npc.sitting) : bedY != null ? bedY : npc.y + 17, draw: () => wadeDraw(npc, 'char', () => { drawWanderer(npc); if (npc.carryItem && typeof drawDogCarry === 'function') drawDogCarry(ctx, npc); }) }); }   // carryItem：球球嘴裡叼著、要送去給溫特或嚮導的東西（js/ground-items.js、js/rescue-dog.js）   // 球球睡在床上：用床底排（js/ball-poses.js）
  for (const e of G.enemies) if (enemyVisible(e)) sortables.push({ y: e.y + 13, draw: () => wadeDraw(e, 'enemy', () => { if (e.dummy && typeof drawSandbag === 'function') { drawSandbag(ctx, e); return; } if (e.frenzy && typeof drawFrenzyAura === 'function') drawFrenzyAura(ctx, e); drawEnemy(e); }) });   // 狂暴的異質體腳下冒紅光
  if (typeof hangiCapSortables === 'function') hangiCapSortables(sortables);   // 順順宮帽：跟角色一起排前後（js/hangi-bao.js）
  if (typeof burrowingMouseSortables === 'function') burrowingMouseSortables(sortables);   // 獨立手洞依落點排序，不跟著本體漂移
  if (typeof lifePileSortables === 'function') lifePileSortables(sortables);   // 生命體碎掉的那堆（js/lifeform.js）   // 黑暗中的怪物看不到（堤諾感知到的另外畫在黑幕上）
  // 倒下的鳥頭人、珍珠小童的屍體：跟活著時一樣用腳底位置排前後，才不會被前面的牆蓋住
  for (const c of G.fxCorpses || []) if ((c.fall || c.drop) && isLit(c.x, c.y)) sortables.push({ y: c.y + 13, draw: () => drawCorpseSorted(c) });
  // 坐著時沿用椅子的排序值再 +0.5 → 畫在椅子上面（坐進椅子裡而不是被椅背蓋住）
  if (typeof drawGroundItem === 'function') for (const g of G.groundItems || []) sortables.push({ y: g.y + GROUND_ITEMS.sortDy, draw: () => drawGroundItem(ctx, g) });   // 溫特從背包放在地上的東西（js/ground-items.js）
  if (G.player) sortables.push({ y: G.player.sitting ? seatDrawY(G.player.sitting) : G.player.y + 16, draw: () => wadeDraw(G.player, 'char', () => drawPlayer(G.player)) });
  // 地上腐蝕焦痕（畫在單位腳下：焦黑燒痕，還在扣血時透出紫色餘燼）
  drawScorchMarks(ctx);
  drawFlares(ctx);             // 地上燃燒的照明彈
  drawLandmines(ctx);          // 地雷（js/landmine.js）
  if (typeof drawFishEggs === 'function') drawFishEggs(ctx);   // 比基尼小丑魚的魚卵（js/clownfish.js）
  if (typeof drawBananaPeels === 'function') drawBananaPeels(ctx);   // 金蕉王拋出的香蕉皮（js/golden-banana-king.js）
  drawOreShards(ctx);          // 炸開礦物後掉在地上的異質碎片（js/ore.js）
  drawOilGround(ctx);          // 油汙、火海底下的橘光（js/oil-barrels.js）
  if (typeof drawFishWater === 'function') drawFishWater(ctx);
  if (typeof drawLoofahGround === 'function') drawLoofahGround(ctx);   // 絲瓜藤鑽地的裂痕（js/loofah-lady.js）   // 魚頭君留下的水漬、積水（js/fish-head.js）
  drawCombatFeelGround(ctx);   // 黏液痕跡、自爆範圍警示
  sortables.sort((a, b) => a.y - b.y);
  for (const it of sortables) it.draw();
  if (typeof drawDoorLocks === 'function') drawDoorLocks(ctx);   // 解開時掉下來的鎖鏈（js/doors.js）
  drawCoreShards(ctx);         // 異質核心碎片
  drawFlareShots(ctx);         // 飛行中的照明彈
  if (typeof drawSpecialShots === 'function') drawSpecialShots(ctx);   // 飛行中的燃燒彈、麻醉針（js/special-guns.js）
  drawPearls(ctx);             // 珍珠小童噴出的珍珠、蓄力閃光
  if (typeof drawCapShots === 'function') drawCapShots(ctx);   // 夯吉寶丟出的迴力鏢帽子（js/hangi-bao.js）
  if (typeof drawFishSprays === 'function') drawFishSprays(ctx);
  if (typeof drawLoofahVines === 'function') drawLoofahVines(ctx);   // 冒出地面、纏住人的絲瓜藤（js/loofah-lady.js）   // 魚頭君噴出的水柱（js/fish-head.js）
  drawCombatFeelTop(ctx);      // 被打飛的屍體、飛濺黏液
  drawBerserkFxWorld(ctx);     // 哨兵身上的黑紫霧、腳下心跳光圈、暴走台詞

  // 上層（樹冠、屋簷等，永遠蓋在最上面）
  drawMapTop(ctx);
  // 電梯是獨立物件：牆之後繪製；深度線前方的所有人物都要顯示在門框前。
  drawElevators(ctx);
  for (const stamp of MAP.stamps || []) {
    if (!isElevatorStamp(stamp)) continue;
    const left = OX + stamp.c * CELL + (stamp.ox || 0), top = OY + stamp.r * CELL + (stamp.oy || 0);
    const cfg = elevatorConfig(stamp.id), phase = stamp === openElevatorStamp ? 'open' : 'closed';
    const depth = cfg?.[phase]?.depth ?? (phase === 'open' ? 35 : 120);
    const inFront = actor => actor.x >= left && actor.x <= left + 3 * CELL &&
      actor.y + 16 >= top + depth && actor.y <= top + 4 * CELL;
    for (const tower of G.towers) if (inFront(tower)) drawTower(tower);
    for (const npc of G.npcs) if (inFront(npc)) drawWanderer(npc);
    if (G.player && inFront(G.player)) drawPlayer(G.player);
  }
  // 互動提示（靠近且還沒坐下時）：出入口優先，其次 NPC，最後椅子
  towerPrompts = [];   // 這一幀重新記錄隊員頭上的選項
  if (G.player && !G.player.sitting && !G.over && !dialogueState && !elevatorMenuOpen) {
    const elevator = G.running ? elevatorNearPlayer() : null;
    const near = G.running ? portalNearPlayer() : null;
    // 隊員需要治療／疏導：頭上出現「F 急救」「C 疏導」（跟空白鍵分開，所以下面空白鍵的提示照樣畫）
    // 空白鍵的優先順序：① 拾取（異質碎片、地上的道具）→ ② 地圖物件（跟 js/game.js 的空白鍵一致）
    const mate = G.running && typeof teammateActionTarget === 'function' ? teammateActionTarget() : null;
    const pickShard = typeof shardNearPlayer === 'function' ? shardNearPlayer() : null;
    const pickProp = !pickShard && typeof pickupPropNearPlayer === 'function' ? pickupPropNearPlayer() : null;
    if (mate) drawTowerPrompts(mate, mate.y - 57);   // 隊員：急救／疏導（位置固定，泡泡會排到上面）
    if (pickShard) drawInteractPrompt(pickShard.x, pickShard.y - 26, '拾取');   // 地上的異質碎片（js/ore.js）
    else if (pickProp) drawInteractPrompt(pickProp.x, pickProp.top - 6, storagePropPrompt(pickProp));   // 地上的道具（js/storage-lockers.js）
    else if (elevator) drawInteractPrompt(elevator.x, elevator.top, elevator.mode === 'opening' ? '開門中…' : elevator.mode === 'inside' ? '選擇樓層' : '電梯');
    else if (near && !isStairPortal(near.portal)) drawInteractPrompt(near.x, near.y - CELL / 2, '進入 ' + portalTargetName(near.portal));
    else if (typeof shardNearPlayer === 'function' && shardNearPlayer()) { const s = shardNearPlayer(); drawInteractPrompt(s.x, s.y - 26, '拾取'); }   // 地上的異質碎片（js/ore.js）
    else if (storagePropNearPlayer()) { const prop=storagePropNearPlayer(); drawInteractPrompt(prop.x,prop.top-6,storagePropPrompt(prop)); }
    else if (campInteractionNearPlayer()) { const c = campInteractionNearPlayer(); drawInteractPrompt(c.x, c.top - 6, c.kind === 'retreat' ? '更動作戰計畫' : c.kind === 'supply' ? '物資箱' : '補充彈藥'); }
    else if (ammoCrateNearPlayer()) { const c = ammoCrateNearPlayer(); drawInteractPrompt(c.x, c.top - 6, '打開彈藥箱'); }
    else if (ironGateNearPlayer()) { const gate=ironGateNearPlayer();drawInteractPrompt(gate.x,gate.top-6,gate.o.gateSide===gate.side?'關閉鐵門':'開啟'+(gate.side==='left'?'左':'右')+'側鐵門'); }
    else if (typeof npcChatNearPlayer === 'function' && npcChatNearPlayer()) { const m = npcChatNearPlayer(); drawInteractPrompt(m.x, m.top, '聽閒聊'); }   // 有人在閒聊（js/npc-chats.js）
    else if (typeof wardrobeNearPlayer === 'function' && !doorNearPlayer() && wardrobeNearPlayer()) { const w = wardrobeNearPlayer(); drawInteractPrompt(w.x, w.top - 4, '換裝'); }   // 衣櫃（js/costumes.js）
    else if (typeof gachaNearPlayer === 'function' && !doorNearPlayer() && gachaNearPlayer()) { const g = gachaNearPlayer(); drawInteractPrompt(g.x, g.top - 4, '扭蛋'); }   // 扭蛋機（js/gacha.js）
    else if (typeof bestiaryNearPlayer === 'function' && !doorNearPlayer() && bestiaryNearPlayer()) { const b = bestiaryNearPlayer(); drawInteractPrompt(b.x, b.top - 4, '怪物圖鑑'); }   // 2F應變中心的電腦（js/bestiary.js）
    else if (typeof armorChestNearPlayer === 'function' && !doorNearPlayer() && armorChestNearPlayer()) { const c = armorChestNearPlayer(); drawInteractPrompt(c.x, c.top - 4, '整理防具'); }   // 裝備箱（js/backpack.js）
    else if (typeof targetTableNearPlayer === 'function' && !doorNearPlayer() && targetTableNearPlayer()) { const t = targetTableNearPlayer(); drawInteractPrompt(t.x, t.top - 4, '練習射擊'); }   // 射擊訓練室的桌子（js/target-practice.js）
    else if (typeof posterNearPlayer === 'function' && !doorNearPlayer() && posterNearPlayer()) { const s = posterNearPlayer(); drawInteractPrompt(s.x, s.top - 4, '查看' + s.cfg.title); }   // 海報（js/posters.js）
    else if (typeof lockedDoorNearPlayer === 'function' && !doorNearPlayer() && lockedDoorNearPlayer()) { const d = lockedDoorNearPlayer(); drawInteractPrompt(d.x, d.top - 4, '開門'); }   // 鎖住的房門（js/locked-doors.js）
    else if (typeof mrtLockNearPlayer === 'function' && mrtLockNearPlayer()) { const l = mrtLockNearPlayer(); drawInteractPrompt(l.x, l.top - 4, mrtLockPrompt(l)); }   // 捷運閘門、封鎖的入口（js/mrt-locks.js）
    else if (typeof practiceDoorNear === 'function' && practiceDoorNear()) { const d = practiceDoorNear(); drawInteractPrompt(d.x, d.top - 6, practiceDoorPrompt()); }   // 訓練室的門（js/practice.js）
    else if (doorNearPlayer()) { const d = doorNearPlayer(); drawInteractPrompt(d.x, d.top - 6, typeof doorPrompt === 'function' ? doorPrompt(d) : d.open ? '關門' : '開門'); }
    else if (typeof missionTableUsable === 'function' && missionTableUsable()) { const t = missionTableUsable(); drawInteractPrompt(t.x, t.top, t.label || '作戰桌'); }   // 作戰桌／作戰螢幕（js/missions.js）
    else if (typeof vendingNearPlayer === 'function' && vendingNearPlayer()) { const v = vendingNearPlayer(); drawInteractPrompt(v.x, v.top, '販賣機'); }   // 販賣機（js/shop.js）
    else if (typeof drinkShopNearPlayer === 'function' && drinkShopNearPlayer()) { const s = drinkShopNearPlayer(); drawInteractPrompt(s.x, s.top, '飲料店'); }   // 飲料店（js/shop.js）
    else if (typeof backroomShopNearPlayer === 'function' && backroomShopNearPlayer()) { const s = backroomShopNearPlayer(); drawInteractPrompt(s.x, s.top, '後室商店'); }   // 後室商店（js/shop.js）
    else if (typeof shopCounterNearPlayer === 'function' && shopCounterNearPlayer()) { const v = shopCounterNearPlayer(); drawInteractPrompt(v.x, v.top, MAP_SAFE ? '商店' : '後室商店'); }   // HOME Mart 結帳櫃台
    else {
      const actor = interactionNearPlayer(), profile = actor && dialogueProfile(actor);
      const downed = typeof downedTeammateNear === 'function' ? downedTeammateNear() : null;   // 旁邊有倒下的隊員：頭上出現「F 急救」
      if (downed) { if (!mate) drawTowerPrompts(downed, downed.y - 57); }   // 上面已經畫過隊員的選項就不重複畫
      else if (actor && actor.kind === 'tower' && !MAP_SAFE) { if (!mate) drawTowerPrompts(actor, actor.y - 57); }   // 隊員：急救／疏導（位置固定，泡泡會排到上面）
      else if (actor && canTalk(actor)) drawInteractPrompt(actor.x, promptTopAbove(actor, actor.y - 57 + (actor.kind === 'tower' ? 0 : NPC_LABEL_DY[actor.id] || 0)),   // 沒有台詞的人不顯示
        '與 ' + (profile ? profile.name : '角色') + ' 對話');
      else if (typeof graffitiNearPlayer === 'function' && graffitiNearPlayer()) { const g = graffitiNearPlayer(); drawInteractPrompt(g.x, g.y - 14, graffitiErasing() ? '擦掉中…' : '擦掉塗鴉'); }   // js/graffiti.js
      else { const seat = seatNearPlayer(); if (seat) drawSitPrompt(seat); }
    }
  }
  // 特效
  drawWorldEffects();
  // 建築放置預覽（40% 半透明，放不下時紅框）
  if (hoverCell && G.running && G.selType && G.selType.startsWith('build:')) {
    const ob = buildableById(G.selType.slice(6));   // 去掉 'build:' 前綴，跨障礙物/裝飾查找
    if (ob) {
      const v = ob[buildOrient], [c, r] = hoverCell;
      const x = OX + c * CELL, y = OY + r * CELL, w = v.w * CELL, h = v.h * CELL;
      const ok = canPlaceObstacle(v, c, r, placeExtra(ob)) && G.money >= ob.cost && buildInRange(v, c, r);
      const img = obstacleImgs[ob.id][buildOrient];
      ctx.globalAlpha = 0.4;
      if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
      else { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ok ? '#8fd3ff' : '#ff5b5b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.setLineDash([]);
      ctx.fillStyle = ok ? 'rgba(80,210,150,.28)' : 'rgba(255,80,80,.3)';
      for (const [dc, dr] of placeCheckCells(v)) ctx.fillRect(x + dc * CELL, y + dr * CELL, CELL, CELL);
    }
  }
  // 情境選單或指定建築的目標格
  const actionCell = buildTargetCell || (groundTarget && !groundMenu.classList.contains('hidden') ? [groundTarget.c, groundTarget.r] : null);
  if (typeof drawHiddenAreas === 'function') drawHiddenAreas(ctx);   // 還沒炸開的隱藏區：當成地圖外的空白區塗黑（js/breakable-walls.js）
  drawDarkness();  // 蓋上黑幕、在光源處挖洞（同樣畫在世界座標上）
  if (typeof drawMapGlow === 'function') drawMapGlow(ctx);   // 設成「發光」的地圖物件：畫在黑幕上面，暗處也亮（js/maploader.js）
  for (const f of G.effects) if (f.hammerHit) drawHammerHit(ctx, f);   // 拆除建築的槌子＋白光：畫在黑幕上面，暗處也看得清楚（js/attack-fx.js）
  drawPoweredLights(ctx);
  drawFlickerLights(ctx);   // 日光燈的光暈、電弧（畫在黑幕上面）
  drawEquipmentGroundDrops(ctx);
  drawWorldPickupSparkles(ctx); // 拾取物：黑暗中仍可看到的小亮點
  drawFlareGlow(ctx);       // 照明彈的紅橘色光暈
  drawChargerEyeFlashes(ctx);   // 鳥頭人鎖定玩家時眼睛閃藍光（暗處也看得到）
  drawChargerDizzyStars(ctx);   // 鳥頭人暈眩時頭上的星星（暗處也看得到）
  if (typeof drawCoreKeyDrops === 'function') drawCoreKeyDrops(ctx);   // 核心掉出的異質鑰匙：畫在黑幕上面（js/core-clear.js）
  if (typeof drawEliteTelegraphs === 'function') drawEliteTelegraphs(ctx);   // 菁英鳥頭人的衝撞路線：畫在黑幕上面，暗處也閃得開（js/elite-bird-head.js）
  if (typeof drawMilkfishEyeFlashes === 'function') drawMilkfishEyeFlashes(ctx);
  if (typeof drawFrenzyTint === 'function') drawFrenzyTint(ctx);   // 核心醒著：燈光變紅（js/core-frenzy.js）
  drawDemolishPreview();        // 拆除模式：滑鼠指著的建築框起來，顯示拆掉會退多少錢
  drawStairArrows();            // 逃生樓梯：右邊上樓、左邊下樓的浮動箭頭
  if (typeof drawGraffitiPreview === 'function') { drawGraffitiPreview(ctx); drawGraffitiErase(ctx); }   // 塗鴉：要畫在哪的預覽、擦掉的進度
  drawBuildRange();             // 放建築時能蓋的範圍（溫特 BUILD_RANGE 格內）
  if (typeof drawGuideSupplyBubbles === 'function') drawGuideSupplyBubbles(ctx);   // 嚮導缺急救包／杏仁水：頭上的思考泡泡（js/camp-supply.js）
  // ---- 角色頭上的東西：畫在建築、屋簷、黑幕之上（最上層），不會被擋住 ----
  if (typeof drawRequestBubbles === 'function') drawRequestBubbles(ctx);   // 基地：角色頭上的「今日想吃」泡泡（js/gifts.js）
  if (typeof drawMissionMarks === 'function') drawMissionMarks(ctx);       // 通訊員頭上的「！」、作戰桌記號（js/missions.js）
  flushTowerBubbles();   // 所有角色的對話泡泡（隊員頭上有「急救／疏導」選項時排到選項上面）
  if (typeof drawNpcChatMarks === 'function') drawNpcChatMarks(ctx);   // 有人在閒聊、等溫特來聽：中間的「● ● ●」（js/npc-chats.js）
  drawTextEffects();            // 「這裡不能放置建築」之類的提示字：畫在黑幕上面
  if (typeof drawHangiCapGlints === 'function') drawHangiCapGlints(ctx);   // 黑暗中順順宮帽的閃光（js/hangi-bao.js）
  if (typeof drawSmilers === 'function') drawSmilers(ctx);
  if (typeof drawDetector === 'function') drawDetector(ctx);   // 異質探測器：黑暗中的礦物、核心微微發光（js/equipment.js）   // Smiler 的眼睛和笑臉（黑暗中才看得到，js/smiler.js）
  drawSensedEnemies();   // 堤諾的「感知」：黑暗中的怪物只對玩家顯示輪廓（畫在黑幕之上）
  if (typeof drawChannelBar === 'function') drawChannelBar(ctx);   // 疏導、急救、包紮的進度條（js/channel-actions.js）
  if (typeof drawLoofahHelpHints === 'function') drawLoofahHelpHints(ctx);   // 射隊友身上的絲瓜藤時旁邊的「幫隊友掙脫」（js/loofah-lady.js）
  if (typeof drawBedZzz === 'function') drawBedZzz(ctx);   // 躺床睡覺的頭上飄 ZZZ（js/bed-zzz.js）
  if (typeof drawSleepMarks === 'function') drawSleepMarks(ctx);   // 被麻醉彈打睡的頭上飄 Zzz（js/special-guns.js）
  if (typeof drawPaintMarks === 'function') drawPaintMarks(ctx);   // 漆彈標記的怪物：螢光漆、準心（黑暗中也看得到）
  if (typeof drawRadioMarks === 'function') drawRadioMarks(ctx);   // 無線電 Lv3：標記溫特附近黑暗中的怪物（js/equipment.js）
  drawHitMarker();       // 溫特開槍打中時，準星（游標）旁閃一下 ✕
  // 選好建築並移到地圖上時，在預覽圖上方提示快捷鍵：［R］旋轉、［ESC］取消（取消後就切回槍）。
  if (hoverCell && G.running && G.selType && G.selType.startsWith('build:')) {
    const ob = buildableById(G.selType.slice(6));
    if (ob) {
      const v = ob[buildOrient], [c, r] = hoverCell;
      const lines = ['［R］旋轉', '［ESC］取消'];
      const LINE_GAP = 4, PAD_X = 7, PAD_Y = 5, RADIUS = 8;   // 兩行字的間距、深色框左右／上下留白、四個角的圓角（小一點，整體還是方塊）
      ctx.save();
      ctx.font = 'bold 10px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      // 用字「實際畫出來」的範圍來置中（全形括號左右有留白，直接用字寬置中會偏一邊）
      const ms = lines.map(t => ctx.measureText(t));
      const inkW = m => m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const ascent = Math.max(...ms.map(m => m.actualBoundingBoxAscent));    // 每行字頂到基線
      const descent = Math.max(...ms.map(m => m.actualBoundingBoxDescent));  // 基線到每行字底
      const lineH = ascent + descent;
      const textH = lines.length * lineH + (lines.length - 1) * LINE_GAP;
      const boxW = Math.max(...ms.map(inkW)) + PAD_X * 2;
      const boxH = textH + PAD_Y * 2;
      const labelX = OX + (c + v.w / 2) * CELL;
      const boxTop = Math.max(OY + 4, OY + r * CELL - 6 - boxH);
      ctx.fillStyle = 'rgba(10, 16, 23, .88)';
      ctx.beginPath();
      ctx.roundRect(labelX - boxW / 2, boxTop, boxW, boxH, RADIUS);
      ctx.fill();
      ctx.fillStyle = '#f1f7fc';
      ms.forEach((m, i) => {
        const x = labelX - inkW(m) / 2 + m.actualBoundingBoxLeft;              // 左右置中
        const y = boxTop + PAD_Y + i * (lineH + LINE_GAP) + ascent;            // 上下置中
        ctx.fillText(lines[i], x, y);
      });
      ctx.restore();
    }
  }
  // 目標框畫在黑幕上方，黑暗區域也能清楚看到所選格子。
  if (actionCell) {
    const [ac, ar] = actionCell, ax = OX + ac * CELL, ay = OY + ar * CELL;
    ctx.fillStyle = 'rgba(143,211,255,.13)'; ctx.fillRect(ax + 1, ay + 1, CELL - 2, CELL - 2);
    ctx.strokeStyle = '#9fddff'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.strokeRect(ax + 2, ay + 2, CELL - 4, CELL - 4); ctx.setLineDash([]);
  }
  ctx.restore();   // 世界座標畫完，回到螢幕座標（下面的提示固定在畫面上）
  // 指派巡邏位置中：畫面上方顯示提示
  if (assigning) {
    ctx.fillStyle = 'rgba(20,25,35,.75)'; ctx.fillRect(0, 0, cv.width, 44);
    ctx.fillStyle = '#ffd479'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🎯 點擊地圖，指定「' + TYPES[assigning.type].name + '」的巡邏位置（Esc 取消）', cv.width / 2, 29);
  }
  // 玩家受擊：畫面四周紅暈快速閃現後淡出（同《苦艾與甘露》的受擊回饋）。
  if ((G.damageVignetteT || 0) > 0) {
    const elapsed = 1 - G.damageVignetteT / .45;
    const strength = elapsed < .25 ? elapsed / .25 : Math.max(0, 1 - (elapsed - .25) / .75);
    const radius = Math.max(cv.width, cv.height) * .72;
    const vignette = ctx.createRadialGradient(cv.width / 2, cv.height / 2, radius * .35, cv.width / 2, cv.height / 2, radius);
    vignette.addColorStop(0, 'rgba(170,0,0,0)');
    vignette.addColorStop(.62, `rgba(190,0,0,${.08 * strength})`);
    vignette.addColorStop(1, `rgba(210,0,0,${.72 * strength})`);
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, cv.width, cv.height);
  }
  const lowEdge = lowHpPulse();   // 低血量：畫面四周跟著心跳閃紅光
  if (lowEdge > .01) {
    // 橢圓形的紅暈：畫面比較寬，用圓形的話上下邊幾乎沒有紅光 → 把圓壓扁成橢圓，上下也看得到（topBottom 越小，上下越紅）
    const radius = cv.width * .59, a = LOW_HP_FX.edge * lowEdge, squash = cv.height / cv.width * LOW_HP_FX.topBottom;
    ctx.save(); ctx.translate(cv.width / 2, cv.height / 2); ctx.scale(1, squash);
    const v = ctx.createRadialGradient(0, 0, radius * .5, 0, 0, radius);
    v.addColorStop(0, 'rgba(170,0,0,0)'); v.addColorStop(.45, `rgba(195,0,0,${(.35 * a).toFixed(3)})`); v.addColorStop(1, `rgba(215,0,0,${a.toFixed(3)})`);
    ctx.fillStyle = v; ctx.fillRect(-cv.width / 2, -cv.height / 2 / squash, cv.width, cv.height / squash);
    ctx.restore();
  }
  if (typeof drawNpcChatOffscreen === 'function') drawNpcChatOffscreen(ctx, cv);   // 閒聊的人在畫面外：邊緣的方向箭頭（js/npc-chats.js）
  drawBerserkFxScreen(ctx, cv);   // 哨兵汙染偏高：畫面四周紫色暗角；暴走瞬間閃暗紅
  if (typeof drawSmilerScreenFlash === 'function') drawSmilerScreenFlash(ctx, cv);   // 被 Smiler 咬：畫面邊框閃紅（js/smiler.js）
  drawBaseHpTopBar(ctx, cv);   // 戰鬥區域：畫面最上方的基地血條
  if (typeof drawCoreBossUI === 'function') drawCoreBossUI(ctx, cv);   // 異質核心的 BOSS 血條、甦醒大橫幅（js/core-frenzy.js）
  drawFieldMemberLocator();
}
// 戰鬥區域：畫面最上方（離上緣 2px）的基地血條。規則跟基地身上的血條一樣（目前血量 / 總血量，依剩餘 HP 變色）
// 高度只有 18px，在異質核心的 BOSS 血條（標題約從 40px 開始）上面，不會擋到它
const BASE_TOP_BAR = { top: 2, h: 12, maxW: 520 };
function drawBaseHpTopBar(ctx, cv) {
  if (!G || MAP_SAFE || !G.obstacles) return;
  const o = G.obstacles.find(b => b.isBase); if (!o || !o.maxhp) return;
  const ratio = Math.max(0, Math.min(1, o.hp / o.maxhp)), B = BASE_TOP_BAR;
  const w = Math.min(B.maxW, cv.width * .45), x = (cv.width - w) / 2, y = B.top + 3;   // y＝血條本體（外框比它多 3px）
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.82)'; roundRect(x - 3, B.top, w + 6, B.h + 6, 4); ctx.fill();
  ctx.fillStyle = '#352d2d'; roundRect(x, y, w, B.h, 2); ctx.fill();
  ctx.fillStyle = ratio > 0.5 ? '#59d26f' : (ratio > 0.25 ? '#f0c54d' : '#ef5b5b');
  if (ratio > 0) { roundRect(x, y, w * ratio, B.h, 2); ctx.fill(); }
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const label = '基地 HP ' + Math.max(0, Math.ceil(o.hp)) + ' / ' + o.maxhp;
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(label, cv.width / 2, y + B.h / 2 + 1);
  ctx.fillStyle = '#fff'; ctx.fillText(label, cv.width / 2, y + B.h / 2 + 1);
  ctx.restore();
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// 世界座標上的特效（槍口火光、子彈、彈殼、斬擊…）；劇情播放器也會呼叫（js/story-scene.js）
function drawWorldEffects() {
  for (const f of G.effects) {
    if (f.spriteEffect) {
      const frames = attackEffectFrames[f.spriteEffect];
      const age = 1 - Math.max(0, f.life) / f.life0;
      const frame = frames[Math.min(frames.length - 1, Math.floor(age * frames.length))];
      const size = ATTACK_EFFECT_SIZE[f.spriteEffect] || 64;
      if (frame && frame.complete && frame.naturalWidth) {
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.angle || 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(frame, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    } else if (f.slash) {                                  // 近戰揮砍：月牙斬弧光（殘影拖尾＋外光暈＋白核＋銳利前緣）
      const p = Math.max(0, f.life / f.life0), prog = 1 - p;
      const R = (f.heavy ? 54 : 42) * (0.92 + prog * 0.22), band = f.heavy ? 13 : 10, span = f.heavy ? 2.2 : 1.9;
      const rot = (prog - 0.5) * 0.7, alpha = Math.min(1, p * 1.7);
      const pal = f.pal || SLASH_PALETTES.blue;
      const crescent = (ro, ri, s, e) => { ctx.beginPath(); ctx.arc(0, 0, ro, s, e); ctx.arc(0, 0, ri, e, s, true); ctx.closePath(); ctx.fill(); };
      ctx.save(); ctx.translate(f.x, f.y); ctx.globalCompositeOperation = 'lighter';
      ctx.save(); ctx.rotate(f.angle + rot - 0.4); ctx.globalAlpha = alpha * 0.28; ctx.fillStyle = pal.after;   // 殘影拖尾
      crescent(R * 0.97, R * 0.97 - band, -span / 2, span / 2); ctx.restore();
      ctx.rotate(f.angle + rot);
      ctx.globalAlpha = alpha * 0.6; ctx.fillStyle = pal.outer; ctx.shadowColor = pal.glow; ctx.shadowBlur = 20;   // 外光暈
      crescent(R, R - band, -span / 2, span / 2);
      ctx.shadowBlur = 0; ctx.globalAlpha = alpha; ctx.fillStyle = pal.core;                                       // 白核
      crescent(R - band * 0.08, R - band * 0.5, -span * 0.49, span * 0.49);
      ctx.globalAlpha = alpha; ctx.strokeStyle = pal.edge; ctx.lineWidth = 2;                                      // 銳利前緣亮線
      ctx.beginPath(); ctx.arc(0, 0, R - 1, -span * 0.5, span * 0.5); ctx.stroke();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.bolt) {                                   // 雷電本體：鋸齒閃電＋分岔，青藍外光＋白核，快速明滅
      const p = Math.max(0, f.life / f.life0), age = f.life0 - f.life;
      const flick = age < .04 ? 1 : (Math.sin(age * 90) > -0.3 ? 1 : 0.25);   // 明滅閃爍
      const a = Math.min(1, p * 1.6) * flick;
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
      const stroke = (pts, wGlow, wCore) => {
        const trace = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); };
        ctx.globalAlpha = a * 0.5; ctx.strokeStyle = '#3ad6ff'; ctx.lineWidth = wGlow; ctx.shadowColor = '#3ad6ff'; ctx.shadowBlur = 14; trace();
        ctx.shadowBlur = 0; ctx.globalAlpha = a; ctx.strokeStyle = '#eafcff'; ctx.lineWidth = wCore; trace();
      };
      const lw = f.lw || 1;
      stroke(f.main, 5 * lw, 1.8 * lw);
      for (const br of f.branches) stroke(br, 3 * lw, 1.1 * lw);
      ctx.globalAlpha = a; ctx.fillStyle = '#eafcff';                          // 命中處白熱點
      ctx.beginPath(); ctx.arc(f.x, f.y, (4 + (1 - p) * 3) * lw, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.flame) {                                  // 火焰本體：一叢扭動竄升的火舌（三層色＋加色疊加）
      const t = 1 - Math.max(0, f.life) / f.life0, age = f.life0 - f.life;
      const rise = t < .25 ? t / .25 : 1;                  // 快速長出
      const shrink = t < .6 ? 1 : Math.max(.2, 1 - (t - .6) / .4 * .85);   // 後段收縮
      const gscale = (0.55 + rise * 0.45) * shrink;
      const alpha = t < .68 ? 1 : Math.max(0, 1 - (t - .68) / .32);
      const baseY = f.y - t * 12;                           // 整體略往上飄
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
      for (const tg of f.tongues) {
        const cx = f.x + tg.dx;
        const flick = Math.sin(age * tg.freq + tg.phase);
        const flick2 = Math.sin(age * tg.freq * 0.6 + tg.phase * 1.7);
        const h = tg.h * gscale * (0.85 + 0.15 * flick);
        const w = tg.w * gscale * (0.9 + 0.12 * flick2);
        const sway = flick * w * 0.35 + tg.lean * gscale;
        drawFlameShape(ctx, cx, baseY, h,        w,        sway,        '#ff5a10');   // 外層 橙紅
        drawFlameShape(ctx, cx, baseY, h * 0.66, w * 0.58, sway * 0.8,  '#ffab1e');   // 中層 黃
        drawFlameShape(ctx, cx, baseY, h * 0.28, w * 0.24, sway * 0.6, '#ffcf66');   // 核心 暖黃（縮小、留在底部）
      }
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.smoke) {                                  // 黑霧：由小變大、先濃後淡，兩團錯開疊成蓬鬆煙團
      const prog = 1 - Math.max(0, f.life) / f.life0;
      const r = f.r0 + (f.r1 - f.r0) * (1 - Math.pow(1 - prog, 2));
      const alpha = (prog < .15 ? prog / .15 : Math.max(0, (1 - prog) / .85)) * .42;
      if (alpha > .01) {
        const c = Math.round(14 + f.shade * 16);
        for (const [ox, oy, k] of [[0, 0, 1], [r * .45, -r * .25, .72]]) {
          const g = ctx.createRadialGradient(f.x + ox, f.y + oy, 0, f.x + ox, f.y + oy, r * k);
          g.addColorStop(0, `rgba(${c},${c - 4},${c + 4},${alpha.toFixed(3)})`);
          g.addColorStop(.55, `rgba(${c + 8},${c + 4},${c + 12},${(alpha * .55).toFixed(3)})`);
          g.addColorStop(1, 'rgba(20,16,24,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x + ox, f.y + oy, r * k, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (f.cmist) {                                  // 腐蝕紫黑霧：多裂片組成的扭曲濃霧，緩慢churn（murky 不發光）
      const prog = 1 - Math.max(0, f.life) / f.life0, s = f.r0 + (f.rMax - f.r0) * prog;
      const alpha = (prog < .15 ? prog / .15 : prog > .6 ? Math.max(0, (1 - prog) / .4) : 1) * .62;
      if (alpha > 0.01) {
        const age = f.life0 - f.life, rot = f.spin * age;
        for (const lo of f.lobes) {
          const wob = Math.sin(age * 1.3 + lo.ph) * (lo.wob || 2.5);
          const lx = f.x + (lo.ox * Math.cos(rot) - lo.oy * Math.sin(rot)) + wob;
          const ly = f.y + (lo.ox * Math.sin(rot) + lo.oy * Math.cos(rot));
          const rr = lo.rr * s;
          ctx.save(); ctx.translate(lx, ly); ctx.rotate((lo.ang || 0) + rot); ctx.scale(lo.sx || 1, lo.sy || 1);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rr);
          g.addColorStop(0, `rgba(42,26,48,${alpha.toFixed(3)})`);
          g.addColorStop(0.55, `rgba(26,15,30,${(alpha * 0.72).toFixed(3)})`);
          g.addColorStop(1, 'rgba(10,4,14,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
    } else if (f.cdrop) {                                  // 腐蝕液滴：暗紫小圓
      const p = Math.max(0, f.life / f.life0);
      ctx.globalAlpha = Math.min(1, p * 1.5); ctx.fillStyle = f.col;
      ctx.beginPath(); ctx.arc(f.x, f.y, Math.max(.6, f.r * (0.6 + 0.4 * p)), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (f.bullet) {                                 // 子彈曳光：一顆亮點＋短尾，從槍口快速飛向目標
      const prog = 1 - Math.max(0, f.life) / f.life0;
      const cx = f.x1 + (f.x2 - f.x1) * prog, cy = f.y1 + (f.y2 - f.y1) * prog;
      const ang = Math.atan2(f.y2 - f.y1, f.x2 - f.x1), tx = cx - Math.cos(ang) * 8, ty = cy - Math.sin(ang) * 8;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      ctx.strokeStyle = f.color; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over';
    } else if (f.muzzle) {                                 // 槍口閃光：短暫的亮星＋前射小扇
      const p = Math.max(0, f.life / f.life0);
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.ang || 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = p;
      ctx.fillStyle = '#fff0c0';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, -3.5); ctx.lineTo(13, 0); ctx.lineTo(9, 3.5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.charge) {                                 // 大招蓄力：收束光圈＋漸亮核心（加色疊加）
      const prog = 1 - Math.max(0, f.life) / f.life0;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const rr = Math.max(3, 44 - 36 * prog);
      ctx.globalAlpha = 0.25 + 0.55 * prog; ctx.strokeStyle = f.color; ctx.lineWidth = 1.5 + 2.5 * prog;
      ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.2 + 0.6 * prog; ctx.fillStyle = f.color;
      ctx.beginPath(); ctx.arc(f.x, f.y, 3 + 15 * prog, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.sootheSigil) {                            // 疏導法陣：施術者腳下兩圈光環＋旋轉刻紋，展開後淡出
      const p = Math.max(0, f.life / f.life0), age = f.life0 - f.life;
      const open = Math.min(1, age / .25), a = Math.min(1, f.life / Math.min(.5, f.life0 * .45));   // 最後 0.5 秒淡出（法陣留比較久時，前面都維持全亮）
      const R = 30 * (.55 + .45 * open), [cr, cg, cb] = f.col, rgb = `rgb(${cr},${cg},${cb})`;
      ctx.save(); ctx.translate(f.follow.x, f.follow.y + 14); ctx.scale(1, .45);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.25);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${(.32 * a).toFixed(3)})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 1.25, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = rgb;
      ctx.globalAlpha = a * .9; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = a * .55; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, R * .66, 0, Math.PI * 2); ctx.stroke();
      ctx.rotate(f.spin + age * 2.2);                       // 外圈刻紋順時針轉
      ctx.globalAlpha = a * .85; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; ctx.moveTo(Math.cos(an) * R * .74, Math.sin(an) * R * .74); ctx.lineTo(Math.cos(an) * R * .93, Math.sin(an) * R * .93); }
      ctx.stroke();
      ctx.rotate(-age * 4.4);                               // 內圈三角逆時針轉
      ctx.globalAlpha = a * .6; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let i = 0; i <= 3; i++) { const an = i / 3 * Math.PI * 2 - Math.PI / 2; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(an) * R * .6, Math.sin(an) * R * .6); }
      ctx.stroke();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.sootheWave) {                             // 疏導光波：從施術者往外擴散到疏導範圍
      const p = Math.max(0, f.life / f.life0), q = 1 - p, rr = f.r * (1 - Math.pow(1 - q, 3));
      const [cr, cg, cb] = f.col;
      ctx.save(); ctx.translate(f.x, f.y + 8); ctx.scale(1, .55);
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
      ctx.globalAlpha = p * .28; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = p * .75; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.sootheGlow) {                             // 疏導柔和光環＋雙層擴張圈（加色疊加）
      const p = Math.max(0, f.life / f.life0), r = f.r0 + (f.r1 - f.r0) * (1 - p), a = Math.sin(p * Math.PI);
      const [cr, cg, cb] = f.col;
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${(0.7 * a).toFixed(3)})`);
      g.addColorStop(0.45, `rgba(${cr},${cg},${cb},${(0.32 * a).toFixed(3)})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
      ctx.globalAlpha = Math.min(1, a * (f.vivid ? 1.15 : 0.85)); ctx.lineWidth = f.vivid ? 3 : 2.6;   // 主圈（鮮豔版：更亮、更粗）
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = a * (f.vivid ? 0.65 : 0.4); ctx.lineWidth = f.vivid ? 2 : 1.6;   // 外層漣漪
      ctx.beginPath(); ctx.arc(f.x, f.y, r * 1.35, 0, Math.PI * 2); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.mote) {                                   // 疏導療癒光點：柔光＋白核，上飄淡出
      const p = Math.max(0, f.life / f.life0), age = f.life0 - f.life;
      const wob = Math.sin(age * 6 + f.seed) * (f.wob || 4) * 0.5, alpha = Math.sin(p * Math.PI);
      const [cr, cg, cb] = f.col;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
      if (f.vivid) {   // 鮮豔版（疏導期間飄的光點）：外圈同色光暈
        const R = Math.max(1, f.r * p * 2.6), hg = ctx.createRadialGradient(f.x + wob, f.y, 0, f.x + wob, f.y, R);
        hg.addColorStop(0, `rgba(${cr},${cg},${cb},1)`); hg.addColorStop(.45, `rgba(${cr},${cg},${cb},.55)`); hg.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(f.x + wob, f.y, R, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.beginPath(); ctx.arc(f.x + wob, f.y, Math.max(.6, f.r * p), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = alpha * (f.vivid ? .3 : 0.7); ctx.fillStyle = '#ffffff';   // 鮮豔版：白色亮芯淡一點、小一點，顏色才不會被沖白
      ctx.beginPath(); ctx.arc(f.x + wob, f.y, Math.max(.3, f.r * p * (f.vivid ? .25 : 0.42)), 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.fglow) {                                  // 火焰爆閃光暈（加色疊加）
      const p = Math.max(0, f.life / f.life0), r = f.r0 + (f.r1 - f.r0) * (1 - p);
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      const pal = f.green ? [[220, 255, 200], [90, 230, 110], [10, 90, 30]] : [[255, 240, 190], [255, 150, 40], [120, 20, 0]];   // green：金蕉王補血的綠色光暈（js/golden-banana-king.js）
      const fade = (f.grow ? Math.min(1, (1 - p) * 4) * p * 1.6 : p) * (f.strength ?? 1);   // grow：先亮起來再淡出（不是一出現就最亮）；strength：亮度倍率
      g.addColorStop(0, `rgba(${pal[0]},${(0.9 * fade).toFixed(3)})`);
      g.addColorStop(0.4, `rgba(${pal[1]},${(0.6 * fade).toFixed(3)})`);
      g.addColorStop(1, `rgba(${pal[2]},0)`);
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (f.ember) {                                  // 火焰粒子：白熱→黃→橙→暗紅，閃爍上竄
      const t = 1 - Math.max(0, f.life) / f.life0, age = f.life0 - f.life;
      let cr, cg, cb;
      if (f.spark) { cr = 255; cg = 240; cb = 180; }
      else if (t < .35) { const u = t / .35; cr = 255; cg = 250 - u * 40; cb = 200 - u * 150; }
      else if (t < .7)  { const u = (t - .35) / .35; cr = 255; cg = 210 - u * 100; cb = 50 - u * 40; }
      else { const u = (t - .7) / .3; cr = 255 - u * 90; cg = 110 - u * 80; cb = 10; }
      const wob = Math.sin(f.seed + age * 22) * (f.wob || 6) * (1 - t) * 0.5;
      const alpha = Math.min(1, f.life / (f.life0 * .5)), rad = Math.max(.4, f.r * (1 - t * .7));
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${cr | 0},${cg | 0},${cb | 0})`;
      ctx.beginPath(); ctx.arc(f.x + wob, f.y, rad, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.ring) {                                   // 命中衝擊環：快速擴張＋淡出
      const p = Math.max(0, f.life / f.life0), rr = f.r + (f.r2 - f.r) * (1 - p);
      ctx.globalAlpha = p * 0.9; ctx.strokeStyle = f.color; ctx.lineWidth = 1.5 + p * 2.5;
      ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    } else if (f.dmg) {                             // 彈出傷害數字：先放大一下再定住、上飄淡出
      const life0 = f.life0 || 0.7, age = life0 - f.life;
      const pop = f.crit   // 爆擊：從 1.9 倍砸下來再定住，前 0.1 秒抖動
        ? (age < 0.1 ? 1.9 - (age / 0.1) * 0.7 : 1.2 - Math.min(1, (age - 0.1) / 0.3) * 0.1)
        : (age < 0.09 ? 0.7 + (age / 0.09) * 0.5 : 1.2 - Math.min(1, (age - 0.09) / 0.28) * 0.2);
      const alpha = Math.min(1, f.life / 0.35), ty = f.y + (f.vy || -34) * Math.min(0.5, age);
      const jx = f.crit && age < 0.1 ? (Math.random() * 2 - 1) * 2 : 0;
      ctx.save(); ctx.translate(f.x + jx, ty); ctx.scale(pop, pop);
      ctx.font = f.crit ? 'italic 900 22px sans-serif' : f.small ? 'bold 12px sans-serif' : 'bold 17px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = alpha * (f.small ? .8 : 1); ctx.lineWidth = f.crit ? 5 : f.small ? 3 : 3.5; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineJoin = 'round';
      ctx.strokeText(f.text, 0, 0); ctx.fillStyle = f.color; ctx.fillText(f.text, 0, 0);
      if (f.crit) {   // 上方「爆擊」小標
        ctx.font = '900 10px sans-serif'; ctx.lineWidth = 3;
        ctx.strokeText('爆擊', 0, -16); ctx.fillStyle = '#fff3b0'; ctx.fillText('爆擊', 0, -16);
      }
      ctx.restore(); ctx.globalAlpha = 1;
    } else if (f.text) {
      // 提示文字改在黑幕之後才畫（drawTextEffects），才不會被黑暗蓋住
    } else if (f.heal) {
      const p = Math.max(0, f.life / f.life0), grow = 1 - p;
      ctx.globalAlpha = p; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(f.x, f.y, 8 + grow * 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#bfffe8';
      ctx.fillRect(f.x - 2, f.y - 10 - grow * 7, 4, 14);
      ctx.fillRect(f.x - 7, f.y - 5 - grow * 7, 14, 4);
      ctx.globalAlpha = 1;
    } else if (f.support) {
      const p = Math.max(0, f.life / f.life0);
      ctx.globalAlpha = p * .72; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    } else if (f.attack) {
      const p = Math.max(0, f.life / f.life0), grow = 1 - p;
      ctx.save(); ctx.globalAlpha = Math.min(1, p * 1.35);
      if (f.kind === 'lightning') {
        ctx.strokeStyle = '#fff4a8'; ctx.lineWidth = 3; ctx.shadowColor = '#ffe55e'; ctx.shadowBlur = 11;
        ctx.beginPath(); ctx.moveTo(f.x2 + 5, f.y2 - 92);
        for (let i = 1; i <= 6; i++) {
          const y = f.y2 - 92 + i * 15.5;
          const x = f.x2 + Math.sin(f.seed + i * 7.3) * (i === 6 ? 0 : 9);
          ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffe36e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(f.x2, f.y2, 12 + grow * 18, 0, Math.PI * 2); ctx.stroke();
      } else if (f.kind === 'melee') {
        const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
        const heavy = f.meleeType === 'luther';
        const radius = (heavy ? 34 : 25) * (0.72 + grow * 0.38);
        const start = -1.25 + grow * .45, end = 1.25 + grow * .45;
        ctx.translate(f.x2, f.y2 - 7); ctx.rotate(angle);
        ctx.shadowColor = '#2379ff'; ctx.shadowBlur = heavy ? 17 : 11;
        ctx.fillStyle = heavy ? '#348cff' : '#66b6ff';
        ctx.beginPath(); ctx.arc(0, 0, radius, start, end);
        ctx.quadraticCurveTo(radius * .36, 0, radius * Math.cos(start), radius * Math.sin(start));
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f4ffff';
        ctx.beginPath(); ctx.arc(0, 0, radius * .82, start + .13, end - .13);
        ctx.quadraticCurveTo(radius * .48, 0, radius * .82 * Math.cos(start + .13), radius * .82 * Math.sin(start + .13));
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#6dbbff'; ctx.lineWidth = heavy ? 2.5 : 1.7;
        ctx.beginPath(); ctx.arc(0, 0, radius + 2, start - .1, end + .1); ctx.stroke();
      } else {
        const dx = f.x2 - f.x1, dy = f.y2 - f.y1, d = Math.hypot(dx, dy) || 1;
        ctx.strokeStyle = f.kind === 'flame' ? '#ffd080' : (f.kind === 'corrosion' ? '#8db8ff' : f.color);
        ctx.lineWidth = f.kind === 'flame' ? 4 : 2.5; ctx.lineCap = 'round'; ctx.shadowColor = f.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2 - dx / d * 5, f.y2 - dy / d * 5); ctx.stroke();
        ctx.shadowBlur = 0; ctx.fillStyle = f.color;
        ctx.beginPath(); ctx.arc(f.x2, f.y2, 5 + grow * (f.kind === 'corrosion' ? 13 : 9), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    } else if (f.particle) {
      const p = Math.max(0, f.life / f.life0);
      ctx.globalAlpha = p; ctx.fillStyle = f.color;
      if (f.kind === 'lightning') {
        ctx.fillRect(f.x - f.r, f.y - .8, f.r * 2, 1.6);
        ctx.fillRect(f.x - .8, f.y - f.r, 1.6, f.r * 2);
      } else {
        ctx.beginPath(); ctx.arc(f.x, f.y, Math.max(.5, f.r * p), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (f.coreMote) {   // 異質核心的黑紫粒子
      drawCoreMote(ctx, f);
    } else if (f.shell) {   // 彈殼：小小的黃銅色長條，邊轉邊掉，落地後淡出
      ctx.save(); ctx.globalAlpha = Math.min(1, f.life / .4);
      ctx.translate(f.x, f.y - f.z); ctx.rotate(f.rot);
      ctx.fillStyle = '#c9952f'; ctx.fillRect(-3, -1.2, 6, 2.4);
      ctx.fillStyle = '#ffe9a3'; ctx.fillRect(-3, -1.2, 2.2, 1.2);
      ctx.restore();
    } else if (f.hammerHit) {   // 拆除建築：畫在黑幕上面（見 drawDarkness 後面），這裡跳過
    } else if (f.dust) {   // 塵埃：淡土色小圓點，隨時間變淡、略微放大
      const p = Math.max(0, f.life / f.life0);
      ctx.globalAlpha = 0.45 * p;
      ctx.fillStyle = '#cfc4ae';
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1.6 - 0.6 * p), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = Math.max(0, f.life / 0.12); ctx.strokeStyle = f.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
}
