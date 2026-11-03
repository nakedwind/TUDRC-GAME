/* 回憶劇情（改）：由「🎬 劇情編輯器（改）」編輯，遊戲的播放器在 js/story-kai.js。
   每段劇情用 id 當名字：map＝在哪張劇情地圖演出、cast＝演出者（no＝角色代號）、steps＝一行一行的指令（從第 1 行往下跑）。
   座標一律是格子（欄, 列，可填小數）；時間一律是毫秒（ms）。 */
const STORY_KAI = {
  "Col_memory_01": {
    "map": "map_mw0yxwzb",
    "title": "柯回憶01",
    "cast": [{ "no": 1, "char": "colyn", "sprite": "colyn_B" }],
    "steps": [
      { "do": "map", "map": "map_mw0yxwzb" },
      { "do": "cam", "at": [15.7, 30], "w": 20 },
      { "do": "vignette", "lv": 5 },
      { "do": "dark", "on": true },
      { "do": "say", "who": "", "text": "……", "shake": false },
      { "do": "say", "who": "", "text": "聲音是一層一層剝落的。", "shake": false },
      { "do": "say", "who": "", "text": "最先遠去的是槍響，悶悶地，像隔著好幾道牆有人在敲門。", "shake": false },
      { "do": "say", "who": "", "text": "接著是那些叫聲：人的叫聲短促、破碎，帶著喘；怪物的叫聲則拖得很長，長到不像是從喉嚨裡發出來的，而像是走廊本身在哀鳴。", "shake": false },
      { "do": "camMove", "at": [15.8, 23], "w": 20, "ms": 7000 },
      { "do": "sway", "who": 1, "on": true, "lv": 1 },
      { "do": "camSway", "on": true, "lv": 1 },
      { "do": "show", "who": 1, "at": [15.9, 30.8], "face": "back" },
      { "do": "act", "who": 1, "act": "light", "on": true, "r": 7 },
      { "do": "act", "who": 1, "act": "bleed", "on": true },
      { "do": "act", "who": 1, "act": "slow" },
      { "do": "act", "who": 1, "act": "hurt", "on": true },
      { "do": "camMove", "at": [15.8, 19.3], "w": 20, "ms": 3000 },
      { "do": "move", "who": 1, "at": [15.9, 20], "ms": 5000, "face": "back" },
      { "do": "sway", "who": 1, "on": true, "lv": 1 },
      { "do": "say", "who": 1, "text": "……這裡是哪裡？……大家都去哪了？", "shake": false },
      { "do": "camMove", "at": [16.3, 14.7], "w": 20, "ms": 3000 },
      { "do": "move", "who": 1, "at": [16.3, 14.7], "ms": 4000, "face": "back" },
      { "do": "wait", "ms": 800 },
      { "do": "move", "who": 1, "at": [17.4, 12.5], "ms": 2000, "face": "back" },
      { "do": "camMove", "at": [17.2, 11.5], "w": 20, "ms": 3500 },
      { "do": "move", "who": 1, "at": [17.4, 12.5], "ms": 700, "face": "left" },
      { "do": "act", "who": 1, "act": "sit", "on": true },
      { "do": "wait", "ms": 1000 },
      { "do": "say", "who": 1, "text": "我得快點回到大家身邊……", "shake": false },
      { "do": "act", "who": 1, "act": "sit", "on": false },
      { "do": "wait", "ms": 1500 },
      { "do": "move", "who": 1, "at": [13.9, 6.5], "ms": 2500 }
    ]
  }
};
