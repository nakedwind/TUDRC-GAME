/* ===== 水底網狀光紋的數值（由「🌊 水波紋編輯器」存出來）=====
   遊戲（js/pool-caustics.js）和水波紋編輯器都讀這一份。
   整段貼回 data/pool-caustics.js 覆蓋即可。 */
const POOL_CAUSTICS_TUNING = {
  "on": true,   // 要不要光紋（false＝不要）
  "image": "images/Poolcore/Poolcore_caustics.png",   // 水紋圖（要能無縫拼接：左邊接右邊、上面接下面看不出接縫）
  "scale": 0.8,   // 水紋圖放大幾倍（1＝原尺寸）
  "lineFrom": 0.12,   // 比底色亮多少才算水紋線（0～1：0＝比底色亮的都算、越大只留最亮的線）
  "warp": 1.5,   // 扭曲的幅度：每個點最多往旁邊挪幾點（0＝不扭曲；太大線會糊掉）
  "frames": 30,   // 扭完一輪要算幾張圖（越多越順，剛進地圖要多算一點、多佔一點記憶體）
  "loopSecs": 30,   // 扭完一輪要幾秒（越大晃得越慢）
  "drift": [1, 1],   // 整片光紋每秒往哪個方向飄幾點（左右, 上下；[0, 0]＝不飄）
  "alpha": 0.23,   // 整片光紋多亮（0～1）
  "color": [112, 193, 255],   // 光紋的顏色（紅, 綠, 藍）
  "blend": "lighter"   // 疊上去的方式：screen＝濾色（只變亮）、lighter＝相加（更亮更刺眼）、overlay＝疊加、soft-light＝柔光
};
