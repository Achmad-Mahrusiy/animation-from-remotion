// List the speech stretches of a voice take, for matching them to the script's phrases.
//   node voice_stretches.mjs public/voice-<name>.mp3
// Prints the duration, the stretches between pauses (-35 dB, 0.12 s) and the shorter word gaps (-30 dB, 0.05 s).
// Uses Remotion's bundled ffmpeg, which has silencedetect (it lacks volumedetect).
import { execSync } from "node:child_process";

const file = process.argv[2];
if (!file) {
  console.error("usage: node voice_stretches.mjs <voice.mp3>");
  process.exit(1);
}

const silences = (noise, d) => {
  const out = execSync(`npx remotion ffmpeg -hide_banner -nostats -i "${file}" -af silencedetect=noise=${noise}:d=${d} -f null - 2>&1`, {
    encoding: "utf8",
    shell: true,
  });
  const duration = (() => {
    const m = out.match(/Duration: (\d+):(\d+):([\d.]+)/);
    return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : NaN;
  })();
  const starts = [...out.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...out.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  return { duration, gaps: starts.map((s, i) => [s, ends[i] ?? duration]) };
};

// Speech is everything between the gaps.
const stretchesOf = ({ duration, gaps }) => {
  const list = [];
  let from = 0;
  for (const [s, e] of gaps) {
    if (s - from > 0.05) list.push([from, s]);
    from = e;
  }
  if (duration - from > 0.05) list.push([from, duration]);
  return list;
};

const coarse = silences("-35dB", 0.12);
const stretches = stretchesOf(coarse);
console.log(`duration ${coarse.duration.toFixed(2)} s, ${stretches.length} speech stretches`);
stretches.forEach(([a, b], i) => console.log(`${String(i + 1).padStart(2)}  ${a.toFixed(2)} - ${b.toFixed(2)}  (${(b - a).toFixed(2)} s)`));

const fine = silences("-30dB", 0.05);
console.log("\nword gaps (-30 dB, 0.05 s):");
console.log(fine.gaps.map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join("  "));

// Self-check: stretches are increasing and inside the take.
for (let i = 0; i < stretches.length; i++) {
  const [a, b] = stretches[i];
  if (!(a < b && b <= coarse.duration + 0.01 && (i === 0 || a >= stretches[i - 1][1]))) {
    console.error(`stretch ${i + 1} is out of order: ${a}-${b}`);
    process.exit(2);
  }
}
