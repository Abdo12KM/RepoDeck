# RepoDeck

<p align="center">
  <img src="public/logo-flat.png" alt="RepoDeck logo" width="96" />
</p>

<p align="center">
  A focused, read-only GitHub repository viewer for reading code comfortably across desktop and mobile.
</p>

RepoDeck opens repository trees and files directly from GitHub without cloning repositories to a local machine. Public repositories can be opened anonymously; signed-in users can browse their accessible repositories and connect selected private repositories through a read-only GitHub App installation.

## Highlights

- Open a repository with `owner/repo`, a GitHub URL, or a direct `tree`/`blob` URL.
- Browse branches and a virtualized file tree with folder expansion, filtering, and recent-file history.
- Search files, branches, repositories, and viewer actions from the command palette.
- Read source with Shiki syntax highlighting, line numbers, wrapping, font-size controls, and 18 code themes.
- Preview Markdown and images, including image zoom, transparency grid, copy, download, and “open on GitHub” actions.
- Keep repository, branch, and selected-file state in shareable `/repositories` URLs.
- Use a responsive desktop workspace, touch-friendly mobile drawers, and keyboard shortcuts.
- Customize application colors, code theme, typography, radius, and light/dark mode with 22 built-in appearance presets.

## Product boundaries

RepoDeck is intentionally a viewer, not an editor or Git client. The current application does not:

- edit files, create commits, push changes, open pull requests, or manage issues;
- clone repositories or execute repository code locally or on the server;
- persist arbitrary or private repository trees or file contents in the application database;
- use a global GitHub PAT, password login, Redis session store, AI provider, agent loop, or chat history.

The landing page includes one deliberate exception: the public RepoDeck demo uses a fixed snapshot of this repository stored in dedicated cache tables so anonymous visitors do not spend GitHub requests while exploring it. Other public repositories use short-lived response caching, and authenticated tree and file responses are marked private and are not shared-cached.

## Live application

