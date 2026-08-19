# RepoDeck — Repo-Audited Product Backlog

**Updated:** 2026-08-19
**Basis:** Actual current RepoDeck repository implementation
**Primary platform:** Next.js App Router web application with installable PWA capabilities

## 1. Product Direction

RepoDeck should become:

> **A fast, private repository companion for reading, understanding, navigating history, comparing versions, sharing source, and eventually making small, safe changes from anywhere—especially mobile.**

RepoDeck should **not** become a cloud IDE, autonomous coding agent, Git desktop replacement, or hidden repository mirror.

The core progression should remain:

```text
Read
→ Navigate
→ Search
→ Browse history
→ Compare
→ Share
→ Make a small reviewed edit
→ Optionally generate a small AI-assisted patch
```

The user must always understand:

```text
Which repository?
Which version?
Which file?
Which lines?
What will change?
What repository state will be mutated?
```

---

# 2. Architecture Invariants

## Repository access

- Use GitHub's official APIs.
- No server-side repository cloning by default.
- No persistent private-repository mirrors.
- Keep GitHub credentials request-scoped where practical.
- Preserve GitHub repository authorization boundaries.
- **Anonymous RepoDeck traffic must not act as an arbitrary public-GitHub proxy.**
- Branches, commits, and tags are first-class refs.
- Historical browsing remains read-only.

## Private-data model

```text
GitHub
  ↓
authorized request
  ↓
RepoDeck
  ↓
memory / active viewer
```

RepoDeck should not silently create an offline private-code mirror.

## Application architecture

- Next.js App Router first.
- Server Components by default.
- Client Components only where interaction requires them.
- Progressive PWA enhancement.
- Heavy viewers/features must be lazy-loaded.
- Avoid infrastructure without demonstrated need.

## Editing

When editing arrives:

- Read permissions remain sufficient for ordinary RepoDeck use.
- Write access requires explicit escalation.
- RepoDeck owns draft state.
- AI never directly owns repository state.
- Every change receives an exact diff review.
- Branch-first commits by default.
- No automatic default-branch writes.
- Preserve GitHub SHA/conflict semantics.

---

# 3. Status Definitions

| Status                   | Meaning                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| **Done**                 | Present in the current repo and not awaiting material implementation |
| **Implemented / Verify** | Implementation exists; production/browser verification remains       |
| **Partial**              | Meaningful foundation exists but backlog behavior is incomplete      |
| **Not Started**          | No substantive implementation exists                                 |
| **Future**               | Deliberately delayed until preceding foundations mature              |
| **Deferred**             | Explicitly outside current product plan                              |

Priorities remain:

- **P0** — security, privacy, correctness, release blocker
- **P1** — core near-term product value
- **P2** — valuable enhancement
- **Future P0/P1/P2** — later track with launch gates

---

# 4. Milestone 0 — Release & Security Hardening

### Milestone 0 Status Summary

| Item ID     | Name                                 | Code Implementation                               | Automated Tests                                          | Release / Device Verification         |
| :---------- | :----------------------------------- | :------------------------------------------------ | :------------------------------------------------------- | :------------------------------------ |
| **SEC-100** | Anonymous Repository Access Boundary | ❌ Not Started                                    | ❌ Missing                                               | ⏳ Pending Implementation             |
| **SEC-102** | SVG Response Isolation               | ⚠️ Partial (Viewer safe, raw API open)            | ❌ Missing                                               | ⏳ Pending Hardening                  |
| **PWA-001** | Production Build Validation          | ✅ Scripts Ready                                  | ✅ 55/55 Tests Passing                                   | ⏳ CI & Release Pipeline Gate         |
| **PWA-002** | Installation Browser Matrix          | ✅ Complete (`PwaInstallPrompt`, manifest, icons) | ✅ Tested                                                | ⏳ Cross-Browser Matrix Pending       |
| **PWA-003** | Push Notification Browser Matrix     | ✅ Complete (VAPID, WebPush, dead-sub cleanup)    | ✅ `web-push.test.ts`, `push-maintenance.test.ts`        | ⏳ Push Provider Matrix Pending       |
| **PWA-004** | Account Ownership Matrix             | ✅ Complete (Session auth, logout revoke, sync)   | ✅ `logout/route.test.ts`, `auth-reconciliation.test.ts` | ⏳ Multi-User Matrix Pending          |
| **PWA-005** | Offline Fallback                     | ✅ Complete (`public/sw.js`, `offline.html`)      | ✅ `service-worker.test.ts`                              | ⏳ Cache Storage Leak Audit Pending   |
| **PWA-006** | Service Worker Lifecycle             | ✅ Complete (No aggressive `skipWaiting`/`claim`) | ✅ `service-worker.test.ts`                              | ⏳ Tab Switch & Update Matrix Pending |

