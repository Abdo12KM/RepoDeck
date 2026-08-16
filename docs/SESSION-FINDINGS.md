# Session findings: RepoDeck landing surface and repository search

> Status: design and architecture findings recorded on 2026-08-15. The V3 landing page is now primary at `/`; `/landing` redirects to it, and the older landing-v2 source remains preserved but is not the public entry point. Repository-wide content search is investigated and specified here, but is not implemented yet.

This document consolidates the project understanding, design decisions, validation results, and search feasibility analysis from the landing-page redesign session. It is intentionally explicit about what exists in the codebase versus what is a proposed next capability.

## 1. Product understanding

RepoDeck is a read-only GitHub repository viewer. Its core value is not replacing a local development environment; it is giving visitors a real, comfortable code-reading experience through the cached RepoDeck demo, then letting signed-in users browse their own repositories.

### Primary users

- Developers inspecting an unfamiliar repository.
- Maintainers reviewing a specific file or branch without opening a full IDE.
- Reviewers or teammates following a shareable repository/file URL.
- Students and curious readers who need to understand code without cloning it.

### Core flow

1. A visitor opens the fixed RepoDeck demo from the landing page, or signs in to choose an accessible repository.
2. RepoDeck resolves the selected repository and branch.
3. The viewer loads the repository tree and lets the user select a branch, folder, or file.
4. File content is fetched only after a file is selected.
5. The selected repository, branch, and path remain addressable in URL query parameters.

### Product boundaries

RepoDeck deliberately does not:

- edit, commit, or push repository files;
- create issues or pull requests;
- clone repositories as a user workflow;
- execute repository code;
- use a global GitHub personal access token;
- persist arbitrary or private repository contents in the application database; the fixed public RepoDeck demo is a deliberate cache exception;
- add an AI chat, agent loop, or chat persistence layer;
- use password authentication or Redis for this product surface.

The public UI exposes one anonymous entry point: the fixed, cached RepoDeck demo. GitHub sign-in provides access to the user’s public repositories. Private access is provided through a GitHub App installation with repository-level read-only selection.

### Relevant implementation shape

- Next.js App Router, React, TypeScript, and Tailwind CSS.
- SWR for request-scoped client data fetching and caching.
- Octokit for server-side GitHub API access.
- Shiki for syntax highlighting.
- Neon Postgres and Drizzle for application metadata plus the fixed public RepoDeck demo snapshot; arbitrary and private repository content is not persisted.
- Signed sessions and encrypted GitHub user tokens.
- Desktop resizable tree/viewer workspace and mobile drawers/bottom navigation.

The existing implementation notes are documented in [Architecture](./architecture.md), [Security](./security.md), and [Deployment](./deployment.md).

## 2. Existing viewer findings

The existing viewer is already a strong foundation for a new landing surface:

- [`RepositoryViewer`](../src/components/viewer/RepositoryViewer.tsx) owns the viewer workspace, open-file tabs, branch/repository state, mobile drawers, quick switcher, and global shortcuts.
- [`useRepoTree`](../src/hooks/useRepoTree.ts) requests a recursive tree, builds a nested structure, manages expansion state, and supports virtualized rendering downstream.
- [`useFileContent`](../src/hooks/useFileContent.ts) requests one file at a time through `/api/github/file`.
- [`CodeFileViewer`](../src/components/repo/viewer/CodeFileViewer.tsx) holds selected file content in memory and provides syntax highlighting, line numbers, wrapping, copy, zoom, Markdown preview, and image handling.
- [`MarkdownPreview`](../src/components/repo/viewer/MarkdownPreview.tsx) parses headings, paragraphs, lists, tables, blockquotes, and fenced code blocks into typed blocks.
- [`QuickSwitcherDialog`](../src/components/viewer/QuickSwitcherDialog.tsx) searches recent files, file names/paths, branches, repositories, and viewer commands. It does not search file contents.
- [`useGlobalShortcuts`](../src/hooks/useGlobalShortcuts.ts) provides the existing command-palette and viewer keyboard shortcut layer, but there is no current `Ctrl/Cmd+F` content-find experience.

### Current API data flow

- [`/api/github/tree`](../src/app/api/github/tree/route.ts) returns a recursive tree for a branch/ref.
- [`/api/github/file`](../src/app/api/github/file/route.ts) returns decoded content for one file or raw media when requested.
- [`getFileTree`](../src/lib/github/files.ts) maps GitHub tree entries into RepoDeck `TreeNode` values and rejects truncated recursive trees rather than silently returning an incomplete tree.
- [`getFileContent`](../src/lib/github/files.ts) decodes a selected file server-side and returns content plus metadata.
- [`getGitHubRequestContext`](../src/lib/github/request-context.ts) keeps anonymous and authenticated requests separate and resolves the current request-scoped GitHub client.

