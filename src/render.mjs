// Layout e pagine del sito. Ogni funzione riceve il contesto della lingua e restituisce HTML.
import { SITE_URL, REQUEST_EMAIL, MAPS_URL, LANGS, IMG, APARTMENTS, PAGES } from './data.mjs';

export const e = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
const isExternal = (src) => /^https?:/.test(src);

// Contesto: lingua, profondità della pagina e funzioni per i link.
export function context(lang, t, pagePath) {
  const depth = (lang.path + pagePath).split('/').filter(Boolean).length;
  const root = '../'.repeat(depth);
  const href = (path) => root + lang.path + path;
  const asset = (src) => (isExternal(src) ? src : root + src);
  return { lang, t, pagePath, root, href, asset };
}

const aptHref = (c, a) => c.href(`${PAGES.apartments}${a.slug}/`);
const requestHref = (c, a) => c.href(PAGES.request) + (a ? `?apt=${encodeURIComponent(a.name)}` : '');

function header(c) {
  const { t, href } = c;
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
      <nav class="nav" aria-label="${e(t.nav.label)}" data-nav>
          ${links}
          <a href="${href('')}#dove">${e(t.nav.where)}</a>
        <div class="langs" aria-label="${e(t.nav.languages)}">${langSwitch(c)}</div>
        <a class="btn btn-accent nav-cta" href="${href(PAGES.request)}">${e(t.nav.request)}</a>
      </nav>
      <a class="btn btn-accent btn-sm header-cta" href="${href(PAGES.request)}">${e(t.nav.request)}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-label="${e(t.nav.open)}" data-menu-toggle><span></span><span></span></button>
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
        <div class="langs">${langSwitch(c)}</div>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <!-- TODO: ragione sociale, P.IVA, CIN, Privacy e Cookie Policy -->
      <p>© ${new Date().getFullYear()} Locanda dei Gemelli</p>
    </div>
  </footer>`;
}

export function layout(c, { title, description, image, body, jsonld }) {
  const canonical = SITE_URL + c.lang.path + c.pagePath;
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
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:image" content="${e(image || IMG.hero)}">
  <meta property="og:locale" content="${c.t.locale}">
  <link rel="icon" type="image/png" href="${c.root}assets/img/favicon.png">
  <link rel="apple-touch-icon" href="${c.root}assets/img/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${c.root}assets/css/style.css">
${jsonld ? `  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ''}</head>
<body>${header(c)}
  <main id="main">${body}
  </main>${footer(c)}
  <script src="${c.root}assets/js/main.js" defer></script>
</body>
</html>
`;
}

// ---------- blocchi riutilizzabili ----------

function pageHero(c, h, image, extra = '') {
  return `
    <section class="hero hero-page" style="--bg: url('${c.asset(image)}')">
      <div class="wrap hero-inner">
        <p class="eyebrow">${e(h.eyebrow)}</p>
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
    <form class="booking-bar wrap" action="${c.href(PAGES.request)}" method="get" aria-label="${e(b.label)}" data-booking-bar>
      <label class="bb-field"><span>${e(b.arrival)}</span><input type="text" name="arrivo" placeholder="–" data-date data-arrival required></label>
      <label class="bb-field"><span>${e(b.departure)}</span><input type="text" name="partenza" placeholder="–" data-date data-departure required></label>
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
          <a class="apt-media" href="${aptHref(c, a)}"><img src="${a.photos[0]}" alt="${e(t.apartment.eyebrow)} ${e(a.name)}" loading="lazy"></a>
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
              <div><dt>${e(t.restaurant)}</dt><dd>12:00 – 14:00<br>18:00 – 22:30</dd></div>
              <div><dt>${e(t.pizzeria)}</dt><dd>18:00 – 23:00</dd></div>
              <div class="closed"><dt>${e(t.closedDay)}</dt><dd>${e(t.closed)}</dd></div>
            </dl>
            <p class="hours-season">${e(t.season)}</p>
          </div>`;
}

function baseJsonLd(c) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LodgingBusiness', 'Restaurant'],
    name: 'Locanda dei Gemelli',
    url: SITE_URL + c.lang.path,
    image: IMG.hero,
    servesCuisine: ['Trentina', 'Italiana', 'Pizza'],
    numberOfRooms: APARTMENTS.length,
    petsAllowed: true,
    checkinTime: '14:00',
    checkoutTime: '11:00',
    address: { '@type': 'PostalAddress', streetAddress: 'Via Campiglio 59', postalCode: '38025', addressLocality: 'Dimaro Folgarida', addressRegion: 'TN', addressCountry: 'IT' },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '12:00', closes: '14:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '18:00', closes: '23:00' },
    ],
  };
}

// ---------- pagine ----------

export function home(c) {
  const t = c.t, h = t.home;
  const body = `
    <section class="hero hero-home" style="--bg: url('${c.asset(IMG.hero)}')">
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
          <a class="btn btn-outline" href="${MAPS_URL}" target="_blank" rel="noopener">${e(t.common.map)}</a>
        </div>${hoursBox(c)}
      </div>
    </section>

    <section class="cta-final">
      <div class="wrap narrow center">
        <h2>${e(h.final.title)}</h2>
        <p class="lead">${e(h.final.text)}</p>
        <a class="btn btn-accent" href="${c.href(PAGES.request)}">${e(h.final.cta)}</a>
      </div>
    </section>`;
  return layout(c, { title: h.meta.title, description: h.meta.description, body, jsonld: baseJsonLd(c) });
}

export function apartments(c) {
  const t = c.t, p = t.apartments;
  const body = `${pageHero(c, p.hero, IMG.stay)}
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
  return layout(c, { title: p.meta.title, description: p.meta.description, image: IMG.stay, body, jsonld: baseJsonLd(c) });
}

