/* ===== Y102隊員裝備（由「🧑‍🚀 Y102隊員裝備／技能編輯器」匯出，整段覆蓋即可）=====
   溫特在便利商店（「隊員裝備」分頁）用經費買，買了放進背包；在 T-Pad「Y102隊員」→ 裝備頁給隊員穿（每人 3 格、不分種類，一件只能給一個人穿）。
   每件：{ id, name：名稱, icon：沒有圖片時用的 emoji, image：圖片路徑（可不填）, price：價錢, desc：裝備說明, effect：裝備數值（顯示用；空白＝依 mods 自動產生）, mods：實際改的數值 }
   mods 的寫法跟技能一樣：{ path: 數值名稱, mul: 乘多少 } 或 { path, add: 加多少 }。 */
const SQUAD_GEAR = [
  {
    "id": "sg-vest",
    "name": "輕量防護背心",
    "icon": "🦺",
    "image": "",
    "price": 120,
    "desc": "應變中心配發的輕量防護背心，不太影響行動。",
    "effect": "",
    "mods": [
      {
        "path": "defense",
        "add": 0.05
      }
    ]
  },
  {
    "id": "sg-gloves",
    "name": "強化戰術手套",
    "icon": "🧤",
    "image": "",
    "price": 140,
    "desc": "加了護甲片的手套，出手更有力。",
    "effect": "",
    "mods": [
      {
        "path": "dmg",
        "mul": 1.1
      }
    ]
  },
  {
    "id": "sg-scope",
    "name": "戰術瞄準鏡",
    "icon": "🔭",
    "image": "",
    "price": 150,
    "desc": "看得更遠、更準。",
    "effect": "",
    "mods": [
      {
        "path": "accuracy",
        "add": 0.1
      },
      {
        "path": "range",
        "add": 0.5
      }
    ]
  },
  {
    "id": "sg-boots",
    "name": "機動戰術靴",
    "icon": "🥾",
    "image": "",
    "price": 100,
    "desc": "輕巧的戰術靴，移動更快。",
    "effect": "",
    "mods": [
      {
        "path": "walkSpeed",
        "mul": 1.15
      }
    ]
  },
  {
    "id": "sg-pouch",
    "name": "急救腰包",
    "icon": "🩹",
    "image": "",
    "price": 130,
    "desc": "隨身的急救用品，受傷時可以自己處理。",
    "effect": "",
    "mods": [
      {
        "path": "hpRegen",
        "add": 1
      }
    ]
  }
];
