# RepoDeck PWA

RepoDeck is an online-first installable Progressive Web App. The PWA layer is intentionally small: installation metadata, account-bound Web Push, and one self-contained offline navigation fallback. Private GitHub/repository data is never stored in Cache Storage.

## Architecture

- `src/app/manifest.ts` defines the App Router web app manifest.
- `src/app/icon.png` and `src/app/apple-icon.png` use Next.js file-based icon metadata.
- `src/components/pwa/PwaManager.tsx` registers `/sw.js`, handles install UX, reconciles browser subscriptions with the signed-in account, and gates iOS push until Home Screen installation.
- `public/sw.js` handles Web Push, same-origin notification clicks, and network-failed document navigations.
- `public/offline.html` is the only resource intentionally stored in service-worker Cache Storage. It is standalone HTML/CSS with no Next.js runtime dependency.
- `src/app/actions.ts` persists subscriptions, enforces ownership/device limits, rate-limits test sends in Postgres, and removes expired subscriptions.
- `src/lib/pwa/web-push.ts` validates browser push-service endpoints before delegating Web Push protocol/encryption to `web-push`.

### Deliberate non-features

RepoDeck does **not** service-worker-cache the Next.js application shell, React Server Component payloads, `/api/*`, `/_next/image`, repository trees/files, authenticated HTML, or arbitrary images/assets. Repository viewing remains network-dependent by design.

## Configure Web Push

Generate a VAPID key pair once:

```bash
pnpm pwa:vapid
```

Configure the generated values locally and in production:

```dotenv
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
```

Optional additional browser push-service hosts can be configured as a comma-separated allowlist:

```dotenv
PUSH_ENDPOINT_EXTRA_HOSTS=push.example.com,another-push.example.com
```

Keep the VAPID private key secret and keep the production keypair stable. Apply database migrations before enabling push:

```bash
pnpm db:migrate
```

## Account safety

Push subscriptions are account-bound. RepoDeck never silently transfers an existing browser endpoint to another user. Logout first attempts to revoke the endpoint for the authenticated user on the server, then clears the auth session; browser-level `unsubscribe()` is best-effort. Multi-tab auth/PWA state is synchronized with `BroadcastChannel` when supported.

Authentication is modeled as `loading | authenticated | anonymous | error` for PWA reconciliation. Only a successfully confirmed anonymous session may automatically remove a browser subscription. A failed or unknown session request leaves browser push state unchanged.

The subscription ownership check returns only whether the current user owns an endpoint. It never identifies another account. Test notification sends use a shared Postgres-backed per-user rate limit (5/minute) whose buckets and cleanup cutoff use PostgreSQL time, and accounts are capped at 30 active subscriptions. Before enforcing that cap, RepoDeck removes subscriptions that are explicitly expired or have not been refreshed/used successfully for one year. Database indexes support rate-limit retention cleanup and per-user stale-subscription pruning.

## Service-worker lifecycle

The worker URL remains `/sw.js` and registration uses `updateViaCache: "none"`. `/sw.js` is served with `Cache-Control: no-cache`. The worker does not call `skipWaiting()` or `clients.claim()`; updates follow the normal service-worker lifecycle so existing tabs are not unexpectedly taken over by a new worker version.

Cache Storage should contain only the current `repodeck-offline-vN` cache with `/offline.html`. Offline fallback reads are made from that specific cache, not by searching every origin cache. Old RepoDeck offline-cache versions are deleted during activation. When the offline fallback changes materially, bump the cache version in `public/sw.js` so the worker bytes change and the new fallback is installed.

## Local testing

Run over HTTPS:

```bash
pnpm dev:https
```

For authenticated testing, configure the development GitHub App callback URLs to use the same HTTPS origin. Then verify:

1. `/manifest.webmanifest`, install icons, `/sw.js`, and `/offline.html` load successfully.
2. Install UX works without blocking normal RepoDeck use.
3. Sign in, explicitly enable notifications, and send a test notification.
4. Notification clicks focus/open the expected same-origin RepoDeck route.
5. Sign out and confirm the subscription is revoked for that account; a different account on the same browser must explicitly opt in again.
6. Disable the network and navigate to an uncached document route; the standalone offline page should appear.
7. Inspect DevTools Cache Storage: no API, RSC, repository, image, or authenticated application responses should be present.
8. Simulate a temporary `/api/auth/session` failure and confirm the existing browser PushSubscription is left untouched.
9. Test a worker update with multiple tabs open; the new worker should wait rather than force-take over old pages.
10. In Chrome DevTools, preview the maskable icon with the minimum safe area enabled and verify the complete RepoDeck mark remains visible.

On supported iOS/iPadOS versions, install RepoDeck to the Home Screen before enabling Web Push. `beforeinstallprompt` is treated only as progressive enhancement on browsers that expose it.

## Production validation

Before release, run the normal project checks and a production-mode browser pass:

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
pnpm start
```

Test installation, offline fallback, push delivery while the app is not foregrounded, notification click routing, logout/account switching, service-worker updates, and multi-tab behavior on the browsers/devices you support.

If RepoDeck later needs real offline repository data, application-shell precaching, background sync, or complex runtime caching, migrate the worker to the current Serwist integration for RepoDeck's active Next.js bundler rather than growing the handwritten worker.
