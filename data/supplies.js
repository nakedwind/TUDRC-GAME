/* 商店賣的東西（溫特的個人補給）
   ・補給（kind: 'medical'）：use 'hp' 恢復 HP、use 'sp' 恢復 SP（精神能量）；restore＝恢復多少。戰鬥中按 Q／F 快速使用。
   ・零食（'snack'）、飲料（'drink'）：不會恢復 HP／SP，用來送禮給角色（data/gifts.js），之後也能帶去出勤當補給。
   ・圖片放在 images/道具/ */
const SUPPLIES = [
  // ---- 補給 ----
  { id:'medkit', name:'醫療包', kind:'medical', use:'hp', restore:35, price:30, file:'醫療包.png', desc:'應變中心配發的急救包。' },
  { id:'almond-water', name:'杏仁水', kind:'medical', use:'sp', restore:30, price:25, file:'杏仁水.png', desc:'溫溫的杏仁水，喝了心情會平靜下來。' },
  // ---- 零食 ----
  { id:'little-noodles', name:'小學麵', kind:'snack', price:18, file:'小學麵.png' },
  { id:'cadina', name:'卡迪這', kind:'snack', price:25, file:'卡迪這.png' },
  { id:'corn-snack', name:'可喜果', kind:'snack', price:22, file:'可喜果.png' },
  { id:'kuai-kuai', name:'乖乖', kind:'snack', price:20, file:'乖乖.png' },
  { id:'oyster-omelet', name:'阿子煎', kind:'snack', price:30, file:'阿子煎.png' },
  { id:'fish-snack', name:'南海鱈魚香絲', kind:'snack', price:28, file:'南海鱈魚香絲.png' },
  { id:'cream-puff', name:'美美小泡芙', kind:'snack', price:25, file:'美美小泡芙.png' },
  { id:'spicy-snack', name:'真有味', kind:'snack', price:34, file:'真有味.png' },
  { id:'shrimp-snack', name:'蝦未生', kind:'snack', price:28, file:'蝦未生.png' },
  { id:'cola', name:'口客', kind:'snack', price:20, file:'口客.png' },
  // ---- 飲料 ----
  { id:'water', name:'少喝水', kind:'drink', price:16, file:'少喝水.png' },
  { id:'papaya-milk', name:'木瓜牛奶', kind:'drink', price:30, file:'木瓜牛奶.png' },
  { id:'tea', name:'玉茶元', kind:'drink', price:24, file:'玉茶元.png' },
  { id:'sarsaparilla', name:'白松沙士', kind:'drink', price:26, file:'白松沙士.png' },
  { id:'tea-collection', name:'吃冰室茶集', kind:'drink', price:34, file:'吃冰室茶集.png' },
  { id:'asparagus-juice', name:'聿聿蘆筍汁', kind:'drink', price:40, file:'聿聿蘆筍汁.png' },
  { id:'vegetable-juice', name:'波蜜果菜汁', kind:'drink', price:38, file:'波蜜果菜汁.png' },
  { id:'pure-tea', name:'純喫茶', kind:'drink', price:30, file:'純喫茶.png' },
  { id:'milk-tea', name:'MY香奶茶', kind:'drink', price:32, file:'麥香奶茶.png' },
  { id:'tomato-soda', name:'番茄西打', kind:'drink', price:36, file:'番茄西打.png' },
].map(item => ({ ...item, image: 'images/道具/' + item.file }));
