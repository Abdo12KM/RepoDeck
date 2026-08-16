# RepoDeck documentation

RepoDeck is a read-only GitHub repository viewer. The root [README](../README.md) is the quickest path for users and contributors; the pages in this directory document the implementation and the operational setup.

- [Architecture](architecture.md) — application pages, URL state, request flow, authentication, persistence, caching, and API routes.
- [Deployment](deployment.md) — environment setup, GitHub Apps, Neon, Vercel, migrations, DNS, and verification.
- [Security](security.md) — access control, token protection, sessions, webhook validation, caching, and deployment checks.
- [Session findings](SESSION-FINDINGS.md) — landing redesign decisions, responsive/accessibility validation, and repository-content search feasibility.

## Documentation maintenance

Keep these documents aligned with the code:

- Update the root README when user-facing features or setup steps change.
- Update architecture when routes, persistence, authentication, or data flow changes.
- Update deployment when domains, GitHub App settings, hosting, or environment variables change.
- Update security when permissions, token handling, sessions, webhooks, or response caching changes.

The active product scope is deliberately small: browse GitHub repositories, read files, and share viewer state. Do not document capabilities that are not implemented.
