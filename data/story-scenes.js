/* 劇情資料：由「🎬 劇情編輯器」編輯；地圖編輯器重新匯出不會覆蓋這裡。
   每段劇情用 id 當名字，map＝在哪張劇情地圖演出。座標一律是格子（欄, 列，可填小數）。 */
const STORY_SCENES = {
  "red_memory_01": {
    "map": "story_start",
    "title": "雷德回憶01",
    "subtitle": "六年前 · 臨時救護區",
    "endTitle": "「天使」的謊言",
    "endText": "六年前，那句讓他安心閉上眼睛的話。",
    "darkness": true,
    "bgm": "music/雷德回憶01.mp3",
    "bgmVolume": 0.25,
    "explosions": { "min": 7, "max": 16, "gain": 0.7, "shake": 8 },
    "cameras": { "左側戰場": [8, 8.5], "右側": [20, 9.5], "全景": [16, 9], "床邊": [15.6, 10.4], "耶魯": [13.6, 8.4] },
    "points": { "耶魯的床": [11.2, 7.2] },
    "portraits": { "雷德": "red_B", "溫特": "winter_B", "哨兵": "mob_B", "嚮導": "mob_A" },
    "actors": [
      { "id": "red", "sprite": "red_B", "name": "雷德", "bed": [14, 10], "breathing": true },
      { "id": "winter", "sprite": "winter_B", "name": "溫特", "at": [27.1, 14.6], "dir": "left", "speed": 90, "hidden": true }
    ],
    "wounded": [{ "bed": [11, 10] }, { "bed": [16, 12] }, { "bed": [19, 12] }],
    "monsters": [
      { "id": "牆洞", "type": "lifeform", "at": [5.9, 7.5], "face": "right" },
      { "id": "破牆", "type": "lifeform", "at": [2.4, 12], "face": "right" },
      { "id": "右側", "type": "lifeform", "at": [26.5, 12.2], "face": "left" },
      { "id": "怪物4", "type": "lifeform", "at": [5.8, 5], "face": "right" },
      { "id": "怪物5", "type": "lifeform", "at": [29.4, 7.2], "face": "left" },
      { "id": "怪物6", "type": "lifeform", "at": [29.8, 9.8], "face": "left" }
    ],
    "shooters": [
      { "at": [8.5, 6], "dir": "left", "shoot": "牆洞" },
      { "at": [8.7, 8], "dir": "left", "shoot": "牆洞" },
      { "at": [5.5, 12.3], "dir": "left", "shoot": "破牆" },
      { "at": [22.8, 12.6], "dir": "right", "shoot": "右側" }
    ],
    "medics": [
      {
        "route": [
          { "at": [10.2, 10.9], "wait": 3.2, "face": "right", "heal": true },
          { "at": [12.6, 8.9], "wait": 0.6, "face": "right" },
          { "at": [16.8, 12.2], "wait": 3, "face": "front", "heal": true },
          { "at": [19.7, 12.2], "wait": 3.2, "face": "front", "heal": true },
          { "at": [17.2, 7.4], "wait": 0.8, "face": "left" }
        ]
      },
      {
        "delay": 1.2,
        "route": [
          { "at": [21.5, 11.6], "wait": 2, "face": "front" },
          { "at": [16.6, 7], "wait": 1.6, "face": "right" },
          { "at": [24.2, 11.4], "wait": 1.8, "face": "right" }
        ]
      },
      {
        "delay": 2.4,
        "route": [
          { "at": [11, 4.6], "wait": 1.6, "face": "front" },
          { "at": [13.4, 5.1], "wait": 2.4, "face": "right" },
          { "at": [10, 7.6], "wait": 2.6, "face": "right" }
        ]
      }
    ],
    "beats": [
      { "speaker": "", "text": "六年前。後室與地下街融合後的第三天。", "camera": "左側戰場", "wait": 2.2 },
      { "speaker": "哨兵", "text": "牆裡又鑽出來了！守住拒馬，別讓牠們靠近救護區！", "wait": 0.4 },
      { "speaker": "", "text": "槍聲沒有停過。臨時救護區裡，嚮導們在行軍床之間來回奔走。", "camera": "右側", "wait": 1.6 },
      { "speaker": "嚮導", "text": "這邊還需要止血！S 級的支援到了沒有！", "camera": "全景", "wait": 0.6 },
      { "speaker": "", "text": "一名白衣嚮導穿過煙塵，快步走向最裡面那張行軍床。", "camera": "床邊", "move": { "winter": [14.8, 10.3] }, "wait": 2.6 },
      { "speaker": "溫特", "text": "……我來。", "face": { "winter": "front" }, "heal": { "from": "winter", "to": "red" }, "wait": 0.6 },
      { "speaker": "雷德", "text": "……天使……？", "eyes": { "red": "open" }, "wait": 1 },
      { "speaker": "溫特", "text": "別說話。你傷得很重。", "wait": 0.3 },
      { "speaker": "雷德", "text": "我……沒關係……我會自己好起來的……", "wait": 0.3 },
      { "speaker": "雷德", "text": "先救耶魯……拜託……先去救他……", "wait": 0.3 },
      {
        "speaker": "",
        "text": "溫特順著他的視線看過去。那張行軍床上，白布已經蓋過了頭。",
        "camera": "耶魯",
        "face": { "winter": "耶魯的床" },
        "heal": false,
        "hush": true,
        "wait": 1.8
      },
      { "speaker": "溫特", "text": "…………", "camera": "床邊", "face": { "winter": "front" }, "wait": 1.4 },
      { "speaker": "", "text": "溫特的手停了一下。然後，他微微擠出一個笑容。", "wait": 0.6 },
      { "speaker": "溫特", "text": "……他已經沒事了。", "heal": { "from": "winter", "to": "red" }, "wait": 0.9 },
      { "speaker": "溫特", "text": "所以，你先好好休息。", "wait": 0.3 },
      { "speaker": "雷德", "text": "……太好了……謝謝……", "wait": 0.3 },
      { "speaker": "", "text": "雷德鬆開了手，安心地閉上眼睛。", "eyes": { "red": "closed" }, "wait": 1 },
      { "speaker": "", "text": "溫特沒有再笑。他低著頭，繼續替這個哨兵治療。", "hush": false, "wait": 1.6 }
    ]
  }
};
