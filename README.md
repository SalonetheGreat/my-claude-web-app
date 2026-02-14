# My Claude Web App

A playground for various demo / test apps, built with **Expo (React Native)** — runs on iOS, Android, and Web from a single codebase.

## Live URLs

| Platform | URL | Notes |
|---|---|---|
| Vercel | https://my-claude-web-app.vercel.app | Global CDN |
| Cloudflare Pages | https://my-claude-web-app.pages.dev | China-accessible |

## Deployment Pipeline

```
local dev ──push──> GitHub (main) ──auto──> Vercel  (expo export --platform web)
                                  ──auto──> Cloudflare Pages
```

Both platforms watch the `main` branch. Every push triggers parallel builds and deployments.

## Project Structure

```
├── app/
│   ├── _layout.tsx          # Root layout (navigation + theme)
│   ├── index.tsx            # Home screen
│   └── +not-found.tsx       # 404 screen
├── assets/images/           # App icons, splash screen
├── components/              # Reusable components (future)
├── constants/theme.ts       # Color & font tokens
├── hooks/                   # Custom hooks (useColorScheme, useThemeColor)
├── scripts/reset-project.js # Reset to blank Expo project
├── app.json                 # Expo config
├── eas.json                 # EAS Build profiles
├── vercel.json              # Vercel deployment config
├── public/_redirects        # Cloudflare Pages SPA fallback
├── tsconfig.json            # TypeScript config
├── eslint.config.js         # ESLint config
└── package.json
```

## Development

```bash
npm install                  # Install dependencies
npx expo start --web         # Start web dev server
npx expo start --android     # Start Android dev (requires emulator or Expo Go)
npx expo start --ios         # Start iOS dev (macOS only, or Expo Go)
npx expo export --platform web  # Production web build (output: dist/)
npx expo lint                # Run ESLint
```

## Mobile Builds (EAS)

```bash
npx eas build --platform android --profile development   # Dev APK
npx eas build --platform android --profile preview        # Preview APK
npx eas build --platform android --profile production     # Production AAB
npx eas build --platform ios --profile development        # Dev IPA (requires Apple account)
```

## Tech Stack

- **Framework**: Expo SDK 54 (React Native 0.81 + React 19)
- **Routing**: Expo Router (file-based)
- **Language**: TypeScript
- **Hosting (Web)**: Vercel + Cloudflare Pages (dual deployment)
- **Mobile Builds**: EAS Build
- **CI/CD**: GitHub push → auto build & deploy
