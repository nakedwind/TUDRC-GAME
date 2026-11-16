# 畫「綁人的繩子」：images/回憶場景/rope_tied.png（64×64，跟角色圖一樣大、一格一格對齊）
# 劇情裡角色欄位 tied／每頁 tie 會把這張圖疊在角色身上（js/story-scene.js 的 drawActor）。
# 繩子繞兩圈綁住手臂和身體，正面偏右打一個結，兩條繩尾垂下來。
# 用法：python tools/draw-rope.py（會順便輸出 rope_preview.png：疊在塔納身上放大 6 倍，給人看效果用，不會進遊戲）
from PIL import Image
import os, sys

W = H = 64
OUTLINE = (74, 48, 26, 255)     # 繩子外框（深咖啡）
SHADOW = (150, 104, 56, 255)    # 繩子暗面
BASE = (200, 156, 96, 255)      # 繩子本色
LIGHT = (236, 206, 148, 255)    # 繩子亮面（麻繩一股一股的紋路）

img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
px = img.load()

def put(x, y, c):
    if 0 <= x < W and 0 <= y < H:
        px[x, y] = c

def band(y, x0, x1, sag=0):
    """一圈橫著繞過身體的繩子：3 像素粗（上外框、2 排繩身、下外框），中間微微往下垂 sag 像素。
    繩身用斜斜的亮暗紋路畫出麻繩扭在一起的感覺。"""
    mid = (x0 + x1) / 2
    for x in range(x0, x1 + 1):
        # 越靠中間越往下垂一點（像真的勒在身上）
        d = 1 - abs(x - mid) / max(1, (x1 - x0) / 2)
        yy = y + round(sag * d)
        put(x, yy - 1, OUTLINE)
        put(x, yy + 2, OUTLINE)
        # 斜紋：每 3 格一個循環
        k = (x + yy) % 3
        put(x, yy, LIGHT if k == 0 else BASE)
        put(x, yy + 1, BASE if k == 0 else SHADOW if k == 1 else BASE)
    # 兩端收邊（繩子繞到身體後面）
    for yy in (y, y + 1):
        put(x0 - 1, yy, OUTLINE)
        put(x1 + 1, yy, OUTLINE)

# 兩圈繩子：上面一圈在手臂上半，下面一圈在手肘附近
band(46, 15, 48, sag=1)
band(51, 16, 47, sag=1)

# 正面偏右的結（一團圓圓的）＋兩條垂下來的繩尾
knot = [
    "..OOOO..",
    ".OLBBSO.",
    "OLBLBBSO",
    "OBLBBSSO",
    "OBBBSSSO",
    ".OSSSSO.",
    "..OOOO..",
]
col = {'O': OUTLINE, 'L': LIGHT, 'B': BASE, 'S': SHADOW}
kx, ky = 33, 46
for j, row in enumerate(knot):
    for i, ch in enumerate(row):
        if ch in col:
            put(kx + i, ky + j, col[ch])

def tail(x, y, length, lean):
    """一條垂下來的繩尾：2 像素粗，往旁邊斜一點（lean：每幾格往右 1 像素，負＝往左）"""
    for j in range(length):
        xx = x + (j // abs(lean)) * (1 if lean > 0 else -1)
        yy = y + j
        put(xx - 1, yy, OUTLINE)
        put(xx, yy, LIGHT if (j % 3 == 0) else BASE)
        put(xx + 1, yy, SHADOW)
        put(xx + 2, yy, OUTLINE)
    # 尾端散開的一小撮
    xx = x + ((length - 1) // abs(lean)) * (1 if lean > 0 else -1)
    put(xx - 1, y + length, OUTLINE); put(xx, y + length, BASE); put(xx + 1, y + length, BASE); put(xx + 2, y + length, OUTLINE)
    put(xx, y + length + 1, OUTLINE); put(xx + 1, y + length + 1, OUTLINE)

tail(35, 53, 6, -4)
tail(38, 53, 7, 3)

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'images', '回憶場景', 'rope_tied.png')
img.save(out)
print('已輸出', out)

# 預覽：疊在塔納正面圖上、放大 6 倍
if len(sys.argv) > 1:
    body = Image.open(os.path.join(root, 'images', 'character', 'taana_A', 'taanaA_0000_Front.png')).convert('RGBA')
    body.alpha_composite(img)
    bg = Image.new('RGBA', body.size, (60, 64, 80, 255)); bg.alpha_composite(body)
    bg.resize((W * 6, H * 6), Image.NEAREST).save(sys.argv[1])
    print('預覽', sys.argv[1])
