"""扭蛋（抽卡）音效產生器：用純 Python 合成，不需要另外安裝套件。

執行：python tools/make_gacha_sfx.py
輸出到「Sound effects/獎勵/扭蛋/」，會覆蓋同名檔案。

做出來的音效（程式名稱在 js/sfx.js 的 baseFiles）：
  扭蛋轉動.wav  gachaCrank    轉扭蛋：投幣「叮」＋轉把手「喀啦喀啦」
  扭蛋集氣.wav  gachaCharge   SR／SSR 搖蛋集氣：越來越高、越來越快的閃爍聲
  開蛋.wav      gachaOpen     普通開蛋：「啵」＋小小的叮咚
  SR出貨.wav    gachaSR       出 SR：明亮的鈴聲琶音＋亮晶晶
  SSR升格.wav   gachaUpgrade  SSR 搖到一半金色變彩虹：往上衝的「咻～鏘」
  SSR出貨.wav   gachaSSR      出 SSR：低音爆炸＋號角和弦＋快速琶音＋長長的閃光尾巴
  SSR獨照.wav   gachaHero     SSR 獨照展示：閃亮的和弦鋪底

想改音色：改下面各個 make_xxx 函式裡的音高、長度、音量就好；
每個音效最後的 peak（最大音量 0～1）決定整體多大聲，SSR 最大、SR 次之、普通開蛋最小。
"""
import math
import os
import random
import struct
import wave

RATE = 44100
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'Sound effects', '獎勵', '扭蛋')
random.seed(7)   # 固定亂數，每次產生的檔案都一樣


def note(n):
    """音名轉頻率：note(60)＝中央 C，+12＝高八度"""
    return 440.0 * 2 ** ((n - 69) / 12)


def blank(sec):
    return [0.0] * int(RATE * sec)


def tone(buf, t0, dur, f0, f1=None, wave_type='sine', gain=.3, attack=.004, curve=4.0, partials=None, vibrato=0.0):
    """一個音：f0 → f1 滑音、指數衰減。partials＝泛音 [(倍數, 音量)]，做鈴聲、號角的質感"""
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
        f = f0 * (f1 / f0) ** p   # 指數滑音，聽起來比較自然
        if vibrato:
            f *= 1 + vibrato * math.sin(2 * math.pi * 6 * t)
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
            else:   # saw
                v = ((x / (2 * math.pi)) % 1) * 2 - 1
            s += v * amp
        buf[j] += s / total * gain * env


def noise(buf, t0, dur, gain=.2, low=800, high=8000, attack=.002, curve=6.0, rise=False):
    """一段濾過的雜訊（敲擊、爆炸、閃光的沙沙聲）。rise＝慢慢變大（咻～往上衝）"""
    start, n = int(t0 * RATE), int(dur * RATE)
    a_hp = math.exp(-2 * math.pi * low / RATE)
    a_lp = 1 - math.exp(-2 * math.pi * high / RATE)
    hp_prev_in = hp_prev_out = lp = 0.0
    for i in range(n):
        j = start + i
        if j >= len(buf):
            break
        p = i / n
        x = random.uniform(-1, 1)
        hp = a_hp * (hp_prev_out + x - hp_prev_in)   # 高通：去掉低音
        hp_prev_in, hp_prev_out = x, hp
        lp += a_lp * (hp - lp)                        # 低通：去掉太刺的高音
        env = (p ** 2 * math.exp(-1 * (1 - p))) if rise else min(1.0, i / RATE / attack) * math.exp(-curve * p)
        buf[j] += lp * gain * env * 2


def sparkles(buf, t0, dur, count, low=72, high=100, gain=.08):
    """亮晶晶：很多顆隨機的高音小鈴聲撒在一段時間裡"""
    for _ in range(count):
        t = t0 + random.random() * dur
        f = note(random.randint(low, high))
        g = gain * (1 - .6 * (t - t0) / dur)
        tone(buf, t, .12 + random.random() * .12, f, wave_type='sine', gain=g, attack=.002, curve=5, partials=[(1, 1), (2.76, .3)])


