// ============================================================
//  暴走表演：瀕臨暴走 → 暴走瞬間 → 疏導成功
//  （數值與台詞集中在最上面，想調整改這裡就好）
// ============================================================

// warnAt：汙染值到多少開始冒黑霧；dangerAt：到多少說出警告台詞、開始心跳聲
// slowMo：暴走瞬間慢動作的「真實秒數」與速度倍率；pushRadius：暴走衝擊波把怪物推開的範圍（格）
const BERSERK_FX = { warnAt: 70, dangerAt: 85, slowMo: .7, slowMoScale: .3, pushRadius: 2.2,
                     heartbeatGap: .95, heartbeatRange: 4, heartbeatVolume: .55,   // 心跳：間隔秒數、玩家幾格內才聽得到、最大音量
                     murmurGap: [8, 12] };   // 瀕臨暴走一直沒人疏導時，每隔幾秒（隨機範圍）再說一句

// 瀕臨暴走時（汙染值越過 dangerAt，以及之後每隔一段時間）說的話
const TAINT_WARN_LINES = {
  red:     ['還撐得住……先顧其他人。', '沒事，這點程度我自己會退。', '嘖……腦袋有點沉。', '部隊長，別擔心，我很耐操的。', '疏導名額……留給更需要的人吧。'],
  theonie: ['……我還能打，別多管閒事。', '吵死了，腦子裡全是雜音……', '區區這點負荷……才不會影響我。', '……視線有點晃，只是錯覺。', '別用那種眼神看我，我很好。'],
  amber:   ['部隊長……我、我好像有點不舒服……', '對不起，我先退回去一下！', '規定說負荷太高要回報……我、我回報！', '手……手在發抖……', '我還可以的……應該吧……'],
  luther:  ['……頭好吵。', '……我先退開。', '……別過來。現在的我不太對。', '……還行。', '……讓我一個人待著。'],
  avaren:  ['……好吵。', '……別靠近我。', '……裡面的東西……在動。', '……艾德林在哪？', '……忍得住。'],
  default: ['……有點撐不住了。', '……頭好痛。'],
};
// 瀕臨暴走（還沒暴走）時被疏導下來說的話
const RELIEF_LINES = {
  red:     ['哈，舒服多了！謝啦，部隊長。', '又讓你費心了……下次我會注意。', '好，可以繼續上了！'],
  theonie: ['……還不錯，勉強算你及格。', '哼，我本來就沒事。……不過，謝了。', '腦袋清楚多了，繼續吧。'],
  amber:   ['謝謝部隊長！我感覺好多了！', '呼……得救了，我會更小心的！', '我、我可以回到崗位了嗎？'],
  luther:  ['……好多了。', '……謝了。', '……安靜下來了。'],
  avaren:  ['……嗯。', '……比較安靜了。', '……你的疏導，不討厭。'],
  default: ['……好多了，謝謝。'],
};
// 暴走那一刻說的話（失控邊緣的破碎台詞）
const BERSERK_LINES = {
  red:     ['……退後！全部離我遠一點！', '不行……控制不住……！'],
  theonie: ['吵死了——全部燒掉就好！', '火……停不下來……！'],
  amber:   ['對不起……身體不聽使喚……！', '請、請保持距離……！'],
  luther:  ['……走開！', '別靠近我……會傷到你們。'],
  avaren:  ['……不要看我。', '艾德林……別過來……'],
  default: ['……控制不住了……！'],
};
// 從暴走被疏導回來時說的話
const SOOTHED_LINES = {
  red:     ['……部隊長？謝了，又被你救了一次。', '抱歉，讓你擔心了。'],
  theonie: ['……哼，這次就算我欠你。', '……剛才的事，忘掉。'],
  amber:   ['對不起，給大家添麻煩了……謝謝部隊長！', '我、我沒事了！'],
  luther:  ['……抱歉。謝了。', '……沒傷到人吧？'],
  avaren:  ['……嗯。', '……沒讓他看到吧。'],
  default: ['……謝謝。'],
};
const BERSERK_BUBBLE = { bg: '#2a0d16', bd: '#ff4d6d', tx: '#ffd6dd' };   // 暴走台詞泡泡：暗紅底

