import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const site = 'https://agenticworkflowprotocol.org';
const repo = 'https://github.com/open-agentix/agenticWorkflowProtocol.org';

export default defineConfig({
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
      components: { SiteTitle: './src/components/SiteTitle.astro', Footer: './src/components/Footer.astro', PageTitle: './src/components/PageTitle.astro' },
      pagination: false,
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
        { label: 'Specification', items: [
          { label: 'Overview', slug: 'specification' },
          { label: 'v1alpha1', slug: 'specification/v1alpha1' },
          { label: 'Glossary', slug: 'specification/v1alpha1/glossary' },
          { label: 'Versioning', slug: 'specification/versioning' },
          { label: 'Changelog', slug: 'specification/changelog' },
        ] },
        { label: 'Concepts', autogenerate: { directory: 'concepts' } },
        { label: 'Governance', autogenerate: { directory: 'governance' } },
        { label: 'Security', autogenerate: { directory: 'security' } },
        { label: 'Integrations', autogenerate: { directory: 'integrations' } },
        { label: 'Examples', autogenerate: { directory: 'examples' } },
        { label: 'Implementations', autogenerate: { directory: 'implementations' } },
        { label: 'Tooling', autogenerate: { directory: 'tooling' } },
        { label: 'Community', autogenerate: { directory: 'community' } },
      ],
    }),
  ],
});
