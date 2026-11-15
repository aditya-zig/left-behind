import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const script = JSON.parse(await readFile(new URL('../src/mascot-script.json', import.meta.url)));
const base = process.env.BASE_URL ?? 'http://127.0.0.1:5174';
const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__players = [];
    const Original = window.Audio;
    window.Audio = function(...args) {
      const audio = new Original(...args);
      window.__players.push(audio);
      return audio;
    };
  });
  const text = id => script.find(line => line.id === id).text;
  await page.goto(`${base}/#/moon/eagle`);
  await expect(page.locator('.orbit-guide')).toContainText(text('moon_apollo_lunar_modules_eagle_01'));
  await page.getByRole('button', { name: '◖ Voice off', exact: true }).click();
  await page.waitForFunction(() => window.__players.at(-1)?.currentTime > .1);
  assert.match(await page.evaluate(() => window.__players.at(-1).src), /moon_apollo_lunar_modules_eagle_01.wav$/);
  await page.getByRole('button', { name: 'Next line →', exact: true }).click();
  await expect(page.locator('.orbit-guide')).toContainText(text('moon_apollo_lunar_modules_eagle_02'));
  await page.waitForFunction(() => window.__players.at(-1)?.src.endsWith('_02.wav') && window.__players.at(-1).currentTime > .1);
  assert.equal(await page.evaluate(() => window.__players.slice(0, -1).every(player => player.paused)), true);
  await page.getByRole('button', { name: '◖ Voice on', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__players.every(player => player.paused)), true);
  await page.goto(`${base}/#/mars/opportunity`);
  await expect(page.locator('.orbit-guide')).toContainText(text('mars_opportunity_01'));
  await page.getByRole('button', { name: 'Next line →', exact: true }).click();
  await expect(page.locator('.orbit-guide')).toContainText(text('mars_opportunity_02'));
  await page.screenshot({ path: '/tmp/left-behind-mascot.png' });
  assert.deepEqual(errors, []);
  console.log('PASS: exact Moon/Mars transcripts, real WAV playback, next-line replacement, mute, no runtime errors');
} finally { await browser.close(); }
