"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { uploadPublicFile } from "./upload-storage";
import { getCurrentUser } from "./auth";
import { getAllSongs } from "./data";
import type { ReleaseType } from "./types";

export interface UploadSongInput {
  title: string;
  artist: string;
  alias?: string;
  releaseType: ReleaseType;
  year?: number;
  genre?: string;
  duration: number;
  lyrics?: string;
  description?: string;
  tags: string[];
  isThirdParty?: boolean;
  audioBase64: string; // data URL from the browser <audio> pre-check
  audioFileName: string;
  audioMimeType: string;
  coverBase64?: string;
  coverFileName?: string;
}

const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "audio/flac", "audio/mp4"];
const MAX_AUDIO_SIZE = 40 * 1024 * 1024; // 40MB
const MAX_COVER_SIZE = 8 * 1024 * 1024; // 8MB

function decodeDataUrl(dataUrl: string): Buffer {
  const base64 = dataUrl.split(",")[1] ?? dataUrl;
  return Buffer.from(base64, "base64");
}

export async function uploadSongAction(
  input: UploadSongInput,
): Promise<{ error?: string; id?: string; pending?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión para subir canciones." };

  if (!input.title.trim()) return { error: "El título no puede estar vacío." };
  if (!input.artist.trim()) return { error: "El artista no puede estar vacío." };
  if (!ALLOWED_AUDIO_TYPES.includes(input.audioMimeType)) {
    return { error: "Formato de audio no permitido (usa MP3, WAV, OGG o FLAC)." };
  }

  const audioBytes = decodeDataUrl(input.audioBase64);
  if (audioBytes.byteLength > MAX_AUDIO_SIZE) {
    return { error: "El archivo de audio supera 40MB." };
  }

  let audioUrl: string;
  try {
    const ext = input.audioFileName.split(".").pop() || "mp3";
    audioUrl = await uploadPublicFile(audioBytes, `${crypto.randomUUID()}.${ext}`, { resourceType: "video" });
  } catch (err) {
    console.error("Audio upload failed:", err);
    return { error: "No se pudo subir el archivo de audio. Verifica la configuración de almacenamiento." };
  }

  let coverUrl: string | undefined;
  if (input.coverBase64 && input.coverFileName) {
    const coverBytes = decodeDataUrl(input.coverBase64);
    if (coverBytes.byteLength > MAX_COVER_SIZE) {
      return { error: "La carátula supera 8MB." };
    }
    try {
      const ext = input.coverFileName.split(".").pop() || "jpg";
      coverUrl = await uploadPublicFile(coverBytes, `${crypto.randomUUID()}.${ext}`, { resourceType: "image" });
    } catch (err) {
      console.error("Cover upload failed:", err);
      return { error: "No se pudo subir la carátula. Verifica la configuración de almacenamiento." };
    }
  }

  const created = await prisma.uploadedSong.create({
    data: {
      title: input.title.trim(),
      artist: input.artist.trim(),
      alias: input.alias?.trim() || null,
      releaseType: input.releaseType,
      year: input.year ?? null,
      genre: input.genre?.trim() || null,
      duration: Math.round(input.duration) || 0,
      coverUrl: coverUrl ?? null,
      audioUrl,
      lyrics: input.lyrics?.trim() || null,
      description: input.description?.trim() || null,
      tags: JSON.stringify(input.tags),
      isThirdParty: input.isThirdParty ?? false,
      isPublished: user.isAdmin,
      uploaderId: user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/canciones");
  revalidatePath("/explorar");
  revalidatePath("/admin");

  return { id: created.id, pending: !user.isAdmin };
}

// Used by the admin "editar canción" cover uploader — previously that flow
// stored the raw base64 image straight into a localStorage override, which
// silently blew the browser's per-origin storage quota (writeStorage swallows
// quota errors) and made covers vanish after a reload without any visible
// error. Uploading the file here and keeping only the resulting short URL in
// localStorage avoids the quota problem entirely.
export async function uploadCoverImageAction(
  coverBase64: string,
  coverFileName: string,
): Promise<{ url?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };

  const coverBytes = decodeDataUrl(coverBase64);
  if (coverBytes.byteLength > MAX_COVER_SIZE) {
    return { error: "La carátula supera 8MB." };
  }

  try {
    const ext = coverFileName.split(".").pop() || "jpg";
    const url = await uploadPublicFile(coverBytes, `${crypto.randomUUID()}.${ext}`, { resourceType: "image" });
    return { url };
  } catch (err) {
    console.error("Cover upload failed:", err);
    return { error: "No se pudo subir la carátula. Verifica la configuración de almacenamiento." };
  }
}

export async function approveUploadedSongAction(id: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };

  await prisma.uploadedSong.update({ where: { id }, data: { isPublished: true } });

  revalidatePath("/");
  revalidatePath("/canciones");
  revalidatePath("/explorar");
  revalidatePath("/admin");

  return {};
}

export async function deleteUploadedSongAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return;
  await prisma.uploadedSong.delete({ where: { id } }).catch(() => {});
  revalidatePath("/");
  revalidatePath("/canciones");
  revalidatePath("/explorar");
  revalidatePath("/admin");
}

