# ===== 素材搬家工具 =====
# 用「素材搬家.bat」啟動。資料夾改名、圖片或音效搬到別的資料夾之後，把專案裡寫著舊路徑的地方全部換成新路徑。
# 怎麼運作：
#   1. 跟 Git 最後一次 commit 比對：哪些素材不在原來的位置、哪裡多了新檔案。
#   2. 用「檔案內容」認出同一個檔案（不看檔名，所以有好幾張 frame_01.png 也不會認錯）。
#      內容變了認不出來、但檔名一樣的，會一張一張問你。
#   3. 先列出清單，你確認後才改 js、data、css、HTML 裡的路徑，並更新改過檔案的 ?v= 快取版本號。
#   4. 把這次的對照表記到 data/asset-moves.js：瀏覽器裡的舊暫存，下次打開頁面時會自動換成新路徑（js/asset-moves.js）。
#   5. 檢查還有沒有找不到的檔案，詳細結果存在 backups/素材搬家報告-日期.txt。
# 為了能整批復原：js、data、css、tools、HTML 有還沒 commit 的修改時不會動手（可以先看清單）。
# 只處理素材（圖片、音效、模型…）搬動；js、data、css、tools 和最外層的 HTML 不能用這個工具搬。
#
# 用法：python tools/asset-move.py [--dry-run] [--yes] [--accept-similar] [--base 某個commit]
#   --dry-run：只看清單，什麼都不改    --yes：不用確認直接改
#   --accept-similar：檔名一樣、內容改過的都當成同一個檔案    --base：跟哪個 commit 比（預設最後一次 commit）
import argparse
import collections
import datetime
import hashlib
import json
import os
import posixpath
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # 遊戲資料夾（tools 的上一層）
CODE_DIRS = {'js', 'data', 'css', 'tools'}   # 放程式和資料的資料夾：這些不算素材，也不能用這個工具搬
SKIP_DIRS = CODE_DIRS | {'.git', '.claude', 'backups', 'output', 'node_modules'}   # 找新檔案時不看的最上層資料夾
CODE_EXTS = ('.html', '.js', '.css', '.py', '.cjs')   # 要改路徑的檔案類型
OWN_FILES = {'tools/asset-move.py', 'data/asset-moves.js', 'js/asset-moves.js'}   # 工具自己的檔案不改
SOUND_ROOT = 'Sound effects'   # 音效的路徑可以省略這一段（例如 '介面/按鈕.mp3'）
AUDIO_EXTS = r'mp3|ogg|wav|m4a|flac'
ASSET_EXTS = r'png|jpe?g|gif|webp|svg|' + AUDIO_EXTS + r'|glb|gltf|obj|fbx'
MOVES_FILE = 'data/asset-moves.js'


def git(*args):
    r = subprocess.run(['git', *args], cwd=ROOT, capture_output=True)
    if r.returncode:
        raise SystemExit('Git 指令失敗：git ' + ' '.join(args) + '\n' + r.stderr.decode('utf-8', 'replace'))
    return r.stdout


def top_of(path):
    return path.split('/', 1)[0]


def is_asset(path):   # 放在子資料夾裡、又不是程式資料夾的檔案，都算素材
    return '/' in path and top_of(path) not in CODE_DIRS and top_of(path) != '.claude'


def blob_hash(data):   # 跟 Git 記錄檔案內容的算法一樣，才能直接跟 commit 裡的比
    return hashlib.sha1(b'blob %d\0' % len(data) + data).hexdigest()


def base_tree(base):   # 那次 commit 裡的所有檔案：{路徑: 內容的指紋}
    tree = {}
    for row in git('ls-tree', '-r', '-z', base).split(b'\0'):
        if not row:
            continue
        info, path = row.split(b'\t', 1)
        tree[path.decode('utf-8')] = info.split()[2].decode()
    return tree


def disk_files():   # 硬碟上現在的素材（最外層的檔案、程式資料夾不看）
    found = set()
    for folder, dirs, files in os.walk(ROOT):
        rel = os.path.relpath(folder, ROOT).replace(os.sep, '/')
        if rel == '.':
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            continue
        found.update(rel + '/' + f for f in files)
    return found


