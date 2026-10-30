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
    "cameras": { "左側戰場": [8, 8.5], "右側": [20, 9.5], "全景": [16, 9], "床邊": [15.6, 10.4], "耶魯": [13.6, 8.4] },
    "points": { "耶魯的床": [11.2, 7.2] },
    "portraits": { "雷德": "red_B", "溫特": "winter_B", "哨兵": "mob_B", "嚮導": "mob_A" },
    "actors": [
      { "id": "red", "sprite": "red_B", "name": "雷德", "bed": [14, 10], "wounded": true },
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
      { "speaker": "溫特", "text": "這個失血量，哪裡還撐得住……\n幫我按住這裡。快。", "wait": 0.3 },
      { "speaker": "", "text": "雷德的眼皮動了動。\n他費力地睜開眼睛，模糊的光裡，有個人正俯身看著他。", "wait": 0.3 },
      { "speaker": "雷德", "text": "……我死了嗎？\n怎麼……有這麼漂亮的天使……", "eyes": { "red": "open" }, "wait": 1 },
      { "speaker": "溫特", "text": "別說話。你傷得很重，我正在替你治療。", "wait": 0.3 },
      { "speaker": "雷德", "text": "治療……？\n……對了。我們……被襲擊了……", "wait": 0.3 },
      { "speaker": "", "text": "雷德忽然抓住溫特的手，掙扎著想要撐起身體。", "wait": 0.3 },
      { "speaker": "雷德", "text": "天使……先別管我……\n救他……先救我的隊友……", "wait": 0.3 },
      { "speaker": "雷德", "text": "我自己會好起來……他不會……\n耶魯……拜託你……\n先救耶魯……", "wait": 0.3 },
      { "speaker": "溫特", "text": "別起來！傷口會裂開。\n先躺好，聽見沒有？", "wait": 0.3 },
      {
        "speaker": "",
        "text": "溫特按住雷德的肩膀，順著他的視線望去。\n那張行軍床上，白布已經蓋過了頭。",
        "camera": "耶魯",
        "face": { "winter": "耶魯的床" },
        "heal": false,
        "hush": true,
        "wait": 1.8
      },
      { "speaker": "溫特", "text": "…………", "camera": "床邊", "face": { "winter": "front" }, "wait": 1.4 },
      { "speaker": "", "text": "雷德仍緊緊抓著他的手，等著回答。\n溫特轉回頭，勉強擠出一點笑容。", "wait": 0.6 },
      { "speaker": "溫特", "text": "別擔心……你的隊友已經沒事了。\n", "heal": { "from": "winter", "to": "red" }, "wait": 0.9 },
      { "speaker": "溫特", "text": "現在輪到你了。\n所以躺好，讓我幫你治療......。", "wait": 0.3 },
      { "speaker": "雷德", "text": "……真的？……太好了……謝謝……", "wait": 0.3 },
      { "speaker": "", "text": "抓著溫特的手漸漸鬆開。\n雷德閉上眼睛，再次失去了意識。", "eyes": { "red": "closed" }, "wait": 1 },
      { "speaker": "溫特", "text": "............\n", "wait": 0.3 },
      { "speaker": "", "text": "溫特嘴角的笑容慢慢收起。\n他低下頭，繼續替雷德止血。", "hush": false, "wait": 1.6 },
      { "speaker": "", "text": "身後的槍聲，一直沒有停。", "wait": 0.3 }
    ],
    "opening": { "black": 3, "fade": 3, "firstExplosion": 1 },
    "explosions": { "min": 7, "max": 16, "gain": 0.5, "shake": 8 },
    "vignette": 0.2
  },
  "red_memory_03": {
    "map": "map_mvoain42",
    "title": "雷德回憶03",
    "zoom": 1.5,
    "subtitle": "六年前 · 中心大樓門口",
    "endTitle": "天使的庇護",
    "door": [10, 6],
    "footsteps": true,
    "cameras": { "開場": [11.2, 10.7, 2], "門口": [11.2, 10.2], "人行道": [11.3, 10.4], "近景": [11.2, 11.1, 2.1], "兩人近景": [11.3, 11.6, 2.1] },
    "portraits": { "雷德": "red_B", "溫特": "winter_A" },
    "actors": [
      { "id": "red", "sprite": "red_B", "name": "雷德", "at": [11.2, 10.8], "dir": "front", "carry": "images/回憶場景/relics.png" },
      { "id": "father", "image": "images/回憶場景/mob_man.png", "name": "耶魯的父親", "at": [10.2, 13.2], "dir": "back" },
      { "id": "mother", "image": "images/回憶場景/mob_woman.png", "name": "耶魯的母親", "at": [12.2, 13.2], "dir": "back" },
      { "id": "winter", "sprite": "winter_A", "name": "溫特", "at": [11.25, 8.5], "dir": "front", "speed": 45, "hidden": true }
    ],
    "beats": [
      { "speaker": "", "text": "六年前。\n那場戰役結束後的第七天。", "camera": "開場", "wait": 2 },
      { "speaker": "", "text": "雷德抱著一只紙箱，站在中心大樓門口。\n他已經在心裡練習過很多次，見到耶魯的父母時，第一句話該怎麼說。\n可真正站到他們面前，他卻只記得把紙箱抱緊。", "wait": 0.4 },
      { "speaker": "雷德", "text": "伯父、伯母……\n這些是耶魯的東西。", "wait": 0.3 },
      { "speaker": "耶魯的母親", "text": "……我看看。", "wait": 0.3 },
      { "speaker": "", "text": "耶魯的母親伸手撥了箱子裡已經拆過封的乖乖，看見了一封未寫完的明信片", "wait": 0.3 },
      { "speaker": "", "text": "她拿起了明信片，一邊看著上面寫給家人的問候，她的手開始忍不住顫抖。", "wait": 0.3, "tremble": { "mother": true } },
      { "speaker": "雷德", "text": "…………", "wait": 0.3 },
      { "speaker": "耶魯的母親", "text": "他很常提到你......\n說學長很吵、很好笑……\n說有學長在，就不會有事……", "wait": 0.3 },
      { "speaker": "耶魯的母親", "text": "他一直叫我們不要想太多，我們也就不好意思多問了......\n怕他嫌煩，也怕他在外面還要擔心家裡。", "wait": 0.3 },
      { "speaker": "耶魯的母親", "text": "結果......你今天帶了這個來？", "wait": 0.3 },
      { "speaker": "耶魯的父親", "text": "……為什麼沒有顧好他！你們為什麼沒有人去救他！", "shout": { "father": true }, "wait": 0.5 },
      { "speaker": "耶魯的父親", "text": "他才二十歲。\n我們把一個好好的人交給你們……\n現在就剩這一箱東西，你要我們怎麼辦？", "wait": 0.3 },
      {
        "speaker": "耶魯的母親",
        "text": "你不是隊長嗎！你不是很厲害嗎？\n為什麼你還好好地站在這裡，我的兒子卻……！",
        "move": { "mother": [12, 12.75] },
        "shout": { "mother": true },
        "wait": 0.3,
        "tremble": { "red": true, "mother": false }
      },
      { "speaker": "雷德", "text": "……對……對不起……\n對不起……", "move": { "father": [11.3, 13] }, "wait": 0.6, "tremble": { "red": true } },
      { "speaker": "", "text": "紙箱在雷德手裡不停發抖。\n他想說點什麼，喉嚨卻像被什麼堵住，只擠得出同一句話。", "wait": 0.3 },
      { "speaker": "雷德", "text": "對不起……是我……\n是我沒有保護好他……", "wait": 0.3 },
      { "speaker": "耶魯的父親", "text": "道歉有什麼用！\n把兒子還給我啊！！", "shout": { "father": true }, "wait": 0.3 },
      { "speaker": "", "text": "身後的自動門開了。\n一名白衣嚮導走出大樓，看了他們一眼，停下腳步。", "camera": "門口", "door": "open", "sfx": "storyDoor", "wait": 1.2 },
      { "speaker": "", "text": "他認出了雷德。\n也看見雷德抖的快要拿不住箱子的手", "move": { "winter": [12.5, 10.3] }, "wait": 2.2 },
      {
        "speaker": "",
        "text": "溫特走下台階，站到雷德面前。",
        "door": "close",
        "sfx": "storyDoor",
        "move": { "winter": [11.2, 11.75], "mother": [12.2, 13.2], "father": [10.5, 13.2] },
        "face": { "winter": "front" },
        "wait": 1.8,
        "tremble": { "mother": false, "red": false }
      },
      { "speaker": "溫特", "text": "伯父、伯母，您們好。\n我是嚮導，溫特。", "camera": "近景", "wait": 0.4 },
      { "speaker": "溫特", "text": "那場行動的嚮導支援，本來應該由我負責。\n沒能及時趕到，是我的責任。", "wait": 0.3 },
      { "speaker": "雷德", "text": "溫、溫特嚮導……？\n不是的......那天你......", "wait": 0.3 },
      { "speaker": "溫特", "text": "......你先別說話。", "face": { "winter": "back" }, "wait": 0.3 },
      { "speaker": "溫特", "text": "要怪的話，請怪我。\n是我沒有趕上。", "face": { "winter": "front" }, "wait": 0.5 },
      { "speaker": "耶魯的母親", "text": "……你現在說這些，有什麼用？\n你早一點來呢？\n你早一點到，我兒子是不是就不用死了？", "move": { "mother": [11.95, 12.95] }, "wait": 0.3 },
      { "speaker": "耶魯的母親", "text": "他才二十歲啊……！！\n二十歲的孩子！他這麼年輕...！", "shout": { "mother": true }, "wait": 0.3 },
      { "speaker": "耶魯的父親", "text": "你們這些人，平常都說得那麼好聽……\n說會保護好他們、會讓他們平安回家……\n結果呢！", "shout": { "father": true }, "wait": 0.3 },
      {
        "speaker": "",
        "text": "溫特沒有辯解。\n\n他站在那裡，聽他們說耶魯小時候的事，說最後一通電話，說那張再也寄不出去的明信片。\n\n雷德始終站在他身後。",
        "screen": "black",
        "screenFade": 3.5,
        "wait": 0.6
      },
      {
        "speaker": "",
        "text": "不知道過了多久。\n\n耶魯的父親接過紙箱。\n母親又看了雷德一眼，像是還想問什麼，最後卻只扶住丈夫的手臂。\n兩人慢慢走遠了。",
        "screen": "clear",
        "screenFade": 4,
        "camera": "人行道",
        "hide": { "father": true, "mother": true },
        "place": { "red": [10.6, 12.2], "winter": [12, 12.2] },
        "face": { "red": "winter", "winter": "red" },
        "carry": { "red": false },
        "wait": 0.8
      },
      { "speaker": "", "text": "雷德的手還維持著抱紙箱的姿勢。\n\n過了一會兒，他才放下來。", "wait": 0.3 },
      { "speaker": "雷德", "text": "那、那個……溫特嚮導……\n剛、剛才……謝……謝謝你……", "wait": 0.3 },
      { "speaker": "溫特", "text": "不用謝我。我也沒做什麼。", "wait": 0.3 },
      { "speaker": "溫特", "text": "……哨兵。那是誰都預料不到的災難。\n你已經把能做的都做了。\n你把剩下的傷員都守住了，這都是多虧了你的努力。", "camera": "兩人近景", "wait": 0.4 },
      { "speaker": "溫特", "text": "那場戰役......是中心的指揮和命令，是我們的責任。\n", "wait": 0.3 },
      { "speaker": "溫特", "text": "所以，別把這件事當成是你的錯。", "wait": 0.3 },
      { "speaker": "雷德", "text": "…………", "wait": 0.6 },
      { "speaker": "溫特", "text": "還有一件事......。\n我應該早點跟你說。", "wait": 0.8 },
      { "speaker": "雷德", "text": "……什麼？", "wait": 0.3 },
      { "speaker": "溫特", "text": "那天在救護區......我騙了你。\n我說你的隊友已經沒事了。\n……對不起。", "wait": 0.3 },
      { "speaker": "雷德", "text": "沒、沒關係！真的沒關係！", "wait": 0.3 },
      { "speaker": "雷德", "text": "我、我醒來的時候就已經知道了……\n我知道你是為了讓我撐下去，才那樣說的……", "wait": 0.3 },
      { "speaker": "雷德", "text": "所以你不用道歉……\n該道歉的是我才對，害你被罵成那樣……", "wait": 0.3 },
      { "speaker": "溫特", "text": "……是嗎。", "wait": 0.6 },
      { "speaker": "雷德", "text": "謝謝你。\n\n那天也是。剛才也是。", "wait": 0.3 },
      { "speaker": "溫特", "text": "......嗯。", "wait": 0.3 },
      { "speaker": "", "text": "大樓裡傳來推床經過的聲音。\n溫特回頭望了一眼。", "wait": 0.3 },
      { "speaker": "溫特", "text": "我該回去了。裡面還有傷員在等。", "wait": 0.3 },
      { "speaker": "", "text": "溫特說完，轉身走上台階。", "camera": "門口", "door": "open", "sfx": "storyDoor", "exit": { "winter": [11.25, 8.5] }, "wait": 0.4 },
      { "speaker": "雷德", "text": "啊……等、等一下！溫特嚮導！\n我、我也一起去！我力氣很大！我可以幫忙搬東西！", "face": { "red": "back" }, "wait": 0.3 },
      { "speaker": "", "text": "雷德慌慌張張地追了上去，跟著溫特走進了門。", "speed": { "red": 60 }, "exit": { "red": [11.25, 8.5] }, "wait": 0.2, "end": 2 }
    ],
    "opening": { "black": 1.5, "fade": 2 },
    "bgm": "music/雷德回憶01.mp3",
    "bgmVolume": 0.25,
    "vignette": 0.5
  },
  "red_memory_02": {
    "map": "map_e4459a4f-3218-4441-9f32-f052d1c683e2",
    "title": "雷德回憶02",
    "zoom": 1.75,
    "subtitle": "六年前 · 中心附設醫院",
    "endTitle": "天使的名字",
    "vignette": 0.55,
    "cameras": { "病房": [9.1, 5.3, 1.8], "床邊": [8.4, 5.4, 2.4] },
    "portraits": { "雷德": "red_B", "艾德林": "eldrin_B" },
    "actors": [
      { "id": "red", "sprite": "red_B", "name": "雷德", "bed": [7, 4], "wounded": true },
      { "id": "eldrin", "sprite": "eldrin_B", "name": "艾德林", "bed": [6, 5], "dir": "right", "speed": 40 }
    ],
    "wounded": [{ "bed": [2, 4] }, { "bed": [12, 4] }],
    "beats": [
      { "speaker": "", "text": "六年前。\n地下街那場戰役之後的第三天。", "camera": "病房", "wait": 2 },
      { "speaker": "", "text": "中心附設醫院的病房裡，點滴一滴一滴落下。\n艾德林坐在病床旁的長椅上，已經守了一整個下午。", "wait": 0.4 },
      { "speaker": "艾德林", "text": "……還是沒醒啊。", "face": { "eldrin": "red" }, "wait": 0.3 },
      { "speaker": "", "text": "雷德的眼皮動了動。", "wait": 0.6 },
      { "speaker": "雷德", "text": "……唔……\n這裡是……", "eyes": { "red": "open" }, "move": { "eldrin": [7, 5.9] }, "face": { "eldrin": "red" }, "wait": 1.2 },
      { "speaker": "艾德林", "text": "雷德！你醒了？\n這裡是中心的醫院。你已經昏睡三天了。", "camera": "床邊", "hop": { "eldrin": true }, "wait": 0.3 },
      { "speaker": "雷德", "text": "三天……？\n……哈哈……\n我還以為……這次真的要死了……", "wait": 0.3 },
      { "speaker": "雷德", "text": "艾德林，我跟你說喔……\n我好像……看到天使了。", "wait": 0.4 },
      { "speaker": "艾德林", "text": "……天使？", "wait": 0.3 },
      { "speaker": "雷德", "text": "嗯……一個超級漂亮的天使……\n在大家都快撐不住的時候出現……\n一直一直在幫大家治療……", "wait": 0.3 },
      { "speaker": "雷德", "text": "那時候我還在想……\n啊，原來人要死掉之前，真的會有天使來接啊……", "wait": 0.3 },
      { "speaker": "雷德", "text": "結果我居然沒死耶！\n果然是因為我的身體太強壯了……\n怎麼打都打不死……哈哈……咳、咳咳！", "wait": 0.3 },
      { "speaker": "艾德林", "text": "你別亂動，傷口才剛縫好。", "wait": 0.3 },
      { "speaker": "艾德林", "text": "……你說的天使……\n難道是指溫特嚮導嗎？", "wait": 0.6 },
      { "speaker": "雷德", "text": "……溫特？", "wait": 0.3 },
      { "speaker": "艾德林", "text": "那天最後趕到救護區支援的 S 級嚮導。\n聽說是他一個人，把救護區的重傷員撐了下來。", "wait": 0.3 },
      { "speaker": "艾德林", "text": "長得很漂亮的……那一位。", "wait": 0.3 },
      { "speaker": "雷德", "text": "……原來，天使有名字啊。\n溫特……溫特嚮導……", "wait": 0.6 },
      { "speaker": "雷德", "text": "我得去跟他道謝才行！\n他還跟我說……我的隊友已經沒事了。", "wait": 0.3 },
      { "speaker": "艾德林", "text": "…………", "wait": 0.6 },
      { "speaker": "雷德", "text": "對了，耶魯呢？\n那傢伙應該也在這間醫院吧？我去看看他！", "shout": { "red": true }, "wait": 0.3 },
      { "speaker": "", "text": "雷德撐著床沿，想要坐起身。", "wait": 0.3 },
      { "speaker": "艾德林", "text": "等、等一下！雷德，你先躺好……！", "hop": { "eldrin": true }, "wait": 0.3 },
      { "speaker": "雷德", "text": "怎麼了啦？我已經沒事了，你看——", "wait": 0.3 },
      { "speaker": "艾德林", "text": "不是……\n不是那樣的……", "wait": 0.4 },
      { "speaker": "艾德林", "text": "耶魯他……\n耶魯他……", "wait": 0.4 },
      { "speaker": "", "text": "艾德林握緊了手，好一會兒都說不出話。", "wait": 0.4 },
      { "speaker": "雷德", "text": "……艾德林？", "wait": 0.6 },
      {
        "speaker": "艾德林",
        "text": "那天……你們小隊被困住的地方……\n生命體從牆裡一直湧出來……\n支援……支援沒能及時趕到……",
        "screen": "black",
        "screenFade": 9,
        "screenFree": true,
        "wait": 0.6
      },
      { "speaker": "艾德林", "text": "等救援找到你們的時候……\n你們小隊……除了你以外……", "wait": 0.4 },
      { "speaker": "艾德林", "text": "……對不起，雷德。\n耶魯他……已經……", "wait": 0.6 }
    ],
    "opening": { "black": 1.5, "fade": 2 },
    "bgm": ["music/creepy-music-box01.mp3", "music/creepy-music-box01.mp3", "music/creepy-music-box02.mp3"],
    "bgmVolume": 0.45
  },
  "y25_opening": {
    "map": "map_6879940d-49a5-4caf-81f6-f76fd0f547eb",
    "title": "序章",
    "zoom": 1.6,
    "subtitle": "Y25區地下街 · 異質體討伐任務",
    "autoExit": true,
    "footsteps": true,
    "cameras": { "小隊": [28.8, 77], "魚群": [39.5, 76.6], "全景": [33.5, 76.8, 1.5], "兩人": [27.6, 77.2, 1.9], "魚嘴": [37.8, 76.4, 1.75] },
    "portraits": { "雷德": "red_B", "安柏": "amber_B", "希奧妮": "theonie_B" },
    "actors": [
      { "id": "red", "sprite": "red_B", "name": "雷德", "at": [29.8, 77.2], "dir": "right", "shield": true, "speed": 30 },
      { "id": "theonie", "sprite": "theonie_B", "name": "希奧妮", "at": [27, 76], "dir": "right", "gun": true },
      { "id": "amber", "sprite": "amber_B", "name": "安柏", "at": [27, 78.5], "dir": "right", "gun": true }
    ],
    "monsters": [
      { "id": "魚1", "type": "milkfish_kid", "at": [41.6, 76.7], "face": "left", "speed": 22 },
      { "id": "魚2", "type": "milkfish_kid", "at": [42.4, 74.6], "face": "left", "speed": 22 },
      { "id": "魚3", "type": "milkfish_kid", "at": [42.4, 78.3], "face": "left", "speed": 22 }
    ],
    "beats": [
      {
        "speaker": "雷德",
        "text": "目標在前方5公尺處！往這裡靠過來了，10秒後開始行動！",
        "camera": "小隊",
        "monsterMove": { "魚1": [39.2, 76.6], "魚2": [40.3, 74.9], "魚3": [39.9, 78.2] },
        "wait": 0.6
      },
      { "speaker": "雷德", "text": "喂！希奧妮！安柏！任務結束之後！", "face": { "red": "left" }, "shout": { "red": true }, "wait": 0.4 },
      {
        "speaker": "雷德",
        "text": "我們晚餐去吃虱目魚湯吧！",
        "camera": "魚群",
        "monsterPose": { "魚1": "smile", "魚2": "smile", "魚3": "smile" },
        "sfx": "milkfishLaugh",
        "wait": 0.3
      },
      { "speaker": "", "text": "A級異質體 NO.727\n特色：長得很像台南某個可愛的吉祥物。", "wait": 0.8 },
      {
        "speaker": "雷德",
        "text": "衝啊！就是現在！",
        "camera": "全景",
        "move": { "red": [37.4, 76.8] },
        "face": { "red": "right" },
        "speed": { "red": 130 },
        "shout": { "red": true },
        "monsterPose": { "魚1": "", "魚2": "", "魚3": "" },
        "wait": 0.1
      },
      { "speaker": "希奧妮", "text": "你看著這種東西也能有食慾嗎？", "wait": 0.6 },
      { "speaker": "安柏", "text": "隊長……！我不要吃～～！", "wait": 0.3 },
      {
        "speaker": "希奧妮",
        "text": "喂，菜鳥，趁那些魚頭聚在一起的時候動手！\n把他們電的焦焦脆脆的。",
        "camera": "兩人",
        "face": { "theonie": "amber", "amber": "theonie" },
        "wait": 0.6
      },
      { "speaker": "安柏", "text": "可是隊長還在那群魚頭裡……", "wait": 0.3 },
      { "speaker": "希奧妮", "text": "沒事啦，隊長就是吸怪的坦啊。", "wait": 0.3 },
      {
        "speaker": "雷德",
        "text": "哇～～裡面好黑！",
        "camera": "魚嘴",
        "swallow": { "魚1": "red" },
        "monsterPose": { "魚2": "attack", "魚3": "attack" },
        "face": { "theonie": "right", "amber": "right" },
        "wait": 1.4
      },
      { "speaker": "安柏", "text": "啊！！怎麼辦！隊長被吃掉了！！", "camera": "全景", "hop": { "amber": true }, "wait": 0.3 },
      { "speaker": "希奧妮", "text": "原來他是用上面的魚頭吃東西嗎？\n吃掉那種笨蛋感覺會肚子痛。", "wait": 0.3 },
      {
        "speaker": "希奧妮",
        "text": "就是現在！所有的魚頭都在吃隊長了！",
        "camera": "兩人",
        "face": { "theonie": "amber" },
        "shout": { "theonie": true },
        "monsterMove": { "魚2": [38.6, 75.4], "魚3": [38.8, 78.1] },
        "monsterPose": { "魚1": "smile" },
        "wait": 0.3
      },
      { "speaker": "安柏", "text": "（簡直就是地獄般的畫面……）", "face": { "amber": "right" }, "wait": 0.4 },
      {
        "speaker": "安柏",
        "text": "知道了！！隊長！！我來支援你了！！",
        "camera": "全景",
        "face": { "theonie": "right" },
        "charge": { "amber": true },
        "shout": { "amber": true },
        "sfx": "gachaCharge",
        "wait": 1.2
      },
      { "speaker": "希奧妮", "text": "喂……你這樣會把隊長劈死……", "thunder": true, "thunderFade": 3.5, "sweat": true, "wait": 2.6 },
      {
        "speaker": "安柏",
        "text": "什什什什什麼？？\n學姊不是說隊長的防禦力很強嗎？？？",
        "face": { "amber": "theonie", "theonie": "amber" },
        "hop": { "amber": true },
        "sweat": true,
        "wait": 0.3
      },
      { "speaker": "希奧妮", "text": "你這個爛砲兵……完蛋了……\n回去要寫一堆報告了……恭喜你殺人了。", "camera": "兩人", "wait": 0.3 },
      { "speaker": "安柏", "text": "學姊！！怎……怎麼辦？對不起！！我不是故意的！！", "tremble": { "amber": true }, "wait": 0.3 }
    ],
    "opening": { "black": 1, "fade": 1.5 },
    "bgm": "music/perfect-for-fight.mp3",
    "bgmVolume": 0.3
  }
};
