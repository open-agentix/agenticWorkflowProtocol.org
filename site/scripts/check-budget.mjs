// Size budget for dist/. Limits are bytes and apply to the raw files (before transport compression).
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!existsSync(dist)) { console.error('dist/ missing: run npm run build'); process.exit(2); }
const KB = 1024;
const budget = {
  totalMB: 8, // everything, including the search index and the schema
  maxHtmlKB: 600, // largest single page (the rendered specification is the largest)
  homeHtmlKB: 400,
  cssKB: 160, // all CSS
  jsKB: 250, // all JS except pagefind (loaded on demand when searching)
  maxImageKB: 120,
};
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist).map((p) => ({ p, rel: p.slice(dist.length + 1), size: statSync(p).size }));
const sum = (fs) => fs.reduce((a, f) => a + f.size, 0);
const html = files.filter((f) => f.rel.endsWith('.html'));
const css = files.filter((f) => f.rel.endsWith('.css'));
const js = files.filter((f) => /\.m?js$/.test(f.rel) && !f.rel.startsWith('pagefind/'));
const img = files.filter((f) => /\.(png|jpe?g|gif|webp|avif)$/.test(f.rel));
const biggest = [...html].sort((a, b) => b.size - a.size)[0];
const home = files.find((f) => f.rel === 'index.html');
const checks = [
  ['total', sum(files) / KB / KB, budget.totalMB, 'MB'],
  ['largest html (' + biggest.rel + ')', biggest.size / KB, budget.maxHtmlKB, 'KB'],
  ['home html', home.size / KB, budget.homeHtmlKB, 'KB'],
  ['css total', sum(css) / KB, budget.cssKB, 'KB'],
  ['js total (excl. pagefind)', sum(js) / KB, budget.jsKB, 'KB'],
  ...img.map((f) => ['image ' + f.rel, f.size / KB, budget.maxImageKB, 'KB']),
];
let fail = 0;
for (const [name, v, max, unit] of checks) {
  const ok = v <= max; if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${v.toFixed(1)} ${unit} (limit ${max})`);
}
process.exit(fail ? 1 : 0);
