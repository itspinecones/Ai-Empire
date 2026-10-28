# Room life direction

The bedroom is a living space that continues its own routine while the player builds an AI business. Pressing Start AI Job must not trigger, stop or reset character activity. Jobs represent computer work and retain their existing saved timer and reward rules.

## Current checkpoint

The character is smaller and now chooses a random different activity at each game-hour boundary: typing, petting the cat or looking out the window. Walking only connects destinations, and a new hour can interrupt travel. The existing clock remains one game hour per real minute; there is no separate activity timer. Sleeping remains deferred.

The character now uses a reference-guided transparent artwork atlas: detailed tousled brown hair, charcoal hoodie, dark pants and white sneakers. The same artwork supplies front/back standing, seated and crouched poses. Walking animates the two leg regions of the standing artwork so the face, hair and outfit remain consistent. This is 2D animation with a voxel appearance, not rigged 3D geometry. The chair and cat remain separate stationary artwork.

A shared 256×320 canvas, fixed pixel-to-room scale and common foot anchor prevent a walking-specific size jump. Standing height is approximately 82 pixels at the tested 390-pixel portrait viewport. The requested 25% increase from the smaller concept remains the scale target. Pose transitions switch immediately; leg deformation, hand motion, furniture contact, collision and depth still need refinement.

## Remaining implementation sequence

1. Refine directional walk and seated-to-standing/crouching transitions. Preserve the separate chair and character for future clothing customization. Sleeping poses remain deferred. Keep the same character proportions, clothing, camera, bedroom and single monitor. Keep the cat in its own layer. Make a bed/blanket overlay so sleeping fits naturally into the bed.
2. Expand the current authored routes into reusable room navigation as furniture changes. Define positions on the room floor independently of screen pixels. Map them into portrait and landscape views. Define furniture footprints and clear routes so the character avoids the bed, desk and nightstand. Establish which furniture draws in front of the character when it walks behind it. Preview a short walk-to-cat-to-desk loop first, including sitting and standing transitions.
3. Expand the routine controller with available activity definitions: required object/unlock, destination, duration and animation. Choose among eligible activities with varied pauses and avoid immediate repetition. New upgrades add eligible behaviors rather than requiring changes to the business timer.
4. Connect sleep to the existing in-game clock once bedtime and wake time are chosen. Night routine goes to the bed and sleeps; daytime resumes ordinary activities. Background work remains independent. Define how to resume after a long absence without replaying missed walking animations. Do not assume a schedule or add real-world bedtime automation.
5. Add room-object interaction after the passive routine works. Tapping the computer opens its actions; a purchased GPU can be owned in inventory before it is installed. Tapping an owned wardrobe opens clothing choices. Store purchase, ownership, installed equipment and appearance need distinct state so repeated taps cannot charge or install twice. Provide labeled touch controls and accessible alternatives to small objects.

## Behavior priorities to review

An intentional furniture interaction temporarily takes priority over an ordinary idle activity and then returns to the routine. Sleep will have a defined policy once its schedule is chosen; whether a player interaction can wake the character is still undecided. Cosmetic animation does not award cash or research. Future explicit installations may change business stats only when the corresponding gameplay action succeeds.

## Artwork and performance

The renderer combines a layered 2D bedroom illustration with detailed transparent character artwork (385 KB WebP). The long-term 3D goal remains open: evaluate a rigged model (one character with movable joints) in a separate visual preview before replacing the illustrated room. Compare consistency and phone performance before committing to that renderer.

Use one active character pose, reuse common room assets, pause motion offscreen, respect reduced motion and avoid rebuilding furniture or recalculating paths every frame. Validate both phone orientations and a physical iPhone before claiming device performance.
