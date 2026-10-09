// Generates dist/llms.txt (index) and dist/llms-full.txt (all docs as plain Markdown) from
// src/content/docs. No dependencies. Run after `astro build` (and after sync-content).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(site, 'src/content/docs');
const dist = join(site, 'dist');
const ORIGIN = 'https://agenticworkflowprotocol.org';
const SECTIONS = [
  ['Get started', ['', 'getting-started']],
  ['Concepts', ['concepts']],
  ['Governance', ['governance']],
  ['Security', ['security']],
  ['Integrations', ['integrations']],
  ['Specification', ['specification', 'tooling']],
  ['Examples', ['examples']],
  ['Implementations', ['implementations']],
  ['Community', ['community']],
];

const walk = (d) => readdirSync(d).sort().flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : /\.(md|mdx)$/.test(n) ? [p] : [];
});

function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  const fm = {};
  if (m) for (const line of m[1].split('\n')) {
    const kv = line.match(/^(title|description):\s*(.*)$/);
    if (kv) { let v = kv[2].trim(); if (/^".*"$/.test(v)) v = JSON.parse(v); fm[kv[1]] = v; }
  }
  return { fm, body: m ? text.slice(m[0].length) : text };
}

function plain(file, body) {
  // Raw imports (`import x from '...?raw'`) are inlined where <Code code={x} ... /> uses them.
  const raws = {};
  for (const m of body.matchAll(/^import\s+(\w+)\s+from\s+'([^']+)\?raw';?$/gm)) {
    const f = resolve(dirname(file), m[2]);
    if (existsSync(f)) raws[m[1]] = readFileSync(f, 'utf8').trimEnd();
  }
  let out = body
    .replace(/^import .*$/gm, '')
    .replace(/<Code\s+code=\{(\w+)\}\s+lang="(\w+)"(?:\s+title="([^"]*)")?\s*\/>/g,
      (_, v, lang, title) => (raws[v] ? `${title ? `${title}\n\n` : ''}\`\`\`${lang}\n${raws[v]}\n\`\`\`` : ''))
    .replace(/<DocCard\s+title="([^"]*)"\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/DocCard>/g, (_, t, h, x) => `- [${t}](${ORIGIN}${h}): ${x.trim().replace(/\s+/g, ' ')}`)
    .replace(/<figure[\s\S]*?<\/figure>/g, '')
    .replace(/\{cards\.map[\s\S]*?\)\)\}/g, '')
    .replace(/<\/?(CardGroup|div|span|details|summary)[^>]*>/g, '')
    .replace(/^:::(\w+)(?:\[([^\]]*)\])?\s*$/gm, (_, k, t) => `> **${t || k[0].toUpperCase() + k.slice(1)}:**`)
    .replace(/^:::\s*$/gm, '')
    .replace(/\]\((\/[^)\s]*)\)/g, (_, p) => `](${ORIGIN}${p})`)
    .replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

const pages = walk(docs).map((file) => {
  const rel = relative(docs, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
  const dir = rel.includes('/') ? rel.split('/')[0] : '';
  const path = rel === 'index' ? '/' : rel.endsWith('/index') ? `/${rel.slice(0, -6)}/` : `/${rel}/`;
  const { fm, body } = frontMatter(readFileSync(file, 'utf8'));
  return { file, dir, rel, path, title: fm.title ?? rel, description: fm.description ?? '', text: plain(file, body) };
});
const rank = (p) => (p.rel === 'index' || p.rel.endsWith('/index') ? 0 : 1);
const ordered = SECTIONS.map(([name, dirs]) => ({
  name,
  pages: pages.filter((p) => dirs.includes(p.dir)).sort((a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path)),
}));

const summary = 'AWP is an open, declarative specification for defining, governing, executing and auditing agentic workflows. It is a specification, not a platform. The current API version is v1alpha1 (draft).';
let idx = `# Agentic Workflow Protocol (AWP)\n\n> ${summary}\n\nNotes for language models: the normative text is the v1alpha1 specification. AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements; it makes no compliance claims. The full documentation as one Markdown file is at ${ORIGIN}/llms-full.txt.\n`;
let full = `# Agentic Workflow Protocol (AWP): full documentation\n\n> ${summary}\n\nGenerated from ${ORIGIN} at build time. Index: ${ORIGIN}/llms.txt\n`;
let n = 0;
for (const s of ordered) {
  if (!s.pages.length) continue;
  idx += `\n## ${s.name}\n\n`;
  for (const p of s.pages) {
    idx += `- [${p.title}](${ORIGIN}${p.path})${p.description ? `: ${p.description}` : ''}\n`;
    full += `\n---\n\n# ${p.title}\n\nSource: ${ORIGIN}${p.path}\n\n${p.text}\n`;
    n++;
  }
}
writeFileSync(join(dist, 'llms.txt'), idx);
writeFileSync(join(dist, 'llms-full.txt'), full);
console.log(`build-llms: ${n} pages, llms.txt ${(idx.length / 1024).toFixed(1)} KB, llms-full.txt ${(full.length / 1024).toFixed(0)} KB`);
