# AWP website

Static site for https://agenticworkflowprotocol.org, built with Astro Starlight.

```sh
cd site
npm ci               # install scripts are disabled by .npmrc (ignore-scripts=true)
npm run build        # sync -> astro build -> dist/ (+ Pagefind index, sitemap, CNAME)
npm test             # offline link check, size budget, axe-core accessibility check
npm run dev          # local development server
```

- **Content.** The specification, glossary, CLI formats, changelog and community files are rendered
  from the repository files by `scripts/sync-content.mjs` into git-ignored paths; they are not
  copied into Git. Example manifests on the site are imported from `spec/v1alpha1/examples/`.
  Hand-written pages are in `src/content/docs/`, the homepage is `src/content/docs/index.mdx`.
- **No external requests.** System fonts, no CDN, no analytics; search is a static Pagefind index.
  `check:links` and `check:a11y` fail if any page references or requests an external resource.
- **Node.** Astro 5.18.2 and Starlight 0.37.7 are pinned because Astro 6 and later require Node 22.
  The a11y check needs a system Chromium or Chrome (`CHROME_PATH`); no browser is downloaded.
- **Languages.** English only. Add a `de` locale in `astro.config.mjs` and a `src/content/docs/de/` tree.
- **Deploy.** `.github/workflows/pages.yml` (GitHub-hosted runners).
