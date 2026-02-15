# My Claude Web App

A playground for various demo / test apps, built with **Expo (React Native)** — runs on iOS, Android, and Web from a single codebase. Backend powered by **Cloudflare Workers** + **Supabase**.

## Architecture

```
Mobile / Web (Expo)  ──HTTPS──>  Cloudflare Workers (Hono)  ──HTTPS──>  Supabase (PostgreSQL)
  Deploy:                          Deploy:                                Hosted:
  Vercel + CF Pages                wrangler deploy                        Supabase Cloud
```

- **Frontend**: Static Expo build, dual-deployed to Vercel (global) + Cloudflare Pages (China-accessible)
- **Backend**: Cloudflare Workers + Hono (BFF pattern), China-accessible
- **Database**: Supabase (PostgreSQL), accessed only from Workers (secrets never exposed to client)

## Live URLs

| Platform | URL | Notes |
|---|---|---|
| Vercel | https://my-claude-web-app.vercel.app | Global CDN |
| Cloudflare Pages | https://my-claude-web-app.pages.dev | China-accessible |

## Project Structure

```
├── app/
│   ├── _layout.tsx              # Root layout (navigation + theme)
│   ├── index.tsx                # Home screen
│   ├── +not-found.tsx           # 404 screen
│   └── demo/
│       ├── _layout.tsx          # Demo section layout
│       └── notes.tsx            # Notes CRUD demo
├── assets/images/               # App icons, splash screen
├── constants/theme.ts           # Color & font tokens
├── hooks/                       # Custom hooks
├── workers/                     # Cloudflare Worker (backend)
│   ├── src/
│   │   ├── index.ts             # Hono app entry
│   │   ├── types.ts             # Env bindings & data types
│   │   ├── lib/supabase.ts      # Supabase client factory
│   │   ├── middleware/
│   │   │   ├── cors.ts          # CORS config
│   │   │   └── error-handler.ts # Unified error handling
│   │   └── routes/
│   │       ├── health.ts        # GET /health
│   │       └── notes.ts         # GET/POST /notes
│   ├── wrangler.toml            # Cloudflare config
│   ├── tsconfig.json
│   └── package.json
├── app.json                     # Expo config
├── eas.json                     # EAS Build profiles
├── vercel.json                  # Vercel deployment config
├── .env.example                 # Environment variable template
└── package.json
```

## Getting Started

### Frontend

```bash
npm install                      # Install dependencies
npx expo start --web             # Start web dev server
npx expo start --android         # Android (emulator or Expo Go)
npx expo start --ios             # iOS (macOS only, or Expo Go)
```

### Backend (Cloudflare Worker)

```bash
cd workers
npm install                      # Install worker dependencies
npm run dev                      # Start local dev server (http://localhost:8787)
```

### Supabase Setup

1. Create a free project at https://supabase.com
2. Run this SQL in the SQL Editor:
   ```sql
   CREATE TABLE notes (
     id BIGSERIAL PRIMARY KEY,
     content TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```
3. Copy your project URL and `service_role` key from Settings > API
4. Create `workers/.dev.vars` (see `.dev.vars.example`):
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJ...
   ```

### Environment Variables

Copy `.env.example` to `.env` in the project root:
```
EXPO_PUBLIC_API_URL=http://localhost:8787
```

## Deployment

### Frontend (automatic)

```
git push → GitHub (main) → Vercel + Cloudflare Pages (auto)
```

Build command: `npx expo export --platform web` | Output: `dist`

### Backend (manual)

```bash
cd workers
npx wrangler login               # First time: authenticate
npx wrangler secret put SUPABASE_URL        # Set production secrets
npx wrangler secret put SUPABASE_SERVICE_KEY
npm run deploy                   # Deploy to Cloudflare Workers
```

Then set `EXPO_PUBLIC_API_URL` to the deployed Worker URL in Vercel dashboard.

## Mobile Builds (EAS)

```bash
npx eas build --platform android --profile development   # Dev APK
npx eas build --platform android --profile preview        # Preview APK
npx eas build --platform android --profile production     # Production AAB
npx eas build --platform ios --profile development        # Dev IPA
```

## Tech Stack

- **Frontend**: Expo SDK 54 (React Native 0.81 + React 19)
- **Routing**: Expo Router (file-based)
- **Backend**: Cloudflare Workers + Hono
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript (strict)
- **Hosting (Web)**: Vercel + Cloudflare Pages (dual deployment)
- **Mobile Builds**: EAS Build
- **CI/CD**: GitHub push → auto build & deploy
