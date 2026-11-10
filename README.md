# Locanda dei Gemelli

Sito del ristorante e pizzeria Locanda dei Gemelli, Dimaro Folgarida (TN). Pubblicato con GitHub Pages.

## Struttura

- `src/template.html`: la pagina, una sola per tutte le lingue
- `src/i18n/{it,en,de,pl}.json`: i testi per lingua
- `assets/`: CSS e JS
- `build.mjs`: genera `index.html` (IT), `en/`, `de/`, `pl/`, `sitemap.xml` e `robots.txt`

## Modificare i testi

1. Cambia i file in `src/`
2. Esegui `node build.mjs`
3. Fai commit sia di `src/` sia delle pagine generate

## Da completare

- Logo, contatti, menu, storia
- Prenotazioni TheFork e WhatsApp
- Foto definitive (ora sono prese da locandaelisa.it, vedi `IMG` in `build.mjs`)
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
