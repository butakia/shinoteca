// Thin repository over the local demo fixtures. Every read goes through here
// so a later pass can swap this module for a database-backed implementation
// (Prisma, etc.) without touching any page or component.
import { songs } from "./songs";
import { albums } from "./albums";
import { artists } from "./artists";
import type { Song, Album, Artist, ReleaseType } from "@/lib/types";

export function getAllSongs(): Song[] {
  return songs.filter((s) => s.isPublished);
}

export function getSongById(id: string): Song | undefined {
  return songs.find((s) => s.id === id);
}

export function getAllAlbums(): Album[] {
  return albums;
}

export function getAlbumById(id: string): Album | undefined {
  return albums.find((a) => a.id === id);
}

export function getSongsByAlbum(albumId: string): Song[] {
  return getAllSongs()
    .filter((s) => s.albumId === albumId)
    .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));
}

export function getAllArtists(): Artist[] {
  return artists;
}

export function getArtistById(id: string): Artist | undefined {
  return artists.find((a) => a.id === id);
}

export function getSongsByReleaseType(type: ReleaseType): Song[] {
  return getAllSongs().filter((s) => s.releaseType === type);
}

export function getSongsByYear(year: number): Song[] {
  return getAllSongs().filter((s) => s.year === year);
}

export function getAvailableYears(): number[] {
  const years = new Set(getAllSongs().map((s) => s.year).filter((y): y is number => !!y));
  return Array.from(years).sort((a, b) => b - a);
}

export function getFeaturedSongs(): Song[] {
  return getAllSongs().filter((s) => s.isFeatured);
}

export function searchSongs(query: string): Song[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllSongs().filter((s) => {
    const album = s.albumId ? getAlbumById(s.albumId) : undefined;
    const haystack = [
      s.title,
      s.artist,
      s.alias ?? "",
      album?.title ?? "",
      s.genre ?? "",
      String(s.year ?? ""),
      s.releaseType,
      ...s.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