This means the project currently has path search and selected-file reading, but not a repository-content index.

## 3. Design process and references used

The ten skill instructions available under `.agents/skills` were read sequentially before inspecting the application code, as requested:

1. `anti-ui-slop`
2. `impeccable`
3. `landing-page-conversion-audit`
4. `product-marketing`
5. `sales-funnel-blueprint`
6. `ui-design`
7. `ui-radar`
8. `ui-slop-score`
9. `ui-ux-pro-max`
10. `web-design-guidelines`

Additional references and checks used during the work:

- Anti-slop initialization and brand references.
- Impeccable new-surface and craft-floor references.
- The anti-slop context and detector scripts.
- The Impeccable concept seed tool. The assigned direction was a scientific-notation/particle-detector event display: dark ground, technical rings, colored signal tracks, and a selected active signal.
- UI/UX Pro Max searches for a repository viewer landing page, responsive Next.js composition, mobile bottom sheets, touch targets, reduced motion, and accessibility.
- UI Radar’s available free API returned no useful matching screens, so no external screen was copied.
- The current Web Interface Guidelines were checked for labels, focus states, semantic controls, reduced motion, form behavior, touch targets, safe areas, and overflow.

The product context required by the design skills was recorded in [`PRODUCT.md`](../PRODUCT.md). The durable visual system for the new route was recorded in [`DESIGN.md`](../DESIGN.md).

## 4. Historical `/landing` redesign findings

The following section records the earlier landing-v2 direction for context. Its URL-probe components remain in the repository as preserved source, but they are not the primary public landing page and are not used by `/`.

### Route and scope

The earlier design was implemented in preserved components under `landing-v2`. The current [`/landing`](../src/app/landing/page.tsx) route redirects to the V3 root landing page, and `/` is the primary public surface.

Historical route components:

- [`LandingV2Page`](../src/components/landing-v2/LandingV2Page.tsx) — page composition, copy, access boundary, and CTA sections.
- [`LandingV2Header`](../src/components/landing-v2/LandingV2Header.tsx) — desktop navigation, mobile menu, sign-in action, and viewer CTA.
- [`LandingRepositoryProbe`](../src/components/landing-v2/LandingRepositoryProbe.tsx) — repository URL parsing, branch resolution, error state, and route transition to `/repositories`.
- [`LandingEventDisplay`](../src/components/landing-v2/LandingEventDisplay.tsx) — interactive illustrative repository tree, selected file state, code preview, file map, and copy action.
- [`LandingMobilePreview`](../src/components/landing-v2/LandingMobilePreview.tsx) — phone-sized file/code interaction used to demonstrate the mobile reading flow.
- [`LandingV2Page.module.css`](../src/components/landing-v2/LandingV2Page.module.css) — scoped visual system and responsive behavior.

### Current V3 visual direction

The primary page is a calm, dark product surface rather than an anonymous repository-probe landing page:

- a restrained hero with one CTA into the real cached RepoDeck viewer;
- a secondary GitHub sign-in path for personal repositories;
- a focused theme studio for code-reading presentation;
- a plain-language public/private access boundary;
- FAQ answers grounded in the actual cache, session, and permission behavior;
- no fake repository preview, arbitrary URL form, inflated IDE claim, or generic feature-card wall.

### Current page narrative

1. **Hero:** Open the real RepoDeck demo or sign in to browse your repositories.
2. **Theme studio:** Show how code-reading presentation can be adjusted without turning the product into an editor.
3. **Access boundary:** Separate the fixed public demo from authenticated public and selected-private access.
4. **FAQ:** Explain caching, cloning, permissions, and shareable viewer state.
5. **Close:** Return visitors to the actual `/repositories` demo route.

### Current interaction findings

- The demo CTA opens `/repositories?owner=Abdo12KM&repo=repodeck&ref=main`.
- Anonymous visitors are not asked to enter arbitrary public repository URLs.
- The repository picker exposes the authenticated GitHub repository list after sign-in.
- Viewer state remains shareable through repository, branch, and file-path query parameters.
- Header navigation, buttons, links, and the skip link use labelled semantic controls.

### Responsive contract

- The hero actions stack cleanly at phone widths and remain reachable without horizontal scrolling.
- Theme studio controls and access-boundary cards collapse from columns to a readable single-column flow.
- FAQ and final CTA sections preserve hierarchy and touch-friendly targets on small screens.
- The current browser checks found no horizontal overflow at 390px, 768px, or 1440px widths.

### Accessibility and interface quality

