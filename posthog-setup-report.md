<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the **DevEvent** Next.js App Router application. The following changes were made:

- **`instrumentation-client.ts`** (new) — Initialises PostHog client-side using the `instrumentation-client` pattern recommended for Next.js 15.3+. Configures a reverse-proxy ingestion path (`/ingest`), the `2026-01-30` defaults snapshot, automatic exception/error tracking (`capture_exceptions: true`), and debug logging in development.
- **`next.config.ts`** (updated) — Added `rewrites()` to proxy PostHog ingestion requests through `/ingest/*` to `us.i.posthog.com`, reducing the chance of ad-blocker interference. Added `skipTrailingSlashRedirect: true` as required by PostHog.
- **`components/ExploreBtn.tsx`** (updated) — Added `'use client'` directive and a `posthog.capture('explore_events_clicked')` call inside the existing `onClick` handler.
- **`components/EventCard.tsx`** (updated) — Added `'use client'` directive and a `posthog.capture('event_card_clicked', { event_title, event_slug, event_location, event_date })` call on the `Link`'s `onClick`, capturing rich properties for per-event analysis.
- **`components/Navbar.tsx`** (updated) — Added `'use client'` directive and a `posthog.capture('nav_link_clicked', { nav_label })` call on every navbar link, enabling breakdown analysis of navigation intent.
- **`.env.local`** (created/updated) — `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` set securely via environment variables; `.gitignore` coverage confirmed.

| Event name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the "Explore Events" CTA button to scroll to the events list | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks an event card to view its detail page — top of the event-detail conversion funnel | `components/EventCard.tsx` |
| `nav_link_clicked` | User clicks a navigation link in the main navbar (Home, Events, Create Event, Logo) | `components/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- 📊 **Dashboard — Analytics basics**: https://us.posthog.com/project/321652/dashboard/1302110
- 📈 **Event card clicks over time**: https://us.posthog.com/project/321652/insights/Gllb6Xla
- 📈 **Homepage engagement: Explore clicks vs Event card clicks**: https://us.posthog.com/project/321652/insights/Zth5hCKg
- 🔽 **Homepage to event detail conversion funnel**: https://us.posthog.com/project/321652/insights/zHlVcLrC
- 📊 **Nav link clicks by destination**: https://us.posthog.com/project/321652/insights/2hvpzVcn
- 📊 **Most clicked events by title**: https://us.posthog.com/project/321652/insights/pJ9ZcXet

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
