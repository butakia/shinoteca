"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Play,
  ListPlus,
  CornerDownRight,
  Heart,
  Share2,
  Download,
  ListMusic,
  Check,
  Plus,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";
import type { Song } from "@/lib/types";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import { usePlaylists } from "@/context/PlaylistsContext";

export default function SongMenu({ song, className }: { song: Song; className?: string }) {
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { playSong, addToQueue, playNext } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { playlists, addSongToPlaylist, removeSongFromPlaylist, createPlaylist } = usePlaylists();
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowPlaylists(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  function item(icon: React.ReactNode, label: string, onClick: () => void) {
    return (
      <button
        type="button"
        onClick={() => {
          onClick();
          setOpen(false);
          setShowPlaylists(false);
        }}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground"
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <div ref={ref} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Más opciones"
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full p-1.5 text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="glass absolute right-0 top-full z-50 mt-1 w-56 rounded-xl p-1.5 shadow-2xl"
        >
          {!showPlaylists ? (
            <>
              {item(<Play className="h-4 w-4" />, "Reproducir ahora", () => playSong(song))}
              {item(<CornerDownRight className="h-4 w-4" />, "Reproducir después", () => playNext(song))}
              {item(<ListPlus className="h-4 w-4" />, "Añadir a la cola", () => addToQueue(song))}
              {item(<ExternalLink className="h-4 w-4" />, "Abrir en su página", () => {
                router.push(`/play/${song.id}`);
              })}
              {item(
                <Heart className="h-4 w-4" fill={isFavorite(song.id) ? "currentColor" : "none"} />,
                isFavorite(song.id) ? "Quitar de favoritos" : "Añadir a favoritos",
                () => toggleFavorite(song.id)
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylists(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              >
                <ListMusic className="h-4 w-4" /> Añadir a playlist
              </button>
              {item(<Share2 className="h-4 w-4" />, "Copiar enlace", () => {
                const url = `${window.location.origin}/canciones/${song.id}`;
                navigator.clipboard?.writeText(url).catch(() => {});
              })}
              {song.isDownloadable &&
                item(<Download className="h-4 w-4" />, "Descargar", () => {
                  router.push(`/canciones/${song.id}#descargar`);
                })}
            </>
          ) : (
            <div>
              <p className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-foreground-muted/70">
                Añadir a
              </p>
              {playlists.length === 0 && (
                <p className="px-3 py-2 text-xs text-foreground-muted">No tienes playlists todavía.</p>
              )}
              <div className="max-h-40 overflow-y-auto">
                {playlists.map((p) => {
                  const alreadyIn = p.songIds.includes(song.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (alreadyIn) removeSongFromPlaylist(p.id, song.id);
                        else addSongToPlaylist(p.id, song.id);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                    >
                      <span className="truncate">{p.name}</span>
                      <span
                        className={clsx(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          alreadyIn ? "border-accent bg-accent text-white" : "border-border text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
              {creatingPlaylist ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPlaylistName.trim()) return;
                    createPlaylist(newPlaylistName.trim(), [song.id]);
                    setNewPlaylistName("");
                    setCreatingPlaylist(false);
                    setOpen(false);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex gap-1 p-1"
                >
                  <input
                    autoFocus
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Nombre"
                    className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent/50"
                  />
                  <button type="submit" className="rounded-lg bg-accent px-2 text-xs font-medium text-white">
                    Crear
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingPlaylist(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                >
                  <Plus className="h-4 w-4" /> Nueva playlist con esta canción
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
