/* 場景置物箱：鑰匙拾取、解鎖外觀與永久開箱狀態。 */
const STORAGE_LOCKER_IDS = new Set(['tile_interactive_storage_locker','tile_interactive_storage_locker_open']);
const STORAGE_LOCKER_KEY_TILE = 'tile_interactive_storage_locker_key';
const WORLD_PICKUPS = {
  key: { item: 'storage-locker-key', name: '置物櫃鑰匙' },
  battery: { item: 'battery', name: '電池' },
  almond: { item: 'almond-water', name: '杏仁水' },
  adrenaline: { item: 'adrenaline', name: '腎上腺素' },
  doorKey: { item: 'backroom-door-key', name: '後室門鑰匙' },
  pen: { item: 'graffiti', name: '塗鴉筆' },
};
// 地上的塗鴉筆：現在只有一種素材；以前紅／藍／黑三種素材的 id 也認得（撿到的都是同一支筆）
const GRAFFITI_PICKUP_TILES = { tile_interactive_pickup_graffiti: 'pen', tile_interactive_pickup_graffiti_red: 'pen', tile_interactive_pickup_graffiti_blue: 'pen', tile_interactive_pickup_graffiti_black: 'pen' };
const isWorldPickup = kind => !!WORLD_PICKUPS[kind];
const unlockedStorageLockers = new Set(), collectedStorageKeys = new Set();
function storagePropKind(id){
  const tile=mapTileById(id);
  const file=String(tile?.file||'').replaceAll('\\','/');
  const name=String(tile?.name||'').trim().toLowerCase();
  // 編輯器上傳會把圖片轉成 data URL，需同時認素材 ID 與名稱。
  if(GRAFFITI_PICKUP_TILES[id])return GRAFFITI_PICKUP_TILES[id];
  if(id==='tile_interactive_pickup_backroom_door_key')return 'doorKey';
  if(id==='tile_interactive_pickup_adrenaline')return 'adrenaline';
  if(id===STORAGE_LOCKER_KEY_TILE||/storage-locker-key|置物[箱櫃]鑰匙/.test(name))return 'key';
  if(id==='tile_interactive_pickup_battery'||/^(battery(?:\.png)?|電池(?:\.png)?|拾取亮點（電池）)$/.test(name)||file.endsWith('/電池.png'))return 'battery';
  if(id==='tile_interactive_pickup_almond_water'||/almond-water|杏仁水/.test(name)||(file.endsWith('/杏仁水.png')||file.endsWith('/杏仁水小.png')))return 'almond';
  if(file.endsWith('/storage-locker-key.png')||(file.endsWith('/置物箱鑰匙.png')||file.endsWith('/置物櫃鑰匙.png')))return 'key';
  if(file.endsWith('/items/battery.png'))return 'battery';
  if(file.endsWith('/items/almond-water-large.png')||file.endsWith('/items/almond-water-small.png'))return 'almond';
  if(/power-switch-(on|off)\.png$/.test(file))return 'power';   // 後室的開關，和池核的 Poolcore_power-switch-on／off 都算
  if(/\/dynamo-(open|close)\.png$/.test(file)&&dynamoInteractiveMap(MAP))return 'dynamo';   // 發電機（dynamo-open／dynamo-close）：只有 DYNAMO_MAPS 和捷運站的地圖能按空白鍵開關（其他地圖只是裝飾）
  if(file.endsWith('/storage-locker-open.png'))return 'open';
  if(file.endsWith('/storage-locker-closed.png'))return 'closed';
  return null;
}
// 省效能：同一張地圖裡，同一個素材的種類不會變，算過一次就記起來（換地圖才重算）
const storagePropKindMemo=new Map();
let storagePropKindMap=null;
function storagePropKindCached(id){
  if(storagePropKindMap!==MAP){storagePropKindMemo.clear();storagePropKindMap=MAP;}
  if(!storagePropKindMemo.has(id))storagePropKindMemo.set(id,storagePropKind(id));
  return storagePropKindMemo.get(id);
}
// 省效能：地圖上哪幾格放了置物箱、拾取物、電源開關。整張地圖有幾千格，以前每一幀要整張掃好幾次（會卡），
// 現在換地圖（或物件數量變了）才重掃一次、記起來。開箱、撿走這些會變的狀態，下面 storagePropEntries 照樣每次重新看。
let storagePropScan=null;   // { map, stamps, list }
function storagePropSpots(){
  const stamps=(MAP.stamps||[]).length;
  if(storagePropScan&&storagePropScan.map===MAP&&storagePropScan.stamps===stamps)return storagePropScan.list;
  const list=[];
  for(const s of MAP.stamps||[]) if(storagePropKindCached(s.id)) list.push({id:s.id,c:s.c,r:s.r,layer:s.layer||'top',stamp:s});
  for(const [layer,tiles] of Object.entries(MAP.layers||{})) for(const [key,id] of Object.entries(tiles)){
    if(!storagePropKindCached(id))continue;
    const [c,r]=key.split(',').map(Number);list.push({id,c,r,layer,stamp:null});
  }
  storagePropScan={map:MAP,stamps,list};
  return list;
}
function storagePropToken(id,c,r,layer,ox=0,oy=0){
  return JSON.stringify([MAP.id || MAP_INDEX,id,c,r,layer,ox,oy]);
}
function storagePropEntries(){
  if(!MAP) return [];
  const entries=[];
  const add=(id,c,r,layer,stamp=null)=>{
    const kind=storagePropKindCached(id);if(!kind)return;
    const t=mapTileById(id); if(!t) return;
    const ox=stamp?.ox||0,oy=stamp?.oy||0;
    const token=storagePropToken(id,c,r,layer,ox,oy);
    if(isWorldPickup(kind)&&collectedStorageKeys.has(token))return;
    const x0=OX+c*CELL+ox,y0=OY+r*CELL+oy;
    const hidden=isWorldPickup(kind)&&(MAP.hiddenPickups||[]).includes(layer+':'+c+','+r);   // 隱藏的拾取物：沒有亮點，靠近才有提示（地圖編輯器「🙈 隱藏拾取」）
    entries.push({id,kind,token,stamp,hidden,x:x0+mapTileW(t)*CELL/2,y:y0+mapTileH(t)*CELL-CELL/2,top:y0,
      open:kind==='open'||unlockedStorageLockers.has(token)});
  };
  for(const s of storagePropSpots()) add(s.id,s.c,s.r,s.layer,s.stamp);   // 順序跟以前一樣：先大圖章、再各圖層的格子
  for (const drop of G?.equipmentDrops || []) entries.push({ kind:'equipment-drop', drop, x:drop.x, y:drop.y, top:drop.y-28 });
  for (const drop of G?.groundItems || []) if (!G.player || onFloor(drop.floor || 1, G.player)) entries.push({ kind:'ground-item', drop, x:drop.x, y:drop.y, top:drop.y-30 });   // 溫特自己放在地上的、怪物掉的（js/ground-items.js）；陸橋上、橋下的東西要在同一層才撿得到
  return entries;
}
// filter：只找某一類（例如 isPickupProp＝只找可以拾取的東西）
function storagePropNearPlayer(filter){
  const p=G?.player;if(!p||p.sitting||p.hp<=0)return null;
  let nearest=null,distance=72;
  for(const prop of storagePropEntries()){
    if(filter&&!filter(prop))continue;
    if(typeof poolPlatformPropBlocked==='function'&&poolPlatformPropBlocked(prop))continue;   // 深水裡平台上的發電機：要先上岸（js/pool-platform.js）
    const power=prop.kind==='power';   // 電源開關：判定範圍半徑 50、往下移 30 像素
    const d=Math.hypot(prop.x-p.x,prop.y+(power?30:0)-p.y);
    if(d<distance&&(!power||d<50)){nearest=prop;distance=d;}
  }
  return nearest;
}
function storagePropPrompt(prop){
  if(prop.kind==='ground-item')return '拾取'+groundItemName(prop.drop)+(prop.drop.qty>1?' ×'+prop.drop.qty:'');
  if(prop.kind==='equipment-drop')return '拾取'+(prop.drop.item?(itemById(prop.drop.item)?.name||'道具'):(equipDef(prop.drop.id)?.name||'裝備'));
  if(isWorldPickup(prop.kind))return '拾取';
  if(prop.kind==='power'&&(typeof poolIsValve==='function'?poolIsValve(prop.stamp):!!(prop.stamp&&prop.stamp.valve)))return '打開抽水閥';   // 抽水閥（js/pool-tide.js）
  if(prop.kind==='power')return mapPowerIsOn(circuitOf(prop.stamp))?'關閉電源':'開啟電源';
  if(prop.kind==='dynamo')return dynamoIsOn(prop.token)?'關閉發電機':'啟動發電機';
  if(prop.open)return '查看置物箱';
  return (supplyInventory.get('storage-locker-key')||0)>0?'用鑰匙開啟置物箱':'置物箱已上鎖（需要鑰匙）';
}
// 可以拾取的東西（地上的拾取亮點、怪物掉的道具／裝備、溫特自己放在地上的）：互動優先順序比置物櫃、電源這類地圖物件高
const isPickupProp=prop=>prop.kind==='equipment-drop'||prop.kind==='ground-item'||isWorldPickup(prop.kind);
const pickupPropNearPlayer=()=>storagePropNearPlayer(isPickupProp);
// Shared by player interaction and the rescue dog; stale targets cannot grant loot twice.
function pickupStorageProp(prop){
  if(!prop||!isPickupProp(prop))return false;
  if(prop.kind==='ground-item'){if(!pickupGroundItem(prop.drop))return false;saveGame();return true;}
  if(prop.kind==='equipment-drop'){
    if(!(G.equipmentDrops||[]).includes(prop.drop))return false;
  }else if(collectedStorageKeys.has(prop.token)||!storagePropEntries().some(p=>p.token===prop.token))return false;
  if(prop.kind==='equipment-drop'){
    if(prop.drop.item){   // 後室道具（平安符）
      if(!supplyGain(prop.drop.item,1))return false;   // 拿不下：留在地上
      sfx('itemPickup');showItemPickupNotice(prop.drop.item,1);
    }else if(grantEquipment(prop.drop.id,'拾取了'))sfx('itemPickup');
    G.equipmentDrops=(G.equipmentDrops||[]).filter(drop=>drop!==prop.drop);
    updateHUD();saveGame();
  }else{
    const loot=WORLD_PICKUPS[prop.kind];
    if(!supplyGain(loot.item,1))return false;   // 拿不下（持有上限）：留在地上
    collectedStorageKeys.add(prop.token);sfx('itemPickup');
    showItemPickupNotice(loot.item,1);
    updateHUD();saveGame();
  }
  return true;
}
function useStoragePropNearPlayer(filter){
  const prop=storagePropNearPlayer(filter);if(!prop)return false;
  if(isPickupProp(prop))return pickupStorageProp(prop);
  if(prop.kind==='power'&&(typeof poolIsValve==='function'?poolIsValve(prop.stamp):!!(prop.stamp&&prop.stamp.valve))){
    if(typeof usePoolValve==='function')usePoolValve();   // 抽水閥：深水區抽乾（js/pool-tide.js）
  }else if(prop.kind==='power'){
    const n=circuitOf(prop.stamp);toggleMapPower(n);sfx('powerOn');systemNotice(mapPowerIsOn(n)?'電源已開啟':'電源已關閉');
  }else if(prop.kind==='dynamo'){
    if(typeof poolPumpLocked==='function'&&poolPumpLocked()){sfx('switch');systemNotice(POOL_TIDE.pumpedText);return true;}   // 抽水機打開過就關不掉（js/pool-tide.js）
    if(dynamoStationMap(MAP)&&dynamosAllOn()){sfx('switch');systemNotice('發電機運轉中，捷運已恢復運行');return true;}   // 捷運站：全部打開之後就關不掉（不然開到一半的列車會卡住）
    toggleDynamo(prop.token);sfx('powerOn');
    const [on,total]=dynamoCount();
    if(dynamosAllOn()){
      sfx('dynamoStart');   // 全部打開：發電機發動的聲音（只播一次，比平常大聲：音量在音效編輯器調；之後靠近開著的發電機會一直聽到運轉聲，js/dynamo-sound.js）
      if(dynamoStationMap(MAP))sfx('mrtPowerSteam');   // 捷運站：最後一台打開時再加一聲發動蒸氣音（音量在音效編輯器調）
      if(dynamoStationMap(MAP)&&typeof mrtPowerOnFx==='function')mrtPowerOnFx();   // 捷運站：畫面震一下，接著播一次捷運站的環境聲（js/mrt-train.js）
      systemNotice(dynamoStationMap(MAP)?'發電機全部啟動，捷運恢復運行':'發電機全部啟動（'+on+'／'+total+'）');
    }else systemNotice(dynamoIsOn(prop.token)?'發電機已啟動（'+on+'／'+total+'）':'發電機已關閉（'+on+'／'+total+'）');
    if(typeof poolPumpCheck==='function')poolPumpCheck();   // 全部打開：開始抽水
  }else if(prop.open){
    flash('置物箱已打開',prop.x,prop.top-8,'#dce6ed',1.2);
  }else if((supplyInventory.get('storage-locker-key')||0)<=0){
    sfx('error');flash('需要鑰匙',prop.x,prop.top-8,'#ffcf89',1.4);
  }else if(lockerBagFull(prop.stamp?.lockerLoot)){
    showLockerBagFull(prop.stamp?.lockerLoot,'置物櫃');   // 箱子不打開、鑰匙不扣，東西留在裡面
  }else{
    const remainingKeys=supplyInventory.get('storage-locker-key')-1;
    if(remainingKeys>0)supplyInventory.set('storage-locker-key',remainingKeys);
    else supplyInventory.delete('storage-locker-key');
    unlockedStorageLockers.add(prop.token);setupStorageBoxWalls();computeFlow();sfx('door');systemNotice('已打開置物箱，消耗 1 支鑰匙');
    const loot=prop.stamp?.lockerLoot;
    // 開出來的東西每次都跳視窗（js/item-intro.js）；什麼都沒有就飄字
    const before=typeof itemIntroCount!=='undefined'?itemIntroCount:0;
    if(typeof itemIntroFromLocker!=='undefined')itemIntroFromLocker=true;
    try{
      if(loot)grantLockerLoot(loot);
      else rollRandomContainerLoot(prop.x,prop.top,'置物箱');
    }finally{if(typeof itemIntroFromLocker!=='undefined')itemIntroFromLocker=false;}
    if(typeof itemIntroCount!=='undefined'&&itemIntroCount===before)flash('空的',prop.x,prop.top-8,'#dce6ed',1.6);
    updateHUD();saveGame();
  }
  return true;
}
// 沒指定內容物的置物櫃、彈藥箱：隨機開出東西，一次最多只會得到一樣
// 做法：1. 先抽特殊子彈（ammoChance：置物櫃 GUN_FINDS.ammo；彈藥箱傳 AMMO_CRATE_LOOT.ammo，比較高），抽中就停
//       2. 沒抽中子彈：把其他東西的順序打亂，一樣一樣抽（機率在 data/equipment.js 的 ITEM_DROPS 等），抽中一樣就停
// 所以「開到子彈的機率」就是設定檔寫的那個數字；其他東西只在沒開到子彈時才有機會
function rollRandomContainerLoot(x,y,where,ammoChance,ammoCount){   // ammoCount：開到子彈給幾發（彈藥箱＝一組；沒給＝照 GUN_FINDS.ammoFind）
  if(typeof tryGunFind==='function'&&tryGunFind(x,y,ammoChance??GUN_FINDS.ammo,where,ammoCount))return true;   // 特殊子彈（js/special-guns.js）
  const tries=[
    ()=>typeof tryEquipDrop==='function'&&tryEquipDrop('thermos',x,y),   // 保溫瓶
    ()=>typeof tryEquipDrop==='function'&&tryEquipDrop('adrenaline',x,y),   // 腎上腺素
    ()=>typeof tryEquipDrop==='function'&&tryEquipDrop('anomaly-firstaid',x,y),   // 異質急救包
    ()=>typeof tryEquipDrop==='function'&&tryEquipDrop('toolbox',x,y),   // 工具箱
    ()=>typeof tryEquipDrop==='function'&&tryEquipDrop('almond-water',x,y),   // 杏仁水
    ()=>typeof tryEquipDrop==='function'&&tryEquipDrop('medkit',x,y),   // 醫療包
    ()=>typeof tryEquipDrop==='function'&&tryEquipDrop('firstaid',x,y),   // 急救包
    ()=>typeof tryEquipDrop==='function'&&tryEquipDrop('eye-drops',x,y),   // 眼藥水
    ()=>typeof tryEquipDrop==='function'&&tryEquipDrop('battery',x,y),   // 電池
    ()=>where!=='彈藥箱'&&tryLockerFoodFind(x,y),   // 烤熟的食物（只有置物箱，data/equipment.js 的 LOCKER_FOOD）
    ()=>typeof tryGraffitiPenFind==='function'&&tryGraffitiPenFind(x,y),   // 塗鴉筆（js/graffiti.js）
    ()=>typeof tryYouyouCardFind==='function'&&tryYouyouCardFind(),   // 好遊卡（js/mrt-locks.js）
  ];
  for(let i=tries.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tries[i],tries[j]]=[tries[j],tries[i]];}   // 打亂順序，每一樣排在前面的機會一樣
  for(const t of tries)if(t())return true;   // 抽中一樣（真的拿到）就停
  return false;
}
// 置物箱開到烤熟的食物：先照 LOCKER_FOOD.chance 抽有沒有，有就從 LOCKER_FOOD.items 隨機挑一種放進背包；真的拿到回傳 true
function tryLockerFoodFind(x,y){
  if(typeof LOCKER_FOOD==='undefined'||MAP_SAFE||Math.random()>=LOCKER_FOOD.chance)return false;
  const list=LOCKER_FOOD.items.filter(id=>itemById(id));if(!list.length)return false;
  const id=list[Math.floor(Math.random()*list.length)];
  if(!supplyGain(id,1))return false;   // 持有上限：拿不下就當沒抽到，換抽別樣
  showItemPickupNotice(id,1);
  if(typeof flash==='function')flash('🍢 '+itemById(id).name,x,y-40,'#ffd479',2.5);
  return true;
}
// 背包滿了：開箱前先看放不放得下。放不下＝跳視窗、箱子蓋回去（不算開過），東西留在箱子裡，整理背包後再來開
// loot：地圖編輯器指定的內容物；沒指定＝隨機，開得出來的都是「物品」分類，那一類格子滿了就算滿
const lockerLootIsBullet=loot=>loot?.kind==='bullet'||loot?.kind==='weapon';
function lockerBagFull(loot){
  if(!loot)return bagUsedSlots(supplyInventory,'consumable')>=bagCapacity('consumable');
  if(loot.kind==='item')return carryRoom(loot.id)<=0;
  if(lockerLootIsBullet(loot))return typeof bulletRoom==='function'&&bulletRoom(loot.id)<=0;
  return false;   // 裝備、空箱：不佔背包
}
function showLockerBagFull(loot,where){
  const ammo=lockerLootIsBullet(loot),bag=ammo?'彈藥包':'背包';
  // 圖：背包＝畫面下方背包按鈕的那張圖；彈藥包＝開發工坊「彈藥包擴充」的圖（data/equipment.js 的 BAG_UPGRADES）
  const image=ammo?(typeof BAG_UPGRADES!=='undefined'&&BAG_UPGRADES.ammo?.image)||'':'images/weapon/Backpack.png';
  itemIntro({key:'bag-full',always:true,headline:bag+'已滿',image,icon:ammo?'🧰':'🎒',sound:'noticePopup',name:bag+'已經滿了',
    desc:'這個'+where+'先不打開，裡面的東西會留在'+where+'裡。整理'+bag+'、空出位置後再回來打開。'});
}
// where：飄字裡說在哪裡找到的（彈藥箱也用這裡，js/flare.js）
function grantLockerLoot(loot,where='置物櫃'){
  if(loot.kind==='empty')return;
  if(loot.kind==='item'){
    const item=itemById(loot.id);if(!item)return;
    const qty=Math.max(1,Math.min(999,Math.floor(Number(loot.qty)||1)));
    const got=supplyGain(item.id,qty);   // 持有上限：拿不下的會跳提示
    if(got<qty&&G?.player){
      G.groundItems=G.groundItems||[];
      G.groundItems.push({id:item.id,qty:qty-got,x:G.player.x,y:G.player.y+12,at:performance.now()/1000,floor:hasFloors?placeFloorAt(G.player.x,G.player.y+12,G.player):1});
      systemNotice('背包放不下的「'+item.name+'」留在地上');
    }
    if(got){showItemPickupNotice(item.id,got);systemNotice('在'+where+'找到「'+item.name+'」×'+got);}
  }else if(loot.kind==='equipment'){
    if(!grantEquipment(loot.id,'在'+where+'找到'))systemNotice('已擁有這件裝備');
  }else if(loot.kind==='weapon'){
    // 以前的槍（照明彈槍、燃燒彈槍、麻醉槍）現在是手槍的子彈：給那種子彈（js/special-guns.js 的 grantBullets）
    const b=BULLETS[loot.id];if(!b||b.removed||loot.id==='pistol')return;
    if(bulletRoom(loot.id)<=0){systemNotice('彈藥包已滿，放不下'+b.name);return;}
    grantBullets(loot.id,GUN_FINDS.start[loot.id]||b.max,'在'+where+'找到');
  }else if(loot.kind==='bullet'){
    // 1 組子彈（地圖編輯器「子彈（1 組）」）：彈藥包放得下多少拿多少
    const b=BULLETS[loot.id];if(!b||b.removed||loot.id==='pistol')return;
    if(bulletRoom(loot.id)<=0){systemNotice('彈藥包已滿，放不下'+b.name);return;}
    const got=grantBullets(loot.id,b.max,'在'+where+'找到');
    if(!got)return;
    showItemPickupNotice({name:b.name,image:b.image},got,false);
  }
}
// 電源開關開／關時換的圖：跟擺在地圖上的是同一套（池核的開關換池核的開／關圖，後室的換後室的）
const powerSwitchSwap=new Map();   // 素材 id → { on, off }
function powerSwitchTileFor(id,on){
  if(!powerSwitchSwap.has(id)){
    const t=mapTileById(id)||{},file=String(t.file||'').replaceAll('\\','/'),find=f=>Object.values(TILE_REGISTRY).find(x=>String(x.file||'').replaceAll('\\','/')===f);
    const onT=find(file.replace(/power-switch-(on|off)\.png$/,'power-switch-on.png')),offT=find(file.replace(/power-switch-(on|off)\.png$/,'power-switch-off.png'));
    powerSwitchSwap.set(id,{on:onT||mapTileById('tile_interactive_power_switch_on'),off:offT||mapTileById('tile_interactive_power_switch_off')});
  }
  const pair=powerSwitchSwap.get(id);return (on?pair.on:pair.off)||null;
}
// ---- 發電機（dynamo-close＝關、dynamo-open＝開）----
// 能互動的地圖（地圖 id）：池核、W118區 地下水池，加上捷運站（data/mrt-train.js 的 stations，全部打開捷運才會開，js/mrt-train.js 的 mrtPowered）；
// 其他地圖放的發電機只是裝飾。要加地圖就把 id 加進來
const DYNAMO_MAPS = ['map_mv1bzur4', 'map_89aacb92-4b89-47ec-a76b-0908972d3fdf'];   // 04. 池核、W118區 地下水池（全部打開＝抽水機通電，js/pool-tide.js）
const dynamoStationMap=m=>!!(m&&typeof mrtStationOf==='function'&&mrtStationOf(m.id));
const dynamoInteractiveMap=m=>!!(m&&(DYNAMO_MAPS.includes(m.id)||dynamoStationMap(m)));
// 每一台各自開關（不分電路）。一進地圖全部是關的（地圖上放的是 open 圖也一樣當關的），玩家要自己去把它們打開。
// 池核：換地圖再回來會重新關掉。捷運站：打開過的就永遠開著（記在存檔 DYNAMO_STORE，搭捷運來回、回應變中心、重新整理、重新部署都不會關回去；
// 不然搭車到一個發電機已經開過、卻又被關回去的車站，可能被困在走不到發電機的地方）。
// 其他程式要知道「是不是全部打開了」：dynamoCount() 回傳 [開著幾台, 總共幾台]、dynamosAllOn()。
let dynamoMap=null,dynamoOnSet=new Set();   // 開著的發電機（storagePropToken）
const DYNAMO_STORE='tudrc_dynamos_v1';   // 捷運站：地圖 id → [開著的發電機…]
const dynamoKeep=new Map();
try{const d=JSON.parse(localStorage.getItem(DYNAMO_STORE)||'{}');if(d&&typeof d==='object')for(const [id,list] of Object.entries(d))if(Array.isArray(list))dynamoKeep.set(id,new Set(list));}catch(_){}
function dynamoSaveKeep(){try{localStorage.setItem(DYNAMO_STORE,JSON.stringify(Object.fromEntries([...dynamoKeep].map(([id,set])=>[id,[...set]]))));}catch(_){}}
function dynamoState(){
  if(dynamoMap!==MAP){
    dynamoMap=MAP;
    if(dynamoStationMap(MAP)){if(!dynamoKeep.has(MAP.id))dynamoKeep.set(MAP.id,new Set());dynamoOnSet=dynamoKeep.get(MAP.id);}
    else dynamoOnSet=new Set();
  }
  return dynamoOnSet;
}
function dynamoForget(){dynamoMap=null;}   // 回應變中心（js/mrt-train.js 的 mrtAwayOnBegin）：捷運站的發電機不再關回去，只重新認一次現在的地圖
const dynamoIsOn=token=>dynamoState().has(token);
function toggleDynamo(token){const s=dynamoState();if(s.has(token))s.delete(token);else s.add(token);if(dynamoStationMap(MAP))dynamoSaveKeep();}   // 捷運站：記進存檔
function dynamoCount(){
  if(!MAP)return [0,0];
  const list=storagePropSpots().filter(s=>storagePropKindCached(s.id)==='dynamo');
  const on=list.filter(s=>dynamoIsOn(storagePropToken(s.id,s.c,s.r,s.layer,s.stamp?.ox||0,s.stamp?.oy||0))).length;
  return [on,list.length];
}
const dynamosAllOn=()=>{const [on,total]=dynamoCount();return total>0&&on===total;};
// 開／關時換的圖：同一個資料夾裡的 dynamo-open.png／dynamo-close.png
const dynamoSwap=new Map();   // 素材 id → { on, off }
function dynamoTileFor(id,on){
  if(!dynamoSwap.has(id)){
    const file=String(mapTileById(id)?.file||'').replaceAll('\\','/'),find=f=>Object.values(TILE_REGISTRY).find(x=>String(x.file||'').replaceAll('\\','/')===f);
    dynamoSwap.set(id,{on:find(file.replace(/dynamo-(open|close)\.png$/,'dynamo-open.png')),off:find(file.replace(/dynamo-(open|close)\.png$/,'dynamo-close.png'))});
  }
  const pair=dynamoSwap.get(id);return (on?pair.on:pair.off)||null;
}
function storagePropDisplayTile(id,c,r,layer,stamp=null){
  // 池核的 LED 燈條：燈本身一律照原圖畫；通電時疊在上面的光暈圖由 js/powered-lights.js 畫在黑幕上面
  if(typeof isPoolcoreLed==='function'&&isPoolcoreLed(mapTileById(id)))return null;
  const kind=storagePropKindCached(id);   // 畫地圖時每一格都會問：用記起來的結果
  if(!kind)return null;
  if(kind==='power'&&(typeof poolIsValve==='function'?poolIsValve(stamp):!!(stamp&&stamp.valve)))return powerSwitchTileFor(id,typeof poolValveShowsOn==='function'&&poolValveShowsOn());   // 抽水閥：水抽掉時是「開」
  if(kind==='power')return powerSwitchTileFor(id,mapPowerIsOn(circuitOf(stamp)));
  const token=storagePropToken(id,c,r,layer,stamp?.ox||0,stamp?.oy||0);
  if(kind==='dynamo')return dynamoTileFor(id,dynamoIsOn(token));
  if(isWorldPickup(kind))return false; // 實際物品藏起來，統一由小亮點顯示。
  if(kind==='closed'&&unlockedStorageLockers.has(token))return mapTileById('tile_interactive_storage_locker_open');
  return null;
}

