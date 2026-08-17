"use client";

import { createContext, useCallback, useContext } from "react";
import { STORAGE_KEYS } from "@/lib/storage";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { Playlist } from "@/lib/types";

type PlaylistsContextValue = {
  playlists: Playlist[];
  getPlaylist: (id: string) => Playlist | undefined;
  createPlaylist: (name: string, songIds?: string[]) => Playlist;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  reorderPlaylistSongs: (playlistId: string, fromIndex: number, toIndex: number) => void;
};

const PlaylistsContext = createContext<PlaylistsContextValue | null>(null);

function makeId() {
  return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function PlaylistsProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = usePersistentState<Playlist[]>(STORAGE_KEYS.playlists, []);

  const getPlaylist = useCallback((id: string) => playlists.find((p) => p.id === id), [playlists]);

  const createPlaylist = useCallback(
    (name: string, songIds: string[] = []) => {
      const now = new Date().toISOString();
      const playlist: Playlist = { id: makeId(), name, songIds, createdAt: now, updatedAt: now };
      setPlaylists((prev) => [playlist, ...prev]);
      return playlist;
    },
    [setPlaylists]
  );

  const renamePlaylist = useCallback(
    (id: string, name: string) => {
      setPlaylists((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p))
      );
    },
    [setPlaylists]
  );

  const deletePlaylist = useCallback(
    (id: string) => {
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    },
    [setPlaylists]
  );

  const addSongToPlaylist = useCallback(
    (playlistId: string, songId: string) => {
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId && !p.songIds.includes(songId)
            ? { ...p, songIds: [...p.songIds, songId], updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    [setPlaylists]
  );

  const removeSongFromPlaylist = useCallback(
    (playlistId: string, songId: string) => {
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId
            ? { ...p, songIds: p.songIds.filter((id) => id !== songId), updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    [setPlaylists]
  );

  const reorderPlaylistSongs = useCallback(
    (playlistId: string, fromIndex: number, toIndex: number) => {
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id !== playlistId) return p;
          const songIds = [...p.songIds];
          const [moved] = songIds.splice(fromIndex, 1);
          songIds.splice(toIndex, 0, moved);
          return { ...p, songIds, updatedAt: new Date().toISOString() };
        })
      );
    },
    [setPlaylists]
  );

  return (
    <PlaylistsContext.Provider
      value={{
        playlists,
        getPlaylist,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        reorderPlaylistSongs,
      }}
    >
      {children}
    </PlaylistsContext.Provider>
  );
}

export function usePlaylists() {
  const ctx = useContext(PlaylistsContext);
  if (!ctx) throw new Error("usePlaylists must be used within PlaylistsProvider");
  return ctx;
}