// 隨機挑一句；有傳入哨兵時，避免連續兩次說同一句
function pickLine(table, type, t) {
  const lines = table[type] || table.default;
  let line = lines[Math.floor(Math.random() * lines.length)];
  if (t && lines.length > 1) {
    while (line === t.lastFxLine) line = lines[Math.floor(Math.random() * lines.length)];
    t.lastFxLine = line;
  }
  return line;
}
const recentlySoothed = t => performance.now() - (t.lastSootheAt || -1e9) < 1500;

// ---- 被暴走隊友打到（友軍受擊）：閃紅、往後震退、被打斷一下 ----
// knock／heavyKnock：擊退距離（近戰、雷電算重擊）；time：擊退滑行秒數；flash：閃紅秒數；stun：哨兵被打斷的秒數
// lineCd：同一個隊員被打後，至少隔幾秒才會再喊一次（避免每一下都講話）
const FRIENDLY_HIT = { knock: CELL * .6, heavyKnock: CELL * 1.1, time: .16, flash: .32, stun: .4, lineCd: 4 };
// 被暴走隊友打到時喊的話；{name} 會換成攻擊者的名字
const FRIENDLY_HIT_LINES = {
  red:     ['{name}，冷靜點！是我啊！', '部隊長！緊急申請疏導！', '我擋著，大家先退開！'],
  theonie: ['{name}！你在打哪裡！', '……緊急申請疏導，快點！', '別逼我還手！'],
  amber:   ['{name}，請冷靜下來！', '緊、緊急申請疏導！', '好痛……是我啊！'],
  luther:  ['……{name}，醒醒。', '……需要疏導。快。', '……別讓他靠近其他人。'],
  avaren:  ['……{name}，再過來我就不客氣了。', '……吵死了。', '……失控了嗎。'],
  eldrin:  ['{name}，冷靜點，我在這裡！', '緊急申請疏導支援！', '沒事的，我馬上幫你！'],
  chris:   ['喂喂，{name}，打錯人了吧？', '這下真的要緊急疏導了……', '冷靜點啦，{name}！'],
  tino:    ['{name}！別過來！', '好吵……好可怕……', '緊急……申請疏導！'],
  default: ['{name}，冷靜點！', '緊急申請疏導！'],
};
function friendlyHitReact(o, fromX, fromY, dmg, heavy, attacker) {
  const isPlayer = o === G.player;
  const dist = heavy ? FRIENDLY_HIT.heavyKnock : FRIENDLY_HIT.knock;
  const dx = o.x - fromX, dy = o.y - fromY, d = Math.hypot(dx, dy) || 1;
  o.knockT = FRIENDLY_HIT.time; o.knockVX = dx / d * dist / FRIENDLY_HIT.time; o.knockVY = dy / d * dist / FRIENDLY_HIT.time;
  o.hitT = Math.max(o.hitT || 0, FRIENDLY_HIT.flash); o.hitColor = '#ff5b5b';
  if (!isPlayer) {   // 哨兵：被打斷手上的動作、短暫停住
    o.cd = Math.max(o.cd || 0, FRIENDLY_HIT.stun);
    o.meleeSwing = null; o.gunSwing = null; o.navPath = null; o.navGoal = null;
    // 喊話（自己沒暴走、還站得住、冷卻好了才喊）
    const now = performance.now();
    if (o.hp > 0 && !o.berserk && now - (o.friendlyLineAt || -1e9) > FRIENDLY_HIT.lineCd * 1000) {
      o.friendlyLineAt = now;
      const name = (attacker && TYPES[attacker.type]?.name) || '喂';
      o.say = { text: pickLine(FRIENDLY_HIT_LINES, o.type, o).replace(/\{name\}/g, name), life: 2.6 };
      o.sayWait = Math.max(o.sayWait || 0, 4);
    }
  }
  flashDmg('-' + Math.round(dmg), o.x, o.y - (isPlayer ? 46 : 30), '#ff8f8f');
  G.effects.push({ ring: true, x: o.x, y: o.y - 10, r: 4, r2: heavy ? 30 : 22, life: .22, life0: .22, color: '#ff5b6e' });
  nearbyImpact(o.x, o.y, isPlayer ? 7 : 3.5, heavy ? .05 : 0);
}
// 擊退滑行：逐小步移動，撞牆就沿可走的那一軸滑或停下
function updateKnockSlide(o, dt, blocked) {
  if (!(o.knockT > 0)) return;
  const step = Math.min(dt, o.knockT); o.knockT -= step;
  const n = 3, sx = o.knockVX * step / n, sy = o.knockVY * step / n;
  for (let i = 0; i < n; i++) {
    if (!blocked(o.x + sx, o.y + sy)) { o.x += sx; o.y += sy; }
    else if (!blocked(o.x + sx, o.y)) o.x += sx;
    else if (!blocked(o.x, o.y + sy)) o.y += sy;
    else { o.knockT = 0; break; }
  }
}

