import { prisma } from "./prisma";
import type { Song } from "./types";

export async function getUploadedSongs(): Promise<Song[]> {
  // Same reasoning as getCurrentUser: the static catalogue must keep working
  // on a deployment where no database is configured yet, so a failed query
  // degrades to "no user-uploaded songs" instead of a 500.
  let rows;
  try {
    rows = await prisma.uploadedSong.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Uploaded-songs query failed — is the database configured?", err);
    return [];
  }

  return rows.map((row): Song => ({
    id: `up-${row.id}`,
    title: row.title,
    artist: row.artist,
    alias: row.alias ?? undefined,
    releaseType: row.releaseType as Song["releaseType"],
    year: row.year ?? undefined,
    genre: row.genre ?? undefined,
    duration: row.duration,
    coverUrl: row.coverUrl ?? undefined,
    coverSource: row.coverUrl ? "uploaded" : "fallback",
    lyrics: row.lyrics ?? undefined,
    description: row.description ?? undefined,
    tags: JSON.parse(row.tags || "[]"),
    audioSources: [{ type: "storage", url: row.audioUrl, downloadable: true }],
    isPublished: row.isPublished,
    isDownloadable: true,
    commentsEnabled: true,
    isThirdParty: row.isThirdParty,
  }));
}
