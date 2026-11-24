// RMS (dBFS) of speech in 16-bit PCM WAV files; frames under -45 dB count as silence and are skipped.
import fs from "node:fs";
for (const path of process.argv.slice(2)) {
  const buf = fs.readFileSync(path);
  let off = 12, dataOff = 0, dataLen = 0, channels = 1;
  while (off < buf.length - 8) {
    const id = buf.toString("ascii", off, off + 4), size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") channels = buf.readUInt16LE(off + 10);
    if (id === "data") { dataOff = off + 8; dataLen = Math.min(size, buf.length - dataOff); break; }
    off += 8 + size + (size % 2);
  }
  const n = Math.floor(dataLen / 2), win = 2205 * channels;
  let sum = 0, count = 0, peak = 0;
  for (let i = 0; i + win <= n; i += win) {
    let s = 0;
    for (let j = 0; j < win; j++) { const v = buf.readInt16LE(dataOff + 2 * (i + j)) / 32768; s += v * v; peak = Math.max(peak, Math.abs(v)); }
    if (10 * Math.log10(s / win + 1e-12) > -45) { sum += s; count += win; }
  }
  console.log(path.split(/[\\/]/).pop(), "speech RMS", (10 * Math.log10(sum / count)).toFixed(1), "dB, peak", (20 * Math.log10(peak)).toFixed(1), "dB");
}