// 慢動作：每幀在主迴圈呼叫一次，回傳這一幀的時間倍率
function battleTimeScale(realDt) {
  if (!G || !(G.slowMoT > 0)) return 1;
  G.slowMoT -= realDt;
  return G.slowMoScale ?? BERSERK_FX.slowMoScale;   // 連殺里程碑會用比較輕的慢動作
}

// ---- 每幀更新（在 update 裡呼叫）----
function updateBerserkFx(dt) {
  if (MAP_SAFE) return;
  G.taintMist = G.taintMist || [];
  let vignette = 0, heartbeat = 0;
  if (G.player) updateKnockSlide(G.player, dt, playerBlocked);
  for (const t of G.towers) {
    updateKnockSlide(t, dt, sentryBlocked);    // 被暴走隊友打到的擊退（嚮導也會被打）
    const spec = TYPES[t.type];
    if (!spec || spec.guide) continue;
    const alive = t.hp > 0, taint = t.taint || 0;
    // 狀態轉換：剛暴走／剛恢復／從危險區被疏導下來
    if (alive && t.berserk && !t.fxBerserk) onSentryBerserk(t);
    else if (!t.berserk && t.fxBerserk) onSentryRecovered(t);
    else if (alive && !t.berserk && t.fxDanger && taint < BERSERK_FX.warnAt && recentlySoothed(t)) { onSentryRelieved(t); t.fxDanger = false; }
    t.fxBerserk = t.berserk;
    if (t.berserk || taint >= BERSERK_FX.warnAt) t.fxDanger = true;
    else if (taint < BERSERK_FX.warnAt - 20) t.fxDanger = false;   // 自然恢復（雷德）降到 50 以下才解除，不說台詞
    if (t.berserkSay) { t.berserkSay.life -= dt; if (t.berserkSay.life <= 0) t.berserkSay = null; }
    if (!alive) continue;
    // 瀕臨暴走：越過 dangerAt 時說一句，之後沒人疏導就每隔 murmurGap 秒再說一句
    if (!t.berserk && taint >= BERSERK_FX.dangerAt) {
      t.murmurT = (t.murmurT ?? 0) - dt;
      if (!t.warnSaid || t.murmurT <= 0) {
        t.warnSaid = true;
        const [g0, g1] = BERSERK_FX.murmurGap;
        t.murmurT = g0 + Math.random() * (g1 - g0);
        t.say = { text: pickLine(TAINT_WARN_LINES, t.type, t), life: 2.8 }; t.sayWait = Math.max(t.sayWait || 0, 4);
      }
    } else if (taint < BERSERK_FX.warnAt) t.warnSaid = false;
    // 身上冒黑紫霧：汙染越高冒越快，暴走時最濃
    const k = t.berserk ? 1 : Math.max(0, (taint - BERSERK_FX.warnAt) / (100 - BERSERK_FX.warnAt));
    if (t.berserk || taint >= BERSERK_FX.warnAt) {
      t.mistT = (t.mistT || 0) - dt;
      if (t.mistT <= 0) {
        t.mistT = t.berserk ? .05 : .32 - .24 * k;
        pushTaintMist(t.x + (Math.random() * 2 - 1) * 12, t.y - 4 - Math.random() * 30, t.berserk);
      }
      vignette = Math.max(vignette, t.berserk ? 1 : k * .7);
      // 心跳聲只在玩家附近有危險哨兵時響，越近越大聲
      if ((t.berserk || taint >= BERSERK_FX.dangerAt) && G.player) {
        const d = Math.hypot(G.player.x - t.x, G.player.y - t.y) / CELL;
        if (d <= BERSERK_FX.heartbeatRange) heartbeat = Math.max(heartbeat, 1 - d / BERSERK_FX.heartbeatRange);
      }
    }
  }
  // 畫面四周的紫色暗角：跟著最危險的哨兵慢慢變化
  G.taintVignette = (G.taintVignette || 0) + (vignette - (G.taintVignette || 0)) * Math.min(1, dt * 3);
  // 心跳聲：玩家附近有哨兵瀕臨暴走或暴走中時才響（音量依距離，最大 heartbeatVolume）
  G.heartbeatT = (G.heartbeatT || 0) - dt;
  if (heartbeat > 0 && G.heartbeatT <= 0) {
    G.heartbeatT = BERSERK_FX.heartbeatGap;
    SFX.play('heartbeat', BERSERK_FX.heartbeatVolume * (.35 + .65 * heartbeat), 'heartbeat');
  }
  G.berserkFlashT = Math.max(0, (G.berserkFlashT || 0) - dt);
  for (const m of G.taintMist) {
    m.life -= dt;
    const age = m.life0 - m.life;
    m.x += (m.vx + Math.sin(age * 2.4 + m.ph) * 8) * dt; m.y += m.vy * dt;
    m.vx *= 1 - (m.blown ? 1.5 : .6) * dt; m.vy *= 1 - .4 * dt;
  }
  G.taintMist = G.taintMist.filter(m => m.life > 0);
}
function pushTaintMist(x, y, berserk, vx = (Math.random() * 2 - 1) * 6, vy = -(20 + Math.random() * 18)) {
  const L = 1.1 + Math.random() * .7;
  G.taintMist.push({ x, y, vx, vy, r0: 3 + Math.random() * 3, r1: (11 + Math.random() * 8) * (berserk ? 1.35 : 1),
    ph: Math.random() * 6.28, berserk, life: L, life0: L });
}

