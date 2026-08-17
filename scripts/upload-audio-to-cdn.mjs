// Sube el audio de public/music a Cloudinary y guarda un manifiesto con las
// URLs resultantes.
//
// POR QUÉ EXISTE: el plan gratuito de Vercel limita los archivos fuente de un
// despliegue a 100 MB, y el catálogo pesa ~690 MB. Con el audio servido desde
// Cloudinary, el repositorio baja a unos pocos MB y el despliegue entra
// holgado en el plan gratuito; Cloudinary gratis da 25 GB (0,7 se van en
// almacenar todo esto, el resto queda para reproducir).
//
// USO:
//   1) Define CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET en .env
//   2) node scripts/upload-audio-to-cdn.mjs
//
// Es idempotente: lo ya subido se salta en ejecuciones posteriores, así que
// puedes cortarlo y retomarlo sin duplicar nada ni gastar créditos de más.
import "dotenv/config";
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicMusicDir = path.join(root, "public", "music");
const manifestPath = path.join(__dirname, "cdn-manifest.json");

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "\nFaltan credenciales de Cloudinary.\n" +
      "Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET\n" +
      "en el archivo .env (mira .env.example) y vuelve a ejecutar.\n"
  );
  process.exit(1);
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

const AUDIO_EXT = [".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg"];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (AUDIO_EXT.includes(path.extname(name).toLowerCase())) out.push(full);
  }
  return out;
}

function loadManifest() {
  if (!existsSync(manifestPath)) return {};
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    return {};
  }
}

async function run() {
  if (!existsSync(publicMusicDir)) {
    console.error(`No existe ${publicMusicDir}. Ejecuta antes: node scripts/import-music.mjs`);
    process.exit(1);
  }

  const manifest = loadManifest();
  const files = walk(publicMusicDir);
  console.log(`${files.length} archivos de audio encontrados.`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of files) {
    // Clave estable: la ruta pública tal cual aparece en el catálogo.
    const publicPath = "/" + path.relative(path.join(root, "public"), filePath).split(path.sep).join("/");

    if (manifest[publicPath]) {
      skipped++;
      continue;
    }

    const sizeMb = statSync(filePath).size / (1024 * 1024);
    process.stdout.write(`Subiendo (${uploaded + skipped + failed + 1}/${files.length}) ${publicPath} — ${sizeMb.toFixed(1)} MB … `);

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        // El audio se sube como "video" en Cloudinary; es su tipo para todo
        // lo que lleva pista sonora.
        resource_type: "video",
        folder: "shinoteca/music",
        public_id: publicPath.replace(/^\/music\//, "").replace(/\.[^.]+$/, ""),
        use_filename: false,
        unique_filename: false,
        overwrite: false,
      });
      manifest[publicPath] = result.secure_url;
      uploaded++;
      console.log("ok");
      // Guarda tras cada archivo: si se corta la conexión no se pierde el avance.
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch (err) {
      failed++;
      console.log("ERROR: " + (err?.message ?? err));
    }
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nListo. Subidos: ${uploaded} · Ya estaban: ${skipped} · Fallidos: ${failed}`);
  console.log(`Manifiesto: ${path.relative(root, manifestPath)}`);
  if (failed === 0) {
    console.log("\nAhora ejecuta:  node scripts/import-music.mjs");
    console.log("para que el catálogo apunte a las URLs de Cloudinary.");
  }
}

run();
