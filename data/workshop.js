/* ===== 諾亞的開發工坊：裝備文字、圖片與外觀（由「🔧 開發工坊編輯器」匯出，整段覆蓋即可）=====
   items：要改哪件裝備／武器（沒寫的就用 data/equipment.js 原本的設定）
     key：裝備用 id（例如 headlamp）；武器前面加 w:（例如 w:pistol）
     name 名稱、image 圖片路徑、iconScale 圖片大小（%，100＝原本）、iconX／iconY 圖片位移（px，正數＝往右／往下）、infoImgX／infoImgY 下方說明欄裡的圖片位移（px）、infoImgSize 下方說明欄裡的圖片大小（px＝圖的寬，高度照比例；沒寫＝原本的 88，武器 100）、ownedDesc 說明（desc 舊的「還沒拿到時」說明，已經不用）、where 取得方式的說明（整段照寫的顯示，「戰鬥區域」等字會是紫色；只能在戰鬥區域取得的才會用到）
     infoParts：下方說明欄各塊的位置、大小、字級 { name 名稱, tag 標籤, desc 說明, stats 效果框, btn 按鈕, money 經費框：{ x, y, w, h, font }（px），也可以寫改過的字 }（子彈、彈匣也可以寫）
     money：開發／升級要花的經費（跟 cost 同一格對同一格，null＝照異質碎片自動算；子彈是一個數字）
     levels：Lv1～Lv5 的效果說明文字（空白＝照數值自動產生）
     values：Lv1～Lv5 改過的實際數值（例如 {"dmg": 7}；沒寫的＝data/equipment.js 原本的；填文字的話只顯示在效果說明）
     cost：要花幾個異質碎片（裝備：[開發, 升到 Lv2, …, 升到 Lv5]；武器：[升到 Lv2, …, 升到 Lv5]；null／沒寫的＝原本的）
     子彈 b:子彈id（例如 b:tranq）：name、image、desc 說明、cost 開發費用、max 最多帶幾發；彈匣 m:magazine：name、desc、slots 每一級裝得下幾種、cost 升級費用
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
      "infoImgY": -9,
      "infoImgSize": 80,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        },
        "money": {
          "w": 75,
          "h": 30,
          "font": 15
        }
      }
    },
    "lamphelmet": {
      "ownedDesc": "持續照亮周圍，無須電池。",
      "levels": [
        "照明半徑 1.8 格",
        "照明半徑 2.1 格",
        "照明半徑 2.5 格",
        "照明半徑 2.9 格",
        "照明半徑 3.3 格"
      ],
      "iconScale": 94,
      "iconY": -6,
      "infoImgY": -22,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
    },
    "mask": {
      "values": [
        {
          "filter": 0.3
        },
        {
          "filter": 0.5
        },
        {
          "filter": 0.65
        },
        {
          "filter": 0.8
        },
        {}
      ],
      "iconY": -3,
      "infoImgY": -16,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
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
      "infoImgY": -18,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
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
      "infoImgY": -19,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
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
      "infoImgY": -12,
      "infoParts": {
        "tag": {
          "y": -20
        },
        "name": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
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
      "infoImgY": -12,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
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
      "infoImgY": -15,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
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
      "infoImgY": -10,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
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
      "infoImgY": -10,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
    },
    "radio": {
      "values": [
        {
          "reach": 0.15,
          "rush": 0.2
        },
        {
          "reach": 0.3,
          "rush": 0.25
        },
        {
          "reach": 0.4,
          "rush": 0.3
        },
        {
          "reach": 0.5,
          "rush": 0.4
        },
        {
          "reach": 0.7,
          "rush": 0.5
        }
      ],
      "infoImgY": -6,
      "infoParts": {
        "tag": {
          "y": -20
        },
        "name": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
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
      "infoImgY": -17,
      "infoParts": {
        "btn": {
          "y": -55
        }
      }
    },
    "navrecorder": {
      "infoParts": {
        "name": {
          "y": -10
        },
        "tag": {
          "y": -10
        },
        "desc": {
          "y": -10
        },
        "stats": {
          "y": -10
        }
      }
    },
    "w:pistol": {
      "values": [
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
        },
        {
          "reload": 1.3
        }
      ],
      "iconScale": 96,
      "infoImgY": -8,
      "infoParts": {
        "btn": {
          "y": -55
        },
        "name": {
          "y": -22
        },
        "tag": {
          "y": -22
        },
        "stats": {
          "y": -22
        },
        "desc": {
          "y": -22
        }
      }
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
      "infoImgY": -8,
      "infoParts": {
        "btn": {
          "y": -55
        },
        "name": {
          "y": -30
        },
        "tag": {
          "y": -30
        },
        "stats": {
          "y": -30
        },
        "desc": {
          "y": -30
        }
      }
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
      "infoImgY": -12,
      "infoParts": {
        "btn": {
          "y": -55
        }
      }
    },
    "w:tranq": {
      "ownedDesc": "使怪物睡眠或使暴走隊員冷靜下來；大型怪物效果較短，對怪物「生命體」無效。",
      "where": "於戰鬥區域：有機率在上鎖的置物箱取得",
      "infoImgY": -6,
      "infoParts": {
        "btn": {
          "y": -55
        }
      }
    },
    "b:tranq": {
      "desc": "打中的怪物陷入沉睡；打中暴走的隊員會睡著，醒來後解除暴走狀態。對怪物「生命體」沒有效果。",
      "infoParts": {
        "name": {
          "y": -11
        },
        "tag": {
          "y": -11
        },
        "desc": {
          "y": -11
        },
        "stats": {
          "y": -11
        },
        "btn": {
          "y": -55
        }
      },
      "iconScale": 110
    },
    "b:paint": {
      "desc": "打中的怪物沾上螢光漆：隊員會優先集火牠，躲進黑暗也看得到。一次只能標一隻，打新的舊的就消失。",
      "infoParts": {
        "name": {
          "y": -11
        },
        "tag": {
          "y": -11
        },
        "desc": {
          "y": -11
        },
        "stats": {
          "y": -11
        },
        "btn": {
          "y": -55
        }
      },
      "iconScale": 120
    },
    "b:split": {
      "desc": "一次扇形噴出好幾顆小子彈，近距離打一整群小怪。距離越遠越散。",
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        },
        "stats": {
          "y": -20
        },
        "btn": {
          "y": -55
        }
      }
    },
    "m:magazine": {
      "infoParts": {
        "btn": {
          "y": -55
        },
        "name": {
          "y": -22
        },
        "tag": {
          "y": -22
        },
        "stats": {
          "y": -22
        },
        "desc": {
          "y": -22
        }
      }
    },
    "bag:items": {
      "infoParts": {
        "btn": {
          "y": -55
        },
        "name": {
          "y": -22
        },
        "tag": {
          "y": -22
        },
        "desc": {
          "y": -22
        },
        "stats": {
          "y": -22
        }
      }
    },
    "bag:ammo": {
      "infoParts": {
        "btn": {
          "y": -55
        },
        "name": {
          "y": -22
        },
        "tag": {
          "y": -22
        },
        "desc": {
          "y": -22
        },
        "stats": {
          "y": -22
        }
      }
    }
  },
  "added": [],
  "removed": [],
  "style": {
    "headSmallSize": 12,
    "panelW": 1100,
    "panelH": 610,
    "actBtnW": 148,
    "actBtnH": 63,
    "actBtnX": 1,
    "actBtnY": 53,
    "infoY": 11,
    "infoTextY": 5
  },
  "order": {
    "gear": [
      "lamphelmet",
      "helmet",
      "mask",
      "earmuffs",
      "vest_light",
      "vest",
      "vest_heavy",
      "headlamp",
      "bracelet",
      "sneakers",
      "fireboots",
      "acidboots",
      "radio",
      "detector",
      "navrecorder"
    ],
    "weapons": [
      "w:pistol",
      "w:flare",
      "w:incendiary",
      "w:tranq"
    ]
  }
};
