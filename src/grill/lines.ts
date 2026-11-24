// [start, length] in seconds of each stretch of speech in public/voice-grill.mp3 (the owner's ElevenLabs take, voice
// Lucan Rook, 2026-11-18; original kept in voice-raw/voice-grill.mp3), measured from its pauses:
//   npx remotion ffmpeg -i public/voice-grill.mp3 -af silencedetect=noise=-35dB:d=0.12 -f null -
// The take has 29 stretches and the script breaks into 29 phrases at its commas and full stops. They were matched by
// count and length; nobody on this side has listened to it. Re-measure if the voice file changes: every cue and END
// derive from this table.
export const VOICE = {
  file: "voice-grill.mp3" as string | null,
  seconds: 42.11,
  lines: {
    never: [0.0, 2.3], // Your AI never asks questions.
    skill: [2.6, 3.38], // This one skill makes it interrogate you before it writes a line.
    say: [6.37, 0.53], // You say:
    tracker: [7.02, 1.19], // build me a habit tracker.
    sure: [8.61, 1.04], // It says: sure!
    later: [10.06, 0.83], // Ten minutes later...
    wrong: [11.3, 0.96], // you have the wrong app.
    install: [12.65, 0.79], // In Claude Code,
    type: [13.62, 0.2], // type
    slash: [13.96, 1.41], // slash plugin install,
    matt: [15.62, 1.27], // mattpocock skills.
    then: [17.22, 1.39], // Then slash grill-me,
    plan: [18.88, 0.56], // and your plan.
    inter: [19.88, 1.72], // Now it is an interrogation.
    numbered: [22.2, 1.46], // Every question comes numbered,
    best: [23.86, 1.28], // with its own best answer.
    yes: [25.53, 0.7], // Say yes...
    fight: [26.54, 0.65], // or fight it.
    lookup: [27.65, 1.01], // Anything it can look up,
    finds: [28.87, 1.07], // it finds out itself,
    instead: [30.08, 0.99], // instead of asking you.
    stops: [31.45, 2.2], // It only stops when nothing is left to guess.
    waits: [33.99, 1.45], // Then it waits for your yes. (two stretches, "Then" and the rest)
    same: [35.83, 0.75], // Same idea.
    right: [36.86, 0.6], // Right app.
    because: [37.73, 0.75], // Because this time,
    asked: [38.7, 1.38], // the AI asked first.
    most: [40.45, 1.48], // Most AIs never ask.
  },
} as const;
