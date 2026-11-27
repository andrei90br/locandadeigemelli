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

// Cartina piste interattiva (pagina incorporata in val-di-sole/, non in sitemap)
const mappaTpl = readFileSync('src/mappa-piste/template.html', 'utf8');
const mappa = JSON.parse(readFileSync('src/mappa-piste/dati.json', 'utf8'));
for (const lang of LANGS) {
  const ui = mappa.ui[lang.code];
  const dir = lang.path + PAGES.valdisole + 'mappa-piste/';
  const up = '../'.repeat(dir.split('/').filter(Boolean).length);
  const punti = mappa.punti.map(({ t, ...g }) => ({ ...g, ...t[lang.code] }));
  let html = mappaTpl
    .replace('__PUNTI__', () => JSON.stringify(punti).replace(/</g, '\\u003c'))
    .replace('__TIPI__', () => JSON.stringify(ui.tipi))
    .replace('__IMG__', up + 'assets/img/val-di-sole/mappa-piste-skiarea-campiglio.webp')
    .replace('__LANG__', lang.code)
    .replace('__LOCALE__', ui.locale);
  html = html.replace(/__T_(\w+?)__/g, (_, k) => ui[k].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(dir + 'index.html', html);
}
console.log('✓ cartina piste interattiva');

writeFileSync(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);
console.log('✓ sitemap.xml, robots.txt');
