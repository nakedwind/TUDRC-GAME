/* 角色資料頁匯出；保留角色 ID 與非戰鬥人員資料。台詞在 data/dialogues.js（對話編輯器）。 */
const CHARACTERS = {
  "winter": {
    "id": "winter",
    "kind": "player",
    "name": "溫特",
    "sprite": "winter_B",
    "player": {
      "hp": 100,
      "speed": 230,
      "r": 14,
      "drawSize": 64
    },
    "playerAttack": {
      "range": 8,
      "dmg": 5,
      "rate": 5,
      "aggro": 5,
      "cone": 0.44,
      "mag": 6,
      "reloadTime": 2
    },
    "intro": "Y102應變編組的嚮導部隊長。",
    "captainImpression": ""
  },
  "theonie": {
    "id": "theonie",
    "kind": "sentinel",
    "name": "希奧妮",
    "sprite": "theonie_B",
    "combat": {
      "rank": "S",
      "role": "遠程火力",
      "ability": "火焰",
      "range": 6,
      "aggroRange": 10,
      "dmg": 30,
      "rate": 0.5,
      "taint": 3,
      "splash": 0,
      "color": "#ff7b39",
      "accuracy": 1,
      "taintRegen": 0,
      "walkSpeed": 75,
      "hp": 80,
      "defense": 0.05,
      "ratings": {
        "combat": 5,
        "defense": 1,
        "hp": 1,
        "load": 2
      },
      "burn": {
        "duration": 5,
        "damage": 5
      },
      "trait": "單體攻擊。被動「餘燼烙印」：使目標燒傷 5 秒，每秒受到一次傷害。大招「烈焰新星」：每 8 秒放出一次大範圍爆炎（傷害 2.6 倍，範圍 2.2 格）。"
    },
    "intro": "自信的火焰天才。擅長遠程火力，需留意負荷累積。",
    "captainImpression": "希奧妮很清楚自己的火力有多強，也有足以支撐那份自信的實力。只要有人替她守住前線，她會是隊上最可靠的遠程火力。\n不過他的體力和防禦力較低，需要多注意他的身體狀態。\n跟諾亞的關係很好，兩人常常在研究室裏研發新東西，雖然個性很差但是頭腦真的很聰明。\n"
  },
  "amber": {
    "id": "amber",
    "kind": "sentinel",
    "name": "安柏",
    "sprite": "amber_B",
    "combat": {
      "rank": "C",
      "role": "範圍雷擊",
      "ability": "雷電",
      "range": 6,
      "aggroRange": 10,
      "dmg": 12,
      "rate": 0.5,
      "taint": 1,
      "splash": 1.3,
      "color": "#ffd24a",
      "accuracy": 0.6,
      "taintRegen": 0,
      "walkSpeed": 95,
      "hp": 150,
      "defense": 0.15,
      "ratings": {
        "combat": 2,
        "defense": 2,
        "hp": 3,
        "load": 2
      },
      "stun": 2,
      "trait": "範圍攻擊。被動「靜電麻痺」：在小片區域降下雷電，使異質體顫抖並停止 2 秒。大招「天雷落」：每 9 秒降下一次大片落雷（傷害 2.6 倍，範圍 2.4 格）。"
    },
    "intro": "認真守規矩的實習哨兵。雷擊能波及多個目標，但命中較不穩定。",
    "captainImpression": "雖然是新兵但做事認真，也願意遵守每一項規定。不過她的雷擊命中還不夠穩定，但控制異質體的能力非常有價值。\n只要再多一點實戰經驗，相信能夠成為優秀的哨兵。\n看見克萊兒時好像會變得緊張，我得多留意一下。"
  },
  "red": {
    "id": "red",
    "kind": "sentinel",
    "name": "雷德",
    "sprite": "red_B",
    "combat": {
      "rank": "A",
      "role": "前衛防禦",
      "ability": "自癒",
      "range": 1,
      "aggroRange": 14,
      "dmg": 12,
      "rate": 1,
      "taint": 2,
      "splash": 1,
      "color": "#ff5b6e",
      "accuracy": 0.9,
      "taintRegen": 0.5,
      "walkSpeed": 85,
      "hp": 240,
      "defense": 0.45,
      "ratings": {
        "combat": 2,
        "defense": 5,
        "hp": 5,
        "load": 1
      },
      "taunt": 3.2,
      "hpRegen": 4,
      "trait": "範圍攻擊。被動「鐵壁守護」：吸引異質體仇恨，並持續恢復生命與精神負荷。大招「盾擊衝鋒」：每 10 秒用盾牌衝撞周圍 2.8 格（傷害 2.2 倍），擊退 1.6 格，自己恢復 40 HP、降低 40 精神負荷。"
    },
    "intro": "熱情可靠的小隊長。近距離迎敵，負荷會自行恢復。",
    "captainImpression": "看起來不太聰明的傢伙，從好幾年前就喜歡跑來找我打招呼，上任部隊長之後更是常常跟在我身後跑，真不知道有什麼意圖。\n但除了問我要不要吃東西就是講一些無聊的事情，完全看不懂這傢伙想幹嘛。\n防禦力和再生能力都很強，時常衝到最前線擋下一切，有點過度自我犧牲的傾向，需要提醒他適可而止。\n",
    "follow": {
      "radiusCells": 7,
      "speed": 92
    }
  },
  "avaren": {
    "id": "avaren",
    "kind": "sentinel",
    "name": "阿瓦倫",
    "sprite": "avaren_B",
    "combat": {
      "rank": "S",
      "role": "腐蝕特攻",
      "ability": "腐蝕",
      "range": 1.5,
      "aggroRange": 10,
      "dmg": 35,
      "rate": 1,
      "taint": 1,
      "splash": 1.1,
      "color": "#5e9bff",
      "accuracy": 0.9,
      "taintRegen": 0,
      "walkSpeed": 75,
      "hp": 160,
      "defense": 0.25,
      "ratings": {
        "combat": 5,
        "defense": 3,
        "hp": 3,
        "load": 3
      },
      "noAggro": true,
      "confuse": 3,
      "trait": "範圍攻擊，不主動吸引仇恨。被動「蝕心毒霧」：腐蝕使異質體混亂 3 秒並攻擊同類。大招「腐蝕綻放」：每 10 秒放出一次大範圍腐蝕（傷害 2.3 倍，範圍 2.8 格）。"
    },
    "intro": "沉默而戒備的特殊個體。攻擊力強，格外依賴艾德林。",
    "captainImpression": "聽說是從深處帶出來的......一個謎樣的存在，腐蝕能力非常強大，但也可能會讓自己人陷入危機。\n不知道為什麼中心會願意採用這個傢伙作為哨兵，雖然艾德林不斷掛保證，說阿瓦倫已經非常的穩定而且可以與人良好溝通。\n不過畢竟是特殊的異質體，還是需要留點心眼注意。\n",
    "follow": {
      "radiusCells": 4,
      "speed": 96
    }
  },
  "luther": {
    "id": "luther",
    "kind": "sentinel",
    "name": "路德",
    "sprite": "luther_B",
    "combat": {
      "rank": "A",
      "role": "近戰重擊",
      "ability": "怪力",
      "range": 1,
      "aggroRange": 14,
      "dmg": 24,
      "rate": 0.5,
      "taint": 5,
      "splash": 1,
      "color": "#56973b",
      "accuracy": 0.9,
      "taintRegen": 0,
      "walkSpeed": 80,
      "hp": 160,
      "defense": 0.25,
      "ratings": {
        "combat": 4,
        "defense": 3,
        "hp": 3,
        "load": 3
      },
      "taunt": 2.6,
      "knockback": 1,
      "stun": 1,
      "rageDmg": 1,
      "noRetreat": true,
      "trait": "範圍攻擊；吸引異質體仇恨，擊退 1 格並使其停止 1 秒。被動「狂怒之血」：汙染值越高攻擊力越高（汙染 100 時為 2 倍），瀕臨暴走也不會自動撤退。大招「崩地重擊」：每 11 秒重擊周圍 3 格（傷害 3 倍），擊退 0.8 格並暈眩 2.5 秒。"
    },
    "intro": "擁有怪力的哨兵。擅長近戰重擊，害怕女生。",
    "captainImpression": "路德擁有強大的力量，不過卻很容易汙染值過高而失控，失控時的個性似乎會變得不太一樣。\n平時倒是對克莉思客客氣氣的，有克莉思在應該就不用擔心路徳的狀態。"
  },
  "eldrin": {
    "id": "eldrin",
    "kind": "guide",
    "name": "艾德林",
    "sprite": "eldrin_B",
    "combat": {
      "rank": "B",
      "role": "醫療支援",
      "ability": "治癒",
      "range": 5,
      "aggroRange": 6,
      "dmg": 10,
      "rate": 2,
      "taint": 0,
      "splash": 0,
      "color": "#6ab973",
      "accuracy": 0.9,
      "taintRegen": 0,
      "walkSpeed": 80,
      "hp": 150,
      "defense": 0.25,
      "guide": true,
      "aura": {
        "r": 2.8,
        "rate": 5,
        "heal": 6
      },
      "ratings": {
        "guide": 3,
        "combat": 2,
        "defense": 3,
        "hp": 3,
        "heal": 3
      },
      "evade": 3,
      "trait": "無精神負荷；恢復附近哨兵的生命與精神負荷，遇敵時保持距離。"
    },
    "intro": "溫柔又愛操心的嚮導。持續疏導附近隊友，適合隨隊支援。",
    "captainImpression": "溫和善良而且是非常優秀的夥伴，不論是平時幫忙研究或是到戰場上輔助，都有非常好的成績。\n不過他就是太心軟了，如果艾德林不執意要照顧那個異質體，一定能夠往上爬到更高的位置。\n而且那個異質體太喜歡黏著艾德林了，我得多多留意是否有騷擾的風險存在。"
  },
  "chris": {
    "id": "chris",
    "kind": "guide",
    "name": "克莉思",
    "sprite": "chris_B",
    "combat": {
      "rank": "A",
      "role": "戰鬥嚮導",
      "ability": "屏障",
      "range": 6,
      "aggroRange": 8,
      "dmg": 15,
      "rate": 1,
      "taint": 0,
      "splash": 0,
      "color": "#8a97a8",
      "accuracy": 1,
      "taintRegen": 0,
      "walkSpeed": 85,
      "hp": 150,
      "defense": 0.35,
      "guide": true,
      "aura": {
        "r": 2.5,
        "rate": 3,
        "heal": 4
      },
      "ratings": {
        "guide": 1,
        "combat": 3,
        "defense": 4,
        "hp": 3,
        "heal": 2
      },
      "evade": 3.5,
      "trait": "無精神負荷；恢復附近哨兵的生命與精神負荷，遇敵時保持距離。"
    },
    "intro": "懶散又親近人的戰鬥嚮導。能隨隊疏導。",
    "captainImpression": "克莉思的疏導能力並不算特別厲害，但他的體能卻十分優秀，比起多數的嚮導更能夠在地下街作戰。\n能夠在地下街自保的嚮導並不多，所以就算他一直喊著不想出任務，也還是要多安排他出勤。\n克莉思似乎覺得捉弄路徳很有趣。"
  },
  "tino": {
    "id": "tino",
    "kind": "sentinel",
    "name": "堤諾",
    "sprite": "tino_C",
    "combat": {
      "rank": "B",
      "role": "感知偵察",
      "ability": "感知",
      "range": 3,
      "aggroRange": 14,
      "dmg": 8,
      "rate": 2,
      "taint": 1,
      "splash": 0,
      "color": "#f0a63c",
      "accuracy": 0.95,
      "taintRegen": 0,
      "walkSpeed": 105,
      "hp": 110,
      "defense": 0.1,
      "ratings": {
        "combat": 3,
        "defense": 1,
        "hp": 2,
        "load": 4
      },
      "sense": 20,
      "trait": "單體攻擊。被動「夜視感知」：感官敏銳，讓玩家看見他周圍 20 格內、黑暗中的怪物（其他哨兵仍只攻擊亮處的目標）。沒有大招。"
    },
    "intro": "感官敏銳的年輕哨兵。能察覺黑暗中的怪物，但防禦與生命偏低。",
    "captainImpression": "堤諾原本是個不錯的新人哨兵，擁有優秀的感官能力可以提早發現地下街的動靜，不過近期受了重傷，恢復期至少要1年。\n記得他原本是挺活潑的一個人，但現在看起來十分落寞。"
  },
  "claire": {
    "id": "claire",
    "kind": "support",
    "name": "克萊兒",
    "sprite": "claire_A",
    "intro": "",
    "captainImpression": ""
  },
  "muomn": {
    "id": "muomn",
    "kind": "support",
    "name": "穆恩",
    "sprite": "muomn_A",
    "intro": "",
    "captainImpression": ""
  },
  "noah": {
    "id": "noah",
    "kind": "support",
    "name": "諾亞",
    "sprite": "noah_B",
    "intro": "",
    "captainImpression": ""
  },
  "ash": {
    "id": "ash",
    "kind": "support",
    "name": "亞許",
    "sprite": "ash_B",
    "intro": "",
    "captainImpression": ""
  },
  "eden": {
    "id": "eden",
    "kind": "support",
    "name": "伊德",
    "sprite": "eden_B",
    "intro": "",
    "captainImpression": ""
  },
  "salem": {
    "id": "salem",
    "kind": "support",
    "name": "薩冷",
    "sprite": "salem_B",
    "intro": "",
    "captainImpression": ""
  },
  "ball": {
    "id": "ball",
    "kind": "support",
    "name": "球球",
    "sprite": "ball_B",
    "intro": "應變中心的搜救犬，由領犬員艾德林或阿瓦倫帶領出勤。",
    "captainImpression": ""
  },
  "taana": {
    "id": "taana",
    "kind": "guide",
    "name": "塔納",
    "sprite": "taana_B",
    "combat": {
      "rank": "A",
      "role": "疏導支援",
      "ability": "淨化",
      "range": 3,
      "aggroRange": 6,
      "dmg": 0,
      "rate": 0.5,
      "taint": 0,
      "splash": 0,
      "color": "#5266ff",
      "accuracy": 1,
      "taintRegen": 0,
      "walkSpeed": 75,
      "hp": 150,
      "defense": 0.15,
      "guide": true,
      "noAttack": true,
      "careFollow": true,
      "aura": {
        "r": 3,
        "rate": 4.3333,
        "heal": 4.3333
      },
      "ratings": {
        "guide": 4,
        "combat": 1,
        "defense": 2,
        "hp": 3,
        "heal": 3
      },
      "evade": 3.5,
      "trait": "不攻擊、無精神負荷；擁有疏導光環，平時跟在需要照顧的哨兵身邊。"
    },
    "intro": "B-2 訓練室的負責人，管理練習模式和訓練場的設備。看起來一直很想下班。",
    "captainImpression": "訓練室的負責人，趁我不注意的時候在訓練室裡面擺了很多自己的家具，但沒有影響到訓練場也就放過他了。\n平常一直喊著想下班，不過工作都會好好的完成。"
  },
  "colyn": {
    "id": "colyn",
    "kind": "sentinel",
    "name": "柯林",
    "sprite": "colyn_B",
    "combat": {
      "rank": "B",
      "role": "前衛劍士",
      "ability": "劍術",
      "range": 1.5,
      "aggroRange": 18,
      "dmg": 6,
      "rate": 1.6,
      "taint": 1,
      "splash": 0,
      "color": "#fff5b3",
      "accuracy": 0.9,
      "taintRegen": 0,
      "walkSpeed": 110,
      "hp": 150,
      "defense": 0.3,
      "taunt": 3,
      "parry": {
        "self": 0.3,
        "guard": 0.2,
        "guardRange": 7
      },
      "ratings": {
        "combat": 3,
        "defense": 4,
        "hp": 3,
        "load": 2
      },
      "trait": "單體攻擊；長劍快攻，吸引附近異質體的仇恨。"
    },
    "intro": "精神很好、很會吃，常在餐廳和訓練室出沒。",
    "captainImpression": "很有活力和精神的年輕人，似乎很喜歡吃東西，跟雷徳看起來很合得來。\n不過他一天到晚一直往訓練室跑，得注意一下是否在跟著塔納。\n"
  },
  "rowan": {
    "id": "rowan",
    "kind": "support",
    "name": "羅恩",
    "sprite": "rowan_C",
    "intro": "常在餐廳出沒的路人，走路很安靜。",
    "captainImpression": ""
  },
  "cael": {
    "id": "cael",
    "kind": "support",
    "name": "凱爾",
    "sprite": "cael_C",
    "intro": "常在餐廳出沒的路人，總是在擔心羅恩。",
    "captainImpression": ""
  },
  "saku": {
    "id": "saku",
    "kind": "support",
    "name": "朔",
    "sprite": "saku_B",
    "intro": "常在餐廳出沒的路人。",
    "captainImpression": ""
  },
  "kakuma": {
    "id": "kakuma",
    "kind": "support",
    "name": "赫真",
    "sprite": "kakuma_C",
    "intro": "常在餐廳出沒的路人。",
    "captainImpression": ""
  }
};