The current production deployment is available at [repodeck.abdok.dev](https://repodeck.abdok.dev).

## Quick start

### Prerequisites

- Node.js 20 or newer
- pnpm
- A Neon Postgres database
- A GitHub App configured for RepoDeck

Anonymous browsing still requires the server environment to be configured because the application validates all server variables at startup.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create local configuration

Copy the example file to the local environment file and replace every placeholder:

```bash
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local` instead. Local development should use the separate `repodeck-development` GitHub App values, including the `http://localhost:3000` callback URLs.

### 3. Apply the database migration

The repository includes a checked-in Drizzle migration:

```bash
pnpm db:migrate
```

When the database schema changes, generate a new migration first, review it, and then apply it:

```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page is `/`; the repository workspace is `/repositories`.

## Environment variables

The complete template is in [.env.example](.env.example). Runtime validation is defined in [src/env.ts](src/env.ts).

| Variable                        | Purpose                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------- |
| DATABASE_URL                    | Neon Postgres connection string. A pooled connection string is recommended.       |
| AUTH_SECRET                     | Secret used to sign the HTTP-only session cookie; must be at least 32 characters. |
| GITHUB_APP_CLIENT_ID            | Client ID used for GitHub user authorization.                                     |
| GITHUB_APP_CLIENT_SECRET        | Client secret used to exchange and refresh GitHub user tokens.                    |
| GITHUB_APP_SLUG                 | GitHub App slug used to build the private-repository installation URL.            |
| GITHUB_APP_CALLBACK_URL         | GitHub user authorization callback, normally /api/auth/github/callback.           |
| GITHUB_APP_INSTALL_CALLBACK_URL | GitHub App Setup URL, normally /api/github/install/callback.                      |
| GITHUB_APP_WEBHOOK_SECRET       | Secret used to verify installation webhooks. Set it when webhooks are enabled.    |
| GITHUB_TOKEN_ENCRYPTION_KEY     | 32-byte AES-GCM key encoded as exactly 64 hexadecimal characters.                 |
| NODE_ENV                        | One of development, production, or test.                                          |

Do not commit .env, .env.local, .env.production.local, client secrets, session secrets, webhook secrets, or encryption keys.

## GitHub App setup

RepoDeck uses two Apps so local and production installations have separate callback and installation configuration:

- Production: repodeck
- Local development: repodeck-development

Configure each App as follows:

1. Enable GitHub App user authorization and expiring user access tokens so refresh tokens are available.
2. Grant only repository permissions `Metadata: Read-only` and `Contents: Read-only`.
3. Set the user authorization callback URL to the value of `GITHUB_APP_CALLBACK_URL`.
4. Set the App Setup URL to the value of `GITHUB_APP_INSTALL_CALLBACK_URL`.
5. Configure the webhook URL as `/api/github/webhook`, set the same webhook secret in the environment, and subscribe to installation events.
6. Allow users to choose the repositories an installation can access. RepoDeck records installation metadata and lets GitHub enforce the selected access boundary on subsequent API requests.

Production callback and webhook URLs:

```text
https://repodeck.abdok.dev/api/auth/github/callback
https://repodeck.abdok.dev/api/github/install/callback
https://repodeck.abdok.dev/api/github/webhook
```

Local development uses the same paths under `http://localhost:3000`. The App slug and credentials must match the environment in which the server is running.

## Using the viewer

### Open the RepoDeck demo

The primary landing page links to the real viewer route for [Abdo12KM/repodeck](https://github.com/Abdo12KM/repodeck):

```text
/repositories?owner=Abdo12KM&repo=repodeck&ref=main
```

The demo tree and files are served from the fixed public snapshot in Postgres, so visitors can browse the full codebase without making one anonymous GitHub request per page load. For arbitrary public repositories, GitHub rate limits still apply; sign in when you need to browse several repositories or use a larger request budget.

### Open public repositories

No GitHub account is required for public repositories. The repository picker accepts:

```text
vercel/next.js
https://github.com/facebook/react
https://github.com/shadcn-ui/ui/tree/main/packages/cli
https://github.com/shadcn-ui/ui/blob/main/packages/cli/src/index.ts
```

The viewer resolves the default branch when a bare repository is entered. A direct `tree` or `blob` URL preserves the branch and path.

### Share a file or branch

Viewer state is encoded in query parameters:

```text
/repositories?owner=vercel&repo=next.js&ref=canary&path=packages/next/package.json
```

The parameters are:

- owner — GitHub account or organization
- repo — repository name
- ref — branch or other Git ref accepted by GitHub
- path — optional file path to open

### Sign in and connect private repositories

1. Sign in with GitHub from the repository picker or viewer header.
2. Choose a repository and branch from the authenticated repository list.
3. To connect private repositories, choose Private repositories and complete the GitHub App installation flow.
4. Select only the repositories the App should be able to read. Return to RepoDeck after GitHub confirms the installation.

The app uses the signed-in user’s request-scoped GitHub token for server-side API calls. Tokens are encrypted before they are stored in Postgres and are never sent to browser JavaScript.

### Viewer controls

| Control           | What it does                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| File tree         | Expands and collapses folders, filters paths, and keeps a virtualized list for large trees.                                    |
| Open tabs         | Keeps multiple files open and supports tab switching and closing.                                                              |
| Command palette   | Searches files, branches, repositories, recent files, and viewer actions.                                                      |
| Markdown mode     | Toggles between a lightweight rendered preview and raw code for Markdown files.                                                |
| Image mode        | Shows dimensions, zoom controls, and a transparency checkerboard for image files.                                              |
| Code tools        | Toggles line wrapping and line numbers, changes font size, copies content, downloads a file, or opens the original GitHub URL. |
| Appearance Studio | Changes light/dark mode, application theme, code theme, fonts, radius, and editor background behavior.                         |

Useful keyboard shortcuts include:

| Shortcut              | Action                                |
| --------------------- | ------------------------------------- |
| Ctrl/⌘ K or Ctrl/⌘ P  | Open the command palette.             |
| Ctrl/⌘ O              | Open or switch repository and branch. |
| Ctrl/⌘ B or Ctrl/⌘ \  | Toggle the file-tree sidebar.         |
| Ctrl/⌘ ,              | Open appearance settings.             |
| ?                     | Open the shortcut reference.          |
| Alt + [ / Alt + ]     | Move between open file tabs.          |
| Alt + W               | Close the active file tab.            |
| Alt + 1 … Alt + 9     | Jump to a file tab.                   |
| Alt + Z               | Toggle line wrapping.                 |
| Alt + L               | Toggle line numbers.                  |

## Architecture at a glance

The browser talks to Next.js route handlers rather than GitHub directly:

1. /repositories reads owner, repo, ref, and path from the URL.
2. Client hooks use SWR to request branches, repository trees, file content, and authenticated repository lists.
3. Each GitHub route resolves the signed session and creates either an anonymous Octokit client or a request-scoped user-token client.
4. The server validates query parameters with Zod, calls GitHub, and returns viewer-safe JSON or raw media responses.
5. Public responses receive short shared caching headers; authenticated responses receive `private, no-store`.

The database stores users, encrypted GitHub OAuth accounts, GitHub installation metadata, and the fixed public RepoDeck demo snapshot. It does not store arbitrary or private repository content. See [docs/architecture.md](docs/architecture.md) for the full request and data-flow description.

## API surface

These route handlers form the application’s server boundary:

| Route                          | Method | Purpose                                                                         |
| ------------------------------ | ------ | ------------------------------------------------------------------------------- |
| `/api/auth/github/start`       | `GET`  | Start GitHub user authorization with state and PKCE.                            |
| `/api/auth/github/callback`    | `GET`  | Validate the OAuth callback, store the encrypted token, and create the session. |
| `/api/auth/session`            | `GET`  | Return the current signed-in user, if any.                                      |
| `/api/auth/logout`             | `POST` | Clear the session cookie.                                                       |
| `/api/github/repos`            | `GET`  | List all repositories available to the signed-in user.                          |
| `/api/github/repos/refresh`    | `POST` | Force-refresh the authenticated repository list.                                |
| `/api/github/branches`         | `GET`  | Return repository branches and the default branch.                              |
| `/api/github/tree`             | `GET`  | Return the recursive repository tree for a ref.                                 |
| `/api/github/file`             | `GET`  | Return decoded file content; `raw=true` returns a media response.               |
| `/api/github/install/start`    | `GET`  | Start the GitHub App installation flow.                                         |
| `/api/github/install/callback` | `GET`  | Validate and record a completed installation.                                   |
| `/api/github/webhook`          | `POST` | Verify installation events and update installation status.                      |

## Project structure

```text
src/
├─ app/
│  ├─ api/                  # Auth, GitHub, installation, and webhook routes
│  ├─ page.tsx              # Landing page
│  └─ repositories/page.tsx # Repository viewer route
├─ components/
│  ├─ landing/              # Marketing and quick-launch UI
│  ├─ repo/                 # Repository selection, tree, and file viewers
│  ├─ theme/                # Appearance settings and theme bootstrap
│  ├─ ui/                   # Shared Shadcn-style primitives
│  └─ viewer/               # Responsive repository workspace
├─ hooks/                   # SWR data hooks, URL state, auth, themes, shortcuts
├─ lib/
│  ├─ auth/                 # OAuth, session, encryption, and installation logic
│  ├─ db/                   # Drizzle schema and Neon connection
│  ├─ github/               # Octokit clients, queries, validation, and errors
│  └─ theme/                # Application and code-theme definitions
└─ types/                   # Shared TypeScript models
drizzle/                    # Checked-in PostgreSQL migrations
docs/                       # Architecture, deployment, and security notes
```

## Development commands

| Command          | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| pnpm dev         | Start the Next.js development server.                |
| pnpm build       | Create a production build.                           |
| pnpm start       | Serve the production build locally.                  |
| pnpm typecheck   | Run TypeScript without emitting files.               |
| pnpm lint        | Run ESLint.                                          |
| pnpm test:run    | Run the Vitest suite once.                           |
| pnpm test        | Start Vitest in watch mode.                          |
| pnpm format      | Format the repository with Prettier.                 |
| pnpm db:generate | Generate a Drizzle migration after schema changes.   |
| pnpm db:migrate  | Apply checked-in Drizzle migrations to DATABASE_URL. |

Before opening a pull request, run:

```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
```

## Documentation

- [Documentation index](docs/README.md)
- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Security model](docs/security.md)

## Known operational limits

- The tree endpoint requests GitHub’s recursive Git tree. If GitHub marks that response as truncated, RepoDeck reports an error instead of silently showing an incomplete tree.
- GitHub API rate limits still apply. The API surfaces rate-limit status, reset, and retry information to the client.
- Markdown rendering is intentionally lightweight and supports the viewer’s common headings, lists, tables, code blocks, links, and emphasis rather than implementing all GitHub Markdown extensions.
- Recent repositories, recent files, and some workspace preferences are stored in the browser’s localStorage; file contents and credentials are not stored there.
