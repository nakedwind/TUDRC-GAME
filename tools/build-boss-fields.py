# ===== BOSS 與特殊怪物數值 → 怪物編輯器 =====
# （2026-11-27 起也放一般怪物程式裡的招式、行為數字：自爆史萊姆、魚頭君、人面蝶、異質核心、掉食物…，見下面 BOSSES 清單後半）
# 每隻 BOSS 的數值原本寫在自己的程式檔（js/elite-bird-head.js 的 ELITE_BIRD…）。
# 這個工具做三件事：
#   1. 讀每隻 BOSS 的設定，把「數字」欄位和旁邊的中文註解整理成 js/boss-fields.js（怪物編輯器「👑 BOSS 數值」用的欄位說明）
#   2. 把數字放進 data/monsters.js 的 BOSS_SETTINGS_DEFAULT（遊戲和編輯器都讀這一份；已經有的值不會被蓋掉）
#   3. 把程式檔裡的設定包上 applyBossSettings('名字', {...})，讓遊戲開場時改用 data/monsters.js 的數字
# 什麼時候要重跑：在 BOSS 程式檔的設定裡「新增或刪掉數字欄位」、或改了欄位旁邊的註解之後。
#   直接雙擊或在專案資料夾執行：python tools/build-boss-fields.py
# 注意：改數字請用怪物編輯器（或改 data/monsters.js），程式檔裡的數字只在 data 沒有那一格時才用。
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 要放進編輯器的 BOSS：(設定名稱, 程式檔, 顯示名稱, 以哪隻怪物為基準（列表的圖）)
BOSSES = [
    ('ELITE_BIRD', 'js/elite-bird-head.js', '鳥頭大隊長', 'bird_head'),
    ('CAP_KING', 'js/elite-cap-king.js', '順順宮主／大夯吉寶', 'hangi_bao'),
    ('BANANA_EMPEROR', 'js/banana-emperor.js', '金蕉大王', 'golden_banana_king'),
    ('LOOFAH_QUEEN', 'js/loofah-queen.js', '絲瓜女王', 'loofah_lady'),
    ('PEARL_ELDER', 'js/pearl-elder.js', '珍珠大童', 'pearl_kid'),
    ('GOURD_KING', 'js/gourd-king.js', '葫蘆猴王', 'gourd_monkey'),
    ('MOTH_BOSS', 'js/moth-boss.js', '人面蝶后', 'human_face_butterfly'),
    ('RAT_KING', 'js/rat-king.js', '花蓮老鼠王', 'burrowing_mouse'),
    ('POOL_BOSS', 'js/pool-boss.js', '巨大比基尼小丑魚', 'clownfish'),
    ('FISH_KING', 'js/fish-king.js', '魚頭王', 'fish_head'),
    ('WATER_MONSTERS', 'js/water-monsters.js', '🐟 水中怪物（共用）', 'fish_head'),   # 不是一隻 BOSS：生在深水裡的魚頭君、虱目魚小子、小虱目魚小子、小丑魚
    ('WATER_COMBAT', 'js/water-monsters.js', '🛟 泳圈上戰鬥（共用）', 'fish_head'),   # 不是一隻 BOSS：坐泳圈攻擊的攻速、命中率、後座力
    ('BOSS_CINEMA', 'js/boss-cinema.js', '🎬 BOSS 出場演出（共用）', 'milkfish_king'),   # 不是一隻 BOSS：出場時停住時間、移鏡頭的共用數字
    ('POOL_MONSTER_FALL', 'js/pool-monster-fall.js', '🌊 怪物掉進深水（共用）', 'bird_head'),   # 不是一隻 BOSS：地面怪物被推下深水後掙扎、扣血、爬回岸的共用數字
    ('BOSS_CORE_LINK', 'js/boss-core-link.js', '🛡️ BOSS 守護的核心（共用）', 'bird_head'),   # 不是一隻 BOSS：BOSS 活著核心打不破、核心護盾、核心血越低 BOSS 越脆的共用數字
    # ---- 一般怪物的特殊數值（2026-11-27 整理）：基本血量、攻擊力在怪物編輯器上方的怪物資料；這裡是各怪物程式自己的招式、行為數字 ----
    ('SLIME_BOMB', 'js/combat-feel.js', '💥 自爆史萊姆', 'slime', 'monster'),
    ('SLIME_SPIT', 'js/combat-feel.js', '🧪 吐酸史萊姆', 'slime', 'monster'),
    ('FISH_HEAD', 'js/fish-head.js', '魚頭君', 'fish_head', 'monster'),
    ('LOOFAH', 'js/loofah-lady.js', '絲瓜小姐', 'loofah_lady', 'monster'),
    ('MILKFISH', 'js/milkfish-kid.js', '虱目魚小子', 'milkfish_kid', 'monster'),
    ('CLOWNFISH', 'js/clownfish.js', '比基尼小丑魚', 'clownfish', 'monster'),
    ('BANANA_KING', 'js/golden-banana-king.js', '金蕉王', 'golden_banana_king', 'monster'),
    ('GOURD', 'js/gourd-monkey.js', '葫蘆猴', 'gourd_monkey', 'monster'),
    ('MOTH', 'js/human-face-butterfly.js', '人面蝶', 'human_face_butterfly', 'monster'),
    ('HANGI_CAP', 'js/hangi-bao.js', '順順宮帽（夯吉寶的帽子）', 'hangi_bao', 'monster'),
    ('LIFEFORM', 'js/lifeform.js', '生命體（打不死、要用火）', 'lifeform', 'monster'),
    ('SMILER', 'js/smiler.js', '😁 Smiler（黑暗中咬人）', '', 'monster'),
    ('CORE', 'js/anomalous-core.js', '💠 異質核心', '', 'monster'),
    ('FOOD_DROPS', 'js/food.js', '🍖 怪物掉食物', '', 'monster'),
]
SKIP_KEYS = {'maps', 'color', 'eyeFlash'}   # 地圖位置在地圖相關的地方改；顏色不放進編輯器

