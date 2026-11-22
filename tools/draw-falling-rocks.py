# 產生落石的點陣圖（參考 images/破損建築/rubble-rocks.png 的畫風：黑色外框、亮的頂面、暗的側面、一點雜點）
#   小顆（絲瓜女王重踏震下來的碎石，不擋路）：images/破損建築/falling-rock-small-01～03.png（每張 1～2 塊）
#   大顆（葫蘆猴王壓頂震下來的落石，落地擋路）：images/破損建築/falling-rock-big-01～02.png（直接畫大，不是放大）
#   地圖編輯器擺的石頭（擋路、虱目魚王會吞來吐人）：images/item-obstacle/rock-small-01～03.png（40×40，1 格）、rock-big-01～02.png（80×80，2×2 格）
#     ＝上面同一批圖放在剛好一格（兩格）大的畫布上、底部置中（素材在 data/tiles.js 的 tile_obstacle_rock_*）
#   中石頭（只有地圖物件版）：images/item-obstacle/rock-medium-01～02.png（40×40，1 格，石頭幾乎佔滿一格）
# 用法：python tools/draw-falling-rocks.py（固定亂數種子，每次產生一樣的圖）
import math, random
from PIL import Image, ImageDraw

OUT = 'images/破損建築/'
TOP = [(201, 174, 140), (196, 169, 133), (188, 161, 126)]   # 頂面（亮米色）
RIM = (214, 190, 155)                                        # 頂面靠前的亮邊
LEFT = (132, 115, 91)                                        # 朝左的側面（中間色）
FRONT = (104, 91, 74)                                        # 朝前的側面
RIGHT = (86, 76, 62)                                         # 朝右的側面（最暗）
LINE = (18, 16, 15)                                          # 外框


def jitter(c, rnd, k=6):
    d = rnd.randint(-k, k)
    return tuple(max(0, min(255, v + d)) for v in c)


def rock(img, mask, cx, cy, rx, ry, h, n, rnd):
    """畫一塊多面的石頭：cx, cy＝頂面中心；rx, ry＝頂面半徑；h＝側面高度；n＝頂面幾個角"""
    pts = []
    a0 = rnd.random() * math.pi * 2
    for i in range(n):
        a = a0 + i / n * math.pi * 2 + rnd.uniform(-.25, .25)
        r = rnd.uniform(.82, 1.08)
        pts.append((cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r))
    bot = [(cx + (x - cx) * .9, cy + (y - cy) * .9 + h) for x, y in pts]   # 底部稍微內縮：看起來比較厚實
    d = ImageDraw.Draw(img)
    dm = ImageDraw.Draw(mask)
    faces = []
    for i in range(n):
        p, q = pts[i], pts[(i + 1) % n]
        ex, ey = q[0] - p[0], q[1] - p[1]
        nx, ny = ey, -ex   # 外側法線（頂點逆時針排）
        L = math.hypot(nx, ny) or 1
        nx, ny = nx / L, ny / L
        if ny <= 0.05:
            continue        # 朝後的面看不到
        col = LEFT if nx < -.45 else RIGHT if nx > .45 else FRONT
        faces.append(([p, q, bot[(i + 1) % n], bot[i]], col))
    for poly, col in faces:
        d.polygon(poly, fill=col); dm.polygon(poly, fill=255)
    d.polygon(pts, fill=TOP[2]); dm.polygon(pts, fill=255)
    # 頂面中間鼓起來：內圈比較亮、往上偏一點（像倒角）
    inner = [(cx + (x - cx) * .7, cy + (y - cy) * .7 - ry * .18) for x, y in pts]
    d.polygon(inner, fill=TOP[0])
    for i in range(n):   # 倒角的稜線：內圈的角連到外圈的角
        d.line([inner[i], pts[i]], fill=TOP[1])
    # 頂面靠前的邊：亮邊（看起來有稜角）
    for i in range(n):
        p, q = pts[i], pts[(i + 1) % n]
        ex, ey = q[0] - p[0], q[1] - p[1]
        if -ex > 0.3 * math.hypot(ex, ey):   # 頂面的前緣（往左走的邊在下方）
            d.line([p, q], fill=RIM)
    # 側面之間的稜線（稍微暗一點）
    for poly, col in faces:
        a, b = poly[0], poly[3]
        d.line([a, b], fill=tuple(max(0, v - 18) for v in col))
    return pts


