/* 商店賣的東西（溫特的個人補給）
   ・補給（kind: 'medical'）：use 'hp' 恢復 HP、use 'sp' 恢復 SP（精神能量）；restore＝恢復多少。戰鬥中按 Q／F 快速使用。
   ・零食（'snack'）、飲料（'drink'）：不會恢復 HP／SP，用來送禮給角色（data/gifts.js），之後也能帶去出勤當補給。
   ・buff＝出勤補給效果（在「出勤配置」幫隊員帶上，出勤時吃掉，效果維持到回基地；js/sortie-supply.js）
     atk 攻擊、spd 攻速、def 防禦、hp 生命上限、calm 負荷累積減少（嚮導：疏導量增加）；.05 = 5%
   ・圖片放在 images/道具/ */
const SUPPLIES = [
  // ---- 補給 ----
  { id:'medkit', name:'醫療包', kind:'medical', use:'hp', restore:35, price:30, file:'醫療包.png', desc:'應變中心配發的急救包。' },
  { id:'almond-water', name:'杏仁水', kind:'medical', use:'sp', restore:30, price:25, file:'杏仁水.png', desc:'溫溫的杏仁水，喝了心情會平靜下來。' },
  // ---- 後室道具（special：基地的商店不賣，只在後室的店買得到、或在後室撿到）----
  //   act：在背包按「使用」或快捷鍵時做什麼（firstaid 急救包 H、adrenaline 腎上腺素 J）；note：背包裡的使用說明
  { id:'thermos', name:'杏仁水保溫杯', kind:'medical', use:'sp', restore:70, price:55, special:true, image:'images/裝備/almond-water-thermos.png', desc:'一整杯溫熱的杏仁水，能恢復大量 SP。' },
  { id:'firstaid', name:'急救包', kind:'medical', act:'firstaid', price:60, special:true, image:'images/裝備/first-aid-kit.png', effect:'⛑️ 治療隊友', desc:'按 H（或點下方的急救包），再點要治療的隊員頭像（左上角或急救包上方都可以）；要站在隊員旁邊，倒地的也能救起來。不能用在自己身上（溫特補血請用醫療包）。用掉一個。' },
  { id:'adrenaline', name:'腎上腺素', kind:'medical', act:'adrenaline', price:80, special:true, image:'images/裝備/adrenaline-injector.png', effect:'💉 加速', desc:'按 J 注射：一段時間內跑得更快，藥效退了會短暫變慢。用掉一個。' },
  { id:'graffiti-red', name:'塗鴉筆（紅）', kind:'medical', act:'graffiti', price:15, special:true, image:'images/塗鴉筆/pen-red.png', effect:'🖍️ 畫記號', desc:'在牆上、地板或物品上畫一個紅色記號，會一直留在那裡。畫一個用掉一支。' },
  { id:'graffiti-blue', name:'塗鴉筆（藍）', kind:'medical', act:'graffiti', price:15, special:true, image:'images/塗鴉筆/pen-blue.png', effect:'🖍️ 畫記號', desc:'在牆上、地板或物品上畫一個藍色記號，會一直留在那裡。畫一個用掉一支。' },
  { id:'graffiti-black', name:'塗鴉筆（黑）', kind:'medical', act:'graffiti', price:15, special:true, image:'images/塗鴉筆/pen-black.png', effect:'🖍️ 畫記號', desc:'在牆上、地板或物品上畫一個黑色記號，會一直留在那裡。畫一個用掉一支。' },
  { id:'charm', name:'順順宮平安符', kind:'medical', price:100, special:true, image:'images/裝備/lucky-charm.png', effect:'🧧 擋一次咬', note:'帶在身上就有效：被 Smiler 咬的時候自動用掉，擋下那一次。', desc:'順順宮求來的平安符。在黑暗中被 Smiler 咬的時候，會替你擋下一次（擋完就用掉了）。' },
  // ---- 零食 ----
  { id:'little-noodles', name:'小學麵', kind:'snack', price:18, buff:{ atk:.05 }, file:'小學麵.png' },
  { id:'cadina', name:'卡迪這', kind:'snack', price:25, buff:{ atk:.07 }, file:'卡迪這.png' },
  { id:'corn-snack', name:'可喜果', kind:'snack', price:22, buff:{ spd:.06 }, file:'可喜果.png' },
  { id:'kuai-kuai', name:'乖乖', kind:'snack', price:20, buff:{ calm:.08 }, file:'乖乖.png' },
  { id:'oyster-omelet', name:'阿子煎', kind:'snack', price:30, buff:{ hp:.10 }, file:'阿子煎.png' },
  { id:'fish-snack', name:'南海鱈魚香絲', kind:'snack', price:28, buff:{ def:.06 }, file:'南海鱈魚香絲.png' },
  { id:'cream-puff', name:'美美小泡芙', kind:'snack', price:25, buff:{ hp:.08 }, file:'美美小泡芙.png' },
  { id:'spicy-snack', name:'真有味', kind:'snack', price:34, buff:{ atk:.10 }, file:'真有味.png' },
  { id:'shrimp-snack', name:'蝦未生', kind:'snack', price:28, buff:{ spd:.08 }, file:'蝦未生.png' },
  { id:'cola', name:'口客', kind:'snack', price:20, buff:{ spd:.06 }, file:'口客.png' },
  // ---- 飲料 ----
  { id:'water', name:'少喝水', kind:'drink', price:16, buff:{ calm:.06 }, file:'少喝水.png' },
  { id:'papaya-milk', name:'木瓜牛奶', kind:'drink', price:30, buff:{ hp:.10 }, file:'木瓜牛奶.png' },
  { id:'tea', name:'玉茶元', kind:'drink', price:24, buff:{ calm:.08 }, file:'玉茶元.png' },
  { id:'sarsaparilla', name:'白松沙士', kind:'drink', price:26, buff:{ spd:.07 }, file:'白松沙士.png' },
  { id:'tea-collection', name:'吃冰室茶集', kind:'drink', price:34, buff:{ calm:.12 }, file:'吃冰室茶集.png' },
  { id:'asparagus-juice', name:'聿聿蘆筍汁', kind:'drink', price:40, buff:{ def:.10 }, file:'聿聿蘆筍汁.png' },
  { id:'vegetable-juice', name:'波蜜果菜汁', kind:'drink', price:38, buff:{ hp:.14 }, file:'波蜜果菜汁.png' },
  { id:'pure-tea', name:'純喫茶', kind:'drink', price:30, buff:{ calm:.10 }, file:'純喫茶.png' },
  { id:'milk-tea', name:'MY香奶茶', kind:'drink', price:32, buff:{ atk:.08 }, file:'麥香奶茶.png' },
  { id:'tomato-soda', name:'番茄西打', kind:'drink', price:36, buff:{ atk:.09 }, file:'番茄西打.png' },
].map(item => ({ ...item, image: item.image || 'images/道具/' + item.file }));

// ---- 出勤補給（js/sortie-supply.js）----
const SORTIE_RULES = { slots: 3, loveMul: 1.5 };   // 每人帶幾格；帶到他「最愛」的東西效果 ×1.5
const SORTIE_BUFF_KINDS = {
  atk:  { name: '攻擊',     icon: '⚔️' },
  spd:  { name: '攻速',     icon: '⚡' },
  def:  { name: '防禦',     icon: '🛡️' },
  hp:   { name: '生命上限', icon: '❤️' },
  calm: { name: '負荷累積', icon: '🍃', minus: true },   // 顯示成「−8%」；嚮導改成疏導量 +8%
};
