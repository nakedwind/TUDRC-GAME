# ===== 素材遺失檢查（多人協作用）=====
# 找出「地圖用到、但素材庫 data/tiles.js 裡找不到」的素材，和「素材庫登記了、但圖檔不見」的圖。
# 例如：有人用舊的編輯器存了素材庫，把別人剛加的素材蓋掉了（回憶03的大樓就這樣消失過）。
#
#   python tools/check-assets.py            檢查資料夾裡現在的檔案，有問題全部列出來
#   python tools/check-assets.py --staged   檢查「準備要 commit 的版本」（.githooks/pre-commit 用這個）：
#                                           只有「這次 commit 才新出現的問題」會擋下來（結束碼 1）；
#                                           上一個版本就有的舊問題只提醒，不擋。
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # 遊戲資料夾（tools 的上一層）
BUILTIN = {'floor', 'wall', 'obstacle'}   # js/maploader.js 內建的格子，不在素材庫裡
MAP_FILES = [('data/maps.js', 'BATTLE_MAPS', '戰鬥地圖'), ('data/base-maps.js', 'BASE_MAPS', '基地地圖'),
             ('data/story-maps.js', 'STORY_MAPS', '劇情地圖')]


def git(*args):
    out = subprocess.run(['git', *args], cwd=ROOT, capture_output=True)
    return out.stdout if out.returncode == 0 else None


def reader(where):
    """where：None＝資料夾裡的檔案、':'＝準備 commit 的版本、'HEAD:'＝上一個 commit"""
    def read(path):
        if where:
            out = git('show', where + path)
            if out is not None:
                return out.decode('utf-8')
            if where == 'HEAD:':
                return None   # 上一個版本還沒有這個檔案
        with open(os.path.join(ROOT, path), encoding='utf-8') as f:
            return f.read()
    return read


def array_of(text, name):
    """取出 const NAME = [ ... ]; 的內容（編輯器存的檔案都是 JSON 格式）"""
    i = text.index('const ' + name + ' =')
    return json.JSONDecoder().raw_decode(text[text.index('[', i):])[0]


def problems_in(read, files_in_git=None):
    """回傳 {問題的說明: 1}。files_in_git＝這個版本在 git 裡有哪些檔案（None＝看資料夾）"""
    out = {}
    text = read('data/tiles.js')
    if text is None:
        return out
    tiles = array_of(text, 'SHARED_TILES')
    known = {t['id'] for t in tiles} | BUILTIN

    # 1. 地圖用到的素材，素材庫裡都要有
    for path, name, kind in MAP_FILES:
        text = read(path)
        if text is None:
            continue
        for m in array_of(text, name):
            used = {}
            for layer in (m.get('layers') or {}).values():
                for tid in layer.values():
                    used[tid] = used.get(tid, 0) + 1
            for s in m.get('stamps') or []:
                used[s.get('id')] = used.get(s.get('id'), 0) + 1
            for tid in sorted(t for t in used if t and t not in known):
                out['%s「%s」用到的素材 %s（%d 處）不在素材庫 data/tiles.js 裡'
                    % (kind, m.get('name') or m.get('id'), tid, used[tid])] = 1

    # 2. 素材庫登記的圖檔要存在（commit 時還要已經加進 git，不然朋友拉下來會沒有圖）
    for t in tiles:
        f = (t.get('file') or '').replace('\\', '/')
        if not f or f.startswith('data:'):   # 圖直接存在資料裡（data:image/...）：沒有檔案要找
            continue
        label = '素材「%s」（%s）' % (t.get('name') or t['id'], t['id'])
        if files_in_git is None:
            if not os.path.isfile(os.path.join(ROOT, f)):
                out[label + '的圖檔不見了：' + f] = 1
        elif f not in files_in_git:
            hint = '（圖在你的資料夾裡，請把它 git add 一起 commit）' if os.path.isfile(os.path.join(ROOT, f)) else ''
            out[label + '的圖檔不在 git 裡：' + f + hint] = 1
    return out


def file_list(*args):
    out = git(*args)
    return set(out.decode('utf-8').split('\0')) if out is not None else set()


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if '--staged' not in sys.argv:
        found = problems_in(reader(None))
        for p in found:
            print('  ・' + p)
        print('⚠ 共 %d 個素材問題' % len(found) if found else '✔ 素材檢查通過')
        return 1 if found else 0

    now = problems_in(reader(':'), file_list('ls-files', '--cached', '-z'))
    before = problems_in(reader('HEAD:'), file_list('ls-tree', '-r', '--name-only', '-z', 'HEAD')) if git('rev-parse', '--verify', 'HEAD') else {}
    new = [p for p in now if p not in before]
    old = [p for p in now if p in before]
    if old:
        print('（提醒）以前就有、這次沒有變的素材問題 %d 個，不擋 commit：' % len(old))
        for p in old:
            print('  ・' + p)
    if new:
        print('⚠ 素材檢查沒過：這次 commit 會讓下面的素材遺失，所以先不 commit。')
        for p in new:
            print('  ・' + p)
        print('\n常見原因：有人用「打開時還是舊資料」的編輯器存了素材庫，把別人加的素材蓋掉了。')
        print('處理方式：從 git 紀錄把少掉的素材找回來（可以請 Claude 幫忙），或把圖檔 git add 進來，再 commit 一次。')
        print('確定要照樣 commit 的話：git commit --no-verify')
        return 1
    print('✔ 素材檢查通過：這次 commit 沒有讓任何素材遺失')
    return 0


if __name__ == '__main__':
    sys.exit(main())
