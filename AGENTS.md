# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

### Install
- `npm install`
- If you want a clean, lockfile-driven install: `npm ci`

### Dev
- Run the Next.js dev server: `npm run dev`
  - App is served at `http://localhost:3000`

### Build / run production
- Build: `npm run build`
- Start (after build): `npm run start`

### Lint
- Lint all: `npm run lint`
- Lint a single file/folder: `npx eslint components/Navbar.tsx` (or any path)

### Typecheck
- No dedicated script is defined; run TypeScript directly: `npx tsc --noEmit`

### Tests
- No test runner is configured in `package.json` (no `test` script).

## High-level architecture

### Framework + routing
- This is a Next.js **App Router** project.
- Routes and layouts live in `app/`:
  - `app/layout.tsx` is the root layout (global shell: fonts, `Navbar`, background effects).
  - `app/page.tsx` is the home page.

### Styling
- Global styles are in `app/globals.css`.
- Tailwind is wired via PostCSS (`postcss.config.mjs`) using `@tailwindcss/postcss` (Tailwind v4-style `@import 'tailwindcss'`).

### Components and shared code
- UI components live in `components/`.
  - Several components are client components (`'use client'`) due to event handlers / analytics.
  - shadcn/ui is configured via `components.json`; generated components are expected under `components/ui` (alias `@/components/ui`).
- Shared utilities and constants live in `lib/`:
  - `lib/utils.ts` provides `cn()` (clsx + tailwind-merge) for className composition.
  - `lib/constants.ts` currently contains static `events` data used by the homepage.

### Module resolution / imports
- TypeScript path alias is configured as `@/* -> ./*` in `tsconfig.json`, so imports like `@/components/Navbar` resolve from the repository root (not a `src/` directory).

### Analytics (PostHog)
- Client-side PostHog is initialized via Next.js’ `instrumentation-client.ts` entrypoint (`instrumentation-client.ts`).
- PostHog ingestion is reverse-proxied through the app via rewrites in `next.config.ts`:
  - `/ingest/*` -> PostHog cloud endpoints
  - `skipTrailingSlashRedirect: true` is set for PostHog compatibility
- Event capture is implemented directly in client components:
  - `components/ExploreBtn.tsx`: `explore_events_clicked`
  - `components/EventCard.tsx`: `event_card_clicked` (+ event properties)
  - `components/Navbar.tsx`: `nav_link_clicked` (+ nav label)
- Local env vars: components/instrumentation expect `NEXT_PUBLIC_POSTHOG_KEY` (and PostHog setup notes reference `NEXT_PUBLIC_POSTHOG_HOST`) via `.env.local` (gitignored by `.gitignore`).

## Notes for future work
- `EventCard` links to `/events/[slug]` (`/events/${slug}`), but there is currently no `app/events/...` route in the repo; adding an `app/events/[slug]/page.tsx` route would complete that flow.