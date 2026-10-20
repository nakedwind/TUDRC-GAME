/* ===== 基地（安全區）裡每個人平時在哪裡（由「🏠 基地編輯器」匯出，整段覆蓋即可）=====
   基地的每個房間是不同張地圖。這裡決定「誰平時待在哪張地圖、哪一區」，可以依劇情章節不同。
   建議用基地編輯器調整：選章節 → 幫每個人選地圖 → 可指定出生格（spawn＝[格 c, 格 r]），並在地圖上拖活動方框（rect＝[左上格 c, 左上格 r, 右下格 c, 右下格 r]）。
   ・只有寫在這裡的人會出現在基地裡；沒寫的人就不在基地（例如出任務去了）。
   ・出勤隊伍在基地裡不會跟著溫特，大家都待在自己的位置。（戰鬥地圖照舊只出現出勤隊伍。）
   ・每個人：map＝地圖名稱；spawn＝指定出生格；rect＝活動範圍方框（平時在這裡面走動）；rects＝好幾個方框（合起來是走動範圍）；
     area＝舊寫法（下面 NPC_AREAS 的名稱，用素材圍出範圍）。沒有 spawn＝隨機出生；rect、rects、area 都沒寫＝整張地圖閒逛。
   ・章節：NPC_LOCATIONS 用章節數字當 key。目前章節（data/balance.js 的 CHAPTER）會用「≤ 目前章節」的最大那一章；
     基地編輯器新增章節時會自動複製上一章的整份名單，再改有變動的人。
   讀取名單的程式在 js/sentry.js（npcLocation）。
*/

// 舊寫法用的活動範圍（用素材圍出來）；基地編輯器會把它們換成方框
const NPC_AREAS = {
  "指揮部": {
    "stamps": [
      "tile_hq_monitor_wall",
      "tile_hq_command_table",
      "tile_hq_computer_desk",
      "tile_hq_desk_vertical"
    ],
    "pad": 1
  },
  "研究部": {
    "stamps": "tile_research_lab_",
    "pad": 1
  }
};

const NPC_LOCATIONS = {
  "1": {
    "theonie": {
      "map": "2F-應變中心",
      "spawn": [
        18,
        17
      ],
      "rect": [8, 12, 22, 21]
    },
    "amber": {
      "map": "哨兵休息室",
      "rect": [4, 4, 14, 10]
    },
    "red": {
      "map": "2F-應變中心",
      "spawn": [
        30,
        8
      ]
    },
    "avaren": {
      "map": "2F-應變中心",
      "spawn": [
        39,
        16
      ],
      "rect": [22, 12, 42, 21]
    },
    "luther": {
      "map": "2F-應變中心",
      "spawn": [
        30,
        6
      ]
    },
    "tino": {
      "map": "2F-應變中心",
      "spawn": [
        26,
        12
      ],
      "rect": [22, 12, 42, 21]
    },
    "eldrin": {
      "map": "2F-應變中心",
      "spawn": [
        35,
        20
      ],
      "rect": [22, 12, 42, 21]
    },
    "chris": {
      "map": "2F-應變中心",
      "spawn": [
        35,
        4
      ]
    },
    "claire": {
      "map": "嚮導辦公室",
      "rect": [4, 4, 14, 10]
    },
    "muomn": {
      "map": "嚮導辦公室",
      "rect": [4, 4, 14, 10]
    },
    "noah": {
      "map": "2F-應變中心",
      "rect": [9, 15, 21, 21]
    },
    "ash": {
      "map": "2F-應變中心",
      "spawn": [
        29,
        17
      ],
      "rect": [22, 12, 42, 21]
    },
    "eden": {
      "map": "1F-餐廳",
      "rect": [4, 6, 25, 23]
    },
    "salem": {
      "map": "1F-餐廳",
      "rect": [4, 7, 25, 23]
    },
    "taana": {
      "map": "B-1訓練室",
      "spawn": [
        15,
        21
      ]
    },
    "colyn": {
      "map": "B-1訓練室",
      "spawn": [
        9,
        19
      ]
    },
    "rowan": {
      "map": "B-2射擊訓練室",
      "spawn": [
        15,
        11
      ]
    },
    "cael": {
      "map": "B-2射擊訓練室",
      "spawn": [
        12,
        11
      ]
    },
    "saku": {
      "map": "1F-餐廳",
      "spawn": [
        22,
        21
      ]
    },
    "kakuma": {
      "map": "1F-餐廳",
      "spawn": [
        24,
        18
      ]
    }
  }
};
