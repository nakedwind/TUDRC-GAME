/* 執行：node tools/test-story-scene.cjs
   需安裝 playwright；或以 PLAYWRIGHT_MODULE 指向既有 playwright 套件。
   使用獨立瀏覽器儲存空間，不讀寫玩家的瀏覽器進度。 */
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
async function run({ chromium, root = path.resolve(__dirname, '..'), executablePath } = {}) {
  root = path.resolve(root);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const errors = [], report = [];
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) errors.push(msg.text()); });
    // 在遊戲載入之前種下可辨識進度；包含不得被預覽消耗的新遊戲要求。
    await page.addInitScript(() => {
      if (location.search.includes('storyPreview=1')) {
        localStorage.clear(); localStorage.setItem('tudrc_sp_v1', '63');
        localStorage.setItem('story-preview-test', 'keep');
        sessionStorage.setItem('tudrc-new-game-request-v1', 'new');
      }
    });
    // Playwright 直接供應工作區檔案，不需要啟動伺服器或對外連線。
    await page.route('http://story-preview.test/**', async route => {
      const file = path.resolve(root, '.' + decodeURIComponent(new URL(route.request().url()).pathname));
      if (!file.startsWith(root + path.sep)) return route.fulfill({ status: 403, body: '' });
      try {
        const body = await fs.readFile(file);
        const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.mp3': 'audio/mpeg' };
        await route.fulfill({ body, contentType: types[path.extname(file)] || 'application/octet-stream' });
      } catch { await route.fulfill({ status: 404, body: '' }); }
    });
    const gameURL = 'http://story-preview.test/' + encodeURIComponent('塔防原型.html');
    await page.goto(gameURL + '?storyPreview=1');
    await page.waitForFunction(() => document.querySelector('#dialogueNext')?.textContent.trim().endsWith('下一句'));
    assert.equal(await page.evaluate(() => window.STORY_MODE && LIGHT.enabled && MAP_SAFE), true);
    assert.equal(await page.evaluate(() => lightsCache.length), 5);
    assert.equal(await page.evaluate(() => G.player), null);
    assert.equal(await page.evaluate(() => G.running), false);
    report.push('劇情自動啟動；安全場景仍有黑幕與五盞燈；無戰鬥玩家');
    const before = await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));
    for (const key of ['w','a','s','d','Shift','b','c','f','r','1','p','Escape','Control+b','Control+f']) await page.keyboard.press(key);
    await page.mouse.click(500, 300, { button: 'right' });
    await page.mouse.wheel(0, 100);
    // 頁數與說謊那頁從劇情資料讀，改台詞不用改測試。
    const beats = await page.evaluate(() => Object.values(STORY_SCENES).find(s => s.map === 'story_start').beats.map(b => b.text));
    const total = beats.length, liePage = beats.indexOf('……他已經沒事了。') + 1, firstText = beats[0];
    assert(liePage > 0, '找不到溫特說謊的那一頁');
    assert.equal(await page.locator('#dialogueProgress').textContent(), '1 / ' + total);
    assert.equal(await page.evaluate(() => !!(backpackOpen || settingsOpen || tpadOpen || paused || dialogueState || G.enemies.length || G.towers.length)), false);
    const repeated = await page.evaluate(() => {
      dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true, bubbles: true }));
      return document.querySelector('#dialogueProgress').textContent;
    });
    assert.equal(repeated, '1 / ' + total);
    report.push('移動、攻擊、快捷鍵、滾輪和長按均不會操作場景或跳頁');
    await fs.mkdir(path.join(root, 'output'), { recursive: true });
    await page.screenshot({ path: path.join(root, 'output/story-opening.png') });
    for (let n = 1; n <= total; n++) {
      await page.waitForFunction(([n, total]) => document.querySelector('#dialogueProgress').textContent === n + ' / ' + total && !document.querySelector('#dialogueBox').classList.contains('hidden'), [n, total]);
      await page.waitForFunction(() => !document.querySelector('#dialogueNext').textContent.includes('快速顯示'));
      if (n === liePage) {
        assert.equal(await page.locator('#dialogueText').textContent(), '……他已經沒事了。');
        await page.screenshot({ path: path.join(root, 'output/story-lie.png') });
      }
      // 確認對話停留時不會自行前進，光暈與呼吸仍在更新。
      if (n === 5) {
        const canvasBefore = await page.locator('#cv').screenshot();
        await page.waitForTimeout(600);
        const canvasAfter = await page.locator('#cv').screenshot();
        assert(!canvasBefore.equals(canvasAfter), '對話停留時場景應繼續動');
        assert.equal(await page.locator('#dialogueProgress').textContent(), '5 / ' + total);
      }
      if (n % 2) await page.locator('#dialogueNext').click();
      else await page.keyboard.press('Space');
    }
    await page.locator('#storyEnd').waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => G.phase), 'story-ended');
    assert.equal(await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort())), before);
    assert.equal(await page.evaluate(() => sessionStorage.getItem('tudrc-new-game-request-v1')), 'new');
    report.push(total + '頁順序正確、等待翻頁時動畫持續、淡黑結束、正式進度與待執行要求均未變更');
    await page.locator('[data-story-action="replay"]').click();
    await page.waitForFunction(total => document.querySelector('#dialogueProgress').textContent === '1 / ' + total && !document.querySelector('#dialogueBox').classList.contains('hidden'), total);
    assert.equal(await page.evaluate(() => G.phase), 'story');
    assert.equal(await page.evaluate(() => document.querySelectorAll('#storySceneUI').length), 1);
    report.push('重播回到第一頁，無重複介面');
    // 清除測試用的新遊戲要求，離開預覽後檢查普通基地與操作恢復。
    await page.evaluate(() => sessionStorage.removeItem('tudrc-new-game-request-v1'));
    await page.locator('.story-head [data-story-action="exit"]').click();
    await page.waitForURL(gameURL);
    assert.equal(await page.evaluate(() => window.STORY_MODE), false);
    await page.evaluate(() => {
      const index = mapList().findIndex(m => m.safe && !Object.values(STORY_SCENES).some(s => s.map === m.id));
      switchMap(index); begin(false);
    });
    assert.equal(await page.evaluate(() => G.running && !!G.player && !LIGHT.enabled && !document.body.classList.contains('story-scene')), true);
    await page.keyboard.press('b');
    assert.equal(await page.evaluate(() => backpackOpen), true);
    await page.keyboard.press('b');
    report.push('離開後一般基地恢復正常，背包快捷鍵可使用');
    await page.evaluate(() => {
      const draft = JSON.parse(JSON.stringify(STORY_MAPS.find(m => m.id === 'story_start')));
      draft.name = '雷德回憶01・編輯草稿';
      localStorage.setItem('tudrc_map_preview_v1', JSON.stringify({ map: draft, tiles: SHARED_TILES }));
    });
    await page.addInitScript(() => { if (location.search === '?preview=1') window.editorBeforeSnapshot = JSON.stringify(Object.entries(localStorage).sort()); });
    await page.goto(gameURL + '?preview=1');
    await page.waitForFunction(text => document.querySelector('#dialogueText')?.textContent === text, firstText);
    assert.equal(await page.evaluate(() => MAP.name), '雷德回憶01・編輯草稿');
    assert.equal(await page.evaluate(() => window.STORY_PREVIEW && window.STORY_MODE), true);
    assert.equal(await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()) === window.editorBeforeSnapshot), true);
    report.push('劇情地圖編輯器預覽採用當前草稿，也保持進度唯讀');
    assert.deepEqual(errors, []);
    return { passed: report, errors };
  } finally { await browser.close(); }
}
module.exports = { run };
if (require.main === module) {
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
  run({ chromium, executablePath: process.env.CHROME_PATH }).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error); process.exitCode = 1; });
}
