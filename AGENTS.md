# User Git workflow

- Do not use the bundled `github:yeet` skill for implicit GitHub publishing tasks.
- Use `$github-commit-push` for commit, push, publish, and pull-request requests.
- Interpret “commit and push” as commit and push on the current branch.
- Create or switch branches only when the user explicitly requests it.
- Create a pull request only when the user explicitly requests it.
- Do not add provider naming conventions to branches unless the user or repository requires them.
- Preserve the repository’s existing version-control workflow.

# RepoDeck development notes

RepoDeck is a read-only GitHub repository viewer built with Next.js App Router, React, TypeScript, Tailwind CSS, SWR, Octokit, Shiki, Neon Postgres, Drizzle, and GitHub App user authorization.

## Product boundaries

- The public UI opens the fixed cached `Abdo12KM/repodeck` demo anonymously; do not reintroduce arbitrary public-repository URL inputs or anonymous recent-repository shortcuts.
- GitHub sign-in provides access to the user’s public repositories.
- Private repository access comes only from a GitHub App installation with repository-level read-only selection.
- The app does not edit, commit, or push repository files.
- Do not reintroduce AI providers, agent loops, chat persistence, Redis, password auth, or a global GitHub PAT.

## Development commands

```bash
pnpm install
pnpm dev
pnpm db:generate
pnpm db:migrate
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
```

## Environment

Runtime configuration is validated in `src/env.ts`. Required values are documented in `.env.example`. Local development uses the ignored `.env.local`; production uses deployment environment variables.

Required integrations:

- Neon Postgres via `DATABASE_URL`
- Signed sessions via `AUTH_SECRET`
- Production or development GitHub App client credentials
- AES-GCM token encryption via `GITHUB_TOKEN_ENCRYPTION_KEY`

## Code conventions

- Use `@/*` imports for `src/` modules.
- Prefer existing Shadcn primitives and theme tokens.
- Keep GitHub requests request-scoped and preserve public versus authenticated cache behavior.
- Keep private responses `private, no-store` and preserve GitHub rate-limit metadata.