// Edits to a song from the STATIC catalog (title/cover/genre/anything from
// "Editar canción") used to write only to the admin's own browser
// localStorage: it looked saved to whoever made the edit, but no other
// visitor on any other device ever saw it. This persists the same patch
// server-side so it applies for everyone. The browser still keeps its own
// local copy too (see SongsContext) for instant feedback without a round trip.
export async function saveSongOverrideAction(
  songId: string,
  patch: Record<string, unknown>
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };

  await prisma.songOverride.upsert({
    where: { songId },
    create: { songId, patch: JSON.stringify(patch) },
    update: { patch: JSON.stringify(patch) },
  });

  revalidatePath("/");
  revalidatePath("/canciones");
  revalidatePath("/explorar");
  revalidatePath(`/canciones/${songId}`);

  return {};
}

type LocalSongOverride = {
  songId: string;
  patch: Record<string, unknown>;
  editedAt: string;
};

// One-time bridge for edits made before server-side overrides existed. Older
// versions of the admin saved them only in localStorage, so deploying the new
// tables alone would still leave those covers/titles stranded in the original
// browser. Only an authenticated admin can import them, and a local edit never
// replaces a newer server copy from another device.
export async function syncLocalSongOverridesAction(
  entries: LocalSongOverride[]
): Promise<{ error?: string; synced?: number }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };

  const validSongIds = new Set(getAllSongs().map((song) => song.id));
  const safeEntries = entries
    .filter((entry) => validSongIds.has(entry.songId) && !Number.isNaN(Date.parse(entry.editedAt)))
    .slice(0, 500);

  let synced = 0;
  for (const entry of safeEntries) {
    const existing = await prisma.songOverride.findUnique({ where: { songId: entry.songId } });
    if (existing && existing.updatedAt.getTime() >= Date.parse(entry.editedAt)) continue;

    await prisma.songOverride.upsert({
      where: { songId: entry.songId },
      create: { songId: entry.songId, patch: JSON.stringify(entry.patch), updatedAt: new Date(entry.editedAt) },
      update: { patch: JSON.stringify(entry.patch), updatedAt: new Date(entry.editedAt) },
    });
    synced += 1;
  }

  if (synced > 0) {
    revalidatePath("/");
    revalidatePath("/canciones");
    revalidatePath("/explorar");
  }

  return { synced };
}

export async function resetSongOverrideAction(songId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };

  await prisma.songOverride.delete({ where: { songId } }).catch(() => {});
  revalidatePath("/");
  revalidatePath("/canciones");
  revalidatePath("/explorar");

  return {};
}

// Same per-browser problem as the overrides above, but for "eliminar" on a
// static catalog song.
export async function setDeletedSongAction(songId: string, deleted: boolean): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };

  if (deleted) {
    await prisma.deletedSong.upsert({ where: { songId }, create: { songId }, update: {} });
  } else {
    await prisma.deletedSong.delete({ where: { songId } }).catch(() => {});
  }

  revalidatePath("/");
  revalidatePath("/canciones");
  revalidatePath("/explorar");
  revalidatePath("/admin");

  return {};
}
