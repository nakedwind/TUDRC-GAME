# 用法：python tools/recolor-loofah-queen.py images/monster/loofah-lady images/monster/loofah-queen dress
# 絲瓜女王的圖是從絲瓜小姐的圖換色來的（最後的 dress＝裙子也換色）；絲瓜小姐的圖改了，跑一次這個就能重新產生女王的圖
# 絲瓜女王換色：綠色的絲瓜頭 → 紫藍色，綠眼珠 → 紅色（dress=True 時黃裙子、袖子也換成淡紫）
import sys, colorsys, glob, os
from PIL import Image
def hsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h / 360, max(0, min(1, s)), max(0, min(1, v))); return (round(r*255), round(g*255), round(b*255))
def recolor(p, dress):
    r, g, b, a = p
    if a == 0: return p
    if (r, g, b) == (84, 154, 88): return (225, 40, 52, a)                                   # 眼珠（只有眼睛用這個綠）→ 紅
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h * 360
    if 85 <= hd <= 120 and s >= .3: return hsv(248, s, min(v * 1.25, .95)) + (a,)             # 絲瓜頭（綠）→ 紫藍
    if dress and 40 <= hd <= 58 and s >= .35: return hsv(255, s * .55, v) + (a,)              # 黃裙子、袖子 → 淡紫
    return p
if __name__ == '__main__':
    src, dst, dress = sys.argv[1], sys.argv[2], len(sys.argv) > 3 and sys.argv[3] == 'dress'
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, '*.png'))):
        im = Image.open(f).convert('RGBA'); px = im.load()
        for y in range(im.height):
            for x in range(im.width): px[x, y] = recolor(px[x, y], dress)
        im.save(os.path.join(dst, os.path.basename(f)))