def dirty_code_files():   # 還沒 commit 的程式／資料修改（有的話不能動手，不然復原時會連別的修改一起不見）
    tokens = git('status', '--porcelain', '-z').decode('utf-8', 'replace').split('\0')
    out, i = [], 0
    while i < len(tokens):
        row = tokens[i]
        i += 1
        if len(row) < 4:
            continue
        state, path = row[:2], row[3:]
        if state[0] in 'RC':
            i += 1   # 改名的紀錄後面還跟著一個舊路徑
        if state == '??':
            continue
        if '/' not in path and path.endswith(CODE_EXTS) or top_of(path) in CODE_DIRS:
            out.append(path)
    return out


def match_moves(tree, disk, accept_similar, ask):
    """認出每個不見的素材搬去哪裡。回傳 (確定的搬動 {舊: 新}, 合併到現有檔案的 {舊: 現有}, 找不到的 [舊])"""
    assets = {p: h for p, h in tree.items() if is_asset(p)}
    gone = sorted(p for p in assets if p not in disk)
    fresh = sorted(p for p in disk if p not in assets)
    by_hash = collections.defaultdict(list)
    for p in fresh:
        with open(os.path.join(ROOT, p), 'rb') as f:
            data = f.read()
        by_hash[blob_hash(data)].append(p)
        if b'\r\n' in data[:65536] and b'\0' not in data[:65536]:   # 文字檔（svg…）：Git 可能把換行存成不一樣
            by_hash[blob_hash(data.replace(b'\r\n', b'\n'))].append(p)
    moves, used, pending = {}, set(), []
    for old in gone:   # 內容一樣、而且只有一個可能：直接確定
        options = by_hash.get(assets[old], [])
        same_content = [p for p in gone if assets[p] == assets[old]]
        if len(options) == 1 and len(same_content) == 1:
            moves[old] = options[0]
            used.add(options[0])
        else:
            pending.append(old)
    # 內容一樣的檔案有好幾份（例如同一張圖放兩個資料夾）：優先配檔名一樣、資料夾對應跟其他檔案一樣的
    parents = {posixpath.dirname(o): posixpath.dirname(n) for o, n in moves.items()}
    rest = []
    for old in pending:
        options = [p for p in by_hash.get(assets[old], []) if p not in used]
        if not options:
            rest.append(old)
            continue
        name, parent = posixpath.basename(old), parents.get(posixpath.dirname(old))
        options.sort(key=lambda p: (posixpath.basename(p) != name, posixpath.dirname(p) != parent, p))
        moves[old] = options[0]
        used.add(options[0])
        parents.setdefault(posixpath.dirname(old), posixpath.dirname(options[0]))
    # 新位置沒有一樣內容的檔案，但別的地方本來就有一模一樣的：多半是刪掉重複的那份
    existing = collections.defaultdict(list)
    for p, h in assets.items():
        if p in disk:
            existing[h].append(p)
    merged, left = {}, []
    for old in rest:
        if existing.get(assets[old]):
            merged[old] = sorted(existing[assets[old]])[0]
        else:
            left.append(old)
    # 內容改過：檔名一樣而且只有一個可能，才問要不要當成同一個檔案
    names = collections.defaultdict(list)
    for p in fresh:
        if p not in used:
            names[posixpath.basename(p).lower()].append(p)
    lost = []
    for old in left:
        options = [p for p in names.get(posixpath.basename(old).lower(), []) if p not in used]
        if len(options) == 1 and (accept_similar or ask(old, options[0])):
            moves[old] = options[0]
            used.add(options[0])
        else:
            lost.append(old)
    return moves, merged, lost


def find_folder_moves(moves, tree, disk):
    """整個資料夾一起搬的（例如改名、加編號）：路徑是程式組出來的也要跟著換。只留最上層的那個。"""
    assets = [p for p in tree if is_asset(p)]
    guesses = {}
    for old, new in moves.items():
        a, b = old.split('/'), new.split('/')
        k = 1
        while k <= min(len(a), len(b)) and a[-k] == b[-k]:   # 後面一樣的部分：a/b/c.png → x/b/c.png 代表 a → x
            k += 1
        for cut in range(1, k):
            if len(a) - cut >= 1 and len(b) - cut >= 1:
                guesses.setdefault('/'.join(a[:-cut]), '/'.join(b[:-cut]))
    disk_dirs = {posixpath.dirname(p) for p in disk}
    for p in list(disk_dirs):
        while '/' in p:
            p = posixpath.dirname(p)
            disk_dirs.add(p)
    folders = {}
    for old_dir, new_dir in sorted(guesses.items(), key=lambda kv: len(kv[0])):
        if old_dir == new_dir or old_dir in disk_dirs:
            continue
        if any(old_dir.startswith(k + '/') for k in folders):
            continue
        under = [p for p in assets if p.startswith(old_dir + '/')]
        if under and all(moves.get(p) == new_dir + p[len(old_dir):] for p in under):
            folders[old_dir] = new_dir
    return folders


