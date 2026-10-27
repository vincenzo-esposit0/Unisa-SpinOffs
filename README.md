# UNISA Spin-off Showcase

Progetto React + Vite + Tailwind per il catalogo degli spin-off UNISA.

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
