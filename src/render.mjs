// Layout e pagine del sito. Ogni funzione riceve il contesto della lingua e restituisce HTML.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { LEGAL, SITE_URL, REQUEST_EMAIL, FORM_ACTION, WHATSAPP, MAPS_URL, DIRECTIONS_URL, GOOGLE_PLACE_URL, MAP_EMBED_URL, LANGS, IMG, APARTMENTS, PAGES } from './data.mjs';

export const e = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
// Versione dei file per evitare che il browser usi CSS/JS vecchi dalla cache.
const ver = (f) => createHash('md5').update(readFileSync(f)).digest('hex').slice(0, 8);
const isExternal = (src) => /^https?:/.test(src);

// Contesto: lingua, profondità della pagina e funzioni per i link.
export function context(lang, t, pagePath) {
  const depth = (lang.path + pagePath).split('/').filter(Boolean).length;
  const root = '../'.repeat(depth);
  const href = (path) => root + lang.path + path || './';
  const asset = (src) => (isExternal(src) ? src : root + src);
  // Nei var(--bg) l'url() è risolto rispetto a assets/css/style.css, non alla pagina.
  const bg = (src) => (isExternal(src) ? src : '../../' + src);
  return { lang, t, pagePath, root, href, asset, bg };
}

const aptHref = (c, a) => c.href(`${PAGES.apartments}${a.slug}/`);
const requestHref = (c, a) => c.href(PAGES.request) + (a ? `?apt=${encodeURIComponent(a.name)}` : '');
const waHref = (c) => `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(c.t.restaurant.book.waText)}`;
// Attributi con i messaggi d'errore dei moduli (letti da main.js).
const formMsgs = (c) => Object.entries(c.t.common.form).map(([k, v]) => `data-msg-${k}="${e(v)}"`).join(' ');

function header(c) {
  const { t, href } = c;
  // CTA principale: sulla pagina ristorante prenota un tavolo, nella scheda appartamento lo preseleziona.
  const apt = APARTMENTS.find((a) => c.pagePath === `${PAGES.apartments}${a.slug}/`);
  const cta = c.pagePath === PAGES.restaurant ? ['#tavolo', t.nav.table] : [requestHref(c, apt), t.nav.request];
  const nav = [
    ['apartments', PAGES.apartments],
    ['restaurant', PAGES.restaurant],
    ['valdisole', PAGES.valdisole],
  ];
  const links = nav
    .map(([k, p]) => `<a href="${href(p)}"${c.pagePath.startsWith(p) && p ? ' aria-current="page"' : ''}>${e(t.nav[k])}</a>`)
    .join('\n          ');
  return `
  <a class="skip" href="#main">${e(t.nav.skip)}</a>
  <header class="site-header" data-header>
    <div class="wrap header-inner">
      <a class="brand" href="${href('')}"><img src="${c.root}assets/img/logo.svg" alt="La Locanda dei Gemelli" width="539" height="568"></a>
      <a class="btn btn-accent btn-sm header-cta" href="${cta[0]}">${e(cta[1])}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="${e(t.nav.open)}" data-label-open="${e(t.nav.open)}" data-label-close="${e(t.nav.close)}" data-menu-toggle><span></span><span></span></button>
      <nav class="nav" id="site-nav" aria-label="${e(t.nav.label)}" data-nav>
          ${links}
          <a href="${href('')}#dove">${e(t.nav.where)}</a>
        <div class="langs" role="group" aria-label="${e(t.nav.languages)}">${langSwitch(c)}</div>
        <a class="btn btn-accent nav-cta" href="${cta[0]}">${e(cta[1])}</a>
      </nav>
    </div>
  </header>`;
}

function langSwitch(c) {
  return LANGS.map((l) =>
    l.code === c.lang.code
      ? `<span aria-current="true">${l.label}</span>`
      : `<a href="${c.root}${l.path}${c.pagePath}" hreflang="${l.code}" lang="${l.code}">${l.label}</a>`
  ).join('');
}