---

## SEC-100 — Anonymous Repository Access Boundary

**Priority:** P0  
**Effort:** M  
**Status:** Not Started

Current authenticated GitHub architecture is appropriate, but unauthenticated GitHub API routes must not permit RepoDeck to become a generic backend proxy for arbitrary public repositories.

### Current Repository State

Unauthenticated requests to `/api/github/tree`, `/api/github/file`, and `/api/github/branches` currently proxy arbitrary public repositories on GitHub via an anonymous Octokit client. They must be restricted to allow anonymous access **only** for the explicitly supported public demo repository (`Abdo12KM/repodeck`).

### Required behavior

Anonymous access may use only explicitly supported public demo repositories.

Arbitrary:

```text
owner/repository/ref
```

requests require an authenticated RepoDeck/GitHub context.

### Acceptance Criteria

- [ ] Anonymous users cannot retrieve arbitrary repository trees through RepoDeck APIs.
- [ ] Anonymous users cannot retrieve arbitrary repository files.
- [ ] Anonymous users cannot enumerate arbitrary repository branches.
- [ ] Future commit/history/search/compare APIs inherit the same boundary.
- [ ] The fixed public demo continues working.
- [ ] Crafted direct API requests cannot bypass UI restrictions.
- [ ] Tests cover every GitHub proxy route.

---

## SEC-102 — SVG Response Isolation

**Priority:** P0  
**Effort:** M  
**Status:** Partial / Existing Risk

SVG viewing already exists through the general image viewer, so this is no longer a future security task.

### Current Repository State

- **Viewer:** Safe. `ImageViewer.tsx` renders SVGs via `<img>` tags, preventing script execution in the RepoDeck DOM.
- **Direct/Raw API Route:** Risk remains. Direct requests to `/api/github/file?raw=true` return `Content-Type: image/svg+xml` without CSP sandboxing headers (`Content-Security-Policy: default-src 'none'; sandbox`).

### Requirements

Repository-controlled SVG must never gain RepoDeck-origin execution privileges.

Cover both:

- Embedding SVG in the viewer.
- Directly navigating to RepoDeck raw-file endpoints returning SVG.

### Acceptance Criteria

- [x] Arbitrary SVG embedded in viewer cannot execute script in RepoDeck's application origin (via `<img>` isolation).
- [ ] Raw SVG endpoint returns proper isolation headers (`Content-Security-Policy: default-src 'none'; sandbox` or force attachment download).
- [ ] External/resource-loading behavior follows an explicit policy.
- [ ] Direct navigation to raw SVG is safe.
- [x] Normal SVG preview still works.
- [ ] Security behavior has regression tests.

---

## PWA-001 — Production Build Validation

**Priority:** P0  
**Effort:** S  
**Status:** Verification Pending

