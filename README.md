# My Claude Web App

A playground for various demo / test apps, built with React + Vite (TypeScript).

## Live URLs

| Platform | URL | Notes |
|---|---|---|
| Vercel | https://my-claude-web-app.vercel.app | Global CDN |
| Cloudflare Pages | https://my-claude-web-app.pages.dev | China-accessible |

## Deployment Pipeline

```
local dev ──push──> GitHub (main) ──auto──> Vercel
                                  ──auto──> Cloudflare Pages
```

Both platforms watch the `main` branch. Every push triggers parallel builds and deployments — no manual steps needed.

## Project Structure

```
├── index.html            # Entry HTML
├── src/
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Root component
│   ├── App.css           # App styles
│   ├── index.css         # Global styles
│   └── assets/           # Static assets (images, etc.)
├── public/               # Files served as-is (favicon, etc.)
├── vite.config.ts        # Vite config
├── tsconfig.json         # TypeScript config
├── eslint.config.js      # ESLint config
└── package.json
```

## Development

```bash
npm install               # Install dependencies
npm run dev               # Start dev server (http://localhost:5173)
npm run build             # Production build (output: dist/)
npm run preview           # Preview production build locally
npm run lint              # Run ESLint
```

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build tool**: Vite 7
- **Hosting**: Vercel + Cloudflare Pages (dual deployment)
- **CI/CD**: GitHub push → auto build & deploy