def echo(buf, delay=.11, feedback=.35, wet=.35):
    """簡單回音：讓聲音有空間感"""
    d = int(delay * RATE)
    out = buf[:]
    for i in range(d, len(out)):
        out[i] += out[i - d] * feedback
    return [a * (1 - wet) + b * wet for a, b in zip(buf, out)]


def finish(buf, peak, drive=1.6):
    """收尾：輕微壓縮（聽起來比較飽滿、比較大聲）→ 調到指定最大音量 → 頭尾淡入淡出"""
    m = max(abs(v) for v in buf) or 1
    buf = [math.tanh(v / m * drive) for v in buf]
    m = max(abs(v) for v in buf) or 1
    buf = [v / m * peak for v in buf]
    fade = int(.01 * RATE)
    for i in range(fade):
        buf[-1 - i] *= i / fade
    return buf


def save(name, buf):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, name)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * 32767)) for v in buf))
    print('已輸出', os.path.relpath(path), f'{len(buf) / RATE:.2f} 秒')


BELL = [(1, 1), (2, .45), (3, .2), (4.2, .12)]   # 鈴聲的泛音
BRASS = [(1, 1), (2, .7), (3, .5), (4, .35), (5, .2)]   # 號角的泛音


def make_crank():
    """投幣「叮」＋把手「喀啦喀啦」轉 6 下（越轉越快）＋最後「喀咚」卡到位"""
    b = blank(.85)
    tone(b, 0, .25, note(88), wave_type='sine', gain=.35, partials=[(1, 1), (2.4, .4), (5.1, .15)], curve=5)   # 投幣
    noise(b, 0, .03, gain=.25, low=3000, high=9000)
    t = .12
    for k in range(6):
        noise(b, t, .028, gain=.55, low=1800, high=7000, curve=8)                       # 喀
        tone(b, t, .04, 1400 - k * 60, 900, wave_type='square', gain=.12, curve=6)     # 齒輪的金屬味
        t += .1 - k * .008
    tone(b, t + .02, .16, 180, 90, gain=.5, curve=5)   # 咚：卡到位
    noise(b, t + .02, .06, gain=.35, low=400, high=3000)
    return finish(b, .7)


