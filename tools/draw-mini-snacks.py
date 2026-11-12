# 畫劇情用的小道具圖（零食、罰寫的紙和筆…，每張 20×20 像素以內，簡化版）：角色手上拿的、桌上擺的都用這些
# 用法：在專案資料夾執行  python tools/draw-mini-snacks.py
# 每個字母代表一種顏色（對照表在每張圖的 pal），「.」是透明。想改圖就直接改下面的格子再跑一次。
import os
from PIL import Image

OUT = 'images/道具/小圖'
SNACKS = {
    '麥香奶茶': dict(pal={'K': '#3a2208', 'B': '#6b3410', 'O': '#f08a1c', 'C': '#fff0c8', 'D': '#5a3a1a', 'Y': '#ffd23e', 'R': '#e0561a'}, rows=[
        'KKKKKKKKKK',
        'KBBBBBBBBK',
        'KOOOOOOOOK',
        'KOCCCCCCOK',
        'KOCDCDDCOK',
        'KOCDCCDCOK',
        'KOCDCDDCOK',
        'KOCCCCCCOK',
        'KOOOOOOOOK',
        'KOYOOOOOOK',
        'KYOYOOOROK',
        'KOYYOORROK',
        'KYYOYRRRRK',
        'KYYYYRRRRK',
        'KYYYYYYRRK',
        'KKKKKKKKKK']),
    '乖乖': dict(pal={'K': '#2f3a14', 'L': '#c4dc7e', 'G': '#8fb84a', 'R': '#d8261e', 'B': '#2a4fa8', 'W': '#ffffff', 'S': '#ffd2a6', 'D': '#40240f', 'O': '#f07a1e', 'C': '#fff3d6'}, rows=[
        '.KKKKKKKKKKKK.',
        'KLLLLLLLLLLLLK',
        'KGGGGGGGGGGGGK',
        'KGRRGGGGBBGGGK',
        'KGRRGGGBBBBGGK',
        'KGGGGGBBBBBBGK',
        'KGWWGGGSSSSGGK',
        'KGWWGGGDSSDGGK',
        'KGGGGGGSSSSGGK',
        'KGGGGGOOOOOOGK',
        'KGCCCCCCCCCCGK',
        'KGCCRRCRRRCCGK',
        'KGCCCCCCCCCCGK',
        'KGGGGGGGGGGGGK',
        'KLLLLLLLLLLLLK',
        '.KKKKKKKKKKKK.']),
    '美美小泡芙': dict(pal={'K': '#5a0a0a', 'D': '#b01212', 'R': '#e8201c', 'Y': '#ffd23e', 'W': '#ffffff', 'B': '#c8862e', 'N': '#6b3a1c', 'T': '#d8261e'}, rows=[
        'KKKKKKKKKKKKKKKK',
        'KDRRRRRRRRRRRRDK',
        'KDRRYRRYYRRYRRDK',
        'KDRYYWWWWWWYYRDK',
        'KDRYWWTWTTWWYRDK',
        'KDRYWWTWTTWWYRDK',
        'KDRRYWWWWWWYRRDK',
        'KDRRRBBRRNNRRRDK',
        'KDRRBBBBRNNNRRDK',
        'KDRRRRRRRRRRRRDK',
        'KKKKKKKKKKKKKKKK']),
    '南海鱈魚香絲': dict(pal={'K': '#141c3c', 'R': '#e0221c', 'W': '#ffffff', 'N': '#1a2a6c', 'E': '#ecd9b0', 'F': '#fbf3e0', 'B': '#2a7ad8'}, rows=[
        'KKKKKKKKKKKK',
        'KRRRRWWRRRRK',
        'KRWWRWWWWWRK',
        'KRNWRNWNWNRK',
        'KRWNRWNWNWRK',
        'KRRRRRRRRRRK',
        'KEFEFEFEFEFK',
        'KFEFEFEFEFEK',
        'KEFEFEFEFEFK',
        'KFENNEFEFEFK',
        'KENNRNEFEFEK',
        'KFNRRNNEFEFK',
        'KBNNRNBWBBWK',
        'KWBBNBBWBBWK',
        'KBBWBBWBBBBK',
        'KKKKKKKKKKKK']),
}

os.makedirs(OUT, exist_ok=True)
for name, s in SNACKS.items():
    rows = s['rows']; w = len(rows[0])
    assert all(len(r) == w for r in rows), name + '：每一列要一樣長'
    assert w <= 20 and len(rows) <= 20, name + '：超過 20×20'
    im = Image.new('RGBA', (w, len(rows)), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c != '.':
                h = s['pal'][c]; im.putpixel((x, y), (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255))
    im.save(os.path.join(OUT, name + '.png'))
    print(name, im.size)

# ---- 罰寫的紙和筆（20×18）：左邊一疊 4 張寫滿的紙（稍微錯開），右邊是正在寫的那張（只寫了上面幾行）和一支斜放的筆，共 5 張 ----
# 「罰寫紙筆.png」給坐在桌子右邊的人（正在寫的那張靠右）；「罰寫紙筆-左.png」左右相反，給坐在桌子左邊的人
def hexrgb(h): return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255)
EDGE, PAPER, INK, PEN = map(hexrgb, ['#8a8272', '#fffdf2', '#7c8494', '#2f6fd0'])
def sheet(im, x0, y0, lines, w=10, h=13):   # 一張紙：外框、白底、每隔一列一行字；lines＝寫了幾行
    for y in range(h):
        for x in range(w):
            edge = x in (0, w - 1) or y in (0, h - 1)
            im.putpixel((x0 + x, y0 + y), EDGE if edge else PAPER)
    for i in range(lines):
        y = y0 + 2 + i * 2
        for x in range(x0 + 2, x0 + w - 2 - (i % 3 == 2)): im.putpixel((x, y), INK)   # 每三行有一行短一點，看起來像手寫
im = Image.new('RGBA', (20, 18), (0, 0, 0, 0))
for x0, y0 in [(0, 3), (2, 0), (4, 4), (6, 1)]: sheet(im, x0, y0, 5)   # 寫滿的 4 張
sheet(im, 10, 5, 3)                                                    # 正在寫的這張
for i in range(6): im.putpixel((14 + i, 13 - i), PEN)                    # 筆：整支藍色、一像素粗，從紙上往右上斜出去
im.save(os.path.join(OUT, '罰寫紙筆.png'))
im.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(OUT, '罰寫紙筆-左.png'))
print('罰寫紙筆', im.size)
