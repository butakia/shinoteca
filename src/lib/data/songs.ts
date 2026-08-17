import type { Song } from "@/lib/types";
import { importedSongs } from "./imported.generated";

// Real catalog only. The bulk of these tracks come from scripts/import-music.mjs
// scanning /musica (each subfolder = one album) — re-run that script after
// adding or removing files there. This single, manually-curated entry below
// is kept separate since it's a standalone loose file, not an album folder.
const manualSongs: Song[] = [
  {
    id: "dame-un-minuto",
    title: "Dame Un Minuto",
    artist: "Shino Flow",
    alias: "Shinoflow",
    releaseType: "single",
    year: 2025,
    duration: 84,
    coverSource: "fallback",
    description:
      "Colaboración con Carlos Sadness, para aiSHO. Archivo original con letra incluida en el video de origen.",
    tags: ["shino-flow", "carlos-sadness", "single"],
    audioSources: [
      {
        type: "local",
        url: "/music/dame-un-minuto.mp3",
        format: "MP3",
        bitrate: 192,
        fileSize: 2021387,
        qualityLabel: "192 kbps",
        downloadable: true,
      },
    ],
    isPublished: true,
    isDownloadable: true,
    commentsEnabled: true,
    isFeatured: true,
  },
];

export const songs: Song[] = [...manualSongs, ...importedSongs];
