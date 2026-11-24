// [start, length] in seconds of each phrase, MEASURED on the owner's take of script v2 (ElevenLabs, Lucan Rook - Energetic Male,
// 2026-11-21, 34.43 s, "ElevenLabs_2026-11-21T10_34_26_Lucan Rook  - Energetic Male_pvc_s50_sim75_v4.mp3").
// 25 speech stretches at -35dB, d=0.12, matched in order to 23 phrases: "Raise money, / or cut costs?" and
// "Ask / how anything works." each split in two at a pause. Word starts come from the gaps at -30dB, d=0.05.
//   node .claude/skills/stickman-ships-video/scripts/voice_stretches.mjs public/voice-penthouse-v2.mp3
// Keys match src/penthouse/lines.ts so the same scenes play; single-word cues have length 0.
export const VOICE = {
  file: "voice-penthouse-v2.mp3" as string | null,
  seconds: 34.43,
  lines: {
    hook: [0.13, 2.77], // Why pay a tutor, advisor or researcher
    teachW: [0.78, 0], // "a tutor" (gap 0.69-0.78)
    advise: [1.6, 0], // "advisor", estimated between the gaps
    readW: [2.2, 0], // "or researcher", estimated
    read: [3.02, 2.09], // before you try these five Claude skills?
    five: [3.7, 1.41], // "five Claude skills?"; the clap lands on "skills" (gap 4.34-4.40)
    how: [4.9, 0.21], // not spoken: the arms open at the end of the hook
    one: [5.6, 0.28], // One:
    cos: [6.3, 0.76], // chief of staff.
    ask: [7.57, 1.69], // Raise money, / or cut costs?
    right: [9.63, 1.48], // Advisors answer as one.
    answers: [10.34, 0], // "as one" (gap 10.24-10.34)
    two: [11.7, 0.28], // Two:
    anatomy: [12.37, 0.47], // anatomy.
    idea: [13.35, 1.37], // Ask / how anything works.
    machine: [15.03, 0.82], // Get a moving machine.
    three: [16.43, 0.34], // Three:
    teach: [17.25, 0.4], // teach.
    folder: [18.09, 0.63], // Pick a topic.
    lessons: [19.03, 1.15], // It remembers your place.
    four: [20.65, 0.39], // Four:
    psych: [21.37, 1.12], // marketing psychology.
    why: [23.01, 2.77], // Why don't visitors buy? It names the bias.
    fiveL: [26.26, 0.44], // Five:
    days: [27.02, 1.06], // last thirty days.
    topic: [28.43, 0.8], // A month of Reddit,
    brief: [29.46, 1.01], // one cited brief.
    cmds: [30.91, 1.06], // Commands in the caption.
    follow: [32.44, 1.82], // Follow Stickman Ships, because... (runs into the first line on replay)
  },
  // Word-by-word captions: [start second, text]. Starts at measured stretch starts or word gaps; the rest are estimates.
  chunks: [
    [0.15, "WHY PAY"],
    [0.78, "A TUTOR,"],
    [1.6, "ADVISOR"],
    [2.2, "OR RESEARCHER"],
    [3.02, "BEFORE YOU TRY"],
    [3.7, "THESE FIVE"],
    [4.14, "CLAUDE SKILLS?"],
    [5.6, "ONE:"],
    [6.3, "chief-of-staff"],
    [7.57, "RAISE MONEY,"],
    [8.33, "OR CUT COSTS?"],
    [9.63, "ADVISORS ANSWER"],
    [10.34, "AS ONE."],
    [11.7, "TWO:"],
    [12.37, "anatomy"],
    [13.35, "ASK HOW"],
    [13.91, "ANYTHING WORKS."],
    [15.03, "GET A MOVING"],
    [15.5, "MACHINE."],
    [16.43, "THREE:"],
    [17.25, "teach"],
    [18.09, "PICK A TOPIC."],
    [19.03, "IT REMEMBERS"],
    [19.8, "YOUR PLACE."],
    [20.65, "FOUR:"],
    [21.37, "marketing-"],
    [21.85, "psychology"],
    [23.01, "WHY DON'T"],
    [23.46, "VISITORS BUY?"],
    [24.65, "IT NAMES"],
    [25.2, "THE BIAS."],
    [26.26, "FIVE:"],
    [27.02, "last30days"],
    [28.43, "A MONTH"],
    [28.8, "OF REDDIT,"],
    [29.46, "ONE CITED"],
    [30.17, "BRIEF."],
    [30.91, "COMMANDS"],
    [31.35, "IN THE CAPTION."],
    [32.44, "FOLLOW"],
    [32.99, "STICKMAN SHIPS,"],
    [33.78, "BECAUSE..."],
  ] as [number, string][],
} as const;
