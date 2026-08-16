# RepoDeck security model

RepoDeck is designed to read GitHub data without turning the browser into a credential-bearing GitHub client or the application into a repository editor.

## Access control

- Anonymous requests can read only public data that GitHub exposes without authentication.
- Signed-in access uses GitHub App user authorization rather than a global personal access token.
- Private access is limited by the repositories selected during GitHub App installation and the permissions granted to the App.
- The App requires only Metadata: Read-only and Contents: Read-only.
- The application has no file-write, commit, push, issue, pull-request, or local-execution operation.
- The public demo reads only the fixed, public RepoDeck snapshot; it does not grant anonymous access to arbitrary or private repositories.

GitHub enforces the repository boundary on each non-demo request. RepoDeck stores installation metadata for lifecycle tracking and a bounded public demo snapshot; it does not create a second content or permission database for user repositories.

## OAuth and session controls

- GitHub sign-in uses a random state value and PKCE with the S256 method.
- State, PKCE verifier, and return-path cookies are HTTP-only, short-lived, SameSite Lax, and scoped to the auth routes.
- OAuth callback state is compared with a timing-safe equality check.
- Return paths are restricted to same-site paths that begin with a single slash.
- The application session is a signed HS256 JWT in an HTTP-only cookie with a 30-day lifetime.
- Session cookies are marked Secure in production.
- Sign-out clears the session cookie through a POST route.

## Token protection

GitHub access and refresh tokens are encrypted with AES-256-GCM before being written to the github_accounts table. The key is supplied by GITHUB_TOKEN_ENCRYPTION_KEY as a 32-byte value encoded with exactly 64 hexadecimal characters.

Token handling stays server-side:

1. The browser starts OAuth and receives redirects plus the eventual session cookie.
2. The callback exchanges the code and stores encrypted token material in Postgres.
3. GitHub route handlers decrypt the token only to create a request-scoped Octokit client.
4. The browser receives normalized repository and file data, never the GitHub token or App client secret.

When the access token is close to expiry, the server refreshes it with the encrypted refresh token and stores the replacement. Losing the encryption key makes existing token rows unreadable, so key rotation requires re-encryption or reauthorization.

## Webhook verification

The webhook route accepts installation lifecycle events only after validating the x-hub-signature-256 HMAC with GITHUB_APP_WEBHOOK_SECRET and a timing-safe comparison. Invalid or missing signatures return HTTP 401.

Set a unique webhook secret in every environment where the GitHub App webhook is enabled. Use a secure HTTPS tunnel instead of exposing an unauthenticated local endpoint during development.

## Request isolation and caching

Every GitHub route resolves the current session for the request. Anonymous and authenticated clients are created separately. Authenticated tree and file responses are explicitly marked private and are never shared-cached:

```text
Public branches, trees, files, and raw media:
public, max-age=0, s-maxage=60, stale-while-revalidate=300

Authenticated branches, trees, files, and raw media:
private, no-store
```

The public cache improves arbitrary anonymous browsing, while the fixed demo snapshot avoids repeated anonymous GitHub requests altogether. The demo contains only public RepoDeck source; private responses explicitly opt out of shared caching and are never written to the demo tables.

## Validation and error handling

- Repository, branch, tree, and file query parameters are validated with Zod at the server boundary.
- GitHub responses are normalized before they reach client components.
- Not-found, unauthorized, forbidden, and rate-limit failures use stable status codes and JSON messages.
- Rate-limit responses use HTTP 429 and preserve reset or retry metadata when GitHub supplies it.
- The global SWR provider does not retry 401 or 404 responses; generic failures may retry up to three times.

## Browser-local data

The browser may store recent repository selections, recent file paths, expanded folders, appearance preferences, and panel layout in localStorage. These values do not include GitHub tokens or file contents. Users sharing a device should clear browser storage and sign out when appropriate.

## Data retention

- Users, encrypted OAuth credentials, and GitHub installation metadata are stored in Neon Postgres.
- The fixed public RepoDeck demo tree and bounded file contents are stored in dedicated application tables.
- Arbitrary and private repository trees and file contents are fetched on demand and are not written to application tables.
- Public HTTP responses can be held briefly by shared caching infrastructure.
- There is no repository-content index, chat persistence, Redis session store, password database, AI provider key store, or background repository worker.

## Deployment checklist

Before exposing an environment to users:

- use HTTPS and verify production cookies are Secure;
- use separate GitHub Apps, databases, secrets, and encryption keys for local and production;
- verify the App has only Metadata and Contents read-only permissions;
- configure and test the webhook secret and installation events;
- confirm all callback and Setup URLs exactly match the deployed origin;
- keep environment secrets out of version control and deployment logs;
- run migrations from a trusted environment and review generated SQL;
- test anonymous public access, authenticated access, private access, invalid webhooks, expired sessions, and rate-limit handling.

This page documents the current implementation. It does not replace provider configuration review, secret-rotation procedures, or an organization’s broader security policy.
