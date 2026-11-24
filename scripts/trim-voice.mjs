// Shortens every pause longer than maxPause in a voice file, then speeds the result up by tempo.
// Usage: node scripts/trim-voice.mjs in.mp3 out.mp3 [maxPause=0.4] [tempo=1]
// shortcut: paths are passed to a shell unquoted, so they must not contain spaces.
import { spawnSync } from "node:child_process";

const [input, output, maxPause = "0.4", tempo = "1"] = process.argv.slice(2);
if (!input || !output) throw new Error("usage: trim-voice.mjs in.mp3 out.mp3 [maxPause] [tempo]");
const half = Number(maxPause) / 2;

const run = (tool, args) => {
  const result = spawnSync("npx", ["remotion", tool, "-hide_banner", ...args], { encoding: "utf8", shell: true });
  if (result.status !== 0) throw new Error(result.stderr);
  return result;
};
const seconds = (file) =>
  Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).stdout);

const total = seconds(input);
const log = run("ffmpeg", ["-nostats", "-i", input, "-af", "silencedetect=noise=-35dB:d=0.12", "-f", "null", "-"]).stderr;
const pauses = [...log.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)]
  .map((m) => [Number(m[1]) - Number(m[2]), Number(m[1])])
  .filter(([start, end]) => end - start > Number(maxPause) && start > 0.05 && end < total - 0.05);

// Keep everything except the middle of each long pause.
const keep = [];
let cursor = 0;
for (const [start, end] of pauses) {
  keep.push([cursor, start + half]);
  cursor = end - half;
}
keep.push([cursor, total]);

const parts = keep.map(([a, b], i) => `[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS[s${i}]`);
const graph = `${parts.join(";")};${keep.map((_, i) => `[s${i}]`).join("")}concat=n=${keep.length}:v=0:a=1,atempo=${tempo}[out]`;
run("ffmpeg", ["-y", "-loglevel", "error", "-i", input, "-filter_complex", `"${graph}"`, "-map", `"[out]"`, output]);

const cut = pauses.reduce((sum, [start, end]) => sum + end - start - Number(maxPause), 0);
const expected = (total - cut) / Number(tempo);
const actual = seconds(output);
// Self-check: the new length must match the length worked out from the cuts.
if (Math.abs(actual - expected) > 0.3) throw new Error(`expected ${expected.toFixed(2)} s, got ${actual.toFixed(2)} s`);
console.log(`${total.toFixed(2)} s -> ${actual.toFixed(2)} s, ${pauses.length} pauses shortened`);
