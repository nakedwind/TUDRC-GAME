/* 電源控制燈：同一張地圖共用電源，進入時預設關閉。 */
let poweredMap = null, mapPowerOn = false;
const isPoweredLightTile = tile => {
  const file=String(tile?.file||'').replaceAll('\\','/');
  return file.endsWith('/electric-light-02.png') || /^electric-light-02(?:\.png)?$/i.test(String(tile?.name||'')) || tile?.id==='tile_interactive_electric_light_02';
};
function resetMapPower(){poweredMap=MAP;mapPowerOn=false;}
function mapPowerIsOn(){return poweredMap===MAP&&mapPowerOn;}
function toggleMapPower(){if(poweredMap!==MAP)resetMapPower();mapPowerOn=!mapPowerOn;}
function poweredLightFixtures(){
  if(!MAP)return [];
  const lamps=[];
  const add=(id,c,r,s=null)=>{
    const tile=mapTileById(id);if(!isPoweredLightTile(tile))return;
    const w=mapTileW(tile)*CELL,h=mapTileH(tile)*CELL;
    const dx=w*.5,dy=h*.9;
    lamps.push({x:OX+c*CELL+(s?.ox||0)+(s?.fx?w-dx:dx),y:OY+r*CELL+(s?.oy||0)+(s?.fy?h-dy:dy)});
  };
  for(const layer of Object.values(MAP.layers||{}))for(const [key,id] of Object.entries(layer)){const [c,r]=key.split(',').map(Number);add(id,c,r);}
  for(const s of MAP.stamps||[])add(s.id,s.c,s.r,s);
  return lamps;
}
function poweredLightSources(){
  if(!mapPowerIsOn())return [];
  return poweredLightFixtures().map(l=>({...l,r:LIGHT.poweredLampR??250,intensity:LIGHT.poweredLampIntensity??.85}));
}
function drawPoweredLights(ctx){
  if(!mapPowerIsOn())return;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const l of poweredLightFixtures()){
    const glow=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,28);
    glow.addColorStop(0,'rgba(255,248,212,.3)');glow.addColorStop(1,'rgba(255,248,212,0)');
    ctx.fillStyle=glow;ctx.fillRect(l.x-28,l.y-28,56,56);
    ctx.fillStyle='rgba(255,253,225,.65)';ctx.fillRect(l.x-14,l.y-1,28,2);
  }
  ctx.restore();
}
