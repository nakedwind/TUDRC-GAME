/* ===== 怪物圖鑑（由「📕 怪物圖鑑編輯器」匯出，整段覆蓋即可）=====
   在 2F應變中心的電腦（電腦辦公桌）前按 Space 打開。消滅過的怪物才會出現縮圖，還沒消滅過的是黑底問號。
   ・layout：每一塊的位置、大小（px，以 1060×620 的視窗為準），沒寫的用預設值（js/bestiary-config.js 的 BESTIARY_LAYOUT_DEFAULT）
   ・texts：標題、按鈕的文字；style：maxStars 星星最多幾顆、imageFrame 圖片框要不要框線、countPractice 練習室打死的算不算
   ・monsters：每一隻怪物（key＝怪物 id；史萊姆變體是 slime:splitter、菁英怪是 bird_head:elite 這樣）：
     name 名稱、stars 星級、abilities 能力（最多 4 條，第 1 條在最上面，往下排）、about 背景介紹、image 圖片、
     imageBox 這隻自己的怪物圖片框（x、y、w 寬、h 高；沒寫＝用 layout.image）、imgScale／imgX／imgY 框裡的怪物圖片大小（%，以圖片中心縮放）與位移（px）、thumbScale／thumbX／thumbY 縮圖大小（%）與位移（px）、hue 換色（史萊姆變體）、hidden 不放進圖鑑
   ・order：怪物的排列順序（沒列到的接在後面） */
