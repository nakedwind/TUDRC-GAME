/* 雙片鐵門：左片向右滑，右片向左滑。 */
const IRON_GATE={type:'irongate',radius:88,duration:.45};
function ironGateProgress(o){
  if(!o.gateMotion)return o.gateSide==='left'?1:o.gateSide==='right'?-1:0;
  const m=o.gateMotion,k=Math.min(1,(performance.now()-m.at)/(IRON_GATE.duration*1000));
  return m.from+(m.to-m.from)*(k*k*(3-2*k));
}
function ironGateNearPlayer(){
  const p=G?.player;if(!p||p.sitting||p.hp<=0)return null;
  let best=null,distance=IRON_GATE.radius;
  for(const o of G.obstacles){
    if(o.type!==IRON_GATE.type||o.hp<=0)continue;
    const half=(o.w||4)*CELL/2;
    const x=OX+o.c*CELL+(o.artX!=null?o.artX-(OX+o.c*CELL):0),y=(o.artY??OY+o.r*CELL)+(o.h||2)*CELL-CELL/2;
    const side=p.x<x+half?'left':'right';
    const cx=x+(side==='left'?half/2:half*1.5),d=Math.hypot(cx-p.x,y-p.y);
    if(d<distance){best={o,side,x:cx,y,top:o.artY??OY+o.r*CELL};distance=d;}
  }
  return best;
}
function setIronGateSide(o,side){
  const w=o.w||4,row=(o.h||2)-1,half=w/2;
  const next=[];for(let c=0;c<w;c++)if(!side||(side==='left'?c>=half:c<half))next.push([c,row]);
  const occupied=(c,r)=>[G.player,...G.towers,...G.npcs,...G.enemies].some(a=>a&&!a.dead&&(a.hp==null||a.hp>0)&&cellAt(a.x,a.y).join(',')===c+','+r);
  if(next.some(([dc,dr])=>occupied(o.c+dc,o.r+dr)|| (G.grid[(o.c+dc)+','+(o.r+dr)]&&G.grid[(o.c+dc)+','+(o.r+dr)]!==o)))return false;
  const from=ironGateProgress(o);
  for(const [dc,dr] of obstacleSolidCells(o)){const key=(o.c+dc)+','+(o.r+dr);if(G.grid[key]===o)delete G.grid[key];}
  o.solid=next;for(const [dc,dr] of next)G.grid[(o.c+dc)+','+(o.r+dr)]=o;
  o.gateSide=side;o.gateMotion={from,to:side==='left'?1:side==='right'?-1:0,at:performance.now()};
  computeFlow();for(const a of [...G.towers,...G.npcs]){a.navPath=null;a.navGoal=null;a.navFailed=false;}
  for(const e of G.enemies)if(typeof resetEnemyNavigation==='function')resetEnemyNavigation(e);
  return true;
}
function toggleIronGateNearPlayer(){
  const near=ironGateNearPlayer();if(!near)return false;
  const side=near.o.gateSide===near.side?null:near.side;
  if(!setIronGateSide(near.o,side)){sfx('error');flash('門口有人或物件，無法滑動',near.x,near.top-8,'#ff8f8f');}
  else sfx('ironGateSlide');
  return true;
}
function drawSlidingIronGate(ctx,o,img,x,y,w,h){
  if(!img?.complete||!img.naturalWidth)return false;
  const progress=ironGateProgress(o),sw=img.naturalWidth/2,half=w/2;
  const left=()=>ctx.drawImage(img,0,0,sw,img.naturalHeight,x+Math.max(0,progress)*half,y,half,h);
  const right=()=>ctx.drawImage(img,sw,0,sw,img.naturalHeight,x+half+Math.min(0,progress)*half,y,half,h);
  if(progress>=0){right();left();}else{left();right();}
  return true;
}
