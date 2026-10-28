# Hourly room routine — October 28, 2026

The existing clock controls the routine: one game hour per real minute. At each hour boundary choose uniformly from the other two activities (typing, cat, window). Walking connects destinations and can be interrupted by the next boundary. No separate activity countdown. Sleep remains deferred. Business rules and job timers are unchanged.

Character artwork is reduced, with a new window pose and four-frame directional walk atlas. Travel uses continuous floor coordinates and distance-based frames; reduced motion skips travel. Save key ai-empire-room-hourly-v2 retains route and position across reloads. Old cosmetic routine saves reset safely; economy saves remain intact. Hidden travel pauses, then the controller uses the current game hour on return. Missed hours choose one current destination rather than replaying every missed activity.

Limitations: the walk includes passing poses but the leading-leg silhouettes still repeat, so natural alternating-foot gait needs further artwork work. Seated character/chair remain combined; posture transitions switch images. This is illustrated animation, not true 3D. Physical iPhone performance remains unmeasured.

Validation: 18 tests pass, including exact hour boundaries, excluding immediate activity repetition, all destinations, interruption mid-travel, reload recovery, missed hours, reduced motion and existing economy/job rules. Structure and syntax checks pass. Local browser verified the window activity on a 390×844 frame with no horizontal overflow and an hourly transition from typing into travel. Public main remains 5d43eb709876d5a5a21ea4dc59598c060330f1e2. Development branch/private preview only.

---

## Historical checkpoints (superseded by hourly routine above)

# One-minute room activities — October 28, 2026

Approved scope: typing → walking → cat time, 60 seconds each, repeating independently of AI jobs. Sleeping is excluded until the clock/day-night system is developed. The existing display clock remains unchanged; it does not control these real-time activity slots.

Implementation: independent requestAnimationFrame controller paints at most 30 times per second. Transparent four-frame walk poses (front/back, mirrored for direction) and a four-frame petting atlas render over the approved room. A separate empty-chair image stays at the desk when the seated person/chair image is hidden. The cat appears once, either standalone or in the petting pose. Routes use hand-calibrated floor waypoints in portrait and landscape; the final five seconds of cat time are used to walk back to the desk. Activity labels/countdowns distinguish the new preview from the previous typing/rest build.

Routine progress is stored separately under ai-empire-room-routine-v1. Reload resumes the current activity; hidden tabs pause room time. Jobs retain their original independent offline timer and save key. Every pose is preloaded before leaving the desk, with a visible error and seated fallback on load failure. Reduced motion freezes sprite frames and travel. New WebP assets total about 755 KB, reused in both orientations. No new runtime dependencies.

Limitations: layered illustrated poses, not a rigged 3D character. Sitting/crouching transitions switch poses; walking frames are approximate and still need animation polish. The typing sprite retains its original embedded chair, replaced by the separate empty chair while away. Routes are authored for this fixed room, not a general pathfinding system. Clothing, installable GPUs and behavior unlocks are future work. Physical iPhone performance remains unmeasured.

Validation: 20 automated checks/tests cover exact 60-second boundaries, all three activities, cycle repetition, no sleep activity, reload recovery, route continuity in both orientations, reduced motion, and existing business rules. Browser observed a full real-time typing → walking → cat → typing cycle, a job started during walking completing for $5, and routine continuity through reload. Portrait 390×844 and landscape 844×390 have no horizontal overflow. Source remains on dev/baseline-repair; public main and GitHub Pages are not modified.

---

# Independent room routine — October 28, 2026

User direction: room life is independent of business buttons and job state. The character should eventually walk, pet a cat, type and sleep in the bed at night. Upgrades can unlock behaviors; furniture will later offer interactions such as installing a purchased GPU and changing clothes at a wardrobe. Bedtime is intentionally undecided.

Implemented now: a separate routine module alternates typing and seated breaks using the existing approved person artwork. The HTML room-activity attribute drives the character and monitor animations. Job start/completion, upgrades and resetting the economy do not change the routine. Ambient time pauses in hidden tabs; business timers retain saved offline completion. Reload starts a fresh cosmetic routine without altering the saved job. Reduced-motion settings still suppress movement. No new furniture, poses or sleep schedule have been integrated.

Next visual milestone: approve the activity storyboard, then create separate standing/walking, petting and sleeping poses. The current sprite includes the chair, so the chair must become its own stationary layer before walking is implemented. See ROOM-LIFE.md for the agreed direction and implementation sequence.

Validation: 18 tests passed, including independent routine transitions and long time steps; syntax/HTML checks passed. Browser verified typing without a job, a seated break while a job remained active, reload with 1.1 seconds left and one $5 payout. No horizontal desktop overflow or game console errors; only extension metadata errors. New mobile layout and physical iPhone checks were not repeated because geometry/artwork were unchanged. Public main and GitHub Pages remain unchanged.

---

# Workstation loop — October 28, 2026

Current build: 10-second jobs, reward snapshot at start, one active job, saved timer, one-time completion payout. Existing preview saves migrate without losing balances. Progress and working animation continue correctly after reload; one started job can complete while away, but no unstarted jobs auto-run.