TOKEN = re.compile(r"""
  (?P<lc>//[^\n]*) | (?P<bc>/\*.*?\*/) |
  (?P<str>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`) |
  (?P<num>(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?) |
  (?P<id>[A-Za-z_$][\w$]*) | (?P<nl>\n) | (?P<ws>[ \t\r]+) | (?P<p>.)
""", re.S | re.X)


def tokenize(text, line0):
    toks, line = [], line0
    for m in TOKEN.finditer(text):
        kind, val = m.lastgroup, m.group()
        if kind == 'nl':
            line += 1
            continue
        if kind != 'ws':
            toks.append((kind, val, line))
        line += val.count('\n') if kind in ('bc', 'str') else 0
    return toks


class Parser:
    def __init__(self, toks):
        self.t = [x for x in toks if x[0] not in ('lc', 'bc')]
        self.i = 0

    def peek(self):
        return self.t[self.i] if self.i < len(self.t) else ('eof', '', 0)

    def take(self):
        tok = self.peek()
        self.i += 1
        return tok

    def value(self):
        kind, val, line = self.peek()
        if val == '{':
            return self.obj()
        if val == '[':
            return self.arr()
        if kind == 'num' or (val == '-' and self.t[self.i + 1][0] == 'num'):
            start = self.i
            if val == '-':
                self.take()
            n = float(self.take()[1])
            sign = -1 if self.t[start][1] == '-' else 1
            if self.peek()[1] in (',', '}', ']'):
                n *= sign
                return {'type': 'num', 'v': int(n) if n == int(n) else n, 'l0': line, 'l1': line}
            self.i = start   # 是算式（例如 2 * CELL），不是單純的數字
        if kind == 'str' and self.t[self.i + 1][1] in (',', '}', ']'):
            self.take()
            return {'type': 'str', 'v': val[1:-1], 'l0': line, 'l1': line}
        depth = 0   # 其他（算式、函式、變數）：跳過，不放進編輯器
        while True:
            k, v, ln = self.peek()
            if k == 'eof':
                break
            if depth == 0 and v in (',', '}', ']'):
                break
            if v in '([{':
                depth += 1
            elif v in ')]}':
                depth -= 1
            self.take()
        return {'type': 'expr', 'l0': line, 'l1': line}

    def obj(self):
        l0 = self.take()[2]
        props = []
        while self.peek()[1] != '}':
            k, key, kl = self.take()
            if k == 'str':
                key = key[1:-1]
            assert self.take()[1] == ':', 'parse error near line %d' % kl
            props.append((key, kl, self.value()))
            if self.peek()[1] == ',':
                self.take()
        l1 = self.take()[2]
        return {'type': 'obj', 'props': props, 'l0': l0, 'l1': l1}

    def arr(self):
        l0 = self.take()[2]
        items = []
        while self.peek()[1] != ']':
            items.append(self.value())
            if self.peek()[1] == ',':
                self.take()
        l1 = self.take()[2]
        return {'type': 'arr', 'items': items, 'l0': l0, 'l1': l1}


