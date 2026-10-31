/* 電源控制燈：進入地圖時預設關閉。
   電路編號（地圖編輯器選開關／電燈設定，1～5）：開關只控制同編號的燈；沒設定編號的＝0，彼此連動（舊地圖照舊）。 */
let poweredMap = null, mapPowerOn = new Set();   // 開著的電路編號
const circuitOf = s => Math.max(0, Math.min(5, Math.floor(Number(s && s.circuit) || 0)));
const isPoweredLightTile = tile => {
  const file=String(tile?.file||'').replaceAll('\\','/');
  return file.endsWith('/electric-light-02.png') || /^electric-light-02(?:\.png)?$/i.test(String(tile?.name||'')) || tile?.id==='tile_interactive_electric_light_02';
};
function resetMapPower(){poweredMap=MAP;mapPowerOn=new Set();}
function mapPowerIsOn(circuit=0){return poweredMap===MAP&&mapPowerOn.has(circuit);}
function toggleMapPower(circuit=0){if(poweredMap!==MAP)resetMapPower();if(mapPowerOn.has(circuit))mapPowerOn.delete(circuit);else mapPowerOn.add(circuit);}
let poweredFixturesCache=null,poweredFixturesFor=null,poweredFixturesStamps=-1;   // 燈的位置只跟地圖有關：同一張地圖不用每幀重掃全部格子、物件
function poweredLightFixtures(){
  if(!MAP)return [];
  const stampCount=(MAP.stamps||[]).length;
  if(poweredFixturesCache&&poweredFixturesFor===MAP&&poweredFixturesStamps===stampCount)return poweredFixturesCache;
  poweredFixturesFor=MAP;poweredFixturesStamps=stampCount;
  const lamps=poweredFixturesCache=[];
  const add=(id,c,r,s=null)=>{
    const tile=mapTileById(id);if(!isPoweredLightTile(tile))return;
    const w=mapTileW(tile)*CELL,h=mapTileH(tile)*CELL;
    const dx=w*.5,dy=h*.9;
    lamps.push({x:OX+c*CELL+(s?.ox||0)+(s?.fx?w-dx:dx),y:OY+r*CELL+(s?.oy||0)+(s?.fy?h-dy:dy),circuit:circuitOf(s),top:OY+r*CELL+(s?.oy||0)});
  };
  for(const layer of Object.values(MAP.layers||{}))for(const [key,id] of Object.entries(layer)){const [c,r]=key.split(',').map(Number);add(id,c,r);}
  for(const s of MAP.stamps||[])add(s.id,s.c,s.r,s);
  return lamps;
}
function poweredLightSources(){
  return poweredLightFixtures().filter(l=>mapPowerIsOn(l.circuit)).map(l=>({...l,r:LIGHT.poweredLampR??250,intensity:LIGHT.poweredLampIntensity??.85}));
}
const SHOW_CIRCUIT_NUMBERS = false;   // 遊戲裡要不要在開關、電燈上顯示電路編號（地圖編輯器一律顯示）
function drawPoweredLights(ctx){
  if(SHOW_CIRCUIT_NUMBERS)drawCircuitNumbers(ctx);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const l of poweredLightFixtures()){
    if(!mapPowerIsOn(l.circuit))continue;
    if(typeof inHiddenArea==='function'&&inHiddenArea(l.x,l.y))continue;   // 還沒炸開的隱藏區：燈不亮（js/breakable-walls.js）
    const glow=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,28);
    glow.addColorStop(0,'rgba(255,248,212,.3)');glow.addColorStop(1,'rgba(255,248,212,0)');
    ctx.fillStyle=glow;ctx.fillRect(l.x-28,l.y-28,56,56);
    ctx.fillStyle='rgba(255,253,225,.65)';ctx.fillRect(l.x-14,l.y-1,28,2);
  }
  ctx.restore();
}

// 電路編號的小牌子：開關、電燈上方（有設定編號的才顯示；在亮處才看得到）
function drawCircuitBadge(ctx,x,y,n,on){
  ctx.save();ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=on?'rgba(255,214,110,.95)':'rgba(20,26,34,.88)';ctx.strokeStyle=on?'#fff1c4':'rgba(200,214,226,.7)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.arc(x,y,7.5,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle=on?'#3a2a08':'#e4edf0';ctx.fillText(String(n),x,y+.5);ctx.restore();
}
function drawCircuitNumbers(ctx){
  if(!MAP)return;
  for(const l of poweredLightFixtures())if(l.circuit&&isLit(l.x,l.y))drawCircuitBadge(ctx,l.x+18,l.top+8,l.circuit,mapPowerIsOn(l.circuit));
  if(typeof storagePropEntries!=='function')return;
  for(const prop of storagePropEntries()){
    if(prop.kind!=='power')continue;const n=circuitOf(prop.stamp);
    if(n&&isLit(prop.x,prop.y))drawCircuitBadge(ctx,prop.x,prop.top-4,n,mapPowerIsOn(n));
  }
}