def make_charge():
    """集氣：快速往上爬的閃爍琶音（越來越快），配上慢慢變大的沙沙聲"""
    b = blank(1.3)
    scale = [0, 4, 7, 12]
    t, k, step = 0.0, 0, .11
    while t < 1.15:
        f = note(72 + scale[k % 4] + 12 * (k // 4) * .5 + k * .35)
        tone(b, t, .14, f, wave_type='triangle', gain=.22 + .2 * t, curve=4, partials=[(1, 1), (2, .3)])
        t += step
        step = max(.045, step * .9)
        k += 1
    noise(b, 0, 1.25, gain=.25, low=2500, high=10000, rise=True)
    return finish(b, .62)


def make_open():
    """普通開蛋：「啵」一聲＋兩個音的小叮咚"""
    b = blank(.55)
    tone(b, 0, .1, 420, 980, gain=.55, curve=3)   # 啵（往上滑）
    noise(b, 0, .04, gain=.25, low=1500, high=6000)
    tone(b, .07, .22, note(84), gain=.28, partials=BELL, curve=4)
    tone(b, .15, .35, note(91), gain=.3, partials=BELL, curve=4)
    return finish(b, .65)


def make_sr():
    """出 SR：啵＋明亮的大調琶音（Do Mi Sol Do Mi）＋最後的和弦＋撒亮晶晶"""
    b = blank(1.5)
    tone(b, 0, .12, 380, 1200, gain=.6, curve=3)   # 開蛋的啵
    noise(b, 0, .08, gain=.35, low=2000, high=9000)
    for i, n in enumerate([72, 76, 79, 84, 88]):
        tone(b, .06 + i * .065, .5, note(n), wave_type='triangle', gain=.32, partials=BELL, curve=3.5)
    for n in [84, 88, 91, 96]:   # 最後一起響的和弦
        tone(b, .4, 1.0, note(n), gain=.2, partials=BELL, curve=3, vibrato=.003)
    sparkles(b, .3, 1.0, 26, gain=.09)
    noise(b, .3, .9, gain=.12, low=6000, high=14000, curve=4)
    return finish(echo(b, .09, .3, .3), .82)


def make_upgrade():
    """SSR 升格：往上衝的「咻～」接一聲「鏘！」"""
    b = blank(.9)
    noise(b, 0, .4, gain=.5, low=1500, high=9000, rise=True)
    tone(b, 0, .4, 300, 2400, wave_type='saw', gain=.14, curve=.5)
    for n in [96, 100, 103]:
        tone(b, .38, .5, note(n), gain=.3, partials=[(1, 1), (2.76, .5), (5.4, .25)], curve=4)
    noise(b, .38, .2, gain=.4, low=4000, high=12000, curve=6)
    return finish(b, .78)


def make_ssr():
    """出 SSR：低音爆炸「轟」＋號角大和弦＋飛快往上的琶音＋長長的閃光尾巴（比 SR 大聲、長、厚）"""
    b = blank(2.8)
    # 轟：很低的下滑音＋爆炸雜訊
    tone(b, 0, .7, 120, 38, gain=.9, curve=3)
    noise(b, 0, .5, gain=.7, low=60, high=2500, curve=5)
    noise(b, 0, .25, gain=.5, low=3000, high=12000, curve=6)
    # 號角和弦（C 大調）：兩次「登—登登！」
    chord = [48, 60, 64, 67, 72]
    for t, d in [(.05, .22), (.3, 1.6)]:
        for n in chord:
            tone(b, t, d, note(n), wave_type='saw', gain=.13, partials=BRASS, attack=.02, curve=1.6 if d > 1 else 4, vibrato=.004)
    # 飛快往上的琶音
    for i, n in enumerate([72, 76, 79, 84, 88, 91, 96, 100, 103, 108]):
        tone(b, .3 + i * .045, .6, note(n), wave_type='triangle', gain=.25, partials=BELL, curve=3)
    # 高處的鈴聲和弦慢慢消失
    for n in [96, 100, 103, 108]:
        tone(b, .75, 1.9, note(n), gain=.14, partials=BELL, curve=2.5, vibrato=.004)
    sparkles(b, .5, 1.9, 60, low=76, high=104, gain=.1)
    noise(b, .5, 1.8, gain=.14, low=6000, high=15000, curve=3)
    return finish(echo(b, .12, .38, .35), .95, drive=2.0)


def make_hero():
    """SSR 獨照：溫暖又閃亮的和弦鋪底（像聚光燈打下來）"""
    b = blank(1.9)
    tone(b, 0, .08, 700, 1800, gain=.3, curve=3)
    for n in [60, 67, 72, 76, 79, 84]:
        tone(b, 0, 1.8, note(n), wave_type='triangle', gain=.16, partials=[(1, 1), (2, .3)], attack=.06, curve=2, vibrato=.004)
    sparkles(b, .05, 1.4, 30, low=84, high=103, gain=.08)
    return finish(echo(b, .13, .35, .3), .72)


if __name__ == '__main__':
    save('扭蛋轉動.wav', make_crank())
    save('扭蛋集氣.wav', make_charge())
    save('開蛋.wav', make_open())
    save('SR出貨.wav', make_sr())
    save('SSR升格.wav', make_upgrade())
    save('SSR出貨.wav', make_ssr())
    save('SSR獨照.wav', make_hero())
