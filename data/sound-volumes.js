/* 音效音量（由音效編輯器匯出）：每個音效的音量倍率，1＝原本大小，沒列出的就是 1。
   名稱對應 js/sfx.js 裡的音效；footsteps＝溫特走路的腳步聲。
   調整方式：打開「音效編輯器.html」拖滑桿試聽，調好後下載這個檔案覆蓋。 */
const SOUND_GAIN_DEFAULT = {
  "berserk": 1.2,
  "birdDeath": 1.35,
  "birdHurt": 0.35,
  "birdRun": 1.5,
  "birdWalk": 1.75,
  "flare": 1.35,
  "footsteps": 2.6,
  "hit": 3,
  "kill": 1.85,
  "rangedShot": 1.35,
  "reload": 0.8
};
