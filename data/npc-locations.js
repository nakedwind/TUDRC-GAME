/* ===== 基地（安全區）裡每個人平時在哪裡（由「🏠 基地編輯器」匯出，整段覆蓋即可）=====
   基地的每個房間是不同張地圖。這裡決定「誰平時待在哪張地圖、哪一區」，可以依劇情章節不同。
   建議用基地編輯器調整：選章節 → 幫每個人選地圖 → 在地圖上拖方框（rect＝[左上格 c, 左上格 r, 右下格 c, 右下格 r]）。
   ・只有寫在這裡的人會出現在基地裡；沒寫的人就不在基地（例如出任務去了）。
   ・出勤隊伍在基地裡不會跟著溫特，大家都待在自己的位置。（戰鬥地圖照舊只出現出勤隊伍。）
   ・每個人：map＝地圖名稱；rect＝活動範圍方框；area＝舊寫法（下面 NPC_AREAS 的名稱，用素材圍出範圍）。
     rect、area 都沒寫＝整張地圖閒逛。
   ・章節：NPC_LOCATIONS 用章節數字當 key。目前章節（data/balance.js 的 CHAPTER）會用「≤ 目前章節」的最大那一章；
     基地編輯器新增章節時會自動複製上一章的整份名單，再改有變動的人。
   讀取名單的程式在 js/sentry.js（npcLocation）。
*/

// 活動範圍：地圖上所有 id 以 stamps 開頭的素材圍出來的方框，再往外多 pad 格。
// stamps 可以是一個字串或陣列（多種素材一起圍）。指揮部的地板／樓梯／牆面在別的房間也有用到，所以只挑指揮部專屬的大件家具。
// 地圖上沒有這些素材時照常整張閒逛；哨兵被指派巡邏／護衛時也照指令走。
const NPC_AREAS = {
  指揮部: { stamps: ['tile_hq_monitor_wall', 'tile_hq_command_table', 'tile_hq_computer_desk', 'tile_hq_desk_vertical'], pad: 1 },
  研究部: { stamps: 'tile_research_lab_', pad: 1 },
};

const NPC_LOCATIONS = {
  1: {
    // 2F-應變中心
    ash:     { map: '2F-應變中心', area: '指揮部' },   // 通訊員
    eldrin:  { map: '2F-應變中心', area: '指揮部' },
    tino:    { map: '2F-應變中心', area: '指揮部' },   // 跟著亞許
    avaren:  { map: '2F-應變中心', area: '指揮部' },   // 艾德林在指揮部，阿瓦倫也在這裡閒逛
    noah:    { map: '2F-應變中心', area: '研究部' },   // 開發工坊
    theonie: { map: '2F-應變中心', area: '研究部' },
    chris:   { map: '2F-應變中心' },
    // 4F 哨兵宿舍樓
    red:     { map: '4F哨兵宿舍樓' },
    luther:  { map: '4F哨兵宿舍樓' },
    // 其他房間
    salem:   { map: '1F-餐廳' },
    eden:    { map: '1F-餐廳' },
    muomn:   { map: '嚮導辦公室' },
    claire:  { map: '嚮導辦公室' },
    amber:   { map: '哨兵休息室' },
  },
};
