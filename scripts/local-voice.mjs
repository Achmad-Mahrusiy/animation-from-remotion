// Local voice for a script, one sentence per request, so the start of every sentence is known exactly.
// node scripts/local-voice.mjs <kokoro voice> <script.txt> <out.wav> [speed]
// The script file has one sentence per line; a blank line is a longer pause. voice-studio must be running (HANDOVER.md).
// shortcut: 16-bit mono WAV only, which is what voice-studio's Kokoro returns. Other formats stop with an error.
import assert from "node:assert";
import { readFileSync, writeFileSync } from "node:fs";

const [voice, scriptPath, outPath, speed = "1"] = process.argv.slice(2);
assert(voice && scriptPath && outPath, "usage: local-voice.mjs <voice> <script.txt> <out.wav> [speed]");
const API = "http://127.0.0.1:8880";
const GAP = 0.3; // seconds between sentences
const BREAK = 0.65; // seconds at a blank line
const EDGE = 0.03; // silence kept around each sentence
const QUIET = 400; // samples under this count as silence (16-bit)

const ready = async () => {
  for (let i = 0; i < 90; i++) {
    try {
      if ((await fetch(`${API}/api/health`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("voice-studio did not answer on " + API);
};

const speak = async (text) => {
  const res = await fetch(`${API}/api/synthesize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, speakers: [{ name: "Speaker 1", voice }], engine: "kokoro", speed: Number(speed) }),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  assert(res.ok && buf.toString("ascii", 0, 4) === "RIFF", `no WAV for "${text}": ${res.status} ${buf.toString("utf8", 0, 300)}`);
  let o = 12;
  let rate = 0;
  while (o + 8 <= buf.length) {
    const id = buf.toString("ascii", o, o + 4);
    const size = buf.readUInt32LE(o + 4);
    if (id === "fmt ") {
      assert(buf.readUInt16LE(o + 10) === 1 && buf.readUInt16LE(o + 22) === 16, "expected 16-bit mono");
      rate = buf.readUInt32LE(o + 12);
    }
    if (id === "data") {
      const n = Math.min(size, buf.length - o - 8) >> 1;
      const all = Int16Array.from({ length: n }, (_, i) => buf.readInt16LE(o + 8 + i * 2));
      let a = 0;
      let b = n - 1;
      while (a < n && Math.abs(all[a]) < QUIET) a++;
      while (b > a && Math.abs(all[b]) < QUIET) b--;
      assert(b > a, `silent result for "${text}"`);
      const pad = Math.round(EDGE * rate);
      return { rate, samples: all.subarray(Math.max(0, a - pad), Math.min(n, b + pad)) };
    }
    o += 8 + size + (size % 2);
  }
  throw new Error("no data chunk");
};

await ready();
const parts = [];
let pause = 0;
for (const line of readFileSync(scriptPath, "utf8").split(/\r?\n/)) {
  if (!line.trim()) {
    if (parts.length) pause = BREAK;
    continue;
  }
  parts.push({ text: line.trim(), pause, ...(await speak(line.trim())) });
  pause = GAP;
}
const rate = parts[0].rate;
assert(parts.every((p) => p.rate === rate), "sample rates differ");
const lead = Math.round(0.15 * rate);
let at = lead;
for (const p of parts) {
  at += Math.round(p.pause * rate);
  p.start = at;
  at += p.samples.length;
}
const total = at + Math.round(0.3 * rate);
const out = Buffer.alloc(44 + total * 2);
out.write("RIFF", 0);
out.writeUInt32LE(36 + total * 2, 4);
out.write("WAVEfmt ", 8);
out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20);
out.writeUInt16LE(1, 22);
out.writeUInt32LE(rate, 24);
out.writeUInt32LE(rate * 2, 28);
out.writeUInt16LE(2, 32);
out.writeUInt16LE(16, 34);
out.write("data", 36);
out.writeUInt32LE(total * 2, 40);
for (const p of parts) p.samples.forEach((s, i) => out.writeInt16LE(s, 44 + (p.start + i) * 2));
writeFileSync(outPath, out);
console.log(`${outPath}: ${(total / rate).toFixed(2)} s, ${rate} Hz, voice ${voice}, speed ${speed}`);
for (const p of parts) console.log(`${(p.start / rate).toFixed(2)}\t${(p.samples.length / rate).toFixed(2)}\t${p.text}`);
