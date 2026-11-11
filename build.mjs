// Genera il sito statico multipagina (IT nella root, EN/DE/PL nelle sottocartelle).
// Uso: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_URL, LANGS, APARTMENTS, PAGES } from './src/data.mjs';
import { context, home, apartments, apartment, restaurant, valdisole, request } from './src/render.mjs';

const pages = [
  [PAGES.home, home],
  [PAGES.apartments, apartments],
  ...APARTMENTS.map((a) => [`${PAGES.apartments}${a.slug}/`, (c) => apartment(c, a)]),
  [PAGES.restaurant, restaurant],
  [PAGES.valdisole, valdisole],
  [PAGES.request, request],
];

const urls = [];
for (const lang of LANGS) {
  const t = JSON.parse(readFileSync(`src/i18n/${lang.code}.json`, 'utf8'));
  for (const [path, render] of pages) {
    const dir = (lang.path + path) || '.';
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), render(context(lang, t, path)));
    urls.push(SITE_URL + lang.path + path);
  }
  console.log(`✓ ${lang.code}: ${pages.length} pagine`);
}

writeFileSync(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);
console.log('✓ sitemap.xml, robots.txt');
