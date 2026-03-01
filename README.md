# Escrow Nigeria

Nigeria's trusted escrow service for secure online transactions.

## Tech Stack

- **React 18** + **TypeScript** – UI framework
- **Vite** – Build tool
- **Tailwind CSS** + **shadcn/ui** – Styling & components
- **Supabase** – Auth, database, edge functions
- **Paystack** – Payment processing

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:8080`.

## Build for Production

```bash
npm run build
```

## Deployment

Deploy the `dist/` folder to Vercel, Netlify, or any static hosting provider.

Set the following environment variables on your host:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable (anon) key |