def comment_maps(toks):
    trailing, alone, code_lines = {}, {}, set()
    for kind, val, line in toks:
        if kind in ('lc', 'bc'):
            text = re.sub(r'^/[/*]+|\*/$', '', val).strip()
            (trailing if line in code_lines else alone)[line] = text
        else:
            code_lines.add(line)
    return trailing, alone


def num_leaf(node):
    if node['type'] == 'num':
        return node['v']
    if node['type'] == 'arr' and node['items'] and all(x['type'] == 'num' for x in node['items']):
        return [x['v'] for x in node['items']]
    return None


def build(key, path):
    src = open(os.path.join(ROOT, path), encoding='utf-8').read()
    m = re.search(r"^const %s = (?:applyBossSettings\('%s', )?\{" % (key, key), src, re.M)
    assert m, '%s 找不到 const %s' % (path, key)
    start = m.end() - 1
    line0 = src.count('\n', 0, start) + 1
    toks_all = tokenize(src[start:], line0)
    p = Parser(toks_all)
    tree = p.obj()
    end_line = tree['l1']
    toks = [t for t in toks_all if t[2] <= end_line]
    trailing, alone = comment_maps(toks)

    def label(line):
        if line in trailing:
            return trailing[line]
        out, ln = [], line - 1
        while ln in alone:
            out.insert(0, alone[ln])
            ln -= 1
        return ' '.join(out)

    rows, values = [], {}

    def put(dotted, v):
        cur = values
        parts = dotted.split('.')
        for part in parts[:-1]:
            cur = cur.setdefault(part, {})
        cur[parts[-1]] = v

    def flatten(node, rel, cap):   # 一行裡的數字（含一行寫完的小物件）
        leaf = num_leaf(node)
        if leaf is not None:
            yield rel, cap, leaf
        elif node['type'] == 'obj':
            name = next((v['v'] for k, _, v in node['props'] if k == 'name' and v['type'] == 'str'), None)
            for k, _, v in node['props']:
                if k in SKIP_KEYS:
                    continue
                yield from flatten(v, rel + '.' + k, (name or cap) + '．' + k if (name or cap) else k)

    def walk(node, prefix, depth, head_line):
        line_rows = {}
        for k, kl, v in node['props']:
            if k in SKIP_KEYS:
                continue
            full = prefix + k
            if v['type'] == 'obj' and v['l0'] != v['l1'] and any(c[1] != kl for c in v['props']):
                rows.append({'d': depth, 'h': 1, 't': label(kl) or k, 'k': [], 'p': full})
                walk(v, full + '.', depth + 1, kl)
                continue
            for rel, cap, leaf in flatten(v, k, k):
                ln = kl
                text = label(ln)
                if '不再使用' in text and (len(list(flatten(v, k, k))) and (text.startswith('（不再使用') or (k + ' （不再使用') in text)):
                    continue   # 註解寫「不再使用」的欄位不放進編輯器
                if ln not in line_rows:
                    line_rows[ln] = {'d': depth, 't': '' if ln == head_line else text, 'k': []}
                    rows.append(line_rows[ln])
                line_rows[ln]['k'].append([prefix + rel, cap])
                put(prefix + rel, leaf)

    walk(tree, '', 0, None)
    # 拿掉底下沒有任何數字的標題
    keep = []
    for i, r in enumerate(rows):
        if r.get('h'):
            has = False
            for r2 in rows[i + 1:]:
                if r2['d'] <= r['d']:
                    break
                if r2['k']:
                    has = True
                    break
            if not has:
                continue
        keep.append(r)
    for r in keep:
        r.pop('p', None)
        if not r.get('h'):
            r.pop('h', None)
    # 檔案開頭的說明（當作編輯器裡的介紹）
    head = re.findall(r'/\*(.*?)\*/', src[:m.start()], re.S)
    desc = head[-1].strip() if head else ''
    art = re.search(r"artDir:\s*'([^']+)'", src[start:])
    wrapped = src
    if 'applyBossSettings' not in m.group():
        lines = src.split('\n')
        assert lines[end_line - 1].rstrip() == '};', '%s 設定結尾不是 };' % path
        lines[end_line - 1] = '});'
        wrapped = '\n'.join(lines)
        wrapped = wrapped.replace(
            m.group(),
            '// 數字以 data/monsters.js 的 BOSS_SETTINGS_DEFAULT 為準（怪物編輯器「👑 BOSS 數值」）；這裡的數字只在那邊沒有這一格時才用。\n'
            '// 新增或刪掉數字欄位、改了註解之後，要跑一次 tools/build-boss-fields.py（編輯器的欄位和說明才會跟著更新）\n'
            "const %s = applyBossSettings('%s', {" % (key, key), 1)
    return keep, values, desc, art.group(1) if art else '', wrapped


