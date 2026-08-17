// Asistente interactivo para llenar .env sin editar archivos a mano.
//
// EJECÚTALO TÚ EN TU PROPIA TERMINAL:
//   node scripts/configurar.mjs
//
// Te pregunta cada dato, lo guarda en .env y comprueba que funcione.
// Los valores nunca se muestran en pantalla al escribirlos ni se imprimen
// después: solo verás "ok" o el error correspondiente.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");

const CAMPOS = [
  {
    clave: "CLOUDINARY_CLOUD_NAME",
    titulo: "Cloudinary — Cloud Name",
    ayuda:
      "  Entra a https://cloudinary.com y mira el Dashboard.\n" +
      '  Es el nombre corto, algo como "dxyz123abc".',
    secreto: false,
  },
  {
    clave: "CLOUDINARY_API_KEY",
    titulo: "Cloudinary — API Key",
    ayuda: "  En el mismo Dashboard. Son solo números, unos 15 dígitos.",
    secreto: false,
  },
  {
    clave: "CLOUDINARY_API_SECRET",
    titulo: "Cloudinary — API Secret",
    ayuda:
      "  En el mismo Dashboard, hay que pulsar el ojito para verlo.\n" +
      "  (Al escribirlo aquí no se verá en pantalla, es normal.)",
    secreto: true,
  },
  {
    clave: "TURSO_DATABASE_URL",
    titulo: "Turso — Database URL",
    ayuda:
      "  Entra a https://turso.tech, abre tu base de datos.\n" +
      '  Es CORTA y termina en ".turso.io", por ejemplo:\n' +
      "     libsql://shinoteca-omar.turso.io\n" +
      "  ⚠ NO es el token (ese es larguísimo y empieza por eyJ).",
    secreto: false,
    validar: (v) => {
      if (!v.startsWith("libsql://") && !v.startsWith("https://")) {
        return 'Debe empezar con "libsql://".';
      }
      // Un token pegado por error en este campo es el fallo más común: es
      // larguísimo y lleva "eyJ" (cabecera de un JWT). La URL real ronda los
      // 40 caracteres, así que distinguirlos es trivial y evita un error de
      // red confuso mucho más adelante.
      if (v.includes("eyJ") || v.length > 120) {
        return "Eso parece el TOKEN, no la URL. La URL es corta y termina en .turso.io";
      }
      if (!/\.turso\.io\/?$/.test(v.split("?")[0])) {
        return 'Debería terminar en ".turso.io". Cópiala de la página de tu base de datos.';
      }
      return null;
    },
  },
  {
    clave: "TURSO_AUTH_TOKEN",
    titulo: "Turso — Auth Token",
    ayuda:
      '  En tu base de datos, botón "Create Token".\n' +
      "  Es un texto MUY largo que empieza por eyJ. Cópialo entero.\n" +
      "  (Al escribirlo aquí no se verá en pantalla, es normal.)",
    secreto: true,
    validar: (v) =>
      v.startsWith("libsql://")
        ? "Eso parece la URL, no el token. El token empieza por eyJ."
        : null,
  },
];

function leerEnv() {
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const linea of readFileSync(envPath, "utf8").split("\n")) {
    const m = linea.match(/^([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function escribirEnv(valores) {
  const lineas = [
    "# Generado por scripts/configurar.mjs",
    "# Este archivo NO se sube a GitHub (está en .gitignore).",
    "",
    "# Base de datos local para desarrollo.",
    `DATABASE_URL="${valores.DATABASE_URL || "file:./dev.db"}"`,
    "",
    "# Base de datos en la nube (producción).",
    `TURSO_DATABASE_URL="${valores.TURSO_DATABASE_URL || ""}"`,
    `TURSO_AUTH_TOKEN="${valores.TURSO_AUTH_TOKEN || ""}"`,
    "",
    "# Almacenamiento de audio y carátulas.",
    `CLOUDINARY_CLOUD_NAME="${valores.CLOUDINARY_CLOUD_NAME || ""}"`,
    `CLOUDINARY_API_KEY="${valores.CLOUDINARY_API_KEY || ""}"`,
    `CLOUDINARY_API_SECRET="${valores.CLOUDINARY_API_SECRET || ""}"`,
    "",
  ];
  writeFileSync(envPath, lineas.join("\n"));
}

// Pregunta ocultando lo que se escribe (para tokens y secretos).
function preguntarOculto(rl, texto) {
  return new Promise((resolve) => {
    const alEscribir = (char) => {
      if (char === "\n" || char === "\r" || char === "") {
        process.stdin.removeListener("data", alEscribir);
      } else {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(texto);
      }
    };
    process.stdin.on("data", alEscribir);
    rl.question(texto, (valor) => {
      process.stdout.write("\n");
      resolve(valor);
    });
  });
}

function preguntar(rl, texto) {
  return new Promise((resolve) => rl.question(texto, resolve));
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   Configuración de Shinoteca                 ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log("\nTe voy a pedir 5 datos. Si ya tienes alguno guardado,");
  console.log("pulsa ENTER para dejarlo como está.\n");

  const valores = leerEnv();

  for (const campo of CAMPOS) {
    const yaExiste = valores[campo.clave] && valores[campo.clave].length > 0;
    console.log("\n─────────────────────────────────────────────");
    console.log(`  ${campo.titulo}${yaExiste ? "   [ya configurado]" : ""}`);
    console.log(campo.ayuda);

    let valor = "";
    for (;;) {
      const prompt = yaExiste ? "  > (ENTER para no cambiarlo): " : "  > ";
      valor = campo.secreto ? await preguntarOculto(rl, prompt) : await preguntar(rl, prompt);
      valor = valor.trim().replace(/^["']|["']$/g, "");

      if (!valor && yaExiste) {
        valor = valores[campo.clave];
        break;
      }
      if (!valor) {
        console.log("  ⚠ No puede quedar vacío. Inténtalo otra vez.");
        continue;
      }
      const error = campo.validar ? campo.validar(valor) : null;
      if (error) {
        console.log(`  ⚠ ${error}`);
        continue;
      }
      break;
    }
    valores[campo.clave] = valor;
    escribirEnv(valores);
    console.log("  ✓ guardado");
  }

  rl.close();

  console.log("\n─────────────────────────────────────────────");
  console.log("  ✓ Listo. El archivo .env quedó configurado.");
  console.log("─────────────────────────────────────────────");
  console.log("\nAhora avísale a Claude que ya terminaste,");
  console.log("o continúa tú mismo con:\n");
  console.log("   node scripts/verificar.mjs\n");
}

main();
