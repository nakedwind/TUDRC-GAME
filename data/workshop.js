/* ===== 諾亞的開發工坊：裝備文字、圖片與外觀（由「🔧 開發工坊編輯器」匯出，整段覆蓋即可）=====
   items：要改哪件裝備／武器（沒寫的就用 data/equipment.js 原本的設定）
     key：裝備用 id（例如 headlamp）；武器前面加 w:（例如 w:pistol）
     name 名稱、image 圖片路徑、desc 說明（還沒拿到時）、ownedDesc 說明（已擁有）、where 在哪裡拿到（只能在戰鬥區域取得的才會用到）
     levels：Lv1～Lv3 的效果說明文字（空白＝照數值自動產生）
     values：Lv1～Lv3 改過的實際數值（例如 {"dmg": 7}；沒寫的＝data/equipment.js 原本的）
   added：新增的裝備（id、名稱、部位 kind、圖片、取得方式 source、費用 cost、每一級的效果說明 levels）
   removed：刪除的原本裝備 id（武器前面加 w:）
   style：開發工坊的外觀（沒寫的就用預設值，見 js/workshop-config.js 的 WORKSHOP_STYLE_DEFAULT） */
const WORKSHOP_CONFIG = {
  "items": {},
  "added": [],
  "removed": [],
  "style": {}
};