def finish(img, mask, rnd):
    """加雜點、描黑框"""
    W, H = img.size
    px, m = img.load(), mask.load()
    for y in range(H):
        for x in range(W):
            if m[x, y]:
                r, g, b, a = px[x, y]
                c = jitter((r, g, b), rnd, 5)
                if rnd.random() < .06:   # 零星的小斑點
                    c = tuple(max(0, v - 22) for v in c)
                px[x, y] = c + (255,)
    for _ in range(2):   # 清掉只有一點點凸出去的像素（多邊形尖角留下的毛刺）
        for y in range(H):
            for x in range(W):
                if m[x, y] and sum(1 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < W and 0 <= y + dy < H and m[x + dx, y + dy]) <= 1:
                    m[x, y] = 0; px[x, y] = (0, 0, 0, 0)
    edge = []
    for y in range(H):
        for x in range(W):
            if m[x, y]:
                continue
            if any(0 <= x + dx < W and 0 <= y + dy < H and m[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                edge.append((x, y))
    for x, y in edge:
        px[x, y] = LINE + (255,)


def make(name, size, rocks, seed):
    rnd = random.Random(seed)
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    mask = Image.new('L', size, 0)
    for args in rocks:
        rock(img, mask, *args, rnd)
    finish(img, mask, rnd)
    img.save(OUT + name)
    return img


imgs = [
    make('falling-rock-small-01.png', (24, 18), [(12, 8, 8, 4.5, 5, 6)], 11),
    make('falling-rock-small-02.png', (30, 20), [(11, 9, 8, 4.5, 5, 6), (22, 13, 4.5, 2.5, 3, 5)], 12),
    make('falling-rock-small-03.png', (28, 20), [(17, 8, 7, 4, 5, 5), (8, 13, 5, 3, 3, 6)], 13),
    make('falling-rock-big-01.png', (80, 80), [(40, 34, 27, 15, 24, 7)], 21),
    make('falling-rock-big-02.png', (80, 80), [(34, 36, 24, 14, 22, 7), (62, 60, 9, 5, 7, 6)], 22),
]

# 地圖物件版：放在格子大小的畫布上，底部置中（貼齊格子底線，跟其他擋路物件一樣）
for i, im in enumerate(imgs):
    small = i < 3
    W = 40 if small else 80
    pad = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    pad.paste(im, ((W - im.width) // 2, W - im.height - (2 if small else 0)), im)
    pad.save('images/item-obstacle/' + ('rock-small-0%d.png' % (i + 1) if small else 'rock-big-0%d.png' % (i - 2)))

# 中石頭：直接畫在 40×40 的畫布上（比小石頭大、比大石頭小，佔滿一格）
OUT_SAVE = OUT
OUT = 'images/item-obstacle/'
imgs_medium = [
    make('rock-medium-01.png', (40, 40), [(20, 17, 15, 8.5, 12, 7)], 31),
    make('rock-medium-02.png', (40, 40), [(17, 18, 13, 7.5, 11, 7), (32, 31, 5, 3, 4, 5)], 32),
]
OUT = OUT_SAVE
imgs += imgs_medium

# 給人看的預覽：放大 6 倍排在一起（不放進遊戲）
import sys
if len(sys.argv) > 1:
    sheet = Image.new('RGBA', (sum(i.width for i in imgs) * 6 + 60, 80 * 6 + 20), (143, 138, 122, 255))
    x = 10
    for i in imgs:
        sheet.paste(i.resize((i.width * 6, i.height * 6), Image.NEAREST), (x, 10), i.resize((i.width * 6, i.height * 6), Image.NEAREST))
        x += i.width * 6 + 10
    sheet.save(sys.argv[1])
