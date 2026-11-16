/**
 * Static integration contracts for SAIYEBO.
 * Run locally: node --test tests/site-contracts.test.cjs
 * Zero dependencies, no network, no deployments or user-data mutations.
 * These tests do NOT establish real-device, visual or production E2E coverage.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const htmlPages = [
  'index.html', 'start/index.html', 'calendar/index.html',
  'report/index.html', 'share/index.html', 'about/index.html',
  'guide/index.html', 'privacy/index.html', 'notes/index.html',
  'weather-guide/index.html', '404.html', 'history/index.html'
];
const jsFiles = [
  'app.js', 'start/start.js', 'calendar/calendar.js',
  'report/report.js', 'share/share.js'
];
const weatherFiles = [
  'clear-day.svg', 'sun-hot.svg', 'partly-cloudy-day.svg',
  'overcast.svg', 'rain.svg', 'extreme-rain.svg', 'snow.svg',
  'extreme-snow.svg'
];

test('all locally linked page resources and routes exist', () => {
  for (const page of htmlPages) {
    const html = read(page);
    const base = path.dirname(path.join(root, page));
    const references = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)];
    for (const [, original] of references) {
      if (/^(?:https?:|mailto:|data:|#)/i.test(original)) continue;
      const pathname = original.split(/[?#]/)[0];
      let file = pathname.startsWith('/')
        ? path.join(root, pathname.slice(1))
        : path.resolve(base, pathname);
      if (!path.extname(file) || pathname.endsWith('/'))
        file = path.join(file, 'index.html');
      const relative = path.relative(root, file);
      assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative),
        page + ' has an unsafe route: ' + original);
      assert.ok(fs.existsSync(file),
        page + ' links to missing local file: ' + original);
    }
  }
});

test('the eight approved weather icons remain available', () => {
  for (const name of weatherFiles) {
    const file = path.join(root, 'assets/weather/soft-3d', name);
    assert.ok(fs.existsSync(file), name + ' is missing');
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, /<svg\b/);
    assert.match(source, /<\/svg>\s*$/);
  }
});

test('public landing visibility rules cannot blank the Share page', () => {
  const home = read('index.html');
  const share = read('share/index.html');
  const css = read('styles.css');
  const app = read('app.js');
  assert.match(home, /<main class="app saiyebo-home">/);
  assert.match(home, /data-public-entry/);
  assert.match(share, /<main class="app">/);
  assert.doesNotMatch(share, /class="app saiyebo-home"/);
  assert.match(css,
    /body:not\(\.saiyebo-today\)\s+\.saiyebo-home\s*>\s*:not\(\[data-public-entry\]\)\s*\{\s*display:none\s*\}/);
  assert.match(css,
    /body\.saiyebo-today\s+\.saiyebo-home\s*>\s*\[data-public-entry\]\s*\{\s*display:none\s*\}/);
  assert.doesNotMatch(css,
    /body:not\(\.saiyebo-today\)\s+\.app\s*>\s*:not\(\[data-public-entry\]\)/);
  assert.doesNotMatch(share, /<nav\b/); // Shared CSS contains a fixed nav rule for Today only.
  const homeCss = home.match(/href="styles\.css\?v=([^"]+)"/)?.[1];
  const shareCss = share.match(/href="\/styles\.css\?v=([^"]+)"/)?.[1];
  assert.ok(homeCss && shareCss, 'both pages need the shared stylesheet');
  assert.equal(shareCss, homeCss, 'avoid untested shared CSS version drift');
  assert.match(app, /document\.body\.classList\.add\("saiyebo-today"\)/);
  assert.ok(
    app.lastIndexOf('document.body.classList.add("saiyebo-today")') >
    app.lastIndexOf('bindShare(activeCouple||DEMO_COUPLE,activeForecast);'),
    'personalized UI must switch only after Today initializes'
  );
});

test('indexable sitemap targets are present and canonical', () => {
  const sitemap = read('sitemap.xml');
  const entries = [...sitemap.matchAll(/<loc>(https:\/\/saiyebo\.pages\.dev\/[^<]*)<\/loc>/g)]
    .map(([, url]) => url);
  assert.ok(entries.length >= 1, 'sitemap has no URL entries');
  assert.equal(new Set(entries).size, entries.length, 'duplicate sitemap entries');
  for (const url of entries) {
    const pathname = url.slice('https://saiyebo.pages.dev/'.length);
    const page = pathname ? pathname + 'index.html' : 'index.html';
    const html = read(page);
    assert.match(html, /<meta name="robots" content="index,follow">/,
      page + ' is not indexable');
    assert.ok(html.includes('rel="canonical" href="' + url + '"'),
      page + ' has a canonical mismatch');
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<h1\b/);
  }
});

test('all primary JavaScript entry points parse', () => {
  for (const file of jsFiles) {
    assert.doesNotThrow(() => new vm.Script(read(file), {filename:file}),
      'JavaScript syntax invalid: ' + file);
  }
});
