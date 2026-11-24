// [start, length] in seconds of each stretch of speech in public/voice-compact.mp3 (the owner's ElevenLabs take, voice Roger),
// measured from its pauses:
//   npx remotion ffmpeg -i public/voice-compact.mp3 -af silencedetect=noise=-35dB:d=0.12 -f null -
// The take has 18 stretches and the script has 16 sentences plus two comma breaks. They were matched by count and length;
// nobody on this side has listened to it. Re-measure if the voice file changes: every cue and END derive from this table.
export const VOICE = {
  file: "voice-compact.mp3",
  seconds: 31.24,
  lines: {
    one: [0.16, 4.22], // One command just re-read three hundred forty-eight thousand tokens.
    compact: [4.82, 1.15], // Slash compact.
    chat: [6.4, 2.03], // On a chat I left fourteen hours ago.
    read: [9.02, 1.23], // To summarize your chat,
    hasTo: [10.44, 1.32], // it has to read all of it.
    work: [12.23, 0.69], // While you work,
    cached: [13.11, 1.14], // that chat is cached.
    hot: [14.58, 0.32], // Hot.
    cheap: [15.29, 0.61], // Cheap to read.
    leave: [16.35, 2.52], // Leave it for hours, and the cache goes cold.
    again: [19.2, 1.74], // It processes everything again.
    rule: [21.33, 2.06], // So compact before you walk away.
    notAfter: [23.65, 0.68], // Not after.
    done: [24.81, 0.72], // Done with that chat?
    clear: [25.85, 0.73], // Slash clear.
    nothing: [26.88, 0.68], // Costs nothing.
    follow: [27.96, 1.14], // Follow Stickman Ships.
    strike: [29.4, 1.64], // Strike while the cache is hot.
  },
} as const;
