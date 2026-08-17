// Generates tiny synthetic sine-wave WAV files as placeholder demo audio.
// These are NOT real songs — just short tones so the player/queue/visualizer
// reservation area can be exercised end-to-end without shipping real audio.
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "music");
mkdirSync(outDir, { recursive: true });

function writeSineWav(filename, { freq, seconds, sampleRate = 44100 }) {
  const numSamples = Math.floor(seconds * sampleRate);
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * blockAlign, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  const attack = Math.floor(sampleRate * 0.05);
  const release = Math.floor(sampleRate * 0.3);
  for (let i = 0; i < numSamples; i++) {
    let envelope = 1;
    if (i < attack) envelope = i / attack;
    else if (i > numSamples - release) envelope = (numSamples - i) / release;
    const t = i / sampleRate;
    // light chord (fundamental + fifth) so it's not a pure annoying beep
    const sample =
      0.6 * Math.sin(2 * Math.PI * freq * t) +
      0.25 * Math.sin(2 * Math.PI * freq * 1.5 * t);
    const value = Math.max(-1, Math.min(1, sample * envelope * 0.5));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + i * blockAlign);
  }

  writeFileSync(path.join(outDir, filename), buffer);
  console.log(`wrote ${filename}`);
}

const tracks = [
  { filename: "demo-01.wav", freq: 220, seconds: 8 },
  { filename: "demo-02.wav", freq: 261.63, seconds: 8 },
  { filename: "demo-03.wav", freq: 293.66, seconds: 8 },
  { filename: "demo-04.wav", freq: 329.63, seconds: 8 },
  { filename: "demo-05.wav", freq: 349.23, seconds: 8 },
];

for (const track of tracks) writeSineWav(track.filename, track);
