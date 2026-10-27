# AI Empire — development baseline

Mobile-first idle tycoon. This branch repairs the existing prototype; it is not the approved visual redesign.

## Environment boundaries

- Public game: https://itspinecones.github.io/Ai-Empire/
- Development branch: `dev/baseline-repair` (based on `5d43eb7`).
- The development preview uses `ai-empire-development-v1` for saved progress. The public game's `ai-empire-v01` key is never read, changed, or cleared.
- Do not push to `main`, change GitHub Pages settings, merge this branch, or release a redesign without the owner's explicit approval.
- Show portrait and landscape mockups before implementing major visual changes.

## Local use

Requires Node.js 22 or later for checks. No package installation is needed.

```sh
npm run check
npm test
npm run build
```

Serve `dist/` using an HTTP static server. ES modules need HTTP rather than opening the HTML file directly. Building does not publish anything.

## Source layout

- `index.html`: accessible page structure and default labels.
- `src/styles.css`: responsive layout, including narrow screens and safe areas.
- `src/game.js`: economy, save validation and elapsed-time calculations.
- `src/app.js`: buttons, display updates and preview-only storage.
- `src/room.js`: retained 2D bedroom drawing, now independent of gameplay startup.
- `preview/index.html`: original experimental Three.js page, unchanged and not included in the baseline build.
- `tests/`: economy and persistence regression checks.

See `DEVELOPMENT.md` for validation and the next visual milestone.
