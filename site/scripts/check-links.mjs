// Offline link and request check for dist/: internal links and fragments must resolve, and no page may
// reference an external resource (script, stylesheet, image, font, iframe, preload). External
// <a href> links are only syntax-checked (https, rel=noopener) because CI must not depend on third parties.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const origin = 'https://agenticworkflowprotocol.org';
if (!existsSync(dist)) { console.error('dist/ missing: run npm run build'); process.exit(2); }

const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(dist);
const html = files.filter((f) => f.endsWith('.html'));
const errors = [];
const idCache = new Map();
const ids = (f) => {
  if (!idCache.has(f)) idCache.set(f, new Set([...readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idCache.get(f);
};
const resolveFile = (urlPath) => {
  let p = join(dist, decodeURIComponent(urlPath));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  return existsSync(p) && statSync(p).isFile() ? p : null;
};

let internal = 0, external = 0;
for (const f of html) {
  const rel = f.slice(dist.length);
  const text = readFileSync(f, 'utf8').replace(/<script[^>]*type="application\/ld\+json"[\s\S]*?<\/script>/g, '');
  const pageUrl = rel.replace(/index\.html$/, '');
  // 1. anchors
  for (const m of text.matchAll(/<a\s[^>]*?href="([^"]*)"[^>]*>/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(mailto:|tel:|javascript:)/.test(href)) { if (href.startsWith('javascript:')) errors.push(`${rel}: javascript: link`); continue; }
    if (/^https?:\/\//.test(href) && !href.startsWith(origin)) {
      external++;
      if (!href.startsWith('https://')) errors.push(`${rel}: insecure external link ${href}`);
      if (/target="_blank"/.test(m[0]) && !/noopener/.test(m[0])) errors.push(`${rel}: target=_blank without noopener ${href}`);
      continue;
    }
    internal++;
    const u = new URL(href.startsWith(origin) ? href : href, `${origin}${pageUrl}`);
    const target = u.pathname === pageUrl ? f : resolveFile(u.pathname);
    if (!target) { errors.push(`${rel}: broken link ${href}`); continue; }
    if (u.hash && extname(target) === '.html' && !ids(target).has(decodeURIComponent(u.hash.slice(1)))) errors.push(`${rel}: missing fragment ${href}`);
  }
  // 2. resource references must be same-origin
  for (const m of text.matchAll(/<(script|img|iframe|source|video|audio|embed|object)\s[^>]*?(?:src|data)="([^"]+)"/g)) {
    if (/^(https?:)?\/\//.test(m[2])) errors.push(`${rel}: external <${m[1]}> ${m[2]}`);
  }
  for (const m of text.matchAll(/<link\s[^>]*?href="([^"]+)"[^>]*>/g)) {
    const isCanonical = /rel="(canonical|alternate)"/.test(m[0]);
    if (/^(https?:)?\/\//.test(m[1]) && !isCanonical && !m[1].startsWith(origin)) errors.push(`${rel}: external <link> ${m[1]}`);
  }
}
// 3. CSS and JS must not import or load external resources
for (const f of files.filter((f) => /\.(css|js|mjs)$/.test(f))) {
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(/(?:@import\s+(?:url\()?|url\()\s*["']?(https?:\/\/[^"')\s]+)/g)) errors.push(`${f.slice(dist.length)}: external url() ${m[1]}`);
}
for (const need of ['CNAME', '404.html', 'robots.txt', 'sitemap-index.xml', 'pagefind/pagefind.js']) {
  if (!existsSync(join(dist, need))) errors.push(`missing ${need}`);
}
console.log(`check-links: ${html.length} pages, ${internal} internal links, ${external} external links (not fetched)`);
if (errors.length) { console.error(errors.join('\n')); console.error(`FAIL: ${errors.length} problem(s)`); process.exit(1); }
console.log('OK');
