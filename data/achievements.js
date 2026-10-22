/* ===== 成就（由「🏆 成就編輯器」匯出，整段覆蓋即可）=====
   ・groups：分類（照這個順序顯示）
   ・list：每一個成就（照這個順序顯示）：
     id 編號（存進度用，不要改）、group 分類、name 名稱、stat 累計哪一項數字、goal 達到多少解鎖、secret 隱藏成就（達成前顯示 texts.secret）
     stat 可以用的數字：js/achievement-config.js 的 ACHIEVE_STATS；kill:怪物 id＝擊倒那種怪物的次數（跟怪物圖鑑的消滅次數同一份）
     stat 是 "custom"＝自訂條件：custom 寫要算什麼，等 Claude 寫成程式、換成正式的 stat（還沒實作前，遊戲裡不顯示這個成就）
   ・board：總覽上方「累計戰績」顯示哪些數字（stat）、叫什麼（label）
   ・texts：成就畫面上的文字；counts：總覽的「最近達成」「尚未完成」各列幾個 */
const ACHIEVEMENT_DATA = {
  "groups": [
    "討伐",
    "戰鬥",
    "嚮導",
    "任務",
    "隱藏成就",
    "小遊戲",
    "互動．物品",
    "互動．角色"
  ],
  "list": [
    { "id": "slime_10", "group": "討伐", "name": "討伐 10 隻史萊姆", "stat": "slimeKills", "goal": 10 },
    { "id": "slime_50", "group": "討伐", "name": "討伐 50 隻史萊姆", "stat": "slimeKills", "goal": 50 },
    { "id": "slime_100", "group": "討伐", "name": "討伐 100 隻史萊姆", "stat": "slimeKills", "goal": 100 },
    { "id": "slime_300", "group": "討伐", "name": "討伐 300 隻史萊姆", "stat": "slimeKills", "goal": 300 },
    { "id": "giant_1", "group": "討伐", "name": "擊倒巨型史萊姆", "stat": "giantKills", "goal": 1 },
    { "id": "giant_5", "group": "討伐", "name": "擊倒 5 隻巨型史萊姆", "stat": "giantKills", "goal": 5 },
    { "id": "bomber_10", "group": "討伐", "name": "來，爆一個", "stat": "bomberKills", "goal": 10 },
    { "id": "split_20", "group": "討伐", "name": "我裂開", "stat": "splitterKills", "goal": 20 },
    { "id": "spit_20", "group": "討伐", "name": "一切都是心酸", "stat": "spitterKills", "goal": 20 },
    { "id": "crit_10", "group": "戰鬥", "name": "打出 10 次爆擊", "stat": "crits", "goal": 10 },
    { "id": "crit_100", "group": "戰鬥", "name": "打出 100 次爆擊", "stat": "crits", "goal": 100 },
    { "id": "soothe_10", "group": "嚮導", "name": "親自疏導哨兵 10 次", "stat": "soothes", "goal": 10 },
    { "id": "soothe_50", "group": "嚮導", "name": "親自疏導哨兵 50 次", "stat": "soothes", "goal": 50 },
    { "id": "calm_1", "group": "嚮導", "name": "把暴走的隊友拉回來", "stat": "berserkCalmed", "goal": 1 },
    { "id": "calm_10", "group": "嚮導", "name": "部隊長神救援", "stat": "berserkCalmed", "goal": 10 },
    { "id": "revive_1", "group": "嚮導", "name": "我死了，我又活了！", "stat": "revives", "goal": 1 },
    { "id": "revive_5", "group": "嚮導", "name": "死了都要愛", "stat": "revives", "goal": 5 },
    { "id": "win_1", "group": "任務", "name": "第一次守住營地", "stat": "wins", "goal": 1 },
    { "id": "win_10", "group": "任務", "name": "守住營地 10 次", "stat": "wins", "goal": 10 },
    { "id": "control_1", "group": "任務", "name": "第一次徹底控制一個區域", "stat": "fullControls", "goal": 1 },
    { "id": "control_5", "group": "任務", "name": "徹底控制區域 5 次", "stat": "fullControls", "goal": 5 },
    { "id": "downed_amber_1", "group": "隱藏成就", "name": "你這個爛砲兵", "stat": "downedBy:amber", "goal": 1, "secret": true },
    { "id": "graffiti_50", "group": "隱藏成就", "name": "大藝術家", "stat": "graffitis", "goal": 50, "secret": true },
    { "id": "sit_30min", "group": "隱藏成就", "name": "偷懶大師", "stat": "longestSit", "goal": 30, "secret": true },
    { "id": "flawless_win", "group": "隱藏成就", "name": "無傷防衛線", "stat": "flawlessWins", "goal": 1, "secret": true },
    { "id": "control_no_medkit", "group": "隱藏成就", "name": "皮粗肉厚", "stat": "controlNoMedkit", "goal": 1, "secret": true },
    { "id": "fast_win", "group": "隱藏成就", "name": "速戰速決", "stat": "fastWins", "goal": 1, "secret": true },
    { "id": "stairs_50", "group": "隱藏成就", "name": "雙腿抽筋", "stat": "stairFloors", "goal": 50, "secret": true },
    { "id": "elevator_streak_30", "group": "隱藏成就", "name": "沙發馬鈴薯", "stat": "elevatorStreak", "goal": 30, "secret": true },
    { "id": "others_bed_5", "group": "隱藏成就", "name": "睡睡平安", "stat": "othersBeds", "goal": 5, "secret": true },
    { "id": "move_5min", "group": "隱藏成就", "name": "一秒都不能鬆懈", "stat": "longestMove", "goal": 5, "secret": true },
    { "id": "all_rooms", "group": "隱藏成就", "name": "查水錶", "stat": "allRooms", "goal": 1, "secret": true },
    { "id": "all_chairs", "group": "隱藏成就", "name": "說到坐到", "stat": "allChairs", "goal": 1, "secret": true },
    { "id": "all_snacks", "group": "隱藏成就", "name": "VIP會員", "stat": "allSnacks", "goal": 1, "secret": true },
    { "id": "broke_in_battle", "group": "隱藏成就", "name": "孤注一擲", "stat": "brokeInBattle", "goal": 1, "secret": true },
    { "id": "idle_30min", "group": "隱藏成就", "name": "沉思者", "stat": "longestIdle", "goal": 30, "secret": true },
    { "id": "almond_50", "group": "隱藏成就", "name": "杏好有你", "stat": "almondInBattle", "goal": 50, "secret": true },
    { "id": "acid_death_30", "group": "隱藏成就", "name": "我就知道是你，又是你，你最爛", "stat": "acidDeaths", "goal": 30, "secret": true },
    { "id": "all_white_eye", "group": "隱藏成就", "name": "啾！啾啾～", "stat": "allWear:bird-green", "goal": 1, "secret": true },
    { "id": "own_bed", "group": "隱藏成就", "name": "嗚呼～超大雙人床！", "stat": "ownBed", "goal": 1, "secret": true },
    { "id": "pistol_50000", "group": "隱藏成就", "name": "聽我說，這比魔法好用！", "stat": "pistolDamage", "goal": 50000, "secret": true },
    { "id": "talk_all", "group": "互動．角色", "name": "社交達人", "stat": "talkedAll", "goal": 1 },
    { "id": "gift_20", "group": "互動．角色", "name": "禮輕情意重", "stat": "gifts", "goal": 20 },
    { "id": "tp_score_1000", "group": "小遊戲", "name": "神射手", "stat": "tpBestScore", "goal": 1000 },
    { "id": "tp_shots_130", "group": "小遊戲", "name": "子彈不用錢", "stat": "tpMostShots", "goal": 130 },
    { "id": "vend_items_100", "group": "互動．物品", "name": "在販賣機購買 100 件商品", "stat": "vendItems", "goal": 100 },
    { "id": "vend_buys_50", "group": "互動．物品", "name": "在販賣機購買 50 次商品", "stat": "vendBuys", "goal": 50 },
    { "id": "vend_spent_10000", "group": "互動．物品", "name": "在販賣機花費 10,000 元", "stat": "vendSpent", "goal": 10000 },
    { "id": "shop_items_100", "group": "互動．物品", "name": "在商店購買 100 件商品", "stat": "shopItems", "goal": 100 },
    { "id": "shop_buys_50", "group": "互動．物品", "name": "在商店購買 50 次商品", "stat": "shopBuys", "goal": 50 },
    { "id": "shop_spent_10000", "group": "互動．物品", "name": "在商店花費 10,000 元", "stat": "shopSpent", "goal": 10000 },
    { "id": "money_spent_100000", "group": "互動．物品", "name": "家財散盡", "stat": "moneySpent", "goal": 100000 },
    { "id": "gacha_50", "group": "互動．物品", "name": "錢沒有不見，只是變成喜歡的樣子", "stat": "gachaPulls", "goal": 50 },
    { "id": "crystal_spent_100000", "group": "互動．物品", "name": "一直異質花", "stat": "crystalsSpent", "goal": 100000 },
    { "id": "crystal_earned_10000", "group": "互動．物品", "name": "異質礦工", "stat": "crystalsEarned", "goal": 10000 }
  ],
  "board": [
    { "stat": "slimeKills", "label": "討伐史萊姆" },
    { "stat": "giantKills", "label": "擊倒巨型" },
    { "stat": "crits", "label": "爆擊" },
    { "stat": "soothes", "label": "親自疏導" },
    { "stat": "berserkCalmed", "label": "平息暴走" },
    { "stat": "wins", "label": "守住營地" },
    { "stat": "fullControls", "label": "徹底控制" }
  ],
  "texts": {
    "title": "成就",
    "subtitle": "Y102 應變編組的戰績紀錄",
    "overview": "總覽",
    "total": "已達成",
    "recent": "最近達成",
    "pending": "尚未完成",
    "empty": "還沒有達成的成就，出去打一場吧！",
    "toast": "達成成就",
    "secret": "？？？",
    "doneDate": "達成"
  },
  "counts": {
    "recent": 3,
    "pending": 3
  }
};
