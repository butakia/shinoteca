// Scans /musica for album folders (each subfolder = one album with several
// track files + cover art), cleans up names, reads real audio metadata, and
// writes:
//   - public/music/<album-slug>/<track-slug>.<ext>   (playable audio, copied)
//   - public/covers/<album-slug>.<ext>                (album cover, copied)
//   - src/lib/data/imported.generated.ts              (Song[] + Album[])
//
// Re-running is idempotent: IDs are derived from stable slugs, so existing
// entries get overwritten in place rather than duplicated. Source files in
// /musica are only ever read, never modified or deleted.
import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFile } from "music-metadata";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const musicaDir = path.join(root, "musica");
const publicMusicDir = path.join(root, "public", "music");
const publicCoversDir = path.join(root, "public", "covers");
const outFile = path.join(root, "src", "lib", "data", "imported.generated.ts");
const manifestPath = path.join(__dirname, "cdn-manifest.json");

// Si scripts/upload-audio-to-cdn.mjs ya subió el audio a Cloudinary, el
// catálogo apunta a esas URLs en vez de a /music/... — así el despliegue no
// necesita llevar los ~690 MB de audio (el plan gratuito de Vercel limita los
// archivos fuente a 100 MB). Sin manifiesto, todo sigue funcionando en local
// con las rutas locales de siempre.
const cdnManifest = existsSync(manifestPath)
  ? (() => {
      try {
        return JSON.parse(readFileSync(manifestPath, "utf8"));
      } catch {
        return {};
      }
    })()
  : {};

const AUDIO_EXT = [".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg"];
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];

