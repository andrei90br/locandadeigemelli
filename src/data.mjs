// Dati del sito. Le foto degli appartamenti sono in assets/img/appartamenti/<slug>/
// (file <stanza>-NN.webp a 2000px + <stanza>-NN-sm.webp a 900px, creati da scripts/foto.py).
// Le altre foto sono ancora provvisorie e vengono da locandaelisa.it.
import { readdirSync } from 'node:fs';

export const SITE_URL = 'https://locandadeigemelli.com/';
export const REQUEST_EMAIL = 'lalocandadeigemelli@gmail.com';
// Scheda Google Business Profile "La Locanda dei Gemelli" (CID dalla scheda creata il 2026-11-26).
export const GOOGLE_PLACE_URL = 'https://maps.google.com/?cid=524019156597058033';
export const MAPS_URL = GOOGLE_PLACE_URL;
// Mappa incorporata (caricata solo al clic, per non installare cookie Google senza consenso).
export const MAP_EMBED_URL = 'https://maps.google.com/maps?q=La+Locanda+dei+Gemelli%2C+Via+Campiglio+59%2C+38025+Dimaro+TN&z=15&output=embed';
export const DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=La+Locanda+dei+Gemelli%2C+Via+Campiglio+59%2C+38025+Dimaro+TN';

export const LANGS = [
  { code: 'it', path: '', label: 'IT' },
  { code: 'en', path: 'en/', label: 'EN' },
  { code: 'de', path: 'de/', label: 'DE' },
  { code: 'pl', path: 'pl/', label: 'PL' },
];

const SRC = 'https://locandaelisa.it/wp-content/uploads/';
const up = (list, dir) => list.map((f) => SRC + dir + f);

export const IMG = {
  hero: SRC + '2024/01/161-Locanda-Elisa-Dic-2023-jpg.webp',
  restaurant: SRC + '2022/06/bistrot.png',
  takeaway: SRC + '2022/06/Asporto-e-consegna-a-domicilio.jpg',
  garden: SRC + '2022/07/servizio-giardino-eventi.jpg',
  business: SRC + '2022/06/Business-Locanda-Elisa-2.jpg',
  stay: 'assets/img/appartamenti/golden/cucina-02.webp',
  illustration: 'assets/img/prodotti-genuini.jpg',
  // Foto invernali: Giorgio Galeotti, Wikimedia Commons, CC BY 4.0 (credito in pagina Val di Sole)
  winterHero: 'assets/img/val-di-sole/inverno-brenta-malghet-aut.webp',
};

// Ordine delle foto in galleria: per tipo di stanza, poi per numero.
const ROOM_ORDER = ['salotto', 'soggiorno', 'cucina', 'stanza-1', 'stanza-2', 'stanza-3', 'bagno', 'entrata', 'corridoio'];
const roomOf = (f) => ROOM_ORDER.find((r) => f.startsWith(r)) || 'altro';
// Foto di un appartamento lette dalla cartella; `cover` = foto da mettere per prima (copertina).
function photos(slug, cover) {
  const dir = `assets/img/appartamenti/${slug}/`;
  const names = readdirSync(dir)
    .filter((f) => f.endsWith('.webp') && !f.endsWith('-sm.webp'))
    .map((f) => f.replace('.webp', ''))
    .sort((a, b) => ROOM_ORDER.indexOf(roomOf(a)) - ROOM_ORDER.indexOf(roomOf(b)) || a.localeCompare(b));
  if (cover) names.unshift(...names.splice(names.indexOf(cover), 1));
  return names.map((n) => ({ src: dir + n + '.webp', thumb: dir + n + '-sm.webp', room: roomOf(n).replace(/-\d$/, '') }));
}

// rooms = chiave delle traduzioni in apartments.rooms
export const APARTMENTS = [
  { slug: 'jonagold', name: 'Jonagold', size: 46, beds: 4, rooms: 'dbl2', cover: 'salotto-02' },
  { slug: 'pink-lady', name: 'Pink Lady', size: 46, beds: 4, rooms: 'dblBunk', cover: 'soggiorno-01' },
  { slug: 'renetta', name: 'Renetta', size: 46, beds: 4, rooms: 'dblSofa', cover: 'cucina-01' },
  { slug: 'fuji', name: 'Fuji', size: 46, beds: 4, rooms: 'dblBunk', cover: 'stanza-1-01' },
  { slug: 'golden', name: 'Golden', size: 60, beds: 6, rooms: 'dblBunkSofa', cover: 'cucina-02' },
  { slug: 'morgana', name: 'Morgana', size: 60, beds: 7, rooms: 'dblBunkSingleSofa', cover: 'salotto-01' },
].map((a) => ({ ...a, photos: photos(a.slug, a.cover) }));

// Pagine: chiave -> percorso (uguale in tutte le lingue)
export const PAGES = {
  home: '',
  apartments: 'appartamenti/',
  restaurant: 'ristorante/',
  valdisole: 'val-di-sole/',
  request: 'richiesta/',
};
