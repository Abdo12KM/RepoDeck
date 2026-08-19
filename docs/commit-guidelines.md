# Commit Guidelines and Review Process

This document outlines the standard process for reviewing staged changes and generating consistent commit messages for **RepoDeck**. It also serves as a system prompt for the AI assistant.

> **⚠️ DON'T EVER COMMIT ANYTHING FROM YOUR SIDE, YOUR ROLE IS TO REVIEW THE STAGED FILES AND GENERATE A COMMIT MESSAGE ONLY.**

## 1. Review Process

> **⚠️ All steps below are mandatory.**

When asked to "review staged git files" or "prepare a commit message", follow these steps:

1.  **List Staged Files**:
    - Run `pnpm format` to format the code properly before seeing the diff.
    - Run `git diff --cached --name-only` to see the list of files to be committed.

2.  **Analyze Changes (Temp File Method)**:
    - **ALWAYS** write the diff to a temporary file to avoid truncation.
    - Run: `git diff --cached -- . ':!bun.lock' ':!pnpm-lock.yaml' > temp_diff.txt`
    - Read the **ENTIRE** content of `temp_diff.txt`.
    - **Delete** the temporary file (`del temp_diff.txt` / `Remove-Item temp_diff.txt` / `rm temp_diff.txt`) when you're entirely done with the analysis.

