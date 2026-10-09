import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const site = 'https://agenticworkflowprotocol.org';
const repo = 'https://github.com/open-agentix/agenticWorkflowProtocol.org';

// Wraps every table in a focusable, horizontally scrolling region so wide tables never widen the page.
function rehypeWrapTables() {
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type === 'element' && child.tagName === 'table') {
        return {
          type: 'element', tagName: 'div',
          properties: { className: ['table-wrap'], tabindex: 0, role: 'region', 'aria-label': 'Table, scrollable' },
          children: [child],
        };
      }
      walk(child);
      return child;
    });
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  markdown: { rehypePlugins: [rehypeWrapTables] },
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    starlight({
      title: 'AWP',
      description:
        'The Agentic Workflow Protocol (AWP) is an open, declarative specification for defining, governing, executing and auditing agentic workflows.',
      favicon: '/favicon.svg',
      // English only for now. Adding German later means adding a `de` entry here and a `src/content/docs/de/` tree.
      defaultLocale: 'root',
      locales: { root: { label: 'English', lang: 'en' } },
      social: [{ icon: 'github', label: 'GitHub', href: repo }],
      customCss: ['./src/styles/custom.css'],
      components: { SiteTitle: './src/components/SiteTitle.astro', Footer: './src/components/Footer.astro', Sidebar: './src/components/Sidebar.astro' },
      expressiveCode: { styleOverrides: { borderRadius: '0.75rem', codeFontSize: '0.875rem' } },
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      lastUpdated: false,
      head: [
        // Scrollable code blocks must be reachable by keyboard (WCAG 2.1.1, axe: scrollable-region-focusable).
        { tag: 'script', content: "document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('pre').forEach(function(p){p.setAttribute('tabindex','0')})})" },
        { tag: 'meta', attrs: { property: 'og:site_name', content: 'Agentic Workflow Protocol' } },
        { tag: 'meta', attrs: { property: 'og:image', content: `${site}/og.png` } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'AWP - Define. Govern. Execute.' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${site}/og.png` } },
        { tag: 'meta', attrs: { name: 'color-scheme', content: 'light dark' } },
      ],
      sidebar: [
        { label: 'Get started', items: [
          { label: 'Introduction', link: '/' },
          { label: 'Quickstart', slug: 'getting-started/quickstart' },
        ] },
        { label: 'Learn', items: [
          { label: 'Concepts', collapsed: true, autogenerate: { directory: 'concepts' } },
          { label: 'Governance', collapsed: true, autogenerate: { directory: 'governance' } },
          { label: 'Security', collapsed: true, autogenerate: { directory: 'security' } },
          { label: 'Integrations', collapsed: true, autogenerate: { directory: 'integrations' } },
        ] },
        { label: 'Specification', items: [
          { label: 'Overview', slug: 'specification' },
          { label: 'v1alpha1 (draft)', slug: 'specification/v1alpha1' },
          { label: 'Glossary', slug: 'specification/v1alpha1/glossary' },
          { label: 'Versioning', slug: 'specification/versioning' },
          { label: 'CLI output formats', slug: 'tooling/cli' },
          { label: 'Changelog', slug: 'specification/changelog' },
        ] },
        { label: 'Examples', autogenerate: { directory: 'examples' } },
        { label: 'Implementations', autogenerate: { directory: 'implementations' } },
        { label: 'Community', autogenerate: { directory: 'community' } },
      ],
    }),
  ],
});
