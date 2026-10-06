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
      "rate": 1,
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
      "trait": "單體攻擊；使目標燒傷 5 秒，每秒受到一次傷害。"
    },
    "intro": "自信的火焰天才。擅長遠程火力，需留意負荷累積。",
    "captainImpression": "希奧妮很清楚自己的火力有多強，也有足以支撐那份自信的實力。只要有人替她守住前線，她會是隊上最可靠的遠程火力。需要注意的是，她有時會因為太想迅速解決目標，而忽略自己的精神負荷。"
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
      "trait": "範圍攻擊；在小片區域降下雷電，使異質體顫抖並停止 2 秒。"
    },
    "intro": "認真守規矩的實習哨兵。雷擊能波及多個目標，但命中較不穩定。",
    "captainImpression": "安柏做事認真，也願意遵守每一項規定。她的雷擊命中還不夠穩定，但控制異質體的能力非常有價值。只要再多一點實戰經驗，她會成為能替全隊創造機會的哨兵。"
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
      "trait": "範圍攻擊；吸引異質體仇恨，並持續恢復生命與精神負荷。"
    },
    "intro": "熱情可靠的小隊長。近距離迎敵，負荷會自行恢復。",
    "captainImpression": "雷德是那種會自然站到所有人前面的人。他耐打、恢復力強，也很擅長把危險集中到自己身上。把前線交給他，我很放心；但也得提醒他，可靠不代表什麼都要一個人扛。",
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
      "range": 2,
      "aggroRange": 10,
      "dmg": 30,
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
      "trait": "範圍攻擊；不主動吸引仇恨。腐蝕使異質體混亂 3 秒並攻擊同類。"
    },
    "intro": "沉默而戒備的特殊個體。攻擊力強，格外依賴艾德林。",
    "captainImpression": "阿瓦倫仍對周遭保持高度戒備，不會輕易相信任何人。他的腐蝕能力很危險，運用得當也能讓異質體彼此攻擊。我不會要求他立刻融入所有人；能讓他願意留在隊伍裡，本身就是信任的開始。",
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
      "taint": 8,
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
      "trait": "範圍攻擊；吸引異質體仇恨，擊退 1 格並使其停止 1 秒。汙染值越高攻擊力越高（汙染 100 時為 2 倍），瀕臨暴走也不會自動撤退。"
    },
    "intro": "擁有怪力的哨兵。擅長近戰重擊，不善應付過度親近。",
    "captainImpression": "路德的力量足以正面阻止異質體，近距離作戰能力很強。話不多，卻會默默確認身邊每個人的位置。他不擅長應付過度的關心，但真正危險時，反而是最不會後退的那一個。"
  },
  "eldrin": {
    "id": "eldrin",
    "kind": "guide",
    "name": "艾德林",
    "sprite": "eldrin_B",
    "combat": {
      "rank": "B",
      "role": "醫療支援",
      "ability": "疏導",
      "range": 5,
      "aggroRange": 6,
      "dmg": 10,
      "rate": 0.5,
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
    "captainImpression": "艾德林很溫和，卻不是軟弱。他總能及時察覺哨兵的異常，並把快要失控的人拉回來。比起自己的安全，他常常更在意別人的狀況，所以出勤時必須有人留意他的位置。"
  },
  "chris": {
    "id": "chris",
    "kind": "guide",
    "name": "克莉思",
    "sprite": "chris_B",
    "combat": {
      "rank": "A",
      "role": "戰鬥嚮導",
      "ability": "疏導",
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
    "intro": "懶散又親近人的戰鬥嚮導。能隨隊疏導，總會留意路德。",
    "captainImpression": "克莉思看起來懶散，真正進入任務後卻很少漏掉關鍵變化。她的疏導不算強，但戰鬥判斷與射擊能力足以補足這點。她習慣用輕鬆的態度掩飾關心，尤其是在路德附近。"
  },
  "tino": {
    "id": "tino",
    "kind": "sentinel",
    "name": "堤諾",
    "sprite": "tino_B",
    "combat": {
      "rank": "B",
      "role": "感知偵察",
      "ability": "感知",
      "range": 3,
      "aggroRange": 14,
      "dmg": 8,
      "rate": 2,
      "taint": 2,
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
      "trait": "單體攻擊；感官敏銳，讓玩家看見他周圍 20 格內、黑暗中的怪物（其他哨兵仍只攻擊亮處的目標）。"
    },
    "intro": "感官敏銳的年輕哨兵。能察覺黑暗中的怪物，但防禦與生命偏低。",
    "captainImpression": "堤諾的感官比任何儀器都準，黑暗中有什麼、有幾隻，他都先知道。代價是那份敏銳同樣會反噬他——氣味、聲音、太近的距離，都會讓他炸毛。不要試圖安撫他，也不要越過他的界線；把他的警告當真，並且讓亞許留在他看得到的地方就好。"
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
  }
};