Run in the actual CI/release environment:

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
pnpm start
```

### Current Repository State

- Local validation passes: `pnpm typecheck` (0 errors), `pnpm lint` (0 errors), `pnpm test:run` (16 test files, 55 tests passing).
- `packageManager` field pinning in `package.json` is pending to ensure reproducible CI builds.

### Additional requirement

Pin the intended package manager/version in `package.json`, for example via `packageManager`, so local and CI production checks are reproducible.

### Acceptance Criteria

- [ ] `packageManager` pinned in `package.json`.
- [x] Frozen installation succeeds locally.
- [x] Migrations succeed.
- [x] Lint passes.
- [x] TypeScript passes.
- [x] Tests pass (16 files, 55 tests).
- [ ] Production build verified in release pipeline.
- [ ] Production server starts.
- [ ] Normal production navigation introduces no browser-console errors.

---

## PWA-002 — Installation Browser Matrix

**Priority:** P0  
**Effort:** M  
**Status:** Implemented / Verify (Code Complete)

Existing implementation already includes the manifest, install UI (`PwaInstallPrompt.tsx`), 192/512 icons, and maskable icon.

### Verified in Codebase

- Manifest generated at `/manifest.webmanifest` via Next.js metadata route.
- Custom install banner and promotion triggers present.
- Standalone display mode and icons configured.

### Matrix Verification Remaining

- [ ] Chrome desktop.
- [ ] Edge desktop.
- [ ] Firefox where relevant.
- [ ] Safari macOS.
- [ ] Chrome Android.
- [ ] Safari iOS/iPadOS.

---

## PWA-003 — Push Notification Browser Matrix

**Priority:** P0  
**Effort:** M  
**Status:** Implemented / Verify (Code Complete)

Core enrollment, reconciliation, safe notification URLs, click handling, and dead-subscription cleanup exist and have automated unit test coverage (`src/lib/pwa/web-push.test.ts`, `src/lib/pwa/push-maintenance.test.ts`).

### Verified in Codebase

- Safe endpoint domain validation (`fcm.googleapis.com`, `wns.windows.com`, `push.apple.com`, `notify.bugzilla.org`).
- Same-origin relative path normalization for notification click targets.
- VAPID signing and 410/404 dead subscription cleanup.
- Automated tests pass (10 tests in push suite).

### Matrix Verification Remaining

- [ ] Push delivery verified on Chrome Android.
- [ ] Push delivery verified on Safari iOS 16.4+ (PWA home-screen installed).
- [ ] Push delivery verified on macOS Safari / Chrome Desktop.

---

## PWA-004 — Account Ownership Matrix

**Priority:** P0  
**Effort:** M  
**Status:** Implemented / Verify (Code Complete)

Current code already contains meaningful account ownership protections, logout revocation, local unsubscribe attempts, and multi-tab synchronization with unit tests (`src/app/api/auth/logout/route.test.ts`, `src/lib/pwa/auth-reconciliation.test.ts`).

### Verified in Codebase

- Account-bound push subscription records in Neon Postgres via Drizzle.
- Revocation of subscription records on explicit user logout.
- Cross-tab BroadcastChannel / session synchronization.
- Automated tests pass.

### Matrix Verification Remaining

- [ ] Manual release regression test: Alice registers push → logs out → Bob signs in on same browser → Bob does not receive Alice's notifications.

---

## PWA-005 — Offline Fallback

**Priority:** P0  
**Effort:** S  
**Status:** Implemented / Verify (Code Complete)

The existing service worker intentionally caches only the standalone offline page (`/offline.html`).

### Verified in Codebase

- `public/sw.js` restricts Cache Storage strictly to `/offline.html` on failed navigation requests.
- No private repository source, API responses, or Next.js RSC payloads enter Cache Storage.
- Validated via automated test suite `src/lib/pwa/service-worker.test.ts`.

### Matrix Verification Remaining

- [ ] Production validation in offline DevTools mode proving no private data leaks into Cache Storage.

---

## PWA-006 — Service Worker Lifecycle

**Priority:** P0  
**Effort:** M  
**Status:** Implemented / Verify (Code Complete)

The current worker correctly avoids unconditional `skipWaiting()` and `clients.claim()` to prevent unexpected reloads or cache corruption across tabs.

### Verified in Codebase

- Verified in `public/sw.js` and tested in `src/lib/pwa/service-worker.test.ts`.

### Matrix Verification Remaining

- [ ] Multi-tab browser verification across deployments.

---

# 5. Milestone 1 — Viewer & Ref Foundations

These foundations should land **before** piling features onto the current viewer.

---

## READ-100 — Stable Line Model & Large-File Foundation

**Priority:** P1
**Effort:** L
**Status:** Not Started

This is a new prerequisite discovered from the repo audit.

Current code rendering primarily produces Shiki HTML with CSS-generated line numbers. Search, line selection, line permalinks and future selected-line AI edits need explicit line identity.

### Requirements

Each rendered source line should have stable semantic identity such as:

```html
data-line="42" id="L42"
```

or an equivalent accessible representation.

The viewer must also define explicit large-file behavior.

### Acceptance Criteria

- Every source line has stable line identity.
- Highlighted and plain-text rendering share compatible line semantics.
- Scrolling directly to a line works reliably.
- Lines can receive interactive state without reconstructing the entire viewer.
- Rendering does not depend on CSS counters for behavioral line identity.
- Large files have an explicit size/line threshold.
- Expensive highlighting is skipped/degraded when appropriate.
- Shiki is lazy-loaded where practical.
- Large files do not lock the browser before search even begins.
- Accessibility semantics remain usable.

---

## REF-100 — First-Class Repository Ref Model

**Priority:** P1
**Effort:** M
**Status:** Partial

The data plane already accepts generic GitHub `ref` values, including commit-like refs, but application state largely treats the value as a branch.

Create an explicit model such as:

```ts
type RepositoryRef =
  | { type: "branch"; value: string }
  | { type: "commit"; value: string; originBranch?: string }
  | { type: "tag"; value: string };
