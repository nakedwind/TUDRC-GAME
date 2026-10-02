/* 角色資料頁匯出；保留角色 ID、對話與非戰鬥人員資料。 */
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
    "captainImpression": "",
    "dialogues": {
      "idle": [],
      "battle": [],
      "npc": [],
      "sentry": []
    }
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
      "cost": 50,
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
    "captainImpression": "希奧妮很清楚自己的火力有多強，也有足以支撐那份自信的實力。只要有人替她守住前線，她會是隊上最可靠的遠程火力。需要注意的是，她有時會因為太想迅速解決目標，而忽略自己的精神負荷。",
    "dialogues": {
      "idle": [
        "這種程度也需要我上場？",
        "我一個人會更方便",
        "火力沒有失控，是地形太脆弱。",
        "看清楚了，這才叫效率。"
      ],
      "battle": [
        "保持射界，別站到我前面。",
        "左側交給我處理。",
        "異質體正在接近，準備迎擊。",
        "火焰壓制開始。"
      ],
      "npc": [],
      "sentry": [
        "你特地過來，就是為了確認我的狀態？真是多此一舉。",
        "我的火力和距離都算得很清楚。只要其他人別擅自闖進射線，就不會有問題。",
        "需要疏導時我自然會說。現在，把最棘手的目標交給我——別浪費天才的時間。"
      ]
    }
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
      "cost": 40,
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
    "captainImpression": "安柏做事認真，也願意遵守每一項規定。她的雷擊命中還不夠穩定，但控制異質體的能力非常有價值。只要再多一點實戰經驗，她會成為能替全隊創造機會的哨兵。",
    "dialogues": {
      "idle": [
        "射程確認，開始執行任務。",
        "非常抱歉！我會重新校正。",
        "請各位不要進入攻擊範圍。",
        "克萊兒……她在安全區嗎？"
      ],
      "battle": [
        "偵測到異質體反應。",
        "雷擊座標正在校正。",
        "請離開落雷範圍。",
        "確認射界，開始攻擊。"
      ],
      "npc": [],
      "sentry": [
        "報告，我已完成裝備與射界檢查，隨時可以接受部署。",
        "命中誤差仍在容許範圍……我會再校正一次。不能讓隊友因為我的疏忽受傷。",
        "另外，克萊兒是實習嚮導，請不要把她安排得太靠近前線。這只是安全規定上的建議。"
      ]
    }
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
      "cost": 45,
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
    "dialogues": {
      "idle": [
        "嗨！今天也一起加油吧！",
        "放心的依靠我吧！",
        "先照顧其他人吧。",
        "少一個人受傷都是好事！"
      ],
      "battle": [
        "不要脫離隊形！",
        "我來擋住牠們！",
        "後方交給你們了。",
        "發現異質體，準備接敵！"
      ],
      "npc": [],
      "sentry": [
        "你來啦！別擔心，這裡有我守著，大家都很安全。",
        "我的傷和負荷都會慢慢恢復。疏導名額先留給更需要的人吧，我還撐得住！",
        "我是小隊長嘛。站在最前面、把大家平安帶回去，本來就是我該做的事。"
      ]
    },
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
      "cost": 70,
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
    "dialogues": {
      "idle": [
        "……艾德林呢？",
        "別靠太近。",
        "我沒有不穩定。",
        "不要跟別人說話..."
      ],
      "battle": [
        "……目標確認。",
        "別讓牠們靠近艾德林。",
        "腐蝕已經擴散。",
        "下一個。"
      ],
      "npc": [
        "……你不是艾德林。找我做什麼？",
        "我會待在他看得到的地方。這樣他就不會一直擔心。",
        "如果我看起來不對勁，別去叫其他人。叫艾德林來……只要他就好。"
      ],
      "sentry": [
        "……你不是艾德林。找我做什麼？",
        "我會待在他看得到的地方。這樣他就不會一直擔心。",
        "如果我看起來不對勁，別去叫其他人。叫艾德林來……只要他就好。"
      ]
    },
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
      "cost": 55,
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
      "trait": "範圍攻擊；吸引異質體仇恨，擊退 1 格並使其停止 1 秒。"
    },
    "intro": "擁有怪力的哨兵。擅長近戰重擊，不善應付過度親近。",
    "captainImpression": "路德的力量足以正面阻止異質體，近距離作戰能力很強。話不多，卻會默默確認身邊每個人的位置。他不擅長應付過度的關心，但真正危險時，反而是最不會後退的那一個。",
    "dialogues": {
      "idle": [
        "學姊…請放過我…",
        "我、我自己檢查裝備就好。",
        "請保持社交距離...",
        "需要搬開什麼就叫我。"
      ],
      "battle": [
        "退後，這裡我來擋。",
        "前方障礙由我清除。",
        "別讓牠們突破防線。",
        "目標接近，準備擊退。"
      ],
      "npc": [
        "有事的話站在那裡說就好，不、不用再靠近了。",
        "……克莉思也在前線？那傢伙總是亂來。算了，我會看著她。",
        "前面有東西要清開就叫我。你們別硬撐，我來比較快。"
      ],
      "sentry": [
        "有事的話站在那裡說就好，不、不用再靠近了。",
        "……克莉思也在前線？那傢伙總是亂來。算了，我會看著她。",
        "前面有東西要清開就叫我。你們別硬撐，我來比較快。"
      ]
    }
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
      "cost": 35,
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
    "captainImpression": "艾德林很溫和，卻不是軟弱。他總能及時察覺哨兵的異常，並把快要失控的人拉回來。比起自己的安全，他常常更在意別人的狀況，所以出勤時必須有人留意他的位置。",
    "dialogues": {
      "idle": [
        "平時要記得測量負荷值哦",
        "有沒有按時吃飯？",
        "累了就休息，不准硬撐。",
        "藥品用完要記得登記。"
      ],
      "battle": [
        "負荷升高的人立刻回報。",
        "有人受傷嗎？不要硬撐。",
        "維持隊形，我會負責疏導。",
        "阿瓦倫，不准追得太遠。"
      ],
      "npc": [
        "先站好，讓我看看。你說沒受傷不算，我確認過才算。",
        "地下街粉塵多，口罩要戴緊；水也要喝。別每次都等到不舒服才說。",
        "還有，看到阿瓦倫的話請告訴我。他說自己沒事的時候，通常最需要有人陪著。"
      ],
      "sentry": []
    }
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
      "cost": 35,
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
    "captainImpression": "克莉思看起來懶散，真正進入任務後卻很少漏掉關鍵變化。她的疏導不算強，但戰鬥判斷與射擊能力足以補足這點。她習慣用輕鬆的態度掩飾關心，尤其是在路德附近。",
    "dialogues": {
      "idle": [
        "好累……要不是為了津貼...",
        "路德呢？剛才明明還在這裡。",
        "報告晚點再寫吧。",
        "好想休息"
      ],
      "battle": [
        "需要疏導就快點說。",
        "別倒下，我可搬不動你們。",
        "我會顧著後方，專心打。",
        "嘖，又有異質體過來了。"
      ],
      "npc": [
        "你要下地下街？那我也去。先說好，我可不是突然變勤快了。",
        "作戰津貼那麼高，總不能讓路德一個人把危險的工作全搶走吧。",
        "走啦，別離我太遠。萬一負荷上升，我還能順手幫你處理。"
      ],
      "sentry": []
    }
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
      "cost": 40,
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
    "captainImpression": "堤諾的感官比任何儀器都準，黑暗中有什麼、有幾隻，他都先知道。代價是那份敏銳同樣會反噬他——氣味、聲音、太近的距離，都會讓他炸毛。不要試圖安撫他，也不要越過他的界線；把他的警告當真，並且讓亞許留在他看得到的地方就好。",
    "dialogues": {
      "idle": [
        "……離我遠一點。",
        "這裡的味道我不喜歡。",
        "吵死了。",
        "亞許呢？"
      ],
      "battle": [
        "那邊有東西，暗處。",
        "別過去，我聽得到。",
        "味道變了……牠們靠近了。",
        "有三隻，右邊。"
      ],
      "npc": [],
      "sentry": [
        "……幹嘛。有事就快說。",
        "暗的地方有什麼我知道。你們看不到，那是你們的問題，不是我在說謊。",
        "亞許沒有味道，所以我才受得了。這不代表你也可以隨便靠過來。"
      ]
    }
  },
  "claire": {
    "id": "claire",
    "kind": "support",
    "name": "克萊兒",
    "sprite": "claire_A",
    "intro": "",
    "captainImpression": "",
    "dialogues": {
      "idle": [
        "流程我有好好背熟喔！",
        "第一次實戰……沒問題的！",
        "安柏還在值勤嗎？",
        "大家要平安回來喔！"
      ],
      "battle": [],
      "npc": [
        "前、前輩好！疏導流程和緊急撤離程序，我都有好好背熟！",
        "雖然是第一次實戰有一點緊張……但只要照程序來，一定沒問題的。",
        "那個，您有看到安柏嗎？我只是想確認她有沒有又勉強自己，沒有別的意思喔！"
      ],
      "sentry": []
    }
  },
  "muomn": {
    "id": "muomn",
    "kind": "support",
    "name": "穆恩",
    "sprite": "muomn_A",
    "intro": "",
    "captainImpression": "",
    "dialogues": {
      "idle": [
        "嗚…工作做不完。",
        "戰鬥辛苦了～",
        "不想加班..."
      ],
      "battle": [],
      "npc": [
        "你終於來找穆恩了！",
        "剛才那邊傳來好大的聲音……不是穆恩弄的喔。",
        "等事情結束以後，我們一起去找東西吃吧！"
      ],
      "sentry": []
    }
  },
  "noah": {
    "id": "noah",
    "kind": "support",
    "name": "諾亞",
    "sprite": "noah_B",
    "intro": "",
    "captainImpression": "",
    "dialogues": {
      "idle": [
        "要不要聊聊？我很會保密的。",
        "今天的星座運勢不錯。",
        "那個年紀的孩子比較敏感一點。",
        "休息時間也需要一點消息嘛。"
      ],
      "battle": [],
      "npc": [
        "辛苦了。要不要坐一下？我正好知道幾件能讓你暫時忘記工作的趣事。",
        "放心，我只聊無傷大雅的部分。至於希奧妮剛才說了什麼……那就得看你想不想聽了。",
        "不過認真說，如果遇到難溝通的人就來找我吧。先聽懂對方在意什麼，事情通常就好辦多了。"
      ],
      "sentry": []
    }
  },
  "ash": {
    "id": "ash",
    "kind": "support",
    "name": "亞許",
    "sprite": "ash_B",
    "intro": "",
    "captainImpression": "",
    "dialogues": {
      "idle": [
        "嗯，都可以喔。",
        "這樣安排就好。",
        "……抱歉，我沒看清楚。",
        "堤諾又跑去哪裡了呢。"
      ],
      "battle": [],
      "npc": [
        "啊，部隊長。有什麼需要我做的嗎？都可以喔，我這邊沒什麼要緊的事。",
        "不好意思，我眼睛不太好，要走近一點才看得清楚。讓您多走幾步了。",
        "十九年前的事……我其實不太記得了。大家都說我運氣很好，那大概就是這樣吧。",
        "堤諾嗎？他不是討厭我，只是不喜歡味道而已。我在旁邊坐著就好，他會自己過來。"
      ],
      "sentry": []
    }
  }
};
