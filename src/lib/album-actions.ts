"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";
import { getAllAlbums, getAllSongs } from "./data";
import type { Album } from "./types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Editing an album's cover has to reach every song currently in it — songs
// each carry their own independent coverUrl (SongOverride), so "the album's
// cover" isn't a single source of truth the player/catalog reads from.
// Without this cascade, changing the album cover from /admin would do
// nothing visible anywhere a song is actually displayed.
async function cascadeCoverToSongs(albumId: string, coverUrl: string | undefined) {
  const songIds = getAllSongs()
    .filter((s) => s.albumId === albumId)
    .map((s) => s.id);
  if (songIds.length === 0) return;
  const existing = await prisma.songOverride.findMany({ where: { songId: { in: songIds } } });
  const existingPatch = new Map(existing.map((row) => [row.songId, JSON.parse(row.patch)]));
  await Promise.all(
    songIds.map((songId) => {
      const merged = { ...(existingPatch.get(songId) ?? {}), coverUrl };
      return prisma.songOverride.upsert({
        where: { songId },
        create: { songId, patch: JSON.stringify(merged) },
        update: { patch: JSON.stringify(merged) },
      });
    })
  );
}

export async function saveAlbumOverrideAction(
  albumId: string,
  patch: Partial<Album>
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };

  const existing = await prisma.albumOverride.findUnique({ where: { albumId } });
  const existingPatch = existing ? JSON.parse(existing.patch) : {};
  const merged = { ...existingPatch, ...patch };

  await prisma.albumOverride.upsert({
    where: { albumId },
    create: { albumId, patch: JSON.stringify(merged), isCustom: existing?.isCustom ?? false },
    update: { patch: JSON.stringify(merged) },
  });

  if ("coverUrl" in patch) {
    await cascadeCoverToSongs(albumId, patch.coverUrl);
  }

  revalidatePath("/");
  revalidatePath("/albumes");
  revalidatePath(`/albumes/${albumId}`);
  revalidatePath("/canciones");
  revalidatePath("/explorar");
  return {};
}

export async function createAlbumAction(
  album: Omit<Album, "id">
): Promise<{ error?: string; id?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };
  if (!album.title.trim()) return { error: "El álbum necesita un título." };

  const existingIds = new Set([
    ...getAllAlbums().map((a) => a.id),
    ...(await prisma.albumOverride.findMany({ select: { albumId: true } })).map((r) => r.albumId),
  ]);
  const base = `custom-${slugify(album.title)}`;
  let id = base;
  let n = 2;
  while (existingIds.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }

  await prisma.albumOverride.create({
    data: { albumId: id, patch: JSON.stringify({ ...album, id }), isCustom: true },
  });

  revalidatePath("/");
  revalidatePath("/albumes");
  return { id };
}

// Static (fixture) albums: discards the override, reverting to the original.
// Custom (admin-created) albums: has no original to revert to, so this
// removes the album entirely — the caller is expected to confirm first.
export async function deleteAlbumOverrideAction(albumId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };
  await prisma.albumOverride.delete({ where: { albumId } }).catch(() => {});
  revalidatePath("/");
  revalidatePath("/albumes");
  return {};
}
