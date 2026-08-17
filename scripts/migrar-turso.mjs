// Aplica las migraciones de prisma/migrations a la base de Turso.
//
//   node scripts/migrar-turso.mjs
//
// POR QUÉ NO `prisma migrate deploy`: prisma.config.ts apunta a DATABASE_URL
// (el SQLite local, que es lo que necesita el CLI de Prisma para trabajar en
// desarrollo), así que ese comando crearía las tablas en el archivo local y
// no en Turso. Aquí se ejecuta el mismo SQL versionado contra Turso y se
// registra en _prisma_migrations con el mismo formato que usa Prisma, para
// que el estado quede consistente si más adelante se usa el CLI.
import "dotenv/config";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { createClient } from "@libsql/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("\n✗ Faltan TURSO_DATABASE_URL / TURSO_AUTH_TOKEN en .env\n");
  process.exit(1);
}

// Divide un archivo .sql en sentencias. Las migraciones que genera Prisma no
// contienen ';' dentro de literales, así que partir por ';' es seguro aquí.
//
// Ojo con los comentarios: Prisma antepone una línea "-- CreateTable" a cada
// sentencia, así que descartar los fragmentos que EMPIECEN por "--" tiraría
// la sentencia entera (era un bug real: las migraciones salían con "0
// sentencias" y no creaban nada). Hay que quitar las líneas de comentario y
// luego mirar si queda SQL.
function separarSentencias(sql) {
  return sql
    .split(";")
    .map((fragmento) =>
      fragmento
        .split("\n")
        .filter((linea) => !/^\s*--/.test(linea))
        .join("\n")
        .trim()
    )
    .filter((s) => s.length > 0);
}

async function main() {
  if (!existsSync(migrationsDir)) {
    console.error(`✗ No existe ${migrationsDir}`);
    process.exit(1);
  }

  const cliente = createClient({ url, authToken });

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   Migraciones → Turso                        ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  await cliente.execute(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
    )
  `);

  const yaAplicadas = new Set(
    (await cliente.execute("SELECT migration_name FROM _prisma_migrations")).rows.map(
      (r) => r.migration_name
    )
  );

  const carpetas = readdirSync(migrationsDir)
    .filter((n) => existsSync(path.join(migrationsDir, n, "migration.sql")))
    .sort();

  let aplicadas = 0;
  let saltadas = 0;

  for (const nombre of carpetas) {
    if (yaAplicadas.has(nombre)) {
      console.log(`  · ${nombre} — ya estaba`);
      saltadas++;
      continue;
    }

    const sql = readFileSync(path.join(migrationsDir, nombre, "migration.sql"), "utf8");
    const sentencias = separarSentencias(sql);
    process.stdout.write(`  → ${nombre} (${sentencias.length} sentencias) … `);

    try {
      for (const sentencia of sentencias) {
        await cliente.execute(sentencia);
      }
      await cliente.execute({
        sql: `INSERT INTO _prisma_migrations
                (id, checksum, migration_name, finished_at, applied_steps_count)
              VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)`,
        args: [
          crypto.randomUUID(),
          crypto.createHash("sha256").update(sql).digest("hex"),
          nombre,
          sentencias.length,
        ],
      });
      console.log("✓");
      aplicadas++;
    } catch (err) {
      console.log("✗");
      console.error(`\n    ${err?.message ?? err}\n`);
      cliente.close();
      process.exitCode = 1;
      return;
    }
  }

  const tablasRequeridas = [
    "User",
    "Session",
    "UploadedSong",
    "SongLike",
    "SongOverride",
    "DeletedSong",
    "NoticeOverride",
    "AlbumOverride",
  ];
  const placeholders = tablasRequeridas.map(() => "?").join(",");
  const tablas = await cliente.execute({
    sql: `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`,
    args: tablasRequeridas,
  });

  console.log("\n─────────────────────────────────────────────");
  console.log(`  Aplicadas: ${aplicadas} · Ya estaban: ${saltadas}`);
  console.log(`  Tablas listas: ${tablas.rows.length} de ${tablasRequeridas.length}`);
  console.log("─────────────────────────────────────────────\n");

  const completa = tablas.rows.length === tablasRequeridas.length;
  cliente.close();
  process.exitCode = completa ? 0 : 1;
}

main();
