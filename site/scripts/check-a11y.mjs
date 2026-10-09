// Accessibility smoke test: serves dist/ locally, opens every page in a Chromium browser in light and
// dark mode, runs axe-core (WCAG 2.0/2.1/2.2 A and AA rules) and fails on any violation. Also fails if a
// page requests anything outside localhost (zero external requests). Uses the system Chromium
// (CHROME_PATH, or the first of chromium, google-chrome found); no browser is downloaded.
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
import { serve } from './lib/serve.mjs';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!existsSync(dist)) { console.error('dist/ missing: run npm run build'); process.exit(2); }
const exe = [process.env.CHROME_PATH, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable']
  .find((p) => p && existsSync(p));
if (!exe) { console.error('No Chromium/Chrome found. Set CHROME_PATH.'); process.exit(2); }
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(dist).filter((f) => f.endsWith('index.html') || f.endsWith('404.html'))
  .map((f) => '/' + f.slice(dist.length + 1).replace(/index\.html$/, ''));

const { server, port } = await serve(dist);
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
let failures = 0;
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: 1280, height: 900 } });
  for (const path of pages) {
    const page = await ctx.newPage();
    const external = [];
    page.on('request', (r) => { if (!/^(http:\/\/127\.0\.0\.1:|data:|blob:)/.test(r.url())) external.push(r.url()); });
    await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'load' });
    await page.addScriptTag({ content: axeSource });
    const res = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }));
    for (const v of res.violations) {
      failures++;
      console.error(`[${scheme}] ${path}: ${v.id} (${v.impact}) ${v.help}\n   ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    }
    for (const u of external) { failures++; console.error(`[${scheme}] ${path}: external request ${u}`); }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`check-a11y: ${pages.length} pages x 2 color schemes, ${failures} problem(s)`);
process.exit(failures ? 1 : 0);
