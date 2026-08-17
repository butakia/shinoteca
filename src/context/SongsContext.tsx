"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useArtistFilter } from "@/context/ArtistFilterContext";
import { STORAGE_KEYS } from "@/lib/storage";
import { songs as baseSongs } from "@/lib/data/songs";
import { getAllAlbums, getAlbumById, getAllArtists, getArtistById } from "@/lib/data";
import type { Song, ReleaseType } from "@/lib/types";

type SongOverrides = Record<string, Partial<Song>>;

type SongEditLogEntry = { songId: string; at: string };

type SongsContextValue = {
  // Same query surface as src/lib/data, but reactive to admin edits — this
  // is the single source of truth every page/component should read from
  // instead of importing the static fixtures directly.
  getAllSongs: () => Song[];
  getSongById: (id: string) => Song | undefined;
  getSongsByAlbum: (albumId: string) => Song[];
  getSongsByReleaseType: (type: ReleaseType) => Song[];
  getSongsByYear: (year: number) => Song[];
  getAvailableYears: () => number[];
  getFeaturedSongs: () => Song[];
  searchSongs: (query: string) => Song[];
  // admin/back-office
  allSongsIncludingUnpublished: Song[];
  updateSong: (id: string, patch: Partial<Song>) => void;
  deleteSong: (id: string) => void; // soft delete — never touches the original fixture
  restoreSong: (id: string) => void;
  resetSong: (id: string) => void; // discard local edits, keep original imported data
  isEdited: (id: string) => boolean;
  isDeleted: (id: string) => boolean;
  lastEditedAt: (id: string) => string | undefined;
  // Songs uploaded through the admin panel (stored server-side, not the demo
  // fixtures) — refresh after a successful upload/delete so the catalog
  // reflects it immediately without a full page reload.
  refreshUploadedSongs: () => Promise<void>;
};

const SongsContext = createContext<SongsContextValue | null>(null);

export function SongsProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = usePersistentState<SongOverrides>(STORAGE_KEYS.songOverrides, {});
  const [deletedIds, setDeletedIds] = usePersistentState<string[]>(STORAGE_KEYS.deletedSongIds, []);
  const [editLog, setEditLog] = usePersistentState<SongEditLogEntry[]>(STORAGE_KEYS.songEditLog, []);
  const [uploadedSongs, setUploadedSongs] = useState<Song[]>([]);
  const { onlyShinoflow } = useArtistFilter();

  const refreshUploadedSongs = useCallback(async () => {
    try {
      const res = await fetch("/api/songs", { cache: "no-store" });
      if (!res.ok) return;
      const data: { songs: Song[] } = await res.json();
      setUploadedSongs(data.songs);
    } catch {
      // offline / API unavailable — the demo catalog still works on its own
    }
  }, []);

  useEffect(() => {
    refreshUploadedSongs();
  }, [refreshUploadedSongs]);

  const merged = useMemo<Song[]>(() => {
    const base = baseSongs.map((s) => (overrides[s.id] ? { ...s, ...overrides[s.id] } : s));
    const uploaded = uploadedSongs.map((s) => (overrides[s.id] ? { ...s, ...overrides[s.id] } : s));
    return [...uploaded, ...base];
  }, [overrides, uploadedSongs]);

  const allSongsIncludingUnpublished = useMemo(
    () => merged.filter((s) => !deletedIds.includes(s.id)),
    [merged, deletedIds]
  );

  // The "Solo Shinoflow" switch is applied here, at the single query surface
  // every page/search/player reads from, so one toggle hides third-party
  // uploads everywhere at once instead of each page filtering for itself.
  // getSongById deliberately stays unfiltered: a direct link to a hidden
  // song (or a queued one) must still resolve, otherwise the player would
  // lose the track it's currently playing the moment the filter flips on.
  const getAllSongs = useCallback(
    () =>
      allSongsIncludingUnpublished.filter(
        (s) => s.isPublished && (!onlyShinoflow || !s.isThirdParty)
      ),
    [allSongsIncludingUnpublished, onlyShinoflow]
  );

  const getSongById = useCallback(
    (id: string) => allSongsIncludingUnpublished.find((s) => s.id === id),
    [allSongsIncludingUnpublished]
  );

  const getSongsByAlbum = useCallback(
    (albumId: string) =>
      getAllSongs()
        .filter((s) => s.albumId === albumId)
        .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0)),
    [getAllSongs]
  );

  const getSongsByReleaseType = useCallback(
    (type: ReleaseType) => getAllSongs().filter((s) => s.releaseType === type),
    [getAllSongs]
  );

  const getSongsByYear = useCallback(
    (year: number) => getAllSongs().filter((s) => s.year === year),
    [getAllSongs]
  );

  const getAvailableYears = useCallback(() => {
    const years = new Set(getAllSongs().map((s) => s.year).filter((y): y is number => !!y));
    return Array.from(years).sort((a, b) => b - a);
  }, [getAllSongs]);

  const getFeaturedSongs = useCallback(() => getAllSongs().filter((s) => s.isFeatured), [getAllSongs]);

  const searchSongs = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return getAllSongs().filter((s) => {
        const album = s.albumId ? getAlbumById(s.albumId) : undefined;
        const haystack = [s.title, s.artist, s.alias ?? "", album?.title ?? "", s.genre ?? "", String(s.year ?? ""), s.releaseType, ...s.tags]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    },
    [getAllSongs]
  );

  const updateSong = useCallback(
    (id: string, patch: Partial<Song>) => {
      setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
      setEditLog((prev) => [{ songId: id, at: new Date().toISOString() }, ...prev].slice(0, 200));
    },
    [setOverrides, setEditLog]
  );

  const deleteSong = useCallback(
    (id: string) => setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setDeletedIds]
  );
  const restoreSong = useCallback(
    (id: string) => setDeletedIds((prev) => prev.filter((x) => x !== id)),
    [setDeletedIds]
  );
  const resetSong = useCallback(
    (id: string) =>
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [setOverrides]
  );

  const isEdited = useCallback((id: string) => !!overrides[id], [overrides]);
  const isDeleted = useCallback((id: string) => deletedIds.includes(id), [deletedIds]);
  const lastEditedAt = useCallback((id: string) => editLog.find((e) => e.songId === id)?.at, [editLog]);

  const value: SongsContextValue = {
    getAllSongs,
    getSongById,
    getSongsByAlbum,
    getSongsByReleaseType,
    getSongsByYear,
    getAvailableYears,
    getFeaturedSongs,
    searchSongs,
    allSongsIncludingUnpublished,
    updateSong,
    deleteSong,
    restoreSong,
    resetSong,
    isEdited,
    isDeleted,
    lastEditedAt,
    refreshUploadedSongs,
  };

  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>;
}

export function useSongs() {
  const ctx = useContext(SongsContext);
  if (!ctx) throw new Error("useSongs must be used within SongsProvider");
  return ctx;
}

// Re-exported for convenience where only album/artist lookups are needed —
// those aren't admin-editable yet, so they can stay static.
export { getAllAlbums, getAlbumById, getAllArtists, getArtistById };
