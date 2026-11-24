// [start, length] in seconds of each phrase, MEASURED on the owner's take (ElevenLabs, Lucan Rook - Energetic Male,
// 2026-11-19, 30.93 s). The take has 21 speech stretches and the script has 21 phrases, matched in order:
//   npx remotion ffmpeg -i public/voice-starter.mp3 -af silencedetect=noise=-35dB:d=0.12 -f null -
// Cues inside a phrase (the `share` in StarterVideo.tsx) come from the shorter word gaps at -30dB, d=0.05.
// Every cue and END derive from this table.
export const VOICE = {
  file: "voice-starter.mp3" as string | null,
  seconds: 30.93,
  lines: {
    hook: [0.0, 2.77], // Your Claude Code tokens run out before your app works.
    why: [3.07, 0.58], // Here's why,
    five: [3.83, 1.6], // and five skills that stop it.
    one: [5.85, 1.46], // One: session report.
    shows: [7.66, 2.04], // It shows which prompt ate your tokens.
    two: [10.1, 1.88], // Two: Claude M D improver.
    fixes: [12.3, 2.41], // It fixes the memory file it reads every session.
    three: [15.17, 1.2], // Three: research.
    side: [16.7, 2.62], // A side agent reads the docs and saves one note.
    four: [19.71, 1.13], // Four: prototype.
    test: [21.26, 1.78], // Test the idea before you build it.
    fiveD: [23.47, 1.75], // Five: diagnosing bugs.
    prove: [25.55, 0.6], // Prove the bug.
    fix: [26.41, 0.69], // Then fix it.
    all: [27.43, 1.2], // All five are in the caption.
    follow: [29.1, 1.67], // Follow Stickman Ships, because... (runs into the first line on replay)
  },
} as const;