def merge_keep(new, old):   # 用新的欄位結構；data 裡已經有的值保留
    if isinstance(new, dict):
        o = old if isinstance(old, dict) else {}
        return {k: merge_keep(v, o.get(k)) for k, v in new.items()}
    if isinstance(new, list):
        return old if isinstance(old, list) and len(old) == len(new) and all(isinstance(x, (int, float)) for x in old) else new
    return old if isinstance(old, (int, float)) and not isinstance(old, bool) else new


def main():
    data_path = os.path.join(ROOT, 'data', 'monsters.js')
    data_src = open(data_path, encoding='utf-8').read()
    dm = re.search(r'\nconst BOSS_SETTINGS_DEFAULT = (\{.*?\n\});\n', data_src, re.S)
    old = json.loads(dm.group(1)) if dm else {}
    lst, rows_all, settings = [], {}, {}
    for key, path, name, base, *rest in BOSSES:
        group = rest[0] if rest else ('shared' if '共用' in name else 'boss')   # boss＝BOSS、shared＝共用、monster＝一般怪物
        rows, values, desc, art, wrapped = build(key, path)
        rows_all[key] = rows
        settings[key] = merge_keep(values, old.get(key))
        lst.append({'key': key, 'name': name, 'file': path, 'base': base, 'artDir': art, 'desc': desc, 'group': group})
        if wrapped is not None:
            open(os.path.join(ROOT, path), 'w', encoding='utf-8', newline='\n').write(wrapped)
        print('%-15s %3d 個數字' % (key, sum(len(r['k']) for r in rows)))
    out = ('/* 怪物編輯器「👑 BOSS 數值」的欄位說明：由 tools/build-boss-fields.py 從各 BOSS 程式檔的註解產生，不要手改。\n'
           '   數字本身存在 data/monsters.js 的 BOSS_SETTINGS_DEFAULT。 */\n'
           'const BOSS_LIST = ' + json.dumps(lst, ensure_ascii=False, indent=1) + ';\n'
           'const BOSS_FIELD_ROWS = ' + json.dumps(rows_all, ensure_ascii=False, separators=(',', ':')).replace('],"', '],\n"').replace('},{', '},\n{') + ';\n')
    open(os.path.join(ROOT, 'js', 'boss-fields.js'), 'w', encoding='utf-8', newline='\n').write(out)
    block = ('\n/* BOSS 數值（由怪物編輯器匯出）：每隻 BOSS 程式檔裡設定的數字，遊戲開場時用這裡的蓋過去（js/monster-data.js 的 applyBossSettings）。 */\n'
             'const BOSS_SETTINGS_DEFAULT = ' + json.dumps(settings, ensure_ascii=False, indent=2) + ';\n')
    if dm:
        start = data_src.rfind('\n/* BOSS 數值', 0, dm.start() + 1)
        data_src = data_src[:start if start >= 0 else dm.start()] + block + data_src[dm.end():]
    else:
        data_src = data_src.rstrip('\n') + '\n' + block
    open(data_path, 'w', encoding='utf-8', newline='\n').write(data_src)
    if len(sys.argv) > 1 and sys.argv[1] == '--check':
        # 開發用：跟遊戲裡實際讀到的數字比對（dump 檔是從瀏覽器匯出的各 BOSS 設定）
        dump = json.load(open(sys.argv[2], encoding='utf-8'))

        def leaves(d, pre=''):
            for k, v in d.items():
                if isinstance(v, dict):
                    yield from leaves(v, pre + k + '.')
                else:
                    yield pre + k, v
        for key in settings:
            a, b = dict(leaves(settings[key])), dict(leaves(dump[key]))
            bad = [k for k in a if a[k] != b.get(k)]
            missing = [k for k in b if k not in a]
            print(key, '數字不同:', bad, '沒放進編輯器:', missing)


if __name__ == '__main__':
    main()
