---
name: stickman-ships-video
description: Make a Stickman Ships short end to end in this Remotion project - pick the topic or skills, write the ElevenLabs v3 script with a scored hook, build a new-style animated stickman video, send review frames, fit it to the owner's voice take, add sound and music, render, and write the YouTube/TikTok/Reels captions. Use this whenever the owner asks for a new video, a script or hook for one, review frames, "add sound", a voice MP3 to sync, a re-render, or captions for a Stickman Ships video, even if they only name a topic ("bikin video tentang X", "cari 5 skill", "caption", "ini suaranya"). Also use it to continue any stage of a video already in progress.
---

# Stickman Ships video

Stickman Ships is the owner's channel: a bendy cream stickman explains or tests AI coding skills in vertical shorts (1080x1920, 30 fps, English, at most 35 s) posted to YouTube Shorts, TikTok and Instagram Reels. Every video lives in this Remotion project and HANDOVER.md is its long memory. This skill is the distilled workflow from that file, so a new video comes out right the first time instead of being rediscovered.

Reply in the language of the owner's latest message (usually Indonesian). Scripts, on-screen text and captions stay in English.

## Before anything

1. Read the "Current state" table and the newest video section in `HANDOVER.md`, so you know what exists and what is still open.
2. Read `~/.claude/youtube/voice.md` (the channel's voice profile) before writing words that will be spoken.
3. Find out which stage the owner is at. The stages below are gates: each one ends by sending the owner something and waiting. Do not jump ahead (no full render before frames are approved, no sound before that, no captions before the video is settled), because every past rework came from skipping a gate.

## The stages

| # | Stage | Ends with | Details |
|---|---|---|---|
| 1 | Topic and facts | the picks, each checked against its own source | `references/script-and-hook.md` |
| 2 | Script and hook | the script in a copy block, top two hooks with scores | `references/script-and-hook.md` |
| 3 | Animation and review frames | 4 review sheets sent with SendUserFile | `references/animation.md` |
| 4 | Voice take | timing measured and matched, sheets re-rendered | `references/voice-and-sound.md` |
| 5 | Sound, music, full render | `out/<name>.mp4` sent, levels and specs checked | `references/voice-and-sound.md` |
| 6 | Captions | title, description, Reels, TikTok, saved in HANDOVER | `references/captions.md` |
| 7 | Record it | HANDOVER.md updated at every stage | below |

Read the reference file for the stage you are in before doing the work; each holds the numbers and traps that past videos paid for.

## Rules that hold across every stage

These come from the owner's own decisions. They explain the why so you can apply them to cases this list does not name.

- **Never invent a fact.** Every claim about a skill (what it does, its install line, a number) comes from the skill's own README or SKILL.md, read that day, and the date goes into HANDOVER. Illustrations on screen (a fake prompt bar, a made-up CLAUDE.md) are fine but are never said as measurements. The channel's promise is "honest results"; one invented number breaks it.
- **Nothing is "done" until it was checked, and say what was not.** Nobody on this side can hear audio, so sync and balance are always "not confirmed by ear" until the owner says so. Skills and install lines are "not run" until someone runs them.
- **Each video gets a new style and new sets, but the same animation pattern.** New look, new places, new story device (game, trailer, comic, ad...). The motion stays the superpowers pattern: full-screen scenes with hard cuts, one big acting stickman, `CUTS`/`PLACE`/`POSES`, captions at the top. Check the list of past styles in HANDOVER before choosing.
- **At most 35 seconds,** voice plus tail. That means about 75 to 82 words of script.
- **Steady frame.** No ambient wobble; about three camera shakes per video, only on hits.
- **Real actions look real.** If he sleeps, sits or lifts, the face, eyes and body agree with it.
- **Topics stay in the niche:** AI coding skills and habits, tested or explained by the stickman, in English.
- **The owner decides** recaps vs new material, hook choice, approval of frames and sync. Ask with `wrap_up` (one question, buttons) at the end of each stage instead of guessing.

## Project map (what to reuse)

- Shared, do not change their behaviour: `Caption` (pass `plain`), `Sfx`, `enter`, `CLAMP`, `cameraTransform` in `src/Composition.tsx`; `Stickman`, `blendPoses`, `Pose` in `src/Stickman.tsx`; colours and `FPS` in `src/theme.ts`.
- Closest model for a new video: `src/starter/` (`lines.ts` timing table, `Sets.tsx` drawings, `StarterVideo.tsx` timeline, review `Frames`, `Soundtrack`). `src/superpowers/` is the original pattern.
- Each video: its own folder `src/<name>/`, its own `public/voice-<name>.mp3`, compositions `<Name>` and `<Name>Frames` registered in `src/Root.tsx`.
- Sound: `scripts/make-sfx.mjs` synthesizes every effect and bed into `public/sfx/`. Review sheets go only in `out/frame-video/<name>-frames/`.
- Bundled helpers in this skill: `scripts/voice_stretches.mjs` (speech stretches from a take) and `scripts/rms.mjs` (speech loudness of WAV files).

## Recording in HANDOVER.md

After each stage, update HANDOVER.md so the next session can continue: the row in "Current state", and the video's own section (picks and sources, script, hook scores, timing source, scenes, sound levels, captions, what is checked and what is not, traps for when the voice changes). Write dates as absolute dates. Plain, short sentences; say plainly what was not verified.

## Closing each turn

Send deliverables as they are made (SendUserFile for sheets and the MP4). End with a short message in the owner's language: what changed, what was checked, what was not, and the one decision that is theirs next.
