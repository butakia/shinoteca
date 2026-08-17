"use client";

import { useState } from "react";
import { X, Plus, Check, ListMusic } from "lucide-react";
import { usePlaylists } from "@/context/PlaylistsContext";
import type { Song } from "@/lib/types";

export default function PlaylistPickerModal({ song, onClose }: { song: Song; onClose: () => void }) {
  const { playlists, addSongToPlaylist, removeSongFromPlaylist, createPlaylist } = usePlaylists();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  }

  function toggle(playlistId: string, alreadyIn: boolean) {
    if (alreadyIn) {
      removeSongFromPlaylist(playlistId, song.id);
      flash("Eliminada de la playlist");
    } else {
      addSongToPlaylist(playlistId, song.id);
      flash("Añadida a tu playlist");
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name.trim(), [song.id]);
    setName("");
    setCreating(false);
    flash("Añadida a tu playlist");
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-sm rounded-t-2xl p-4 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Añadir &ldquo;{song.title}&rdquo; a…
          </p>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-foreground-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {toast && (
          <div className="mb-3 rounded-lg bg-success/15 px-3 py-2 text-xs text-success">{toast}</div>
        )}

        {playlists.length === 0 && !creating && (
          <p className="mb-3 flex items-center gap-2 text-sm text-foreground-muted">
            <ListMusic className="h-4 w-4" /> Todavía no tienes playlists.
          </p>
        )}

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {playlists.map((p) => {
            const alreadyIn = p.songIds.includes(song.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id, alreadyIn)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover"
              >
                <span className="truncate">{p.name}</span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    alreadyIn ? "border-accent bg-accent text-white" : "border-border text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>

        {creating ? (
          <form onSubmit={handleCreate} className="mt-3 flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la playlist"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
            />
            <button type="submit" className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white">
              Crear
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-3 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Crear nueva playlist
          </button>
        )}
      </div>
    </div>
  );
}