// ---- 暴走瞬間 ----
function onSentryBerserk(t) {
  G.slowMoT = BERSERK_FX.slowMo; G.slowMoScale = BERSERK_FX.slowMoScale;   // 短暫慢動作
  G.berserkFlashT = .6;                      // 畫面閃一下暗紅
  nearbyImpact(t.x, t.y, 10, 0);
  t.berserkSay = { text: pickLine(BERSERK_LINES, t.type, t), life: 3 };
  // 爆出一圈衝擊波＋向外炸開的黑紫霧，把附近的怪物推開（不造成傷害）
  G.effects.push({ ring: true, x: t.x, y: t.y - 8, r: 10, r2: CELL * BERSERK_FX.pushRadius, life: .45, life0: .45, color: '#ff4d6d' });
  G.effects.push({ ring: true, x: t.x, y: t.y - 8, r: 6, r2: CELL * BERSERK_FX.pushRadius * .65, life: .32, life0: .32, color: '#a55cff' });
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2, sp = 70 + Math.random() * 60;
    pushTaintMist(t.x, t.y - 12, true, Math.cos(a) * sp, Math.sin(a) * sp * .6 - 10);
  }
  for (const e of G.enemies) {
    if (!e.dead && Math.hypot(e.x - t.x, e.y - t.y) <= CELL * BERSERK_FX.pushRadius) enemyHitReact(e, t.x, t.y, true);
  }
}

// ---- 疏導成功：黑霧被疏導的光吹散 ----
function blowAwayMist(t, col) {
  for (const m of G.taintMist) {
    const dx = m.x - t.x, dy = m.y - (t.y - 15), d = Math.hypot(dx, dy) || 1;
    if (d > 90) continue;
    m.vx = dx / d * (110 + Math.random() * 60); m.vy = dy / d * 60 - 20;
    m.blown = true; m.life = Math.min(m.life, .45); m.life0 = Math.max(m.life0, m.life);
  }
  const c = `rgb(${col[0]},${col[1]},${col[2]})`;
  G.effects.push({ ring: true, x: t.x, y: t.y - 10, r: 8, r2: 58, life: .5, life0: .5, color: c });
  G.effects.push({ ring: true, x: t.x, y: t.y - 10, r: 4, r2: 36, life: .35, life0: .35, color: '#ffffff' });
}
function onSentryRecovered(t) {
  t.berserkSay = null;
  if (t.hp > 0) addStat('berserkCalmed');   // 成就：把暴走的隊友拉回來
  const col = t.lastSootheColor || SOOTHE_COLORS.winter;
  blowAwayMist(t, col);
  for (let i = 0; i < 12; i++) {   // 光點往外散開
    const a = Math.random() * Math.PI * 2, sp = 50 + Math.random() * 70;
    G.effects.push({ particle: true, kind: 'spark', x: t.x, y: t.y - 14, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .7,
      r: 1.5 + Math.random() * 2, life: .5, life0: .5, color: `rgb(${col[0]},${col[1]},${col[2]})` });
  }
  if (t.hp > 0) { t.say = { text: pickLine(SOOTHED_LINES, t.type, t), life: 3.2 }; t.sayWait = 6; }
}
// 瀕臨暴走時被疏導下來（呼叫前已確認是真的被疏導，雷德自然恢復不會觸發）
function onSentryRelieved(t) {
  blowAwayMist(t, t.lastSootheColor || SOOTHE_COLORS.winter);
  t.say = { text: pickLine(RELIEF_LINES, t.type, t), life: 3 }; t.sayWait = 6;
}

