// The second each script line starts in public/voice-leaks.mp3, measured from its pauses
// (npx remotion ffmpeg -i public/voice-leaks.mp3 -af silencedetect=noise=-35dB:d=0.12 -f null -).
// Re-measure if the voice file changes.
export const VOICE = {
  seconds: 52.11,
  lines: {
    h1: 0.13, // Your AI is leaking tokens.
    h2: 3.19, // Three leaks.
    h3: 4.21, // Three skills.
    h4: 5.37, // Here's what each one does.
    a1: 6.81, // Skill one: Caveman.
    a2: 8.72, // It makes your AI answer in short, blunt sentences.
    a3: 12.11, // Type slash caveman.
    a4: 13.92, // Your code stays exact.
    a5: 15.67, // JetBrains measured it: eight and a half percent fewer output tokens.
    a6: 19.39, // Small leak, easy patch.
    b1: 21.31, // Skill two: Caveman compress.
    b2: 23.9, // Your AI reads your memory file at the start of every session.
    b3: 27.34, // This rewrites it shorter.
    b4: 28.8, // Type slash caveman compress, then the file name.
    b5: 32.05, // It keeps a backup.
    c1: 33.32, // Skill three: Handoff.
    c2: 35.33, // A long chat gets read again on every message.
    c3: 38.48, // Type slash handoff.
    c4: 40.23, // It packs the whole chat into one note.
    c5: 42.63, // Open a new session, and carry on from there.
    e1: 45.03, // Three skills.
    e2: 46.06, // One command each, in the caption.
    e3: 48.25, // Follow Stickman Ships.
    e4: 49.74, // I fix the leaks.
    e5: 50.88, // You keep the tokens.
  },
} as const;
