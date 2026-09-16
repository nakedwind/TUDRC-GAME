const STORE='td-object-editor-v1';
const clone=x=>JSON.parse(JSON.stringify(x));
let objects; try{objects=JSON.parse(localStorage.getItem(STORE))||clone(OBSTACLES)}catch(_){objects=clone(OBSTACLES)}
let index=0, orient='h';
const $=id=>document.getElementById(id), fields=['name','cost','hp','file','w','h'];
function save(){localStorage.setItem(STORE,JSON.stringify(objects));$('status').textContent='✓ 已自動保存';setTimeout(()=>{$('status').textContent=''},900)}
function current(){return objects[index]} function variant(){return current()[orient]}
function renderList(){$('list').innerHTML='';objects.forEach((o,i)=>{const b=document.createElement('button');b.textContent=o.name;b.classList.toggle('sel',i===index);b.onclick=()=>{index=i;render()};$('list').appendChild(b)})}
function render(){const o=current(),v=variant();$('name').value=o.name;$('cost').value=o.cost;$('hp').value=o.hp;$('file').value=v.file;$('w').value=v.w;$('h').value=v.h;document.querySelectorAll('[data-o]').forEach(b=>b.classList.toggle('sel',b.dataset.o===orient));renderList();renderGrid()}
function renderGrid(){const v=variant(),g=$('grid');g.innerHTML='';g.style.gridTemplateColumns=`repeat(${v.w},80px)`;g.style.gridTemplateRows=`repeat(${v.h},80px)`;const img=document.createElement('img');img.src=v.file;img.alt='物件圖片';g.appendChild(img);const set=new Set((v.solid||[]).map(x=>x.join(',')));for(let y=0;y<v.h;y++)for(let x=0;x<v.w;x++){const c=document.createElement('div');c.className='cell'+(set.has(x+','+y)?' solid':'');c.onclick=()=>toggle(x,y);g.appendChild(c)}}
function toggle(x,y){const v=variant(),key=x+','+y,set=new Set((v.solid||[]).map(a=>a.join(',')));set.has(key)?set.delete(key):set.add(key);v.solid=[...set].map(k=>k.split(',').map(Number)).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);save();renderGrid()}
document.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{orient=b.dataset.o;render()});
['name','cost','hp'].forEach(id=>$(id).onchange=()=>{current()[id]=id==='name'?$(id).value:Number($(id).value);save();render()});
['file','w','h'].forEach(id=>$(id).onchange=()=>{const v=variant();v[id]=id==='file'?$(id).value:Math.max(1,Number($(id).value)||1);v.solid=(v.solid||[]).filter(([x,y])=>x<v.w&&y<v.h);save();render()});
// ---- 新增／刪除物件 ----
const OBJ_CELL=40, uid=()=>'obj_'+Date.now().toString(36);
const blankVariant=()=>({file:'',w:1,h:1,solid:[[0,0]]});
$('addObj').onclick=()=>{objects.push({id:uid(),name:'新物件',cost:20,hp:100,h:blankVariant(),v:blankVariant()});index=objects.length-1;orient='h';save();render()};
$('delObj').onclick=()=>{if(objects.length<=1){alert('至少要保留一個物件');return}if(!confirm('確定刪除「'+current().name+'」？'))return;objects.splice(index,1);if(index>=objects.length)index=objects.length-1;save();render()};
// ---- 選圖片：自動填路徑，並依圖片大小猜佔幾格（圖片本身要自己放進 images/item-obstacle/）----
$('pickImg').onclick=()=>$('imgFile').click();
$('imgFile').onchange=()=>{const f=$('imgFile').files[0];if(!f)return;const path='images/item-obstacle/'+f.name;const done=(w,h)=>{const v=variant();v.file=path;if(w){v.w=Math.max(1,Math.min(10,w));v.h=Math.max(1,Math.min(10,h))}v.solid=(v.solid||[]).filter(([x,y])=>x<v.w&&y<v.h);save();render();setTimeout(()=>{$('status').textContent='✓ 路徑已填入。記得把圖片「'+f.name+'」放進 images/item-obstacle/ 資料夾'},950)};const probe=new Image();probe.onload=()=>{done(Math.round(probe.naturalWidth/OBJ_CELL),Math.round(probe.naturalHeight/OBJ_CELL));URL.revokeObjectURL(probe.src)};probe.onerror=()=>{done()};probe.src=URL.createObjectURL(f);$('imgFile').value=''};
function source(){return '/* ===== 障礙物資料（由物件編輯器匯出）===== */\nconst OBSTACLES = '+JSON.stringify(objects,null,2)+';\n'}
$('generate').onclick=()=>{$('out').value=source()};$('download').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([source()],{type:'text/javascript'}));a.download='objects.js';a.click();URL.revokeObjectURL(a.href)};
$('reset').onclick=()=>{if(confirm('確定丟棄瀏覽器裡的編輯，從 objects.js 重新載入？')){objects=clone(OBSTACLES);localStorage.removeItem(STORE);index=0;render()}};render();
