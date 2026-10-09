// Renders the repository's normative files on the website without keeping a second copy in Git.
// Reads ../spec, ../docs/cli.md, ../CHANGELOG.md and the community files, writes generated
// pages to src/content/docs/** and example files to src/generated/. All outputs are git-ignored.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(siteRoot, '..');
const GH = 'https://github.com/open-agentix/agenticWorkflowProtocol.org';

const BANNER = 'Draft - v1alpha1. Fields and semantics may change before v1beta1.';

// repo path -> { out: content path (below src/content/docs), title, description, banner }
const pages = [
  { src: 'spec/v1alpha1/README.md', out: 'specification/v1alpha1/index.md', url: '/specification/v1alpha1/',
    title: 'Specification v1alpha1', description: 'Normative text of the Agentic Workflow Protocol, API version v1alpha1 (draft).', banner: true },
  { src: 'spec/v1alpha1/glossary.md', out: 'specification/v1alpha1/glossary.md', url: '/specification/v1alpha1/glossary/',
    title: 'Glossary (v1alpha1)', description: 'Terms used in the AWP v1alpha1 specification.', banner: true },
  { src: 'docs/cli.md', out: 'tooling/cli.md', url: '/tooling/cli/',
    title: 'CLI output formats', description: 'Output formats and exit codes of awp validate, lint, simulate, plan, run and audit (v1alpha1).', banner: true },
  { src: 'CHANGELOG.md', out: 'specification/changelog.md', url: '/specification/changelog/',
    title: 'Changelog', description: 'Changes to the specification, schemas, conformance suite and website.' },
  { src: 'CONTRIBUTING.md', out: 'community/contributing.md', url: '/community/contributing/',
    title: 'Contributing', description: 'How to contribute to the Agentic Workflow Protocol.' },
  { src: 'GOVERNANCE.md', out: 'community/governance.md', url: '/community/governance/',
    title: 'Project governance', description: 'How decisions about the AWP specification are made.' },
  { src: 'CODE_OF_CONDUCT.md', out: 'community/code-of-conduct.md', url: '/community/code-of-conduct/',
    title: 'Code of Conduct', description: 'Contributor Covenant Code of Conduct.' },
  { src: 'SECURITY.md', out: 'community/security-policy.md', url: '/community/security-policy/',
    title: 'Security policy', description: 'How to report security issues in the specification, schemas and tooling.' },
];
const urlBySrc = new Map(pages.map((p) => [p.src, p.url]));
urlBySrc.set('spec/README.md', '/specification/');
urlBySrc.set('spec/v1alpha1/examples', '/examples/');

function mapTarget(fromSrc, target) {
  if (/^([a-z][a-z0-9+.-]*:|#|\/|mailto:)/i.test(target)) return target;
  const [path, hash = ''] = target.split('#');
  const resolved = posix.normalize(posix.join(posix.dirname(fromSrc), path)).replace(/\/$/, '');
  const mapped = urlBySrc.get(resolved);
  if (mapped) return mapped + (hash ? `#${hash}` : '');
  const isDir = !/\.[a-z0-9]+$/i.test(resolved);
  return `${GH}/${isDir ? 'tree' : 'blob'}/main/${resolved}${hash ? `#${hash}` : ''}`;
}

function rewrite(src, text) {
  // Rewrite inline links [text](target) outside fenced code blocks.
  let fenced = false;
  return text.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; return line; }
    if (fenced) return line;
    return line.replace(/\]\(([^)\s]+)\)/g, (_, t) => `](${mapTarget(src, t)})`);
  }).join('\n');
}

const q = (s) => JSON.stringify(s);
const docsDir = join(siteRoot, 'src/content/docs');

for (const p of pages) {
  const out = join(docsDir, p.out);
  mkdirSync(dirname(out), { recursive: true });
  let body = readFileSync(join(repoRoot, p.src), 'utf8');
  body = body.replace(/^# .*\n+/, ''); // the page title comes from the front matter
  body = rewrite(p.src, body);
  const fm = ['---', `title: ${q(p.title)}`, `description: ${q(p.description)}`, `editUrl: ${q(`${GH}/edit/main/${p.src}`)}`];
  if (p.banner) fm.push('banner:', `  content: ${q(BANNER)}`);
  fm.push('---', '');
  writeFileSync(out, `${fm.join('\n')}\n${body}`);
}

// Example manifests, imported as raw text by the example pages.
const genDir = join(siteRoot, 'src/generated/examples');
rmSync(genDir, { recursive: true, force: true });
mkdirSync(genDir, { recursive: true });
const exDir = join(repoRoot, 'spec/v1alpha1/examples');
for (const f of readdirSync(exDir).filter((f) => f.endsWith('.yaml'))) copyFileSync(join(exDir, f), join(genDir, f));

// Machine-readable schema, served at its $id (https://agenticworkflowprotocol.org/schema/...).
mkdirSync(join(siteRoot, 'public/schema'), { recursive: true });
copyFileSync(join(repoRoot, 'schema/awp.v1alpha1.json'), join(siteRoot, 'public/schema/awp.v1alpha1.json'));
if (!existsSync(join(repoRoot, 'CNAME'))) throw new Error('CNAME missing in repository root');
console.log(`sync-content: ${pages.length} pages, ${readdirSync(genDir).length} example files`);
