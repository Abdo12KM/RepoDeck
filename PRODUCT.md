# Product

## Register

brand

## Users

Developers, maintainers, reviewers, students, and curious readers who need to inspect a GitHub repository from a browser. They may be at a desk, on a tablet, or on a phone, and they want to understand a file or a project without cloning a repository or opening a full development environment.

## Product Purpose

RepoDeck is a focused, read-only GitHub repository viewer. A visitor can paste a public repository URL and open its branches, folders, files, Markdown, images, and shareable URL state. Signed-in users can browse their accessible repositories and connect selected private repositories through a GitHub App with repository-level read-only permissions.

The landing page should make the reading task feel immediate, show the viewer doing real work, and make the access boundary clear. Its primary action is opening a repository.

## Brand Personality

Quiet, precise, and useful. The experience should feel like a well-made reading instrument: confident about its scope, visually calm enough for code, and specific about what happens when a visitor clicks.

## Anti-references

- Full IDE marketing pages that imply editing, terminals, or deployment when the product only reads repositories.
- Clone-first workflows that make local setup the headline for a simple inspection task.
- Generic SaaS landing pages built from repeated icon cards, inflated claims, gradients, and abstract productivity language.
- Broad GitHub access prompts or security copy that blurs the difference between public browsing and selected private-repository access.

## Design Principles

- Put a repository in view early. The product should demonstrate its mechanism before explaining every feature.
- Treat code as content. File paths, branches, snippets, and deep links are the visual material of the page.
- Keep the boundary honest. Read-only access, no local clone, request-scoped GitHub access, and URL-addressable state are trust signals, not decoration.
- Prefer a few distinct moments over a long inventory. Each section should answer a different visitor question.
- Make the page usable at touch size and readable in both light and dark contexts.

## Accessibility & Inclusion

Target WCAG 2.2 AA for the landing route. Maintain at least 4.5:1 contrast for body text, visible keyboard focus, semantic headings and landmarks, labelled controls, touch targets of at least 44px, and meaningful status text for loading and error states. Respect `prefers-reduced-motion` and keep the page understandable when animation is disabled. Do not rely on color alone to communicate repository state or security boundaries.