def map_path(path, moves, folders):   # 這個舊路徑現在在哪
    if path in moves:
        return moves[path]
    probe = path
    while '/' in probe:
        probe = posixpath.dirname(probe)
        if probe in folders:
            return folders[probe] + path[len(probe):]
    return None


class Rewriter:
    """把一段文字裡的舊路徑換成新路徑。js/asset-moves.js 有一份一樣規則的，改這裡要一起改。"""

    def __init__(self, files, folders, sound):
        self.tops = sorted({top_of(k) for k in [*files, *folders]}, key=len, reverse=True)
        self.entries = collections.defaultdict(list)
        for table, is_folder in ((files, False), (folders, True)):
            for old, new in table.items():
                self.entries[top_of(old)].append((old, new, is_folder))
        for rows in self.entries.values():
            rows.sort(key=lambda r: len(r[0]), reverse=True)
        self.anchor = re.compile('|'.join(re.escape(t) for t in self.tops)) if self.tops else None
        self.sound = sound
        self.sound_pat = re.compile(r'''(["'`])([^"'`\n]+\.(?:''' + AUDIO_EXTS + r'''))\1''', re.I)
        self.hits = collections.Counter()   # 每個舊路徑被換了幾次

    @staticmethod
    def word(ch):
        return ch.isalnum() or ch in '_-'

    def start_ok(self, text, pos):   # 前面不能接著別的字；只接受 ../ 或 ./ 這種相對寫法
        if pos == 0:
            return True
        prev = text[pos - 1]
        if prev == '/':
            return text[max(0, pos - 3):pos] == '../' or text[max(0, pos - 2):pos] == './'
        return not (self.word(prev) or prev in '.\\')

    def end_ok(self, text, end, is_folder, bare_top):
        after = text[end] if end < len(text) else ''
        if after and self.word(after):
            return False
        if after == '.' and end + 1 < len(text) and self.word(text[end + 1]):
            return False
        if bare_top:   # 最上層資料夾（images、music…）也常是一般的字（例如 id: 'music'）：只換後面接著 / 的
            return after == '/'
        return True

    def rewrite(self, text):
        if self.anchor:
            out, last = [], 0
            for m in self.anchor.finditer(text):
                pos = m.start()
                if pos < last or not self.start_ok(text, pos):
                    continue
                for old, new, is_folder in self.entries[m.group()]:
                    if text.startswith(old, pos) and self.end_ok(text, pos + len(old), is_folder, is_folder and '/' not in old):
                        out += [text[last:pos], new]
                        last = pos + len(old)
                        self.hits[old] += 1
                        break
            out.append(text[last:])
            text = ''.join(out)
        if self.sound:
            def swap(m):
                new = self.sound.get(m.group(2))
                if not new:
                    return m.group(0)
                self.hits[SOUND_ROOT + '/' + m.group(2)] += 1
                return m.group(1) + new + m.group(1)
            text = self.sound_pat.sub(swap, text)
        return text


def code_files():
    out = [f for f in os.listdir(ROOT) if f.endswith(CODE_EXTS) and os.path.isfile(os.path.join(ROOT, f))]
    for top in sorted(CODE_DIRS):
        for folder, dirs, files in os.walk(os.path.join(ROOT, top)):
            dirs[:] = [d for d in dirs if d != '備份']
            rel = os.path.relpath(folder, ROOT).replace(os.sep, '/')
            out += [rel + '/' + f for f in files if f.endswith(CODE_EXTS)]
    return [f for f in out if f not in OWN_FILES]


def read_text(path):
    with open(os.path.join(ROOT, path), 'rb') as f:   # 用二進位讀寫：換行符號、編碼都原樣保留
        return f.read().decode('utf-8', 'surrogateescape')


def write_text(path, text):
    with open(os.path.join(ROOT, path), 'wb') as f:
        f.write(text.encode('utf-8', 'surrogateescape'))


