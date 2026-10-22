/* ===== Y102隊員技能樹的內容（由「🧑‍🚀 Y102隊員裝備／技能編輯器」匯出，整段覆蓋即可）=====
   members：隊員 id → 技能格 id → { name：名稱, desc：技能描述, effect：技能效果（顯示的數值文字）, icon：圖示（emoji 或圖片路徑）, cost：要花幾個異質碎片, mods：實際改的數值 }
   技能格 id：trait-1（普通技能 Lv1＝原本的特性）、trait-2（Lv2）、a-1／a-2（A 系列－生存）、core-1～3（核心技能）、ult（終極核心大招）、b-1／b-2（B 系列－攻擊）、aux-1／aux-2（輔助技能）
   mods：{ path: 數值名稱, mul: 乘多少 } 或 { path, add: 加多少 }（數值名稱見 js/skills.js 開頭）
   這裡沒寫的隊員／格子，會從 data/skills.js（舊版技能資料）自動換算。 */
const SQUAD_SKILLS = {
  "members": {}
};
