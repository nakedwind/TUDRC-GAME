/* 場景置物箱：鑰匙拾取、解鎖外觀與永久開箱狀態。 */
const STORAGE_LOCKER_IDS = new Set(['tile_interactive_storage_locker','tile_interactive_storage_locker_open']);
const STORAGE_LOCKER_KEY_TILE = 'tile_interactive_storage_locker_key';
const WORLD_PICKUPS = {
  key: { item: 'storage-locker-key', name: '置物櫃鑰匙' },
  battery: { item: 'battery', name: '電池' },
  almond: { item: 'almond-water', name: '杏仁水' },
};
const isWorldPickup = kind => !!WORLD_PICKUPS[kind];
const unlockedStorageLockers = new Set(), collectedStorageKeys = new Set();
function storagePropKind(id){
  const tile=mapTileById(id);
  const file=String(tile?.file||'').replaceAll('\\','/');
  const name=String(tile?.name||'').trim().toLowerCase();
  // 編輯器上傳會把圖片轉成 data URL，需同時認素材 ID 與名稱。
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
  return entries;
}
function storagePropNearPlayer(){
  const p=G?.player;if(!p||p.sitting||p.hp<=0)return null;
  let nearest=null,distance=72;
  for(const prop of storagePropEntries()){
    const d=Math.hypot(prop.x-p.x,prop.y-p.y);
    if(d<distance){nearest=prop;distance=d;}
  }
  return nearest;
}
function storagePropPrompt(prop){
  if(prop.kind==='equipment-drop')return '拾取'+(equipDef(prop.drop.id)?.name||'裝備');
  if(isWorldPickup(prop.kind))return '拾取';
  if(prop.kind==='power')return mapPowerIsOn()?'關閉電源':'開啟電源';
  if(prop.open)return '查看置物箱';
  return (supplyInventory.get('storage-locker-key')||0)>0?'用鑰匙開啟置物箱':'置物箱已上鎖（需要鑰匙）';
}
function useStoragePropNearPlayer(){
  const prop=storagePropNearPlayer();if(!prop)return false;
  if(prop.kind==='equipment-drop'){
    if(grantEquipment(prop.drop.id,'拾取了'))sfx('itemPickup');
    G.equipmentDrops=(G.equipmentDrops||[]).filter(drop=>drop!==prop.drop);
    updateHUD();saveGame();
  }else if(prop.kind==='power'){
    toggleMapPower();sfx('powerOn');systemNotice(mapPowerIsOn()?'電源已開啟':'電源已關閉');
  }else if(isWorldPickup(prop.kind)){
    const loot=WORLD_PICKUPS[prop.kind];
    supplyInventory.set(loot.item,(supplyInventory.get(loot.item)||0)+1);
    collectedStorageKeys.add(prop.token);sfx('itemPickup');
    showItemPickupNotice(loot.item,1);
    updateHUD();saveGame();
  }else if(prop.open){
    flash('置物箱已打開',prop.x,prop.top-8,'#dce6ed',1.2);
  }else if((supplyInventory.get('storage-locker-key')||0)<=0){
    sfx('error');flash('需要置物箱鑰匙',prop.x,prop.top-8,'#ffcf89',1.4);
  }else{
    const remainingKeys=supplyInventory.get('storage-locker-key')-1;
    if(remainingKeys>0)supplyInventory.set('storage-locker-key',remainingKeys);
    else supplyInventory.delete('storage-locker-key');
    unlockedStorageLockers.add(prop.token);setupStorageBoxWalls();computeFlow();sfx('door');systemNotice('已打開置物箱，消耗 1 支鑰匙');
    const loot=prop.stamp?.lockerLoot;
    if(loot)grantLockerLoot(loot);
    else{
      if(typeof tryEquipDrop==='function')tryEquipDrop('thermos',prop.x,prop.top);
      if(typeof tryGunFind==='function')tryGunFind(prop.x,prop.top);
    }
    updateHUD();saveGame();
  }
  return true;
}
function grantLockerLoot(loot){
  if(loot.kind==='empty')return;
  if(loot.kind==='item'){
    const item=itemById(loot.id);if(!item)return;
    const qty=Math.max(1,Math.min(999,Math.floor(Number(loot.qty)||1)));
    supplyInventory.set(item.id,(supplyInventory.get(item.id)||0)+qty);
    showItemPickupNotice(item.id,qty);systemNotice('在置物櫃找到「'+item.name+'」×'+qty);
  }else if(loot.kind==='equipment'){
    if(!grantEquipment(loot.id,'在置物櫃找到'))systemNotice('已擁有這件裝備');
  }else if(loot.kind==='weapon'){
    const w=WEAPON_UPGRADES[loot.id];if(!w)return;
    if(equipState.weapons[loot.id]){systemNotice('已擁有「'+w.name+'」');return;}
    equipState.weapons[loot.id]=1;
    const ammo=GUN_FINDS.start[loot.id];
    if(ammo)equipState.gunAmmo[loot.id]={...ammo};
    if(!equipState.loadout.sub)equipState.loadout.sub=loot.id;
    saveEquipment();updateAmmoHud();systemNotice('在置物櫃找到「'+w.name+'」');
  }
}
function storagePropDisplayTile(id,c,r,layer,stamp=null){
  const kind=storagePropKind(id);
  if(!kind)return null;
  if(kind==='power')return mapTileById(mapPowerIsOn()?'tile_interactive_power_switch_on':'tile_interactive_power_switch_off')||null;
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
  if(typeof id==='string'&&typeof itemIntroForItem==='function')itemIntroForItem(id);   // 第一次拿到：跳說明（js/item-intro.js）
  if(item&&typeof battleGot==='function')battleGot(item.name,item.image,amount);   // 結算畫面的「本次取得」
  if(!item||!box)return;
  const notice=document.createElement('div');notice.className='item-pickup-notice';
  const image=document.createElement('img');image.src=item.image;image.alt='';
  const label=document.createElement('span');label.textContent=item.name+' ×'+amount;
  notice.append(image,label);box.appendChild(notice);
  setTimeout(()=>{notice.classList.add('leaving');setTimeout(()=>notice.remove(),220);},3000);
  return notice;
}

let storageWallMap=null,storageAddedWalls=new Set();
function storageBoxConfig(open){
  const id='storage-box-'+(open?'open':'closed');
  let edited=[];try{edited=JSON.parse(localStorage.getItem('td-object-editor-v1')||'[]');}catch(_){}
  return (Array.isArray(edited)&&edited.find(o=>o.id===id))||STORAGE_BOXES.find(o=>o.id===id);
}
function setupStorageBoxWalls(){
  if(!MAP)return;
  if(storageWallMap===MAP)for(const key of storageAddedWalls)mapWalls.delete(key);
  storageWallMap=MAP;storageAddedWalls=new Set();
  for(const prop of storagePropEntries()){
    if(prop.kind!=='closed'&&prop.kind!=='open')continue;
    const v=storageBoxConfig(prop.open)?.h;if(!v)continue;
    const token=JSON.parse(prop.token),c=token[2],r=token[3],ox=token[5],oy=token[6];
    for(const [dc,dr] of v.solid||[]){
      if(dc<0||dr<0||dc>=v.w||dr>=v.h)continue;
      const cc=c+Math.round(ox/CELL)+(prop.stamp?.fx?v.w-1-dc:dc);
      const rr=r+Math.round(oy/CELL)+(prop.stamp?.fy?v.h-1-dr:dr);
      const key=cc+','+rr;
      if(inGrid(cc,rr)&&!mapWalls.has(key)){mapWalls.add(key);storageAddedWalls.add(key);}
    }
  }
}