```

Exact representation is implementation-defined.

### Acceptance Criteria

- UI state does not call every ref a branch.
- Branch/commit/tag state is distinguishable.
- URLs preserve the generic ref.
- Repository recents/history preserve ref type where necessary.
- Internal navigation retains the active ref.
- Historical states can remember an originating branch.
- The viewer can clearly communicate immutable vs moving refs.

---

## SEC-103 — Historical Ref Validation

**Priority:** P1
**Effort:** M
**Depends on:** REF-100
**Status:** Partial

### Acceptance Criteria

- GitHub refs are encoded safely.
- Commit SHAs are normalized/validated appropriately.
- Branch/tag names cannot corrupt internal application URLs.
- Unsafe path/ref composition cannot escape intended GitHub API behavior.
- Tests cover unusual valid Git ref names.
- Historical navigation cannot generate dangerous internal URLs.

---

# 6. Milestone 2 — Make Reading Excellent

---

## READ-101 — In-File Search

**Priority:** P1
**Effort:** M
**Depends on:** READ-100
**Status:** Not Started

Implement:

- `Ctrl/Cmd + F`
- Search overlay
- Match count
- Active match
- All-match highlighting
- Case sensitive
- Whole word
- Regex
- `Enter`
- `Shift+Enter`
- `F3`
- `Shift+F3`
- Escape
- Scroll active match into view

### Acceptance Criteria

- Viewer search does not hijack typing in inputs/dialogs.
- Search resets sensibly on file changes.
- Highlighted and fallback rendering work.
- Invalid regex is handled safely.
- Large-file behavior respects READ-100 limits.
- Search does not require rewriting source into unsafe HTML.

---

## READ-102 — Clickable Line Selection

**Priority:** P1
**Effort:** M
**Depends on:** READ-100
**Status:** Not Started

Support:

```text
Click L42
→ L42 selected

Shift-click L68
→ L42-L68 selected
```

Include reverse ranges and keyboard accessibility.

---

## READ-103 — Shareable Line Permalinks

**Priority:** P1
**Effort:** M
**Depends on:** READ-102, REF-100
**Status:** Not Started

Example:

```text
/repo?...&path=src/parser.ts&ref=<ref>#L42-L68
```

### Acceptance Criteria

- Selection restores from URL.
- Viewer scrolls to the range.
- Invalid ranges degrade gracefully.
- Branch links are supported.
- Commit-based immutable links are prominently available.
- Historical ref state survives the permalink.

---

## READ-104 — Line Action Menu

**Priority:** P1
**Effort:** S
**Depends on:** READ-102, READ-103
**Status:** Not Started

Actions:

- Copy RepoDeck permalink.
- Copy immutable RepoDeck permalink where possible.
- Copy GitHub permalink.
- Open on GitHub.
- Copy selected source.
- Copy selected source with line numbers.

---

## READ-105 — Markdown Internal Navigation

**Priority:** P1
**Effort:** M
**Depends on:** REF-100
**Status:** Not Started

Relative repository Markdown links should navigate inside RepoDeck while retaining the current ref.

### Acceptance Criteria

- Relative file links remain inside RepoDeck.
- Relative anchors work.
- Historical ref is preserved.
- External URLs remain external.
- Path traversal is normalized safely.
- Existing expected new-tab behavior is preserved for external links.

---

## READ-106 — Markdown Heading TOC

**Priority:** P1
**Effort:** M
**Status:** Not Started

- H1–H4 outline.
- Stable heading IDs.
- Active section.
- Click-to-scroll.
- Collapsible/mobile layout.

---

# 7. Milestone 3 — Repository History Becomes First-Class

Recommended navigation:

```text
Version: main ▼

