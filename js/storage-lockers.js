/* 場景置物箱：鑰匙拾取、解鎖外觀與永久開箱狀態。 */
const STORAGE_LOCKER_IDS = new Set(['tile_interactive_storage_locker','tile_interactive_storage_locker_open']);
const STORAGE_LOCKER_KEY_TILE = 'tile_interactive_storage_locker_key';
const WORLD_PICKUPS = {
  key: { item: 'storage-locker-key', name: '置物櫃鑰匙' },
  battery: { item: 'battery', name: '電池' },
  almond: { item: 'almond-water', name: '杏仁水' },
  adrenaline: { item: 'adrenaline', name: '腎上腺素' },
  doorKey: { item: 'backroom-door-key', name: '後室門鑰匙' },
  penRed: { item: 'graffiti-red', name: '塗鴉筆（紅）' },
  penBlue: { item: 'graffiti-blue', name: '塗鴉筆（藍）' },
  penBlack: { item: 'graffiti-black', name: '塗鴉筆（黑）' },
};
const GRAFFITI_PICKUP_TILES = { tile_interactive_pickup_graffiti_red: 'penRed', tile_interactive_pickup_graffiti_blue: 'penBlue', tile_interactive_pickup_graffiti_black: 'penBlack' };
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
  if(file.endsWith('/power-switch-on.png')||file.endsWith('/power-switch-off.png'))return 'power';
  if(file.endsWith('/storage-locker-open.png'))return 'open';
  if(file.endsWith('/storage-locker-closed.png'))return 'closed';
  return null;
}
function storagePropToken(id,c,r,layer,ox=0,oy=0){
  return JSON.stringify([MAP.id || MAP_INDEX,id,c,r,layer,ox,oy]);
}
function storagePropEntries(){
  if(!MAP) return [];
  const entries=[];
  const add=(id,c,r,layer,stamp=null)=>{
    const kind=storagePropKind(id);if(!kind)return;
    const t=mapTileById(id); if(!t) return;
    const ox=stamp?.ox||0,oy=stamp?.oy||0;
    const token=storagePropToken(id,c,r,layer,ox,oy);
    if(isWorldPickup(kind)&&collectedStorageKeys.has(token))return;
    const x0=OX+c*CELL+ox,y0=OY+r*CELL+oy;
    entries.push({id,kind,token,stamp,x:x0+mapTileW(t)*CELL/2,y:y0+mapTileH(t)*CELL-CELL/2,top:y0,
      open:kind==='open'||unlockedStorageLockers.has(token)});
  };
  for(const s of MAP.stamps||[]) add(s.id,s.c,s.r,s.layer||'top',s);
  for(const [layer,tiles] of Object.entries(MAP.layers||{})) for(const [key,id] of Object.entries(tiles)){
    const [c,r]=key.split(',').map(Number);add(id,c,r,layer);
  }
  for (const drop of G?.equipmentDrops || []) entries.push({ kind:'equipment-drop', drop, x:drop.x, y:drop.y, top:drop.y-28 });
  for (const drop of G?.groundItems || []) entries.push({ kind:'ground-item', drop, x:drop.x, y:drop.y, top:drop.y-30 });   // 溫特自己放在地上的（js/ground-items.js）
  return entries;
}
// filter：只找某一類（例如 isPickupProp＝只找可以拾取的東西）
function storagePropNearPlayer(filter){
  const p=G?.player;if(!p||p.sitting||p.hp<=0)return null;
  let nearest=null,distance=72;
  for(const prop of storagePropEntries()){
    if(filter&&!filter(prop))continue;
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
  if(prop.kind==='power')return mapPowerIsOn(circuitOf(prop.stamp))?'關閉電源':'開啟電源';
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
  if(prop.kind==='power'){
    const n=circuitOf(prop.stamp);toggleMapPower(n);sfx('powerOn');systemNotice(mapPowerIsOn(n)?'電源已開啟':'電源已關閉');
  }else if(prop.open){
    flash('置物箱已打開',prop.x,prop.top-8,'#dce6ed',1.2);
  }else if((supplyInventory.get('storage-locker-key')||0)<=0){
    sfx('error');flash('需要鑰匙',prop.x,prop.top-8,'#ffcf89',1.4);
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
      else{
        if(typeof tryEquipDrop==='function')tryEquipDrop('thermos',prop.x,prop.top);
        if(typeof tryEquipDrop==='function')tryEquipDrop('adrenaline',prop.x,prop.top);   // 腎上腺素（機率在 data/equipment.js 的 ITEM_DROPS）
        if(typeof tryEquipDrop==='function')tryEquipDrop('anomaly-firstaid',prop.x,prop.top);   // 異質急救包：只有置物櫃找得到
        if(typeof tryGunFind==='function')tryGunFind(prop.x,prop.top);
        if(typeof tryGraffitiPenFind==='function')tryGraffitiPenFind(prop.x,prop.top);   // 塗鴉筆（js/graffiti.js）
        if(typeof tryYouyouCardFind==='function')tryYouyouCardFind();   // 好遊卡（js/mrt-locks.js）
      }
    }finally{if(typeof itemIntroFromLocker!=='undefined')itemIntroFromLocker=false;}
    if(typeof itemIntroCount!=='undefined'&&itemIntroCount===before)flash('空的',prop.x,prop.top-8,'#dce6ed',1.6);
    updateHUD();saveGame();
  }
  return true;
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
      G.groundItems.push({id:item.id,qty:qty-got,x:G.player.x,y:G.player.y+12,at:performance.now()/1000});
      systemNotice('背包放不下的「'+item.name+'」留在地上');
    }
    if(got){showItemPickupNotice(item.id,got);systemNotice('在'+where+'找到「'+item.name+'」×'+got);}
  }else if(loot.kind==='equipment'){
    if(!grantEquipment(loot.id,'在'+where+'找到'))systemNotice('已擁有這件裝備');
  }else if(loot.kind==='weapon'){
    // 以前的槍（照明彈槍、燃燒彈槍、麻醉槍）現在是手槍的子彈：給那種子彈（js/special-guns.js 的 grantBullets）
    const b=BULLETS[loot.id];if(!b||b.removed||loot.id==='pistol')return;
    if(bulletCount(loot.id)>=b.max){systemNotice(b.name+'已經是滿的');return;}
    grantBullets(loot.id,GUN_FINDS.start[loot.id]||b.max,'在'+where+'找到');
  }
}
function storagePropDisplayTile(id,c,r,layer,stamp=null){
  const kind=storagePropKind(id);
  if(!kind)return null;
  if(kind==='power')return mapTileById(mapPowerIsOn(circuitOf(stamp))?'tile_interactive_power_switch_on':'tile_interactive_power_switch_off')||null;
  const token=storagePropToken(id,c,r,layer,stamp?.ox||0,stamp?.oy||0);
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
    if(!isWorldPickup(prop.kind)||!isLit(prop.x,prop.y))continue;
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
function showItemPickupNotice(id,amount=1){
  const item=typeof id==='string'?itemById(id):id,box=document.getElementById('itemPickupNotices');
  if(typeof id==='string'&&typeof itemIntroForItem==='function')itemIntroForItem(id,amount);   // 第一次拿到：跳說明（js/item-intro.js）
  if(item&&typeof battleGot==='function')battleGot(item.name,item.image,amount);   // 結算畫面的「本次取得」
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
