// Genera le pagine statiche (IT nella root, EN/DE/PL nelle sottocartelle).
// Uso: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://locandadeigemelli.com/';

// Lingue: la prima è quella di default e va nella root.
const LANGS = [
  { code: 'it', path: '', label: 'IT' },
  { code: 'en', path: 'en/', label: 'EN' },
  { code: 'de', path: 'de/', label: 'DE' },
  { code: 'pl', path: 'pl/', label: 'PL' },
];

// Foto provvisorie prese da locandaelisa.it: da sostituire con file locali in assets/img/.
const SRC = 'https://locandaelisa.it/wp-content/uploads/';
const IMG = {
  hero: SRC + '2024/01/161-Locanda-Elisa-Dic-2023-jpg.webp',
  kitchen: SRC + '2022/06/bistrot.png',
  takeaway: SRC + '2022/06/Asporto-e-consegna-a-domicilio.jpg',
  garden: SRC + '2022/07/servizio-giardino-eventi.jpg',
  business: SRC + '2022/06/Business-Locanda-Elisa-2.jpg',
  stay: SRC + '2022/07/Golden-02.jpg',
};

// Appartamenti (dati dal sito attuale). rooms = chiave in apartments.rooms delle traduzioni.
// Le richieste di prenotazione arrivano via email tramite FormSubmit.
const REQUEST_EMAIL = 'lalocandadeigemelli@gmail.com';
const APARTMENTS = [
  { name: 'Jonagold', size: 46, beds: 4, rooms: 'dbl2', img: SRC + '2022/07/Jonagold-05.jpg' },
  { name: 'Pink Lady', size: 46, beds: 4, rooms: 'dblBunk', img: SRC + '2022/07/Pink-Lady-02-1.jpg' },
  { name: 'Renetta', size: 46, beds: 4, rooms: 'dblSofa', img: SRC + '2022/07/Renetta-02-1.jpg' },
  { name: 'Fuji', size: 46, beds: 4, rooms: 'dblBunk', img: SRC + '2023/02/b82f9da3-068b-4e83-b49d-6dd824b1772f-jpg.webp' },
  { name: 'Golden', size: 60, beds: 6, rooms: 'dblBunkSofa', img: SRC + '2022/07/Golden-02.jpg' },
  { name: 'Morgana', size: 60, beds: 7, rooms: 'dblBunkSingleSofa', img: SRC + '2022/07/Morgana-03.jpg' },
];

const template = readFileSync('src/template.html', 'utf8');

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const lookup = (obj, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

for (const lang of LANGS) {
  const t = JSON.parse(readFileSync(`src/i18n/${lang.code}.json`, 'utf8'));
  const base = lang.path ? '../' : '';

  const hreflang = [
    ...LANGS.map((l) => `  <link rel="alternate" hreflang="${l.code}" href="${SITE_URL}${l.path}">`),
    `  <link rel="alternate" hreflang="x-default" href="${SITE_URL}">`,
  ].join('\n');

  const langswitch = LANGS.map((l) =>
    l.code === lang.code
      ? `<span aria-current="true">${l.label}</span>`
      : `<a href="${base}${l.path}" hreflang="${l.code}" lang="${l.code}">${l.label}</a>`
  ).join('');

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': ['Restaurant', 'LodgingBusiness'],
    numberOfRooms: 6,
    petsAllowed: true,
    checkinTime: '14:00',
    checkoutTime: '11:00',
    name: 'Locanda dei Gemelli',
    url: SITE_URL + lang.path,
    image: IMG.hero,
    servesCuisine: ['Trentina', 'Italiana', 'Pizza'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Via Campiglio 59',
      postalCode: '38025',
      addressLocality: 'Dimaro Folgarida',
      addressRegion: 'TN',
      addressCountry: 'IT',
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '12:00', closes: '14:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '18:00', closes: '23:00' },
    ],
  });

  const a = t.apartments;
  const apartments = APARTMENTS.map((ap) => `
        <article class="apt">
          <img src="${ap.img}" alt="${escapeHtml(a.alt)} ${ap.name}" loading="lazy">
          <div class="apt-body">
            <h3>${ap.name}</h3>
            <p class="apt-meta">${ap.size} m² · ${escapeHtml(a.beds.replace('{n}', ap.beds))}</p>
            <p>${escapeHtml(a.rooms[ap.rooms])}</p>
            <a class="apt-link" href="#richiesta" data-apt="${ap.name}">${escapeHtml(a.book)} →</a>
          </div>
        </article>`).join('');
  const aptServices = a.services.map((x) => `<li>${escapeHtml(x)}</li>`).join('');

  const vars = {
    lang: lang.code,
    apartments,
    aptServices,
    formAction: `https://formsubmit.co/${REQUEST_EMAIL}`,
    formNext: `${SITE_URL}${lang.path}?richiesta=inviata`,
    aptOptions: APARTMENTS.map((ap) => `<option>${ap.name}</option>`).join(''),
    base,
    langpath: lang.path,
    canonical: SITE_URL + lang.path,
    hreflang,
    langswitch,
    jsonld,
    year: String(new Date().getFullYear()),
    img: IMG,
  };

  const html = template.replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
    if (key in vars && typeof vars[key] === 'string') return vars[key];
    const fromVars = lookup(vars, key);
    if (fromVars !== undefined) return escapeHtml(fromVars);
    const value = lookup(t, key);
    if (value === undefined) throw new Error(`Chiave mancante "${key}" in ${lang.code}.json`);
    return escapeHtml(value);
  });

  const dir = lang.path || '.';
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  console.log(`✓ ${join(dir, 'index.html')}`);
}

writeFileSync(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${LANGS.map(
    (l) => `  <url><loc>${SITE_URL}${l.path}</loc></url>`
  ).join('\n')}\n</urlset>\n`
);
writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);
console.log('✓ sitemap.xml, robots.txt');
