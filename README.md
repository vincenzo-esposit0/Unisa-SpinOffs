# UNISA Spin-off Showcase

Proof of Concept per il restyling della pagina degli spin-off dell’Università degli Studi di Salerno: catalogo con ricerca per settore e stato di incubazione.

**Demo:** https://vincenzo-esposit0.github.io/Unisa-SpinOffs/ · Stack: React + Vite + TypeScript + Tailwind CSS

> Progetto indipendente a scopo dimostrativo: non è un sito ufficiale dell’Università degli Studi di Salerno. Nomi e loghi appartengono ai rispettivi titolari.

## Requisiti
- Node.js 18+ (consigliato 20+)
- npm (oppure yarn/pnpm)

## File importanti
- **Catalogo dati**: `public/unisa-spinoffs.json`
- **Logo UNISA**: `public/logo_unisa.png`

Se questi file non sono presenti, il progetto userà un dataset demo e un fallback remoto per il logo.

## Avvio in locale

```bash
npm install
npm run dev
```

Apri l'URL mostrato in console (tipicamente http://localhost:5173).

## Build produzione

```bash
npm run build
npm run preview
```

## Inserire il tuo catalogo reale

Sostituisci il file:

`public/unisa-spinoffs.json`

Formato minimo per ogni item:

```json
{
  "id": "string",
  "name": "string",
  "category": "string",
  "incubatorStatus": "Incubazione | Fuoriusciti",
  "tagline": "string",
  "description": "string",
  "founded": 2020,
  "department": "string",
  "website": "https://...",
  "email": "contatto@...",
  "image": "https://..."
}
```

## License / Licenza

Copyright © 2026 Vincenzo Esposito. All rights reserved. / Tutti i diritti riservati.

This repository is proprietary. Unauthorized copying, distribution, or modification of this code is strictly prohibited. For more details, see the [LICENSE](LICENSE) file.
