# 用法：python tools/recolor-gourd-king.py images/monster/gourd-monkey images/monster/gourd-king 0.93
# 葫蘆猴王的圖是從葫蘆猴的圖換色來的（最後的 0.93＝亮度，越小越深）；葫蘆猴的圖改了，跑一次這個就能重新產生猴王的圖
# 葫蘆猴王換色：葫蘆身體 → 紫藍色（紅臉、桃子、葉子不換）
# 用法：python recolor_gourd.py 來源資料夾 輸出資料夾 [亮度倍率，預設 0.93；越小越深]
import sys, colorsys, glob, os
from PIL import Image
PEACH_YELLOW = (240, 223, 128)   # 桃子上的黃色（跟葫蘆的亮黃很接近，要排除）
def hsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h / 360, max(0, min(1, s)), max(0, min(1, v))); return (round(r*255), round(g*255), round(b*255))
def recolor(p, dark):
    r, g, b, a = p
    if a == 0 or (r, g, b) == PEACH_YELLOW: return p
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h * 360
    if 25 <= hd <= 53 and s >= .4: return hsv(248, s * .62, v * dark) + (a,)   # 葫蘆（黃、橘、亮黃）→ 紫藍，明暗照原圖
    return p
if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    dark = float(sys.argv[3]) if len(sys.argv) > 3 else .93
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, '*.png'))):
        im = Image.open(f).convert('RGBA'); px = im.load()
        for y in range(im.height):
            for x in range(im.width): px[x, y] = recolor(px[x, y], dark)
        im.save(os.path.join(dst, os.path.basename(f)))