// 拾取亮點只在真正的光照範圍內顯示，不提供周圍視野。
function drawWorldPickupSparkles(ctx){
  if(!G?.running||G.over)return;
  const time=performance.now()/1000;
  ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  for(const prop of storagePropEntries()){
    if(!isWorldPickup(prop.kind)||prop.hidden||!isLit(prop.x,prop.y))continue;   // 隱藏的拾取物不畫亮點
    const pulse=.7+.3*Math.sin(time*3.2+prop.x*.03+prop.y*.02);
    const x=Math.round(prop.x),y=Math.round(prop.y);
    const glow=ctx.createRadialGradient(x,y,0,x,y,10);
    glow.addColorStop(0,'rgba(255,243,197,'+(.45*pulse)+')');
    glow.addColorStop(1,'rgba(255,243,197,0)');
    ctx.fillStyle=glow;ctx.fillRect(x-10,y-10,20,20);
    ctx.globalAlpha=pulse;ctx.fillStyle='#fff7d9';ctx.fillRect(x-2,y-2,4,4);
    ctx.globalAlpha=pulse*.5;ctx.fillRect(x-3,y,7,1);ctx.fillRect(x,y-3,1,7);
    ctx.globalAlpha=1;
  }
  ctx.restore();
}

// 固定在遊戲畫面中間偏右：拾取後才揭曉圖片與名稱，顯示三秒。
// tally：算進結算畫面的「本次取得」（子彈 grantBullets 已經算過，傳 false）
function showItemPickupNotice(id,amount=1,tally=true){
  const item=typeof id==='string'?itemById(id):id,box=document.getElementById('itemPickupNotices');
  if(typeof id==='string'&&typeof itemIntroForItem==='function')itemIntroForItem(id,amount);   // 第一次拿到：跳說明（js/item-intro.js）
  if(tally&&item&&typeof battleGot==='function')battleGot(item.name,item.image,amount);   // 結算畫面的「本次取得」
  if(!item||!box)return;
  const notice=document.createElement('div');notice.className='item-pickup-notice';
  const image=document.createElement('img');image.src=item.image;image.alt='';
  const label=document.createElement('span');label.textContent=item.name+' ×'+amount;
  notice.append(image,label);box.appendChild(notice);
  setTimeout(()=>{notice.classList.add('leaving');setTimeout(()=>notice.remove(),220);},3000);
  return notice;
}

