# ===== 編輯器的本機小幫手 =====
# 用「開啟編輯器.bat」啟動。做兩件事：
#   1. 把遊戲資料夾當成網站給瀏覽器看（跟 python -m http.server 一樣）。
#   2. 編輯器的素材圖右鍵「以檔案總管開啟」：幫忙打開那張圖所在的資料夾，並選好那張圖。
#      （網頁本身不能開檔案總管，所以要這個小幫手代勞）
# 只接受這台電腦自己的連線（127.0.0.1），也只會打開遊戲資料夾裡面的檔案。
import http.server
import json
import os
import subprocess
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8770
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # 遊戲資料夾（tools 的上一層）


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == '/__open-folder':
            return self.open_folder(urllib.parse.parse_qs(url.query).get('path', [''])[0])
        return super().do_GET()

    def open_folder(self, rel):
        target = os.path.normpath(os.path.join(ROOT, rel))
        try:
            inside = os.path.commonpath([ROOT, target]) == ROOT   # 不能跑到遊戲資料夾外面
        except ValueError:   # 例如在別的磁碟（C:\…）
            inside = False
        if not rel or not inside or not os.path.exists(target):
            return self.reply(404, {'ok': False, 'error': '找不到這個檔案'})
        if os.name == 'nt':
            subprocess.Popen('explorer /select,"' + target + '"')   # 打開資料夾並選好這個檔案
        else:
            subprocess.Popen(['open' if sys.platform == 'darwin' else 'xdg-open', os.path.dirname(target)])
        return self.reply(200, {'ok': True})

    def reply(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):   # 不要讓瀏覽器記住舊的檔案：編輯器存檔後，遊戲重新整理就看得到
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


if __name__ == '__main__':
    print('編輯器小幫手已啟動：http://127.0.0.1:%d/  （這個視窗開著才能用；關掉視窗就停止）' % PORT)
    http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