Files | Commits | Compare
```

---

## HISTORY-101 — Repository Commit History

**Priority:** P1
**Effort:** M
**Depends on:** REF-100, SEC-103
**Status:** Not Started

Show:

- Commit subject.
- Short SHA.
- Author.
- Timestamp.
- Optional avatar.
- Verification state when useful.

### Acceptance Criteria

- History loads for the appropriate selected ref.
- Pagination/infinite loading.
- GitHub rate-limit state is understandable.
- SHA copy.
- Browse repository at commit.
- Open on GitHub.
- No clone/index required.

---

## HISTORY-103 — Browse Repository at Commit

**Priority:** P1
**Effort:** M
**Depends on:** HISTORY-101, REF-100
**Status:** Partial Foundation

Implement this **before the full commit-detail view**.

Existing tree/file APIs already have much of the underlying generic-ref behavior.

### Historical banner

```text
Viewing commit a1b2c3d

Fix authentication edge case
2 hours ago

[Back to main]
```

### Acceptance Criteria

- Tree loads at commit SHA.
- File loads at commit SHA.
- Internal navigation keeps the SHA.
- URL is shareable.
- Historical state is visually unmistakable.
- One-click return to origin branch.
- Editing controls are unavailable in historical state.

---

## HISTORY-102 — Commit Detail View

**Priority:** P1
**Effort:** L
**Depends on:** HISTORY-101
**Status:** Not Started

Display:

- Full commit message.
- Author/committer.
- Timestamp.
- Full SHA.
- Parent(s).
- Verification.
- Changed files.
- Additions/deletions.

Changed files:

- Path.
- Change type.
- Statistics.
- Unified patch where GitHub provides it.

### Acceptance Criteria

- Binary files degrade gracefully.
- Missing/truncated GitHub patch data is explicit.
- Merge commits support multiple parents.
- Large commits use rendering limits.
- Browse repository at commit.
- Compare to parent.
- Open on GitHub.

---

## HISTORY-104 — Ref Switcher

**Priority:** P1
**Effort:** M
**Depends on:** REF-100, HISTORY-101, HISTORY-103
**Status:** Partial

Evolve the branch selector:

```text
Switch version

Branches
✓ main
  develop

Recent commits
  a1b2c3d Fix auth edge case
  e4f5g6h Improve viewer

Tags
  v1.4.0
```

### Acceptance Criteria

- Current ref type is obvious.
- Branch switching remains quick.
- Commit SHA can be pasted.
- Recent commits are accessible.
- Tags are accessible.
- Transient line/search/diff state resets appropriately.

---

## REPO-101 — Per-File Commit History

**Priority:** P1
**Effort:** M
**Depends on:** HISTORY-101
**Status:** Not Started

From an active file:

```text
History
```

shows commits affecting that path.

Renames and deletions should degrade clearly rather than pretending history is complete.

---

## HISTORY-105 — Repository Tags

**Priority:** P2
**Effort:** S–M
**Depends on:** REF-100, HISTORY-104
**Status:** Partial Foundation

Generic file/tree ref handling already supplies part of the data-plane behavior.

Remaining work:

- Enumerate tags.
- Resolve display metadata.
- Distinguish annotated/lightweight tags where useful.
- Display current tag state.

---

## HISTORY-106 — Commit Navigation

**Priority:** P2
**Effort:** S
**Status:** Not Started

Support chronology/parent navigation without implying that Git necessarily forms a simple linear history.

---

# 8. Milestone 4 — Repository Understanding

---

## REPO-102 — Unified Ref Diff

**Priority:** P1
**Effort:** L
**Status:** Not Started

Support where GitHub semantics allow:

```text
branch ↔ branch
commit ↔ commit
branch ↔ commit
tag ↔ branch
```

### First version

- Base ref.
- Head ref.
- Changed files.
- Unified diff.
- Addition/deletion stats.
- Collapsible sections.
- Rendering limits.
- Binary fallback.

---

## REPO-103 — Compare Commit with Parent

**Priority:** P1
**Effort:** M
**Depends on:** HISTORY-102, REPO-102
**Status:** Not Started

Natural bridge:

```text
Commit
→ View changes
→ parent..commit
```

---

## REPO-104 — Repository Code Search

**Priority:** P1
**Effort:** L
**Status:** Not Started

Use GitHub-supported search capabilities rather than cloning/indexing initially.

### Important constraint

Do not promise arbitrary historical-ref content search where GitHub's API does not actually support the desired semantics.

UI should make scope limitations explicit.

---

## READ-107 — Split-Pane Reading

**Priority:** P1
**Effort:** L
**Status:** Not Started

First version:

- Vertical split.
- Independent file selection.
- Independent scrolling.
- Clear active pane.
- Independent refs only if architecture remains understandable.

Later:

- Horizontal split.
- Resize.
- Saved layout.

---

## REPO-105 — Side-by-Side Diff

**Priority:** P2
**Effort:** L
**Depends on:** REPO-102

---

## REPO-106 — Inline Git Blame

**Priority:** P2
**Effort:** L

---

## REPO-107 — Commit Filtering

**Priority:** P2
**Effort:** M

Support useful GitHub-backed filters first rather than implementing a local commit index.

---

# 9. Milestone 5 — Installed-App Quality

This work can proceed in parallel, but should not displace the repository-reading core.

---

## PWA-101 — Update Available UX

**Priority:** P1
**Effort:** M
**Status:** Not Started

```text
A new RepoDeck version is available.

