// Copies files that GitHub Pages needs next to the built site.
import { copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
copyFileSync(join(site, '..', 'CNAME'), join(site, 'dist', 'CNAME'));
writeFileSync(join(site, 'dist', '.nojekyll'), '');
console.log('postbuild: CNAME and .nojekyll written to dist/');
