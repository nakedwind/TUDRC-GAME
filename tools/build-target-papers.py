"""把射擊練習的靶紙圖片轉成 data/target-papers.js（base64 內嵌）。

為什麼需要：直接雙擊 HTML 開遊戲（網址是 file://）時，瀏覽器不准程式讀圖片的像素，
射擊練習就算不出打在哪一圈（全部變成 5 分）。內嵌成 data: 網址的圖片就讀得到。
用網址開遊戲（GitHub Pages、本機伺服器）時不會用到這份檔案，照樣讀原始圖片。

什麼時候要跑：新增或修改靶紙圖片之後（靶紙清單在 js/target-practice.js 的 TARGET_PRACTICE.images）。
用法：在專案資料夾執行  python tools/build-target-papers.py
"""
import base64, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'js', 'target-practice.js'), encoding='utf-8').read()
block = re.search(r'images:\s*\[(.*?)\]', src, re.S)
paths = list(dict.fromkeys(re.findall(r"'([^']+\.png)'", block.group(1)))) if block else []
data = {}
for p in paths:
    with open(os.path.join(ROOT, p), 'rb') as f:
        data[p] = 'data:image/png;base64,' + base64.b64encode(f.read()).decode('ascii')
    print('加入', p)
out = ('/* 由 tools/build-target-papers.py 產生：射擊練習的靶紙圖片（base64）。\n'
       '   只在直接雙擊開遊戲（file://）時使用，讓計分讀得到像素；改了靶紙圖片後要重新執行那支工具。 */\n'
       'const TARGET_PAPER_DATA = ' + json.dumps(data, indent=2, ensure_ascii=False) + ';\n')
with open(os.path.join(ROOT, 'data', 'target-papers.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write(out)
print('已寫入 data/target-papers.js，共', len(data), '張')