[Update]
[Later]
```

- Detect waiting worker.
- Explicit activation.
- Single controlled reload.
- No controller-change reload loop.

---

## PWA-105 — PWA Observability

**Priority:** P1
**Effort:** M
**Status:** Not Started

Track operational events, never repository source:

- Registration failures.
- Enrollment/reconciliation failures.
- Dead-subscription cleanup.
- Provider failures.
- Offline fallback displays.
- Waiting-worker events.
- Install-mode usage where non-invasive.

---

## PWA-102 — Real Product Notifications

**Priority:** P2 until a real event exists
**Effort:** L
**Status:** Not Started

Do **not** build notification infrastructure in search of a use case.

Promote to P1 when RepoDeck has a real asynchronous event users care about, such as watched-repository changes or a future long-running process.

Requirements remain:

- Event IDs.
- Authorization.
- Idempotency.
- Opt-in.
- Same-origin links.
- Rate limiting.

---

## PWA-103 — Notification Preferences

**Priority:** P2
**Effort:** M
**Depends on:** PWA-102

---

## PWA-104 — Notification Device Management

**Priority:** P2
**Effort:** M

---

## PWA-108 — Scheduled Stale Subscription Cleanup

**Priority:** P2
**Effort:** S
**Status:** Partial

Opportunistic cleanup already exists.

This item should now specifically mean **scheduled/maintenance cleanup**, not duplicate runtime cleanup.

---

## PWA-107 — Installation Promotion

**Priority:** P2
**Effort:** S

---

## PWA-106 — App Badge

**Priority:** P3
**Effort:** M
**Depends on:** A genuine unread-event model

---

# 10. Milestone 6 — Specialized Viewing

---

## VIEW-101 — JSON Tree Viewer

**Priority:** P2
**Effort:** M

Source/tree toggle, copy value/path, search, expansion controls and large-file limits.

---

## VIEW-102 — Complete SVG Viewer

**Priority:** P2
**Effort:** S–M
**Depends on:** SEC-102
**Status:** Partial

RepoDeck already has SVG preview through its image viewer, including zoom/reset/checkerboard behavior.

Remaining product work:

- Preview/source toggle.
- Confirm safe rendering architecture from SEC-102.
- Appropriate large-file/failure states.

---

## VIEW-103 — CSV / TSV Grid

**Priority:** P2
**Effort:** M

---

## VIEW-104 — Mermaid Rendering

**Priority:** P2
**Effort:** M

Dynamic import only.

---

## VIEW-105 — KaTeX Rendering

**Priority:** P2
**Effort:** M

Lazy load.

---

## VIEW-106 — Dependency Viewer

**Priority:** P2
**Effort:** M

Start with:

- `package.json`
- `Cargo.toml`
- `go.mod`

Local parsing first.

---

## VIEW-107 — PDF Viewer

**Priority:** P3
**Effort:** L

Only after demand.

---

# 11. Milestone 7 — Power Reading & Export

## POWER-101 — Zen Mode

**Priority:** P2
**Effort:** S

---

## POWER-102 — Snippet Image Export

**Priority:** P2
**Effort:** M
**Depends on:** READ-102

---

## READ-108 — Symbol Outline

**Priority:** P2
**Effort:** L

Use a real parser strategy. Do not create a broad regex pseudo-parser.

---

## POWER-103 — Vim Navigation

**Priority:** P3
**Effort:** M

Optional and never active in typing contexts.

---

## EXPORT-101 — Download Current File

**Status:** **Done**

Remove from the active feature backlog.

---

## EXPORT-102 — Repository Reading Bundle

**Priority:** P2
**Effort:** L

Explicit export only, with clear disclosure that private source is leaving RepoDeck's normal transient-data boundary.

---

# 12. Cross-Cutting Quality Backlog

## QUAL-101 — Performance Budget

**Priority:** P1
**Status:** Ongoing

Targets:

- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1

Additional repo-specific requirements:

- Lazy-load Shiki where practical.
- READ-100 large-file guard.
- Virtualize/paginate large history surfaces.
- Cap diff rendering.
- Lazy-load Mermaid/KaTeX/editor/AI interfaces.

---

## QUAL-102 — Keyboard Accessibility

**Priority:** P1
**Status:** Ongoing

Audit every new feature as it ships rather than postponing one giant remediation phase.

---

## QUAL-103 — Screen Reader Accessibility

**Priority:** P1
**Status:** Ongoing

Particularly important for:

- Active ref.
- Historical mode.
- Line selection.
- Search match status.
- Diffs.
- Future draft/edit state.

---

# 13. Security Regression Backlog

## SEC-101 — Push Security Regression Tests

**Priority:** P1
**Status:** Ongoing

Maintain the existing protection suite and move important assertions from source-string/static tests toward behavioral integration tests where practical.

---

## SEC-104 — Editing Permission Audit

**Priority:** Future P0

Must pass before any write-capable release.

---

## SEC-105 — AI Editing Privacy Review

**Priority:** Future P0

Must pass before repository source is sent to an AI provider.

---

# 14. Observability

## OPS-101 — GitHub API Health

**Priority:** P1
**Effort:** M

Before expanding history/search heavily, instrument:

- Latency.
- GitHub rate limits.
- Authentication failure.
- Ref resolution.
- Commit API failure.
- Compare failure.
- Code-search failure.

Never log source contents.

---

## OPS-102 — Viewer Errors

**Priority:** P1
**Effort:** S–M

Track rendering failures and large-file fallbacks without source content.

---

## OPS-103 — Editing Operations

**Priority:** Future

---

## OPS-104 — AI Editing Operations

**Priority:** Future

---

# 15. Future Track — Safe Single-File Editing

This track remains correctly sequenced after reading/history/diff foundations.

## EDIT-001 — GitHub Write Permission Upgrade

**Future P1 / L**

Ordinary browsing must not require write scope.

---

## EDIT-002 — Single-File Manual Editor

**Future P1 / L**

---

## EDIT-003 — Local Draft State

**Future P1 / M**

Maintain explicitly:

```text
repository
base ref
source SHA
original content
draft content
generated diff
```

---

## EDIT-004 — Exact Diff Review

**Future P1 / M**
**Depends on:** REPO-102

No repository write before review.

---

## EDIT-005 — Branch-First Commit Flow

**Future P1 / L**

Default:

```text
Edit
→ Review
→ New branch
→ Commit
```

---

## EDIT-006 — Conflict Detection

**Future P1 / L**

The source SHA is authoritative. Never silently overwrite new GitHub content.

---

## EDIT-007 — Pull Request Creation

**Future P2 / M**

---

# 16. Future Track — AI-Assisted Single-File Editing

Keep the invariant:

```text
One file
+
One user instruction
+
One proposed patch
+
One explicit review
```

## AIEDIT-001 — Selected-Line AI Editing

**Future P1 / L**
**Depends on:** READ-102, EDIT-002

---

## AIEDIT-002 — Whole-File Small Change

**Future P1 / L**

---

## AIEDIT-003 — Structured Patch Generation

**Future P1 / L**

RepoDeck independently validates and applies the result to local draft state.

---

## AIEDIT-004 — AI Diff Review UX

**Future P1 / M**

---

## AIEDIT-005 — Text Instructions

**Future P1 / S**

---

## AIEDIT-006 — Dictation-Friendly Editing

**Future P1 / S initially**

Use native mobile dictation first.

---

## AIEDIT-007 — Provider Abstraction

**Future P1 / M**

```text
AI Edit Service
      ↓
