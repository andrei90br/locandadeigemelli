# Design – La Locanda dei Gemelli

Stile chiaro ed elegante, non lussuoso. Header e footer neri con logo bianco, pagine su carta calda.
Tutte le regole stanno in `assets/css/style.css`: qui c'è il riassunto per restare coerenti.

## Colori (variabili in `:root`)

| Token | Valore | Uso |
|---|---|---|
| `--paper` | #faf7f2 | sfondo pagina |
| `--stone` | #efe9df | sezioni alternate (`.section-alt`, `.cta-final`) |
| `--white` | #fff | card, moduli, barra di prenotazione |
| `--ink` | #1f1c19 | testo, fasce scure (`.band`, `.tip`, `.ski-map`) |
| `--muted` | #6f675e | testo secondario |
| `--line` / `--line-dark` | #ddd4c7 / #222 | bordi su chiaro / su nero |
| `--accent` | #8c6239 | bottone principale, eyebrow, link-arrow |
| `--accent-dark` | #6f4c2b | hover; eyebrow e numeri su `--stone` (contrasto AA) |
| `--gold` | #e7caa2 | eyebrow, link e focus su sfondi scuri |
| `--black` | #000 | header, footer, citazione |
| `--success` / `--success-bg` / `--error` | | messaggi dei moduli |

Non scrivere colori a mano: aggiungi un token se serve.

## Tipografia

- Titoli: Cormorant Garamond 600 (`--serif`), cifre allineate. h1 2.6–4.6rem, h2 2–3.1rem, h3 1.6rem.
- Testo: Inter (`--sans`), 17px, interlinea 1.7, righe al massimo 68 caratteri nei testi lunghi.
- Etichette maiuscole spaziate (eyebrow, bottoni): mai sotto 12px.
- Font locali in `assets/fonts/` (niente Google Fonts).

## Livelli dei titoli

Un solo `h1` per pagina. Non saltare livelli: se un riquadro laterale deve sembrare un h3 ma viene dopo un h1, usa `<h2 class="h3">`.

## Componenti

- **Bottoni** `.btn`: `.btn-accent` (azione principale, una sola per sezione), `.btn-outline` (secondaria), `.btn-light` (su scuro), `.btn-sm`, `.btn-block`. Altezza minima 44px, raggio `--radius-sm` (8px), testo che va a capo se serve.
- **Link con freccia** `.link-arrow`: azioni terziarie.
- **Card** `.apt-card`, `.card`, `.info-card`, `.hours`: sfondo bianco, raggio `--radius` (14px); `.info-card` e `.hours` con bordo superiore `--accent`.
- **Eyebrow** `.eyebrow`: sopra ogni titolo di sezione.
- **Elenchi** `.checklist` (spunta marrone), `.ski-facts` (pillole), `.facts` (tabella "In breve").
- **Moduli** `.request-form`: campi con bordo `--line` su `--paper`, etichetta visibile per le date (`.rf-field`), errori in `.field-error` creati da `main.js`.

## Accessibilità

- Tap target minimi 44×44px; focus visibile (`:focus-visible`, oro su sfondi scuri).
- Rispetto di `prefers-reduced-motion`.
- Contrasto almeno 4.5:1 sul testo normale.
