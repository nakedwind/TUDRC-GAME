/* ===== 音效：優先播放素材音檔，未對應的效果沿用 Web Audio 合成 =====
   呼叫：sfx('button' | 'menu' | 'switch' | 'blip' | 'place' | 'soothe'
            | 'wave' | 'win' | 'lose' | 'error' | 'berserk' | 'kill')
   調整：改 sounds 裡的參數就能改音色；SFX.volume 設總音量；按 M 鍵可靜音。
   音檔播放：開遊戲時就先把音檔解碼進記憶體（Web Audio），要播時立刻出聲、不會慢半拍。
            如果是直接雙擊 HTML 開啟（file://），瀏覽器不准預先載入，會自動退回舊的播放方式。
   音高變化：VARIED 裡的戰鬥音效每次播放音高、音量都會隨機偏一點，連續命中才不會像同一段錄音重播。
*/
const SFX = (() => {
  let ctx = null, master = null, volume = 0.35, enabled = true;
  const baseFiles = {
    button: '介面/按鈕.mp3',
    menu: '介面/開選單.mp3',
    aidHover: '介面/help_choose_SE.mp3',   // 用急救包選隊員：滑鼠移到某位隊員的頭像上（js/team.js、js/equipment.js）
    aidCannot: '介面/help_choose_can_not.mp3',   // 點急救包但沒有人受傷（js/equipment.js）
    aidStart: '玩家/補血.mp3',   // 開始急救（進度條開始跑，js/equipment.js）；急救完成播 soothe（疏導）
    switch: '介面/切換.mp3',
    blip: '介面/對話框下一頁音效.mp3',
    place: '設施/放置.mp3',
    demolish: '設施/拆建築.mp3',
    placeLight: '設施/放燈.mp3',   // 放置燈類建築（js/build.js）   // 拆除自己蓋的建築（js/game.js 的 demolishPlayerBuilding）
    itemPickup: '獎勵/拾取.mp3',
    itemReveal: '獎勵/開置物櫃.mp3',   // 第一次拿到東西、開置物櫃開出東西：跳出說明視窗時（js/item-intro.js）
    powerOn: '環境/門與機關/很大聲的開燈.mp3',
    ironGateSlide: '環境/門與機關/鐵門滑動.mp3',
    soothe: '玩家/疏導.mp3',
    sootheEnd: '玩家/疏導2.mp3',   // 溫特疏導的進度條跑完、疏導成功時（js/sentry.js 的 finishSoothe）；開始時播上面的 soothe
    drink: '喝飲料.mp3',   // 喝杏仁水（js/shop.js 的 useSupply）
    wearGear: '穿裝備.mp3',   // 穿上裝備：溫特的防具（js/equipment.js 的 equipToSlot）、幫隊員穿隊員裝備（js/backpack.js、js/squad-page.js）
    door: '環境/門與機關/關門.mp3',
    backroomDoor: '環境/門與機關/後室開門.mp3',
    lockedDoor: '環境/門與機關/關門.mp3',     // 鎖住的房門：轉門把（js/locked-doors.js）
    doorUnlock: '環境/門與機關/關門.mp3',     // 用後室門鑰匙開鎖（js/doors.js）
    chainUnlock: '設施/打磨.mp3',             // 解開神秘門的鎖鏈（js/doors.js）
    mrtGate: '環境/門與機關/剪票口.mp3',      // 捷運閘門刷好遊卡（js/mrt-locks.js）
    mrtUnlock: '設施/打磨.mp3',               // 用異質鑰匙解封捷運入口（js/mrt-locks.js）
    elevator: '環境/門與機關/電梯.mp3',
    storyDoor: '環境/門與機關/電梯.mp3',   // 回憶劇情的自動門開關（data/story-scenes.js 的 sfx；先借電梯聲，可在音效編輯器換）
    stairsDown: '環境/腳步/footsteps03 (mp3cut.net).mp3',   // 走逃生樓梯下樓（js/game.js 的 enterPortal）
    stairsUp: '環境/腳步/footsteps03 (mp3cut.net).mp3',     // 走逃生樓梯上樓（js/game.js 的 enterPortal）
    gunshot: '戰鬥/槍械/開槍.mp3',   // 隊員開槍、劇情裡開槍（溫特的手槍用下面的 shotPistol）
    // 子彈：每種子彈各自的射擊聲（shot…）、打擊聲（hit…），音效編輯器「子彈」分類可以分開換。預設沿用原本的音檔；
    // 原本沒有聲音的（螢光漆彈打中、麻醉彈打中、雷電彈／治療彈射擊）在 data/sound-settings.js 設成 0%，調高才會響
    shotPistol: '戰鬥/槍械/開槍.mp3',
    hitPistol: '戰鬥/命中/hit.mp3',          // 打中沒有專屬「被打」音效的怪物（有專屬的照舊播牠自己的）
    shotFlare: '戰鬥/槍械/射擊.mp3',
    hitFlare: { mode: 'random', files: ['戰鬥/元素/火焰.mp3', '戰鬥/元素/火焰02.mp3'] },   // 照明彈落地
    shotIncendiary: '戰鬥/槍械/射擊.mp3',
    hitIncendiary: { mode: 'random', files: ['戰鬥/元素/火焰.mp3', '戰鬥/元素/火焰02.mp3'] },   // 燃燒彈落地燒出火海
    shotTranq: '戰鬥/槍械/開槍.mp3',
    hitTranq: '戰鬥/命中/hit.mp3',
    shotPaint: '戰鬥/槍械/開槍.mp3',
    hitPaint: '戰鬥/命中/hit.mp3',
    shotSplit: '戰鬥/槍械/開槍.mp3',
    hitSplit: '戰鬥/命中/hit.mp3',           // 同 hitPistol：沒有專屬「被打」音效的怪物才播
    shotFlash: '介面/切換.mp3',
    hitFlash: '戰鬥/爆炸/小爆炸.mp3',        // 落地爆閃（另外還會疊一聲 glassBreak3）
    shotShock: '戰鬥/槍械/開槍.mp3',
    hitShock: '戰鬥/元素/雷電.mp3',
    shotHeal: '戰鬥/槍械/開槍.mp3',
    hitHeal: '玩家/疏導.mp3',
    reload: '戰鬥/槍械/reload.mp3',
    ammoRefill: '戰鬥/槍械/reload02.mp3',   // 營地的補彈藥箱補子彈（js/flare.js 的 useAmmoRefillNearPlayer）
    magLoad: '戰鬥/槍械/reload02.mp3',      // 背包裡把子彈裝進彈匣、彈匣格互換（js/backpack.js）
    monsterHit: '戰鬥/命中/hit.mp3',
    fireImpact: { mode: 'random', files: ['戰鬥/元素/火焰.mp3', '戰鬥/元素/火焰02.mp3'] },
    lightningImpact: '戰鬥/元素/雷電.mp3',
    corrosionImpact: ['戰鬥/元素/腐蝕.mp3', '戰鬥/元素/腐蝕02.mp3'],   // 異質核心甦醒／碎掉、吐酸史萊姆的酸落地：腐蝕＋腐蝕02 一起播（原本是 腐蝕命中.wav）
    avarenCorrosion: ['戰鬥/元素/腐蝕.mp3', '戰鬥/元素/腐蝕02.mp3'],   // 阿瓦倫的腐蝕攻擊打中：腐蝕＋腐蝕02 一起播
    campWarning: '設施/警告聲.mp3',
    monsterDown: '怪物/共用/怪物倒下.mp3',
    rangedShot: '戰鬥/槍械/射擊.mp3',
    knock2: '戰鬥/命中/敲打2.mp3',
    cleaver: '戰鬥/近戰/菜刀.mp3',
    meleeAttack: '戰鬥/近戰/近戰攻擊.mp3',
    swordSwing: '戰鬥/近戰/揮劍.mp3',
    heartbeat: '玩家/心跳.mp3',
    achievement: '獎勵/升級.mp3',
    glassBreak3: '環境/破壞/玻璃破掉3.mp3',
    glassBreak4: '環境/破壞/玻璃破掉4.mp3',
    oreMine: '環境/破壞/挖礦.mp3',   // 異質礦被破壞時（跟玻璃破掉一起播；js/ore.js）
    mineBeep: '設施/BB聲.mp3',
    smallBoom: '戰鬥/爆炸/小爆炸.mp3',
    midBoom: '戰鬥/爆炸/中爆炸.mp3',
    bigBoom: '戰鬥/爆炸/爆炸.mp3',
    shopBell: '商店/便利商店門鈴.mp3',
    shopCheckout: '商店/結帳.mp3',   // 商店結帳（js/shop.js）
    shopEnter: '商店/全家便利商店新進門聲.mp3',   // 在櫃台打開商店（js/shop.js）
    vendingOpen: '開販賣機.mp3',        // 打開販賣機（js/shop.js）
    vendingCheckout: '販賣機結帳.mp3',  // 販賣機結帳、飲料掉出來（js/shop.js）
    gachaDrop: '扭蛋掉落.mp3',          // 轉扭蛋：扭蛋掉出來（js/gacha.js）
    // 扭蛋演出（js/gacha.js；音檔用 tools/make_gacha_sfx.py 合成）
    gachaCrank: '獎勵/扭蛋/扭蛋轉動.wav',     // 按下轉扭蛋：投幣＋轉把手
    gachaCharge: '獎勵/扭蛋/扭蛋集氣.wav',    // SR／SSR 搖蛋集氣
    gachaOpen: '獎勵/扭蛋/開蛋.wav',          // 普通開蛋
    gachaSR: '獎勵/扭蛋/SR出貨.wav',          // 出 SR
    gachaUpgrade: '獎勵/扭蛋/SSR升格.wav',    // SSR 搖到一半：金色變彩虹
    gachaSSR: '獎勵/扭蛋/SSR出貨.wav',        // 出 SSR
    gachaHero: '獎勵/扭蛋/SSR獨照.wav',       // SSR 獨照展示
    favorUp: '獎勵/升等.mp3',
    mineGrind: '設施/打磨.mp3',
    crystalGet: '獎勵/得到碎片.mp3',
    slimeHit: '怪物/史萊姆/slime-hit.mp3',
    playerHit: '玩家/slime-hit.mp3',   // 溫特受傷（地雷、爆炸、火、腐蝕、暴走隊員；js/game.js 的 playPlayerHit）
    playerHitMonster: ['玩家/slime-hit.mp3', '戰鬥/命中/hit.mp3'],   // 溫特被「怪物」打中：slime-hit＋hit 一起播
    slimeLand: '怪物/史萊姆/slime-land.mp3',
    // 鳥頭人：依試聽結果對調（被打用「死掉」那個檔、死掉用「被打」那個檔）
    birdHurt: '怪物/鳥頭人/鳥頭人死掉.mp3',
    birdDeath: '怪物/鳥頭人/鳥頭人被打.mp3',
    pearlHurt: '怪物/珍珠小童/珍珠小童被打.mp3',
    pearlDeath: ['怪物/珍珠小童/珍珠小童死掉.mp3', '怪物/珍珠小童/珍珠小童死掉02.mp3'],
    lifeformAttack: '怪物/生命體/生命體.mp3',
    lifeformWalk: '怪物/生命體/生命體走路.mp3',
    lifeformDeath: '怪物/生命體/生命體死掉.mp3',
    lifeformRevive: '怪物/生命體/生命體復活.mp3',
    // Smiler：咬人＝hit＋史萊姆撞擊（兩個疊在一起播）；笑＝scary-laugh（Smiler 消失時會淡出）
    smilerBite: ['戰鬥/命中/hit.mp3', '怪物/史萊姆/slime-hit.mp3'],   // 先用 hit；自製的咬聲在 怪物/Smiler/smiler-bite.wav（太刺耳，暫時不用）
    smilerLaugh: '怪物/Smiler/scary-laugh.mp3',
    // 夯吉寶：被打、死掉、從順順宮帽裡衝出來（js/hangi-bao.js）
    hangiHurt: '怪物/夯吉寶/夯吉被打.mp3',
    hangiDeath: '怪物/夯吉寶/夯吉死掉.mp3',
    hangiPopOut: '怪物/夯吉寶/夯吉衝出來.mp3',
    // 魚頭君：腳步聲、噴水、水把火澆熄（js/fish-head.js；滅火先用水滴聲代替）
    fishStep: '怪物/魚頭君/魚頭腳步聲.mp3',
    fishSpray: '怪物/魚頭君/噴水攻擊.mp3',
    fishHurt: '怪物/魚頭君/魚頭被打.mp3',
    fishDeath: ['怪物/魚頭君/魚頭死掉.mp3', '怪物/魚頭君/魚頭被打.mp3'],   // 死掉時被打的聲音一起播
    fishDouse: '環境/水滴聲.mp3',
    // 絲瓜小姐：踩踏、藤蔓從地底冒出來、走路、被打、死掉（js/loofah-lady.js）
    loofahStomp: '怪物/絲瓜小姐/絲瓜小姐踩踏.mp3',
    loofahVine: '怪物/絲瓜小姐/絲瓜藤攻擊.mp3',
    loofahStep: '怪物/絲瓜小姐/絲瓜小姐走路.mp3',
    loofahHurt: '怪物/絲瓜小姐/絲瓜小姐被打.mp3',
    loofahDeath: '怪物/絲瓜小姐/絲瓜小姐死掉.mp3',
    // 比基尼小丑魚：落地（兩種跳躍聲輪流）、被打、死掉；生蛋和孵化用 pop（js/clownfish.js）
    clownfishHop1: '怪物/小丑魚/小丑魚跳躍01.mp3',
    clownfishHop2: '怪物/小丑魚/小丑魚跳躍02.mp3',
    clownfishHurt: '怪物/小丑魚/小丑魚被打.mp3',
    clownfishDeath: '怪物/小丑魚/小丑魚死掉.mp3',
    clownfishSmallDeath: '怪物/小丑魚/小丑魚死掉.mp3',   // 小丑魚幼體死掉：同一個檔，播快一點（音調高、尖，像小孩；見 SOUND_PITCH）
    // 花蓮版權老鼠：鑽土（入土、地底移動）、鑽出、手攻擊、被打；死掉先用被打播低一點（js/burrowing-mouse.js）
    mouseDig: '怪物/老鼠/老鼠鑽土.mp3',
    mouseOut: '怪物/老鼠/老鼠鑽出.mp3',
    mouseAttack: '怪物/老鼠/老鼠攻擊.mp3',
    mouseHurt: '怪物/老鼠/老鼠被打.mp3',
    mouseDeath: '怪物/老鼠/老鼠被打.mp3',
    // 金蕉王：補血、被打、死掉（js/golden-banana-king.js）
    bananaHeal: '怪物/金蕉王/治療.mp3',
    bananaHurt: '怪物/金蕉王/金蕉王被打.mp3',
    bananaDeath: '怪物/金蕉王/金蕉王死掉.mp3',
    // 葫蘆猴：拖地行走、泰山壓頂落地（撞擊＋叫聲）、笑、死掉、被震飛的人落地（js/gourd-monkey.js）
    gourdDrag: '怪物/絲瓜小姐/絲瓜小姐走路.mp3',   // 暫用絲瓜小姐走路，可在音效編輯器換
    gourdSlam: ['怪物/絲瓜小姐/絲瓜小姐踩踏.mp3', '戰鬥/命中/敲打2.mp3'],   // 砸到地面的撞擊聲（兩個一起播）
    gourdLandCry: '怪物/葫蘆猴/葫蘆猴落地叫聲.mp3',
    gourdLaugh: '怪物/葫蘆猴/葫蘆猴笑聲.mp3',
    gourdDeath: '怪物/葫蘆猴/葫蘆猴死掉.mp3',
    gourdTossLand: '戰鬥/命中/敲打2.mp3',   // 被震飛的溫特／隊友落地
    bananaSlip: '環境/踩到香蕉.mp3',   // 踩到香蕉皮滑倒（js/golden-banana-king.js 的 bkSlip）
    pop: 'pop.mp3',
    ballBark: { mode: 'random', files: ['狗/叫1聲.mp3', '狗/叫2聲.mp3'] },   // 球球叫：叫 1 聲或叫 2 聲隨機（js/ball-poses.js 的 updateBallBark）
    milkfishGulp: '怪物/虱目魚小子/虱目魚小子吃人.mp3',   // 虱目魚小子吞下隊友（js/milkfish-kid.js）
    milkfishChew: '怪物/虱目魚小子/虱目魚小子吃人.mp3',   // 虱目魚小子吃掉一格的物品
    milkfishSpit: '怪物/史萊姆/slime-land.mp3',           // 吐出隊友（被打死獲救、被消化到倒下）
    milkfishHurt: '怪物/虱目魚小子/虱目魚小子被打.mp3',
    milkfishDeath: '怪物/虱目魚小子/虱目魚小子死掉.mp3',
    // 環境背景音：Y 區地圖一直循環播放（js/ambience.js）
    whiteNoise: '環境/白噪音.mp3',
    // BOSS 音樂（js/boss-music.js）：一直循環、淡入淡出；音量在音效編輯器的「音樂」調整
    bossElite: '戰鬥/中BOSS.mp3',             // 鳥頭大隊長盯上玩家
    bossCore: '戰鬥/異質核心甦醒.mp3',        // 異質核心甦醒到被打破
    radio: ['無線電.mp3', '無線電雜音.mp3'],   // 無線電接起來／掛斷：兩個一起播（新手區開場希奧妮的無線電，js/tutorial.js）
    baseMusic: '../music/基地音樂.mp3',      // 基地（安全區）背景音樂（js/music.js）；檔案在 music/ 資料夾
    // SP 低於 50：溫特聽到的怪聲（js/sanity.js；心跳用上面的 heartbeat）
    weirdNoise: '玩家/怪聲.mp3',
  };
  const FILE_KEY = 'tudrc_sound_files_v1';
  const fileConfig = (() => {
    let cfg = typeof SOUND_SETTINGS !== 'undefined' ? (SOUND_SETTINGS.files || {}) :
      (typeof SOUND_FILE_CONFIG !== 'undefined' ? SOUND_FILE_CONFIG : {});
    if (/[?&]previewSounds=1(&|$)/.test(location.search)) {
      try { const draft = JSON.parse(localStorage.getItem(FILE_KEY) || 'null'); if (draft && typeof draft === 'object') cfg = draft; } catch (_) {}
    }
    return cfg || {};
  })();
  const files = { ...baseFiles, ...(fileConfig.overrides || {}), ...(fileConfig.extras || {}) };
  // 戰鬥音效的隨機變化：pitch＝音高（播放速度）±比例、gain＝音量 ±比例。
  // 介面、警告、心跳等不列在 VARIED 裡，維持每次都一樣。
  const VARY = { pitch: 0.08, gain: 0.12 };
  const VARIED = new Set(['gunshot', 'monsterHit', 'fireImpact', 'lightningImpact', 'corrosionImpact', 'avarenCorrosion', 'monsterDown',
    'rangedShot', 'knock2', 'cleaver', 'meleeAttack', 'swordSwing', 'slimeHit', 'slimeLand', 'kill', 'hit', 'birdHurt', 'birdDeath', 'pearlHurt', 'pearlDeath', 'lifeformAttack', 'lifeformWalk', 'smilerBite', 'hangiHurt', 'hangiDeath', 'fishStep', 'fishSpray', 'fishDouse', 'fishHurt', 'fishDeath', 'loofahStomp', 'loofahVine', 'loofahStep', 'loofahHurt', 'loofahDeath', 'milkfishHurt', 'milkfishDeath', 'clownfishHop1', 'clownfishHop2', 'clownfishHurt', 'clownfishDeath', 'clownfishSmallDeath', 'mouseDig', 'mouseOut', 'mouseAttack', 'mouseHurt', 'mouseDeath', 'bananaHurt', 'bananaDeath', 'gourdDrag', 'gourdSlam', 'gourdLandCry', 'gourdDeath', 'gourdTossLand', 'pop', 'playerHit', 'playerHitMonster',
    'shotPistol', 'hitPistol', 'hitFlare', 'hitIncendiary', 'shotTranq', 'hitTranq', 'shotPaint', 'hitPaint', 'shotSplit', 'hitSplit', 'shotShock', 'hitShock', 'shotHeal']);
  const jitter = amount => 1 + (Math.random() * 2 - 1) * amount;
  // 固定把某些音效播快／播慢（1.4＝音調高、比較短；0.8＝低沉）：同一個音檔做出不同的聲音
  const SOUND_PITCH = { clownfishSmallDeath: 1.6, mouseDeath: .72 };
  // 回音（老鼠死掉：被打的聲音壓低、加回音；放大用音效編輯器的音量倍率）：delay＝每次回音間隔（秒）、feedback＝每次剩幾成、wet＝回音音量
  const SOUND_ECHO = { mouseDeath: { delay: .17, feedback: .45, wet: .55 } };
  const activeAudio = new Map();     // 舊播放方式（HTML Audio）正在播的音
  const activeSources = new Set();   // Web Audio 正在播的音（靜音時要一起停掉）
  const buffers = {};                // 已解碼好的音檔：name → AudioBuffer
  const lastPlayed = new Map();
  const playingByKey = new Map();    // 正在播的聲音：sourceKey → [{ src, g } 或 { audio, gain }]（給 fadeOut 用）
  const remember = (sourceKey, h) => { const list = playingByKey.get(sourceKey) || []; list.push(h); playingByKey.set(sourceKey, list); };
  const forget = (sourceKey, h) => { const list = playingByKey.get(sourceKey); if (!list) return; const i = list.indexOf(h); if (i >= 0) list.splice(i, 1); if (!list.length) playingByKey.delete(sourceKey); };
  const fileLayers = value => value && value.mode === 'random' && Array.isArray(value.files) ? value.files.filter(Boolean) :
    (Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []));
  const playbackLayers = value => {
    const all = fileLayers(value);
    if (value && value.mode === 'random' && all.length) {
      const index = Math.floor(Math.random() * all.length);
      return [{ file: all[index], index }];
    }
    return all.map((file, index) => ({ file, index }));
  };
  function playFile(name, gain = 1, sourceKey = name) {
    const now = performance.now();
    if (now - (lastPlayed.get(sourceKey) || -Infinity) < 70) return;
    lastPlayed.set(sourceKey, now);
    const vary = VARIED.has(name), rate = (vary ? jitter(VARY.pitch) : 1) * (SOUND_PITCH[name] || 1);
    if (vary) gain *= jitter(VARY.gain);
    playbackLayers(files[name]).forEach(({ file, index }) => {
      const key = name + ':' + index;
      if (buffers[key]) {             // 已預先載入：所有疊加層在同一刻播放
        ensure();
        const src = ctx.createBufferSource(); src.buffer = buffers[key]; src.playbackRate.value = rate;
        const g = ctx.createGain(); g.gain.value = gain;
        src.connect(g); g.connect(master); activeSources.add(src);
        const echo = SOUND_ECHO[name];
        if (echo) {   // 回音：延遲線接回自己，逐次變小；播完再等回音收尾才拆掉
          const d = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain();
          d.delayTime.value = echo.delay; fb.gain.value = echo.feedback; wet.gain.value = echo.wet;
          g.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(master);
          src.addEventListener('ended', () => setTimeout(() => { d.disconnect(); fb.disconnect(); wet.disconnect(); }, 2500));
        }
        const h = { src, g }; remember(sourceKey, h);
        src.onended = () => { activeSources.delete(src); forget(sourceKey, h); }; src.start(); return;
      }
      const audio = new Audio('Sound effects/' + file);   // file:// 開啟時的疊加播放
      audio.volume = Math.min(1, volume * gain); audio.preservesPitch = false; audio.playbackRate = rate;
      const h = { audio }; remember(sourceKey, h);
      activeAudio.set(audio, gain); const cleanup = () => { activeAudio.delete(audio); forget(sourceKey, h); };
      audio.addEventListener('ended', cleanup, { once: true }); audio.addEventListener('error', cleanup, { once: true });
      audio.play().catch(cleanup);
    });
  }
  function createContext() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination);
  }
  function ensure() {
    createContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // 開遊戲時先把所有音檔下載並解碼；任何一個失敗，就只有那個音沿用舊播放方式
  function preload() {
    if (location.protocol === 'file:') return;   // 雙擊開啟時瀏覽器禁止讀檔，直接用舊方式
    createContext();
    if (!ctx) return;
    for (const [name, value] of Object.entries(files)) fileLayers(value).forEach((file, index) => {
      const job = fetch('Sound effects/' + file.split('/').map(encodeURIComponent).join('/'))
        .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(data => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))
        .then(buffer => { buffers[name + ':' + index] = buffer; })
        .catch(() => {});
      if (typeof AssetGate !== 'undefined') AssetGate.wait(job);   // 音效全部下載、解碼完才開始玩（載入畫面在 js/asset-gate.js）
    });
  }
  // 瀏覽器規定玩家第一次點擊或按鍵後才能出聲，那時順便喚醒音效引擎
  const unlock = () => { if (ctx && ctx.state === 'suspended') ctx.resume(); };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  // 一個帶音量包絡的音（可做滑音：freq → freq2）
  function tone({ freq, freq2, type = 'sine', dur = 0.12, gain = 0.25, attack = 0.004, when = 0 }) {
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator(); osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freq2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq2), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  // 一段雜訊（做敲擊、塵埃、暴走的粗糙感），經帶通濾波
  function noise({ dur = 0.14, gain = 0.15, when = 0, freq = 1400, q = 0.7 }) {
    const t0 = ctx.currentTime + when;
    const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }
  const sounds = {
    button() { tone({ freq: 520, freq2: 660, type: 'square', dur: 0.06, gain: 0.16 }); },
    menu() { tone({ freq: 380, type: 'triangle', dur: 0.08, gain: 0.18 }); tone({ freq: 570, type: 'triangle', dur: 0.1, gain: 0.15, when: 0.05 }); },
    switch() { tone({ freq: 720, freq2: 470, type: 'sine', dur: 0.07, gain: 0.15 }); },
    blip() { tone({ freq: 880, type: 'sine', dur: 0.05, gain: 0.13 }); },
    place() { tone({ freq: 190, freq2: 85, type: 'sine', dur: 0.15, gain: 0.32 }); noise({ dur: 0.12, gain: 0.12, freq: 900 }); },
    soothe() { tone({ freq: 660, type: 'sine', dur: 0.16, gain: 0.13 }); tone({ freq: 990, type: 'sine', dur: 0.2, gain: 0.11, when: 0.1 }); },
    wave() { tone({ freq: 300, type: 'sawtooth', dur: 0.16, gain: 0.15 }); tone({ freq: 300, type: 'sawtooth', dur: 0.16, gain: 0.15, when: 0.22 }); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.2, gain: 0.2, when: i * 0.11 })); },
    lose() { [440, 392, 311, 233].forEach((f, i) => tone({ freq: f, type: 'sawtooth', dur: 0.26, gain: 0.17, when: i * 0.14 })); },
    error() { tone({ freq: 200, freq2: 150, type: 'square', dur: 0.16, gain: 0.18 }); },
    // 無線電接通的合成音（備用：上面 files 的 radio 有音檔時用音檔）
    radio() { noise({ dur: 0.32, gain: 0.1, freq: 1900, q: 0.6 }); noise({ dur: 0.18, gain: 0.07, freq: 3200, q: 1.2, when: 0.12 }); tone({ freq: 1250, type: 'square', dur: 0.07, gain: 0.05, when: 0.3 }); },
    // 空槍：子彈打完扣扳機，擊錘「喀、嗒」兩聲金屬聲（js/flare.js 的 dryFire）
    dryFire() { noise({ dur: 0.025, gain: 0.32, freq: 3400, q: 6 }); tone({ freq: 2100, freq2: 1300, type: 'square', dur: 0.02, gain: 0.05 }); noise({ dur: 0.02, gain: 0.18, freq: 2600, q: 5, when: 0.07 }); },
    berserk() { tone({ freq: 130, freq2: 55, type: 'sawtooth', dur: 0.4, gain: 0.24 }); noise({ dur: 0.34, gain: 0.16, freq: 500, q: 0.5 }); },
    kill() { const k = jitter(VARY.pitch); tone({ freq: 420 * k, freq2: 120 * k, type: 'sine', dur: 0.09, gain: 0.1 * jitter(VARY.gain) }); },
    // 鳥頭人跑步：赤腳重重踩在水泥地上——低沉的「咚」＋腳掌拍地的「啪」＋一點沙沙的摩擦
    birdRun(g = 1) {
      const k = jitter(.1);
      tone({ freq: 105 * k, freq2: 48 * k, type: 'sine', dur: .1, gain: .34 * g });
      noise({ dur: .05, gain: .16 * g, freq: 1900 * k, q: 1.3 });
      noise({ dur: .08, gain: .1 * g, freq: 420 * k, q: .8, when: .008 });
      noise({ dur: .07, gain: .045 * g, freq: 3200, q: .6, when: .03 });
    },
    // 鳥頭人快步走：輕一點、短一點
    birdWalk(g = 1) {
      const k = jitter(.1);
      tone({ freq: 120 * k, freq2: 70 * k, type: 'sine', dur: .07, gain: .2 * g });
      noise({ dur: .04, gain: .08 * g, freq: 1600 * k, q: 1.2 });
    },
    // 珍珠小童噴珍珠：嘴裡「啵」一聲吐出來
    // 踩到小丑魚的魚卵：軟軟濕濕的「噗啾」——低沉的壓扁聲＋被撐開的吱一聲＋冒一顆泡泡（js/clownfish.js）
    eggSquish(g = 1) {
      const k = jitter(.07);
      tone({ freq: 240 * k, freq2: 105 * k, type: 'sine', dur: .17, gain: .3 * g, attack: .006 });                  // 噗：被踩扁
      tone({ freq: 880 * k, freq2: 1450 * k, type: 'triangle', dur: .06, gain: .06 * g, when: .025 });             // 啾：膜被撐開
      tone({ freq: 640 * k, freq2: 330 * k, type: 'sine', dur: .1, gain: .13 * g, attack: .003, when: .08 });      // 冒泡
      noise({ dur: .11, gain: .07 * g, freq: 650 * k, q: 1.3 });                                                     // 濕濕的
    },
    pearlShot(g = 1) {
      const k = jitter(.08);
      tone({ freq: 520 * k, freq2: 260 * k, type: 'sine', dur: .09, gain: .22 * g });
      noise({ dur: .05, gain: .07 * g, freq: 2200 * k, q: 1.4 });
    },
    // 珍珠打中／碎掉：清脆的「叮」
    pearlHit(g = 1) {
      const k = jitter(.06);
      tone({ freq: 1850 * k, freq2: 1500 * k, type: 'triangle', dur: .12, gain: .14 * g });
      tone({ freq: 2770 * k, type: 'sine', dur: .08, gain: .06 * g, when: .01 });
      noise({ dur: .04, gain: .06 * g, freq: 4200, q: 1 });
    },
    hit() { const k = jitter(VARY.pitch); tone({ freq: 160 * k, freq2: 70 * k, type: 'square', dur: 0.07, gain: 0.15 * jitter(VARY.gain) }); noise({ dur: 0.06, gain: 0.08, freq: 700 * k }); },
  };
  // 個別音效的音量倍率（1＝原本）：在「音效編輯器」調整，存在 data/sound-settings.js
  // 用 ?previewSounds=1 開遊戲時，改用音效編輯器存在瀏覽器裡、還沒匯出的設定。
  const GAIN_KEY = 'tudrc_sound_gain_v1';
  let SOUND_GAIN = { ...(typeof SOUND_SETTINGS !== 'undefined' ? (SOUND_SETTINGS.gains || {}) :
    (typeof SOUND_GAIN_DEFAULT !== 'undefined' ? SOUND_GAIN_DEFAULT : {})) };
  if (/[?&]previewSounds=1(&|$)/.test(location.search)) {
    try { const draft = JSON.parse(localStorage.getItem(GAIN_KEY) || 'null'); if (draft && typeof draft === 'object') SOUND_GAIN = draft; } catch (_) {}
  }
  function play(name, gain = 1, sourceKey = name) {
    if (!enabled) return;
    gain *= SOUND_GAIN[name] ?? 1;
    if (gain <= 0) return;
    if (files[name]) { playFile(name, gain, sourceKey); return; }
    const f = sounds[name];
    if (f) { ensure(); f(gain); }   // 合成音效也吃音量（sfxAt 會依距離調小）
  }
  preload();
  // 讓某個還在播的聲音在 sec 秒內淡出並停止（例：Smiler 消失時，長笑聲跟著淡掉）
  function fadeOut(sourceKey, sec = 0.5) {
    for (const h of [...(playingByKey.get(sourceKey) || [])]) {
      if (h.src) {
        const t = ctx.currentTime;
        h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.linearRampToValueAtTime(0, t + sec);
        try { h.src.stop(t + sec + 0.02); } catch (_) {}
      } else if (h.audio) {
        const a = h.audio, v0 = a.volume, t0 = performance.now();
        const step = () => { const p = (performance.now() - t0) / (sec * 1000); if (p >= 1) { a.pause(); a.dispatchEvent(new Event('ended')); return; } a.volume = v0 * (1 - p); requestAnimationFrame(step); };
        step();
      }
    }
  }
  return {
    play,
    fadeOut,
    unlock,   // 劇情播放時輸入被擋住，由 js/story-scene.js 代為喚醒
    GAIN_KEY,
    FILE_KEY,
    gainOf: name => SOUND_GAIN[name] ?? 1,                 // 某個音效目前的音量倍率
    setGains(map) { SOUND_GAIN = { ...(map || {}) }; },    // 音效編輯器即時套用
    setFiles(config) {
      const next = { ...baseFiles, ...((config || {}).overrides || {}), ...((config || {}).extras || {}) };
      Object.keys(files).forEach(name => { delete files[name]; delete buffers[name]; });
      Object.assign(files, next); preload();
    },
    defaultFiles: () => ({ ...baseFiles }),
    // 所有音效：有音檔的（file）與程式合成的（file: null）
    list: () => [...Object.keys(files).map(name => ({ name, file: files[name] })),
                 ...Object.keys(sounds).filter(name => !files[name]).map(name => ({ name, file: null }))],
    get enabled() { return enabled; }, set enabled(v) {
      enabled = v;
      if (!v) {
        activeAudio.forEach((_, audio) => audio.pause()); activeAudio.clear();
        activeSources.forEach(src => { try { src.stop(); } catch (_) {} }); activeSources.clear();
      }
    },
    get volume() { return volume; },
    set volume(v) { volume = v; if (master) master.gain.value = v; activeAudio.forEach((gain, audio) => { audio.volume = Math.min(1, v * gain); }); },
  };
})();
function sfx(name) {
  if (typeof UIFeedback !== 'undefined' && UIFeedback.intercept(name)) return;
  SFX.play(name);
}
// 角色發出的聲音：靠近玩家最清楚，超過 16 格逐漸淡出。
function sfxAt(name, x, y, baseGain = 0.4, sourceId = '') {
  const player = typeof G !== 'undefined' && G && G.player;
  if (!player) return;
  const cell = typeof CELL !== 'undefined' ? CELL : 40;
  const distance = Math.hypot(x - player.x, y - player.y) / cell;
  const distanceGain = distance <= 2 ? 1 : Math.max(0, (16 - distance) / 14);
  if (distanceGain > 0) SFX.play(name, baseGain * distanceGain, sourceId ? name + ':' + sourceId : name);
}

// M 鍵：靜音開關
window.addEventListener('keydown', e => {
  if (!e.repeat && e.key.toLowerCase() === 'm') {
    SFX.enabled = !SFX.enabled;
    if (typeof flash === 'function' && typeof G !== 'undefined' && G && G.player)
      flash(SFX.enabled ? '🔊 音效開' : '🔇 音效關', G.player.x, G.player.y - 40, '#8fd3ff');
  }
});
