/* ===== Y102隊員技能樹的內容（由「🧑‍🚀 Y102隊員裝備／技能編輯器」匯出，整段覆蓋即可）=====
   members：隊員 id → 技能格 id → { name：名稱, desc：技能描述, effect：技能效果（顯示的數值文字）, note：補充說明（顯示在效果下面）, icon：圖示（emoji 或圖片路徑）, cost：要花幾個異質碎片, mods：實際改的數值 }
   技能格 id：trait-1（普通技能 Lv1＝原本的特性）、trait-2（Lv2）、a-1／a-2（A 系列－生存）、core-1～3（核心技能）、ult（終極核心大招）、b-1／b-2（B 系列－攻擊）、aux-1／aux-2（輔助技能）
   mods：{ path: 數值名稱, mul: 乘多少 } 或 { path, add: 加多少 }（數值名稱見 js/skills.js 開頭）
   這裡沒寫的隊員／格子，會從 data/skills.js（舊版技能資料）自動換算。 */
const SQUAD_SKILLS = {
  "members": {
    "colyn": {
      "trait-1": {
        "name": "特性",
        "desc": "單體攻擊；長劍快攻，吸引附近異質體的仇恨。",
        "effect": "初始技能",
        "icon": "",
        "mods": [],
        "cost": 0,
        "note": "被動「劍舞架勢」： 怪物打柯林有 30% 會打空；溫特在他 7 格內時，怪物打溫特有 20% 會打空。\n大招「突擊連刺」： 每 8 秒蓄力一次，在 0.5 秒內連刺 3 下（每下 20 傷害，整招 1 秒）。從第一刺起讓目標破甲 3 秒，受到所有人的傷害 +10%。"
      },
      "trait-2": {
        "name": "劍舞架勢・二段",
        "desc": "步伐更輕盈。",
        "effect": "自己被打空的機率 +10%（共 40%）",
        "icon": "",
        "mods": [
          {
            "path": "parry.self",
            "add": 0.1
          }
        ]
      },
      "a-1": {
        "name": "吃飽有力",
        "desc": "很會吃的身體很耐操。",
        "effect": "最大 HP +15%",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "mul": 1.15
          }
        ]
      },
      "a-2": {
        "name": "格擋",
        "desc": "用劍身擋開攻擊。",
        "effect": "受到的傷害再減少 10%",
        "icon": "",
        "mods": [
          {
            "path": "defense",
            "add": 0.1
          }
        ]
      },
      "core-1": {
        "name": "護衛之劍",
        "desc": "把溫特護在劍圈裡。",
        "effect": "溫特被打空的機率 +10%（共 30%）",
        "icon": "",
        "mods": [
          {
            "path": "parry.guard",
            "add": 0.1
          }
        ]
      },
      "core-2": {
        "name": "寬廣劍圈",
        "desc": "守護的範圍更大。",
        "effect": "保護溫特的範圍 +2 格，嘲諷範圍 +0.5 格",
        "icon": "",
        "mods": [
          {
            "path": "parry.guardRange",
            "add": 2
          },
          {
            "path": "taunt",
            "add": 0.5
          }
        ]
      },
      "core-3": {
        "name": "見切",
        "desc": "看穿每一次攻擊。",
        "effect": "自己被打空的機率再 +10%（共 50%），大招冷卻 −10%",
        "icon": "",
        "mods": [
          {
            "path": "parry.self",
            "add": 0.1
          },
          {
            "path": "ultCdCut",
            "add": 0.1
          }
        ]
      },
      "ult": {
        "name": "突擊連刺・流星",
        "desc": "連刺的節奏快到看不清。",
        "effect": "大招冷卻 −30%",
        "icon": "",
        "mods": [
          {
            "path": "ultCdCut",
            "add": 0.3
          }
        ]
      },
      "b-1": {
        "name": "快劍",
        "desc": "出劍更快。",
        "effect": "攻擊速度 +15%",
        "icon": "",
        "mods": [
          {
            "path": "rate",
            "mul": 1.15
          }
        ]
      },
      "b-2": {
        "name": "重刺",
        "desc": "每一劍都刺得更深。",
        "effect": "攻擊力 +30%",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.3
          }
        ]
      },
      "aux-1": {
        "name": "精神飽滿",
        "desc": "永遠活力滿滿。",
        "effect": "移動速度 +10%",
        "icon": "",
        "mods": [
          {
            "path": "walkSpeed",
            "mul": 1.1
          }
        ]
      },
      "aux-2": {
        "name": "飯後好心情",
        "desc": "吃飽了，心情就穩。",
        "effect": "精神負荷每秒恢復 +0.3",
        "icon": "",
        "mods": [
          {
            "path": "taintRegen",
            "add": 0.3
          }
        ]
      }
    },
    "avaren": {
      "trait-1": {
        "name": "特性",
        "desc": "範圍攻擊，不主動吸引仇恨。",
        "effect": "初始技能",
        "note": "被動「蝕心毒霧」：腐蝕使異質體混亂 3 秒並攻擊同類。\n大招「腐蝕綻放」：每 10 秒放出一次大範圍腐蝕（傷害 2.3 倍，範圍 2.8 格）。",
        "icon": "",
        "mods": [],
        "cost": 0
      },
      "trait-2": {
        "name": "侵蝕神智",
        "desc": "腐蝕直接侵入異質體的意識。",
        "effect": "混亂時間 +1 秒",
        "icon": "",
        "mods": [
          {
            "path": "confuse",
            "add": 1
          }
        ]
      },
      "a-1": {
        "name": "戒備",
        "desc": "永遠留一分注意力在自己身上。",
        "effect": "受到的傷害再減少 6%",
        "icon": "",
        "mods": [
          {
            "path": "defense",
            "add": 0.06
          }
        ]
      },
      "a-2": {
        "name": "隱匿",
        "desc": "安靜地移動，不讓敵人盯上。",
        "effect": "最大 HP +15%，移動速度 +15%",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "mul": 1.15
          },
          {
            "path": "walkSpeed",
            "mul": 1.15
          }
        ]
      },
      "core-1": {
        "name": "腐蝕擴散",
        "desc": "毒霧擴散得更開。",
        "effect": "腐蝕範圍 +0.3 格",
        "icon": "",
        "mods": [
          {
            "path": "splash",
            "add": 0.3
          }
        ]
      },
      "core-2": {
        "name": "同類相殘",
        "desc": "讓異質體自相殘殺得更久。",
        "effect": "混亂時間再 +1 秒",
        "icon": "",
        "mods": [
          {
            "path": "confuse",
            "add": 1
          }
        ]
      },
      "core-3": {
        "name": "劇毒",
        "desc": "腐蝕濃到連外殼都會融。",
        "effect": "攻擊力 +10%，腐蝕範圍再 +0.3 格",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.1
          },
          {
            "path": "splash",
            "add": 0.3
          }
        ]
      },
      "ult": {
        "name": "腐蝕綻放・腐蝕領域",
        "desc": "整片區域都成了他的領域。",
        "effect": "大招傷害 +30%，大招冷卻 −20%",
        "icon": "",
        "mods": [
          {
            "path": "ultDmgBonus",
            "add": 0.3
          },
          {
            "path": "ultCdCut",
            "add": 0.2
          }
        ]
      },
      "b-1": {
        "name": "致命刺擊",
        "desc": "找到最脆弱的地方。",
        "effect": "攻擊力 +8%",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.08
          }
        ]
      },
      "b-2": {
        "name": "連續侵蝕",
        "desc": "一波接一波。",
        "effect": "攻擊速度 +15%，攻擊力 +8%",
        "icon": "",
        "mods": [
          {
            "path": "rate",
            "mul": 1.15
          },
          {
            "path": "dmg",
            "mul": 1.08
          }
        ]
      },
      "aux-1": {
        "name": "安心的距離",
        "desc": "知道艾德林在附近，心就穩下來。",
        "effect": "每次攻擊增加的精神負荷 −30%",
        "icon": "",
        "mods": [
          {
            "path": "taint",
            "mul": 0.7
          }
        ]
      },
      "aux-2": {
        "name": "伸長的毒手",
        "desc": "腐蝕能觸及更遠的地方。",
        "effect": "射程 +0.5 格",
        "icon": "",
        "mods": [
          {
            "path": "range",
            "add": 0.5
          }
        ]
      }
    },
    "theonie": {
      "trait-1": {
        "name": "特性",
        "desc": "單體攻擊。使目標燒傷 5 秒，每秒受到一次傷害。",
        "effect": "初始技能",
        "note": "被動「餘燼烙印」：使目標燒傷 5 秒，每秒受到一次傷害。\n大招「烈焰新星」：每 8 秒放出一次大範圍爆炎（傷害 2.6 倍，範圍 2.2 格）",
        "icon": "",
        "mods": [],
        "cost": 0
      },
      "trait-2": {
        "name": "灼痕加深",
        "desc": "火焰燒得更久，目標很難甩掉。",
        "effect": "燃燒時間 +2 秒",
        "icon": "",
        "mods": [
          {
            "path": "burn.duration",
            "add": 2
          }
        ]
      },
      "a-1": {
        "name": "耐熱體質",
        "desc": "習慣高溫的身體，撐得比看起來久。",
        "effect": "最大 HP +15%",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "mul": 1.15
          }
        ]
      },
      "a-2": {
        "name": "冷靜呼吸",
        "desc": "學著放慢節奏，不讓自信變成負擔。",
        "effect": "每次攻擊增加的精神負荷 −25%，受到的傷害再減少 5%",
        "icon": "",
        "mods": [
          {
            "path": "taint",
            "mul": 0.75
          },
          {
            "path": "defense",
            "add": 0.05
          }
        ]
      },
      "core-1": {
        "name": "烈焰",
        "desc": "火勢更猛，燒傷每一跳都更痛。",
        "effect": "燃燒每秒傷害 +3",
        "icon": "",
        "mods": [
          {
            "path": "burn.damage",
            "add": 3
          }
        ]
      },
      "core-2": {
        "name": "助燃",
        "desc": "對準要害點火。",
        "effect": "攻擊力 +10%，燃燒每秒傷害再 +2",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.1
          },
          {
            "path": "burn.damage",
            "add": 2
          }
        ]
      },
      "core-3": {
        "name": "業火",
        "desc": "火焰幾乎不會熄滅。",
        "effect": "燃燒時間再 +3 秒，大招冷卻 −10%",
        "icon": "",
        "mods": [
          {
            "path": "burn.duration",
            "add": 3
          },
          {
            "path": "ultCdCut",
            "add": 0.1
          }
        ]
      },
      "ult": {
        "name": "烈焰新星・焚天",
        "desc": "把「烈焰新星」推到極限。",
        "effect": "大招傷害 +35%，大招冷卻 −20%",
        "icon": "",
        "mods": [
          {
            "path": "ultDmgBonus",
            "add": 0.35
          },
          {
            "path": "ultCdCut",
            "add": 0.2
          }
        ]
      },
      "b-1": {
        "name": "精準點火",
        "desc": "鎖定目標後才出手。",
        "effect": "攻擊力 +10%",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.1
          }
        ]
      },
      "b-2": {
        "name": "遠程壓制",
        "desc": "站得更遠，打得更狠。",
        "effect": "攻擊力 +15%，射程 +1 格",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.15
          },
          {
            "path": "range",
            "add": 1
          }
        ]
      },
      "aux-1": {
        "name": "天才的節奏",
        "desc": "出手越來越流暢。",
        "effect": "攻擊速度 +10%",
        "icon": "",
        "mods": [
          {
            "path": "rate",
            "mul": 1.1
          }
        ]
      },
      "aux-2": {
        "name": "火光引路",
        "desc": "火光讓她更早發現敵人。",
        "effect": "發現敵人的距離 +2 格",
        "icon": "",
        "mods": [
          {
            "path": "aggroRange",
            "add": 2
          }
        ]
      }
    },
    "red": {
      "trait-1": {
        "name": "特性",
        "desc": "範圍攻擊；吸引異質體仇恨，並持續恢復生命與精神負荷。",
        "effect": "初始技能",
        "note": "被動「鐵壁守護」：吸引異質體仇恨，並持續恢復生命與精神負荷。\n大招「盾擊衝鋒」：每 10 秒用盾牌衝撞周圍 2.8 格（傷害 2.2 倍），擊退 1.6 格，自己恢復 40 HP、降低 40 精神負荷。",
        "icon": "",
        "mods": [],
        "cost": 0
      },
      "trait-2": {
        "name": "再生",
        "desc": "傷口好得更快。",
        "effect": "每秒回復 HP +2",
        "icon": "",
        "mods": [
          {
            "path": "hpRegen",
            "add": 2
          }
        ]
      },
      "a-1": {
        "name": "隊長的體格",
        "desc": "站在最前面的本錢。",
        "effect": "最大 HP +15%",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "mul": 1.15
          }
        ]
      },
      "a-2": {
        "name": "鋼鐵意志",
        "desc": "不管多痛都不退。",
        "effect": "受到的傷害再減少 8%，每秒回復 HP 再 +2",
        "icon": "",
        "mods": [
          {
            "path": "defense",
            "add": 0.08
          },
          {
            "path": "hpRegen",
            "add": 2
          }
        ]
      },
      "core-1": {
        "name": "挑釁",
        "desc": "大聲把怪物都叫過來。",
        "effect": "嘲諷範圍 +1 格",
        "icon": "",
        "mods": [
          {
            "path": "taunt",
            "add": 1
          }
        ]
      },
      "core-2": {
        "name": "堅盾",
        "desc": "盾牌舉得更穩。",
        "effect": "受到的傷害再減少 7%",
        "icon": "",
        "mods": [
          {
            "path": "defense",
            "add": 0.07
          }
        ]
      },
      "core-3": {
        "name": "穩住陣腳",
        "desc": "越打越冷靜。",
        "effect": "精神負荷每秒恢復 +0.5，嘲諷範圍再 +0.5 格",
        "icon": "",
        "mods": [
          {
            "path": "taintRegen",
            "add": 0.5
          },
          {
            "path": "taunt",
            "add": 0.5
          }
        ]
      },
      "ult": {
        "name": "盾擊衝鋒・不倒之盾",
        "desc": "把全隊的危險撞回去。",
        "effect": "大招傷害 +25%，大招冷卻 −30%",
        "icon": "",
        "mods": [
          {
            "path": "ultDmgBonus",
            "add": 0.25
          },
          {
            "path": "ultCdCut",
            "add": 0.3
          }
        ]
      },
      "b-1": {
        "name": "盾緣打擊",
        "desc": "用盾牌邊緣反擊。",
        "effect": "攻擊力 +15%",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.15
          }
        ]
      },
      "b-2": {
        "name": "重盾橫掃",
        "desc": "一揮掃開一片。",
        "effect": "攻擊力 +20%，攻擊範圍 +0.3 格",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.2
          },
          {
            "path": "splash",
            "add": 0.3
          }
        ]
      },
      "aux-1": {
        "name": "可靠的背影",
        "desc": "跟上隊伍的腳步。",
        "effect": "移動速度 +10%",
        "icon": "",
        "mods": [
          {
            "path": "walkSpeed",
            "mul": 1.1
          }
        ]
      },
      "aux-2": {
        "name": "不用一個人扛",
        "desc": "學著讓隊友分擔，自己也輕鬆一點。",
        "effect": "每次攻擊增加的精神負荷 −25%",
        "icon": "",
        "mods": [
          {
            "path": "taint",
            "mul": 0.75
          }
        ]
      }
    },
    "amber": {
      "trait-1": {
        "name": "特性",
        "desc": "範圍攻擊；在小片區域降下雷電，使異質體顫抖並停止 2 秒。",
        "effect": "初始技能",
        "note": "被動「靜電麻痺」：在小片區域降下雷電，使異質體顫抖並停止 2 秒。\n大招「天雷落」：每 9 秒降下一次大片落雷（傷害 2.6 倍，範圍 2.4 格）。",
        "icon": "",
        "mods": [],
        "cost": 0
      },
      "trait-2": {
        "name": "麻痺延長",
        "desc": "照著教範反覆練習，雷擊控得更久。",
        "effect": "麻痺時間 +0.5 秒",
        "icon": "",
        "mods": [
          {
            "path": "stun",
            "add": 0.5
          }
        ]
      },
      "a-1": {
        "name": "基礎體能",
        "desc": "實習課表裡最紮實的一項。",
        "effect": "最大 HP +15%",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "mul": 1.15
          }
        ]
      },
      "a-2": {
        "name": "避雷針",
        "desc": "學會把多餘的電流導開。",
        "effect": "受到的傷害再減少 10%，最大 HP +10%",
        "icon": "",
        "mods": [
          {
            "path": "defense",
            "add": 0.1
          },
          {
            "path": "hp",
            "mul": 1.1
          }
        ]
      },
      "core-1": {
        "name": "瞄準守則",
        "desc": "一步一步照規矩瞄準。",
        "effect": "命中率 +15%",
        "icon": "",
        "mods": [
          {
            "path": "accuracy",
            "add": 0.15
          }
        ]
      },
      "core-2": {
        "name": "落雷範圍",
        "desc": "雷電涵蓋的範圍更大。",
        "effect": "雷擊範圍 +0.4 格",
        "icon": "",
        "mods": [
          {
            "path": "splash",
            "add": 0.4
          }
        ]
      },
      "core-3": {
        "name": "精準雷擊",
        "desc": "終於能把雷打在想打的地方。",
        "effect": "命中率再 +15%，麻痺時間再 +0.5 秒",
        "icon": "",
        "mods": [
          {
            "path": "accuracy",
            "add": 0.15
          },
          {
            "path": "stun",
            "add": 0.5
          }
        ]
      },
      "ult": {
        "name": "天雷落・雷神降臨",
        "desc": "實習生的全力一擊。",
        "effect": "大招傷害 +40%，大招冷卻 −20%",
        "icon": "",
        "mods": [
          {
            "path": "ultDmgBonus",
            "add": 0.4
          },
          {
            "path": "ultCdCut",
            "add": 0.2
          }
        ]
      },
      "b-1": {
        "name": "加壓電流",
        "desc": "電壓再調高一格。",
        "effect": "攻擊力 +15%",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.15
          }
        ]
      },
      "b-2": {
        "name": "雷霆萬鈞",
        "desc": "雷擊又重又廣。",
        "effect": "攻擊力 +20%，雷擊範圍 +0.3 格",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.2
          },
          {
            "path": "splash",
            "add": 0.3
          }
        ]
      },
      "aux-1": {
        "name": "規律作息",
        "desc": "守規矩的人，精神也穩。",
        "effect": "每次攻擊增加的精神負荷 −20%",
        "icon": "",
        "mods": [
          {
            "path": "taint",
            "mul": 0.8
          }
        ]
      },
      "aux-2": {
        "name": "快速充能",
        "desc": "充電的空檔變短。",
        "effect": "攻擊速度 +15%",
        "icon": "",
        "mods": [
          {
            "path": "rate",
            "mul": 1.15
          }
        ]
      }
    },
    "luther": {
      "trait-1": {
        "name": "特性",
        "desc": "範圍攻擊；吸引異質體仇恨，擊退 1 格並使其停止 1 秒。",
        "effect": "初始技能",
        "note": "被動「狂怒之血」：汙染值越高攻擊力越高（汙染 100 時為 2 倍），瀕臨暴走也不會自動撤退。\n大招「崩地重擊」：每 11 秒重擊周圍 3 格（傷害 3 倍），擊退 0.8 格並暈眩 2.5 秒。",
        "icon": "",
        "mods": [],
        "cost": 0
      },
      "trait-2": {
        "name": "震退",
        "desc": "一拳把怪物打得更遠。",
        "effect": "擊退距離 +0.5 格",
        "icon": "",
        "mods": [
          {
            "path": "knockback",
            "add": 0.5
          }
        ]
      },
      "a-1": {
        "name": "硬骨頭",
        "desc": "比外表還耐打。",
        "effect": "最大 HP +15%",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "mul": 1.15
          }
        ]
      },
      "a-2": {
        "name": "硬漢",
        "desc": "咬緊牙關硬撐。",
        "effect": "受到的傷害再減少 10%，最大 HP +10%",
        "icon": "",
        "mods": [
          {
            "path": "defense",
            "add": 0.1
          },
          {
            "path": "hp",
            "mul": 1.1
          }
        ]
      },
      "core-1": {
        "name": "重擊暈眩",
        "desc": "打得怪物站不穩。",
        "effect": "停住時間 +0.5 秒",
        "icon": "",
        "mods": [
          {
            "path": "stun",
            "add": 0.5
          }
        ]
      },
      "core-2": {
        "name": "狂暴",
        "desc": "負荷越重，力氣越大。",
        "effect": "汙染加成再 +30%（汙染 100 時為 2.3 倍）",
        "icon": "",
        "mods": [
          {
            "path": "rageDmg",
            "add": 0.3
          }
        ]
      },
      "core-3": {
        "name": "守住身邊的人",
        "desc": "默默把怪物拉到自己這裡。",
        "effect": "嘲諷範圍 +1 格，擊退距離再 +0.3 格",
        "icon": "",
        "mods": [
          {
            "path": "taunt",
            "add": 1
          },
          {
            "path": "knockback",
            "add": 0.3
          }
        ]
      },
      "ult": {
        "name": "崩地重擊・崩山",
        "desc": "連地面都打碎。",
        "effect": "大招傷害 +40%，大招冷卻 −15%",
        "icon": "",
        "mods": [
          {
            "path": "ultDmgBonus",
            "add": 0.4
          },
          {
            "path": "ultCdCut",
            "add": 0.15
          }
        ]
      },
      "b-1": {
        "name": "怪力",
        "desc": "全身的力氣灌進拳頭。",
        "effect": "攻擊力 +12%",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.12
          }
        ]
      },
      "b-2": {
        "name": "破壞拳",
        "desc": "一拳到底。",
        "effect": "攻擊力 +20%，攻擊範圍 +0.3 格",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.2
          },
          {
            "path": "splash",
            "add": 0.3
          }
        ]
      },
      "aux-1": {
        "name": "沉默的步伐",
        "desc": "不多話，只是走得更快。",
        "effect": "移動速度 +10%",
        "icon": "",
        "mods": [
          {
            "path": "walkSpeed",
            "mul": 1.1
          }
        ]
      },
      "aux-2": {
        "name": "壓抑",
        "desc": "把怒氣收好一點。",
        "effect": "每次攻擊增加的精神負荷 −20%",
        "icon": "",
        "mods": [
          {
            "path": "taint",
            "mul": 0.8
          }
        ]
      }
    },
    "tino": {
      "trait-1": {
        "name": "特性",
        "desc": "單體攻擊；感官敏銳，讓玩家看見他周圍 20 格內、黑暗中的怪物。",
        "effect": "初始技能",
        "note": "被動「夜視感知」：讓玩家看見他周圍 20 格內、\n黑暗中的怪物（其他哨兵仍只攻擊亮處的目標）。\n沒有大招。",
        "icon": "",
        "mods": [],
        "cost": 0
      },
      "trait-2": {
        "name": "遠距感知",
        "desc": "感知範圍擴大。",
        "effect": "感知範圍 +5 格",
        "icon": "",
        "mods": [
          {
            "path": "sense",
            "add": 5
          }
        ]
      },
      "a-1": {
        "name": "閃身",
        "desc": "反應快，閃得快。",
        "effect": "受到的傷害再減少 6%",
        "icon": "",
        "mods": [
          {
            "path": "defense",
            "add": 0.06
          }
        ]
      },
      "a-2": {
        "name": "靈敏",
        "desc": "跑得快，也撐得久一點。",
        "effect": "最大 HP +20%，移動速度 +15%",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "mul": 1.2
          },
          {
            "path": "walkSpeed",
            "mul": 1.15
          }
        ]
      },
      "core-1": {
        "name": "鷹眼",
        "desc": "看得清，打得準。",
        "effect": "射程 +1 格",
        "icon": "",
        "mods": [
          {
            "path": "range",
            "add": 1
          }
        ]
      },
      "core-2": {
        "name": "全域感知",
        "desc": "幾乎整張地圖都在他的感覺裡。",
        "effect": "感知範圍再 +10 格",
        "icon": "",
        "mods": [
          {
            "path": "sense",
            "add": 10
          }
        ]
      },
      "core-3": {
        "name": "弱點看穿",
        "desc": "一眼看出怪物的破綻。",
        "effect": "攻擊力 +15%，命中率 +5%",
        "icon": "",
        "mods": [
          {
            "path": "dmg",
            "mul": 1.15
          },
          {
            "path": "accuracy",
            "add": 0.05
          }
        ]
      },
      "ult": {
        "name": "夜之眼",
        "desc": "沒有大招；感官全開的終極被動。",
        "effect": "感知範圍再 +10 格，攻擊力 +15%，攻擊速度 +10%",
        "icon": "",
        "mods": [
          {
            "path": "sense",
            "add": 10
          },
          {
            "path": "dmg",
            "mul": 1.15
          },
          {
            "path": "rate",
            "mul": 1.1
          }
        ]
      },
      "b-1": {
        "name": "速射",
        "desc": "手比腦袋還快。",
        "effect": "攻擊速度 +15%",
        "icon": "",
        "mods": [
          {
            "path": "rate",
            "mul": 1.15
          }
        ]
      },
      "b-2": {
        "name": "連射",
        "desc": "壓低槍口連續射擊。",
        "effect": "攻擊速度 +15%，攻擊力 +10%",
        "icon": "",
        "mods": [
          {
            "path": "rate",
            "mul": 1.15
          },
          {
            "path": "dmg",
            "mul": 1.1
          }
        ]
      },
      "aux-1": {
        "name": "先一步發現",
        "desc": "比誰都早注意到敵人。",
        "effect": "發現敵人的距離 +3 格",
        "icon": "",
        "mods": [
          {
            "path": "aggroRange",
            "add": 3
          }
        ]
      },
      "aux-2": {
        "name": "年輕的恢復力",
        "desc": "睡一覺就好了。",
        "effect": "精神負荷每秒恢復 +0.3",
        "icon": "",
        "mods": [
          {
            "path": "taintRegen",
            "add": 0.3
          }
        ]
      }
    },
    "eldrin": {
      "trait-1": {
        "name": "特性",
        "desc": "無精神負荷；恢復附近哨兵的生命與精神負荷，遇敵時保持距離。",
        "effect": "初始技能",
        "note": "被動「溫柔疏導」：每 3 秒為 2.8 格內的隊員降低約 30 汙染、恢復約 18 HP；遇敵時保持 3 格距離。\n沒有大招。",
        "icon": "",
        "mods": [],
        "cost": 0
      }
    },
    "chris": {
      "trait-1": {
        "name": "特性",
        "desc": "無精神負荷；恢復附近哨兵的生命與精神負荷，遇敵時保持距離。",
        "effect": "初始技能",
        "note": "被動「戰地疏導」：每 3 秒為 2.5 格內的隊員降低約 18 汙染、恢復約 12 HP；遇敵時保持 3.5 格距離。\n沒有大招。",
        "icon": "",
        "mods": [],
        "cost": 0
      }
    },
    "taana": {
      "trait-1": {
        "name": "特性",
        "desc": "不攻擊、無精神負荷；恢復附近哨兵的生命與精神負荷，\n遇敵時保持距離。",
        "effect": "初始技能",
        "note": "被動「安眠光環」：每 3 秒為 3 格內的隊員降低 26 汙染、恢復 13 HP；平時跟在需要照顧的哨兵身邊。\n沒有大招。",
        "icon": "",
        "mods": [],
        "cost": 0
      }
    }
  }
};
