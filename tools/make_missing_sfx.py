"""補缺漏的音效：用純 Python 合成，不需要另外安裝套件（做法跟 make_gacha_sfx.py 一樣）。

執行：python tools/make_missing_sfx.py
輸出到「Sound effects/」底下各自的資料夾，會覆蓋同名檔案。

這些都是原本「沒有聲音」或「先借別的聲音」的地方（程式名稱在 js/sfx.js 的 baseFiles）：
  獎勵/經費入帳.wav              coin              戰鬥地圖一開始跳出經費卡（原本完全沒聲音）
  怪物/夯吉寶/宮帽滑動.wav        capKingShuffle    順順宮主蓋杯子洗牌（原本借揮劍聲）
  怪物/夯吉寶/宮帽蓋下.wav        capKingClose      順順宮主大宮帽蓋回去（原本借敲打聲）
  戰鬥/命中/漆彈打中.wav          hitPaint          螢光漆彈打中（原本是一般打中聲）；混亂彈打中 hitConfuse 也用這個

（2026-11-27 也試做過列車鳴笛、人面蝶后俯衝、虱目魚王腳步／吐、老鼠死掉、漆彈射擊、混亂彈打中，
 試聽後沒有採用，那些地方維持原本借用的聲音。）

想改音色：改下面各個 make_xxx 函式裡的音高、長度、音量就好；
每個音效最後 finish(…, peak) 的 peak（最大音量 0～1）決定整體多大聲。
做好之後也可以在「音效編輯器」試聽、調音量，或換成別的音檔。
"""
import math
import os
import random
import struct
import wave

RATE = 44100
ROOT = os.path.join(os.path.dirname(__file__), '..', 'Sound effects')
random.seed(11)   # 固定亂數，每次產生的檔案都一樣


def note(n):
    """音名轉頻率：note(60)＝中央 C，+12＝高八度"""
    return 440.0 * 2 ** ((n - 69) / 12)


def blank(sec):
    return [0.0] * int(RATE * sec)


def tone(buf, t0, dur, f0, f1=None, wave_type='sine', gain=.3, attack=.004, curve=4.0, partials=None, vibrato=0.0, vib_rate=6.0):
    """一個音：f0 → f1 滑音、慢慢變小。partials＝泛音 [(倍數, 音量)]，做鈴聲、喇叭的質感"""
    f1 = f1 or f0
    partials = partials or [(1, 1.0)]
    total = sum(a for _, a in partials)
    start, n = int(t0 * RATE), int(dur * RATE)
    phase = [0.0] * len(partials)
    for i in range(n):
        j = start + i
        if j >= len(buf):
            break
        t = i / RATE
        p = i / n
        f = f0 * (f1 / f0) ** p
        if vibrato:
            f *= 1 + vibrato * math.sin(2 * math.pi * vib_rate * t)
        env = min(1.0, t / attack) * math.exp(-curve * p) * (1 - p) ** .3
        s = 0.0
        for k, (mult, amp) in enumerate(partials):
            phase[k] += 2 * math.pi * f * mult / RATE
            x = phase[k]
            if wave_type == 'sine':
                v = math.sin(x)
            elif wave_type == 'triangle':
                v = 2 / math.pi * math.asin(math.sin(x))
            elif wave_type == 'square':
                v = .6 if math.sin(x) >= 0 else -.6
            else:   # 鋸齒波（比較粗、像喇叭）
                v = ((x / (2 * math.pi)) % 1) * 2 - 1
            s += v * amp
        buf[j] += s / total * gain * env


def noise(buf, t0, dur, gain=.2, low=800, high=8000, attack=.002, curve=6.0, shape=None):
    """一段濾過的雜訊（沙沙、噗、啪）。low／high＝只留這段音高；shape(p)＝自訂音量曲線（p 從 0 到 1）"""
    start, n = int(t0 * RATE), int(dur * RATE)
    a_hp = math.exp(-2 * math.pi * low / RATE)
    a_lp = 1 - math.exp(-2 * math.pi * high / RATE)
    hp_in = hp_out = lp = 0.0
    for i in range(n):
        j = start + i
        if j >= len(buf):
            break
        p = i / n
        x = random.uniform(-1, 1)
        hp = a_hp * (hp_out + x - hp_in)   # 去掉低音
        hp_in, hp_out = x, hp
        lp += a_lp * (hp - lp)              # 去掉太刺的高音
        env = shape(p) if shape else min(1.0, i / RATE / attack) * math.exp(-curve * p)
        buf[j] += lp * gain * env * 2