Art: separate generated room and transparent seated person/chair layers in both orientations. Full-canvas sprites are positioned/scaled in a shared aspect-ratio stage. Idle breathing and small working sway are CSS animations; monitor glow varies while working. This is layered illustration, not skeletal 3D or independent finger animation. Blinking is deferred because the face is mostly turned away. Reduced-motion settings disable movement; hidden pages pause animation. Original flat assets retained for rollback.

Checks: 13 engine tests, syntax/HTML checks, browser job start and reload persistence. Old saves, repeated start rejection, one-time payout and mid-job upgrade reward stability covered. Physical iPhone validation still requires user testing. One active preview tab is recommended; simultaneous tabs are not coordinated.

Production main and Pages unchanged. Private preview only.

## Previous checkpoints

# Approved artwork integration — October 28, 2026

Current preview uses two generated static room illustrations with live HTML controls, portrait bottom navigation, landscape sidebar and a native upgrades dialog. It is NOT a true 3D scene; character movement and dynamic lighting remain unimplemented. The old canvas module is retained but no longer loaded.

Assets: bedroom-wide.webp (202354 bytes), bedroom-tall.webp (173500 bytes). Generated with the built-in image tool from approved mockups; prompts removed all baked interface elements and preserved room composition, one monitor, character and lighting. WebP encoding quality 86. Only the matching orientation image is loaded initially.

Validation: syntax/structure checks and nine economy tests passed. Browser checked 390x844 and 844x390: both art assets loaded, zero horizontal overflow. Clicking a job earned $5 and one research point; upgrades dialog opened and closed. Physical Safari testing remains outstanding. No changes to the public main branch or Pages settings.

## Prior baseline checkpoint

# Development checkpoint — October 28, 2026

## Completed baseline repair

The original `render()` contained a malformed cash assignment, stopping all JavaScript. Two additional copies of script text followed the document's closing tag. The repaired page contains one document and imports readable modules.

The previous artwork is retained. Its room is translated/scaled to fit the canvas so the top wall is no longer clipped. Animation is limited to roughly 30 updates per second, stopped in hidden tabs, and respects reduced-motion preferences. Canvas resolution follows its display size with a 1.75 pixel-density cap. These are performance controls, not a claim of measured performance on physical phones.

The interface now has fallback button labels, an explicit drawing failure message, wrapping headers, two-column narrow-screen statistics, and touch targets at least 44 pixels tall. There is no blanket horizontal-overflow hiding rule.

Savings are independent of production. A failed storage write displays a warning while leaving the game playable. Active progress is checkpointed every five seconds and after actions, hiding, and page exit. An abrupt browser/OS kill can lose the last few seconds since the checkpoint.

## Validation

- JavaScript syntax, document structure, unique IDs, default labels and UI element references passed.
- Nine tests passed: save-key separation, jobs/GPU purchase, agent income, research unlock limits, offline cap/no double payment, reload accounting, corrupt save recovery, clock rollover, and backward-clock protection.
- Browser interaction: five jobs earned $25; buying GPU level 2 spent $25 and increased jobs to $10. Ten more jobs funded an agent; research unlocked Text Assistant. Reload preserved GPU level 2, one agent, Text Assistant and $4/s income.
- Browser viewport frames: 320, 375, 390, 430 and 844 pixels. All showed no horizontal document overflow, no empty button labels, no targets below 44 pixels tall and no renderer failure notice. Desktop Chromium's scrollbars reduced inner content widths by 15 pixels.
- Physical iPhone Safari, battery usage, low-end hardware performance, and real orientation-change behavior remain untested.
- The only observed browser console error was from the browser extension, not the game.

## Existing limitations

- Artwork is still the original flat 2D prototype, far from the approved concept.
- Experience/level display is a placeholder. Navigation beyond Room reports planned features.
- Jobs remain instant clicks. Timed training, stores, character navigation and changing room lighting are not implemented in this repair.
- Separate browser tabs do not coordinate simultaneous gameplay; use one active preview tab.
- Preview settings and storage key must be intentionally reviewed before any eventual production release. Do not simply merge and publish this branch.

## Next review gate

Prepare portrait and landscape visual mockups matching the approved image: warm bedside lighting, cool city lighting, worn plaster, timber floor, bed on the left, single-monitor workstation on the right, one nightstand, modest clutter, and dark translucent interface panels. Show mockups for approval before replacing the renderer or rearranging major controls.

After approval, build a detailed 3D bedroom with a fixed isometric camera. Establish acceptable mobile appearance and performance before expanding gameplay. Publishing to the existing public game requires separate explicit approval.

## Release isolation

This branch's GitHub workflow only runs checks; it has no deployment job or write permissions. No GitHub Pages settings were changed. The connected GitHub tool did not expose the Pages configuration endpoint, and an unauthenticated read could not retrieve it. The source had only `main` before the new development branch was created, and no committed deployment workflow. Keep public release configuration untouched.
