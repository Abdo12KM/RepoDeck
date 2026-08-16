# RepoDeck design direction

## Product surface

RepoDeck is a read-only GitHub repository viewer. The primary landing page is `/`; `/landing` redirects to it, and the older landing-v2 source remains preserved for reference without being the public entry point. The current landing page points visitors to one real, cached RepoDeck demo and explains that GitHub sign-in is required to browse their own repositories.

The anonymous UI intentionally does not expose an arbitrary repository URL probe. This keeps the first-run experience honest about GitHub’s small unauthenticated request budget while preserving the real viewer route and shareable repository state.

## `/` visual world

The page is a quiet, dark reading surface: restrained panels, repository-aware typography, one clear demo action, and explicit public/private access boundaries. Cyan marks active reading and links, while the existing theme tokens carry the rest of the interface without adding a fake repository preview to the hero.

## Tokens

- Ground: `#070b12`; soft ground: `#0a1018`.
- Panels: `#0e1721` and raised panel `#13212d`.
- Structure: `#274353` with a low-alpha soft rule.
- Text: `#edf7f7`; supporting text: `#9bb1bb`; dim metadata: `#6e858f`.
- Signal accents: cyan `#72e1e2`, yellow `#f6c453`, blue `#8daaf5`, red `#f18b82`, green `#6fd09d`.
- Typography inherits the project’s Geist Sans and Geist Mono variables. Mono is for paths, metadata, file labels, and boundary rails; sans is for reading copy and headings.

## Composition

- Hero: a direct route into the real cached RepoDeck demo plus a sign-in path for personal repositories.
- Theme studio: a focused demonstration of code-reading themes and visual controls.
- Access boundary: the fixed public demo is separated from authenticated public and selected-private access.
- FAQ: concrete answers about caching, cloning, permissions, and shareable viewer state.
- Close: one final promise and one route into the real viewer.

## Responsive contract

- At desktop widths, the hero keeps the primary action and access explanation legible within a wide reading canvas.
- The theme studio and access boundary use restrained two-column layouts when space allows and stack without losing hierarchy on smaller screens.
- At phone widths, actions stack, copy stays readable, and cards remain inside the viewport with comfortable touch targets.
- Touch targets remain generous, focus states remain visible, and content stays inside the viewport.

## Interaction and accessibility

- The demo CTA opens `/repositories?owner=Abdo12KM&repo=repodeck&ref=main`, where the real cached tree and files are readable.
- The sign-in CTA routes to the existing GitHub authorization flow for the authenticated repository picker.
- Viewer state remains shareable through repository, branch, and file-path query parameters.
- The page includes a skip link, semantic headings, labelled controls, labelled navigation, visible focus rings, reduced-motion handling, and no color-only meaning.
- Decorative logo imagery is empty-alt when visible brand text already provides the name.

## Content guardrails

Use precise repository-viewer language: read, inspect, branch, file, path, share, demo, public, private, read-only, cached. Avoid arbitrary anonymous URL-probe promises, IDE replacement claims, clone-first workflow language, inflated speed claims, generic SaaS benefit grids, and any implication that RepoDeck edits or executes repository code.
