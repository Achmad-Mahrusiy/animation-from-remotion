// [start, length] in seconds of each phrase, MEASURED on the owner's take (ElevenLabs, Lucan Rook - Energetic Male,
// 2026-11-21, 34.59 s, "ElevenLabs_2026-11-21T06_40_00_Lucan Rook  - Energetic Male_pvc_s50_sim75_v4.mp3").
// 25 speech stretches at -35dB, d=0.12, matched in order to 25 phrases; only the first sentence splits in two (gap 2.91-3.06).
//   node .claude/skills/stickman-ships-video/scripts/voice_stretches.mjs public/voice-penthouse.mp3
// Cues inside a phrase (the `share` in PenthouseVideo.tsx) come from the word gaps at -30dB, d=0.05.
export const VOICE = {
  file: "voice-penthouse.mp3" as string | null,
  seconds: 34.59,
  lines: {
    hook: [0.13, 2.79], // What if your AI could teach you, advise you,
    read: [3.06, 1.57], // and read the last thirty days?
    five: [5.14, 0.79], // Five skills.
    how: [6.24, 0.45], // Here's how.
    one: [7.17, 0.26], // One:
    cos: [7.86, 0.77], // chief of staff.
    ask: [9.1, 1.08], // Ask a business question.
    right: [10.57, 1.44], // The right advisor answers.
    two: [12.45, 0.28], // Two:
    anatomy: [13.09, 0.51], // anatomy.
    idea: [14.01, 1.07], // Name one idea.
    machine: [15.42, 1.21], // You get a moving machine.
    three: [17.2, 0.3], // Three:
    teach: [17.92, 0.4], // teach.
    folder: [18.65, 1.39], // Run it in its own folder.
    lessons: [20.33, 1.2], // It remembers your lessons.
    four: [21.96, 0.39], // Four:
    psych: [22.6, 1.14], // marketing psychology.
    why: [24.14, 2.31], // Ask why buyers hesitate on your page.
    fiveL: [26.85, 0.41], // Five:
    days: [27.57, 1.08], // last thirty days.
    topic: [28.95, 0.67], // One topic.
    brief: [29.8, 1.04], // One cited brief.
    cmds: [31.2, 1.07], // Commands in the caption.
    follow: [32.7, 1.67], // Follow Stickman Ships, because... (runs into the first line on replay)
  },
} as const;
