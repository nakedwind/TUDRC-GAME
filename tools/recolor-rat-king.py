# 用法：python tools/recolor-rat-king.py images/monster/burrowing-mouse images/monster/rat-king
# 花蓮老鼠王的圖是從花蓮版權老鼠的圖換色來的；老鼠的圖改了，跑一次這個就能重新產生老鼠王的圖
# 花蓮老鼠王換色：黑毛 → 深紫藍、淺藍（領結、袖子、眼影）→ 紫藍（face=True 時米色的臉也換成淡紫）
# 只換老鼠本人的圖（身體、眨眼、暈眩、手、拳頭）；地洞、土堆不換
import sys, colorsys, glob, os
from PIL import Image
FILES = ['mouse-open', 'mouse-half', 'mouse-closed', 'mouse-dizzy01', 'mouse-dizzy02', 'mouse-dizzy03', 'mouse-dizzy04', 'left-hand', 'left-fist']
def hsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h / 360, max(0, min(1, s)), max(0, min(1, v))); return (round(r*255), round(g*255), round(b*255))
def recolor(p, face):
    r, g, b, a = p
    if a == 0: return p
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255); hd = h * 360
    if (hd >= 350 or hd <= 10) and .1 <= s <= .4 and .06 <= v <= .3: return hsv(250, .45, v * 1.5) + (a,)   # 黑毛（帶一點紅的深灰）→ 深紫藍
    if 185 <= hd <= 205 and s >= .3: return hsv(252, s * .9, v) + (a,)                                     # 淺藍 → 紫藍
    if face and 30 <= hd <= 48 and .2 <= s <= .42 and v >= .75: return hsv(262, s * .5, v) + (a,)           # 米色臉 → 淡紫
    return p
if __name__ == '__main__':
    src, dst, face = sys.argv[1], sys.argv[2], len(sys.argv) > 3 and sys.argv[3] == 'face'
    os.makedirs(dst, exist_ok=True)
    for n in FILES:
        im = Image.open(os.path.join(src, n + '.png')).convert('RGBA'); px = im.load()
        for y in range(im.height):
            for x in range(im.width): px[x, y] = recolor(px[x, y], face)
        im.save(os.path.join(dst, n + '.png'))
