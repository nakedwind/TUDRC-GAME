"""夾娃娃機音效產生器：共用 make_gacha_sfx.py 的合成函式，不需要另外安裝套件。

執行：python tools/make_claw_sfx.py
輸出到「Sound effects/獎勵/夾娃娃機/」，會覆蓋同名檔案。

做出來的音效（程式名稱在 js/sfx.js 的 baseFiles）：
  投幣.wav    clawCoin    投幣「叮」＋硬幣滾進去
  馬達.wav    clawMotor   爪子左右移動的嗡嗡聲（4 秒，程式快播完會接上）
  下爪.wav    clawDrop    下爪：往下滑的馬達聲
  收爪.wav    clawLift    往上收：往上滑的馬達聲
  夾住.wav    clawGrab    爪子合起來「喀」
  掉了.wav    clawSlip    沒夾穩滑掉：往下的「咻」
  碰撞.wav    clawBump    膠囊落地「咚」
  沒中.wav    clawMiss    沒拿到：兩個往下的音
  出口.wav    clawChute   掉進出口「框啷」
  中獎.wav    clawWin     拿到普通獎品的小旋律（稀有、大獎共用扭蛋的 SR／SSR 音效）
  保夾.wav    clawPity    保夾開啟：往上的琶音
  倒數.wav    clawTick    最後 5 秒的嗶聲
"""
import os

import make_gacha_sfx as s
from make_gacha_sfx import BELL, blank, echo, finish, noise, note, save, sparkles, tone

s.OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'Sound effects', '獎勵', '夾娃娃機')


def make_coin():
    b = blank(.5)
    tone(b, 0, .28, note(91), gain=.3, partials=BELL, curve=4)
    tone(b, .05, .3, note(96), gain=.24, partials=BELL, curve=4)
    for i, t in enumerate([.2, .26, .31, .35, .38]):
        noise(b, t, .025, gain=.12 - i * .015, low=2500, high=7000)
    return finish(b, .6)


def hum(dur, f0, f1, gain=.22):
    """馬達：方波低音＋一點齒輪雜音，頭尾平順才接得起來"""
    b = blank(dur)
    tone(b, 0, dur, f0, f1, wave_type='square', gain=gain, attack=.02, curve=0.01)
    tone(b, 0, dur, f0 * 2.01, f1 * 2.01, wave_type='triangle', gain=gain * .5, attack=.02, curve=0.01)
    noise(b, 0, dur, gain=.03, low=300, high=1400, curve=0.01)
    return b


def make_motor():
    return finish(hum(4.0, 92, 92), .32)


def make_drop():
    return finish(hum(1.9, 170, 72), .34)


def make_lift():
    return finish(hum(2.4, 72, 150), .34)


def make_grab():
    b = blank(.25)
    noise(b, 0, .05, gain=.4, low=1200, high=6000)
    tone(b, 0, .08, 300, 160, wave_type='square', gain=.22)
    noise(b, .09, .04, gain=.28, low=900, high=4000)
    return finish(b, .6)


def make_slip():
    b = blank(.5)
    tone(b, 0, .42, 880, 180, wave_type='triangle', gain=.3, curve=2)
    noise(b, 0, .16, gain=.1, low=2000, high=7000)
    return finish(b, .55)


def make_bump():
    b = blank(.2)
    tone(b, 0, .14, 170, 90, gain=.5, curve=5)
    noise(b, 0, .03, gain=.16, low=500, high=2500)
    return finish(b, .55)


def make_miss():
    b = blank(.75)
    tone(b, 0, .28, note(64), wave_type='triangle', gain=.28, curve=2.5)
    tone(b, .24, .45, note(60), note(58), wave_type='triangle', gain=.28, curve=2.5)
    return finish(b, .5)


def make_chute():
    b = blank(.55)
    tone(b, 0, .12, 240, 120, gain=.45, curve=4)
    noise(b, 0, .05, gain=.25, low=800, high=4000)
    tone(b, .08, .1, 210, 110, gain=.35, curve=4)
    tone(b, .14, .38, note(84), gain=.2, partials=BELL, curve=3.5)
    return finish(b, .7)


def make_win():
    b = blank(1.2)
    for t, n in [(0, 72), (.1, 76), (.2, 79), (.3, 84), (.42, 88)]:
        tone(b, t, .42, note(n), wave_type='square', gain=.14, curve=3)
        tone(b, t, .55, note(n + 12), gain=.1, partials=BELL, curve=3)
    sparkles(b, .3, .7, 12, low=84, high=100, gain=.07)
    return finish(echo(b, .1, .28, .25), .7)


def make_pity():
    b = blank(1.1)
    for i, n in enumerate([67, 71, 74, 79, 83, 86]):
        tone(b, i * .07, .5, note(n), gain=.2, partials=BELL, curve=3)
    sparkles(b, .3, .7, 14, gain=.07)
    return finish(echo(b, .11, .3, .3), .68)


def make_tick():
    b = blank(.12)
    tone(b, 0, .09, note(88), wave_type='square', gain=.2, curve=4)
    return finish(b, .4)


if __name__ == '__main__':
    os.makedirs(s.OUT_DIR, exist_ok=True)
    save('投幣.wav', make_coin())
    save('馬達.wav', make_motor())
    save('下爪.wav', make_drop())
    save('收爪.wav', make_lift())
    save('夾住.wav', make_grab())
    save('掉了.wav', make_slip())
    save('碰撞.wav', make_bump())
    save('沒中.wav', make_miss())
    save('出口.wav', make_chute())
    save('中獎.wav', make_win())
    save('保夾.wav', make_pity())
    save('倒數.wav', make_tick())
