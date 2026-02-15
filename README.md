# My Claude Web App

A full-stack playground app running on **iOS, Android, and Web** from a single TypeScript codebase.

- **Frontend**: Expo (React Native) — file-based routing, dark theme, cross-platform UI
- **Backend**: Cloudflare Workers + Hono — edge-deployed API with structured routing
- **Database**: Supabase (PostgreSQL) — accessed only from the backend (BFF pattern)

---

## Architecture

```
┌─────────────────────┐      HTTPS      ┌──────────────────────┐      HTTPS      ┌──────────────┐
│  iOS / Android / Web │ ──────────────> │  Cloudflare Workers   │ ──────────────> │   Supabase   │
│                      │                 │  (Hono API)           │                 │  (PostgreSQL) │
│  Expo (React Native) │                 │                       │                 │              │
│  Static output       │                 │  BFF middle layer     │                 │  Data store  │
└─────────────────────┘                  └──────────────────────┘                  └──────────────┘
   Deployed to:                            Deployed to:                              Hosted:
   Vercel (global CDN)                     Cloudflare Workers                        Supabase Cloud
   CF Pages (China-accessible)             (wrangler deploy)
```

**Data flow**: The client (mobile or web) only talks to the Cloudflare Worker. The Worker talks to Supabase. Database credentials (`service_role` key) never leave the server side.

**Why this architecture**:
- **BFF (Backend for Frontend)**: The Worker acts as an API gateway. Secrets stay server-side, and you can add caching, rate limiting, or business logic without changing the frontend.
- **Cloudflare for China accessibility**: Cloudflare's network is reachable from mainland China (unlike Vercel/AWS). Both the frontend (CF Pages) and backend (CF Workers) are accessible.
- **Static frontend**: The Expo web build produces plain HTML/JS/CSS (`expo export --platform web`). No server rendering needed. This keeps hosting simple and fast.

---

## Live URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Vercel | https://my-claude-web-app.vercel.app | Web frontend (global) |
| Cloudflare Pages | https://my-claude-web-app.pages.dev | Web frontend (China-accessible) |
| Cloudflare Workers | https://my-claude-web-app-api.shalong5794.workers.dev | Backend API |

---

## Project Structure

```
my-claude-web-app/
│
├── app/                              # Expo Router — file-based routing
│   ├── _layout.tsx                   # Root layout: Stack navigator + dark/light theme
│   ├── index.tsx                     # Home screen: title, info card, demo links
│   ├── +not-found.tsx                # 404 catch-all screen
│   └── demo/
│       ├── _layout.tsx               # Demo section layout (Stack, dark header)
│       └── notes.tsx                 # Notes CRUD page (calls Worker API)
│
├── assets/images/                    # App icons, splash screen, favicon
├── constants/theme.ts                # Color palette + font tokens (light/dark)
├── hooks/
│   ├── use-color-scheme.ts           # Native: re-exports RN useColorScheme
│   ├── use-color-scheme.web.ts       # Web: hydration-safe color scheme hook
│   └── use-theme-color.ts            # Returns themed color by name
│
├── workers/                          # Cloudflare Worker — backend API (separate npm project)
│   ├── src/
│   │   ├── index.ts                  # Hono app entry: mounts middleware + routes
│   │   ├── types.ts                  # TypeScript types: Env bindings, Note interface
│   │   ├── lib/
│   │   │   └── supabase.ts           # Supabase client factory (per-request, stateless)
│   │   ├── middleware/
│   │   │   ├── cors.ts               # CORS: allows cross-origin requests from frontend
│   │   │   └── error-handler.ts      # Catches exceptions → JSON error responses
│   │   └── routes/
│   │       ├── health.ts             # GET /health — status check
│   │       └── notes.ts              # GET /notes — list; POST /notes — create
│   ├── wrangler.toml                 # Cloudflare Worker config (name, entry, compat date)
│   ├── tsconfig.json                 # Strict TS, ESNext target, Workers types
│   ├── package.json                  # Deps: hono, @supabase/supabase-js, wrangler
│   ├── .dev.vars.example             # Template for local dev secrets
│   └── .dev.vars                     # Actual secrets (git-ignored)
│
├── app.json                          # Expo config: name, slug, icons, plugins, experiments
├── eas.json                          # EAS Build profiles: development / preview / production
├── vercel.json                       # Vercel: build command, output dir, SPA rewrites
├── public/_redirects                 # Cloudflare Pages: SPA fallback rule
├── tsconfig.json                     # Root TS config: extends expo/tsconfig.base, strict
├── eslint.config.js                  # ESLint: extends eslint-config-expo
├── .env.example                      # Frontend env var template
├── .env                              # Local frontend env vars (git-ignored)
├── .gitignore                        # Ignores: node_modules, dist, .env, .dev.vars, etc.
├── scripts/reset-project.js          # Expo utility: reset app/ to blank state
└── package.json                      # Root: Expo SDK 54 + React Native 0.81 + React 19
```

