// Comprueba que las credenciales de .env funcionen de verdad, conectándose a
// cada servicio. Nunca imprime los valores: solo si cada conexión funciona o
// qué falla, para que se pueda ejecutar (o pegar su salida) sin filtrar nada.
//
//   node scripts/verificar.mjs
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@libsql/client";

const ok = (msg) => console.log(`  ✓ ${msg}`);
const fallo = (msg) => console.log(`  ✗ ${msg}`);

let problemas = 0;

async function revisarCloudinary() {
  console.log("\n── Cloudinary (audio) ──");
  const { CLOUDINARY_CLOUD_NAME: nombre, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;

  if (!nombre || !key || !secret) {
    fallo("Faltan datos. Ejecuta: node scripts/configurar.mjs");
    problemas++;
    return;
  }

  cloudinary.config({ cloud_name: nombre, api_key: key, api_secret: secret, secure: true });
  try {
    const uso = await cloudinary.api.usage();
    ok("Conexión correcta");
    if (uso?.credits) {
      const usados = uso.credits.usage ?? 0;
      const total = uso.credits.limit ?? 25;
      ok(`Créditos: ${Number(usados).toFixed(2)} de ${total} usados`);
      const libres = total - usados;
      if (libres < 1) {
        fallo(`Solo quedan ${libres.toFixed(2)} créditos: puede no alcanzar para subir el audio (~0,7).`);
        problemas++;
      }
    }
  } catch (err) {
    const msg = String(err?.message ?? err);
    if (/api_key|Invalid|signature|401|unauthorized/i.test(msg)) {
      fallo("Credenciales rechazadas. Revisa Cloud Name, API Key y API Secret.");
    } else {
      fallo(`No se pudo conectar: ${msg}`);
    }
    problemas++;
  }
}

async function revisarTurso() {
  console.log("\n── Turso (cuentas de usuario) ──");
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    fallo("Faltan datos. Ejecuta: node scripts/configurar.mjs");
    problemas++;
    return;
  }

  try {
    const cliente = createClient({ url, authToken: token });
    await cliente.execute("SELECT 1");
    ok("Conexión correcta");

    const tablas = await cliente.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('User','Session','UploadedSong','SongLike')"
    );
    if (tablas.rows.length >= 4) {
      ok("Las tablas ya están creadas");
    } else {
      console.log(`  ! Faltan tablas (${tablas.rows.length} de 4). Ejecuta: npx prisma migrate deploy`);
    }
  } catch (err) {
    const msg = String(err?.message ?? err);
    if (/auth|401|unauthorized|token/i.test(msg)) {
      fallo("Token rechazado. Genera uno nuevo en Turso y vuelve a configurarlo.");
    } else if (/not found|ENOTFOUND|getaddrinfo/i.test(msg)) {
      fallo("No se encontró esa base de datos. Revisa la URL.");
    } else {
      fallo(`No se pudo conectar: ${msg}`);
    }
    problemas++;
  }
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   Verificación de credenciales               ║");
  console.log("╚══════════════════════════════════════════════╝");

  await revisarCloudinary();
  await revisarTurso();

  console.log("\n─────────────────────────────────────────────");
  if (problemas === 0) {
    console.log("  ✓ TODO CORRECTO — ya se puede subir el audio.");
    console.log("─────────────────────────────────────────────\n");
    process.exit(0);
  } else {
    console.log(`  ✗ ${problemas} problema(s). Revisa arriba.`);
    console.log("─────────────────────────────────────────────\n");
    process.exit(1);
  }
}

main();
