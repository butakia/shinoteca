import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcLogo = path.join(__dirname, "..", "logo", "logo.png");
const outDir = path.join(__dirname, "..", "public", "brand");
const iconsDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });

async function run() {
  // full lockup (icon + wordmark), trimmed of transparent padding
  await sharp(srcLogo).trim().png().toFile(path.join(outDir, "logo-full.png"));

  // crop just the left icon/symbol portion, then trim its transparent margins
  const meta = await sharp(srcLogo).metadata();
  const iconRegionWidth = Math.round(meta.width * 0.285);
  const rawCrop = await sharp(srcLogo)
    .extract({ left: 0, top: 0, width: iconRegionWidth, height: meta.height })
    .png()
    .toBuffer();
  const iconBuffer = await sharp(rawCrop).trim().png().toBuffer();
  await sharp(iconBuffer).toFile(path.join(outDir, "logo-icon.png"));

  const iconMeta = await sharp(iconBuffer).metadata();
  console.log("icon crop size:", iconMeta.width, iconMeta.height);

  // square favicons: symbol only, centered on transparent (any) canvas, padded
  async function squareIcon(size, background) {
    const pad = Math.round(size * 0.16);
    const inner = size - pad * 2;
    const resized = await sharp(iconBuffer)
      .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    return sharp({
      create: { width: size, height: size, channels: 4, background },
    })
      .composite([{ input: resized, gravity: "center" }])
      .png();
  }

  await (await squareIcon(192, { r: 0, g: 0, b: 0, alpha: 0 })).toFile(path.join(iconsDir, "icon-192.png"));
  await (await squareIcon(512, { r: 0, g: 0, b: 0, alpha: 0 })).toFile(path.join(iconsDir, "icon-512.png"));
  // maskable needs an opaque background (PWA spec safe-zone requirement) —
  // uses the app's real background color, not a decorative block.
  await (await squareIcon(512, { r: 0, g: 0, b: 0, alpha: 255 })).toFile(
    path.join(iconsDir, "icon-maskable-512.png")
  );

  console.log("logo assets written");
}

run();