3.  **The "Audit" Phase**:
    - **Do not just summarize the main feature.** You must look for side-effects.
    - **Checklist for analysis**:
      - **Logic**: What are the main feature changes? (GitHub API requests, viewer state, SWR cache keys, session handling, token decryption, etc.)
      - **UI/CSS**: Are there small tweaks (e.g., margins, z-index, theme tokens, Tailwind classes) unrelated to the main feature? **These must be logged.**
      - **Files**: Are files deleted, moved, or renamed? Mention the exact filenames.
      - **Deps**: Which specific packages in `package.json` were added, updated, or removed? **List them.**
      - **Docs**: Did `README.md`, `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, or docs in `./docs/` change?

4.  **Code Review Phase**:
    - **Go beyond summarizing—actively review the code quality.**
    - **Checklist for code review**:
      - **Product Boundaries**: Does the change respect RepoDeck's read-only nature? Ensure no arbitrary mutating GitHub endpoints, no global PATs, no AI agent loops, and that anonymous access remains scoped to the fixed cached demo.
      - **Bugs & Edge Cases**: Look for potential bugs, missing error handling on GitHub rate limits/failures, or token decryption edge cases.
      - **Performance**: Identify performance concerns (unnecessary re-renders, unmemoized syntax highlighting, missing virtualization on large trees/files).
      - **Security & Privacy**: Ensure GitHub tokens remain encrypted with AES-GCM, private repository responses are set to `private, no-store`, and no credentials or secrets are leaked.
      - **Type Safety**: Verify TypeScript strictness (`pnpm typecheck`), avoid unsafe `any` types, and ensure Zod schemas match runtime expectations.
      - **Conventions & Best Practices**: Verify `@/*` module imports, use of Shadcn primitives/tokens, and proper server vs. client component separation in Next.js App Router.
      - **Principles**: Does the code follow KISS, YAGNI, DRY?
    - **Report your findings** to the user before generating the commit message. If critical issues exist, recommend fixing them before committing.

5.  IMPORTANT: **If docs didn't change, check if any relevant documentation files inside `./docs/` (e.g., `architecture.md`, `deployment.md`, `security.md`, `pwa.md`), `./README.md`, `./AGENTS.md`, `./PRODUCT.md`, or `./DESIGN.md` need to be updated and advise accordingly. This requires reading the files, not just checking for existence.**

## 2. Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, with a focus on **completeness**.

### Format

```text
<type>(<scope>): <subject>

[Bulleted list of feature work]

[Optional: Fixes & Maintenance Footer]
[Bulleted list of side-effects, chores, and minor fixes]
```

### 1. Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Formatting, whitespace, semi-colons, etc. (no code logic change)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build scripts, dependencies, tool configuration, etc.

### 2. Common RepoDeck Scopes

- `viewer`: File viewer, code display, syntax highlighting, breadcrumbs
- `repo`: Repository tree, branches, commit list, repository picker
- `auth`: GitHub App OAuth, sessions, token management, permissions
- `github`: Octokit integration, rate limiting, REST caching
- `workspace`: Multi-pane layouts, panel resizing, navigation
- `pwa`: Service worker, web push notifications, offline manifest
- `db`: Neon Postgres schema, migrations, Drizzle queries
- `settings`: Appearance, themes, font settings, user preferences
- `ui`: Shared UI components, dialogs, dropdowns, Radix primitives
- `deps`: Dependency upgrades or package.json updates
- `docs`: Documentation in `/docs` or root markdown files

### 3. Handling "Mixed" Commits

If a commit contains a Feature _and_ unrelated Fixes/Chores (a "Squash" commit):

1.  Use the **dominant** type (usually `feat`) for the Subject Line.
2.  List the main work in the primary body.
3.  **Mandatory:** Group unrelated changes (CSS tweaks, dependency updates, small bugfixes) in a separate section at the bottom titled `Fixes & Maintenance:`.

### 4. Subject Line

- Imperative, present tense: "add" not "added", "fix" not "fixed", "change" not "changed".
- No period (`.`) at the end.
- Keep it under 72 characters.

### 5. Body Content Rules

- **Be Specific:** Do not say "update dependencies." Name the packages, for example: `update dependencies (@octokit/rest, swr)`.
- **Be Honest:** If a file was deleted, write `delete unused src/components/repo/OldTree.tsx`.
- **Reveal Hidden Changes:** If you fixed a mobile dialog styling bug while working on the viewer, you **must** list the dialog fix in `Fixes & Maintenance:`.
  > [!CAUTION]
  > **NO INTERNAL LINKS OR ABSOLUTE PATHS — EVER!**
  > NEVER, under ANY circumstances, include system links, IDE references, or absolute paths in the commit message. This includes `cci:`, `file:///`, `D:/`, `C:/`, or any clickable link syntax. Output ONLY plain text with clean relative paths (e.g., `src/components/viewer/FileViewer.tsx`) or plain filenames (`FileViewer.tsx`). **Strip ALL link formatting before outputting. Violating this rule is unacceptable.**

---

### Example (Ideal Output)

```text
feat(viewer): add file breadcrumbs and raw content copy

- add interactive breadcrumb navigation in `FileViewerHeader`
- implement raw file copy button with toast feedback in `CodeViewer`
- integrate `@tanstack/react-virtual` for large file line rendering
- support language override detection for non-standard file extensions in `src/lib/github/languages.ts`

Fixes & Maintenance:
- fix mobile drawer backdrop blur in `RepositoryPickerDialog`
- update SWR cache keys for branch switching in `useRepoTree`
- delete obsolete `src/components/viewer/LegacyFileView.tsx`
- update dependencies: @octokit/rest, swr, shiki
- update docs/architecture.md with viewer state flow
```

---

## 3. System Prompt for AI

When the user asks to review staged files or generate a commit, you **MUST** use the following internal logic:

1.  **Capture**: Get the full diff using the temp file method (`temp_diff.txt`).
2.  **Audit**: Scan the diff for _every_ change, not just the primary feature. Look for side effects (renames, deleted files, CSS tweaks, dependency changes).
3.  **Review**: Validate changes against RepoDeck's architecture and conventions (read-only enforcement, `@/*` imports, token encryption, error handling).
4.  **Draft**:
    - Identify the Primary Feature.
    - Identify Secondary Changes (side effects, chores, maintenance).
5.  **Format**:
    - Write the Subject Line based on the Primary Feature using standard `<type>(<scope>): <subject>` format.
    - Write the Body bullets for the Primary Feature.
    - **Crucial Step**: If Secondary Changes exist, add a `Fixes & Maintenance:` footer and list them there.
6.  **Refine**:
    - Ensure specific filenames and package names are used.
    - Avoid vague phrases like "various fixes."
      > [!CAUTION]
      > **SANITIZE ALL PATHS (MANDATORY):**
      > Before outputting, you MUST strip any `cci:`, `file:///`, IDE links, or absolute paths (e.g., `D:/`, `C:/`). Output ONLY clean relative paths like `src/lib/github/client.ts` or plain filenames. **NO CLICKABLE LINKS IN COMMIT MESSAGES. EVER. THIS IS NON-NEGOTIABLE.**
7.  **Notify User**: Remind user to format code (`pnpm format`) and run validation tests (`pnpm typecheck`, `pnpm test:run`) before committing.