def lowpass(buf, cutoff):
    """把整段聲音的高音削掉（聽起來比較悶、比較遠）"""
    a = 1 - math.exp(-2 * math.pi * cutoff / RATE)
    out, y = [], 0.0
    for v in buf:
        y += a * (v - y)
        out.append(y)
    return out


def echo(buf, delay=.11, feedback=.35, wet=.35):
    """簡單回音：讓聲音有空間感（像在地下街迴盪）"""
    d = int(delay * RATE)
    out = buf[:]
    for i in range(d, len(out)):
        out[i] += out[i - d] * feedback
    return [a * (1 - wet) + b * wet for a, b in zip(buf, out)]


def finish(buf, peak, drive=1.6):
    """收尾：輕微壓縮 → 調到指定最大音量 → 結尾淡出"""
    m = max(abs(v) for v in buf) or 1
    buf = [math.tanh(v / m * drive) for v in buf]
    m = max(abs(v) for v in buf) or 1
    buf = [v / m * peak for v in buf]
    fade = int(.01 * RATE)
    for i in range(fade):
        buf[-1 - i] *= i / fade
    return buf


def save(rel, buf):
    path = os.path.join(ROOT, *rel.split('/'))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * 32767)) for v in buf))
    print('已輸出', rel, f'{len(buf) / RATE:.2f} 秒')


BELL = [(1, 1), (2, .45), (3, .2), (4.2, .12)]   # 鈴聲的泛音
COIN = [(1, 1), (2.4, .5), (5.1, .25)]           # 金屬硬幣的泛音（不是整數倍，聽起來像金屬）


# ---------- 各個音效 ----------

def make_coin():
    """經費入帳：兩枚硬幣「叮、叮」＋收銀機「鏘」的一點亮光"""
    b = blank(.9)
    tone(b, 0, .35, note(88), wave_type='sine', gain=.32, partials=COIN, curve=4)
    tone(b, .09, .55, note(93), wave_type='sine', gain=.36, partials=COIN, curve=3.5)
    noise(b, 0, .05, gain=.08, low=4000, high=12000)
    noise(b, .09, .05, gain=.08, low=4000, high=12000)
    for k, n in enumerate([81, 85, 88]):   # 底下一個小和弦，聽起來是「好東西」
        tone(b, .14 + k * .03, .5, note(n), wave_type='triangle', gain=.07, curve=3)
    return finish(echo(b, .07, .25, .2), .6)






def make_cap_shuffle():
    """宮帽滑動：大杯子在桌面上快速滑過去「咻嚓」"""
    b = blank(.42)
    noise(b, 0, .32, gain=.3, low=900, high=5000, shape=lambda p: math.sin(math.pi * min(1, p * 1.2)) ** 1.5)
    tone(b, 0, .3, 260, 190, wave_type='triangle', gain=.06, curve=1.5)   # 杯子本身低低的嗡
    noise(b, .3, .05, gain=.2, low=600, high=3000, curve=8)   # 停下來「嚓」
    return finish(b, .55)


def make_cap_close():
    """宮帽蓋下：大杯子重重蓋在地上「碰」，空心的回響"""
    b = blank(.7)
    tone(b, 0, .4, 140, 70, gain=.5, curve=4)
    tone(b, 0, .5, 310, 290, wave_type='triangle', gain=.14, curve=3.5, partials=[(1, 1), (1.6, .5), (2.7, .3)])   # 空心杯子的共鳴
    noise(b, 0, .06, gain=.35, low=400, high=4500, curve=8)
    return finish(echo(b, .09, .3, .25), .75)








def make_paint_hit():
    """漆彈打中：「啪」一聲濕濕的爆開＋油漆噴濺"""
    b = blank(.4)
    noise(b, 0, .04, gain=.5, low=600, high=6000, curve=7)
    tone(b, 0, .1, 420, 160, gain=.25, curve=5)
    noise(b, .02, .25, gain=.2, low=1500, high=7000, curve=6)   # 噴濺
    for k in range(4):
        tone(b, .04 + random.random() * .15, .04, 1200 + random.random() * 800, 2400, gain=.04, curve=4)
    return finish(b, .65)



SOUNDS = [
    ('獎勵/經費入帳.wav', make_coin),
    ('怪物/夯吉寶/宮帽滑動.wav', make_cap_shuffle),
    ('怪物/夯吉寶/宮帽蓋下.wav', make_cap_close),
    ('戰鬥/命中/漆彈打中.wav', make_paint_hit),
]

if __name__ == '__main__':
    for rel, make in SOUNDS:
        save(rel, make())
