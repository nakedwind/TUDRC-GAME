/* ===== 嚮導（艾德林、克莉思、塔納）的技能樹 =====
   嚮導的技能樹只有 8 格（js/skills.js 的 GUIDE_SKILL_LAYOUT），免得嚮導跟哨兵一樣強：
     普通技能 Lv1（特性）→ Lv2 → 上：A 系列－輔助（回復）／下：B 系列－增益（幫隊友加 BUFF）
     → 核心技能（A1、B1 學其中一個就能學）→ 終極核心大招；右下兩格＝永久 +20 HP、+20 SP

   GUIDE_SKILLS：會自己發動的技能（戰鬥中自動放，js/guide-skills.js 執行）
     when：什麼時候發動
       'hpBelow'＝有隊友 HP 低於 at（0.5＝50%）
       'taintAbove'＝有隊友負荷高於 at（負荷滿是 100）；orBerserk: true＝有人暴走也算
       'combat'＝嚮導附近 8 格內有怪物（戰鬥中）
     heal：全隊回幾 HP　soothe：全隊降幾負荷　one: true＝只幫最需要的那一個人（不是全隊）
     wake: true＝暴走的隊員立刻清醒
     buff：全隊加多少（atk 攻擊力、def 防禦率、spd 攻擊速度；0.15＝+15%），time：加幾秒
     cast：詠唱幾秒（期間嚮導站著不動、不攻擊、不做一般疏導；被打暈就取消，不扣 SP）
     sp：花多少 SP（詠唱完才扣；SP 不夠就不會發動）　cd：冷卻幾秒（放完才開始算）
     「全隊」＝場上所有活著的隊友（包含嚮導自己），不限距離

   GUIDE_SKILL_TEXTS：技能樹上顯示的名稱、說明，和不會自己發動的技能（mods：直接改數值）
     「Y102隊員裝備／技能編輯器」改過、存過的格子會用編輯器的（data/squad-skills.js），這裡就只是預設
     會自己發動的那幾格（上面 GUIDE_SKILLS 有的）：effect、note 留空白＝依數字自動產生文字（js/squad-gear.js 的 guideActiveTexts）

   ★ 想改數字：用「Y102隊員裝備／技能編輯器」→ 技能內容 → 選嚮導、選格子 →「自動發動的技能」，
     改完存到專案就好（存在 data/squad-skills.js 的 active，會蓋過這裡的預設） */
const GUIDE_SKILLS = {
  eldrin: {
    'a-1': { when: 'hpBelow', at: .5, heal: 15, cast: 2.5, sp: 10, cd: 20 },                    // 群體補血
    'b-1': { when: 'combat', buff: { def: .15 }, time: 5, cd: 30 },                             // 守護祝福：防禦率
    'ult': { when: 'hpBelow', at: .35, heal: 40, cast: 3, sp: 20, cd: 60 },                     // 生命之泉
  },
  taana: {
    'a-1': { when: 'taintAbove', at: 50, soothe: 15, cast: 2.5, sp: 15, cd: 20 },              // 群體疏導
    'b-1': { when: 'combat', buff: { spd: .15 }, time: 5, cd: 30 },                             // 輕快節拍：攻擊速度
    'ult': { when: 'taintAbove', at: 70, orBerserk: true, soothe: 35, wake: true, cast: 3, sp: 20, cd: 60 },   // 深眠搖籃
  },
  chris: {
    'a-1': { when: 'taintAbove', at: 70, soothe: 25, one: true, cast: 0, sp: 10, cd: 25 },     // 緊急疏導
    'b-1': { when: 'combat', buff: { atk: .15 }, time: 5, cd: 30 },                             // 火力支援：攻擊力
    'ult': { when: 'combat', buff: { atk: .15, spd: .15 }, time: 8, cd: 60 },                   // 戰術指揮
  },
};

// 三位嚮導一樣的格子：普通技能 Lv2、右下兩格（永久 +20 HP、+20 SP）
const GUIDE_SKILL_COMMON = {
  'trait-2': { name: '疏導熟練', desc: '疏導的手法更熟練了。', effect: '疏導量 +1／秒', icon: '', mods: [{ path: 'aura.rate', add: 1 }] },
  'aux-1': { name: '體能鍛鍊', desc: '永久被動技能。', effect: '最大 HP +20', icon: '', mods: [{ path: 'hp', add: 20 }] },
  'aux-2': { name: '精神鍛鍊', desc: '永久被動技能。', effect: 'SP 上限 +20', icon: '', mods: [{ path: 'spMax', add: 20 }] },
};
const GUIDE_SKILL_TEXTS = {
  eldrin: {
    ...GUIDE_SKILL_COMMON,
    'a-1': { name: '群體補血', desc: '為全隊送上溫柔的治癒。', effect: '', note: '', icon: '', mods: [] },
    'b-1': { name: '守護祝福', desc: '讓隊友更能撐住攻擊。', effect: '', note: '', icon: '', mods: [] },
    'core-1': { name: '細心照護', desc: '把照顧的範圍再放大一點。', effect: '疏導光環範圍 +0.5 格', icon: '', mods: [{ path: 'aura.r', add: .5 }] },
    'ult': { name: '生命之泉', desc: '危急時刻，為全隊注入大量生命力。', effect: '', note: '', icon: '', mods: [] },
  },
  taana: {
    ...GUIDE_SKILL_COMMON,
    'a-1': { name: '群體疏導', desc: '一口氣安撫全隊的精神。', effect: '', note: '', icon: '', mods: [] },
    'b-1': { name: '輕快節拍', desc: '讓隊友的動作更俐落。', effect: '', note: '', icon: '', mods: [] },
    'core-1': { name: '熟睡守護', desc: '不攻擊的她，更懂得照顧好自己。', effect: '每秒回復 HP +1', icon: '', mods: [{ path: 'hpRegen', add: 1 }] },
    'ult': { name: '深眠搖籃', desc: '讓失控邊緣的隊友沉沉睡去、重新清醒。', effect: '', note: '', icon: '', mods: [] },
  },
  chris: {
    ...GUIDE_SKILL_COMMON,
    'a-1': { name: '緊急疏導', desc: '邊打邊顧，搶先穩住快失控的人。', effect: '', note: '', icon: '', mods: [] },
    'b-1': { name: '火力支援', desc: '指揮隊友集中火力。', effect: '', note: '', icon: '', mods: [] },
    'core-1': { name: '省力疏導', desc: '用最少的力氣做好疏導。', effect: '一般疏導少花 20% SP', icon: '', mods: [{ path: 'spCostCut', add: .2 }] },
    'ult': { name: '戰術指揮', desc: '戰場指揮全開，全隊火力全面提升。', effect: '', note: '', icon: '', mods: [] },
  },
};
