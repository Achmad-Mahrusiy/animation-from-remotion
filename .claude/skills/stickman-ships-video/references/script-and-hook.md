# Stages 1 and 2: topic, facts, script, hook

## 1. Topic and facts

**Finding skills.** `npx -y skills find "<keyword>"` searches the skills registry (strip colour codes with `sed 's/\x1b\[[0-9;]*m//g'`). Search several keywords in one command. Install counts in the output are that day's numbers; write the date next to them.

**Pick by these tests, in order:**

1. Read the skill's own SKILL.md or README (raw.githubusercontent.com, or the GitHub tree API to find the path). Keep only what the source actually says. A line like "saves tokens" needs the source to support it.
2. Works for a beginner from one command, without an account, OAuth, a second runtime, or hooks you must register by hand. Note Windows risks (`sh` scripts, `/tmp`).
3. New to the channel, by name *and* by topic: check every earlier video section in HANDOVER (the superpowers trailer already covers "test first, red then green", the compact video covers /compact, and so on) and the Schedule table, so you do not spend a topic that has its own planned video.
4. Each pick stops a different problem.

Tell the owner which candidates you rejected and why (one line each), and say how directly the picks deliver the promise. If all picks are recaps of earlier videos, flag it: whether a recap is fine is the owner's call.

## 2. Script

**Format:** English, ElevenLabs v3 tags in square brackets before a line (`[confident]`, `[deadpan]`, `[instructing]`). The owner generates the voice; recent takes use Lucan Rook (Energetic Male).

**Length:** about 75 to 82 words, which is about 31 to 33 s at the channel's pace (about 2.5 words a second). Count the words; never send a script over about 85. Spoken names should be short or spelled for the voice ("Claude M D improver"); on-screen captions show the real names.

**Shape (from the yt-script and yt-shorts skills, adapted to a 30 s short):**

- **Hook, first line:** the viewer's pain, said plainly, in the first 2 to 3 seconds, and it confirms what the title promises. No "Level one" scene-setting or channel intro before it; an earlier opener that took 4 s to say what the video was about was replaced.
- **Turn:** one sentence that says what the video will do ("Here's why, and five skills that stop it.").
- **Body:** one idea per beat, each something the animation can show. For a list: "One: name. One short line of what it does."
- **Payoff, said out loud:** "All five are in the caption."
- **One ask:** "Follow Stickman Ships". Two asks ("follow" and "install") is one too many.
- **Loop:** the last line runs into the first on replay ("Follow Stickman Ships, because..." -> "Your Claude Code tokens run out..."). Ask the owner to let the last line trail off in the take.

**Hook scoring is required, not optional.** Write at least five hooks against different formulas from `~/.claude/skills/yt-script/hooks.json`, put them one per line in a file in the scratchpad, and run:

```bash
python ~/.claude/skills/yt-script/hookscore.py hooks.txt
```

Improve the weakest property and score again. Show the owner the top two with their full panels (`--hook "line"` prints one) and say which formula won and why it fits. The scorer itself warns it separates bad hooks from good ones but not hits from misses; say that too. No invented numbers in hooks: a number must be real (the count of skills, a real install count) or left out.

**On-screen text for the first two seconds** uses different words from the spoken line (for example "OUT OF TOKENS. AGAIN?" while the voice says "Your Claude Code tokens run out before your app works").

## Hand-off

Send the script in one ```text block ready to paste into ElevenLabs, the word count, the expected length, the two hooks with scores, and any claim you could not verify. Record the script, scores and sources in HANDOVER.
