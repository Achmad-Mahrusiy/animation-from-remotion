# Stage 6: captions

The owner's rule (2026-11-16): creative, short, and every piece of information must match the video. So: a hook line or two, the install lines, the catch if there is one, and the credit. Facts only from what the video says or shows; no extra numbers, features or claims. Jokes are fine where nobody could read them as a fact.

## Verify install lines first

Read each install line from its source the same day: the plugin marketplace JSON (`anthropics/claude-plugins-official/.claude-plugin/marketplace.json`), the repo's `plugin.json` (does the pinned version include the skill?), or the README. Write in HANDOVER which were checked and that none was run. Leave out "how to call it after install" unless that was checked too.

## Title

Write about five titles ending in `#Shorts` and rank them:

```bash
python ~/.claude/skills/yt-package/title.py titles.txt
```

Prefer under 60 characters, a real number, and a subject that survives the mobile cut (about 38 characters).

## Templates

**YouTube description:**

```text
<hook line, same pain as the video>

1. <skill>: <what the video says it does>
...

Install in Claude Code:
<install lines, real case>

<credit: skills by ...>. Not affiliated with or sponsored by <authors>.
Animation, music and sound effects are original. AI voice: ElevenLabs.

#claudecode #aicoding #<topic>
```

**Reels:** a hook line in the video's own style, one line naming what it shows, the install lines, a short question, `#claudecode #aicoding #vibecoding`.

**TikTok:** shortest: hook line, install lines, question, `#claudecode #aicoding #vibecoding #programmer`. Remind the owner to turn on TikTok's AI label, because the voice is realistic.

## Platform rules

- Upload the clean MP4 to each platform; never reuse a watermarked download. Keep the original audio.
- YouTube: animation needs no synthetic-content label; avoid templated, interchangeable videos (each needs its own story).
- If the ElevenLabs plan is free, "elevenlabs.io" must be in the title (plan still unknown, see HANDOVER).
- Handles: Instagram @stickmanships, TikTok @stickmanship (no "s"), YouTube @StickmanShips.

Save all captions in the video's section of HANDOVER and show them to the owner in copy blocks.
