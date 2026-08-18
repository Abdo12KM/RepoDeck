# RepoDeck architecture

RepoDeck is a Next.js App Router application with a responsive repository workspace. The browser requests repository data from local route handlers; those handlers call GitHub server-side with either anonymous access or the current user’s request-scoped token.

## Application pages

| Page          | Responsibility                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| /             | Landing page, fixed public demo launch, feature explanation, theme showcase, FAQ, and links into the viewer.                     |
| /repositories | Repository picker, branch selection, file tree, file tabs, code viewer, Markdown preview, image viewer, and appearance controls. |

The viewer stores navigation state in the URL:

| Parameter | Meaning                             |
| --------- | ----------------------------------- |
| owner     | GitHub user or organization.        |
| repo      | Repository name.                    |
| ref       | Branch or Git ref passed to GitHub. |
| path      | Optional file path to open.         |

Example:

```text
/repositories?owner=Abdo12KM&repo=repodeck&ref=main&path=README.md
```

Changing the repository or branch clears the selected file. Opening or closing a file updates the path parameter with client-side navigation, so refreshes and shared links restore the same location.

## Request flow

1. The browser opens the landing page or the repository workspace.
2. Viewer hooks use SWR to request branches, repository trees, file content, session state, or the authenticated repository list.
3. A GitHub route handler calls the request-context helper, which reads the signed session cookie.
4. Anonymous requests receive an unauthenticated Octokit client. Authenticated requests receive an Octokit client created from the user’s decrypted, valid GitHub access token.
5. Zod validates repository, branch, ref, and file-path query parameters at the route boundary.
6. The fixed public RepoDeck demo checks its Postgres snapshot first; other misses call Octokit, and the authenticated demo-cache route can refresh the fixed snapshot.
7. The client renders the response as a virtualized tree, syntax-highlighted source file, lightweight Markdown preview, or image viewer.

Credentials and GitHub App secrets remain on the server. The browser receives only normalized data and the signed session cookie.

## Access modes

| Mode                 | Authentication                                         | What it can read                                            | Cache policy                                      |
| -------------------- | ------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------- |
| RepoDeck demo        | Anonymous; fixed public snapshot                       | The public `Abdo12KM/repodeck` snapshot on `main`           | Dedicated Postgres snapshot                       |
| Direct public read   | Anonymous GitHub API request reached through URL state | Repositories GitHub exposes publicly                        | Short shared cache for branches, trees, and files |
| Signed in            | GitHub App user authorization                          | Repositories available to that authorization                | Private, no-store responses                       |
| Private installation | Signed-in user plus selected GitHub App installation   | Private repositories allowed by GitHub for the installation | Private, no-store responses                       |

GitHub enforces the repository boundary on every non-demo API request. The anonymous product entry point is intentionally limited to one public repository snapshot; signed-in users use the authenticated picker for their own repositories. The demo cache never expands to arbitrary or private repositories.

## Authentication flows

### GitHub sign-in

1. The sign-in route creates a random OAuth state and a PKCE verifier/challenge pair.
2. Short-lived, HTTP-only cookies hold state, the verifier, and a same-site return path.
3. The callback performs a timing-safe state comparison before exchanging the authorization code.
4. The callback fetches the GitHub user and upserts the user and encrypted account records in Postgres.
5. RepoDeck creates a signed, HTTP-only session cookie with a 30-day lifetime.
6. When an expiring access token is near expiry, the server refreshes it with the encrypted refresh token and stores the replacement.

### Private-repository installation

1. The installation start route requires a session. Without one, it begins GitHub sign-in and returns to the installation flow.
2. The server redirects to the configured GitHub App installation URL with a short-lived installation state cookie.
3. GitHub redirects to the installation callback after the user completes the installation.
4. The callback validates state, lists the user’s GitHub App installations, and records the matching installation.
5. The webhook route verifies installation events and updates suspension or revocation state.

## Persistence

Neon Postgres stores:

- users: RepoDeck ID, GitHub ID, login, display name, and avatar URL;
- GitHub accounts: encrypted access and refresh tokens plus expiry timestamps;
- GitHub installations: installation and account identifiers, selection mode, connection owner, suspension state, and revocation time.
- fixed public RepoDeck demo: one tree snapshot and its bounded file contents for `Abdo12KM/repodeck` on `main`.

The database does not store arbitrary or private repository trees, file contents, chat data, or generated indexes. Public HTTP caching remains a separate temporary response-cache policy for non-demo requests.

The browser may keep recent repositories, recent file paths, expanded folders, appearance settings, and workspace panel sizes in localStorage.

## Caching and data fetching

The server applies these response policies:

```text
Public:        public, max-age=0, s-maxage=60, stale-while-revalidate=300
Authenticated:  private, no-store
Demo:          fixed public snapshot in Postgres; refresh is server-side and authenticated
```

SWR deduplicates requests for five seconds, keeps previous data while revalidating, does not refetch on window focus, and retries generic failures up to three times. The global provider does not retry authentication or not-found failures.

GitHub rate-limit failures are returned as HTTP 429 responses with reset and retry metadata when available.

## Viewer performance

- The recursive Git tree is transformed into a nested structure and rendered with @tanstack/react-virtual so only visible rows are mounted.
- File content loads only after a file is selected.
- Shiki highlights source using the selected language and code theme, with a plain-text fallback if highlighting fails.
- Markdown files support a lightweight preview and raw-code mode.
- Image files use the raw file route and support dimensions, zoom, and a transparency grid.
- Desktop uses a resizable tree-and-file workspace; mobile uses drawers and a bottom navigation bar.

## API routes

| Route                        | Method | Responsibility                                                        |
| ---------------------------- | ------ | --------------------------------------------------------------------- |
| /api/auth/github/start       | GET    | Start GitHub user authorization with state and PKCE.                  |
| /api/auth/github/callback    | GET    | Validate OAuth, store encrypted token material, and create a session. |
| /api/auth/session            | GET    | Return the current session summary.                                   |
| /api/auth/logout             | POST   | Clear the session cookie.                                             |
| /api/github/repos            | GET    | List repositories available to the signed-in user.                    |
| /api/github/repos/refresh    | POST   | Force-refresh the authenticated repository list.                      |
| /api/github/branches         | GET    | Return repository metadata and all branches.                          |
| /api/github/tree             | GET    | Return the recursive tree for a repository ref.                       |
| /api/github/file             | GET    | Return decoded file content or raw media when raw=true.               |
| /api/github/demo/cache       | GET    | Seed or refresh the fixed public RepoDeck demo snapshot.              |
| /api/github/install/start    | GET    | Start a GitHub App installation.                                      |
| /api/github/install/callback | GET    | Verify and store a completed installation.                            |
| /api/github/webhook          | POST   | Verify installation lifecycle events.                                 |

## Product boundary and limitations

RepoDeck is read-only. It does not edit files, create commits, push changes, manage issues or pull requests, run repository code, or expose an AI or chat workflow. GitHub API limits still apply to direct public and authenticated requests; the fixed demo avoids per-visitor anonymous calls by serving its bounded snapshot.

The tree route uses GitHub’s recursive Git tree endpoint. If GitHub marks a response as truncated, RepoDeck reports an error rather than showing an incomplete tree. GitHub API limits still apply to both anonymous and authenticated requests.