const BESTIARY_CONFIG = {
  "layout": {},
  "texts": {},
  "style": {},
  "monsters": {
    "slime": {
      "abilities": [
        "跳躍撲擊：一跳一跳靠近，撲到身上造成傷害。"
      ],
      "imgScale": 40,
      "thumbScale": 100,
      "thumbY": 0
    },
    "slime:splitter": {
      "stars": 2,
      "imgScale": 40,
      "abilities": [
        "跳躍撲擊：一跳一跳靠近，撲到身上造成傷害。",
        "分裂：被打倒時分裂成兩隻小史萊姆。"
      ],
      "thumbY": 0,
      "thumbScale": 100
    },
    "slime:mini": {
      "imgScale": 20,
      "abilities": [
        "小跳撲擊：體型小、動作快，傷害只有一半。"
      ],
      "thumbScale": 50,
      "thumbY": 2
    },
    "slime:spitter": {
      "stars": 2,
      "imgScale": 40,
      "abilities": [
        "跳躍撲擊：一跳一跳靠近，撲到身上造成傷害。",
        "分裂：被打倒時分裂成兩隻小史萊姆。"
      ],
      "thumbScale": 100,
      "thumbY": 0
    },
    "slime:bomber": {
      "stars": 3,
      "imgScale": 40,
      "abilities": [
        "自爆：靠近目標後引爆，炸傷周圍的人和建築。",
        "快速：移動速度比一般史萊姆快。",
        "同歸於盡：被打倒時也會爆炸，但威力較小。"
      ],
      "thumbY": 0,
      "thumbScale": 100
    },
    "slime:giant": {
      "stars": 4,
      "imgScale": 60,
      "abilities": [
        "重壓撲擊：跳躍撲擊，傷害是一般史萊姆的兩倍。",
        "巨大體型：血量是一般史萊姆的四倍。",
        "不動如山：完全不會被擊退。"
      ],
      "thumbScale": 100,
      "thumbY": 0
    },
    "bird_head": {
      "stars": 3,
      "imgScale": 50,
      "abilities": [
        "直線衝撞：發現目標後愣一下，接著直線衝過去，把人撞飛。",
        "破壞建築：撞到建築會把它撞壞。",
        "鎖定路線：衝撞不會轉彎，看準時機可以閃開。",
        "撞牆暈眩：撞到牆會暈一下。"
      ],
      "thumbY": 20,
      "thumbScale": 160
    },
    "bird_head:elite": {
      "stars": 7,
      "imgScale": 50,
      "abilities": [
        "號令甦醒：被驚動時大叫，喚醒核心，背後冒出鳥頭人夾擊。",
        "重型衝撞：蓄力後直衝 20 格，撞飛路線上所有人，建築直接撞爛。",
        "核心護盾：牠還活著時，守護的核心只受 40% 傷害。",
        "鋼鐵身軀：推不動、不會被電麻；撞到牆會暈好幾秒。"
      ],
      "thumbY": 20,
      "thumbScale": 180
    },
    "pearl_kid": {
      "stars": 3,
      "imgScale": 50,
      "abilities": [
        "珍珠射擊：從遠處噴出珍珠，打中很痛。",
        "保持距離：靠太近會往後飄開。",
        "飄浮：飄在空中，不會踩到地雷。",
        "閉殼防禦：被打中會閉起貝殼，這時很難打傷。"
      ]
    },
    "lifeform": {
      "stars": 5,
      "imgScale": 80,
      "abilities": [
        "橫掃：揮動身體，攻擊前方一大片範圍。",
        "不死之身：被打倒會碎成一堆，30 秒後滿血復活。",
        "怕火：只有用火才能真正消滅它。",
        "不為所動：不會被打暈，也很難被擊退。"
      ],
      "thumbY": 40,
      "thumbScale": 250
    },
    "hangi_bao": {
      "stars": 2,
      "imgScale": 50,
      "abilities": [
        "成群出現：打開順順宮帽會一次跳出好幾隻。",
        "迴力帽：丟出小帽子，飛出去和飛回來都會打到人。",
        "保持距離：靠太近會往後退開。"
      ]
    },
    "fish_head": {
      "stars": 2,
      "imgScale": 45,
      "abilities": [
        "噴水：從嘴巴噴水，傷害不高但會把人沖開。",
        "滅火：看到火會先跑去噴水滅火。",
        "抗火怕電：火焰幾乎傷不了它，雷電特別有效。",
        "膽小：被打就轉身逃跑，露出比較脆弱的背面。"
      ],
      "thumbScale": 120,
      "thumbY": 6
    },
    "loofah_lady": {
      "stars": 4,
      "imgScale": 65,
      "abilities": [
        "重踏：用力踩地，讓藤蔓鑽進地底追向目標。",
        "地底藤蔓：藤蔓會轉彎追人，地上的煙塵就是它的路線。",
        "纏繞：被纏住 7 秒不能移動，但還能攻擊。",
        "掙脫：連按方向鍵可以掙扎；隊友被纏住時用手槍射斷藤蔓。"
      ],
      "thumbY": 20,
      "thumbX": -2,
      "thumbScale": 220
    },
    "milkfish_kid": {
      "stars": 5,
      "imgScale": 65,
      "abilities": [
        "吞噬：衝向隊友一口吞下，被吞的隊友不能行動。",
        "消化：被吞的隊友會持續扣血，打倒它才能救出來。",
        "逃跑：吞下隊友後會往遠處逃。",
        "什麼都吃：會吃掉露營燈、油桶等一格大的建築和物品。"
      ],
      "thumbY": 0,
      "thumbScale": 200
    },
    "milkfish_kid_small": {
      "imgScale": 50,
      "abilities": [
        "偷吃：不攻擊人，只會吃掉一格大的物品和建築。"
      ],
      "thumbScale": 150,
      "thumbY": 5
    },
    "burrowing_mouse": {
      "stars": 4,
      "imgScale": 80,
      "imgY": 10,
      "abilities": [
        "地底伸手：從地底伸手抓人，出手前地面會先有動靜。",
        "潛地：躲在地底時，子彈和近戰都打不到。",
        "震動感應：隔著牆也找得到你。",
        "怕爆炸：爆炸會把它震出地面並暈眩。"
      ],
      "thumbY": 5,
      "thumbScale": 180
    },
    "clownfish": {
      "stars": 3,
      "imgY": -35,
      "imgScale": 80,
      "abilities": [
        "彈跳衝撞：一跳一跳前進，落地時撞傷附近的人。",
        "產卵：每次落地生一顆魚卵，靠近就會爆炸。",
        "孵化：大約一半的魚卵會孵出小丑魚幼體。",
        "魚卵陷阱：魚卵可以用槍打爆，順便炸傷旁邊的怪物。"
      ],
      "thumbY": 0,
      "thumbScale": 200
    },
    "clownfish_small": {
      "imgScale": 50,
      "imgY": -20,
      "imgX": -5,
      "imageBox": {
        "x": 99,
        "y": 86,
        "w": 320,
        "h": 320
      },
      "abilities": [
        "衝撞：跑得很快，撞到人造成少量傷害。"
      ],
      "thumbScale": 180,
      "thumbY": 0
    },
    "golden_banana_king": {
      "stars": 3,
      "imgScale": 60,
      "abilities": [
        "治癒權杖：每 10 秒幫附近所有怪物恢復 30 HP。",
        "膽小：看到人就慢吞吞地逃走，自己不會攻擊。",
        "捨身救援：看到受傷的怪物，會不顧危險靠過去補血。",
        "香蕉：打倒後會掉下香蕉，吃了可以恢復 HP。"
      ],
      "thumbScale": 200,
      "thumbY": 10
    },
    "gourd_monkey": {
      "stars": 3,
      "imgScale": 60,
      "abilities": [
        "泰山壓頂：升到空中，朝地上的紅圈砸下來，壓傷圈內的人和建築。",
        "沉重：不會硬直、打不退、推不動。",
        "拖行：貼著地面慢慢拖著走，地上留下刮痕。",
        "身寬體胖：只有一格寬的通道擠不過去。"
      ],
      "thumbScale": 200,
      "thumbY": 10
    },
    "human_face_butterfly": {
      "stars": 3,
      "abilities": [
        "三色鱗粉：綠色中毒、紫色混亂、藍色睡著 20 秒。",
        "吸滿才發作：站在霧裡量表會漲，滿了才中招。",
        "粉塵爆炸：鱗粉碰到火會連鎖爆炸，連自己都會炸到。",
        "趨光：會飛去停在露營燈、探照燈上休息，停著的時候不撒粉。"
      ]
    }
  },
  "order": [
    "slime",
    "slime:splitter",
    "slime:mini",
    "slime:spitter",
    "slime:bomber",
    "slime:giant",
    "bird_head",
    "bird_head:elite",
    "pearl_kid",
    "lifeform",
    "hangi_bao",
    "fish_head",
    "loofah_lady",
    "milkfish_kid",
    "milkfish_kid_small",
    "burrowing_mouse",
    "clownfish",
    "clownfish_small",
    "golden_banana_king",
    "gourd_monkey",
    "human_face_butterfly"
  ]
};