function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const CONNECTORS = new Set(["de", "del", "la", "las", "el", "los", "en", "y", "a", "con", "por", "para", "un", "una"]);
function titleCase(str) {
  return str
    .split(" ")
    .map((word, i) => {
      if (!word) return word;
      const lower = word.toLowerCase();
      if (i > 0 && CONNECTORS.has(lower)) return lower;
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function cleanTrackTitle(rawBase, albumArtistPrefix, interpretTrackNumber = true) {
  let name = rawBase;

  const stripArtistPrefix = () => {
    if (albumArtistPrefix && name.toLowerCase().startsWith(albumArtistPrefix.toLowerCase() + " -")) {
      name = name.slice(albumArtistPrefix.length + 2).trim();
    }
  };

  // Artist prefix and track number can appear in either order across rip
  // sources ("Shinoflow - 01 - Title" vs "01 - Shinoflow - Title"), so the
  // artist strip runs on both sides of the number strip. Doing it only
  // after (an earlier version of this) left "01 - " glued to every title
  // whose filename led with the artist, since such a name doesn't start
  // with a digit for the number regex to match.
  stripArtistPrefix();

  // strip leading track-number prefix: "01 - ", "01-", "01. ", "01) Title"
  // (the separator after the digits varies a lot across rip sources, so this
  // has to eat any of ". - )" before the real title starts, not just "-" —
  // leaving a stray leading "." was what broke the artist-prefix strip,
  // since ". Porta - Song" doesn't start with "porta -" the way "Porta - Song" does)
  const trackMatch = interpretTrackNumber
    ? name.match(/^\s*(\d{1,3})\s*[.\-)]*\s*(.*)$/)
    : null;
  let trackNumber;
  if (trackMatch && trackMatch[2].trim().length > 0) {
    trackNumber = parseInt(trackMatch[1], 10);
    name = trackMatch[2].trim();
  }

  stripArtistPrefix();
  // strip trailing rip-site watermarks some downloads leave in the filename:
  // "... - Www.hhgroups.com", "... [Producido por X]" at the very end
  name = name.replace(/\s*-\s*www\.[^-]*$/i, "").trim();
  name = name.replace(/\s*\[\s*(?:producido por|prod\.?)\s+.*?\]\s*$/i, "").trim();
  // normalize bracketed feature credits: "[ Feat X ]" -> "(feat. X)"
  name = name.replace(/\[\s*feat\.?\s+(.*?)\s*\]/gi, (_, who) => `(feat. ${who})`);
  // Las recopilaciones de temas sueltos suelen añadir el nombre del artista
  // al final ("Tema - Shinoflow-mc"). No forma parte del título visible.
  name = name.replace(/\s*-\s*(?:shino\s*flow|carlos\s+sadness)(?:-mc)?\s*$/i, "").trim();
  name = name.replace(/_/g, " ").replace(/\s{2,}/g, " ").trim();
  const cleaned = titleCase(name);
  return { title: cleaned, trackNumber };
}

const SHINOFLOW_NAMES = new Set(["shino flow", "shinoflow", "shino-flow"]);
function isShinoflow(artistName) {
  return SHINOFLOW_NAMES.has(artistName.trim().toLowerCase());
}

function parseAlbumFolderName(folderName) {
  // "Shinoflow - Tu Principe Azul Destiñe (2002)_by_jack_" ->
  // { artist: "Shinoflow", title: "Tu Principe Azul Destiñe", year: 2002 }
  // The year is sometimes bare rather than parenthesised
  // ("... Relampagos 2011(by_jack)"), so accept both forms.
  const yearMatch = folderName.match(/\((\d{4})\)/) || folderName.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0].replace(/[()]/g, ""), 10) : undefined;
  let rest = folderName
    .replace(/\(\d{4}\)/, "")
    .replace(/\b(19|20)\d{2}\b/, "")
    // "_by_jack_", "(by_jack)", " by jack" — uploader credits in the folder
    // name that aren't part of the album title.
    .replace(/[（(\[]?\s*_?by[_\s].*$/i, "")
    .replace(/_by_\w*_?$/i, "")
    .trim();
  const dashIdx = rest.indexOf(" - ");
  let artist = "Shino Flow";
  let title = rest;
  if (dashIdx >= 0) {
    artist = rest.slice(0, dashIdx).trim();
    title = rest.slice(dashIdx + 3).trim();
  }
  // folder names sometimes use dashes/underscores instead of spaces
  title = title.replace(/[_-]+/g, " ").replace(/\s{2,}/g, " ").trim();
  return { artist: titleCase(artist), title: titleCase(title), year };
}

function pickCoverFile(files) {
  const images = files.filter((f) => IMAGE_EXT.includes(path.extname(f).toLowerCase()));
  if (images.length === 0) return null;
  const generic = new Set(["albumartsmall.jpg", "folder.jpg"]);
  const specific = images.filter((f) => !generic.has(f.toLowerCase()) && !/pequeñ|small/i.test(f));
  if (specific.length > 0) return specific[0];
  const folder = images.find((f) => f.toLowerCase() === "folder.jpg");
  if (folder) return folder;
  return images[0];
}

async function run() {
  mkdirSync(publicMusicDir, { recursive: true });
  mkdirSync(publicCoversDir, { recursive: true });

  const entries = readdirSync(musicaDir).filter((name) => statSync(path.join(musicaDir, name)).isDirectory());

  const albums = [];
  const songs = [];

  for (const folderName of entries) {
    const folderPath = path.join(musicaDir, folderName);
    const files = readdirSync(folderPath);
    const audioFiles = files.filter((f) => AUDIO_EXT.includes(path.extname(f).toLowerCase())).sort();
    if (audioFiles.length === 0) continue;

    const { artist, title: albumTitle, year } = parseAlbumFolderName(folderName);
    const thirdParty = !isShinoflow(artist);
    const albumSlug = slugify(`${artist}-${albumTitle}-${year ?? ""}`);
    const albumDir = path.join(publicMusicDir, albumSlug);
    mkdirSync(albumDir, { recursive: true });

    const coverFile = pickCoverFile(files);
    let coverUrl;
    if (coverFile) {
      const ext = path.extname(coverFile).toLowerCase();
      const coverDest = `${albumSlug}${ext}`;
      copyFileSync(path.join(folderPath, coverFile), path.join(publicCoversDir, coverDest));
      coverUrl = `/covers/${coverDest}`;
    }

    albums.push({
      id: albumSlug,
      title: albumTitle,
      artistId: thirdParty ? slugify(artist) : "shino-flow",
      releaseType: /^in[eé]dit[oa]s?$/i.test(albumTitle) ? "compilation" : "lp",
      year,
      coverUrl,
      coverSource: coverUrl ? "uploaded" : "fallback",
      description: `Importado desde la carpeta original "${folderName}".`,
      isThirdParty: thirdParty,
    });

    for (const audioFile of audioFiles) {
      const ext = path.extname(audioFile).toLowerCase();
      const base = path.basename(audioFile, ext);
      const { title: trackTitle, trackNumber } = cleanTrackTitle(
        base,
        artist,
        !/^in[eé]dit[oa]s?$/i.test(albumTitle)
      );
      const trackSlug = slugify(`${albumSlug}-${trackNumber ?? 0}-${trackTitle}`);
      const destFile = `${trackSlug}${ext}`;
      const srcPath = path.join(folderPath, audioFile);
      copyFileSync(srcPath, path.join(albumDir, destFile));

      let duration = 0;
      let bitrate;
      let sampleRate;
      let format = ext.replace(".", "").toUpperCase();
      let fileSize = statSync(srcPath).size;
      try {
        const md = await parseFile(srcPath);
        duration = Math.round(md.format.duration ?? 0);
        bitrate = md.format.bitrate ? Math.round(md.format.bitrate / 1000) : undefined;
        sampleRate = md.format.sampleRate;
      } catch {
        // unreadable metadata — keep the safe defaults above, flag for review
      }

      const needsReview = !trackNumber || trackTitle.length < 2 || /^\d+$/.test(trackTitle);

      const localUrl = `/music/${albumSlug}/${destFile}`;
      const cdnUrl = cdnManifest[localUrl];

      songs.push({
        id: trackSlug,
        title: trackTitle || base,
        originalFileName: audioFile,
        artist,
        albumId: albumSlug,
        releaseType: /^in[eé]dit[oa]s?$/i.test(albumTitle) ? "compilation" : "lp",
        year,
        trackNumber,
        duration,
        coverUrl,
        coverSource: coverUrl ? "uploaded" : "fallback",
        tags: [slugify(albumTitle)],
        audioSources: [
          {
            type: cdnUrl ? "external" : "local",
            url: cdnUrl ?? localUrl,
            format,
            bitrate,
            fileSize,
            qualityLabel: bitrate ? `${bitrate} kbps` : format,
            downloadable: true,
          },
        ],
        isPublished: true,
        isDownloadable: true,
        commentsEnabled: true,
        needsReview,
        metadataStatus: trackNumber && sampleRate ? "complete" : "partial",
        originalFolderName: folderName,
        isThirdParty: thirdParty,
      });
    }
  }

  const banner = `// AUTO-GENERATED by scripts/import-music.mjs — do not edit by hand.
// Re-run \`node scripts/import-music.mjs\` after adding/removing files in /musica.
import type { Song, Album } from "@/lib/types";
`;

  const body = `
export const importedAlbums: Album[] = ${JSON.stringify(albums, null, 2)};

export const importedSongs: Song[] = ${JSON.stringify(songs, null, 2)};
`;

  writeFileSync(outFile, banner + body);

  // Limpieza de sobrantes: los nombres de archivo derivan del título ya
  // limpio, así que al mejorar esa limpieza cambian los slugs y las copias
  // con el nombre anterior se quedaban en public/music para siempre. Llegaron
  // a acumularse 56 archivos huérfanos (222 MB) que además se subían al CDN
  // gastando cuota. Aquí se borra todo lo que este catálogo ya no referencia.
  const referenciadas = new Set(
    songs.flatMap((s) => s.audioSources.map((a) => a.url)).filter((u) => u.startsWith("/music/"))
  );
  // El single suelto vive en src/lib/data/songs.ts, no en este generado.
  referenciadas.add("/music/dame-un-minuto.mp3");
  // Con el audio ya en el CDN las URLs son absolutas; en ese caso se conserva
  // la copia local equivalente (sigue sirviendo para desarrollo sin red).
  for (const song of songs) {
    for (const src of song.audioSources) {
      if (!src.url.startsWith("/music/")) {
        referenciadas.add(`/music/${slugify(albums.find((a) => a.id === song.albumId)?.id ?? "")}/`);
      }
    }
  }

  function recorrer(dir) {
    const out = [];
    for (const nombre of readdirSync(dir)) {
      const completo = path.join(dir, nombre);
      if (statSync(completo).isDirectory()) out.push(...recorrer(completo));
      else if (AUDIO_EXT.includes(path.extname(nombre).toLowerCase())) out.push(completo);
    }
    return out;
  }

  let huerfanos = 0;
  let bytesLiberados = 0;
  for (const archivo of recorrer(publicMusicDir)) {
    const publico = "/" + path.relative(path.join(root, "public"), archivo).split(path.sep).join("/");
    // Se conserva si el catálogo lo referencia directamente, o si su ruta
    // aparece en el manifiesto del CDN (ahí las URLs ya no son locales).
    if (referenciadas.has(publico) || cdnManifest[publico]) continue;
    bytesLiberados += statSync(archivo).size;
    unlinkSync(archivo);
    huerfanos++;
  }

  console.log(`Imported ${albums.length} albums, ${songs.length} tracks.`);
  console.log(`Needs review: ${songs.filter((s) => s.needsReview).length}`);
  if (huerfanos > 0) {
    console.log(`Limpiados ${huerfanos} archivos huérfanos (${(bytesLiberados / 1024 / 1024).toFixed(0)} MB).`);
  }
}

run();
