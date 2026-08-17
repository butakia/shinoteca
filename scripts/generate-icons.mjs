import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function iconSvg(padding = 0) {
  const inner = 512 - padding * 2;
  const r = inner * 0.22;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e11d2f"/>
        <stop offset="100%" stop-color="#5a0a10"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="512" height="512" fill="#000000"/>
    <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${r}" fill="url(#g)"/>
    <g transform="translate(256 256)">
      <path d="M -70 40 L -70 -50 L 60 -75 L 60 15" stroke="white" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="-70" cy="55" r="26" fill="white"/>
      <circle cx="60" cy="30" r="26" fill="white"/>
    </g>
  </svg>`;
}

async function run() {
  await sharp(Buffer.from(iconSvg(0))).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"));
  await sharp(Buffer.from(iconSvg(0))).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));
  await sharp(Buffer.from(iconSvg(60))).resize(512, 512).png().toFile(path.join(outDir, "icon-maskable-512.png"));
  console.log("icons written");
}

run();
