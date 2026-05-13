Project: SatWire – Crypto News Aggregator (PWA)
App Naam: SatWire
Tagline: Crypto nieuws vanuit alle bronnen – op één plek.
Je bent een senior full-stack TypeScript developer gespecialiseerd in Next.js en moderne web-applicaties. Bouw SatWire, een professionele Progressive Web App (PWA) voor crypto nieuws.
Technische Stack

Framework: Next.js 15 (App Router)
Styling: Tailwind CSS + shadcn/ui
UI Component Library: shadcn/ui + Radix UI
State Management: Zustand
Backend: Supabase (Auth, Database, Storage, Edge Functions)
Extra: Node.js waar nodig (bijv. voor scraping of custom API routes)
PWA: Volledige PWA support (offline modus, installable, manifest, service worker)
Deployment: Vercel (voorkeur)

Kernfuncties (Prioriteit)
Hoog Prioriteit:

Oneindige scroll nieuws feed met artikelen uit meerdere bronnen
Categorie filtering (Bitcoin, Ethereum, Altcoins, DeFi, Regulation, NFTs, Market, Technology, etc.)
Geavanceerd zoeken + filters (bron, datum, categorie, coin)
Gebruikersprofiel & persoonlijke voorkeuren (volgde coins/categorieën)
Volledige Dark Mode (default)
Professioneel, minimalistisch en modern design

Medium Prioriteit:

Push notificaties (via Supabase + Web Push API) voor belangrijk nieuws en prijsbewegingen

Laag Prioriteit (later):

Bookmarks / Lees later

Design & UX Richtlijnen

Stijl: Professioneel, minimalistisch, modern, clean
Kleurenschema: Diep zwart (#0A0A0A) en donkergrijs als basis, accent kleur neon/groen (#22C55E of #10B981)
Zeer goede typografie en leesbaarheid (goede line-height, contrast)
Nieuws-kaarten met afbeelding, titel, bron, tijd, categorie tag
Mobile-first, maar goed op tablet/desktop
Snelle, soepele ervaring (lage latency)

Belangrijke Functionaliteiten Detail

Nieuws Feed
Artikelen ophalen uit meerdere bronnen (RSS feeds + API’s zoals CryptoPanic, CoinTelegraph, The Block, Decrypt, Coindesk, etc.)
Deduplicatie van artikelen
Caching strategie (Supabase + Next.js cache)
Infinite scroll met pagination

Gebruikers Systeem
Supabase Auth (email + magic link + Google login)
Persoonlijke feed voorkeuren opslaan (gevolgde coins & categorieën)
Settings pagina

Technische Eisen
Volledig TypeScript
Server Components waar mogelijk, Client Components alleen waar nodig
Goede error handling en loading states (skeletons)
Optimale performance & Core Web Vitals
Schone, modulaire, schaalbare code structuur
Goede comments bij complexe logica


Gewenste Folder Structuur (suggestie)
/app
  /api
  /dashboard
  /feed
  /profile
  /settings
/components
  /ui          (shadcn)
  /feed
  /layout
  /common
/lib
/hooks
/store          (Zustand)
/types
/utils