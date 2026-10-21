/* ===== 諾亞的開發工坊：裝備文字、圖片與外觀（由「🔧 開發工坊編輯器」匯出，整段覆蓋即可）=====
   items：要改哪件裝備／武器（沒寫的就用 data/equipment.js 原本的設定）
     key：裝備用 id（例如 headlamp）；武器前面加 w:（例如 w:pistol）
     name 名稱、image 圖片路徑、iconScale 圖片大小（%，100＝原本）、iconX／iconY 圖片位移（px，正數＝往右／往下）、infoImgX／infoImgY 下方說明欄裡的圖片位移（px）、ownedDesc 說明（desc 舊的「還沒拿到時」說明，已經不用）、where 取得方式的說明（整段照寫的顯示，「戰鬥區域」等字會是紫色；只能在戰鬥區域取得的才會用到）
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
      "levels": [
        "照明距離 5.5 格・扇形 52°・一顆電池撐 90 秒",
        "照明距離 7.0 格・扇形 56°・一顆電池撐 140 秒",
        "照明距離 8.5 格・扇形 72°・一顆電池撐 200 秒",
        "照明距離 10.0 格・扇形 80°・一顆電池撐 260 秒",
        "照明距離 11.5 格・扇形 88°・一顆電池撐 320 秒"
      ],
      "values": [
        {
          "fear": 0
        },
        {
          "fear": 0
        },
        {
          "fear": 0
        },
        {
          "fear": 0
        },
        {
          "fear": 0
        }
      ],
      "iconScale": 85,
      "infoImgY": -9
    },
    "lamphelmet": {
      "ownedDesc": "持續照亮周圍，無須電池。",
      "iconScale": 94,
      "iconY": -6,
      "infoImgY": -22
    },
    "mask": {
      "iconY": -3,
      "infoImgY": -16
    },
    "helmet": {
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
      "iconScale": 108,
      "iconX": 2,
      "iconY": -2,
      "infoImgY": -18
    },
    "earmuffs": {
      "values": [
        {
          "calm": 0.1
        },
        {
          "calm": 0.15
        },
        {
          "calm": 0.2
        },
        {
          "calm": 0.25
        },
        {
          "calm": 0.3
        }
      ],
      "iconScale": 95,
      "iconY": -5,
      "infoImgY": -19
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
      "iconScale": 93,
      "infoImgY": -12
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
      ],
      "infoImgY": -12
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
      "iconY": -3,
      "infoImgY": -15
    },
    "fireboots": {
      "values": [
        {
          "fire": 0.2
        },
        {
          "fire": 0.25
        },
        {
          "fire": 0.3
        },
        {
          "fire": 0.4
        },
        {
          "fire": 0.5
        }
      ],
      "infoImgY": -10
    },
    "acidboots": {
      "ownedDesc": "減少踩到腐蝕池、酸液的傷害；可以跟防毒面具疊加。",
      "values": [
        {
          "corrode": 0.2
        },
        {
          "corrode": 0.25
        },
        {
          "corrode": 0.3
        },
        {
          "corrode": 0.4
        },
        {
          "corrode": 0.5
        }
      ],
      "infoImgY": -10
    },
    "radio": {
      "values": [
        {
          "reach": 0.15,
          "mark": 5
        },
        {
          "reach": 0.3,
          "mark": 8
        },
        {
          "reach": 0.4,
          "rush": 0.3,
          "mark": 10
        },
        {
          "reach": 0.5,
          "rush": 0.4,
          "mark": 13
        },
        {
          "reach": 0.7,
          "rush": 0.5,
          "mark": 15
        }
      ],
      "infoImgY": -6
    },
    "detector": {
      "values": [
        {},
        {},
        {},
        {},
        {
          "range": 15
        }
      ],
      "infoImgY": -17
    },
    "w:pistol": {
      "values": [
        {
          "reload": 1.3,
          "reserve": "∞"
        },
        {
          "reload": 1.1,
          "reserve": "∞"
        },
        {
          "reload": 0.8,
          "reserve": "∞"
        },
        {
          "reload": 0.6
        },
        {
          "reload": 0.4
        }
      ],
      "iconScale": 96,
      "infoImgY": -8
    },
    "w:flare": {
      "values": [
        {
          "reload": 1.5,
          "reserve": 20,
          "shine": 7
        },
        {
          "reload": 1.2,
          "reserve": 23,
          "shine": 10
        },
        {
          "reload": 0.9,
          "reserve": 26,
          "shine": 15
        },
        {
          "reserve": 30,
          "shine": 20
        },
        {
          "reserve": 40,
          "shine": 30
        }
      ],
      "iconScale": 96,
      "infoImgY": -8
    },
    "w:incendiary": {
      "where": "於戰鬥區域：有機率在上鎖的置物箱取得",
      "values": [
        {
          "burn": 4,
          "mag": 1,
          "reload": 2,
          "reserve": 5
        },
        {
          "burn": 6,
          "mag": 2,
          "reload": 1.6,
          "reserve": 6
        },
        {
          "burn": 8,
          "ignite": 3,
          "mag": 3,
          "reload": 1.2,
          "reserve": 7
        },
        {
          "ignite": 4,
          "mag": 4,
          "reload": 1,
          "reserve": 8
        },
        {
          "burn": 13,
          "ignite": 5,
          "mag": 5,
          "reload": 1,
          "reserve": 10
        }
      ],
      "infoImgY": -12
    },
    "w:tranq": {
      "ownedDesc": "使怪物睡眠或使暴走隊員冷靜下來；大型怪物效果較短，對怪物「生命體」無效。",
      "where": "於戰鬥區域：有機率在上鎖的置物箱取得",
      "infoImgY": -6
    }
  },
  "added": [],
  "removed": [],
  "style": {
    "headSmallSize": 12,
    "panelW": 1100,
    "panelH": 610,
    "actBtnX": 8,
    "actBtnY": -50,
    "infoY": 11,
    "infoTextY": 5
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