---

## File-by-File Explanation

### Frontend

**`app/_layout.tsx`** — Root layout. Wraps the entire app in a `ThemeProvider` (dark/light based on system preference) and defines a `Stack` navigator with three screen slots: `index` (home), `demo` (nested layout), and `+not-found` (404).

**`app/index.tsx`** — Home screen. Shows the app title, a description card, and a "Notes Demo" link card using `expo-router`'s `<Link>` component. Uses `Platform.OS` to display the current platform.

**`app/+not-found.tsx`** — Catch-all 404 screen. Shown when navigating to a route that doesn't exist. Contains a link back to home.

**`app/demo/_layout.tsx`** — Layout for the `/demo/*` routes. A `Stack` navigator with a dark-themed header and back button.

**`app/demo/notes.tsx`** — The Notes demo page. Reads `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:8787`). On mount, fetches `GET /notes` from the Worker. Has a text input + "Add" button that `POST /notes`. Uses `FlatList` to render notes in reverse chronological order. All error states are handled and displayed.

**`constants/theme.ts`** — Defines `Colors` (light/dark palettes) and `Fonts` (platform-specific font stacks for sans, serif, mono, rounded).

**`hooks/use-color-scheme.ts`** — Native platforms: re-exports React Native's `useColorScheme`.

**`hooks/use-color-scheme.web.ts`** — Web platform: wraps `useColorScheme` with hydration safety (returns `'light'` during SSR, actual scheme after client hydration). Expo automatically picks the `.web.ts` version on web builds.

**`hooks/use-theme-color.ts`** — Takes a color name and optional per-theme overrides, returns the resolved color string from the current theme.

### Backend

**`workers/src/index.ts`** — Hono app entry point. Mounts two global middleware (CORS, error handler) on all routes, then registers the `health` and `notes` route modules.

**`workers/src/types.ts`** — Defines the `Env` interface (Cloudflare Worker bindings: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) and the `Note` data type.

**`workers/src/lib/supabase.ts`** — Factory function `createSupabaseClient(env)`. Creates a new Supabase client per request using the `service_role` key from Worker secrets. Stateless — Workers don't persist state between requests.

**`workers/src/middleware/cors.ts`** — Exports a Hono CORS middleware configured with `origin: '*'` (all origins allowed for demo; restrict in production), allowing GET/POST/OPTIONS with Content-Type header. Caches preflight for 24 hours.

**`workers/src/middleware/error-handler.ts`** — Wraps `await next()` in try/catch. Hono `HTTPException` errors preserve their status code; all other errors return 500. Logs to console for Worker observability.

**`workers/src/routes/health.ts`** — `GET /health` returns `{ status, timestamp, runtime }`. No database call — useful for uptime monitoring and deployment verification.

**`workers/src/routes/notes.ts`** — Two endpoints:
- `GET /notes` — Queries the `notes` table, ordered by `created_at` descending, limited to 50 rows.
- `POST /notes` — Validates that `body.content` is a non-empty string, inserts into `notes`, returns the created row with status 201.

### Configuration

**`app.json`** — Expo configuration. Key settings: `slug` (URL-safe project name), `scheme` (deep linking), `web.output: "static"` (static export, not server rendering), `newArchEnabled: true` (React Native New Architecture), `experiments.typedRoutes` (type-safe routing), `experiments.reactCompiler` (React Compiler).

