/* 劇情資料：由「🎬 劇情編輯器」編輯；地圖編輯器重新匯出不會覆蓋這裡。
   每段劇情用 id 當名字，map＝在哪張劇情地圖演出。座標一律是格子（欄, 列，可填小數）。 */
const STORY_SCENES = {
  "red_memory_01": {
    "map": "story_start",
    "title": "雷德回憶01",
    "zoom": 1.75,
    "subtitle": "六年前 · 臨時救護區",
    "endTitle": "「天使」的謊言",
    "endText": "六年前，那句讓他安心閉上眼睛的話。",
    "darkness": true,
    "bgm": "music/雷德回憶01.mp3",
    "bgmVolume": 0.25,
    "explosions": { "min": 7, "max": 16, "gain": 0.8, "shake": 8 },
    "cameras": { "左側戰場": [8, 8.5], "右側": [20, 9.5], "全景": [16, 9], "床邊": [15.6, 10.4], "耶魯": [13.6, 8.4] },
    "points": { "耶魯的床": [11.2, 7.2] },
    "portraits": { "雷德": "red_B", "溫特": "winter_B", "哨兵": "mob_B", "嚮導": "mob_A" },
    "actors": [
      { "id": "red", "sprite": "red_B", "name": "雷德", "bed": [14, 10], "breathing": true, "wounded": true },
      { "id": "winter", "sprite": "winter_B", "name": "溫特", "at": [23.9, 18.1], "dir": "left", "speed": 90, "hidden": true }
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
      { "at": [23.6, 12.2], "dir": "right", "shoot": "右側" }
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
      { "speaker": "", "text": "六年前。\n後室與地下街融合後的第 4112 天。", "camera": "左側戰場", "wait": 2.2 },
      { "speaker": "哨兵", "text": "生命體又冒出來了！\n守住拒馬！別讓牠們進救護區！", "wait": 0.4 },
      { "speaker": "", "text": "槍聲始終沒有停。\n臨時救護區裡，嚮導們在行軍床之間奔走，才替一個人止住血，另一邊又傳來呼救。", "camera": "右側", "wait": 1.6 },
      { "speaker": "嚮導", "text": "這邊還有重傷員！\nS 級的支援到了沒有？", "camera": "全景", "wait": 0.6 },
      { "speaker": "", "text": "一名白衣嚮導穿過煙塵，快步走向雷德躺的行軍床。", "camera": "床邊", "move": { "winter": [14.8, 10.3] }, "wait": 2.6 },
      { "speaker": "溫特", "text": "中間那名哨兵嗎？交給我。", "face": { "winter": "front" }, "heal": { "from": "winter", "to": "red" }, "wait": 0.6 },
      { "speaker": "嚮導", "text": "對！紅標傷員還剩他！\n溫特嚮導，拜託你了！", "wait": 0.3 },
      { "speaker": "溫特", "text": "……該死，傷口這麼深。\n怎麼到現在還沒止住血？", "wait": 0.3 },
      { "speaker": "嚮導", "text": "傷員太多了……他有自癒能力，我們以為還能撐住，才先去救其他人……", "wait": 0.3 },
      { "speaker": "溫特", "text": "這個失血量，哪裡還撐得住……\n\n幫我按住這裡。快。", "wait": 0.3 },
      { "speaker": "", "text": "雷德的眼皮動了動。\n他費力地睜開眼睛，模糊的光裡，有個人正俯身看著他。", "wait": 0.3 },
      { "speaker": "雷德", "text": "……我死了嗎？\n\n怎麼……有這麼漂亮的天使……", "eyes": { "red": "open" }, "wait": 1 },
      { "speaker": "溫特", "text": "別說話。你傷得很重，我正在替你治療。", "wait": 0.3 },
      { "speaker": "雷德", "text": "治療……？\n\n……對了。我們……被襲擊了……", "wait": 0.3 },
      { "speaker": "", "text": "雷德忽然抓住溫特的手，掙扎著想要撐起身體。", "wait": 0.3 },
      { "speaker": "雷德", "text": "天使……先別管我……\n救他……先救我的隊友……", "wait": 0.3 },
      { "speaker": "雷德", "text": "我自己會好起來……他不會……\n耶魯……拜託你……\n先救耶魯……", "wait": 0.3 },
      { "speaker": "溫特", "text": "別起來！傷口會裂開。\n先躺好，聽見沒有？", "wait": 0.3 },
      {
        "speaker": "",
        "text": "溫特按住雷德的肩膀，順著他的視線望去。\n\n那張行軍床上，白布已經蓋過了頭。",
        "camera": "耶魯",
        "face": { "winter": "耶魯的床" },
        "heal": false,
        "hush": true,
        "wait": 1.8
      },
      { "speaker": "溫特", "text": "…………", "camera": "床邊", "face": { "winter": "front" }, "wait": 1.4 },
      { "speaker": "", "text": "雷德仍緊緊抓著他的手，等著回答。\n\n溫特轉回頭，勉強擠出一點笑容。", "wait": 0.6 },
      { "speaker": "溫特", "text": "別擔心……你的隊友已經沒事了。\n", "heal": { "from": "winter", "to": "red" }, "wait": 0.9 },
      { "speaker": "溫特", "text": "現在輪到你了。\n所以躺好，讓我幫你治療......。", "wait": 0.3 },
      { "speaker": "雷德", "text": "……真的？……太好了……謝謝……", "wait": 0.3 },
      { "speaker": "", "text": "抓著溫特的手漸漸鬆開。\n\n雷德閉上眼睛，再次失去了意識。", "eyes": { "red": "closed" }, "wait": 1 },
      { "speaker": "溫特", "text": "............\n", "wait": 0.3 },
      { "speaker": "", "text": "溫特嘴角的笑容慢慢收起。\n\n他低下頭，繼續替雷德止血。", "hush": false, "wait": 1.6 },
      { "speaker": "", "text": "身後的槍聲，一直沒有停。", "wait": 0.3 }
    ],
    "opening": { "black": 3, "fade": 3, "firstExplosion": 1 }
  }
};
