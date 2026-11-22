# 用法：python tools/recolor-banana-emperor.py images/monster/golden-banana-king images/monster/banana-emperor 12
# 金蕉大王的圖是從金蕉王的圖換色來的（最後的 12＝身體往紅色偏 12 度）；金蕉王的圖改了，跑一次這個就能重新產生大王的圖
# 金蕉大王換色：綠披風 → 深紫藍；金色的身體往紅色偏（頭上的香蕉冠維持黃色）
# 用法：python recolor_banana.py 來源資料夾 輸出資料夾 [身體色相往紅轉幾度，預設 18]
import sys, colorsys, glob, os
from PIL import Image
def hsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb((h % 360) / 360, max(0, min(1, s)), max(0, min(1, v))); return (round(r*255), round(g*255), round(b*255))
def recolor(p, red):
    r, g, b, a = p
    if a == 0: return p
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h * 360
    if 105 <= hd <= 130 and s >= .3: return hsv(250, s, min(v * 1.2, .9)) + (a,)          # 綠披風 → 深紫藍
    if red and 26 <= hd <= 43 and s >= .2: return hsv(hd - red, s * 1.1, v * .97) + (a,)   # 金色身體 → 往紅色偏 red 度、稍微濃一點
    return p
if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    red = float(sys.argv[3]) if len(sys.argv) > 3 else 18
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, 'golden-banana-king-*.png'))):   # 只換金蕉王本人的圖（香蕉、香蕉皮不換）
        im = Image.open(f).convert('RGBA'); px = im.load()
        for y in range(im.height):
            for x in range(im.width): px[x, y] = recolor(px[x, y], red)
        im.save(os.path.join(dst, os.path.basename(f)))