// ---- 繪製 ----
// 世界座標、角色上層：黑紫霧、腳下危險光圈、暴走台詞
function drawBerserkFxWorld(ctx) {
  if (MAP_SAFE || !G.towers) return;
  const now = performance.now() / 1000;
  for (const t of G.towers) {
    if (t.hp <= 0 || TYPES[t.type]?.guide) continue;
    const taint = t.taint || 0;
    if (!t.berserk && taint < BERSERK_FX.warnAt) continue;
    // 腳下光圈：像心跳一樣「咚咚」脈動，越危險跳越快；暴走時變紅色
    const k = t.berserk ? 1 : (taint - BERSERK_FX.warnAt) / (100 - BERSERK_FX.warnAt);
    const bpm = t.berserk ? 2.6 : 1 + k * 1.2;
    const ph = (now * bpm) % 1, beat = Math.max(Math.exp(-ph * 12), .6 * Math.exp(-Math.max(0, ph - .22) * 12) * (ph > .22 ? 1 : 0));
    ctx.save();
    ctx.globalAlpha = (.25 + .45 * k) * (.45 + .55 * beat);
    ctx.strokeStyle = t.berserk ? '#ff3b5c' : '#9b4fd0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(t.x, t.y + 14, 20 + beat * 5, 7 + beat * 2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (G.taintMist) for (const m of G.taintMist) {
    if (!isLit(m.x, m.y)) continue;
    const prog = 1 - Math.max(0, m.life) / m.life0;
    const r = m.r0 + (m.r1 - m.r0) * (1 - Math.pow(1 - prog, 2));
    const alpha = (prog < .15 ? prog / .15 : Math.max(0, (1 - prog) / .85)) * (m.berserk ? .5 : .4);
    if (alpha < .01) continue;
    const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r);
    g.addColorStop(0, m.berserk ? `rgba(60,10,30,${alpha.toFixed(3)})` : `rgba(38,14,52,${alpha.toFixed(3)})`);
    g.addColorStop(.55, m.berserk ? `rgba(40,8,24,${(alpha * .55).toFixed(3)})` : `rgba(26,10,36,${(alpha * .55).toFixed(3)})`);
    g.addColorStop(1, 'rgba(14,4,18,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, Math.PI * 2); ctx.fill();
  }
  // 暴走台詞：暗紅泡泡，微微抖動
  for (const t of G.towers) {
    if (!t.berserkSay || t.hp <= 0) continue;
    const jx = (Math.random() * 2 - 1) * 1.2;
    ctx.globalAlpha = Math.min(1, t.berserkSay.life / .3);
    // 放在「暴走」標籤上方（與 drawTower 的名字／標籤位置一致）
    const nameY = t.y - PLAYER.drawSize + 18 - 11;
    drawSpeechBubble(t.x + jx, nameY - 30, t.berserkSay.text, BERSERK_BUBBLE);
    ctx.globalAlpha = 1;
  }
}
// 螢幕座標：紫色暗角（跟著汙染程度與心跳脈動）＋暴走瞬間的暗紅閃光
// 哨兵瀕臨暴走／暴走時：在畫面邊緣、朝他的方向閃紅光（就算他在畫面裡也會閃，製造壓力）；
// 他在畫面外時，再加上小箭頭＋名字指引方向
// margin：哨兵離畫面邊緣多遠以內就算「看得到」（不畫箭頭）；glow：紅光半徑；alpha：紅光最濃處的透明度
const EDGE_ALERT = { margin: 10, glow: 280, inset: 26, alpha: .3 };
function drawSentryEdgeAlerts(ctx, cv) {
  const W = cv.width, H = cv.height, now = performance.now() / 1000;
  for (const t of G.towers) {
    const spec = TYPES[t.type];
    if (!spec || spec.guide || t.hp <= 0) continue;
    const danger = !t.berserk && (t.taint || 0) > BERSERK_FX.dangerAt;
    if (!t.berserk && !danger) continue;
    const sx = (t.x - cam.x) * VIEW_SCALE, sy = (t.y - 20 - cam.y) * VIEW_SCALE;
    const m = EDGE_ALERT.margin;
    const onScreen = sx > m && sx < W - m && sy > m && sy < H - m;
    // 從畫面中心往哨兵方向，找到碰到畫面邊緣的那一點（哨兵幾乎就在畫面正中間時，改從下緣亮）
    let dx = sx - W / 2, dy = sy - H / 2;
    if (Math.hypot(dx, dy) < 40) { dx = 0; dy = 1; }
    const k = Math.min(Math.abs(dx) > 1e-6 ? (W / 2) / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-6 ? (H / 2) / Math.abs(dy) : Infinity);
    const ex = W / 2 + dx * k, ey = H / 2 + dy * k, ang = Math.atan2(dy, dx);
    // 閃爍：瀕臨暴走慢閃（約 1.1 秒）、暴走快閃（約 0.38 秒）
    const period = t.berserk ? .38 : 1.1, blink = .5 + .5 * Math.sin(now / period * Math.PI * 2);
    const col = t.berserk ? '255,40,60' : '255,110,60';
    const R = EDGE_ALERT.glow * (t.berserk ? 1.15 : 1);
    const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, R);
    const A = EDGE_ALERT.alpha;
    g.addColorStop(0, `rgba(${col},${(A * (.6 + .4 * blink)).toFixed(3)})`);
    g.addColorStop(.5, `rgba(${col},${(A * (.25 + .2 * blink)).toFixed(3)})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fillRect(ex - R, ey - R, R * 2, R * 2);
    if (onScreen) continue;   // 看得到本人時，頭上已有標籤，不用箭頭和名字
    // 小箭頭＋名字（往內縮一點，才不會貼在邊上被切掉）
    const ax = Math.max(EDGE_ALERT.inset, Math.min(W - EDGE_ALERT.inset, ex)), ay = Math.max(EDGE_ALERT.inset, Math.min(H - EDGE_ALERT.inset, ey));
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang);
    ctx.globalAlpha = .75 + .25 * blink; ctx.fillStyle = t.berserk ? '#ff3b4a' : '#ffb24d';
    ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-6, -9); ctx.lineTo(-2, 0); ctx.lineTo(-6, 9); ctx.closePath();
    ctx.stroke(); ctx.fill();
    ctx.restore();
    const lx = ax - Math.cos(ang) * 30, ly = ay - Math.sin(ang) * 22;
    ctx.save();
    ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.9)';
    const label = spec.name + (t.berserk ? '・暴走' : '');
    ctx.strokeText(label, lx, ly); ctx.fillStyle = t.berserk ? '#ff6b78' : '#ffc27a'; ctx.fillText(label, lx, ly);
    ctx.restore();
  }
}
function drawBerserkFxScreen(ctx, cv) {
  if (MAP_SAFE) return;
  drawSentryEdgeAlerts(ctx, cv);
  const v = G.taintVignette || 0, flashT = G.berserkFlashT || 0;
  if (v < .02 && flashT <= 0) return;
  const now = performance.now() / 1000, ph = (now * 1.4) % 1;
  const pulse = .7 + .3 * Math.exp(-ph * 8);
  const radius = Math.max(cv.width, cv.height) * .75;
  const g = ctx.createRadialGradient(cv.width / 2, cv.height / 2, radius * .42, cv.width / 2, cv.height / 2, radius);
  const a = v * .42 * pulse + flashT / .6 * .4;
  g.addColorStop(0, 'rgba(40,0,40,0)');
  g.addColorStop(.6, `rgba(55,8,60,${(a * .25).toFixed(3)})`);
  g.addColorStop(1, flashT > 0 ? `rgba(120,10,40,${a.toFixed(3)})` : `rgba(60,10,70,${a.toFixed(3)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
}
