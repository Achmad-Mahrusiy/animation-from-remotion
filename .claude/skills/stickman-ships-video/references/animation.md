# Stage 3: animation and review frames

## Build

Copy the structure of `src/starter/` (newest) or `src/superpowers/` (original):

- `lines.ts`: `VOICE = { file, seconds, lines: { key: [start, length] } }`, one key per spoken phrase. Before the take exists, estimate at about 2.5 words a second with short pauses and write "ESTIMATES" in the header comment.
- Timeline file: `cue(line, share)` gives the frame of a point inside a phrase; `T` holds every cue; `END = at(VOICE.seconds + 0.1 to 0.7)` (short tail when the video loops).
- `CUTS` (frame each scene starts, usually 2 frames before its phrase), `sceneAt`, `PLACE` (per scene: `tx` shift from x=190, `flip`, `wall` colour that is also the head fill), `POSES` built with `stand({...})` overrides and blended by `blendPoses` on the loose spring `{ damping: 9, stiffness: 120, mass: 0.8 }`, elbows and head trailing by 1.5 frames and hands by 3.5, breathing and a slow sway.
- `hop(frame, start, len, height)` for squash and stretch; `cameraTransform(frame, PUNCHES, SHAKES, END)` with `PUNCHES` at every cut and about three `SHAKES`.
- Sets in their own file, drawn in SVG on 1080x1920; the floor line is y=1650; anything under y 1700 may be covered by a HUD or bar.
- Captions: `<Caption plain from to lines={[{ text, at, size, color?, boxes? }]} />`, capitals except commands and skill names in their real case. A skill header is `` `${n} ${name}` `` with the number boxed in amber; long names need a smaller size (over 15 characters: about 72).

**The stickman** (`src/Stickman.tsx`): cream `#f6efe2`, stroke 20, head radius 72, `bendy`, `eyes={blink(frame)}`, `headFill` equal to the colour behind the head. Standing joints: head y 1040, shoulder 1130, hip 1370, knee 1510, foot 1650. Props in a hand follow `pose.hR`.

**Style:** new for every video (list the past ones in HANDOVER first). The style changes the drawing: sets, colours, lettering, props, story device. It never changes the animation pattern above.

Run `npx tsc --noEmit` before rendering anything.

## Review frames

Composition `<Name>Frames` (1620x2020) renders six frozen frames per sheet with `<Freeze>`. It must be a `Composition` as long as the video, not a `Still`, or every frozen frame clamps to 0. `SHOTS` lists about 20 labelled frames: one per cut and one per change inside a scene, 15 to 20 frames after the cue so springs and captions have settled.

```bash
npx remotion still <Name>Frames out/frame-video/<name>-frames/sheet-1.png --props='{"from":0}' --image-format=png --log=error
```

(`from` 0, 6, 12, 18.) Look at every sheet yourself before sending. Check:

- **Blink frames:** a shot on a blink shows closed eyes. With `blink = (frame + 17) % 87 < 7`, move the shot a few frames.
- **Head over background objects:** the head is filled with `wall`, so a house, tree, sun or mountain behind it shows a sky-coloured disc. Move the object or the stickman.
- **Text:** nothing clipped or overflowing a box; captions end above the set (about y 640); no two captions overlapping at a scene change (each caption's `to` must be the next scene's cut).
- **Edges:** hands, pouch and props inside the frame; a stamp or ring at rest scale fits its board.
- **A shot that landed in the next scene** means the timing of that scene is too tight; fix the timing, not only the shot.
- **Legibility on a phone:** small props (a helper robot, a bug) at least about 80 px.

Send the four sheets with SendUserFile and wait for the owner's notes. Fix, re-render only the affected sheets, look again.

## Traps from past videos

- A move that must finish before a cut (a jump onto a plank) can run past the cut once the real voice arrives. Guard it in code: start it no later than about 30 frames before the next scene, and write the trap in HANDOVER.
- A trip that has to fit inside a phrase (a helper flying away and back) shrinks when the take is faster than the estimate; keep its out and back legs short (12 to 14 frames).
- Interpolate ranges must be increasing; a cue that moves past the next one throws.
