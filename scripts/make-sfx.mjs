// Synthesizes every sound effect and the music bed into public/sfx, so the video needs no licensed audio.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const OUT = "public/sfx";
mkdirSync(OUT, { recursive: true });

let seed = 20261109;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 2 ** 32) * 2 - 1;
};
const make = (sec, fn) =>
  Float64Array.from({ length: Math.round(sec * SR) }, (_, i) => fn(i / SR));
const lowpass = (x, cutoff) => {
  let y = 0;
  return x.map((v, i) => {
    const hz = typeof cutoff === "function" ? cutoff(i / SR) : cutoff;
    y += (1 - Math.exp((-2 * Math.PI * hz) / SR)) * (v - y);
    return y;
  });
};
const highpass = (x, cutoff) => {
  const low = lowpass(x, cutoff);
  return x.map((v, i) => v - low[i]);
};
const glide = (sec, f0, f1, env) => {
  let phase = 0;
  return make(sec, (t) => {
    phase += (2 * Math.PI * (f0 + (f1 - f0) * Math.min(t / sec, 1))) / SR;
    return Math.sin(phase) * env(t);
  });
};
const mix = (out, x, atSec = 0, gain = 1) => {
  const start = Math.round(atSec * SR);
  for (let i = 0; i < x.length && start + i < out.length; i++) {
    out[start + i] += x[i] * gain;
  }
  return out;
};
const empty = (sec) => new Float64Array(Math.round(sec * SR));
const bell = (hz, sec, decay = 7) =>
  make(
    sec,
    (t) =>
      Math.min(t / 0.004, 1) *
      Math.exp(-t * decay) *
      (Math.sin(2 * Math.PI * hz * t) +
        0.35 * Math.sin(4 * Math.PI * hz * t) +
        0.15 * Math.sin(6 * Math.PI * hz * t)),
  );

const save = (name, x, peak = 0.9) => {
  const max = x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  assert.ok(Number.isFinite(max) && max > 0, `${name} is silent or invalid`);
  const pcm = Buffer.alloc(44 + x.length * 2);
  pcm.write("RIFF", 0);
  pcm.writeUInt32LE(36 + x.length * 2, 4);
  pcm.write("WAVEfmt ", 8);
  pcm.writeUInt32LE(16, 16);
  pcm.writeUInt16LE(1, 20);
  pcm.writeUInt16LE(1, 22);
  pcm.writeUInt32LE(SR, 24);
  pcm.writeUInt32LE(SR * 2, 28);
  pcm.writeUInt16LE(2, 32);
  pcm.writeUInt16LE(16, 34);
  pcm.write("data", 36);
  pcm.writeUInt32LE(x.length * 2, 40);
  x.forEach((v, i) =>
    pcm.writeInt16LE(Math.round((v / max) * peak * 32767), 44 + i * 2),
  );
  assert.equal(pcm.length, 44 + x.length * 2);
  writeFileSync(`${OUT}/${name}.wav`, pcm);
};

const white = (sec) => make(sec, () => noise());
const sweepNoise = (sec, from, to, env) =>
  lowpass(white(sec), (t) => from + (to - from) * (t / sec)).map(
    (v, i) => v * env(i / SR),
  );

save(
  "whoosh",
  sweepNoise(0.34, 500, 5200, (t) => Math.sin((Math.PI * t) / 0.34) ** 2),
  0.8,
);
save("pop", glide(0.11, 980, 260, (t) => Math.exp(-t * 34)));
save("paper", highpass(sweepNoise(0.2, 2500, 7000, (t) => Math.exp(-t * 18)), 1200));

[0, 1, 2, 3].forEach((i) => {
  const click = highpass(white(0.06), 2200 + i * 500).map(
    (v, n) => v * Math.exp((-n / SR) * 170),
  );
  save(
    `key${i}`,
    mix(click, glide(0.06, 210 + i * 35, 120, (t) => Math.exp(-t * 80)), 0, 0.8),
    0.75,
  );
  save(
    `thud${i}`,
    mix(
      glide(0.26, 190 + i * 45, 80 + i * 22, (t) => Math.exp(-t * 15)),
      lowpass(white(0.05), 1800).map((v, n) => v * Math.exp((-n / SR) * 60)),
      0,
      1.2,
    ),
  );
});

