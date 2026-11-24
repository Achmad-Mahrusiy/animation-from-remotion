// [start, length] in seconds of each phrase, MEASURED on the owner's take (ElevenLabs, Lucan Rook - Energetic Male,
// 2026-11-23, 30.75 s, "ElevenLabs_2026-11-23T08_15_08_Lucan Rook  - Energetic Male_pvc_s50_sim75_v4.mp3").
// 23 speech stretches at -35dB, d=0.12, matched in order to 21 phrases. Two phrases split at a pause, inferred from
// their lengths: "loaded / only when needed" (gap 22.15-22.27) and "Twice can double / everything" (gap 26.54-26.69).
//   node .claude/skills/stickman-ships-video/scripts/voice_stretches.mjs public/voice-ecc.mp3
// Cues inside a phrase (the `share` in EccVideo.tsx) come from the word gaps at -30dB, d=0.05.
export const VOICE = {
  file: "voice-ecc.mp3" as string | null,
  seconds: 30.75,
  lines: {
    hook: [0.13, 2.04], // Why does your AI still code alone,
    agents: [2.38, 3.75], // when seventy-two agents could plan, test and review before it ships?
    ecc: [6.48, 1.18], // That's E C C.
    install: [7.97, 0.72], // One install,
    team: [8.92, 0.66], // a whole team.
    first: [10.11, 0.35], // First,
    plans: [10.63, 0.62], // it plans.
    slash: [11.46, 1.4], // Slash E C C plan.
    red: [13.36, 0.93], // Tests go red,
    green: [14.52, 0.6], // then green.
    review: [15.51, 2.11], // A reviewer with fresh eyes checks the work.
    save: [17.95, 0.75], // Save the session,
    resume: [18.9, 0.81], // resume it tomorrow.
    skills: [20.11, 1.54], // Three hundred twenty-eight skills,
    loaded: [21.83, 1.34], // loaded only when needed.
    catch: [23.51, 0.62], // One catch:
    once: [24.39, 0.94], // install it once.
    twice: [25.61, 1.52], // Twice can double everything.
    cmds: [27.6, 0.86], // Commands in the caption.
    follow: [28.86, 1.15], // Follow Stickman Ships,
    because: [30.14, 0.47], // because... (runs into the first line on replay)
  },
} as const;
