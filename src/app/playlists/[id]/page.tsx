"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Play, Shuffle, Pencil, Trash2, GripVertical, X } from "lucide-react";
import { usePlaylists } from "@/context/PlaylistsContext";
import { usePlayer } from "@/context/PlayerContext";
import { useSongs } from "@/context/SongsContext";
import CoverImage from "@/components/media/CoverImage";
import EmptyState from "@/components/common/EmptyState";
import { ListMusic } from "lucide-react";
import { formatDuration } from "@/lib/format";

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getPlaylist, renamePlaylist, deletePlaylist, removeSongFromPlaylist, reorderPlaylistSongs } =
    usePlaylists();
  const { playQueueAt } = usePlayer();
  const { getSongById } = useSongs();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const playlist = getPlaylist(params.id);
  if (!playlist) {
    return (
      <div className="px-4 py-16">
        <EmptyState icon={ListMusic} title="Esta playlist no existe o fue eliminada" actionLabel="Volver a mis playlists" actionHref="/playlists" />
      </div>
    );
  }

  const songs = playlist.songIds.map((id) => getSongById(id)).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
        <div className="w-40 shrink-0 sm:w-56">
          <CoverImage src={songs[0]?.coverUrl} title={playlist.name} size="large" />
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) renamePlaylist(playlist.id, name.trim());
                setEditing(false);
              }}
              className="flex items-center gap-2"
            >
              <input
                autoFocus
                defaultValue={playlist.name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-2xl font-bold text-foreground outline-none"
              />
              <button type="submit" className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white">
                Guardar
              </button>
            </form>
          ) : (
            <h1 className="text-2xl font-bold text-foreground sm:text-4xl">{playlist.name}</h1>
          )}
          <p className="mt-2 text-sm text-foreground-muted">{songs.length} canciones</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => playQueueAt(songs, 0)}
              disabled={songs.length === 0}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-40"
            >
              <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} /> Reproducir
            </button>
            <button
              type="button"
              onClick={() => playQueueAt([...songs].sort(() => Math.random() - 0.5), 0)}
              disabled={songs.length === 0}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover disabled:opacity-40"
            >
              <Shuffle className="h-4 w-4" /> Aleatorio
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover"
            >
              <Pencil className="h-4 w-4" /> Renombrar
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`¿Eliminar la playlist "${playlist.name}"? Esta acción no se puede deshacer.`)) {
                  deletePlaylist(playlist.id);
                  router.push("/playlists");
                }
              }}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10"
            >
              <Trash2 className="h-4 w-4" /> Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {songs.length === 0 ? (
          <EmptyState icon={ListMusic} title="Esta playlist está vacía" description="Añade canciones desde el menú de cualquier canción." />
        ) : (
          <ul className="space-y-0.5">
            {songs.map((song, index) => (
              <li
                key={song.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null && dragIndex !== index) reorderPlaylistSongs(playlist.id, dragIndex, index);
                  setDragIndex(null);
                }}
                className="group grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-hover"
              >
                <span className="cursor-grab text-foreground-muted/50 active:cursor-grabbing">
                  <GripVertical className="h-4 w-4" />
                </span>
                <button
                  type="button"
                  onClick={() => playQueueAt(songs, index)}
                  className="h-10 w-10 shrink-0"
                >
                  <CoverImage src={song.coverUrl} title={song.title} size="xs" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{song.title}</p>
                  <p className="truncate text-xs text-foreground-muted">{song.alias ?? song.artist}</p>
                </div>
                <span className="text-xs tabular-nums text-foreground-muted">{formatDuration(song.duration)}</span>
                <button
                  type="button"
                  onClick={() => removeSongFromPlaylist(playlist.id, song.id)}
                  aria-label="Quitar de la playlist"
                  className="rounded-full p-1.5 text-foreground-muted opacity-0 hover:text-foreground group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
