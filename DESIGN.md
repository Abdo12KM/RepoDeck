# RepoDeck design direction

## Product surface

RepoDeck is a read-only GitHub repository viewer. The `/landing` page should get a developer to a public repository quickly, explain the public/private access boundary honestly, and make the viewer feel useful on a phone as well as on a large screen.

## `/landing` visual world

The page is an event-display-inspired reading instrument: a near-black canvas, quiet ruled structure, repository paths as coordinates, and a selected file rendered as the active signal. Cyan carries the current reading surface, yellow carries the primary action or branch path, and red/blue are reserved for related signals in the illustrative viewer.

The visual language is intentionally separate from the existing root landing page so the new route can be evaluated as a complete alternative without changing `/`.

## Tokens

- Ground: `#070b12`; soft ground: `#0a1018`.
- Panels: `#0e1721` and raised panel `#13212d`.
- Structure: `#274353` with a low-alpha soft rule.
- Text: `#edf7f7`; supporting text: `#9bb1bb`; dim metadata: `#6e858f`.
- Signal accents: cyan `#72e1e2`, yellow `#f6c453`, blue `#8daaf5`, red `#f18b82`, green `#6fd09d`.
- Typography inherits the project’s Geist Sans and Geist Mono variables. Mono is for paths, metadata, file labels, and boundary rails; sans is for reading copy and headings.

## Composition

- Hero: a direct repository probe paired with a believable selected-file reader state.
- Boundary rail: four concrete product constraints below the first view.
- Read path: a three-stage ordered path from reference to shareable file URL.
- Mobile proof: an actual phone-sized interactive preview, not a desktop screenshot scaled down.
- Access: public and private flows are separated into two plain-language columns.
- Close: one final promise and one route into the real viewer.

## Responsive contract

- At desktop widths, the hero uses a copy/display split and the viewer keeps file rail, event view, and code pane visible.
- Below the tablet breakpoint, the code pane moves below the event view.
- At phone widths, the file rail becomes a full-width “File map” disclosure, the hero form stacks, the boundary rail becomes a two-by-two grid, and the phone preview keeps controls in a bottom bar.
- Touch targets remain generous, focus states remain visible, content stays inside the viewport, and bottom controls account for `safe-area-inset-bottom`.

## Interaction and accessibility

- The repository probe accepts `owner/repository`, GitHub repository URLs, and direct `tree`/`blob` paths, then routes to `/repositories`.
- The event display lets users select a file, open the mobile file map, and copy the selected preview.
- The phone preview toggles between files and code to demonstrate the mobile reading flow.
- The page includes a skip link, semantic headings, labelled form controls, labelled navigation, visible focus rings, inline validation, reduced-motion handling, and no color-only meaning.
- Decorative logo imagery is empty-alt when visible brand text already provides the name.

## Content guardrails

Use precise repository-viewer language: read, inspect, branch, file, path, share, public, private, read-only. Avoid IDE replacement claims, clone-first workflow language, inflated speed claims, generic SaaS benefit grids, and any implication that RepoDeck edits or executes repository code.