- Skip link targets the main content.
- Navigation regions and icon-only controls have labels.
- Buttons are used for actions and links for navigation.
- Focus-visible states are defined for navigation and CTAs.
- Decorative logo imagery uses empty alt text when adjacent visible brand text already provides the name.
- Reduced-motion rules disable nonessential animation and transition movement.

## 5. Validation results

The following checks were run after the implementation:

| Check | Result |
| --- | --- |
| `pnpm typecheck` | Passed |
| `pnpm lint` | Passed with 0 errors; existing warnings are concentrated in skill/tool scripts outside the new route |
| `pnpm test:run` | 9 test files and 33 tests passed; the existing test environment emitted a non-fatal Canvas API warning |
| `pnpm build` | Passed; `/` is the primary landing route and `/landing` remains a compatibility redirect |
| Anti-UI-Slop detector | `[]` for the new route/components |
| Impeccable detector | `[]` for the new route/components |
| UI Design detector | `[]` for the new route/components |
| Browser runtime errors | None after reload; console contained only expected development HMR/React DevTools messages |
| Accessibility audit | 0 violations |
| Responsive overflow | `scrollWidth === viewport width` at 390px and 768px |

Browser interaction checks included the fixed demo route, README file selection, authenticated repository picker, file controls, and the responsive landing surface. The current anonymous flow intentionally has no arbitrary repository URL input.

## 6. Search capability findings

### User need

A useful repository-content search should support a query such as:

```text
<Test
```

and return every matching occurrence across eligible files in the selected repository, with at least:

- file path;
- branch/ref;
- line number;
- matching line or short context snippet;
- result count;
- an action that opens the file at the match.

The search should eventually support exact text, case sensitivity, regular expressions, language filters, path filters, and Markdown code-block-only search.

### What is easy and reliable

#### Current-file search

This is the safest first feature. `CodeFileViewer` already has the selected file content in memory. A `Ctrl/Cmd+F` bar can scan `content.split("\\n")`, produce line matches, highlight them, and move the code scroll container to the next/previous match. It works for the exact selected branch and does not fetch any additional repository files.

#### Markdown code-block search

`MarkdownPreview` already identifies fenced blocks with `type: "code"`, language, and content. Adding `startLine`, `endLine`, and a stable block identifier would allow the viewer to search only code blocks, filter by language, and scroll directly to the matching block.

### What requires repository-wide work

#### Default-branch content search

The fastest route is a server-side `/api/github/search/code` endpoint that calls GitHub Code Search with a repository qualifier. GitHub returns matching files rather than a complete local index. RepoDeck can then fetch only the matching files, compute every line occurrence, and return normalized snippets.

Important behavior: GitHub Code Search is designed around a repository’s default branch. Results must not be presented as if they came from an arbitrary selected branch. The UI should label this mode explicitly as `Default branch search`.

#### Selected non-default branch search

For a selected branch, RepoDeck can use the existing recursive tree entries and their blob SHAs, filter to likely text files, and scan blobs server-side. This avoids fetching every binary and lets the search operate on the selected ref. It still requires budgets for:

- maximum files inspected;
- maximum total bytes inspected;
- maximum concurrent GitHub requests;
- maximum result files and snippets;
- per-file size and decoding failures.

The response should include whether the scan is complete or partial. A partial result must never look like a complete repository search.

#### Symbol-aware search

Searching for literal text such as `<Test` is much simpler than definitions and references. Symbol search would require language-aware parsing, for example Tree-sitter/WASM for supported languages, or a separate code-navigation/indexing service. It should be a later feature after reliable text search.

### GitHub limits that shape the design

The following constraints were checked against GitHub’s official documentation:

- Unauthenticated public REST requests are limited to 60 requests per hour. Authenticated requests and GitHub App requests have higher but still finite limits, and GitHub may apply secondary throttling. See [REST API rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) and [GitHub App rate limits](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/rate-limits-for-github-apps).
- The Contents API fully supports files up to 1 MB. Between 1 MB and 100 MB, raw/object media types are required; files over 100 MB are not supported by that endpoint. A directory response is limited to 1,000 files. See [repository contents](https://docs.github.com/en/rest/repos/contents?from=20423).
- Recursive Git Trees responses are limited to 100,000 entries and 7 MB. GitHub sets `truncated: true` when the recursive response exceeds the limit and recommends fetching subtrees non-recursively. See [Git Trees](https://docs.github.com/en/enterprise-cloud%40latest/rest/git/trees?apiVersion=2022-11-28).
- GitHub Code Search has its own search behavior and rate-limit category. It should be used as a targeted result locator, not treated as a guarantee that RepoDeck can retrieve an unlimited repository snapshot.

These limits do not make search impossible. They make “download every file for every query” the wrong implementation.

## 7. Recommended search architecture

### Proposed endpoint contract

```text
GET /api/github/search/code
  ?owner=...
  &repo=...
  &ref=...
  &q=...
  &path=...
  &language=...
  &mode=current|default|branch
```

Possible response shape:

```ts
interface CodeSearchResponse {
  mode: "current" | "default" | "branch";
  complete: boolean;
  scannedFiles?: number;
  scannedBytes?: number;
  results: Array<{
    path: string;
    line: number;
    column?: number;
    preview: string;
    matchStart?: number;
    matchEnd?: number;
  }>;
  warnings?: string[];
}
```

### Server responsibilities

- Resolve the existing request-scoped anonymous or authenticated GitHub client.
- Validate owner, repository, ref, query, path, language, and mode with Zod.
- Never send GitHub tokens to the browser.
- Keep private search responses `private, no-store`.
- Allow only short-lived public caching where the existing response-cache policy permits it.
- Redact query/content details from application logs where they could expose private repository information.
- Stop scans when byte/file/request budgets are exhausted.
- Return explicit partial/unsupported warnings instead of silently dropping files.

### Client responsibilities

- Debounce repository-wide queries.
- Use the existing command palette or a dedicated `Find in repository` dialog.
- Keep `Ctrl/Cmd+F` scoped to the current file by default.
- Display mode, branch, result count, progress, and completeness.
- Open a result using existing `openFile(path)` and add a line parameter or fragment for the viewer to scroll to.
- Use a bottom sheet or compact results drawer on mobile rather than shrinking the code pane.

### Suggested modes

| Mode | Scope | Completeness |
| --- | --- | --- |
| Current file | Loaded content only | Exact for the selected file/ref |
| Default branch | GitHub Code Search + targeted file fetches | Exact within GitHub search behavior and result limits |
| Selected branch | Server-side bounded blob scan | Exact when the scan completes; explicitly partial otherwise |
| Indexed repository | Dedicated content index | Fast and broad, but changes the current no-content-storage boundary |

## 8. Recommended implementation phases

### Phase 1: current-file find

- Add `Ctrl/Cmd+F` handling in `CodeFileViewer`.
- Add find input, match count, next/previous, escape-to-close, and line scrolling.
- Preserve search state locally per open file, not in the database.
- Add tests for plain text, multiple matches, case sensitivity, regex failure, and empty results.

### Phase 2: Markdown code blocks

- Extend the Markdown block model with source line ranges and stable IDs.
- Add `Code blocks only` and optional language filtering.
- Scroll to and focus the matching rendered block.
- Keep raw source line references so the result can link back to the original Markdown file.

### Phase 3: default-branch repository search

- Add the server search route using the current GitHub request context.
- Search by repository-qualified query.
- Fetch only matching result files to calculate all matching lines/snippets.
- Add path/language filters and a clear `Default branch` badge.
- Add rate-limit and search-error states.

### Phase 4: selected-branch bounded search

- Use tree blob SHAs for the selected ref.
- Filter binary, generated, vendor, and oversized files before fetching.
- Scan with bounded concurrency and byte/file budgets.
- Return progress and a complete/partial state.
- Add a narrow-path fallback for large repositories.

### Phase 5: symbol search, only if validated

- Evaluate Tree-sitter/WASM language coverage and bundle cost.
- Add symbols/definitions/references only after text search is stable and user demand justifies the complexity.

## 9. Open product decisions

Before implementing repository-wide search, decide:

1. Should the default search scope be the current file, current branch, or default branch?
2. Should a search across a non-default branch be allowed to return partial results, or should RepoDeck require a narrower path until complete?
3. Which file types are eligible by default? A safe first set is source code, Markdown, JSON, YAML, CSS, and configuration text while excluding binaries, lockfiles, generated output, and vendor directories unless requested.
4. What query language is needed for the first release: literal text only, exact phrases, regex, or all three?
5. What is the maximum scan budget in files and bytes for anonymous public search and authenticated private search?
6. Is content ever allowed to be cached outside the request? The current product boundary says no application-content persistence, with private responses never shared-cached.
7. Should result URLs include `line`, `column`, and `query` so a search result can be shared and reopened precisely?

## 10. Bottom line

RepoDeck can support searching for a term such as `<Test` across repository files, including line-level results and Markdown code-block filtering. The feature is technically solvable without cloning repositories, but it must not be implemented as an unbounded “fetch every file” loop.

The safest product sequence is:

1. current-file find;
2. Markdown code-block find;
3. default-branch repository search using GitHub’s search index and targeted file fetches;
4. bounded selected-branch scanning;
5. a persistent index only if the product explicitly accepts the privacy and operational change.
