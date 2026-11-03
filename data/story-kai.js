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
      { "do": "cam", "at": [15, 30], "w": 20 },
      { "do": "say", "who": "", "text": "……", "shake": false },
      { "do": "say", "who": "", "text": "聲音是一層一層剝落的。", "shake": false },
      { "do": "say", "who": "", "text": "最先遠去的是槍響，悶悶地，像隔著好幾道牆有人在敲門。", "shake": false },
      { "do": "say", "who": "", "text": "接著是那些叫聲：人的叫聲短促、破碎，帶著喘；怪物的叫聲則拖得很長，長到不像是從喉嚨裡發出來的，而像是走廊本身在哀鳴。", "shake": false },
      { "do": "show", "who": 1, "at": [16, 29.2], "face": "back" },
      { "do": "camMove", "at": [15.1, 18.5], "w": 20, "ms": 3000 },
      { "do": "move", "who": 1, "at": [16.1, 17.6], "ms": 3000, "face": "back" },
      { "do": "act", "who": 1, "act": "slow" }
    ]
  }
};
