/* ===== 諾亞的開發工坊：裝備文字、圖片與外觀（由「🔧 開發工坊編輯器」匯出，整段覆蓋即可）=====
   items：要改哪件裝備／武器（沒寫的就用 data/equipment.js 原本的設定）
     key：裝備用 id（例如 headlamp）；武器前面加 w:（例如 w:pistol）
     name 名稱、image 圖片路徑、iconScale 圖片大小（%，100＝原本）、iconX／iconY 圖片位移（px，正數＝往右／往下）、infoImgX／infoImgY 下方說明欄裡的圖片位移（px）、infoImgSize 下方說明欄裡的圖片大小（px＝圖的寬，高度照比例；沒寫＝原本的 88，武器 100）、ownedDesc 說明（desc 舊的「還沒拿到時」說明，已經不用）、where 取得方式的說明（整段照寫的顯示，「戰鬥區域」等字會是紫色；只能在戰鬥區域取得的才會用到）
     infoParts：下方說明欄各塊的位置、大小、字級 { name 名稱, tag 標籤, desc 說明, stats 效果框, btn 按鈕：{ x, y, w, h, font }（px），也可以寫改過的字 }（子彈、彈匣也可以寫）
     money：開發／升級要花的經費（跟 cost 同一格對同一格，null＝照異質碎片自動算；子彈是一個數字）
     levels：Lv1～Lv5 的效果說明文字（空白＝照數值自動產生）
     values：Lv1～Lv5 改過的實際數值（例如 {"dmg": 7}；沒寫的＝data/equipment.js 原本的；填文字的話只顯示在效果說明）
     cost：要花幾個異質碎片（裝備：[開發, 升到 Lv2, …, 升到 Lv5]；武器：[升到 Lv2, …, 升到 Lv5]；null／沒寫的＝原本的）
     子彈 b:子彈id（例如 b:tranq）：name、image、desc 說明、cost 開發費用、max 一組幾發（彈藥包一格）；彈匣 m:magazine：name、image、desc、slots 每一級裝得下幾種、cost 升級費用
     建築 bld:建築id（例如 bld:barricade）：about 還沒開發時的說明、aboutOwned 開發好了的說明（沒寫＝原本的）、hp／dmg／cook 每一級的 %、cost 升級費用、圖片大小位移
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
      "iconScale": 95,
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
        }
      }
    },
    "vest_light": {
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
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
        }
      }
    },
    "vest_heavy": {
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
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
        }
      }
    },
    "acidboots": {
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
        }
      }
    },
    "radio": {
      "ownedDesc": "指派隊員時，隊員速度更快，同時帶著慣性導航記錄器：地圖上看得到隊員在哪。",
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
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "navrecorder": {
      "ownedDesc": "裝備後在戰鬥區域也能打開 T-Pad 的「地圖」",
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "gloves": {
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "scope": {
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "pouch": {
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
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
      "iconScale": 110,
      "iconY": 3,
      "infoImgY": -8,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
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
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
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
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "w:tranq": {
      "where": "於戰鬥區域：有機率在上鎖的置物箱取得",
      "infoImgY": -6,
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "b:flare": {
      "desc": "打出去落地後燃燒、照亮周圍一大片"
    },
    "b:tranq": {
      "desc": "打中的怪物陷入沉睡；打中暴走的隊員會睡著",
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      },
      "iconScale": 110
    },
    "b:paint": {
      "desc": "打中的怪物沾上螢光漆：隊員會優先集火牠，躲進黑暗也看得到。",
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      },
      "iconScale": 120
    },
    "b:split": {
      "desc": "像散彈槍一樣一次噴出一大把小子彈。貼得越近，打中的顆數越多、每顆也越痛",
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "b:knock": {
      "desc": "打中的怪物被往後推開；推去撞到牆壁或建築會暈一下、再受一點傷。很重的怪物推不動，",
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "b:confuse": {
      "desc": "打中的異質體陷入混亂幾秒，會攻擊自己人"
    },
    "m:magazine": {
      "desc": "在背包的「武器」分頁把子彈拖進彈匣格，戰鬥中滾輪就換得到。一般子彈不佔格子",
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "bag:items": {
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "bag:ammo": {
      "infoParts": {
        "name": {
          "y": -20
        },
        "tag": {
          "y": -20
        },
        "desc": {
          "y": -20
        }
      }
    },
    "bld:deco_oil_tank": {
      "aboutOwned": "打破以後會流出一小片汽油，小心火燭！",
      "about": "打破以後會流出一小片汽油，小心火燭！"
    },
    "bld:deco_gasstove2": {
      "about": "開發好之後，可以烹飪食物，要注意使用不當而爆炸。",
      "aboutOwned": "開發好之後，可以烹飪食物，要注意使用不當而爆炸。"
    },
    "bld:irongate": {
      "about": "左邊和右邊的可以開門，關上門安心感滿滿。",
      "aboutOwned": "左邊和右邊的可以開門，關上門安心感滿滿。"
    },
    "bld:landmine": {
      "about": "異質體踩到就會爆炸。",
      "aboutOwned": "異質體踩到就會爆炸。"
    },
    "bld:searchlight": {
      "about": "照亮大面積的區域的燈。",
      "aboutOwned": "照亮大面積的區域的燈。"
    },
    "bld:camping_lights": {
      "about": "可以小範圍照明的燈，放置在地上不會擋路。",
      "aboutOwned": "可以小範圍照明的燈，放置在地上不會擋路。"
    },
    "bld:roadblocks": {
      "about": "可以阻擋道路的障礙物。",
      "aboutOwned": "可以阻擋道路的障礙物。"
    },
    "bld:wirecloth": {
      "about": "讓大家走的更慢更小心。",
      "aboutOwned": "讓大家走的更慢更小心。"
    },
    "bld:deco_oil_drum": {
      "about": "打破以後會流出大量汽油，小心火燭！",
      "aboutOwned": "打破以後會流出大量汽油，小心火燭！"
    },
    "sg:sg-vest": {
      "aboutTail": "在 T-Pad「Y102隊員」→ 裝備頁給隊員穿。（目前有 {n} 件）"
    },
    "sg:sg-gloves": {
      "aboutTail": "在 T-Pad「Y102隊員」→ 裝備頁給隊員穿。（目前有 {n} 件）"
    },
    "sg:sg-scope": {
      "aboutTail": "在 T-Pad「Y102隊員」→ 裝備頁給隊員穿。（目前有 {n} 件）"
    },
    "sg:sg-boots": {
      "aboutTail": "在 T-Pad「Y102隊員」→ 裝備頁給隊員穿。（目前有 {n} 件）"
    },
    "sg:sg-pouch": {
      "aboutTail": "在 T-Pad「Y102隊員」→ 裝備頁給隊員穿。（目前有 {n} 件）"
    }
  },
  "added": [],
  "removed": [],
  "style": {
    "infoBtnY": -37,
    "infoBtnH": 55,
    "infoBtnFont": 18,
    "infoStatsX": 0,
    "infoStatsY": -20,
    "infoStatsW": 0,
    "infoStatsH": 60,
    "infoStatsFont": 0,
    "tabDev": "未開發",
    "tabUp": "升級",
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
      "navrecorder",
      "gloves",
      "scope",
      "pouch"
    ],
    "weapons": [
      "w:pistol",
      "w:flare",
      "w:incendiary",
      "w:tranq"
    ]
  }
};
