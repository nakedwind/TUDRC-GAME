/* ===== 諾亞的開發工坊：裝備文字、圖片與外觀（由「🔧 開發工坊編輯器」匯出，整段覆蓋即可）=====
   items：要改哪件裝備／武器（沒寫的就用 data/equipment.js 原本的設定）
     key：裝備用 id（例如 headlamp）；武器前面加 w:（例如 w:pistol）
     name 名稱、image 圖片路徑、iconScale 圖片大小（%，100＝原本）、iconX／iconY 圖片位移（px，正數＝往右／往下）、desc 說明（還沒拿到時）、ownedDesc 說明（已擁有）、where 取得方式的說明（整段照寫的顯示，「戰鬥區域」等字會是紫色；只能在戰鬥區域取得的才會用到）
     levels：Lv1～Lv5 的效果說明文字（空白＝照數值自動產生）
     values：Lv1～Lv5 改過的實際數值（例如 {"dmg": 7}；沒寫的＝data/equipment.js 原本的；填文字的話只顯示在效果說明）
     cost：要花幾個異質碎片（裝備：[開發, 升到 Lv2, …, 升到 Lv5]；武器：[升到 Lv2, …, 升到 Lv5]；null／沒寫的＝原本的）
   added：新增的裝備（id、名稱、部位 kind、圖片、取得方式 source、費用 cost、每一級的效果說明 levels）
   removed：刪除的原本裝備 id（武器前面加 w:）
   order：開發工坊裡的排列順序（gear 裝備 id、weapons 武器 w:id；沒列到的接在後面）
   style：開發工坊的外觀（沒寫的就用預設值，見 js/workshop-config.js 的 WORKSHOP_STYLE_DEFAULT） */
const WORKSHOP_CONFIG = {
  "items": {
    "headlamp": {
      "desc": "朝游標方向照明、耗電後自動換電池。",
      "levels": [
        "照明距離 5.5 格・扇形 52°・一顆電池撐 90 秒",
        "照明距離 7.0 格・扇形 56°・一顆電池撐 140 秒",
        "照明距離 8.5 格・扇形 72°・一顆電池撐 200 秒",
        "照明距離 10.0 格・扇形 80°・一顆電池撐 260 秒",
        "照明距離 11.5 格・扇形 88°・一顆電池撐 320 秒"
      ]
    },
    "lamphelmet": {
      "iconY": -6
    },
    "mask": {
      "iconY": -3
    },
    "helmet": {
      "desc": "減少受到的傷害。",
      "ownedDesc": "可與防護背心疊加。",
      "values": [
        {
          "guard": 0.05
        },
        {
          "guard": 0.1
        },
        {
          "guard": 0.15
        },
        {},
        {
          "guard": 0.25
        }
      ],
      "iconX": 2,
      "iconY": -2
    },
    "earmuffs": {
      "iconY": -5
    },
    "vest": {
      "values": [
        {
          "guard": 0.08
        },
        {
          "guard": 0.16
        },
        {},
        {
          "guard": 0.23
        },
        {
          "guard": 0.25
        }
      ],
      "iconScale": 93
    },
    "bracelet": {
      "values": [
        {
          "save": 0.05
        },
        {
          "save": 0.08
        },
        {
          "save": 0.13
        },
        {
          "save": 0.17
        },
        {
          "save": 0.2
        }
      ]
    },
    "sneakers": {
      "values": [
        {
          "speed": 0.05
        },
        {
          "speed": 0.08
        },
        {
          "speed": 0.13
        },
        {
          "speed": 0.16
        },
        {
          "speed": 0.2
        }
      ],
      "iconY": -3
    },
    "acidboots": {
      "desc": "減少踩到腐蝕池、酸液的傷害；\n可以跟防毒面具疊加。"
    },
    "w:pistol": {
      "values": [
        {
          "reload": 1.3,
          "reserve": "∞"
        },
        {
          "reload": 1,
          "reserve": "∞"
        },
        {
          "reload": 0.7,
          "reserve": "∞"
        },
        {},
        {}
      ]
    },
    "w:flare": {
      "values": [
        {
          "reload": 1.6,
          "reserve": 20,
          "shine": 7
        },
        {
          "reload": 1.3,
          "reserve": 23,
          "shine": 10
        },
        {
          "reload": 1,
          "reserve": 28,
          "shine": 15
        },
        {
          "reserve": 35,
          "shine": 20
        },
        {
          "reserve": 43,
          "shine": 30
        }
      ]
    },
    "w:incendiary": {
      "desc": "落地形成火海，可點燃油桶、油汙並焚毀怪物「生命體」；也會傷及友軍。",
      "where": "於戰鬥區域：有機率在上鎖的置物箱取得"
    },
    "w:tranq": {
      "desc": "使怪物睡眠或使暴走隊員冷靜下來；\n大型怪物效果較短，對怪物「生命體」無效。",
      "where": "於戰鬥區域：有機率在上鎖的置物箱取得"
    }
  },
  "added": [],
  "removed": [],
  "style": {
    "headSmallSize": 11,
    "panelW": 1100,
    "panelH": 610,
    "gap": 8,
    "iconSize": 80,
    "btnFont": 14,
    "btnPadX": 8,
    "btnX": 5,
    "btnY": 30,
    "nameSize": 16,
    "descSize": 13
  },
  "order": {
    "gear": [
      "lamphelmet",
      "helmet",
      "mask",
      "earmuffs",
      "vest",
      "headlamp",
      "bracelet",
      "sneakers",
      "fireboots",
      "acidboots",
      "radio",
      "detector"
    ],
    "weapons": [
      "w:pistol",
      "w:flare",
      "w:incendiary",
      "w:tranq"
    ]
  }
};
