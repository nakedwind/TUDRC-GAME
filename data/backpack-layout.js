/* ===== 背包版面（由「🎒 背包編輯器」匯出，整段覆蓋即可）=====
   elements：每個可以調整的區域／圖片／文字 → { x, y：位移（像素）, w, h：寬高（像素）, font：字級, align：文字對齊 }
   texts：改過的介面文字（分頁、標題、按鈕…）
   沒寫在這裡的就照原本的樣子。套用的程式在 js/backpack-layout.js。 */
const BACKPACK_LAYOUT = {
  "elements": {
    "text.hint": {
      "align": "center"
    },
    "text.useNote": {
      "y": 25,
      "align": "center"
    },
    "text.dropNote": {
      "align": "center"
    },
    "text.dragNote": {
      "x": 15,
      "w": 150,
      "h": 16,
      "align": "center"
    },
    "text.freeNote": {
      "align": "center"
    },
    "text.gearNote": {
      "align": "center"
    },
    "text.desc": {
      "y": -30,
      "font": 15,
      "align": "left"
    },
    "item:storage-locker-key": {
      "size": 60
    },
    "item:tea": {
      "size": 65
    },
    "item:sarsaparilla": {
      "size": 65
    },
    "item:asparagus-juice": {
      "size": 65
    },
    "item:vegetable-juice": {
      "size": 65
    },
    "item:pure-tea": {
      "size": 65
    },
    "item:water": {
      "size": 65
    },
    "item:cola": {
      "size": 65
    },
    "item:shrimp-snack": {
      "size": 65
    },
    "item:spicy-snack": {
      "size": 65
    },
    "item:cream-puff": {
      "size": 65
    },
    "item:fish-snack": {
      "size": 65
    },
    "item:oyster-omelet": {
      "size": 65
    },
    "item:milk-tea": {
      "size": 65
    },
    "item:tomato-soda": {
      "size": 65
    },
    "item:battery": {
      "size": 45
    },
    "item:backroom-door-key": {
      "size": 18
    },
    "item:black-shard": {
      "size": 43
    },
    "item:power-shard": {
      "size": 45
    },
    "item:sloth-shard": {
      "size": 45
    },
    "item:burning-key": {
      "size": 40
    },
    "item:pure-key": {
      "size": 40
    },
    "item:warm-key": {
      "size": 40
    },
    "item:black-key": {
      "size": 40
    },
    "item:power-key": {
      "size": 40
    },
    "item:sloth-key": {
      "size": 40
    },
    "item:quiet-key": {
      "size": 40
    },
    "item:spirit-key": {
      "size": 40
    },
    "item:regret-key": {
      "size": 40
    },
    "item:adrenaline": {
      "size": 15
    },
    "item:graffiti-red": {
      "size": 30
    },
    "item:graffiti-blue": {
      "size": 30
    },
    "item:graffiti-black": {
      "size": 30
    },
    "item:charm": {
      "size": 50
    },
    "item:medkit": {
      "size": 65
    },
    "item:firstaid": {
      "size": 60
    },
    "item:anomaly-firstaid": {
      "size": 60
    },
    "item:youyou-card": {
      "size": 65
    },
    "text.cellCount": {
      "w": 32,
      "h": 16,
      "font": 10
    },
    "item:gear:headlamp": {
      "y": 4,
      "size": 65
    },
    "item:gear:sneakers": {
      "y": 3
    },
    "item:gear:fireboots": {
      "y": 3
    },
    "item:gear:vest": {
      "y": 6,
      "size": 55
    },
    "text.equipTitle": {
      "font": 18,
      "align": "center"
    },
    "detailImg:thermos": {
      "x": 2
    },
    "img.bagIcon": {
      "size": 30
    },
    "text.name": {
      "font": 20
    },
    "panel.battery": {
      "w": 191
    },
    "detailImg:battery": {
      "size": 59
    },
    "text.batteryLabel": {
      "font": 15,
      "align": "center"
    },
    "text.batteryCount": {
      "font": 13,
      "align": "center"
    },
    "btn.use": {
      "x": -3,
      "y": 5,
      "w": 185,
      "h": 40,
      "align": "center"
    },
    "btn.drop": {
      "y": -15,
      "align": "center"
    },
    "item:banana": {
      "size": 65
    },
    "btn.dropQty": {
      "y": -15,
      "w": 69,
      "font": 13
    }
  },
  "texts": {
    "text.dragNote": "也可以在彈匣格來回拖曳"
  }
};
