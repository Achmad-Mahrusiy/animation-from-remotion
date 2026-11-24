# ECC video: script (stage 2)

Written 2026-11-23. Source: github.com/affaan-m/ECC README and repo tree, read 2026-11-23 (release 2.2.3).

## Facts used (each from the README unless noted)

| Line in script | Source |
|---|---|
| 72 agents, 328 skills | README table; also counted in the repo tree that day: 72 files in `agents/`, 328 `skills/*/SKILL.md`, 99 files in `commands/` |
| Plans first, `/ecc:plan` | "Start Using ECC": `/ecc:plan "describe the feature"`; plugin commands use the `ecc:` namespace |
| Tests go red, then green | "TDD becomes a gated RED -> GREEN -> REFACTOR workflow" (`tdd-workflow` skill) |
| Reviewer with fresh eyes | `/code-review` "for a fresh-context review"; "A fresh-context reviewer looks for regressions and blind spots" |
| Save the session, resume it tomorrow | `/save-session` and `/resume-session` (files `commands/save-session.md`, `commands/resume-session.md`) |
| Skills loaded only when needed | "Skills ... Loaded when the task needs them" |
| Install once; twice can double everything | "Do not stack install methods. Installing ECC twice into the same harness can duplicate skills, commands, hooks, or configuration" |

Install (for the caption, not run by anyone):

```text
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc
```

Needs Claude Code 2.1 or newer. The other official path is `npx ecc-universal@2.2.3 setup` (Node 18+, Git). Use only one. README warns: install only from the official repo, npm `ecc-universal`, plugin `ecc@ecc` or ecc.tools; mirrors may contain malware.

## Script (ElevenLabs v3, 79 words, about 32 s)

```text
[curious] Why does your AI still code alone, when seventy-two agents could plan, test and review before it ships?
[confident] That's E C C. One install, a whole team.
[instructing] First, it plans. Slash E C C plan.
Tests go red, then green.
[impressed] A reviewer with fresh eyes checks the work.
Save the session, resume it tomorrow.
[deadpan] Three hundred twenty-eight skills, loaded only when needed.
[warning] One catch: install it once. Twice can double everything.
[casual] Commands in the caption. Follow Stickman Ships, because...
```

On-screen text for the first 2 s (different words from the voice): `ONE AI. ZERO REVIEWERS.`

## Hooks (hookscore.py, 2026-11-23)

- A, chosen by the owner 2026-11-23: "Why does your AI still code alone, when 72 agents could plan, test and review before it ships?" The Question, 70 WORKABLE (specificity, stakes 62, curiosity 76, brevity 100).
- B: "Your AI codes alone, and nobody checks its work before it breaks your app. Why?" The Question, 64 WORKABLE (weakest: specificity 46).
- 16 hooks scored in all; the first round were all WEAK (stakes 22). The scorer separates bad hooks from good ones, not hits from misses.

## Notes

- Overlap: "plan, test red then green, review" is also in the superpowers trailer. ECC is new to the channel by name; the new parts are the size (72 agents, 328 skills), the fresh-context reviewer, save/resume session, and the install-once catch.
- Planned style for stage 3: a cooking-show kitchen brigade (head chef stickman, planner, taster, critic, recipe book as memory). Not used by any earlier video. The owner has not chosen it yet.