function footer(c) {
  const { t, href } = c;
  return `
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div class="footer-brand">
        <img src="${c.root}assets/img/logo.svg" alt="La Locanda dei Gemelli" width="539" height="568" loading="lazy">
        <p>${e(t.common.address)}</p>
        <p class="footer-maps"><a href="${MAPS_URL}" target="_blank" rel="noopener">${e(t.common.map)}</a> · <a href="${DIRECTIONS_URL}" target="_blank" rel="noopener">${e(t.common.directions)}</a></p>
        <p class="footer-season">${e(t.common.season)}</p>
      </div>
      <div>
        <p class="footer-title">${e(t.footer.stay)}</p>
        <ul class="footer-links">
          <li><a href="${href(PAGES.apartments)}">${e(t.nav.apartments)}</a></li>
          ${APARTMENTS.map((a) => `<li><a href="${aptHref(c, a)}">${e(a.name)}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <p class="footer-title">${e(t.footer.dine)}</p>
        <ul class="footer-links">
          <li><a href="${href(PAGES.restaurant)}">${e(t.nav.restaurant)}</a></li>
          <li><a href="${href(PAGES.restaurant)}#tavolo">${e(t.footer.table)}</a></li>
          <li><a href="${waHref(c)}" target="_blank" rel="noopener">${e(t.footer.whatsapp)}: ${WHATSAPP.display}</a></li>
        </ul>
        <p class="footer-small">${e(t.footer.hours)}</p>
        <p class="footer-title">${e(t.footer.discover)}</p>
        <ul class="footer-links">
          <li><a href="${href(PAGES.valdisole)}">${e(t.nav.valdisole)}</a></li>
          <li><a href="${href(PAGES.request)}">${e(t.nav.request)}</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-title">${e(t.nav.languages)}</p>
        <div class="langs" role="group" aria-label="${e(t.nav.languages)}">${langSwitch(c)}</div>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <p class="footer-legal">© 2026 ${e(LEGAL.company)} · ${e(t.footer.legal)} ${e(LEGAL.address)} · ${e(t.footer.vat)} ${LEGAL.vat} · ${t.footer.rea} ${LEGAL.rea} · ${t.footer.pec} <a href="mailto:${LEGAL.pec}">${LEGAL.pec}</a> · <a href="${href(PAGES.privacy)}">${e(t.footer.privacy)}</a></p>
    </div>
  </footer>`;
}

// Content Security Policy (GitHub Pages non permette header: va nel meta). Le foto di locandaelisa.it sono provvisorie.
const CSP = [
  "default-src 'self'",
  "img-src 'self' data: https://locandaelisa.it",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self'",
  "font-src 'self'",
  "frame-src 'self' https://maps.google.com https://www.google.com",
  "form-action 'self' https://formsubmit.co",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

export function layout(c, { title, description, og = 'assets/img/og/home.jpg', hero, body, jsonld, crumbs }) {
  const canonical = SITE_URL + c.lang.path + c.pagePath;
  const ld = [jsonld, crumbs && breadcrumbs(c, crumbs)].filter(Boolean);
  const alternates = LANGS.map((l) => `  <link rel="alternate" hreflang="${l.code}" href="${SITE_URL}${l.path}${c.pagePath}">`).join('\n');
  return `<!doctype html>
<html lang="${c.lang.code}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
${process.env.PREVIEW ? '  <meta name="robots" content="noindex, nofollow">\n' : ''}  <title>${e(title)}</title>
  <meta name="description" content="${e(description)}">
  <link rel="canonical" href="${canonical}">
${alternates}
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${c.pagePath}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="La Locanda dei Gemelli">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:image" content="${SITE_URL}${og}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${c.t.locale}">
${LANGS.filter((l) => l.code !== c.lang.code).map((l) => `  <meta property="og:locale:alternate" content="${JSON.parse(readFileSync(`src/i18n/${l.code}.json`, 'utf8')).locale}">`).join('\n')}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#000000">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="Content-Security-Policy" content="${CSP}">
  <link rel="icon" href="${c.root}favicon.ico" sizes="32x32">
  <link rel="icon" type="image/png" href="${c.root}assets/img/favicon.png" sizes="512x512">
  <link rel="manifest" href="${c.root}site.webmanifest">
  <link rel="apple-touch-icon" href="${c.root}assets/img/apple-touch-icon.png">
${hero ? `  <link rel="preload" as="image" href="${c.asset(hero)}" fetchpriority="high">\n` : ''}  <link rel="preload" as="font" type="font/woff2" href="${c.root}assets/fonts/inter-latin-400-normal.woff2" crossorigin>
  <link rel="stylesheet" href="${c.root}assets/css/style.css?v=${ver('assets/css/style.css')}">
${ld.map((j) => `  <script type="application/ld+json">${JSON.stringify(j)}</script>\n`).join('')}</head>
<body>${header(c)}
  <main id="main">${body}
  </main>${footer(c)}
  <script src="${c.root}assets/js/main.js?v=${ver('assets/js/main.js')}" defer></script>
</body>
</html>
`;
}

// ---------- blocchi riutilizzabili ----------

function pageHero(c, h, image, extra = '') {
  return `
    <section class="hero hero-page" style="--bg: url('${c.bg(image)}')">
      <div class="wrap hero-inner">
        ${h.eyebrow ? `<p class="eyebrow">${e(h.eyebrow)}</p>` : ''}
        <h1>${e(h.title)}</h1>
        <p class="lead">${e(h.lead)}</p>${extra}
      </div>
    </section>`;
}

function bookingBar(c) {
  const b = c.t.booking;
  const adults = [1, 2, 3, 4, 5, 6, 7].map((n) => `<option${n === 2 ? ' selected' : ''}>${n}</option>`).join('');
  const kids = [0, 1, 2, 3, 4, 5, 6].map((n) => `<option>${n}</option>`).join('');
  return `
    <form class="booking-bar wrap" action="${c.href(PAGES.request)}" method="get" aria-label="${e(b.label)}" novalidate ${formMsgs(c)} data-booking-bar data-validate>
      <label class="bb-field"><span>${e(b.arrival)}</span><input type="date" name="arrivo" data-date data-arrival required></label>
      <label class="bb-field"><span>${e(b.departure)}</span><input type="date" name="partenza" data-date data-departure required></label>
      <label class="bb-field bb-small"><span>${e(b.adults)}</span><select name="adulti">${adults}</select></label>
      <label class="bb-field bb-small"><span>${e(b.children)}</span><select name="bambini">${kids}</select></label>
      <label class="bb-field bb-apt"><span>${e(c.t.request.form.apartment)}</span><select name="apt"><option value="">${e(c.t.request.form.any)}</option>${APARTMENTS.map((a) => `<option>${e(a.name)}</option>`).join('')}</select></label>
      <button class="btn btn-accent bb-submit" type="submit">${e(b.submit)}</button>
    </form>`;
}

function aptCard(c, a) {
  const t = c.t;
  return `
        <article class="apt-card">
          <a class="apt-media" href="${aptHref(c, a)}"><img src="${c.asset(a.photos[0].thumb)}" alt="${e(t.apartment.eyebrow)} ${e(a.name)}" loading="lazy"></a>
          <div class="apt-body">
            <h3><a href="${aptHref(c, a)}">${e(a.name)}</a></h3>
            <p class="apt-meta">${a.size} m² · ${e(fill(t.common.beds, { n: a.beds }))}</p>
            <p>${e(t.apartments.rooms[a.rooms])}</p>
            <div class="apt-actions">
              <a class="btn btn-accent btn-sm" href="${requestHref(c, a)}">${e(t.common.request)}</a>
              <a class="btn btn-outline btn-sm" href="${aptHref(c, a)}">${e(t.common.explore)}</a>
            </div>
          </div>
        </article>`;
}

function feature(c, f, href, image, reverse = false) {
  return `
    <section class="feature${reverse ? ' feature-reverse' : ''}">
      <div class="feature-media"><img src="${c.asset(image)}" alt="" loading="lazy"></div>
      <div class="feature-body">
        <p class="eyebrow">${e(f.eyebrow)}</p>
        <h2>${e(f.title)}</h2>
        <p>${e(f.text)}</p>
        <a class="link-arrow" href="${href}">${e(f.cta)}</a>
      </div>
    </section>`;
}

function hoursBox(c) {
  const t = c.t.common;
  return `
          <div class="hours">
            <h3>${e(t.hoursTitle)}</h3>
            <dl>
              <div><dt>${e(t.restaurant)}</dt><dd>12:00 – 14:30<br>17:30 – 22:00</dd></div>
              <div><dt>${e(t.pizzeria)}</dt><dd>17:30 – 22:30</dd></div>
              <div class="closed"><dt>${e(t.closedDay)}</dt><dd>${e(t.closed)}</dd></div>
            </dl>
            <p class="hours-season">${e(t.season)}</p>
          </div>`;
}

// Mappa Google caricata solo al clic (data-map in main.js).
function mapEmbed(c) {
  const m = c.t.common.mapEmbed;
  return `
      <div class="wrap">
        <div class="map-embed" data-map="${MAP_EMBED_URL}&hl=${c.lang.code}" data-title="${e(m.title)}">
          <div class="map-consent">
            <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
            <p class="map-consent-title">${e(m.title)}</p>
            <button type="button" class="btn btn-outline" data-map-load>${e(m.button)}</button>
            <p class="map-consent-note">${e(m.note)}</p>
          </div>
        </div>
      </div>`;
}

// Briciole di pane per i dati strutturati: [[nome, percorso], ...] dopo la home.
function breadcrumbs(c, crumbs) {
  const items = [['La Locanda dei Gemelli', ''], ...crumbs];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE_URL + c.lang.path + path })),
  };
}

const BUSINESS_ID = SITE_URL + '#locanda';

// Orari solo nelle due stagioni (dicembre–aprile, giugno–ottobre): la stagione in corso e la successiva,
// calcolate alla data della build. Chiuso il martedì; pizzeria fino alle 22:30.
function openingHours(now = new Date()) {
  const y = now.getUTCFullYear();
  const seasons = [
    [`${y - 1}-12-01`, `${y}-04-30`], [`${y}-06-01`, `${y}-10-31`],
    [`${y}-12-01`, `${y + 1}-04-30`], [`${y + 1}-06-01`, `${y + 1}-10-31`],
  ].filter(([, end]) => end >= now.toISOString().slice(0, 10)).slice(0, 2);
  const days = ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return seasons.flatMap(([validFrom, validThrough]) => [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: '12:00', closes: '14:30', validFrom, validThrough },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: '17:30', closes: '22:30', validFrom, validThrough },
  ]);
}

function baseJsonLd(c) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LodgingBusiness', 'Restaurant'],
    '@id': BUSINESS_ID,
    description: c.t.home.meta.description,
    inLanguage: c.lang.code,
    logo: SITE_URL + 'assets/img/logo-512.png',
    acceptsReservations: true,
    amenityFeature: ['Wi-Fi', 'Restaurant', 'Pizzeria'].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    name: 'La Locanda dei Gemelli',
    alternateName: 'Locanda dei Gemelli',
    legalName: LEGAL.company,
    vatID: 'IT' + LEGAL.vat,
    taxID: LEGAL.vat,
    email: REQUEST_EMAIL,
    url: SITE_URL + c.lang.path,
    image: [SITE_URL + 'assets/img/og/home.jpg', SITE_URL + 'assets/img/og/ristorante.jpg'],
    servesCuisine: ['Trentina', 'Italiana', 'Pizza'],
    numberOfRooms: APARTMENTS.length,
    petsAllowed: true,
    checkinTime: '14:00',
    checkoutTime: '11:00',
    hasMap: GOOGLE_PLACE_URL,
    sameAs: [GOOGLE_PLACE_URL],
    address: { '@type': 'PostalAddress', streetAddress: 'Via Campiglio 59', postalCode: '38025', addressLocality: 'Dimaro Folgarida', addressRegion: 'TN', addressCountry: 'IT' },
    openingHoursSpecification: openingHours(),
  };
}

// ---------- pagine ----------

export function home(c) {
  const t = c.t, h = t.home;
  const body = `
    <section class="hero hero-home" style="--bg: url('${c.bg(IMG.hero)}')">
      <div class="wrap hero-notice"><p class="notice">${e(h.notice)}</p></div>
      <div class="wrap hero-inner">
        <p class="eyebrow">${e(h.hero.eyebrow)}</p>
        <h1>${e(h.hero.title)}</h1>
        <p class="lead">${e(h.hero.lead)}</p>
      </div>
    </section>
    ${bookingBar(c)}

    <section class="proof">
      <ul class="wrap proof-list">
        ${h.proof.map((p) => `<li><strong>${e(p.title)}</strong><span>${e(p.text)}</span></li>`).join('\n        ')}
      </ul>
    </section>

    <section class="section intro">
      <div class="wrap narrow center">
        <p class="eyebrow">${e(h.intro.eyebrow)}</p>
        <h2>${e(h.intro.title)}</h2>
        <p class="lead">${e(h.intro.text)}</p>
      </div>
    </section>
${feature(c, h.stay, c.href(PAGES.apartments), IMG.stay)}
${feature(c, h.dine, c.href(PAGES.restaurant), IMG.restaurant, true)}

    <section class="section">
      <div class="wrap section-head">
        <div>
          <p class="eyebrow">${e(h.stay.eyebrow)}</p>
          <h2>${e(t.apartments.intro.title)}</h2>
        </div>
        <a class="link-arrow" href="${c.href(PAGES.apartments)}">${e(t.common.allApartments)}</a>
      </div>
      <div class="wrap apt-grid">${APARTMENTS.map((a) => aptCard(c, a)).join('')}
      </div>
    </section>

    <section class="band">
      <div class="wrap band-inner">
        <div>
          <p class="eyebrow">${e(h.exp.eyebrow)}</p>
          <h2>${e(h.exp.title)}</h2>
        </div>
        <div>
          <p>${e(h.exp.text)}</p>
          <a class="btn btn-light" href="${c.href(PAGES.valdisole)}">${e(h.exp.cta)}</a>
        </div>
      </div>
    </section>

    <section class="section where" id="dove">
      <div class="wrap where-grid">
        <div>
          <p class="eyebrow">${e(h.where.eyebrow)}</p>
          <h2>${e(h.where.title)}</h2>
          <p>${e(h.where.text)}</p>
          <address>${e(t.common.address)}</address>
          <div class="actions">
            <a class="btn btn-outline" href="${DIRECTIONS_URL}" target="_blank" rel="noopener">${e(t.common.directions)}</a>
            <a class="link-arrow" href="${MAPS_URL}" target="_blank" rel="noopener">${e(t.common.map)}</a>
          </div>
        </div>${hoursBox(c)}
      </div>${mapEmbed(c)}
    </section>

    <section class="cta-final">
      <div class="wrap narrow center">
        <h2>${e(h.final.title)}</h2>
        <p class="lead">${e(h.final.text)}</p>
        <a class="btn btn-accent" href="${c.href(PAGES.request)}">${e(h.final.cta)}</a>
      </div>
    </section>`;
  return layout(c, { title: h.meta.title, description: h.meta.description, hero: IMG.hero, body, jsonld: baseJsonLd(c) });
}

export function apartments(c) {
  const t = c.t, p = t.apartments;
  const body = `${pageHero(c, { ...p.hero, eyebrow: '' }, IMG.stay)}
    ${bookingBar(c)}

    <section class="section">
      <div class="wrap section-head">
        <div>
          <h2>${e(p.intro.title)}</h2>
          <p class="lead">${e(p.intro.text)}</p>
        </div>
      </div>
      <div class="wrap apt-grid">${APARTMENTS.map((a) => aptCard(c, a)).join('')}
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap info-grid">
        <div>
          <h2>${e(p.servicesTitle)}</h2>
          <ul class="checklist cols">${p.services.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
        </div>
        <div class="info-card">
          <h3>${e(p.goodTitle)}</h3>
          <ul class="checklist">${p.good.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
          <p class="hours-season">${e(t.common.season)}</p>
          <a class="btn btn-accent" href="${c.href(PAGES.request)}">${e(t.nav.request)}</a>
        </div>
      </div>
    </section>`;
  return layout(c, { title: p.meta.title, description: p.meta.description, hero: IMG.stay, body, jsonld: baseJsonLd(c), crumbs: [[t.nav.apartments, PAGES.apartments]] });
}

export function apartment(c, a) {
  const t = c.t, p = t.apartment;
  const rooms = t.apartments.rooms[a.rooms];
  const vars = { name: a.name, size: a.size, beds: a.beds, rooms };
  const others = APARTMENTS.filter((o) => o !== a);
  const body = `
    <section class="hero hero-page" style="--bg: url('${c.bg(a.photos[0].src)}')">
      <div class="wrap hero-inner">
        <p class="eyebrow">${e(p.eyebrow)}</p>
        <h1>${e(a.name)}</h1>
        <p class="lead">${a.size} m² · ${e(fill(t.common.beds, { n: a.beds }))}</p>
      </div>
    </section>

    <section class="section">
      <div class="wrap apt-detail">
        <div>
          <p class="lead">${e(fill(p.text, vars))}</p>
          <h2 class="h3">${e(t.apartments.servicesTitle)}</h2>
          <ul class="checklist cols">${t.apartments.services.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
        </div>
        <aside class="info-card">
          <h3>${e(p.factsTitle)}</h3>
          <dl class="facts">
            <div><dt>${e(p.size)}</dt><dd>${a.size} m²</dd></div>
            <div><dt>${e(p.beds)}</dt><dd>${a.beds}</dd></div>
            <div><dt>${e(p.rooms)}</dt><dd>${e(rooms)}</dd></div>
          </dl>
          <ul class="checklist">${t.apartments.good.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
          <a class="btn btn-accent btn-block" href="${requestHref(c, a)}">${e(p.cta)}</a>
        </aside>
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap">
        <h2 class="h3">${e(p.gallery)}</h2>
        <div class="gallery" data-gallery>
          ${a.photos.map((ph, i) => `<a href="${c.asset(ph.src)}" class="gallery-item" data-lightbox><img src="${c.asset(ph.thumb)}" alt="${e(a.name)} · ${e(p.roomNames[ph.room] || fill(p.photo, { n: i + 1, name: a.name }))}" loading="lazy" decoding="async"></a>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap section-head">
        <h2>${e(p.others)}</h2>
        <a class="link-arrow" href="${c.href(PAGES.apartments)}">${e(t.common.allApartments)}</a>
      </div>
      <div class="wrap apt-grid">${others.slice(0, 3).map((o) => aptCard(c, o)).join('')}
      </div>
    </section>
    <dialog class="lightbox" aria-label="${e(p.gallery)}" data-img-error="${e(t.common.form.imgError)}" data-lightbox-dialog>
      <figure><img alt=""><figcaption data-caption></figcaption></figure>
      <button type="button" class="lb-close" aria-label="${e(p.lbClose)}" data-close>×</button>
      <button type="button" class="lb-nav lb-prev" aria-label="${e(p.lbPrev)}" data-prev>‹</button>
      <button type="button" class="lb-nav lb-next" aria-label="${e(p.lbNext)}" data-next>›</button>
    </dialog>`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Apartment',
    name: `${p.eyebrow} ${a.name}`,
    description: fill(p.metaDescription, vars),
    url: SITE_URL + c.lang.path + PAGES.apartments + a.slug + '/',
    image: a.photos.slice(0, 6).map((ph) => SITE_URL + ph.src),
    floorSize: { '@type': 'QuantitativeValue', value: a.size, unitCode: 'MTK' },
    occupancy: { '@type': 'QuantitativeValue', maxValue: a.beds },
    petsAllowed: true,
    amenityFeature: t.apartments.services.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    containedInPlace: { '@id': BUSINESS_ID },
  };
  return layout(c, { title: fill(p.metaTitle, vars), description: fill(p.metaDescription, vars), og: `assets/img/og/${a.slug}.jpg`, hero: a.photos[0].src, body, jsonld, crumbs: [[t.nav.apartments, PAGES.apartments], [a.name, PAGES.apartments + a.slug + '/']] });
}

export function restaurant(c) {
  const t = c.t, r = t.restaurant;
  const serviceImgs = [IMG.takeaway, IMG.garden, IMG.products];
  const body = `${pageHero(c, r.hero, IMG.restaurant)}

    <section class="section">
      <div class="wrap narrow center">
        <p class="eyebrow">${e(r.manifesto.eyebrow)}</p>
        <h2>${e(r.manifesto.title)}</h2>
        <p class="lead">${e(r.manifesto.text)}</p>
      </div>
      <div class="wrap pillars">
        ${r.pillars.map((p, i) => `<article><span class="num">0${i + 1}</span><h3>${e(p.title)}</h3><p>${e(p.text)}</p></article>`).join('\n        ')}
      </div>
    </section>

    <section class="feature">
      <div class="feature-media"><img src="${c.asset(IMG.restaurant)}" alt="" loading="lazy"></div>
      <div class="feature-body">
        <p class="eyebrow">${e(r.kitchen.eyebrow)}</p>
        <h2>${e(r.kitchen.title)}</h2>
        <p>${e(r.kitchen.text)}</p>
        <p class="feature-note">${e(r.kitchen.hours)}</p>
      </div>
    </section>

    <section class="feature feature-reverse">
      <div class="feature-media feature-illustration"><img src="${c.asset(IMG.illustration)}" alt="" loading="lazy"></div>
      <div class="feature-body">
        <p class="eyebrow">${e(r.pizza.eyebrow)}</p>
        <h2>${e(r.pizza.title)}</h2>
        <p>${e(r.pizza.text)}</p>
        <p class="feature-note">${e(r.pizza.hours)}</p>
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap narrow center">
        <p class="eyebrow">${e(r.services.eyebrow)}</p>
        <h2>${e(r.services.title)}</h2>
      </div>
      <div class="wrap card-grid">
        ${r.services.items.map((s, i) => `<article class="card"><img src="${c.asset(serviceImgs[i])}" alt="" loading="lazy"><div class="card-body"><h3>${e(s.title)}</h3><p>${e(s.text)}</p></div></article>`).join('\n        ')}
      </div>
    </section>

    <section class="quote"><div class="wrap narrow"><p>${e(r.quote)}</p></div></section>

    <section class="section where">
      <div class="wrap where-grid">
        <div>
          <p class="eyebrow">${e(r.book.eyebrow)}</p>
          <h2>${e(r.book.title)}</h2>
          <p>${e(r.book.text)}</p>
          <div class="actions">
            <a class="btn btn-accent" href="#tavolo">${e(r.book.form)}</a>
            <a class="btn btn-outline" href="${waHref(c)}" target="_blank" rel="noopener">${e(r.book.whatsapp)}</a>
          </div>
          <p class="wa-number">WhatsApp: <a href="${waHref(c)}" target="_blank" rel="noopener">${WHATSAPP.display}</a></p>
          <address>${e(t.common.address)}</address>
          <a class="link-arrow" href="${DIRECTIONS_URL}" target="_blank" rel="noopener">${e(t.common.directions)}</a>
          <a class="link-arrow" href="${MAPS_URL}" target="_blank" rel="noopener">${e(t.common.map)}</a>
        </div>${hoursBox(c)}
      </div>${mapEmbed(c)}
    </section>
${tableForm(c)}`;
  return layout(c, { title: r.meta.title, description: r.meta.description, og: 'assets/img/og/ristorante.jpg', hero: IMG.restaurant, body, jsonld: baseJsonLd(c), crumbs: [[t.nav.restaurant, PAGES.restaurant]] });
}

// Modulo di richiesta tavolo (pagina ristorante), inviato con FormSubmit come quello degli appartamenti.
function tableForm(c) {
  const t = c.t, f = t.restaurant.table, q = t.request.form;
  const slot = (from, to) => {
    const out = [];
    for (let m = from; m <= to; m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    return out.map((h) => `<option>${h}</option>`).join('');
  };
  const people = [...Array.from({ length: 12 }, (_, i) => `<option>${i + 1}</option>`), `<option value="Più di 12">${e(f.more)}</option>`].join('');
  const privacy = e(q.privacy).replace(e(q.privacyLink), `<a href="${c.href(PAGES.privacy)}" target="_blank" rel="noopener">${e(q.privacyLink)}</a>`);
  return `
    <section class="section section-alt" id="tavolo">
      <div class="wrap request-grid">
        <div>
          <p class="eyebrow">${e(f.eyebrow)}</p>
          <h2>${e(f.title)}</h2>
          <p class="lead">${e(f.lead)}</p>
          <div class="request-sent" role="status" tabindex="-1" hidden data-request-sent><p>${e(f.sent)}</p></div>
          <form class="request-form" action="${FORM_ACTION}" method="POST" novalidate ${formMsgs(c)} data-request-form data-validate data-closed-day="2" data-sent-param="tavolo">
            <input type="hidden" name="_subject" value="${e(f.subject)}">
            <input type="hidden" name="_next" value="${SITE_URL}${c.lang.path}${PAGES.restaurant}?tavolo=inviato#tavolo">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="Richiesta" value="Tavolo al ristorante">
            <input type="hidden" name="Data" data-day-input>
            <input type="hidden" name="Lingua" value="${c.lang.code}">
            <div class="hp" aria-hidden="true"><label>Lascia vuoto <input type="text" name="_honey" tabindex="-1" autocomplete="off"></label></div>
            <p class="rf-head"><span>${e(q.required)}</span></p>
            <div class="rf-group">
              <input type="text" name="Nome" placeholder="${e(f.name)} *" aria-label="${e(f.name)}" required autocomplete="name">
              <input type="tel" name="Telefono" placeholder="${e(f.phone)} *" aria-label="${e(f.phone)}" required autocomplete="tel">
              <input type="email" name="email" placeholder="${e(f.email)}" aria-label="${e(f.email)}" autocomplete="email">
              <select name="Persone" aria-label="${e(f.people)}" required><option value="" disabled selected>${e(f.people)} *</option>${people}</select>
              <label class="rf-field"><span>${e(f.date)} *</span><input type="date" name="Giorno" required data-date data-single-date></label>
              <label class="rf-field"><span>${e(f.time)} *</span><select name="Ora" required><option value="" disabled selected>${e(f.time)}</option><optgroup label="${e(f.lunch)}">${slot(12 * 60, 14 * 60)}</optgroup><optgroup label="${e(f.dinner)}">${slot(17 * 60 + 30, 21 * 60 + 30)}</optgroup></select></label>
            </div>
            <div class="rf-group rf-single">
              <textarea name="Note" rows="3" placeholder="${e(f.notes)}" aria-label="${e(f.notes)}"></textarea>
              <label class="rf-check"><input type="checkbox" name="Privacy" value="ok" required> <span>${privacy}</span></label>
              <button class="btn btn-accent" type="submit">${e(f.submit)}</button>
            </div>
          </form>
        </div>
        <aside class="info-card">
          <h3>${e(f.orWhatsapp)}</h3>
          <p>${e(t.restaurant.book.text)}</p>
          <a class="btn btn-outline btn-block" href="${waHref(c)}" target="_blank" rel="noopener">${e(t.restaurant.book.whatsapp)}</a>
          <p class="wa-number">${WHATSAPP.display}</p>
        </aside>
      </div>
    </section>`;
}

export function valdisole(c) {
  const t = c.t, v = t.valdisole;
  const season = (s, cls) => `
    <section class="section ${cls}">
      <div class="wrap section-head">
        <div>
          <p class="eyebrow">${e(s.eyebrow)}</p>
          <h2>${e(s.title)}</h2>
        </div>
      </div>
      <div class="wrap exp-grid">
        ${s.items.map((x, i) => `<article class="exp-card"><span class="num">0${i + 1}</span><h3>${e(x.title)}</h3><p>${e(x.text)}</p></article>`).join('\n        ')}
      </div>
    </section>`;
  const w = v.winter;
  const winter = `
    <section class="section">
      <div class="wrap winter-intro">
        <div>
          <p class="eyebrow">${e(w.eyebrow)}</p>
          <h2>${e(w.title)}</h2>
          <p class="lead">${e(w.lead)}</p>
        </div>
        <img src="${c.asset(IMG.winterSlope)}" alt="${e(w.photoAlt)}" width="924" height="690" loading="lazy">
      </div>
      <div class="wrap">
        <p class="eyebrow">${e(w.ski.eyebrow)}</p>
        <h3 class="sub-title">${e(w.ski.title)}</h3>
        <div class="ski-grid">
          ${w.ski.items.map((x, i) => `<article class="exp-card ski-card"><span class="num">0${i + 1}</span><h4 class="h3">${e(x.title)}</h4><p>${e(x.text)}</p><ul class="ski-facts">${x.facts.map((f) => `<li>${e(f)}</li>`).join('')}</ul></article>`).join('\n          ')}
        </div>
        <p class="ski-facts-note">${e(w.ski.note)}</p>
        <div class="tip-grid">
          ${w.tips.map((x) => `<article class="tip"><h3>${e(x.title)}</h3><p>${e(x.text)}</p></article>`).join('\n          ')}
        </div>
      </div>
    </section>
    <section class="section ski-map">
      <div class="wrap">
        <div class="ski-map-head">
          <p class="eyebrow">${e(w.map.eyebrow)}</p>
          <h2>${e(w.map.title)}</h2>
          <p class="lead">${e(w.map.text)}</p>
        </div>
        <figure class="ski-map-figure">
          <iframe src="mappa-piste/?v=${ver('src/mappa-piste/template.html')}${ver('src/mappa-piste/dati.json')}" title="${e(w.map.alt)}" loading="lazy"></iframe>
          <figcaption><a href="mappa-piste/?v=${ver('src/mappa-piste/template.html')}${ver('src/mappa-piste/dati.json')}" target="_blank" rel="noopener">${e(w.map.fullscreen)}</a> · ${e(w.map.caption)}</figcaption>
        </figure>
      </div>
    </section>
${season(w.beyond, 'section-alt')}`;
  const body = `${pageHero(c, v.hero, IMG.winterHero)}
${winter}
${season(v.summer, '')}
    <p class="wrap photo-credit">${v.photos.credit}</p>

    <section class="cta-final">
      <div class="wrap narrow center">
        <h2>${e(v.base.title)}</h2>
        <p class="lead">${e(v.base.text)}</p>
        <div class="actions center">
          <a class="btn btn-accent" href="${c.href(PAGES.request)}">${e(t.nav.request)}</a>
          <a class="btn btn-outline" href="${c.href(PAGES.restaurant)}">${e(t.nav.restaurant)}</a>
        </div>
      </div>
    </section>`;
  return layout(c, { title: v.meta.title, description: v.meta.description, og: 'assets/img/og/val-di-sole.jpg', hero: IMG.winterHero, body, crumbs: [[t.nav.valdisole, PAGES.valdisole]] });
}

export function request(c) {
  const t = c.t, q = t.request, f = q.form;
  const adults = [1, 2, 3, 4, 5, 6, 7].map((n) => `<option>${n}</option>`).join('');
  const kids = [0, 1, 2, 3, 4, 5, 6].map((n) => `<option>${n}</option>`).join('');
  const ages = [1, 2, 3, 4, 5, 6].map((n) => {
    const label = e(f.childAge.replace('{n}', n));
    const opts = Array.from({ length: 18 }, (_, y) => `<option value="${y || 'meno di 1 anno'}">${label}: ${y || '&lt; 1'}</option>`).join('');
    return `<select name="Età bambino ${n}" aria-label="${label}" required disabled hidden data-child-age><option value="" disabled selected>${label} *</option>${opts}</select>`;
  }).join('\n              ');
  const apts = APARTMENTS.map((a) => `<option>${e(a.name)}</option>`).join('');
  const body = `
    <section class="page-title">
      <div class="wrap">
        <p class="eyebrow">${e(q.hero.eyebrow)}</p>
        <h1>${e(q.hero.title)}</h1>
        <p class="lead">${e(q.hero.lead)}</p>
      </div>
    </section>

    <section class="section section-tight">
      <div class="wrap request-grid" id="richiesta">
        <div>
          <div class="request-sent" role="status" tabindex="-1" hidden data-request-sent><p>${e(f.sent)}</p><a class="link-arrow" href="${c.href('')}">${e(t.common.form.back)}</a></div>
          <form class="request-form" action="${FORM_ACTION}" method="POST" novalidate ${formMsgs(c)} data-request-form data-validate data-sent-param="richiesta">
            <input type="hidden" name="_subject" value="${e(f.subject)}">
            <input type="hidden" name="_next" value="${SITE_URL}${c.lang.path}${PAGES.request}?richiesta=inviata">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="Lingua" value="${c.lang.code}">
            <input type="hidden" name="Soggiorno" data-stay-input>
            <div class="hp" aria-hidden="true"><label>Lascia vuoto <input type="text" name="_honey" tabindex="-1" autocomplete="off"></label></div>
            <p class="rf-head"><strong>${e(f.noCommitment)}</strong><span>${e(f.required)}</span></p>
            <div class="rf-group">
              <input type="text" name="Nome" placeholder="${e(f.firstName)} *" aria-label="${e(f.firstName)}" required autocomplete="given-name">
              <input type="text" name="Cognome" placeholder="${e(f.lastName)} *" aria-label="${e(f.lastName)}" required autocomplete="family-name">
              <input type="email" name="email" placeholder="${e(f.email)} *" aria-label="${e(f.email)}" required autocomplete="email">
              <input type="tel" name="Telefono" placeholder="${e(f.phone)} *" aria-label="${e(f.phone)}" required autocomplete="tel">
            </div>
            <div class="rf-group">
              <label class="rf-field"><span>${e(f.arrival)} *</span><input type="date" name="Arrivo" required data-date data-arrival></label>
              <label class="rf-field"><span>${e(f.departure)} *</span><input type="date" name="Partenza" required data-date data-departure></label>
              <select name="Adulti" aria-label="${e(f.adults)}" required data-adults><option value="" disabled selected>${e(f.adults)} *</option>${adults}</select>
              <select name="Bambini" aria-label="${e(f.children)}" data-children data-default="0"><option value="" disabled selected>${e(f.children)}</option>${kids}</select>
              <select name="Appartamento" aria-label="${e(f.apartment)}" data-apt-select><option value="Nessuna preferenza">${e(f.apartment)}: ${e(f.any)}</option>${apts}</select>
              <select name="Animali" aria-label="${e(f.pets)}" data-default="Non indicato"><option value="" disabled selected>${e(f.pets)}</option><option value="No">${e(f.no)}</option><option value="Sì">${e(f.yes)}</option></select>
            </div>
            <div class="rf-group rf-ages" hidden data-ages>
              <p class="rf-note">${e(f.agesNote)}</p>
              ${ages}
            </div>
            <div class="rf-group rf-single">
              <textarea name="Richiesta" rows="5" placeholder="${e(f.message)}" aria-label="${e(f.message)}"></textarea>
              <label class="rf-check"><input type="checkbox" name="Privacy" value="ok" required> <span>${e(f.privacy).replace(e(f.privacyLink), `<a href="${c.href(PAGES.privacy)}" target="_blank" rel="noopener">${e(f.privacyLink)}</a>`)}</span></label>
              <button class="btn btn-accent" type="submit">${e(f.submit)}</button>
            </div>
          </form>
        </div>
        <aside class="info-card">
          <h2 class="h3">${e(q.asideTitle)}</h2>
          <ul class="checklist">${[...q.aside, ...t.apartments.good.slice(0, 2)].map((s) => `<li>${e(s)}</li>`).join('')}</ul>
          <p class="payment-note">${e(q.paymentNote)}</p>
          <p class="hours-season">${e(t.common.season)}</p>
          <address>${e(t.common.address)}</address>
          <a class="link-arrow" href="${DIRECTIONS_URL}" target="_blank" rel="noopener">${e(t.common.directions)}</a>
        </aside>
      </div>
    </section>`;
  return layout(c, { title: q.meta.title, description: q.meta.description, body, crumbs: [[t.nav.request, PAGES.request]] });
}

export function privacy(c) {
  const t = c.t, p = t.privacy;
  const email = `<a href="mailto:${REQUEST_EMAIL}">${REQUEST_EMAIL}</a>`;
  const pec = `<a href="mailto:${LEGAL.pec}">${LEGAL.pec}</a>`;
  const fillHtml = (s) => e(s).replace('{company}', e(LEGAL.company)).replace('{address}', e(LEGAL.address)).replace('{vat}', LEGAL.vat).replaceAll('{email}', email).replaceAll('{pec}', pec);
  const body = `
    <section class="page-title">
      <div class="wrap narrow">
        <p class="eyebrow">${e(p.eyebrow)}</p>
        <h1>${e(p.title)}</h1>
        <p class="lead">${e(p.lead)}</p>
      </div>
    </section>

    <section class="section section-tight">
      <div class="wrap narrow legal-text">
        ${p.sections.map((s) => `<h2 class="h3">${e(s.h)}</h2>\n        ${s.p.map((x) => `<p>${fillHtml(x)}</p>`).join('\n        ')}`).join('\n        ')}
        <p class="muted">${e(p.updated)}</p>
      </div>
    </section>`;
  return layout(c, { title: p.meta.title, description: p.meta.description, body, crumbs: [[p.title, PAGES.privacy]] });
}

// Pagina 404 (GitHub Pages la mostra per ogni indirizzo inesistente): link assoluti, non indicizzata.
export function notFound(c) {
  const t = c.t;
  const body = `
    <section class="page-title">
      <div class="wrap narrow">
        <p class="eyebrow">404</p>
        <h1>Pagina non trovata</h1>
        <p class="lead">L'indirizzo che hai aperto non esiste o è cambiato. Page not found · Seite nicht gefunden · Nie znaleziono strony.</p>
        <div class="actions">
          <a class="btn btn-accent" href="${c.href(PAGES.request)}">${e(t.nav.request)}</a>
          <a class="btn btn-outline" href="${c.href('')}">Home</a>
        </div>
        <ul class="footer-links nf-links">
          <li><a class="link-arrow" href="${c.href(PAGES.apartments)}">${e(t.nav.apartments)}</a></li>
          <li><a class="link-arrow" href="${c.href(PAGES.restaurant)}">${e(t.nav.restaurant)}</a></li>
          <li><a class="link-arrow" href="${c.href(PAGES.valdisole)}">${e(t.nav.valdisole)}</a></li>
          <li class="nf-langs"><a class="link-arrow" href="/en/" lang="en">English</a><a class="link-arrow" href="/de/" lang="de">Deutsch</a><a class="link-arrow" href="/pl/" lang="pl">Polski</a></li>
        </ul>
      </div>
    </section>`;
  return layout(c, { title: 'Pagina non trovata | Locanda dei Gemelli', description: t.home.meta.description, body })
    .replace(/\n  <link rel="(canonical|alternate)"[^>]*>/g, '')
    .replace(/\n  <meta property="og:url"[^>]*>/, '')
    .replace('<title>', '<meta name="robots" content="noindex">\n  <title>');
}