export function apartment(c, a) {
  const t = c.t, p = t.apartment;
  const rooms = t.apartments.rooms[a.rooms];
  const vars = { name: a.name, size: a.size, beds: a.beds, rooms };
  const others = APARTMENTS.filter((o) => o !== a);
  const body = `
    <section class="hero hero-page" style="--bg: url('${a.photos[0]}')">
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
          ${a.photos.map((src, i) => `<a href="${src}" class="gallery-item" data-lightbox><img src="${src}" alt="${e(fill(p.photo, { n: i + 1, name: a.name }))}" loading="lazy"></a>`).join('\n          ')}
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
    <dialog class="lightbox" data-lightbox-dialog><img alt=""><button type="button" aria-label="×" data-close>×</button></dialog>`;
  return layout(c, { title: fill(p.metaTitle, vars), description: fill(p.metaDescription, vars), image: a.photos[0], body });
}

export function restaurant(c) {
  const t = c.t, r = t.restaurant;
  const serviceImgs = [IMG.takeaway, IMG.garden, IMG.business];
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
        <!-- TODO: collegare il menu quando disponibile -->
        <p class="muted"><em>${e(r.kitchen.menu)}</em></p>
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
          <!-- TODO: collegare TheFork e WhatsApp -->
          <div class="actions">
            <span class="btn btn-accent is-soon" aria-disabled="true">${e(r.book.thefork)}</span>
            <span class="btn btn-outline is-soon" aria-disabled="true">${e(r.book.whatsapp)}</span>
          </div>
          <address>${e(t.common.address)}</address>
          <a class="link-arrow" href="${MAPS_URL}" target="_blank" rel="noopener">${e(t.common.map)}</a>
        </div>${hoursBox(c)}
      </div>
    </section>`;
  return layout(c, { title: r.meta.title, description: r.meta.description, image: IMG.restaurant, body, jsonld: baseJsonLd(c) });
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
  const body = `${pageHero(c, v.hero, IMG.hero)}
${season(v.winter, '')}
${season(v.summer, 'section-alt')}

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
  return layout(c, { title: v.meta.title, description: v.meta.description, body });
}

export function request(c) {
  const t = c.t, q = t.request, f = q.form;
  const adults = [1, 2, 3, 4, 5, 6, 7].map((n) => `<option>${n}</option>`).join('');
  const kids = [0, 1, 2, 3, 4, 5, 6].map((n) => `<option>${n}</option>`).join('');
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
          <p class="request-sent" role="status" hidden data-request-sent>${e(f.sent)}</p>
          <form class="request-form" action="https://formsubmit.co/${REQUEST_EMAIL}" method="POST" data-request-form>
            <input type="hidden" name="_subject" value="${e(f.subject)}">
            <input type="hidden" name="_next" value="${SITE_URL}${c.lang.path}${PAGES.request}?richiesta=inviata">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="Lingua" value="${c.lang.code}">
            <input type="hidden" name="Notti" data-nights-input>
            <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
            <p class="rf-head"><strong>${e(f.noCommitment)}</strong><span>${e(f.required)}</span></p>
            <div class="rf-group">
              <input type="text" name="Nome" placeholder="${e(f.firstName)} *" aria-label="${e(f.firstName)}" required autocomplete="given-name">
              <input type="email" name="email" placeholder="${e(f.email)} *" aria-label="${e(f.email)}" required autocomplete="email">
              <input type="text" name="Cognome" placeholder="${e(f.lastName)} *" aria-label="${e(f.lastName)}" required autocomplete="family-name">
              <input type="tel" name="Telefono" placeholder="${e(f.phone)} *" aria-label="${e(f.phone)}" required autocomplete="tel">
            </div>
            <div class="rf-group">
              <input type="text" class="rf-date" name="Arrivo" placeholder="${e(f.arrival)} *" aria-label="${e(f.arrival)}" required data-date data-arrival>
              <select name="Adulti" aria-label="${e(f.adults)}" required data-adults><option value="" disabled selected>${e(f.adults)} *</option>${adults}</select>
              <input type="text" class="rf-date" name="Partenza" placeholder="${e(f.departure)} *" aria-label="${e(f.departure)}" required data-date data-departure>
              <select name="Bambini" aria-label="${e(f.children)}" data-children><option value="" disabled selected>${e(f.children)}</option>${kids}</select>
              <select name="Appartamento" aria-label="${e(f.apartment)}" data-apt-select><option value="">${e(f.apartment)}: ${e(f.any)}</option>${apts}</select>
              <select name="Animali" aria-label="${e(f.pets)}"><option value="" disabled selected>${e(f.pets)}</option><option>${e(f.no)}</option><option>${e(f.yes)}</option></select>
            </div>
            <div class="rf-group rf-single">
              <textarea name="Richiesta" rows="5" placeholder="${e(f.message)}" aria-label="${e(f.message)}"></textarea>
              <label class="rf-check"><input type="checkbox" name="Privacy" value="ok" required> <span>${e(f.privacy)}</span></label>
              <button class="btn btn-accent" type="submit">${e(f.submit)}</button>
            </div>
          </form>
        </div>
        <aside class="info-card">
          <h3>${e(q.asideTitle)}</h3>
          <ul class="checklist">${[...q.aside, ...t.apartments.good.slice(0, 2)].map((s) => `<li>${e(s)}</li>`).join('')}</ul>
          <p class="hours-season">${e(t.common.season)}</p>
          <address>${e(t.common.address)}</address>
        </aside>
      </div>
    </section>`;
  return layout(c, { title: q.meta.title, description: q.meta.description, body });
}
