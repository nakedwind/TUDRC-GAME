# 用法：python tools/recolor-pearl-elder.py images/monster/pearl-kid images/monster/pearl-elder cap
# 珍珠大童的圖是從珍珠小童的圖換色來的（最後的 cap＝帽子也換色）；珍珠小童的圖改了，跑一次這個就能重新產生大童的圖
# 珍珠大童換色：貝殼 → 紫藍色，眼睛 → 紅色（cap=True 時帽子的粉紅也換成紫藍）
import sys, colorsys, glob, os
from PIL import Image
EYE_BOX = (24, 28, 56, 40)          # 眼睛所在的範圍（只在這裡換眼睛顏色，避免換到別處同色的像素）
EYES = {(58, 41, 41): (255, 37, 37), (35, 6, 6): (79, 0, 0), (29, 16, 16): (79, 0, 0)}   # 一般的咖啡色眼睛 → 生氣時那種紅眼睛
def hsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h / 360, max(0, min(1, s)), max(0, min(1, v))); return (round(r*255), round(g*255), round(b*255))
def recolor(p, x, y, cap):
    r, g, b, a = p
    if a == 0: return p
    if EYE_BOX[0] <= x < EYE_BOX[2] and EYE_BOX[1] <= y < EYE_BOX[3] and (r, g, b) in EYES: return EYES[(r, g, b)] + (a,)
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h * 360
    if (hd >= 345 or hd <= 12) and .04 <= s <= .25: return hsv(245, s * 1.6 + .08, v) + (a,)     # 貝殼內側（灰粉）→ 灰紫藍
    if 110 <= hd <= 170 and s >= .15: return hsv(248, s * .7, min(v * 1.25, .85)) + (a,)                                # 貝殼外側（深綠）→ 深紫藍
    if cap and 328 <= hd < 345 and s >= .15: return hsv(250, s * 1.1, v * .95) + (a,)             # 帽子的粉紅 → 紫藍
    return p
if __name__ == '__main__':
    src, dst, cap = sys.argv[1], sys.argv[2], len(sys.argv) > 3 and sys.argv[3] == 'cap'
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, '*.png'))):
        im = Image.open(f).convert('RGBA'); px = im.load()
        for y in range(im.height):
            for x in range(im.width): px[x, y] = recolor(px[x, y], x, y, cap)
        im.save(os.path.join(dst, os.path.basename(f)))
