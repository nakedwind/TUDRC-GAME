/* ===== 基地裡的 NPC 閒聊小表演（程式在 js/npc-chats.js）=====
   兩個（或更多）人偶爾會走到同一個地方，面對面聊幾句；玩家從頭上的泡泡看他們在聊什麼，聊完各自回去做原本的事。
   ・只在基地（安全區）、而且這幾個人剛好都在同一張地圖時才會發生。
   ・建議用「💬 NPC 閒聊編輯器」（閒聊編輯器.html）設定：選人、在地圖上點站位、打台詞，按「💾 存到專案」就會寫進這個檔案。
   ・每一段：
       id：名字（不重複就好）
       map：在哪張基地地圖（地圖名稱）
       who：參加的人（角色 id，NPC 或隊員都可以）；排第一個的站左邊、第二個站右邊
       stand：（選填）每個人站哪一格、面向哪邊：{ 角色: [格 c, 格 r, 'left'／'right'／'front'／'back'] }（面向沒寫＝面向其他人）
       spot：沒有 stand 時，在哪裡聊——{ tile: 地圖素材 id }＝走到那個素材（例如桌子）前面；或 [格 c, 格 r]＝走到那一格
       talks：好幾段可以聊的內容，每次隨機挑一段；每一句是 [誰, 台詞]
       chance：（選填）每次檢查時發生的機率，沒寫用 NPC_CHAT_RULES.chance
*/
const NPC_CHAT_RULES = {
  checkEvery: 25,   // 每幾秒檢查一次要不要開始聊天
  chance: 0.35,   // 檢查時發生的機率（一段沒有自己寫 chance 時）
  cooldown: 150,   // 同一段聊完後，至少隔幾秒才會再聊
  firstDelay: 8,   // 進到地圖後至少過幾秒才會開始第一段
  walkTimeout: 15,   // 走過去最多走幾秒（走不到就直接在原地聊）
  lineBase: 1.8,   // 每句泡泡至少顯示幾秒
  linePerChar: 0.11,   // 每個字再多顯示幾秒
  lineMax: 5,   // 每句最多顯示幾秒
  lineGap: 0.35,   // 兩句之間停多久（泡泡消失）
  startPause: 0.6,   // 溫特按「聽閒聊」後先停多久才開口
  waitTime: 60,   // 到定位後等溫特來聽幾秒（沒人來就散開）
  listenRange: 3,   // 離大家中間幾格內可以按 Space「聽閒聊」
  leaveRange: 20,   // 聽到一半，溫特走離幾格就當作不聽了（大家散開）
  murmurEvery: 1.8,   // 等人來聽時，頭上「…」大約隔幾秒冒一次
};
const NPC_CHATS = [
  {
    "id": "theonie-noah-lab",
    "map": "2F應變中心",
    "who": ["noah", "theonie"],
    "stand": {
      "noah": [16, 18],
      "theonie": [17, 18]
    },
    "spot": {
      "tile": "tile_research_lab_analysis_table"
    },
    "talks": [
      [
        ["noah", "你又翹掉訓練了？"],
        ["theonie", "我已經很強了，不需要訓練。"],
        ["theonie", "我比較想來開發武器。"],
        ["noah", "那就麻煩你來幫忙啦！"]
      ],
      [
        ["theonie", "這份數據是誰整理的？"],
        ["noah", "我啊，有哪裡不對嗎？"],
        ["theonie", "你整理得太隨便了吧!"],
        ["theonie", "備註寫666是什麼意思啊！"],
        ["noah", "要你管喔！"]
      ],
      [
        ["noah", "聽說昨天訓練室的沙袋又被燒掉了？"],
        ["theonie", "那不是我。"],
        ["noah", "我又沒說是妳。"],
        ["theonie", "……。"]
      ],
      []
    ]
  },
  {
    "id": "eldrin-avaren-hq",
    "map": "2F應變中心",
    "who": ["eldrin", "avaren"],
    "spot": {
      "tile": "tile_hq_command_table"
    },
    "talks": [
      [
        ["avaren", "……你又沒吃午餐。"],
        ["eldrin", "咦？你怎麼知道？"],
        ["avaren", "我還能不知道嗎？"],
        ["eldrin", "哈哈……那我們一起去餐廳吧？"],
        ["avaren", "……嗯。"]
      ],
      [
        ["eldrin", "身體有沒有不舒服嗎？"],
        ["avaren", "…沒有。"],
        ["avaren", "你才應該多注意身體。"],
        ["avaren", "你的手很涼。"],
        ["eldrin", "啊，可能是空調開太強了。"],
        ["avaren", "穿我的外套吧。"],
        ["eldrin", "我不冷啦！"]
      ],
      [
        ["avaren", "我有點不舒服...。"],
        ["eldrin", "怎麼了？是不是負荷值太高？"],
        ["avaren", "可能吧...你能幫我檢查一下嗎？"],
        ["eldrin", "知道了，等我把這個資料交出去，就帶你去疏導室！"],
        ["avaren", "...那你快一點...。"]
      ]
    ]
  },
  {
    "id": "閒聊1",
    "map": "B1訓練室",
    "who": ["taana", "colyn"],
    "stand": {
      "taana": [13, 19],
      "colyn": [11, 19]
    },
    "talks": [
      [
        ["taana", "你要在這裡待多久？"],
        ["colyn", "到我膩了為止！"],
        ["taana", "你什麼時候會膩？"],
        ["colyn", "我不會膩！"]
      ]
    ]
  }
];
