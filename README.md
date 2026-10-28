# AI Empire — development baseline

Mobile-first idle tycoon. This development branch now integrates the approved illustrated bedroom style with working controls. The room rotates between typing, walking and petting the cat every 60 seconds, independently of AI jobs. Routine progress survives reload. Sleeping waits for the future day/night system. These are illustrated sprite animations, not true 3D. Future interactions are described in ROOM-LIFE.md.

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
- `assets/`: approved-style portrait and landscape room artwork.
- `src/room.js`: legacy 2D drawing, retained but not loaded.
- `preview/index.html`: original experimental Three.js page, unchanged and not included in the baseline build.
- `tests/`: economy and persistence regression checks.

See `DEVELOPMENT.md` for validation and the next visual milestone.
