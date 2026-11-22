# 用法：python tools/recolor-moth-queen.py images/monster/人面蝶 images/monster/moth-queen spots
# 人面蝶后的圖是從人面蝶的圖換色來的（最後的 spots＝紅斑和身體也換色）；人面蝶的圖改了（包括 -前方手 圖），跑一次這個就能重新產生蝶后的圖
# 人面蝶后換色：綠翅膀 → 紫藍、後面的青藍小翅膀 → 深藍（spots=True 時翅膀上的紅斑和紅身體也換成紫紅）
# 每張動作圖和它的「-前方手」圖都一起換（前方手只有皮膚，換了也一樣，但要放在同一個資料夾）
import sys, colorsys, glob, os
from PIL import Image
def hsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h / 360, max(0, min(1, s)), max(0, min(1, v))); return (round(r*255), round(g*255), round(b*255))
def recolor(p, spots):
    r, g, b, a = p
    if a == 0: return p
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h * 360
    if 100 <= hd <= 172 and s >= .12: return hsv(250, s * .85, v * .95) + (a,)    # 綠翅膀（含淡綠的亮面）→ 紫藍
    if 174 <= hd <= 192 and s >= .4: return hsv(226, s, v) + (a,)                # 青藍小翅膀 → 深藍
    if spots and (hd >= 345 or hd <= 2) and s >= .55: return hsv(305, s * .9, v * .92) + (a,)   # 紅斑、紅身體 → 紫紅（皮膚的淡粉紅飽和度低，不會換到）
    return p
if __name__ == '__main__':
    src, dst, spots = sys.argv[1], sys.argv[2], len(sys.argv) > 3 and sys.argv[3] == 'spots'
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, '*.png'))):
        im = Image.open(f).convert('RGBA'); px = im.load()
        for y in range(im.height):
            for x in range(im.width): px[x, y] = recolor(px[x, y], spots)
        im.save(os.path.join(dst, os.path.basename(f)))
