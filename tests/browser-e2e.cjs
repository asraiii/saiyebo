'use strict';
// Local-only browser integration smoke test. Never connects to Cloudflare production.
// Run after: npm install --no-save playwright && npx playwright install chromium
//             python3 -m http.server 4173 --bind 127.0.0.1
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('playwright');
const origin = 'http://127.0.0.1:4173';
const screenshotDir = 'qa-screenshots';

async function run() {
  const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
  const results = [];
  fs.mkdirSync(screenshotDir, {recursive:true});
  const check = async (label, fn) => {
    await fn();
    results.push(label);
    console.log('PASS:', label);
  };
  try {
    const context = await browser.newContext({
      viewport: {width:390,height:844}, locale:'ko-KR'
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await check('first visit: public entry and SVG', async () => {
      await page.goto(origin + '/', {waitUntil:'load'});
      assert.equal(await page.locator('.public-entry').isVisible(), true);
      assert.equal(await page.locator('body').evaluate(el => el.classList.contains('saiyebo-today')), false);
      assert.equal(await page.locator('.public-entry-hero img').evaluate(img => img.complete && img.naturalWidth>0),true);
      assert.equal(await page.evaluate(() => localStorage.getItem('saiyebo:history:v1')),null);
    });

    await check('start form to saved Today', async () => {
      await page.locator('.public-entry-cta').click();
      await page.locator('[name="myBirth"]').fill('1992-05-14');
      await page.locator('[name="partnerBirth"]').fill('1993-11-02');
      await page.locator('[name="startDate"]').fill('2025-07-22');
      await page.locator('#couple-form button[type="submit"]').click();
      await page.waitForURL(origin + '/');
      await page.locator('body.saiyebo-today').waitFor({state:'attached'});
      assert.equal(await page.locator('[data-bind="hero-title"]').isVisible(),true);
      assert.equal(await page.evaluate(() => Boolean(window.SAIYEBO_ACTIVE_FORECAST)),true);
      assert.ok(JSON.parse(await page.evaluate(() => localStorage.getItem('saiyebo:history:v1'))).length >= 1);
    });

    await check('Today reflection saved locally', async () => {
      await page.locator('[data-reflection-mood="good"]').click();
      await page.locator('[data-reflection-memo]').fill('통합 테스트 기록');
      await page.locator('[data-reflection-save]').click();
      assert.equal(await page.locator('[data-reflection-state]').textContent(),'오늘 기록에 저장했어요.');
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('saiyebo:reflection:v1')));
      assert.equal(stored[stored.length-1].mood,'good');
    });

    await check('Calendar edit propagates to localStorage', async () => {
      await page.goto(origin + '/calendar/', {waitUntil:'load'});
      await page.locator('.day.today').click();
      assert.equal(await page.locator('[data-reflection-form]').isVisible(),true);
      await page.locator('[data-reflection-choice="normal"]').click();
      await page.locator('[data-reflection-memo]').fill('캘린더에서 수정');
      await page.locator('[data-reflection-form] button[type="submit"]').click();
      const records=await page.evaluate(() => JSON.parse(localStorage.getItem('saiyebo:reflection:v1')));
      assert.equal(records[records.length-1].mood,'normal');
    });

    await check('Report displays saved reflections', async () => {
      await page.goto(origin + '/report/', {waitUntil:'load'});
      assert.equal(await page.locator('[data-ref-count]').isVisible(),true);
      assert.match(await page.locator('[data-ref-count]').textContent(),/1/);
      await page.screenshot({path:screenshotDir+'/report-390.png', fullPage:true});
    });

    await check('Share creates sanitized, valid URL', async () => {
      await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
      await page.goto(origin + '/', {waitUntil:'load'});
      await page.locator('.share-action').click();
      const message=await page.evaluate(async()=>navigator.clipboard.readText());
      assert.ok(message.includes('/share/?d='));
      assert.ok(!message.includes('1992-05-14') && !message.includes('1993-11-02'));
      const address=message.match(/https?:\/\/[^\s]+\/share\/\?d=[^\s]+/)?.[0];
      assert.ok(address,'missing share link');
      await page.goto(address, {waitUntil:'load'});
      assert.equal(await page.locator('[data-invalid-share]').isVisible(),false);
      assert.equal(await page.locator('#weather-icon').evaluate(img=>img.complete&&img.naturalWidth>0),true);
      await page.screenshot({path:screenshotDir+'/share-390.png', fullPage:true});
    });

    await check('Invalid shared URL has visible error state', async () => {
      await page.goto(origin + '/share/?d=invalid', {waitUntil:'load'});
      assert.equal(await page.locator('[data-invalid-share]').isVisible(),true);
      assert.equal(await page.locator('.hero').isVisible(),false);
    });

    await check('All eight original SVG resources load', async () => {
      for (const name of [
        'clear-day','sun-hot','partly-cloudy-day','overcast',
        'rain','extreme-rain','snow','extreme-snow'
      ]) {
        const response=await context.request.get(origin+'/assets/weather/soft-3d/'+name+'.svg');
        assert.equal(response.status(),200,name);
        assert.match(await response.text(),/<svg\b/,name);
      }
    });

    await check('No horizontal page overflow at representative widths', async () => {
      for (const width of [320,360,390,430,768,1024,1440]) {
        await page.setViewportSize({width,height:900});
        await page.goto(origin+'/',{waitUntil:'load'});
        const overflow=await page.evaluate(() => document.documentElement.scrollWidth>innerWidth+1);
        assert.equal(overflow,false,'overflow at '+width+'px');
        await page.screenshot({path:screenshotDir+`/today-${width}.png`, fullPage:true});
      }
    });

    assert.deepEqual(pageErrors,[],'browser uncaught runtime errors');
    console.log('Browser QA:',results.length,'checks passed; local service only.');
  } finally {
    await browser.close();
  }
}
run().catch(error => {console.error('FAIL:',error);process.exitCode=1;});
