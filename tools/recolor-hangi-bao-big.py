# 用法：python tools/recolor-hangi-bao-big.py images/monster/Hangi-Bao images/monster/hangi-bao-big 0.93
# 大夯吉寶／順順宮主的圖是從夯吉寶的圖換色來的（最後的 0.93＝亮度）；夯吉寶的圖改了，跑一次這個就能重新產生
# 大夯吉寶換色：黃色身體 → 紫藍色（紅帽子、愛心、白手套、黑腳不換）
# 用法：python recolor_hangi.py 來源資料夾 輸出資料夾 [亮度倍率，預設 0.93；越小越深]
# 只換夯吉寶本人的圖（站著、眨眼、走路）；順順宮帽不換
import sys, colorsys, glob, os
from PIL import Image
def hsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h / 360, max(0, min(1, s)), max(0, min(1, v))); return (round(r*255), round(g*255), round(b*255))
def recolor(p, dark):
    r, g, b, a = p
    if a == 0: return p
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h * 360
    if 34 <= hd <= 52 and s >= .5: return hsv(248, s * .6, v * dark) + (a,)   # 黃色身體（含暗紋）→ 紫藍，明暗照原圖
    return p
if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    dark = float(sys.argv[3]) if len(sys.argv) > 3 else .93
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, 'hangi-bao*.png'))):
        im = Image.open(f).convert('RGBA'); px = im.load()
        for y in range(im.height):
            for x in range(im.width): px[x, y] = recolor(px[x, y], dark)
        im.save(os.path.join(dst, os.path.basename(f)))
