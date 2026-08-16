# RepoDeck deployment

This page describes the current deployment shape and the configuration required to run RepoDeck locally or in production.

## Deployment topology

- Next.js App Router application hosted on Vercel.
- Neon Postgres accessed through the Neon serverless driver and Drizzle ORM.
- A GitHub App for user authorization and repository installation.
- A signed session cookie for browser sessions.
- GitHub installation webhooks for suspension and revocation updates.

Production and local development use separate GitHub Apps because each App has its own installation setup configuration:

| Environment       | App slug             | Base URL                   |
| ----------------- | -------------------- | -------------------------- |
| Production        | repodeck             | https://repodeck.abdok.dev |
| Local development | repodeck-development | http://localhost:3000      |

Use a separate database, OAuth credentials, webhook secret, and encryption key for environments that should not share stored credentials.

## Prerequisites

- Node.js 20 or newer
- pnpm
- A Neon Postgres database
- A GitHub App with the permissions described below
- A deployment target with HTTPS for production callbacks and webhooks

## GitHub App configuration

### Repository permissions

Grant only:

- Metadata: Read-only
- Contents: Read-only

The current code does not require write, administration, issue, pull-request, deployment, or workflow permissions.

### User authorization

Enable GitHub App user authorization and expiring user access tokens. Configure the user authorization callback URL to the value of GITHUB_APP_CALLBACK_URL.

Production callback:

```text
https://repodeck.abdok.dev/api/auth/github/callback
```

Local callback:

```text
http://localhost:3000/api/auth/github/callback
```

### Installation setup

Configure the GitHub App Setup URL to the value of GITHUB_APP_INSTALL_CALLBACK_URL.

Production Setup URL:

```text
https://repodeck.abdok.dev/api/github/install/callback
```

Local Setup URL:

```text
http://localhost:3000/api/github/install/callback
```

The app redirects users to the GitHub App installation page at github.com/apps/<slug>/installations/new with a short-lived state value. Users can select individual repositories or the appropriate account-level scope, and GitHub remains responsible for enforcing that selection.

### Webhook

Configure the GitHub App webhook URL as:

```text
https://repodeck.abdok.dev/api/github/webhook
```

Subscribe to installation events and set a strong webhook secret. The local callback requires a reachable HTTPS tunnel if GitHub must deliver webhooks to a local process. The current handler processes installation actions deleted, suspend, and unsuspend.

## Environment variables

Copy .env.example to the environment-specific file and replace every placeholder. Runtime validation is defined in src/env.ts.

| Variable                        | Required    | Description                                              |
| ------------------------------- | ----------- | -------------------------------------------------------- |
| DATABASE_URL                    | Yes         | Neon Postgres connection string.                         |
| AUTH_SECRET                     | Yes         | At least 32 characters; signs session cookies.           |
| GITHUB_APP_CLIENT_ID            | Yes         | OAuth client ID for the target GitHub App.               |
| GITHUB_APP_CLIENT_SECRET        | Yes         | OAuth client secret for the target GitHub App.           |
| GITHUB_APP_SLUG                 | Yes         | App slug used to create installation URLs.               |
| GITHUB_APP_CALLBACK_URL         | Yes         | Exact GitHub user authorization callback URL.            |
| GITHUB_APP_INSTALL_CALLBACK_URL | Yes         | Exact GitHub App Setup URL.                              |
| GITHUB_APP_WEBHOOK_SECRET       | Conditional | Required to verify enabled webhooks.                     |
| GITHUB_TOKEN_ENCRYPTION_KEY     | Yes         | Exactly 64 hexadecimal characters representing 32 bytes. |
| NODE_ENV                        | Yes         | development, production, or test.                        |

Do not commit environment files, database credentials, OAuth secrets, webhook secrets, session secrets, or encryption keys.

The token-encryption key protects stored access and refresh tokens. Rotating it without re-encrypting existing rows makes those rows unreadable, so key rotation requires a controlled migration or user reauthorization plan.

## Database migrations

The checked-in migration files are under drizzle/. Apply them from a trusted environment:

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
```

After changing src/lib/db/schema.ts:

```bash
pnpm db:generate
pnpm db:migrate
```

Review generated SQL before applying it. Do not use production as an exploratory migration target.

## Local development

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm db:migrate
pnpm dev
```

Use the development App values in .env.local:

```text
GITHUB_APP_SLUG=repodeck-development
GITHUB_APP_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
GITHUB_APP_INSTALL_CALLBACK_URL=http://localhost:3000/api/github/install/callback
```

Open http://localhost:3000 after the server starts.

## Vercel

The current production wiring is:

- Project: repodeck
- Repository: Abdo12KM/repodeck
- Deployment branch: main
- Custom domain: repodeck.abdok.dev

Set the variables from .env.example in the Vercel environment that serves the deployment. Production and preview deployments should not accidentally share production GitHub credentials or token-encryption keys.

A self-hosted deployment can use:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Run database migrations before routing traffic to a build that expects a new schema.

## DNS

The current custom-domain record is:

```text
repodeck CNAME cname.vercel-dns.com
```

If the domain or host changes, update DNS, GitHub App callback URLs, the Setup URL, the webhook URL, and the environment values together.

## Verification checklist

1. Open the landing page and launch a known public repository anonymously.
2. Open a direct tree or blob URL and confirm branch and path state are restored.
3. Sign in and load the authenticated repository picker.
4. Refresh repositories and switch branches.
5. Complete a GitHub App installation with a test repository.
6. Read a private file and confirm no token is exposed to browser JavaScript.
7. Send a signed installation webhook and verify the stored installation state changes.
8. Confirm invalid webhook signatures return HTTP 401.
9. Confirm GitHub rate limits are surfaced as HTTP 429 responses.
