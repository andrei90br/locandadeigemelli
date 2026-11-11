// Dati del sito. Le foto sono provvisorie e vengono da locandaelisa.it:
// quando arrivano quelle nuove vanno messe in assets/img/ e aggiornati i percorsi qui.
export const SITE_URL = 'https://locandadeigemelli.com/';
export const REQUEST_EMAIL = 'lalocandadeigemelli@gmail.com';
export const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Via+Campiglio+59+38025+Dimaro+Folgarida';

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
  stay: SRC + '2022/07/Golden-02.jpg',
  illustration: 'assets/img/prodotti-genuini.jpg',
};

// rooms = chiave delle traduzioni in apartments.rooms
export const APARTMENTS = [
  { slug: 'jonagold', name: 'Jonagold', size: 46, beds: 4, rooms: 'dbl2',
    photos: up(['Jonagold-05.jpg', 'Jonagold-02.jpg', 'Jonagold-07.jpg', 'Jonagold-09.jpg', 'Jonagold-10.jpg', 'Jonagold-12.jpg', 'Jonagold-13.jpg'], '2022/07/') },
  { slug: 'pink-lady', name: 'Pink Lady', size: 46, beds: 4, rooms: 'dblBunk',
    photos: up(['Pink-Lady-02-1.jpg', 'Pink-Lady-04.jpg', 'Pink-Lady-03.jpg', 'Pink-Lady-06.jpg', 'Pink-Lady-08.jpg', 'Pink-Lady-09.jpg', 'Pink-Lady-11.jpg', 'Pink-Lady-13-1.jpg'], '2022/07/') },
  { slug: 'renetta', name: 'Renetta', size: 46, beds: 4, rooms: 'dblSofa',
    photos: up(['Renetta-02-1.jpg', 'Renetta-04.jpg', 'Renetta-05.jpg', 'Renetta-07.jpg', 'Renetta-08.jpg', 'Renetta-10.jpg', 'Renetta-12.jpg', 'Renetta-13.jpg'], '2022/07/') },
  { slug: 'fuji', name: 'Fuji', size: 46, beds: 4, rooms: 'dblBunk',
    photos: up(['b82f9da3-068b-4e83-b49d-6dd824b1772f-jpg.webp', 'd45eff15-c7ad-409d-a110-b3f12deebc61-jpg.webp', 'f845ad4a-5255-4189-a28c-e492e90a6b03-jpg.webp', '9075a08c-86a2-4c76-bef8-2c18ecd1f92e-jpg.webp', 'd57005ee-85a2-4384-8efc-6e72de855e62-jpg.webp'], '2023/02/') },
  { slug: 'golden', name: 'Golden', size: 60, beds: 6, rooms: 'dblBunkSofa',
    photos: up(['Golden-02.jpg', 'Golden-03-1.jpg', 'Golden-04.jpg', 'Golden-11.jpg', 'Golden-14.jpg', 'Golden-16.jpg', 'Golden-18-1.jpg', 'Golden-19.jpg'], '2022/07/') },
  { slug: 'morgana', name: 'Morgana', size: 60, beds: 7, rooms: 'dblBunkSingleSofa',
    photos: up(['Morgana-03.jpg', 'Morgana-04.jpg', 'Morgana-06.jpg', 'Morgana-11.jpg', 'Morgana-12.jpg', 'Morgana-13.jpg', 'Morgana-14.jpg', 'Morgana-16.jpg'], '2022/07/') },
];

// Pagine: chiave -> percorso (uguale in tutte le lingue)
export const PAGES = {
  home: '',
  apartments: 'appartamenti/',
  restaurant: 'ristorante/',
  valdisole: 'val-di-sole/',
  request: 'richiesta/',
};
