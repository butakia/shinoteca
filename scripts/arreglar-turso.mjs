// Arma la URL de Turso a partir del nombre de la base y del usuario, la
// prueba con el token que ya está en .env y la guarda si funciona.
//
//   node scripts/arreglar-turso.mjs
//
// Existe porque en el panel de Turso la URL y el token están juntos y es muy
// fácil copiar el que no es: la URL sigue siempre el patrón
// libsql://<base>-<usuario>.turso.io, así que se puede reconstruir sin tener
// que buscarla. El token no se toca ni se muestra en ningún momento.
import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";
import { createClient } from "@libsql/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

const preguntar = (rl, texto) => new Promise((res) => rl.question(texto, res));

async function main() {
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!token) {
    console.log("\n✗ No hay TURSO_AUTH_TOKEN en .env. Ejecuta antes: node scripts/configurar.mjs\n");
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   Arreglar la URL de Turso                   ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log("\nSolo necesito dos datos que NO son secretos.\n");

  const baseRaw = await preguntar(rl, "  Nombre de tu base de datos [shinoteca]: ");
  const base = (baseRaw.trim() || "shinoteca").replace(/\s+/g, "-").toLowerCase();

  console.log("\n  Tu usuario de Turso: aparece arriba a la derecha en turso.tech,");
  console.log("  o en la URL de tu panel. Suele ser tu usuario de GitHub.");
  const usuarioRaw = await preguntar(rl, "  Usuario de Turso: ");
  const usuario = usuarioRaw.trim().replace(/\s+/g, "-").toLowerCase();

  rl.close();

  if (!usuario) {
    console.log("\n✗ Hace falta el usuario. Vuelve a intentarlo.\n");
    process.exit(1);
  }

  // Se prueban ambas formas: Turso usa <base>-<usuario> casi siempre, pero
  // algunas cuentas antiguas tienen la base sin sufijo.
  const candidatas = [
    `libsql://${base}-${usuario}.turso.io`,
    `libsql://${base}.turso.io`,
  ];

  console.log("");
  for (const url of candidatas) {
    process.stdout.write(`  Probando ${url} … `);
    try {
      const cliente = createClient({ url, authToken: token });
      await cliente.execute("SELECT 1");
      console.log("✓ FUNCIONA");

      const contenido = readFileSync(envPath, "utf8");
      const nuevo = contenido.replace(
        /^TURSO_DATABASE_URL\s*=.*$/m,
        `TURSO_DATABASE_URL="${url}"`
      );
      writeFileSync(envPath, nuevo);

      console.log("\n─────────────────────────────────────────────");
      console.log("  ✓ Guardada en .env. Ya puedes continuar.");
      console.log("─────────────────────────────────────────────\n");
      process.exit(0);
    } catch (err) {
      const msg = String(err?.message ?? err);
      if (/auth|401|unauthorized/i.test(msg)) {
        console.log("✗ el token no vale para esta base");
      } else {
        console.log("✗ no existe");
      }
    }
  }

  console.log("\n─────────────────────────────────────────────");
  console.log("  ✗ Ninguna funcionó.");
  console.log("─────────────────────────────────────────────");
  console.log("\n  Revisa en https://turso.tech:");
  console.log("   · que el nombre de la base sea exactamente ese");
  console.log("   · que el usuario sea el correcto");
  console.log("   · que el token se haya creado PARA ESA base\n");
  process.exit(1);
}

main();