Provider adapter
      ↓
Gemini / future provider
```

Provider identity should not leak into repository-state architecture.

---

## AIEDIT-008 — AI Cost & Abuse Controls

**Future P1 / M**

---

# 17. Explicitly Deferred

## Multi-File AI Editing

**Deferred**

Do not treat this as an incremental extension of single-file editing.

It requires a multi-file draft model, repository-wide context selection, atomic patches and substantially different safety/cost architecture.

---

## OFFLINE-001 — Private Repository IndexedDB Cache

**Deferred**

---

## OFFLINE-002 — Full Offline Repository Mode

**Deferred / XL**

Private offline storage should become a separate product initiative only after explicit demand.

---

# 18. Recommended Delivery Order

The updated sequence should be:

```text
0. Release/security gate
   ↓
1. Stable lines + real ref semantics
   ↓
2. Excellent source reading
   ↓
3. First-class repository history
   ↓
4. Diff/search/repository understanding
   ↓
5. Installed-app polish
   ↓
6. Specialized viewers
   ↓
7. Power reading/export
   ↓
8. Safe manual single-file editing
   ↓
9. AI-assisted single-file editing
   ↓
10. Evaluate multi-file editing only from real demand
```

---

# 19. Best Immediate Work

## Gate — Before Feature Expansion

**Must complete**

- **SEC-100** — Anonymous repository access boundary.
- **SEC-102** — SVG response isolation.
- **PWA-001** — Real production validation.
- **PWA-002–006** — Complete browser/device release matrices.

These are not product embellishments. They establish the security and production baseline for everything added afterward.

## First Feature Sprint

### Sprint goal

> Establish the foundations required for fast line-oriented reading and trustworthy historical repository navigation.

### Must Have

- **READ-100** — Stable line model and large-file behavior.
- **REF-100** — First-class branch/commit/tag ref model.
- **SEC-103** — Historical ref validation.
- **READ-101** — In-file search.

### Should Have

- **READ-102** — Line selection.
- **PWA-101** — Waiting-worker/update UX.

### Stretch

- **READ-103** — Line permalinks.

## Second Feature Sprint

### Sprint goal

> Turn repository history into an actual RepoDeck navigation dimension.

### Must Have

- **HISTORY-101** — Commit history.
- **HISTORY-103** — Browse repository at commit.
- **READ-103** — Permalinks if not completed.
- **READ-104** — Line actions.

### Should Have

- **HISTORY-104** — Ref switcher.
- **READ-105** — Markdown internal navigation.

## Third Feature Sprint

### Sprint goal

> Explain what changed and why.

### Must Have

- **HISTORY-102** — Commit detail.
- **REPO-102** — Unified diff foundation.
- **REPO-103** — Compare commit to parent.
- **REPO-101** — Per-file history.

Then move into repository code search and split-pane reading.

---

# 20. Navigation North Star

The application should steadily converge on:

```text
RepoDeck
owner / repository

Version
main ▼

Files | Commits | Compare
```

Version picker:

```text
Branches
✓ main
  develop

Recent commits
a1b2c3d  Fix auth edge case
e4f5g6h  Improve viewer

Tags
v1.4.0
v1.3.2
```

Historical mode:

```text
Viewing commit a1b2c3d
Fix auth edge case

[Back to main]
```

A fundamental UX invariant should be:

> **RepoDeck never makes the user guess which version of the repository they are viewing.**

---

# 21. Final Product North Star

```text
Open RepoDeck
      ↓
Choose repository
      ↓
Choose branch / commit / tag
      ↓
Read and navigate quickly
      ↓
Search source
      ↓
Inspect history
      ↓
Compare versions
      ↓
Share exact lines
      ↓
Notice a small issue
      ↓
Select lines
      ↓
Edit manually
   or
Ask AI for one small patch
      ↓
Review exact diff
      ↓
Create safe branch
      ↓
Commit
      ↓
Optional pull request
```

The most important change from the original backlog is architectural: **security boundaries, explicit ref semantics, and a stable line model now sit in front of the feature roadmap.** That matches what the actual RepoDeck code needs rather than treating search, selection, commits and tags as isolated UI additions.