const check = empty(0.34);
mix(check, bell(1046.5, 0.2, 18));
save("check", mix(check, bell(1568, 0.24, 13), 0.075));

save(
  "click",
  mix(
    glide(0.1, 320, 120, (t) => Math.exp(-t * 42)),
    highpass(white(0.025), 2600),
    0,
    0.5,
  ),
);

const sweep = sweepNoise(0.95, 300, 8200, (t) => Math.min(t / 0.8, 1) ** 2 * Math.min((0.95 - t) / 0.05, 1));
save("sweep", mix(sweep, glide(0.95, 220, 1500, (t) => 0.4 * Math.min(t / 0.8, 1) * Math.min((0.95 - t) / 0.05, 1))), 0.75);

const sparkle = empty(0.9);
[1318.5, 1568, 2093, 2637, 3136].forEach((hz, i) =>
  mix(sparkle, bell(hz, 0.55, 8), i * 0.055, 1 - i * 0.1),
);
save("sparkle", sparkle, 0.7);

save(
  "womp",
  lowpass(
    make(0.62, (t) => {
      const hz = 150 - 70 * Math.min(t / 0.62, 1);
      return (
        Math.sign(Math.sin(2 * Math.PI * hz * t)) *
        Math.min(t / 0.015, 1) *
        Math.exp(-t * 3.4)
      );
    }),
    700,
  ),
);

const buzz = empty(0.34);
[0, 0.17].forEach((at) =>
  mix(
    buzz,
    lowpass(
      make(0.14, (t) => Math.sign(Math.sin(2 * Math.PI * 148 * t)) * Math.min((0.14 - t) / 0.01, 1)),
      1300,
    ),
    at,
  ),
);
save("error", buzz, 0.7);

const ding = empty(0.8);
mix(ding, bell(1318.5, 0.75, 6));
save("ding", mix(ding, bell(1975.5, 0.7, 6), 0.09, 0.8));

save(
  "stamp",
  mix(
    glide(0.3, 130, 48, (t) => Math.exp(-t * 15)),
    lowpass(white(0.07), 3800).map((v, n) => v * Math.exp((-n / SR) * 55)),
    0,
    1.1,
  ),
);

const impact = glide(1.3, 92, 34, (t) => Math.exp(-t * 3.6));
save(
  "impact",
  mix(impact, lowpass(white(0.25), 1500).map((v, n) => v * Math.exp((-n / SR) * 22)), 0, 0.7),
);

