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
    if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
    else { ctx.fillStyle = '#7a5a3a'; roundRect(x + 3, y + 3, w - 6, h - 6, 5); ctx.fill(); ctx.strokeStyle = '#5a4128'; ctx.lineWidth = 2; ctx.stroke(); }
  }
  if (hit) {   // 閃紅：半透明紅疊在圖上
    ctx.globalAlpha = 0.55 * hit; ctx.fillStyle = '#ff3030';
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
function drawTower(t) {
  const spec = TYPES[t.type];
  let set = sentrySprites[t.type];
  if (t.type === 'red' && t.shieldMode && !MAP_SAFE && !t.berserk && redShieldSprites.front) set = redShieldSprites;   // 舉盾造型
  const img = set && pickCharacterFrame(set, t);
  let visualTop = t.y - 17;
  if (img && img.complete && img.naturalWidth) {
    const size = PLAYER.drawSize;
    visualTop = t.y - size + 18;
    const shX = t.berserk ? (Math.random() * 2 - 1) * 1.5   // 暴走：微微發抖
      : (t.hitT > .12 ? (Math.random() * 2 - 1) * 2.5 : 0);    // 受擊：短暫抖一下
    if (t.berserk) {   // 暴走：腳下紅光
      ctx.fillStyle = 'rgba(255,60,60,0.45)';
      ctx.beginPath(); ctx.ellipse(t.x, t.y + 14, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    if (t.meleeSwing) {
      const s = t.meleeSwing;
      let lunge;   // -1 後仰蓄力 → +1 前傾撲擊
      if (s.age < s.wind) lunge = -Math.sin(s.age / s.wind * Math.PI / 2) * .65;
      else if (s.age < s.impact) { const u = (s.age - s.wind) / (s.impact - s.wind); lunge = -.65 + 1.65 * u * u; }
      else { const u = Math.min(1, (s.age - s.impact) / (s.duration - s.impact)); lunge = 1 * (1 - u * u); }
      const dx = Math.cos(s.angle), dy = Math.sin(s.angle);
      ctx.translate(t.x + dx * lunge * 6, t.y + dy * lunge * 4);
      ctx.rotate(dx * lunge * .16); ctx.translate(-t.x, -t.y);
    } else if (t.gunSwing) {   // 開槍後座：沿瞄準方向前傾→後踢→回正
      const off = gunSwingOffset(t.gunSwing), dx = Math.cos(t.gunSwing.angle), dy = Math.sin(t.gunSwing.angle);
      ctx.translate(dx * off * 4, dy * off * 4);
    }
    seatRotate(t, size);   // 躺在橫放的床上：跟溫特一樣旋轉
    ctx.drawImage(img, t.x - size / 2 + shX, t.y - size + 18, size, size);
    const redFlash = sentryRedFlash(t);   // 瀕臨暴走慢閃紅、暴走快閃紅
    const redSil = redFlash > 0.01 ? flashSprite(img, '#ff3b3b') : null;
    if (redSil) {
      ctx.globalAlpha = redFlash * 0.5;
      ctx.drawImage(redSil, t.x - size / 2 + shX, t.y - size + 18, size, size);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.imageSmoothingEnabled = true;
  } else {
    ctx.fillStyle = t.berserk ? '#5a1f27' : spec.color; roundRect(t.x - 17, t.y - 17, 34, 34, 6); ctx.fill();
  }

  drawFireAxe(t);
  // 頭頂資訊：名字在上，HP 條在下。
  // 安全區域沒有血條，名字往下 5px 貼近頭頂（跟 NPC 一致）；戰鬥區域維持原本的名字＋血條間距。
  const nameY = visualTop - (MAP_SAFE ? 6 : 11);
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(spec.name, t.x, nameY);
  const taintDanger = !MAP_SAFE && !t.berserk && !spec.guide && t.taint > 85 && t.hp > 0;
  ctx.fillStyle = t.berserk ? '#ff4d4d' : taintDanger ? '#ffb24d' : '#fff'; ctx.fillText(spec.name, t.x, nameY);   // 暴走紅字、瀕臨暴走橘字

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
  if (t.say && t.say.text && !t.berserk) drawSpeechBubble(t.x, nameY - (tagText ? 30 : 13), t.say.text, BUBBLE_COLORS[t.type]);   // 哨兵對話泡泡（有標籤時往上移）
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
  return G.enemies.filter(e => !e.dead && !isVisible(e.x, e.y)
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
function drawEnemy(e) {
  ctx.save();
  if (e.hitT > 0) ctx.translate((Math.random() * 2 - 1) * 2.5, (Math.random() * 2 - 1) * 1.5);
  const lift = e.slimeLift || 0, size = e.sizeMul || 1;
  // 受擊壓扁回彈：被打瞬間變扁變寬，0.16 秒內彈回
  const squash = (e.hitSquashT || 0) / .16, sqX = 1 + .22 * squash, sqY = 1 - .2 * squash;
  const slimeW = (e.drawWidth || 42) * (e.slimeScaleX || 1) * sqX, slimeH = (e.drawHeight || 33) * (e.slimeScaleY || 1) * sqY;
  const bottomY = e.y + 13 - lift;
  const shadowScale = Math.max(.55, 1 - lift / 22) * size;
  ctx.globalAlpha = .28 * Math.min(1, shadowScale); ctx.fillStyle = '#071015';
  ctx.beginPath(); ctx.ellipse(e.x, e.y + 13, 15 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2); ctx.fill();
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
  const baseSprite = monsterImage(e.sprite || 'images/monster/Monster_Slime.png');
  if (baseSprite.complete && baseSprite.naturalWidth) {
    const sprite = tintedSprite(baseSprite, e.tint);   // 變體換色
    ctx.imageSmoothingEnabled = false;
    const dx = Math.round(e.x - slimeW / 2), dy = Math.round(bottomY - slimeH), dw = Math.round(slimeW), dh = Math.round(slimeH);
    ctx.drawImage(sprite, dx, dy, dw, dh);
    // 受擊閃紅；自爆引信點燃時越閃越快
    const fuseP = e.fuseT > 0 ? 1 - e.fuseT / SLIME_BOMB.fuse : 0;
    const fuseFlash = fuseP > 0 ? (Math.sin(fuseP * fuseP * 60) > 0 ? .85 : .15) : 0;
    if (e.hitT > 0) drawHitFlash(sprite, Math.min(1, e.hitT / .16), e.hitColor, dx, dy, dw, dh);   // 先閃白，再轉屬性色
    const fuseSil = fuseFlash ? flashSprite(sprite, '#ff6a3d') : null;
    if (fuseSil) { ctx.globalAlpha = fuseFlash * .75; ctx.drawImage(fuseSil, dx, dy, dw, dh); ctx.globalAlpha = 1; }
    ctx.imageSmoothingEnabled = true;
  } else {
    ctx.fillStyle = '#48c7d5'; ctx.beginPath(); ctx.ellipse(e.x, bottomY - slimeH / 2, slimeW / 2.8, slimeH / 2.8, 0, 0, Math.PI * 2); ctx.fill();
  }
  // 血條放在圖的上方（體型大的變體血條也跟著變寬、變高）
  const barW = 32 * Math.max(1, size), barY = e.y + 13 - (e.drawHeight || 33) - 6;
  ctx.fillStyle = '#000'; ctx.fillRect(e.x - barW / 2, barY, barW, 3);
  ctx.fillStyle = e.variant === 'giant' ? '#c79bff' : '#7CFC7C'; ctx.fillRect(e.x - barW / 2, barY, barW * Math.max(0, e.hp) / e.maxhp, 3);
  if (e.variant === 'giant') {
    ctx.fillStyle = '#e3c8ff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(SLIME_VARIANTS.giant.name, e.x, barY - 4);
  }
  if (e.burnT > 0) { ctx.strokeStyle='#ff7b39';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,17,0,Math.PI*2);ctx.stroke(); }
  if (e.stunT > 0) { ctx.fillStyle='#ffe36e';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('顫抖',e.x,e.y-33); }
  if (e.confuseT > 0) { ctx.fillStyle='#d6a0ff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('混亂',e.x,e.y-33); }
  if (e.alertT > 0) {   // 剛被溫特的槍吸引過來：頭上彈出「！」
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
function drawWanderer(npc) {
  const set = wandererSprites[npc.id];
  const img = set && pickCharacterFrame(set, npc);
  const size = PLAYER.drawSize;
  if (img && img.complete && img.naturalWidth) {
    ctx.imageSmoothingEnabled = false;
    ctx.save(); seatRotate(npc, size);
    ctx.drawImage(img, npc.x - size / 2, npc.y - size + 18, size, size);
    ctx.restore();
    ctx.imageSmoothingEnabled = true;
  }
  // 頭頂名字（跟哨兵同樣式；NPC 沒有血條）
  const name = (WANDERERS.find(w => w.id === npc.id) || {}).name;
  if (!name) return;
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const nameY = npc.y - size + 12;   // 比圖片頂端再往下 5px
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(name, npc.x, nameY);
  ctx.fillStyle = '#fff'; ctx.fillText(name, npc.x, nameY);
  if (npc.say && npc.say.text) drawSpeechBubble(npc.x, nameY - 13, npc.say.text, BUBBLE_COLORS[npc.id]);   // 頭上對話泡泡（角色專屬色）
}
// 對話泡泡：參考《苦艾與甘露》——深色半透明底＋角色專屬色邊框/文字＋圓角＋向下小尾巴＋淡光暈
// 淺底色＋深色字，每個角色一種顏色（bg 淺底／bd 邊框＋尾巴／tx 深色文字）
const BUBBLE_COLORS = {
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
  const c = col || BUBBLE_DEFAULT, tail = 6, rad = 9;
  ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const tw = ctx.measureText(text).width, w = tw + 24, h = 26;
  const x = Math.round(cx - w / 2), y = Math.round(bottomY - tail - h);
  ctx.fillStyle = c.bg; roundRect(x, y, w, h, rad); ctx.fill();
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1.2; roundRect(x, y, w, h, rad); ctx.stroke();
  ctx.fillStyle = c.bd;                                       // 向下小三角尾巴（同邊框色）
  ctx.beginPath(); ctx.moveTo(cx - 5, y + h); ctx.lineTo(cx + 5, y + h); ctx.lineTo(cx, y + h + tail); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c.tx; ctx.fillText(text, cx, y + h - 8);    // 角色色文字
}
// 椅子上方的「[E] 坐」提示框
function drawInteractPrompt(cx, topY, label) {
  const keyLabel = 'Space';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 10px sans-serif'; const keyW = Math.max(18, ctx.measureText(keyLabel).width + 10);
  ctx.font = 'bold 13px sans-serif'; const gap = 6, pad = 9, textW = ctx.measureText(label).width;
  const boxW = pad * 2 + keyW + gap + textW, boxH = 24;
  const x = Math.round(cx - boxW / 2), y = Math.round(topY - boxH - 10);
  ctx.fillStyle = 'rgba(12,16,22,.9)'; roundRect(x, y, boxW, boxH, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(143,211,255,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#8fd3ff'; roundRect(x + pad, y + 5, keyW, 14, 3); ctx.fill();
  ctx.fillStyle = '#0e1116'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(keyLabel, x + pad + keyW / 2, y + 15.5);
  ctx.fillStyle = '#e6ebf2'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(label, x + pad + keyW + gap, y + 17);
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
function drawPlayer(p) {
  const img = pickCharacterFrame(playerSprites, p);
  const size = PLAYER.drawSize;
  if (img && img.complete && img.naturalWidth) {
    ctx.save();
    if (p.recoilT > 0) {   // 開槍後座力：往反方向頂一下再回正
      const k = (p.recoilT / 0.14) * 4;
      ctx.translate(-Math.cos(p.recoilAng || 0) * k, -Math.sin(p.recoilAng || 0) * k);
    }
    ctx.imageSmoothingEnabled = false;
    const hitK = p.hitT > 0 ? Math.min(1, p.hitT / .45) : 0;   // 受擊：先閃白，再轉紅淡出
    if (p.sitting?.rotation) {
      ctx.translate(p.x, p.y - size / 2 + 18);
      ctx.rotate(p.sitting.rotation * Math.PI / 180);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      drawHitFlash(img, hitK, '#ff4d4d', -size / 2, -size / 2, size, size);
    } else {
      ctx.drawImage(img, p.x - size / 2, p.y - size + 18, size, size);
      drawHitFlash(img, hitK, '#ff4d4d', p.x - size / 2, p.y - size + 18, size, size);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  } else {
    ctx.fillStyle = '#5ec8ff'; roundRect(p.x - 14, p.y - 16, 28, 32, 8); ctx.fill();
  }
  if (!MAP_SAFE) {
    const w = 46, h = 5, ratio = Math.max(0, p.hp / p.maxhp), x = p.x - w / 2, y = p.y - size + 13;
    ctx.fillStyle = 'rgba(8,12,18,.88)'; roundRect(x - 1, y - 1, w + 2, h + 2, 3); ctx.fill();
    if (ratio > 0) { ctx.fillStyle = ratio > .35 ? '#63d7aa' : '#ff6363'; roundRect(x, y, w * ratio, h, 2); ctx.fill(); }
  }
  drawPlayerReloadCountdown(p, size);
}

// ---- 繪製 ----
function draw() {
  lightsCache = LIGHT.enabled ? getLights() : [];   // 更新這一幀的光源
  computeLightField();                              // 光沿格子擴散、碰牆停（牆後全黑）
  computeFlashField();                              // 攻擊閃光（只影響畫面）
  ctx.clearRect(0, 0, cv.width, cv.height);
  // 之後畫的都是「世界座標」：先套畫面縮放，再平移鏡頭位置，畫面就會跟著玩家捲動
  ctx.save();
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
  // 不可穿透格只負責碰撞；沒放美術素材時保持地圖原貌，與編輯器一致。
  // ---- 深度排序：會遮擋的地圖圖片（牆/物件）＋障礙物＋哨兵＋怪物＋玩家，一起依「底部Y」由上往下畫 ----
  //      底部Y 較小（畫面上方）的先畫、會被後畫的蓋住 → 走到牆後面就會被牆遮住。
  const sortables = [];
  collectMapOccluders(ctx, sortables);
  for(const core of G.cores) if(!core.dead && isVisible(core.x,core.y)) sortables.push({y:core.y+23,draw:()=>drawCore(core)});
  for (const o of G.obstacles) sortables.push({ y: (o.r + (o.h || 1)) * CELL, draw: () => drawObstacle(o) });
  // 坐在椅子／躺在床上時，跟溫特一樣沿用椅子的排序值 +0.5（畫在椅子上面）
  for (const t of G.towers) sortables.push({ y: t.sitting ? seatDrawY(t.sitting) : t.y + 17, draw: () => drawTower(t) });
  for (const npc of G.npcs) sortables.push({ y: npc.sitting ? seatDrawY(npc.sitting) : npc.y + 17, draw: () => drawWanderer(npc) });
  for (const e of G.enemies) if (isVisible(e.x, e.y)) sortables.push({ y: e.y + 13, draw: () => drawEnemy(e) });   // 黑暗中的怪物看不到（堤諾感知到的另外畫在黑幕上）
  // 坐著時沿用椅子的排序值再 +0.5 → 畫在椅子上面（坐進椅子裡而不是被椅背蓋住）
  if (G.player) sortables.push({ y: G.player.sitting ? seatDrawY(G.player.sitting) : G.player.y + 16, draw: () => drawPlayer(G.player) });
  // 地上腐蝕焦痕（畫在單位腳下：焦黑燒痕，還在扣血時透出紫色餘燼）
  drawScorchMarks(ctx);
  drawCombatFeelGround(ctx);   // 黏液痕跡、自爆範圍警示
  sortables.sort((a, b) => a.y - b.y);
  for (const it of sortables) it.draw();
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
  if (G.player && !G.player.sitting && !G.over && !dialogueState && !elevatorMenuOpen) {
    const elevator = G.running ? elevatorNearPlayer() : null;
    const near = G.running ? portalNearPlayer() : null;
    if (elevator) drawInteractPrompt(elevator.x, elevator.top, elevator.mode === 'opening' ? '開門中…' : elevator.mode === 'inside' ? '選擇樓層' : '電梯');
    else if (near) drawInteractPrompt(near.x, near.y - CELL / 2, '進入 ' + portalTargetName(near.portal));
    else {
      const actor = interactionNearPlayer(), profile = actor && dialogueProfile(actor);
      if (actor) drawInteractPrompt(actor.x, actor.y - 57,
        actor.kind === 'tower' && !MAP_SAFE ? '疏導' : '與 ' + (profile ? profile.name : '角色') + ' 對話');
      else { const seat = seatNearPlayer(); if (seat) drawSitPrompt(seat); }
    }
  }
  // 特效
  for (const f of G.effects) {
    if (f.spriteEffect) {
      const frames = attackEffectFrames[f.spriteEffect];
      const age = 1 - Math.max(0, f.life) / f.life0;
      const frame = frames[Math.min(3, Math.floor(age * 4))];
      if (frame && frame.complete && frame.naturalWidth) {
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.angle || 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(frame, -32, -32, 64, 64);
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
      const open = Math.min(1, age / .25), a = Math.min(1, p * 2.2);
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
      ctx.globalAlpha = a * 0.85; ctx.lineWidth = 2.6;                         // 主圈
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = a * 0.4; ctx.lineWidth = 1.6;                          // 外層漣漪
      ctx.beginPath(); ctx.arc(f.x, f.y, r * 1.35, 0, Math.PI * 2); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.mote) {                                   // 疏導療癒光點：柔光＋白核，上飄淡出
      const p = Math.max(0, f.life / f.life0), age = f.life0 - f.life;
      const wob = Math.sin(age * 6 + f.seed) * (f.wob || 4) * 0.5, alpha = Math.sin(p * Math.PI);
      const [cr, cg, cb] = f.col;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.beginPath(); ctx.arc(f.x + wob, f.y, Math.max(.6, f.r * p), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = alpha * 0.7; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(f.x + wob, f.y, Math.max(.3, f.r * p * 0.42), 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.fglow) {                                  // 火焰爆閃光暈（加色疊加）
      const p = Math.max(0, f.life / f.life0), r = f.r0 + (f.r1 - f.r0) * (1 - p);
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, `rgba(255,240,190,${(0.9 * p).toFixed(3)})`);
      g.addColorStop(0.4, `rgba(255,150,40,${(0.6 * p).toFixed(3)})`);
      g.addColorStop(1, 'rgba(120,20,0,0)');
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
      const life0 = f.life0 || 0.8;
      const alpha = Math.min(1, f.life / 0.6);                 // 最後 0.6 秒才淡出，其餘維持清晰
      const ty = f.y + (f.vy || 0) * Math.min(0.8, life0 - f.life);   // 只在前段緩緩上飄
      ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      // 黑底標籤：讓提示字在任何背景上都看得清楚
      const tw = ctx.measureText(f.text).width;
      ctx.globalAlpha = alpha * 0.72; ctx.fillStyle = '#000';
      roundRect(f.x - tw / 2 - 8, ty - 15, tw + 16, 21, 6); ctx.fill();
      ctx.globalAlpha = alpha; ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, ty);
      ctx.globalAlpha = 1;
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
    } else if (f.shell) {   // 彈殼：小小的黃銅色長條，邊轉邊掉，落地後淡出
      ctx.save(); ctx.globalAlpha = Math.min(1, f.life / .4);
      ctx.translate(f.x, f.y - f.z); ctx.rotate(f.rot);
      ctx.fillStyle = '#c9952f'; ctx.fillRect(-3, -1.2, 6, 2.4);
      ctx.fillStyle = '#ffe9a3'; ctx.fillRect(-3, -1.2, 2.2, 1.2);
      ctx.restore();
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
  // 建築放置預覽（40% 半透明，放不下時紅框）
  if (hoverCell && G.running && G.selType && G.selType.startsWith('build:')) {
    const ob = buildableById(G.selType.slice(6));   // 去掉 'build:' 前綴，跨障礙物/裝飾查找
    if (ob) {
      const v = ob[buildOrient], [c, r] = hoverCell;
      const x = OX + c * CELL, y = OY + r * CELL, w = v.w * CELL, h = v.h * CELL;
      const ok = canPlaceObstacle(v, c, r, placeExtra(ob)) && G.money >= ob.cost;
      const img = obstacleImgs[ob.id][buildOrient];
      ctx.globalAlpha = 0.4;
      if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
      else { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ok ? '#8fd3ff' : '#ff5b5b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.setLineDash([]);
      ctx.fillStyle = ok ? 'rgba(80,210,150,.28)' : 'rgba(255,80,80,.3)';
      for (const [dc, dr] of variantSolidCells(v)) ctx.fillRect(x + dc * CELL, y + dr * CELL, CELL, CELL);
    }
  }
  // 情境選單或指定建築的目標格
  const actionCell = buildTargetCell || (groundTarget && !groundMenu.classList.contains('hidden') ? [groundTarget.c, groundTarget.r] : null);
  drawDarkness();  // 蓋上黑幕、在光源處挖洞（同樣畫在世界座標上）
  drawSensedEnemies();   // 堤諾的「感知」：黑暗中的怪物只對玩家顯示輪廓（畫在黑幕之上）
  drawHitMarker();       // 溫特開槍打中時，準星（游標）旁閃一下 ✕
  // 選好建築並移到地圖上時，在預覽圖上方提示旋轉快捷鍵。
  if (hoverCell && G.running && G.selType && G.selType.startsWith('build:')) {
    const ob = buildableById(G.selType.slice(6));
    if (ob) {
      const v = ob[buildOrient], [c, r] = hoverCell;
      const labelX = OX + (c + v.w / 2) * CELL;
      const labelBottom = Math.max(OY + 28, OY + r * CELL - 7);
      ctx.save();
      ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(10, 16, 23, .88)';
      ctx.fillRect(labelX - 43, labelBottom - 23, 86, 23);
      ctx.fillStyle = '#f1f7fc';
      ctx.fillText('［R］旋轉', labelX, labelBottom - 6);
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
  drawBerserkFxScreen(ctx, cv);   // 哨兵汙染偏高：畫面四周紫色暗角；暴走瞬間閃暗紅
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
