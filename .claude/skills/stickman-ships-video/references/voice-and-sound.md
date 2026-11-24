# Stages 4 and 5: voice take, sound, music, render

## 4. Voice take

1. Copy the owner's MP3 to `public/voice-<name>.mp3` (keep the original name in HANDOVER).
2. List the speech stretches:

   ```bash
   node .claude/skills/stickman-ships-video/scripts/voice_stretches.mjs public/voice-<name>.mp3
   ```

   It prints the duration and every stretch between pauses (-35 dB, 0.12 s), then the shorter word gaps (-30 dB, 0.05 s). If the take runs past about 34 s, keep it in `voice-raw/` and use `node scripts/trim-voice.mjs <in> <out> 0.4 1.06`, or ask for a shorter take.
3. **Match stretches to phrases.** If the counts are equal, match in order and say so. If not, find which phrases merged or split by comparing lengths with word counts, and say which were inferred.
4. Write the measured `[start, length]` pairs into `lines.ts`, set `file`, `seconds`, and change "ESTIMATES" to "MEASURED" with the take's name and date.
5. Set the shares of in-phrase cues ("ate", "build", "because") from the word gaps, not from guesses.
6. Re-check every move that must fit before a cut (see the traps in `animation.md`), re-render all four sheets, look at them, and send them.

## 5. Sound and music (only after the owner approves the frames)

**Voice level.** Remotion's ffmpeg has no `volumedetect`. Decode to WAV and measure speech RMS:

```bash
npx remotion ffmpeg -hide_banner -loglevel error -y -i public/voice-<name>.mp3 -c:a pcm_s16le <scratch>/voice.wav
node .claude/skills/stickman-ships-video/scripts/rms.mjs <scratch>/voice.wav <scratch>/voice-grill.wav
```

Compare with an earlier take whose volume is known (grill-me: about -23.3 dB, plays at 1.2) and set the new voice volume so it lands near the same level.

**Music bed.** Add `makeBed("bgm-<name>", <video length + 0.5>, <bpm>, [chords])` at the end of `scripts/make-sfx.mjs`, just before `console.log("sfx ok")`. New sounds always go last: the noise generator is seeded, so inserting earlier changes every later sound. Hash `public/sfx/*.wav` before and after (`md5sum`) and confirm only the new file changed. Pick chords and tempo that fit the video's style and differ from the earlier beds.

Measure the bed's RMS too and set its volume so it sits about 15 dB under the voice (bed volume = 10^((voice dB - 15 - bed dB) / 20)). A short fade in over 8 frames; for a looping video, let it end low instead of fading to silence.

**Effects.** About 30 cues of about 13 kinds from `public/sfx` (pop, chime, whoosh, stamp, impact, paper, check, click, thud0-3, error, sparkle, ding, womp, crickets, key0-3, sweep, beep). Few and varied: no sound on every scene change, one item-get sound is fine as a motif. A sound on each camera shake. Nothing on the last word of a looping video. Use `<Sfx name from volume />`; a looping ambience goes in a `<Sequence durationInFrames>` with `<Audio loop>`.

## Render and check

```bash
npx tsc --noEmit
npx remotion render <Name> out/<name>.mp4 --log=error
npx remotion ffprobe -hide_banner out/<name>.mp4
```

Check 1080x1920, 30 fps, audio track present, length at most 35 s. Decode the render to WAV and run `rms.mjs` for the peak: below about -1 dB means no clipping. Send the MP4 with SendUserFile and ask the owner to confirm sync by ear. Record levels, cue count and what is unheard in HANDOVER.