def scan_refs(texts, tops):
    """找出程式和資料裡提到的路徑。回傳 (寫完整的檔案路徑, 程式組出來的路徑用到的資料夾, 只寫資料夾的字串)"""
    t = '|'.join(re.escape(x) for x in tops)
    literal = re.compile(r'(?<![\w\-.\\])(?:' + t + r''')/[^"'`<>\n]+?\.(?:''' + ASSET_EXTS + r')(?![\w.])', re.I)
    composed = re.compile(r'''(["'`])(?:\.\./)?((?:''' + t + r''')/[^"'`\n$]*)(?:\$\{|\1\s*\+)''')
    folder_str = re.compile(r'''(["'`])(?:\.\./)?((?:''' + t + r''')/[^"'`\n$.]*)\1''')
    files, comp, plain = collections.defaultdict(set), collections.defaultdict(set), collections.defaultdict(set)
    for name, text in texts.items():
        for m in literal.finditer(text):
            if not any(c in m.group() for c in '$+*{'):
                files[m.group()].add(name)
        for m in composed.finditer(text):
            comp[m.group(2).rsplit('/', 1)[0]].add(name)
        for m in folder_str.finditer(text):
            plain[m.group(2).rstrip('/')].add(name)
    return files, comp, plain


def bump_versions(changed, texts, stamp):
    """改過的 js、data、css 要換 ?v=，瀏覽器才不會繼續用快取裡的舊路徑"""
    html_like = [f for f in texts if f.endswith(('.html', '.js'))]
    todo, done = [f for f in changed if f.endswith(('.js', '.css'))], set()
    bumped = set()
    while todo:
        target = todo.pop()
        if target in done:
            continue
        done.add(target)
        versioned = re.compile(re.escape(target) + r'''\?v=[^"'`\s&<>]*''')
        plain = re.compile(r'''((?:src|href)=["'])''' + re.escape(target) + r'''(?=["'])''')
        for f in html_like:
            new = versioned.sub(target + '?v=' + stamp, texts[f])
            new = plain.sub(lambda m: m.group(1) + target + '?v=' + stamp, new)
            if new != texts[f]:
                texts[f] = new
                bumped.add(f)
                if f.endswith('.js') and f not in changed:
                    todo.append(f)
    return bumped


def load_batches():
    path = os.path.join(ROOT, MOVES_FILE)
    if not os.path.exists(path):
        return []
    m = re.search(r'ASSET_MOVE_BATCHES\s*=\s*(\[.*\])\s*;', read_text(MOVES_FILE), re.S)
    return json.loads(m.group(1)) if m else []