let storageWallMap=null,storageAddedWalls=new Set(),storageAddedOffsets=new Set();
function storageBoxConfig(open){
  const id='storage-box-'+(open?'open':'closed');
  let edited=[];try{edited=JSON.parse(localStorage.getItem('td-object-editor-v1')||'[]');}catch(_){}
  return (Array.isArray(edited)&&edited.find(o=>o.id===id))||STORAGE_BOXES.find(o=>o.id===id);
}
// 每個置物箱自帶的擋路格：each(格子 key, 像素微調)
function eachStorageBoxSolid(each){
  for(const prop of storagePropEntries()){
    if(prop.kind!=='closed'&&prop.kind!=='open')continue;
    const v=storageBoxConfig(prop.open)?.h;if(!v)continue;
    const token=JSON.parse(prop.token),o=stampSolidOrigin({c:token[2],r:token[3],ox:token[5],oy:token[6]});   // 擋路格照像素微調對齊圖片（js/maploader.js）
    for(const [dc,dr] of v.solid||[]){
      if(dc<0||dr<0||dc>=v.w||dr>=v.h)continue;
      const cc=o.c+(prop.stamp?.fx?v.w-1-dc:dc);
      const rr=o.r+(prop.stamp?.fy?v.h-1-dr:dr);
      if(inGrid(cc,rr))each(cc+','+rr,o.off);
    }
  }
}
function setupStorageBoxWalls(){
  if(!MAP)return;
  if(storageWallMap===MAP){for(const key of storageAddedWalls)mapWalls.delete(key);for(const key of storageAddedOffsets)delete mapSolidOffsets[key];}
  storageWallMap=MAP;storageAddedWalls=new Set();storageAddedOffsets=new Set();
  eachStorageBoxSolid((key,off)=>{if(!mapWalls.has(key)){mapWalls.add(key);storageAddedWalls.add(key);if(addStampSolidOffset(key,off))storageAddedOffsets.add(key);}});
}
// 接續「保留進度」的戰場（js/combat-progress.js，這時不會跑 newGame）：牆格整組換成存起來的那份，
// 「哪些格是置物箱加的」沒存，打開置物箱時關著的擋路格會刪不掉。照地圖資料重新認一次：地圖本來沒畫、現在卻是牆的就是置物箱加的
function restoreStorageBoxWalls(){
  storageWallMap=MAP;storageAddedWalls=new Set();storageAddedOffsets=new Set();
  if(!MAP)return;
  const drawn=new Set(MAP.solid||[]),drawnOff=MAP.solidOffsets||{};
  eachStorageBoxSolid(key=>{
    if(!mapWalls.has(key)||drawn.has(key))return;
    storageAddedWalls.add(key);if(mapSolidOffsets[key]&&!drawnOff[key])storageAddedOffsets.add(key);
  });
}
