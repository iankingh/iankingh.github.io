import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';

const destination = 'https://iankingh.github.io/blog/';
const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

async function open(t, javaScriptEnabled, html) {
  const context = await browser.newContext({ javaScriptEnabled });
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  t.after(() => assert.deepEqual(errors, []));
  await page.route('http://127.0.0.1:43199/', route => route.fulfill({ contentType: 'text/html', body: html }));
  // Keep the navigation local: no site content is sent to the public destination.
  await page.route(`${destination}**`, route => route.fulfill({
    contentType: 'text/html', body: '<h1>Local destination stub</h1>',
  }));
  return page;
}

test('normal page redirects with JavaScript enabled', async t => {
  const page = await open(t, true, source);
  await page.goto('http://127.0.0.1:43199/');
  await page.waitForURL(destination);
  assert.equal(await page.locator('h1').innerText(), 'Local destination stub');
});

test('location.replace works without refresh and does not retain the redirect in history', async t => {
  const page = await open(t, true, source.replace(/<meta http-equiv="refresh"[^>]*>/, ''));
  await page.goto('http://127.0.0.1:43199/');
  await page.waitForURL(destination);
  assert.equal(await page.evaluate(() => history.length), 2);
});

test('HTML refresh redirects when JavaScript is disabled', async t => {
  const page = await open(t, false, source);
  await page.goto('http://127.0.0.1:43199/');
  await page.waitForURL(destination);
  assert.equal(await page.locator('h1').innerText(), 'Local destination stub');
});

for (const javaScriptEnabled of [true, false]) {
  test(`manual fallback remains usable when automatic mechanisms are unavailable (JS ${javaScriptEnabled ? 'on' : 'off'})`, async t => {
    // Isolate the fallback by suppressing both automatic mechanisms in the locally served response.
    const html = source.replace(/<meta http-equiv="refresh"[^>]*>/, '')
      .replace(/<script>[\s\S]*?<\/script>/, '');
    const page = await open(t, javaScriptEnabled, html);
    await page.goto('http://127.0.0.1:43199/');
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), destination);
    const link = page.getByRole('link', { name: "Ian King's Blog" });
    assert.equal(await link.isVisible(), true);
    assert.equal(await link.getAttribute('href'), destination);
    await link.click();
    await page.waitForURL(destination);
  });
}
