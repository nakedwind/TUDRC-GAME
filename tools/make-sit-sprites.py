#!/usr/bin/env python
"""用柯林的側面坐下圖（colynB_0003_Leftside_hurt_sit.png）幫穿出勤制服（B 款）的角色做左右兩張坐下圖。
做法：上半身往下移到坐下的高度，腰部以下換成柯林彎曲的腿。腿是 B 款的褲子，所以其他款的衣服不做。
已經存在的檔案不會蓋掉（手改過的圖不會被洗掉）；要重做某張就先刪掉那張。需要 Pillow、numpy。
用法：python tools/make-sit-sprites.py [輸出資料夾，預設 images/character]
"""
import glob, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images', 'character')
OUT = sys.argv[1] if len(sys.argv) > 1 else ROOT
SKIP = ('ball',)                 # 球球是狗，有自己的坐下圖（js/ball-poses.js）
REF_WAIST, REF_SHIFT = 56, 4     # 柯林站著時褲頭在第 56 列，坐下時上半身往下移 4 列
LEG_TOP = 54                     # 坐下圖從這一列開始才可能有腿（再上面都是身體）
BODY_ROW = 52                    # 用這一列身體的位置對齊左右

def load(path):
    return np.array(Image.open(path).convert('RGBA')).astype(int)

def shifted(img, dy):
    out = np.zeros_like(img)
    if dy > 0: out[dy:] = img[:-dy]
    else: out[:] = img
    return out

def is_green(px):
    return px[3] > 0 and px[1] > px[0] + 8 and px[1] > px[2] + 8

def waist_of(img):
    for y in range(50, 62):      # 第一列出現褲子的綠色：褲頭（頭髮、外套是綠的也不會落在這段以下）
        row = [x for x in range(64) if is_green(img[y, x])]
        if len(row) >= 3: return y
    return REF_WAIST

def body_center(img, row=BODY_ROW):
    xs = np.where(img[row, :, 3] > 0)[0]
    return (xs.min() + xs.max()) / 2

def legs_layer():
    src = os.path.join(ROOT, 'colyn_B')
    stand = load(os.path.join(src, 'colynB_0003_Leftside_hurt.png'))
    sit = load(os.path.join(src, 'colynB_0003_Leftside_hurt_sit.png'))
    moved = shifted(stand, REF_SHIFT)
    changed = np.any(sit != moved, axis=2)
    layer = np.zeros_like(sit)
    layer[LEG_TOP:][changed[LEG_TOP:]] = sit[LEG_TOP:][changed[LEG_TOP:]]
    return layer, body_center(moved, BODY_ROW + REF_SHIFT)

def make(stand, legs, leg_center, mirror):
    waist = waist_of(stand)
    dy = REF_WAIST + REF_SHIFT - waist
    body = shifted(stand, dy)
    body[REF_WAIST + REF_SHIFT:] = 0   # 原本站著的腿拿掉
    layer = legs[:, ::-1] if mirror else legs
    center = 63 - leg_center if mirror else leg_center
    dx = int(round(body_center(body, BODY_ROW + dy) - center))
    out = body.copy()
    for y, x in zip(*np.where(layer[..., 3] > 0)):
        if 0 <= x + dx < 64: out[y, x + dx] = layer[y, x]
    return out.astype('uint8')

def main():
    legs, leg_center = legs_layer()
    made = kept = 0
    for folder in sorted(os.listdir(ROOT)):
        if not os.path.isdir(os.path.join(ROOT, folder)) or folder.startswith(SKIP) or not folder.endswith('_B'): continue
        prefix = folder.replace('_', '') + '_'
        for name, mirror in (('0003_Leftside', False), ('0006_right-side', True)):
            src = os.path.join(ROOT, folder, prefix + name + '.png')
            if not os.path.exists(src): continue
            dst = os.path.join(OUT, folder, prefix + name + '_sit.png')
            if os.path.exists(dst): kept += 1; continue
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            Image.fromarray(make(load(src), legs, leg_center, mirror), 'RGBA').save(dst)
            made += 1
    print('made', made, 'kept', kept)

if __name__ == '__main__':
    main()