**`vercel.json`** — Tells Vercel: build with `npx expo export --platform web`, serve from `dist/`, rewrite all paths to `/` (SPA fallback).

**`public/_redirects`** — Cloudflare Pages equivalent of SPA fallback: `/* /index.html 200`.

**`eas.json`** — EAS Build profiles. `development` (dev client, internal distribution), `preview` (internal distribution), `production` (store-ready).

**`workers/wrangler.toml`** — Cloudflare Worker config. Sets the Worker name (`my-claude-web-app-api`), entry point (`src/index.ts`), compatibility date, and enables observability logging.

---

## Environment Variables

The app uses `EXPO_PUBLIC_*` prefix for frontend env vars (embedded at build time by Metro/Expo) and Worker secrets for backend credentials.

| Variable | Where | Purpose |
|----------|-------|---------|
| `EXPO_PUBLIC_API_URL` | Frontend (all platforms) | Worker API base URL |
| `SUPABASE_URL` | Worker secrets | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Worker secrets | Supabase `service_role` JWT |

**How each environment reads the variables:**

| Environment | Frontend vars | Backend secrets |
|-------------|--------------|-----------------|
| Local dev | `.env` file | `workers/.dev.vars` file |
| Vercel | Vercel Dashboard → Environment Variables | N/A |
| Cloudflare Pages | CF Dashboard → Pages → Environment Variables | N/A |
| Cloudflare Workers | N/A | `wrangler secret put` or CF Dashboard → Workers → Settings |
| EAS Build (mobile) | `eas secret:create` or Expo Dashboard | N/A |

---

## How to Reproduce This Project from Scratch

### Prerequisites

- Node.js 20+ (recommend 22 LTS)
- A GitHub account
- A Cloudflare account (free)
- A Supabase account (free)
- A Vercel account (free)
- (Optional) iPhone/Android with Expo Go for mobile testing

### Step 1: Create the Expo project

```bash
npx create-expo-app@latest my-claude-web-app
cd my-claude-web-app
```

This generates a full Expo project with file-based routing (`app/` directory), TypeScript, and example components.

### Step 2: Simplify the app structure

The scaffold includes tabs and example screens. To simplify to a single-page app:

```bash
npm run reset-project
```

This moves the scaffold's `app/`, `components/`, `hooks/`, `constants/` to `app-example/` and creates a minimal `app/index.tsx` + `app/_layout.tsx`.

Customize `app/_layout.tsx` with theme support and `app/index.tsx` with your content.

### Step 3: Configure app identity

Edit `app.json`:
- Set `name`, `slug`, `scheme` to your project name
- Set `ios.bundleIdentifier` and `android.package` (e.g., `com.yourname.myapp`)
- Configure icons and splash screen paths under `assets/images/`

### Step 4: Set up web deployment

**Vercel:**
1. Push to GitHub
2. Import the repo in Vercel dashboard
3. Create `vercel.json`:
   ```json
   {
     "buildCommand": "npx expo export --platform web",
     "outputDirectory": "dist",
     "framework": null,
     "rewrites": [{ "source": "/:path*", "destination": "/" }]
   }
   ```

**Cloudflare Pages:**
1. In CF dashboard → Pages → Create project → Connect to GitHub repo
2. Build command: `npx expo export --platform web`
3. Output directory: `dist`
4. Create `public/_redirects` with: `/*    /index.html   200`

Both platforms auto-deploy on every push to `main`.

### Step 5: Create the Supabase database

1. Go to https://supabase.com → Create project (free tier)
2. In SQL Editor, run:
   ```sql
   CREATE TABLE notes (
     id BIGSERIAL PRIMARY KEY,
     content TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```
3. Note your **Project URL** and **service_role key** from Settings → API

### Step 6: Create the Cloudflare Worker backend

```bash
mkdir -p workers/src/{middleware,routes,lib}
cd workers
npm init -y
npm install hono @supabase/supabase-js
npm install -D wrangler @cloudflare/workers-types typescript
```

