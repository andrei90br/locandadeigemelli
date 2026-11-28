# Locanda dei Gemelli

Sito della Locanda dei Gemelli (6 appartamenti + ristorante e pizzeria), Dimaro Folgarida (TN). Pubblicato con GitHub Pages.

## Struttura

- `src/data.mjs`: dati fissi (foto, appartamenti, percorsi delle pagine, email delle richieste)
- `src/render.mjs`: layout e pagine (home, appartamenti, scheda di ogni appartamento, ristorante, val-di-sole, richiesta)
- `src/i18n/{it,en,de,pl}.json`: i testi per lingua (stessa struttura in tutte le lingue)
- `assets/`: CSS e JS
- `build.mjs`: genera tutte le pagine (IT nella root, `en/`, `de/`, `pl/`), `sitemap.xml` e `robots.txt`

## Modificare i testi

1. Cambia i file in `src/`
2. Esegui `node build.mjs`
3. Fai commit sia di `src/` sia delle pagine generate

## Da completare

- Logo, contatti, menu, storia
- Prenotazioni TheFork e WhatsApp
- Foto definitive (ora sono prese da locandaelisa.it, vedi `IMG` e `APARTMENTS` in `src/data.mjs`)
- Ragione sociale, P.IVA, Privacy e Cookie Policy
- Dominio `locandadeigemelli.com`: DNS su IONOS (A su GitHub Pages, CNAME www), dominio impostato in Settings → Pages

## Logo

In `assets/img/`:
- `logo.svg`: logo vettoriale bianco (usato nel sito), nitido a qualsiasi dimensione
- `logo-nero.svg`: stesso logo in nero, per sfondi chiari
- `logo.png`: PNG trasparente ad alta risoluzione (2365 × 2495)
- `logo-sfondo-nero.png`: PNG su sfondo nero
- `favicon.png`, `apple-touch-icon.png`: monogramma AH
- `prodotti-genuini.jpg`: illustrazione ingredienti con il logo al centro (usata nella sezione Pizzeria)
- `prodotti-genuini-senza-logo.jpg`: la stessa illustrazione con il cerchio bianco vuoto, per usi futuri

## Sviluppo e pubblicazione

Il sito è online dal 28/11/2026: ogni push su `main` esegue `.github/workflows/pages.yml`
(`node build.mjs`, poi pubblica le pagine generate, `assets/`, `CNAME`, `sitemap.xml` e `robots.txt`).
