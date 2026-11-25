# 用法：python tools/recolor-fish-king.py images/monster/fish-head images/monster/fish-king
# 魚頭王的圖是從魚頭君的圖換色來的；魚頭君的圖改了，跑一次這個就能重新產生魚頭王的圖
# 換色：頭上的藍色 → 紫藍色（跟其他 BOSS 一樣），灰藍色 → 灰紫藍，眼睛的黑眼珠 → 紅色
import sys, colorsys, glob, os
from PIL import Image
def hsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h / 360, max(0, min(1, s)), max(0, min(1, v))); return (round(r*255), round(g*255), round(b*255))
def recolor(p):
    r, g, b, a = p
    if a == 0: return p
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h * 360
    if 195 <= hd <= 240 and s >= .3: return hsv(258, min(1, s * .95), v * .9) + (a,)    # 頭上的藍色 → 深紫藍
    if 195 <= hd <= 240 and s >= .08: return hsv(256, s * 1.5, v * .95) + (a,)          # 灰藍色 → 灰紫藍
    return p
# 黑眼珠：一整塊黑色（四周 8 格裡至少 6 格也是黑色），而且在身體上半部 → 紅色
def is_black(px, x, y, w, h): return 0 <= x < w and 0 <= y < h and px[x, y][3] > 0 and px[x, y][:3] == (0, 0, 0)
def pupils(px, w, h):
    out = []
    for y in range(int(h * .5)):
        for x in range(w):
            if not is_black(px, x, y, w, h): continue
            n = sum(is_black(px, x + dx, y + dy, w, h) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy)
            if n >= 6: out.append((x, y))
    return out
if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, '*.png'))):
        im = Image.open(f).convert('RGBA'); px = im.load(); w, h = im.size
        eye = set(pupils(px, w, h))
        # 眼珠的一圈也算（塊狀黑色的邊）
        eye |= {(x + dx, y + dy) for (x, y) in list(eye) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if is_black(px, x + dx, y + dy, w, h)}
        for y in range(h):
            for x in range(w):
                px[x, y] = (255, 37, 37, px[x, y][3]) if (x, y) in eye else recolor(px[x, y])
        im.save(os.path.join(dst, os.path.basename(f)))
        print(os.path.basename(f), '眼珠', len(eye))
