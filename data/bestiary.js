/* ===== 怪物圖鑑（由「📕 怪物圖鑑編輯器」匯出，整段覆蓋即可）=====
   在 2F應變中心的電腦（電腦辦公桌）前按 Space 打開。消滅過的怪物才會出現縮圖，還沒消滅過的是黑底問號。
   ・layout：每一塊的位置、大小（px，以 1060×620 的視窗為準），沒寫的用預設值（js/bestiary-config.js 的 BESTIARY_LAYOUT_DEFAULT）
   ・texts：標題、按鈕的文字；style：maxStars 星星最多幾顆、imageFrame 圖片框要不要框線、countPractice 練習室打死的算不算
   ・monsters：每一隻怪物（key＝怪物 id；史萊姆變體是 slime:splitter 這樣）：
     name 名稱、stars 星級、abilities 能力（最多 4 條，第 1 條在最下面）、about 背景介紹、image 圖片、
     imageBox 這隻自己的怪物圖片框（x、y、w 寬、h 高；沒寫＝用 layout.image）、thumbScale／thumbX／thumbY 縮圖大小（%）與位移（px）、hue 換色（史萊姆變體）、hidden 不放進圖鑑
   ・order：怪物的排列順序（沒列到的接在後面） */
const BESTIARY_CONFIG = {
  "layout": {},
  "texts": {},
  "style": {},
  "monsters": {},
  "order": []
};
