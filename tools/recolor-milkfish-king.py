# 用法：python tools/recolor-milkfish-king.py images/monster/milkfish-kid images/monster/milkfish-king
# 虱目魚王的圖是從虱目魚小子的圖換色來的；虱目魚小子的圖改了，跑一次這個就能重新產生魚王的圖
# 虱目魚王換色：黃上衣 → 紫藍、藍短褲和藍頭髮 → 深紫藍（hood=True 時魚頭套也換：米白魚肚 → 淡紫、灰藍魚背 → 深紫藍）
# 只換魚本人的圖（站著、走路、笑、攻擊）；嘴裡露出的隊友的腳（legs-*）不換
import sys, colorsys, glob, os
from PIL import Image
def hsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h / 360, max(0, min(1, s)), max(0, min(1, v))); return (round(r*255), round(g*255), round(b*255))
def recolor(p, hood):
    r, g, b, a = p
    if a == 0: return p
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h * 360
    if 28 <= hd <= 48 and s >= .5 and v >= .6: return hsv(250, s * .6, v * .92) + (a,)   # 黃上衣（含暗面）→ 紫藍
    if 185 <= hd <= 200 and s >= .7: return hsv(258, s * .75, v * .85) + (a,)          # 藍短褲、藍頭髮 → 深紫藍
    if hood and 205 <= hd <= 220 and s >= .15: return hsv(250, .45, v * 1.1) + (a,)     # 灰藍魚背 → 深紫藍
    if hood and 26 <= hd <= 42 and s <= .14 and v >= .6: return hsv(255, s * 2 + .08, v) + (a,)   # 米白魚肚 → 淡紫
    return p
if __name__ == '__main__':
    src, dst, hood = sys.argv[1], sys.argv[2], len(sys.argv) > 3 and sys.argv[3] == 'hood'
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, '*.png'))):
        if '-legs-' in f: continue
        im = Image.open(f).convert('RGBA'); px = im.load()
        for y in range(im.height):
            for x in range(im.width): px[x, y] = recolor(px[x, y], hood)
        im.save(os.path.join(dst, os.path.basename(f)))