const chime = empty(1.7);
[523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((hz, i) =>
  mix(chime, bell(hz, 1.45 - i * 0.05, 3), i * 0.07, 0.9),
);
save("chime", chime, 0.75);

// Music beds: original four-bar lo-fi loops, one per video.
const epiano = (hz, sec) =>
  make(
    sec,
    (t) =>
      Math.min(t / 0.012, 1) *
      Math.exp(-t * 1.5) *
      (1 + 0.14 * Math.sin(2 * Math.PI * 4.6 * t)) *
      (Math.sin(2 * Math.PI * hz * t) + 0.22 * Math.sin(4 * Math.PI * hz * t)),
  );
const kick = glide(0.24, 125, 44, (t) => Math.exp(-t * 15));
const snare = lowpass(highpass(white(0.17), 700), 4200).map(
  (v, n) => v * Math.exp((-n / SR) * 24),
);
const hat = highpass(white(0.04), 6000).map(
  (v, n) => v * Math.exp((-n / SR) * 120),
);

const makeBed = (name, LENGTH, bpm, CHORDS) => {
  const BEAT = 60 / bpm;
  const BAR = BEAT * 4;
  const keys = empty(LENGTH);
  const bass = empty(LENGTH);
  const drums = empty(LENGTH);

  for (let bar = 0; bar * BAR < LENGTH; bar++) {
    const start = bar * BAR;
    const { root, notes } = CHORDS[bar % CHORDS.length];
    notes.forEach((hz, i) => {
      mix(keys, epiano(hz, 2.4), start + i * 0.012, 0.24);
      mix(keys, epiano(hz * 2, 1.2), start + BEAT * 2.5 + i * 0.012, 0.08);
    });
    [0, 2].forEach((beat) =>
      mix(
        bass,
        make(BEAT * 1.6, (t) => Math.sin(2 * Math.PI * root * 2 * t) * Math.min(t / 0.01, 1) * Math.exp(-t * 1.4)),
        start + beat * BEAT,
        0.46,
      ),
    );
    if (bar < 2) continue;
    [0, 2.5].forEach((beat) => mix(drums, kick, start + beat * BEAT, 0.72));
    [1, 3].forEach((beat) => mix(drums, snare, start + beat * BEAT, 0.3));
    for (let eighth = 0; eighth < 8; eighth++) {
      const swing = eighth % 2 ? 0.05 : 0;
      mix(drums, hat, start + (eighth / 2) * BEAT + swing, eighth % 2 ? 0.1 : 0.16);
    }
  }

  const crackle = make(LENGTH, () => {
    const n = noise();
    return Math.abs(n) > 0.9994 ? n : 0;
  });
  const bed = lowpass(keys, 1900).map(
    (v, i) => v + bass[i] + drums[i] + crackle[i] * 0.3 + noise() * 0.003,
  );
  const fadeFrom = LENGTH - 1.6;
  save(
    name,
    bed.map((v, i) => v * Math.min(1, Math.max(0, (LENGTH - i / SR) / (LENGTH - fadeFrom)))),
    0.85,
  );
};

makeBed("bgm", 30.1, 90, [
  { root: 55, notes: [220, 261.63, 329.63, 392] },
  { root: 43.65, notes: [174.61, 220, 261.63, 329.63] },
  { root: 65.41, notes: [261.63, 329.63, 392, 493.88] },
  { root: 49, notes: [196, 246.94, 293.66, 329.63] },
]);

// Slower, jazzier ii-V-I-VI for the lazy senior dev.
makeBed("bgm-ponytail", 50.1, 76, [
  { root: 36.71, notes: [174.61, 220, 261.63, 329.63] },
  { root: 49, notes: [174.61, 246.94, 293.66, 329.63] },
  { root: 65.41, notes: [246.94, 329.63, 392, 493.88] },
  { root: 55, notes: [196, 277.18, 329.63, 440] },
]);

// AoT shorts: censor beep, crickets for awkward silence, and a bouncier bed.
save(
  "beep",
  make(0.5, (t) => Math.sin(2 * Math.PI * 1000 * t) * Math.min(t / 0.01, 1) * Math.min((0.5 - t) / 0.01, 1)),
  0.6,
);

const crickets = empty(1.8);
[0, 0.42, 0.9, 1.3].forEach((start) => {
  for (let pulse = 0; pulse < 3; pulse++) {
    mix(
      crickets,
      make(0.045, (t) => Math.sin(2 * Math.PI * 4600 * t) * Math.sin((Math.PI * t) / 0.045)),
      start + pulse * 0.06,
      0.9,
    );
  }
});
save("crickets", crickets, 0.5);

makeBed("bgm-aot", 60.1, 104, [
  { root: 65.41, notes: [261.63, 329.63, 392, 523.25] },
  { root: 55, notes: [220, 261.63, 329.63, 440] },
  { root: 43.65, notes: [174.61, 220, 261.63, 349.23] },
  { root: 49, notes: [196, 246.94, 293.66, 392] },
]);

// Caveman: low minor loop, mid tempo.
makeBed("bgm-caveman", 44.6, 92, [
  { root: 36.71, notes: [146.83, 174.61, 220, 293.66] },
  { root: 36.71, notes: [146.83, 174.61, 220, 261.63] },
  { root: 32.7, notes: [130.81, 164.81, 196, 261.63] },
  { root: 43.65, notes: [130.81, 174.61, 220, 261.63] },
]);

// Motion design: bright D major loop for the studio stage.
makeBed("bgm-motion", 51.6, 98, [
  { root: 36.71, notes: [185, 220, 277.18, 369.99] },
  { root: 30.87, notes: [220, 246.94, 293.66, 369.99] },
  { root: 49, notes: [196, 246.94, 293.66, 369.99] },
  { root: 55, notes: [220, 277.18, 329.63, 392] },
]);

// Superpowers: heroic I-V-vi-IV in C for the rooftop.
makeBed("bgm-superpowers", 37.1, 100, [
  { root: 65.41, notes: [261.63, 329.63, 392, 523.25] },
  { root: 49, notes: [196, 246.94, 293.66, 392] },
  { root: 55, notes: [220, 261.63, 329.63, 440] },
  { root: 43.65, notes: [174.61, 220, 261.63, 349.23] },
]);

// Token leaks comic: loose Em7 A7 Dmaj7 Gmaj7 shuffle.
makeBed("bgm-leaks", 57.6, 96, [
  { root: 41.2, notes: [164.81, 196, 246.94, 293.66] },
  { root: 55, notes: [220, 277.18, 329.63, 392] },
  { root: 36.71, notes: [146.83, 185, 220, 277.18] },
  { root: 49, notes: [196, 246.94, 293.66, 369.99] },
]);

// UI UX Pro Max: bright TV-jingle I-vi-IV-V in G for the ad studio.
makeBed("bgm-uiux", 56.6, 112, [
  { root: 49, notes: [196, 246.94, 293.66, 392] },
  { root: 41.2, notes: [164.81, 196, 246.94, 329.63] },
  { root: 65.41, notes: [261.63, 329.63, 392, 523.25] },
  { root: 36.71, notes: [220, 293.66, 369.99, 440] },
]);

// Compact video: steady Em-C-G-D for the forge.
makeBed("bgm-compact", 32.5, 88, [
  { root: 41.2, notes: [164.81, 196, 246.94, 329.63] },
  { root: 32.7, notes: [130.81, 164.81, 196, 261.63] },
  { root: 49, notes: [196, 246.94, 293.66, 392] },
  { root: 36.71, notes: [146.83, 185, 220, 293.66] },
]);

// Starter pack: bouncy I-IV-ii-V in F for the level-one adventure.
makeBed("bgm-starter", 31.6, 118, [
  { root: 43.65, notes: [174.61, 220, 261.63, 349.23] },
  { root: 58.27, notes: [233.08, 293.66, 349.23, 466.16] },
  { root: 49, notes: [196, 233.08, 293.66, 392] },
  { root: 65.41, notes: [261.63, 329.63, 392, 466.16] },
]);

// Penthouse tour: slow lounge Dmaj7-Bm7-Em7-A7 for the luxury rooms.
makeBed("bgm-penthouse", 35.2, 84, [
  { root: 36.71, notes: [146.83, 185, 220, 277.18] },
  { root: 61.74, notes: [246.94, 293.66, 369.99, 440] },
  { root: 41.2, notes: [164.81, 196, 246.94, 293.66] },
  { root: 55, notes: [220, 277.18, 329.63, 392] },
]);

// ECC cooking show: bright A-F#m-D-E at 108 bpm for the kitchen.
makeBed("bgm-ecc", 31.6, 108, [
  { root: 55, notes: [220, 277.18, 329.63, 440] },
  { root: 46.25, notes: [185, 220, 277.18, 369.99] },
  { root: 36.71, notes: [146.83, 185, 220, 293.66] },
  { root: 41.2, notes: [164.81, 207.65, 246.94, 329.63] },
]);

console.log("sfx ok");
