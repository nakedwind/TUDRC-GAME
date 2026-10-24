/* ===== Y102隊員技能樹的內容（由「🧑‍🚀 Y102隊員裝備／技能編輯器」匯出，整段覆蓋即可）=====
   members：隊員 id → 技能格 id → { name：名稱, desc：技能描述, effect：技能效果（顯示的數值文字）, effect2：技能效果 2（第二段亮綠色字）, note：補充說明（顯示在效果下面）, icon：圖示（emoji 或圖片路徑）, cost：要花幾個異質碎片, mods：實際改的數值, active：嚮導會自己發動的技能（數字說明見 data/guide-skills.js） }
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
        "name": "劍舞架勢．二段",
        "desc": "步伐更輕盈。",
        "effect": "自己被打空的機率 +10%",
        "icon": "",
        "mods": [
          {
            "path": "parry.self",
            "add": 0.1
          }
        ],
        "effect2": "",
        "note": ""
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
        ],
        "note": "吃飽了特別有力氣，HP 上限提升。"
      },
      "a-2": {
        "name": "格擋",
        "desc": "用劍身擋開攻擊。",
        "effect": "受到的傷害減少 10%",
        "icon": "",
        "mods": [
          {
            "path": "defense",
            "add": 0.1
          }
        ],
        "note": "用劍擋下攻擊，受到的傷害減少。"
      },
      "core-1": {
        "name": "護衛之劍",
        "desc": "把溫特護在劍圈裡。",
        "effect": "溫特被打空的機率 +10%",
        "icon": "",
        "mods": [
          {
            "path": "parry.guard",
            "add": 0.1
          }
        ],
        "note": "守在溫特身邊時，怪物打溫特更容易打空。"
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
        ],
        "note": "能保護溫特的範圍變大，吸引仇恨的範圍也擴大。"
      },
      "core-3": {
        "name": "見切",
        "desc": "看穿每一次攻擊。",
        "effect": "自己被打空的機率再 +10%，大招冷卻 −10%",
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
        ],
        "note": "看穿攻擊的時機：自己更容易閃過攻擊，大招也更快準備好。"
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
        ],
        "note": "強化大招「突擊連刺」：放得更頻繁。"
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
        ],
        "note": "出劍更快，攻擊速度提升。"
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
        ],
        "note": "每一刺都更深，攻擊力大幅提升。"
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
        ],
        "note": "精神好、腳步輕，移動速度變快。"
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
        ],
        "note": "吃飽心情好，精神負荷恢復得更快。"
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
        ],
        "note": "「蝕心毒霧」讓異質體混亂得更久，互相攻擊的時間更長。"
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
        ],
        "note": "時時保持戒備，受到的傷害減少。"
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
        ],
        "note": "更擅長藏身和移動：HP 上限提升，移動速度也變快。"
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
        ],
        "note": "腐蝕的範圍變大，一次影響更多異質體。"
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
        ],
        "note": "混亂的時間再延長，讓異質體自相殘殺得更久。"
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
        ],
        "note": "毒性更強：攻擊力提升，腐蝕範圍再擴大。"
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
        ],
        "note": "強化大招「腐蝕綻放」：腐蝕的傷害更高，也放得更頻繁。"
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
        ],
        "note": "瞄準要害出手，攻擊力提升。"
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
        ],
        "note": "出手更快更狠，攻擊速度和攻擊力都提升。"
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
        ],
        "note": "待在讓自己安心的距離作戰，每次攻擊累積的負荷大幅減少。"
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
        ],
        "note": "腐蝕能伸得更遠，射程增加。"
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
        ],
        "note": "「餘燼烙印」留下的燒傷會持續更久，異質體被燒的時間更長。"
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
        ],
        "note": "習慣了火焰的高溫，身體更耐打，能在前線撐得更久。"
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
        ],
        "note": "出手時保持呼吸節奏：精神負荷累積得更慢，受到的傷害也減少。"
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
        ],
        "note": "燒傷的火勢更猛，被點燃的異質體每秒受到更多傷害。"
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
        ],
        "note": "讓火燒得更旺：本身的攻擊力提升，燒傷每秒的傷害也再提高。"
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
        ],
        "note": "燒傷持續得更久，大招「烈焰新星」也更快準備好。"
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
        ],
        "note": "強化大招「烈焰新星」：爆炎的傷害更高，也放得更頻繁。"
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
        ],
        "note": "瞄準要害點火，每一發攻擊都更痛。"
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
        ],
        "note": "從更遠的地方開火、火力也更強，在異質體靠近前就先削弱它們。"
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
        ],
        "note": "抓到出手的節奏，攻擊速度變快。"
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
        ],
        "note": "火光照得更遠，能更早發現遠處的異質體。"
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
        ],
        "note": "「鐵壁守護」的恢復力更強，每秒回復更多 HP。"
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
        ],
        "note": "身為小隊長的鍛鍊成果，HP 上限提升。"
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
        ],
        "note": "意志堅定：受到的傷害減少，每秒回復的 HP 也再增加。"
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
        ],
        "note": "吸引仇恨的範圍變大，把更遠的異質體都拉到自己身上。"
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
        ],
        "note": "盾牌架得更穩，受到的傷害再減少。"
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
        ],
        "note": "站得穩、心也穩：精神負荷恢復得更快，吸引仇恨的範圍再擴大。"
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
        ],
        "note": "強化大招「盾擊衝鋒」：衝撞的傷害更高，也放得更頻繁。"
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
        ],
        "note": "用盾牌邊緣攻擊，攻擊力提升。"
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
        ],
        "note": "揮動重盾橫掃：攻擊力提升，攻擊範圍也變大。"
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
        ],
        "note": "跑得更快，能更早擋到隊友前面。"
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
        ],
        "note": "相信隊友，不再什麼都一個人扛，每次攻擊累積的負荷變少。"
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
        ],
        "note": "「靜電麻痺」讓異質體停住的時間更久。"
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
        ],
        "note": "照著訓練表鍛鍊體能，HP 上限提升。"
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
        ],
        "note": "學會把電流導開：受到的傷害減少，HP 上限也再提高。"
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
        ],
        "note": "按照守則確實瞄準，落雷更容易打中目標。"
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
        ],
        "note": "落雷的範圍變大，一次能波及更多異質體。"
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
        ],
        "note": "命中率再提升，被打中的異質體也會麻痺得更久。"
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
        ],
        "note": "強化大招「天雷落」：落雷的傷害更高，也放得更頻繁。"
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
        ],
        "note": "提高電流的強度，攻擊力上升。"
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
        ],
        "note": "電流更強、雷擊範圍更大，對付成群的異質體更有效。"
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
        ],
        "note": "規律的生活讓精神更穩定，每次攻擊累積的負荷變少。"
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
        ],
        "note": "充能速度變快，攻擊速度提升。"
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
        ],
        "note": "攻擊把異質體擊退得更遠。"
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
        ],
        "note": "骨頭夠硬，HP 上限提升。"
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
        ],
        "note": "受到的傷害減少，HP 上限也再提高。"
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
        ],
        "note": "重擊讓異質體停住的時間更久。"
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
        ],
        "note": "「狂怒之血」更強：汙染越高，攻擊力提升得越多。"
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
        ],
        "note": "吸引仇恨的範圍變大，把異質體擋在隊友前面，擊退也更遠。"
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
        ],
        "note": "強化大招「崩地重擊」：重擊的傷害更高，也放得更頻繁。"
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
        ],
        "note": "純粹的力氣，攻擊力提升。"
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
        ],
        "note": "拳頭更重：攻擊力提升，攻擊範圍也變大。"
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
        ],
        "note": "移動速度變快，更快趕到戰線上。"
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
        ],
        "note": "學會壓住怒氣，每次攻擊累積的負荷變少。"
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
        ],
        "note": "「夜視感知」的範圍變大，能看見更遠的黑暗中的怪物。"
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
        ],
        "note": "身手靈巧，受到的傷害減少。"
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
        ],
        "note": "HP 上限提升，移動速度也變快。"
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
        ],
        "note": "看得更遠，射程增加。"
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
        ],
        "note": "「夜視感知」的範圍再大幅擴大。"
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
        ],
        "note": "看穿怪物的弱點，攻擊力和命中率都提升。"
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
        ],
        "note": "堤諾沒有大招，這是感知的極致：夜視範圍再擴大，攻擊力和攻擊速度也提升。"
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
        ],
        "note": "出手更快，攻擊速度提升。"
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
        ],
        "note": "連續射擊，攻擊速度和攻擊力都提升。"
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
        ],
        "note": "比其他人更早發現遠處的異質體。"
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
        ],
        "note": "年輕就是本錢，精神負荷恢復得更快。"
      }
    },
    "eldrin": {
      "trait-1": {
        "name": "特性",
        "desc": "無精神負荷；恢復附近哨兵的生命與精神負荷，遇敵時保持距離。",
        "effect": "初始技能",
        "note": "被動「溫柔疏導」：每 3 秒為 2.8 格內的隊員降低約 30 汙染、恢復約 18 HP；遇敵時保持 3 格距離。",
        "icon": "",
        "mods": [],
        "cost": 0
      },
      "trait-2": {
        "name": "疏導熟練",
        "desc": "疏導的手法更熟練了。",
        "effect": "每秒疏導量 +1",
        "effect2": "",
        "note": "",
        "icon": "",
        "mods": [
          {
            "path": "aura.rate",
            "add": 1
          }
        ],
        "cost": 40
      },
      "ult": {
        "name": "生命之泉",
        "desc": "危急時刻，為全隊注入大量生命力。",
        "effect": "全隊 HP +40",
        "effect2": "",
        "note": "有隊友 HP 負荷值 35% 時自動發動；詠唱 3 秒，花 20 SP，冷卻 60 秒。",
        "icon": "",
        "mods": [],
        "cost": 250
      },
      "core-1": {
        "name": "細心照護",
        "desc": "把照顧的範圍再放大一點。",
        "effect": "疏導光環範圍 +0.5 格",
        "effect2": "",
        "note": "疏導光環的範圍變大，能照顧到更遠的隊員。",
        "icon": "",
        "mods": [
          {
            "path": "aura.r",
            "add": 0.5
          }
        ],
        "cost": 80
      },
      "aux-1": {
        "name": "體能鍛鍊",
        "desc": "永久被動技能。",
        "effect": "最大 HP +20",
        "effect2": "",
        "note": "HP 上限提升，在隊員身邊待得更久。",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "add": 20
          }
        ],
        "cost": 80
      },
      "aux-2": {
        "name": "精神鍛鍊",
        "desc": "永久被動技能。",
        "effect": "SP 上限 +20",
        "effect2": "",
        "note": "SP 上限提升，能發動更多次疏導技能。",
        "icon": "",
        "mods": [
          {
            "path": "spMax",
            "add": 20
          }
        ],
        "cost": 80
      }
    },
    "chris": {
      "trait-1": {
        "name": "特性",
        "desc": "無精神負荷；恢復附近哨兵的生命與精神負荷，遇敵時保持距離。",
        "effect": "初始技能",
        "note": "被動「戰地疏導」：每 3 秒為 2.5 格內的隊員降低約 18 汙染、恢復約 12 HP；遇敵時保持 3.5 格距離。",
        "icon": "",
        "mods": [],
        "cost": 0
      },
      "trait-2": {
        "name": "疏導熟練",
        "desc": "疏導的手法更熟練了。",
        "effect": "疏導量 +1／秒",
        "effect2": "",
        "note": "說明說明說明說明",
        "icon": "",
        "mods": [
          {
            "path": "aura.rate",
            "add": 1
          }
        ],
        "cost": 40
      },
      "core-1": {
        "name": "省力疏導",
        "desc": "用最少的力氣做好疏導。",
        "effect": "一般疏導少花 20% SP",
        "effect2": "",
        "note": "一般疏導花的 SP 減少，同樣的 SP 能疏導更多次。",
        "icon": "",
        "mods": [
          {
            "path": "spCostCut",
            "add": 0.2
          }
        ],
        "cost": 80
      },
      "aux-1": {
        "name": "體能鍛鍊",
        "desc": "永久被動技能。",
        "effect": "最大 HP +20",
        "effect2": "",
        "note": "HP 上限提升，在隊員身邊待得更久。",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "add": 20
          }
        ],
        "cost": 80
      },
      "aux-2": {
        "name": "精神鍛鍊",
        "desc": "永久被動技能。",
        "effect": "SP 上限 +20",
        "effect2": "",
        "note": "SP 上限提升，能發動更多次疏導技能。",
        "icon": "",
        "mods": [
          {
            "path": "spMax",
            "add": 20
          }
        ],
        "cost": 80
      }
    },
    "taana": {
      "trait-1": {
        "name": "特性",
        "desc": "不攻擊、無精神負荷；恢復附近哨兵的生命與精神負荷，\n遇敵時保持距離。",
        "effect": "初始技能",
        "note": "被動「安眠光環」：每 3 秒為 3 格內的隊員降低 26 汙染、恢復 13 HP；平時跟在需要照顧的哨兵身邊。",
        "icon": "",
        "mods": [],
        "cost": 0
      },
      "trait-2": {
        "name": "疏導熟練",
        "desc": "疏導的手法更熟練了。",
        "effect": "每秒疏導量 +1",
        "effect2": "",
        "note": "",
        "icon": "",
        "mods": [
          {
            "path": "aura.rate",
            "add": 1
          }
        ],
        "cost": 40
      },
      "core-1": {
        "name": "熟睡守護",
        "desc": "不攻擊的她，更懂得照顧好自己。",
        "effect": "每秒回復 HP +1",
        "effect2": "",
        "note": "塔納自己每秒會回復少量 HP，能在隊員身邊待得更久。",
        "icon": "",
        "mods": [
          {
            "path": "hpRegen",
            "add": 1
          }
        ],
        "cost": 80
      },
      "aux-1": {
        "name": "體能鍛鍊",
        "desc": "永久被動技能。",
        "effect": "最大 HP +20",
        "effect2": "",
        "note": "HP 上限提升，在隊員身邊待得更久。",
        "icon": "",
        "mods": [
          {
            "path": "hp",
            "add": 20
          }
        ],
        "cost": 80
      },
      "aux-2": {
        "name": "精神鍛鍊",
        "desc": "永久被動技能。",
        "effect": "SP 上限 +20",
        "effect2": "",
        "note": "SP 上限提升，能發動更多次疏導技能。",
        "icon": "",
        "mods": [
          {
            "path": "spMax",
            "add": 20
          }
        ],
        "cost": 80
      },
      "ult": {
        "name": "深眠搖籃",
        "desc": "讓失控邊緣的隊友沉沉睡去、重新清醒。",
        "effect": "",
        "effect2": "",
        "note": "有兩名以上隊友加總負荷值超過50以上或暴走時自動發動；\n詠唱 3 秒、花 20 SP；冷卻 60 秒。",
        "icon": "",
        "mods": [],
        "active": {
          "when": "taintAbove",
          "at": 70,
          "orBerserk": true,
          "soothe": 35,
          "wake": true,
          "cast": 3,
          "sp": 20,
          "cd": 60
        },
        "cost": 250
      },
      "a-1": {
        "name": "群體疏導",
        "desc": "一口氣安撫全隊的精神。",
        "effect": "",
        "effect2": "",
        "note": "有兩名以上隊友加總負荷值超過50以上或暴走時自動發動；\n詠唱 2.5 秒、花 15 SP；冷卻 20 秒。",
        "icon": "",
        "mods": [],
        "active": {
          "when": "taintAbove",
          "at": 50,
          "soothe": 15,
          "cast": 2.5,
          "sp": 15,
          "cd": 20
        },
        "cost": 40
      }
    }
  }
};
