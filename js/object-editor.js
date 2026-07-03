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
function source(){return '/* ===== 障礙物資料（由物件編輯器匯出）===== */\nconst OBSTACLES = '+JSON.stringify(objects,null,2)+';\n'}
$('generate').onclick=()=>{$('out').value=source()};$('download').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([source()],{type:'text/javascript'}));a.download='objects.js';a.click();URL.revokeObjectURL(a.href)};
$('reset').onclick=()=>{if(confirm('確定丟棄瀏覽器裡的編輯，從 objects.js 重新載入？')){objects=clone(OBSTACLES);localStorage.removeItem(STORE);index=0;render()}};render();
