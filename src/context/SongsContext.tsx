"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useArtistFilter } from "@/context/ArtistFilterContext";
import { STORAGE_KEYS } from "@/lib/storage";
import { songs as baseSongs } from "@/lib/data/songs";
import { getAllAlbums, getAlbumById as getStaticAlbumById, getAllArtists, getArtistById } from "@/lib/data";
import {
  saveSongOverrideAction,
  resetSongOverrideAction,
  setDeletedSongAction,
  syncLocalSongOverridesAction,
} from "@/lib/upload-actions";
import { useAuth } from "@/context/AuthContext";
import {
  saveAlbumOverrideAction,
  createAlbumAction,
  deleteAlbumOverrideAction,
} from "@/lib/album-actions";
import type { Song, ReleaseType, Album } from "@/lib/types";

type SongOverrides = Record<string, Partial<Song>>;
type AlbumOverrides = Record<string, Partial<Album>>;

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
  // Álbumes visibles según el filtro "Solo Shinoflow". Las páginas deben usar
  // esto en vez de getAllAlbums() de lib/data, que no conoce el filtro ni los
  // álbumes creados/editados desde el panel admin.
  getVisibleAlbums: () => Album[];
  getAlbumById: (id: string) => Album | undefined;
  // admin/back-office — canciones
  allSongsIncludingUnpublished: Song[];
  updateSong: (id: string, patch: Partial<Song>) => Promise<{ error?: string }>;
  deleteSong: (id: string) => void; // soft delete — never touches the original fixture
  restoreSong: (id: string) => void;
  resetSong: (id: string) => void; // discard local edits, keep original imported data
  isEdited: (id: string) => boolean;
  isDeleted: (id: string) => boolean;
  lastEditedAt: (id: string) => string | undefined;
  // admin/back-office — álbumes
  allAlbums: Album[]; // static + custom, unfiltered by "Solo Shinoflow" — for the admin list
  updateAlbum: (id: string, patch: Partial<Album>) => Promise<{ error?: string }>;
  createAlbum: (album: Omit<Album, "id">) => Promise<{ error?: string; id?: string }>;
  deleteAlbum: (id: string) => Promise<{ error?: string }>; // resets a static album, removes a custom one
  isAlbumEdited: (id: string) => boolean;
  isCustomAlbum: (id: string) => boolean;
  // Songs uploaded through the admin panel (stored server-side, not the demo
  // fixtures) — refresh after a successful upload/delete so the catalog
  // reflects it immediately without a full page reload.
  refreshUploadedSongs: () => Promise<void>;
};

const SongsContext = createContext<SongsContextValue | null>(null);

