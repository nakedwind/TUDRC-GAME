# 用法：python tools/recolor-bird-elite.py images/monster/bird-head images/monster/bird-head-elite
# 鳥頭大隊長的圖是從普通鳥頭人的圖換色來的；鳥頭人的圖改了，跑一次這個就能重新產生大隊長的圖
# 鳥頭人換色：黃色的頭 → 紫藍色，藍色的眼睛 → 紅色（明暗層次照原圖）
import sys, colorsys, glob, os
from PIL import Image
def recolor(p):
    r, g, b, a = p
    if a == 0: return p
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h*360
    if 50 <= hd <= 62 and s >= .35:      # 黃色（頭）
        h2, s2, v2 = 248/360, s*.56, v*.93
    elif 200 <= hd <= 215 and s >= .5:   # 藍色（眼睛）
        h2, s2, v2 = 356/360, s, v
    else: return p
    r2, g2, b2 = colorsys.hsv_to_rgb(h2, s2, v2)
    return (round(r2*255), round(g2*255), round(b2*255), a)
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for f in sorted(glob.glob(os.path.join(src, '*.png'))):
    im = Image.open(f).convert('RGBA'); im.putdata([recolor(p) for p in im.getdata()])
    im.save(os.path.join(dst, os.path.basename(f)))