Create the files as shown in the Project Structure section:
- `wrangler.toml` — Worker name, entry point, compatibility date
- `src/types.ts` — `Env` bindings interface, data types
- `src/lib/supabase.ts` — Client factory using `service_role` key
- `src/middleware/cors.ts` — CORS config with `hono/cors`
- `src/middleware/error-handler.ts` — try/catch → JSON error
- `src/routes/health.ts` — `GET /health` status endpoint
- `src/routes/notes.ts` — `GET /notes` (list) + `POST /notes` (create)
- `src/index.ts` — Mount middleware and routes, export `app`

Create `workers/.dev.vars` for local development:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key
```

Test locally:
```bash
npm run dev                           # starts on http://localhost:8787
curl http://localhost:8787/health     # should return JSON
```

### Step 7: Add the frontend demo page

- Create `app/demo/_layout.tsx` — Stack layout with dark header
- Create `app/demo/notes.tsx` — Notes CRUD page that fetches from `EXPO_PUBLIC_API_URL`
- Update `app/_layout.tsx` — Register the `demo` route
- Update `app/index.tsx` — Add a link to `/demo/notes`
- Create `.env` with `EXPO_PUBLIC_API_URL=http://localhost:8787`

Test locally:
```bash
npx expo start --web                  # open in browser, click Notes Demo
```

### Step 8: Deploy the Worker to production

```bash
cd workers
npx wrangler login                    # authorize in browser
npm run deploy                        # deploys to Cloudflare Workers
npx wrangler secret put SUPABASE_URL            # paste your Supabase URL
npx wrangler secret put SUPABASE_SERVICE_KEY    # paste your service_role key
```

Note the deployed URL (e.g., `https://my-claude-web-app-api.xxx.workers.dev`).

### Step 9: Connect frontend to production backend

Set `EXPO_PUBLIC_API_URL` in each deployment platform:

1. **Vercel**: Settings → Environment Variables → `EXPO_PUBLIC_API_URL` = `https://your-worker-url` → Redeploy
2. **Cloudflare Pages**: Settings → Environment Variables → same → Redeploy
3. **Local `.env`**: update if needed

Important: use `https://` (not `http://`). Browsers block mixed content (HTTPS page calling HTTP API).

### Step 10: (Optional) Mobile testing

```bash
# Local dev with tunnel (for Expo Go on physical device)
npx expo start --tunnel

# Production mobile build via EAS
eas secret:create --name EXPO_PUBLIC_API_URL --value https://your-worker-url
eas build --platform android --profile preview
```

---

## Local Development

```bash
# Terminal 1: Backend
cd workers
npm run dev                           # http://localhost:8787

# Terminal 2: Frontend
npx expo start --web                  # http://localhost:8081 (web)
npx expo start --tunnel               # for Expo Go on physical device
```

## Deployment Commands

```bash
# Frontend: automatic on git push to main (Vercel + CF Pages)
git push

# Backend: manual
cd workers && npm run deploy

# Mobile: via EAS
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

---

## Known Issues

- **`*.workers.dev` domain blocked in China**: The default Workers domain is unreliable in mainland China. Solution: bind the Worker to a custom domain via Cloudflare Dashboard → Workers → Settings → Domains & Routes. Custom domains through Cloudflare's CDN are China-accessible.
- **WSL2 + Expo Go**: WSL2 uses a virtual network. `--lan` mode won't reach the phone. Use `--tunnel` instead (requires `@expo/ngrok`).
- **`EXPO_PUBLIC_*` are build-time only**: Changes to these env vars require a rebuild/restart. They are baked into the JS bundle during `expo export` or `expo start`.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | Expo (React Native) | SDK 54 |
| UI runtime | React Native | 0.81.5 |
| React | React | 19.1.0 |
| Routing | Expo Router | 6.x (file-based) |
| Language | TypeScript | 5.9 (strict) |
| Backend framework | Hono | 4.7 |
| Backend runtime | Cloudflare Workers | V8 isolates |
| Database | Supabase (PostgreSQL) | - |
| Web hosting | Vercel + Cloudflare Pages | dual deployment |
| Mobile builds | EAS Build | - |
| CI/CD | GitHub → auto deploy | push to main |
