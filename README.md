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
- Dominio `locandadeigemelli.com` (file `CNAME` e DNS)