export function SongsProvider({ children }: { children: React.ReactNode }) {
  // Local copies exist purely for instant feedback (no round-trip needed to
  // see your own edit reflected). The server copies (fetched below) are what
  // every OTHER visitor actually sees — local overrides are layered on top
  // so an admin's own screen updates immediately even before the server call
  // finishes, but the server is what makes the edit real for everyone else.
  const [overrides, setOverrides] = usePersistentState<SongOverrides>(STORAGE_KEYS.songOverrides, {});
  const [deletedIds, setDeletedIds] = usePersistentState<string[]>(STORAGE_KEYS.deletedSongIds, []);
  const [editLog, setEditLog] = usePersistentState<SongEditLogEntry[]>(STORAGE_KEYS.songEditLog, []);
  const [uploadedSongs, setUploadedSongs] = useState<Song[]>([]);
  const [serverOverrides, setServerOverrides] = useState<SongOverrides>({});
  const [serverDeletedIds, setServerDeletedIds] = useState<string[]>([]);
  // Álbumes: sin capa local optimista — es uso admin, poco frecuente, y así
  // se evita duplicar el almacenamiento; updateAlbum/createAlbum esperan la
  // respuesta del servidor antes de refrescar.
  const [albumOverrides, setAlbumOverrides] = useState<AlbumOverrides>({});
  const [customAlbums, setCustomAlbums] = useState<Album[]>([]);
  const { onlyShinoflow } = useArtistFilter();
  const { isAdmin, loading: authLoading } = useAuth();

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

  const refreshSongOverrides = useCallback(async () => {
    try {
      const res = await fetch("/api/song-overrides", { cache: "no-store" });
      if (!res.ok) return;
      const data: { overrides: SongOverrides; deletedIds: string[] } = await res.json();
      setServerOverrides(data.overrides);
      setServerDeletedIds(data.deletedIds);
    } catch {
      // offline / API unavailable — falls back to whatever's cached locally
    }
  }, []);

  const refreshAlbumOverrides = useCallback(async () => {
    try {
      const res = await fetch("/api/album-overrides", { cache: "no-store" });
      if (!res.ok) return;
      const data: { overrides: AlbumOverrides; customAlbums: Album[] } = await res.json();
      setAlbumOverrides(data.overrides);
      setCustomAlbums(data.customAlbums);
    } catch {
      // offline / API unavailable
    }
  }, []);

  useEffect(() => {
    refreshUploadedSongs();
    refreshSongOverrides();
    refreshAlbumOverrides();
  }, [refreshUploadedSongs, refreshSongOverrides, refreshAlbumOverrides]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    const entries = editLog.flatMap((entry) => {
      const patch = overrides[entry.songId];
      return patch ? [{ songId: entry.songId, patch, editedAt: entry.at }] : [];
    });
    if (entries.length === 0) return;

    syncLocalSongOverridesAction(entries).then((result) => {
      if (!result.error && result.synced) refreshSongOverrides();
    });
  }, [authLoading, isAdmin, editLog, overrides, refreshSongOverrides]);

  const merged = useMemo<Song[]>(() => {
    // Server first, then the local (possibly newer, not-yet-synced) override
    // on top — matters right after an admin's own edit, before the fetch
    // above has a chance to catch up.
    const effectivePatch = (id: string) => ({ ...serverOverrides[id], ...overrides[id] });
    const base = baseSongs.map((s) => ({ ...s, ...effectivePatch(s.id) }));
    const uploaded = uploadedSongs.map((s) => ({ ...s, ...effectivePatch(s.id) }));
    return [...uploaded, ...base];
  }, [overrides, serverOverrides, uploadedSongs]);

  const allSongsIncludingUnpublished = useMemo(
    () => merged.filter((s) => !deletedIds.includes(s.id) && !serverDeletedIds.includes(s.id)),
    [merged, deletedIds, serverDeletedIds]
  );

  const allAlbums = useMemo<Album[]>(() => {
    const patched = getAllAlbums().map((a) => ({ ...a, ...albumOverrides[a.id] }));
    return [...patched, ...customAlbums];
  }, [albumOverrides, customAlbums]);

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

  const getAlbumById = useCallback((id: string) => allAlbums.find((a) => a.id === id), [allAlbums]);

  // Un álbum se oculta si está marcado como de otro artista o si, con el
  // filtro puesto, ya no le queda ninguna canción visible. Sin esto los
  // álbumes de terceros seguían listados y al abrirlos salía "no existe":
  // parecía que el interruptor no hacía nada cuando en realidad solo
  // filtraba canciones.
  const getVisibleAlbums = useCallback(() => {
    if (!onlyShinoflow) return allAlbums;
    const visibles = getAllSongs();
    return allAlbums.filter(
      (a) => !a.isThirdParty && visibles.some((s) => s.albumId === a.id)
    );
  }, [onlyShinoflow, getAllSongs, allAlbums]);

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
    [getAllSongs, getAlbumById]
  );

  const updateSong = useCallback(
    async (id: string, patch: Partial<Song>) => {
      const full = { ...serverOverrides[id], ...overrides[id], ...patch };
      setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
      setEditLog((prev) => [{ songId: id, at: new Date().toISOString() }, ...prev].slice(0, 200));
      const result = await saveSongOverrideAction(id, full);
      if (!result.error) await refreshSongOverrides();
      return result;
    },
    [setOverrides, setEditLog, overrides, serverOverrides, refreshSongOverrides]
  );

  const deleteSong = useCallback(
    (id: string) => {
      setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setDeletedSongAction(id, true).then((result) => {
        if (result.error) console.error("No se pudo eliminar en el servidor:", result.error);
        else refreshSongOverrides();
      });
    },
    [setDeletedIds, refreshSongOverrides]
  );
  const restoreSong = useCallback(
    (id: string) => {
      setDeletedIds((prev) => prev.filter((x) => x !== id));
      setDeletedSongAction(id, false).then((result) => {
        if (result.error) console.error("No se pudo restaurar en el servidor:", result.error);
        else refreshSongOverrides();
      });
    },
    [setDeletedIds, refreshSongOverrides]
  );
  const resetSong = useCallback(
    (id: string) => {
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      resetSongOverrideAction(id).then((result) => {
        if (result.error) console.error("No se pudo deshacer en el servidor:", result.error);
        else refreshSongOverrides();
      });
    },
    [setOverrides, refreshSongOverrides]
  );

  const isEdited = useCallback(
    (id: string) => !!overrides[id] || !!serverOverrides[id],
    [overrides, serverOverrides]
  );
  const isDeleted = useCallback(
    (id: string) => deletedIds.includes(id) || serverDeletedIds.includes(id),
    [deletedIds, serverDeletedIds]
  );
  const lastEditedAt = useCallback((id: string) => editLog.find((e) => e.songId === id)?.at, [editLog]);

  const updateAlbum = useCallback(
    async (id: string, patch: Partial<Album>) => {
      const result = await saveAlbumOverrideAction(id, patch);
      if (!result.error) await refreshAlbumOverrides();
      return result;
    },
    [refreshAlbumOverrides]
  );

  const createAlbum = useCallback(
    async (album: Omit<Album, "id">) => {
      const result = await createAlbumAction(album);
      if (!result.error) await refreshAlbumOverrides();
      return result;
    },
    [refreshAlbumOverrides]
  );

  const deleteAlbum = useCallback(
    async (id: string) => {
      const result = await deleteAlbumOverrideAction(id);
      if (!result.error) await refreshAlbumOverrides();
      return result;
    },
    [refreshAlbumOverrides]
  );

  const isAlbumEdited = useCallback((id: string) => !!albumOverrides[id], [albumOverrides]);
  const isCustomAlbum = useCallback(
    (id: string) => customAlbums.some((a) => a.id === id),
    [customAlbums]
  );

  const value: SongsContextValue = {
    getAllSongs,
    getSongById,
    getSongsByAlbum,
    getSongsByReleaseType,
    getSongsByYear,
    getAvailableYears,
    getFeaturedSongs,
    searchSongs,
    getVisibleAlbums,
    getAlbumById,
    allSongsIncludingUnpublished,
    updateSong,
    deleteSong,
    restoreSong,
    resetSong,
    isEdited,
    isDeleted,
    lastEditedAt,
    allAlbums,
    updateAlbum,
    createAlbum,
    deleteAlbum,
    isAlbumEdited,
    isCustomAlbum,
    refreshUploadedSongs,
  };

  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>;
}

export function useSongs() {
  const ctx = useContext(SongsContext);
  if (!ctx) throw new Error("useSongs must be used within SongsProvider");
  return ctx;
}

// Re-exported for convenience where only the raw static fixture is needed —
// prefer useSongs().getAlbumById()/getVisibleAlbums() everywhere else, since
// those account for admin edits and admin-created albums.
export { getAllAlbums, getStaticAlbumById as getAlbumById, getAllArtists, getArtistById };