def save_batches(batches):
    rows = ',\n'.join(json.dumps(b, ensure_ascii=False, sort_keys=True) for b in batches)
    write_text(MOVES_FILE, '/* 素材搬家紀錄：tools/asset-move.py（素材搬家.bat）自動產生，不用手改。\n'
               '   瀏覽器裡的舊暫存會照這份換成新路徑（js/asset-moves.js）。 */\n'
               'window.ASSET_MOVE_BATCHES = [' + ('\n' + rows + '\n' if rows else '') + '];\n')


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    ap = argparse.ArgumentParser(description='素材搬家工具')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--yes', action='store_true')
    ap.add_argument('--accept-similar', action='store_true')
    ap.add_argument('--base', default='HEAD')
    args = ap.parse_args()

    def ask_similar(old, new):
        if args.yes or args.dry_run:
            return False
        return input('內容改過、檔名一樣，是同一個檔案嗎？\n  ' + old + '\n→ ' + new + '\n  (y/n) ').strip().lower() == 'y'

    tree = base_tree(args.base)
    disk = disk_files()
    moved_code = sorted(p for p in tree if '/' in p and top_of(p) in CODE_DIRS and not os.path.exists(os.path.join(ROOT, p)))
    moves, merged, lost = match_moves(tree, disk, args.accept_similar, ask_similar)
    if not moves and not merged and not lost:
        print('沒有發現搬動的素材。請先在檔案總管改好資料夾，再執行一次。')
        return 0

    folders = find_folder_moves(moves, tree, disk)
    file_map = {**moves, **merged}
    sound_old_root, sound_new_root = SOUND_ROOT, folders.get(SOUND_ROOT, SOUND_ROOT)
    sound = {}
    for old, new in file_map.items():
        if old.startswith(sound_old_root + '/'):
            rel_new = posixpath.relpath(new, sound_new_root)
            if old[len(sound_old_root) + 1:] != rel_new:
                sound[old[len(sound_old_root) + 1:]] = rel_new

    print('\n===== 素材搬家：跟 ' + args.base + ' 比對的結果 =====')
    print('搬動的檔案：%d 個' % len(moves))
    for old, new in sorted(folders.items()):
        print('  資料夾 ' + old + ' → ' + new)
    in_folder = [o for o in moves if not any(o.startswith(f + '/') for f in folders)]
    for old in sorted(in_folder)[:30]:
        print('  ' + old + ' → ' + moves[old])
    if len(in_folder) > 30:
        print('  ……還有 %d 個（完成後看報告）' % (len(in_folder) - 30))
    if merged:
        print('刪掉重複、改指向一模一樣的現有檔案：%d 個' % len(merged))
        for old in sorted(merged)[:15]:
            print('  ' + old + ' → ' + merged[old])
    if lost:
        print('⚠ 找不到新位置（刪掉了，或內容和檔名都改了）：%d 個' % len(lost))
        for old in lost[:30]:
            print('  ' + old)
        if len(lost) > 30:
            print('  ……還有 %d 個' % (len(lost) - 30))
    if moved_code:
        print('\n✖ js、data、css、tools 裡的檔案不見了，這個工具不處理程式檔搬動，請先放回去：')
        for p in moved_code[:20]:
            print('  ' + p)
        return 1
    dirty = dirty_code_files()
    if args.dry_run:
        if dirty:
            print('\n（正式執行前要先 commit：有 %d 個程式／資料檔還沒 commit）' % len(dirty))
        print('\n只是預覽，沒有改任何檔案。')
        return 0
    if dirty:
        print('\n✖ 下面這些檔案還沒 commit，先不動手。請用 Fork commit（搬動的素材先不要勾選）後再執行一次：')
        for p in dirty[:20]:
            print('  ' + p)
        if len(dirty) > 20:
            print('  ……還有 %d 個' % (len(dirty) - 20))
        return 1
    if not file_map:
        print('\n沒有可以更新的路徑。')
        return 1
    if not args.yes and input('\n要把專案裡的路徑換成新位置嗎？(y/n) ').strip().lower() != 'y':
        print('取消，沒有改任何檔案。')
        return 0

    # ---- 動手 ----
    names = code_files()
    before = {f: read_text(f) for f in names}
    # 記下更新前的狀況：本來就對不上的路徑不算這次造成的
    old_tops = sorted({top_of(p) for p in tree if is_asset(p)})
    new_tops = sorted({top_of(p) for p in disk} | {top_of(v) for v in file_map.values()})
    old_tree_files = {p for p in tree}
    old_refs, old_comp, old_plain = scan_refs(before, old_tops)
    old_missing = {p for p in old_refs if p not in old_tree_files}
    old_dirs = {posixpath.dirname(p) for p in old_tree_files}
    for p in list(old_dirs):
        while '/' in p:
            p = posixpath.dirname(p)
            old_dirs.add(p)
    old_stale = {p for p in [*old_comp, *old_plain] if p not in old_dirs}
    # 本來就對不上的路徑也可能被換過（例如整個資料夾改名）：用換過之後的樣子比
    old_missing = {map_path(p, file_map, folders) or p for p in old_missing}
    old_stale = {map_path(p + '/x', {}, folders)[:-2] if map_path(p + '/x', {}, folders) else p for p in old_stale}

    rw = Rewriter(file_map, folders, sound)
    texts = {f: rw.rewrite(t) for f, t in before.items()}
    changed = {f for f in names if texts[f] != before[f]}
    stamp = 'assetmove-' + datetime.datetime.now().strftime('%Y%m%d%H%M')

    batches = load_batches()
    batches.append({'id': stamp, 'files': file_map, 'folders': folders, 'sound': sound})
    save_batches(batches)
    moves_html = bump_versions(changed | {MOVES_FILE}, texts, stamp)
    changed |= moves_html
    for f in changed:
        if texts[f] != before[f]:
            write_text(f, texts[f])

    # ---- 檢查 ----
    new_refs, new_comp, new_plain = scan_refs(texts, new_tops)
    disk_now = set(disk)
    missing = {p: fs for p, fs in new_refs.items() if p not in disk_now and p not in old_missing}
    dirs_now = {posixpath.dirname(p) for p in disk_now}
    for p in list(dirs_now):
        while '/' in p:
            p = posixpath.dirname(p)
            dirs_now.add(p)
    stale = {p: fs for p, fs in {**new_plain, **new_comp}.items() if p not in dirs_now and p not in old_stale}
    # 沒有任何地方寫完整路徑的：如果原本的資料夾有程式組路徑在用，可能讀不到
    risky, unused = [], []
    for old, new in moves.items():
        if rw.hits[old]:
            continue
        carriers = [d for d in old_comp if '/' in d and old.startswith(d + '/')]   # 'images/' + … 這種太籠統的不算
        def carried(d):   # 程式組的那段資料夾跟著一起搬、後面的路徑沒變：組出來還是對的
            mapped = map_path(d + '/x', {}, folders)
            return mapped and mapped[:-2] + old[len(d):] == new
        if carriers and not all(carried(d) for d in carriers):
            risky.append((old, new, sorted({f for d in carriers for f in old_comp[d]})))
        elif not carriers:
            unused.append((old, new))
    renamed_segments = {posixpath.basename(k): v for k, v in folders.items()}
    handle_warn = []
    for f, t in texts.items():
        for m in re.finditer(r'''getDirectoryHandle\(['"]([^'"]+)['"]''', t):
            if m.group(1) in renamed_segments:
                handle_warn.append(f + '：' + m.group(0))
    bare = collections.defaultdict(set)
    zero_names = {posixpath.basename(o): o for o, *_ in [*risky, *unused] if not map_path(o, {}, folders)}   # 整個資料夾一起搬的，同資料夾的檔名還是對的
    for f, t in texts.items():
        for m in re.finditer(r'''["'`]([^"'`/\n]+\.(?:''' + ASSET_EXTS + r'''))["'`]''', t):
            if m.group(1) in zero_names:
                bare[zero_names[m.group(1)]].add(f)

    # ---- 報告 ----
    lines = ['素材搬家報告 ' + stamp, '', '改了 %d 個程式／資料檔：' % len(changed)]
    lines += ['  ' + f for f in sorted(changed)]
    lines += ['', '整個資料夾搬動 %d 個：' % len(folders)] + ['  %s → %s' % kv for kv in sorted(folders.items())]
    lines += ['', '搬動的檔案 %d 個：' % len(moves)] + ['  %s → %s（改了 %d 處）' % (o, n, rw.hits[o]) for o, n in sorted(moves.items())]
    if merged:
        lines += ['', '改指向現有檔案 %d 個：' % len(merged)] + ['  %s → %s（改了 %d 處）' % (o, n, rw.hits[o]) for o, n in sorted(merged.items())]
    sections = [
        ('✖ 路徑還找不到檔案（這次造成的，要處理）', ['%s（%s）' % (p, '、'.join(sorted(fs))) for p, fs in sorted(missing.items())]),
        ('✖ 程式裡的資料夾已經不存在（要改程式）', ['%s（%s）' % (p, '、'.join(sorted(fs))) for p, fs in sorted(stale.items())]),
        ('⚠ 可能是程式組路徑讀的，搬走後可能讀不到（要確認）', ['%s → %s（%s）' % (o, n, '、'.join(fs)) for o, n, fs in sorted(risky)]),
        ('⚠ 程式把資料夾一層一層分開寫（要改程式）', sorted(set(handle_warn))),
        ('⚠ 程式只寫檔名、沒寫資料夾（要確認）', ['%s（%s）' % (o, '、'.join(sorted(fs))) for o, fs in sorted(bare.items())]),
        ('⚠ 找不到新位置的素材', lost),
        ('ℹ 沒有地方寫到完整路徑（多半是沒用到的素材，不用處理）', ['%s → %s' % u for u in sorted(unused)]),
    ]
    for title, rows in sections:
        if rows:
            lines += ['', '%s：%d 個' % (title, len(rows))] + ['  ' + r for r in rows]
    os.makedirs(os.path.join(ROOT, 'backups'), exist_ok=True)
    report = 'backups/素材搬家報告-' + stamp.split('-')[1] + '.txt'
    write_text(report, '\n'.join(lines) + '\n')

    print('\n===== 完成 =====')
    print('換了 %d 處路徑，改了 %d 個檔案。' % (sum(rw.hits.values()), len(changed)))
    problems = 0
    for title, rows in sections[:-1]:
        if rows:
            problems += 1
            print('\n%s：%d 個' % (title, len(rows)))
            for r in rows[:10]:
                print('  ' + r)
            if len(rows) > 10:
                print('  ……還有 %d 個' % (len(rows) - 10))
    print('\n' + ('有上面這些項目要看一下。' if problems else '沒有發現問題。') + '詳細報告：' + report)
    print('請打開遊戲和編輯器確認；沒問題就用 Fork commit，有問題可以在 Fork 捨棄這次的變更。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
