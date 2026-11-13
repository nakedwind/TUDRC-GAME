/* 電源控制燈：進入地圖時預設關閉（池核的 LED 燈條例外：有池核 LED 的電路一進地圖就是開著的，
   燈會像後室日光燈一樣閃爍、跳電，js/flicker-light.js；按開關才關掉、再按一次打開）。
   電路編號（地圖編輯器選開關／電燈設定，1～5）：開關只控制同編號的燈；沒設定編號的算 1。 */
let poweredMap = null, mapPowerOn = new Set();   // 開著的電路編號
const circuitOf = s => Math.max(1, Math.min(5, Math.floor(Number(s && s.circuit) || 1)));
const isPoweredLightTile = tile => {
  const file=String(tile?.file||'').replaceAll('\\','/');
  return file.endsWith('/electric-light-02.png') || /^electric-light-02(?:\.png)?$/i.test(String(tile?.name||'')) || tile?.id==='tile_interactive_electric_light_02'
    || isPoolcoreLed(tile);   // 池核的 LED 燈條（Poolcore_LED）
};
// 池核的 LED 燈條：燈本身一律照原圖畫（關著時調暗）。
// 地圖上疊在燈上的光暈圖（Poolcore_LED_glow）：不在一般地圖那一輪畫；燈亮著時才畫，而且畫在黑幕上面，
// 照編輯器裡設的混合模式（例如「實光」）、不透明度畫，跟著燈閃爍；燈熄掉（閃爍、跳電、關電）就不畫。
// 光暈圖離燈左上角半格以內就算這盞燈的。
const isPoolcoreLed = tile => /\/Poolcore_LED\.png$/i.test(String(tile?.file||'').replaceAll('\\','/'));
const POOLCORE_LED_GLOW = 'images/Poolcore/Poolcore_LED_glow.png';
const isPoolcoreLedGlow = tile => String(tile?.file||'').replaceAll('\\','/').endsWith(POOLCORE_LED_GLOW);
let poweredGlowCache=null,poweredGlowFor=null,poweredGlowStampCount=-1,poweredGlowDrawing=false;
function poweredGlowStamps(){   // 光暈圖 stamp → 它屬於哪一盞燈（燈的 stamp）
  if(!MAP)return new Map();
  const stamps=MAP.stamps||[];
  if(poweredGlowCache&&poweredGlowFor===MAP&&poweredGlowStampCount===stamps.length)return poweredGlowCache;
  poweredGlowFor=MAP;poweredGlowStampCount=stamps.length;poweredGlowCache=new Map();
  const pos=s=>[s.c*CELL+(s.ox||0),s.r*CELL+(s.oy||0)];
  const leds=stamps.filter(s=>isPoolcoreLed(mapTileById(s.id)));
  for(const g of stamps){
    if(!isPoolcoreLedGlow(mapTileById(g.id)))continue;
    const [gx,gy]=pos(g);let best=null,bd=CELL/2;
    for(const s of leds){const [x,y]=pos(s),d=Math.hypot(x-gx,y-gy);if(d<=bd){bd=d;best=s;}}
    if(best)poweredGlowCache.set(g,best);
  }
  return poweredGlowCache;
}
// js/maploader.js 畫地圖時問：這張是跟著電源的光暈圖 → 不在一般地圖那一輪畫
const poweredGlowHidden = s => !poweredGlowDrawing && poweredGlowStamps().has(s);
// 一進地圖就開著的電路：有池核 LED 的電路
const defaultOnCircuits=()=>new Set(((MAP&&MAP.stamps)||[]).filter(s=>isPoolcoreLed(mapTileById(s.id))).map(circuitOf));
function resetMapPower(){poweredMap=MAP;mapPowerOn=defaultOnCircuits();}
function mapPowerIsOn(circuit=1){if(poweredMap!==MAP)resetMapPower();return mapPowerOn.has(circuit);}
function toggleMapPower(circuit=1){if(poweredMap!==MAP)resetMapPower();if(mapPowerOn.has(circuit))mapPowerOn.delete(circuit);else mapPowerOn.add(circuit);}
let poweredFixturesCache=null,poweredFixturesFor=null,poweredFixturesStamps=-1;   // 燈的位置只跟地圖有關：同一張地圖不用每幀重掃全部格子、物件
function poweredLightFixtures(){
  if(!MAP)return [];
  const stampCount=(MAP.stamps||[]).length;
  if(poweredFixturesCache&&poweredFixturesFor===MAP&&poweredFixturesStamps===stampCount)return poweredFixturesCache;
  poweredFixturesFor=MAP;poweredFixturesStamps=stampCount;
  const lamps=poweredFixturesCache=[];
  const add=(id,c,r,s=null,lid=null)=>{   // lid＝小圖所在的圖層；floor＝這盞燈在幾樓（名稱有「2樓」的圖層＝2，js/maploader.js）
    const tile=mapTileById(id);if(!isPoweredLightTile(tile))return;
    const w=mapTileW(tile)*CELL,h=mapTileH(tile)*CELL;
    const dx=w*.5,dy=h*.9;
    lamps.push({x:OX+c*CELL+(s?.ox||0)+(s?.fx?w-dx:dx),y:OY+r*CELL+(s?.oy||0)+(s?.fy?h-dy:dy),circuit:circuitOf(s),top:OY+r*CELL+(s?.oy||0),floor:(s?stampOn2F(s):MAP_FLOOR2_LAYERS.has(lid))?2:1,
      flicker:isPoolcoreLed(tile)});   // 池核 LED：亮光、閃爍由 js/flicker-light.js 處理，這裡不畫光、不算光源
  };
  for(const [lid,layer] of Object.entries(MAP.layers||{}))for(const [key,id] of Object.entries(layer)){const [c,r]=key.split(',').map(Number);add(id,c,r,null,lid);}
  for(const s of MAP.stamps||[])add(s.id,s.c,s.r,s);
  return lamps;
}
function poweredLightSources(){
  return poweredLightFixtures().filter(l=>!l.flicker&&mapPowerIsOn(l.circuit)).map(l=>({...l,r:LIGHT.poweredLampR??250,intensity:LIGHT.poweredLampIntensity??.85}));
}
const SHOW_CIRCUIT_NUMBERS = false;   // 遊戲裡要不要在開關、電燈上顯示電路編號（地圖編輯器一律顯示）
function drawPoweredLights(ctx){
  if(SHOW_CIRCUIT_NUMBERS)drawCircuitNumbers(ctx);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const l of poweredLightFixtures()){
    if(l.flicker||!mapPowerIsOn(l.circuit))continue;
    if(typeof inHiddenArea==='function'&&inHiddenArea(l.x,l.y))continue;   // 還沒炸開的隱藏區：燈不亮（js/breakable-walls.js）
    const glow=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,28);
    glow.addColorStop(0,'rgba(255,248,212,.3)');glow.addColorStop(1,'rgba(255,248,212,0)');
    ctx.fillStyle=glow;ctx.fillRect(l.x-28,l.y-28,56,56);
    ctx.fillStyle='rgba(255,253,225,.65)';ctx.fillRect(l.x-14,l.y-1,28,2);
  }
  ctx.restore();
  // 亮著的池核 LED：疊上光暈圖，跟著燈閃（混合模式、不透明度照編輯器設的，js/maploader.js 的 drawMapStampImg）
  poweredGlowDrawing=true;
  try{for(const [s,led] of poweredGlowStamps()){
    const k=typeof flickerLevelOfStamp==='function'?flickerLevelOfStamp(led):(mapPowerIsOn(circuitOf(led))?1:0);
    if(k<=0)continue;
    ctx.save();ctx.globalAlpha=k;drawMapStampImg(ctx,s,true);ctx.restore();
  }}finally{poweredGlowDrawing=false;}
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
