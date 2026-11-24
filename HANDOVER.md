# Handover: Stickman Ships

Last updated 2026-11-17.

A Remotion project that makes vertical stickman explainer videos for a new social account. The owner is running a one-month test: one video every 2 days on YouTube Shorts, TikTok and Reels, then comparing results.

## Current state

| Item | State |
|---|---|
| Video 1, "How to use the antislop skill" | Rendered: `out/antislop-tutorial.mp4` (1080x1920, 30 fps, 30.0 s). Not uploaded yet. |
| Ponytail explainer | Rendered: `out/ponytail-explainer.mp4` (1080x1920, 30 fps, 50.0 s). Code in `src/ponytail/`, composition `PonytailExplainer`, voice `public/voice-ponytail.mp3` sped up about 8%. Not uploaded yet. |
| Caveman tutorial | Rendered: `out/caveman-tutorial.mp4` (1080x1920, 30 fps, 44.5 s). Code in `src/caveman/`, composition `CavemanTutorial`, voice `public/voice-caveman.mp3` at normal speed. Scene timing was matched to the script by pauses and syllable counts, not by ear. Not uploaded yet. |
| Motion design tutorial | Rendered: `out/motion-design-tutorial.mp4` (1080x1920, 30 fps, 51.5 s). Code in `src/motion/`, composition `MotionDesignTutorial`. The owner's voice take was 60.2 s, over the 60 s limit, so `public/voice-motion.mp3` is that take (kept in `voice-raw/voice-motion.mp3`) with pauses cut to 0.4 s and sped up 6%, 49.95 s. That take is about 6.5 dB louder than the other videos' voices, so it plays at volume 0.47. The hook shows the AI's broken animation of a launch card in a made-up motion editor on a laptop; the stickman then fixes it with the skill, and the video cuts between a wide shot and his point of view. Scene timing comes from measured pauses; words inside a sentence are estimated. Voice measured about 12 dB above the music. Not uploaded yet. |
| Superpowers trailer | Rendered: `out/superpowers-tutorial.mp4` (1080x1920, 30 fps, 37.0 s). Code in `src/superpowers/`, composition `SuperpowersTutorial`, voice `public/voice-superpowers.mp3` at normal speed (36.1 s, the owner's `sound-5.mp3`). A movie-trailer parody with cinema bars. Ten scenes, each with its own set and stickman position, because the owner asked for variety after the caveman video got the most views: room (hook), point of view at the keyboard (the command), rooftop (powers), headquarters with the AI as a caped monitor (asking), blueprint room in a wide shot (plan), test lab where he kicks the untested code out, headquarters again (review), rooftop (credit), flying over the city (title), and back to the room with the command on the monitor, so the video loops. Phrase starts are measured from the pauses. The owner watched the render on 2026-11-12 and confirmed the sync. Not uploaded yet. |
| Token leaks comic | Rendered with the owner's ElevenLabs voice, 53.4 s: `out/token-leaks.mp4`. Comic drawing, but animated like the superpowers video (see "Token leaks comic" below). The owner approved the animation and the steadier frame on 2026-11-13; captions are in "Token leaks comic" below. Code in `src/leaks/`, composition `TokenLeaks` (1080x1920, 30 fps). |
| UI UX Pro Max tutorial | Rendered with music and sound: `out/uiux-pro-max-tutorial.mp4` (1080x1920, 30 fps, 56.5 s). A TV-ad parody that turns into an honest test. Code in `src/uiux/`, composition `UiuxProMaxTutorial`. The owner has not confirmed the sync by ear yet, and has not run the skill. Details in "UI UX Pro Max video" below. |
| Compact video, "Strike while the cache is hot" | Rendered with the owner's ElevenLabs voice, sound and music: `out/compact-tutorial.mp4` (1080x1920, 30 fps, 31.9 s). Review frames in `out/frame-video/compact-frames/`. A draft: the owner has not approved it, and nobody has confirmed the sync or the sound balance by ear. Code in `src/compact/`. Details in "Compact video" below. |
| grill-me tutorial | Rendered with the owner's ElevenLabs voice (Lucan Rook): `out/grill-me-tutorial.mp4` (1080x1920, 30 fps, 42.8 s). Code in `src/grill/`, compositions `GrillMeTutorial` and `GrillFrames` (review sheets in `out/frame-video/grill-frames/`). Every scene is in the programmer's room, as the owner chose on 2026-11-18. Timing in `src/grill/lines.ts`: 29 measured stretches matched to 29 phrases by count and length; cues inside a stretch are estimates. Voice measures within 0.4 dB of the compact voice, so it plays at 1.2; music sits about 15 dB under it. Music borrows `sfx/bgm.wav`. Nobody has confirmed sync by ear. Skill facts from github.com/mattpocock/skills, read 2026-11-18: `/grill-me` is user-invoked and hands off to the `grilling` skill, so the video installs the whole plugin, `/plugin install mattpocock-skills@claude-plugins-official`. Not run yet; check that `/grill-me` is the name it shows after install. |
| Starter pack, "Level one" | Rendered with the owner's ElevenLabs voice (Lucan Rook), sound and music: `out/starter-pack.mp4` (1080x1920, 30 fps, 31.0 s). Code in `src/starter/`, compositions `StarterPack` and `StarterFrames` (review sheets in `out/frame-video/starter-frames/`). Five skills new to the channel, hook A, loops from "because..." back into the hook. Nobody has confirmed the sync by ear, and none of the five skills or install lines has been run. Details in "Starter pack video" below. |
| Five skills, penthouse tour | Rendered with the owner's ElevenLabs voice (Lucan Rook), sound and music: `out/penthouse-skills.mp4` (1080x1920, 30 fps, 34.65 s). Code in `src/penthouse/`, compositions `PenthouseSkills` and `PenthouseFrames` (sheets in `out/frame-video/penthouse-frames/`, approved by the owner 2026-11-21). Skill facts and sources in `flow/five-skills-luxury-room.md`. Nobody has confirmed sync or balance by ear; no skill or install line has been run. Captions not written yet. |
| ECC video | Rendered with the owner's ElevenLabs voice (Lucan Rook), sound and music: `out/ecc-kitchen.mp4` (1080x1920, 30 fps, 31.08 s). The owner approved the frames and the sound on 2026-11-23. Captions written the same day ("ECC captions" below). Code in `src/ecc/`, compositions `EccKitchen` and `EccFrames`. ECC has not been installed or run. Not uploaded yet. |
| Profile picture | Rendered: `out/profile-picture.png` (1080x1080) |
| Captions and bios | Written, in the sections below |
| Git | One scaffold commit only. All work is uncommitted. |
| Videos 2 to 15 | Not started |

Checked on video 1: resolution, duration, pause positions after the speed change, no clipped audio, and speech about 12 dB above the music. Nobody has listened to it from this side, so sound balance and sync are unconfirmed by ear.

## Open items for the owner

1. **Command case.** The video shows `NPX ANTISLOP-AI` because the brief asked for all capitals. The real command is lowercase, `npx antislop-ai`, and typing capitals can fail on Mac or Linux. The owner has not decided whether to change it. It should be settled before upload. The captions already say lowercase.
2. **ElevenLabs plan.** Unknown. The free plan is non-commercial and requires "elevenlabs.io" in the title. Paid plans allow commercial use, except output from beta services, so check the model's status.
3. **Username.** `@stickmanships` has not been checked on any platform. Fallbacks: `@stickmanshipsit`, `@stickmanships.dev`.
4. **Instagram rules.** AI-label and originality rules were not confirmed. YouTube and TikTok were checked on 2026-11-09.
5. **Word timing.** Scene timing comes from measured pauses. Timing of individual words inside a sentence is estimated.
6. **Caveman video.** Nobody has confirmed its sync by ear on the final voice, and the install command has not been run. Try `npx skills add JuliusBrussee/caveman -g` once before uploading. Its music level was measured at about 11 dB under the voice, and that reading includes the tail of a sound effect.
7. **Schedule.** The ponytail, caveman and motion design videos are not in the 15-video schedule and have no upload date.
8. **Motion design video.** The owner watched the final render on 2026-11-10 and confirmed the sync and the new hook. Still open: the install command `npx skills add LottieFiles/motion-design-skill` was built from `skills-lock.json` and has not been run in that form; try it once before uploading. The owner should also try the skill on one real animation first, so the video rests on something actually tested.
9. **AoT shorts and the niche.** The account's niche is AI coding skills tested by a stickman, in English. The five AoT shorts are Indonesian anime comedy and do not fit it. Suggested: a separate account. Not decided.

## Commands

```bash
npm run dev
```

```bash
npx remotion render AntislopTutorial out/antislop-tutorial.mp4
```

```bash
npx remotion render PonytailExplainer out/ponytail-explainer.mp4
```

```bash
npx remotion render CavemanTutorial out/caveman-tutorial.mp4
```

```bash
npx remotion render MotionDesignTutorial out/motion-design-tutorial.mp4
```

```bash
npx remotion still ProfilePicture out/profile-picture.png --image-format=png
```

```bash
node scripts/make-sfx.mjs
```

```bash
npx tsc --noEmit
```

## Files

| Path | What it holds |
|---|---|
| `src/theme.ts` | Font, colors, voice speed, and the `T` table of beat timings |
| `src/Composition.tsx` | Captions, pose timeline, towers, report sheet, soundtrack, camera, and the composition itself |
| `src/Stickman.tsx` | Poses, pose blending, drawing the character |
| `src/Room.tsx` | The programmer's room background |
| `src/Screens.tsx` | Monitor content for each scene |
| `src/ProfilePicture.tsx` | Avatar still |
| `scripts/make-sfx.mjs` | Synthesizes all sound effects and music into `public/sfx` |
| `scripts/trim-voice.mjs` | Shortens long pauses in a voice file and can speed it up. Checks its own output length |
| `voice-raw/` | Voice takes as the owner sent them, before trimming. Only the motion design video has one |
| `src/ponytail/` | Ponytail video: basement set and timeline |
| `src/caveman/` | Caveman video: cave set (`Cave.tsx`) and timeline (`CavemanVideo.tsx`) |
| `src/motion/` | Motion design video: studio set with desk and laptop (`Stage.tsx`), and the timeline, the laptop's editor screen and the POV shot (`MotionVideo.tsx`) |
| `src/superpowers/` | Superpowers video: rooftop set (`Rooftop.tsx`), the other sets (`Sets.tsx`: headquarters, blueprint room, sky, lab), and the timeline (`SuperpowersVideo.tsx`). There, `CUTS` lists when each scene starts and `PLACE` says where the stickman stands in it, mirrored or scaled. `Frame` draws the agent's screen once and each scene places it |
| `src/leaks/` | Token leaks comic: the comic kit (`Comic.tsx`: `Words` captions, `Box`, `Bubble`, `Sfx` lettering, the inked `Hero` and the `Bot`), the eleven scenes with their timeline (`LeaksVideo.tsx`), and the measured voice line starts (`lines.ts`) |
| `src/uiux/` | UI UX Pro Max video: the sets (`Sets.tsx`: ad studio, product stage, the dark "honest" room, design studio, cork wall, slate wall, inspection bay, theater and curtains) and the timeline, screens and review sheets (`UiuxVideo.tsx`) |
| `src/compact/` | Compact video: the forge, the anvil's iron bar and the night yard (`Forge.tsx`), the nine scenes with their timeline and the review sheets (`CompactVideo.tsx`), and the estimated voice line starts (`lines.ts`) |
| `src/aot/` | AoT shorts, registered in `src/Root.tsx` and using `make-sfx.mjs`. Not covered by this document |
| `public/voice.mp3`, `public/voice-ponytail.mp3`, `public/voice-caveman.mp3`, `public/voice-motion.mp3` | ElevenLabs voice for each video |

## Making the next video

Give each new video its own folder like `src/ponytail/`, with its own timing table and voice file, and register it in `src/Root.tsx`. `Caption`, `Sfx`, `enter`, `cameraTransform`, `Panel` and `Stickman` are shared, so do not change how they behave.

**Every new stickman video must differ from the ones before it, in style and in scenes.** The owner set this rule on 2026-11-12 so that viewers stay to the end and do not feel they have seen the video before.

- Style: give each video its own idea for how it is told. The caveman video is a caveman who grunts, and the Superpowers video is a movie-trailer parody. Do not reuse an earlier video's idea.
- Scenes: build new sets, and change the set and the stickman's position from scene to scene inside the video, as `CUTS` and `PLACE` do in `src/superpowers/SuperpowersVideo.tsx`. Do not copy an earlier video's sets or its order of scenes.
- Sound effects are the exception. Reusing the same sounds from `public/sfx` across videos is fine.
- The stickman's look stays as "Stickman style" below describes it, so the channel is still recognizable. That last point is the writer's reading of the rule, not the owner's words; ask if a video needs a different-looking character.

1. Write the script in English with ElevenLabs v3 tags, about 75 words for 30 seconds and never more than about 85: the finished video must not pass 35 seconds. The compact script is 79 words and its take ran 31.2 s. The owner generates the voice (Roger, Stability Creative or Natural) and sends the MP3.
2. Copy it to `public/voice-<name>.mp3` and measure it:
   ```bash
   npx remotion ffprobe -hide_banner -show_entries format=duration -of csv=p=0 public/voice-<name>.mp3
   ```
   ```bash
   npx remotion ffmpeg -hide_banner -nostats -i public/voice-<name>.mp3 -af silencedetect=noise=-35dB:d=0.12 -f null -
   ```
   If the take runs past about 34 seconds, the video would pass the 35-second limit: keep it in `voice-raw/` and shorten it, then measure the result. If trimming pauses and a small speed-up are not enough, cut the script and ask the owner for a new take. The arguments are input, output, longest pause in seconds, and speed:
   ```bash
   node scripts/trim-voice.mjs voice-raw/voice-<name>.mp3 public/voice-<name>.mp3 0.4 1.06
   ```
3. Match the speech chunks between pauses to the script's phrases, then give the video's own timing table `T` the voice second of each beat. `src/caveman/CavemanVideo.tsx` is the simplest model, because its voice plays at normal speed. If the voice must be sped up, `src/ponytail/PonytailVideo.tsx` shows `VOICE_RATE` and `at()`.
4. Add a music bed with `makeBed` at the end of `scripts/make-sfx.mjs`, slightly longer than the video. New sounds must go at the end, because the noise generator is seeded and order changes every later sound.
5. Build the captions, poses, scene panels and `Soundtrack` cues.
6. Frame by frame first: before any full render, render review sheets of frozen frames into `out/frame-video/<video>-frames/`, look at them yourself, and send them to the owner. Cover every scene, with one frame per cut and one per change inside a scene, taken 15 to 20 frames after the cue so springs and caption words have settled. Captions must end above the set, around y=640. `Frames` and `SHOTS` at the end of `src/uiux/UiuxVideo.tsx` are the model: six frames per image, each labelled with its scene and second. It must be a `Composition` as long as the video, not a `Still`, or every frozen frame is clamped to 0.
7. Wait for the owner's revisions on those frames. Only then render the video, check the specs and audio levels, and ask the owner to confirm sync by ear. Music and sound effects can go in after the frames are approved.

When the owner replaces a voice file, repeat steps 2 and 3, update the bed length if the duration changed, and render again.

## Stickman style

Everything is in `src/Stickman.tsx`. Use the `Stickman` component for every character, so all videos keep the same look.

**Look**

| Part | Value |
|---|---|
| Limbs and body | Cream `#f6efe2`, stroke 20, round caps and joins, no fill |
| Head | Circle, radius 72, cream stroke 20. Drawn after the body, so it covers the top of the lines |
| Head fill | Must match the scene's wall: `WALL` `#20323a` in the room, `BASEMENT_WALL` `#2b2421` in the basement. Pass it as `headFill` |
| Eyes | Two cream dots, radius 10, 22 px either side of the face center, 12 px above it |
| Mouth | One curved line, stroke 10 |

**Proportions on the 1080x1920 canvas (standing)**

| Joint | y |
|---|---|
| Head center | 1040 |
| Shoulder | 1130 |
| Hip | 1370 |
| Knee | 1510 |
| Foot, which is the floor line | 1650 |

Feet sit about 40 px either side of the hip. Keep these numbers for new poses so the character stays the same size. Captions stay above the character.

**Pose values**

- A `Pose` holds the positions of head, shoulder `sh`, hip, elbows `eL` `eR`, hands `hL` `hR`, knees `kL` `kR`, feet `fL` `fR`, plus `look` and `smile`.
- `look`: -1 faces left, 0 faces the viewer, 1 faces right. It moves the face 24 px.
- `smile`: -1 worried, 0 flat, 1 happy, 1.5 to 1.6 big grin.
- Ready-made poses: `SIT`, `SIT_WAVE`, `SIT_SCRATCH`, `SIT_HAPPY`, `STAND_BUILD`, `INSPECT`, `REPORT`, `THUMB`. Build new ones by spreading an existing pose and changing only what moves, like `{ ...SIT, smile: 1 }`. Put video-specific poses in that video's file, as `src/ponytail/PonytailVideo.tsx` does.

**Motion**

- Change pose with `blendPoses(frame, keys)`, a list of `{ at, pose }`. Each move uses one spring: damping 13, stiffness 110, mass 0.7.
- Add breathing to every character: `Math.sin(frame / 14) * 3` on the head, and 0.6 of that on the shoulder.
- Springs overshoot. Anything that switches on `look` needs a margin, which is why the hair side tests `look > -0.5` and not 0.

**Variations**

- `thumb` (0 to 1): fades in a thumbs-up on the left hand, drawn as a fist with an offset thumb. A plain line reads as a raised finger.
- `ponytail`: adds gray hair `#b9b1a3`, a red tie `#c9583f` and round glasses. This is the character for the ponytail video only.
- `eyes` (1 to 0): 1 is the default and draws the eyes as before. Below 1 the lids droop, and under 0.2 the eyes are closed curves. Added for the compact video's blink and sleep; no earlier video passes it.
- `bendy`: draws arms, legs and spine as curves, for a rubbery character. The caveman video pairs it with a loose spring (damping 9), hands that trail the body by 3.5 frames, a slow body sway, and `hop` for squash and stretch. Copy `animatePose` and `hop` from `src/caveman/CavemanVideo.tsx`.
- `blendPoses` takes an optional spring as its third argument, which is how the loose spring is passed.
- Second character: draw another `Stickman` with its own pose and no accessories, like `Whisperer` in `src/ponytail/PonytailVideo.tsx`.
- Props held in a hand follow the pose's hand position, like `<Magnifier hand={pose.hR} />`.

**Wide shot and point of view (motion design video)**

All of this is in `src/motion/MotionVideo.tsx`.

- `Screen` draws what the laptop shows, once, in its own coordinates (x 190 to 1050, y 690 to 1360). The wide shot places it on the desk with `SCREEN_ON_DESK` from `Stage.tsx`, and `PointOfView` draws it again full size with the keyboard and the stickman's two arms. Both shots therefore always show the same thing.
- `POV` lists the frame ranges where the camera is the stickman's eyes. Everything outside those ranges is the wide shot. The POV grows out of the laptop over 12 frames and shrinks back over 9.
- `TYPING` lists when the hands type and how fast, and `TAPS` lists single presses of the right hand. Both the seated stickman and the POV arms read them.
- `ELEMENTS` and `ART` are the nine layers of the design. `layer(i, frame)` returns where each one is: broken in the hook, the three motion layers in rule 2, and the looped entrance in rule 3. `broken(i, frame)` gives every layer its own bug (the title flies off, the button spins without end, the hills hang upside down), and `flash(frame)` brings that broken state back for a moment on "the rule my AI broke". `moving(i, frame)` drives the layer list, the timeline bars and the status dots, so the panels never disagree with the artboard.
- The seated poses build on `SIT`, whose hands rest where the laptop's keyboard edge is.

## Things that will trip you up

- Remotion's bundled ffmpeg is a cut-down build. `xstack`, `volumedetect` and the raw `s16le` output are missing. `silencedetect` works, decoding to WAV with `-c:a pcm_s16le` works, and `atrim`, `concat` and `atempo` work, which is what `trim-voice.mjs` uses.
- `playbackRate` on `Audio` keeps the pitch when rendering, so it cannot make pitch variants. That is why `thud0` to `thud3` and `key0` to `key3` are separate files.
- `out/` is git-ignored, so rendered videos are not in history. Back them up.
- The project lives in OneDrive, which syncs `node_modules` and can slow or lock files during renders. Moving it outside OneDrive was suggested and has not been done.
- Nothing here can hear audio. Windows' built-in speech recognizer was tried on the caveman voice and returned garbage, and installing Whisper was blocked earlier. Sync has to be confirmed by the owner.
- The npm name `antislop` is a different package. The right one is `antislop-ai`. Official source: github.com/miqdadbadjuber/anti-slop.

## Decisions already made

- **All review frames live in `out/frame-video/`, one folder per video:** `out/frame-video/<video>-frames/`. The owner made that folder on 2026-11-17 and asked for the frames to be kept together there. Render every sheet and still straight into it, never into `out/` itself.
- **Every new video is at most 35 seconds long.** The owner set this on 2026-11-17, after the compact video (31.9 s). It is a ceiling for the finished video, not a target: voice, pauses and the tail after the last word all count. Earlier videos ran 37 to 56.5 s and stay as they are.
- Vertical 1080x1920, 30 fps, 30 seconds. Voice 1 was 31.56 s, so it is sped up about 5%.
- All on-screen text in capitals, font Noto Sans KR, words enter with fade and slide using spring.
- English voice and captions for the whole month, so results stay comparable.
- All music and sound effects are synthesized by the script, so there is nothing to license.
- The purple "UNLOCK THE POWER" cards are a deliberate example of generic AI design.
- The owner usually writes in Indonesian and sometimes English. Reply in the language of their latest message.
- From the caveman video on, the owner wants a bendy stickman (`bendy`) and standard text animation: pass `plain` to `Caption` for a fade and short slide only. Older videos keep the bouncy style. The word-by-word bounce was rejected as overdone.
- Every new stickman video gets its own style and its own scenes, so viewers stay. Sound effects may repeat between videos. The details are in "Making the next video".
- Sound effects stay few and varied. The caveman video has 30 cues of 13 kinds, against about 57 in the ponytail video, and no sound repeats on every scene change. Camera shake is reserved for two moments.
- Commands that viewers will copy are shown in their real case, as in the caveman video. Other text stays in capitals.
- Frame by frame before the video: the owner asked on 2026-11-16 that every new video is first sent as review frames, so the result can be seen and revised before a full render. The steps are in "Making the next video".
- Captions: creative, short, and every piece of information in them must match the video. The owner set this on 2026-11-16: first "as creative as possible, with information that matches the video", then, on seeing a long version, "keep it short". So: a hook line or two, the install lines, the catch if the video has one, and the credit. Write each caption in the video's own style (a trailer voice for the trailer, an ad voice for the ad), and take the facts only from what the video says or shows: no extra numbers, features or claims. Jokes are fine where nobody could read them as a fact. Still include the install lines in their real case and credit the skill's author.
- The motion design video's first hook ("everything in my video is moving", with bouncing boxes) was rejected by the owner. The hook is now the AI's own broken animation: "My AI just broke my animation." All its captions are `plain`.
- In that video the red LINEAR button in rule 1 moves at constant speed on purpose, as the bad example, and so do the spinning button and the jumping playhead in the broken hook.
- The motion design video has 30 sound cues and one camera shake, when the title flies off the artboard.
- For the motion design video the owner asked for three things, which are worth keeping for later tool videos: the stickman must be seen using the tool on a laptop, his point of view must be shown, and the screen must look like real professional work (a real design with named layers, a timeline and a graph editor), not abstract boxes.
- Nothing on the laptop screen copies a real app. The editor, its icons and the "LAUNCH" card are original drawings, and there are no logos. LottieFiles appears only as a text credit.
- The motion in that video was checked against the motion-design skill itself: Playful personality, entrances on one spring with about 13% overshoot, exits that accelerate and are shorter than entrances, no move longer than a third of the screen, and no state change by opacity alone.

## Account

**Name:** Stickman Ships

**TikTok bio:**

```text
A stickman tests AI coding tools so you don't have to. New video every 2 days.
```

**Instagram bio:**

```text
A stickman tests AI coding tools so you don't have to.
New 30-second video every 2 days.
Honest results, including the failures.
```

**YouTube channel description:**

```text
A stickman tests AI coding tools so you don't have to.

Every 2 days: one 30-second animated short on an AI coding tool, a mistake AI keeps making, or a habit that saves you time. Each one comes from something actually tried, including what failed.

Animation, music and sound effects are original. Voice is AI-generated.
```

## Video 1 captions

**YouTube title:** `How to use the antislop skill in 30 seconds #Shorts`

**YouTube description:**

```text
Stop your AI coding agent from shipping generic UI, copy and code comments.

1. Open a terminal in your project folder
2. Run: npx antislop-ai
3. Pick your skills, install location and AI agent
4. Start a new session
5. Choose During while you build, or After to audit existing work

Type the command in lowercase. The npm package named "antislop" is a different project.

antislop by miqdadbadjuber (MIT license)
https://github.com/miqdadbadjuber/anti-slop
https://antislop.ai.id

Not affiliated with or sponsored by the antislop project.
Animation, music and sound effects are original. AI voice: ElevenLabs.

#antislop #aicoding #claudecode
```

**TikTok:**

```text
Your AI keeps building the same generic page. This skill filters that out.
Run: npx antislop-ai (lowercase)
By miqdadbadjuber, link: github.com/miqdadbadjuber/anti-slop
Not sponsored. AI voice, original animation and music.
#antislop #aicoding #programmer #claudecode
```

**Reels:**

```text
How to stop AI from shipping generic work, in 30 seconds.

Run: npx antislop-ai (lowercase)
Then pick your skills, location and agent, and start a new session.

Tool by miqdadbadjuber: github.com/miqdadbadjuber/anti-slop
Not sponsored. AI voice, original animation and music.

#antislop #aicoding #programmerlife #claudecode
```

## Ponytail captions

**YouTube title:** `Your AI writes too much code. This skill fixes it. #Shorts`

**YouTube description and Reels:**

```text
Ponytail makes your AI coding agent reuse what you already have and write only the code you need.

Skill by Dietrich Gebert: github.com/DietrichGebert/ponytail

#ponytail #aicoding #claudecode
```

**TikTok:**

```text
Ponytail makes your AI coding agent reuse what you already have and write only the code you need.

Skill by Dietrich Gebert: github.com/DietrichGebert/ponytail

#ponytail #aicoding #claudecode #programmer
```

## Caveman captions

**YouTube title:** `Make your AI talk like a caveman and save tokens #Shorts`

**YouTube description:**

```text
Caveman makes your AI coding agent answer in far fewer words. Your code, commands and error messages stay exact.

Install: npx skills add JuliusBrussee/caveman -g
Then type /caveman in Claude Code. Say "stop caveman" to turn it off.

Skill by Julius Brussee: github.com/JuliusBrussee/caveman

#caveman #aicoding #claudecode
```

**Reels:**

```text
Caveman makes your AI coding agent answer in far fewer words. Your code, commands and error messages stay exact.

Install: npx skills add JuliusBrussee/caveman -g
Then type /caveman

Skill by Julius Brussee: github.com/JuliusBrussee/caveman

#caveman #aicoding #claudecode
```

**TikTok:**

```text
Your AI used 63 tokens for one fix. Caveman makes it answer in far fewer words, and your code stays exact.

Install: npx skills add JuliusBrussee/caveman -g

Skill by Julius Brussee: github.com/JuliusBrussee/caveman

#caveman #aicoding #claudecode #programmer
```

The 63, 20 and 14 token figures are one example from the Caveman README. Do not claim a percentage saving: the README's own test shows "Answer concisely." at 4,334 output tokens against 4,119 for `/caveman`, and its 65% claim has no measurement behind it.

## Motion design captions

**YouTube title:** `My AI broke my animation. This skill fixes it. #Shorts`

**YouTube description:**

```text
The motion-design skill teaches your AI coding agent timing, easing and choreography, so not everything moves at once.

Install: npx skills add LottieFiles/motion-design-skill
Then start a new session and type /motion-design

Three rules from the skill:
1. Never move anything at constant speed
2. Three layers: main action, supporting detail, quiet background
3. Only a third of your elements move at once

Skill by LottieFiles (MIT license): github.com/LottieFiles/motion-design-skill

Not affiliated with or sponsored by LottieFiles.
Animation, music and sound effects are original. AI voice: ElevenLabs.

#motiondesign #aicoding #claudecode
```

**Reels:**

```text
My AI broke my animation. This skill teaches it three rules that fix it.

Install: npx skills add LottieFiles/motion-design-skill
Then type /motion-design

Skill by LottieFiles: github.com/LottieFiles/motion-design-skill

#motiondesign #aicoding #claudecode
```

**TikTok:**

```text
The title flew away and the button would not stop spinning. This skill teaches your AI when to move things, and when not to.

Install: npx skills add LottieFiles/motion-design-skill

Skill by LottieFiles: github.com/LottieFiles/motion-design-skill

#motiondesign #aicoding #claudecode #programmer
```

The repository address comes from `skills-lock.json`. Open it once before posting to confirm the link and the license line.

## Token leaks comic

Added 2026-11-12. The stickman is a plumber, and the video is a comic book: he explains three skills that stop an AI from wasting tokens, one page per skill.

**Why these three.** They came from `npx skills find` (the `find-skills` skill is installed in `.claude/skills`). Each stops a different kind of waste, and anyone can use them, not only programmers. Install counts are from skills.sh on 2026-11-12.

| Skill | What it saves | Installs | Author |
|---|---|---|---|
| `caveman` | Makes the AI's answers short | 622K | Julius Brussee |
| `caveman-compress` | Shrinks memory files like `CLAUDE.md`, read at every session start. Keeps a backup | 431K | Julius Brussee |
| `handoff` | Packs a long chat into one note for a fresh session | 1.1M | Matt Pocock |

**The only number in the video is 8.5%.** The Caveman README itself reports it: JetBrains ran 86 coding tasks and measured 8.5% fewer output tokens, with no measurable loss of quality. The JetBrains blog page refused to load from here, so nobody on this side has read it directly. Do not use the 65% or 75% figures from social posts.

**Not tried.** None of the three skills has been run from here. `/caveman-compress <file>` and `/handoff` come from their skills.sh pages and from Matt Pocock's posts.

**Script (emotion tags for Eleven v3), as the owner voiced it:**

```text
[gruff, tired plumber voice] [sighs] Your AI is leaking tokens.

[deadpan] Three leaks. Three skills.

[matter-of-fact] Here's what each one does.

[short pause]

[confident] Skill one: Caveman.

[amused] It makes your AI answer in short, blunt sentences.

[instructing] Type slash caveman.

[reassuring] Your code stays exact.

[dry, unimpressed] JetBrains measured it: eight and a half percent fewer output tokens.

[shrugging] Small leak, easy patch.

[short pause]

[confident] Skill two: Caveman compress.

[explaining] Your AI reads your memory file at the start of every session.

[satisfied] This rewrites it shorter.

[instructing] Type slash caveman compress, then the file name.

[reassuring] It keeps a backup.

[short pause]

[confident] Skill three: Handoff.

[grumbling] A long chat gets read again on every message.

[instructing] Type slash handoff.

[impressed] It packs the whole chat into one note.

[relieved] Open a new session, and carry on from there.

[short pause]

[deadpan] Three skills. One command each, in the caption.

[friendly] Follow Stickman Ships.

[warm, proud] I fix the leaks. You keep the tokens.
```

**Voice: ElevenLabs, "Lucan Rook - Energetic Male".** The owner sent the take on 2026-11-12; it is `public/voice-leaks.mp3` (52.1 s).

- **Timing.** `src/leaks/lines.ts` holds the second each of the 25 script lines starts, measured from the pauses in the take. The take has 36 stretches of speech; they were matched to the lines by length and order (both "Type slash ..." lines show the same short "Type", pause, rest). Nobody on this side has listened to it. `LeaksVideo.tsx` derives every cue and `END` from that table. Three cues fall inside a line: the 8.5% and the file name sit on measured pauses, "short, blunt" is an estimate.
- **Loudness.** The take measures 1.8 dB quieter than the superpowers voice, so it plays at volume 1.2.
- **If the voice changes:** replace the MP3, re-measure with the command at the top of `lines.ts`, and render.

```bash
npx remotion render TokenLeaks out/token-leaks.mp4
```

**The local voice that was tried first.** Before the owner sent the ElevenLabs take, the video was rendered once with github.com/msrbuilds/voice-studio (MIT, Kokoro engine, voice `am_fenrir`, the closest of Kokoro's American male voices to the earlier "Roger" by measured pitch). That path was removed from the project when the ElevenLabs take arrived; samples of the nine voices remain in `out/voice-samples/`. The tool is still installed at `C:Usersachmaoice-studio`: start it from there with `backend/venv/Scripts/python.exe -m backend.cli --engine kokoro --device auto --port 8880`, then `POST /api/synthesize` with `{text, speakers: [{name, voice}], engine, speed}` returns a WAV. It listens on every network interface, so stop it after use. It ignores emotion tags and pads each line with about 0.6 s of silence. Installing it took hours because PyPI and GitHub are very slow on this network (30 to 60 KB/s): `python studio.py setup` failed three times, and what worked was the system `uv.exe` copied into `backend/venv/Scripts`, the VibeVoice package from a sparse clone at `C:Usersachmaibevoice-src` (`backend/requirements-local.txt`), `UV_SKIP_WHEEL_FILENAME_CHECK=1`, and the spaCy model `en_core_web_sm` 3.8.0 downloaded by hand.

The first VoiceStudio (github.com/debpalash/VoiceStudio 0.5.7) was uninstalled on 2026-11-12 at the owner's request, who may install it again later. Its leftover data in `%APPDATA%VoiceStudio` was deleted too. Its skill is still in `.claude/skills/voicestudio`.

**Comic drawing, old animation.** The first version was a comic page: five pages of panels that popped in, with a small stickman standing still in each. The owner rejected that on 2026-11-12: the drawing should be comic, but the animation should work like the earlier videos, because the superpowers video brought many viewers. So the video was rebuilt on the superpowers pattern, and that is the pattern to keep:

- Full-screen scenes with hard cuts (`CUTS`), a standing spot per scene (`PLACE`, left or right, mirrored), and one stickman who acts all the way through (`POSES` blended with a loose spring, trailing elbows and hands, hops with squash and stretch).
- The shared camera (`cameraTransform`) with a small zoom punch at every cut. The frame itself stays steady: the owner asked on 2026-11-13 for less shaking, only at the good moments, so it shakes on three hits only (the 8.5%, the patch, the press) and the constant hand-drawn wobble of the whole drawing was removed.
- Captions at the top that follow the voice word by word, like the shared `Caption`, but in comic lettering (`Words` in `Comic.tsx`). During a skill, a header with the skill's number and name stays on screen and the captions sit under it.
- Eleven scenes: boiler room (hook), cave, his own view of the terminal (once per skill, in the skill's color), measurement bars, the patch, the desk, the press, the chat, the note, the handover, and the cover.

**Comic style.** All of it is in `src/leaks/Comic.tsx`.

- Every scene is one full-screen comic panel: a flat bright color, halftone dots, an inked floor line, and one inked page edge around the whole screen.
- The stickman keeps his cream lines and dark head. A filter (`#inked`) draws a black ink line around him, so he still reads on bright colors. The plumber wears a red cap. The shared `Stickman` component is unchanged.
- Lettering is Bangers with an ink outline; commands and skill names are Space Mono in their real case. Both fonts were already in `public/fonts/aot`.
- Sound words (DRIP!, ZIP!, TAP TAP!, PATCH!, SQUISH!, SNIP!, PACKED!) and speech bubbles pop in over 7 to 8 frames with a small overshoot.
- Background life: the drips keep falling, the fire flickers, the chat keeps scrolling.
- The video has 30 sound cues.

**YouTube title:** `Your AI is leaking tokens. 3 skills that patch it #Shorts`

**YouTube description:**

```text
Your AI is leaking tokens. Three leaks, three skills, one command each.

1. caveman: makes your AI answer in short, blunt sentences. Your code stays exact.
   Install: npx skills add JuliusBrussee/caveman --skill caveman
   Use: /caveman

2. caveman-compress: rewrites your memory file (like CLAUDE.md) shorter, and keeps a backup.
   Install: npx skills add JuliusBrussee/caveman --skill caveman-compress
   Use: /caveman-compress CLAUDE.md

3. handoff: packs a long chat into one note, so you can carry on in a new session.
   Install: npx skills add mattpocock/skills --skill handoff
   Use: /handoff

The 8.5% is the figure the Caveman README reports from a JetBrains test: 8.5% fewer output tokens across 86 coding tasks.

caveman and caveman-compress by Julius Brussee: github.com/JuliusBrussee/caveman
handoff by Matt Pocock: github.com/mattpocock/skills

Not affiliated with or sponsored by these projects.
Animation, music and sound effects are original. AI voice: ElevenLabs.

#aicoding #claudecode #tokens
```

**Reels:**

```text
Your AI is leaking tokens. Three skills patch it:

npx skills add JuliusBrussee/caveman --skill caveman
npx skills add JuliusBrussee/caveman --skill caveman-compress
npx skills add mattpocock/skills --skill handoff

Then type /caveman, /caveman-compress CLAUDE.md, or /handoff.

Skills by Julius Brussee and Matt Pocock.

#aicoding #claudecode #tokens
```

**TikTok:**

```text
I fix the leaks. You keep the tokens.

npx skills add JuliusBrussee/caveman --skill caveman
npx skills add JuliusBrussee/caveman --skill caveman-compress
npx skills add mattpocock/skills --skill handoff

Skills by Julius Brussee and Matt Pocock.

#aicoding #claudecode #tokens #programmer
```

The three install commands were built from the skills.sh listings (`juliusbrussee/caveman@caveman`, `juliusbrussee/caveman@caveman-compress`, `mattpocock/skills@handoff`) and the `--skill` form that installed `find-skills` here. None of the three has been run; try each once before uploading. If the ElevenLabs plan is free, add "elevenlabs.io" as "Platform rules" says.

**Sources for the topic and the format** (titles and descriptions were read, the videos were not watched): TikTok david_ai_pro (4 skills, one line each), midudev (caveman), sabrina_ramonov (3 token tips); YouTube "Claude Code Token Usage: How to Reduce It (3 Plugins)", "Three Tools, One Problem: What Actually Saves Tokens?", and the Short "Caveman Tested: 65% Promised, 8.5% Measured". Instagram and Reddit could not be searched from here.

## UI UX Pro Max video

Added 2026-11-16. Every claim comes from the README at github.com/nextlevelbuilder/ui-ux-pro-max-skill, read that day: 192 palettes, the spa example ("Serenity Spa": Hero-Centric + Social Proof, Soft UI Evolution, its five colors, Cormorant Garamond / Montserrat), its anti-patterns, its pre-delivery checklist, and the Python 3 requirement. The repository showed 149.9k stars that day. Nothing was run from here.

**Style.** A TV ad parody ("Tired of your AI building THIS?!") that switches to a plain voice on "But does it actually work? I tested it." The owner asked for an energetic hook like the earlier videos, and for the telling to fit the channel's niche, which is the honest test.

**Script (ElevenLabs v3), as written for the owner:**

```text
[hyped TV ad announcer, fast, very excited] Tired of your AI building THIS?!

[mock horror, still hyped] Purple gradient! Rocket emoji! "Unlock the power"!

[big, booming] Introducing... U-I U-X Pro Max! The design skill with one hundred fifty thousand GitHub stars!

[sudden switch, normal, skeptical] ...But does it actually work? I tested it.

[fast, instructing] In Claude Code: add the marketplace, install the plugin. Two lines, in the caption.

[normal] Same prompt as before: build a landing page for my spa.

[impressed] This time, before any code... it made a design system.

[explaining] A layout. A style. Colors from a hundred ninety-two palettes. A font pair.

[smug] Plus a list of what NOT to do. Like: no AI purple gradients.

[serious] And a checklist before it ships: contrast, keyboard focus, phone sizes.

[dramatic] The result?

[short pause] [genuinely surprised] ...Okay. That's a real website.

[honest, matter-of-fact] One catch: it needs Python on your computer.

[hyped TV ad announcer] U-I U-X Pro Max! By Next Level Builder!

[normal, friendly] Follow Stickman Ships. I test them, so you don't have to.
```

**Voice: ElevenLabs, "Alex - Upbeat, Energetic and Clear".** The owner sent two takes on 2026-11-16; both are in `voice-raw/` (`voice-uiux-a.mp3`, 52.7 s, and `voice-uiux-b.mp3`, 55.7 s). The video uses take b as `public/voice-uiux.mp3`: its 31 stretches of speech match the script's 31 phrases one for one. Take a is about 3 s shorter in two places where a sentence would be, so it probably skips two sentences; that is read from pause lengths, and nobody on this side has heard either take. The voice measures 0.6 dB under the superpowers voice and plays at full volume, with the bed at 0.13, about 12 dB under it.

**Scenes.** Twelve, on the superpowers pattern (`CUTS`, `PLACE`, `POSES`): ad studio, product stage, lights off, his view of the terminal, desk, cork board, the design system sheet, the avoid list, the checklist, the curtain, the fine print, and the ad studio again. The last ten frames flip the monitor back to the purple page so the video loops. 35 sound cues and three camera shakes ("THIS", the stamp, the reveal).

**Review sheets.** `UiuxFrames` renders six frozen frames per image, listed in `SHOTS`. It is a `Composition`, not a `Still`, because a one-frame composition clamps every frozen frame to 0.

```bash
npx remotion still UiuxFrames out/frame-video/uiux-frames/sheet-1.png --props='{"from":0}' --image-format=png
```

```bash
npx remotion render UiuxProMaxTutorial out/uiux-pro-max-tutorial.mp4
```

**Open before upload.**

- The voice says "I tested it", and the spa page in the video is drawn from the README's example, not from a run. The owner should run the skill once with "build a landing page for my spa", before and after installing, and send a screenshot so the reveal can match it.
- The two install commands (`/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`, then `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`) come from the README and have not been run.
- Sync is unconfirmed by ear. Eight cues inside a phrase are estimates; they are named in the comment above `T` in `UiuxVideo.tsx`.
- Text inside the screens is in mixed case on purpose, so it looks like real output. The owner has not ruled on that.

**YouTube title:** `Tired of your AI building THIS? I tested the fix #Shorts`

**YouTube description:**

```text
Tired of the purple gradient, the rocket emoji and "Unlock the power"? I tested UI UX Pro Max. It writes a design system before any code.

/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

*Fine print: needs Python. Parody ad, nobody paid for it.

By Next Level Builder: github.com/nextlevelbuilder/ui-ux-pro-max-skill

#uiux #aicoding #claudecode
```

**Reels:**

```text
Before: purple gradient, rocket emoji, "Unlock the power".
After: ...okay, that's a real website.

/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

*Needs Python. Skill by Next Level Builder.

#uiux #aicoding #claudecode
```

**TikTok:**

```text
POV: your AI finds out there are colors other than purple.

/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

*Needs Python. Skill by Next Level Builder. Does your AI build the purple one too?

#uiux #aicoding #claudecode #webdesign
```

Every fact in these is one the video says or shows. Two longer sets were written the same day and replaced at the owner's request. If the ElevenLabs plan is free, add "elevenlabs.io" as "Platform rules" says.

## Compact video

Added 2026-11-17. A blacksmith: hot iron is the warm prompt cache, cold iron is the expired one. It is video 2 of a three-video test the owner agreed to that day: the same hook formula (a plain pain plus a number in the first line), about 75 words, two token topics without the caveman skill and one topic that is not about tokens. The other two are `/usage` (needs the owner's `/usage` screenshot) and "my AI said done" (needs a real case from the owner).

**Where the number comes from.** The owner's own session log for this project, `~/.claude/projects/C--Users-achma-OneDrive-Dokumen-Animation/10e2e867-…jsonl`: a manual `/compact` on 2026-11-09 at 22:59 UTC, on a chat whose last reply was at 08:53 UTC, with `preTokens` 348,408 and `durationMs` 57,157.

- Measured: the chat's size (348,408 tokens), the gap (about 14 hours), the duration (57 s).
- Not measured: what that compaction cost. Its usage is not in the log. "The cache is gone, it processes everything again" is how the docs describe a `/compact` after a break longer than the cache lifetime, not a reading.
- The 57 seconds proves nothing about cost: the docs say compaction spends most of its time writing the summary. Do not use it as evidence.
- The owner should confirm the script's "I" is fair, since it describes their session.

**Facts, all from code.claude.com/docs/en/prompt-caching and /costs, read 2026-11-17.** To summarize, `/compact` sends a request that repeats the history being summarized. While the cache is warm it reads that from the cache and "costs a fraction of what the context size suggests". After a break longer than the cache lifetime it reprocesses the history as uncached input, which is why it costs the most on an old session. `/clear` costs nothing. Do not say a cache lifetime in the video: it is one hour on a subscription within plan usage and five minutes on usage credits or an API key. Do not say Claude Code never compacts on its own: from v2.1.290 it can compact an idle chat.

**Script (ElevenLabs v3), 79 words:**

```text
[flat, tired] One command just re-read three hundred forty-eight thousand tokens.

[deadpan] Slash compact. On a chat I left fourteen hours ago.

[short pause]

[explaining] To summarize your chat, it has to read all of it.

[easy, warm] While you work, that chat is cached. Hot. Cheap to read.

[grim] Leave it for hours, and the cache goes cold. It processes everything again.

[firm, instructing] So compact before you walk away. Not after.

[lighter] Done with that chat? Slash clear. Costs nothing.

[friendly] Follow Stickman Ships.

[proud] Strike while the cache is hot.
```

**Voice: ElevenLabs, "Roger - Laid-Back, Casual, Resonant".** The owner sent the take on 2026-11-17; it is `public/voice-compact.mp3` (31.24 s, a copy is in `voice-raw/`). Its 18 stretches of speech match the script's 16 sentences plus two comma breaks, by count and length; nobody on this side has heard it. `src/compact/lines.ts` holds the start and length of each stretch. The take measures 1.7 dB quieter than the superpowers voice, so it plays at volume 1.2 with the bed at 0.15.

- Three cues are exact because they sit on a measured pause: every sentence start, "it has to read" and "that chat is cached".
- The 348,408 cue, which carries a camera shake, is a guess: 1.91 s, the longest small dip before the number in the first sentence. Check it by ear first.
- The other cues inside a stretch ("fourteen hours", "all of it", "goes cold", "before", "is hot") are placed by character share, as `cue(line, share)` in `CompactVideo.tsx`.

**The local voice was tried first and replaced.** The owner asked to try a voice from `out/voice-samples/`, saw the draft with Kokoro `am_fenrir`, and then sent the ElevenLabs take. The tool stays for a later video. Kokoro ignores emotion tags; the text it reads is `voice-raw/compact-script.txt`, one sentence per line.

- `scripts/local-voice.mjs` asks voice-studio for one sentence at a time, trims the silence around each, joins them with 0.3 s between sentences and 0.65 s at a blank line, and prints the start and length of every sentence. Pasted into a video's `lines.ts`, that table makes sentence starts exact.
- To use it, start voice-studio on this computer only, run the script, then stop voice-studio (end the Python process listening on port 8880):

```bash
cd /c/Users/achma/voice-studio && backend/venv/Scripts/python.exe -m backend.cli --engine kokoro --device auto --host 127.0.0.1 --port 8880
```

```bash
node scripts/local-voice.mjs am_fenrir voice-raw/compact-script.txt public/voice-compact.wav
```

**The sleep scene, and the owner's rule from it.** The first version drew the stickman lying flat with open eyes and a smile. The owner rejected it on 2026-11-17: "if he sleeps, he really sleeps", with expression and movement as realistic as possible. `Sleeper` in `CompactVideo.tsx` is the answer, and the pattern for any real-life action in later videos:

- The pose is a standing one turned 90 degrees, so the face turns with the body. Limbs are straight there, because the bendy curves loop when a pose lies down.
- The head sinks into a pillow over the first half second and the lids close. Then one slow breath lifts the shoulder and the blanket, and the Zs leave on the breath out.
- His apron is the blanket, pulled to the chin. One arm rests on top of it and the feet stick out.
- When the doorway goes dark he shivers and pulls the blanket closer.
- Outside this scene he blinks about every three seconds, and his lids are half closed in the hook until the number lands.
- Check a scene like this at full size on several frames. It passed twice in the six-frame sheets before the owner caught it.

**Scenes.** Nine, on the superpowers pattern (`CUTS`, `PLACE`, `POSES`): cold forge with the count running up on the iron (hook), his view of the terminal, the chat as a scroll being read, the lit forge where he hammers, the yard at night while he sleeps and the doorway goes dark, a close-up of the cold iron counting again, two boards with the rule, the scrap barrel for `/clear`, and the lit forge again. The last seven frames go cold so the video loops. Three camera shakes: the number, "again", the last strike. The sets are in `src/compact/Forge.tsx`; `heat` 0 or 1 switches the forge between cold and lit and gives the stickman's head its wall color.

- The hammer follows the right forearm, so `RAISE` and `STRIKE` are the whole swing. `HITS` lists the frames it lands on; sparks and the shake use the same list.
- He wears an apron in every scene and holds the hammer only in the forge.
- Nothing on the terminal copies Claude Code's real screen: it shows the command in its real case, the chat as plain lines, and the measured token count.

**Review sheets.** Four images of six frozen frames, in `out/frame-video/compact-frames/`, timed to the voice. Four half-size stills of the sleep scene are in `out/frame-video/compact-frames/sleep/`:

```bash
npx remotion still CompactFrames out/frame-video/compact-frames/sheet-1.png --props='{"from":0}' --image-format=png
```

Use `from` 0, 6, 12 and 18. On Windows PowerShell the quotes inside `--props` need escaping; from Git Bash the line works as written.

**Two traps whenever the voice changes.**

- `swing` needs about 20 frames between two hits, and "Hot." to "Cheap" is 22 with this voice. If a new gap is shorter, the first strike's sparks fire while the hammer is still in the air: shorten the swing or drop the second strike.
- The cold recount runs over `[T.again, T.rule - 10]`. If "again" starts 10 frames or less before the next line, `interpolate` throws.

**Sound.** 32 cues of 14 kinds from `public/sfx`, none on every cut: keys while the count runs and while he types, a thud with a ring for each hammer blow, crickets in the yard. The bed is `bgm-compact` (32.5 s, Em-C-G-D at 88 bpm), added last in `scripts/make-sfx.mjs`; the other sound files were hashed before and after and did not change.

**Checked so far:** 22 frozen frames, the sleep stills, `npx tsc --noEmit`, and the render's size, length and audio track. Nothing has been watched or heard, so the sync, the sound balance, the moves between poses, the swing, the thrown scroll and the loop from the last frame to the first are unseen in motion. Nobody ran `/compact` to confirm the behaviour; it rests on the docs and the session log.

**Not done yet.** The owner's approval. The notes below are from before the sound went in: add a `Soundtrack` (existing sounds in `public/sfx` are enough; a bed needs `makeBed` at the end of `scripts/make-sfx.mjs`), then render:

```bash
npx remotion render CompactTutorial out/compact-tutorial.mp4
```

**YouTube title:** `/compact re-read 348,000 tokens. Here's when to run it #Shorts`

**YouTube description:**

```text
/compact has to read your whole chat to summarize it. While you work, that chat is cached and cheap to read. Leave it for hours and the cache goes cold, so it processes everything again.

Compact before you walk away, not after.
Done with that chat? /clear costs nothing.

The 348,408 is the size of one of my own chats when I compacted it, 14 hours after I left it.
Source: code.claude.com/docs/en/prompt-caching

Animation, music and sound effects are original. AI voice: ElevenLabs.

#claudecode #aicoding #tokens
```

**Reels:**

```text
I compacted a chat I left 14 hours ago. 348,408 tokens, read all over again.

/compact before you walk away, not after.
Done with that chat? /clear costs nothing.

When do you run /compact?

#claudecode #aicoding #tokens
```

**TikTok:**

```text
Strike while the cache is hot.

/compact before you walk away, not after.
Done with that chat? /clear costs nothing.

When do you run /compact?

#claudecode #aicoding #tokens #programmer
```

## grill-me script and captions

Added 2026-11-18. Every claim comes from github.com/mattpocock/skills, read that day: `/grill-me` is user-invoked and calls the `grilling` skill, which asks numbered questions with a recommended answer each, looks up facts itself with a sub-agent, and waits for the user to confirm before acting. The install command has not been run. The rabbit tracker, the questions and `db.ts: SQLite` are illustrations, not a real session.

**Script (ElevenLabs v3, voice Lucan Rook):**

```text
[confident, punchy] Your AI never asks questions. This one skill makes it interrogate you before it writes a line.
[casual] You say: build me a habit tracker. [cheerful, fake] It says: sure!
[deadpan] Ten minutes later... you have the wrong app.
[normal, clear] In Claude Code, type slash plugin install, mattpocock skills.
Then slash grill-me, and your plan.
[low, serious] Now it is an interrogation.
Every question comes numbered, with its own best answer. [firm] Say yes... or fight it.
[relaxed] Anything it can look up, it finds out itself, instead of asking you.
It only stops when nothing is left to guess. Then it waits for your yes.
[warm, satisfied] Same idea. Right app. Because this time, the AI asked first.
[deadpan] Most AIs never ask.
```

**YouTube title:** `Your AI never asks questions. This skill fixes that #Shorts` (59 characters, title.py 76/100)

**YouTube description:**

```text
Your AI never asks questions. It hears "build me a habit tracker", says "sure!", and ten minutes later you have the wrong app.

grill-me flips that: before it writes a line, the AI interviews you about your plan.

Install in Claude Code:
/plugin install mattpocock-skills@claude-plugins-official
Then type /grill-me and your plan.

How it works:
1. Every question is numbered, with its own recommended answer. Say yes, or push back
2. Anything it can look up, it finds out itself instead of asking you
3. It stops only when nothing is left to guess, then waits for your yes before it builds

grill-me is part of Matt Pocock's skills: github.com/mattpocock/skills

Not affiliated with or sponsored by Matt Pocock.
Animation, music and sound effects are original. AI voice: ElevenLabs.

#claudecode #aicoding #mattpocock
```

**Reels:**

```text
I asked my AI for a habit tracker. It built a rabbit tracker.

/grill-me makes it interrogate you first: numbered questions, a best answer for each, and nothing gets built until you say yes.

Install in Claude Code:
/plugin install mattpocock-skills@claude-plugins-official

Would you let your AI grill you?

#claudecode #aicoding #vibecoding
```

**TikTok:**

```text
Your AI never asks questions. This one does.

/grill-me interviews you about your plan before it writes a line.
/plugin install mattpocock-skills@claude-plugins-official

Would you let your AI grill you?

#claudecode #aicoding #vibecoding #programmer
```

TikTok: turn on the AI label, because the voice is realistic.

## Superpowers script and captions

Added 2026-11-11. Every claim comes from the README at github.com/obra/superpowers, read that day. The install command has not been run. The 847 on the monitor in the hook is an illustration, not a measurement, so do not quote it.

**Script (ElevenLabs v3), the trailer parody the owner voiced:**

```text
[deep, dramatic movie trailer voice] In a world... where AI writes code before you finish your sentence...

One developer... typed one command.

[normal, fast] Slash plugin install superpowers.

[dramatic] Now his AI has powers.

The power... to ask what you actually want.

The power... to write a plan. Tiny tasks. Two to five minutes each.

The power... to test first. Red. Then green.

[whisper] Code with no test... gets deleted.

[dramatic] And every task... gets a code review.

[normal, deadpan] It's a plugin by Jesse Vincent. Link in the caption.

[dramatic] Superpowers. Coming soon... to your terminal.
```

The take has 25 speech chunks and the script has 25 phrases, which is how the take was matched to this script; nobody on this side has heard it. Two other scripts were offered and not used: a before-and-after story and a 30-second trick. The owner is still looking for the niche that fits, so the format is an experiment.

The voice measured about 1 dB quieter than the caveman voice, so it plays at full volume with the bed at 0.15 like the caveman video. The video has 23 sound cues and two camera shakes (the powers and the kick).

```bash
npx remotion render SuperpowersTutorial out/superpowers-tutorial.mp4
```

**YouTube title:** `In a world where AI codes before you finish your sentence #Shorts`

**YouTube description:**

```text
In a world where AI writes code before you finish your sentence, one plugin makes it ask first.

Superpowers gives your AI coding agent a workflow: it asks what you actually want, writes a plan, tests first, and reviews every task.

Install in Claude Code:
/plugin install superpowers@claude-plugins-official
Then start a new session and ask for what you want. The skills trigger on their own.

What happens, in order:
1. It asks what you actually want, before any code
2. It writes a plan of tiny tasks, 2 to 5 minutes each
3. Test first: red, then green. Code written before a test gets deleted
4. Every task gets a code review

Superpowers by Jesse Vincent and Prime Radiant: github.com/obra/superpowers

Not affiliated with or sponsored by the Superpowers project.
Animation, music and sound effects are original. AI voice: ElevenLabs.

#superpowers #aicoding #claudecode
```

**Reels:**

```text
In a world where AI writes code before you finish your sentence... one developer typed one command.

Install in Claude Code: /plugin install superpowers@claude-plugins-official
Now it asks first, plans, tests, and reviews its own work.

Plugin by Jesse Vincent: github.com/obra/superpowers

#superpowers #aicoding #claudecode
```

**TikTok:**

```text
Coming soon to your terminal: an AI that asks what you want before it starts coding.

Install in Claude Code: /plugin install superpowers@claude-plugins-official

Plugin by Jesse Vincent: github.com/obra/superpowers

#superpowers #aicoding #claudecode #programmer
```

If the ElevenLabs plan is free, every video needs "elevenlabs.io" in the YouTube title and at the start of the TikTok and Reels captions.

## Platform rules to follow

- TikTok: turn on the AI label, because the voice is realistic.
- YouTube: animation does not need the synthetic-content label. The real risk is the inauthentic content policy, which can demonetize a whole channel for templated, interchangeable AI videos. Each video needs its own story and something the owner actually tried.
- Upload the clean MP4 to each platform. Never reuse a TikTok download with a watermark.
- Keep the original audio. Do not replace it with trending sounds.

## Schedule

Formats rotate so the videos do not look interchangeable: Tool Test, Versus Slop (comedy about AI mistakes), and 30-Second Trick.

| # | Date | Topic | Format |
|---|---|---|---|
| 1 | 10 Nov | How to use antislop (done) | Tool Test |
| 2 | 12 Nov | Why every AI-built page looks the same | Versus Slop |
| 3 | 14 Nov | What SKILL.md is | Trick |
| 4 | 16 Nov | DESIGN.md: giving AI a design direction | Tool Test |
| 5 | 18 Nov | Sentences that give away AI writing | Versus Slop |
| 6 | 20 Nov | Commit before AI changes your code | Trick |
| 7 | 22 Nov | Cleaning up AI code comments | Tool Test |
| 8 | 24 Nov | AI says "done", but it isn't | Versus Slop |
| 9 | 26 Nov | How to give AI an error so it gets fixed fast | Trick |
| 10 | 28 Nov | Contrast check: text nobody can read | Tool Test |
| 11 | 30 Nov | AI adds 500 lines to fix a 5-line problem | Versus Slop |
| 12 | 2 Dec | Don't paste API keys into AI chat | Trick |
| 13 | 4 Dec | Reading an AI diff in 30 seconds | Trick |
| 14 | 6 Dec | The same page before and after antislop | Tool Test |
| 15 | 8 Dec | 30-day results of this account, with real numbers | Story |

**Two-day cycle.** Day one: the owner sends the topic and what they tried, the script gets written, and they generate the voice. Day two: they send the voice, the video gets built, and they upload at the same time to all three platforms.

**Log 48 hours after each upload:** views, average percent watched, saves and shares, new followers. On 9 December, compare the three formats and continue with the strongest.

## AoT comedy shorts (Raka, Ucup, Sinta)

Added 2026-11-10. Five Indonesian comedy shorts about Attack on Titan, with original characters, original scripts and original visuals. Nothing is taken from the Malaka Books video except the topic. Scripts live in the Claude doc "Naskah Animasi AoT — Raka & Ucup".

| Composition | Script | Length |
|---|---|---|
| `AotBootsApa` | Naskah 1, bootstrap paradox | 41.5 s |
| `AotSidangEren` | Naskah 2, Eren on trial | 40.1 s |
| `AotBelumMoveOn` | Naskah 3, support group for the ending | 38.0 s |
| `AotSokPinter` | Naskah 4, Ucup pretends to be smart | 37.1 s |
| `AotZonaSpoiler` | Naskah 5, spoiler zone | 30.6 s |

**Render**

```bash
npx remotion render AotBootsApa out/aot-1-boots-apa.mp4
npx remotion render AotSidangEren out/aot-2-sidang-eren.mp4
npx remotion render AotBelumMoveOn out/aot-3-belum-move-on.mp4
npx remotion render AotSokPinter out/aot-4-sok-pinter.mp4
npx remotion render AotZonaSpoiler out/aot-5-zona-spoiler.mp4
```

**Files**

| Path | What it holds |
|---|---|
| `src/aot/AotShorts.tsx` | Beat timeline engine and the five episodes. Each episode is a list of beats: a voice line, a pause, poses, looks, sound effects |
| `src/aot/Cast.tsx` | Pose builder, the three characters' accessories (Raka hair and glasses, Ucup beanie, Sinta hair, wig), props, talking mouth |
| `src/aot/Sets.tsx` | Five backgrounds and foreground props |
| `src/aot/AotCaption.tsx` | Captions for this series: one font per short; lines enter with smooth motions that rotate line by line (rise, grow, from left, focus, from right, settle). Fonts load from `public/fonts/aot`, so rendering needs no internet |
| `src/aot/lines.ts` | Generated. Text, duration and per-frame mouth loudness for every voice line |
| `public/aot/<character>/<code>.mp3` | One file per voice line, cut from the three ElevenLabs takes (one take per character) |

**How the voice was cut.** Each character was voiced in one ElevenLabs take, lines in script order. The takes were split at the pauses that best matched each line's expected length, then checked: very short lines like "Apa?" (R04) and "Hah?" (S13) landed exactly. Lines R01 and U11 came out longer than expected, which fits their dramatic pauses, but nobody has listened to them from this side.

**Timing.** Beats run one after another with 7 frames between lines, so changing a voice file only needs `lines.ts` regenerated; nothing else is hand-timed.

**Bleeps.** "bla-bla" in R15, U15 and U16 is covered by `sfx/beep.wav` and the voice is muted for about half a second. The position is estimated from where the word sits in the text. If a bleep misses, add a nudge in seconds to `BLEEP_NUDGE` in `AotShorts.tsx`, for example `{ U15: -0.1 }`.

**Fonts and text effects.** Each short has its own look, set by `style` in its episode: 1 Bangers, 2 Alfa Slab One, 3 Fredoka, 4 Space Mono, 5 Bungee. Text motion is mixed line by line from `MOTIONS` in `AotCaption.tsx`. The owner wants it smooth and varied, not bouncy, shaky or glitchy. All five fonts are SIL Open Font License. The shared `Caption` in `src/Composition.tsx` is untouched.

**Rendered files.** `out/aot-1-boots-apa.mp4` to `out/aot-5-zona-spoiler.mp4`.

**Sound.** `beep`, `crickets` and `bgm-aot` were added to `scripts/make-sfx.mjs`, so they are synthesized like everything else.

**Before upload**

- Turn on the AI label on TikTok (realistic AI voice). Check the ElevenLabs plan allows commercial use.
- The characters are original. Never draw Eren, Titans or anything from the anime; naming them in dialogue is fine.
- Credit line for captions: "Animasi, naskah dan musik original. Suara AI: ElevenLabs."

## Starter pack video, "Level one"

Added 2026-11-19. The owner asked for five skills a beginner should use so they do not waste tokens, then a script, then the animation. Style: an original adventure-game look. The stickman is a level-one adventurer with a bag of tokens; a five-slot inventory bar at the bottom fills with one item per skill. Code in `src/starter/`, compositions `StarterPack` and `StarterFrames`.

**The five, in the order of one working session.** The first draft used grill-me, ponytail, caveman, caveman-compress and handoff; the owner chose on 2026-11-19 to swap in skills no earlier video used. Install counts from `npx skills find` that day. Each line below was checked against the skill's own SKILL.md, read that day.

| # | Skill | Waste it stops | Installs | Source |
|---|---|---|---|---|
| 1 | `session-report` | Not knowing where tokens go: an HTML report of tokens per project, skill and prompt, with the most expensive prompts | 4.7K | Anthropic, `claude-plugins-official`, plugin `session-report` |
| 2 | `claude-md-improver` | A stale CLAUDE.md read at every session start: it grades the file, shows a report, and fixes it after you approve | 15.2K | Anthropic, `claude-plugins-official`, plugin `claude-md-management` |
| 3 | `research` | Reading docs in the main chat: a background agent with a fresh context reads primary sources and writes one Markdown file | 821K | github.com/mattpocock/skills |
| 4 | `prototype` | Building the real thing to answer a question: throwaway code first | 1.1M | github.com/mattpocock/skills |
| 5 | `diagnosing-bugs` | Guess-and-retry fixing: it builds one command that goes red on the bug before it touches the code | 950K | github.com/mattpocock/skills |

- These save tokens less directly than the first five: mostly by avoiding work that gets redone. The script makes no number claims.
- Do not say claude-md-improver "shrinks" the file. Conciseness is one of its criteria, but it can also add lines.
- Rejected this round: `tdd` (the superpowers video already says "test first, red then green"), `strategic-compact` (needs its hook, and /compact has its own video), `context-budget` (only tells you to type `/context`), `search-first` (from the large ECC collection), `planning-with-files` (hooks on every tool call and `sh` scripts, a Windows risk). Rejected in the first round: graphify, context7, context-engineering.
- `session-report` uses `/tmp`, `cp` and `date`, so on Windows it relies on Claude Code's Git Bash. Its count is low (4.7K) but it is Anthropic's own.
- The three mattpocock skills come with the same plugin the grill-me video installs. The skills themselves are new to the channel.
- None of the five was run from here.

**Script (ElevenLabs v3), 82 words, about 33 s at 150 words a minute. The take must come in at or under about 34 s.** Rewritten on 2026-11-19 with the yt-script and yt-shorts skills so the hook is stronger:

```text
[frustrated, fast] Your Claude Code tokens run out before your app works.
[confident] Here's why, and five skills that stop it.
[instructing] One: session report. It shows which prompt ate your tokens.
Two: Claude M D improver. It fixes the memory file it reads every session.
Three: research. A side agent reads the docs and saves one note.
Four: prototype. Test the idea before you build it.
Five: diagnosing bugs. Prove the bug. Then fix it.
[friendly] All five are in the caption.
Follow Stickman Ships, because...
```

**Hook.** The owner chose hook A on 2026-11-19. Formula "The Mistake" (the pain the viewer has right now), scored with `~/.claude/skills/yt-script/hookscore.py`: 66, WORKABLE (specificity 52, address 96, stakes 74, curiosity 58, brevity 100). Runner-up, "The Question": "Your tokens run out before your app works. One prompt ate them. Which one?", 62. It keeps one ask (follow), which doubles as the loop. The old opener ("Level one. A full bag of tokens. Don't waste it."), 15 words, did not say what the video was about until second 4. The scorer's own note: it separates bad hooks from good ones but barely separates a creator's hits from their misses, so the score is a check, not a promise.
- **First two seconds on screen:** "OUT OF TOKENS. AGAIN?" (different words from the voice, as yt-shorts asks), then "TOKENS RUN OUT / BEFORE YOUR APP WORKS".
- **Payoff said out loud:** "All five are in the caption."
- **Loop:** the last line, "Follow Stickman Ships, because...", runs into the first line on replay: "...your Claude Code tokens run out before your app works." The video ends 0.2 s after it, so the replay starts at once. The ElevenLabs take should not close that line with a falling, final tone; ask for it to trail off.
- The voice profile used for this is `~/.claude/youtube/voice.md`, written from the scripts in this file.

"Claude M D" is spelled out so the voice says the letters. The captions show the real names (`claude-md-improver`).

**Timing.** Measured on the owner's take, received 2026-11-20: ElevenLabs, Lucan Rook - Energetic Male, `public/voice-starter.mp3` (copied from `sound/ai-voice/ElevenLabs_2026-11-19T14_58_06_...v4.mp3`), 30.93 s. Silence detection at -35dB, 0.12 s found 21 speech stretches for the 21 phrases, matched in order; `src/starter/lines.ts` holds them. Cues inside a phrase ("run out", "ate", "saves one note", "build", "because") were set from the shorter word gaps at -30dB, 0.05 s. The video is 31.0 s and ends 0.1 s after "because" for the loop. The voice plays at full volume; its level has not been compared with the other videos yet.

**Scenes.** Eight, on the superpowers pattern (`CUTS`, `PLACE`, `POSES`), all sets in `src/starter/Sets.tsx`:
- Meadow with a LEVEL 1 sign. On "run out" five coins jump out of his pouch and the token gauge drains to red; he grabs his head on "before your app works". Each skill after that refills a fifth of the gauge, so it is full again at "All five".
- Item shop with five "?" slots, on "Here's why, and five skills that stop it".
- Forest quest board, "TOKENS USED": three prompt bars, the red one has teeth and gets a red ring stamped round it.
- Village square with CLAUDE.md on a stone tablet: two stale lines (`db: mysql`, `node 14`) are struck and replaced, and a red D badge is stamped into a green A.
- Night camp with a DOCS tower: a small flying helper (the side agent) flies to the tower, reads with pages round it, and brings back one note.
- Canyon: a small cardboard model of a fancy bridge on a TEST crate; he pokes it and it falls into a heap; one plank slides across and he jumps onto it.
- Mountain trail with a test lamp: a bug scurries, a jar comes down on it and the lamp goes red, then the bug is gone and the lamp goes green.
- The meadow again with LEVEL 2 and LEVEL UP! on "All five".

Three camera shakes: the ring on the hungry prompt, the model falling, the level up on "All five". The `Hud` at the bottom shows level, a token gauge and the five slots.

**Review sheets** (20 frames, on the measured voice) are in `out/frame-video/starter-frames/`, sheets 1 to 4:

```bash
npx remotion still StarterFrames out/frame-video/starter-frames/sheet-1.png --props='{"from":0}' --image-format=png
```

Use `from` 0, 6, 12 and 18.

**Install lines for the captions (built from the sources, none run yet):**

```text
/plugin install session-report@claude-plugins-official
/plugin install claude-md-management@claude-plugins-official
/plugin install mattpocock-skills@claude-plugins-official
```

The third one is the line from the grill-me video and brings research, prototype and diagnosing-bugs. Check after install that the three show under those names.

**Sound.** Approved frames on 2026-11-20, then sound went in. The voice plays at 1.1: its speech RMS measured -22.3 dB, 1 dB above the grill-me take that plays at 1.2 (measured by decoding to WAV, since the bundled ffmpeg has no `volumedetect`). The bed is `bgm-starter` (31.6 s, F-Bb-Gm-C at 118 bpm), added last in `scripts/make-sfx.mjs`; every other file in `public/sfx` hashed the same before and after. The bed measures -16.9 dB RMS, louder than `bgm`, so it plays at 0.105 to sit about 15 dB under the voice, like the grill-me video. 32 cues of 13 kinds plus crickets under the night camp: a pop for each coin, a chime when an item lands in the bar, stamp and impact on the ringed prompt, paper on the struck lines, a check for the A, a click and thuds for the model, a thud for the landing and the jar, error for red, check and sparkle for green, ding and impact for the level up. Nothing plays on "because", so the loop runs straight into the hook.

**Checked:** `npx tsc --noEmit`, the render's size, length (31.04 s) and audio track, peak -4.4 dB (no clipping). Nobody has watched or heard the render, so sync by ear, the sound balance and the loop are unconfirmed.

**Not done yet.** The owner's check by ear; running the three install lines once before upload.

**Captions.** Written 2026-11-20. The three install lines were checked that day against `claude-plugins-official/.claude-plugin/marketplace.json` (`session-report` and `claude-md-management` by Anthropic, `mattpocock-skills` pinned at plugin version 1.3.1, whose `plugin.json` lists `research`, `prototype` and `diagnosing-bugs`). None has been run. How to call each skill after install is left out on purpose: it was not checked.

**YouTube title:** `5 skills that stop Claude Code eating your tokens #Shorts` (57 characters, title.py 94/100; a mobile feed shows "5 skills that stop Claude Code eating...")

**YouTube description:**

```text
Your Claude Code tokens run out before your app works? Five skills that stop it.

1. session-report: shows which prompt ate your tokens
2. claude-md-improver: fixes the memory file Claude reads every session
3. research: a side agent reads the docs and saves one note
4. prototype: test the idea before you build it
5. diagnosing-bugs: prove the bug, then fix it

Install in Claude Code:
/plugin install session-report@claude-plugins-official
/plugin install claude-md-management@claude-plugins-official
/plugin install mattpocock-skills@claude-plugins-official
(the last one brings research, prototype and diagnosing-bugs)

Skills by Anthropic and Matt Pocock. Not affiliated with or sponsored by either.
Animation, music and sound effects are original. AI voice: ElevenLabs.

#claudecode #aicoding #tokens
```

**Reels:**

```text
Level one, and the token bag is already empty.

5 skills that stop it: session-report, claude-md-improver, research, prototype, diagnosing-bugs.

Install in Claude Code:
/plugin install session-report@claude-plugins-official
/plugin install claude-md-management@claude-plugins-official
/plugin install mattpocock-skills@claude-plugins-official

Which one would you install first?

#claudecode #aicoding #vibecoding
```

**TikTok:**

```text
Out of Claude Code tokens again? 5 skills that stop it.

/plugin install session-report@claude-plugins-official
/plugin install claude-md-management@claude-plugins-official
/plugin install mattpocock-skills@claude-plugins-official

Which one first?

#claudecode #aicoding #vibecoding #programmer
```

TikTok: turn on the AI label, because the voice is realistic.

**Coin cue fix, 2026-11-20.** The coins first left the pouch at 0.58 of the hook, which is the end of "out". Two independent test runs of the stickman-ships-video skill read the take's loudness envelope (there is no silence before "run") and both found "run" at about 1.22 s, so the cue is now 0.44 of the hook and the coins start about 0.4 s earlier. The video was re-rendered.

**Canyon jump, checked on the real take.** "build" comes late in the take (about 22.6 s), which would have left him on the plank for 4 frames before the cut to "Five". The jump now starts once the plank is in, but never later than 32 frames before "Five", so he lands about half a second before the cut (14 frames on the plank in this take). The side agent's trip was shortened for the same reason: it flies out in 14 frames and back in 12, so it reads for about a second.

## Five skills, penthouse tour (planned for Google Flow, built in Remotion)

Written 2026-11-21. Everything (facts table, sources, script, hook scores, scene breakdown, Flow prompts, caption commands) is in `flow/five-skills-luxury-room.md`.

- Script: 80 words, about 33 s, hook A "The Question" (60, WORKABLE). The owner chose hook A on 2026-11-21. A higher-scoring hook ("You're wasting 5 good skills...", 69) was dropped because it assumes viewers already installed all five.
- chief-of-staff: the real file is `c-level-advisor/skills/chief-of-staff/SKILL.md` (the path without `skills/` gives 404). Other skills share the name; this one is the C-suite router.
- marketing-psychology install line was built from the README pattern, not copied. No install line has been run.
- Flow prompts are untested: 9:16 support and clip length depend on the Flow model.
- chief-of-staff and marketing-psychology are outside the AI-coding niche; the owner's call.
- Voice take 2026-11-21: `ElevenLabs_2026-11-21T06_40_00_Lucan Rook  - Energetic Male_pvc_s50_sim75_v4.mp3` (in `Dokumen/sound/ai-voice/`), copied to `public/voice-flow5.mp3`, 34.59 s, speech ends 34.37. 25 stretches matched to 24 phrases in order; only the first sentence splits in two (gap 2.91-3.06), inferred from length. Scene cuts (s): 0, 4.95, 7.00, 12.30, 17.05, 21.80, 26.70, 31.05, end 34.59; key moments are in the doc. Not checked by ear. No room left for a tail under 35 s.
- 2026-11-21: the owner asked for backgrounds that match each skill. Bedroom for clips 1, 2, 8 (loop); boardroom with five empty chairs (chief-of-staff), private gallery with a brass machine in a glass case (anatomy), two-storey library (teach), luxury watch boutique (marketing-psychology), media room with screens and newspapers (last30days). Prompts in `flow/flow-prompts.md`. The owner generates the clips in Flow and saves them as `public/flow5/klip1.mp4` to `klip8.mp4`; the edit is done here.
- 2026-11-21: the owner dropped Google Flow; the video is built here. Style: a luxury property tour (gold frame, room plaque at the bottom), new for the channel. Rooms: master suite (hook, three medallions teacher/advisor/researcher), foyer (clap under the chandelier, shake 1), boardroom (bell, five advisor lamps, answer card), gallery (brass machine in a glass case, he turns the crank), library (takes the green book, ribbon, chalkboard ticks), boutique (hesitant buyer between two watches, "?"), media room (screens light up, newspapers land on the table, shake 2, he holds up the cited brief), master suite again for the loop. Commands shown on props: `/anatomy` plaque, `/teach` chalkboard, `/last30days` screen. Timing is `src/penthouse/lines.ts` (25 measured phrases); cues inside a phrase use the word gaps. Two shakes only. The Flow prompt files in `flow/` are no longer used.
- Traps: shot frames on a blink (`(frame + 17) % 87 < 7`) show closed eyes; shots 14 and 19 were moved for that. The crank hand follows `crankKnob(spin)` in Sets.tsx; if the gallery cut moves earlier than `T.machine + 24`, the happy face never shows.
- 2026-11-21, owner asked for realistic moves that use the furniture: he now sits in a leather armchair in the master suite (hook and loop, so start and end match), sits in a tall executive chair at the head of the boardroom table (knees under the table, which is drawn over him as `BoardTable`; hands on the table, taps the bell, leans back with hands behind his head), rests his right hand on the boutique counter while deciding, and walks the newspaper stack to the media-room table (walk cycle in `animatePose`, `txAt` moves him from x 230 to 360) before dropping it straight down. Seated poses build on `SIT` from Stickman.tsx via `sit()`. Trap: `BossChair` must render after `Boardroom` (the room paints its wall over everything).
- 2026-11-21 sound: voice speech RMS -22.7 dB, plays at 1.13 (lands with grill-me at 1.2). New bed `bgm-penthouse` (lounge Dmaj7-Bm7-Em7-A7, 84 bpm, 35.2 s) added last in `scripts/make-sfx.mjs`; md5 of every other sfx file unchanged. Bed -18.2 dB RMS at 0.12, about 15 dB under the voice, ends low for the loop. 31 effect cues of 12 kinds: pops for the medallions, impact + sparkle on the clap (shake 1), ding for the bell, clicks for the lamps, paper for the card and the book, sweep for the machine, checks for the lessons, chime for the pick, footsteps for the walk, impact + thud + paper when the papers land (shake 2); nothing on "because". Render peak -4.5 dB (no clipping). Not heard by anyone yet.
- 2026-11-21: the owner sent a TikTok by @nocode.joshua ("5 Claude AI Skills You Probably Haven't Tried", same five skills; split screen with animated UI cards over a talking head, mono word-by-word captions) and asked for a new script "like it but not the same", then two versions to compare: A split screen (our own demo cards over the stickman) and B the current penthouse video with word-by-word captions and a 1/5 stepper. Script v2 in `naskah/five-skills-v2.md`: 76 words (about 33 s at the last take's 2.3 words a second), hook "Before you pay a tutor, advisor or researcher, why not try 5 Claude skills?" (The Question, 70 WORKABLE). Their hook line, examples, colours and card designs are deliberately not copied. Note: their chief-of-staff card shows research/writing/code agents, which is not what the alirezarezvani skill does; ours follows the alirezarezvani file. Waiting for the voice take.
- 2026-11-21: the owner chose hook B for script v2: "Why pay a tutor, advisor or researcher before you try these five Claude skills?" (The Question, 60 WORKABLE). Still 76 words. Waiting for the voice take.
- 2026-11-21 v2 take: `ElevenLabs_2026-11-21T10_34_26_Lucan Rook  - Energetic Male_pvc_s50_sim75_v4.mp3` copied to `public/voice-penthouse-v2.mp3`, 34.43 s (speech ends 34.26). 25 stretches matched in order to 23 phrases ("Raise money, / or cut costs?" and "Ask / how anything works." split at pauses). Timing and the 42 word chunks in `src/penthouse2/lines.ts` (chunk starts at stretch starts or word gaps; the rest estimated). Code `src/penthouse2/PenthouseV2.tsx` (a copy of the v1 timeline, v1 left untouched) and `src/penthouse2/Demo.tsx` (our own demo cards: hook "HOLD THE HIRE" with three paid roles struck out, 5 tiles, CFO+CEO into ONE ANSWER, `/anatomy` turning into an isometric machine, `/teach SQL` with a YOU ARE HERE pin, a product page with the biases named, a 30-day grid folding into a cited brief, the five commands). Compositions `PenthouseV2Split` (demo cards on top, room scaled 0.92 into the lower half, word chunks on the seam) and `PenthouseV2Full` (room full screen, stepper at the top, word chunks at y 500), sheets `PenthouseV2Frames` in `out/frame-video/penthouse-v2-frames/` (split-1..3, full-1..3). Voice only, no effects or music yet. Trap: the split clip must sit on an untransformed group, or it is scaled with the room and cuts his head.
- 2026-11-21 v2 rendered with sound: `out/penthouse-v2-split.mp4` (version A) and `out/penthouse-v2-full.mp4` (version B), both 1080x1920, 30 fps, 34.48 s, peak -5.0 dB. Voice at 1.17 (speech RMS -23.0 dB, 0.3 dB under v1), same bed and effect cues as v1 on the v2 timing. The owner is comparing the two; nobody has confirmed sync by ear. Captions not written yet.

### Penthouse v2 captions (version A chosen)

The owner chose version A, `out/penthouse-v2-split.mp4`, on 2026-11-21. Captions written the same day. Install lines read that day from each source: alirezarezvani/claude-skills README (marketplace + `c-level-skills`), wheresryan22/anatomy README, mattpocock/skills README plus `claude-plugins-official` marketplace.json and the pinned `plugin.json` 1.3.1 (lists `skills/productivity/teach`), coreyhaines31/marketingskills README (the `--skill` form is the README's pattern, applied to marketing-psychology), mvanhorn/last30days-skill README. None has been run. Credits use GitHub handles, not guessed names. Format inspired by a TikTok from @nocode.joshua; not credited in the caption (owner's call).

**YouTube title:** `Why pay a tutor? Try 5 Claude skills first #Shorts` (50 characters, title.py 94/100; mobile shows "Why pay a tutor? Try 5 Claude skills...")

**YouTube description:**

```text
Why pay a tutor, an advisor or a researcher before you try these five Claude skills?

1. chief-of-staff: raise money or cut costs? Your advisors answer as one
2. anatomy: ask how anything works, get a moving machine
3. teach: pick a topic, it remembers your place
4. marketing-psychology: why don't visitors buy? It names the bias
5. last30days: a month of Reddit, one cited brief

Install in Claude Code:
chief-of-staff
/plugin marketplace add alirezarezvani/claude-skills
/plugin install c-level-skills@claude-code-skills
anatomy
npx skills add wheresryan22/anatomy -g -a claude-code
teach
/plugin install mattpocock-skills@claude-plugins-official
marketing-psychology
npx skills add coreyhaines31/marketingskills --skill marketing-psychology -a claude-code
last30days
/plugin marketplace add mvanhorn/last30days-skill
/plugin install last30days

Heads up: last30days needs Python 3.12+, anatomy needs Node 20.10+.

Skills by alirezarezvani, wheresryan22, mattpocock, coreyhaines31 and mvanhorn on GitHub. Not affiliated with or sponsored by any of them.
Animation, music and sound effects are original. AI voice: ElevenLabs.

#claudecode #aicoding #claudeskills
```

**Reels:**

```text
Hold the hire. 🛎️
A tutor, an advisor and a researcher, as five Claude skills.

chief-of-staff
/plugin marketplace add alirezarezvani/claude-skills
/plugin install c-level-skills@claude-code-skills
anatomy
npx skills add wheresryan22/anatomy -g -a claude-code
teach
/plugin install mattpocock-skills@claude-plugins-official
marketing-psychology
npx skills add coreyhaines31/marketingskills --skill marketing-psychology -a claude-code
last30days
/plugin marketplace add mvanhorn/last30days-skill
/plugin install last30days

Which one would you hire first?

#claudecode #aicoding #vibecoding
```

**TikTok:**

```text
Why pay a tutor? Try these 5 Claude skills first.

/plugin install c-level-skills@claude-code-skills (after /plugin marketplace add alirezarezvani/claude-skills)
npx skills add wheresryan22/anatomy -g -a claude-code
/plugin install mattpocock-skills@claude-plugins-official
npx skills add coreyhaines31/marketingskills --skill marketing-psychology -a claude-code
/plugin install last30days (after /plugin marketplace add mvanhorn/last30days-skill)

Which one first?

#claudecode #aicoding #vibecoding #programmer
```

Before upload: turn on TikTok's AI label (realistic AI voice). ElevenLabs plan is still unknown; on the free plan "elevenlabs.io" must go in the title. Run each install line once.

**YouTube description, short version (owner asked 2026-11-21):**

```text
Why pay a tutor? Try these 5 Claude skills first.

1. chief-of-staff: /plugin marketplace add alirezarezvani/claude-skills then /plugin install c-level-skills@claude-code-skills
2. anatomy: npx skills add wheresryan22/anatomy -g -a claude-code
3. teach: /plugin install mattpocock-skills@claude-plugins-official
4. marketing-psychology: npx skills add coreyhaines31/marketingskills --skill marketing-psychology -a claude-code
5. last30days: /plugin marketplace add mvanhorn/last30days-skill then /plugin install last30days

Skills by their GitHub authors, not affiliated. AI voice: ElevenLabs.
#claudecode #aicoding #claudeskills
```

## ECC video

Started 2026-11-23. The owner asked for a stickman video explaining ECC (github.com/affaan-m/ECC, MIT, release 2.2.3). README and repo tree read that day; facts, sources, script and hook scores are in `naskah/ecc.md`.

- ECC is one Claude Code plugin (`ecc@ecc`) with 72 agents, 328 skills and 99 commands (README, and counted in the repo tree the same day). Workflow: plan, test, implement, review, verify, remember, improve.
- Script: 79 words, about 32 s, loops "because..." back into the hook. Hook A "Why does your AI still code alone, when 72 agents could plan, test and review before it ships?" (The Question, 70 WORKABLE), chosen by the owner 2026-11-23; hook B scored 64.
- Overlap: plan / red-green tests / review are already in the superpowers trailer. New here: the size, the fresh-context reviewer, save and resume session, and "install it once" (the README says stacking installs can duplicate skills, commands and hooks).
- Install lines for the caption: `/plugin marketplace add https://github.com/affaan-m/ECC` then `/plugin install ecc@ecc` (Claude Code 2.1+). Not run. On screen the plan command is `/ecc:plan` (plugin namespace).
- Proposed style: a cooking-show kitchen brigade. Not chosen yet.
- 2026-11-23 voice take: `ElevenLabs_2026-11-23T08_15_08_Lucan Rook  - Energetic Male_pvc_s50_sim75_v4.mp3` (in `Dokumen/sound/ai-voice/`, not Downloads), copied to `public/voice-ecc.mp3`, 30.75 s. 23 stretches matched in order to 21 phrases; "loaded / only when needed" and "Twice can double / everything" split at pauses (inferred from lengths). Table in `src/ecc/lines.ts`; in-phrase cues from word gaps, except "checks" (16.9 s), which is an estimate. Video ends at 31.05 s (0.3 s tail for the loop).
- Style: a cooking show in a restaurant kitchen. The stickman wears a chef's hat; an order ticket at the bottom names the station. Scenes: the line (he stirs a `</>` pot alone, PLAN/TEST/REVIEW signs pop up EMPTY, a bug jumps out of the pot on "before it ships", shake 1), the brigade (neon ECC sign, an `ecc@ecc` box falls on "One install", seven small cooks hop out of it on "a whole team", shake 2), the ticket rail (a planner cook with a clipboard; the ticket types `/ecc:plan` and ticks three boxes), tasting (he tastes from the pot, a TESTS gauge goes red then green, sour face then thumbs up), the pass (a reviewer cook walks in under heat lamps, raises a magnifier on "fresh eyes", a green check lands on the dish), recipe book (he closes the ECC book with a green ribbon at night; the window turns to morning and he opens it again), the pantry (shelves of 48 jars; one jar glows and flies to his hand on "only when needed"), the counter (red beacon; a check for "install once"; a second box lands on the first on "Twice", shake 3; the pot and the cook double with ×2 tags while he facepalms), then the line again with a `/plugin install ecc@ecc` ticket, so it loops.
- On screen the steps are "1 PLAN FIRST", "2 TESTS", "3 REVIEW", "4 REMEMBER". Save and resume are shown as words, not as `/save-session` and `/resume-session`, because the plugin's namespaced command names were not confirmed.
- Traps: shots on a blink were moved (main `(frame + 17) % 87 < 7`, helpers `(frame + i*23) % 97 < 4`). The cooks' last landing (`HOPS`) must finish before the plan cut (frame 299); they start 14 frames before "a whole team". The tasting spoon is drawn over him so it reads at his mouth; the stove spoon is drawn under the pot.
- 2026-11-23: the owner approved the frames. Sound: voice speech RMS -23.1 dB (0.4 dB under the penthouse take), plays at 1.18. New bed `bgm-ecc` (A-F#m-D-E, 108 bpm, 31.6 s) added last in `scripts/make-sfx.mjs`; md5 of every other sfx file unchanged. Bed -17.3 dB RMS at 0.11, about 15 dB under the voice, ends low for the loop. 36 effect cues of 17 kinds: pops for the station signs, error + impact on the bug (shake 1), sweep for the neon, whoosh + thud for the box, paper when it opens, sparkle + impact as the cooks land (shake 2), keys typing `/ecc:plan`, checks on the ticket, womp on the red taste, chime on green, a step, sparkle and stamp at the pass, paper for the book closing and opening, sparkle + whoosh + click for the jar, beep for the catch, check for "install once", whoosh + impact + thud for the second box (shake 3), womp on "double", paper for the command ticket; nothing on "because". Render `out/ecc-kitchen.mp4`, 31.08 s, peak -4.8 dB (no clipping). Not heard by anyone yet.
- Trap: the first render failed because the Google font could not be fetched (network dropped). A retry with `--timeout=120000` worked; frames from the MP4 were checked to show Noto Sans KR, not a fallback font.
- 2026-11-23: the owner listened and said "Sounds good" (sync and balance approved by ear).

### ECC captions

Written 2026-11-23. Install lines from the ECC README, checked the same day against `.claude-plugin/marketplace.json` (marketplace `ecc`, plugin `ecc` 2.2.3) and `.claude-plugin/plugin.json` (`ecc` 2.2.3). Not run. Facts only from what the video says or shows.

**YouTube title:** `Your AI codes alone. Give it 72 agents #Shorts` (46 characters, title.py 94/100; mobile shows "Your AI codes alone. Give it 72 agents..."). Runner-up: `Claude Code with 72 agents and 328 skills #Shorts` (94).

**YouTube description:**

```text
Your AI codes alone: no plan, no tests, nobody checking. ECC hands it a whole kitchen.

1. Plan first: /ecc:plan
2. Tests go red, then green
3. A reviewer with fresh eyes checks the work
4. Save the session, resume it tomorrow
72 agents and 328 skills, loaded only when needed.

Install in Claude Code:
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc

One catch: install it once. Twice can double everything.

ECC by affaan-m on GitHub (MIT). Not affiliated with or sponsored by the author.
Animation, music and sound effects are original. AI voice: ElevenLabs.

#claudecode #aicoding #ecc
```

**Reels:**

```text
Order up: one AI cook, zero reviewers. 🍳
ECC hands it a brigade: plan, test, review, remember.

/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc

Install once. Twice doubles the kitchen.

Which station does your AI skip?

#claudecode #aicoding #vibecoding
```

**TikTok:**

```text
Your AI codes alone. Give it 72 agents.

/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc
(install it once only)

Plan, test or review: which one does your AI skip?

#claudecode #aicoding #vibecoding #programmer
```

Before upload: turn on TikTok's AI label (realistic AI voice). ElevenLabs plan is still unknown; on the free plan "elevenlabs.io" must go in the title. Run the two install lines once. Not in the captions on purpose (not said in the video): Claude Code 2.1+ is required, and the README says to install only from the official repo, npm `ecc-universal`, plugin `ecc@ecc` or ecc.tools.

